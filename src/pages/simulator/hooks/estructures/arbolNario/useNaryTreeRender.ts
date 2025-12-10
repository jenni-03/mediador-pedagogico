import * as d3 from "d3";
import { useEffect, useMemo, useRef } from "react";
import {
  BaseQueryOperations,
  HierarchyNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../../../domain/utils/types";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getArbolNarioCode } from "../../../../../domain/constants/pseudocode/arbolNarioCode";
import { delay } from "../../../../../domain/utils/simulatorUtils";

/* ───────────────────────── Utilidades genéricas n-ario ───────────────────────── */
import {
  SVG_NARY_VALUES,
  drawTraversalSequence,
  animateTreeTraversal,
  animateClearTree,
  curvedLinkPath,
} from "../../../../../shared/utils/draw/naryDrawActionsUtilities";

/* ───────────────────────── Dibujo/animaciones específicas n-ario ───────────────────────── */
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

/* ───────────────────────── Pseudocódigo árbol N-ario ───────────────────────── */

const NARY_CODE = getArbolNarioCode();

/* ───────────────────────── helpers locales ───────────────────────── */

function cleanupGhostNodes(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  validIds: Set<string>
) {
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
  const linksLayer = treeG.select<SVGGElement>("g.links-layer");

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

  // ─────────── NUEVO: limpiar enlaces ───────────

  if (linksLayer.empty()) return;

  // Si no hay nodos válidos, el árbol está vacío → borra todos los links
  if (validIds.size === 0) {
    linksLayer
      .selectAll<SVGPathElement, unknown>(".link, path.link, line.link")
      .remove();
    return;
  }

  // Si hay nodos válidos, borra solo los enlaces que apunten a nodos ya inexistentes
  linksLayer
    .selectAll<SVGPathElement, any>(".link, path.link, line.link")
    .filter(function (d: any) {
      // d puede ser { sourceId, targetId } o un link de D3 con source/target
      const src = d?.sourceId ?? d?.source?.data?.id ?? d?.sourceId ?? null;
      const tgt = d?.targetId ?? d?.target?.data?.id ?? d?.targetId ?? null;

      const invalidSource = src && !validIds.has(src);
      const invalidTarget = tgt && !validIds.has(tgt);
      return invalidSource || invalidTarget;
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
  const bus = useBus();

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

    if (minX == null || maxX == null || minY == null || maxY == null) return;

    const treeWidth = maxX - minX + margin.left + margin.right;
    const n = currentNodes.length;
    const seqContent = n > 0 ? (n - 1) * SVG_NARY_VALUES.SEQUENCE_PADDING : 0;
    const seqWidth = seqContent + margin.left + margin.right;

    const width = Math.max(treeWidth, seqWidth);
    const height = maxY - minY + margin.top + margin.bottom;

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

    // 3.1) Inyecta <defs> de la skin (gradiente + sombra)
    ensureNarySkinDefs(svg);

    // 4) Offsets para centrar el contenido dibujado
    treeOffset.x = margin.left - minX;
    treeOffset.y = margin.top - minY;

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
      (maxY - minY) +
      SVG_NARY_VALUES.SEQUENCE_PADDING +
      SVG_NARY_VALUES.SEQUENCE_HEIGHT;

    let seqG = svg.select<SVGGElement>("g.seq-container");
    if (seqG.empty()) seqG = svg.append("g").classed("seq-container", true);
    seqG.attr("transform", `translate(${seqOffset.x}, ${seqOffset.y})`);

    // ¿Venimos de un árbol vacío y estamos ejecutando createRoot?
    const hadNodesBefore =
      !!prevRoot && prevRoot.descendants().some((d) => !d.data.isPlaceholder);
    const isPendingCreateRoot = query.toCreateRoot != null && !hadNodesBefore;

    // ¿Hay una eliminación de nodo en curso?
    const isPendingDelete = query.toDeleteNode != null;

    // ¿Hay un movimiento de subárbol en curso?
    const isPendingMove =
      Array.isArray(query.toMoveNode) && query.toMoveNode.length > 0;

    // 7) Dibujo base: nodos (skin “neo”) + enlaces
    //    - Si estamos en createRoot sobre árbol vacío → NO dibujamos aún.
    //    - Si estamos en deleteNode → tampoco redibujamos.
    //    - Si estamos en moveNode → tampoco redibujamos, dejamos el DOM previo.
    if (!isPendingCreateRoot && !isPendingDelete && !isPendingMove) {
      drawNaryTreeNodes(nodesLayer, currentNodes, nodePositions);

      drawTreeLinks(linksLayer, linksData, nodePositions, {
        nodeRadius: SVG_NARY_VALUES.NODE_RADIUS,
        pathBuilder: curvedLinkPath,
        strokeColor: "#3b4252",
        strokeWidth: 2,
      });
    }

    // 8) Limpieza de “fantasmas” y orden de capas
    const validIds = new Set(currentNodes.map((d) => d.data.id));

    // Si hay delete o move en curso, no limpiamos todavía.
    if (!isPendingDelete && !isPendingMove) {
      cleanupGhostNodes(treeG, validIds);
    }

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
    nodePositions,
    treeOffset,
    seqOffset,
    query.toCreateRoot,
    query.toDeleteNode,
    query.toMoveNode,
  ]);

  /* ─────────── Crear raíz ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current || query.toCreateRoot == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");

    const labels = NARY_CODE.createRoot.labels!;
    const stepId = `createRoot-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: keyof typeof labels, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    (async () => {
      bus.emit("op:start", { op: "createRoot" });

      // 1) if (raiz != null){ ... }
      await step("ROOT_EXISTS_IF", 600);
      if (cancelled) return;

      // 2) raiz = new NodoN(v);
      await step("NEW_ROOT", 600);
      if (cancelled) return;

      // 3) raiz.hijos = new ListaNodos();
      await step("INIT_CHILDREN", 600);
      if (cancelled) return;

      // ── Aquí recién “nace” la raíz en la vista ──
      drawNaryTreeNodes(nodesLayer, currentNodes, nodePositions);
      drawTreeLinks(linksLayer, linksData, nodePositions, {
        nodeRadius: SVG_NARY_VALUES.NODE_RADIUS,
        pathBuilder: curvedLinkPath,
        strokeColor: "#3b4252",
        strokeWidth: 2,
      });

      const onDone = () => {
        resetQueryValues();
        bus.emit("op:done", { op: "createRoot" });
      };

      animateNaryCreateRoot(treeG, root.data.id, onDone, setIsAnimating);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    root,
    currentNodes,
    linksData,
    query.toCreateRoot,
    resetQueryValues,
    setIsAnimating,
    bus,
    nodePositions,
  ]);

  /* ─────────── Insertar hijo ─────────── */
  useEffect(() => {
    if (!root || !svgRef.current) return;
    const args = query.toInsertChild;
    if (!Array.isArray(args) || args.length === 0) return;

    const [parentId, value, maybeIndex] = args as [string, number, number?];
    const index = typeof maybeIndex === "number" ? maybeIndex : null;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");
    const linksLayer = treeG.select<SVGGElement>("g.links-layer");

    // Nodo recién insertado (ya existe en currentNodes porque la estructura se actualizó)
    const inserted = currentNodes.find(
      (d) => d.data.value === value && d.parent?.data.id === parentId
    );
    if (!inserted) return;

    const parentNode = currentNodes.find((d) => d.data.id === parentId) ?? null;
    const pathToParent = parentNode ? root.path(parentNode) : [];

    const labels = NARY_CODE.insertChild.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `insertChild-${Date.now()}`;
    let cancelled = false;

    //  ⚠️ Ocultamos/quitamos el hijo y su enlace mientras se recorre el código
    const newNodeId = inserted.data.id;

    // Quita el nodo hijo si ya fue dibujado por el render base
    nodesLayer.selectAll<SVGGElement, unknown>(`g.node#${newNodeId}`).remove();

    // Quita el enlace padre→hijo si existe
    linksLayer
      .selectAll<SVGPathElement, TreeLinkData>("path.link")
      .filter((d) => d.targetId === newNodeId)
      .remove();

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const runAnimation = () => {
      // Redibujamos TODO el árbol (ya con el nuevo hijo visible)
      drawNaryTreeNodes(nodesLayer, currentNodes, nodePositions);
      drawTreeLinks(linksLayer, linksData, nodePositions, {
        nodeRadius: SVG_NARY_VALUES.NODE_RADIUS,
        pathBuilder: curvedLinkPath,
        strokeColor: "#3b4252",
        strokeWidth: 2,
      });

      // Y ahora sí, animamos la inserción
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
        () => {
          resetQueryValues();
          bus.emit("op:done", { op: "insertChild" });
        },
        setIsAnimating
      );
    };

    (async () => {
      bus.emit("op:start", { op: "insertChild" });

      // 0) Validar que el árbol no esté vacío
      await step("TREE_EMPTY_IF", 600);
      if (cancelled) return;

      // 1) Llamada conceptual a buscarPorIdBFS(raiz, parentId)
      await step("FIND_PARENT", 600);
      if (cancelled) return;

      // 1.1) Dentro de buscarPorIdBFS: patrón BFS
      await step("BFS_ROOT_NULL_IF", 400);
      if (cancelled) return;
      await step("BFS_QUEUE_INIT", 400);
      if (cancelled) return;
      await step("BFS_ENQUEUE_ROOT", 400);
      if (cancelled) return;

      await step("BFS_WHILE", 400);
      if (cancelled) return;
      await step("BFS_DEQUEUE", 400);
      if (cancelled) return;
      await step("BFS_CHECK_ID", 400);
      if (cancelled) return;
      await step("BFS_RETURN_MATCH", 400);
      if (cancelled) return;

      // 2) Validar que el padre exista
      await step("PARENT_NOT_FOUND_IF", 600);
      if (cancelled) return;

      // 3) Crear el nuevo nodo hijo
      await step("NEW_NODE", 600);
      if (cancelled) return;

      // 4) Insertar según index
      if (index == null) {
        // Sin index explícito → agrega al final (derecha)
        await step("IF_INDEX_NULL", 600);
        if (cancelled) return;
        await step("APPEND_CHILD", 600);
        if (cancelled) return;

        // Helper agregar(...)
        await step("AGREGAR_HEADER", 400);
        if (cancelled) return;
        await step("AGREGAR_ASSIGN", 400);
        if (cancelled) return;
        await step("AGREGAR_INCREMENT", 400);
        if (cancelled) return;
      } else {
        // Con index explícito (0 izquierda, 1 derecha, etc.)
        await step("ELSE_INSERT_AT", 600);
        if (cancelled) return;
        await step("INSERT_AT_INDEX", 600);
        if (cancelled) return;

        // Helper insertar(...)
        await step("INSERT_HEADER", 400);
        if (cancelled) return;
        await step("INSERT_FOR", 400);
        if (cancelled) return;
        await step("INSERT_SHIFT_ASSIGN", 400);
        if (cancelled) return;
        await step("INSERT_FOR_END", 400);
        if (cancelled) return;
        await step("INSERT_SET_AT", 400);
        if (cancelled) return;
        await step("INSERT_INCREMENT", 400);
        if (cancelled) return;
      }

      // 5) Vincular padre
      await step("SET_PARENT", 600);
      if (cancelled) return;

      // 6) Ahora sí, dibujamos y animamos el nuevo hijo
      runAnimation();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    root,
    currentNodes,
    linksData,
    query.toInsertChild,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
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

    const labels = NARY_CODE.deleteNode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `deleteNode-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const runAnimation = () => {
      // Animar realmente la eliminación del subárbol
      animateNaryDeleteNode(
        treeG,
        {
          prevRootNode: prevRoot,
          nodeToDelete,
          remainingNodesData: currentNodes,
          remainingLinksData: linksData,
        },
        nodePositions,
        () => {
          resetQueryValues();
          bus.emit("op:done", { op: "deleteNode" });
        },
        setIsAnimating
      );

      // Limpieza tardía de nodos “apagados”
      setTimeout(() => {
        if (!svgRef.current) return;
        const validIds = new Set(currentNodes.map((d) => d.data.id));
        const svg2 = d3.select(svgRef.current);
        const treeG2 = svg2.select<SVGGElement>("g.tree-container");
        cleanupGhostNodes(treeG2, validIds);
      }, 0);
    };

    (async () => {
      bus.emit("op:start", { op: "deleteNode" });

      // 0) if (raiz == null) { return; } – chequeo conceptual
      await step("TREE_EMPTY_IF", 600);
      if (cancelled) return;

      // 1) Llamada conceptual a buscarPorIdBFS(raiz, id)
      await step("FIND_TARGET", 600);
      if (cancelled) return;

      // 1.1) Dentro de buscarPorIdBFS: patrón BFS
      await step("BFS_ROOT_NULL_IF", 400); // if (raiz == null){ return null; }
      if (cancelled) return;
      await step("BFS_QUEUE_INIT", 400); // Cola<NodoN> q = new Cola<>();
      if (cancelled) return;
      await step("BFS_ENQUEUE_ROOT", 400); // q.encolar(raiz);
      if (cancelled) return;

      await step("BFS_WHILE", 400); // while (!q.esVacia()){
      if (cancelled) return;
      await step("BFS_DEQUEUE", 400); // NodoN u = q.decolar();
      if (cancelled) return;
      await step("BFS_CHECK_ID", 400); // if (u.id.equals(id)){
      if (cancelled) return;
      await step("BFS_RETURN_MATCH", 400); // return u;
      if (cancelled) return;

      // 2) De vuelta en deleteNode: validar que objetivo != null
      await step("TARGET_NOT_FOUND_IF", 600); // if (objetivo == null){
      if (cancelled) return;

      const isRootDeletion = nodeToDelete.data.id === prevRoot.data.id;

      if (isRootDeletion) {
        // 3.a) Caso especial: eliminar la raíz
        await step("IF_IS_ROOT", 600); // if (objetivo == raiz){
        if (cancelled) return;
        await step("SET_ROOT_NULL", 600); // raiz = null;
        if (cancelled) return;

        runAnimation();
        return;
      }

      // 3.b) Nodo interno: se mantiene el if (objetivo == raiz) como condición falsa
      await step("IF_IS_ROOT", 600); // (condición evaluada a false)
      if (cancelled) return;

      // 4) Desvincular el nodo de la lista de hijos de su padre
      await step("GET_PARENT", 600); // NodoN p = objetivo.padre;
      if (cancelled) return;
      await step("FIND_INDEX_IN_CHILDREN", 600); // int k = p.hijos.indiceDe(objetivo);
      if (cancelled) return;
      await step("REMOVE_AT_INDEX", 600); // p.hijos.eliminarEn(k);
      if (cancelled) return;

      // 5) Disparar animación
      runAnimation();
    })();

    return () => {
      cancelled = true;
    };
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toDeleteNode,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
  ]);

  /* ─────────── Mover subárbol ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const args = query.toMoveNode;
    if (!Array.isArray(args) || args.length === 0) return;
    const [movedId, newParentId] = args as [string, string, number?];

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    if (!prevRoot) return;

    // Nodo a mover (x) y nuevo padre (p) en el frame PREVIO
    const xNodePrev =
      prevRoot.descendants().find((d) => d.data.id === movedId) ?? null;
    const pNodePrev =
      prevRoot.descendants().find((d) => d.data.id === newParentId) ?? null;

    const labels = NARY_CODE.moveNode.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `moveNode-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    // ───────── Recorrido recursivo de esDescendiente(p, x) ─────────
    type NaryNode = typeof xNodePrev;

    const animateEsDescendiente = async (
      posibleDesc: NaryNode | null, // p
      posibleAncestro: NaryNode | null // x, luego hijos de x
    ): Promise<boolean> => {
      // if (posibleAncestro == null) { return false; }
      await step("DESC_IF_NULL_ANCESTOR", 400);
      if (!posibleAncestro) {
        return false;
      }

      // if (posibleDescendiente == posibleAncestro) { return true; }
      await step("DESC_BASE_EQUAL", 400);
      if (posibleDesc && posibleDesc.data.id === posibleAncestro.data.id) {
        return true;
      }

      // for (NodoN h : posibleAncestro.hijos) { ... }
      await step("DESC_FOR_CHILDREN", 400);

      const children = posibleAncestro.children ?? [];
      for (const h of children) {
        // if (esDescendiente(posibleDescendiente, h)) { return true; }
        await step("DESC_RECURSE_CHILD", 400);
        const found = await animateEsDescendiente(posibleDesc, h as NaryNode);
        if (found) {
          return true;
        }
      }

      // return false;
      await step("DESC_RETURN_FALSE", 400);
      return false;
    };

    const resetAndDone = () => {
      resetQueryValues();
      bus.emit("op:done", { op: "moveNode" });
    };

    (async () => {
      bus.emit("op:start", { op: "moveNode" });

      // 1) Validar SAME_NODE
      await step("SAME_NODE_IF", 600);
      if (cancelled) return;
      if (movedId === newParentId) {
        await step("SAME_NODE_THROW", 800);
        resetAndDone();
        return;
      }

      // 2) “Buscar” x y p (conceptual: ya los tienes como xNodePrev / pNodePrev)
      await step("FIND_X", 400);
      if (cancelled) return;
      await step("FIND_P", 400);
      if (cancelled) return;

      if (!xNodePrev || !pNodePrev) {
        await step("NODES_NOT_FOUND_IF", 600);
        if (cancelled) return;
        await step("NODES_NOT_FOUND_THROW", 800);
        resetAndDone();
        return;
      }

      // 3) esDescendiente(p, x) – animar recursivamente
      await step("CHECK_CYCLE_IF", 600);
      if (cancelled) return;

      const creaCiclo = await animateEsDescendiente(pNodePrev, xNodePrev);

      if (creaCiclo) {
        await step("CHECK_CYCLE_THROW", 800);
        if (cancelled) return;
        resetAndDone();
        return;
      }

      // 4) No mover la raíz
      await step("CHECK_IS_ROOT_IF", 600);
      if (cancelled) return;
      if (xNodePrev === prevRoot) {
        await step("CHECK_IS_ROOT_THROW", 800);
        resetAndDone();
        return;
      }

      // 5) Desvincular de padre actual (conceptual)
      await step("GET_OLD_PARENT", 600);
      if (cancelled) return;
      await step("FIND_INDEX_IN_OLD", 600);
      if (cancelled) return;
      await step("REMOVE_FROM_OLD", 600);
      if (cancelled) return;

      // 6) Vincular en nuevo padre
      await step("IF_INDEX_NULL", 600);
      if (cancelled) return;
      // Aquí puedes decidir si simulas index == null o no:
      await step("APPEND_IN_NEW", 600);
      if (cancelled) return;
      await step("SET_NEW_PARENT", 600);
      if (cancelled) return;

      // 7) Animación visual real del movimiento
      animateNaryMoveNode(
        treeG,
        svg,
        {
          movedNodeId: movedId,
          oldParentId: xNodePrev.parent?.data.id,
          newParentId,
          nodesData: currentNodes,
          linksData,
        },
        nodePositions,
        resetAndDone,
        setIsAnimating
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    prevRoot,
    currentNodes,
    linksData,
    query.toMoveNode,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
    svgRef,
  ]);

  /* ─────────── Actualizar valor ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    const args = query.toUpdateValue;
    if (!Array.isArray(args) || args.length === 0) return;

    const [id] = args as [string, number];

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const labels = NARY_CODE.updateValue.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `updateValue-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const resetAndDone = () => {
      resetQueryValues();
      bus.emit("op:done", { op: "updateValue" });
    };

    (async () => {
      bus.emit("op:start", { op: "updateValue" });

      // 1) if (raiz == null){ ... }
      await step("TREE_EMPTY_IF", 600);
      if (cancelled) return;

      const treeIsEmpty = !root || currentNodes.length === 0;
      if (treeIsEmpty) {
        await step("TREE_EMPTY_THROW", 800);
        if (cancelled) return;
        resetAndDone();
        return;
      }

      // 2) NodoN n = buscarPorIdBFS(raiz, id)
      await step("FIND_NODE", 600);
      if (cancelled) return;

      const nodeToUpdate = currentNodes.find((d) => d.data.id === id) ?? null;

      // 3) if (n == null){ ... }
      await step("NODE_NOT_FOUND_IF", 600);
      if (cancelled) return;

      if (!nodeToUpdate) {
        await step("NODE_NOT_FOUND_THROW", 800);
        if (cancelled) return;
        resetAndDone();
        return;
      }

      // 4) n.info = value;
      await step("ASSIGN_NEW_VALUE", 600);
      if (cancelled) return;

      // 5) Animación visual del cambio de valor
      animateNaryUpdateValue(treeG, id, resetAndDone, setIsAnimating);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    root,
    currentNodes,
    query.toUpdateValue,
    resetQueryValues,
    setIsAnimating,
    bus,
    svgRef,
  ]);

  /* ─────────── Búsqueda (por valor) ─────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (query.toSearch == null) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");

    const valueToSearch = query.toSearch;

    const labels = NARY_CODE.search.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `search-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const resetAndDone = () => {
      resetQueryValues();
      bus.emit("op:done", { op: "search" });
    };

    (async () => {
      bus.emit("op:start", { op: "search" });

      // 1) if (raiz == null){ return false; }
      await step("TREE_EMPTY_IF", 600);
      if (cancelled) return;

      const treeIsEmpty = !root || currentNodes.length === 0;
      if (treeIsEmpty) {
        // Árbol vacío: no hay animación, solo se muestra la condición
        resetAndDone();
        return;
      }

      // 2) Cola<NodoN> q = new Cola<>();
      await step("QUEUE_INIT", 400);
      if (cancelled) return;

      // 3) q.encolar(raiz);
      await step("QUEUE_ENQUEUE_ROOT", 400);
      if (cancelled) return;

      // Determinar si el valor existe en el árbol actual
      const targetNode =
        currentNodes.find((d) => d.data.value === valueToSearch) ?? null;

      // 4) while (!q.esVacia()){
      await step("BFS_WHILE", 600);
      if (cancelled) return;

      if (!targetNode) {
        // Caso: valor NO encontrado → seguir el plan de error
        // (ya hicimos QUEUE_INIT, QUEUE_ENQUEUE_ROOT, BFS_WHILE)
        await step("VALUE_NOT_FOUND_THROW", 800);
        if (cancelled) return;
        resetAndDone();
        return;
      }

      // Caso: valor SÍ encontrado → simulamos el ciclo donde lo encontramos

      // 5) NodoN u = q.decolar();
      await step("BFS_DEQUEUE", 400);
      if (cancelled) return;

      // 6) if (u.info.equals(value)){ ... }
      await step("BFS_CHECK_VALUE", 400);
      if (cancelled) return;

      // 7) return true;
      await step("BFS_RETURN_TRUE", 400);
      if (cancelled) return;

      // Ahora sí, animación visual de la búsqueda hasta el nodo encontrado
      if (!root) {
        resetAndDone();
        return;
      }

      const pathToNode = root.path(targetNode);

      animateNarySearchPath(
        svg,
        treeG,
        pathToNode,
        nodePositions,
        resetAndDone,
        setIsAnimating
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    root,
    currentNodes,
    query.toSearch,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    bus,
    svgRef,
  ]);

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
    let opName: "getPreOrder" | "getPostOrder" | "getLevelOrder";

    // Referencias a los labels de cada recorrido
    const preLabels = NARY_CODE.getPreOrder.labels!;
    const postLabels = NARY_CODE.getPostOrder.labels!;
    const levelLabels = NARY_CODE.getLevelOrder.labels!;

    if (traversalType === "pre") {
      nodes = query.toGetPreOrder;
      opName = "getPreOrder";
    } else if (traversalType === "post") {
      nodes = query.toGetPostOrder;
      opName = "getPostOrder";
    } else {
      nodes = query.toGetLevelOrder;
      opName = "getLevelOrder";
    }

    const stepId = `${opName}-${Date.now()}`;
    let cancelled = false;

    // step genérico: recibe el objeto de labels y la key (string)
    const step = async (
      labelsObj: Record<string, number>,
      labelKey: string,
      ms: number = 600
    ) => {
      const lineIndex = labelsObj[labelKey];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const wrappedReset = () => {
      resetQueryValues();
      bus.emit("op:done", { op: opName });
    };

    (async () => {
      bus.emit("op:start", { op: opName });

      /* ───────────── getPreOrder (recursivo) ───────────── */
      if (opName === "getPreOrder") {
        const L = preLabels;

        // Wrapper público
        await step(L, "PRE_INIT_RESULT", 500); // Lista<T> resultado = new Lista<>();
        if (cancelled) return;

        await step(L, "PRE_CALL_HELPER", 500); // getPreOrder(raiz, resultado);
        if (cancelled) return;

        // Simulación de llamadas recursivas sobre cada nodo del resultado
        for (let i = 0; i < nodes.length; i++) {
          // if (n == null) { return; }  → para cada llamada, se evalúa pero es falsa
          await step(L, "PRE_IF_NULL", 300);
          if (cancelled) return;

          // resultado.agregar(n.info);
          await step(L, "PRE_VISIT_NODE", 300);
          if (cancelled) return;

          // for (NodoN h : n.hijos) {
          await step(L, "PRE_FOR_CHILDREN", 300);
          if (cancelled) return;

          //     getPreOrder(h, resultado);
          await step(L, "PRE_RECURSE_CHILD", 300);
          if (cancelled) return;
        }

        // return resultado;
        await step(L, "PRE_RETURN_RESULT", 500);
        if (cancelled) return;
      } else if (opName === "getPostOrder") {

      /* ───────────── getPostOrder (recursivo) ───────────── */
        const L = postLabels;

        // Conceptualmente se llama getPostOrder(raiz, resultado) y se expande recursivo
        for (let i = 0; i < nodes.length; i++) {
          // if (n == null){ return; }  → chequeo base (falso para nodos existentes)
          await step(L, "POST_IF_NULL", 300);
          if (cancelled) return;

          // for (NodoN h : n.hijos){ getPostOrder(h, resultado); }
          await step(L, "POST_FOR_CHILDREN", 300);
          if (cancelled) return;

          await step(L, "POST_RECURSE_CHILD", 300);
          if (cancelled) return;

          // resultado.agregar(n.info);  (visita postorden)
          await step(L, "POST_VISIT_NODE", 300);
          if (cancelled) return;
        }
      } else {

      /* ───────────── getLevelOrder (BFS) ───────────── */
        const L = levelLabels;

        // if (raiz == null){ return; }
        await step(L, "LEVEL_TREE_EMPTY_IF", 400);
        if (cancelled) return;

        // Cola<NodoN> q = new Cola<>();
        await step(L, "LEVEL_QUEUE_INIT", 400);
        if (cancelled) return;

        // q.encolar(raiz);
        await step(L, "LEVEL_ENQUEUE_ROOT", 400);
        if (cancelled) return;

        if (nodes.length > 0) {
          // while (!q.esVacia()){
          await step(L, "LEVEL_WHILE", 400);
          if (cancelled) return;

          // Simular varias iteraciones del while, una por cada nodo visitado
          for (let i = 0; i < nodes.length; i++) {
            // NodoN u = q.decolar();
            await step(L, "LEVEL_DEQUEUE", 250);
            if (cancelled) return;

            // resultado.agregar(u.info);
            await step(L, "LEVEL_VISIT_NODE", 250);
            if (cancelled) return;

            // for (NodoN h : u.hijos){ q.encolar(h); }
            await step(L, "LEVEL_FOR_CHILDREN", 250);
            if (cancelled) return;

            await step(L, "LEVEL_ENQUEUE_CHILD", 250);
            if (cancelled) return;
          }
        }
      }

      // ───── Después del pseudocódigo: dibujar secuencia + animación ─────
      if (nodes.length === 0) {
        // Nada que recorrer visualmente
        wrappedReset();
        return;
      }

      // Render de la secuencia (banda inferior)
      drawTraversalSequence(seqG, nodes, {
        nodePositions,
        seqPositions,
        treeOffset,
        seqOffset,
      });

      // Animación del recorrido sobre el árbol
      animateTreeTraversal(
        treeG,
        seqG,
        nodes,
        seqPositions,
        wrappedReset,
        setIsAnimating,
        {
          style: "preserve-fill",
          strokeColor: "#8aa0ff",
          pulse: true,
          bounce: true,
        }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    query.toGetPreOrder,
    query.toGetPostOrder,
    query.toGetLevelOrder,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    seqPositions,
    treeOffset,
    seqOffset,
    bus,
    svgRef,
  ]);

  /* ─────────── Limpieza total ─────────── */
  useEffect(() => {
    if (!svgRef.current || !query.toClear) return;

    const svg = d3.select(svgRef.current);
    const treeG = svg.select<SVGGElement>("g.tree-container");
    const seqG = svg.select<SVGGElement>("g.seq-container");

    const labels = NARY_CODE.clean.labels!;
    type LabelKey = keyof typeof labels;

    const stepId = `clean-${Date.now()}`;
    let cancelled = false;

    const step = async (labelName: LabelKey, ms: number = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    const wrappedReset = () => {
      resetQueryValues();
      bus.emit("op:done", { op: "clean" });

      // Limpia overlays auxiliares
      svg.selectAll("g.nary-search-overlay").remove();
      svg.selectAll("g.nary-move-overlay").remove();
    };

    (async () => {
      bus.emit("op:start", { op: "clean" });

      // Línea clave: raiz = null;
      await step("CLEAR_ROOT", 600);
      if (cancelled) return;

      // Animación de borrado visual completo
      animateClearTree(
        treeG,
        seqG,
        { nodePositions, seqPositions },
        wrappedReset,
        setIsAnimating
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [
    query.toClear,
    resetQueryValues,
    setIsAnimating,
    nodePositions,
    seqPositions,
    bus,
    svgRef,
  ]);

  return { svgRef };
}
