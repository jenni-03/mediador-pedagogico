import { OperationCode } from "./typesPseudoCode";

export const getPilaCode = (): Record<string, OperationCode> => ({
  push: {
    lines: [
      `/**
      * Método que permite insertar un elemento en el tope de la pila.
      * post: Se insertó el elemento en el tope de la pila.
      * @param info es de tipo T y corresponde a la información a insertar en la pila.
      */`,
      `public void apilar(T {0}){`,
      `    Nodo<T> nuevoNodo = new Nodo({0});`,
      `    if(this.tope == null) {`,
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
      INC_SIZE: 9,
    },
  },
  pop: {
    lines: [
      `/**
      * Método que permite retirar el elemento tope actual de la pila.
      * post: Se retiró el elemento tope actual de la pila.
      * @return un tipo T que corresponde al valor del elemento retirado.
      */`,
      `public T desapilar(){`,
      `    if(this.tope == null)`,
      `        return null;`,
      `    Nodo<T> x = this.tope;`,
      `    this.tope = this.tope.siguiente;`,
      `    {0}--;`,
      `    if(this.tamanio == 0)`,
      `       this.tope = null;`,
      `    return x.info;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      RETURN_NULL_EMPTY: 3,
      SAVE_TOP: 4,
      ADVANCE_TOP: 5,
      DEC_SIZE: 6,
      STACK_EMPTY: 7,
      TOP_NULL: 8,
      RETURN_VALUE: 9,
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
      * Método que permite obtener el elemento tope actual de la pila.
      * post: Se retornó el elemento tope actual de la pila.
      * @return Elemento tope de la pila.
      */`,
      `public Nodo<T> getTope(){`,
      `    if (this.tope == null) {`,
      `        throw new RuntimeException("No fue posible obtener el elemento tope: No hay elementos en la pila.");`,
      `    }`,
      `    return this.tope;`,
      `}`,
    ],
    labels: {
      START: 1,
      VALIDATE_EMPTY: 2,
      THROW_EMPTY: 3,
      RETURN_TOP: 5,
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
      * Método que permite eliminar todos los elementos de la pila.
      * post: Se eliminó todos los elementos que se encontraban en la pila.
      */`,
      `public void vaciar(){`,
      `    this.tope = null;`,
      `    this.tamanio = 0;`,
      `}`,
    ],
    labels: {
      START: 1,
      CLEAR_TOP: 2,
      RESET_SIZE: 3,
    },
  },
});
