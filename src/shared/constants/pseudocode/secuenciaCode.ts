import { OperationCode } from "./typesPseudoCode";

export const getSecuenciaCode = (): OperationCode => ({
  create: [
    `/**
 * Constructor con parámetros de la clase secuencia.
 * post: Se construye una secuencia vacia.
 * @param n de tipo integer que corresponde a la capacidad de la secuencia. 
 */`,
    `public Secuencia(int {0}){`,
    `    if ({0} <= 0) {`,
    `        throw new RuntimeException("Tamaño de secuencia no válido!");`,
    `        return;`,
    `    }`,
    `    Object r[] = new Object[{0}];`,
    `    // Cantidad de elementos en el vector, se inicializa en 0`,
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
    `public void insertar(T {0}){`,
    `    if ({1} >= {2})`,
    `        throw new RuntimeException("No hay más espacio!");`,
    `    else`,
    `        this.vector[{1}++] = {0};`,
    `}`,
  ],
  get: [
    `/**
 * Método que permite obtener un elemento dentro de la secuencia dada su posición.
 * post: Se ha retornado el elemento de la secuencia en la posición especificada.
 * @param i es de tipo integer y corresponde a la posición del elemento en la secuencia.
 * @return un tipo T correspondiente al valor del elemento, o null si la posición es inválida.
 */`,
    `public T get(int {0}) {`,
    `    if ({1} == 0) {`,
    `        throw new RuntimeException("La secuencia está vacía (tamaño actual: 0), debe crear la secuencia primero.");`,
    `        return null;`,
    `    }`,
    `    if ({0} < 0 || {0} >= {1}) {`,
    `        throw new RuntimeException("Posición inválida: se intentó acceder a la posición " + {0} + `,
    `            ", pero el rango válido es de 0 a " + ({1} - 1) + `,
    `            ", ya que su tamaño es " + {1} + ".");`,
    `        return null;`,
    `    }`,
    `    return this.vector[{0}];`,
    `}`,
  ],

  set: [
    `/**
 * Método que permite cambiar un elemento de la secuencia en la posición indicada por otro.
 * post: Se ha modificado un elemento de la secuencia.
 * @param i es de tipo integer y corresponde a la posición del elemento en la secuencia que se va a cambiar.
 * @param un tipo T correspondiente al nuevo elemento que reemplazará al elemento indicado.
 */`,
    `public void set(int {0}, T {1}){`,
    `    if ({0} < 0 || {0} >= {2}) {`,
    `        throw new RuntimeException("Indíce fuera de rango!");`,
    `        return;`,
    `    }`,
    `    this.vector[{0}] = {1};`,
    `}`,
  ],
  delete: [
    `/**
 * Método que permite eliminar un elemento en la secuencia dada su posición.
 * post: Se eliminó un elemento en la secuencia.
 * @param pos Posicion del elemento a eliminar.
 */`,
    `public void eliminarP(int {0}){`,
    `    if ({1} == 0) {`,
    `        throw new RuntimeException("La secuencia está vacía (tamaño actual: 0).");`,
    `        return;`,
    `    }`,
    `    if ({0} < 0 || {0} >= {1}) {`,
    `        throw new RuntimeException("Indíce fuera de rango!");`,
    `        return;`,
    `    }`,
    `    boolean e = false;`,
    `    for (int i=0, j=0; i < {1}; i++) {`,
    `         if (i != {0}) {`,
    `             this.vector[j] = vector[i];`,
    `             j++;`,
    `         } else {`,
    `             e = true;`,
    `             this.vector[j] = null;`,
    `         }`,
    `    }`,
    `    if (e)`,
    `       {1}--;`,
    `}`,
  ],
  search: [
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
  clean: [
    `/**
 * Método que permite vaciar la secuencia.
 * post: La Secuencia se encuentra vacia.
 */`,
    `public void vaciar(){`,
    `    for (int i = 0; i < this.tamanio; i++) {`,
    `         this.vector[i] = null;`,
    `    }`,
    `    this.tamanio = 0;`,
    `}`,
  ],
});
