// src/hooks/estructures/arbolAVL/useAVLTreeRender.ts
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
  drawTreeLinks,
  drawTreeNodes,
  repositionTreeNodes,
} from "../../../../../shared/utils/draw/drawActionsUtilities";
import {
  animateDeleteNode,
  animateInsertNode,
  animateSearchNode,
} from "../../../../../shared/utils/draw/BinaryTreeDrawActions";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

/* ───────────── Helpers sólo-para-AVL (no tocan binario) ───────────── */
// NUEVO: filtro de sombra para chips
function ensureChipShadowDef(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
) {
  // defs: Selection de <defs>
  let defs: d3.Selection<SVGDefsElement, unknown, null, undefined> =
    svg.select<SVGDefsElement>("defs");

  if (defs.empty()) {
    defs = svg.append<SVGDefsElement>("defs");
  }

  // filtro: Selection de <filter>
  let f: d3.Selection<SVGFilterElement, unknown, null, undefined> =
    defs.select<SVGFilterElement>("#chipShadow");

  if (f.empty()) {
    f = defs
      .append<SVGFilterElement>("filter")
      .attr("id", "chipShadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    // feDropShadow: Selection de <feDropShadow>
    f.append<SVGFEDropShadowElement>("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1)
      .attr("stdDeviation", 1.2)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.35);
  }
}

// ───────── Panel 2×2 compacto para bf / h ─────────
function renderAvlMetricsBadges(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: d3.HierarchyNode<HierarchyNodeData<number>>[]
) {
  const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;

  // Layout más pequeño
  const PANEL_OFFSET_Y = r + 2; // distancia bajo el nodo
  const ROW_H_LABEL = 7; // ↓ antes 10
  const ROW_H_VALUE = 12; // ↓ antes 14
  const PAD_X = 6; // ↓ antes 8
  const CORNER = 7; // ↓ esquinas un poco

  // mínimos (ligeramente más chicos) + pequeño extra al ancho total
  const MIN_COL_BF = 26; // ↓ antes 30
  const MIN_COL_H = 24; // ↓ antes 28
  const EXTRA_W = 2; // ↓ antes 4

  // Colores
  const COLOR_BG = "#12161f";
  const COLOR_STK = "#39404d";
  const COLOR_LBL = "#9aa4b2";
  const COLOR_HVAL = "#8aa0ff";

  const bfColor = (bf: number) => {
    const a = Math.abs(bf ?? 0);
    if (a <= 1) return "#71c562";
    if (a === 2) return "#f4bf50";
    return "#e25555";
  };

  treeG
    .selectAll<SVGGElement, d3.HierarchyNode<HierarchyNodeData<number>>>(
      "g.node"
    )
    .data(nodes, (d: any) => d.data.id)
    .each(function (d) {
      const g = d3.select(this);

      // Panel enter
      const panelSel = g.selectAll<SVGGElement, any>("g.avl-panel").data([d]);
      const panelEnter = panelSel
        .enter()
        .append("g")
        .attr("class", "avl-panel")
        .style("pointer-events", "none");

      // Fondo
      panelEnter
        .append("rect")
        .attr("class", "panel-bg")
        .attr("rx", CORNER)
        .attr("ry", CORNER)
        .attr("fill", COLOR_BG)
        .attr("stroke", COLOR_STK)
        .attr("stroke-width", 0.8) // más fino
        .attr("filter", "url(#chipShadow)");

      // Separadores
      panelEnter
        .append("line")
        .attr("class", "sep-h")
        .attr("stroke", COLOR_STK)
        .attr("stroke-width", 0.8);
      panelEnter
        .append("line")
        .attr("class", "sep-v")
        .attr("stroke", COLOR_STK)
        .attr("stroke-width", 0.8);

      // Textos (etiquetas)
      panelEnter
        .append("text")
        .attr("class", "lbl-bf")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "9px") // ↓ antes 10
        .style("font-weight", 600)
        .attr("fill", COLOR_LBL)
        .text("bf");
      panelEnter
        .append("text")
        .attr("class", "lbl-h")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "9px") // ↓ antes 10
        .style("font-weight", 600)
        .attr("fill", COLOR_LBL)
        .text("h");

      // Textos (valores)
      panelEnter
        .append("text")
        .attr("class", "val-bf")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px") // ↓ antes 11
        .style("font-weight", 700);
      panelEnter
        .append("text")
        .attr("class", "val-h")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("font-size", "10px") // ↓ antes 11
        .style("font-weight", 700)
        .attr("fill", COLOR_HVAL);

      const panel = panelEnter
        .merge(panelSel as any)
        .attr("transform", `translate(0, ${PANEL_OFFSET_Y})`);

      // Valores seguros
      const bfVal = typeof d.data.bf === "number" ? String(d.data.bf) : "–";
      const hVal =
        typeof d.data.height === "number" ? String(d.data.height) : "–";

      // Escribe valores (para medir)
      panel
        .select<SVGTextElement>("text.val-bf")
        .attr("fill", bfColor(Number(d.data.bf ?? 0)))
        .text(bfVal);
      panel.select<SVGTextElement>("text.val-h").text(hVal);

      // Medidas de textos
      const wLblBf =
        panel.select<SVGTextElement>("text.lbl-bf").node()?.getBBox().width ??
        0;
      const wLblH =
        panel.select<SVGTextElement>("text.lbl-h").node()?.getBBox().width ?? 0;
      const wValBf =
        panel.select<SVGTextElement>("text.val-bf").node()?.getBBox().width ??
        0;
      const wValH =
        panel.select<SVGTextElement>("text.val-h").node()?.getBBox().width ?? 0;

      const col1W = Math.max(MIN_COL_BF, Math.max(wLblBf, wValBf) + PAD_X * 2);
      const col2W = Math.max(MIN_COL_H, Math.max(wLblH, wValH) + PAD_X * 2);
      const W = col1W + col2W + EXTRA_W;
      const H = ROW_H_LABEL + ROW_H_VALUE + 1; // compactado

      // Fondo centrado
      panel
        .select<SVGRectElement>("rect.panel-bg")
        .attr("x", -W / 2)
        .attr("y", -1) // levanta 1px el contenido
        .attr("width", W)
        .attr("height", H);

      // Separadores
      const ySep = ROW_H_LABEL;
      const xSep = -W / 2 + col1W;

      panel
        .select<SVGLineElement>("line.sep-h")
        .attr("x1", -W / 2)
        .attr("x2", W / 2)
        .attr("y1", ySep)
        .attr("y2", ySep);

      panel
        .select<SVGLineElement>("line.sep-v")
        .attr("x1", xSep)
        .attr("x2", xSep)
        .attr("y1", -1)
        .attr("y2", H - 1);

      // Centros de celdas
      const c1x = -W / 2 + col1W / 2;
      const c2x = W / 2 - col2W / 2;
      const yLbl = ROW_H_LABEL / 2;
      const yVal = ROW_H_LABEL + ROW_H_VALUE / 2; // compensa la reducción

      // Posiciona textos
      panel
        .select<SVGTextElement>("text.lbl-bf")
        .attr("x", c1x)
        .attr("y", yLbl);
      panel.select<SVGTextElement>("text.lbl-h").attr("x", c2x).attr("y", yLbl);
      panel
        .select<SVGTextElement>("text.val-bf")
        .attr("x", c1x)
        .attr("y", yVal);
      panel.select<SVGTextElement>("text.val-h").attr("x", c2x).attr("y", yVal);
    });
}

// ───────────────── Badge de rotación con callout ─────────────────
function showRotationHint(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  rotation: BaseQueryOperations<"arbol_avl">["rotation"],
  nodePositions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number }
) {
  // Limpia el anterior
  let overlay = svg.select<SVGGElement>("g.overlay-top");
  if (overlay.empty()) overlay = svg.append("g").attr("class", "overlay-top");
  overlay.selectAll("g.avl-rotation-hint").remove();
  if (!rotation) return;

  const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
  const pivotPos = nodePositions.get(rotation.pivotId);
  if (!pivotPos) return;

  // Colores y medidas
  const BG = "#1b2330";
  const STK = "#ff6b6b";
  const TXT1 = "#f4a6a6"; // subtítulo
  const TXT2 = "#ffd5d5"; // tipo (LL/LR/RR/RL)

  const PAD_X = 8;
  const PAD_Y = 6;
  const RND = 10;
  const H_MIN = 32; // alto mínimo de la píldora

  // Lado preferido según tipo (más despejado visualmente)
  const heavyLeft = rotation.type.startsWith("L"); // LL o LR
  const dx = heavyLeft ? -(r + 44) : r + 44; // a la izquierda o derecha del pivote
  const dy = -r - 8; // un poco por encima

  // Grupo principal, anclado cerca del pivote
  const g = overlay
    .append("g")
    .attr("class", "avl-rotation-hint")
    .attr(
      "transform",
      `translate(${treeOffset.x + pivotPos.x + dx}, ${treeOffset.y + pivotPos.y + dy})`
    )
    .style("opacity", 0)
    .attr("filter", "url(#chipShadow)"); // reutilizamos la sombra

  // Texto: 2 líneas (subtítulo + tipo)
  const textG = g.append("g").attr("class", "txt");
  textG
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("y", -4)
    .style("font-size", "10px")
    .style("font-weight", 600)
    .attr("fill", TXT1)
    .text("rotación");

  textG
    .append("text")
    .attr("class", "kind")
    .attr("text-anchor", "middle")
    .attr("y", 12)
    .style("font-size", "13px")
    .style("font-weight", 800)
    .attr("fill", TXT2)
    .text(rotation.type);

  // Medidas del bloque de texto para dibujar el fondo
  const bb = (textG.node() as SVGGElement).getBBox();
  const W = Math.max(48, bb.width + PAD_X * 2);
  const H = Math.max(H_MIN, bb.height + PAD_Y * 2);

  // Fondo (antes del texto)
  g.insert("rect", ".txt")
    .attr("class", "badge-bg")
    .attr("x", -W / 2)
    .attr("y", -H / 2)
    .attr("width", W)
    .attr("height", H)
    .attr("rx", RND)
    .attr("ry", RND)
    .attr("fill", BG)
    .attr("stroke", STK)
    .attr("stroke-width", 1);

  // Conector (pequeña “cola” que apunta al pivote)
  // Vector desde el centro del badge hacia el pivote (en coords del grupo)
  const vx = -dx,
    vy = -dy;
  const len = Math.hypot(vx, vy) || 1;
  const ux = (vx / len) * 10; // 10px de longitud de cola
  const uy = (vy / len) * 10;

  g.append("path")
    .attr("d", `M 0 ${H / 2} L ${ux} ${H / 2 + uy}`)
    .attr("fill", "none")
    .attr("stroke", STK)
    .attr("stroke-width", 1.2);

  // Animación: pop-in + fade-out
  g.attr("transform", function () {
    // pequeña escala inicial para efecto pop
    return `translate(${treeOffset.x + pivotPos.x + dx}, ${treeOffset.y + pivotPos.y + dy}) scale(0.92)`;
  })
    .transition()
    .duration(200)
    .style("opacity", 1)
    .attr(
      "transform",
      `translate(${treeOffset.x + pivotPos.x + dx}, ${treeOffset.y + pivotPos.y + dy}) scale(1)`
    )
    .transition()
    .delay(1400)
    .duration(280)
    .style("opacity", 0)
    .remove();

  // Pequeño “flash” en el pivote (opcional)
  const flash = (id: string) => {
    const sel = treeG.select<SVGCircleElement>(`g#${id} circle`);
    if (sel.empty()) return;
    const original = sel.attr("fill");
    sel
      .transition()
      .duration(120)
      .attr("fill", SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR)
      .transition()
      .delay(700)
      .duration(250)
      .attr("fill", original);
  };
  flash(rotation.pivotId);
  if (rotation.childId) flash(rotation.childId);

  // Asegura que el overlay quede arriba de todo
  overlay.raise();
}

/* ─────────────────────────────────────────────────────────────────────────── */

export function useAVLTreeRender(
  treeData: HierarchyNodeData<number> | null,
  query: BaseQueryOperations<"arbol_avl">,
  resetQueryValues: () => void
) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Posiciones de nodos y de secuencia (mismo patrón que binario)
  const nodePositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;
  const seqPositions = useRef(
    new Map<string, { x: number; y: number }>()
  ).current;

  // Offsets de los contenedores
  const treeOffset = useRef({ x: 0, y: 0 }).current;
  const seqOffset = useRef({ x: 0, y: 0 }).current;

  // Raíz jerárquica D3
  const root = useMemo(
    () => (treeData ? d3.hierarchy(treeData) : null),
    [treeData]
  );

  // Nodos actuales (sin placeholders)
  const currentNodes = useMemo(
    () => (root ? root.descendants().filter((d) => !d.data.isPlaceholder) : []),
    [root]
  );

  // Estado previo (para delete)
  const prevRoot = usePrevious(root);

  // Control de animación global
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

  // Render base (layout + nodos + enlaces)
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const NUDGE_X = 28;

    // ¿hay un recorrido activo?
    const hasTraversal =
      query.toGetPreOrder.length > 0 ||
      query.toGetInOrder.length > 0 ||
      query.toGetPostOrder.length > 0 ||
      query.toGetLevelOrder.length > 0;

    // padding extra para bajar los números del recorrido
    const TRAV_PAD = 16; // <- ajústalo a gusto (12–24)
    const EXTRA_SEQ_GAP = hasTraversal ? TRAV_PAD : 0;

    const margin = {
      left: SVG_BINARY_TREE_VALUES.MARGIN_LEFT + NUDGE_X,
      right: SVG_BINARY_TREE_VALUES.MARGIN_RIGHT,
      top: SVG_BINARY_TREE_VALUES.MARGIN_TOP,
      bottom: SVG_BINARY_TREE_VALUES.MARGIN_BOTTOM,
    };

    const nodeSpacing = SVG_BINARY_TREE_VALUES.NODE_SPACING;
    const levelSpacing = SVG_BINARY_TREE_VALUES.LEVEL_SPACING;

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

    const svg = d3
      .select(svgRef.current)
      .attr(
        "height",
        height +
          SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING +
          SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT +
          EXTRA_SEQ_GAP // <- más espacio total
      )
      .attr("width", width);

    // offsets árbol
    treeOffset.x = margin.left - minX!;
    treeOffset.y = margin.top - minY!;

    let treeG = svg.select<SVGGElement>("g.tree-container");
    if (treeG.empty()) treeG = svg.append("g").classed("tree-container", true);
    treeG.attr("transform", `translate(${treeOffset.x},${treeOffset.y})`);

    // capas
    let linksLayer = treeG.select<SVGGElement>("g.links-layer");
    if (linksLayer.empty())
      linksLayer = treeG.append("g").attr("class", "links-layer");

    let nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    if (nodesLayer.empty())
      nodesLayer = treeG.append("g").attr("class", "nodes-layer");

    // contenedor de secuencia
    seqOffset.x = margin.left;
    seqOffset.y =
      treeOffset.y +
      (maxY! - minY!) +
      SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING +
      SVG_BINARY_TREE_VALUES.SEQUENCE_HEIGHT;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // NUEVO: sub-grupo con padding vertical
    let seqContentG = seqG.select<SVGGElement>("g.seq-content");
    if (seqContentG.empty()) {
      seqContentG = seqG.append("g").attr("class", "seq-content");
    }
    // aplica el padding (si no hay recorrido, será 0 porque EXTRA_SEQ_GAP=0)
    seqContentG.attr("transform", `translate(0, ${EXTRA_SEQ_GAP})`);

    // dibuja
    drawTreeNodes(nodesLayer, currentNodes, nodePositions);
    drawTreeLinks(linksLayer, linksData, nodePositions);

    ensureChipShadowDef(svg);
    renderAvlMetricsBadges(nodesLayer, currentNodes);

    linksLayer.lower();
    nodesLayer.raise();
    treeG
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .lower();
  }, [
    root,
    currentNodes,
    prevRoot,
    linksData,
    // para que el padding reaccione a inicios/finales de recorrido
    query.toGetPreOrder,
    query.toGetInOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
  ]);

  // Inserción (AVL): si hubo rotación NO usamos animateInsertNode
  useEffect(() => {
    if (!root || !svgRef.current || query.toInsert == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");
    
    // Nodo insertado (por valor)
    const inserted = currentNodes.find((d) => d.data.value === query.toInsert);
    if (!inserted) return;

    // 🔁 Si el hook lógico reportó una rotación (LL/LR/RR/RL)
    if (query.rotation) {
      // (Opcional) badge/flash ya lo manejas aparte con showRotationHint()
      // Aquí sólo hacemos "reflow" suave de nodos + enlaces para evitar saltos
      repositionTreeNodes(treeG, currentNodes, linksData, nodePositions).then(
        () => {
          resetQueryValues(); // 👈 importantísimo: limpia rotation en la query
          setIsAnimating(false);
        }
      );
      return; // 👈 evita ejecutar animateInsertNode
    }

    // Caso normal (sin rotación): animación de “nuevo hijo”
    let parentNode: d3.HierarchyNode<HierarchyNodeData<number>> | null = null;
    let pathToParent: d3.HierarchyNode<HierarchyNodeData<number>>[] = [];
    if (inserted.parent) {
      parentNode = inserted.parent;
      pathToParent = root.path(parentNode);
    }

    animateInsertNode(
      treeG,
      seqG,
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
    query.toInsert,
    query.rotation, // 👈 añade rotation como dependencia
    resetQueryValues,
    setIsAnimating,
  ]);

  // Eliminación (AVL): reusa animateDeleteNode
  useEffect(() => {
    if (!prevRoot || !svgRef.current || query.toDelete == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    // Ubicar el nodo eliminado con el estado previo (por value)
    const nodeToDelete = prevRoot
      .descendants()
      .find((d) => d.data.value === query.toDelete);
    if (!nodeToDelete) return;

    const nodeToUpdate = null;

    animateDeleteNode(
      treeG,
      seqG,
      {
        prevRootNode: prevRoot,
        nodeToDelete,
        nodeToUpdate,
        remainingNodesData: currentNodes,
        remainingLinksData: linksData,
      },
      nodePositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toDelete,
    resetQueryValues,
    setIsAnimating,
  ]);

  // Búsqueda (idéntica)
  useEffect(() => {
    if (!root || !svgRef.current || !query.toSearch) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    const nodeToSearch = currentNodes.find(
      (d) => d.data.value === query.toSearch
    );
    if (!nodeToSearch) return;

    const pathToNode = root.path(nodeToSearch);

    animateSearchNode(
      treeG,
      seqG,
      nodeToSearch.data.id,
      pathToNode,
      resetQueryValues,
      setIsAnimating
    );
  }, [root, currentNodes, query.toSearch, resetQueryValues, setIsAnimating]);

  // Recorridos (idéntico)
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

    // Render secuencia
    drawTraversalSequence(seqG, nodes, {
      nodePositions,
      seqPositions,
      treeOffset,
      seqOffset,
    });

    // Animación de recorrido
    animateTreeTraversal(
      treeG,
      seqG,
      nodes,
      seqPositions,
      resetQueryValues,
      setIsAnimating
    );
  }, [
    query.toGetInOrder,
    query.toGetPreOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
  ]);

  // Indicador de rotación (sólo si llega desde el hook lógico)
  useEffect(() => {
    if (!svgRef.current || !query.rotation) return;
    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    showRotationHint(svg, treeG, query.rotation, nodePositions, treeOffset);
    // Nota: no reseteamos aquí; el reset lo maneja la animación principal
  }, [query.rotation]);

  // Limpieza (idéntico)
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
  }, [query.toClear, resetQueryValues, setIsAnimating]);

  return { svgRef };
}
