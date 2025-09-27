import { OperationCode } from "./typesPseudoCode";

export const getListaCircularDoblementeEnlazadaCode = (): OperationCode => ({
 insertFirst: [
            `/**
 * Método que permite insertar un nodo al inicio de la lista.
 * post: Se insertó un nuevo nodo al inicio de la lista.
 * @param info es de tipo T y corresponde a la información a almacenar en la lista.
 */`,
            `public void insertarAlInicio(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `        this.cabeza = nuevoNodo;`,
            `        this.cola = nuevoNodo;`,
            `        nuevoNodo.setSig(nuevoNodo);`,
            `    } else {`,
            `        nuevoNodo.setSig(this.cabeza);`,
            `        this.cola.setSig(nuevoNodo);`,
            `        this.cabeza = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Método que permite insertar un nodo al final de la lista.
 * post: Se insertó un nuevo nodo al final de la lista.
 * @param info es de tipo T y corresponde la información a almacenar en la lista. 
 */`,
            `public void insertarAlFinal(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `        this.cabeza = nuevoNodo;`,
            `        this.cola = nuevoNodo;`,
            `        nuevoNodo.setSig(nuevoNodo);`,
            `    } else {`,
            `        this.cola.setSig(nuevoNodo);`,
            `        nuevoNodo.setSig(this.cabeza);`,
            `        this.cola = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertAt: [
            `/**
 * Método que permite insertar un nodo en una posición especifica de la lista.
 * post: Se insertó un nuevo nodo en la posición especificada.
 * @param info es de tipo T y corresponde a la información a almacenar en la lista.
 * @param pos es de tipo integer y corresponde a la posición de inserción.
 */`,
            `public void insertarEnPosicion(T info, int pos){`,
            `    if (pos < 0 || pos > this.tamanio) {`,
            `        System.err.println("Posición de inserción no válida!");`,
            `        return;`,
            `    }`,
            `    if (pos == 0) {`,
            `        this.insertarAlInicio(info);`,
            `    }`,
            `    if (pos == this.tamanio) {`,
            `        this.insertarAlFinal(info);`,
            `    }`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    Nodo<T>nodoAnt = this.getPos(pos - 1);`,
            `    nuevoNodo.setSig(nodoAnt.getSig());`,
            `    nodoAnt.setSig(nuevoNodo);`,
            `    this.tamanio++;`,
            `}`
        ],
        removeFirst: [
            `/**
 * Método que permite remover el nodo inicial de la lista.
 * post: Se eliminó el nodo inicial de la lista.
 */`,
            `public void removerAlInicio(){`,
            `    if (this.esVacia()) {`,
            `        System.err.println("Lista vacía!");`,
            `        return;`,
            `    }`,
            `    if (this.cabeza == this.cola) {`,
            `        this.cabeza = null;`,
            `        this.cola = null;`,
            `    } else {`,
            `        this.cabeza = this.cabeza.getSig();`,
            `        this.cola.setSig(this.cabeza);`,
            `    }`,
            `    this.tamanio--;`,
            `}`
        ],
        removeLast: [
            `/**
 * Método que permite remover el nodo final de la lista.
 * post: Se eliminó el nodo final de la lista.
 */`,
            `public void removerAlFinal(){`,
            `    if (this.esVacia()) {`,
            `        System.err.println("Lista vacía!");`,
            `        return;`,
            `    }`,
            `    if (this.cabeza == this.cola) {`,
            `        this.cabeza = null;`,
            `        this.cola = null;`,
            `    } else {`,
            `        Nodo<T>nodoAnt = this.getPos(this.tamanio - 2);`,
            `        nodoAnt.setSig(this.cabeza);`,
            `        this.cola = nodoAnt;`,
            `    }`,
            `    this.tamanio--;`,
            `}`
        ],
        removeAt: [
            `/**
 * Método que permite eliminar un nodo dada su posición.
 * post: Se eliminó el nodo en la posicion especificada.
 * @param pos es de tipo integer y corresponde a la posición del nodo a eliminar.
 */`,
            `public void removerEnPosición(int pos){`,
            `    if (this.esVacia()) {`,
            `        System.err.println("Lista vacía!");`,
            `        return;`,
            `    }`,
            `    if (pos < 0 || pos >= this.tamanio) {`,
            `        System.err.println("Posición de eliminación no válida!");`,
            `        return;`,
            `    }`,
            `    if (pos == 0) {`,
            `        this.removerAlInicio();`,
            `    }`,
            `    if (pos == this.tamanio - 1) {`,
            `        this.removerAlFinal();`,
            `    }`,
            `    Nodo<T>nodoAnt = this.getPos(pos - 1);`,
            `    Nodo<T>nodoEliminado = nodoAnt.getSig();`,
            `    nodoAnt.setSig(nodoEliminado.getSig());`,
            `    this.tamanio--;`,
            `}`
        ],
        search: [
            `/**
 * Método que permite buscar un elemento especifico en la lista.
 * post: Se retorno un booleano que indica si el elemento especificado fue encontrado en la lista.
 * @param elem es de tipo T y corresponde al elemento a buscar.
 * @return True o false si el elemento fue encontrado.
 */`,
            `public boolean search(T elem) {`,
            `    if (this.esVacia()) {`,
            `        return false;`,
            `    }`,
            `    Nodo<T> nodoActual = this.cabeza;`,
            `    do {`,
            `        if (nodoActual.getValor().equals(elem)) {`,
            `            return true;`,
            `        }`,
            `        nodoActual = nodoActual.getSig();`,
            `    }`,
            `    while(nodoActual != this.cabeza);`,
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
            `    this.cola = null;`,
            `    this.tamanio = 0;`,
            `}`
        ]
});
