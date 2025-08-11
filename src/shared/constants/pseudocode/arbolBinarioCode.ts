import { OperationCode } from "./typesPseudoCode";

export const getArbolBinarioCode = (): OperationCode => ({
  insertLeft: [
            `/**
 * Método que permite insertar un nodo al inicio de la lista.
 * post: Se insertó un nuevo nodo al inicio de la lista.
 * @param info es de tipo T y corresponde a la información a almacenar en la lista.
 */`,
            `public void insertarAlInicio(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `        this.cabeza = nuevoNodo;`,
            `    } else {`,
            `        nuevoNodo.setSig(this.cabeza);`,
            `        this.cabeza = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertRight: [
            `/**
 * Método que permite insertar un nodo al final de la lista.
 * post: Se insertó un nuevo nodo al final de la lista.
 * @param info es de tipo T y corresponde a la información a almacenar en la lista. 
 */`,
            `public void insertarAlFinal(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `        this.cabeza = nuevoNodo;`,
            `    } else {`,
            `        Nodo<T>nodoUlt = this.getPos(this.tamanio - 1);`,
            `        nodoUlt.setSig(nuevoNodo);`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        delete: [
            `/**
 * Método que permite remover el nodo inicial de la lista.
 * post: Se eliminó el nodo inicial de la lista.
 */`,
            `public void removerAlInicio(){`,
            `    if (this.esVacia()) {`,
            `        System.err.println("Lista vacía!");`,
            `        return;`,
            `    }`,
            `    this.cabeza = this.cabeza.getSig();`,
            `    this.tamanio--;`,
            `}`
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
        getInOrder: [
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
        getPreOrder: [
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
        getPostOrder: [
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
        getLevelOrder: [
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
            `}`
        ]
});
