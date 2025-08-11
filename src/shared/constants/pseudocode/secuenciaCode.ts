import { OperationCode } from "./typesPseudoCode";

export const getSecuenciaCode = (): OperationCode => ({
  create: [
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
  insertLast: [
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
  get: [
    `/**
 * Método que permite obtener un elemento dentro de la secuecia dada su posición.
 * post: Se ha retornado el elemento de la secuencia en la posición especificada.
 * @param i es de tipo integer y corresponde a la posición del elemento en la secuencia.
 * @return un tipo T correspondiente al valor del elemento.
 */`,
    `public T get(int i){`,
    `    if (i < 0 || i > this.cant) {`,
    `        System.err.println("Indíce fuera de rango!");`,
    `        return null;`,
    `    }`,
    `    return this.vector[i];`,
    `}`,
  ],
  set: [
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
  delete: [
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
    `    boolean e = false;`,
    `    for (int i=0, j=0; i < this.cant; i++) {`,
    `         if (i != pos) {`,
    `             this.vector[j] = vector[i];`,
    `             j++;`,
    `         } else {`,
    `             e = true;`,
    `             this.vector[j] = null;`,
    `         }`,
    `    }`,
    `    if (e)`,
    `       this.cant--;`,
    `}`,
  ],
  search: [
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
  clean: [
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
  ],
});
