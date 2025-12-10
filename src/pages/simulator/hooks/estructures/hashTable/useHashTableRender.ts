// src/hooks/estructures/hashTable/useHashTableRender.ts
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  drawHashTable,
  animateGet,
  drawRemoveMark,
  DEFAULT_STYLE,
  StyleConfig,
  flatten,
} from "../../../../../shared/utils/draw/hashTableDrawActions";
import {
  HashNode,
  HashQuery,
  LastAction,
  HashError,
} from "./useHashTable";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { useBus } from "../../../../../shared/hooks/useBus";
import { getTablaHashCode } from "../../../../../shared/constants/pseudocode/tablaHashCode";
import { delay } from "../../../../../shared/utils/simulatorUtils";

// ✅ se calcula UNA sola vez al cargar el módulo
const HASH_CODE = getTablaHashCode();

interface Props {
  buckets: HashNode[][];
  memory: number[];
  query: HashQuery;
  lastAction?: LastAction;
  error: HashError | null;
  resetQueryValues: () => void;
  style?: Partial<StyleConfig>;
}

export function useHashTableRender({
  buckets,
  memory,
  query,
  lastAction,
  error,
  resetQueryValues,
  style,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { setIsAnimating } = useAnimation();
  const bus = useBus();
  const code = HASH_CODE;

  const mergedStyle: StyleConfig = { ...DEFAULT_STYLE, ...(style ?? {}) };

  /**
   * Gateo global:
   * - false: no redibujar nada (lo usamos en create).
   * - true: el SVG se redibuja con `renderBuckets`.
   */
  const [canDrawBuckets, setCanDrawBuckets] = useState(true);

  /**
   * Snapshot visual independiente del estado lógico:
   * - `buckets`  → estado real de la tabla.
   * - `renderBuckets` → qué versión se está mostrando en el SVG.
   *
   * Esto permite que, por ejemplo, en `set` sigamos viendo el estado
   * anterior hasta llegar a la línea INSERT_NODE / UPDATE_VALUE.
   */
  const [renderBuckets, setRenderBuckets] = useState<HashNode[][]>(buckets);

  /* ───────────────── Dibujo base de la tabla ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (!canDrawBuckets) return;

    const svg = d3.select(svgRef.current);

    const showBucketIdx =
      ["set", "get", "delete"].includes(lastAction?.type ?? "") &&
      typeof lastAction?.bucketIdx === "number"
        ? lastAction.bucketIdx
        : undefined;

    drawHashTable(svg, renderBuckets, memory, mergedStyle, showBucketIdx);
  }, [
    renderBuckets,
    memory,
    lastAction?.type,
    lastAction?.bucketIdx,
    mergedStyle.nodeStroke,
    canDrawBuckets,
  ]);

  /* ───────────────── Errores: reproducir errorPlans ───────────────── */
  useEffect(() => {
    if (!error || !error.planId) return;
    const { op, planId, id } = error;

    const opCode = (code as any)[op];
    if (!opCode || !opCode.labels || !opCode.errorPlans) return;

    const labels = opCode.labels as Record<string, number>;
    const plan = opCode.errorPlans[planId];
    if (!plan || plan.length === 0) return;

    const stepId = `hash-error-${op}-${id}`;
    let cancelled = false;

    const run = async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op });

      for (const stepDef of plan as {
        lineLabel: string;
        hold?: number;
      }[]) {
        const { lineLabel, hold } = stepDef;
        const lineIndex = labels[lineLabel];
        if (typeof lineIndex === "number") {
          bus.emit("step:progress", { stepId, lineIndex });
          await delay(hold ?? 600);
          if (cancelled) return;
        }
      }

      bus.emit("op:done", { op });
      setIsAnimating(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [error, code, bus, setIsAnimating]);

  /* ───────────────── create(n): constructor ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (lastAction?.type !== "create") return;

    const svg = d3.select(svgRef.current);
    const labels = code.create.labels!;
    const stepId = `create-${Date.now()}`;

    let cancelled = false;

    // n = número de slots creados (informacionEntrada.length en Java)
    const slots = buckets.length;

    (async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op: "create" });

      // 1) ocultar cualquier dibujo anterior
      setCanDrawBuckets(false);
      svg.selectAll("*").remove();

      /* ───────── VALIDACIÓN DE RANGO (1 ≤ n ≤ 21) ───────── */
      if (typeof labels.VALIDATE_RANGE === "number") {
        bus.emit("step:progress", {
          stepId,
          lineIndex: labels.VALIDATE_RANGE,
        });
        await delay(600);
        if (cancelled) return;
      }

      /* ───────── RUTA NORMAL DEL CONSTRUCTOR ───────── */

      const sequentialLines: number[] = [];

      if (typeof labels.SET_CAP === "number") {
        sequentialLines.push(labels.SET_CAP); // this.numeroSlots = n;
      }
      if (typeof labels.SET_COUNT === "number") {
        sequentialLines.push(labels.SET_COUNT); // this.numeroDatos = 0;
      }
      if (typeof labels.ALLOC_BUCKETS === "number") {
        sequentialLines.push(labels.ALLOC_BUCKETS); // new ListaCD[this.numeroSlots];
      }
      if (typeof labels.INIT_BUCKETS === "number") {
        sequentialLines.push(labels.INIT_BUCKETS); // inicializarListas();
      }

      for (const lineIndex of sequentialLines) {
        bus.emit("step:progress", { stepId, lineIndex });
        await delay(600);
        if (cancelled) return;
      }

      /* ───────── CUERPO de inicializarListas() ───────── */

      const initForIndex =
        (labels as any).INIT_FOR ?? (labels as any).INIT_LISTS_FOR;
      const initAssignIndex =
        (labels as any).INIT_ASSIGN ?? (labels as any).INIT_LISTS_ASSIGN;

      if (
        typeof initForIndex === "number" &&
        typeof initAssignIndex === "number"
      ) {
        for (let i = 0; i < slots; i++) {
          if (cancelled) return;

          bus.emit("step:progress", {
            stepId,
            lineIndex: initForIndex,
          });
          await delay(250);
          if (cancelled) return;

          bus.emit("step:progress", {
            stepId,
            lineIndex: initAssignIndex,
          });
          await delay(250);
          if (cancelled) return;
        }
      }

      // ───────── fin: ahora sí sincronizamos la vista con el estado real ─────────
      setRenderBuckets(buckets);
      setCanDrawBuckets(true);

      bus.emit("op:done", { op: "create" });
      setIsAnimating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [lastAction?.type, buckets, bus, setIsAnimating, code.create.labels]);

  /* ───────────────── get(k): búsqueda ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    // solo animamos get cuando realmente hay resultado (usar key y value)
    if (query.key === null || query.value === null) return;

    const svg = d3.select(svgRef.current);
    const labels = code.get.labels!;
    const stepId = `get-${query.key}-${Date.now()}`;

    let cancelled = false;

    // helper genérico para avanzar líneas
    const step = async (labelName: keyof typeof labels, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    (async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op: "get" });

      // ── 1) Validaciones de precondición ─────────────────────────
      // if (this.informacionEntrada == null || this.numeroSlots == 0){ ... }
      await step("TABLE_EXISTS_IF", 600);
      if (cancelled) return;

      // if (!esEnteroValido({0})){ ... }
      await step("VALIDATE_KEY", 600);
      if (cancelled) return;

      // ── 2) hash(k) y cuerpo de hash(...) ───────────────────────
      // int idx = hash({0});
      await step("HASH", 600);
      if (cancelled) return;

      await step("HASH_FN_COMPUTE", 400);
      if (cancelled) return;

      await step("HASH_FN_IF_NEG", 400);
      if (cancelled) return;

      await step("HASH_FN_ADJUST", 400);
      if (cancelled) return;

      await step("HASH_FN_RETURN", 400);
      if (cancelled) return;

      // ── 3) buscarNodo(idx, k) y su cuerpo ──────────────────────
      // Nodo n = buscarNodo(idx, {0});
      await step("SEARCH_NODE", 600);
      if (cancelled) return;

      await step("SEARCH_GET_BUCKET", 400);
      if (cancelled) return;

      await step("SEARCH_FOR_LOOP", 400);
      if (cancelled) return;

      await step("SEARCH_CHECK_KEY", 400);
      if (cancelled) return;

      // camino exitoso: encontró la clave
      await step("SEARCH_RETURN_FOUND", 400);
      if (cancelled) return;
      // (la rama n == null y THROW_NOT_FOUND la manejan los errorPlans cuando hay DomainError)

      // ── 4) return n.value ──────────────────────────────────────
      await step("RETURN_VALUE", 600);
      if (cancelled) return;

      // ── 5) Animación visual del nodo encontrado ────────────────
      animateGet(svg, query.key!, mergedStyle);

      await delay(800);
      if (cancelled) return;

      bus.emit("op:done", { op: "get" });
      resetQueryValues(); // limpia query para no reejecutar el efecto
      setIsAnimating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    query.key,
    query.value,
    bus,
    mergedStyle,
    resetQueryValues,
    setIsAnimating,
    code.get.labels,
  ]);

  /* ───────────────── set(k,v): inserción / actualización ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (lastAction?.type !== "set" || lastAction.key == null) return;

    const svg = d3.select(svgRef.current);
    const labels = code.set.labels!;
    const stepId = `set-${lastAction.key}-${Date.now()}`;
    const isInsert = lastAction.mode === "insert";
    const isUpdate = lastAction.mode === "update";

    let cancelled = false;

    // helper genérico para avanzar líneas
    const step = async (labelName: keyof typeof labels, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    (async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op: "set" });

      // ── 1) Validaciones lógicas del set(...) ─────────────────────

      // if (this.informacionEntrada == null || this.numeroSlots == 0){ ... }
      await step("TABLE_EXISTS_IF");
      if (cancelled) return;

      // if (!esEnteroValido({0}) || !esEnteroValido({1})){ ... }
      await step("VALIDATE_KEYVAL");
      if (cancelled) return;

      // ── 2) hash(k) y su función auxiliar ────────────────────────

      // int idx = hash({0});
      await step("HASH");
      if (cancelled) return;

      // dentro de hash(int clave) { ... }
      await step("HASH_FN_COMPUTE", 400);
      if (cancelled) return;

      await step("HASH_FN_IF_NEG", 400);
      if (cancelled) return;

      await step("HASH_FN_ADJUST", 400);
      if (cancelled) return;

      await step("HASH_FN_RETURN", 400);
      if (cancelled) return;

      // ── 3) buscarNodo(idx, k) y su cuerpo ───────────────────────

      // Nodo n = buscarNodo(idx, {0});
      await step("SEARCH_NODE");
      if (cancelled) return;

      // private Nodo buscarNodo(int idx, int clave){ ... }
      await step("SEARCH_GET_BUCKET", 400);
      if (cancelled) return;

      await step("SEARCH_FOR_LOOP", 400);
      if (cancelled) return;

      await step("SEARCH_CHECK_KEY", 400);
      if (cancelled) return;

      if (isUpdate) {
        // caso en que sí encuentra la clave
        await step("SEARCH_RETURN_FOUND", 400);
        if (cancelled) return;
      } else if (isInsert) {
        // caso en que NO encuentra la clave
        await step("SEARCH_RETURN_NULL", 400);
        if (cancelled) return;
      }

      // ── 4) Rama principal: update vs insert ─────────────────────

      if (isUpdate) {
        // if (n != null) { ... }
        await step("IF_FOUND");
        if (cancelled) return;

        // n.value = v;
        await step("UPDATE_VALUE");
        if (cancelled) return;

        // Aquí recién sincronizamos la vista con el estado real (valor nuevo)
        setRenderBuckets(buckets);
      } else if (isInsert) {
        // } else {  // rama inserción
        await step("ELSE_INSERT");
        if (cancelled) return;

        // Nodo nuevo = new Nodo(k, v);
        await step("NEW_NODE");
        if (cancelled) return;

        // if (buckets[idx].size() >= 5) { ... }
        await step("CHECK_BUCKET_FULL");
        if (cancelled) return;

        // INSERT_NODE: buckets[idx].insertarAlFinal(nuevo);
        await step("INSERT_NODE");
        if (cancelled) return;

        // Aquí "aparece" el nodo en la tabla (cambiamos renderBuckets recién ahora)
        setRenderBuckets(buckets);

        // numeroDatos++;
        await step("INCREMENT_COUNT");
        if (cancelled) return;
      }

      // ── 5) Pulso visual sobre el nodo afectado (ya en estado final) ─────

      const selection = svg
        .selectAll<SVGGElement, HashNode>("g.node")
        .filter((d) => d.key === lastAction.key)
        .select("rect.bg");

      if (!selection.empty()) {
        selection
          .transition()
          .duration(200)
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 4)
          .transition()
          .duration(200)
          .attr("stroke", mergedStyle.nodeStroke)
          .attr("stroke-width", 1.5)
          .on("end", () => {
            if (cancelled) return;
            setIsAnimating(false);
            bus.emit("op:done", { op: "set" });
          });
      } else {
        // fallback por si no se encuentra el nodo
        setIsAnimating(false);
        bus.emit("op:done", { op: "set" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    lastAction?.type,
    lastAction?.key,
    lastAction?.mode,
    buckets,
    mergedStyle.nodeStroke,
    bus,
    setIsAnimating,
    code.set.labels,
  ]);

   /* ───────────────── delete(k): eliminación ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (lastAction?.type !== "delete" || lastAction.key == null) return;

    const svg = d3.select(svgRef.current);
    const labels = code.delete.labels!;
    const stepId = `delete-${lastAction.key}-${Date.now()}`;

    let cancelled = false;

    // helper genérico para avanzar líneas
    const step = async (labelName: keyof typeof labels, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    (async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op: "delete" });

      /* ── 1) Validaciones lógicas ───────────────────────────── */

      // if (this.informacionEntrada == null || this.numeroSlots == 0){ ... }
      await step("TABLE_EXISTS_IF", 600);
      if (cancelled) return;

      // if (!esEnteroValido({0})){ ... }
      await step("VALIDATE_KEY", 600);
      if (cancelled) return;

      /* ── 2) hash(k) y cuerpo de hash(...) ─────────────────── */

      // int idx = hash({0});
      await step("HASH", 600);
      if (cancelled) return;

      // int hcode = clave % numeroSlots;
      await step("HASH_FN_COMPUTE", 400);
      if (cancelled) return;

      // if (hcode < 0){
      await step("HASH_FN_IF_NEG", 400);
      if (cancelled) return;

      //     hcode += numeroSlots;
      await step("HASH_FN_ADJUST", 400);
      if (cancelled) return;

      // return hcode;
      await step("HASH_FN_RETURN", 400);
      if (cancelled) return;

      /* ── 3) Cuerpo de delete(k) ────────────────────────────── */

      // Lista bucket = buckets[idx];
      await step("GET_BUCKET", 600);
      if (cancelled) return;

      // boolean eliminado = eliminarEnBucket(bucket, {0});
      await step("DELETE_NODE", 600);
      if (cancelled) return;

      // ── 3.1) Cuerpo de eliminarEnBucket(bucket, clave) ───────
      if (
        typeof labels.DELETE_HELPER_FOR === "number" &&
        typeof labels.DELETE_HELPER_CHECK_KEY === "number" &&
        typeof labels.DELETE_HELPER_REMOVE === "number" &&
        typeof labels.DELETE_HELPER_RETURN_TRUE === "number"
      ) {
        // for (int i = 0; i < bucket.size(); i++){
        await step("DELETE_HELPER_FOR", 400);
        if (cancelled) return;

        // if (actual.key == clave){
        await step("DELETE_HELPER_CHECK_KEY", 400);
        if (cancelled) return;

        //     bucket.eliminarEn(i);
        await step("DELETE_HELPER_REMOVE", 400);
        if (cancelled) return;

        //     return true;
        await step("DELETE_HELPER_RETURN_TRUE", 400);
        if (cancelled) return;
      }

      // X roja sobre el nodo en el snapshot ANTERIOR
      svg.selectAll("line.remove-mark").remove();
      const flat = flatten(renderBuckets);
      const target = flat.find((n) => n.key === lastAction.key);
      if (target) {
        drawRemoveMark(svg, target, mergedStyle);
      }

      await delay(600);
      if (cancelled) return;

      // contador--  (numeroDatos--)
      await step("DECREMENT_COUNT", 600);
      if (cancelled) return;

      /* ── 4) Sincronizar vista con estado lógico ───────────── */

      // Ahora sí, reflejamos en la vista que el nodo desapareció
      setRenderBuckets(buckets);

      // Limpiamos la X
      svg.selectAll("line.remove-mark").remove();

      setIsAnimating(false);
      bus.emit("op:done", { op: "delete" });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    lastAction?.type,
    lastAction?.key,
    buckets,
    // OJO: NO ponemos renderBuckets ni mergedStyle aquí
    bus,
    setIsAnimating,
  ]);


  /* ───────────────── clean(): limpieza total ───────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    if (lastAction?.type !== "clean") return;

    const labels = code.clean.labels!;
    const stepId = `clean-${Date.now()}`;
    let cancelled = false;

    // Número de slots que tenía la tabla antes del clean
    // (renderBuckets conserva el estado visual "antes" del clean)
    const slots = renderBuckets.length;

    // helper genérico para avanzar líneas
    const step = async (labelName: keyof typeof labels, ms = 600) => {
      const lineIndex = labels[labelName];
      if (typeof lineIndex !== "number") return;
      bus.emit("step:progress", { stepId, lineIndex });
      await delay(ms);
      if (cancelled) return;
    };

    (async () => {
      setIsAnimating(true);
      bus.emit("op:start", { op: "clean" });

      // clean(): limpiarBuckets();
      await step("CLEAR_BUCKETS", 600);
      if (cancelled) return;

      // cuerpo de limpiarBuckets():
      // for (int i = 0; i < informacionEntrada.length; i++){
      //     informacionEntrada[i] = null;
      // }
      if (
        typeof labels.CLEAR_FOR === "number" &&
        typeof labels.CLEAR_ASSIGN === "number"
      ) {
        for (let i = 0; i < slots; i++) {
          if (cancelled) return;

          await step("CLEAR_FOR", 300);
          if (cancelled) return;

          await step("CLEAR_ASSIGN", 300);
          if (cancelled) return;
        }
      }

      // numeroDatos = 0;
      await step("RESET_COUNT", 600);
      if (cancelled) return;

      // Tabla vacía en la vista (estado lógico actual después del clean)
      setRenderBuckets(buckets);

      bus.emit("op:done", { op: "clean" });
      setIsAnimating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [lastAction?.type, buckets, renderBuckets, bus, setIsAnimating, code.clean.labels]);

  return { svgRef };
}
