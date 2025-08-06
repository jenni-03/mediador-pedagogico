import { HierarchyNode } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";
import { highlightTreePath, repositionTreeNodes } from "./drawActionsUtilities";
import { SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param treeData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertNode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    treeData: {
        newNodeId: string;
        parentId: string | null;
        nodesData: HierarchyNode<HierarchyNodeData<number>>[];
        linksData: TreeLinkData[];
        pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Elementos del árbol requeridos para la animación 
    const { newNodeId, parentId, nodesData, linksData, pathToParent } = treeData;

    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = g.select<SVGGElement>(`g#${newNodeId}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    if (parentId) {
        // Grupo del lienzo correspondiente al enlace del nodo padre que apunta al nuevo nodo
        const newNodeLinkGroup = g.select<SVGGElement>(
            `g#link-${parentId}-${newNodeId}`
        );

        // Estado visual inicial del enlace
        newNodeLinkGroup.select("path.tree-link").style("opacity", 0);

        // Reposicionamiento de los nodos y enlaces del árbol
        await repositionTreeNodes(g, nodesData, linksData, positions);

        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nuevo nodo
        await highlightTreePath(g, pathToParent, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

        // Aparición del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        // Establecimiento del enlace del nodo padre al nuevo nodo
        await newNodeLinkGroup
            .select("path.tree-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    } else {
        await newNodeGroup
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo especifico en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param treeData Objeto con información del árbol necesaria para la animación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación. 
 */
export async function animateDeleteNode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    treeData: {
        prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
        nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
        nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null;
        remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
        remainingLinksData: TreeLinkData[];
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Elementos del árbol requeridos para la animación 
    const { nodeToDelete, prevRootNode, remainingNodesData, remainingLinksData, nodeToUpdate } = treeData;

    if (!nodeToUpdate) {
        // Nodo padre del nodo a eliminar
        const parentNode = nodeToDelete.parent;

        // Obtenemos la ruta desde el nodo raíz hasta el nodo padre del nodo a eliminar
        const pathToParent = parentNode ? prevRootNode.path(parentNode) : [];

        // Animación especifica de eliminación para nodo hoja o nodo con único hijo
        await animateLeafOrSingleChild(
            g,
            nodeToDelete,
            parentNode ? parentNode.data.id : null,
            pathToParent
        );
    } else {
        // Obtenemos la ruta desde el nodo raiz hasta el nodo a actualizar
        const pathToUpdateNode = prevRootNode.path(nodeToUpdate);

        // Obtenemos la ruta desde el nodo a actualizar hasta el nodo a eliminar
        const pathToRemovalNode = nodeToUpdate.path(nodeToDelete);

        // Animación especifica de eliminación para nodo con 2 hijos
        await animateTwoChildren(
            g,
            nodeToDelete,
            nodeToUpdate,
            pathToUpdateNode,
            pathToRemovalNode
        );
    }

    // Limpiamos el registro del nodo eliminado
    positions.delete(nodeToDelete.data.id);

    // Reposicionamiento de los nodos y enlaces del árbol
    await repositionTreeNodes(g, remainingNodesData, remainingLinksData, positions);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un nodo dentro del árbol binario. 
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param targetNode ID del nodo a buscar.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSearchNode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    targetNode: string,
    path: HierarchyNode<HierarchyNodeData<number>>[],
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Reestablecimiento del fondo original de los nodos
    g.selectAll(".node-container")
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);

    // Grupo correspondiente al nodo a buscar
    const foundNodeGroup = g.select<SVGCircleElement>(`g#${targetNode} circle`);

    // Animación de recorrido de los nodos hasta el nodo a buscar
    await highlightTreePath(g, path, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

    // Resaltado final del nodo ubicado
    await foundNodeGroup
        .transition()
        .duration(200)
        .attr("r", 28)
        .transition()
        .duration(200)
        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar el recorrido de los nodos de un árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param targetNodes Array de IDs de nodos que representan la ruta del recorrido.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateTraversal(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    targetNodes: string[],
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Reestablecimiento del fondo original de los nodos
    g.selectAll(".node-container")
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);

    for (const nodeId of targetNodes) {
        // Selección del grupo del nodo actual
        const nodeGroup = g.select<SVGCircleElement>(`g#${nodeId} circle`);

        // Resaltado del nodo actual
        await nodeGroup
            .transition()
            .duration(750)
            .attr("fill", SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR)
            .end();

        await nodeGroup
            .transition()
            .duration(150)
            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.2)
            .transition()
            .duration(150)
            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
            .end();

        // Restablecimiento del fondo del contenedor del nodo
        await nodeGroup
            .transition()
            .duration(750)
            .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de eliminar todos los nodos y enlaces dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearTree(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodePositions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Animación de salida de los enlaces
    await g.selectAll("g.link")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Animación de salida de los nodos
    await g.selectAll("g.node")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Eliminación del grupo contenedor de los nodos y enlaces del DOM
    g.remove();

    // Liempiza del mapa de posiciones
    nodePositions.clear();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo hoja o un nodo con un único hijo en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param nodeToDelete Nodo jerárquico que representa el nodo a ser eliminado.
 * @param parentNodeId ID del nodo padre o null si el nodo a eliminar es la raíz.
 * @param pathToParent Arreglo de nodos jerárquicos que representan el camino desde la raíz hasta el padre del nodo a eliminar.
 */
async function animateLeafOrSingleChild(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>,
    parentNodeId: string | null,
    pathToParent: HierarchyNode<HierarchyNodeData<number>>[]
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = g.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

    // Reestrablecimiento del fondo original del nodo a eliminar
    removedG.select("circle").attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);

    // Nodo hijo del nodo a eliminar
    const childNode = nodeToDelete.children?.[0]?.data.id;

    // Grupo del lienzo correspondiente al nuevo enlace del nodo padre que apunta al nodo hijo del nodo a elimimar (solo si ambos están presentes)
    const newChildLinkGroup = parentNodeId && childNode
        ? g.select<SVGGElement>(`g#link-${parentNodeId}-${childNode}`)
        : null;

    // Grupo del lienzo correspondiente al enlace previo del nodo padre que apunta al nodo a eliminar
    const parentNodeLinkRemovalGroup = parentNodeId
        ? g.select<SVGGElement>(`g#link-${parentNodeId}-${nodeToDelete.data.id}`)
        : null;

    // Grupo del lienzo correspondiente al enlace del nodo a eliminar que apunta a su nodo hijo
    const removalNodeLinkGroup = childNode
        ? g.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${childNode}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo padre y nodo hijo del nodo a eliminar
    if (newChildLinkGroup) {
        newChildLinkGroup.select("path.tree-link").style("opacity", 0);
    }

    // Si el nodo a eliminar cuenta con nodo padre
    if (parentNodeLinkRemovalGroup) {
        // Animación de recorrido desde el nodo raíz hasta el nodo padre del nodo a eliminar
        await highlightTreePath(g, pathToParent, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

        // Salida del enlace entre el nodo padre y el nodo a eliminar
        await parentNodeLinkRemovalGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        parentNodeLinkRemovalGroup.remove();
    }

    // Salida del enlace entre el nodo a eliminar y su hijo (si aplica)
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        removalNodeLinkGroup.remove();
    }

    // Salida del nodo a eliminar
    await removedG
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    removedG.remove();

    if (newChildLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(g, parentNodeId!, childNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS);

        // Aparición del enlace entre el nodo padre e hijo del nodo eliminado
        await newChildLinkGroup.select("path.tree-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de animar la eliminación de un nodo con 2 nodos hijos en el árbol binario.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param nodeToDelete Nodo jerárquico que representa el nodo a ser eliminado.
 * @param nodeToUpdate Nodo jerárquico que representa el nodo cuyo valor será actualizado.
 * @param pathToUpdateNode Arreglo de nodos jerárquicos que representan el camino desde la raíz hasta el nodo a actualziar.
 * @param pathToRemovalNode Arreglo de nodos jerárquicos que representan el camino desde el nodo a actualizar hasta el nodo a eliminar.
 */
async function animateTwoChildren(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>,
    nodeToUpdate: HierarchyNode<HierarchyNodeData<number>>,
    pathToUpdateNode: HierarchyNode<HierarchyNodeData<number>>[],
    pathToRemovalNode: HierarchyNode<HierarchyNodeData<number>>[]
) {
    // Grupo del lienzo correspondiente al nodo a eliminar
    const removedG = g.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

    // Reestrablecimiento del fondo original del nodo a eliminar
    removedG.select("circle").attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);

    // Grupo del lienzo correspondiente al nodo a actualizar
    const updatedG = g.select<SVGGElement>(`g#${nodeToUpdate.data.id}`);

    // Nodo padre del nodo a eliminar
    const parentNode = nodeToDelete.parent?.data.id;

    // Nodo hijo del nodo a eliminar
    const childNode = nodeToDelete.children?.[0]?.data.id;

    // Grupo del lienzo correspondiente al enlace del nodo padre que apunta al nodo a eliminar
    const removalNodeLinkGroup = parentNode
        ? g.select<SVGGElement>(`g#link-${parentNode}-${nodeToDelete.data.id}`)
        : null;

    // Grupo del lienzo correspondiente al nuevo enlace del nodo a actualizar que apunta al nodo hijo del nodo a elimimar (solo si ambos están presentes)
    const newChildLinkGroup = parentNode && childNode
        ? g.select<SVGGElement>(`g#link-${parentNode}-${childNode}`)
        : null;

    // Grupo del lienzo correspondiente al enlace del nodo a eliminar que apunta a su nodo hijo (solo si el nodo a eliminar cuenta con un nodo hijo)
    const removalChildNodeLinkGroup = childNode
        ? g.select<SVGGElement>(`g#link-${nodeToDelete.data.id}-${childNode}`)
        : null;

    // Estado visual inicial del nuevo enlace entre el nodo a actualizar y el nodo hijo del nodo a eliminar
    if (newChildLinkGroup) {
        newChildLinkGroup.select("path.tree-link").style("opacity", 0);
    }

    // Animación de recorrido desde el nodo raíz hasta el nodo que actualizará su valor
    await highlightTreePath(g, pathToUpdateNode, SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR);

    // Animación de recorrido desde el nodo a actualizar hasta el nodo a eliminar
    for (const node of pathToRemovalNode) {
        // Selección del grupo del nodo actual
        const nodeGroup = g.select<SVGGElement>(`g#${node.data.id}`);

        // Resaltado del nodo actual
        await nodeGroup.select("circle")
            .transition()
            .duration(1000)
            .attr("stroke", SVG_BINARY_TREE_VALUES.UPDATE_STROKE_COLOR)
            .attr("stroke-width", 2)
            .end();

        if (node.data.id !== nodeToDelete.data.id) {
            // Restablecimiento del borde original
            await nodeGroup.select("circle")
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
    updatedG.select("text").text(nodeToDelete.data.value);

    // Aparición del nuevo valor del nodo
    await updatedG.select("text")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Salida del enlace entre el nodo padre y el nodo a eliminar
    if (removalNodeLinkGroup) {
        await removalNodeLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        removalNodeLinkGroup.remove();
    }

    // Salida del enlace entre el nodo a eliminar y su hijo (si aplica)
    if (removalChildNodeLinkGroup) {
        await removalChildNodeLinkGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();
        removalChildNodeLinkGroup.remove();
    }

    // Salida del nodo a eliminar
    await removedG
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    removedG.remove();

    if (newChildLinkGroup) {
        // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo eliminado
        updateTreeLinkPath(g, parentNode!, childNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS);

        // Aparición del enlace entre el nodo padre e hijo del nodo eliminado
        await newChildLinkGroup.select("path.tree-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();
    }
}

/**
 * Función encargada de actualizar el enlace entre el nodo padre y su hijo en base a sus posiciones actuales.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces.
 * @param parentId ID del nodo padre.
 * @param childId ID del nodo hijo.
 * @param r Radio del contenedor del nodo.
 */
function updateTreeLinkPath(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    parentId: string,
    childId: string,
    r: number
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
    const d = `M${px},${py + r} L${cx},${cy - r}`;

    // Aplicamos el nuevo enlace al elemento path
    g.select<SVGGElement>(`g#link-${parentId}-${childId}`)
        .select<SVGPathElement>("path.tree-link")
        .attr("d", d);
}