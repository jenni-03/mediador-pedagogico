import { EqualityFn, HierarchyNodeData } from "../../../types";
import { Cola } from "./Cola";
import { NodoNario } from "../nodes/NodoNario";
import { DomainError } from "../error/DomainError";

/**
 * Códigos de error de dominio para el Árbol N-ario.
 * Deben corresponder (cuando aplique) con los `errorPlans` del pseudocódigo.
 */
export type NaryErrorCode =
  | "ROOT_ALREADY_EXISTS"
  | "TREE_NOT_CREATED"
  | "MAX_NODES_REACHED"
  | "PARENT_NOT_FOUND"
  | "NODE_NOT_FOUND"
  | "SAME_ORIGIN_AND_DESTINATION"
  | "MOVE_CREATES_CYCLE"
  | "MOVE_ROOT_FORBIDDEN"
  | "TREE_EMPTY"
  | "VALUE_NOT_FOUND"
  | "INCONSISTENT_TREE";

/**
 * Árbol N-ario genérico.
 */
export class ArbolNario<T> {
  private raiz: NodoNario<T> | null = null;
  private tamanio = 0;

  private readonly MAX_NODOS = 150;

  constructor(private equals: EqualityFn<T> = (a, b) => a === b) {}

  /* ─────────────────────────────── Helpers de error ─────────────────────────────── */

  private raise(message: string, code: NaryErrorCode): never {
    throw new DomainError(message, code);
  }

  /* ─────────────────────────────── API Pública ─────────────────────────────── */

  public crearRaiz(valor: T): NodoNario<T> {
    if (this.raiz) {
      this.raise("La raíz ya existe.", "ROOT_ALREADY_EXISTS");
    }
    if (this.tamanio >= this.MAX_NODOS) {
      this.raise(
        `No fue posible crear la raíz: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`,
        "MAX_NODES_REACHED"
      );
    }

    this.raiz = new NodoNario<T>(valor);
    this.tamanio = 1;
    return this.raiz;
  }

  /** Inserta hijo bajo el padre (por id numérico). */
  public insertarHijo(
    parentId: number,
    valor: T,
    index?: number
  ): NodoNario<T> {
    if (!this.raiz) {
      this.raise(
        "Árbol vacío. Debes crear la raíz primero con createRoot(valor).",
        "TREE_NOT_CREATED"
      );
    }
    if (this.tamanio >= this.MAX_NODOS) {
      this.raise(
        `No fue posible insertar: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`,
        "MAX_NODES_REACHED"
      );
    }

    const padre = this.getById(parentId);
    if (!padre) {
      this.raise(`No existe el padre con id: ${parentId}`, "PARENT_NOT_FOUND");
    }

    const nuevo = new NodoNario<T>(valor);
    if (index === undefined) {
      padre.agregarHijo(nuevo);
    } else {
      padre.insertarHijoEn(index, nuevo);
    }

    this.tamanio++;
    return nuevo;
  }

  /** Elimina un nodo (y su subárbol) por id numérico. */
  public eliminarNodo(id: number): NodoNario<T> {
    if (!this.raiz) {
      this.raise(
        "No fue posible eliminar: el árbol se encuentra vacío.",
        "TREE_EMPTY"
      );
    }

    const objetivo = this.getById(id);
    if (!objetivo) {
      this.raise(`No existe el nodo con id: ${id}`, "NODE_NOT_FOUND");
    }

    if (objetivo === this.raiz) {
      const removed = this.raiz;
      this.vaciar(); // si quieres reiniciar ids, usa vaciar(true)
      return removed!;
    }

    const padre = objetivo.getParent();
    if (!padre) {
      this.raise(
        "Inconsistencia interna: nodo sin padre que no es la raíz.",
        "INCONSISTENT_TREE"
      );
    }

    const idx = padre.indexOfHijoId(id);
    if (idx === -1) {
      this.raise(
        "Inconsistencia interna: hijo no encontrado en la lista de hijos de su padre.",
        "INCONSISTENT_TREE"
      );
    }

    const cuenta = this.contarSubarbol(objetivo);
    const eliminado = padre.eliminarHijoEn(idx)!;
    this.tamanio -= cuenta;
    return eliminado;
  }

  /** Mueve un subárbol `id` a `nuevoPadreId`. */
  public moverNodo(id: number, nuevoPadreId: number, index?: number): void {
    if (!this.raiz) {
      this.raise(
        "Árbol vacío. Debes crear la raíz primero con createRoot(valor).",
        "TREE_NOT_CREATED"
      );
    }

    if (id === nuevoPadreId) {
      this.raise(
        "Movimiento inválido: origen y destino no pueden ser el mismo nodo.",
        "SAME_ORIGIN_AND_DESTINATION"
      );
    }

    const nodo = this.getById(id);
    const nuevoPadre = this.getById(nuevoPadreId);

    if (!nodo || !nuevoPadre) {
      this.raise(
        "No fue posible mover el nodo: al menos uno de los ids no existe en el árbol.",
        "NODE_NOT_FOUND"
      );
    }

    // En este punto TS sabe que `nodo` y `nuevoPadre` no son null
    const nodoSafe = nodo!;
    const nuevoPadreSafe = nuevoPadre!;

    if (this.esDescendiente(nuevoPadreSafe, nodoSafe)) {
      this.raise(
        "Movimiento inválido: el nuevo padre es descendiente del nodo a mover (crearía un ciclo).",
        "MOVE_CREATES_CYCLE"
      );
    }

    if (nodoSafe === this.raiz) {
      this.raise(
        "No se puede mover la raíz. Considera reconstruir el árbol.",
        "MOVE_ROOT_FORBIDDEN"
      );
    }

    const padreActual = nodoSafe.getParent();
    if (!padreActual) {
      this.raise(
        "Inconsistencia interna: el nodo a mover no tiene padre.",
        "INCONSISTENT_TREE"
      );
    }

    const idx = padreActual!.indexOfHijoId(id);
    if (idx === -1) {
      this.raise(
        "Inconsistencia interna: el nodo a mover no se encontró en la lista de hijos de su padre.",
        "INCONSISTENT_TREE"
      );
    }

    // Desvincular de su padre actual
    padreActual!.eliminarHijoEn(idx);

    // Vincular en el nuevo padre
    if (index === undefined) {
      nuevoPadreSafe.agregarHijo(nodoSafe);
    } else {
      nuevoPadreSafe.insertarHijoEn(index, nodoSafe);
    }
  }

  /** Actualiza el valor de un nodo por id. */
  public actualizarValor(id: number, nuevoValor: T): void {
    if (!this.raiz) {
      this.raise(
        "Árbol vacío. Debes crear la raíz primero con createRoot(valor).",
        "TREE_NOT_CREATED"
      );
    }

    const n = this.getById(id);
    if (!n) {
      this.raise(`No existe el nodo con id: ${id}`, "NODE_NOT_FOUND");
    }

    n!.setInfo(nuevoValor);
  }

  /**
   * Búsqueda estricta por valor (lanza DomainError si falla).
   * Útil para el comando `search`.
   */
  public buscarPorValor(valor: T): NodoNario<T> {
    if (!this.raiz) {
      this.raise(
        "No fue posible buscar: el árbol se encuentra vacío.",
        "TREE_EMPTY"
      );
    }

    const encontrado = this.raiz!.findBFS((n) =>
      this.equals(n.getInfo(), valor)
    );
    if (!encontrado) {
      this.raise(
        "No fue posible encontrar un nodo con ese valor en el árbol.",
        "VALUE_NOT_FOUND"
      );
    }

    return encontrado!;
  }

  /**
   * Vacía completamente el árbol.
   * Si `resetIds = true`, reinicia el contador global de `NodoNario` a 1.
   */
  public vaciar(resetIds = false): void {
    this.raiz = null;
    this.tamanio = 0;
    if (resetIds && typeof (NodoNario as any).reset === "function") {
      (NodoNario as any).reset(1);
    }
  }

  /* ───── consultas/recorridos ───── */

  public esVacio(): boolean {
    return this.raiz === null;
  }

  public getPeso(): number {
    return this.tamanio;
  }

  public getAltura(): number {
    return this.alturaNodo(this.raiz);
  }

  public getTamanio(): number {
    return this.tamanio;
  }

  public getRaiz(): NodoNario<T> | null {
    return this.raiz;
  }

  /**
   * Búsqueda suave por valor (no lanza, solo retorna null si no encuentra).
   * La búsqueda estricta con errores de dominio es `buscarPorValor`.
   */
  public getPorValor(valor: T): NodoNario<T> | null {
    if (!this.raiz) return null;
    return this.raiz.findBFS((n) => this.equals(n.getInfo(), valor));
  }

  public esta(valor: T): boolean {
    return this.getPorValor(valor) !== null;
  }

  /** Búsqueda por id numérico. */
  public getById(id: number): NodoNario<T> | null {
    if (!this.raiz) return null;
    return this.raiz.findBFS((n) => n.getId() === id);
  }

  public getNodosPorNiveles(): NodoNario<T>[] {
    const nodos: NodoNario<T>[] = [];
    if (this.raiz) {
      const q = new Cola<NodoNario<T>>();
      q.encolar(this.raiz);
      while (!q.esVacia()) {
        const x = q.decolar().getValor();
        nodos.push(x);
        for (const h of x.getHijos()) q.encolar(h);
      }
    }
    return nodos;
  }

  public preOrden(): NodoNario<T>[] {
    const res: NodoNario<T>[] = [];
    if (this.raiz) this.raiz.forEachPreorden((n) => res.push(n));
    return res;
  }

  public postOrden(): NodoNario<T>[] {
    const res: NodoNario<T>[] = [];
    if (this.raiz) this.raiz.forEachPostorden((n) => res.push(n));
    return res;
  }

  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }

  public getHojas(): NodoNario<T>[] {
    const hojas: NodoNario<T>[] = [];
    if (!this.raiz) return hojas;
    this.raiz.forEachPreorden((n) => {
      if (n.getHijos().length === 0) hojas.push(n);
    });
    return hojas;
  }

  /** Estructura para D3 (id string + idNum numérico). */
  public convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
    if (!this.raiz) return null;
    return this.toHierarchy(this.raiz);
  }

  /** Clonado profundo (no consume ids). */
  public clonar(): ArbolNario<T> {
    const nuevo = new ArbolNario<T>(this.equals);
    nuevo.raiz = this.clonarNodo(this.raiz);
    nuevo.tamanio = this.tamanio;
    return nuevo;
  }

  /* ─────────────────────────────── Helpers internos ─────────────────────────────── */

  private alturaNodo(n: NodoNario<T> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let maxH = 0;
    for (const h of hijos) maxH = Math.max(maxH, this.alturaNodo(h));
    return maxH + 1;
  }

  private contarSubarbol(n: NodoNario<T>): number {
    let count = 0;
    n.forEachPreorden(() => (count += 1));
    return count;
  }

  /** Comprueba si `ancestro` está en la cadena de padres de `posibleDesc`. */
  private esDescendiente(
    posibleDesc: NodoNario<T>,
    ancestro: NodoNario<T>
  ): boolean {
    let cur: NodoNario<T> | null = posibleDesc;
    while (cur) {
      if (cur === ancestro) return true;
      cur = cur.getParent();
    }
    return false;
  }

  private contarHojasAux(n: NodoNario<T> | null): number {
    if (!n) return 0;
    const hijos = n.getHijos();
    if (hijos.length === 0) return 1;
    let total = 0;
    for (const h of hijos) total += this.contarHojasAux(h);
    return total;
  }

  private toHierarchy(n: NodoNario<T>): HierarchyNodeData<T> {
    const children = n.getHijos().map((h) => this.toHierarchy(h));
    const idNum = n.getId();
    return {
      id: `n-${idNum}`, // string para el DOM
      idNum, // numérico original
      value: n.getInfo(),
      degree: n.getHijos().length,
      height: this.alturaNodo(n),
      children: children.length ? children : undefined,
    };
  }

  /**
   * Clona un nodo preservando ids **sin avanzar el contador global**.
   */
  private clonarNodo(n: NodoNario<T> | null): NodoNario<T> | null {
    if (!n) return null;

    const copia = new NodoNario<T>(n.getInfo(), {
      keepId: n.getId(),
      bumpCounter: false, // ← clave para no “gastar” ids
    });

    for (const h of n.getHijos()) {
      const hc = this.clonarNodo(h)!;
      copia.agregarHijo(hc);
    }
    return copia;
  }
}
