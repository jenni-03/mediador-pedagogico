import { OperationCode } from "./typesPseudoCode";

export const getArbolAVLCode = (): OperationCode => ({
  insert: [
    `/**
 * Método que permite insertar un nodo en el árbol AVL.
 * post: Se insertó un nuevo nodo en el árbol AVL.
 * @param nodo es de tipo NodoAVL<T> y corresponde a la raíz del árbol. 
 * @param valor es de tipo T y corresponde al elemento a insertar.
 * @return Raíz del árbol actualizada con el nodo insertado.
 */`,
    `private NodoAVL<T> insertarAVL(NodoAVL<T> nodo, T valor) {`,
    `    if (nodo == null) return new NodoAVL<T>(valor);`,
    `    int compara = ((Comparable)nodo.getInfo()).compareTo(valor);`,
    `    if (compara < 0) {`,
    `        nodo.setIzq(this.insertarAVL(nodo.getIzq(), valor));`,
    `    }`,
    `    else if (compara > 0) {`,
    `        nodo.setDer(this.insertarAVL(nodo.getDer(), valor));`,
    `    }`,
    `    else {`,
    `        System.out.println("No fue posible insertar el nodo: El elemento ya existe en el árbol.");`,
    `    }`,
    `    nodo.recomputarAltura();`,
    `    int bf = nodo.getBalance();`,
    `    // Caso LL`,
    `    if (bf > 1 && ((Comparable)valor).compareTo(nodo.getIzq().getInfo()) < 0) {`,
    `        return this.rotacionDerecha(nodo);`,
    `    }`,
    `    // Caso RR`,
    `    if (bf < -1 && ((Comparable)valor).compareTo(nodo.getDer().getInfo()) > 0)`,
    `        return this.rotacionIzquierda(nodo);`,
    `    // Caso LR`,
    `    if (bf > 1 && ((Comparable)valor).compareTo(nodo.getIzq().getInfo()) > 0) {`,
    `        nodo.setIzq(this.rotacionIzquierda(nodo.getIzq()));`,
    `        return this.rotacionDerecha(nodo);`,
    `    }`,
    `    // Caso RL`,
    `    if (bf < -1 && ((Comparable)valor).compareTo(nodo.getDer().getInfo()) < 0) {`,
    `        nodo.setDer(this.rotacionDerecha(nodo.getDer()));`,
    `        return this.rotacionIzquierda(nodo);`,
    `    }`,
    `    return nodo;`,
    `}`,
  ],
  delete: [
    `/**
 * Método que permite eliminar un nodo del árbol AVL dado su valor.
 * post: Se eliminó el nodo del árbol AVL.
 * @param nodo es de tipo NodoAVL<T> y corresponde a la raíz del árbol.
 * @param valor es de tipo T y corresponde al valor del nodo a eliminar.
 * @return Raíz del árbol actualizada sin el nodo eliminado.
 */`,
    `private NodoAVL<T> eliminarAVL(NodoAVL<T> nodo, T valor) {`,
    `    if (nodo == null) return null;`,
    `    int compara = ((Comparable)nodo.getInfo()).compareTo(valor);`,
    `    if (compara < 0) nodo.setIzq(this.eliminarAVL(nodo.getIzq(), valor));`,
    `    else if (compara > 0) nodo.setDer(this.eliminarAVL(nodo.getDer(), valor));`,
    `    else {`,
    `       if (nodo.getIzq() == null) return nodo.getDer();`,
    `       if (nodo.getDer() == null) return nodo.getIzq();`,
    `       NodoAVL<T> succ = this.minValorNodo(nodo.getDer());`,
    `       nodo.setInfo(succ.getInfo());`,
    `       nodo.setDer(this.eliminarAVL(nodo.getDer(), succ.getInfo()));`,
    `       return nodo;`,
    `    }`,
    `    nodo.recomputarAltura();`,
    `    int bf = nodo.getBalance();`,
    `    // Caso LL`,
    `    if (bf > 1 && ((Comparable)valor).compareTo(nodo.getIzq().getInfo()) < 0) {`,
    `        return this.rotacionDerecha(nodo);`,
    `    }`,
    `    // Caso RR`,
    `    if (bf < -1 && ((Comparable)valor).compareTo(nodo.getDer().getInfo()) > 0)`,
    `        return this.rotacionIzquierda(nodo);`,
    `    // Caso LR`,
    `    if (bf > 1 && ((Comparable)valor).compareTo(nodo.getIzq().getInfo()) > 0) {`,
    `        nodo.setIzq(this.rotacionIzquierda(nodo.getIzq()));`,
    `        return this.rotacionDerecha(nodo);`,
    `    }`,
    `    // Caso RL`,
    `    if (bf < -1 && ((Comparable)valor).compareTo(nodo.getDer().getInfo()) < 0) {`,
    `        nodo.setDer(this.rotacionDerecha(nodo.getDer()));`,
    `        return this.rotacionIzquierda(nodo);`,
    `    }`,
    `    return nodo;`,
    `}`,
  ],
  search: [
    `/**
 * Método que permite buscar un elemento especifico en el árbol AVL.
 * post: Se retornó un booleano que indica si el elemento especificado fue encontrado en el árbol.
 * @param root es de tipo NodoAVL<T> y corresponde a la raíz del árbol.
 * @param valor es de tipo T y corresponde al elemento a buscar.
 * @return Booleano que indica si el elemento fue encontrado.
 */`,
    `private boolean buscarAVL(NodoAVL<T> root, T valor) {`,
    `    if (root == null) return false;`,
    `    int compara = ((Comparable)root.getInfo()).compareTo(valor);`,
    `    if (compara < 0) return this.buscarAVL(root.getIzq(), valor);`,
    `    else if (compara > 0) return this.buscarAVL(root.getDer(), valor);`,
    `    else return true;`,
    `}`,
  ],
  getInOrder: [
    `/**
 * Método que permite obtener el recorrido inOrden del árbol AVL.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoAVL<T> y corresponde a la ráiz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
    `private void inOrden(NodoAVL<T> root, ListaCD<T> nodos) {`,
    `    if (root == null) return;`,
    `    this.inOrden(root.getIzq(), nodos);`,
    `    nodos.insertarAlFinal(root.getInfo());`,
    `    this.inOrden(root.getDer(), nodos);`,
    `}`,
  ],
  getPreOrder: [
    `/**
 * Método que permite obtener el recorrido preOrden del árbol AVL.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoAVL<T> y corresponde a la raíz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
    `private void preOrden(NodoAVL<T> root, ListaCD<T> nodos) {`,
    `    if (root == null) return;`,
    `    nodos.insertarAlFinal(root.getInfo());`,
    `    this.preOrden(root.getIzq(), nodos);`,
    `    this.preOrden(root.getDer(), nodos);`,
    `}`,
  ],
  getPostOrder: [
    `/**
 * Método que permite obtener el recorrido postOrden del árbol AVL.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoAVL<T> y corresponde a la raíz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
    `private void postOrden(NodoAVL<T> root, ListaCD<T> nodos) {`,
    `    if (root == null) return;`,
    `    this.postOrden(root.getIzq(), nodos);`,
    `    this.postOrden(root.getDer(), nodos);`,
    `    nodos.insertarAlFinal(root.getInfo());`,
    `}`,
  ],
  getLevelOrder: [
    `/**
 * Método que permite obtener el recorrido por niveles del árbol AVL.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoAVL<T> y corresponde a la raíz del árbol.
 * @param nodos es una lista T para almacenar los datos del árbol.
 */`,
    `public ListaCD<T> getNiveles(NodoAVL<T> root) {`,
    `    ListaCD<T> nodos = new ListaCD<T>();`,
    `    if (this.esVacio()) {`,
    `        Cola<NodoAVL<T>> cola = new Cola<NodoAVL<T>>();`,
    `        cola.encolar(this.getRaiz());`,
    `        NodoAVL<T> x;`,
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
 * Método que permite eliminar todos los nodos del árbol AVL.
 * post: Se eliminó todos los nodos en el árbol.
 */`,
    `public void vaciar(){`,
    `    this.setRaiz(null);`,
    `}`
  ],
});
