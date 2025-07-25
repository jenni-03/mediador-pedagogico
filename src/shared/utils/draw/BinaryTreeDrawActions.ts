import { HierarchyNode } from "d3";
import { HierarchyNodeData } from "../../../types";

export async function animateInsertNode(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    newNodeId: string,
    parentId: string | null,
    pathToParent: HierarchyNode<HierarchyNodeData<number>>[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Grupo del lienzo correspondiente al nuevo nodo
    const newNodeGroup = g.select<SVGGElement>(`g#${newNodeId}`);

    // Estado inicial del nuevo nodo
    newNodeGroup.style("opacity", 0);

    await newNodeGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);

}