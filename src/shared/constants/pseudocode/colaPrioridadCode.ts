import { OperationCode } from "./typesPseudoCode";

export const getColaPrioridadCode = (): Record<string, OperationCode> => ({
  enqueue: {
    lines: [
      `/**
 * Método que encola un nuevo elemento en la cola según su prioridad.
 * @param valor Elemento a encolar.
 * @param prioridad Prioridad del nodo (menor número = mayor prioridad).
 */`,
      `public void enqueue(T {0}, int {1}) {`,
      `    NodoPrioridad<T> nuevoNodo = new NodoPrioridad<>({0}, {1});`,
      `    if (this.inicio == null || {1} < this.inicio.prioridad) {`,
      `        nuevoNodo.siguiente = this.inicio;`,
      `        this.inicio = nuevoNodo;`,
      `    } else {`,
      `        NodoPrioridad<T> actual = this.inicio;`,
      `        while (actual.siguiente != null && actual.siguiente.prioridad <= {1}) {`,
      `               actual = actual.siguiente;`,
      `        }`,
      `        nuevoNodo.siguiente = actual.siguiente;`,
      `        actual.siguiente = nuevoNodo;`,
      `    }`,
      `    {2}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,

      // Caso prioridad más alta o cola vacía
      CHECK_EMPTY_OR_HIGHER_PRIORITY: 3,
      INSERT_AT_START_SET_NEXT: 4,
      INSERT_AT_START_SET_HEAD: 5,

      // Caso recorrido
      ELSE_BLOCK: 6,
      SET_CURRENT: 7,
      WHILE_CHECK: 8,
      WHILE_ADVANCE: 9,
      END_WHILE: 10,

      // Inserción en medio/final
      LINK_NEWNODE_NEXT: 11,
      LINK_PREVIOUS_TO_NEWNODE: 12,

      INC_SIZE: 14,
    },
  },

  dequeue: {
    lines: [
      `/**
 * Método que decola (remueve) el elemento con mayor prioridad de la cola.
 * @return valor Elemento asociado al nodo decolado.
 * @throws RuntimeException si la cola está vacía.
 */`,
      `public T dequeue() {`,
      `    if (this.inicio == null) {`,
      `        throw new RuntimeException("No fue posible decolar el nodo: La cola está vacía (tamaño actual: 0).");`,
      `    }`,
      `    NodoPrioridad<T> nodoEliminar = this.inicio;`,
      `    this.inicio = this.inicio.siguiente;`,
      `    {0}--;`,
      `    return nodoEliminar.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      SAVE_NODE_TO_REMOVE: 5,
      MOVE_HEAD: 6,
      DEC_SIZE: 7,
      RETURN_INFO: 8,
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
      `    if (this.inicio == null) {`,
      `        throw new RuntimeException("No fue posible obtener el elemento cabeza: La cola está vacía (tamaño actual: 0).");`,
      `    }`,
      `    return this.inicio.info;`,
      `}`,
    ],
    labels: {
      START: 1,
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      RETURN_INFO: 5,
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
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      START: 1,
      CLEAR_HEAD: 2,
      RESET_SIZE: 3,
    },
  },
});
