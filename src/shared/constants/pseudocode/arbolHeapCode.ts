import { OperationCode } from "./typesPseudoCode";

export const getArbolHeapCode = (): OperationCode => ({
  insert: [
    `/**
 * Inserta un elemento en el heap manteniendo las propiedades del heap.
 * @param elemento Elemento a insertar
 * @return El nodo insertado
 */`,
    `public NodoBin<T> insertar(T elemento) {`,
    `    if (getTamanio() >= MAX_NODOS) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo: Límite máximo de nodos alcanzado (" + MAX_NODOS + ").");`,
    `    }`,
    `    if (esta(elemento)) {`,
    `        throw new RuntimeException("No fue posible insertar el nodo: El elemento ya existe en el heap.");`,
    `    }`,
    `    NodoBin<T> nuevoNodo = new NodoBin<>(elemento);`,
    `    if (esVacio()) {`,
    `        setRaiz(nuevoNodo);`,
    `        setTamanio(1);`,
    `        return nuevoNodo;`,
    `    }`,
    `    NodoBin<T> padre = encontrarPadreParaInsercion();`,
    `    if (padre.getIzq() == null) {`,
    `        padre.setIzq(nuevoNodo);`,
    `    } else {`,
    `        padre.setDer(nuevoNodo);`,
    `    }`,
    `    setTamanio(getTamanio() + 1);`,
    `    heapifyUp(nuevoNodo, padre);`,
    `    return nuevoNodo;`,
    `}`,
  ],
  deleteR: [
    `/**
 * Elimina y retorna el elemento raíz del heap (máximo en MAX heap, mínimo en MIN heap).
 * @return El elemento eliminado
 */`,
    `public T extraerRaiz() {`,
    `    if (esVacio()) {`,
    `        throw new RuntimeException("No fue posible extraer la raíz: El heap está vacío.");`,
    `    }`,
    `    NodoBin<T> raiz = getRaiz();`,
    `    T elementoRaiz = raiz.getInfo();`,
    `    if (getTamanio() == 1) {`,
    `        setRaiz(null);`,
    `        setTamanio(0);`,
    `        return elementoRaiz;`,
    `    }`,
    `    NodoBin<T> ultimoNodo = encontrarUltimoNodo();`,
    `    NodoBin<T> ultimoPadre = getPadre(ultimoNodo.getInfo());`,
    `    raiz.setInfo(ultimoNodo.getInfo());`,
    `    if (ultimoPadre != null) {`,
    `        if (ultimoPadre.getDer() == ultimoNodo) {`,
    `            ultimoPadre.setDer(null);`,
    `        } else {`,
    `            ultimoPadre.setIzq(null);`,
    `        }`,
    `    }`,
    `    setTamanio(getTamanio() - 1);`,
    `    heapifyDown(raiz);`,
    `    return elementoRaiz;`,
    `}`,
  ],
  delete: [
    `/**
 * Elimina un elemento específico del heap manteniendo las propiedades.
 * @param elemento Elemento a eliminar
 * @return true si el elemento fue eliminado, false si no se encontró
 */`,
    `public boolean eliminarElemento(T elemento) {`,
    `    if (esVacio()) {`,
    `        return false;`,
    `    }`,
    `    NodoBin<T> nodoAEliminar = buscarNodo(elemento);`,
    `    if (nodoAEliminar == null) {`,
    `        return false;`,
    `    }`,
    `    if (nodoAEliminar == getRaiz()) {`,
    `        extraerRaiz();`,
    `        return true;`,
    `    }`,
    `    if (getTamanio() == 1) {`,
    `        setRaiz(null);`,
    `        setTamanio(0);`,
    `        return true;`,
    `    }`,
    `    NodoBin<T> ultimoNodo = encontrarUltimoNodo();`,
    `    NodoBin<T> ultimoPadre = getPadre(ultimoNodo.getInfo());`,
    `    nodoAEliminar.setInfo(ultimoNodo.getInfo());`,
    `    if (ultimoPadre != null) {`,
    `        if (ultimoPadre.getDer() == ultimoNodo) {`,
    `            ultimoPadre.setDer(null);`,
    `        } else {`,
    `            ultimoPadre.setIzq(null);`,
    `        }`,
    `    }`,
    `    setTamanio(getTamanio() - 1);`,
    `    NodoBin<T> padre = getPadre(nodoAEliminar.getInfo());`,
    `    if (padre != null && debeIntercambiar(nodoAEliminar.getInfo(), padre.getInfo())) {`,
    `        heapifyUp(nodoAEliminar, padre);`,
    `    } else {`,
    `        heapifyDown(nodoAEliminar);`,
    `    }`,
    `    return true;`,
    `}`,
  ],
  search: [
    `/**
 * Busca un elemento en el heap.
 * @param elemento Elemento a buscar
 * @return true si el elemento existe en el heap, false en caso contrario
 */`,
    `public boolean buscar(T elemento) {`,
    `    return esta(elemento);`,
    `}`,
  ],
  peek: [
    `/**
 * Retorna el elemento raíz sin eliminarlo.
 * @return El elemento en la raíz del heap, o null si está vacío
 */`,
    `public T peek() {`,
    `    return esVacio() ? null : getRaiz().getInfo();`,
    `}`,
  ],
  getLevelOrder: [
    `/**
 * Método que realiza el recorrido por niveles del heap.
 * @return Lista de nodos por niveles.
 */`,
    `public List<NodoBin<T>> getNodosPorNiveles() {`,
    `    return super.getNodosPorNiveles();`,
    `}`,
  ],
  clean: [
    `/**
 * Método que vacía el heap.
 */`,
    `public void vaciar() {`,
    `    super.vaciar();`,
    `}`,
  ],
});
