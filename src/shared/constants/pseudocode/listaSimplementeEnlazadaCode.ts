import { OperationCode } from "./typesPseudoCode";

export const getListaSimplementeEnlazadaCode = (): Record<string, OperationCode> => ({
  insertFirst: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al inicio de la lista simple.
 * @param valor Elemento a insertar.
 */`,
      `public void insertFirst(T {0}) {`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `    } else {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cabeza = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      ASSIGN_HEAD_EMPTY: 4,
      ELSE_EMPTY: 5,
      LINK_NEW_TO_HEAD: 6,
      ASSIGN_NEW_HEAD: 7,
      INC_SIZE: 9
    }
  },
  insertLast: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento al final de la lista simple.
 * @param valor Elemento a insertar.
 */`,
      `public void insertLast(T {0}) {`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.cabeza == null) {`,
      `        this.cabeza = nuevoNodo;`,
      `    } else {`,
      `        NodoS<T> ultimoNodo = this.getPos({1} - 1);`,
      `        ultimoNodo.siguiente = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
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
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      ASSIGN_NEW_HEAD: 4,
      ELSE_EMPTY: 5,
      GET_LAST_NODE: 6,
      LINK_NODE_END: 7,
      INC_SIZE: 9,

      // Método getPos
      INIT_TRAVERSAL: 15,
      WHILE_TRAVERSAL: 16,
      ADVANCE_NODE: 17,
      DEC_POS: 18,
      RETURN_NODE_GETPOS: 20
    }
  },
  insertAt: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista simple.
 * @param valor Elemento a insertar.
 * @param posicion Índice en el que se desea insertar el elemento.
 * @throws IndexOutOfBoundsException si la posición no existe en la lista (menor que 0 o mayor al tamaño actual).
 */`,
      `public void insertAt(T {0}, int {1}) {`,
      `    if ({1} < 0 || {1} > {2}) {`,
      `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición específicada: La posición " + {1} + " no existe dentro de la lista simple.");`,
      `    }`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if ({1} == 0) {`,
      `        nuevoNodo.siguiente = this.cabeza;`,
      `        this.cabeza = nuevoNodo;`,
      `    } else {`,
      `        NodoS<T> nodoAnt = this.getPos({1} - 1);`,
      `        nuevoNodo.siguiente = nodoAnt.siguiente;`,
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
      VALIDATE_HEAD: 6,
      LINK_NEW_TO_HEAD: 7,
      ASSIGN_NEW_HEAD: 8,
      ELSE_GENERAL: 9,
      GET_PREV_NODE: 10,
      LINK_NEW_TO_NEXT: 11,
      LINK_PREV_TO_NEW: 12,
      INC_SIZE: 14,

      // Método getPos
      INIT_TRAVERSAL: 20,
      WHILE_TRAVERSAL: 21,
      ADVANCE_NODE: 22,
      DEC_POS: 23,
      RETURN_NODE_GETPOS: 25
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
 * Método que elimina el primer elemento de la lista simple.
 * @return Elemento asociado al nodo eliminado que ocupaba la primera posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeFirst() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoS<T> nodoEliminado = this.cabeza;`,
      `    this.cabeza = this.cabeza.siguiente;`,
      `    {0}--;`,
      `    return nodoEliminado.info;`,
      `}`
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      SAVE_HEAD: 5,
      MOVE_HEAD: 6,
      DEC_SIZE: 7,
      RETURN_ELEMENT: 8
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
 * Método que elimina el último elemento de la lista simple.
 * @return Elemento asociado al nodo eliminado que ocupaba la última posición.
 * @throws RuntimeException si la lista está vacía.
 */`,
      `public T removeLast() {`,
      `    if (this.cabeza == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoS<T> nodoEliminado;`,
      `    if ({0} == 1) {`,
      `        nodoEliminado = this.cabeza;`,
      `        this.cabeza = null;`,
      `    } else {`,
      `        NodoS<T> nodoAnt = this.getPos({0} - 2);`,
      `        nodoEliminado = nodoAnt.siguiente;`,
      `        nodoAnt.siguiente = null;`,
      `    }`,
      `    {0}--;`,
      `    return nodoEliminado.info;`,
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
      DECLARE_REMOVED_NODE: 5,
      VALIDATE_SINGLE_NODE: 6,
      SAVE_HEAD: 7,
      CLEAR_HEAD: 8,
      ELSE_SINGLE_NODE: 9,
      GET_PREV_NODE: 10,
      SAVE_LAST_NODE: 11,
      UNLINK_LAST_NODE: 12,
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
 * Método que elimina el elemento en la posición específicada de la lista simple.
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
      `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición específicada: La posición " + {0} + " no existe dentro de la lista simple.");`,
      `    }`,
      `    NodoS<T> nodoEliminado;`,
      `    if ({0} == 0) {`,
      `        nodoEliminado = this.cabeza;`,
      `        this.cabeza = this.cabeza.siguiente;`,
      `    } else {`,
      `        NodoS<T> nodoAnt = this.getPos({0} - 1);`,
      `        nodoEliminado = nodoAnt.siguiente;`,
      `        nodoAnt.siguiente = nodoEliminado.siguiente;`,
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
      VALIDATE_HEAD: 9,
      SAVE_HEAD: 10,
      MOVE_HEAD: 11,
      ELSE_REMOVE: 12,
      GET_PREV_NODE: 13,
      SAVE_TARGET_NODE: 14,
      BYPASS_NODE: 15,
      DEC_SIZE: 17,
      RETURN_ELEMENT: 18,

      // Método getPos
      INIT_TRAVERSAL: 24,
      WHILE_TRAVERSAL: 25,
      ADVANCE_NODE: 26,
      DEC_POS: 27,
      RETURN_NODE_GETPOS: 29
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
 * Método que comprueba si un elemento existe en la lista simple.
 * @param elem Elemento a buscar.
 * @return true si el elemento existe en la lista, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    Nodo<T> nodoActual = this.cabeza;`,
      `    while(nodoActual != null) {`,
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
 * Método que permite eliminar todos los nodos de la lista simple.
 */`,
      `public void clean(){`,
      `    this.cabeza = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      CLEAR_HEAD: 2,
      RESET_SIZE: 3
    }
  },
});