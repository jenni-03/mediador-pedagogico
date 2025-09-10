import type { HierarchyNode, Selection } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";
import { repositionTreeNodes } from "./drawActionsUtilities";
import {
  SVG_STYLE_VALUES,
  SVG_BINARY_TREE_VALUES,
} from "../../constants/consts";

export async function animateInsertHeapNode(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  seqG: Selection<SVGGElement, unknown, null, undefined>,
  heapData: {
    newNodeId: string;
    swapPath: string[]; // IDs de nodos en el orden que se hicieron swaps
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
  },
  positions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { newNodeId, swapPath, nodesData, linksData } = heapData;

  seqG.style("opacity", 0);

  // Grupo del nuevo nodo
  const newNodeGroup = treeG.select<SVGGElement>(`g#${newNodeId}`);
  newNodeGroup.style("opacity", 0);

  // Reposicionar antes de animar
  await repositionTreeNodes(treeG, nodesData, linksData, positions);

  // Mostrar el nuevo nodo en su posición inicial (última hoja)
  await newNodeGroup.transition().duration(1000).style("opacity", 1).end();

  // Ahora animamos los swaps del bubble-up
  for (let i = 0; i < swapPath.length - 1; i++) {
    const currentId = swapPath[i];
    const parentId = swapPath[i + 1];

    const currentNodeGroup = treeG.select<SVGGElement>(`g#${currentId}`);
    const parentNodeGroup = treeG.select<SVGGElement>(`g#${parentId}`);

    const currentPos = positions.get(currentId)!;
    const parentPos = positions.get(parentId)!;

    // Animar intercambio de posiciones
    await Promise.all([
      currentNodeGroup
        .transition()
        .duration(1000)
        .attr("transform", `translate(${parentPos.x}, ${parentPos.y})`)
        .end(),
      parentNodeGroup
        .transition()
        .duration(1000)
        .attr("transform", `translate(${currentPos.x}, ${currentPos.y})`)
        .end(),
    ]);
  }

  resetQueryValues();
  setIsAnimating(false);
}

/**
 * Animación de extracción de raíz en un Heap.
 */
export async function animateExtractRoot(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  seqG: Selection<SVGGElement, unknown, null, undefined>,
  treeData: {
    prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
    nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null;
    remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
    remainingLinksData: TreeLinkData[];
  },
  positions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { nodeToDelete, nodeToUpdate, remainingNodesData, remainingLinksData } =
    treeData;

  seqG.style("opacity", 0);

  const deletedG = treeG.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

  // 1. Fade-out de la raíz eliminada
  await deletedG.transition().duration(800).style("opacity", 0).remove().end();

  // 2. Mover último nodo a la posición de la raíz
  if (nodeToUpdate) {
    const updatedG = treeG.select<SVGGElement>(`g#${nodeToUpdate.data.id}`);
    const rootPos = positions.get(nodeToDelete.data.id);
    const updatePos = positions.get(nodeToUpdate.data.id);

    if (rootPos && updatePos) {
      await updatedG
        .transition()
        .duration(800)
        .attr("transform", `translate(${rootPos.x},${rootPos.y})`)
        .end();

      positions.set(nodeToUpdate.data.id, { ...rootPos });
    }
  }

  positions.delete(nodeToDelete.data.id);

  // 3. Reposicionar estructura (heap sigue siendo completo)
  await repositionTreeNodes(
    treeG,
    remainingNodesData,
    remainingLinksData,
    positions
  );

  // 4. Ejecutar heapifyDown animado si hay nueva raíz
  if (nodeToUpdate) {
    await animateHeapifyDown(treeG, nodeToUpdate, positions);
  }

  resetQueryValues();
  setIsAnimating(false);
}

/**
 * Animación del heapifyDown después de extraer la raíz.
 * Simula comparaciones y swaps hasta restaurar la propiedad del heap.
 */
async function animateHeapifyDown(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  startNode: HierarchyNode<HierarchyNodeData<number>>,
  positions: Map<string, { x: number; y: number }>
) {
  let current = startNode;

  while (current.children && current.children.length > 0) {
    // hijos válidos (ignoramos placeholders)
    const validChildren = current.children.filter((c) => !c.data.isPlaceholder);
    if (validChildren.length === 0) break;

    // elegir hijo para swap: min-heap => menor hijo, max-heap => mayor hijo
    // (aquí asumo min-heap, pero lo puedes parametrizar)
    let targetChild = validChildren[0];
    for (const child of validChildren) {
      if ((child.data.value ?? 0) < (targetChild.data.value ?? 0)) {
        targetChild = child;
      }
    }

    // si ya cumple la propiedad del heap => terminar
    if ((current.data.value ?? 0) <= (targetChild.data.value ?? 0)) break;

    // Selecciones D3
    const currentG = treeG.select<SVGGElement>(`g#${current.data.id}`);
    const targetG = treeG.select<SVGGElement>(`g#${targetChild.data.id}`);

    // Posiciones actuales
    const posCurrent = positions.get(current.data.id)!;
    const posTarget = positions.get(targetChild.data.id)!;

    // 1. Resaltar comparación
    await currentG
      .select("circle")
      .transition()
      .duration(500)
      .attr("stroke", SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR)
      .attr("stroke-width", 3)
      .end();

    await targetG
      .select("circle")
      .transition()
      .duration(500)
      .attr("stroke", SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR)
      .attr("stroke-width", 3)
      .end();

    // 2. Swap visual (intercambiar posiciones en SVG)
    await Promise.all([
      currentG
        .transition()
        .duration(800)
        .attr("transform", `translate(${posTarget.x},${posTarget.y})`)
        .end(),
      targetG
        .transition()
        .duration(800)
        .attr("transform", `translate(${posCurrent.x},${posCurrent.y})`)
        .end(),
    ]);

    // Actualizar mapa de posiciones
    positions.set(current.data.id, { ...posTarget });
    positions.set(targetChild.data.id, { ...posCurrent });

    // 3. Quitar resaltado
    await Promise.all([
      currentG
        .select("circle")
        .transition()
        .duration(300)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end(),
      targetG
        .select("circle")
        .transition()
        .duration(300)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end(),
    ]);

    // avanzar al hijo intercambiado
    current = targetChild;
  }
}
