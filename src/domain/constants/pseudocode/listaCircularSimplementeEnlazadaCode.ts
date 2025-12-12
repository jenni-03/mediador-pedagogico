import { OperationCode } from "./typesPseudoCode";

export const getListaCircularSimplementeEnlazadaCode = (): Record<string, OperationCode> => ({
  insertFirst: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al inicio de la lista circular simple.
 * @param valor Elemento a insertar.
 */`,
      `public void insertFirst(T {0}) {`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `    } else {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cola.siguiente = nuevoNodo;`,
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
      LINK_SELF: 6,
      ELSE_EMPTY: 7,
      LINK_NEW_TO_HEAD: 8,
      LINK_TAIL_TO_NEW: 9,
      UPDATE_HEAD: 10,
      INC_SIZE: 12
    }
  },
  insertLast: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al final de la lista circular simple.
 * @param valor Elemento a insertar.
 */`,
      `public void insertLast(T {0}) {`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `    } else {`,
      `        this.cola.siguiente = nuevoNodo;`,
      `        nuevoNodo.siguiente = this.cabeza;`,
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
      LINK_SELF: 6,
      ELSE_EMPTY: 7,
      LINK_TAIL_TO_NEW: 8,
      LINK_NEW_TO_HEAD: 9,
      UPDATE_TAIL: 10,
      INC_SIZE: 12
    }
  },
  insertAt: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista circular simple.
 * @param valor Elemento a insertar.
 * @param posicion Índice en el que se desea insertar el elemento.
 * @throws IndexOutOfBoundsException si la posición no existe en la lista (menor que 0 o mayor al tamaño actual).
 */`,
      `public void insertAt(T {0}, int {1}) {`,
      `    if ({1} < 0 || {1} > {2}) {`,
      `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición específicada: La posición " + {1} + " no existe dentro de la lista circular simple.");`,
      `    }`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        this.cola = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `    }`,
      `    else if ({1} == 0) {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cola.siguiente = nuevoNodo;`,
      `        this.cabeza = nuevoNodo;`,
      `    }`,
      `    else if ({1} == {2}) {`,
      `        this.cola.siguiente = nuevoNodo;`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cola = nuevoNodo;`,
      `    }`,
      `    else {`,
      `       NodoS<T> nodoAnt = this.getPos({1} - 1);`,
      `       nuevoNodo.siguiente = nodoAnt.siguiente;`,
      `       nodoAnt.siguiente = nuevoNodo;`,
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
      `private NodoS<T> getPos(int pos) {`,
      `    NodoS<T> nodoActual = this.cabeza;`,
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
      LINK_SELF: 9,
      ELSE_IF_HEAD: 11,
      LINK_NEW_TO_HEAD: 12,
      LINK_TAIL_TO_NEW: 13,
      UPDATE_HEAD: 14,
      ELSE_IF_TAIL: 16,
      LINK_TAIL_TO_NEW2: 17,
      LINK_NEW_TO_HEAD2: 18,
      UPDATE_TAIL: 19,
      ELSE_INSERT: 21,
      GET_PREV_NODE: 22,
      LINK_NEW_TO_NEXT: 23,
      LINK_PREV_TO_NEW: 24,
      INC_SIZE: 26,

      // Método getPos
      INIT_TRAVERSAL: 32,
      WHILE_TRAVERSAL: 33,
      ADVANCE_NODE: 34,
      DEC_POS: 35,
      RETURN_NODE_GETPOS: 37
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
 * Método que elimina el primer elemento de la lista circular simple.
 * @return Elemento asociado al nodo eliminado que ocupaba la primera posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeFirst() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoS<T> nodoEliminar = this.cabeza;`,
      `    if (this.cabeza == this.cola) {`,
      `        this.cabeza = null;`,
      `        this.cola = null;`,
      `    } else {`,
      `        this.cabeza = this.cabeza.siguiente;`,
      `        this.cola.siguiente = this.cabeza;`,
      `    }`,
      `    {0}--;`,
      `    return nodoEliminar.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      SAVE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      CLEAR_HEAD: 7,
      CLEAR_TAIL: 8,
      ELSE_REMOVE: 9,
      MOVE_HEAD: 10,
      LINK_TAIL_TO_HEAD: 11,
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
 * Método que elimina el último elemento de la lista circular simple.
 * @return Elemento asociado al nodo eliminado que ocupaba la última posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeLast() {`,
      `  if (this.cabeza == null)`,
      `      throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
      `  }`,
      `  NodoS<T> nodoEliminar = this.cola;`,
      `  if (this.cabeza == this.cola) {`,
      `      this.cabeza = null;`,
      `      this.cola = null;`,
      `  } else {`,
      `      NodoS<T> nodoAnt = this.getPos({0} - 2);`,
      `      nodoAnt.siguiente = this.cabeza;`,
      `      this.cola = nodoAnt;`,
      `  }`,
      `  {0}--;`,
      `  return nodoEliminar.info;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que retorna el nodo en la posición específicada.
 * @param pos Índice del nodo a obtener.
 * @return Nodo en la posición indicada, o null si no existe.
 */`,
      `private NodoS<T> getPos(int pos) {`,
      `    NodoS<T> nodoActual = this.cabeza;`,
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
      SAVE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      CLEAR_HEAD: 7,
      CLEAR_TAIL: 8,
      ELSE_REMOVE: 9,
      GET_PREV_NODE: 10,
      LINK_PREV_TO_HEAD: 11,
      UPDATE_TAIL: 12,
      DEC_SIZE: 14,
      RETURN_ELEMENT: 15,

      // Método getPos
      INIT_TRAVERSAL: 21,
      WHILE_TRAVERSAL: 22,
      ADVANCE_NODE: 23,
      DEC_POS: 24,
      RETURN_NODE_GETPOS: 26
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
 * Método que elimina el elemento en la posición específicada de la lista circular simple.
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
      `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición específicada: La posición " + {0} + " no existe dentro de la lista circular simple.");`,
      `    }`,
      `    NodoS<T> nodoEliminar;`,
      `    if (this.cabeza == this.cola) {`,
      `        nodoEliminar = this.cabeza;`,
      `        this.cabeza = null;`,
      `        this.cola = null;`,
      `    }`,
      `    else if ({0} == 0) {`,
      `        nodoEliminar = this.cabeza;`,
      `        this.cabeza = this.cabeza.siguiente;`,
      `        this.cola.siguiente = this.cabeza;`,
      `    }`,
      `    else if ({0} == {1} - 1) {`,
      `        nodoEliminar = this.cola;`,
      `        NodoS<T> nodoAnt = this.getPos({0} - 2);`,
      `        nodoAnt.siguiente = this.cabeza;`,
      `        this.cola = nodoAnt;`,
      `    }`,
      `    else {`,
      `        NodoS<T> nodoAnt = this.getPos({0} - 1);`,
      `        nodoEliminar = nodoAnt.siguiente;`,
      `        nodoAnt.siguiente = nodoEliminar.siguiente;`,
      `    }`,
      `    {1}--;`,
      `    return nodoEliminar.info;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que retorna el nodo en la posición específicada.
 * @param pos Índice del nodo a obtener.
 * @return Nodo en la posición indicada, o null si no existe.
 */`,
      `private NodoS<T> getPos(int pos) {`,
      `    NodoS<T> nodoActual = this.cabeza;`,
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
      LINK_TAIL_TO_HEAD: 17,
      ELSE_IF_TAIL: 19,
      SAVE_TAIL_NODE: 20,
      GET_PREV_NODE: 21,
      LINK_PREV_TO_HEAD: 22,
      UPDATE_TAIL: 23,
      ELSE_REMOVE: 25,
      GET_NODE_AT_POS: 26,
      SAVE_REMOVED_NODE: 27,
      LINK_PREV_TO_NEXT: 28,
      DEC_SIZE: 30,
      RETURN_ELEMENT: 31,

      // Método getPos
      INIT_TRAVERSAL: 37,
      WHILE_TRAVERSAL: 38,
      ADVANCE_NODE: 39,
      DEC_POS: 40,
      RETURN_NODE_GETPOS: 42
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
 * Método que comprueba si un elemento existe en la lista circular simple.
 * @param elem Elemento a buscar.
 * @return true si el elemento existe en la lista, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    if (this.cabeza == null) {`,
      `        return false;`,
      `    }`,
      `    NodoS<T> nodoActual = this.cabeza;`,
      `    do {`,
      `       if (nodoActual.info.equals({0})) {`,
      `           return true;`,
      `       }`,
      `       nodoActual = nodoActual.siguiente;`,
      `    } while (nodoActual != this.cabeza);`,
      `    return false;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      RETURN_FALSE_EMPTY: 3,
      INIT_TRAVERSAL: 5,
      DO_SEARCH_LOOP: 6,
      IF_MATCH: 7,
      RETURN_TRUE_FOUND: 8,
      ADVANCE_NODE: 10,
      WHILE_NOT_HEAD: 11,
      RETURN_FALSE_NOT_FOUND: 12
    }
  },
  clean: {
    lines: [
      `/**
 * Método que elimina todos los nodos de la lista circular simple.
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