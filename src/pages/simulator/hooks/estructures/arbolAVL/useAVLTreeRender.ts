import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  BinaryTreeTraversalStep,
  HierarchyNodeData,
  TraversalNodeType,
} from "../../../../../domain/utils/types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import {
  animateClearTree,
  drawTraversalSequence,
} from "../../../../../shared/utils/draw/drawActionsUtilities";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { animateDeleteAVLNode, animateInsertAVLNode } from "../../../../../shared/utils/draw/avlTreeDrawActions";
import { select } from "d3";
import { useBus } from "../../../../../shared/hooks/useBus";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../domain/utils/treeUtils";
import { animateSearchBSTNode } from "../../../../../shared/utils/draw/bstDrawActions";
import { animateLevelOrderTraversal, animateRecursiveTraversal } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { getArbolAVLCode } from "../../../../../shared/constants/pseudocode/arbolAVLCode";

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

  // Estado previo de la raíz
  const prevRoot = usePrevious(root);

  // Control de bloqueo de animación
  const { setIsAnimating } = useAnimation();

  // Bus para la emisión de eventos de código
  const bus = useBus();

  // Layouts para las rotaciones del árbol
  const avlFramesLayouts = useMemo(() => {
    const frames = query.avlTrace?.hierarchies.pre
      ? [query.avlTrace.hierarchies.pre, ...query.avlTrace.hierarchies.mids]
      : [];
    return frames.map(frame => hierarchyFrom(frame, SVG_AVL_TREE_VALUES.NODE_SPACING, SVG_AVL_TREE_VALUES.LEVEL_SPACING));
  }, [query.avlTrace?.hierarchies.pre, query.avlTrace?.hierarchies.mids]);

  // Renderizado base del árbol
  useEffect(() => {
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
      SVG_AVL_TREE_VALUES.EXTRA_WIDTH,
      SVG_AVL_TREE_VALUES.EXTRA_HEIGHT
    );

    // Configuración del contenedor SVG
    const svg = select(svgRef.current)
      .attr("height", metrics.height)
      .attr("width", metrics.width);

    // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
    treeOffset.x = metrics.treeOffset.x;
    treeOffset.y = metrics.treeOffset.y;

    // Contenedor para los nodos y enlaces del árbol
    let treeG = svg.select<SVGGElement>("g#tree-container");
    if (treeG.empty()) treeG = svg.append("g").attr("id", "tree-container");
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    // Desplazamiento para el contenedor de la secuencia de valores de recorrido
    seqOffset.x = metrics.seqOffset.x;
    seqOffset.y = metrics.seqOffset.y;

    // Contenedor para la secuencia de valores de recorrido
    let seqG = svg.select<SVGGElement>("#seq-container");
    if (seqG.empty()) seqG = svg.append("g").attr("id", "seq-container");
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // Capas internas para nodos y enlaces
    let nodesLayer = treeG.select<SVGGElement>("#nodes-layer");
    if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("id", "nodes-layer");

    let linksLayer = treeG.select<SVGGElement>("g#links-layer");
    if (linksLayer.empty()) linksLayer = treeG.append("g").attr("id", "links-layer");

    // Elevamos la capa de nodos
    nodesLayer.raise();
  }, [root, currentNodes, prevRoot, linksData, avlFramesLayouts]);

  // Efecto para manejar la inserción de un nuevo nodo
  useEffect(() => {
    if (!root || !svgRef.current || !query.toInsert) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de inserción de la query
    const { parentNodeId, targetNodeId, inserted, steps } = query.toInsert;

    // Layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Animación de inserción del nuevo nodo con rotaciones
    animateInsertAVLNode(
      svg,
      treeOffset,
      {
        targetNodeId,
        parentNodeId,
        inserted,
        insertSteps: steps,
        nodesData: preLayout ? preLayout.nodes : currentNodes,
        linksData: preLayout ? preLayout.links : linksData,
        positions: nodePositions,
        rotations: query.avlTrace?.rotations ?? [],
        frames: avlFramesLayouts,
        highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
      },
      bus,
      resetQueryValues,
      setIsAnimating
    );
  }, [query.toInsert, query.avlTrace, root, currentNodes, linksData, avlFramesLayouts, bus, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la eliminación de un nodo
  useEffect(() => {
    if (!svgRef.current || !query.toDelete) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de eliminación de la query
    const deletionData = query.toDelete;

    // Obtenemos el layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Animación de eliminación de un nodo especifico
    animateDeleteAVLNode(
      svg,
      treeOffset,
      {
        targetNodeId: deletionData.targetNodeId,
        parentNodeId: deletionData.parentNodeId,
        successorNodeId: deletionData.successorNodeId,
        successorParentNodeId: deletionData.successorParentNodeId,
        replacementNodeId: deletionData.replacementNodeId,
        replacementSide: deletionData.replacementSide,
        deleted: deletionData.deleted,
        deleteSteps: deletionData.steps,
        pathToSuccessor: deletionData.pathToSuccessorIds,
        remainingNodesData: preLayout ? preLayout.nodes : currentNodes,
        remainingLinksData: preLayout ? preLayout.links : linksData,
        positions: nodePositions,
        rotations: query.avlTrace?.rotations ?? [],
        frames: avlFramesLayouts,
        highlightTargetColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR,
        highlightSuccessorColor: SVG_BINARY_TREE_VALUES.UPDATE_STROKE_COLOR
      },
      bus,
      resetQueryValues,
      setIsAnimating
    );
  }, [query.toDelete, query.avlTrace, currentNodes, linksData, avlFramesLayouts, bus, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la búsqueda de un nodo
  useEffect(() => {
    if (!root || !svgRef.current || !query.toSearch) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Extraemos los datos de búsqueda de la query
    const { steps, targetNodeId, found } = query.toSearch;

    // Animación de búsqueda del nodo
    animateSearchBSTNode(
      svg,
      treeOffset,
      {
        targetNodeId,
        searchSteps: steps,
        found,
        positions: nodePositions,
        highlightColor: SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR
      },
      bus,
      resetQueryValues,
      setIsAnimating
    );
  }, [query.toSearch, root, currentNodes, bus, resetQueryValues, setIsAnimating]);

  // Efecto para manejar los recorridos del árbol
  useEffect(() => {
    if (!svgRef.current) return;

    // Determinar el tipo de recorrido a animar
    const traversalType =
      query.toGetPreOrder ? "getPreOrder" :
        query.toGetInOrder ? "getInOrder" :
          query.toGetPostOrder ? "getPostOrder" :
            query.toGetLevelOrder ? "getLevelOrder" :
              null;

    if (!traversalType) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g#seq-container");

    let steps: BinaryTreeTraversalStep[] = [];
    let nodes: TraversalNodeType[] = [];
    if (traversalType === "getPreOrder") {
      nodes = query.toGetPreOrder!.nodes;
      steps = query.toGetPreOrder!.steps;
    }
    else if (traversalType === "getInOrder") {
      nodes = query.toGetInOrder!.nodes;
      steps = query.toGetInOrder!.steps;
    }
    else if (traversalType === "getPostOrder") {
      nodes = query.toGetPostOrder!.nodes;
      steps = query.toGetPostOrder!.steps;
    } else {
      nodes = query.toGetLevelOrder!.nodes;
    }

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
    if (traversalType === "getLevelOrder") {
      const { steps } = query.toGetLevelOrder!;

      animateLevelOrderTraversal(
        svg,
        {
          traversalSteps: steps,
          seqPositions,
          highlightColor: "#8aa0ff",
          baseStroke: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
          baseStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH
        },
        bus,
        resetQueryValues,
        setIsAnimating
      );
    } else {
      animateRecursiveTraversal(
        svg,
        {
          traversalSteps: steps,
          seqPositions,
          strokeColor: "#8aa0ff",
          baseStroke: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
          baseStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH
        },
        traversalType,
        bus,
        resetQueryValues,
        setIsAnimating
      );
    }
  }, [query.toGetInOrder, query.toGetPreOrder, query.toGetPostOrder, query.toGetLevelOrder, bus, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la limpieza de lienzo
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Código y labels de la operación
    const arbolABBCode = getArbolAVLCode();
    const labels = arbolABBCode.clean.labels;

    // Animación de limpieza del árbol
    animateClearTree(
      svg,
      { nodePositions, seqPositions },
      bus,
      { CLEAR_ROOT: labels.CLEAR_ROOT },
      resetQueryValues,
      setIsAnimating
    );
  }, [query.toClear, bus, resetQueryValues, setIsAnimating]);

  return { svgRef };
}