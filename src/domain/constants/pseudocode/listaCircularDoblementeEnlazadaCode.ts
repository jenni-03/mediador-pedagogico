import { OperationCode } from "./typesPseudoCode";

export const getListaCircularDoblementeEnlazadaCode = (): Record<string, OperationCode> => ({
  insertFirst: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al inicio de la lista circular doble.
 * @param valor Elemento a insertar.
 */`,
      `public void insertFirst(T {0}) {`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `        nuevoNodo.anterior = nuevoNodo;`,
      `    } else {`,
      `       nuevoNodo.siguiente = this.cabeza;`,
      `       nuevoNodo.anterior = this.cabeza.anterior;`,
      `       this.cabeza.anterior.siguiente = nuevoNodo;`,
      `       this.cabeza.anterior = nuevoNodo;`,
      `       this.cabeza = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_HEAD_EMPTY: 4,
      LINK_SELF_NEXT: 5,
      LINK_SELF_PREV: 6,
      ELSE_EMPTY: 7,
      LINK_NEW_TO_HEAD: 8,
      LINK_NEW_TO_LAST: 9,
      LINK_LAST_TO_NEW: 10,
      LINK_HEAD_TO_NEW: 11,
      UPDATE_HEAD: 12,
      INC_SIZE: 14
    }
  },
  insertLast: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al final de la lista circular doble.
 * @param valor Elemento a insertar.
 */`,
      `public void insertLast(T {0}) {`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `        nuevoNodo.anterior = nuevoNodo;`,
      `    } else {`,
      `       nuevoNodo.siguiente = this.cabeza;`,
      `       nuevoNodo.anterior = this.cabeza.anterior;`,
      `       this.cabeza.anterior.siguiente = nuevoNodo;`,
      `       this.cabeza.anterior = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_HEAD_EMPTY: 4,
      LINK_SELF_NEXT: 5,
      LINK_SELF_PREV: 6,
      ELSE_EMPTY: 7,
      LINK_NEW_TO_HEAD: 8,
      LINK_NEW_TO_LAST: 9,
      LINK_LAST_TO_NEW: 10,
      LINK_HEAD_TO_NEW: 11,
      INC_SIZE: 13
    }
  },
  insertAt: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista circular doble.
 * @param valor Elemento a insertar.
 * @param posicion Índice en el que se desea insertar el elemento.
 * @throws IndexOutOfBoundsException si la posición no existe en la lista (menor que 0 o mayor al tamaño actual).
 */`,
      `public void insertAt(T {0}, int {1}) {`,
      `    if ({1} < 0 || {1} > {2}) {`,
      `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición específicada: La posición " + {1} + " no existe dentro de la lista circular doble.");`,
      `    }`,
      `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `        nuevoNodo.siguiente = nuevoNodo;`,
      `        nuevoNodo.anterior = nuevoNodo;`,
      `    }`,
      `    else if ({1} == 0) {`,
      `       nuevoNodo.siguiente = this.cabeza;`,
      `       nuevoNodo.anterior = this.cabeza.anterior;`,
      `       this.cabeza.anterior.siguiente = nuevoNodo;`,
      `       this.cabeza.anterior = nuevoNodo;`,
      `       this.cabeza = nuevoNodo;`,
      `    }`,
      `    else if ({1} == {2}) {`,
      `       nuevoNodo.siguiente = this.cabeza;`,
      `       nuevoNodo.anterior = this.cabeza.anterior;`,
      `       this.cabeza.anterior.siguiente = nuevoNodo;`,
      `       this.cabeza.anterior = nuevoNodo;`,
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
      LINK_SELF_NEXT: 8,
      LINK_SELF_PREV: 9,
      ELSE_IF_HEAD: 11,
      LINK_NEW_TO_HEAD: 12,
      LINK_NEW_TO_LAST: 13,
      LINK_LAST_TO_NEW: 14,
      LINK_HEAD_TO_NEW: 15,
      UPDATE_HEAD: 16,
      ELSE_IF_TAIL: 18,
      LINK_NEW_TO_HEAD2: 19,
      LINK_NEW_TO_LAST2: 20,
      LINK_LAST_TO_NEW2: 21,
      LINK_HEAD_TO_NEW2: 22,
      ELSE_INSERT: 24,
      GET_PREV_NODE: 25,
      LINK_NEW_TO_NEXT: 26,
      LINK_NEW_TO_PREV: 27,
      LINK_NEXT_TO_NEW: 28,
      LINK_PREV_TO_NEW: 29,
      INC_SIZE: 31,

      // Método getPos
      INIT_TRAVERSAL: 37,
      WHILE_TRAVERSAL: 38,
      ADVANCE_NODE: 39,
      DEC_POS: 40,
      RETURN_NODE_GETPOS: 42
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
 * Método que elimina el primer elemento de la lista circular doble.
 * @return Elemento asociado al nodo eliminado que ocupaba la primera posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeFirst() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoD<T> nodoEliminar = this.cabeza;`,
      `    if (this.cabeza == this.cabeza.siguiente) {`,
      `        this.cabeza = null;`,
      `    } else {`,
      `        nodoEliminar.anterior.siguiente = nodoEliminar.siguiente;`,
      `        nodoEliminar.siguiente.anterior = nodoEliminar.anterior;`,
      `        this.cabeza = nodoEliminar.siguiente;`,
      `        nodoEliminar.siguiente = null;`,
      `        nodoEliminar.anterior = null;`,
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
      ELSE_REMOVE: 8,
      LINK_LAST_TO_NEWHEAD: 9,
      LINK_NEWHEAD_TO_LAST: 10,
      UPDATE_HEAD: 11,
      CLEAR_REMOVED_NEXT: 12,
      CLEAR_REMOVED_PREV: 13,
      DEC_SIZE: 15,
      RETURN_ELEMENT: 16
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
 * Método que elimina el último elemento de la lista circular doble.
 * @return Elemento asociado al nodo eliminado que ocupaba la última posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeLast() {`,
      `    if (this.cabeza == null)`,
      `        throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoD<T> nodoEliminar = this.cabeza.anterior;`,
      `    if (this.cabeza == this.cabeza.siguiente) {`,
      `        this.cabeza = null;`,
      `    } else {`,
      `        nodoEliminar.anterior.siguiente = this.cabeza;`,
      `        this.cabeza.anterior = nodoEliminar.anterior;`,
      `        nodoEliminar.siguiente = null;`,
      `        nodoEliminar.anterior = null;`,
      `    }`,
      `  {0}--;`,
      `  return nodoEliminar.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      SAVE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      CLEAR_HEAD: 7,
      ELSE_REMOVE: 8,
      LINK_PREV_TO_HEAD: 9,
      LINK_HEAD_TO_PREV: 10,
      CLEAR_REMOVED_NEXT: 11,
      CLEAR_REMOVED_PREV: 12,
      DEC_SIZE: 14,
      RETURN_ELEMENT: 15
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
 * Método que elimina el elemento en la posición específicada de la lista circular doble.
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
      `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición específicada: La posición " + {0} + " no existe dentro de la lista circular doble.");`,
      `    }`,
      `    NodoD<T> nodoEliminar;`,
      `    if (this.cabeza == this.cabeza.siguiente) {`,
      `        nodoEliminar = this.cabeza;`,
      `        this.cabeza = null;`,
      `    }`,
      `    else if ({0} == 0) {`,
      `        nodoEliminar = this.cabeza;`,
      `        nodoEliminar.anterior.siguiente = nodoEliminar.siguiente;`,
      `        nodoEliminar.siguiente.anterior = nodoEliminar.anterior;`,
      `        this.cabeza = nodoEliminar.siguiente;`,
      `        nodoEliminar.siguiente = null;`,
      `        nodoEliminar.anterior = null;`,
      `    }`,
      `    else if ({0} == {1} - 1) {`,
      `        nodoEliminar = this.cabeza.anterior;`,
      `        nodoEliminar.anterior.siguiente = this.cabeza;`,
      `        this.cabeza.anterior = nodoEliminar.anterior;`,
      `        nodoEliminar.siguiente = null;`,
      `        nodoEliminar.anterior = null;`,
      `    }`,
      `    else {`,
      `        nodoEliminar = this.getPos({0});`,
      `        nodoEliminar.anterior.siguiente = nodoEliminar.siguiente;`,
      `        nodoEliminar.siguiente.anterior = nodoEliminar.anterior;`,
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
      ELSE_IF_HEAD: 13,
      SAVE_HEAD_NODE: 14,
      LINK_LAST_TO_NEWHEAD: 15,
      LINK_NEWHEAD_TO_LAST: 16,
      UPDATE_HEAD: 17,
      CLEAR_REMOVED_NEXT: 18,
      CLEAR_REMOVED_PREV: 19,
      ELSE_IF_TAIL: 21,
      SAVE_TAIL_NODE: 22,
      LINK_PREV_TO_HEAD: 23,
      LINK_HEAD_TO_PREV: 24,
      CLEAR_REMOVED_NEXT2: 25,
      CLEAR_REMOVED_PREV2: 26,
      ELSE_REMOVE: 28,
      GET_NODE_AT_POS: 29,
      LINK_PREV_TO_NEXT: 30,
      LINK_NEXT_TO_PREV: 31,
      DEC_SIZE: 33,
      RETURN_ELEMENT: 34,

      // Método getPos
      INIT_TRAVERSAL: 40,
      WHILE_TRAVERSAL: 41,
      ADVANCE_NODE: 42,
      DEC_POS: 43,
      RETURN_NODE_GETPOS: 45
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
 * Método que comprueba si un elemento existe en la lista circular doble.
 * @param elem Elemento a buscar.
 * @return true si el elemento existe en la lista, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    if (this.cabeza == null) {`,
      `        return false;`,
      `    }`,
      `    NodoD<T> nodoActual = this.cabeza;`,
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
 * Método que elimina todos los nodos de la lista circular doble.
 */`,
      `public void clean() {`,
      `    this.cabeza = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      CLEAR_HEAD: 2,
      RESET_SIZE: 3
    }
  }
});