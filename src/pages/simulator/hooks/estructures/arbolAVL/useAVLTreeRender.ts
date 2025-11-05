import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import {
  animateClearTree,
  animateTreeTraversal,
  drawTraversalSequence,
} from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateSearchNode } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../shared/utils/treeUtils";
import { animateAVLTreeDelete, animateAVLTreeInsert } from "../../../../../shared/utils/draw/avlTreeDrawActions";
import { select } from "d3";

export function useAVLTreeRender(
  treeData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_avl">,
  resetQueryValues: () => void
) {
  // Referencia que apunta al elemento SVG del DOM
  const svgRef = useRef<SVGSVGElement>(null);

  // Mapas de posiciones actuales (nodos) y de la secuencia (recorridos)
  const nodePositions = useRef(new Map<string, { x: number; y: number }>()).current;
  const seqPositions = useRef(new Map<string, { x: number; y: number }>()).current;

  // Offsets para contenedores de árbol y secuencia
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Construcción de la jerarquía e inicialización del layout del árbol
  const { root, nodes: currentNodes, links: linksData } = useMemo(() => {
    if (!treeData) return { root: null, nodes: [], links: [] }
    return hierarchyFrom(
      treeData,
      SVG_AVL_TREE_VALUES.NODE_SPACING,
      SVG_AVL_TREE_VALUES.LEVEL_SPACING
    );
  }, [treeData]);

  // Estado previo (para delete)
  const prevRoot = usePrevious(root);

  // Control de animación global
  const { setIsAnimating } = useAnimation();

  // Layouts para las rotaciones del árbol
  const avlFramesLayouts = useMemo(() => {
    const frames = query.avlTrace?.hierarchies.pre
      ? [query.avlTrace.hierarchies.pre, ...query.avlTrace.hierarchies.mids]
      : [];
    return frames.map(frame => hierarchyFrom(frame, SVG_AVL_TREE_VALUES.NODE_SPACING, SVG_AVL_TREE_VALUES.LEVEL_SPACING));
  }, [query.avlTrace?.hierarchies.pre, query.avlTrace?.hierarchies.mids]);

  // Renderizado base del árbol
  useEffect(() => {
    // Verificamos que la raiz no sea nula y que la referencia al SVG se haya establecido
    if (!root || !svgRef.current) return;

    // Margenes para el svg
    const margin = {
      left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
      right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
      top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
      bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
    };

    // Aplanar los nodos de todos los frames
    const avlFramesNodes = avlFramesLayouts.flatMap(frame => frame.nodes);
    const nodesForMetrics = avlFramesNodes.length > 0 ? avlFramesNodes : currentNodes;

    // Cálculo de las dimensiones del lienzo y sus contenedores
    const metrics = computeSvgTreeMetrics(
      nodesForMetrics,
      prevRoot?.descendants() ?? nodesForMetrics,
      margin,
      currentNodes.length,
      SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING + 25,
      SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT,
      SVG_AVL_TREE_VALUES.EXTRA_WIDTH
    );

    // Configuración del contenedor SVG
    const svg = select(svgRef.current)
      .attr("height", metrics.height)
      .attr("width", metrics.width);

    // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
    treeOffset.x = metrics.treeOffset.x;
    treeOffset.y = metrics.treeOffset.y;

    // Contenedor interno para los nodos y enlaces del árbol
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    // Desplazamiento para el contenedor de la secuencia de valores de recorrido
    seqOffset.x = metrics.seqOffset.x;
    seqOffset.y = metrics.seqOffset.y;

    // Contenedor interno para la secuencia de valores de recorrido
    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // Capas internas para nodos y enlaces
    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty()) linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // Elevamos la capa de nodos
    nodesLayer.raise();
  }, [root, currentNodes, treeOffset, seqOffset, prevRoot, linksData, avlFramesLayouts, query.avlTrace?.hierarchies.pre]);

  // Efecto para manejar la inserción de nuevos nodos
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!root || !svgRef.current || !query.toInsert) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de inserción de la query
    const { pathIds, parentId, targetNodeId, exists } = query.toInsert;

    // Obtenemos el layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Animación de inserción del nuevo nodo con rotaciones
    animateAVLTreeInsert(
      svg,
      treeOffset,
      {
        targetNodeId,
        parentId,
        exists,
        currentNodes: preLayout ? preLayout.nodes : currentNodes,
        currentLinks: preLayout ? preLayout.links : linksData,
        positions: nodePositions,
        pathToTarget: pathIds,
        rotations: query.avlTrace?.rotations ?? [],
        frames: avlFramesLayouts
      },
      { highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR },
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, linksData, query.toInsert, query.avlTrace, avlFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la eliminación de un nodo
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!prevRoot || !svgRef.current || !query.toDelete) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de eliminación de la query
    const operationData = query.toDelete;

    // Obtenemos el layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Animación de eliminación del nodo con rotaciones
    animateAVLTreeDelete(
      svg,
      treeOffset,
      {
        targetNodeId: operationData.targetNodeId,
        parentId: operationData.parentId,
        successorNodeId: operationData.successorId,
        replacementNodeId: operationData.replacementId,
        exists: operationData.exists,
        currentNodes: preLayout ? preLayout.nodes : currentNodes,
        currentLinks: preLayout ? preLayout.links : linksData,
        positions: nodePositions,
        pathToTarget: operationData.pathToTargetIds,
        pathToSuccessor: operationData.pathToSuccessorIds,
        rotations: query.avlTrace!.rotations,
        frames: avlFramesLayouts
      },
      {
        highlightTargetColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
        highlightSuccessorColor: SVG_BINARY_TREE_VALUES.UPDATE_STROKE_COLOR
      },
      resetQueryValues,
      setIsAnimating
    );
  }, [prevRoot, currentNodes, linksData, query.toDelete, query.avlTrace, avlFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la búsqueda de un nodo
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!root || !svgRef.current || !query.toSearch) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de búsqueda de la query
    const { pathIds, found, lastVisitedId } = query.toSearch;

    // Animación de búsqueda del nodo
    animateSearchNode(
      svg,
      treeOffset,
      {
        lastVisitedNodeId: lastVisitedId,
        found,
        positions: nodePositions,
        path: pathIds
      },
      { highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR },
      resetQueryValues, setIsAnimating);
  }, [root, currentNodes, query.toSearch, treeOffset, resetQueryValues, setIsAnimating]);

  // Efecto para manejar los recorridos del árbol
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!svgRef.current) return;

    // Determinar el tipo de recorrido a animar
    const traversalType =
      query.toGetPreOrder.length > 0 ? "pre" :
        query.toGetInOrder.length > 0 ? "in" :
          query.toGetPostOrder.length > 0 ? "post" :
            query.toGetLevelOrder.length > 0 ? "level" :
              null;

    if (!traversalType) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    let nodes: TraversalNodeType[] = [];
    if (traversalType === "pre") nodes = query.toGetPreOrder;
    else if (traversalType === "in") nodes = query.toGetInOrder;
    else if (traversalType === "post") nodes = query.toGetPostOrder;
    else if (traversalType === "level") nodes = query.toGetLevelOrder;

    // Renderizado de los valores para la secuencia del recorrido
    drawTraversalSequence(
      seqG,
      nodes,
      {
        nodePositions,
        seqPositions,
        treeOffset,
        seqOffset
      }
    );

    // Animación de recorrido de los nodos del árbol
    animateTreeTraversal(treeG, seqG, nodes, seqPositions, resetQueryValues, setIsAnimating);
  }, [query.toGetInOrder, query.toGetPreOrder, query.toGetPostOrder, query.toGetLevelOrder, seqOffset, treeOffset, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la limpieza de lienzo
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!svgRef.current || !query.toClear) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Animación de limpieza del árbol
    animateClearTree(
      treeG,
      seqG,
      { nodePositions, seqPositions },
      resetQueryValues,
      setIsAnimating
    );
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}