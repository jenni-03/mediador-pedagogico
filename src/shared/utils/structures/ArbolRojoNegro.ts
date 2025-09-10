// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { Comparator, HierarchyNodeData, RBColor, RBTrace, RotationStep } from "../../../types";
import { NodoRB } from "../nodes/NodoRB";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { defaultComparator } from "../treeUtils";

/**
 * Clase que representa el funcionamiento de un árbol Rojo-Negro.
 */
export class ArbolRojoNegro<T> extends ArbolBinarioBusqueda<T> {

  private lastRbTrace: RBTrace<T> | null = null;

  /**
   * Constructor de la clase ArbolRojoNegro.
   */
  constructor(
    compare: Comparator<T> = defaultComparator
  ) {
    super(compare);
  }

  /**
   * Método que inserta un nuevo nodo en el árbol Rojo-Negro.
   * @param valor Elemento a insertar.
   * @returns Nodo insertado.
   */
  public override insertar(valor: T): NodoRB<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // z nace como rojo
    const z = new NodoRB<T>(valor, "RED");

    // Inserción BST estándar
    let y: NodoRB<T> | null = null; // padre
    let x: NodoRB<T> | null = this.getRaiz(); // cursor

    while (x !== null) {
      y = x;
      const cmp = this.compare(valor, x.getInfo());
      if (cmp < 0) {
        x = x.getIzq();
      } else if (cmp > 0) {
        x = x.getDer();
      } else {
        throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
      }
    }

    z.setPadre(y);

    if (!y) {
      // Árbol vacío
      this.setRaiz(z);
    } else if (this.compare(z.getInfo(), y.getInfo()) < 0) {
      y.setIzq(z);
    } else {
      y.setDer(z);
    }

    this.lastRbTrace = {
      actions: [],
      hierarchies: {
        bst: this.convertirEstructuraJerarquica(),
        mids: []
      }
    }

    // Reparación de infracciones
    this.insertFixup(z);
    this.setTamanio(this.getTamanio() + 1);

    return z;
  }

  /**
   * Método que elimina un nodo especifico del árbol Rojo-Negro.
   * @param valor Elemento a eliminar.
   * @returns Objeto que contiene el nodo eliminado y el nodo actualizado.
   */
  public override eliminar(valor: T): { removed: NodoRB<T>; updated: NodoRB<T> | null } {
    if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

    const z = this.buscarRN(valor);
    if (!z) {
      throw new Error(
        "No fue posible eliminar el nodo: El elemento no existe en el árbol Roji-Negro."
      );
    }

    let removed: NodoRB<T> | null = null;
    let updated: NodoRB<T> | null = null;

    // Estándar CLRS: y es el nodo que se elimina físicamente
    let y: NodoRB<T> = z;
    let yOriginalColor: RBColor = y.getColor();
    let x: NodoRB<T> | null = null;
    let xParent: NodoRB<T> | null = null;

    if (z.getIzq() === null) {
      // Caso 0 o 1 hijo (solo derecho)
      removed = z;
      x = z.getDer();
      xParent = z.getPadre();
      this.transplant(z, x);
    } else if (z.getDer() === null) {
      // Caso 1 hijo (solo izquierdo)
      removed = z;
      x = z.getIzq();
      xParent = z.getPadre();
      this.transplant(z, x);
    } else {
      // Caso 2 hijos
      updated = z;
      y = this.minNodo(z.getDer()!);
      removed = y;

      yOriginalColor = y.getColor();
      x = y.getDer();

      if (y.getPadre() === z) {
        xParent = y;
      } else {
        this.transplant(y, y.getDer());
        y.setDer(z.getDer());
        if (y.getDer()) y.getDer()!.setPadre(y);
        xParent = y.getPadre();
      }

      this.transplant(z, y);
      y.setIzq(z.getIzq());
      if (y.getIzq()) y.getIzq()!.setPadre(y);

      // Conservar color de z (para no alterar altura negra aquí)
      y.setColor(z.getColor());
    }

    this.lastRbTrace = {
      actions: [],
      hierarchies: {
        bst: this.convertirEstructuraJerarquica(), // frame base para el hook
        mids: []
      }
    };

    // Reparación de infracciones
    if (yOriginalColor === "BLACK") {
      this.deleteFixup(x, xParent);
    }
    this.setTamanio(this.getTamanio() - 1);

    return { removed: removed!, updated };
  }

  /**
   * Método que verifica la existencia de un elemento dentro del árbol Rojo-Negro.
   * @param valor Valor del elemento a buscar.
   * @returns Booleano que indica si el elemento fue encontrado o no. 
   */
  public override esta(valor: T): boolean {
    return this.buscarRN(valor) !== null;
  }

  /**
   * Método que obtiene la raíz del árbol Rojo-Negro.
   * @returns Nodo raíz del árbol o null si está vacío.
  */
  public override getRaiz(): NodoRB<T> | null {
    return super.getRaiz() as NodoRB<T> | null;
  }

  /**
   * Método que modifica la raíz del árbol Rojo-Negro.
   * @param raiz Nuevo nodo raíz del árbol Rojo-Negro.
   */
  public override setRaiz(raiz: NodoRB<T> | null): void {
    super.setRaiz(raiz);
    if (this.getRaiz()) this.getRaiz()?.setPadre(null);
  }

  /**
   * Método que obtiene todos los nodos hojas del árbol Rojo-Negro.
   * @returns Array de nodos que representan las hojas del árbol.
   */
  public override getHojas(): NodoRB<T>[] {
    return super.getHojas() as NodoRB<T>[];
  }

  /**
   * Método que cuenta el número de nodos hoja del árbol Rojo-Negro.
   * @returns Número de nodos hoja del árbol.
   */
  public override contarHojas(): number {
    return super.contarHojas();
  }

  /**
   * Método que calcula el peso total (número de nodos) del árbol Rojo-Negro.
   * @returns Número total de nodos del árbol.
   */
  public override getPeso(): number {
    return super.getPeso();
  }

  /**
   * Método que calcula la altura del árbol Rojo-Negro.
   * @returns Altura del árbol.
   */
  public override getAltura(): number {
    return super.getAltura();
  }

  /**
   * Método que vacia el árbol Rojo-Negro.
   */
  public override vaciar(): void {
    super.vaciar();
  }

  /**
   * Método que verifica si el árbol Rojo-Negro está vacío.
   * @returns True si se encuentra vacío, false en caso contrario.
   */
  public override esVacio(): boolean {
    return super.esVacio();
  }

  /**
   * Método que realiza el recorrido in-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia in-orden.
   */
  public override inOrden(): NodoRB<T>[] {
    return super.inOrden() as NodoRB<T>[];
  }

  /**
   * Método que realiza el recorrido pre-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia pre-orden.
   */
  public override preOrden(): NodoRB<T>[] {
    return super.preOrden() as NodoRB<T>[];
  }

  /**
   * Método que realiza el recorrido post-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia post-orden.
   */
  public override postOrden(): NodoRB<T>[] {
    return super.postOrden() as NodoRB<T>[];
  }

  /**
   * Método que realiza el recorrido por niveles del árbol Rojo-Negro.
   * @returns Array de nodos por niveles.
   */
  public override getNodosPorNiveles(): NodoRB<T>[] {
    return super.getNodosPorNiveles() as NodoRB<T>[];
  }

  /**
   * Método que convierte el árbol Rojo-Negro en una estructura jerárquica.
   * @returns Representación jerárquica del árbol o null si está vacío.
   */
  public override convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
    if (this.esVacio()) return null;
    return this.toRBHierarchy(this.getRaiz()!);
  }

  /**
   * Método que crea una copia profunda del árbol Rojo-Negro.
   * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
   */
  public clonarRB(): ArbolRojoNegro<T> {
    const nuevoArbol = new ArbolRojoNegro<T>(this.compare);
    nuevoArbol.setRaiz(this.clonarRBrec(this.getRaiz()));
    nuevoArbol.setTamanio(this.getTamanio());
    return nuevoArbol;
  }

  /**
   * Método que consume la última traza de operación del árbol Rojo-Negro.
   * @returns La última traza de operación o null si no hay ninguna.
   */
  public consumeLastRbTrace(): RBTrace<T> | null {
    const t = this.lastRbTrace;
    this.lastRbTrace = null;
    return t;
  }

  /**
   * Método que corrige las infracciones en el árbol producto producidas por la inserción.
   * @param z Nodo que se acaba de insertar.
   */
  private insertFixup(z: NodoRB<T>) {
    while (this.isRed(z.getPadre())) {
      const p = z.getPadre()!;
      const g = p.getPadre()!;

      // Padre es hijo izquierdo de abuelo
      if (p === g.getIzq()) {
        const y = g.getDer();

        if (this.isRed(y)) {
          // Caso 1: Tío rojo → recolorear
          this.recolor(p, "BLACK");
          this.recolor(y, "BLACK");
          this.recolor(g, "RED");
          z = g;
        } else {
          // Caso 2: triángulo → rotación izquierda en padre
          if (z === p.getDer()) {
            const step: RotationStep = {
              type: "LR",
              zId: p.getId(),
              yId: z.getId(),
              parentOfZId: p.getPadre()?.getId() ?? null,
              BId: z.getIzq()?.getId() ?? null
            }
            this.lastRbTrace?.actions.push({ kind: "rotation", tag: "L(p)", step });
            z = p;
            this.rotacionIzquierda(z);
            this.pushMid();
          }
          // Caso 3: línea → rotación derecha en abuelo
          this.recolor(z.getPadre()!, "BLACK");
          this.recolor(g, "RED");

          const step2: RotationStep = {
            type: "LL",
            zId: g.getId(),
            yId: g.getIzq()!.getId(),
            parentOfZId: g.getPadre()?.getId() ?? null,
            BId: g.getIzq()?.getDer()?.getId() ?? null
          }
          this.lastRbTrace?.actions.push({ kind: "rotation", tag: "R(g)", step: step2 });
          this.rotacionDerecha(g);
          this.pushMid();
        }
      } else {
        // simétrico (padre es hijo derecho del abuelo)
        const y = g.getIzq();

        if (this.isRed(y)) {
          this.recolor(p, "BLACK");
          this.recolor(y, "BLACK");
          this.recolor(g, "RED");
          z = g;
        } else {
          // Caso 2: triángulo → rotación derecha en padre
          if (z === p.getIzq()) {
            const step: RotationStep = {
              type: "RL",
              zId: p.getId(),
              yId: z.getId(),
              parentOfZId: p.getPadre()?.getId() ?? null,
              BId: z.getDer()?.getId() ?? null
            }
            this.lastRbTrace?.actions.push({ kind: "rotation", tag: "R(p)", step });
            z = p;
            this.rotacionDerecha(z);
            this.pushMid();
          }
          // Caso 3: línea → rotación izquierda en abuelo
          this.recolor(z.getPadre()!, "BLACK");
          this.recolor(g, "RED");

          const step2: RotationStep = {
            type: "RR",
            zId: g.getId(),
            yId: g.getDer()!.getId(),
            parentOfZId: g.getPadre()?.getId() ?? null,
            BId: g.getDer()?.getIzq()?.getId() ?? null
          }
          this.lastRbTrace?.actions.push({ kind: "rotation", tag: "L(g)", step: step2 });
          this.rotacionIzquierda(g);
          this.pushMid();
        }
      }
    }
    const root = this.getRaiz();
    if (root && root.getColor() !== "BLACK") {
      this.recolor(root, "BLACK");
    }
  }

  /**
   * Método que corrige las infracciones en el árbol Rojo-Negro producto de la eliminación del nodo.
   * @param x Nodo que reemplaza al nodo eliminado (puede ser nulo).
   * @param parent Padre del nodo x (puede ser nulo).
   */
  private deleteFixup(x: NodoRB<T> | null, xParent: NodoRB<T> | null): void {
    while (x !== this.getRaiz() && this.isBlack(x)) {
      const p = x !== null ? x.getPadre() : xParent;
      if (!p) break;

      const xEsIzq = p.getIzq() === x;
      let w = xEsIzq ? p.getDer() : p.getIzq();

      // Caso A - Hermano rojo
      if (this.isRed(w)) {
        this.recolor(w, "BLACK");
        this.recolor(p, "RED");

        if (xEsIzq) {
          const step: RotationStep = {
            type: "RR",
            zId: p.getId(),
            yId: w!.getId(),
            parentOfZId: p.getPadre()?.getId() ?? null,
            BId: w!.getIzq()?.getId() ?? null
          }
          this.lastRbTrace?.actions.push({ kind: "rotation", tag: "L(p)", step });
          this.rotacionIzquierda(p);
        } else {
          const step: RotationStep = {
            type: "LL",
            zId: p.getId(),
            yId: w!.getId(),
            parentOfZId: p.getPadre()?.getId() ?? null,
            BId: w!.getDer()?.getId() ?? null
          }
          this.lastRbTrace?.actions.push({ kind: "rotation", tag: "R(p)", step });
          this.rotacionDerecha(p);
        }
        this.pushMid();

        const nuevoP = (x !== null) ? x.getPadre() : xParent!;
        xParent = nuevoP;
        w = xEsIzq ? nuevoP!.getDer() : nuevoP!.getIzq();
      }

      const wLeft = w ? w.getIzq() : null;
      const wRight = w ? w.getDer() : null;

      // Caso B - w negro con hijos negros
      if (this.isBlack(wLeft) && this.isBlack(wRight)) {
        if (w) this.recolor(w, "RED");
        x = p;
        xParent = p.getPadre();
        continue;
      }

      // Caso C/D
      if (xEsIzq) {
        // Lado izquierdo: cercano = w.left, lejano = w.right
        // Caso C - cercano rojo, lejano negro
        if (this.isBlack(wRight)) {
          if (wLeft) this.recolor(wLeft, "BLACK");
          if (w) this.recolor(w, "RED");
          if (w) {
            const step: RotationStep = {
              type: "RL",
              zId: w.getId(),
              yId: w!.getIzq()!.getId(),
              parentOfZId: w.getPadre()?.getId() ?? null,
              BId: w!.getIzq()!.getDer()?.getId() ?? null
            }
            this.lastRbTrace?.actions.push({ kind: "rotation", tag: "R(w)", step });
            this.rotacionDerecha(w);
            this.pushMid();
          }
          const nuevoP = x !== null ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getDer();
        }

        // Caso D - Lejano rojo
        if (w) this.recolor(w, this.colorOf(p));
        this.recolor(p, "BLACK");
        if (w && w.getDer()) this.recolor(w.getDer(), "BLACK");

        const step: RotationStep = {
          type: "RR",
          zId: p.getId(),
          yId: w!.getId(),
          parentOfZId: p.getPadre()?.getId() ?? null,
          BId: w!.getIzq()?.getId() ?? null
        }
        this.lastRbTrace?.actions.push({ kind: "rotation", tag: "L(p)", step });
        this.rotacionIzquierda(p);
        this.pushMid();
      } else {
        // Espejo: x es hijo derecho
        // cercano = w.right, lejano = w.left
        if (this.isBlack(wLeft)) {
          if (wRight) this.recolor(wRight, "BLACK");
          if (w) this.recolor(w, "RED");
          if (w) {
            const step: RotationStep = {
              type: "LR",
              zId: w.getId(),
              yId: w!.getDer()!.getId(),
              parentOfZId: w.getPadre()?.getId() ?? null,
              BId: w!.getDer()!.getIzq()?.getId() ?? null
            }
            this.lastRbTrace?.actions.push({ kind: "rotation", tag: "L(w)", step });
            this.rotacionIzquierda(w);
            this.pushMid();
          }
          const nuevoP = (x !== null) ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getIzq();
        }

        if (w) this.recolor(w, this.colorOf(p));
        this.recolor(p, "BLACK");
        if (w && w.getIzq()) this.recolor(w.getIzq(), "BLACK");

        const step: RotationStep = {
          type: "LL",
          zId: p.getId(),
          yId: w!.getId(),
          parentOfZId: p.getPadre()?.getId() ?? null,
          BId: w!.getDer()?.getId() ?? null
        }
        this.lastRbTrace?.actions.push({ kind: "rotation", tag: "R(p)", step });
        this.rotacionDerecha(p);
        this.pushMid();
      }

      x = this.getRaiz();
      xParent = null;
    }

    this.recolor(x, "BLACK");
  }

  /**
   * Método que realiza una rotación izquierda en el nodo Rojo-Negro dado.
   * @param x Nodo raíz del subárbol a rotar.
   */
  private rotacionIzquierda(x: NodoRB<T>): void {
    const y = x.getDer();
    if (!y) return;

    const T2 = y.getIzq();
    x.setDer(T2);
    if (T2 !== null) T2.setPadre(x);

    y.setPadre(x.getPadre());
    if (x.getPadre() === null) {
      this.setRaiz(y);
    } else if (x === x.getPadre()!.getIzq()) {
      x.getPadre()!.setIzq(y);
    } else {
      x.getPadre()!.setDer(y);
    }

    y.setIzq(x);
    x.setPadre(y);
  }

  /**
   * Método que realiza una rotación derecha en el nodo Rojo-Negro dado.
   * @param x Nodo raíz del subárbol a rotar.
   */
  private rotacionDerecha(x: NodoRB<T>): void {
    const y = x.getIzq();
    if (!y) return;

    const T2 = y.getDer();
    x.setIzq(T2);
    if (T2 !== null) T2.setPadre(x);

    y.setPadre(x.getPadre());
    if (x.getPadre() === null) {
      this.setRaiz(y);
    } else if (x === x.getPadre()!.getDer()) {
      x.getPadre()!.setDer(y);
    } else {
      x.getPadre()!.setIzq(y);
    }

    y.setDer(x);
    x.setPadre(y);
  }


  /**
   * Método que busca un nodo con el valor especificado en el árbol Rojo-Negro.
   * @param valor Valor del elemento a buscar en el árbol.
   * @returns Nodo que contiene el elemento si fue encontrado o null en caso contrario.
   */
  private buscarRN(valor: T): NodoRB<T> | null {
    let x = this.getRaiz();
    while (x) {
      const cmp = this.compare(valor, x.getInfo());
      if (cmp === 0) return x;
      x =
        cmp < 0
          ? (x.getIzq() as NodoRB<T> | null)
          : (x.getDer() as NodoRB<T> | null);
    }
    return null;
  }

  /**
   * Método que reemplaza el subárbol enraizado al nodo u con el subárbol enraizado al nodo v.
   * @param u Nodo a ser reemplazado en el árbol.
   * @param v Nodo para reemplazar u.
   */
  private transplant(u: NodoRB<T>, v: NodoRB<T> | null): void {
    const up = u.getPadre();
    if (up === null) {
      this.setRaiz(v);
      if (v) v.setPadre(null);
    } else if (up.getIzq() === u) {
      up.setIzq(v);
    } else {
      up.setDer(v);
    }
    if (v) v.setPadre(up);
  }

  /**
   * Método que permite modificar el color de un nodo Rojo-Negro.
   * @param node Nodo Rojo-Negro a recolorear.
   * @param to Nuevo color a asignar para el nodo.
   */
  private recolor(node: NodoRB<T> | null, to: RBColor): void {
    if (!node) return;
    const from = node.getColor();
    this.lastRbTrace?.actions.push({ kind: "recolor", id: node.getId(), from, to });
    node.setColor(to);
  }

  /**
   * Método que agrega la estructura jerárquica actual al seguimiento de cambios.
   */
  private pushMid(): void {
    if (!this.lastRbTrace) return;
    this.lastRbTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }

  /**
   * Método que transforma el árbol Rojo-Negro en una estructura jerárquica.
   * @param root Nodo raíz del árbol Rojo-Negro.
   * @returns Estructura jerárquica representando el árbol.
   */
  private toRBHierarchy(root: NodoRB<T>): HierarchyNodeData<T> {
    const left = root.getIzq()
      ? this.toRBHierarchy(root.getIzq() as NodoRB<T>)
      : null;
    const right = root.getDer()
      ? this.toRBHierarchy(root.getDer() as NodoRB<T>)
      : null;

    let children: HierarchyNodeData<T>[] | undefined;

    if (left && right) {
      children = [left, right];
    } else if (left && !right) {
      children = [left, super.createPlaceholder(root, "right")];
    } else if (!left && right) {
      children = [super.createPlaceholder(root, "left"), right];
    } else {
      children = undefined;
    }

    return {
      id: root.getId(),
      value: root.getInfo(),
      color: root.getColor() === "RED" ? "red" : "black",
      children
    };
  }

  /**
   * Método recursivo que clona un árbol Rojo-Negro iniciando desde el nodo raíz dado.
   * @param root Nodo raíz del árbol Rojo-Negro a clonar.
   * @returns Nuevo subárbol clonado con raíz en el nodo dado.
   */
  private clonarRBrec(root: NodoRB<T> | null): NodoRB<T> | null {
    if (root === null) return null;

    const clon = new NodoRB<T>(root.getInfo(), root.getColor(), root.getId());

    const clonIzq = this.clonarRBrec(root.getIzq());
    const clonDer = this.clonarRBrec(root.getDer());

    clon.setIzq(clonIzq);
    clon.setDer(clonDer);

    if (clonIzq) clonIzq.setPadre(clon);
    if (clonDer) clonDer.setPadre(clon);

    return clon;
  }

  /**
   * Método que devuelve el color del nodo Rojo-Negro dado.
   * @param n Nodo cuyo color se va a determinar.
   * @returns Color del nodo.
   */
  private colorOf(n: NodoRB<T> | null): RBColor {
    return n ? n.getColor() : "BLACK"; // nulo se considera negro
  }

  /**
   * Método que determina si el nodo dado es rojo.
   * @param n Nodo a verificar.
   * @returns Booleano que indica si el nodo es de color rojo o no.
   */
  private isRed(n: NodoRB<T> | null): boolean {
    return n !== null && n.getColor() === "RED";
  }

  /**
   * Método que determina si el nodo dado es negro.
   * @param n Nodo a verificar
   * @returns Booleano que indica si el nodo es de color negro o no.
   */
  private isBlack(n: NodoRB<T> | null): boolean {
    return n === null || n.getColor() === "BLACK";
  }

  /**
   * Método que retorna el nodo con menor valor del subárbol enraizado en el nodo dado.
   * @param root Nodo raíz del subárbol a buscar.
   * @returns Nodo más izquierdo del subárbol.
   */
  private minNodo(root: NodoRB<T>): NodoRB<T> {
    let cur: NodoRB<T> = root;
    while (cur.getIzq() !== null) cur = cur.getIzq() as NodoRB<T>;
    return cur;
  }

}