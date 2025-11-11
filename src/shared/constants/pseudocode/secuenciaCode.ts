import { OperationCode } from "./typesPseudoCode";

export const getSecuenciaCode = (): Record<string, OperationCode> => ({
  create: {
    lines: [
      `/**
 * Constructor que inicializa la secuencia con la capacidad indicada.
 * @param n Capacidad máxima de la secuencia.
 * @throws RuntimeException si la capacidad definida es menor o igual a 0.
 */`,
      `public Secuencia(int {0}){`,
      `    if ({0} <= 0) {`,
      `        throw new RuntimeException("Capacidad de secuencia no válida!");`,
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
  * Método que inserta un nuevo elemento al final de la secuencia.
  * @param elem Elemento a insertar.
  * @throws RuntimeException si la secuencia ha alcanzado su capacidad máxima.
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
  * Método que obtiene el elemento de la secuencia en la posición especificada.
  * @param i Índice del elemento en la secuencia.
  * @return Elemento en la posición indicada.
  * @throws RuntimeException si la secuencia está vacía.
  * @throws RuntimeException si la posición es inválida (menor que 0 o mayor/igual al tamaño actual).
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
 * Método que reemplaza el elemento de la secuencia en la posición indicada por un nuevo valor.
 * @param i Índice del elemento en la secuencia que se va a reemplazar.
 * @param elem Nuevo elemento que reemplazará al existente.
 * @throws RuntimeException si la posición es inválida (menor que 0 o mayor/igual al tamaño actual).
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
 * Método que elimina el elemento de la secuencia en la posición especificada.
 * @param pos Índice del elemento a eliminar.
 * @throws RuntimeException si la secuencia está vacía.
 * @throws RuntimeException si la posición es inválida (menor que 0 o mayor/igual al tamaño actual).
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
 * Método que comprueba si un elemento existe en la secuencia.
 * @param elem Elemento a buscar.
 * @return true si el elemento existe en la secuencia, false en caso contrario.
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
 * Método que reinicia la secuencia, eliminando todos sus elementos.
 */`,
      `public void clean(){`,
      `    this.cant = 0;`,
      `    this.vector = null;`,
      `}`,
    ],
    labels: { CLEAN_VECTOR: 3, CLEAN_CANT: 2 }
  },
});