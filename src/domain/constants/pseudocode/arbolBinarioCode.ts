import { OperationCode } from "./typesPseudoCode";

export const getArbolBinarioCode = (): Record<string, OperationCode> => ({
  insertLeft: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en el árbol binario como hijo izquierdo del elemento padre dado.
 * @param padre Elemento al que se añadirá el hijo.
 * @param hijo Elemento a insertar.
 * @return true si el elemento fue insertado, false si ya existía.
 */`,
      `public boolean insertLeft(T {0}, T {1}) {`,
      `    NodoBin<T> nuevoNodo = new NodoBin<>({1});`,
      `    if (this.raiz == null) {`,
      `        this.raiz = nuevoNodo;`,
      `    } else {`,
      `        NodoBin<T> nodoPadre = this.get({0});`,
      `        if (nodoPadre == null || nodoPadre.izquierdo != null) {`,
      `            return false;`,
      `        }`,
      `        nodoPadre.izquierdo = nuevoNodo;`,
      `    }`,
      `    {2}++;`,
      `    return true;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el nodo correspondiente al elemento proporcionado. 
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(T {0}) {`,
      `    return this.get(this.raiz, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una búsqueda en el subárbol dado para
 * obtener el nodo correspondiente al elemento proporcionado.
 * @param r Nodo raíz del subárbol actual donde se va a buscar.
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        return null;`,
      `    }`,
      `    if (r.info.equals({0})) {`,
      `        return r;`,
      `    }`,
      `    NodoBin<T> resIzq = this.get(r.izquierdo, {0});`,
      `    if (resIzq != null) {`,
      `        return resIzq;`,
      `    }`,
      `    return this.get(r.derecho, {0});`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_ROOT: 4,
      ELSE_EMPTY: 5,
      GET_PARENT_NODE: 6,
      IF_INVALID_PARENT: 7,
      RETURN_FALSE: 8,
      LINK_LEFT_CHILD: 10,
      INC_SIZE: 12,
      RETURN_TRUE: 13,

      // Método get(T info)
      CALL_RECURSIVE_GET: 19,

      // Método get(NodoBin<T> r, T info)
      IF_NULL_NODE: 25,
      RETURN_NULL: 26,
      IF_MATCH_NODE: 28,
      RETURN_NODE: 29,
      SEARCH_LEFT: 31,
      VALIDATE_LEFT_RESULT: 32,
      RETURN_LEFT_RESULT: 33,
      SEARCH_RIGHT: 35
    }
  },
  insertRight: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en el árbol binario como hijo derecho del elemento padre dado.
 * @param padre Elemento al que se añadirá el hijo. 
 * @param hijo Elemento a insertar.
 * @return true si el elemento fue insertado, false si ya existía.
 */`,
      `public boolean insertRight(T {0}, T {1}) {`,
      `    NodoBin<T> nuevoNodo = new NodoBin<>({1});`,
      `    if (this.raiz == null) {`,
      `        this.raiz = nuevoNodo;`,
      `    } else {`,
      `        NodoBin<T> nodoPadre = this.get({0});`,
      `        if (nodoPadre == null || nodoPadre.derecho != null) {`,
      `            return false;`,
      `        }`,
      `        nodoPadre.derecho = nuevoNodo;`,
      `    }`,
      `    {2}++;`,
      `    return true;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el nodo correspondiente al elemento proporcionado.
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(T {0}) {`,
      `    return this.get(this.raiz, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una búsqueda en el subárbol dado para
 * obtener el nodo correspondiente al elemento proporcionado.
 * @param r Nodo raíz del subárbol actual donde se va a buscar.
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        return null;`,
      `    }`,
      `    if (r.info.equals({0})) {`,
      `        return r;`,
      `    }`,
      `    NodoBin<T> resIzq = this.get(r.izquierdo, {0});`,
      `    if (resIzq != null) {`,
      `        return resIzq;`,
      `    }`,
      `    return this.get(r.derecho, {0});`,
      `}`,
    ],
    labels: {
      CREATE_NODE: 2,
      VALIDATE_EMPTY: 3,
      SET_ROOT: 4,
      ELSE_EMPTY: 5,
      GET_PARENT_NODE: 6,
      IF_INVALID_PARENT: 7,
      RETURN_FALSE: 8,
      LINK_RIGHT_CHILD: 10,
      INC_SIZE: 12,
      RETURN_TRUE: 13,

      // Método get(T info)
      CALL_RECURSIVE_GET: 19,

      // Método get(NodoBin<T> r, T info)
      IF_NULL_NODE: 25,
      RETURN_NULL: 26,
      IF_MATCH_NODE: 28,
      RETURN_NODE: 29,
      SEARCH_LEFT: 31,
      VALIDATE_LEFT_RESULT: 32,
      RETURN_LEFT_RESULT: 33,
      SEARCH_RIGHT: 35
    }
  },
  delete: {
    lines: [
      `/**
 * Método que elimina el elemento especificado del árbol binario. 
 * @param info Elemento a eliminar.
 * @return true si el elemento fue eliminado, false si no existe en el árbol.
 * @throws RuntimeException si el árbol está vacío.
 */`,
      `public boolean delete(T {0}) {`,
      `    if (this.raiz == null) {`,
      `        throw new RuntimeException("No fue posible eliminar el nodo: El árbol se encuentra vacío (cantidad de nodos: 0).");`,
      `    }`,
      `    NodoBin<T> nodoPadre = this.getPadre({0});`,
      `    NodoBin<T> nodo = null;`,
      `\n`,
      `    if (nodoPadre == null) {`,
      `        nodo = this.raiz;`,
      `    } else {`,
      `        nodo = nodoPadre.izquierdo;`,
      `        if (nodo == null || !nodo.info.equals({0})) {`,
      `            nodo = nodoPadre.derecho;`,
      `        }`,
      `    }`,
      `\n`,
      `    if (nodo == null || !nodo.info.equals({0})) {`,
      `        return false;`,
      `    }`,
      `    NodoBin<T> izq = nodo.izquierdo;`,
      `    NodoBin<T> der = nodo.derecho;`,
      `\n`,
      `    if (izq == null && der == null) {`,
      `        this.reemplazarHijo(nodoPadre, nodo, null);`,
      `        this.tamanio--;`,
      `        return true;`,
      `    }`,
      `    if (izq == null || der == null) {`,
      `        NodoBin<T> unico = izq != null ? izq : der;`,
      `        this.reemplazarHijo(nodoPadre, nodo, unico);`,
      `        this.tamanio--;`,
      `        return true;`,
      `    }`,
      `    NodoBin<T> succPadre = nodo;`,
      `    NodoBin<T> succ = der;`,
      `    while (succ.izquierdo != null) {`,
      `        succPadre = succ;`,
      `        succ = succ.izquierdo;`,
      `    }`,
      `    nodo.info = succ.info;`,
      `    this.reemplazarHijo(succPadre, succ, succ.derecho);`,
      `    this.tamanio--;`,
      `    return true;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el nodo padre del elemento proporcionado. 
 * @param info Elemento a buscar.
 * @return Nodo padre encontrado, o null si no existe o si el nodo es la raíz.
 */`,
      `private NodoBin<T> getPadre(T {0}) {`,
      `    if (this.raiz == null || this.raiz.info.equals(info)) {`,
      `        return null;`,
      `    }`,
      `    return this.getPadre(this.raiz, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una búsqueda en el subárbol dado para
 * obtener el nodo padre cuyo nodo hijo izquierdo o derecho corresponde al elemento proporcionado.
 * @param r Nodo raíz del subárbol actual donde se va a buscar.
 * @param info Elemento a buscar.
 * @return Nodo padre encontrado, o null si no existe.
 */`,
      `private NodoBin<T> getPadre(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        return null;`,
      `    }`,
      `    if ((r.izquierdo != null && r.izquierdo.info.equals({0})) || 
               (r.derecho != null && r.derecho.info.equals({0}))) {`,
      `        return r;`,
      `    }`,
      `    NodoBin<T> resIzq = this.getPadre(r.izquierdo, {0});`,
      `    if (resIzq != null) {`,
      `        return resIzq;`,
      `    }`,
      `    return this.getPadre(r.derecho, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que reemplaza un hijo de un nodo padre por otro nodo. 
 * @param padre Nodo padre.
 * @param antiguo Nodo hijo a reemplazar.
 * @param nuevo Nuevo nodo hijo.
 */`,
      `private void reemplazarHijo(NodoBin<T> padre, NodoBin<T> antiguo, NodoBin<T> nuevo) {`,
      `    if (padre == null) {`,
      `        this.raiz = nuevo;`,
      `    }`,
      `    else if (padre.izquierdo == antiguo) {`,
      `        padre.izquierdo = nuevo;`,
      `    }`,
      `    else {`,
      `        padre.derecho = nuevo;`,
      `    }`,
      `}`,
    ],
    labels: {
      VALIDATE_EMPTY: 2,
      THROW_IF_EMPTY: 3,
      GET_PARENT_NODE: 5,
      DECLARE_NODE: 6,
      IF_PARENT_NULL: 8,
      SET_NODE_ROOT: 9,
      ELSE_PARENT_NULL: 10,
      GET_PARENT_LEFT_CHILD: 11,
      IF_INVALID_LEFT_CHILD: 12,
      SET_PARENT_RIGHT_CHILD: 13,
      IF_NODE_NOT_FOUND: 17,
      RETURN_FALSE: 18,
      GET_NODE_LEFT_CHILDREN: 20,
      GET_NODE_RIGHT_CHILDREN: 21,
      IF_LEAF_NODE: 23,
      REPLACE_WITH_NULL: 24,
      DEC_SIZE: 25,
      RETURN_TRUE: 26,
      IF_SINGLE_CHILD: 28,
      GET_ONLY_CHILD: 29,
      REPLACE_WITH_CHILD: 30,
      DEC_SIZE2: 31,
      RETURN_TRUE2: 32,
      DECLARE_SUCC_PARENT: 34,
      DECLARE_SUCC_NODE: 35,
      WHILE_TRAVERSAL: 36,
      SET_SUCC_PARENT: 37,
      SET_SUCC_NODE: 38,
      UPDATE_NODE_INFO: 40,
      REPLACE_SUCCESSOR: 41,
      DEC_SIZE3: 42,
      RETURN_TRUE3: 43,

      // Método getPadre(T info)
      VALIDATE_ROOT: 49,
      RETURN_NULL: 50,
      CALL_RECURSIVE_GETPADRE: 52,

      // Método getPadre(NodoBin<T> r, T info)
      IF_NULL_NODE: 58,
      RETURN_NULL2: 59,
      IF_MATCH_CHILD: 61,
      RETURN_PARENT: 62,
      SEARCH_LEFT: 64,
      VALIDATE_LEFT_RESULT: 65,
      RETURN_LEFT_RESULT: 66,
      SEARCH_RIGHT: 68,

      // Método reemplazarHijo()
      VALIDATE_PARENT_NULL: 74,
      SET_ROOT: 75,
      ELSE_IF_LEFT_MATCH: 77,
      SET_LEFT_CHILD: 78,
      ELSE_RIGHT_BRANCH: 80,
      SET_RIGHT_CHILD: 81
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
 * Método que comprueba la existencia del elemento especificado en el árbol binario.
 * @param info Elemento a buscar.
 * @return true si el elemento existe en el árbol, false en caso contrario.
 */`,
      `public boolean search(T {0}) {`,
      `    return this.get({0}) != null;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el nodo correspondiente al elemento proporcionado. 
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(T {0}) {`,
      `    return this.get(this.raiz, {0});`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una búsqueda en el subárbol dado para
 * obtener el nodo correspondiente al elemento proporcionado.
 * @param r Nodo raíz del subárbol actual donde se va a buscar.
 * @param info Elemento a buscar.
 * @return Nodo encontrado, o null si no existe.
 */`,
      `private NodoBin<T> get(NodoBin<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        return null;`,
      `    }`,
      `    if (r.info.equals({0})) {`,
      `        return r;`,
      `    }`,
      `    NodoBin<T> resIzq = this.get(r.izquierdo, {0});`,
      `    if (resIzq != null) {`,
      `        return resIzq;`,
      `    }`,
      `    return this.get(r.derecho, {0});`,
      `}`,
    ],
    labels: {
      CHECK_NOT_NULL: 2,

      // Método get(T info)
      CALL_RECURSIVE_GET: 8,

      // Método get(NodoBin<T> r, T info)
      IF_NULL_NODE: 14,
      RETURN_NULL: 15,
      IF_MATCH_NODE: 17,
      RETURN_NODE: 18,
      SEARCH_LEFT: 20,
      VALIDATE_LEFT_RESULT: 21,
      RETURN_LEFT_RESULT: 22,
      SEARCH_RIGHT: 24
    }
  },
  getInOrder: {
    lines: [
      `/**
 * Método que realiza el recorrido inorden del árbol binario.
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
 * Método que realiza el recorrido preorden del árbol binario.
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
 * Método que realiza el recorrido postorden del árbol binario.
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
 * Método que realiza el recorrido por niveles del árbol binario.
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
 * Método que elimina todos los nodos del árbol binario.
 */`,
      `public void clean() {`,
      `    this.raiz = null;`,
      `}`,
    ],
    labels: {
      CLEAR_ROOT: 2
    }
  }
});