// src/shared/utils/estructures/ArbolAVL.ts
// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { EqualityFn, HierarchyNodeData } from "../../../types";
import { Cola } from "./Cola";
import { NodoAVL } from "../nodes/NodoAVL";
type RotationInfo = {
  type: "LL" | "LR" | "RR" | "RL";
  pivotId: string; // id del nodo que quedó como pivote tras el rebalanceo
  childId?: string; // id del hijo usado en la rotación doble (opcional)
};

/**
 * Árbol AVL (BST balanceado): inserciones y eliminaciones garantizan altura O(log n)
 * mediante rotaciones. Mantiene interfaz similar a ArbolBinario para facilitar
 * la integración con el simulador/renderer.
 */
export class ArbolAVL<T> {
  // Raíz del árbol
  private raiz: NodoAVL<T> | null;

  // Número de nodos
  private tamanio: number;

  // Límite para el simulador
  private readonly MAX_NODOS = 30;

  //guarda la última rotación detectada por rebalancear()
  private lastRotation: RotationInfo | null = null;
  /**
   * @param equals  Función de igualdad (para mensajes o utilidades). Por defecto a===b.
   * @param compare Función de comparación total (BST): <0 a<b, 0 a=b, >0 a>b.
   */
  constructor(
    private equals: EqualityFn<T> = (a, b) => a === b,
    private compare: (a: T, b: T) => number = defaultCompare
  ) {
    this.raiz = null;
    this.tamanio = 0;
  }

  /* ─────────────────────────────── API Pública ─────────────────────────────── */

  /**
   * Inserta un valor (BST) y rebalancea.
   * @throws Error si el valor ya existe o se supera MAX_NODOS.
   */
  public insertar(valor: T): NodoAVL<T> {
    this.clearLastRotation();
    if (this.tamanio >= this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
      );
    }
    if (this.esta(valor)) {
      throw new Error(
        `No fue posible insertar el nodo: El elemento ya existe en el árbol.`
      );
    }

    this.raiz = this.insertarRec(this.raiz, valor);
    this.tamanio++;
    return this.get(valor)!;
  }

  private lastDeletion: { removed?: NodoAVL<T>; updated?: NodoAVL<T> } = {};

  /**
   * Elimina un valor (BST) y rebalancea.
   * @throws Error si el árbol está vacío o el valor no existe.
   */
  public eliminar(valor: T): { removed: NodoAVL<T>; updated?: NodoAVL<T> } {
    this.clearLastRotation();
    if (this.esVacio()) {
      throw new Error(
        "No fue posible eliminar el nodo: El árbol encuentra vacío (cantidad de nodos: 0)."
      );
    }
    if (!this.esta(valor)) {
      throw new Error(
        "No fue posible eliminar el nodo: El elemento no existe en el árbol AVL."
      );
    }

    // Resetea el meta, elimina y rebalancea
    this.lastDeletion = {};
    this.raiz = this.eliminarRec(this.raiz, valor, this.lastDeletion);
    this.tamanio--;

    return {
      removed: this.lastDeletion.removed!,
      updated: this.lastDeletion.updated,
    };
  }

  /** Retorna true si existe el valor en el árbol. */
  public esta(valor: T): boolean {
    return this.get(valor) !== null;
  }

  /** Vacía el árbol. */
  public vaciar(): void {
    this.raiz = null;
    this.tamanio = 0;
    this.lastRotation = null; // opcional
    this.lastDeletion = {}; // opcional
  }

  /** True si no hay nodos. */
  public esVacio(): boolean {
    return this.raiz === null;
  }

  /** Altura del árbol. */
  public getAltura(): number {
    return this.getAlturaNodo(this.raiz);
  }

  /** Número de nodos. */
  public getPeso(): number {
    return this.tamanio;
  }

  /** Obtiene la raíz. */
  public getRaiz(): NodoAVL<T> | null {
    return this.raiz;
  }

  //para que el hook/renderer puedan leerla y limpiarla
  public getLastRotation(): RotationInfo | null {
    return this.lastRotation;
  }
  public clearLastRotation() {
    this.lastRotation = null;
  }

  /** Asigna la raíz. */
  public setRaiz(raiz: NodoAVL<T> | null): void {
    this.raiz = raiz;
  }

  /** Recorrido in-orden (ordenado). */
  public inOrden(): NodoAVL<T>[] {
    const out: NodoAVL<T>[] = [];
    this.inOrdenRec(this.raiz, out);
    return out;
  }

  /** Recorrido pre-orden. */
  public preOrden(): NodoAVL<T>[] {
    const out: NodoAVL<T>[] = [];
    this.preOrdenRec(this.raiz, out);
    return out;
  }

  /** Recorrido post-orden. */
  public postOrden(): NodoAVL<T>[] {
    const out: NodoAVL<T>[] = [];
    this.postOrdenRec(this.raiz, out);
    return out;
  }

  /** Recorrido por niveles (BFS). */
  public getNodosPorNiveles(): NodoAVL<T>[] {
    const nodos: NodoAVL<T>[] = [];
    if (!this.esVacio()) {
      const cola = new Cola<NodoAVL<T>>();
      cola.encolar(this.raiz!);
      while (!cola.esVacia()) {
        const x = cola.decolar().getValor();
        nodos.push(x);
        if (x.getIzq()) cola.encolar(x.getIzq() as NodoAVL<T>);
        if (x.getDer()) cola.encolar(x.getDer() as NodoAVL<T>);
      }
    }
    return nodos;
  }

  /** Convierte a estructura jerárquica con placeholders para el renderer. */
  public convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
    if (this.esVacio()) return null;
    return this.toHierarchy(this.raiz!);
  }

  /** Clona profundamente el árbol (incluye alturas). */
  public clonar(): ArbolAVL<T> {
    const nuevo = new ArbolAVL<T>(this.equals, this.compare);
    nuevo.setRaiz(this.clonarNodo(this.raiz));
    nuevo.tamanio = this.tamanio;
    return nuevo;
  }

  /** Devuelve el nodo con cierto valor, o null si no existe. */
  public get(valor: T): NodoAVL<T> | null {
    let cur = this.raiz;
    while (cur) {
      const cmp = this.compare(valor, cur.getInfo());
      if (cmp === 0) return cur;
      cur =
        cmp < 0
          ? (cur.getIzq() as NodoAVL<T> | null)
          : (cur.getDer() as NodoAVL<T> | null);
    }
    return null;
  }

  /* ────────────────────────── Balanceo y Rotaciones ───────────────────────── */

  private getAlturaNodo(n: NodoAVL<T> | null): number {
    return n ? n.getAltura() : 0;
  }

  private actualizarAltura(n: NodoAVL<T> | null): void {
    if (!n) return;
    const hi = this.getAlturaNodo(n.getIzq() as NodoAVL<T> | null);
    const hd = this.getAlturaNodo(n.getDer() as NodoAVL<T> | null);
    n.setAltura(Math.max(hi, hd) + 1);
  }

  private factorBalance(n: NodoAVL<T> | null): number {
    if (!n) return 0;
    return (
      this.getAlturaNodo(n.getIzq() as NodoAVL<T> | null) -
      this.getAlturaNodo(n.getDer() as NodoAVL<T> | null)
    );
  }

  private rotacionDerecha(y: NodoAVL<T>): NodoAVL<T> {
    const x = y.getIzq() as NodoAVL<T>;
    const T2 = x.getDer() as NodoAVL<T> | null;

    x.setDer(y);
    y.setIzq(T2);

    this.actualizarAltura(y);
    this.actualizarAltura(x);
    return x;
  }

  private rotacionIzquierda(x: NodoAVL<T>): NodoAVL<T> {
    const y = x.getDer() as NodoAVL<T>;
    const T2 = y.getIzq() as NodoAVL<T> | null;

    y.setIzq(x);
    x.setDer(T2);

    this.actualizarAltura(x);
    this.actualizarAltura(y);
    return y;
  }

  private rebalancear(n: NodoAVL<T>): NodoAVL<T> {
    this.actualizarAltura(n);
    const bf = this.factorBalance(n);

    // Izquierda pesada
    if (bf > 1) {
      const izq = n.getIzq() as NodoAVL<T>;
      if (this.factorBalance(izq) < 0) {
        // LR
        this.lastRotation = {
          type: "LR",
          pivotId: n.getId(),
          childId: izq.getId(),
        };
        n.setIzq(this.rotacionIzquierda(izq));
        return this.rotacionDerecha(n);
      } else {
        // LL
        this.lastRotation = {
          type: "LL",
          pivotId: n.getId(),
          childId: izq.getId(),
        };
        return this.rotacionDerecha(n);
      }
    }

    // Derecha pesada
    if (bf < -1) {
      const der = n.getDer() as NodoAVL<T>;
      if (this.factorBalance(der) > 0) {
        // RL
        this.lastRotation = {
          type: "RL",
          pivotId: n.getId(),
          childId: der.getId(),
        };
        n.setDer(this.rotacionDerecha(der));
        return this.rotacionIzquierda(n);
      } else {
        // RR
        this.lastRotation = {
          type: "RR",
          pivotId: n.getId(),
          childId: der.getId(),
        };
        return this.rotacionIzquierda(n);
      }
    }

    return n;
  }

  /* ──────────────────────── Inserción / Eliminación ───────────────────────── */

  private insertarRec(root: NodoAVL<T> | null, valor: T): NodoAVL<T> {
    if (!root) return new NodoAVL<T>(valor);

    const cmp = this.compare(valor, root.getInfo());
    if (cmp < 0) {
      root.setIzq(this.insertarRec(root.getIzq() as NodoAVL<T> | null, valor));
    } else if (cmp > 0) {
      root.setDer(this.insertarRec(root.getDer() as NodoAVL<T> | null, valor));
    } else {
      // Duplicado (ya validado arriba). No hace nada.
      return root;
    }

    return this.rebalancear(root);
  }

  private eliminarRec(
    root: NodoAVL<T> | null,
    valor: T,
    meta: { removed?: NodoAVL<T>; updated?: NodoAVL<T> }
  ): NodoAVL<T> | null {
    if (!root) return null;

    const cmp = this.compare(valor, root.getInfo());
    if (cmp < 0) {
      root.setIzq(
        this.eliminarRec(root.getIzq() as NodoAVL<T> | null, valor, meta)
      );
    } else if (cmp > 0) {
      root.setDer(
        this.eliminarRec(root.getDer() as NodoAVL<T> | null, valor, meta)
      );
    } else {
      // Encontrado
      const izq = root.getIzq() as NodoAVL<T> | null;
      const der = root.getDer() as NodoAVL<T> | null;

      // 0 ó 1 hijo: el eliminado físico es "root"
      if (!izq || !der) {
        meta.removed = root;
        const unico = izq ?? der; // si es hoja => null
        return unico ? this.rebalancear(unico) : null;
      }

      // 2 hijos: copiar valor del sucesor y eliminar físicamente al sucesor
      const succ = this.minNodo(der);
      meta.updated = root; // éste copia el valor
      meta.removed = succ; // éste se elimina físicamente

      root.setInfo(succ.getInfo()); // conserva el id del nodo root
      root.setDer(this.eliminarRec(der, succ.getInfo(), meta));
      return this.rebalancear(root);
    }

    return this.rebalancear(root);
  }

  private minNodo(root: NodoAVL<T>): NodoAVL<T> {
    let cur = root;
    while (cur.getIzq() !== null) cur = cur.getIzq() as NodoAVL<T>;
    return cur;
  }

  /* ───────────────────────────── Recorridos ──────────────────────────────── */

  private inOrdenRec(root: NodoAVL<T> | null, out: NodoAVL<T>[]) {
    if (!root) return;
    this.inOrdenRec(root.getIzq() as NodoAVL<T> | null, out);
    out.push(root);
    this.inOrdenRec(root.getDer() as NodoAVL<T> | null, out);
  }

  private preOrdenRec(root: NodoAVL<T> | null, out: NodoAVL<T>[]) {
    if (!root) return;
    out.push(root);
    this.preOrdenRec(root.getIzq() as NodoAVL<T> | null, out);
    this.preOrdenRec(root.getDer() as NodoAVL<T> | null, out);
  }

  private postOrdenRec(root: NodoAVL<T> | null, out: NodoAVL<T>[]) {
    if (!root) return;
    this.postOrdenRec(root.getIzq() as NodoAVL<T> | null, out);
    this.postOrdenRec(root.getDer() as NodoAVL<T> | null, out);
    out.push(root);
  }

  // ----- API pública extra para las tarjetas -----

  /** Tamaño actual del árbol (por si alguna tarjeta usa "Tamaño"). */
  public getTamanio(): number {
    return this.tamanio;
  }

  /** Cantidad de nodos hoja. */
  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }

  /** Devuelve un arreglo con todos los nodos hoja (opcional, por si lo usas). */
  public getHojas(): NodoAVL<T>[] {
    const hojas: NodoAVL<T>[] = [];
    this.getArrayHojas(this.raiz, hojas);
    return hojas;
  }

  // ----- Helpers privados -----

  private contarHojasAux(root: NodoAVL<T> | null): number {
    if (!root) return 0;
    const izq = root.getIzq() as NodoAVL<T> | null;
    const der = root.getDer() as NodoAVL<T> | null;
    if (!izq && !der) return 1; // es hoja
    return this.contarHojasAux(izq) + this.contarHojasAux(der);
  }

  private getArrayHojas(root: NodoAVL<T> | null, hojas: NodoAVL<T>[]): void {
    if (!root) return;
    const izq = root.getIzq() as NodoAVL<T> | null;
    const der = root.getDer() as NodoAVL<T> | null;
    if (!izq && !der) {
      hojas.push(root);
    } else {
      this.getArrayHojas(izq, hojas);
      this.getArrayHojas(der, hojas);
    }
  }

  /* ─────────────── Conversión a Jerarquía para la Visualización ───────────── */

  private toHierarchy(root: NodoAVL<T>): HierarchyNodeData<T> {
    const left = root.getIzq()
      ? this.toHierarchy(root.getIzq() as NodoAVL<T>)
      : null;
    const right = root.getDer()
      ? this.toHierarchy(root.getDer() as NodoAVL<T>)
      : null;

    let children: HierarchyNodeData<T>[] | undefined;
    if (left && right) {
      children = [left, right];
    } else if (left && !right) {
      children = [left, this.createPlaceholder(root, "right")];
    } else if (!left && right) {
      children = [this.createPlaceholder(root, "left"), right];
    } else {
      children = undefined;
    }

    return {
      id: root.getId(),
      value: root.getInfo(),
      children,
      bf: this.factorBalance(root),
      height: root.getAltura(),
    };
  }

  private createPlaceholder(
    parent: NodoAVL<T>,
    side: "left" | "right"
  ): HierarchyNodeData<T> {
    return {
      id: `${parent.getId()}-ph${side === "left" ? "L" : "R"}`,
      isPlaceholder: true,
    };
  }

  /* ─────────────────────────────── Clonado ──────────────────────────────── */

  private clonarNodo(root: NodoAVL<T> | null): NodoAVL<T> | null {
    if (!root) return null;
    const nuevo = new NodoAVL<T>(root.getInfo(), root.getId());
    nuevo.setAltura(root.getAltura());
    nuevo.setIzq(this.clonarNodo(root.getIzq() as NodoAVL<T> | null));
    nuevo.setDer(this.clonarNodo(root.getDer() as NodoAVL<T> | null));
    return nuevo;
  }
}

/* ──────────────────────────── Utilidades locales ─────────────────────────── */

function defaultCompare(a: any, b: any): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  // Fallback genérico (no recomendado para tipos complejos)
  return `${a}`.localeCompare(`${b}`);
}
