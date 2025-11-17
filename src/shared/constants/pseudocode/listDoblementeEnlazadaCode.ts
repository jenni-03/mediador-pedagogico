import { OperationCode } from "./typesPseudoCode";

export const getListaDoblementeEnlazadaCode = (): Record<string, OperationCode> => ({
  insertFirst: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al inicio de la lista doble.
 * @param valor Elemento a insertar.
 */`,
      `public void insertFirst(T {0}) {`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `    } else {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cabeza.anterior = nuevoNodo;`,
      `        this.cabeza = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_HEAD_EMPTY: 4,
      SET_TAIL_EMPTY: 5,
      ELSE_EMPTY: 6,
      LINK_NEW_TO_HEAD: 7,
      LINK_HEAD_TO_NEW: 8,
      UPDATE_HEAD: 9,
      INC_SIZE: 11
    }
  },
  insertLast: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al final de la lista doble.
 * @param valor Elemento a insertar.
 */`,
      `public void insertLast(T {0}) {`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `    } else {`,
      `        this.cola.siguiente = nuevoNodo;`,
      `        nuevoNodo.anterior = this.cola;`,
      `        this.cola = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_HEAD_EMPTY: 4,
      SET_TAIL_EMPTY: 5,
      ELSE_EMPTY: 6,
      LINK_TAIL_TO_NEW: 7,
      LINK_NEW_TO_TAIL: 8,
      UPDATE_TAIL: 9,
      INC_SIZE: 11
    }
  },
  insertAt: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista doble.
 * @param valor Elemento a insertar.
 * @param posicion Índice en el que se desea insertar el elemento.
 * @throws IndexOutOfBoundsException si la posición no existe en la lista (menor que 0 o mayor al tamaño actual).
 */`,
      `public void insertAt(T {0}, int {1}) {`,
      `    if ({1} < 0 || {1} > {2}) {`,
      `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición específicada: La posición " + {1} + " no existe dentro de la lista doble.");`,
      `    }`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `    }`,
      `    else if ({1} == 0) {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cabeza.anterior = nuevoNodo;`,
      `        this.cabeza = nuevoNodo;`,
      `    }`,
      `    else if ({1} == {2}) {`,
      `        this.cola.siguiente = nuevoNodo;`,
      `        nuevoNodo.anterior = this.cola;`,
      `        this.cola = nuevoNodo;`,
      `    }`,
      `    else {`,
      `        NodoD<T> nodoAnt = this.getPos({1} - 1);`,
      `        nuevoNodo.siguiente = nodoAnt.siguiente;`,
      `        nuevoNodo.anterior = nodoAnt;`,
      `        nodoAnt.siguiente.anterior = nuevoNodo;`,
      `        nodoAnt.siguiente = nuevoNodo;`,
      `    }`,
      `    {2}++;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que retorna el nodo en la posición específicada.
 * @param pos Índice del nodo a obtener.
 * @return Nodo en la posición indicada, o null si no existe.
 */`,
      `private NodoD<T> getPos(int pos) {`,
      `    NodoD<T> nodoActual = this.cabeza;`,
      `    while (pos > 0) {`,
      `      nodoActual = nodoActual.siguiente;`,
      `      pos--;`,
      `    }`,
      `    return nodoActual;`,
      `}`
    ],
    labels: {
      VALIDATE_POSITION: 2,
      THROW_OUT_OF_BOUNDS: 3,
      CREATE_NODE: 5,
      VALIDATE_EMPTY: 6,
      SET_HEAD_EMPTY: 7,
      SET_TAIL_EMPTY: 8,
      ELSE_IF_HEAD: 10,
      LINK_NEW_TO_HEAD: 11,
      LINK_HEAD_TO_NEW: 12,
      UPDATE_HEAD: 13,
      ELSE_IF_TAIL: 15,
      LINK_TAIL_TO_NEW: 16,
      LINK_NEW_TO_TAIL: 17,
      UPDATE_TAIL: 18,
      ELSE_INSERT: 20,
      GET_PREV_NODE: 21,
      LINK_NEW_TO_NEXT: 22,
      LINK_NEW_TO_PREV: 23,
      LINK_NEXT_TO_NEW: 24,
      LINK_PREV_TO_NEW: 25,
      INC_SIZE: 27,

      // Método getPos
      INIT_TRAVERSAL: 33,
      WHILE_TRAVERSAL: 34,
      ADVANCE_NODE: 35,
      DEC_POS: 36,
      RETURN_NODE_GETPOS: 38
    },
    errorPlans: {
      OUT_OF_BOUNDS: [
        { lineLabel: "VALIDATE_POSITION", hold: 600 },
        { lineLabel: "THROW_OUT_OF_BOUNDS", hold: 600 }
      ]
    }
  },
  removeFirst: {
    lines: [
      `/**
 * Método que elimina el primer elemento de la lista doble.
 * @return Elemento asociado al nodo eliminado que ocupaba la primera posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeFirst() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoD<T> nodoEliminado = this.cabeza;`,
      `    if (this.cabeza == this.cola) {`,
      `        this.cabeza = null;`,
      `        this.cola = null;`,
      `    } else {`,
      `        this.cabeza = this.cabeza.siguiente;`,
      `        this.cabeza.anterior = null;`,
      `    }`,
      `    {0}--;`,
      `    return nodoEliminado.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      SAVE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      CLEAR_HEAD: 7,
      CLEAR_TAIL: 8,
      ELSE_SINGLE_NODE: 9,
      MOVE_HEAD: 10,
      CLEAR_PREV_LINK: 11,
      DEC_SIZE: 13,
      RETURN_ELEMENT: 14
    },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_IF_EMPTY", hold: 600 },
      ]
    }
  },
  removeLast: {
    lines: [
      `/**
 * Método que elimina el último elemento de la lista doble.
 * @return Elemento asociado al nodo eliminado que ocupaba la última posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeLast() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoD<T> nodoEliminado = this.cola;`,
      `    if (this.cabeza == this.cola) {`,
      `        this.cabeza = null;`,
      `        this.cola = null;`,
      `    } else {`,
      `        this.cola = this.cola.anterior;`,
      `        this.cola.siguiente = null;`,
      `    }`,
      `    {0}--;`,
      `    return nodoEliminado.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      SAVE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      CLEAR_HEAD: 7,
      CLEAR_TAIL: 8,
      ELSE_SINGLE_NODE: 9,
      MOVE_TAIL: 10,
      CLEAR_NEXT_LINK: 11,
      DEC_SIZE: 13,
      RETURN_ELEMENT: 14
    },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_IF_EMPTY", hold: 600 },
      ]
    }
  },
  removeAt: {
    lines: [
      `/**
 * Método que elimina el elemento en la posición específicada de la lista doble.
 * @param posicion Índice del elemento a eliminar.
 * @return Elemento asociado al nodo eliminado en la posición indicada.
 * @throws RuntimeException si la lista está vacía.
 * @throws IndexOutOfBoundsException si la posición es inválida (menor que 0 o mayor/igual al tamaño actual).
 */`,
      `public T removeAt(int {0}) {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo en la posición específicada: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    if ({0} < 0 || {0} >= {1}) {`,
      `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición específicada: La posición " + {0} + " no existe dentro de la lista doble.");`,
      `    }`,
      `    NodoD<T> nodoEliminado;`,
      `    if (this.cabeza == this.cola) {`,
      `        nodoEliminado = this.cabeza;`,
      `        this.cabeza = null;`,
      `        this.cola = null;`,
      `    }`,
      `    else if ({0} == 0) {`,
      `        nodoEliminado = this.cabeza;`,
      `        this.cabeza = this.cabeza.siguiente;`,
      `        this.cabeza.anterior = null;`,
      `    }`,
      `    else if ({0} == {1} - 1) {`,
      `        nodoEliminado = this.cola;`,
      `        this.cola = this.cola.anterior;`,
      `        this.cola.siguiente = null;`,
      `    }`,
      `    else {`,
      `        nodoEliminado = this.getPos({0});`,
      `        nodoEliminado.anterior.siguiente = nodoEliminado.siguiente;`,
      `        nodoEliminado.siguiente.anterior = nodoEliminado.anterior;`,
      `    }`,
      `    {1}--;`,
      `    return nodoEliminado.info;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que retorna el nodo en la posición específicada.
 * @param pos Índice del nodo a obtener.
 * @return Nodo en la posición indicada, o null si no existe.
 */`,
      `private NodoD<T> getPos(int pos) {`,
      `    NodoD<T> nodoActual = this.cabeza;`,
      `    while (pos > 0) {`,
      `      nodoActual = nodoActual.siguiente;`,
      `      pos--;`,
      `    }`,
      `    return nodoActual;`,
      `}`
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      VALIDATE_POSITION: 5,
      THROW_OUT_OF_BOUNDS: 6,
      DECLARE_REMOVED_NODE: 8,
      VALIDATE_SINGLE_NODE: 9,
      SAVE_SINGLE_NODE: 10,
      CLEAR_HEAD: 11,
      CLEAR_TAIL: 12,
      ELSE_IF_HEAD: 14,
      SAVE_HEAD_NODE: 15,
      MOVE_HEAD: 16,
      CLEAR_PREV_LINK: 17,
      ELSE_IF_TAIL: 19,
      SAVE_TAIL_NODE: 20,
      MOVE_TAIL: 21,
      CLEAR_NEXT_LINK: 22,
      ELSE_REMOVE: 24,
      GET_NODE_AT_POS: 25,
      LINK_PREV_TO_NEXT: 26,
      LINK_NEXT_TO_PREV: 27,
      DEC_SIZE: 29,
      RETURN_ELEMENT: 30,

      // Método getPos
      INIT_TRAVERSAL: 36,
      WHILE_TRAVERSAL: 37,
      ADVANCE_NODE: 38,
      DEC_POS: 39,
      RETURN_NODE_GETPOS: 41
    },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_IF_EMPTY", hold: 600 },
      ],
      OUT_OF_BOUNDS: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "VALIDATE_POSITION", hold: 600 },
        { lineLabel: "THROW_OUT_OF_BOUNDS", hold: 600 }
      ]
    }
  },
  search: {
    lines: [
      `/**
 * Método que comprueba si un elemento existe en la lista doble.
 * @param elem Elemento a buscar.
 * @return true si el elemento existe en la lista, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    NodoD<T> nodoActual = this.cabeza;`,
      `    while (nodoActual != null) {`,
      `        if (nodoActual.info.equals({0})) {`,
      `            return true;`,
      `        }`,
      `        nodoActual = nodoActual.siguiente;`,
      `    }`,
      `    return false;`,
      `}`,
    ],
    labels: {
      INIT_TRAVERSAL: 2,
      WHILE_TRAVERSAL: 3,
      IF_MATCH: 4,
      RETURN_TRUE: 5,
      ADVANCE_NODE: 7,
      RETURN_FALSE: 9
    }
  },
  clean: {
    lines: [
      `/**
 * Método que permite eliminar todos los nodos de la lista doble.
 */`,
      `public void clean() {`,
      `    this.cabeza = null;`,
      `    this.cola = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      CLEAR_HEAD: 2,
      CLEAR_TAIL: 3,
      RESET_SIZE: 4
    }
  },
});