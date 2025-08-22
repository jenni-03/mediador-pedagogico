// src/hooks/estructures/arbolRB/useRBTreeRender.ts
import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { SVG_BINARY_TREE_VALUES } from "../../../../../shared/constants/consts";
import {
  animateClearTree,
  animateTreeTraversal,
  drawTraversalSequence,
} from "../../../../../shared/utils/draw/drawActionsUtilities";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

// Draws/animaciones específicas RB
import {
  drawRBTreeNodes,
  drawTreeLinks,
  animateRBInsertNode,
  animateRBDeleteNode,
} from "../../../../../shared/utils/draw/RedBlackTreeDrawActions";

/* ╭───────────────────────────
   │ Tipos de pasos didácticos (opcionales)
   ╰─────────────────────────── */
type RbEvent =
  | { kind: "compare"; nodeId: string; with: string; dir: "left" | "right" }
  | { kind: "traverse"; to: string }
  | {
      kind: "violation";
      type: "double-red" | "black-height";
      pivotId: string;
      uncleId?: string;
    }
  | { kind: "recolor"; id: string; to: "red" | "black" }
  | { kind: "rotate"; dir: "left" | "right"; pivotId: string; childId?: string }
  | { kind: "finish" };

function asRbEvents(x: unknown): RbEvent[] | null {
  if (!Array.isArray(x)) return null;
  return x as RbEvent[];
}

/* ╭───────────────────────────
   │ Helpers visuales locales
   ╰─────────────────────────── */

function ensureDefs(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  let defs = svg.select<SVGDefsElement>("defs");
  if (defs.empty()) defs = svg.append("defs");

  // Glow suave para resaltar (no cambia fill)
  let glow = defs.select<SVGFilterElement>("#softGlow");
  if (glow.empty()) {
    glow = defs
      .append<SVGFilterElement>("filter")
      .attr("id", "softGlow")
      .attr("x", "-40%")
      .attr("y", "-40%")
      .attr("width", "180%")
      .attr("height", "180%");
    glow
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", 2.5)
      .attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
  }

  // Punta de flecha
  let marker = defs.select<SVGMarkerElement>("#arrowHeadRB");
  if (marker.empty()) {
    marker = defs
      .append<SVGMarkerElement>("marker")
      .attr("id", "arrowHeadRB")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 8)
      .attr("refY", 5)
      .attr("markerUnits", "strokeWidth")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto-start-reverse");
    marker
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#8aa0ff");
  }
}

function curvifyLinks(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  nodePositions: Map<string, { x: number; y: number }>
) {
  treeG
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d: any) => `link-${d.sourceId}-${d.targetId}`)
    .select<SVGPathElement>("path.tree-link")
    .attr("d", (d) => {
      const s = nodePositions.get(d.sourceId)!;
      const t = nodePositions.get(d.targetId)!;
      const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
      const midY = (s.y + t.y) / 2;
      return `M${s.x},${s.y + r} C ${s.x},${midY} ${t.x},${midY} ${t.x},${t.y - r}`;
    })
    .attr("stroke-linecap", "round");
}

/** Limpieza defensiva: elimina nodos “fantasma” dentro de nodes-layer */
function cleanupGhostNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  validIds: Set<string>
) {
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

  nodesLayer
    .selectAll<SVGGElement, unknown>("g.node")
    .filter(function () {
      const id = (this as SVGGElement).id;
      return !!id && !validIds.has(id);
    })
    .remove();

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

/* ── Animación de búsqueda (preserva fill de cada nodo) ── */
async function animateRBSearch(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.HierarchyNode<HierarchyNodeData<number>>[],
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number },
  resetQueryValues: () => void,
  setIsAnimating: (b: boolean) => void
) {
  if (path.length === 0) {
    resetQueryValues();
    return;
  }

  setIsAnimating(true);

  let overlay = svg.select<SVGGElement>("g.search-overlay");
  if (overlay.empty())
    overlay = svg.append("g").attr("class", "search-overlay");
  overlay.attr("data-running", "1").style("pointer-events", "none").raise();
  overlay.selectAll("*").remove();

  const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const waitEnd = (t: d3.Transition<any, any, any, any>) =>
    new Promise<void>((resolve) =>
      t.on("end", resolve).on("interrupt", resolve)
    );

  try {
    for (let i = 0; i < path.length; i++) {
      const id = path[i].data.id;
      const p = nodePositions.get(id);
      if (!p) continue;

      // Resalte suave
      const circle = treeG.select<SVGCircleElement>(`g#${id} circle`);
      if (circle.empty()) continue;
      circle.interrupt();
      await waitEnd(
        circle
          .transition()
          .duration(140)
          .attr("filter", "url(#softGlow)")
          .attr("stroke", "#8aa0ff")
          .attr("stroke-width", 2)
      );

      // Pulso
      const ring = overlay
        .append("circle")
        .attr("cx", treeOffset.x + p.x)
        .attr("cy", treeOffset.y + p.y)
        .attr("r", r + 2)
        .attr("fill", "none")
        .attr("stroke", "#8aa0ff")
        .attr("stroke-width", 2)
        .style("opacity", 0.9);

      await waitEnd(
        ring
          .transition()
          .duration(420)
          .attr("r", r + 12)
          .style("opacity", 0)
          .remove()
      );

      // Flecha al siguiente paso
      if (i < path.length - 1) {
        const q = nodePositions.get(path[i + 1].data.id)!;
        const arrow = overlay
          .append("path")
          .attr(
            "d",
            `M ${treeOffset.x + p.x} ${treeOffset.y + p.y} L ${treeOffset.x + q.x} ${treeOffset.y + q.y}`
          )
          .attr("stroke", "#8aa0ff")
          .attr("stroke-width", 1.6)
          .attr("fill", "none")
          .attr("marker-end", "url(#arrowHeadRB)")
          .style("opacity", 0);

        await waitEnd(
          arrow
            .transition()
            .duration(220)
            .style("opacity", 1)
            .transition()
            .duration(160)
            .style("opacity", 0)
            .remove()
        );
      }

      // Volver a stroke normal
      await waitEnd(
        circle
          .transition()
          .duration(140)
          .attr("filter", null)
          .attr("stroke", "#9aa1b5")
          .attr("stroke-width", 1)
      );

      await sleep(160);
    }
  } finally {
    overlay.attr("data-running", "0").selectAll("*").remove();
    setIsAnimating(false);
    resetQueryValues();
  }
}

/* ── Player didáctico (opcional) ── */
async function playRbSteps(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  steps: RbEvent[],
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number },
  speed = 1
) {
  if (steps.length === 0) return;

  let layer = svg.select<SVGGElement>("g.rb-steps-overlay");
  if (layer.empty()) layer = svg.append("g").attr("class", "rb-steps-overlay");

  const counter = layer
    .selectAll<SVGTextElement, number>("text.step-counter")
    .data([0]);
  counter
    .enter()
    .append("text")
    .attr("class", "step-counter")
    .attr("x", 16)
    .attr("y", 20)
    .style("font-size", "12px")
    .style("font-weight", 700)
    .attr("fill", "#9aa4b2")
    .merge(counter as any);

  const wait = (ms: number) =>
    new Promise((res) => setTimeout(res, ms / speed));
  const glowOn = (id: string, color = "#8aa0ff") =>
    treeG
      .select<SVGCircleElement>(`g#${id} circle`)
      .attr("filter", "url(#softGlow)")
      .attr("stroke", color)
      .attr("stroke-width", 2);
  const glowOff = (id: string) =>
    treeG
      .select<SVGCircleElement>(`g#${id} circle`)
      .attr("filter", null)
      .attr("stroke", "#9aa1b5")
      .attr("stroke-width", 1);

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    svg.selectAll<SVGGElement, unknown>("g.rb-steps-overlay *").remove();
    treeG
      .selectAll<SVGTextElement, unknown>("text.step-counter")
      .text(`paso ${i + 1}/${steps.length}`);

    if (s.kind === "compare") {
      const a = nodePositions.get(s.nodeId);
      const b = nodePositions.get(s.with);
      if (a && b) {
        glowOn(s.nodeId);
        glowOn(s.with);
        svg
          .select<SVGGElement>("g.rb-steps-overlay")
          .append("path")
          .attr(
            "d",
            `M ${treeOffset.x + a.x} ${treeOffset.y + a.y} L ${treeOffset.x + b.x} ${treeOffset.y + b.y}`
          )
          .attr("stroke", "#8aa0ff")
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("marker-end", "url(#arrowHeadRB)")
          .style("opacity", 0)
          .transition()
          .duration(180 / speed)
          .style("opacity", 1);
      }
      await wait(650);
      glowOff(s.nodeId);
      glowOff(s.with);
    } else if (s.kind === "traverse") {
      const p = nodePositions.get(s.to);
      if (p) {
        glowOn(s.to);
        await wait(500);
        glowOff(s.to);
      } else {
        await wait(250);
      }
    } else if (s.kind === "violation") {
      const p = nodePositions.get(s.pivotId);
      if (p) {
        glowOn(s.pivotId, "#ff6b6b");
        svg
          .select<SVGGElement>("g.rb-steps-overlay")
          .append("text")
          .attr("x", treeOffset.x + p.x)
          .attr(
            "y",
            treeOffset.y + p.y - (SVG_BINARY_TREE_VALUES.NODE_RADIUS + 22)
          )
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", 800)
          .attr("fill", "#ff6b6b")
          .text(
            s.type === "double-red" ? "violación: 2 rojos" : "violación: bh"
          );
      }
      await wait(900);
      glowOff(s.pivotId);
      if (s.uncleId) glowOff(s.uncleId);
    } else if (s.kind === "recolor") {
      const c = treeG.select<SVGCircleElement>(`g#${s.id} circle`);
      if (!c.empty()) {
        glowOn(s.id);
        await c
          .transition()
          .duration(350 / speed)
          .attr("fill", s.to === "red" ? "#e25555" : "#2b2f39")
          .end();
        await wait(150);
        glowOff(s.id);
      } else {
        await wait(150);
      }
    } else if (s.kind === "rotate") {
      const p = nodePositions.get(s.pivotId);
      if (p) {
        glowOn(s.pivotId, "#f4bf50");
        svg
          .select<SVGGElement>("g.rb-steps-overlay")
          .append("text")
          .attr("x", treeOffset.x + p.x)
          .attr(
            "y",
            treeOffset.y + p.y - (SVG_BINARY_TREE_VALUES.NODE_RADIUS + 24)
          )
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("font-weight", 800)
          .attr("fill", "#f4bf50")
          .text(s.dir === "left" ? "rotación izquierda" : "rotación derecha");
      }
      await wait(850);
      glowOff(s.pivotId);
    } else if (s.kind === "finish") {
      await wait(250);
    }
  }

  svg.selectAll<SVGGElement, unknown>("g.rb-steps-overlay *").remove();
}

/* ╭───────────────────────────
   │ Hook principal
   ╰─────────────────────────── */
export function useRBTreeRender(
  treeData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_rb">,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Posiciones en memoria
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Raíz jerárquica y nodos actuales (sin placeholders)
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

  // Enlaces actuales (sin placeholders)
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

  /* ───────────────────────── Render base: layout + nodos + enlaces ───────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;

    const margin = {
      left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT,
      right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
      top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
      bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
    };

    const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
    const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;

    // Layout
    const treeLayout = d3
      .tree<HierarchyNodeData<number>>()
      .nodeSize([nodeSpacing, levelSpacing]);
    treeLayout(root);

    const prevNodes = prevRoot?.descendants() ?? currentNodes;
    const [minX, maxX] = d3.extent([...prevNodes, ...currentNodes], (d) => d.x);
    const [minY, maxY] = d3.extent([...prevNodes, ...currentNodes], (d) => d.y);

    const treeWidth = maxX! - minX! + margin.left + margin.right;
    const n = currentNodes.length;
    const seqContent =
      n > 0 ? (n - 1) * SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING : 0;
    const seqWidth = seqContent + margin.left + margin.right;

    const width = Math.max(treeWidth, seqWidth);
    const height = maxY! - minY! + margin.top + margin.bottom;

    // SVG base
    const svg = d3
      .select(svgRef.current)
      .attr(
        "height",
        height +
          SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING +
          SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT
      )
      .attr("width", width);

    ensureDefs(svg);

    // Offsets
    treeOffset.x = margin.left - minX!;
    treeOffset.y = margin.top - minY!;

    // Contenedores y capas
    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");
    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // Contenedor de secuencia
    seqOffset.x = margin.left;
    seqOffset.y =
      treeOffset.y +
      (maxY! - minY!) +
      SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING +
      SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // Dibujo base
    drawRBTreeNodes(nodesLayer, currentNodes, nodePositions);
    drawTreeLinks(linksLayer, linksData, nodePositions);
    curvifyLinks(treeG, linksData, nodePositions);

    // Limpieza “fantasmas” + orden de capas
    const validIds = new Set(currentNodes.map((d) => d.data.id));
    cleanupGhostNodes(treeG, validIds);
    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();
  }, [root, currentNodes, prevRoot, linksData]);

  /* ───────────────────────── Inserción (RB) ───────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const inserted = currentNodes.find((d) => d.data.value === query.toInsert);
    if (!inserted) return;

    let parentNode: d3.HierarchyNode<HierarchyNodeData<number>> | null = null;
    let pathToParent: d3.HierarchyNode<HierarchyNodeData<number>>[] = [];
    if (inserted.parent) {
      parentNode = inserted.parent;
      pathToParent = root.path(parentNode);
    }

    animateRBInsertNode(
      treeG,
      svg,
      {
        newNodeId: inserted.data.id,
        parentId: parentNode?.data.id ?? null,
        nodesData: currentNodes,
        linksData,
        pathToParent,
      },
      nodePositions,
      treeOffset,
      query.rbFix ?? null,
      resetQueryValues,
      setIsAnimating
    );
  }, [
    root,
    currentNodes,
    linksData,
    query.toInsert,
    query.rbFix,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────────────────────── Eliminación (RB) ───────────────────────── */
  useEffect(() => {
    if (!prevRoot || !svgRef.current || query.toDelete == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const nodeToDelete = prevRoot
      .descendants()
      .find((d) => d.data.value === query.toDelete);
    if (!nodeToDelete) return;

    const nodeToUpdate =
      currentNodes.find((d) => d.data.id === nodeToDelete.data.id) ?? null;

    animateRBDeleteNode(
      treeG,
      svg,
      {
        prevRootNode: prevRoot,
        nodeToDelete,
        nodeToUpdate,
        remainingNodesData: currentNodes,
        remainingLinksData: linksData,
      },
      nodePositions,
      treeOffset,
      query.rbFix ?? null,
      resetQueryValues,
      setIsAnimating
    );

    // Limpieza tardía de posibles restos
    setTimeout(() => {
      const validIds = new Set(currentNodes.map((d) => d.data.id));
      cleanupGhostNodes(treeG, validIds);
    }, 0);
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toDelete,
    query.rbFix,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────────────────────── Búsqueda ───────────────────────── */
  useEffect(() => {
    if (!root || !svgRef.current || !query.toSearch) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const nodeToSearch = currentNodes.find(
      (d) => d.data.value === query.toSearch
    );
    if (!nodeToSearch) return;

    const pathToNode = root.path(nodeToSearch);

    animateRBSearch(
      svg,
      treeG,
      pathToNode,
      nodePositions,
      { x: treeOffset.x, y: treeOffset.y },
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

  /* ───────────────────────── Recorridos ───────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;

    const traversalType =
      query.toGetPreOrder.length > 0
        ? "pre"
        : query.toGetInOrder.length > 0
          ? "in"
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
    else if (traversalType === "in") nodes = query.toGetInOrder;
    else if (traversalType === "post") nodes = query.toGetPostOrder;
    else if (traversalType === "level") nodes = query.toGetLevelOrder;

    // Render de la secuencia (texto que “vuela”)
    drawTraversalSequence(seqG, nodes, {
      nodePositions,
      seqPositions,
      treeOffset,
      seqOffset,
    });

    // Animación del recorrido (no alterar fill de RB)
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
    query.toGetInOrder,
    query.toGetPreOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
  ]);

  /* ───────────────────────── Player de pasos (didáctico) ───────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const steps = asRbEvents((query as any).rbSteps);
    if (!steps || steps.length === 0) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    playRbSteps(svg, treeG, steps, nodePositions, treeOffset, 1.0).then(() => {
      /* noop */
    });
  }, [(query as any).rbSteps]);

  /* ───────────────────────── Limpieza ───────────────────────── */
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

    // Limpia overlays no ligados a data
    svg.selectAll("g.rb-steps-overlay").remove();
    svg.selectAll("g.search-overlay").remove();
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}
