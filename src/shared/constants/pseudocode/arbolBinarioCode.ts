import { OperationCode } from "./typesPseudoCode";

export const getArbolBinarioCode = (): OperationCode => ({
    insertLeft: [
        `/**
 * Método que permite insertar un nodo como hijo izquierdo del nodo especificado.
 * post: Se insertó un nuevo nodo como hijo izquierdo.
 * @param padre es de tipo T y corresponde a la información del padre del nodo a insertar. 
 * @param hijo es de tipo T y corresponde a la información del nodo a insertar.
 * @return Booleano que indica si el elemento pudo ser insertado o no.
 */`,
        `public boolean insertarHijoIzq(T padre, T hijo){`,
        `    if (this.esVacio()) {`,
        `        this.setRaiz(new NodoBin<T>(hijo));`,
        `        return true;`,
        `    }`,
        `    NodoBin<T> nodoPadre = this.get(padre);`,
        `    if (nodoPadre != null) {`,
        `        if (nodoPadre.getIzq() == null) {`,
        `            nodoPadre.setIzq(new NodoBin<T>(hijo));`,
        `            return true;`,
        `        }`,
        `        return false;`,
        `    }`,
        `    return false;`,
        `}`
    ],
    insertRight: [
        `/**
 * Método que permite insertar un nodo como hijo derecho del nodo especificado.
 * post: Se insertó un nuevo nodo como hijo derecho.
 * @param padre es de tipo T y corresponde a la información del padre del nodo a insertar. 
 * @param hijo es de tipo T y corresponde a la información del nodo a insertar.
 * @return Booleano que indica si el elemento pudo ser insertado o no.
 */`,
        `public boolean insertarHijoDer(T padre, T hijo){`,
        `    if (this.esVacio()) {`,
        `        this.setRaiz(new NodoBin<T>(hijo));`,
        `        return true;`,
        `    }`,
        `    NodoBin<T> nodoPadre = this.get(padre);`,
        `    if (nodoPadre != null) {`,
        `        if (nodoPadre.getDer() == null) {`,
        `            nodoPadre.setDer(new NodoBin<T>(hijo));`,
        `            return true;`,
        `        }`,
        `        return false;`,
        `    }`,
        `    return false;`,
        `}`
    ],
    delete: [
        `/**
 * Método que permite eliminar un nodo del árbol binario dada su información.
 * post: Se eliminó el nodo del árbol binario. 
 * @param info es de tipo T y corresponde a la información del nodo a eliminar.
 * @return Booleano que indica si el elemento pudo ser eliminado o no.
 */`,
        `public boolean eliminar(T info){`,
        `    if (this.esVacio()) {`,
        `        return false;`,
        `    }`,
        `    if (this.getRaiz().getInfo().equals(info)) {`,
        `        return this.eliminarRaiz();`,
        `    }`,
        `    NodoBin<T> nodoPadre = this.getPadre(info);`,
        `    if (nodoPadre == null) return false;`,
        `    NodoBin<T> nodo = nodoPadre.getIzq();`,
        `    if (nodo == null || (nodo != null && !nodo.getInfo().equals(info))) {`,
        `        nodo = nodoPadre.getDer();`,
        `    }`,
        `    NodoBin<T> izq = nodo.getIzq();`,
        `    NodoBin<T> der = nodo.getDer();`,
        `    if (this.esHoja(nodo)) {`,
        `        this.reemplazarHijo(nodoPadre, nodo, null);`,
        `        return true;`,
        `    }`,
        `    if (izq == null || der == null) {`,
        `        NodoBin<T> unico = izq != null ? izq : der;`,
        `        this.reemplazarHijo(nodoPadre, nodo, unico);`,
        `        return true;`,
        `    }`,
        `    NodoBin<T> succPadre = nodo;`,
        `    NodoBin<T> succ = der;`,
        `    while (succ.getIzq() != null) {`,
        `        succPadre = succ;`,
        `        succ = succ.getIzq();`,
        `    }`,
        `    nodo.setInfo(succ.getInfo());`,
        `    this.reemplazarHijo(succPadre, succ, succ.getDer());`,
        `    return true;`,
        `}`
    ],
    search: [
        `/**
 * Método que permite buscar un elemento especifico en el árbol binario.
 * post: Se retornó un booleano que indica si el elemento especificado fue encontrado en el árbol.
 * @param root es de tipo NodoBin<T> y corresponde a la ráiz del árbol.
 * @param info es de tipo T y corresponde al elemento a buscar.
 * @return Booleano que indica si el elemento fue encontrado.
 */`,
        `private boolean buscar(NodoBin<T> root, T info) {`,
        `    if (root == null) return false;`,
        `    if (root.getInfo().equals(info)) {`,
        `        return true;`,
        `    }`,
        `    return this.buscar(root.getIzq(), info) || this.buscar(root.getDer(), info);`,
        `}`,
    ],
    getInOrder: [
        `/**
 * Método que permite obtener el recorrido inOrden del árbol binario.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la ráiz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
        `private void inOrden(NodoBin<T> root, ListaCD<T> nodos) {`,
        `    if (root == null) return;`,
        `    this.inOrden(root.getIzq(), nodos);`,
        `    nodos.insertarAlFinal(root.getInfo());`,
        `    this.inOrden(root.getDer(), nodos);`,
        `}`,
    ],
    getPreOrder: [
        `/**
 * Método que permite obtener el recorrido preOrden del árbol binario.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la ráiz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
        `private void preOrden(NodoBin<T> root, ListaCD<T> nodos) {`,
        `    if (root == null) return;`,
        `    nodos.insertarAlFinal(root.getInfo());`,
        `    this.preOrden(root.getIzq(), nodos);`,
        `    this.preOrden(root.getDer(), nodos);`,
        `}`,
    ],
    getPostOrder: [
        `/**
 * Método que permite obtener el recorrido postOrden del árbol binario.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la ráiz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
        `private void postOrden(NodoBin<T> root, ListaCD<T> nodos) {`,
        `    if (root == null) return;`,
        `    this.postOrden(root.getIzq(), nodos);`,
        `    this.postOrden(root.getDer(), nodos);`,
        `    nodos.insertarAlFinal(root.getInfo());`,
        `}`,
    ],
    getLevelOrder: [
        `/**
 * Método que permite obtener el recorrido por niveles del árbol binario.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la ráiz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
        `public ListaCD<T> getNiveles(NodoBin<T> root) {`,
        `    ListaCD<T> nodos = new ListaCD<T>();`,
        `    if (this.esVacio()) {`,
        `        Cola<NodoBin<T>> cola = new Cola<NodoBin<T>>();`,
        `        cola.encolar(this.getRaiz());`,
        `        NodoBin<T> x;`,
        `        while (!cola.esVacia()) {`,
        `             x = cola.decolar();`,
        `             nodos.insertarAlFinal(x);`,
        `             if (x.getIzq() != null ) cola.encolar(x.getIzq());`,
        `             if (x.getDer() != null ) cola.encolar(x.getDer());`,
        `        }`,
        `    }`,
        `    return nodos;`,
        `}`,
    ],
    clean: [
        `/**
 * Método que permite eliminar todos los nodos del árbol binario.
 * post: Se eliminó todos los nodos en el árbol.
 */`,
        `public void vaciar(){`,
        `    this.setRaiz(null);`,
        `}`
    ]
});
