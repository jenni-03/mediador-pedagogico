import { OperationCode } from "./typesPseudoCode";

export const getListaSimplementeEnlazadaCode = (): OperationCode => ({
  insertFirst: [
    `/**
 * Método que inserta un nuevo elemento al inicio de la lista simple.
 * @param valor Elemento a insertar.
 * @return Nodo inicial insertado.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoS<T> insertarAlInicio(T valor) {`,
    `    if (this.tamanio >= this.MAX_TAMANIO) {`,
    `        throw new IllegalStateException("No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>(valor);`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `    } else {`,
    `        nuevoNodo.setSiguiente(this.cabeza);`,
    `        this.cabeza = nuevoNodo;`,
    `    }`,
    `    this.tamanio++;`,
    `    return nuevoNodo;`,
    `}`,
  ],
  insertLast: [
    `/**
 * Método que inserta un nuevo elemento al final de la lista simple.
 * @param valor Elemento a insertar.
 * @return Nodo final insertado.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoS<T> insertarAlFinal(T valor) {`,
    `    if (this.tamanio >= this.MAX_TAMANIO) {`,
    `        throw new IllegalStateException("No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>(valor);`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `    } else {`,
    `        NodoS<T> ultimoNodo = this.getPos(this.tamanio - 1);`,
    `        ultimoNodo.setSiguiente(nuevoNodo);`,
    `    }`,
    `    this.tamanio++;`,
    `    return nuevoNodo;`,
    `}`,
  ],
  insertAt: [
    `/**
 * Método que inserta un nuevo elemento en una posición específica de la lista simple.
 * @param valor Elemento a insertar.
 * @param posicion Posición en la que se desea insertar el elemento.
 * @return Nodo insertado en la posición especificada.
 * @throws IndexOutOfBoundsException si la posición no existe en la lista.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoS<T> insertarEnPosicion(T valor, int posicion) {`,
    `    if (posicion < 0 || posicion > this.tamanio) {`,
    `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición especificada: La posición " + posicion + " no existe dentro de la Lista Simple.");`,
    `    }`,
    `    if (this.tamanio >= this.MAX_TAMANIO) {`,
    `        throw new IllegalStateException("No fue posible insertar el nodo en la posición especificada: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    if (posicion == 0) {`,
    `        return this.insertarAlInicio(valor);`,
    `    }`,
    `    if (posicion == this.tamanio) {`,
    `        return this.insertarAlFinal(valor);`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>(valor);`,
    `    NodoS<T> nodoAnt = this.getPos(posicion - 1);`,
    `    nuevoNodo.setSiguiente(nodoAnt.getSiguiente());`,
    `    nodoAnt.setSiguiente(nuevoNodo);`,
    `    this.tamanio++;`,
    `    return nuevoNodo;`,
    `}`,
  ],
  removeFirst: [
    `/**
 * Método que elimina el primer nodo de la lista simple.
 * @return Nodo inicial eliminado.
 * @throws IllegalStateException si la lista está vacía.
 */`,
    `public NodoS<T> removerAlInicio() {`,
    `    if (this.esVacia()) {`,
    `        throw new IllegalStateException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    NodoS<T> nodoEliminado = this.cabeza;`,
    `    this.cabeza = this.cabeza.getSiguiente();`,
    `    this.tamanio--;`,
    `    return nodoEliminado;`,
    `}`,
  ],
  removeLast: [
    `/**
 * Método que elimina el último nodo de la lista simple.
 * @return Nodo final eliminado.
 * @throws IllegalStateException si la lista está vacía.
 */`,
    `public NodoS<T> removerAlFinal() {`,
    `    if (this.esVacia()) {`,
    `        throw new IllegalStateException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    NodoS<T> nodoEliminado;`,
    `    if (this.tamanio == 1) {`,
    `        nodoEliminado = this.cabeza;`,
    `        this.cabeza = null;`,
    `    } else {`,
    `        NodoS<T> nodoAnt = this.getPos(this.tamanio - 2);`,
    `        nodoEliminado = nodoAnt.getSiguiente();`,
    `        nodoAnt.setSiguiente(null);`,
    `    }`,
    `    this.tamanio--;`,
    `    return nodoEliminado;`,
    `}`,
  ],
  removeAt: [
    `/**
 * Método que elimina un nodo en una posición específica de la lista simple.
 * @param posicion Posición del nodo a eliminar.
 * @return Nodo eliminado.
 * @throws IllegalStateException si la lista está vacía.
 * @throws IndexOutOfBoundsException si la posición es inválida.
 */`,
    `public NodoS<T> removerEnPosición(int posicion) {`,
    `    if (this.esVacia()) {`,
    `        throw new IllegalStateException("No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    if (posicion < 0 || posicion >= this.tamanio) {`,
    `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición especificada: La posición " + posicion + " no existe dentro de la Lista Simple.");`,
    `    }`,
    `    if (posicion == 0) {`,
    `        return this.removeFirst();`,
    `    }`,
    `    if (posicion == this.tamanio - 1) {`,
    `        return this.removeLast();`,
    `    }`,
    `    NodoS<T> nodoAnt = this.getPos(posicion - 1);`,
    `    NodoS<T> nodoEliminado = nodoAnt.getSiguiente();`,
    `    nodoAnt.setSiguiente(nodoEliminado.getSiguiente());`,
    `    this.tamanio--;`,
    `    return nodoEliminado;`,
    `}`,
  ],
  search: [
    `/**
 * Método que permite buscar un elemento especifico en la lista.
 * post: Se retornó un booleano que indica si el elemento especificado fue encontrado en la lista.
 * @param elem es de tipo T y corresponde al elemento a buscar.
 * @return True o false si el elemento fue encontrado.
 */`,
    `public boolean search(T elem) {`,
    `    Nodo<T> nodoActual = this.cabeza;`,
    `    while(nodoActual) {`,
    `        if (nodoActual.getValor().equals(elem)) {`,
    `            return true;`,
    `        }`,
    `        nodoActual = nodoActual.getSig();`,
    `    }`,
    `    return false;`,
    `}`,
  ],
  clean: [
    `/**
 * Método que permite eliminar todos los nodos de la lista.
 * post: Se eliminó todos los nodos en la lista.
 */`,
    `public void vaciar(){`,
    `    this.cabeza = null;`,
    `    this.tamanio = 0;`,
    `}`,
  ],
});
