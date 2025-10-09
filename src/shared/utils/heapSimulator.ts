/* ───────────────────────────── Tipos base ─────────────────────────────── */

export type HeapItem = {
  id: string; // id estable del nodo
  value: number; // prioridad/valor
};

/** Arreglo level-order; la posición es el índice del heap */
export type HeapArray = HeapItem[];

/** Paso pedagógico para inserción */
export type InsertStep =
  | {
      type: "append";
      index: number; // índice donde cayó el nuevo
      item: HeapItem; // ítem insertado
      array: HeapArray; // snapshot tras el append (antes del bubble-up)
      note: string;
    }
  | {
      type: "compare";
      childIndex: number;
      parentIndex: number;
      childId: string;
      parentId: string;
      relation: ">" | "<="; // en max-heap: ¿child.value > parent.value?
      array: HeapArray; // snapshot del momento
      note: string;
    }
  | {
      type: "swap";
      aIndex: number; // índice A antes del swap
      bIndex: number; // índice B antes del swap
      aId: string;
      bId: string;
      array: HeapArray; // snapshot luego del swap
      note: string;
    };

/** Transcript completo para insertar */
export type InsertTranscript = {
  kind: "insert";
  maxHeap: boolean;
  initial: HeapArray; // snapshot inicial
  steps: InsertStep[]; // pasos (incluye el append como primer paso)
  final: HeapArray; // snapshot final
  inserted: HeapItem; // el item insertado
};

/* ───────────────────────────── Utilidades ─────────────────────────────── */

function cloneArray(a: HeapArray): HeapArray {
  return a.map((x) => ({ ...x }));
}

function defaultIdFactory(v: number) {
  // id único, estable para una sesión
  return `${v}-${Math.random().toString(36).slice(2, 8)}`;
}

function parentIndex(i: number) {
  return Math.floor((i - 1) / 2);
}

/* ───────────── Helpers de logging (solo si debug=true) ───────────── */

function fmtHeapArray(arr: HeapArray): string {
  // ejemplo: [ (0:A/42) (1:B/17) (2:C/33) ]
  return (
    "[" + arr.map((it, i) => ` (${i}:${it.id}/${it.value})`).join("") + " ]"
  );
}

function logArrayTable(arr: HeapArray) {
  // Tabla con índice, id y valor
  const rows = arr.map((it, i) => ({ index: i, id: it.id, value: it.value }));
  // Evita crashear entornos sin console.table
  if ((console as any).table) (console as any).table(rows);
  else console.log(rows);
}

function logHeader(initial: HeapArray, value: number, maxHeap: boolean) {
  console.groupCollapsed(
    `%c[Heap Insert] value=${value} mode=${maxHeap ? "MAX" : "MIN"}`,
    "color:#22d3ee"
  );
  console.log("%cInitial:", "color:#94a3b8");
  console.log(fmtHeapArray(initial));
  logArrayTable(initial);
}

function logStep(step: InsertStep) {
  switch (step.type) {
    case "append":
      console.log(
        `%cappend at i=${step.index} — item {id:${step.item.id}, value:${step.item.value}}`,
        "color:#a78bfa"
      );
      console.log(fmtHeapArray(step.array));
      break;
    case "compare":
      console.log(
        `%ccompare i=${step.childIndex} (id=${step.childId}) vs p=${step.parentIndex} (id=${step.parentId}) → relation=${step.relation}`,
        "color:#fbbf24"
      );
      console.log(step.note);
      break;
    case "swap":
      console.log(
        `%cswap i=${step.aIndex} (id=${step.aId}) ⇄ p=${step.bIndex} (id=${step.bId})`,
        "color:#34d399"
      );
      console.log(fmtHeapArray(step.array));
      logArrayTable(step.array);
      break;
  }
}

function logFooter(final: HeapArray) {
  console.log("%cFinal:", "color:#94a3b8");
  console.log(fmtHeapArray(final));
  logArrayTable(final);
  console.groupEnd();
}

/* ───────────────────────── Simulación: Insert ─────────────────────────── */

/**
 * Simula la inserción en un heap binario (max-heap por defecto) y devuelve
 * un transcript paso-a-paso con snapshots del arreglo.
 *
 * Si opts.debug === true, emite logs detallados a la consola.
 */
export function simulateHeapInsert(
  initial: HeapArray,
  value: number,
  opts?: {
    maxHeap?: boolean; // default true
    idFactory?: (v: number) => string; // para controlar los ids
    debug?: boolean; // <-- NUEVO
  }
): InsertTranscript {
  const maxHeap = opts?.maxHeap ?? true;
  const makeId = opts?.idFactory ?? defaultIdFactory;
  const debug = opts?.debug ?? true;

  const arr: HeapArray = cloneArray(initial);
  const steps: InsertStep[] = [];

  if (debug) logHeader(initial, value, maxHeap);

  // 1) Append al final
  const item: HeapItem = { id: makeId(value), value };
  arr.push(item);
  const appendStep: InsertStep = {
    type: "append",
    index: arr.length - 1,
    item,
    array: cloneArray(arr),
    note: `Agregamos ${value} al final (índice ${arr.length - 1}).`,
  };
  steps.push(appendStep);
  if (debug) logStep(appendStep);

  // 2) Bubble-up
  let i = arr.length - 1;
  while (i > 0) {
    const p = parentIndex(i);
    const child = arr[i];
    const parent = arr[p];

    const relation = maxHeap
      ? child.value > parent.value
        ? ">"
        : "<="
      : child.value < parent.value
        ? ">"
        : "<=";

    const compareStep: InsertStep = {
      type: "compare",
      childIndex: i,
      parentIndex: p,
      childId: child.id,
      parentId: parent.id,
      relation,
      array: cloneArray(arr),
      note: maxHeap
        ? `Comparamos ${child.value} ${relation} ${parent.value} (max-heap)`
        : `Comparamos ${child.value} ${relation} ${parent.value} (min-heap)`,
    };
    steps.push(compareStep);
    if (debug) logStep(compareStep);

    const improves = maxHeap
      ? child.value > parent.value
      : child.value < parent.value;
    if (!improves) break;

    // swap
    [arr[i], arr[p]] = [arr[p], arr[i]];
    const swapStep: InsertStep = {
      type: "swap",
      aIndex: i,
      bIndex: p,
      aId: child.id,
      bId: parent.id,
      array: cloneArray(arr),
      note: `Intercambiamos posiciones: ${child.value} ⇄ ${parent.value}`,
    };
    steps.push(swapStep);
    if (debug) logStep(swapStep);

    i = p;
  }

  const transcript: InsertTranscript = {
    kind: "insert",
    maxHeap,
    initial: cloneArray(initial),
    steps,
    final: cloneArray(arr),
    inserted: item,
  };

  if (debug) {
    logFooter(transcript.final);
  }

  return transcript;
}

/* ─────────────── Opcional: convertir snapshot a jerarquía ─────────────── */

export type HierarchyNodeData<T> = {
  id: string;
  value?: T;
  isPlaceholder?: boolean;
  children?: HierarchyNodeData<T>[];
};

/** Construye jerarquía (con placeholders para hijos faltantes) desde un arreglo level-order */
export function heapArrayToHierarchy(
  arr: HeapArray
): HierarchyNodeData<number> | null {
  if (arr.length === 0) return null;

  const nodes: (HierarchyNodeData<number> | null)[] = arr.map((it) => ({
    id: it.id,
    value: it.value,
  }));

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    const li = 2 * i + 1;
    const ri = 2 * i + 2;

    const left = li < nodes.length ? nodes[li] : null;
    const right = ri < nodes.length ? nodes[ri] : null;

    if (left || right) {
      n.children = [
        left ?? { id: `${n.id}-phL`, isPlaceholder: true },
        right ?? { id: `${n.id}-phR`, isPlaceholder: true },
      ];
    }
  }

  return nodes[0];
}
