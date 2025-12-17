// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { AVLDeleteMeta, AVLDeleteOutput, AVLDeleteStep, AVLInsertMeta, AVLInsertOutput, AVLInsertStep, BinaryTreeLevelOutput, BinaryTreeTraverseOutput, BSTSearchOutput, Comparator, HierarchyNodeData, OperationTrace } from "../../../types";
import { NodoAVL } from "../nodes/NodoAVL";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { defaultComparator } from "../treeUtils";
import { DomainError } from "../error/DomainError";

/**
 * Clase que representa el funcionamiento de un árbol AVL.
 */
export class ArbolAVL<T> extends ArbolBinarioBusqueda<T> {

  private avlOperationTrace: OperationTrace<T> | null = null;

  /**
   * Constructor de la clase ArbolAVL.
   */
  constructor(
    compare: Comparator<T> = defaultComparator
  ) {
    super(compare);
  }

  /**
   * Método que inserta un nuevo elemento en el árbol AVL.
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
  public insertarAVL(valor: T): AVLInsertOutput<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.avlOperationTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const steps: AVLInsertStep[] = [];
    const meta: AVLInsertMeta<T> = {
      parent: null,
      targetNode: null,
      inserted: false
    };
    const nuevaRaiz = this.insertarAVLAux(this.getRaiz(), valor, steps, meta);

    if (meta.inserted) {
      this.setRaiz(nuevaRaiz);
      this.setTamanio(this.getTamanio() + 1);
    }

    return {
      steps,
      parent: meta.parent,
      targetNode: meta.targetNode,
      inserted: meta.inserted
    };
  }

  /**
   * Método que elimina el elemento especificado del árbol AVL.
   * @param valor Elemento a eliminar.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la eliminación 
   *    (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
   *    1. Si el nodo eliminado era la raíz.
   *    2. Si el elemento no se encontra en el árbol.
   * 
   * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si el elemento no se encuentra en el árbol.
   * 
   * - `pathToSuccessorIds`: Arreglo con los IDs de los nodos visitados durante la búsqueda del sucesor inorden (solo si el nodo eliminado tenía dos hijos).
   * 
   * - `successor`: Nodo que reemplazó lógicamente al nodo eliminado en el caso de dos hijos (nodo cuyo valor fue copiado al nodo objetivo).  
   *    Será `null` en los demás casos.
   * 
   * - `successorParent`: Nodo padre del nodo sucesor (solo si el nodo eliminado tenía dos hijos).
   * 
   * - `replacement`: Nodo que ocupó físicamente el lugar del nodo eliminado en el árbol. Puede ser:
   *    1. El hijo izquierdo o derecho (si existía uno).  
   *    2. `null` si se eliminó una hoja.  
   *    3. El hijo derecho del sucesor in-order (en el caso de dos hijos).
   * 
   * - `replacementSide`: Dirección del nodo que ocupa físicamente el lugar del nodo eliminado ("left", "right"). 
   *    Sera `null` si el nodo si el nodo eliminado era un nodo hoja.
   * 
   * - `deleted`: Booleano que indica si el elemento fue eliminado.
   */
  public eliminarAVL(valor: T): AVLDeleteOutput<T> {
    if (this.esVacio()) {
      throw new DomainError("No fue posible eliminar el nodo: El árbol árbol se encuentra vacío (cantidad de nodos: 0).", "DELETE_EMPTY");
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.avlOperationTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const steps: AVLDeleteStep[] = [];
    const meta: AVLDeleteMeta<T> = {
      parent: null,
      targetNode: null,
      pathToSuccessorIds: [],
      successor: null,
      successorParent: null,
      replacement: null,
      replacementSide: null,
      deleted: false
    };
    const nuevaRaiz = this.eliminarAVLAux(this.getRaiz(), valor, steps, meta);

    if (!meta.deleted) {
      return {
        steps,
        parent: null,
        targetNode: null,
        pathToSuccessorIds: [],
        successor: null,
        successorParent: null,
        replacement: null,
        replacementSide: null,
        deleted: false
      }
    }

    this.setRaiz(nuevaRaiz);
    this.setTamanio(this.getTamanio() - 1);

    return {
      steps,
      parent: meta.parent,
      targetNode: meta.targetNode,
      pathToSuccessorIds: meta.pathToSuccessorIds,
      successor: meta.successor,
      successorParent: meta.successorParent,
      replacement: meta.replacement,
      replacementSide: meta.replacementSide,
      deleted: meta.deleted
    }
  }

  /**
   * Método que comprueba la existencia del elemento especificado en el árbol AVL.
   * @param valor Elemento a buscar.
   * @returns Objeto con la siguiente información:
   * 
   * - `steps`: Arreglo de objetos que describen cada acción llevada a cabo durante la búsqueda 
   *    (comprobaciones, visitas, movimientos y retornos).
   * 
   * - `targetNode`: Nodo correspondiente al elemento proporcionado. Será `null` si no fue encontrado.  
   * 
   * - `found`: Booleano que indica si el nodo fue encontrado.
   */
  public buscarAVL(valor: T): BSTSearchOutput<T> {
    return super.buscarABB(valor);
  }

  /**
   * Método que obtiene la raíz del árbol AVL.
   * @returns Nodo raíz del árbol o null si está vacío.
   */
  public override getRaiz(): NodoAVL<T> | null {
    return super.getRaiz() as NodoAVL<T> | null;
  }

  /**
   * Método que modifica la raíz del árbol AVL.
   * @param raiz Nuevo nodo raíz del árbol AVL.
   */
  public override setRaiz(raiz: NodoAVL<T> | null) {
    super.setRaiz(raiz);
  }

  /**
   * Método que obtiene todos los nodos hojas del árbol AVL.
   * @returns Arreglo que contiene todos los nodos hoja presentes en el árbol.
   */
  public override getHojas(): NodoAVL<T>[] {
    return super.getHojas() as NodoAVL<T>[];
  }

  /**
   * Método que cuenta el número de nodos hoja presentes en el árbol AVL.
   * @returns Número de nodos hoja presentes en el árbol.
   */
  public override contarHojas(): number {
    return super.contarHojas();
  }

  /**
   * Método que calcula el peso total (número de nodos) del árbol AVL.
   * @returns Número total de nodos del árbol.
   */
  public override getPeso(): number {
    return super.getPeso();
  }

  /**
   * Método que calcula la altura del árbol AVL.
   * @returns Altura del árbol.
   */
  public override getAltura(): number {
    return super.getAltura();
  }

  /**
   * Método que vacia el árbol AVL.
   */
  public override vaciar(): void {
    super.vaciar();
  }

  /**
   * Método que verifica si el árbol AVL está vacío.
   * @returns True si se encuentra vacío, false en caso contrario.
   */
  public override esVacio(): boolean {
    return super.esVacio();
  }

  /**
   * Método que realiza el recorrido inorden del árbol AVL.
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
   * Método que realiza el recorrido preorden del árbol AVL.
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
   * Método que realiza el recorrido postorden del árbol AVL.
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
   * Método que realiza el recorrido por niveles del árbol AVL.
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
   * Método que convierte el árbol AVL en una estructura jerárquica.
   * @returns Representación jerárquica del árbol o null si está vacío.
   */
  public override convertirEstructuraJerarquica(): HierarchyNodeData<T> | null {
    if (this.esVacio()) return null;
    return this.toAVLHierarchy(this.getRaiz()!);
  }

  /**
   * Método que crea una copia profunda del árbol AVL.
   * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
   */
  public clonarAVL(): ArbolAVL<T> {
    const nuevoArbol = new ArbolAVL<T>(this.compare);
    nuevoArbol.setRaiz(this.clonarAVLrec(this.getRaiz()));
    nuevoArbol.setTamanio(this.getTamanio());
    return nuevoArbol;
  }

  /**
   * Método que consume y limpia la última traza del árbol AVL registrada.
   * @returns Última traza del árbol o null si no existe.
   */
  public consumeLastAvlTrace(): OperationTrace<T> | null {
    const t = this.avlOperationTrace;
    this.avlOperationTrace = null;
    return t;
  }

  /**
   * Método auxiliar que inserta un nuevo nodo en el subárbol dado, a partir del elemento proporcionado
   * y aplicando las rotaciones necesarias para mantener el balance del árbol AVL.
   * @param root Nodo raíz del subárbol actual.
   * @param valor Elemento a insertar.
   * @param steps Arreglo para acumular los pasos de inserción realizados durante la operación.
   * @param meta Objeto de metadatos para rastrear el resultado de la inserción y la información del nodo objetivo.
   * @param parentNode Nodo padre del nodo actual.
   * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
   * @returns Nodo raíz del subárbol actualizado tras la inserción.
   */
  private insertarAVLAux(
    root: NodoAVL<T> | null,
    valor: T,
    steps: AVLInsertStep[],
    meta: AVLInsertMeta<T>,
    parentNode: NodoAVL<T> | null = null,
    via: "left" | "right" | "root" = "root"
  ): NodoAVL<T> {
    steps.push({
      type: "checkNull",
      at: root?.getId() ?? null,
      isNull: root === null
    });
    if (root === null) {
      const nuevo = new NodoAVL(valor);

      steps.push({
        type: "createLeaf",
        parent: parentNode?.getId() ?? null,
        side: parentNode === null ? "root" : via === "left" ? "left" : "right"
      });
      meta.inserted = true;
      meta.targetNode = nuevo;
      meta.parent = parentNode;

      steps.push({ type: "return", from: nuevo.getId(), to: parentNode?.getId() ?? null, via });
      return nuevo;
    }

    const cmp = this.compare(valor, root.getInfo());
    steps.push({ type: "compare", at: root.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
    if (cmp < 0) {
      steps.push({
        type: "goLeft",
        from: root.getId(),
        to: root.getIzq()?.getId() ?? null
      });
      root.setIzq(this.insertarAVLAux(root.getIzq(), valor, steps, meta, root, "left"));
    } else if (cmp > 0) {
      steps.push({
        type: "goRight",
        from: root.getId(),
        to: root.getDer()?.getId() ?? null
      });
      root.setDer(this.insertarAVLAux(root.getDer(), valor, steps, meta, root, "right"));
    } else {
      meta.inserted = false;
      meta.targetNode = root;
      meta.parent = parentNode;
    }

    steps.push({ type: "updateHeight", at: root.getId() });
    this.recalcularAlturaNodo(root);

    const newRoot = this.rebalancear(root, parentNode, steps);

    steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via });
    return newRoot;
  }

  /**
   * Método auxiliar que elimina el nodo correspondiente al elemento proporcionado en el subárbol dado,
   * aplicando las rotaciones necesarias para mantener el balance del árbol AVL.
   * @param root Nodo raíz del subárbol actual.
   * @param valor Elemento a eliminar.
   * @param steps Arreglo para acumular los pasos de eliminación para la visualización del algoritmo.
   * @param meta Objeto de metadatos para rastrear el resultado de la eliminación y la información del nodo objetivo.
   * @param parentNode Nodo padre del nodo actual.
   * @param via Dirección desde el nodo padre al nodo actual ("left", "right", o "root" para la raíz).
   * @returns Nodo raíz del subárbol actualizado tras la eliminación.
   */
  private eliminarAVLAux(
    root: NodoAVL<T> | null,
    valor: T,
    steps: AVLDeleteStep[],
    meta: AVLDeleteMeta<T>,
    parentNode: NodoAVL<T> | null = null,
    via: "left" | "right" | "root" = "root"
  ) {
    steps.push({
      type: "checkNull",
      at: root?.getId() ?? null,
      isNull: root === null
    });
    if (root === null) {
      steps.push({ type: "return", from: null, to: parentNode?.getId() ?? null, via: via });
      return null;
    }

    const cmp = this.compare(valor, root.getInfo());
    steps.push({ type: "compare", at: root.getId(), cmp: cmp < 0 ? -1 : cmp > 0 ? 1 : 0 });
    if (cmp < 0) {
      steps.push({
        type: "goLeft",
        from: root.getId(),
        to: root.getIzq()?.getId() ?? null
      });
      root.setIzq(this.eliminarAVLAux(root.getIzq(), valor, steps, meta, root, "left"));
    } else if (cmp > 0) {
      steps.push({
        type: "goRight",
        from: root.getId(),
        to: root.getDer()?.getId() ?? null
      });
      root.setDer(this.eliminarAVLAux(root.getDer(), valor, steps, meta, root, "right"));
    } else {
      steps.push({ type: "match", at: root.getId() });
      meta.deleted = true;
      meta.targetNode = root;
      meta.parent = parentNode;

      const izq = root.getIzq();
      const der = root.getDer();

      if (!izq) {
        meta.replacement = der;
        meta.replacementSide = "right";
        steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
        return der;
      }

      if (!der) {
        meta.replacement = izq;
        meta.replacementSide = "left";
        steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via: via });
        return izq;
      }

      let sucPadre = root;
      let succ = der;
      while (succ.getIzq()) {
        meta.pathToSuccessorIds.push(succ.getId());
        sucPadre = succ;
        succ = succ.getIzq()!;
      }
      meta.pathToSuccessorIds.push(succ.getId());
      meta.successor = succ;
      meta.successorParent = sucPadre;

      const reemplazo = succ.getDer();
      meta.replacement = reemplazo;

      root.setInfo(succ.getInfo());
      if (sucPadre.getIzq() === succ) {
        sucPadre.setIzq(reemplazo);
      } else {
        sucPadre.setDer(reemplazo);
      }
    }

    steps.push({ type: "updateHeight", at: root.getId() });
    this.recalcularAlturaNodo(root);

    const newRoot = this.rebalancear(root, parentNode, steps);

    steps.push({ type: "return", from: root.getId(), to: parentNode?.getId() ?? null, via });
    return newRoot;
  }

  /**
   * Método auxiliar que rebalancea el subárbol dado si se detecta un desbalance, aplicando
   * las rotaciones necesarias según el caso. Maneja 4 casos:
   * 
   * - Rotación Left-Left (LL)
   * - Rotación Left-Right (LR)
   * - Rotación Right-Right (RR)
   * - Rotación Right-Left (RL)
   *
   * Durante cada caso, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
   * @param nodo Nodo raíz del subárbol a rebalancear.
   * @param parent Nodo padre del nodo actual, o null si es la raíz.
   * @param steps Arreglo para acumular los pasos de rebalanceo realizados durante la operación.
   * @returns Nuevo nodo raíz del subárbol tras aplicar las rotaciones correspondientes.
   */
  private rebalancear(
    nodo: NodoAVL<T>,
    parentNode: NodoAVL<T> | null,
    steps: AVLInsertStep[] | AVLDeleteStep[]
  ): NodoAVL<T> {
    const bf = this.getBalance(nodo);
    steps.push({ type: "computeBalance", at: nodo.getId(), bf: bf as -2 | -1 | 0 | 1 | 2 });

    const trace = this.avlOperationTrace;

    // Izquierda pesada
    if (bf === 2) {
      const y = nodo.getIzq()!;

      // Capturar el estado pre-rotación
      if (trace && !trace.hierarchies.pre) {
        trace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (this.getBalance(y) < 0) {
        // -------- LR: rotarIzq(y) -> rotarDer(nodo)
        const x = y.getDer()!;

        // Capturar info de la rotación a aplicar
        steps.push({ type: "rotationCase", at: nodo.getId(), kind: "LR" });
        trace?.rotations.push({
          type: "LR",
          zId: nodo.getId(),
          yId: y.getId(),
          xId: x.getId(),
          parentOfZId: parentNode?.getId() ?? null,
          xLeftId: x.getIzq()?.getId() ?? null,
          xRightId: x.getDer()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        nodo.setIzq(this.rotacionIzquierda(y));
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "left",
            pivot: y.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1,
            phase: 0
          });
        }

        const newRoot = this.rotacionDerecha(nodo);
        this.reattachAfterRotation(parentNode, nodo, newRoot);
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "right",
            pivot: nodo.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1,
            phase: 1
          });
        }

        return newRoot;
      } else {
        // -------- Ll: rotarDer(nodo)

        // Capturar info de la rotación a aplicar
        steps.push({ type: "rotationCase", at: nodo.getId(), kind: "LL" });
        trace?.rotations.push({
          type: "LL",
          zId: nodo.getId(),
          yId: y.getId(),
          parentOfZId: parentNode?.getId() ?? null,
          BId: y.getDer()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        const newRoot = this.rotacionDerecha(nodo);
        this.reattachAfterRotation(parentNode, nodo, newRoot);
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "right",
            pivot: nodo.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1
          });
        }

        return newRoot;
      }
    }

    // Derecha pesada
    if (bf === -2) {
      const y = nodo.getDer()!;

      // Capturar el estado pre-rotación
      if (trace && !trace.hierarchies.pre) {
        trace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (this.getBalance(y) > 0) {
        // -------- RL: rotarDer(y) -> rotarIzq(nodo)
        const x = y.getIzq()!;

        // Capturar info de la rotación a aplicar
        steps.push({ type: "rotationCase", at: nodo.getId(), kind: "RL" });
        trace?.rotations.push({
          type: "RL",
          zId: nodo.getId(),
          yId: y.getId(),
          xId: x.getId(),
          parentOfZId: parentNode?.getId() ?? null,
          xLeftId: x.getIzq()?.getId() ?? null,
          xRightId: x.getDer()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        nodo.setDer(this.rotacionDerecha(y));
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "right",
            pivot: y.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1,
            phase: 0
          });
        }

        const newRoot = this.rotacionIzquierda(nodo);
        this.reattachAfterRotation(parentNode, nodo, newRoot);
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "left",
            pivot: nodo.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1,
            phase: 1
          });
        }

        return newRoot;
      } else {
        // -------- RR: rotarDer(nodo)

        // Capturar info de la rotación a aplicar
        steps.push({ type: "rotationCase", at: nodo.getId(), kind: "RR" });
        trace?.rotations.push({
          type: "RR",
          zId: nodo.getId(),
          yId: y.getId(),
          parentOfZId: parentNode?.getId() ?? null,
          BId: y.getIzq()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        const newRoot = this.rotacionIzquierda(nodo);
        this.reattachAfterRotation(parentNode, nodo, newRoot);
        this.pushAvlRotationHierarchy();
        if (trace) {
          steps.push({
            type: "rotate",
            dir: "left",
            pivot: nodo.getId(),
            frameIndex: trace.hierarchies.mids.length - 1,
            rotationIndex: trace.rotations.length - 1
          });
        }

        return newRoot;
      }
    }

    return nodo;
  }

  /**
   * Método auxiliar que realiza una rotación simple a la derecha en el subárbol dado.
   * @param y Nodo raíz del subárbol desbalanceado.
   * @param steps Arreglo para acumular los pasos de rotación realizados durante la operación.
   * @returns Nuevo nodo raíz del subárbol tras la rotación.
   */
  private rotacionDerecha(y: NodoAVL<T>): NodoAVL<T> {
    const x = y.getIzq()!;
    const T2 = x.getDer();

    x.setDer(y);
    y.setIzq(T2);

    this.recalcularAlturaNodo(y);
    this.recalcularAlturaNodo(x);

    return x;
  }

  /**
   * Método auxiliar que realiza una rotación simple a la izquierda en el subárbol dado.
   * @param x Nodo raíz del subárbol desbalanceado.
   * @param steps Arreglo para acumular los pasos de rotación realizados durante la operación.
   * @returns Nuevo nodo raíz del subárbol tras la rotación.
   */
  private rotacionIzquierda(x: NodoAVL<T>): NodoAVL<T> {
    const y = x.getDer()!;
    const T2 = y.getIzq();

    y.setIzq(x);
    x.setDer(T2);

    this.recalcularAlturaNodo(x);
    this.recalcularAlturaNodo(y);

    return y;
  }

  /**
   * Método auxiliar que recalcula la altura del nodo dado en función
   * de las alturas de sus subárboles izquierdo y derecho.
   * @param nodo Nodo cuya altura ha de recalcularse.
   */
  private recalcularAlturaNodo(nodo: NodoAVL<T>) {
    nodo.setAltura(1 + Math.max(
      this.getAlturaNodo(nodo.getIzq()),
      this.getAlturaNodo(nodo.getDer())
    ));
  }

  /**
   * Método auxiliar que obtiene el factor de balance del nodo dado, definido
   * como la diferencia entre la altura del subárbol izquierdo y la altura del subárbol derecho.
   * @param nodo Nodo del cual se obtiene el factor de balance.
   * @returns Factor de balance del nodo.
   */
  private getBalance(nodo: NodoAVL<T>): number {
    return this.getAlturaNodo(nodo.getIzq()) - this.getAlturaNodo(nodo.getDer());
  }

  /**
   * Método auxiliar que obtiene la altura del nodo dado.
   * @param nodo Nodo del que se desea obtener la altura.
   * @returns Altura del nodo si existe, 0 en caso contrario.
   */
  private getAlturaNodo(nodo: NodoAVL<T> | null): number {
    return nodo ? nodo.getAltura() : 0;
  }

  /**
   * Método auxiliar que convierte un nodo del árbol AVL en una estructura de datos jerárquica
   * adecuada para visualización o procesamiento posterior.
   * @param root Nodo raíz del árbol AVL.
   * @returns Objeto que representa la estructura jerárquica del árbol AVL.
   */
  private toAVLHierarchy(root: NodoAVL<T>): HierarchyNodeData<T> {
    const left = root.getIzq() ? this.toAVLHierarchy(root.getIzq()!) : null;
    const right = root.getDer() ? this.toAVLHierarchy(root.getDer()!) : null;

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
      bf: this.getBalance(root),
      height: root.getAltura(),
      children
    };
  }

  /**
   * Método auxiliar que clona un árbol AVL iniciando desde el nodo raíz dado.
   * @param root Nodo raíz del subárbol a clonar.
   * @returns Una nueva instancia `NodoAVL<T>` que es una clonación profunda del subárbol.
   */
  private clonarAVLrec(root: NodoAVL<T> | null): NodoAVL<T> | null {
    if (root === null) return null;

    const nuevoNodo = new NodoAVL<T>(root.getInfo(), root.getId());
    nuevoNodo.setAltura(root.getAltura());
    nuevoNodo.setIzq(this.clonarAVLrec(root.getIzq()));
    nuevoNodo.setDer(this.clonarAVLrec(root.getDer()));

    return nuevoNodo;
  }

  /**
   * Método auxiliar que reatacha un nodo después de una rotación en el árbol AVL.
   * @param parent Nodo padre del subárbol.
   * @param before Nodo que estaba antes de la rotación.
   * @param after Nodo que está después de la rotación.
   */
  private reattachAfterRotation(
    parent: NodoAVL<T> | null,
    before: NodoAVL<T>,
    after: NodoAVL<T>
  ) {
    if (!parent) { this.setRaiz(after); return; }
    if (parent.getIzq() === before) parent.setIzq(after);
    else if (parent.getDer() === before) parent.setDer(after);
  }

  /**
   * Método que auxiliar registra un estado intermedio del árbol durante el proceso de rebalanceo para propósitos de visualización y análisis.
   * Toma la estructura jerárquica actual del árbol y la agrega a la colección de jerarquías intermedias en la traza de operación avl.
   */
  private pushAvlRotationHierarchy(): void {
    if (!this.avlOperationTrace) return;
    this.avlOperationTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }
}