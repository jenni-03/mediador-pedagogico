import { OperationCode } from "./typesPseudoCode";

export const getListaDoblementeEnlazadaCode = (): OperationCode => ({
  insertFirst: [
    `/**
 * Método que inserta un nuevo elemento al inicio de la lista doble.
 * @param valor Elemento a insertar.
 * @return Nodo inicial insertado.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoD<T> insertarAlInicio(T {0}) {`,
    `    if ({1} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `        this.cola = nuevoNodo;`,
    `    } else {`,
    `        nuevoNodo.setSiguiente(this.cabeza);`,
    `        this.cabeza.setAnterior(nuevoNodo);`,
    `        this.cabeza = nuevoNodo;`,
    `    }`,
    `    {1}++;`,
    `    return nuevoNodo;`,
    `}`,
  ],

  insertLast: [
    `/**
 * Método que inserta un nuevo elemento al final de la lista doble.
 * @param valor Elemento a insertar.
 * @return Nodo final insertado.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoD<T> insertarAlFinal(T {0}) {`,
    `    if ({1} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `        this.cola = nuevoNodo;`,
    `    } else {`,
    `        this.cola.setSiguiente(nuevoNodo);`,
    `        nuevoNodo.setAnterior(this.cola);`,
    `        this.cola = nuevoNodo;`,
    `    }`,
    `    {1}++;`,
    `    return nuevoNodo;`,
    `}`,
  ],

  insertAt: [
    `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista doble.
 * @param valor Elemento a insertar.
 * @param posicion Posición en la que se desea insertar el elemento.
 * @return Nodo insertado en la posición especificada.
 * @throws IndexOutOfBoundsException si la posición es inválida.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoD<T> insertarEnPosicion(T {0}, int {1}) {`,
    `    if ({1} < 0 || {1} > {2}) {`,
    `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición especificada: La posición " + {1} + " no existe dentro de la Lista Doble.");`,
    `    }`,
    `    if ({2} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo en la posición especificada: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    if ({1} == 0) {`,
    `        return this.insertarAlInicio({0});`,
    `    }`,
    `    if ({1} == {2}) {`,
    `        return this.insertarAlFinal({0});`,
    `    }`,
    `    NodoD<T> nuevoNodo = new NodoD<>({0});`,
    `    NodoD<T> nodoAnt = this.getPos({1} - 1);`,
    `    nuevoNodo.setSiguiente(nodoAnt.getSiguiente());`,
    `    nuevoNodo.setAnterior(nodoAnt);`,
    `    nodoAnt.getSiguiente().setAnterior(nuevoNodo);`,
    `    nodoAnt.setSiguiente(nuevoNodo);`,
    `    {2}++;`,
    `    return nuevoNodo;`,
    `}`,
  ],

  removeFirst: [
    `/**
 * Método que elimina el primer nodo de la lista doble.
 * @return Nodo inicial eliminado.
 * @throws IllegalStateException si la lista está vacía.
 */`,
    `public NodoD<T> eliminarAlInicio() {`,
    `    if (this.esVacia()) {`,
    `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    NodoD<T> nodoEliminado = this.cabeza;`,
    `    this.cabeza = this.cabeza.getSiguiente();`,
    `    if (this.cabeza != null) {`,
    `        this.cabeza.setAnterior(null);`,
    `    } else {`,
    `        this.cola = null;`,
    `    }`,
    `    {0}--;`,
    `    return nodoEliminado;`,
    `}`,
  ],

  removeLast: [
    `/**
 * Método que elimina el último nodo de la lista doble.
 * @return Nodo final eliminado.
 */`,
    `public NodoD<T> eliminarAlFinal() {`,
    `    if (this.esVacia())`,
    `        throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
    ``,
    `    NodoD<T> nodoEliminado = this.cola;`,
    `    this.cola = nodoEliminado.getAnterior();`,
    ``,
    `    if (this.cola != null) {`,
    `        this.cola.setSiguiente(null);`,
    `    } else {`,
    `        this.cabeza = null;`,
    `    }`,
    ``,
    `    {0}--;`,
    `    return nodoEliminado;`,
    `}`,
  ],

  removeAt: [
    `/**
 * Método que elimina un nodo en una posición específica de la lista doble.
 * @param posicion Posición del nodo a eliminar.
 * @return Nodo eliminado.
 */`,
    `public NodoD<T> eliminarEnPosicion(int {0}) {`,
    `    if (this.esVacia())`,
    `        throw new RuntimeException("No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0).");`,
    ``,
    `    if ({0} < 0 || {0} >= {1}) {`,
    `        throw new RuntimeException("No fue posible eliminar el nodo en la posición especificada: La posición " + {0} + " no existe dentro de la Lista Doble.");`,
    `    }`,
    ``,
    `    if ({0} == 0) {`,
    `        return this.eliminarAlInicio();`,
    `    }`,
    ``,
    `    if ({0} == {1} - 1) {`,
    `        return this.eliminarAlFinal();`,
    `    }`,
    ``,
    `    NodoD<T> nodoEliminado = this.getPos({0});`,
    ``,
    `    nodoEliminado.getAnterior().setSiguiente(nodoEliminado.getSiguiente());`,
    `    nodoEliminado.getSiguiente().setAnterior(nodoEliminado.getAnterior());`,
    ``,
    `    {1}--;`,
    `    return nodoEliminado;`,
    `}`,
  ],

  search: [
    `/**
 * Método que busca un nodo en la lista doble.
 * @param valor Valor a buscar.
 * @return true si se encuentra el nodo, false en caso contrario.
 */`,
    `public boolean buscar(T {0}) {`,
    `    NodoD<T> nodoActual = this.cabeza;`,
    ``,
    `    while (nodoActual != null) {`,
    `        if (this.equals(nodoActual.getValor(), {0})) {`,
    `            return true;`,
    `        }`,
    `        nodoActual = nodoActual.getSiguiente();`,
    `    }`,
    ``,
    `    return false;`,
    `}`,
  ],

  clean: [
    `/**
 * Método que permite eliminar todos los nodos de la lista.
 * post: Se eliminaron todos los nodos en la lista.
 */`,
    `public void vaciar() {`,
    `    this.cabeza = null;`,
    `    this.cola = null;`,
    `    this.tamanio = 0;`,
    `}`,
  ],
});
