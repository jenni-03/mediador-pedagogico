import { OperationCode } from "./typesPseudoCode";

export const getListaSimplementeEnlazadaCode = (): OperationCode => ({
  insertFirst: [
    `/**
 * Método que inserta un nuevo elemento al inicio de la lista simple.
 * @param valor Elemento a insertar.
 * @return Nodo inicial insertado.
 * @throws IllegalStateException si la cantidad máxima de nodos ya fue alcanzada.
 */`,
    `public NodoS<T> insertarAlInicio(T {0}) {`,
    `    if ({1} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `    } else {`,
    `        nuevoNodo.setSiguiente(this.cabeza);`,
    `        this.cabeza = nuevoNodo;`,
    `    }`,
    `    {1}++;`,
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
    `public NodoS<T> insertarAlFinal(T {0}) {`,
    `    if ({1} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
    `    if (this.esVacia()) {`,
    `        this.cabeza = nuevoNodo;`,
    `    } else {`,
    `        NodoS<T> ultimoNodo = this.getPos({1} - 1);`,
    `        ultimoNodo.setSiguiente(nuevoNodo);`,
    `    }`,
    `    {1}++;`,
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
    `public NodoS<T> insertarEnPosicion(T {0}, int {1}) {`,
    `    if ({1} < 0 || {1} > {1}) {`,
    `        throw new IndexOutOfBoundsException("No fue posible insertar el nodo en la posición especificada: La posición " + {1} + " no existe dentro de la Lista Simple.");`,
    `    }`,
    `    if ({1} >= this.MAX_TAMANIO) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo en la posición especificada: Cantidad de nodos máxima alcanzada (tamaño máximo: " + this.MAX_TAMANIO + ").");`,
    `    }`,
    `    if ({1} == 0) {`,
    `        return this.insertarAlInicio({0});`,
    `    }`,
    `    if ({1} == {1}) {`,
    `        return this.insertarAlFinal({0});`,
    `    }`,
    `    NodoS<T> nuevoNodo = new NodoS<>({0});`,
    `    NodoS<T> nodoAnt = this.getPos({1} - 1);`,
    `    nuevoNodo.setSiguiente(nodoAnt.getSiguiente());`,
    `    nodoAnt.setSiguiente(nuevoNodo);`,
    `    {1}++;`,
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
    `        throw new RuntimeException("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    NodoS<T> nodoEliminado = this.cabeza;`,
    `    this.cabeza = this.cabeza.getSiguiente();`,
    `    {0}--;`,
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
    `        throw new RuntimeException("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    NodoS<T> nodoEliminado;`,
    `    if ({0} == 1) {`,
    `        nodoEliminado = this.cabeza;`,
    `        this.cabeza = null;`,
    `    } else {`,
    `        NodoS<T> nodoAnt = this.getPos({0} - 2);`,
    `        nodoEliminado = nodoAnt.getSiguiente();`,
    `        nodoAnt.setSiguiente(null);`,
    `    }`,
    `    {0}--;`,
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
    `public NodoS<T> removerEnPosición(int {0}) {`,
    `    if (this.esVacia()) {`,
    `        throw new RuntimeException("No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0).");`,
    `    }`,
    `    if ({0} < 0 || {0} >= {1}) {`,
    `        throw new IndexOutOfBoundsException("No fue posible eliminar el nodo en la posición especificada: La posición " + {0} + " no existe dentro de la Lista Simple.");`,
    `    }`,
    `    if ({0} == 0) {`,
    `        return this.removeFirst();`,
    `    }`,
    `    if ({0} == {1} - 1) {`,
    `        return this.removeLast();`,
    `    }`,
    `    NodoS<T> nodoAnt = this.getPos({0} - 1);`,
    `    NodoS<T> nodoEliminado = nodoAnt.getSiguiente();`,
    `    nodoAnt.setSiguiente(nodoEliminado.getSiguiente());`,
    `    {1}--;`,
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
    `public boolean search(T {0}) {`,
    `    Nodo<T> nodoActual = this.cabeza;`,
    `    while(nodoActual) {`,
    `        if (nodoActual.getValor().equals({0})) {`,
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
