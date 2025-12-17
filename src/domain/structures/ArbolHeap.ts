import { Comparator, HeapFixLog } from "../utils/types";
import { defaultComparator } from "../utils/treeUtils";
import { NodoHeap } from "../nodes/NodoHeap";
import { DomainError } from "../error/DomainError";

/* ─────────────────────────── Tipos auxiliares para UI/transcripts ─────────────────────────── */

type HeapItem = { id: string; value: number };
type HeapArray = HeapItem[];

type CmpOp = ">" | "<" | ">=" | "<=" | "==";

/** Paso de comparación PARENT <op> CHILD (no muta el heap). */
type CompareStep = {
  type: "compare";
  /** Dirección del heapify: subir (up) o bajar (down). */
  dir: "up" | "down";
  /** El operador siempre se expresa como PARENT <op> CHILD para la UI. */
  parentIndex: number;
  childIndex: number;
  parentId: string;
  childId: string;
  /** Operador para dibujar (no implica verdad/falsedad). */
  op: CmpOp;
  /** Hint: true si después de esta comparación habrá swap. */
  swap?: boolean;
  /** Snapshot del estado DESPUÉS del paso (no muta, coincide con “antes”). */
  array: HeapArray;
  note: string;
};

/** Paso de intercambio de payload entre dos nodos. */
type SwapStep = {
  type: "swap";
  dir: "up" | "down";
  aIndex: number;
  bIndex: number;
  aId: string;
  bId: string;
  /** Snapshot del estado DESPUÉS del swap. */
  array: HeapArray;
  note: string;
};

/** Paso donde se decide qué hijo comparar contra el padre en heapify-down. */
type PickChildStep = {
  type: "pickChild";
  parentIndex: number;
  leftIndex?: number;
  rightIndex?: number;
  leftId?: string;
  rightId?: string;
  /** Hijo elegido para comparar contra el padre. */
  chosen?: "left" | "right" | "none";
  /** Snapshot del estado DESPUÉS del paso (no muta estructura). */
  array: HeapArray;
  note: string;
};

/** Pasos de inserción: append + compare/swap (heapify-up). */
type InsertStep =
  | {
      type: "append";
      index: number; // índice donde se apendea (level-order)
      item: HeapItem;
      /** Snapshot del estado DESPUÉS del append. */
      array: HeapArray;
      note: string;
    }
  | PickChildStep // no se usa en insert, pero se deja por compatibilidad de tipos
  | CompareStep
  | SwapStep;

export type InsertTranscript = {
  kind: "insert";
  /** true → max-heap; false → min-heap (para pintar símbolos en UI). */
  maxHeap: boolean;
  initial: HeapArray;
  steps: InsertStep[];
  final: HeapArray;
  inserted: HeapItem;
};

/** Pasos DELETE: selección, reemplazo, eliminación física y heapify. */
type DeleteStep =
  | {
      type: "selectTarget";
      targetIndex: number;
      targetId: string;
      /** Snapshot del estado DESPUÉS del select (no muta). */
      array: HeapArray;
      note: string;
    }
  | {
      type: "replaceNode";
      targetId: string;
      withId: string;
      /** Posición original del que reemplaza (último antes de subir). */
      withIndex?: number;
      /** Snapshot del estado DESPUÉS de colocar el reemplazante en targetIndex. */
      array: HeapArray;
      note: string;
    }
  | {
      type: "removeLast";
      removedId: string;
      /** Snapshot del estado DESPUÉS de eliminar físicamente el último. */
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

/** Recorrido por niveles para UI (no muta la estructura). */
export type LevelOrderTranscript = {
  kind: "levelOrder";
  /** Orden de visita en level-order (solo IDs + value numérico para la vista). */
  order: Array<{ id: string; value: number }>;
  /**
   * Snapshot opcional con índices densos para tejer links estables.
   * index es 0..n-1 en level-order.
   */
  snapshot: Array<{ id: string; index: number; hidden?: boolean }>;
  /** true → max-heap; false → min-heap (para símbolos). */
  maxHeap: boolean;
};

/* ─────────────────────────── Errores de dominio del heap ─────────────────────────── */

/**
 * Códigos de dominio para el Árbol Heap.
 * Estos se pueden mapear a errorPlans del pseudocódigo / UI.
 */
export type HeapErrorCode =
  | "HEAP_EMPTY" // operación sobre heap vacío
  | "TARGET_NOT_FOUND" // intento de eliminar elemento/ID inexistente
  | "MAX_NODES_REACHED"; // se supera el límite de nodos permitido

/* ─────────────────────────── Opciones de construcción ─────────────────────────── */

export interface HeapOptions<T> {
  /** Comparador total y estable: (a,b) → negativo, cero o positivo. */
  compare?: Comparator<T>;
  /** true → min-heap; false|undefined → max-heap. */
  min?: boolean;
  /** Límite de nodos por seguridad / visualización. */
  maxNodos?: number;
}

/* ─────────────────────────── Clase ArbolHeap ─────────────────────────── */

export class ArbolHeap<T> {
  public readonly MAX_NODOS: number;
  private readonly compare: Comparator<T>;
  private readonly isMinHeap: boolean;
  /** Representación base del heap: array en level-order. */
  private nodes: Array<NodoHeap<T>> = [];
  /** Raíz enlazada (solo para recorridos estructurales). */
  private linkedRoot: NodoHeap<T> | null = null;

  constructor(opts: HeapOptions<T> = {}) {
    this.compare = opts.compare ?? defaultComparator;
    this.isMinHeap = opts.min ?? false;
    this.MAX_NODOS = opts.maxNodos ?? 150;
  }

  /** Lanza un DomainError con mensaje y código de heap. */
  private raise(message: string, code: HeapErrorCode): never {
    throw new DomainError(message, code);
  }

  /* ───────── utilidades internas básicas ───────── */

  /** Devuelve true si `a` es "mejor" que `b` según el tipo de heap (min o max). */
  private better(a: T, b: T): boolean {
    const c = this.compare(a, b);
    return this.isMinHeap ? c < 0 : c > 0;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  /** Intercambia solo el payload (priority/value) de dos nodos. */
  private swapPayload(i: number, j: number): void {
    this.nodes[i].swapPayloadWith(this.nodes[j]);
  }

  /** Busca el primer índice cuyo valor sea igual (según compare) al buscado. */
  private findFirstIndexByValue(value: T): number {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.compare(this.nodes[i].priority, value) === 0) return i;
    }
    return -1;
  }

  /** Busca un nodo por ID estable (útil para animación). */
  private findIndexById(id: string): number {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].getId() === id) return i;
    }
    return -1;
  }

  /** Conversión numérica defensiva para snapshots D3. */
  private num(x: unknown): number {
    if (typeof x === "number") return Number.isFinite(x) ? x : 0;
    const n = Number(x as any);
    return Number.isFinite(n) ? n : 0;
  }

  /** Snapshot level-order minimalista: {id, value:number}. */
  private toHeapArray(): HeapArray {
    return this.nodes.map((n) => ({
      id: n.getId(),
      value: this.num(n.priority as any),
    }));
  }

  /** Snapshot por índice denso: [{id, index}] para la posición level-order actual. */
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

  /** Enlaza punteros parent/left/right solo cuando cambie el tamaño del array. */
  private relinkIfNeeded(): void {
    if (this.linkedRoot && this.count() === this.countLinked()) return;
    this.linkedRoot = NodoHeap.linkAsCompleteBinaryTree(this.nodes);
  }

  /** Cuenta nodos en la versión enlazada (para saber si está desactualizada). */
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

  /* ─────────────────────────── Inserción ─────────────────────────── */

  /**
   * Inserta un valor devolviendo el nodo y un transcript de pasos:
   * append → (compare↑/swap↑)* → final.
   * En cada paso, `array` refleja el estado DESPUÉS del paso.
   *
   * @throws DomainError("MAX_NODES_REACHED") si se supera el límite de nodos.
   */
  public insertarConTranscript(valor: T): {
    node: NodoHeap<T>;
    transcript: InsertTranscript;
  } {
    if (this.count() >= this.MAX_NODOS) {
      this.raise(
        `No fue posible insertar: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`,
        "MAX_NODES_REACHED"
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
      array: this.toHeapArray(), // estado después del append
      note: "append",
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
        note: "heapify-up",
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
        array: this.toHeapArray(), // después del swap
        note: "swap payload",
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

  /** Inserta sin transcript (atajo para lógica que no necesita animación). */
  public insertar(valor: T): NodoHeap<T> {
    const { node } = this.insertarConTranscript(valor);
    return node;
  }

  /**
   * Inserta devolviendo:
   * - node (NodoHeap)
   * - heapFix: log compacto de swaps para dibujador legacy
   * - transcript: pasos detallados para el simulador nuevo
   */
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

  /* ─────────────────────────── Delete interno con transcript ─────────────────────────── */

  /**
   * Elimina por índice devolviendo transcript pedagógico:
   * selectTarget → replaceNode → removeLast → heapify (up|down) → final.
   * En cada paso, `array` refleja el estado DESPUÉS del paso.
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
      note: "select target",
    });

    // Snapshot del nodo eliminado preservando el ID original (para devolverlo).
    const deletedNodeSnapshot = new NodoHeap<T>(
      target.priority,
      (target as any).value,
      target.getId()
    );

    // Caso trivial: un solo nodo.
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

    // Si el target ya es el último, solo se elimina.
    if (idx === lastIdx) {
      this.nodes.pop();
      steps.push({
        type: "removeLast",
        removedId: target.getId(),
        array: this.toHeapArray(), // después de eliminar la hoja
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

    // A) Mover el OBJETO del último al hueco (el id "last" pasa a ocupar idx).
    this.nodes[idx] = last;

    // B) Emitir replaceNode con el snapshot del estado YA reemplazado.
    steps.push({
      type: "replaceNode",
      targetId: target.getId(),
      withId: last.getId(),
      withIndex: lastIdx,
      array: this.toHeapArray(),
      note: "replace target with last",
    });

    // C) Eliminar físicamente el último.
    this.nodes.pop();
    steps.push({
      type: "removeLast",
      removedId: last.getId(),
      array: this.toHeapArray(),
      note: "remove physical last",
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
        const op: CmpOp = this.isMinHeap ? ">" : "<";

        steps.push({
          type: "compare",
          dir: "up",
          parentIndex: pp,
          childIndex: i,
          parentId: parent.getId(),
          childId: child.getId(),
          op,
          swap: shouldSwap,
          array: this.toHeapArray(),
          note: "heapify-up",
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
          array: this.toHeapArray(),
          note: "swap payload",
        });

        i = pp;
      }
    } else {
      // heapify-down
      let i = idx;
      const n2 = this.nodes.length;

      while (true) {
        const l = this.left(i);
        const r = this.right(i);

        steps.push({
          type: "pickChild",
          parentIndex: i,
          leftIndex: l < n2 ? l : undefined,
          rightIndex: r < n2 ? r : undefined,
          leftId: l < n2 ? this.nodes[l].getId() : undefined,
          rightId: r < n2 ? this.nodes[r].getId() : undefined,
          chosen: undefined, // se rellena tras decidir
          array: this.toHeapArray(),
          note: "pick child",
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

        const parent = this.nodes[i];
        const child = this.nodes[best];
        const shouldSwap = this.better(child.priority, parent.priority);
        const op: CmpOp = this.isMinHeap ? ">" : "<";

        steps.push({
          type: "compare",
          dir: "down",
          parentIndex: i,
          childIndex: best,
          parentId: parent.getId(),
          childId: child.getId(),
          op,
          swap: shouldSwap,
          array: this.toHeapArray(),
          note: "heapify-down",
        });

        if (!shouldSwap) break;

        this.swapPayload(i, best);
        steps.push({
          type: "swap",
          dir: "down",
          aIndex: i,
          bIndex: best,
          aId: parent.getId(),
          bId: child.getId(),
          array: this.toHeapArray(),
          note: "swap payload",
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

  /* ─────────────────────────── API pública de delete ─────────────────────────── */

  /**
   * Elimina el tope del heap devolviendo:
   * - deleted: nodo eliminado
   * - updatedRoot: nueva raíz (si existe)
   * - heapFix: log compacto para dibujador legacy
   * - transcript: pasos detallados
   *
   * @throws DomainError("HEAP_EMPTY") si el heap está vacío.
   */
  public eliminarTopeConLog(): {
    deleted: NodoHeap<T>;
    updatedRoot: NodoHeap<T> | null;
    deletedWasRoot: boolean;
    heapFix: HeapFixLog;
    transcript: DeleteTranscript;
  } {
    if (this.esVacio()) {
      this.raise("No fue posible eliminar: el heap está vacío.", "HEAP_EMPTY");
    }

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

  /**
   * Elimina un elemento específico (por valor o por ID estable).
   *
   * @throws DomainError("HEAP_EMPTY") si el heap está vacío.
   * @throws DomainError("TARGET_NOT_FOUND") si el valor/ID no existe en el heap.
   */
  public eliminar(target: T | { id: string }): {
    deleted: NodoHeap<T>;
    updatedRoot: NodoHeap<T> | null;
    deletedWasRoot: boolean;
    heapFix: HeapFixLog;
    transcript: DeleteTranscript;
  } {
    if (this.esVacio()) {
      this.raise("No fue posible eliminar: el heap está vacío.", "HEAP_EMPTY");
    }

    // Resolver índice del elemento a eliminar (por id estable o por valor).
    const idx =
      typeof target === "object" && target !== null && "id" in target
        ? this.findIndexById((target as any).id)
        : this.findFirstIndexByValue(target as T);

    if (idx < 0) {
      this.raise(
        "No fue posible eliminar: elemento/ID no encontrado.",
        "TARGET_NOT_FOUND"
      );
    }

    const { deleted, updatedRoot, deletedWasRoot, transcript } =
      this.eliminarPorIndiceConTranscript(idx);

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

  /* ─────────────────────────── Consultas y métricas ─────────────────────────── */

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
    let count = 0;
    const n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
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

  /* ─────────────────────────── Build / heapify O(n) ─────────────────────────── */

  /**
   * Construye el heap desde una lista (heapify O(n)).
   * Inserta nodos en array y hace sift-down desde ⌊n/2⌋-1 → 0.
   *
   * @throws DomainError("MAX_NODES_REACHED") si values excede MAX_NODOS.
   */
  public build(values: Iterable<T>): void {
    const nodes = Array.from(values, (v) => new NodoHeap<T>(v));
    if (nodes.length > this.MAX_NODOS) {
      this.raise(
        `No fue posible construir el heap: tamaño inicial (${nodes.length}) supera el máximo permitido (${this.MAX_NODOS}).`,
        "MAX_NODES_REACHED"
      );
    }

    this.nodes = nodes;

    for (let i = Math.floor(this.nodes.length / 2) - 1; i >= 0; i--) {
      const n = this.nodes.length;
      let k = i;
      while (true) {
        const l = this.left(k);
        const r = this.right(k);
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
    let i = 0;
    const n = this.nodes.length;

    while (true) {
      const l = this.left(i);
      const r = this.right(i);
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

  /* ─────────────────────────── Vista estructural (árbol enlazado) ─────────────────────────── */

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
      const l = this.left(i);
      const r = this.right(i);
      if (l >= this.nodes.length && r >= this.nodes.length) {
        res.push(this.nodes[i]);
      }
    }
    return res;
  }

  /** Altura (vacío→0; un nodo→1; n nodos→floor(log2(n))+1). */
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

  /** Clonado que preserva IDs (clave para que transcript y DOM calcen). */
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

  /** Verificación defensiva de la propiedad de heap (O(n)). */
  public validarHeap(): { ok: true } | { ok: false; i: number; why: string } {
    for (let i = 0; i < this.nodes.length; i++) {
      const l = this.left(i);
      const r = this.right(i);

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

  /* ─────────────────────────── Level-order para UI ─────────────────────────── */

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
}
