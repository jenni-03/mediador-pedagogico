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
    labels: { IF: 2, ALLOC: 6, CANT0: 7, ASSIGN: 8 }
  },
  insertLast: {
    lines: [
      `/**
  * Método que permite insertar un nuevo elemento en la secuencia.
  * post: Se insertó un elemento en la secuencia.
  * @param elem de tipo T que corresponde al elemento a insertar.
  */`,
      `public void insertar(T elem){`,
      `    if (this.cant >= this.vector.length)`,
      `        System.err.println("No hay más espacio!");`,
      `    else`,
      `        this.vector[this.cant++] = elem;`,
      `}`,
    ],
    labels: { IF: 2, ELSE: 4, ASSIGN: 5 }
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
      `        System.err.println("La secuencia está vacía (tamaño actual: 0), debe crear la secuencia primero.");`,
      `        return null;`,
      `    }`,
      `    if (i < 0 || i >= this.cant) {`,
      `        System.err.println("Posición inválida: se intentó acceder a la posición " + i + `,
      `            ", pero el rango válido es de 0 a " + (this.cant - 1) + `,
      `            ", ya que su tamaño es " + this.getTamanio() + ".");`,
      `        return null;`,
      `    }`,
      `    return this.vector[i];`,
      `}`,
    ],
    labels: { IFCANT: 2, IFPOS: 6, RETURN: 12 }
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
    labels: { IFCANT: 2, UPDATE: 6 }
  },
  delete: {
    lines: [
      `/**
 * Método que permite eliminar un elemento en la secuencia dada su posición.
 * post: Se eliminó un elemento en la secuencia.
 * @param pos Posicion del elemento a eliminar.
 */`,
      `public void eliminarP(int pos){`,
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
    labels: { IFPOS: 2, FOR: 6, REASSING: 7, DELETE: 9, DECREASE: 10 }
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
 * Método que permite vaciar la secuencia.
 * post: La Secuencia se encuentra vacia.
 */`,
      `public void vaciar(){`,
      `    for (int i = 0; i < this.cant; i++) {`,
      `         this.vector[i] = null;`,
      `    }`,
      `    this.cant = 0;`,
      `}`,
    ]
  },
});