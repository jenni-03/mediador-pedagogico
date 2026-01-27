// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BinaryTreeLevelOutput, BinaryTreeTraverseOutput, BSTSearchOutput, Comparator, HierarchyNodeData, RBColor, RBDeleteOutput, RBDeleteStep, RBInsertOutput, RBInsertStep, RbRotationTag, RBTrace, RotationStep, RotationType } from "../utils/types";
import { NodoRB } from "../nodes/NodoRB";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { defaultComparator } from "../utils/treeUtils";
import { DomainError } from "../error/DomainError";

/**
 * Clase que representa el funcionamiento de un árbol Rojo-Negro.
 */
export class ArbolRojoNegro<T> extends ArbolBinarioBusqueda<T> {

  private rbOperationTrace: RBTrace<T> | null = null;

  /**
   * Constructor de la clase ArbolRojoNegro.
   */
  constructor(
    compare: Comparator<T> = defaultComparator
  ) {
    super(compare);
  }

  /**
   * Método que inserta un nuevo nodo en el árbol Rojo-Negro, garantizando que se mantengan las propiedades de
   * balanceo propias de la estructura.
   * @param valor Elemento a insertar.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la inserción 
   *    (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `parent`: Nodo padre bajo el cual se insertó el nuevo nodo. Será `null` en 2 casos:
   *    1. Si el elemento ya existía en el árbol.
   *    2. Si el nuevo nodo se insertó como raíz.
   * 
   * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si ya existía en el árbol.
   * 
   * - `inserted`: Booleano que indica si el elemento fue insertado.
   */
  public insertarRB(valor: T): RBInsertOutput<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.rbOperationTrace = {
      actions: [],
      hierarchies: {
        bst: null,
        mids: []
      }
    }

    const steps: RBInsertStep[] = [];

    // Inserción BST estándar
    let y: NodoRB<T> | null = null; // padre
    let x: NodoRB<T> | null = this.getRaiz(); // cursor

    while (x !== null) {
      steps.push({ type: "visit", at: x.getId() });

      const cmp = this.compare(valor, x.getInfo());
      steps.push({ type: "compare", at: x.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
      if (cmp === 0) {
        steps.push({ type: "return" });
        return { steps, parent: null, targetNode: x, inserted: false };
      }

      y = x;
      const next = cmp < 0 ? x.getIzq() : x.getDer();
      steps.push({ type: "advance", from: x.getId(), to: next?.getId() ?? null, dir: cmp < 0 ? "L" : "R" });
      x = next;
    }
    steps.push({ type: "visit", at: null });

    // z nace como rojo
    const z = new NodoRB<T>(valor, "RED");
    steps.push({ type: "createNode", id: z.getId(), color: "RED" });

    z.setPadre(y);

    if (!y) {
      // Árbol vacío
      this.setRaiz(z);
      steps.push({ type: "attachNode", parentId: null, side: "root" });
    } else if (this.compare(valor, y.getInfo()) < 0) {
      y.setIzq(z);
      steps.push({ type: "attachNode", parentId: y.getId(), side: "left" });
    } else {
      y.setDer(z);
      steps.push({ type: "attachNode", parentId: y.getId(), side: "right" });
    }

    // Reparación de infracciones
    this.insertFixup(z, steps);

    this.setTamanio(this.getTamanio() + 1);
    steps.push({ type: "return" });
    return { steps, parent: y, targetNode: z, inserted: true };
  }

  /**
   * Método que elimina un nodo especifico del árbol Rojo-Negro. Sigue el estándar CLRS para la eliminación 
   * en árboles rojo-negro, y realiza los transplantes necesarios para reparar las infracciones de balance
   * y color tras la eliminación. 
   * @param valor Elemento a eliminar.
   * @returns Objeto con la siguiente información:
   * 
   *  - `pathToTargetIds`: Lista con los IDs de los nodos visitados durante la búsqueda, 
   *     en orden desde la raíz hasta el nodo objetivo (incluye el nodo objetivo si fue encontrado).
   * 
   *  - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
   *     1. Si el nodo eliminado era la raíz.
   *     2. Si el valor no se encontró en el árbol.
   * 
   *  - `targetNode`: Nodo objetivo que se intentó eliminar (nodo eliminado o último nodo visitado durante la búsqueda).
   * 
   *  - `pathToSuccessorIds`: Lista con los IDs de los nodos visitados durante la búsqueda del sucesor in-order (solo se llena si el nodo eliminado tenía dos hijos).
   * 
   *  - `successor`: Nodo que reemplazó lógicamente al nodo eliminado en el caso de dos hijos (nodo cuyo valor fue copiado al nodo objetivo).  
   *     Será `null` en los demás casos.
   * 
   *  - `replacement`: Nodo que ocupó físicamente el lugar del nodo eliminado en el árbol. Puede ser:
   *     1. El hijo izquierdo o derecho (si existía uno).  
   *     2. `null` si se eliminó una hoja.  
   *     3. El hijo derecho del sucesor in-order (en el caso de dos hijos).
   * 
   *  - `exists`: Booleano que indica si el elemento fue encontrado y eliminado (`true`) o no (`false`).
   */
  public eliminarRB(valor: T): RBDeleteOutput<T> {
    if (this.esVacio()) {
      throw new DomainError("No fue posible eliminar el nodo: El árbol árbol se encuentra vacío (cantidad de nodos: 0).", "DELETE_EMPTY");
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.rbOperationTrace = {
      actions: [],
      hierarchies: {
        bst: null,
        mids: []
      }
    }

    const steps: RBDeleteStep[] = [];
    const pathToSuccessorIds: string[] = [];
    let target: NodoRB<T> | null = null;
    let targetParent: NodoRB<T> | null = null;
    let successor: NodoRB<T> | null = null;
    let successorParent: NodoRB<T> | null = null;

    // Búsqueda del nodo a eliminar
    let z = this.getRaiz();
    while (z !== null) {
      steps.push({ type: "visit", at: z.getId() });

      const cmp = this.compare(valor, z.getInfo());
      steps.push({ type: "compare", at: z.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });

      if (cmp === 0) break;

      const next = cmp < 0 ? z.getIzq() : z.getDer();
      steps.push({
        type: "advance",
        from: z.getId(),
        to: next?.getId() ?? null,
        dir: cmp < 0 ? "L" : "R"
      });
      z = next;
    }
    steps.push({ type: "visit", at: null });

    // No encontrado
    steps.push({ type: "checkMatch", found: z !== null, zId: z?.getId() ?? null });
    if (!z) {
      steps.push({ type: "return" });
      return {
        steps,
        parent: null,
        targetNode: null,
        pathToSuccessorIds,
        successor: null,
        successorParent: null,
        replacement: null,
        deleted: false
      };
    }

    target = z;
    targetParent = z.getPadre();

    // Nodo a eliminar físicamente
    let y: NodoRB<T> = z;
    let yOriginalColor: RBColor = y.getColor();

    // Reemplazo del nodo a eliminar 
    let x: NodoRB<T> | null = null;
    let xParent: NodoRB<T> | null = null;

    // Caso 0 o 1 hijo (solo derecho)
    if (z.getIzq() === null) {
      steps.push({ type: "deleteCase", kind: "noLeft", zId: z.getId() });

      x = z.getDer();
      xParent = z.getPadre();

      this.captureTransplantStep(z, x, steps);
      this.transplant(z, x);
    } else if (z.getDer() === null) {
      // Caso 1 hijo (solo izquierdo)
      steps.push({ type: "deleteCase", kind: "noRight", zId: z.getId() });

      x = z.getIzq();
      xParent = z.getPadre();

      this.captureTransplantStep(z, x, steps);
      this.transplant(z, x);
    } else {
      // Caso 2 hijos
      steps.push({ type: "deleteCase", kind: "twoChildren", zId: z.getId() });

      let succ = z.getDer()!;
      while (succ.getIzq()) {
        pathToSuccessorIds.push(succ.getId());
        succ = succ.getIzq()!;
      }
      pathToSuccessorIds.push(succ.getId());

      successor = succ;
      successorParent = succ.getPadre();

      y = succ;
      yOriginalColor = y.getColor();
      x = y.getDer();

      const directChild = y.getPadre() === z;
      steps.push({ type: "succParentCheck", directChild, zId: z.getId(), succId: y.getId() });
      if (directChild) {
        xParent = y;
      } else {
        this.captureTransplantStep(y, y.getDer(), steps);
        this.transplant(y, y.getDer());

        steps.push({ type: "linkChild", prevParentId: z.getId(), newParentId: y.getId(), childId: z.getDer()?.getId() ?? null, side: "right" });
        y.setDer(z.getDer());

        steps.push({ type: "setParent", nodeId: y.getDer()?.getId() ?? null, parentId: y.getId(), side: "right" });
        if (y.getDer()) {
          y.getDer()!.setPadre(y);
        }
        xParent = y.getPadre();
      }

      this.captureTransplantStep(z, y, steps);
      this.transplant(z, y);

      steps.push({ type: "linkChild", prevParentId: z.getId(), newParentId: y.getId(), childId: z.getIzq()?.getId() ?? null, side: "left" });
      y.setIzq(z.getIzq());

      steps.push({ type: "setParent", nodeId: y.getIzq()?.getId() ?? null, parentId: y.getId(), side: "left" });
      if (y.getIzq()) {
        y.getIzq()!.setPadre(y);
      }

      // Conservar color de z (para no alterar altura negra aquí)
      this.recolor(y, z.getColor(), "Nodo");
      steps.push({ type: "recolor", kind: "copyZColor", actionIndex: this.rbOperationTrace.actions.length - 1, count: 1 });
    }

    // Reparación de infracciones
    const needsFixup = yOriginalColor === "BLACK";
    steps.push({ type: "fixupCall", needed: needsFixup });
    if (yOriginalColor === "BLACK") {
      this.deleteFixup(x, xParent, steps);
    }
    this.setTamanio(this.getTamanio() - 1);

    return {
      steps,
      parent: targetParent,
      targetNode: target,
      pathToSuccessorIds,
      successor,
      successorParent,
      replacement: x,
      deleted: true
    };
  }

  /**
   * Método que busca un nodo específico en el árbol Rojo-Negro.
   * @param valor Elemento a buscar.
   * @returns Objeto con la siguiente información:
   * 
   *  - `pathIds`: Lista con los IDs de los nodos visitados, en orden, desde la raíz hasta el nodo donde se detuvo la búsqueda.
   * 
   *  - `lastVisited`: Último nodo visitado durante el recorrido. Puede ser:
   *     1. El nodo que contiene el valor buscado si fue encontrado.
   *     2. El nodo donde la búsqueda se detuvo sin éxito (padre de la rama nula).
   *     3. `null` si el árbol está vacío.
   * 
   *  - `found`: Booleano que indica si el elemento fue encontrado (`true`) o no (`false`).
   */
  public buscarRB(valor: T): BSTSearchOutput<T> {
    return super.buscarABB(valor);
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
   * @returns Arreglo que contiene todos los nodos hoja presentes en el árbol.
   */
  public override getHojas(): NodoRB<T>[] {
    return super.getHojas() as NodoRB<T>[];
  }

  /**
   * Método que cuenta el número de nodos hoja presentes en el árbol Rojo-Negro.
   * @returns Número de nodos hoja presentes en el árbol.
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
   * Método que realiza el recorrido inorden del árbol Rojo-Negro.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
   *    del árbol (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia inorden.
   */
  public override inOrden(): BinaryTreeTraverseOutput<T> {
    return super.inOrden();
  }

  /**
   * Método que realiza el recorrido preorden del árbol Rojo-Negro.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
   *    del árbol (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia preorden.
   */
  public override preOrden(): BinaryTreeTraverseOutput<T> {
    return super.preOrden();
  }

  /**
   * Método que realiza el recorrido postorden del árbol Rojo-Negro.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
   *    del árbol (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `visited`: Arreglo de nodos visitados durante el recorrido en secuencia postorden.
   */
  public override postOrden(): BinaryTreeTraverseOutput<T> {
    return super.postOrden();
  }

  /**
   * Método que realiza el recorrido por niveles del árbol Rojo-Negro.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante el recorrido 
   *    del árbol (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `visited`: Arreglo de nodos visitados durante el recorrido por niveles.
   */
  public override getNodosPorNiveles(): BinaryTreeLevelOutput<T> {
    return super.getNodosPorNiveles();
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
    nuevoArbol.setRaiz(this.clonarRBAux(this.getRaiz()));
    nuevoArbol.setTamanio(this.getTamanio());
    return nuevoArbol;
  }

  /**
   * Método que consume y limpia la última traza de operación del árbol Rojo-Negro registrada.
   * @returns Última traza del árbol Rojo-Negro registada o null si no existe.
   */
  public consumeLastRbTrace(): RBTrace<T> | null {
    const t = this.rbOperationTrace;
    this.rbOperationTrace = null;
    return t;
  }

  /**
   * Método auxiliar que restaura las propiedades del árbol Rojo-Negro luego de la inserción de un nuevo nodo.
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
   * @param steps Arreglo para acumular los pasos de fixup realizados durante la operación.
   */
  private insertFixup(z: NodoRB<T>, steps: RBInsertStep[]): void {
    const trace = this.rbOperationTrace;

    while (this.isRed(z.getPadre())) {
      const p = z.getPadre()!;
      const g = p.getPadre()!;

      steps.push({
        type: "fixupWhileCheck",
        zId: z.getId(),
        parentId: p.getId(),
        parentRed: this.isRed(p)
      });

      // Padre es hijo izquierdo de abuelo
      const parentSide = g.getIzq() === p ? "left" : "right";
      steps.push({ type: "parentSide", pId: p.getId(), gId: g.getId(), side: parentSide });

      if (parentSide === "left") {
        const y = g.getDer();

        if (this.isRed(y)) {
          // Caso 1: Tío rojo → recolorear
          steps.push({ type: "fixupCase", case: 1, side: "left" });

          this.recolor(p, "BLACK", "Padre");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 1, side: "left" });

          this.recolor(y, "BLACK", "Tío");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 2, side: "left" });

          this.recolor(g, "RED", "Abuelo");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 3, side: "left" });

          z = g;
        } else {
          // Capturar el estado pre-rotación
          this.ensureRBTraceInit();

          // Caso 2: triángulo → rotación izquierda en padre
          if (z === p.getDer()) {
            steps.push({ type: "fixupCase", case: 2, side: "left" });

            // Capturar info de la rotación a aplicar
            this.pushRbRotationStep(p, z, z.getIzq(), "Izq(padre)", "LR");

            // Rotación y Captura del estado posterior
            const pivot = p;
            z = p;
            this.rotacionIzquierda(z);

            this.pushRbRotationHierarchy();
            this.captureFixupRotateStep(steps, trace, "case2", "left", pivot);
          }
          // Caso 3: línea → rotación derecha en abuelo
          steps.push({ type: "fixupCase", case: 3, side: "left" });

          this.recolor(z.getPadre()!, "BLACK", "Padre");
          if (trace) steps.push({ type: "recolor", caseKind: "case3", actionIndex: trace.actions.length - 1, count: 1, side: "left" });

          this.recolor(g, "RED", "Abuelo");
          if (trace) steps.push({ type: "recolor", caseKind: "case3", actionIndex: trace.actions.length - 1, count: 2, side: "left" });

          // Capturar info de la rotación a aplicar
          this.pushRbRotationStep(g, g.getIzq()!, g.getIzq()?.getDer() ?? null, "Der(abuelo)", "LL");

          // Rotación y Captura del estado posterior
          const pivot = g;
          this.rotacionDerecha(g);

          this.pushRbRotationHierarchy();
          this.captureFixupRotateStep(steps, trace, "case3", "right", pivot);
        }
      } else {
        // simétrico (padre es hijo derecho del abuelo)
        const y = g.getIzq();

        if (this.isRed(y)) {
          steps.push({ type: "fixupCase", case: 1, side: "right" });

          this.recolor(p, "BLACK", "Padre");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 1, side: "right" });

          this.recolor(y, "BLACK", "Tío");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 2, side: "right" });

          this.recolor(g, "RED", "Abuelo");
          if (trace) steps.push({ type: "recolor", caseKind: "case1", actionIndex: trace.actions.length - 1, count: 3, side: "right" });

          z = g;
        } else {
          // Capturar el estado pre-rotación
          this.ensureRBTraceInit();

          // Caso 2: triángulo → rotación derecha en padre
          if (z === p.getIzq()) {
            steps.push({ type: "fixupCase", case: 2, side: "right" });

            // Capturar info de la rotación a aplicar
            this.pushRbRotationStep(p, z, z.getDer(), "Der(padre)", "RL");

            // Rotación y Captura del estado posterior
            const pivot = p;
            z = p;
            this.rotacionDerecha(z);

            this.pushRbRotationHierarchy();
            this.captureFixupRotateStep(steps, trace, "case2", "right", pivot);
          }
          // Caso 3: línea → rotación izquierda en abuelo
          steps.push({ type: "fixupCase", case: 3, side: "right" });

          this.recolor(z.getPadre()!, "BLACK", "Padre");
          if (trace) steps.push({ type: "recolor", caseKind: "case3", actionIndex: trace.actions.length - 1, count: 1, side: "right" });

          this.recolor(g, "RED", "Abuelo");
          if (trace) steps.push({ type: "recolor", caseKind: "case3", actionIndex: trace.actions.length - 1, count: 2, side: "right" });

          // Capturar info de la rotación a aplicar
          this.pushRbRotationStep(g, g.getDer()!, g.getDer()!.getIzq(), "Izq(abuelo)", "RR");

          // Rotación y Captura del estado posterior
          const pivot = p;
          this.rotacionIzquierda(g);

          this.pushRbRotationHierarchy();
          this.captureFixupRotateStep(steps, trace, "case3", "left", pivot);
        }
      }
    }
    steps.push({
      type: "fixupWhileCheck",
      zId: z.getId(),
      parentId: z.getPadre()?.getId() ?? null,
      parentRed: false
    });

    // Asegurar que la raíz sea negra
    const root = this.getRaiz();
    const shouldRecolor = !!root && root.getColor() !== "BLACK";
    steps.push({ type: "rootBlackCheck", rootId: root?.getId() ?? null, recolor: shouldRecolor });

    if (shouldRecolor) {
      this.recolor(root, "BLACK", "Raíz");
      if (trace) steps.push({ type: "recolor", caseKind: "root", actionIndex: trace.actions.length - 1, count: 1 });
    }
  }

  /**
   * Método auxiliar que restaura las propiedades del árbol Rojo-Negro luego de la eliminación de un nodo.
   * Maneja los siguientes casos:
   * 
   * - Caso A: Hermano es rojo (rotación y reoloreo).
   * - Caso B: Hermano es negro con hijos negros (recoloreo y subida).
   * - Caso C/D: Hermano es negro con al menos un hijo rojo (rotaciones y recoloreo).
   *
   * Durante cada caso, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
   * @param x Nodo donde iniciar la restauración (puede ser nulo).
   * @param xParent Padre del nodo x (usado si x es nulo).
   * @param steps Arreglo para acumular los pasos de fixup realizados durante la operación.
   */
  private deleteFixup(x: NodoRB<T> | null, xParent: NodoRB<T> | null, steps: RBDeleteStep[]): void {
    const trace = this.rbOperationTrace;

    while (x !== this.getRaiz() && this.isBlack(x)) {
      steps.push({
        type: "fixupWhileCheck",
        xId: x?.getId() ?? null,
        xParentId: xParent?.getId() ?? null,
        continue: x !== this.getRaiz() && this.isBlack(x)
      });

      const p = x !== null ? x.getPadre() : xParent;
      steps.push({ type: "resolveParent", pId: p?.getId() ?? null, from: x !== null ? "x.padre" : "xParent" });
      if (!p) break;

      const xEsIzq = p.getIzq() === x;
      const side = xEsIzq ? "left" : "right";

      let w = xEsIzq ? p.getDer() : p.getIzq();
      steps.push({ type: "resolveSibling", pId: p.getId(), wId: w?.getId() ?? null, side });

      // Caso A - Hermano rojo
      if (this.isRed(w)) {
        steps.push({ type: "fixupCase", case: "A", side, nodeId: x?.getId() ?? w!.getId() });

        // Capturar el estado pre-rotación
        this.ensureRBTraceInit();

        this.recolor(w, "BLACK", "Hermano");
        if (trace) steps.push({ type: "recolor", kind: "fixup", case: "A", side, count: 1, actionIndex: trace.actions.length - 1 });

        this.recolor(p, "RED", "Padre");
        if (trace) steps.push({ type: "recolor", kind: "fixup", case: "A", side, count: 2, actionIndex: trace.actions.length - 1 });

        // Capturar info de la rotación a aplicar
        if (xEsIzq) {
          this.pushRbRotationStep(p, w!, w!.getIzq(), "Izq(padre)", "RR");
          this.rotacionIzquierda(p);
        } else {
          this.pushRbRotationStep(p, w!, w!.getDer(), "Der(padre)", "LL");
          this.rotacionDerecha(p);
        }

        // Captura del estado posterior
        this.pushRbRotationHierarchy();
        this.captureFixupRotateStep(steps, trace, "fixupA", xEsIzq ? "left" : "right", p);

        const nuevoP = (x !== null) ? x.getPadre() : xParent!;
        xParent = nuevoP;
        w = xEsIzq ? nuevoP!.getDer() : nuevoP!.getIzq();
      }

      const wLeft = w ? w.getIzq() : null;
      const wRight = w ? w.getDer() : null;

      // Caso B - w negro con hijos negros
      if (this.isBlack(wLeft) && this.isBlack(wRight)) {
        steps.push({ type: "fixupCase", case: "B", side, nodeId: w?.getId() ?? p.getId() });

        steps.push({ type: "checkNode", nodeType: "Hermano", case: "B", side });
        if (w) {
          this.recolor(w, "RED", "Hermano");
          if (trace) steps.push({ type: "recolor", kind: "fixup", case: "B", side, count: 1, actionIndex: trace.actions.length - 1 });
        }

        steps.push({ type: "moveUp", fromXId: x?.getId() ?? null, toXId: p.getId(), newXParentId: p.getPadre()?.getId() ?? null });
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
          steps.push({ type: "fixupCase", case: "C", side, nodeId: w!.getId() });

          steps.push({ type: "checkNode", nodeType: "HijoCer", case: "C", side });
          if (wLeft) {
            this.recolor(wLeft, "BLACK", "HijoCer");
            if (trace) steps.push({ type: "recolor", kind: "fixup", case: "C", side, count: 1, actionIndex: trace.actions.length - 1 });
          }

          steps.push({ type: "checkNode", nodeType: "Hermano", case: "C", side });
          if (w) {
            this.recolor(w, "RED", "Hermano");
            if (trace) steps.push({ type: "recolor", kind: "fixup", case: "C", side, count: 2, actionIndex: trace.actions.length - 1 });

            // Capturar info de la rotación a aplicar
            this.pushRbRotationStep(w, w.getIzq()!, w!.getIzq()!.getDer(), "Der(hermano)", "RL");

            // Rotación y Captura del estado posterior
            this.rotacionDerecha(w);

            this.pushRbRotationHierarchy();
            this.captureFixupRotateStep(steps, trace, "fixupC", "right", w);
          }

          const nuevoP = x !== null ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getDer();
        }

        // Caso D - Lejano rojo
        steps.push({ type: "fixupCase", case: "D", side, nodeId: w!.getId() });

        steps.push({ type: "checkNode", nodeType: "Hermano", case: "D", side });
        if (w) {
          this.recolor(w, this.colorOf(p), "Hermano");
          if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 1, actionIndex: trace.actions.length - 1 });
        }

        this.recolor(p, "BLACK", "Padre");
        if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 2, actionIndex: trace.actions.length - 1 });

        steps.push({ type: "checkNode", nodeType: "HijoLej", case: "D", side });
        if (w && w.getDer()) {
          this.recolor(w.getDer(), "BLACK", "HijoLej");
          if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 3, actionIndex: trace.actions.length - 1 });
        }

        // Capturar info de la rotación a aplicar
        this.pushRbRotationStep(p, w!, w!.getIzq(), "Izq(padre)", "RR");

        // Rotación y Captura del estado posterior
        this.rotacionIzquierda(p);

        this.pushRbRotationHierarchy();
        this.captureFixupRotateStep(steps, trace, "fixupD", "left", p);
      } else {
        // Espejo: x es hijo derecho
        // cercano = w.right, lejano = w.left
        if (this.isBlack(wLeft)) {
          steps.push({ type: "fixupCase", case: "C", side, nodeId: w!.getId() });

          steps.push({ type: "checkNode", nodeType: "HijoCer", case: "C", side });
          if (wRight) {
            this.recolor(wRight, "BLACK", "HijoCer");
            if (trace) steps.push({ type: "recolor", kind: "fixup", case: "C", side, count: 1, actionIndex: trace.actions.length - 1 });
          }

          steps.push({ type: "checkNode", nodeType: "Hermano", case: "C", side });
          if (w) {
            this.recolor(w, "RED", "Hermano");
            if (trace) steps.push({ type: "recolor", kind: "fixup", case: "C", side, count: 2, actionIndex: trace.actions.length - 1 });

            // Capturar info de la rotación a aplicar
            this.pushRbRotationStep(w, w.getDer()!, w!.getDer()!.getIzq(), "Izq(hermano)", "LR");

            // Rotación y Captura del estado posterior
            this.rotacionIzquierda(w);

            this.pushRbRotationHierarchy();
            this.captureFixupRotateStep(steps, trace, "fixupC", "left", w);
          }

          const nuevoP = (x !== null) ? x.getPadre() : xParent!;
          xParent = nuevoP;
          w = nuevoP!.getIzq();
        }

        steps.push({ type: "fixupCase", case: "D", side, nodeId: w!.getId() });

        steps.push({ type: "checkNode", nodeType: "Hermano", case: "D", side });
        if (w) {
          this.recolor(w, this.colorOf(p), "Hermano");
          if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 1, actionIndex: trace.actions.length - 1 });
        }

        this.recolor(p, "BLACK", "Padre");
        if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 2, actionIndex: trace.actions.length - 1 });

        steps.push({ type: "checkNode", nodeType: "HijoLej", case: "D", side });
        if (w && w.getIzq()) {
          this.recolor(w.getIzq(), "BLACK", "HijoLej");
          if (trace) steps.push({ type: "recolor", kind: "fixup", case: "D", side, count: 3, actionIndex: trace.actions.length - 1 });
        }

        // Capturar info de la rotación a aplicar
        this.pushRbRotationStep(p, w!, w!.getDer(), "Der(padre)", "LL");

        // Rotación y Captura del estado posterior
        this.rotacionDerecha(p);

        this.pushRbRotationHierarchy();
        this.captureFixupRotateStep(steps, trace, "fixupD", "right", p);
      }

      x = this.getRaiz();
      xParent = null;
    }
    steps.push({
      type: "fixupWhileCheck",
      xId: x?.getId() ?? null,
      xParentId: x?.getPadre()?.getId() ?? null,
      continue: false
    });

    this.recolor(x, "BLACK", "Nodo");
    if (trace) {
      steps.push({
        type: "recolor",
        kind: "final",
        count: 1,
        actionIndex: trace.actions.length - 1
      });
    }
  }

  /**
   * Método auxiliar que realiza una rotación simple a la derecha en el subárbol dado.
   * @param x Nodo raíz del subárbol a rotar.
   */
  private rotacionDerecha(y: NodoRB<T>): void {
    const x = y.getIzq()!;
    const T2 = x.getDer();

    // Enlazar x con el padre y
    x.setPadre(y.getPadre());
    if (x.getPadre() === null) {
      this.setRaiz(x);
    } else if (y === y.getPadre()!.getDer()) {
      y.getPadre()!.setDer(x);
    } else {
      y.getPadre()!.setIzq(x);
    }

    // Colocar y bajo x
    x.setDer(y);
    y.setPadre(x);

    // Recolocar T2 como hijo izquierdo de y
    y.setIzq(T2);
    if (T2 !== null) T2.setPadre(y);
  }

  /**
   * Método auxiliar que realiza una rotación simple a la izquierda en el subárbol dado.
   * @param x Nodo raíz del subárbol a rotar.
   */
  private rotacionIzquierda(x: NodoRB<T>): void {
    const y = x.getDer()!;
    const T2 = y.getIzq();

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

    // Recolocar T2 como hijo derecho de x
    x.setDer(T2);
    if (T2 !== null) T2.setPadre(x);
  }

  /**
   * Método auxiliar que reemplaza el subárbol enraizado al nodo u con el subárbol enraizado al nodo v.
   * @param u Nodo a ser reemplazado en el árbol.
   * @param v Nodo para reemplazar u.
   */
  private transplant(u: NodoRB<T>, v: NodoRB<T> | null): void {
    const up = u.getPadre();
    if (up === null) {
      this.setRaiz(v);
    } else if (up.getIzq() === u) {
      up.setIzq(v);
    } else {
      up.setDer(v);
    }
    if (v) v.setPadre(up);
  }

  /**
   * Método auxiliar que permite modificar el color de un nodo Rojo-Negro.
   * @param node Nodo Rojo-Negro a recolorear.
   * @param to Nuevo color a asignar para el nodo.
   * @param nodeBadge Credencial o placa que identifica al nodo a recolorear.
   */
  private recolor(node: NodoRB<T> | null, to: RBColor, nodeBadge: string): void {
    if (!node) return;
    const from = node.getColor();
    this.rbOperationTrace?.actions.push({ kind: "recolor", id: node.getId(), from, to, nodeBadge });
    node.setColor(to);
  }

  /**
   * Método auxiliar que convierte un nodo del árbol Rojo-Negro en una estructura de datos
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
   * Método auxiliar que clona un árbol Rojo-Negro iniciando desde el nodo raíz dado.
   * @param root Nodo raíz del subárbol a clonar.
   * @returns Una nueva instancia `NodoRB<T>` que es una clonación profunda del subárbol.
   */
  private clonarRBAux(root: NodoRB<T> | null): NodoRB<T> | null {
    if (root === null) return null;

    const clon = new NodoRB<T>(root.getInfo(), root.getColor(), root.getId());

    const clonIzq = this.clonarRBAux(root.getIzq());
    const clonDer = this.clonarRBAux(root.getDer());

    clon.setIzq(clonIzq);
    clon.setDer(clonDer);

    if (clonIzq) clonIzq.setPadre(clon);
    if (clonDer) clonDer.setPadre(clon);

    return clon;
  }

  /**
   * Método auxiliar que devuelve el color del nodo Rojo-Negro dado.
   * @param n Nodo cuyo color se va a determinar.
   * @returns Color del nodo.
   */
  private colorOf(n: NodoRB<T> | null): RBColor {
    return n ? n.getColor() : "BLACK"; // nulo se considera negro
  }

  /**
   * Método auxiliar que determina si el nodo dado es rojo.
   * @param n Nodo a verificar.
   * @returns Booleano que indica si el nodo es de color rojo o no.
   */
  private isRed(n: NodoRB<T> | null): boolean {
    return n !== null && n.getColor() === "RED";
  }

  /**
   * Método auxiliar que determina si el nodo dado es negro.
   * @param n Nodo a verificar
   * @returns Booleano que indica si el nodo es de color negro o no.
   */
  private isBlack(n: NodoRB<T> | null): boolean {
    return n === null || n.getColor() === "BLACK";
  }

  /**
   * Método auxiliar que registra información sobre un paso de rotación realizado durante
   * la restauración en una inserción o eliminación.
   * @param zNode Nodo que rota (z).
   * @param yNode Nodo implicado en la rotación (y).
   * @param BNode Nodo del subárbol (B) afectado por la rotación.
   * @param rotationTag Etiqueta que identifica el paso de rotación.
   * @param rotationType Tipo de rotación realizada.
   */
  private pushRbRotationStep(
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
    this.rbOperationTrace?.actions.push({ kind: "rotation", tag: rotationTag, step });
  }

  /**
   * Método auxiliar que registra un estado intermedio del árbol durante una operación de restauración para propósitos de visualización y análisis.
   * Toma la estructura jerárquica actual del árbol y la agrega a la colección de jerarquías intermedias en la traza de operación del árbol rojo-negro.
   */
  private pushRbRotationHierarchy(): void {
    if (!this.rbOperationTrace) return;
    this.rbOperationTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }

  /**
   * Método auxiliar que garantiza la inicialización de la jerarquía BST en la traza de operación del árbol rojo-negro.
   * Convierte la estructura actual del árbol en una representación jerárquica y asegura la disposición 
   * de un estado base del árbol antes de registrar rotaciones intermedias
   */
  private ensureRBTraceInit(): void {
    if (this.rbOperationTrace && !this.rbOperationTrace.hierarchies.bst) {
      this.rbOperationTrace.hierarchies.bst = this.convertirEstructuraJerarquica();
    }
  }

  /**
   * Método auxiliar que determina el lado del nodo pivote con respecto a su padre.
   * @param pivot Nodo pivote.
   * @returns Lado del nodo pivote con respecto a su padre ("left", "right", o "root").
   */
  private getPivotSideOnParent(pivot: NodoRB<T>): "left" | "right" | "root" {
    const up = pivot.getPadre();
    if (!up) return "root";
    return up.getIzq() === pivot ? "left" : "right";
  }

  private captureTransplantStep(u: NodoRB<T>, v: NodoRB<T> | null, steps: RBDeleteStep[]) {
    const up = u.getPadre();
    const uParentId = up?.getId() ?? null;

    let uSide: "root" | "left" | "right" = "root";
    if (up) {
      uSide = up.getIzq() === u ? "left" : "right";
    }

    steps.push({
      type: "transplant",
      uId: u.getId(),
      vId: v?.getId() ?? null,
      uParentId,
      uSide
    });
  }

  private captureFixupRotateStep(
    steps: (RBInsertStep | RBDeleteStep)[],
    trace: RBTrace<T> | null,
    caseKind: "fixupA" | "fixupC" | "fixupD" | "case2" | "case3",
    dir: "left" | "right",
    pivot: NodoRB<T>,
  ) {
    if (!trace) return;
    steps.push({
      type: "rotate",
      caseKind,
      dir,
      pivot: pivot.getId(),
      frameIndex: trace.hierarchies.mids.length - 1,
      actionIndex: trace.actions.length - 1,
      pivotSideOnParent: this.getPivotSideOnParent(pivot)
    });
  }
}