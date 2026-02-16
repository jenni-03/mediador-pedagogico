import { OperationCode } from "./typesPseudoCode";

export const getColaCode = (): Record<string, OperationCode> => ({
  enqueue: {
    lines: [
      `/**
 * Método que encola un nuevo elemento en la cola.
 * @param valor Elemento a encolar.
 */`,
      `public void enqueue(T {0}) {`,
      `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
      `    if (this.tamanio == 0) {`,
      `        this.inicio = nuevoNodo;`,
      `        this.fin = nuevoNodo;`,
      `    } else {`,
      `        this.fin.siguiente = nuevoNodo;`,
      `        this.fin = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      ASSIGN_START_EMPTY: 4,
      ASSIGN_END_EMPTY: 5,
      ELSE_EMPTY: 6,
      LINK_NEW_TO_END: 7,
      ASSIGN_NEW_END: 8,
      INC_SIZE: 10,
    },
  },
  dequeue: {
    lines: [
      `/**
 * Método que decola (remueve) el primer elemento de la cola.
 * @return valor Elemento asociado al nodo decolado.
 * @throws RuntimeException si la cola está vacía.
 */`,
      `public T dequeue() {`,
      `    if (this.tamanio == 0) {`,
      `        throw new RuntimeException("No fue posible decolar el nodo: La cola está vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoS<T> nodoEliminar = this.inicio;`,
      `    if (this.inicio == this.fin) {`,
      `        this.inicio = null;`,
      `        this.fin = null;`,
      `    } else {`,
      `        this.inicio = this.inicio.siguiente;`,
      `    }`,
      `    {0}--;`,
      `    return nodoEliminar.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      SAVE_FIRST_NODE: 5,
      VALIDATE_ONE_ELEMENT: 6,
      CLEAR_START_SINGLE: 7,
      CLEAR_END_SINGLE: 8,
      ELSE_MULTIPLE: 9,
      ADVANCE_START: 10,
      DEC_SIZE: 12,
      RETURN_VALUE: 13,
    },
    errorPlans: {
      QUEUE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_EMPTY", hold: 600 },
      ],
    },
  },
  getFront: {
    lines: [
      `/**
 * Método que obtiene el primer elemento insertado en la cola.
 * @return valor Elemento cabeza asociado al nodo inicial. 
 * @throws RuntimeException si la cola está vacía.
 */`,
      `public T getFront() {`,
      `    if (this.tamanio == 0) {`,
      `        throw new RuntimeException("No fue posible obtener el elemento cabeza: La cola está vacía (tamaño actual: 0).");`,
      `    }`,
      `    return this.inicio.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      RETURN_HEAD: 5,
    },
    errorPlans: {
      QUEUE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_EMPTY", hold: 600 },
      ],
    },
  },
  clean: {
    lines: [
      `/**
 * Método que elimina todos los elementos de la cola.
 */`,
      `public void clean() {`,
      `    this.inicio = null;`,
      `    this.fin = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      CLEAR_HEAD: 2,
      CLEAR_TAIL: 3,
      RESET_SIZE: 4,
    },
  },
});