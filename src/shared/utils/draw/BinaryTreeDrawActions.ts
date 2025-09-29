import type { HierarchyNode, Selection } from "d3";
import { HierarchyNodeData, LinkPathFn, TreeLinkData } from "../../../types";
import { defaultAppearTreeNode, defaultDeleteTreeNode, repositionTree } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import type { Dispatch, SetStateAction } from "react";
import { straightPath } from "../treeUtils";

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol binario.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param treeData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertNode(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
    treeData: {
        newNodeId: string;
        parentId: string | null;
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
        positions: Map<string, { x: number, y: number }>;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Animación de inserción del elemento como BST 
    await animateBSTInsertCore(
        treeG,
        seqG,
        {
            newNodeId: treeData.newNodeId,
            parentId: treeData.parentId,
            nodesData: treeData.nodesData,
            linksData: treeData.linksData,
            pathToParent: treeData.pathToParent,
            positions: treeData.positions,
        },
        {
            reposition: repositionBinaryTree,
            appearNode: defaultAppearTreeNode,
            highlight: highlightBinaryTreePath,
            highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
        }
    );

    // Restablecimiento del color original del padre del nuevo nodo (si aplica)
    if (treeData.parentId) {
        await treeG.select<SVGGElement>(`g#${treeData.parentId} circle.node-container`)
            .transition()
            .duration(800)
            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo especifico en el árbol binario.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param treeData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateDeleteNode(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
    treeData: {
        prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
        nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
        nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null;
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Elementos del árbol requeridos para la animación
    const { nodeToDelete, prevRootNode, nodeToUpdate } = treeData;

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    if (!nodeToUpdate) {
        // Nodo padre del nodo a eliminar
        const parentNode = nodeToDelete.parent;

        // Ruta desde el nodo raíz hasta el nodo padre del nodo a eliminar
        const pathToParent = parentNode ? prevRootNode.path(parentNode) : [];

        // Animación especifica de eliminación para nodo hoja o nodo con único hijo
        await animateLeafOrSingleChild(
            treeG,
            nodeToDelete,
            parentNode ? parentNode.data.id : null,
            pathToParent,
            {
                deleteNode: defaultDeleteTreeNode,
                highlightNodePath: highlightBinaryTreePath,
                highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
                buildPath: straightPath
            }
        );

        // Restablecimiento del color original del padre del nodo eliminado (si aplica)
        if (parentNode) {
            await treeG.select<SVGGElement>(`g#${parentNode.data.id} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        }
    } else {
        // Ruta desde el nodo raiz hasta el nodo a actualizar
        const pathToUpdateNode = prevRootNode.path(nodeToUpdate);

        // Ruta desde el nodo a actualizar hasta el nodo a eliminar
        const pathToRemovalNode = nodeToUpdate.path(nodeToDelete);

        // Animación especifica de eliminación para nodo con 2 hijos
        await animateTwoChildren(
            treeG,
            nodeToDelete,
            nodeToUpdate,
            pathToUpdateNode,
            pathToRemovalNode,
            {
                highlightNodePath: highlightBinaryTreePath
            }
        );

        // Restablecimiento del color original del nodo actualizado
        await treeG.select<SVGGElement>(`g#${nodeToUpdate.data.id} circle.node-container`)
            .transition()
            .duration(800)
            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
            .end();
    }

    // Limpiamos el registro del nodo eliminado
    treeData.positions.delete(nodeToDelete.data.id);

    // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
    await repositionBinaryTree(treeG, treeData.remainingNodesData, treeData.remainingLinksData, treeData.positions);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un nodo dentro del árbol binario. 
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param targetNode ID del nodo a buscar.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSearchNode(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
    targetNode: string,
    path: HierarchyNode<HierarchyNodeData<number>>[],
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo correspondiente al nodo a buscar
    const foundNodeGroup = treeG.select<SVGCircleElement>(`g#${targetNode} circle.node-container`);

    // Animación de recorrido de los nodos hasta el nodo a buscar
    await highlightBinaryTreePath(treeG, path, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

    // Resaltado final del nodo ubicado
    await foundNodeGroup
        .transition()
        .duration(250)
        .attr("r", 30)
        .transition()
        .duration(250)
        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
        .end();

    // Restablecimiento del color original del nodo ubicado
    await foundNodeGroup
        .transition()
        .duration(800)
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo siguiendo la lógica de un árbol binario de búsqueda.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param data Objeto con información del árbol necesaria para la animación (nodos, enlaces, posiciones, rutas).
 * @param opts Objeto con opciones de animación para la aparición, resaltado y reposicionamiento de nodos.
 */
export async function animateBSTInsertCore(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    seqG: Selection<SVGGElement, unknown, null, undefined>,
    data: {
        newNodeId: string;
        parentId: string | null;
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
        positions: Map<string, { x: number, y: number }>;
    },
    opts: {
        reposition: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            nodes: HierarchyNode<HierarchyNodeData<number>>[],
            linksData: TreeLinkData[],
            positions: Map<string, { x: number; y: number }>
        ) => Promise<void>;
        appearNode: (
            nodeGroup: Selection<SVGGElement, unknown, null, undefined>
        ) => Promise<void>;
        highlight: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: HierarchyNode<HierarchyNodeData<number>>[],
            highlightColor: string
        ) => Promise<void>;
        highlightColor: string;
    }
) {
    // Elementos del árbol requeridos para la animación
    const { newNodeId, parentId, nodesData, linksData, pathToParent, positions } = data;

    // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
    seqG.style("opacity", 0);

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = treeG.select<SVGGElement>(`g#${newNodeId}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (parentId) {
        // Grupo del lienzo correspondiente al nuevo enlace del nodo padre que apunta al nuevo nodo
        const newParentLinkGroup = treeG.select<SVGGElement>(
            `g#link-${parentId}-${newNodeId}`
        );

        // Estado visual inicial del nuevo enlace
        newParentLinkGroup.style("opacity", 0);

        // Reposicionamiento de los nodos y enlaces del árbol antes de insertar
        await opts.reposition(treeG, nodesData, linksData, positions);

        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nuevo nodo
        await opts.highlight(treeG, pathToParent, opts.highlightColor);

        // Animación de aparición del nuevo nodo
        await opts.appearNode(newNodeGroup);

        // Establecimiento del enlace entre el nodo padre al nuevo nodo
        await newParentLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    } else {
        // Animación de aparición simple del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar la eliminación de un nodo hoja o un nodo con un único hijo en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDelete Nodo jerárquico que representa el nodo a ser eliminado.
 * @param parentNodeId ID del nodo padre o null si el nodo a eliminar es la raíz.
 * @param pathToParent Arreglo de nodos jerárquicos que representan el camino desde la raíz hasta el padre del nodo a eliminar.
 * @param opts Objeto con opciones de animación para el desvanecimiento, resaltado de nodos y dibujado de enlaces.
 */
export async function animateLeafOrSingleChild(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>,
    parentNodeId: string | null,
    pathToParent: HierarchyNode<HierarchyNodeData<number>>[],
    opts: {
        deleteNode: (
            nodeGroup: Selection<SVGGElement, unknown, null, undefined>
        ) => Promise<void>;
        highlightNodePath: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: HierarchyNode<HierarchyNodeData<number>>[],
            highlightColor: string
        ) => Promise<void>;
        highlightColor: string;
        buildPath: LinkPathFn;
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = g.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

    // Nodo hijo del nodo a eliminar
    const childNode = nodeToDelete.children?.filter((node) => !node.data.isPlaceholder)[0]?.data.id;

    // Grupo del lienzo correspondiente al nuevo enlace formado entre el nodo padre y el nodo hijo del nodo a elimimar (solo si ambos están presentes)
    const newParentLinkGroup = parentNodeId && childNode
        ? g.select<SVGGElement>(`g#link-${parentNodeId}-${childNode}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar (solo si el padre esta presente)
    const parentRemovalLinkGroup = parentNodeId
        ? g.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDelete.data.id}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el hijo esta presente)
    const removalNodeLinkGroup = childNode
        ? g.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${childNode}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.style("opacity", 0);
    }

    // Si el nodo a eliminar cuenta con nodo padre
    if (parentRemovalLinkGroup) {
        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nodo a eliminar
        await opts.highlightNodePath(g, pathToParent, opts.highlightColor);

        // Desconexión del enlace entre el nodo padre y el nodo a eliminar
        await parentRemovalLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Desconexión del enlace entre el nodo a eliminar y su hijo (si el nodo a eliminar cuenta con un hijo)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await opts.deleteNode(removedG);

    // Si el nodo a eliminar cuenta tanto con un nodo padre y un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(g, parentNodeId!, childNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, opts.buildPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar la eliminación de un nodo con 2 nodos hijos en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDelete Nodo jerárquico que representa el nodo a ser eliminado.
 * @param nodeToUpdate Nodo jerárquico que representa el nodo cuyo valor será actualizado.
 * @param pathToUpdateNode Arreglo de nodos jerárquicos que representan el camino desde la raíz hasta el nodo a actualziar.
 * @param pathToRemovalNode Arreglo de nodos jerárquicos que representan el camino desde el nodo a actualizar hasta el nodo a eliminar.
 * @param opts Objeto con opciones de animación para el resaltado de nodos.
 */
export async function animateTwoChildren(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>,
    nodeToUpdate: HierarchyNode<HierarchyNodeData<number>>,
    pathToUpdateNode: HierarchyNode<HierarchyNodeData<number>>[],
    pathToRemovalNode: HierarchyNode<HierarchyNodeData<number>>[],
    opts: {
        highlightNodePath: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: HierarchyNode<HierarchyNodeData<number>>[],
            highlightColor: string
        ) => Promise<void>
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = g.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

    // Grupo del lienzo correspondiente al nodo a actualizar
    const updatedG = g.select<SVGGElement>(`g#${nodeToUpdate.data.id}`);

    // Nodo padre del nodo a eliminar
    const parentNode = nodeToDelete.parent!.data.id;

    // Nodo hijo del nodo a eliminar
    const childNode = nodeToDelete.children?.filter((node) => !node.data.isPlaceholder)[0]?.data.id;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar
    const removalParentLinkGroup = g.select<SVGGElement>(`g#link-${parentNode}-${nodeToDelete.data.id}`);

    // Grupo del lienzo correspondiente al nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (solo si el nodo a eliminar cuenta con un nodo hijo)
    const newParentLinkGroup = childNode
        ? g.select<SVGGElement>(`g#link-${parentNode}-${childNode}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el nodo a eliminar cuenta con un nodo hijo)
    const removalNodeLinkGroup = childNode
        ? g.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${childNode}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.select("path.tree-link").style("opacity", 0);
    }

    // Animación de recorrido desde el nodo raíz hasta el nodo que actualizará su valor
    await opts.highlightNodePath(g, pathToUpdateNode, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

    // Animación de recorrido desde el nodo a actualizar hasta el nodo a eliminar
    for (const node of pathToRemovalNode) {
        // Selección del círculo contenedor del nodo actual
        const nodeCircleGroup = g.select<SVGGElement>(`g#${node.data.id} circle.node-container`);

        // Resaltado de bordes del contenedor del nodo actual
        await nodeCircleGroup
            .transition()
            .duration(1000)
            .attr("stroke", SVG_BINARY_TREE_VALUES.UPDATE_STROKE_COLOR)
            .attr("stroke-width", 3)
            .end();

        if (node.data.id !== nodeToDelete.data.id) {
            // Restablecimiento del borde original
            await nodeCircleGroup
                .transition()
                .duration(1000)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }
    }

    // Desvanecimiento del valor actual del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();

    // Actualizar el valor del nodo copiando el valor del nodo a eliminar
    updatedG.select("text").text(nodeToDelete.data.value!);

    // Aparición del nuevo valor del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Desconexión del enlace entre el nodo padre y el nodo a eliminar
    await removalParentLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace entre el nodo a eliminar y su hijo (solo si el nodo a eliminar cuenta con un hijo)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await defaultDeleteTreeNode(removedG);

    // Si el nodo a eliminar cuenta con un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(g, parentNode!, childNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, straightPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup.select("path.tree-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de resaltar cada nodo del árbol binario a lo largo de un camino dado
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param highlightColor Color a usar para resaltar el contenedor de cada nodo a lo largo del camino.
 */
export async function highlightBinaryTreePath(
    g: Selection<SVGGElement, unknown, null, undefined>,
    path: HierarchyNode<HierarchyNodeData<number>>[],
    highlightColor: string
) {
    for (const node of path) {
        // Selección del grupo contenedor del nodo actual
        const nodeCircle = g.select<SVGGElement>(`g#${node.data.id} circle.node-container`);

        // Resaltado del nodo actual
        await nodeCircle
            .transition()
            .duration(800)
            .attr("fill", highlightColor)
            .end();

        if (node.data.id !== path[path.length - 1].data.id) {
            // Restablecimiento del color original
            await nodeCircle
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        }
    }
}

/**
 * Función encargada de animar la rotación de los nodos en un árbol binario de búsqueda especial.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param parentOfUnbalanced ID del nodo padre del nodo desbalanceado (o null si no hay).
 * @param unbalancedNode ID del nodo desbalanceado (el nodo donde ocurre la rotación).
 * @param sonOfUnbalanced ID del nodo hijo involucrado en la rotación.
 * @param rotationNode ID del nodo del subárbol afectado por la rotación (o null si no hay).
 * @param repositionStrategy Función asincrona encargada de reposicionar los nodos y enlaces al aplicarse la rotación.
 * @param repositionData Objeto que contiene información de los nodos, enlaces y sus posiciones al rotar.
 */
export async function animateEspecialBSTsRotation(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    parentOfUnbalanced: string | null,
    unbalancedNode: string,
    sonOfUnbalanced: string,
    rotationNode: string | null,
    repositionStrategy: (
        g: Selection<SVGGElement, unknown, null, undefined>,
        nodes: HierarchyNode<HierarchyNodeData<number>>[],
        linksData: TreeLinkData[],
        positions: Map<string, { x: number; y: number }>
    ) => Promise<void>,
    repositionData: {
        nodes: HierarchyNode<HierarchyNodeData<number>>[];
        links: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
    }
) {
    // Obtenemos los datos de reposicionamiento
    const { nodes, links, positions } = repositionData;

    // Fade out del nuevo enlace entre p y y (si p)
    if (parentOfUnbalanced) {
        treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced} path.tree-link`)
            .style("opacity", 0);
    }

    // Fade out del nuevo enlace entre y y z
    treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode} path.tree-link`)
        .style("opacity", 0);

    // Fade out del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode} path.tree-link`)
            .style("opacity", 0);
    }

    // Eliminar enlace previo entre p y z (si p)
    if (parentOfUnbalanced) {
        await treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${unbalancedNode}`)
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Eliminar enlace previo entre z y y
    await treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${sonOfUnbalanced}`)
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Eliminar enlace previo entre y y B (si B)
    if (rotationNode) {
        await treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${rotationNode}`)
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Reposicionamiento de los nodos y enlaces del árbol
    await repositionStrategy(treeG, nodes, links, positions);

    // Fade in del nuevo enlace entre p y y (si p)
    if (parentOfUnbalanced) {
        await treeG.select<SVGGElement>(`g#link-${parentOfUnbalanced}-${sonOfUnbalanced} path.tree-link`)
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }

    // Fade in del nuevo enlace entre y y z
    await treeG.select<SVGGElement>(`g#link-${sonOfUnbalanced}-${unbalancedNode} path.tree-link`)
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Fade in del nuevo enlace entre z y B (si B)
    if (rotationNode) {
        await treeG.select<SVGGElement>(`g#link-${unbalancedNode}-${rotationNode} path.tree-link`)
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de actualizar el enlace entre el nodo padre y su hijo en base a sus posiciones actuales.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param parentId ID del nodo padre.
 * @param childId ID del nodo hijo.
 * @param r Radio del contenedor del nodo.
 * @param buildPath Función encargada de construir el SVG path del enlace entre 2 posiciones.
 */
export function updateTreeLinkPath(
    g: Selection<SVGGElement, unknown, null, undefined>,
    parentId: string,
    childId: string,
    r: number,
    buildPath: LinkPathFn
) {
    // Seleccionamos el nodo padre y el hijo
    const childNodeGroup = g.select<SVGGElement>(`g#${childId}`).node();
    const parentNodeGroup = g.select<SVGGElement>(`g#${parentId}`).node();

    if (!childNodeGroup || !parentNodeGroup) return;

    // Consolidamos todas las transformaciones
    const childForm = childNodeGroup.transform.baseVal.consolidate();
    const parentForm = parentNodeGroup.transform.baseVal.consolidate();

    if (!childForm || !parentForm) return;

    // Extraemos las posiciones actuales del nodo padre e hijo
    const { e: px, f: py } = parentForm.matrix;
    const { e: cx, f: cy } = childForm.matrix;

    // Construimos el nuevo "d"
    const d = buildPath({ x: px, y: py }, { x: cx, y: cy }, r);

    // Aplicamos el nuevo enlace al elemento path
    g.select<SVGGElement>(`g#link-${parentId}-${childId} path.tree-link`)
        .attr("d", d);
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionBinaryTree(
    g: Selection<SVGGElement, unknown, null, undefined>,
    nodes: HierarchyNode<HierarchyNodeData<number>>[],
    linksData: TreeLinkData[],
    positions: Map<string, { x: number; y: number }>
) {
    return repositionTree(g, nodes, linksData, positions, straightPath);
}