// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { Comparator, HierarchyNodeData, OperationTrace } from "../../../types";
import { NodoAVL } from "../nodes/NodoAVL";
import { ArbolBinarioBusqueda } from "./ArbolBinarioBusqueda";
import { defaultComparator } from "../treeUtils";

/**
 * Clase que representa el funcionamiento de un árbol AVL.
 */
export class ArbolAVL<T> extends ArbolBinarioBusqueda<T> {

  private lastAvlTrace: OperationTrace<T> | null = null;

  /**
   * Constructor de la clase ArbolAVL.
   */
  constructor(
    compare: Comparator<T> = defaultComparator
  ) {
    super(compare);
  }

  /**
   * Método que inserta un nuevo nodo en el árbol AVL.
   * @param valor Elemento a insertar.
   * @returns Nodo AVL recién insertado.
   */
  public override insertar(valor: T): NodoAVL<T> {
    if (super.getTamanio() >= this.MAX_NODOS) {
      throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
    }

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.lastAvlTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const salida = { inserted: null };
    this.setRaiz(this.insertarAVL(this.getRaiz(), valor, salida, null));
    this.setTamanio(this.getTamanio() + 1);
    return salida.inserted!;
  }

  /**
   * Método que elimina un nodo especifico del árbol AVL.
   * @param valor Elemento a eliminar.
   * @returns Objeto que contiene:
   *   - `removed`: Nodo eliminado físicamente del árbol.
   *   - `updated`: Nodo que actualizó su valor por el del nodo eliminado.
   */
  public override eliminar(valor: T): { removed: NodoAVL<T>; updated: NodoAVL<T> | null } {
    if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");

    // Inicializar la traza de seguimiento del estado del árbol durante la operación
    this.lastAvlTrace = {
      rotations: [],
      hierarchies: { pre: null, mids: [] }
    };

    const salida: { removed: NodoAVL<T> | null, updated: NodoAVL<T> | null } = { removed: null, updated: null };
    this.setRaiz(this.eliminarAVL(this.getRaiz(), valor, salida, null));

    if (salida.removed === null) throw new Error("No fue posible eliminar el nodo: El elemento no existe en el árbol.");

    this.setTamanio(this.getTamanio() - 1);
    return { removed: salida.removed, updated: salida.updated };
  }

  /**
   * Método que determina la existencia de un elemento dentro del árbol AVL.
   * @param valor Elemento a buscar en el árbol AVL.
   * @returns Booleano que indica si el elemento fue encontrado o no. 
   */
  public override esta(valor: T): boolean {
    return super.esta(valor);
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
    const t = this.lastAvlTrace;
    this.lastAvlTrace = null;
    return t;
  }

  /**
   * Método recursivo que inserta un nuevo nodo en el árbol AVL manteniendo su propiedad de balance.
   * Luego de la inserción, los pesos de los nodos se actualizan y el árbol es rebalanceado si es necesario.
   * @param root Nodo raíz actual del subárbol donde se insertará el elemento.
   * @param valor Elemento a insertar.
   * @param salida Objeto usado para retornar el nodo recién insertado.
   * @param parent Nodo padre de del nodo actual.
   * @returns Nuevo nodo raíz del subárbol luego de la inserción y posible rebalanceo.
   */
  private insertarAVL(root: NodoAVL<T> | null, valor: T, salida: { inserted: NodoAVL<T> | null }, parent: NodoAVL<T> | null): NodoAVL<T> {
    if (root === null) {
      const nuevo = new NodoAVL(valor);
      salida.inserted = nuevo;
      return nuevo;
    }

    // Inserción BST estándar
    const cmp = this.compare(valor, root.getInfo());
    if (cmp < 0) {
      root.setIzq(this.insertarAVL(root.getIzq(), valor, salida, root));
    } else if (cmp > 0) {
      root.setDer(this.insertarAVL(root.getDer(), valor, salida, root));
    } else {
      throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
    }

    // Actualizar las alturas de los nodos.
    root.recomputarAltura();

    // Corregir desbalanceos
    return this.rebalancear(root, parent);
  }

  /**
   * Método recursivo que elimina un nodo especifico del árbol AVL, rebalanceando el árbol si es necesario.
   * @param root Nodo raíz del subárbol actual.
   * @param valor Elemento a eliminar.
   * @param salida Objeto para almacenar las referencias del nodo eliminado y actualizado.
   * @param parent Nodo padre del subárbol actual.
   * @returns Nueva raíz del subárbol luego de la eliminación y posible rebalanceo.
   */
  private eliminarAVL(
    root: NodoAVL<T> | null,
    valor: T,
    salida: { removed: NodoAVL<T> | null, updated: NodoAVL<T> | null },
    parent: NodoAVL<T> | null
  ): NodoAVL<T> | null {
    if (!root) return null;

    // Eliminación BST estándar
    const cmp = this.compare(valor, root.getInfo());
    if (cmp < 0) {
      root.setIzq(this.eliminarAVL(root.getIzq(), valor, salida, root));
    } else if (cmp > 0) {
      root.setDer(this.eliminarAVL(root.getDer(), valor, salida, root));
    } else {
      if (!root.getIzq()) {
        salida.removed = root;
        return root.getDer();
      }

      if (!root.getDer()) {
        salida.removed = root;
        return root.getIzq();
      }

      const succ = this.minNodo(root.getDer()!);
      root.setInfo(succ.getInfo());
      salida.updated = root;
      root.setDer(this.eliminarAVL(root.getDer(), succ.getInfo(), salida, root));
    }

    // Actualizar las alturas de los nodos
    root.recomputarAltura();

    // Corregir desbalanceos
    return this.rebalancear(root, parent);
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
      if (this.lastAvlTrace && !this.lastAvlTrace.hierarchies.pre) {
        this.lastAvlTrace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (y.getBalance() < 0) {
        // -------- LR: rotarIzq(y) -> rotarDer(nodo)
        const x = y.getDer()!;

        // Capturar info de la rotación a aplicar
        this.lastAvlTrace?.rotations.push({
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
        this.lastAvlTrace?.rotations.push({
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
      if (this.lastAvlTrace && !this.lastAvlTrace.hierarchies.pre) {
        this.lastAvlTrace.hierarchies.pre = this.convertirEstructuraJerarquica();
      }

      if (y.getBalance() > 0) {
        // -------- RL: rotarDer(y) -> rotarIzq(nodo)
        const x = y.getIzq()!;

        // Capturar info de la rotación a aplicar
        this.lastAvlTrace?.rotations.push({
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
        this.lastAvlTrace?.rotations.push({
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
   * Método que recorre los hijos izquierdos del subárbol dado hasta encontrar el nodo más a la izquierda.
   * @param root Nodo raíz del subárbol a buscar.
   * @returns Nodo con el mínimo valor del subárbol.
   */
  private minNodo(n: NodoAVL<T>): NodoAVL<T> {
    while (n.getIzq()) n = n.getIzq()!;
    return n;
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
   * Método que agrega la estructura jerárquica actual a la traza de seguimiento del estado del árbol.
   */
  private pushAvlRotationHierarchy(): void {
    if (!this.lastAvlTrace) return;
    this.lastAvlTrace.hierarchies.mids.push(
      this.convertirEstructuraJerarquica() as HierarchyNodeData<T>
    );
  }

}