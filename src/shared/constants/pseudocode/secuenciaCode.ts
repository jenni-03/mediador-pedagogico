import { OperationCode } from "./typesPseudoCode";

export const getSecuenciaCode = (): Record<string, OperationCode> => ({
  create: {
    lines: [
      `/**
 * Constructor con parámetros de la clase secuencia.
 * post: Se construye una secuencia vacia.
 * @param n de tipo integer que corresponde a la capacidad de la secuencia. 
 */`,
      `public Secuencia(int {0}){`,
      `    if ({0} <= 0) {`,
      `        throw new RuntimeException("Tamaño de secuencia no válido!");`,
      `    }`,
      `    Object r[] = new Object[{0}];`,
      `    cant = 0;`,
      `    this.vector = (T[])r;`,
      `}`,
    ],
    labels: { IF_CANT: 2, PRINT_INVALID: 3, ALLOC: 5, CANT0: 6, ASSIGN: 7 },
    errorPlans: {
      INVALID_CAPACITY: [
        { lineLabel: "IF_CANT", hold: 700 },
        { lineLabel: "PRINT_INVALID", hold: 900 }
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
      `public void insertLast(T {0}){`,
      `    if ({1} >= {2})`,
      `        throw new RuntimeException("No hay más espacio!");`,
      `    else`,
      `        this.vector[{1}++] = {0};`,
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
      `public T get(int {0}) {`,
      `    if ({1} == 0) {`,
      `        throw new RuntimeException("La secuencia está vacía (tamaño actual: 0).");`,
      `    }`,
      `    if ({0} < 0 || {0} >= {1}) {`,
      `        throw new RuntimeException("Posición de acceso no válida.");`,
      `    }`,
      `    return this.vector[{0}];`,
      `}`,
    ],
    labels: { IF_EMPTY: 2, PRINT_EMPTY: 3, IF_RANGE: 5, PRINT_RANGE: 6, RETURN_ELEM: 8 },
    errorPlans: {
      GET_EMPTY: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "PRINT_EMPTY", hold: 900 }
      ],
      GET_OUT_OF_RANGE: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_RANGE", hold: 900 }
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
      `public void set(int {0}, T {1}){`,
      `    if ({0} < 0 || {0} >= {2}) {`,
      `        throw new RuntimeException("Posición de acceso no válida.");`,
      `    }`,
      `    this.vector[{0}] = {1};`,
      `}`,
    ],
    labels: { IF_RANGE: 2, PRINT_ERR: 3, UPDATE: 5 },
    errorPlans: {
      SET_OUT_OF_RANGE: [
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_ERR", hold: 900 }
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
      `public void delete(int {0}){`,
      `    if ({1} == 0) {`,
      `        throw new RuntimeException("La secuencia está vacía (tamaño actual: 0).");`,
      `    }`,
      `    if ({0} < 0 || {0} >= {1}) {`,
      `        throw new RuntimeException("Posición de acceso no válida.");`,
      `    }`,
      `    for (int i=0; i < {1} - 1; i++) {`,
      `         this.vector[i] = this.vector[i + 1];`,
      `    }`,
      `    this.vector[{1} - 1] = null`,
      `    {1}--;`,
      `}`,
    ],
    labels: { IF_EMPTY: 2, PRINT_EMPTY: 3, IF_RANGE: 5, PRINT_RANGE: 6, FOR: 8, REASSING: 9, DELETE: 11, DECREASE: 12 },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "PRINT_EMPTY", hold: 900 }
      ],
      DELETE_OUT_OF_RANGE: [
        { lineLabel: "IF_EMPTY", hold: 700 },
        { lineLabel: "IF_RANGE", hold: 700 },
        { lineLabel: "PRINT_RANGE", hold: 900 }
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
      `public boolean search(T {0}){`,
      `    for (int i = 0; i < {1}; i++) {`,
      `         if (this.vector[i].equals({0})) {`,
      `             return true;`,
      `         }`,
      `    }`,
      `    return false;`,
      `}`,
    ],
    labels: { FOR: 2, IF: 3, RETURN_TRUE: 4, RETURN_FALSE: 7 },
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
    labels: { CLEAN_VECTOR: 3, CLEAN_CANT: 2 }
  },
});