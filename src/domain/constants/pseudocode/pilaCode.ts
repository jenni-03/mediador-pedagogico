import { OperationCode } from "./typesPseudoCode";

export const getPilaCode = (): Record<string, OperationCode> => ({
  push: {
    lines: [
      `/**
  * Método inserta un nuevo elemento en el tope de la pila.
  * @param info Elemento a insertar.
  */`,
      `public void push(T {0}){`,
      `    NodoS<T> nuevoNodo = new NodoS({0});`,
      `    if (this.tope == null) {`,
      `       this.tope = nuevoNodo;`,
      `    } else {`,
      `       nuevoNodo.siguiente = this.tope;`,
      `       this.tope = nuevoNodo;`,
      `    }`,
      `    {1}++;`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      ASSIGN_TOP_EMPTY: 4,
      ELSE_EMPTY: 5,
      LINK_NEW_TO_PREV_TOP: 6,
      ASSIGN_NEW_TOP: 7,
      INC_SIZE: 9
    },
  },
  pop: {
    lines: [
      `/**
  * Método que retira el elemento tope actual de la pila.
  * @return Elemento asociado al nodo retirado.
  * @throws RuntimeException si la pila está vacía.
  */`,
      `public T pop(){`,
      `    if (this.tope == null)`,
      `        throw new RuntimeException("No fue posible desapilar: No hay elementos en la pila.");`,
      `    NodoS<T> x = this.tope;`,
      `    this.tope = this.tope.siguiente;`,
      `    {0}--;`,
      `    return x.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      RETURN_NULL_EMPTY: 3,
      SAVE_TOP: 4,
      ADVANCE_TOP: 5,
      DEC_SIZE: 6,
      RETURN_VALUE: 7
    },
    errorPlans: {
      STACK_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "RETURN_NULL_EMPTY", hold: 600 },
      ],
    },
  },
  getTop: {
    lines: [
      `/**
  * Método que obtiene el elemento tope actual de la pila.
  * @return Elemento tope de la pila.
  */`,
      `public NodoS<T> getTop(){`,
      `    if (this.tope == null) {`,
      `        throw new RuntimeException("No fue posible obtener el elemento tope: No hay elementos en la pila.");`,
      `    }`,
      `    return this.tope;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      RETURN_TOP: 5
    },
    errorPlans: {
      STACK_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_EMPTY", hold: 600 },
      ],
    },
  },
  clean: {
    lines: [
      `/**
  * Método que elimina todos los elementos de la pila.
  */`,
      `public void clean(){`,
      `    this.tope = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      CLEAR_TOP: 2,
      RESET_SIZE: 3
    },
  },
});