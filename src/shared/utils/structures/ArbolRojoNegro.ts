// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { Comparator, HierarchyNodeData, RBColor, RbRotationTag, RBTrace, RotationStep, RotationType } from "../../../types";
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
   * Método que inserta un nuevo nodo en el árbol Rojo-Negro, garantizando que
   * se mantengan las propiedades de balanceo propias de la estructura.
   * @param valor Elemento a insertar.
   * @returns Nodo Rojo-Negro recién insertado.
   */
  public override insertar(valor: T): NodoRB<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.lastRbTrace = {
      actions: [],
      hierarchies: {
        bst: null,
        mids: []
      }
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

    // Reparación de infracciones
    this.insertFixup(z);
    this.setTamanio(this.getTamanio() + 1);

    return z;
  }

  /**
   * Método que elimina un nodo especifico del árbol Rojo-Negro. Sigue el estándar CLRS para la eliminación 
   * en árboles rojo-negro, y realiza los transplantes necesarios para reparar las infracciones de balance
   * y color tras la eliminación. 
   * @param valor Elemento a eliminar.
   * @returns Objeto que contiene:
   *   - `removed`: Nodo eliminado físicamente del árbol.
   *   - `updated`: Nodo que reemplazó al eliminado (si aplica), o `null` si no hubo reemplazo.
   */
  public override eliminar(valor: T): { removed: NodoRB<T>; updated: NodoRB<T> | null } {
    if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

    const z = this.buscarRN(valor);
    if (!z) {
      throw new Error(
        "No fue posible eliminar el nodo: El elemento no existe en el árbol."
      );
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.lastRbTrace = {
      actions: [],
      hierarchies: {
        bst: null,
        mids: []
      }
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
      removed = z;
      y = this.minNodo(z.getDer()!);
      updated = y;

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
      this.recolor(y, z.getColor(), "Nodo");
    }

    // Reparación de infracciones
    if (yOriginalColor === "BLACK") {
      this.deleteFixup(x, xParent);
    }
    this.setTamanio(this.getTamanio() - 1);

    return { removed: removed!, updated };
  }

  /**
   * Método que determina la existencia de un elemento dentro del árbol Rojo-Negro.
   * @param valor Elemento a buscar en el árbol Rojo-Negro.
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
   * Método que retorna un array de nodos resultante del recorrido in-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia in-orden.
   */
  public override inOrden(): NodoRB<T>[] {
    return super.inOrden() as NodoRB<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido pre-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia pre-orden.
   */
  public override preOrden(): NodoRB<T>[] {
    return super.preOrden() as NodoRB<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido post-orden del árbol Rojo-Negro.
   * @returns Array de nodos en secuencia post-orden.
   */
  public override postOrden(): NodoRB<T>[] {
    return super.postOrden() as NodoRB<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido por niveles del árbol Rojo-Negro.
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
   * Método que consume y limpia la última traza del árbol Rojo-Negro registrada.
   * @returns Última traza del árbol o null si no existe.
   */
  public consumeLastRbTrace(): RBTrace<T> | null {
    const t = this.lastRbTrace;
    this.lastRbTrace = null;
    return t;
  }

  /**
   * Método que restaura las propiedades del árbol Rojo-Negro luego de la inserción de un nuevo nodo.
   * Maneja 3 casos principales dependiendo del color y posición del nodo padre, tío y abuelo:
   *
   * - Caso 1: Si el tío es rojo, recoloreamos padre, tío y abuelo.
   * - Caso 2: Si el nodo forma un triángulo con su padre y abuelo,
   *   realizamos una rotación sobre el padre.
   * - Caso 3: Si el nodo forma una línea con su padre y abuelo,
   *   realizamos una rotación sobre el abuelo.
   *
   * Durante cada caso, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
   * @param z Nodo que se acaba de insertar que podria inflingir las propiedades del árbol.
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
          this.recolor(p, "BLACK", "Padre");
          this.recolor(y, "BLACK", "Tío");
          this.recolor(g, "RED", "Abuelo");
          z = g;
        } else {
          // Capturar el estado pre-rotación
          this.ensureRBTraceInit();

          // Caso 2: triángulo → rotación izquierda en padre
          if (z === p.getDer()) {
            // Capturar info de la rotación a aplicar
            this.pushRbRotationInfo(p, z, z.getIzq(), "L(padre)", "LR");

            // Rotación y Captura del estado posterior
            z = p;
            this.rotacionIzquierda(z);
            this.pushRbRotationHierarchy();
          }
          // Caso 3: línea → rotación derecha en abuelo
          this.recolor(z.getPadre()!, "BLACK", "Padre");
          this.recolor(g, "RED", "Abuelo");

          // Capturar info de la rotación a aplicar
          this.pushRbRotationInfo(g, g.getIzq()!, g.getIzq()?.getDer() ?? null, "R(abuelo)", "LL");

          // Rotación y Captura del estado posterior
          this.rotacionDerecha(g);
          this.pushRbRotationHierarchy();
        }
      } else {
        // simétrico (padre es hijo derecho del abuelo)
        const y = g.getIzq();

        if (this.isRed(y)) {
          this.recolor(p, "BLACK", "Padre");
          this.recolor(y, "BLACK", "Tío");
          this.recolor(g, "RED", "Abuelo");
          z = g;
        } else {
          // Capturar el estado pre-rotación
          this.ensureRBTraceInit();

          // Caso 2: triángulo → rotación derecha en padre
          if (z === p.getIzq()) {
            // Capturar info de la rotación a aplicar
            this.pushRbRotationInfo(p, z, z.getDer(), "R(padre)", "RL");

            // Rotación y Captura del estado posterior
            z = p;
            this.rotacionDerecha(z);
            this.pushRbRotationHierarchy();
          }
          // Caso 3: línea → rotación izquierda en abuelo
          this.recolor(z.getPadre()!, "BLACK", "Padre");
          this.recolor(g, "RED", "Abuelo");

          // Capturar info de la rotación a aplicar
          this.pushRbRotationInfo(g, g.getDer()!, g.getDer()!.getIzq(), "L(abuelo)", "RR");

          // Rotación y Captura del estado posterior
          this.rotacionIzquierda(g);
          this.pushRbRotationHierarchy();
        }
      }
    }
    const root = this.getRaiz();
    if (root && root.getColor() !== "BLACK") {
      this.recolor(root, "BLACK", "Raíz");
    }
  }

  /**
   * Método que restaura las propiedades del árbol Rojo-Negro luego de la eliminación de un nodo.
   * Maneja los siguientes casos:
   * 
   * - Caso A: Hermano es rojo (rotación y reoloreo).
   * - Caso B: Hermano es negro con hijos negros (recoloreo y subida).
   * - Caso C/D: Hermano es negro con al menos un hijo rojo (rotaciones y recoloreo).
   *
   * Durante cada caso, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
   * @param x Nodo donde iniciar la restauración (puede ser nulo).
   * @param xParent Padre del nodo x (usado si x es nulo).
   */
  private deleteFixup(x: NodoRB<T> | null, xParent: NodoRB<T> | null): void {
    while (x !== this.getRaiz() && this.isBlack(x)) {
      const p = x !== null ? x.getPadre() : xParent;
      if (!p) break;

      const xEsIzq = p.getIzq() === x;
      let w = xEsIzq ? p.getDer() : p.getIzq();

      // Caso A - Hermano rojo
      if (this.isRed(w)) {
        // Capturar el estado pre-rotación
        this.ensureRBTraceInit();

        this.recolor(w, "BLACK", "Tío");
        this.recolor(p, "RED", "Padre");

        if (xEsIzq) {
          // Capturar info de la rotación a aplicar
          this.pushRbRotationInfo(p, w!, w!.getIzq(), "L(padre)", "RR");
          this.rotacionIzquierda(p);
        } else {
          // Capturar info de la rotación a aplicar
          this.pushRbRotationInfo(p, w!, w!.getDer(), "R(padre)", "LL");
          this.rotacionDerecha(p);
        }
        // Capturar el estado post-rotación
        this.pushRbRotationHierarchy();

        const nuevoP = (x !== null) ? x.getPadre() : xParent!;
        xParent = nuevoP;
        w = xEsIzq ? nuevoP!.getDer() : nuevoP!.getIzq();
      }

      const wLeft = w ? w.getIzq() : null;
      const wRight = w ? w.getDer() : null;

      // Caso B - w negro con hijos negros
      if (this.isBlack(wLeft) && this.isBlack(wRight)) {
        if (w) this.recolor(w, "RED", "Tío");
        x = p;
        xParent = p.getPadre();
        continue;
      }

      // Capturar el estado pre-rotación
      this.ensureRBTraceInit();

      // Caso C/D
      if (xEsIzq) {
        // Lado izquierdo: cercano = w.left, lejano = w.right
        // Caso C - cercano rojo, lejano negro
        if (this.isBlack(wRight)) {
          if (wLeft) this.recolor(wLeft, "BLACK", "PrimoCer");
          if (w) this.recolor(w, "RED", "Tío");
          if (w) {
            // Capturar info de la rotación a aplicar
            this.pushRbRotationInfo(w, w.getIzq()!, w!.getIzq()!.getDer(), "R(tío)", "RL");

            // Rotación y Captura del estado posterior
            this.rotacionDerecha(w);
            this.pushRbRotationHierarchy();
          }
          const nuevoP = x !== null ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getDer();
        }

        // Caso D - Lejano rojo
        if (w) this.recolor(w, this.colorOf(p), "Tío");
        this.recolor(p, "BLACK", "Padre");
        if (w && w.getDer()) this.recolor(w.getDer(), "BLACK", "PrimoLej");

        // Capturar info de la rotación a aplicar
        this.pushRbRotationInfo(p, w!, w!.getIzq(), "L(padre)", "RR");

        // Capturar estado post-rotación
        this.rotacionIzquierda(p);
        this.pushRbRotationHierarchy();
      } else {
        // Espejo: x es hijo derecho
        // cercano = w.right, lejano = w.left
        if (this.isBlack(wLeft)) {
          if (wRight) this.recolor(wRight, "BLACK", "PrimoCer");
          if (w) this.recolor(w, "RED", "Tío");
          if (w) {
            // Capturar info de la rotación a aplicar
            this.pushRbRotationInfo(w, w.getDer()!, w!.getDer()!.getIzq(), "L(tío)", "LR");

            // Rotación y Captura del estado posterior
            this.rotacionIzquierda(w);
            this.pushRbRotationHierarchy();
          }
          const nuevoP = (x !== null) ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getIzq();
        }

        if (w) this.recolor(w, this.colorOf(p), "Tío");
        this.recolor(p, "BLACK", "Padre");
        if (w && w.getIzq()) this.recolor(w.getIzq(), "BLACK", "PrimoLej");

        // Capturar info de la rotación a aplicar
        this.pushRbRotationInfo(p, w!, w!.getDer(), "R(padre)", "LL");

        // Rotación y Captura del estado posterior
        this.rotacionDerecha(p);
        this.pushRbRotationHierarchy();
      }

      x = this.getRaiz();
      xParent = null;
    }

    this.recolor(x, "BLACK", "Nodo");
  }

  /**
   * Método que realiza una rotación izquierda en el nodo Rojo-Negro dado.
   * @param x Nodo raíz del subárbol a rotar.
   */
  private rotacionIzquierda(x: NodoRB<T>): void {
    const y = x.getDer();
    if (!y) return;

    // Recolocar T2 como hijo derecho de x
    const T2 = y.getIzq();
    x.setDer(T2);
    if (T2 !== null) T2.setPadre(x);

    // Enlazar y con el padre x
    y.setPadre(x.getPadre());
    if (x.getPadre() === null) {
      this.setRaiz(y);
    } else if (x === x.getPadre()!.getIzq()) {
      x.getPadre()!.setIzq(y);
    } else {
      x.getPadre()!.setDer(y);
    }

    // Colocar x bajo y
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

    // Recolocar T2 como hijo izquierdo de x
    const T2 = y.getDer();
    x.setIzq(T2);
    if (T2 !== null) T2.setPadre(x);

    // Enlazar y con el padre x
    y.setPadre(x.getPadre());
    if (x.getPadre() === null) {
      this.setRaiz(y);
    } else if (x === x.getPadre()!.getDer()) {
      x.getPadre()!.setDer(y);
    } else {
      x.getPadre()!.setIzq(y);
    }

    // Colocar x bajo y
    y.setDer(x);
    x.setPadre(y);
  }

  /**
   * Método que busca un nodo especifico en el árbol Rojo-Negro.
   * @param valor Elemento a buscar en el árbol Rojo-Negro.
   * @returns Nodo que contiene el elemento buscado o null en si no fue encontrado.
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
   * @param nodeBadge Credencial o placa que identifica al nodo a recolorear.
   */
  private recolor(node: NodoRB<T> | null, to: RBColor, nodeBadge: string): void {
    if (!node) return;
    const from = node.getColor();
    this.lastRbTrace?.actions.push({ kind: "recolor", id: node.getId(), from, to, nodeBadge });
    node.setColor(to);
  }

  /**
   * Método recursivo que convierte un nodo del árbol Rojo-Negro en una estructura de datos
   * jerárquica adecuada para visualización o procesamiento posterior.
   * @param root Nodo raíz del árbol Rojo-Negro.
   * @returns Objeto que representa la estructura jerárquica del árbol Rojo-Negro.
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
   * @param root Nodo raíz del subárbol a clonar.
   * @returns Una nueva instancia `NodoRB<T>` que es una clonación profunda del subárbol.
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
   * Método que recorre los hijos izquierdos del subárbol dado hasta encontrar el nodo más a la izquierda.
   * @param root Nodo raíz del subárbol a buscar.
   * @returns Nodo con el mínimo valor del subárbol.
   */
  private minNodo(root: NodoRB<T>): NodoRB<T> {
    let cur: NodoRB<T> = root;
    while (cur.getIzq() !== null) cur = cur.getIzq() as NodoRB<T>;
    return cur;
  }

  /**
   * Método que registra información sobre un paso de rotación realizado durante
   * la restauración en una inserción o eliminación.
   * @param zNode Nodo que rota (z).
   * @param yNode Nodo implicado en la rotación (y).
   * @param BNode Nodo del subárbol (B) afectado por la rotación.
   * @param rotationTag Etiqueta que identifica el paso de rotación.
   * @param rotationType Tipo de rotación realizada.
   */
  private pushRbRotationInfo(
    zNode: NodoRB<T>,
    yNode: NodoRB<T>,
    BNode: NodoRB<T> | null,
    rotationTag: RbRotationTag,
    rotationType: RotationType,
  ): void {
    const step: RotationStep = {
      type: rotationType,
      zId: zNode.getId(),
      yId: yNode.getId(),
      parentOfZId: zNode.getPadre()?.getId() ?? null,
      BId: BNode?.getId() ?? null
    }
    this.lastRbTrace?.actions.push({ kind: "rotation", tag: rotationTag, step });
  }

  /**
   * Método que agrega la estructura jerárquica actual a la traza de seguimiento del estado del árbol.
   */
  private pushRbRotationHierarchy(): void {
    if (!this.lastRbTrace) return;
    this.lastRbTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }

  /**
   * Método que asegura que se inicialice la traza RB de la jerárquia BST.
   */
  private ensureRBTraceInit() {
    if (this.lastRbTrace && !this.lastRbTrace.hierarchies.bst) {
      this.lastRbTrace.hierarchies.bst = this.convertirEstructuraJerarquica();
    }
  }

}