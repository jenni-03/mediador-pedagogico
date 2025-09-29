// Nodo especializado para Heaps (max o min) con soporte para visualización.
// Pensado para transcripts JSON de animación (D3) y swaps de payload.

import { v4 as uuidv4 } from "uuid";

/** Paquete de datos del nodo (prioridad + valor). En un heap típico prioridad === valor. */
export interface HeapPayload<TP, TV = TP> {
  priority: TP; // clave con la que comparas en el heap
  value: TV; // dato asociado (opcional, por defecto = priority)
}

/** Estructuras mínimas útiles para transcripts y depuración */
export type HeapItem<TP = number> = { id: string; value: TP };
export type HeapLevelItem<TP = number> = {
  index: number;
  id: string;
  value: TP;
};

/** Ítems “amigables con D3” (siempre value numérico) */
export type HeapDrawItem = { id: string; value: number };
export type HeapDrawLevelItem = { id: string; value: number; index: number };

/** Nodo para un árbol Heap (binario). Incluye parent/left/right e índice opcional. */
export class NodoHeap<TP, TV = TP> {
  private readonly id: string;
  private payload: HeapPayload<TP, TV>;

  private parent: NodoHeap<TP, TV> | null = null;
  private left: NodoHeap<TP, TV> | null = null;
  private right: NodoHeap<TP, TV> | null = null;

  /** Índice de nivel-orden (coincidente con el array del heap si proyectas). */
  private _index: number | null = null;

  constructor(priority: TP, value?: TV, id?: string) {
    this.id = id ?? `heap-${uuidv4()}`; // id estable para empatar con el DOM
    // Si no se provee value, se asume que priority es el dato.
    this.payload = { priority, value: value ?? (priority as unknown as TV) };
  }

  /* ───────────── Getters/Setters ───────────── */

  /** Identificador único (útil para keys/animaciones). */
  public getId(): string {
    return this.id;
  }

  /** Prioridad del nodo (clave de comparación del heap). */
  public get priority(): TP {
    return this.payload.priority;
  }
  public set priority(p: TP) {
    this.payload.priority = p;
  }

  /** Valor asociado (carga útil). */
  public get value(): TV {
    return this.payload.value;
  }
  public set value(v: TV) {
    this.payload.value = v;
  }

  /** Acceso al payload completo (por si necesitas copiar/clonar). */
  public getPayload(): Readonly<HeapPayload<TP, TV>> {
    return this.payload;
  }
  public setPayload(payload: HeapPayload<TP, TV>): void {
    this.payload = { ...payload };
  }

  /** Punteros estructurales. */
  public getParent(): NodoHeap<TP, TV> | null {
    return this.parent;
  }
  public getLeft(): NodoHeap<TP, TV> | null {
    return this.left;
  }
  public getRight(): NodoHeap<TP, TV> | null {
    return this.right;
  }

  /** Índice opcional (sincronizado con el array si usas proyección). */
  public get index(): number | null {
    return this._index;
  }
  public set index(i: number | null) {
    this._index = i;
  }

  /** Utilidades de estado. */
  public isLeaf(): boolean {
    return !this.left && !this.right;
  }
  public degree(): 0 | 1 | 2 {
    return ((this.left ? 1 : 0) + (this.right ? 1 : 0)) as 0 | 1 | 2;
  }

  /* ───────────── Enlace seguro de hijos ───────────── */

  /** Conecta un hijo izquierdo (actualiza parent del hijo y libera el anterior). */
  public attachLeft(child: NodoHeap<TP, TV> | null): void {
    if (child === this)
      throw new Error("No se puede autoconectar como hijo izquierdo.");
    if (this.left) this.left.parent = null;
    if (child && child.parent) child.detachFromParent();
    this.left = child;
    if (child) child.parent = this;
  }

  /** Conecta un hijo derecho (actualiza parent del hijo y libera el anterior). */
  public attachRight(child: NodoHeap<TP, TV> | null): void {
    if (child === this)
      throw new Error("No se puede autoconectar como hijo derecho.");
    if (this.right) this.right.parent = null;
    if (child && child.parent) child.detachFromParent();
    this.right = child;
    if (child) child.parent = this;
  }

  /** Desconecta este nodo de su padre (si lo tiene). */
  public detachFromParent(): void {
    if (!this.parent) return;
    if (this.parent.left === this) this.parent.left = null;
    if (this.parent.right === this) this.parent.right = null;
    this.parent = null;
  }

  /* ───────────── Operación idiomática para heaps ───────────── */

  /**
   * Intercambia **solo la carga útil (priority/value)** con otro nodo.
   * Recomendado para heapify-up/down: mantienes la forma del árbol
   * sin reestructurar punteros. Perfecto para animación “payload”.
   */
  public swapPayloadWith(other: NodoHeap<TP, TV>): void {
    const tp = this.payload.priority;
    this.payload.priority = other.payload.priority;
    other.payload.priority = tp;

    const tv = this.payload.value;
    this.payload.value = other.payload.value;
    other.payload.value = tv;
  }

  /* ───────────── Serializaciones “amigables con D3” ───────────── */

  /** Conversor defensivo a número (por si TP no es number) */
  private static asNumber(x: unknown): number {
    if (typeof x === "number") return x;
    const n = Number(x as any);
    return Number.isFinite(n) ? n : 0;
  }

  /** Item minimalista para transcripts: {id, value:number} */
  public toDrawItem(): HeapDrawItem {
    return { id: this.id, value: NodoHeap.asNumber(this.payload.priority) };
  }

  /** Item con índice para level-order: {index, id, value:number} */
  public toDrawLevelItem(): HeapDrawLevelItem {
    return {
      index: this._index ?? -1,
      id: this.id,
      value: NodoHeap.asNumber(this.payload.priority),
    };
  }

  /** Mantengo tus métodos originales por compatibilidad */
  public toItem(): HeapItem<TP> {
    return { id: this.id, value: this.payload.priority as unknown as TP };
  }

  public toLevelItem(): HeapLevelItem<TP> {
    return {
      index: this._index ?? -1,
      id: this.id,
      value: this.payload.priority as unknown as TP,
    };
  }

  /** Vista serializable rica (para debugging/inspección). */
  public toJSON(): object {
    return {
      id: this.id,
      index: this._index,
      priority: this.payload.priority,
      value: this.payload.value,
      parent: this.parent?.id ?? null,
      left: this.left?.id ?? null,
      right: this.right?.id ?? null,
    };
  }

  /** Texto corto para depuración. */
  public toString(): string {
    return `NodoHeap(id=${this.id}, idx=${this._index}, prio=${String(
      this.payload.priority
    )})`;
  }

  /* ───────────── Utilidades estáticas (construcción y snapshots) ───────────── */

  /**
   * Enlaza nodos dados en **orden por niveles (level-order)** como árbol binario completo.
   * También asigna `index` coherente (0..n-1).
   * @returns La raíz o null si `nodes` está vacío.
   */
  public static linkAsCompleteBinaryTree<TP, TV>(
    nodes: Array<NodoHeap<TP, TV>>
  ): NodoHeap<TP, TV> | null {
    if (nodes.length === 0) return null;

    // Limpia enlaces previos para evitar residuos
    for (const n of nodes) {
      n.parent = null;
      n.left = null;
      n.right = null;
      n._index = null;
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node._index = i;
      const li = 2 * i + 1;
      const ri = 2 * i + 2;
      if (li < nodes.length) node.attachLeft(nodes[li]);
      if (ri < nodes.length) node.attachRight(nodes[ri]);
    }
    return nodes[0];
  }

  /** Recorre level-order desde una raíz (nodos vivos). */
  public static levelOrderFromRoot<TP, TV>(
    root: NodoHeap<TP, TV> | null
  ): Array<NodoHeap<TP, TV>> {
    const out: Array<NodoHeap<TP, TV>> = [];
    if (!root) return out;
    const q: Array<NodoHeap<TP, TV>> = [root];
    while (q.length) {
      const n = q.shift()!;
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  }

  /** Snapshot level-order para transcripts (indices 0..n-1 y value numérico). */
  public static snapshotDrawLevel<TP, TV>(
    root: NodoHeap<TP, TV> | null
  ): HeapDrawLevelItem[] {
    const nodes = NodoHeap.levelOrderFromRoot(root);
    nodes.forEach((n, i) => (n._index = i)); // asegura índices coherentes
    return nodes.map((n) => n.toDrawLevelItem());
  }

  /** Calcula índices de hijos para un índice i (modelo array). */
  public static childrenIndexOf(i: number): { left: number; right: number } {
    return { left: 2 * i + 1, right: 2 * i + 2 };
  }

  /** Calcula índice del padre para un índice i (modelo array). */
  public static parentIndexOf(i: number): number {
    if (i <= 0) return -1;
    return Math.floor((i - 1) / 2);
  }
}
