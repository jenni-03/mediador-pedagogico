import { OperationCode } from "./typesPseudoCode";

export const getSecuenciaCode = (): Record<string, OperationCode> => ({
  create: {
    lines: [
      `/**
  * Constructor con parámetros de la clase secuencia.
  * post: Se construye una secuencia vacia.
  * @param n de tipo integer que corresponde a la capacidad de la secuencia. 
  */`,
      `public Secuencia(int n){`,
      `    if (n <= 0) {`,
      `        System.err.println("Tamaño de secuencia no válido!");`,
      `        return;`,
      `    }`,
      `    Object r[] = new Object[n];`,
      `    cant = 0;`,
      `    this.vector = (T[])r;`,
      `}`,
    ],
    labels: { IF_CANT: 2, PRINT_INVALID: 3, RETURN: 4, ALLOC: 6, CANT0: 7, ASSIGN: 8 },
    errorPlans: {
      INVALID_CAPACITY: [
        { lineLabel: "IF_CANT", hold: 700 },
        { lineLabel: "PRINT_INVALID", hold: 900 },
        { lineLabel: "RETURN", hold: 600 }
      ]
    }
  },
  insertLast: {
    lines: [
      `/**
  * Método que permite insertar un nuevo elemento en la secuencia.
  * post: Se insertó un elemento en la secuencia.
  * @param elem de tipo T que corresponde al elemento a insertar.
  */`,
      `public void insertLast(T elem){`,
      `    if (this.cant >= this.vector.length)`,
      `        System.err.println("No hay más espacio!");`,
      `    else`,
      `        this.vector[this.cant++] = elem;`,
      `}`,
    ],
    labels: { IF_FULL: 2, PRINT_FULL: 3, ELSE: 4, ASSIGN: 5 },
    errorPlans: {
      CAPACITY_EXCEEDED: [
        { lineLabel: "IF_FULL", hold: 700 },
        { lineLabel: "PRINT_FULL", hold: 900 }
      ]
    }
  },
  get: {
    lines: [
      `/**
  * Método que permite obtener un elemento dentro de la secuencia dada su posición.
  * post: Se ha retornado el elemento de la secuencia en la posición especificada.
  * @param i es de tipo integer y corresponde a la posición del elemento en la secuencia.
  * @return un tipo T correspondiente al valor del elemento, o null si la posición es inválida.
  */`,
      `public T get(int i) {`,
      `    if (this.cant == 0) {`,
      `        System.err.println("La secuencia está vacía (tamaño actual: 0).");`,
      `        return null;`,
      `    }`,
      `    if (i < 0 || i >= this.cant) {`,
      `        System.err.println("Indíce fuera de rango!")`,
      `        return null;`,
      `    }`,
      `    return this.vector[i];`,
      `}`,
    ],
    labels: { IF_EMPTY: 2, PRINT_EMPTY: 3, RETURN_EMPTY: 4, IF_RANGE: 6, PRINT_RANGE: 7, RETURN_RANGE: 8, RETURN_ELEM: 10 },
    errorPlans: {
      GET_EMPTY: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "PRINT_EMPTY", hold: 900 },
        { lineLabel: "RETURN_EMPTY", hold: 600 }
      ],
      GET_OUT_OF_RANGE: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_RANGE", hold: 900 },
        { lineLabel: "RETURN_RANGE", hold: 600 }
      ]
    }
  },
  set: {
    lines: [
      `/**
 * Método que permite cambiar un elemento de la secuencia en la posición indicada por otro.
 * post: Se ha modificado un elemento de la secuencia.
 * @param i es de tipo integer y corresponde a la posición del elemento en la secuencia que se va a cambiar.
 * @param un tipo T correspondiente al nuevo elemento que reemplazará al elemento indicado.
 */`,
      `public void set(int i, T nuevo){`,
      `    if (i < 0 || i > this.cant) {`,
      `        System.err.println("Indíce fuera de rango!");`,
      `        return;`,
      `    }`,
      `    this.vector[i] = nuevo;`,
      `}`,
    ],
    labels: { IF_RANGE: 2, PRINT_ERR: 3, RETURN: 4, UPDATE: 6 },
    errorPlans: {
      SET_OUT_OF_RANGE: [
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_ERR", hold: 900 },
        { lineLabel: "RETURN", hold: 600 }
      ]
    }
  },
  delete: {
    lines: [
      `/**
 * Método que permite eliminar un elemento en la secuencia dada su posición.
 * post: Se eliminó un elemento en la secuencia.
 * @param pos Posicion del elemento a eliminar.
 */`,
      `public void delete(int pos){`,
      `    if (this.cant == 0) {`,
      `        System.err.println("La secuencia está vacía (tamaño actual: 0).");`,
      `        return;`,
      `    }`,
      `    if (pos < 0 || pos > this.cant) {`,
      `        System.err.println("Indíce fuera de rango!");`,
      `        return;`,
      `    }`,
      `    for (int i=0; i < this.cant - 1; i++) {`,
      `         this.vector[i] = this.vector[i + 1];`,
      `    }`,
      `    this.vector[this.cant - 1] = null`,
      `    this.cant--;`,
      `}`,
    ],
    labels: { IF_EMPTY: 2, PRINT_EMPTY: 3, RETURN_EMPTY: 4, IF_RANGE: 6, PRINT_RANGE: 7, RETURN_RANGE: 8, FOR: 10, REASSING: 11, DELETE: 13, DECREASE: 14 },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "PRINT_EMPTY", hold: 900 },
        { lineLabel: "RETURN_EMPTY", hold: 600 },
      ],
      DELETE_OUT_OF_RANGE: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_RANGE", hold: 900 },
        { lineLabel: "RETURN_RANGE", hold: 600 }
      ]
    }
  },
  search: {
    lines: [
      `/**
 * Método que permite comprobar si existe un elemento en la secuencia.
 * post: Se ha retornado true si el elemento se encuentra en la secuencia.
 * @param elem es de tipo T y corresponde al elemento a buscar.
 * @return un tipo boolean, retorna true si el objeto existe y false en caso contrario.
 */`,
      `public boolean search(T elem){`,
      `    for (int i = 0; i < this.cant; i++) {`,
      `         if (this.vector[i].equals(elem)) {`,
      `             return true;`,
      `         }`,
      `    }`,
      `    return false;`,
      `}`,
    ],
    labels: { FOR: 2, IF: 3, RETURN_TRUE: 4, RETURN_FALSE: 7 }
  },
  clean: {
    lines: [
      `/**
 * Método que permite eliminar la secuencia actual.
 * post: Se eliminó la secuencia.
 */`,
      `public void clean(){`,
      `    this.cant = 0;`,
      `    this.vector = null;`,
      `}`,
    ],
    labels: { CLEAN_VECTOR: 2, CLEAN_CANT: 3 }
  },
});