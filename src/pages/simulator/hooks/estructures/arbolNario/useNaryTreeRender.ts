// src/hooks/estructures/arbolNario/useNaryTreeRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

/* ───────────────────────── Utilidades genéricas n-ario ─────────────────────────
   - Constantes de layout/medidas
   - Dibujo de secuencia de recorrido
   - Animación de recorridos y de limpieza total
   - Path curvo por defecto para links
-------------------------------------------------------------------------------*/
import {
  SVG_NARY_VALUES,
  drawTraversalSequence,
  animateTreeTraversal,
  animateClearTree,
  curvedLinkPath,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ───────────────────────── Dibujo/animaciones específicas n-ario ─────────────────────────
   - drawNaryTreeNodes: ahora usa la skin “neo” (anillo+gradiente+sombra)
   - drawTreeLinks: acepta opciones de estilo (color/grosor/pathBuilder)
   - ensureNarySkinDefs: inyecta <defs> (gradiente + sombra) en el <svg>
-------------------------------------------------------------------------------*/
import {
  ensureNarySkinDefs,
  drawNaryTreeNodes,
  drawTreeLinks,
  animateNaryCreateRoot,
  animateNaryInsertChild,
  animateNaryDeleteNode,
  animateNaryMoveNode,
  animateNaryUpdateValue,
  animateNarySearchPath,
} from "../../../../../shared/utils/draw/naryTreeDrawActions";

/* ───────────────────────── helpers locales ───────────────────────── */

function cleanupGhostNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  validIds: Set<string>
) {
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

  // Remueve nodos que ya no existen en data
  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const id = (this as SVGGElement).id;
      return !!id && !validIds.has(id);
    })
    .remove();

  // Remueve nodos “transparenteados” por animaciones previas (< 5% opacidad)
  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const sel = d3.select(this);
      const o =
        Number(sel.attr("opacity")) || Number(sel.style("opacity")) || 1;
      return o < 0.05;
    })
    .remove();
}

/* ───────────────────────── Hook principal ───────────────────────── */
export function useNaryTreeRender(
  treeData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_nario">,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Posiciones cacheadas (nodos + secuencia de recorridos)
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets de pintura (árbol y banda de secuencia)
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // D3: raíz jerárquica + nodos actuales (ignorando placeholders)
  const root = useMemo(
    () => (treeData ? d3.hierarchy(treeData) : null),
    [treeData]
  );
  const currentNodes = useMemo(
    () => (root ? root.descendants().filter((d) => !d.data.isPlaceholder) : []),
    [root]
  );

  const prevRoot = usePrevious(root);
  const { setIsAnimating } = useAnimation();

  // Links actuales (ignorando placeholders)
  const linksData: TreeLinkData[] = useMemo(() => {
    if (!root) return [];
    return root.links().reduce<TreeLinkData[]>((acc, link) => {
      if (!link.target.data.isPlaceholder) {
        acc.push({
          sourceId: link.source.data.id,
          targetId: link.target.data.id,
        });
      }
      return acc;
    }, []);
  }, [root]);

  /* ─────────── Render base: layout + capas + dibujo ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    // 1) Layout D3 (coordenadas x/y por nodo)
    const margin = {
      left: SVG_NARY_VALUES.MARGIN_LEFT,
      right: SVG_NARY_VALUES.MARGIN_RIGHT,
      top: SVG_NARY_VALUES.MARGIN_TOP,
      bottom: SVG_NARY_VALUES.MARGIN_BOTTOM,
    };
    const treeLayout = d3
      .tree<HierarchyNodeData<number>>()
      .nodeSize([SVG_NARY_VALUES.NODE_SPACING, SVG_NARY_VALUES.LEVEL_SPACING]);
    treeLayout(root);

    // 2) Dimensiones del SVG con prevRoot para transiciones suaves
    const prevNodes = prevRoot?.descendants() ?? currentNodes;
    const [minX, maxX] = d3.extent([...prevNodes, ...currentNodes], (d) => d.x);
    const [minY, maxY] = d3.extent([...prevNodes, ...currentNodes], (d) => d.y);

    const treeWidth = maxX! - minX! + margin.left + margin.right;
    const n = currentNodes.length;
    const seqContent = n > 0 ? (n - 1) * SVG_NARY_VALUES.SEQUENCE_PADDING : 0;
    const seqWidth = seqContent + margin.left + margin.right;

    const width = Math.max(treeWidth, seqWidth);
    const height = maxY! - minY! + margin.top + margin.bottom;

    // 3) SVG base
    const svg = d3
      .select(svgRef.current)
      .attr(
        "height",
        height +
          SVG_NARY_VALUES.SEQUENCE_PADDING +
          SVG_NARY_VALUES.SEQUENCE_HEIGHT
      )
      .attr("width", width);

    // 3.1) Inyecta <defs> de la skin (gradiente + sombra) — ¡importante hacerlo una vez!
    ensureNarySkinDefs(svg);

    // 4) Offsets para centrar el contenido dibujado
    treeOffset.x = margin.left - minX!;
    treeOffset.y = margin.top - minY!;

    // 5) Capas
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // 6) Contenedor de secuencia (recorridos)
    seqOffset.x = margin.left;
    seqOffset.y =
      treeOffset.y +
      (maxY! - minY!) +
      SVG_NARY_VALUES.SEQUENCE_PADDING +
      SVG_NARY_VALUES.SEQUENCE_HEIGHT;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // 7) Dibujo base: nodos (skin “neo”) + enlaces (estilo sobrio)
    drawNaryTreeNodes(nodesLayer, currentNodes, nodePositions);

    drawTreeLinks(linksLayer, linksData, nodePositions, {
      nodeRadius: SVG_NARY_VALUES.NODE_RADIUS,
      pathBuilder: curvedLinkPath,
      strokeColor: "#3b4252",
      strokeWidth: 2,
    });

    // 8) Limpieza de “fantasmas” y orden de capas
    const validIds = new Set(currentNodes.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();
  }, [root, currentNodes, prevRoot, linksData]);

  /* ─────────── Crear raíz ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toCreateRoot == null) return;
    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    animateNaryCreateRoot(
      treeG,
      root.data.id,
      resetQueryValues,
      setIsAnimating
    );
  }, [root, query.toCreateRoot, resetQueryValues, setIsAnimating]);

  /* ─────────── Insertar hijo ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const args = query.toInsertChild;
    if (!Array.isArray(args) || args.length === 0) return;

    const [parentId, value] = args;
    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Encuentra el nodo recién insertado por (valor + padre)
    const inserted = currentNodes.find(
      (d) => d.data.value === value && d.parent?.data.id === parentId
    );
    if (!inserted) return;

    const parentNode = currentNodes.find((d) => d.data.id === parentId) ?? null;
    const pathToParent = parentNode ? root.path(parentNode) : [];

    animateNaryInsertChild(
      treeG,
      {
        newNodeId: inserted.data.id,
        parentId: parentNode?.data.id ?? null,
        nodesData: currentNodes,
        linksData,
        pathToParent,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [
    root,
    currentNodes,
    linksData,
    query.toInsertChild,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────── Eliminar subárbol ─────────── */
  useEffect(() => {
    if (!prevRoot || !svgRef.current || !query.toDeleteNode) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const nodeToDelete = prevRoot
      .descendants()
      .find((d) => d.data.id === query.toDeleteNode);
    if (!nodeToDelete) return;

    animateNaryDeleteNode(
      treeG,
      {
        prevRootNode: prevRoot,
        nodeToDelete,
        remainingNodesData: currentNodes,
        remainingLinksData: linksData,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );

    // Limpieza tardía de nodos “apagados”
    setTimeout(() => {
      const validIds = new Set(currentNodes.map((d) => d.data.id));
      const svg2 = d3.select(svgRef.current!);
      const treeG2 = svg2.select<SVGGElement>("g.tree-container");
      cleanupGhostNodes(treeG2, validIds);
    }, 0);
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toDeleteNode,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────── Mover subárbol ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const args = query.toMoveNode;
    if (!Array.isArray(args) || args.length === 0) return;
    const [movedId, newParentId] = args;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    // Viejo padre (si existía) usando el frame previo
    let oldParentId: string | null | undefined = null;
    if (prevRoot) {
      const prevNode = prevRoot
        .descendants()
        .find((d) => d.data.id === movedId);
      oldParentId = prevNode?.parent?.data.id;
    }

    animateNaryMoveNode(
      treeG,
      svg,
      {
        movedNodeId: movedId,
        oldParentId: oldParentId ?? undefined,
        newParentId,
        nodesData: currentNodes,
        linksData,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toMoveNode,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────── Actualizar valor ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const args = query.toUpdateValue;
    if (!Array.isArray(args) || args.length === 0) return;

    const [id] = args;
    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    animateNaryUpdateValue(treeG, id, resetQueryValues, setIsAnimating);
  }, [query.toUpdateValue, resetQueryValues, setIsAnimating]);

  /* ─────────── Búsqueda (por valor) ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toSearch == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const nodeToSearch = currentNodes.find(
      (d) => d.data.value === query.toSearch
    );
    if (!nodeToSearch) return;

    const pathToNode = root.path(nodeToSearch);

    animateNarySearchPath(
      svg,
      treeG,
      pathToNode,
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

  /* ─────────── Recorridos (pre/post/level) ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const traversalType =
      query.toGetPreOrder.length > 0
        ? "pre"
        : query.toGetPostOrder.length > 0
          ? "post"
          : query.toGetLevelOrder.length > 0
            ? "level"
            : null;

    if (!traversalType) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    let nodes: TraversalNodeType[] = [];
    if (traversalType === "pre") nodes = query.toGetPreOrder;
    else if (traversalType === "post") nodes = query.toGetPostOrder;
    else if (traversalType === "level") nodes = query.toGetLevelOrder;

    // Render de la secuencia (texto que “vuela”)
    drawTraversalSequence(seqG, nodes, {
      nodePositions,
      seqPositions,
      treeOffset,
      seqOffset,
    });

    // Animación de recorrido: sin alterar fill de los nodos (stroke+pulse)
    animateTreeTraversal(
      treeG,
      seqG,
      nodes,
      seqPositions,
      resetQueryValues,
      setIsAnimating,
      {
        style: "preserve-fill",
        strokeColor: "#8aa0ff",
        pulse: true,
        bounce: true,
      }
    );
  }, [
    query.toGetPreOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ─────────── Limpieza total ─────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    animateClearTree(
      treeG,
      seqG,
      { nodePositions, seqPositions },
      resetQueryValues,
      setIsAnimating
    );

    // Limpia overlays auxiliares
    svg.selectAll("g.nary-search-overlay").remove();
    svg.selectAll("g.nary-move-overlay").remove();
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}
