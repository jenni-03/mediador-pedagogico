import { HierarchyNode } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";
import { repositionTreeNodes } from "./drawActionsUtilities";

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
        for (const node of pathToParent) {
            // Selección del grupo del nodo actual
            const nodeGroup = g.select<SVGGElement>(`g#${node.data.id}`);

            // Resaltado del nodo actual
            await nodeGroup.select("circle")
                .transition()
                .duration(1000)
                .attr("fill", "#f87171")
                .end();
        }

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