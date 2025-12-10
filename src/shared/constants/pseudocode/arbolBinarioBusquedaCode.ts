import { OperationCode } from "./typesPseudoCode";

export const getArbolBinarioBusquedaCode = (): Record<string, OperationCode> => ({
  insert: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en el árbol binario de búsqueda.
 * @param valor Elemento a insertar.
 * @return true si el elemento fue insertado, false si ya existía.
 */`,
      `public boolean insert(T {0}) {`,
      `    this.insertado = false;`,
      `    this.raiz = this.insert(this.raiz, {0});`,
      `    if (this.insertado) {`,
      `        this.tamanio++;`,
      `    }`,
      `    return this.insertado;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que inserta un nuevo nodo en el subárbol dado
 * a partir del elemento proporcionado y aplicando las reglas del árbol binario de búsqueda.
 * @param r Nodo raíz del subárbol actual. 
 * @param valor Elemento a insertar.
 * @return Nodo raíz del subárbol actualizado tras la inserción.
 */`,
      `private NodoBin<T> insert(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        r = new NodoBin<>({0});`,
      `        this.insertado = true;`,
      `        return r;`,
      `    }`,
      `    int cmp = {0}.compareTo(r.info);`,
      `    if (cmp < 0) {`,
      `        r.izquierdo = this.insert(r.izquierdo, {0});`,
      `    } else if (cmp > 0) {`,
      `        r.derecho = this.insert(r.derecho, {0});`,
      `    } else {`,
      `        this.insertado = false;`,
      `    }`,
      `    return r;`,
      `}`,
    ],
    labels: {
      RESET_INSERTED_FLAG: 2,
      CALL_RECURSIVE_INSERT: 3,
      IF_INSERTED: 4,
      INC_SIZE: 5,
      RETURN_RESULT: 7,

      // Método insert(NodoBin<T> r, T valor)
      IF_NULL_NODE: 13,
      CREATE_LEAF_NODE: 14,
      SET_INSERTED_TRUE: 15,
      RETURN_LEAF: 16,
      DECLARE_CMP: 18,
      IF_CMP_LT_ZERO: 19,
      CALL_LEFT_SUBTREE: 20,
      ELSE_IF_CMP_GT_ZERO: 21,
      CALL_RIGHT_SUBTREE: 22,
      ELSE_DUPLICATE: 23,
      MARK_NOT_INSERTED: 24,
      RETURN_NODE: 26
    }
  },
  delete: {
    lines: [
      `/**
 * Método que elimina el elemento especificado del árbol binario de búsqueda.
 * @param info Elemento a eliminar.
 * @return true si el elemento fue eliminado, false si no existe en el árbol.
 * @throws RuntimeException si el árbol está vacío.
 */`,
      `public boolean delete(T {0}) {`,
      `    if (this.raiz == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");`,
      `    }`,
      `    this.eliminado = false;`,
      `    this.raiz = this.delete(this.raiz, {0});`,
      `    if (this.eliminado) {`,
      `        this.tamanio--;`,
      `    }`,
      `    return this.eliminado;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que elimina el nodo correspondiente al elemento proporcionado en el subárbol dado, 
 * aplicando las reglas del árbol binario de búsqueda.
 * @param root Nodo raíz del subárbol actual.
 * @param valor Elemento a eliminar.
 * @return Nodo raíz del subárbol actualizado tras la eliminación.
 */`,
      `private NodoBin<T> delete(NodoBin<T> r, T {0}){`,
      `    if (r == null) {`,
      `        return null;`,
      `    }`,
      `    int cmp = {0}.compareTo(r.info);`,
      `    if (cmp < 0) {`,
      `        r.izquierdo = this.delete(r.izquierdo, {0});`,
      `    } else if (cmp > 0) {`,
      `        r.derecho = this.delete(r.derecho, {0});`,
      `    } else {`,
      `        this.eliminado = true;`,
      `        if (r.izquierdo == null) {`,
      `            return r.derecho;`,
      `        }`,
      `        if (r.derecho == null) {`,
      `            return r.izquierdo;`,
      `        }`,
      `        NodoBin<T> sucPadre = r;`,
      `        NodoBin<T> suc = r.derecho;`,
      `        while (suc.izquierdo != null) {`,
      `            sucPadre = suc;`,
      `            suc = suc.izquierdo;`,
      `        }`,
      `        r.info = suc.info;`,
      `        if (sucPadre.izquierdo == suc) {`,
      `            sucPadre.izquierdo = suc.derecho;`,
      `        }`,
      `        else {`,
      `            sucPadre.derecho = suc.derecho;`,
      `        }`,
      `    }`,
      `    return r;`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      RESET_DELETED_FLAG: 5,
      CALL_RECURSIVE_DELETE: 6,
      IF_DELETED: 7,
      DEC_SIZE: 8,
      RETURN_RESULT: 10,

      // Método eliminar(NodoBin<T> r, T info)
      IF_NULL_NODE: 16,
      RETURN_NULL: 17,
      DECLARE_CMP: 19,
      IF_CMP_LT_ZERO: 20,
      CALL_LEFT_SUBTREE: 21,
      ELSE_IF_CMP_GT_ZERO: 22,
      CALL_RIGHT_SUBTREE: 23,
      ELSE_FOUND: 24,
      SET_DELETED_TRUE: 25,
      IF_NO_LEFT_CHILD: 26,
      RETURN_RIGHT_CHILD: 27,
      IF_NO_RIGHT_CHILD: 29,
      RETURN_LEFT_CHILD: 30,
      DECLARE_SUCC_PARENT: 32,
      DECLARE_SUCC_NODE: 33,
      WHILE_TRAVERSAL: 34,
      SET_SUCC_PARENT: 35,
      SET_SUCC_NODE: 36,
      UPDATE_NODE_INFO: 38,
      IF_SUCC_IS_LEFT_CHILD: 39,
      SET_LEFT_CHILD: 40,
      ELSE_SET_RIGHT_CHILD: 42,
      SET_RIGHT_CHILD: 43,
      RETURN_NODE: 46
    },
    errorPlans: {
      DELETE_EMPTY: [
        { lineLabel: "VALIDATE_EMPTY", hold: 600 },
        { lineLabel: "THROW_IF_EMPTY", hold: 600 },
      ]
    }
  },
  search: {
    lines: [
      `/**
 * Método que comprueba la existencia del elemento especificado en el árbol binario de búsqueda.
 * @param info Elemento a buscar.
 * @return true si el elemento existe en el árbol, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    return this.search(this.raiz, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que busca el nodo correspondiente al elemento proporcionado en el subárbol dado, 
 * aplicando las reglas del árbol binario de búsqueda.
 * @param r Nodo raíz del subárbol actual.
 * @param info Elemento a buscar.
 * @return true si el elemento existe en el subárbol, false en caso contrario.
 */`,
      `private boolean search(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        return false;`,
      `    }`,
      `    int cmp = {0}.compareTo(r.info);`,
      `    if (cmp < 0) {`,
      `        return this.search(r.izquierdo, {0});`,
      `    } else if (cmp > 0) {`,
      `        return this.search(r.derecho, {0});`,
      `    } else {`,
      `        return true;`,
      `    }`,
      `}`,
    ],
    labels: {
      CALL_RECURSIVE_SEARCH: 2,

      // Método search(NodoBin<T> r, T info)
      IF_NULL_NODE: 8,
      RETURN_FALSE: 9,
      DECLARE_CMP: 11,
      IF_CMP_LT_ZERO: 12,
      CALL_LEFT_SUBTREE: 13,
      ELSE_IF_CMP_GT_ZERO: 14,
      CALL_RIGHT_SUBTREE: 15,
      ELSE_FOUND: 16,
      RETURN_TRUE: 17
    }
  },
  getInOrder: {
    lines: [
      `/**
 * Método que realiza el recorrido inorden del árbol binario de búsqueda.
 * @return Lista con la información de los nodos del árbol en secuencia inorden.
 */`,
      `public ListaCD<T> getInOrder() {`,
      `    ListaCD<T> nodos = new ListaCD<>();`,
      `    this.getInOrder(this.raiz, nodos);`,
      `    return nodos;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza el recorrido inorden en el subárbol dado.
 * @param r Nodo raíz del subárbol actual.
 * @param nodos Lista donde se almacenan la información de los nodos visitados en secuencia inorden.
 */`,
      `private void getInOrder(NodoBin<T> r, ListaCD<T> nodos) {`,
      `    if (r == null) {`,
      `        return;`,
      `    }`,
      `    this.getInOrder(r.izquierdo, nodos);`,
      `    nodos.insertLast(r.info);`,
      `    this.getInOrder(r.derecho, nodos);`,
      `}`,
    ],
    labels: {
      DECLARE_LIST: 2,
      CALL_RECURSIVE_INORDER: 3,
      RETURN_LIST: 4,

      // Método getInOrder(NodoBin<T> r, ListaCD<T> nodos)
      IF_NULL_NODE: 10,
      RETURN_NULL: 11,
      CALL_LEFT: 13,
      VISIT_NODE: 14,
      CALL_RIGHT: 15
    }
  },
  getPreOrder: {
    lines: [
      `/**
 * Método que realiza el recorrido preorden del árbol binario de búsqueda.
 * @return Lista con la información de los nodos del árbol en secuencia preorden.
 */`,
      `public ListaCD<T> getPreOrder() {`,
      `    ListaCD<T> nodos = new ListaCD<>();`,
      `    this.getPreOrder(this.raiz, nodos);`,
      `    return nodos;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza el recorrido preorden en el subárbol dado.
 * @param r Nodo raíz del subárbol actual.
 * @param nodos Lista donde se almacenan la información de los nodos visitados en secuencia preorden.
 */`,
      `private void getPreOrder(NodoBin<T> r, ListaCD<T> nodos) {`,
      `    if (r == null) {`,
      `        return;`,
      `    }`,
      `    nodos.insertLast(r.info);`,
      `    this.getPreOrder(root.izquierdo, nodos);`,
      `    this.getPreOrder(root.derecho, nodos);`,
      `}`,
    ],
    labels: {
      DECLARE_LIST: 2,
      CALL_RECURSIVE_INORDER: 3,
      RETURN_LIST: 4,

      // Método getPreOrder(NodoBin<T> r, ListaCD<T> nodos)
      IF_NULL_NODE: 10,
      RETURN_NULL: 11,
      VISIT_NODE: 13,
      CALL_LEFT: 14,
      CALL_RIGHT: 15
    }
  },
  getPostOrder: {
    lines: [
      `/**
 * Método que realiza el recorrido postorden del árbol binario de búsqueda.
 * @return Lista con la información de los nodos del árbol en secuencia postorden.
 */`,
      `public ListaCD<T> getPostOrder() {`,
      `    ListaCD<T> nodos = new ListaCD<>();`,
      `    this.getPostOrder(this.raiz, nodos);`,
      `    return nodos;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza el recorrido postorden en el subárbol dado.
 * @param r Nodo raíz del subárbol actual.
 * @param nodos Lista donde se almacenan la información de los nodos visitados en secuencia postorden.
 */`,
      `private void getPostOrder(NodoBin<T> r, ListaCD<T> nodos) {`,
      `    if (r == null) {`,
      `        return;`,
      `    }`,
      `    this.getPostOrder(root.izquierdo, nodos);`,
      `    this.getPostOrder(root.derecho, nodos);`,
      `    nodos.insertLast(root.info);`,
      `}`,
    ],
    labels: {
      DECLARE_LIST: 2,
      CALL_RECURSIVE_INORDER: 3,
      RETURN_LIST: 4,

      // Método getPostOrder(NodoBin<T> r, ListaCD<T> nodos)
      IF_NULL_NODE: 10,
      RETURN_NULL: 11,
      CALL_LEFT: 13,
      CALL_RIGHT: 14,
      VISIT_NODE: 15,
    }
  },
  getLevelOrder: {
    lines: [
      `/**
 * Método que realiza el recorrido por niveles del árbol binario de búsqueda.
 * @return Lista con la información de los nodos del árbol por niveles.
 */`,
      `public ListaCD<T> getLevelOrder() {`,
      `    ListaCD<T> nodos = new ListaCD<>();`,
      `    if (this.raiz != null) {`,
      `        Cola<NodoBin<T>> cola = new Cola<>();`,
      `        cola.enqueue(this.raiz);`,
      `        \n`,
      `        while (!cola.isEmpty()) {`,
      `             NodoBin<T> nodo = cola.dequeue();`,
      `             nodos.insertLast(nodo.info);`,
      `             if (nodo.izquierdo != null) {`,
      `                 cola.enqueue(nodo.izquierdo);`,
      `             }`,
      `             if (nodo.derecho != null) {`,
      `                 cola.enqueue(nodo.derecho);`,
      `             }`,
      `        }`,
      `    }`,
      `    return nodos;`,
      `}`,
    ],
    labels: {
      DECLARE_LIST: 2,
      VALIDATE_EMPTY: 3,
      DECLARE_QUEUE: 4,
      ENQUEUE_ROOT: 5,
      WHILE_CHECK: 7,
      DEQUEUE_NODE: 8,
      VISIT_NODE: 9,
      IF_LEFT_NOT_NULL: 10,
      ENQUEUE_LEFT: 11,
      IF_RIGHT_NOT_NULL: 13,
      ENQUEUE_RIGHT: 14,
      RETURN_LIST: 18
    }
  },
  clean: {
    lines: [
      `/**
 * Método que elimina todos los nodos del árbol binario de búsqueda.
 */`,
      `public void clean(){`,
      `    this.raiz = null;`,
      `}`,
    ],
    labels: {
      CLEAR_ROOT: 2
    }
  }
});