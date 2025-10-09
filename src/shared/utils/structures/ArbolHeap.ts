// src/shared/logic/heap/ArbolHeap.ts
// Árbol Heap (min o max) con transcripts pedagógicos para animaciones paso a paso.
// - IDs estables por nodo (D3-friendly).
// - Swaps de payload (priority/value) → no se mueven punteros, solo valores.
// - Transcripts detallan: append/replace/remove + pickChild + compare/swap (dir up/down).
// - En CADA paso, `array` refleja el estado **DESPUÉS** de ejecutar ese paso (ideal para D3).
// - HeapFixLog de compat se deriva solo de swaps y replaceRoot/replaceNode.

import { Comparator, HeapFixLog } from "../../../types";
import { defaultComparator } from "../treeUtils";
import { NodoHeap } from "../nodes/NodoHeap";

/* ─────────────────────────── Tipos pedagógicos ────────────────────────── */

type HeapItem = { id: string; value: number };
type HeapArray = HeapItem[];

/** Operadores mostrables en UI (texto del comparador). */
type CmpOp = ">" | "<" | ">=" | "<=" | "==";

/** Paso de comparación genérico para insert/delete. */
type CompareStep = {
  type: "compare";
  /** Dirección del heapify: subir o bajar. */
  dir: "up" | "down";
  /** Siempre expresamos el operador como PARENT <op> CHILD (coherente en UI). */
  parentIndex: number;
  childIndex: number;
  parentId: string;
  childId: string;
  /** Operador renderizable (no implica verdad/falsedad, es para mostrar). */
  op: CmpOp;
  /** Hint: si tras la comparación habrá swap. */
  swap?: boolean;
  /** Snapshot del estado **después** del paso (aquí coincide con “antes” porque no muta). */
  array: HeapArray;
  note: string;
};

/** Paso de swap genérico (intercambio de payload). */
type SwapStep = {
  type: "swap";
  dir: "up" | "down";
  aIndex: number;
  bIndex: number;
  aId: string;
  bId: string;
  /** Snapshot del estado **después** del swap. */
  array: HeapArray;
  note: string;
};

/** Paso didáctico: elegir el mejor hijo (max-heap: mayor; min-heap: menor). */
type PickChildStep = {
  type: "pickChild";
  parentIndex: number;
  leftIndex?: number;
  rightIndex?: number;
  leftId?: string;
  rightId?: string;
  /** Qué hijo fue elegido para comparar contra el parent. */
  chosen?: "left" | "right" | "none";
  /** Snapshot del estado **después** del paso (no muta estructura/payload). */
  array: HeapArray;
  note: string;
};

/** Pasos INSERT */
type InsertStep =
  | {
      type: "append";
      index: number; // índice donde se apendea (level-order)
      item: HeapItem;
      /** Snapshot del estado **después** del append. */
      array: HeapArray;
      note: string;
    }
  | PickChildStep // (no se usa en insert, pero dejamos el tipo común)
  | CompareStep
  | SwapStep;

export type InsertTranscript = {
  kind: "insert";
  /** true → max-heap; false → min-heap (útil para pintar símbolos). */
  maxHeap: boolean;
  initial: HeapArray;
  steps: InsertStep[];
  final: HeapArray;
  inserted: HeapItem;
};

/** Pasos DELETE */
type DeleteStep =
  | {
      type: "selectTarget";
      targetIndex: number;
      targetId: string;
      /** Snapshot del estado **después** del select (no muta). */
      array: HeapArray;
      note: string;
    }
  | {
      type: "replaceNode";
      targetId: string;
      withId: string;
      /** Posición original del que reemplaza (último antes de subir). */
      withIndex?: number;
      /** Snapshot del estado **después** de colocar el reemplazante en `targetIndex`. */
      array: HeapArray;
      note: string;
    }
  | {
      type: "removeLast";
      removedId: string;
      /** Snapshot del estado **después** de eliminar físicamente el último. */
      array: HeapArray;
      note: string;
    }
  | PickChildStep
  | CompareStep
  | SwapStep;

export type DeleteTranscript = {
  kind: "delete";
  maxHeap: boolean;
  initial: HeapArray;
  steps: DeleteStep[];
  final: HeapArray;
  deleted: HeapItem;
  deletedWasRoot: boolean;
  /** ID de la nueva raíz tras terminar (si existe). */
  updatedRootId?: string | null;
};

export type LevelOrderTranscript = {
  kind: "levelOrder";
  /** Orden de visita en level-order (solo IDs + value numérico para UI) */
  order: Array<{ id: string; value: number }>;
  /**
   * Snapshot opcional con índices densos para tejer links estables.
   * index es 0..n-1 en level-order.
   */
  snapshot: Array<{ id: string; index: number; hidden?: boolean }>;
  /** true → max-heap; false → min-heap (útil para pintar símbolos si hace falta) */
  maxHeap: boolean;
};

/* ─────────────────────────── Clase heap ─────────────────────────── */

export interface HeapOptions<T> {
  /** Comparador total y estable: (a,b) → negativo, cero o positivo. */
  compare?: Comparator<T>;
  /** true → min-heap; false|undefined → max-heap. */
  min?: boolean;
  /** Límite de nodos por seguridad. */
  maxNodos?: number;
}

export class ArbolHeap<T> {
  public readonly MAX_NODOS: number;
  private readonly compare: Comparator<T>;
  private readonly isMinHeap: boolean;
  private nodes: Array<NodoHeap<T>> = [];
  private linkedRoot: NodoHeap<T> | null = null;

  constructor(opts: HeapOptions<T> = {}) {
    this.compare = opts.compare ?? defaultComparator;
    this.isMinHeap = opts.min ?? false;
    this.MAX_NODOS = opts.maxNodos ?? 150;
  }

  /* ───────── utilidades internas ───────── */

  /** Devuelve true si a "mejora" a b según el tipo de heap. */
  private better(a: T, b: T): boolean {
    const c = this.compare(a, b);
    return this.isMinHeap ? c < 0 : c > 0;
  }
  private parent(i: number) {
    return Math.floor((i - 1) / 2);
  }
  private left(i: number) {
    return 2 * i + 1;
  }
  private right(i: number) {
    return 2 * i + 2;
  }

  private swapPayload(i: number, j: number) {
    this.nodes[i].swapPayloadWith(this.nodes[j]);
  }

  private findFirstIndexByValue(value: T): number {
    for (let i = 0; i < this.nodes.length; i++)
      if (this.compare(this.nodes[i].priority, value) === 0) return i;
    return -1;
  }
  private findIndexById(id: string): number {
    for (let i = 0; i < this.nodes.length; i++)
      if (this.nodes[i].getId() === id) return i;
    return -1;
  }

  /** Conversión numérica defensiva para snapshots D3. */
  private num(x: unknown): number {
    if (typeof x === "number") return Number.isFinite(x) ? x : 0;
    const n = Number(x as any);
    return Number.isFinite(n) ? n : 0;
  }

  /** Snapshot level-order minimalista: {id, value:number} */
  private toHeapArray(): HeapArray {
    return this.nodes.map((n) => ({
      id: n.getId(),
      value: this.num(n.priority as any),
    }));
  }

  /** Snapshot por índice denso: [{id, index}] para la posición level-order actual */
  private toIndexSnapshot(): Array<{
    id: string;
    index: number;
    hidden?: boolean;
  }> {
    const snap: Array<{ id: string; index: number; hidden?: boolean }> = [];
    for (let i = 0; i < this.nodes.length; i++) {
      snap.push({ id: this.nodes[i].getId(), index: i });
    }
    return snap;
  }

  /** Enlaza punteros parent/left/right solo cuando cambie el tamaño. */
  private relinkIfNeeded(): void {
    if (this.linkedRoot && this.count() === this.countLinked()) return;
    this.linkedRoot = NodoHeap.linkAsCompleteBinaryTree(this.nodes);
  }
  private countLinked(): number {
    if (!this.linkedRoot) return 0;
    let c = 0;
    const q: NodoHeap<T>[] = [this.linkedRoot];
    while (q.length) {
      const x = q.shift()!;
      c++;
      const l = x.getLeft();
      if (l) q.push(l);
      const r = x.getRight();
      if (r) q.push(r);
    }
    return c;
  }

  /* ───────── INSERT con transcript ───────── */

  /**
   * Inserta un valor devolviendo el nodo y un transcript de pasos:
   * append → (compare↑/swap↑)* → final.
   * En cada paso, `array` refleja el estado **después** del paso.
   */
  public insertarConTranscript(valor: T): {
    node: NodoHeap<T>;
    transcript: InsertTranscript;
  } {
    if (this.count() >= this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar: límite de nodos (${this.MAX_NODOS}).`
      );
    }

    const maxHeap = !this.isMinHeap;
    const initial = this.toHeapArray();
    const steps: InsertStep[] = [];

    // 1) Append al final del array (level-order).
    const nuevo = new NodoHeap<T>(valor);
    this.nodes.push(nuevo);
    const appendedIndex = this.nodes.length - 1;

    const appended: HeapItem = {
      id: nuevo.getId(),
      value: this.num(nuevo.priority as any),
    };
    steps.push({
      type: "append",
      index: appendedIndex,
      item: appended,
      array: this.toHeapArray(), // ← estado después del append
      note: `append`,
    });

    // 2) Heapify-up con compare/swap unificados.
    let i = appendedIndex;
    while (i > 0) {
      const p = this.parent(i);
      const child = this.nodes[i];
      const parent = this.nodes[p];

      const shouldSwap = this.better(child.priority, parent.priority);
      // Operador mostrado como PARENT <op> CHILD (condición de swap):
      // - max-heap: parent < child  → "<"
      // - min-heap: parent > child  → ">"
      const op: CmpOp = this.isMinHeap ? ">" : "<";

      steps.push({
        type: "compare",
        dir: "up",
        parentIndex: p,
        childIndex: i,
        parentId: parent.getId(),
        childId: child.getId(),
        op,
        swap: shouldSwap,
        array: this.toHeapArray(), // no mutó
        note: `heapify-up`,
      });

      if (!shouldSwap) break;

      this.swapPayload(i, p);
      steps.push({
        type: "swap",
        dir: "up",
        aIndex: i,
        bIndex: p,
        aId: child.getId(),
        bId: parent.getId(),
        array: this.toHeapArray(), // ← después del swap
        note: `swap payload`,
      });

      i = p;
    }

    const transcript: InsertTranscript = {
      kind: "insert",
      maxHeap,
      initial,
      steps,
      final: this.toHeapArray(),
      inserted: appended,
    };

    this.linkedRoot = null;
    return { node: nuevo, transcript };
  }

  /* ───────── DELETE con transcript (root o arbitrario) ───────── */

  /**
   * Elimina por índice devolviendo transcript pedagógico:
   * selectTarget → replaceNode → removeLast → heapify (up|down) → final.
   * En cada paso, `array` refleja el estado **después** del paso.
   */
  private eliminarPorIndiceConTranscript(idx: number): {
    deleted: NodoHeap<T>;
    updatedRoot: NodoHeap<T> | null;
    deletedWasRoot: boolean;
    transcript: DeleteTranscript;
  } {
    const maxHeap = !this.isMinHeap;
    const steps: DeleteStep[] = [];
    const initial = this.toHeapArray();

    const n = this.nodes.length;
    const deletedWasRoot = idx === 0;

    const target = this.nodes[idx];
    const deletedSnap: HeapItem = {
      id: target.getId(),
      value: this.num(target.priority as any),
    };
    steps.push({
      type: "selectTarget",
      targetIndex: idx,
      targetId: target.getId(),
      array: this.toHeapArray(), // no muta
      note: `select target`,
    });

    // Snapshot del nodo eliminado preservando el ID original (para devolverlo)
    const deletedNodeSnapshot = new NodoHeap<T>(
      target.priority,
      (target as any).value,
      target.getId()
    );

    // Caso trivial: un solo nodo
    if (n === 1) {
      this.nodes.pop();
      const transcript: DeleteTranscript = {
        kind: "delete",
        maxHeap,
        initial,
        steps,
        final: this.toHeapArray(),
        deleted: deletedSnap,
        deletedWasRoot,
      };
      this.linkedRoot = null;
      return {
        deleted: deletedNodeSnapshot,
        updatedRoot: null,
        deletedWasRoot,
        transcript,
      };
    }

    const lastIdx = n - 1;
    const last = this.nodes[lastIdx];

    // Si el target ya es el último, solo se elimina
    if (idx === lastIdx) {
      this.nodes.pop();
      steps.push({
        type: "removeLast",
        removedId: target.getId(),
        array: this.toHeapArray(), // ← después de eliminar la hoja
        note: "remove last (leaf)",
      });

      const transcript: DeleteTranscript = {
        kind: "delete",
        maxHeap,
        initial,
        steps,
        final: this.toHeapArray(),
        deleted: deletedSnap,
        deletedWasRoot,
        updatedRootId: this.nodes[0]?.getId() ?? null,
      };
      this.linkedRoot = null;
      return {
        deleted: deletedNodeSnapshot,
        updatedRoot: this.nodes[0] ?? null,
        deletedWasRoot,
        transcript,
      };
    }

    // 🧩 Caso general D3-friendly:
    // A) Mover el OBJETO del último al hueco (el id "last" pasa a ocupar `idx`).
    this.nodes[idx] = last;

    // B) Emitir **replaceNode** con el snapshot del estado YA reemplazado.
    //    (Ojo: todavía existe el "last" en la cola; su id aparece por duplicado
    //     hasta que hagamos el pop. D3 no crea nodos, pero el texto/valor queda
    //     bien definido para el id que sube.)
    steps.push({
      type: "replaceNode",
      targetId: target.getId(),
      withId: last.getId(),
      withIndex: lastIdx,
      array: this.toHeapArray(), // ← después de colocar el reemplazante en `idx`
      note: `replace target with last`,
    });

    // C) Eliminar físicamente el último (ahora sí desaparece del snapshot)
    this.nodes.pop();
    steps.push({
      type: "removeLast",
      removedId: last.getId(),
      array: this.toHeapArray(), // ← después del pop
      note: `remove physical last`,
    });

    // D) Heapify desde idx: puede ser up o down (según relación con el padre).
    const p = this.parent(idx);
    const hasParent = idx > 0;
    const canBubbleUp =
      hasParent &&
      this.better(this.nodes[idx].priority, this.nodes[p].priority);

    if (canBubbleUp) {
      // heapify-up
      let i = idx;
      while (i > 0) {
        const pp = this.parent(i);
        const child = this.nodes[i];
        const parent = this.nodes[pp];
        const shouldSwap = this.better(child.priority, parent.priority);
        const op: CmpOp = this.isMinHeap ? ">" : "<"; // PARENT <op> CHILD para swap

        steps.push({
          type: "compare",
          dir: "up",
          parentIndex: pp,
          childIndex: i,
          parentId: parent.getId(),
          childId: child.getId(),
          op,
          swap: shouldSwap,
          array: this.toHeapArray(), // no muta
          note: `heapify-up`,
        });

        if (!shouldSwap) break;

        this.swapPayload(i, pp);
        steps.push({
          type: "swap",
          dir: "up",
          aIndex: i,
          bIndex: pp,
          aId: child.getId(),
          bId: parent.getId(),
          array: this.toHeapArray(), // ← después del swap
          note: `swap payload`,
        });

        i = pp;
      }
    } else {
      // heapify-down
      let i = idx;
      const n2 = this.nodes.length;
      while (true) {
        const l = this.left(i),
          r = this.right(i);

        // Paso didáctico: mostrar elección del mejor hijo.
        steps.push({
          type: "pickChild",
          parentIndex: i,
          leftIndex: l < n2 ? l : undefined,
          rightIndex: r < n2 ? r : undefined,
          leftId: l < n2 ? this.nodes[l].getId() : undefined,
          rightId: r < n2 ? this.nodes[r].getId() : undefined,
          chosen: undefined, // se rellena tras decidir
          array: this.toHeapArray(), // no muta
          note: `pick child`,
        });

        let best = i;
        if (
          l < n2 &&
          this.better(this.nodes[l].priority, this.nodes[best].priority)
        )
          best = l;
        if (
          r < n2 &&
          this.better(this.nodes[r].priority, this.nodes[best].priority)
        )
          best = r;

        // Actualizar el último pick con la elección real.
        const lastStep = steps[steps.length - 1];
        if (lastStep.type === "pickChild") {
          lastStep.chosen = best === l ? "left" : best === r ? "right" : "none";
        }

        if (best === i) break;

        const parent = this.nodes[i],
          child = this.nodes[best];
        const shouldSwap = this.better(child.priority, parent.priority);
        const op: CmpOp = this.isMinHeap ? ">" : "<"; // PARENT <op> CHILD para swap

        steps.push({
          type: "compare",
          dir: "down",
          parentIndex: i,
          childIndex: best,
          parentId: parent.getId(),
          childId: child.getId(),
          op,
          swap: shouldSwap,
          array: this.toHeapArray(), // no muta
          note: `heapify-down`,
        });

        // Si no hay mejora, se corta; en práctica no debería ocurrir por cómo elegimos "best".
        if (!shouldSwap) break;

        this.swapPayload(i, best);
        steps.push({
          type: "swap",
          dir: "down",
          aIndex: i,
          bIndex: best,
          aId: parent.getId(),
          bId: child.getId(),
          array: this.toHeapArray(), // ← después del swap
          note: `swap payload`,
        });

        i = best;
      }
    }

    const transcript: DeleteTranscript = {
      kind: "delete",
      maxHeap,
      initial,
      steps,
      final: this.toHeapArray(),
      deleted: deletedSnap,
      deletedWasRoot,
      updatedRootId: this.nodes[0]?.getId() ?? null,
    };

    this.linkedRoot = null;
    return {
      deleted: deletedNodeSnapshot,
      updatedRoot: this.nodes[0] ?? null,
      deletedWasRoot,
      transcript,
    };
  }

  /* ───────── API pública: INSERT (compat) ───────── */

  public insertar(valor: T): NodoHeap<T> {
    const { node } = this.insertarConTranscript(valor);
    return node;
  }

  public insertarConLog(valor: T): {
    node: NodoHeap<T>;
    heapFix: HeapFixLog;
    transcript: InsertTranscript;
  } {
    const { node, transcript } = this.insertarConTranscript(valor);
    // Derivar heapFix solo con swaps (compat dibujador legacy).
    const heapFix: HeapFixLog = transcript.steps
      .filter((s): s is SwapStep => s.type === "swap")
      .map((s) => ({ type: "swap", aId: s.aId, bId: s.bId }) as any);
    return { node, heapFix, transcript };
  }
  /**
   * API pública: devuelve un transcript de Level-Order.
   * No muta nada; sirve para que la vista/animación sea determinista.
   */
  public getLevelOrderTranscript(): LevelOrderTranscript {
    const order = this.toHeapArray(); // [{id, value}] en orden level-order
    const snapshot = this.toIndexSnapshot(); // [{id, index}] índice denso 0..n-1
    return {
      kind: "levelOrder",
      order,
      snapshot,
      maxHeap: !this.isMinHeap,
    };
  }

  /* ───────── API pública: DELETE (compat) ───────── */

  public eliminarTopeConLog(): {
    deleted: NodoHeap<T>;
    updatedRoot: NodoHeap<T> | null;
    deletedWasRoot: boolean;
    heapFix: HeapFixLog;
    transcript: DeleteTranscript;
  } {
    if (this.esVacio())
      throw new Error("No fue posible eliminar: el heap está vacío.");
    const { deleted, updatedRoot, deletedWasRoot, transcript } =
      this.eliminarPorIndiceConTranscript(0);

    const heapFix: HeapFixLog = transcript.steps.flatMap((s) => {
      if (s.type === "replaceNode")
        return [
          { type: "replaceRoot", rootId: s.targetId, withId: s.withId } as any,
        ];
      if (s.type === "swap")
        return [{ type: "swap", aId: s.aId, bId: s.bId } as any];
      return [];
    });

    return { deleted, updatedRoot, deletedWasRoot, heapFix, transcript };
  }

  public eliminar(target: T | { id: string }): {
    deleted: NodoHeap<T>;
    updatedRoot: NodoHeap<T> | null;
    deletedWasRoot: boolean;
    heapFix: HeapFixLog;
    transcript: DeleteTranscript;
  } {
    if (this.esVacio())
      throw new Error("No fue posible eliminar: el heap está vacío.");

    // Resolver índice del elemento a eliminar (por id estable o por valor)
    const idx =
      typeof target === "object" && target !== null && "id" in target
        ? this.findIndexById((target as any).id)
        : this.findFirstIndexByValue(target as T);

    if (idx < 0)
      throw new Error("No fue posible eliminar: elemento/ID no encontrado.");

    // Ejecuta la eliminación real con transcript detallado
    const { deleted, updatedRoot, deletedWasRoot, transcript } =
      this.eliminarPorIndiceConTranscript(idx);

    // Derivar el log compacto para el motor de dibujo.
    const heapFix: HeapFixLog = transcript.steps.flatMap((s) => {
      if (s.type === "replaceNode") {
        return [
          (transcript.deletedWasRoot
            ? { type: "replaceRoot", rootId: s.targetId, withId: s.withId }
            : {
                type: "replaceNode",
                targetId: s.targetId,
                withId: s.withId,
              }) as any,
        ];
      }
      if (s.type === "swap") {
        return [{ type: "swap", aId: s.aId, bId: s.bId } as any];
      }
      return [];
    });

    return { deleted, updatedRoot, deletedWasRoot, heapFix, transcript };
  }

  /* ───────── API pública: SEARCH / BUILD / VIEW / CLEAN ───────── */

  public peek(): T | undefined {
    return this.nodes[0]?.priority;
  }
  public esta(valor: T): boolean {
    return this.nodes.some((n) => this.compare(n.priority, valor) === 0);
  }
  public getPeso(): number {
    return this.nodes.length;
  }
  public getCantidadHojas(): number {
    let count = 0,
      n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      const l = 2 * i + 1,
        r = 2 * i + 2;
      if (l >= n && r >= n) count++;
    }
    return count;
  }
  public contarHojas(): number {
    return this.getCantidadHojas();
  }
  public getTamanio(): number {
    return this.nodes.length;
  }
  public count(): number {
    return this.nodes.length;
  }
  public esVacio(): boolean {
    return this.nodes.length === 0;
  }
  public vaciar(): void {
    this.nodes = [];
    this.linkedRoot = null;
  }

  /**
   * Construye el heap desde una lista (heapify O(n)).
   * Inserta nodos en array y hace sift-down desde ⌊n/2⌋-1 → 0.
   */
  public build(values: Iterable<T>): void {
    this.nodes = Array.from(values, (v) => new NodoHeap<T>(v));
    for (let i = Math.floor(this.nodes.length / 2) - 1; i >= 0; i--) {
      const n = this.nodes.length;
      let k = i;
      while (true) {
        const l = this.left(k),
          r = this.right(k);
        let best = k;
        if (
          l < n &&
          this.better(this.nodes[l].priority, this.nodes[best].priority)
        )
          best = l;
        if (
          r < n &&
          this.better(this.nodes[r].priority, this.nodes[best].priority)
        )
          best = r;
        if (best !== k) {
          this.swapPayload(k, best);
          k = best;
        } else break;
      }
    }
    this.linkedRoot = null;
  }

  /**
   * Reemplaza el tope y repara el heap (sift-down). Devuelve el anterior tope.
   * No genera transcript (solo útil en lógica interna/benchmarks).
   */
  public reemplazarTope(valor: T): T | undefined {
    if (this.esVacio()) {
      this.insertar(valor);
      return undefined;
    }
    const prev = this.nodes[0].priority;
    this.nodes[0].priority = valor;
    (this.nodes[0] as any).value = valor as any;

    // reconstrucción rápida sin transcript
    const dummy: HeapFixLog = [];
    let i = 0,
      n = this.nodes.length;
    while (true) {
      const l = this.left(i),
        r = this.right(i);
      let best = i;
      if (
        l < n &&
        this.better(this.nodes[l].priority, this.nodes[best].priority)
      )
        best = l;
      if (
        r < n &&
        this.better(this.nodes[r].priority, this.nodes[best].priority)
      )
        best = r;
      if (best !== i) {
        this.swapPayload(i, best);
        dummy.push({
          type: "swap",
          aId: this.nodes[i].getId(),
          bId: this.nodes[best].getId(),
        } as any);
        i = best;
      } else break;
    }
    this.linkedRoot = null;
    return prev;
  }

  public toArray(): readonly T[] {
    return this.nodes.map((n) => n.priority);
  }

  public getRaiz(): NodoHeap<T> | null {
    this.relinkIfNeeded();
    return this.linkedRoot;
  }
  public getNodosPorNiveles(): Array<NodoHeap<T>> {
    return this.nodes.slice();
  }

  /** Recorridos sobre la estructura enlazada (útiles para inspección). */
  public inOrden(): Array<NodoHeap<T>> {
    const r = this.getRaiz();
    const res: NodoHeap<T>[] = [];
    const dfs = (n: NodoHeap<T> | null) => {
      if (!n) return;
      dfs(n.getLeft());
      res.push(n);
      dfs(n.getRight());
    };
    dfs(r);
    return res;
  }
  public preOrden(): Array<NodoHeap<T>> {
    const r = this.getRaiz();
    const res: NodoHeap<T>[] = [];
    const dfs = (n: NodoHeap<T> | null) => {
      if (!n) return;
      res.push(n);
      dfs(n.getLeft());
      dfs(n.getRight());
    };
    dfs(r);
    return res;
  }
  public postOrden(): Array<NodoHeap<T>> {
    const r = this.getRaiz();
    const res: NodoHeap<T>[] = [];
    const dfs = (n: NodoHeap<T> | null) => {
      if (!n) return;
      dfs(n.getLeft());
      dfs(n.getRight());
      res.push(n);
    };
    dfs(r);
    return res;
  }

  public getHojas(): Array<NodoHeap<T>> {
    const res: NodoHeap<T>[] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      const l = this.left(i),
        r = this.right(i);
      if (l >= this.nodes.length && r >= this.nodes.length)
        res.push(this.nodes[i]);
    }
    return res;
  }

  /** Altura (vacío→0; un nodo→1; n nodos→floor(log2(n))+1) */
  public getAltura(): number {
    const n = this.nodes.length;
    return n === 0 ? 0 : Math.floor(Math.log2(n)) + 1;
  }

  /** Vista jerárquica serializable (para D3 trees, debug, etc.). */
  public convertirEstructuraJerarquica(): any | null {
    const root = this.getRaiz();
    const build = (n: NodoHeap<T> | null): any | null => {
      if (!n) return null;
      const left = build(n.getLeft());
      const right = build(n.getRight());
      const children = [left, right].filter(Boolean);
      return {
        id: n.getId(),
        priority: n.priority,
        value: (n as any).value,
        children: children.length ? children : undefined,
      };
    };
    return build(root);
  }

  /** Clonado que **preserva IDs** (clave para que transcript y DOM calcen). */
  public clonePreservingIds(): ArbolHeap<T> {
    const c = new ArbolHeap<T>({
      min: this.isMinHeap,
      compare: this.compare,
      maxNodos: this.MAX_NODOS,
    });
    // copiamos los nodos conservando id y payload
    // @ts-ignore - as any para value auxiliar si lo usas
    c.nodes = this.nodes.map(
      (n) => new NodoHeap<T>(n.priority, (n as any).value, n.getId())
    );
    c.linkedRoot = null;
    return c;
  }

  /** Verificación defensiva de propiedad de heap (O(n)). */
  public validarHeap(): { ok: true } | { ok: false; i: number; why: string } {
    for (let i = 0; i < this.nodes.length; i++) {
      const l = this.left(i),
        r = this.right(i);
      if (l < this.nodes.length) {
        const ok = this.isMinHeap
          ? this.compare(this.nodes[i].priority, this.nodes[l].priority) <= 0
          : this.compare(this.nodes[i].priority, this.nodes[l].priority) >= 0;
        if (!ok)
          return {
            ok: false,
            i,
            why: `Violación con hijo izquierdo en índice ${l}`,
          };
      }
      if (r < this.nodes.length) {
        const ok = this.isMinHeap
          ? this.compare(this.nodes[i].priority, this.nodes[r].priority) <= 0
          : this.compare(this.nodes[i].priority, this.nodes[r].priority) >= 0;
        if (!ok)
          return {
            ok: false,
            i,
            why: `Violación con hijo derecho en índice ${r}`,
          };
      }
    }
    return { ok: true };
  }
}
