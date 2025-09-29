import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_AVL_TREE_VALUES, SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import {
  animateClearTree,
  animateTreeTraversal,
  drawTraversalSequence,
  drawTreeLinks,
  drawTreeNodes
} from "../../../../../shared/utils/draw/drawActionsUtilities";
import { animateSearchNode } from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { computeSvgTreeMetrics, hierarchyFrom } from "../../../../../shared/utils/treeUtils";
import { animateAVLTreeDelete, animateAVLTreeInsert } from "../../../../../shared/utils/draw/avlTreeDrawActions";
import { hierarchy, type HierarchyNode, select, tree } from "d3";

export function useAVLTreeRender(
  treeData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_avl">,
  resetQueryValues: () => void
) {
  // Referencia que apunta al elemento SVG del DOM
  const svgRef = useRef<SVGSVGElement>(null);

  // mapas de posiciones actuales (nodos) y de la secuencia (recorridos)
  const nodePositions = useRef(new Map<string, { x: number; y: number }>()).current;
  const seqPositions = useRef(new Map<string, { x: number; y: number }>()).current;

  // offsets para contenedores de árbol y secuencia
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // raíz jerárquica D3 (final post-operación)
  const root = useMemo(() => (treeData ? hierarchy(treeData) : null), [treeData]);

  // nodos “reales” (sin placeholders)
  const currentNodes = useMemo(
    () => (root ? root.descendants().filter(d => !d.data.isPlaceholder) : []),
    [root]
  );

  // Estado previo (para delete)
  const prevRoot = usePrevious(root);

  // Control de animación global
  const { setIsAnimating } = useAnimation();

  // enlaces (excluyendo placeholders como targets)
  const linksData: TreeLinkData[] = useMemo(() => {
    if (!root) return [];
    return root.links().reduce<TreeLinkData[]>((acc, link) => {
      if (!link.target.data.isPlaceholder) {
        acc.push({ sourceId: link.source.data.id, targetId: link.target.data.id })
      }
      return acc;
    }, []);
  }, [root]);

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

    // Separación horizontal entre nodos y vertical entre niveles
    const nodeSpacing = SVG_AVL_TREE_VALUES.NODE_SPACING;
    const levelSpacing = SVG_AVL_TREE_VALUES.LEVEL_SPACING;

    // Creación del layout del árbol
    const treeLayout = tree<HierarchyNodeData<number>>()
      .nodeSize([nodeSpacing, levelSpacing]);
    treeLayout(root);

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
      SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT
    );

    // Configuración del contenedor SVG
    const svg = select(svgRef.current)
      .attr("height", metrics.height)
      .attr("width", metrics.width);

    // Desplazamiento para el contenedor de los nodos (evita que partes queden fuera si las coordenadas son negativas)
    treeOffset.x = metrics.treeOffset.x;
    treeOffset.y = metrics.treeOffset.y;

    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    // Desplazamiento para el contenedor de la secuencia de recorrido de nodos
    seqOffset.x = metrics.seqOffset.x;
    seqOffset.y = metrics.seqOffset.y;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // En caso de haber una animación de inserción o eliminación que requiere rotación, evitamos redibujar los nodos/enlaces
    if (query.avlTrace?.hierarchies.pre) return;

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty()) linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty()) nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // Renderizado de nodos y enlaces del árbol
    drawTreeNodes(nodesLayer, currentNodes, nodePositions);
    drawTreeLinks(linksLayer, linksData, nodePositions);
  }, [root, currentNodes, treeOffset, seqOffset, prevRoot, linksData, avlFramesLayouts, query.avlTrace?.hierarchies.pre]);

  // Efecto para manejar la inserción de nuevos nodos
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!root || !svgRef.current || !query.toInsert) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Obtenemos el layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Ubicamos al nuevo nodo en el árbol
    const newNode = preLayout ? preLayout.nodes.find(d => d.data.id === query.toInsert) : currentNodes.find(d => d.data.id === query.toInsert);
    if (!newNode) return;

    // Obtenemos el recorrido o ruta desde el nodo raíz hasta el nodo padre del nuevo nodo
    let parentNode: HierarchyNode<HierarchyNodeData<number>> | null = null;
    let pathToParent: HierarchyNode<HierarchyNodeData<number>>[] = [];
    if (newNode.parent !== null) {
      parentNode = newNode.parent;
      pathToParent = preLayout ? preLayout.root.path(parentNode) : root.path(parentNode);
    }

    // Animación de inserción del nuevo nodo con rotaciones
    animateAVLTreeInsert(
      svg,
      treeOffset,
      {
        newNodeId: newNode.data.id,
        parentId: parentNode?.data.id ?? null,
        nodesData: currentNodes,
        linksData,
        positions: nodePositions,
        pathToParent,
        preRotationFrame: preLayout,
        rotations: query.avlTrace?.rotations ?? [],
        frames: avlFramesLayouts
      },
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, linksData, query.toInsert, query.avlTrace, avlFramesLayouts, treeOffset, resetQueryValues, setIsAnimating]);

  // Efecto para manejar la eliminación de un nodo
  useEffect(() => {
    // Verificaciones necesarias para realizar la animación
    if (!prevRoot || !svgRef.current || !query.toDelete) return;

    // Verificación de la estructura de la query del usuario
    if (query.toDelete.length !== 2) return;

    // Selección del elemento SVG a partir de su referencia
    const svg = select(svgRef.current);

    // Determinamos el ID del nodo a eliminar
    const nodeToDeleteId = query.toDelete[0];

    // Ubicamos al nodo a eliminar en el árbol
    const nodeToDelete = prevRoot.descendants().find(d => d.data.id === nodeToDeleteId);
    if (!nodeToDelete) return;

    // Ubicamos el nodo a actualizar en el arbol (si aplica)
    let nodeToUpdate: HierarchyNode<HierarchyNodeData<number>> | null = null;
    if (query.toDelete[1]) {
      nodeToUpdate = prevRoot.descendants().find(d => d.data.id === query.toDelete[1])!;
    }

    // Obtenemos el layout inicial en caso de presentarse rotación
    const preLayout = query.avlTrace && query.avlTrace.hierarchies.pre ? avlFramesLayouts[0] : null;

    // Animación de eliminación del nodo con rotaciones
    animateAVLTreeDelete(
      svg,
      treeOffset,
      {
        prevRootNode: prevRoot,
        nodeToDelete,
        nodeToUpdate,
        remainingNodesData: currentNodes,
        remainingLinksData: linksData,
        positions: nodePositions,
        preRotationFrame: preLayout,
        rotations: query.avlTrace!.rotations,
        frames: avlFramesLayouts
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

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Grupo contenedor de los valores de la secuencia de recorrido
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Ubicamos al nodo a buscar en el árbol
    const nodeToSearch = currentNodes.find(d => d.data.value === query.toSearch);
    if (!nodeToSearch) return;

    // Ruta de búsqueda del nodo
    const pathToNode = root.path(nodeToSearch);

    // Animación de búsqueda del nodo
    animateSearchNode(treeG, seqG, nodeToSearch.data.id, pathToNode, resetQueryValues, setIsAnimating);
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

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