import { EqualityFn, HierarchyNodeData } from "../../../types";
import { Cola } from "./Cola";
import { NodoNario } from "../nodes/NodoNario";

/**
 * Árbol N-ario genérico.
 */
export class ArbolNario<T> {
  private raiz: NodoNario<T> | null = null;
  private tamanio = 0;

  private readonly MAX_NODOS = 150;

  constructor(private equals: EqualityFn<T> = (a, b) => a === b) {}

  /* ─────────────────────────────── API Pública ─────────────────────────────── */

  public crearRaiz(valor: T): NodoNario<T> {
    if (this.raiz) throw new Error("La raíz ya existe.");
    if (this.tamanio >= this.MAX_NODOS) {
      throw new Error(
        `No fue posible crear la raíz: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
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
    if (!this.raiz)
      throw new Error("Árbol vacío. Debes crear la raíz primero.");
    if (this.tamanio >= this.MAX_NODOS) {
      throw new Error(
        `No fue posible insertar: límite máximo de nodos alcanzado (${this.MAX_NODOS}).`
      );
    }
    const padre = this.getById(parentId);
    if (!padre) throw new Error(`No existe el padre con id: ${parentId}`);

    const nuevo = new NodoNario<T>(valor);
    if (index === undefined) padre.agregarHijo(nuevo);
    else padre.insertarHijoEn(index, nuevo);

    this.tamanio++;
    return nuevo;
  }

  /** Elimina un nodo (y su subárbol) por id numérico. */
  public eliminarNodo(id: number): NodoNario<T> {
    if (!this.raiz) throw new Error("Árbol vacío.");
    const objetivo = this.getById(id);
    if (!objetivo) throw new Error(`No existe el nodo con id: ${id}`);

    if (objetivo === this.raiz) {
      const removed = this.raiz;
      this.vaciar(); // si quieres reiniciar ids, usa vaciar(true)
      return removed!;
    }

    const padre = objetivo.getParent();
    if (!padre)
      throw new Error("Inconsistencia: nodo sin padre que no es la raíz.");

    const idx = padre.indexOfHijoId(id);
    if (idx === -1)
      throw new Error("Inconsistencia: hijo no encontrado en el padre.");

    const cuenta = this.contarSubarbol(objetivo);
    const eliminado = padre.eliminarHijoEn(idx)!;
    this.tamanio -= cuenta;
    return eliminado;
  }

  /** Mueve un subárbol `id` a `nuevoPadreId`. */
  public moverNodo(id: number, nuevoPadreId: number, index?: number): void {
    if (!this.raiz) throw new Error("Árbol vacío.");
    if (id === nuevoPadreId)
      throw new Error("No puedes mover un nodo dentro de sí mismo.");

    const nodo = this.getById(id);
    const nuevoPadre = this.getById(nuevoPadreId);
    if (!nodo) throw new Error(`No existe el nodo con id: ${id}`);
    if (!nuevoPadre)
      throw new Error(`No existe el padre destino con id: ${nuevoPadreId}`);

    if (this.esDescendiente(nuevoPadre, nodo)) {
      throw new Error("Movimiento inválido: crearía un ciclo.");
    }
    if (nodo === this.raiz) {
      throw new Error(
        "No puedes mover la raíz. Considera reconstruir el árbol."
      );
    }

    const padreActual = nodo.getParent();
    if (!padreActual) throw new Error("Inconsistencia: nodo sin padre.");

    const idx = padreActual.indexOfHijoId(id);
    if (idx === -1)
      throw new Error("Inconsistencia: hijo no encontrado en su padre.");
    padreActual.eliminarHijoEn(idx);

    if (index === undefined) nuevoPadre.agregarHijo(nodo);
    else nuevoPadre.insertarHijoEn(index, nodo);
  }

  /** Actualiza el valor de un nodo por id. */
  public actualizarValor(id: number, nuevoValor: T): void {
    if (!this.raiz) throw new Error("Árbol vacío.");
    const n = this.getById(id);
    if (!n) throw new Error(`No existe el nodo con id: ${id}`);
    n.setInfo(nuevoValor);
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

  /* ─────────────────────────────── Helpers ─────────────────────────────── */

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
