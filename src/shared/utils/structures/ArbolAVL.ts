// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { BSTDeleteOutput, BSTInsertOutput, BSTSearchOutput, Comparator, HierarchyNodeData, OperationTrace } from "../../../types";
import { NodoAVL } from "../nodes/NodoAVL";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { defaultComparator } from "../treeUtils";

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
   * Método que inserta un nuevo nodo en el árbol AVL manteniendo su propiedad de balance.
   * Si el nodo no existe, los pesos de los nodos se actualizan y el árbol es rebalanceado si es necesario.
   * @param valor Elemento a insertar.
   * @returns Objeto con la siguiente información:
   * 
   * - `pathIds`: Lista con los IDs de los nodos visitados durante el recorrido de búsqueda, en orden.
   *    Incluye el nodo padre donde se intentó realizar la inserción o el nodo ya existente.
   * 
   * - `parent`: Nodo padre bajo el cual se insertó el nuevo nodo. Será `null` en 2 casos:
   *    1. Si el elemento ya existía en el árbol.
   *    2. Si el nuevo nodo se insertó como raíz.
   * 
   * - `targetNode`: Nodo asociado al elemento (nuevo o ya existente).
   * 
   * - `exists`: Booleano que indica si el elemento ya existía (`true`) o si se creó e insertó un nuevo nodo (`false`).
   */
  public insertarAVL(valor: T): BSTInsertOutput<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.avlOperationTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const stack: NodoAVL<T>[] = [];
    let p: NodoAVL<T> | null = null;
    let cur = this.getRaiz();

    // Buscar posición de inserción
    while (cur) {
      stack.push(cur);
      const cmp = this.compare(valor, cur.getInfo());
      if (cmp === 0) {
        return { pathIds: stack.map(n => n.getId()), parent: null, targetNode: cur, exists: true };
      }
      p = cur;
      cur = cmp < 0 ? cur.getIzq() : cur.getDer();
    }

    // Insertar nuevo nodo
    const nuevo = new NodoAVL<T>(valor);
    if (!p) {
      this.setRaiz(nuevo);
    } else if (this.compare(valor, p.getInfo()) < 0) {
      p.setIzq(nuevo);
    } else {
      p.setDer(nuevo);
    }

    // Recalcular alturas y rebalancear desde el nodo padre hacia arriba
    const pathIds = stack.map(n => n.getId());
    while (stack.length > 0) {
      const root = stack.pop()!;
      root.recomputarAltura();

      const padre = stack.length > 0 ? stack[stack.length - 1] : null;
      const rebalanced = this.rebalancear(root, padre);

      if (!padre) this.setRaiz(rebalanced);
    }

    this.setTamanio(this.getTamanio() + 1);
    return { pathIds, parent: p, targetNode: nuevo, exists: false };
  }

  /**
   * Método que elimina un nodo especifico del árbol AVL, rebalanceando el árbol si es necesario.
   * @param valor Elemento a eliminar.
   * @returns Objeto con la siguiente información:
   * 
   * - `pathToTargetIds`: Lista con los IDs de los nodos visitados durante la búsqueda, 
   *    en orden desde la raíz hasta el nodo objetivo (incluye el nodo objetivo si fue encontrado).
   * 
   * - `parent`: Nodo padre del nodo eliminado. Será `null` en 2 casos:
   *    1. Si el nodo eliminado era la raíz.
   *    2. Si el valor no se encontró en el árbol.
   * 
   * - `targetNode`: Nodo objetivo que se intentó eliminar (nodo eliminado o último nodo visitado durante la búsqueda).
   * 
   * - `pathToSuccessorIds`: Lista con los IDs de los nodos visitados durante la búsqueda del sucesor in-order (solo se llena si el nodo eliminado tenía dos hijos).
   * 
   * - `successor`: Nodo que reemplazó lógicamente al nodo eliminado en el caso de dos hijos (nodo cuyo valor fue copiado al nodo objetivo).  
   *    Será `null` en los demás casos.
   * 
   * - `replacement`: Nodo que ocupó físicamente el lugar del nodo eliminado en el árbol. Puede ser:
   *    1. El hijo izquierdo o derecho (si existía uno).  
   *    2. `null` si se eliminó una hoja.  
   *    3. El hijo derecho del sucesor in-order (en el caso de dos hijos).
   * 
   * - `exists`: Booleano que indica si el elemento fue encontrado y eliminado (`true`) o no (`false`).
   */
  public eliminarAVL(valor: T): BSTDeleteOutput<T> {
    if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.avlOperationTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const stack: NodoAVL<T>[] = [];
    let p: NodoAVL<T> | null = null;
    let cur = this.getRaiz();

    // Buscar nodo a eliminar
    while (cur && this.compare(valor, cur.getInfo()) !== 0) {
      stack.push(cur);
      p = cur;
      cur = this.compare(valor, cur.getInfo()) < 0 ? cur.getIzq() : cur.getDer();
    }

    // No encontrado
    if (!cur) {
      return { pathToTargetIds: stack.map(n => n.getId()), parent: null, targetNode: p!, pathToSuccessorIds: [], successor: null, replacement: null, exists: false };
    }

    const removed = cur;
    const pathToTargetIds = stack.map(n => n.getId());
    const pathToSuccessorIds: string[] = [];
    let successor: NodoAVL<T> | null = null;

    // Nodo con 0 o 1 hijo
    let replacement: NodoAVL<T> | null = null;
    if (!cur.getIzq() || !cur.getDer()) {
      replacement = cur.getIzq() ? cur.getIzq() : cur.getDer();

      if (!p) {
        this.setRaiz(replacement);
      } else if (p.getIzq() === cur) {
        p.setIzq(replacement);
      } else {
        p.setDer(replacement);
      }
    } else {
      // Nodo con 2 hijos
      stack.push(cur);
      pathToTargetIds.push(cur.getId());
      pathToSuccessorIds.push(cur.getId());

      let succParent = cur;
      let succ = cur.getDer();
      while (succ && succ.getIzq()) {
        stack.push(succ);
        pathToSuccessorIds.push(succ.getId());
        succParent = succ;
        succ = succ.getIzq();
      }
      pathToSuccessorIds.push(succ!.getId());

      // Copiar valor del sucesor al nodo actual
      cur.setInfo(succ!.getInfo());
      successor = succ;

      // Eliminar el sucesor (que tiene a lo sumo un hijo derecho)
      replacement = succ!.getDer();
      if (succParent.getIzq() === succ) {
        succParent.setIzq(replacement);
      } else {
        succParent.setDer(replacement);
      }
      p = succParent;
    }

    // Recalcular alturas y rebalancear desde el nodo padre hacia arriba
    while (stack.length > 0) {
      const root = stack.pop()!;
      root.recomputarAltura();

      const padre = stack.length > 0 ? stack[stack.length - 1] : null;
      const rebalanced = this.rebalancear(root, padre);

      if (padre) {
        if (padre.getIzq() === root) {
          padre.setIzq(rebalanced);
        } else {
          padre.setDer(rebalanced);
        }
      } else {
        this.setRaiz(rebalanced);
      }
    }

    return { pathToTargetIds, parent: p, targetNode: removed, pathToSuccessorIds, successor, replacement, exists: true };
  }

  /**
   * Método que busca un nodo específico en el árbol AVL.
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
   * @returns Array de nodos que representan las hojas del árbol.
   */
  public override getHojas(): NodoAVL<T>[] {
    return super.getHojas() as NodoAVL<T>[];
  }

  /**
   * Método que cuenta el número de nodos hoja del árbol AVL.
   * @returns Número de nodos hoja del árbol.
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
   * Método que retorna un array de nodos resultante del recorrido in-orden del árbol AVL.
   * @returns Array de nodos en secuencia in-orden.
   */
  public override inOrden(): NodoAVL<T>[] {
    return super.inOrden() as NodoAVL<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido pre-orden del árbol AVL.
   * @returns Array de nodos en secuencia pre-orden.
   */
  public override preOrden(): NodoAVL<T>[] {
    return super.preOrden() as NodoAVL<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido post-orden del árbol AVL.
   * @returns Array de nodos en secuencia post-orden.
   */
  public override postOrden(): NodoAVL<T>[] {
    return super.postOrden() as NodoAVL<T>[];
  }

  /**
   * Método que retorna un array de nodos resultante del recorrido por niveles del árbol AVL.
   * @returns Array de nodos por niveles.
   */
  public override getNodosPorNiveles(): NodoAVL<T>[] {
    return super.getNodosPorNiveles() as NodoAVL<T>[];
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
   * Método que rebalancea un árbol AVL si se detecta un desbalance, aplicando
   * las rotaciones AVL apropiadas para restaurar el balance. Maneja 4 casos:
   * 
   * - Rotación Left-Left (LL)
   * - Rotación Left-Right (LR)
   * - Rotación Right-Right (RR)
   * - Rotación Right-Left (RL)
   *
   * Durante cada caso, captura estados pre- y post-rotación para propositos de seguimiento y visualización.
   * @param nodo Nodo AVL a rebalancear.
   * @param parent Padre del nodo o null si el nodo es la raíz.
   * @returns Nueva raíz del subárbol después del rebalanceo.
   */
  private rebalancear(nodo: NodoAVL<T>, parent: NodoAVL<T> | null): NodoAVL<T> {
    const bf = nodo.getBalance();

    // Izquierda pesada
    if (bf === 2) {
      const y = nodo.getIzq()!;

      // Capturar el estado pre-rotación
      if (this.avlOperationTrace && !this.avlOperationTrace.hierarchies.pre) {
        this.avlOperationTrace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (y.getBalance() < 0) {
        // -------- LR: rotarIzq(y) -> rotarDer(nodo)
        const x = y.getDer()!;

        // Capturar info de la rotación a aplicar
        this.avlOperationTrace?.rotations.push({
          type: "LR",
          zId: nodo.getId(),
          yId: y.getId(),
          xId: x.getId(),
          parentOfZId: parent?.getId() ?? null,
          xLeftId: x.getIzq()?.getId() ?? null,
          xRightId: x.getDer()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        nodo.setIzq(this.rotacionIzquierda(y));
        this.pushAvlRotationHierarchy();

        const newRoot = this.rotacionDerecha(nodo);

        this.reattachAfterRotation(parent, nodo, newRoot);
        this.pushAvlRotationHierarchy();

        return newRoot;
      } else {
        // -------- Ll: rotarDer(nodo)

        // Capturar info de la rotación a aplicar
        this.avlOperationTrace?.rotations.push({
          type: "LL",
          zId: nodo.getId(),
          yId: y.getId(),
          parentOfZId: parent?.getId() ?? null,
          BId: y.getDer()?.getId() ?? null
        });

        const newRoot = this.rotacionDerecha(nodo);

        // Rotación y Captura del estado posterior
        this.reattachAfterRotation(parent, nodo, newRoot);
        this.pushAvlRotationHierarchy();

        return newRoot;
      }
    }

    // Derecha pesada
    if (bf === -2) {
      const y = nodo.getDer()!;

      // Capturar el estado pre-rotación
      if (this.avlOperationTrace && !this.avlOperationTrace.hierarchies.pre) {
        this.avlOperationTrace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (y.getBalance() > 0) {
        // -------- RL: rotarDer(y) -> rotarIzq(nodo)
        const x = y.getIzq()!;

        // Capturar info de la rotación a aplicar
        this.avlOperationTrace?.rotations.push({
          type: "RL",
          zId: nodo.getId(),
          yId: y.getId(),
          xId: x.getId(),
          parentOfZId: parent?.getId() ?? null,
          xLeftId: x.getIzq()?.getId() ?? null,
          xRightId: x.getDer()?.getId() ?? null
        });

        // Rotación y Captura del estado posterior
        nodo.setDer(this.rotacionDerecha(y));
        this.pushAvlRotationHierarchy();

        const newRoot = this.rotacionIzquierda(nodo);

        this.reattachAfterRotation(parent, nodo, newRoot);
        this.pushAvlRotationHierarchy();

        return newRoot;
      } else {
        // -------- RR: rotarDer(nodo)

        // Capturar info de la rotación a aplicar
        this.avlOperationTrace?.rotations.push({
          type: "RR",
          zId: nodo.getId(),
          yId: y.getId(),
          parentOfZId: parent?.getId() ?? null,
          BId: y.getIzq()?.getId() ?? null
        });

        const newRoot = this.rotacionIzquierda(nodo);

        // Rotación y Captura del estado posterior
        this.reattachAfterRotation(parent, nodo, newRoot);
        this.pushAvlRotationHierarchy();

        return newRoot;
      }
    }

    return nodo;
  }

  /**
   * Método que realiza una rotación derecha en el nodo AVL dado.
   * @param x Nodo raíz del subárbol a rotar.
   * @returns Nuevo nodo raíz del subárbol rotado.
   */
  private rotacionDerecha(y: NodoAVL<T>): NodoAVL<T> {
    const x = y.getIzq()!;
    const T2 = x.getDer();

    x.setDer(y);
    y.setIzq(T2);

    y.recomputarAltura();
    x.recomputarAltura();

    return x;
  }

  /**
   * Método que realiza una rotación izquierda en el nodo AVL dado.
   * @param x Nodo raíz del subárbol a rotar.
   * @returns Nuevo nodo raíz del subárbol rotado.
   */
  private rotacionIzquierda(x: NodoAVL<T>): NodoAVL<T> {
    const y = x.getDer()!;
    const T2 = y.getIzq();

    y.setIzq(x);
    x.setDer(T2);

    x.recomputarAltura();
    y.recomputarAltura();

    return y;
  }

  /**
   * Método recursivo que convierte un nodo del árbol AVL en una estructura de datos jerárquica
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
      bf: root.getBalance(),
      height: root.getAltura(),
      children
    };
  }

  /**
   * Método recursivo que clona un árbol AVL iniciando desde el nodo raíz dado.
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
   * Método que reatacha un nodo después de una rotación en el árbol AVL.
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
   * Método que registra un estado intermedio del árbol durante el proceso de rebalanceo para propósitos de visualización y análisis.
   * Toma la estructura jerárquica actual del árbol y la agrega a la colección de jerarquías intermedias en la traza de operación avl.
   */
  private pushAvlRotationHierarchy(): void {
    if (!this.avlOperationTrace) return;
    this.avlOperationTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }

}