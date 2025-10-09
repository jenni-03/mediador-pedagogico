import { OperationCode } from "./typesPseudoCode";

export const getArbolBinarioBusquedaCode = (): OperationCode => ({
  insert: [
    `/**
 * Método que permite insertar un nodo en el árbol binario de búsqueda.
 * post: Se insertó un nuevo nodo en el árbol binario de búsqueda.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol. 
 * @param valor es de tipo T y corresponde al elemento a insertar.
 * @return Raíz del árbol actualizada con el nodo insertado.
 */`,
    `private NodoBin<T> insertarABB(NodoBin<T> root, T valor){`,
    `    if (root == null) return new NodoBin<T>(valor);`,
    `    int compara = ((Comparable)root.getInfo()).compareTo(valor);`,
    `    if (compara < 0) {`,
    `        root.setIzq(this.insertarABB(root.getIzq(), valor));`,
    `    }`,
    `    else if (compara > 0) {`,
    `        root.setDer(this.insertarABB(root.getDer(), valor));`,
    `    }`,
    `    else {`,
    `        System.out.println("No fue posible insertar el nodo: El elemento ya existe en el árbol.");`,
    `    }`,
    `    return root;`,
    `}`,
  ],
  delete: [
    `/**
 * Método que permite eliminar un nodo del árbol binario de búsqueda dado su valor.
 * post: Se eliminó el nodo del árbol binario.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
 * @param valor es de tipo T y corresponde al valor del nodo a eliminar.
 * @return Raíz del árbol actualizada sin el nodo eliminado.
 */`,
    `private NodoBin<T> eliminarABB(NodoBin<T> root, T valor){`,
    `    if (root == null) {`,
    `        return null;`,
    `    }`,
    `    int compara = ((Comparable)root.getInfo()).compareTo(valor);`,
    `    if (compara < 0) root.setIzq(this.eliminarABB(root.getIzq(), valor));`,
    `    else if (compara > 0) root.setDer(this.eliminarABB(root.getDer(), valor));`,
    `    else {`,
    `       if (root.getIzq() == null) return root.getDer();`,
    `       if (root.getDer() == null) return root.getIzq();`,
    `       NodoBin<T> succ = this.minValorNodo(root.getDer());`,
    `       root.setInfo(succ.getInfo());`,
    `       root.setDer(this.eliminarABB(root.getDer(), succ.getInfo()));`,
    `       return root;`,
    `    }`,
    `}`,
  ],
  search: [
    `/**
 * Método que permite buscar un elemento especifico en el árbol binario de búsqueda.
 * post: Se retornó un booleano que indica si el elemento especificado fue encontrado en el árbol.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
 * @param valor es de tipo T y corresponde al elemento a buscar.
 * @return Booleano que indica si el elemento fue encontrado.
 */`,
    `private boolean buscarABB(NodoBin<T> root, T valor) {`,
    `    if (root == null) {`,
    `        return false;`,
    `    }`,
    `    int compara = ((Comparable)root.getInfo()).compareTo(valor);`,
    `    if (compara < 0) return this.buscarABB(root.getIzq(), valor);`,
    `    else if (compara > 0) return this.buscarABB(root.getDer(), valor);`,
    `    else return true;`,
    `}`,
  ],
  getInOrder: [
    `/**
 * Método que permite obtener el recorrido inOrden del árbol binario de búsqueda.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
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
 * Método que permite obtener el recorrido preOrden del árbol binario de búsqueda.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
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
 * Método que permite obtener el recorrido postOrden del árbol binario de búsqueda.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
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
 * Método que permite obtener el recorrido por niveles del árbol binario de búsqueda.
 * post: Se retornó una lista de los elementos del árbol en el orden dado por el recorrido.
 * @param root es de tipo NodoBin<T> y corresponde a la raíz del árbol.
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
 * Método que permite eliminar todos los nodos del árbol binario de búsqueda.
 * post: Se eliminó todos los nodos en el árbol.
 */`,
    `public void vaciar(){`,
    `    this.setRaiz(null);`,
    `}`,
  ],
});
