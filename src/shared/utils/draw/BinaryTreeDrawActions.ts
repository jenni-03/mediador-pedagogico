import type { HierarchyNode, Selection } from "d3";
import { HierarchyNodeData, LinkPathFn, TreeLinkData } from "../../../types";
import { defaultAppearTreeNode, defaultDeleteTreeNode, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import type { Dispatch, SetStateAction } from "react";
import { straightPath } from "../treeUtils";

/**
 * Función encargada de animar el proceso de inserción de un nuevo nodo en el árbol binario.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param animationOpts Objeto con opciones de animación para el proceso de inserción.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    insertionData: {
        targetNodeId: string;
        parentId: string | null;
        exists: boolean;
        currentNodes: HierarchyNode<HierarchyNodeData<number>>[];
        currentLinks: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTarget: string[];
    },
    animationOpts: {
        highlightColor: string;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
        const { positions, targetNodeId, parentId } = insertionData;

        // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        if (insertionData.exists) {
            // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
            seqG.style("opacity", 0);

            // Animación de recorrido hasta el nodo objetivo
            await highlightBinaryTreePath(treeG, insertionData.pathToTarget, animationOpts.highlightColor);

            // Restablecimiento del estilo visual original del nodo objetivo
            await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();

            // Mostrar indicador visual de que el nodo ya estaba presente dentro del árbol
            await showTreeHint(
                svg,
                { type: "node", id: targetNodeId },
                { label: "Nodo", value: "ya insertado" },
                positions,
                treeOffset,
                {
                    size: { width: 75, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );
        } else {
            // Animación de inserción del elemento como BST 
            await animateBSTInsertCore(
                treeG,
                seqG,
                {
                    newNodeId: targetNodeId,
                    parentId: parentId,
                    nodesData: insertionData.currentNodes,
                    linksData: insertionData.currentLinks,
                    pathToParent: insertionData.pathToTarget,
                    positions: insertionData.positions,
                },
                {
                    reposition: repositionBinaryTree,
                    appearNode: defaultAppearTreeNode,
                    highlight: highlightBinaryTreePath,
                    highlightColor: animationOpts.highlightColor
                }
            );

            // Restablecimiento del fondo original del padre del nuevo nodo (si aplica)
            if (parentId) {
                await treeG.select<SVGGElement>(`g#${parentId} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
            }
        }
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar la eliminación de un nodo especifico en el árbol binario.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param animationOpts Objeto con opciones de animación para el proceso de eliminación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateDeleteNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    deletionData: {
        targetNodeId: string;
        parentId: string | null;
        successorNodeId: string | null;
        replacementNodeId: string | null;
        exists: boolean;
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
        positions: Map<string, { x: number, y: number }>;
        pathToTarget: string[];
        pathToSuccessor: string[];
    },
    animationOpts: {
        highlightTargetColor: string;
        highlightSuccessorColor: string;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Elementos del árbol requeridos para la animación
        const { targetNodeId, parentId, successorNodeId, positions } = deletionData;

        // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
        seqG.style("opacity", 0);

        // En caso de que el nodo objetivo no se encuentre dentro del árbol (no se elimina nada)
        if (!deletionData.exists) {
            // Animación de recorrido hasta el último nodo visitado
            await highlightBinaryTreePath(treeG, deletionData.pathToTarget, animationOpts.highlightTargetColor);

            // Mostrar indicador visual de que el nodo no fue encontrado
            await showTreeHint(
                svg,
                { type: "node", id: targetNodeId },
                { label: "Nodo", value: "no ubicado" },
                positions,
                treeOffset,
                {
                    size: { width: 70, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );

            // Restablecimiento del fondo original del último nodo visitado.
            await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        } else {
            const nodeToDeleteId = successorNodeId ? successorNodeId : targetNodeId;

            if (!successorNodeId) {
                // Animación especifica de eliminación para nodo hoja o nodo con único hijo
                await animateLeafOrSingleChild(
                    treeG,
                    nodeToDeleteId,
                    parentId,
                    deletionData.replacementNodeId,
                    deletionData.pathToTarget,
                    {
                        deleteNode: defaultDeleteTreeNode,
                        highlightNodePath: highlightBinaryTreePath,
                        highlightColor: animationOpts.highlightTargetColor,
                        buildPath: straightPath
                    }
                );

                // Restablecimiento del fondo original del padre del nodo eliminado (si aplica)
                if (parentId) {
                    await treeG.select<SVGGElement>(`g#${parentId} circle.node-container`)
                        .transition()
                        .duration(800)
                        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                        .end();
                }
            } else {
                // Animación específica de eliminación para nodo con 2 hijos
                await animateTwoChildren(
                    treeG,
                    nodeToDeleteId,
                    targetNodeId,
                    parentId!,
                    deletionData.replacementNodeId,
                    deletionData.pathToTarget,
                    deletionData.pathToSuccessor,
                    {
                        highlightNodePath: highlightBinaryTreePath,
                        highlightTargetColor: animationOpts.highlightTargetColor,
                        highlightSuccessorColor: animationOpts.highlightSuccessorColor
                    }
                );

                // Restablecimiento del color original del nodo actualizado
                await treeG.select<SVGGElement>(`g#${targetNodeId} circle.node-container`)
                    .transition()
                    .duration(800)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .end();
            }

            // Limpiamos el registro del nodo eliminado
            deletionData.positions.delete(nodeToDeleteId);

            // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
            await repositionBinaryTree(treeG, deletionData.remainingNodesData, deletionData.remainingLinksData, positions);
        }
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
}

/**
 * Función encargada de animar el proceso de búsqueda de un nodo dentro del árbol binario. 
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param animationOpts Objeto con opciones de animación para el proceso de búsqueda.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSearchNode(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    treeOffset: { x: number; y: number },
    searchData: {
        lastVisitedNodeId: string,
        found: boolean,
        positions: Map<string, { x: number, y: number }>;
        path: string[],
    },
    animationOpts: {
        highlightColor: string;
    },
    resetQueryValues: () => void,
    setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
    try {
        // Desestructuración de elementos requeridos para la animación (con uso más frecuente) 
        const { positions, lastVisitedNodeId } = searchData;

        // Grupo contenedor principal de los elementos del árbol (nodos y enlaces)
        const treeG = svg.select<SVGGElement>("g.tree-container");

        // Grupo contenedor de la secuencia de valores de recorrido
        const seqG = svg.select<SVGGElement>("g.seq-container");

        // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
        seqG.style("opacity", 0);

        // Grupo correspondiente al último nodo visitado
        const lastVisitedNodeGroup = treeG.select<SVGCircleElement>(`g#${lastVisitedNodeId} circle.node-container`);

        // Animación de recorrido hasta el nodo objetivo
        await highlightBinaryTreePath(treeG, searchData.path, animationOpts.highlightColor);

        // Resaltado final del nodo objetivo (si esta presente en el árbol)
        if (searchData.found) {
            await lastVisitedNodeGroup
                .transition()
                .duration(250)
                .attr("r", 30)
                .transition()
                .duration(250)
                .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
                .end();
        } else {
            // Mostrar indicador visual de que el nodo no fue encontrado
            await showTreeHint(
                svg,
                { type: "node", id: lastVisitedNodeId },
                { label: "Nodo", value: "no ubicado" },
                positions,
                treeOffset,
                {
                    size: { width: 70, height: 35 },
                    typography: { labelFz: "10.5px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                    anchor: { side: "below", dx: 10, dy: -8 },
                    palette: { bg: "#1b2330", stroke: "#14b8a6" }
                }
            );
        }

        // Restablecimiento del fondo original del último nodo visitado
        await lastVisitedNodeGroup
            .transition()
            .duration(800)
            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
            .end();
    } finally {
        resetQueryValues();
        setIsAnimating(false);
    }
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
        pathToParent: string[];
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
            path: string[],
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
            .duration(800)
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
 * Función encargada de animar el proceso de eliminación de un nodo hoja o un nodo con un único hijo en un árbol ABB.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDeleteId ID del nodo a eliminar.
 * @param parentNodeId ID del nodo padre del nodo a eliminar o null si el nodo a eliminar es la raíz.
 * @param childNodeId ID del nodo hijo del nodo a eliminar o null si el nodo a eliminar no tiene hijos.
 * @param pathToParent Lista de IDs de los nodos que representan el camino desde la raíz hasta el padre del nodo a eliminar.
 * @param opts Objeto con opciones de animación para el desvanecimiento, resaltado de nodos y dibujado de enlaces.
 */
export async function animateLeafOrSingleChild(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDeleteId: string | null,
    parentNodeId: string | null,
    childNodeId: string | null,
    pathToParent: string[],
    opts: {
        deleteNode: (
            nodeGroup: Selection<SVGGElement, unknown, null, undefined>
        ) => Promise<void>;
        highlightNodePath: (
            g: Selection<SVGGElement, unknown, null, undefined>,
            path: string[],
            highlightColor: string
        ) => Promise<void>;
        highlightColor: string;
        buildPath: LinkPathFn;
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = treeG.select<SVGGElement>(`g#${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nuevo enlace formado entre el nodo padre y el nodo hijo del nodo a elimimar (solo si ambos están presentes)
    const newParentLinkGroup = parentNodeId && childNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${childNodeId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar (solo si el padre esta presente)
    const parentRemovalLinkGroup = parentNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDeleteId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el hijo esta presente)
    const removalNodeLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${nodeToDeleteId}-${childNodeId}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.style("opacity", 0);
    }

    // Si el nodo a eliminar cuenta con nodo padre
    if (parentRemovalLinkGroup) {
        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nodo a eliminar
        await opts.highlightNodePath(treeG, pathToParent, opts.highlightColor);

        // Desconexión del enlace entre el nodo padre y el nodo a eliminar
        await parentRemovalLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Desconexión del enlace entre el nodo a eliminar y su hijo (si el nodo a eliminar cuenta con uno)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await opts.deleteNode(removedG);

    // Si el nodo a eliminar cuenta tanto con un nodo padre y un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(treeG, parentNodeId!, childNodeId!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, opts.buildPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo con 2 hijos en un árbol ABB.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodeToDeleteId ID del nodo a eliminar.
 * @param nodeToUpdateId ID del nodo que actualizará su valor.
 * @param parentNodeId ID del nodo padre del nodo a eliminar.
 * @param childNodeId ID del nodo hijo del nodo a eliminar o null si el nodo a eliminar no tiene hijos.
 * @param pathToUpdateNode Lista de IDs de los nodos que representan el camino desde la raíz hasta el nodo a actualizar.
 * @param pathToRemovalNode Lista de IDs de los nodos que representan el camino desde el nodo a actualizar hasta el nodo a eliminar.
 * @param opts Objeto con opciones de animación para el resaltado de nodos.
 */
export async function animateTwoChildren(
    treeG: Selection<SVGGElement, unknown, null, undefined>,
    nodeToDeleteId: string,
    nodeToUpdateId: string,
    parentNodeId: string,
    childNodeId: string | null,
    pathToUpdateNode: string[],
    pathToRemovalNode: string[],
    opts: {
        highlightNodePath: (
            treeG: Selection<SVGGElement, unknown, null, undefined>,
            path: string[],
            highlightColor: string
        ) => Promise<void>,
        highlightTargetColor: string,
        highlightSuccessorColor: string
    }
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = treeG.select<SVGGElement>(`g#${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nodo a actualizar
    const updatedG = treeG.select<SVGGElement>(`g#${nodeToUpdateId}`);

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo padre y el nodo a eliminar
    const removalParentLinkGroup = treeG.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDeleteId}`);

    // Grupo del lienzo correspondiente al nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (solo si el nodo a eliminar cuenta con un nodo hijo)
    const newParentLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${parentNodeId}-${childNodeId}`)
        : null;

    // Grupo del lienzo correspondiente al enlace a eliminar entre el nodo a eliminar y su nodo hijo (solo si el nodo a eliminar cuenta con un nodo hijo)
    const removalNodeLinkGroup = childNodeId
        ? treeG.select<SVGGElement>(`g#link-${nodeToDeleteId}-${childNodeId}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y el nodo hijo del nodo a eliminar (si aplica)
    if (newParentLinkGroup) {
        newParentLinkGroup.select("path.tree-link").style("opacity", 0);
    }

    // Animación de recorrido desde el nodo raíz hasta el nodo que actualizará su valor
    await opts.highlightNodePath(treeG, pathToUpdateNode, opts.highlightTargetColor);

    // Animación de recorrido desde el nodo a actualizar hasta el nodo a eliminar
    for (const nodeId of pathToRemovalNode) {
        // Selección del círculo contenedor del nodo actual
        const nodeCircleGroup = treeG.select<SVGGElement>(`g#${nodeId} circle.node-container`);

        // Resaltado de bordes del contenedor del nodo actual
        await nodeCircleGroup
            .transition()
            .duration(800)
            .attr("stroke", opts.highlightSuccessorColor)
            .attr("stroke-width", 3)
            .end();

        if (nodeId !== nodeToDeleteId) {
            // Restablecimiento del borde original
            await nodeCircleGroup
                .transition()
                .duration(800)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                .end();
        }
    }

    // Desvanecimiento del valor actual del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Actualizar el valor del nodo copiando el valor del nodo a eliminar
    updatedG.select("text").text(removedG.select<SVGTextElement>("text").text());

    // Aparición del nuevo valor del nodo a actualizar
    await updatedG.select("text")
        .transition()
        .duration(800)
        .style("opacity", 1)
        .end();

    // Desconexión del enlace entre el nodo padre y el nodo a eliminar
    await removalParentLinkGroup
        .transition()
        .duration(800)
        .style("opacity", 0)
        .remove()
        .end();

    // Desconexión del enlace entre el nodo a eliminar y su hijo (solo si el nodo a eliminar cuenta con un hijo)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(800)
            .style("opacity", 0)
            .remove()
            .end();
    }

    // Animación de salida del nodo a eliminar
    await defaultDeleteTreeNode(removedG);

    // Si el nodo a eliminar cuenta con un nodo hijo
    if (newParentLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(treeG, parentNodeId, childNodeId!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, straightPath);

        // Aparición del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        await newParentLinkGroup.select("path.tree-link")
            .transition()
            .duration(800)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de resaltar secuencialmente cada nodo del árbol binario a lo largo de un camino dado.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param pathIds Array con los identificadores de los nodos que representan el camino a resaltar. El orden determina la secuencia de resaltado.
 * @param highlightColor Color a usar para resaltar el contenedor de cada nodo a lo largo del camino.
 */
export async function highlightBinaryTreePath(
    g: Selection<SVGGElement, unknown, null, undefined>,
    pathIds: string[],
    highlightColor: string
) {
    for (const nodeId of pathIds) {
        // Selección del grupo contenedor del nodo actual
        const nodeCircle = g.select<SVGGElement>(`g#${nodeId} circle.node-container`);

        // Resaltado del nodo actual
        await nodeCircle
            .transition()
            .duration(800)
            .attr("fill", highlightColor)
            .end();

        // Restablecimiento del fondo original del último nodo visitado
        if (nodeId !== pathIds[pathIds.length - 1]) {
            await nodeCircle
                .transition()
                .duration(800)
                .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                .end();
        }
    }
}

/**
 * Función encargada de animar el proceso de rotación de los nodos en un árbol binario de búsqueda especial.
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