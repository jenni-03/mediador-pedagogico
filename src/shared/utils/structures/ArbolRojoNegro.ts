// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { EqualityFn, HierarchyNodeData } from "../../../types";
import { Cola } from "./Cola";
import { NodoRB } from "../nodes/NodoRB";

/**
 * Colores de un nodo Roji-Negro
 */
type RBColor = "RED" | "BLACK";

/**
 * Árbol Roji-Negro (BST balanceado por color).
 * Reglas:
 *  - Cada nodo es rojo o negro
 *  - La raíz es negra
 *  - Las hojas nulas son negras
 *  - Un nodo rojo no tiene hijos rojos
 *  - Todo camino de un nodo a sus hojas nulas tiene el mismo número de nodos negros
 */
export class ArbolRojoNegro<T> {
  // Raíz del árbol
  private raiz: NodoRB<T> | null;

  // Número de nodos
  private tamanio: number;

  // Límite para el simulador
  private readonly MAX_NODOS = 30;

  /**
   * @param equals  Función de igualdad (para mensajes/utilidades). Por defecto a===b.
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

  /** Inserta un valor (BST) y corrige propiedades Roji-Negro. */
  public insertar(valor: T): NodoRB<T> {
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

    const z = new NodoRB<T>(valor); // por convención, entra ROJO
    z.setColor("RED");

    // Inserción BST estándar (con punteros a padre)
    let y: NodoRB<T> | null = null; // padre
    let x: NodoRB<T> | null = this.raiz;

    while (x) {
      y = x;
      if (this.compare(z.getInfo(), x.getInfo()) < 0) {
        x = x.getIzq() as NodoRB<T> | null;
      } else {
        x = x.getDer() as NodoRB<T> | null;
      }
    }

    z.setPadre(y);
    if (!y) {
      // el árbol estaba vacío
      this.raiz = z;
    } else if (this.compare(z.getInfo(), y.getInfo()) < 0) {
      y.setIzq(z);
    } else {
      y.setDer(z);
    }

    // Fix-up Roji-Negro
    this.insertFixup(z);
    this.raiz!.setColor("BLACK"); // regla raíz negra

    this.tamanio++;

    // ✅ Valida invariantes tras insertar
    this.assertRB();

    return z;
  }

  /** Elimina un valor (BST) y corrige propiedades Roji-Negro. */
  public eliminar(valor: T): { removed: NodoRB<T> } {
    if (this.esVacio()) {
      throw new Error(
        "No fue posible eliminar el nodo: El árbol encuentra vacío (cantidad de nodos: 0)."
      );
    }
    const z = this.get(valor);
    if (!z) {
      throw new Error(
        "No fue posible eliminar el nodo: El elemento no existe en el árbol Roji-Negro."
      );
    }

    // Estándar CLRS: y es el nodo que se elimina físicamente
    let y: NodoRB<T> = z;
    let yOriginalColor: RBColor = y.getColor();
    let x: NodoRB<T> | null = null;
    let xParent: NodoRB<T> | null = null;

    if (!z.getIzq()) {
      x = z.getDer() as NodoRB<T> | null;
      xParent = z.getPadre();
      this.transplant(z, z.getDer() as NodoRB<T> | null);
    } else if (!z.getDer()) {
      x = z.getIzq() as NodoRB<T> | null;
      xParent = z.getPadre();
      this.transplant(z, z.getIzq() as NodoRB<T> | null);
    } else {
      y = this.minNodo(z.getDer() as NodoRB<T>);
      yOriginalColor = y.getColor();
      x = y.getDer() as NodoRB<T> | null;

      if (y.getPadre() === z) {
        xParent = y;
      } else {
        this.transplant(y, y.getDer() as NodoRB<T> | null);
        y.setDer(z.getDer() as NodoRB<T>);
        (y.getDer() as NodoRB<T>).setPadre(y);
      }

      this.transplant(z, y);
      y.setIzq(z.getIzq() as NodoRB<T>);
      (y.getIzq() as NodoRB<T>).setPadre(y);
      y.setColor(z.getColor());
    }

    if (yOriginalColor === "BLACK") {
      this.deleteFixup(x, xParent);
    }

    // Garantiza raíz negra por si acaso
    if (this.raiz) this.raiz.setColor("BLACK");

    this.tamanio--;

    // ✅ Valida invariantes tras eliminar
    this.assertRB();

    return { removed: z };
  }

  /** Verifica si existe el valor en el árbol. */
  public esta(valor: T): boolean {
    return this.get(valor) !== null;
  }

  /** Vacía el árbol. */
  public vaciar(): void {
    this.raiz = null;
    this.tamanio = 0;
  }

  /** True si no hay nodos. */
  public esVacio(): boolean {
    return this.raiz === null;
  }

  /** Altura del árbol (para métricas generales – no se usa en balanceo). */
  public getAltura(): number {
    return this.alturaAux(this.raiz);
  }

  /** Número de nodos. */
  public getPeso(): number {
    return this.tamanio;
  }

  /** Obtiene la raíz. */
  public getRaiz(): NodoRB<T> | null {
    return this.raiz;
  }

  /** Asigna la raíz. */
  public setRaiz(raiz: NodoRB<T> | null): void {
    this.raiz = raiz;
    if (this.raiz) this.raiz.setPadre(null);
  }

  /** Conversión a estructura jerárquica para renderer (incluye color). */
  public convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
    if (this.esVacio()) return null;
    return this.toHierarchy(this.raiz!);
  }

  /** Clona profundamente el árbol (incluye colores y relaciones). */
  public clonar(): ArbolRojoNegro<T> {
    const nuevo = new ArbolRojoNegro<T>(this.equals, this.compare);
    nuevo.setRaiz(this.clonarNodo(this.raiz, null));
    nuevo.tamanio = this.tamanio;
    return nuevo;
  }

  /** Devuelve el nodo con cierto valor, o null si no existe. */
  public get(valor: T): NodoRB<T> | null {
    let cur = this.raiz;
    while (cur) {
      const cmp = this.compare(valor, cur.getInfo());
      if (cmp === 0) return cur;
      cur =
        cmp < 0
          ? (cur.getIzq() as NodoRB<T> | null)
          : (cur.getDer() as NodoRB<T> | null);
    }
    return null;
  }

  /* ──────────────── API pública extra (útil en UI/depuración) ─────────────── */

  /** Dispara manualmente el validador (lanza Error si hay violación). */
  public validar(): void {
    this.assertRB();
  }

  /** Tamaño actual del árbol (alias explícito para tarjetas). */
  public getTamanio(): number {
    return this.tamanio;
  }

  /** Cantidad de nodos hoja. */
  public contarHojas(): number {
    return this.contarHojasAux(this.raiz);
  }

  /** Devuelve un arreglo con todos los nodos hoja. */
  public getHojas(): NodoRB<T>[] {
    const hojas: NodoRB<T>[] = [];
    this.getArrayHojas(this.raiz, hojas);
    return hojas;
  }

  /* ────────────────────────── Rotaciones ────────────────────────── */

  private rotacionIzquierda(x: NodoRB<T>): void {
    const y = x.getDer() as NodoRB<T>;
    x.setDer(y.getIzq() as NodoRB<T> | null);
    if (y.getIzq()) (y.getIzq() as NodoRB<T>).setPadre(x);

    y.setPadre(x.getPadre());

    if (!x.getPadre()) {
      this.raiz = y;
    } else if (x === x.getPadre()!.getIzq()) {
      x.getPadre()!.setIzq(y);
    } else {
      x.getPadre()!.setDer(y);
    }

    y.setIzq(x);
    x.setPadre(y);
  }

  private rotacionDerecha(y: NodoRB<T>): void {
    const x = y.getIzq() as NodoRB<T>;
    y.setIzq(x.getDer() as NodoRB<T> | null);
    if (x.getDer()) (x.getDer() as NodoRB<T>).setPadre(y);

    x.setPadre(y.getPadre());

    if (!y.getPadre()) {
      this.raiz = x;
    } else if (y === y.getPadre()!.getIzq()) {
      y.getPadre()!.setIzq(x);
    } else {
      y.getPadre()!.setDer(x);
    }

    x.setDer(y);
    y.setPadre(x);
  }

  /* ───────────────────────── Fixups (CLRS) ───────────────────────── */

  private insertFixup(z: NodoRB<T>) {
    // Mientras el padre de z sea ROJO, hay violación "dos rojos consecutivos"
    while (z.getPadre() && this.colorOf(z.getPadre()) === "RED") {
      const p = z.getPadre()!;
      const g = p.getPadre()!; // abuelo siempre existe si el padre es rojo

      if (p === g.getIzq()) {
        const u = g.getDer() as NodoRB<T> | null; // tío
        if (this.colorOf(u) === "RED") {
          // Caso 1: tío rojo → recolorear
          p.setColor("BLACK");
          (u as NodoRB<T>).setColor("BLACK");
          g.setColor("RED");
          z = g;
        } else {
          if (z === p.getDer()) {
            // Caso 2: triángulo → rotación izquierda en padre
            z = p;
            this.rotacionIzquierda(z);
          }
          // Caso 3: línea → rotación derecha en abuelo
          z.getPadre()!.setColor("BLACK");
          g.setColor("RED");
          this.rotacionDerecha(g);
        }
      } else {
        // simétrico (padre es hijo derecho del abuelo)
        const u = g.getIzq() as NodoRB<T> | null;
        if (this.colorOf(u) === "RED") {
          p.setColor("BLACK");
          (u as NodoRB<T>).setColor("BLACK");
          g.setColor("RED");
          z = g;
        } else {
          if (z === p.getIzq()) {
            z = p;
            this.rotacionDerecha(z);
          }
          z.getPadre()!.setColor("BLACK");
          g.setColor("RED");
          this.rotacionIzquierda(g);
        }
      }
    }
  }

  /**
   * Fix-up de eliminación.
   * x: nodo que "hereda" el doble negro (puede ser null -> hoja nula negra)
   * parent: padre actual de x (porque x puede ser null)
   */
  private deleteFixup(x: NodoRB<T> | null, parent: NodoRB<T> | null): void {
    // Mientras x no sea la raíz y x sea negro
    while (x !== this.raiz && this.colorOf(x) === "BLACK") {
      if (x === (parent?.getIzq() as NodoRB<T> | null)) {
        let w = parent?.getDer() as NodoRB<T> | null; // hermano
        if (this.colorOf(w) === "RED") {
          w!.setColor("BLACK");
          parent!.setColor("RED");
          this.rotacionIzquierda(parent!);
          w = parent?.getDer() as NodoRB<T> | null;
        }
        if (
          this.colorOf(w?.getIzq() as NodoRB<T> | null) === "BLACK" &&
          this.colorOf(w?.getDer() as NodoRB<T> | null) === "BLACK"
        ) {
          w!.setColor("RED");
          x = parent;
          parent = x?.getPadre() ?? null;
        } else {
          if (this.colorOf(w?.getDer() as NodoRB<T> | null) === "BLACK") {
            (w?.getIzq() as NodoRB<T>)?.setColor("BLACK");
            w!.setColor("RED");
            this.rotacionDerecha(w!);
            w = parent?.getDer() as NodoRB<T> | null;
          }
          w!.setColor(parent!.getColor());
          parent!.setColor("BLACK");
          (w?.getDer() as NodoRB<T>)?.setColor("BLACK");
          this.rotacionIzquierda(parent!);
          x = this.raiz;
          parent = null;
        }
      } else {
        // simétrico (x es hijo derecho)
        let w = parent?.getIzq() as NodoRB<T> | null;
        if (this.colorOf(w) === "RED") {
          w!.setColor("BLACK");
          parent!.setColor("RED");
          this.rotacionDerecha(parent!);
          w = parent?.getIzq() as NodoRB<T> | null;
        }
        if (
          this.colorOf(w?.getIzq() as NodoRB<T> | null) === "BLACK" &&
          this.colorOf(w?.getDer() as NodoRB<T> | null) === "BLACK"
        ) {
          w!.setColor("RED");
          x = parent;
          parent = x?.getPadre() ?? null;
        } else {
          if (this.colorOf(w?.getIzq() as NodoRB<T> | null) === "BLACK") {
            (w?.getDer() as NodoRB<T>)?.setColor("BLACK");
            w!.setColor("RED");
            this.rotacionIzquierda(w!);
            w = parent?.getIzq() as NodoRB<T> | null;
          }
          w!.setColor(parent!.getColor());
          parent!.setColor("BLACK");
          (w?.getIzq() as NodoRB<T>)?.setColor("BLACK");
          this.rotacionDerecha(parent!);
          x = this.raiz;
          parent = null;
        }
      }
    }
    if (x) x.setColor("BLACK");
    if (this.raiz) this.raiz.setColor("BLACK");
  }

  /* ──────────────────────────── Validador de invariantes ─────────────────────────── */

  /** Lanza Error si alguna invariante del árbol rojinegro se rompe. */
  private assertRB(): void {
    if (!this.raiz) return;

    // (1) Raíz negra
    if (this.raiz.getColor() !== "BLACK") {
      throw new Error("RB violation: la raíz no es negra");
    }

    // (2) Punteros padre-hijo coherentes y no hay rojo-rojo
    const check = (n: NodoRB<T> | null) => {
      if (!n) return;
      const L = n.getIzq() as NodoRB<T> | null;
      const R = n.getDer() as NodoRB<T> | null;

      if (L && L.getPadre() !== n) {
        throw new Error(
          `RB violation: puntero padre incorrecto (izq) en ${n.getInfo()}`
        );
      }
      if (R && R.getPadre() !== n) {
        throw new Error(
          `RB violation: puntero padre incorrecto (der) en ${n.getInfo()}`
        );
      }

      if (n.getColor() === "RED") {
        if ((L && L.getColor() === "RED") || (R && R.getColor() === "RED")) {
          throw new Error(`RB violation: rojo-rojo en nodo ${n.getInfo()}`);
        }
      }
      check(L);
      check(R);
    };
    check(this.raiz);

    // (3) Misma altura negra en todos los caminos
    const blackHeight = (n: NodoRB<T> | null): number => {
      if (!n) return 1; // NIL cuenta como negro
      const L = blackHeight(n.getIzq() as NodoRB<T> | null);
      const R = blackHeight(n.getDer() as NodoRB<T> | null);
      if (L !== R) {
        throw new Error(
          `RB violation: black height desigual en nodo ${n.getInfo()} (L=${L}, R=${R})`
        );
      }
      return L + (n.getColor() === "BLACK" ? 1 : 0);
    };
    blackHeight(this.raiz);

    // (4) Orden BST estricto (sin duplicados, in-order creciente)
    const arr = this.inOrden().map((n) => n.getInfo());
    for (let i = 1; i < arr.length; i++) {
      if (this.compare(arr[i - 1], arr[i]) >= 0) {
        throw new Error("BST violation: in-order no estricto");
      }
    }
  }

  /* ──────────────────────────── Utilidades ─────────────────────────── */

  private colorOf(n: NodoRB<T> | null): RBColor {
    return n ? n.getColor() : "BLACK"; // nulo se considera negro
  }

  /** Reemplaza subárbol en u por v (manteniendo padres/raíz). */
  private transplant(u: NodoRB<T>, v: NodoRB<T> | null): void {
    if (!u.getPadre()) {
      this.raiz = v;
    } else if (u === u.getPadre()!.getIzq()) {
      u.getPadre()!.setIzq(v);
    } else {
      u.getPadre()!.setDer(v);
    }
    if (v) v.setPadre(u.getPadre());
  }

  /** Mínimo del subárbol (extrema izquierda). */
  private minNodo(root: NodoRB<T>): NodoRB<T> {
    let cur: NodoRB<T> = root;
    while (cur.getIzq() !== null) cur = cur.getIzq() as NodoRB<T>;
    return cur;
  }

  private alturaAux(root: NodoRB<T> | null): number {
    if (!root) return 0;
    const hi = this.alturaAux(root.getIzq() as NodoRB<T> | null);
    const hd = this.alturaAux(root.getDer() as NodoRB<T> | null);
    return 1 + Math.max(hi, hd);
  }

  /* ─────────────── Helpers privados para tarjetas ─────────────── */

  private contarHojasAux(root: NodoRB<T> | null): number {
    if (!root) return 0;
    const izq = root.getIzq() as NodoRB<T> | null;
    const der = root.getDer() as NodoRB<T> | null;
    if (!izq && !der) return 1;
    return this.contarHojasAux(izq) + this.contarHojasAux(der);
  }

  private getArrayHojas(root: NodoRB<T> | null, hojas: NodoRB<T>[]): void {
    if (!root) return;
    const izq = root.getIzq() as NodoRB<T> | null;
    const der = root.getDer() as NodoRB<T> | null;
    if (!izq && !der) {
      hojas.push(root);
    } else {
      this.getArrayHojas(izq, hojas);
      this.getArrayHojas(der, hojas);
    }
  }

  /* ─────────────── Conversión a Jerarquía para la Visualización ───────────── */

  private toHierarchy(root: NodoRB<T>): HierarchyNodeData<T> {
    const left = root.getIzq()
      ? this.toHierarchy(root.getIzq() as NodoRB<T>)
      : null;
    const right = root.getDer()
      ? this.toHierarchy(root.getDer() as NodoRB<T>)
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
      // 👇 añade el color para que el renderer pinte el nodo
      color: root.getColor() === "RED" ? "red" : "black",
    };
  }

  private createPlaceholder(
    parent: NodoRB<T>,
    side: "left" | "right"
  ): HierarchyNodeData<T> {
    return {
      id: `${parent.getId()}-ph${side === "left" ? "L" : "R"}`,
      isPlaceholder: true,
    };
  }

  /* ─────────────────────────────── Clonado ──────────────────────────────── */

  private clonarNodo(
    root: NodoRB<T> | null,
    padre: NodoRB<T> | null
  ): NodoRB<T> | null {
    if (!root) return null;
    const nuevo = new NodoRB<T>(root.getInfo(), root.getId());
    nuevo.setColor(root.getColor());
    nuevo.setPadre(padre);
    nuevo.setIzq(this.clonarNodo(root.getIzq() as NodoRB<T> | null, nuevo));
    nuevo.setDer(this.clonarNodo(root.getDer() as NodoRB<T> | null, nuevo));
    return nuevo;
  }

  /* ───────────────────────────── Recorridos ──────────────────────────────── */

  public inOrden(): NodoRB<T>[] {
    const out: NodoRB<T>[] = [];
    const dfs = (r: NodoRB<T> | null) => {
      if (!r) return;
      dfs(r.getIzq() as NodoRB<T> | null);
      out.push(r);
      dfs(r.getDer() as NodoRB<T> | null);
    };
    dfs(this.raiz);
    return out;
  }

  public preOrden(): NodoRB<T>[] {
    const out: NodoRB<T>[] = [];
    const dfs = (r: NodoRB<T> | null) => {
      if (!r) return;
      out.push(r);
      dfs(r.getIzq() as NodoRB<T> | null);
      dfs(r.getDer() as NodoRB<T> | null);
    };
    dfs(this.raiz);
    return out;
  }

  public postOrden(): NodoRB<T>[] {
    const out: NodoRB<T>[] = [];
    const dfs = (r: NodoRB<T> | null) => {
      if (!r) return;
      dfs(r.getIzq() as NodoRB<T> | null);
      dfs(r.getDer() as NodoRB<T> | null);
      out.push(r);
    };
    dfs(this.raiz);
    return out;
  }

  /** Recorrido por niveles (BFS) para el renderer. */
  public getNodosPorNiveles(): NodoRB<T>[] {
    const nodos: NodoRB<T>[] = [];
    if (!this.esVacio()) {
      const cola = new Cola<NodoRB<T>>();
      cola.encolar(this.raiz!);
      while (!cola.esVacia()) {
        const x = cola.decolar().getValor();
        nodos.push(x);
        if (x.getIzq()) cola.encolar(x.getIzq() as NodoRB<T>);
        if (x.getDer()) cola.encolar(x.getDer() as NodoRB<T>);
      }
    }
    return nodos;
  }
}

/* ──────────────────────────── Utilidades locales ─────────────────────────── */

function defaultCompare(a: any, b: any): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return `${a}`.localeCompare(`${b}`);
}
