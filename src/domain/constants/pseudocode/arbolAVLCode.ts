import { OperationCode } from "./typesPseudoCode";

export const getArbolAVLCode = (): Record<string, OperationCode> => ({
  insert: {
    lines: [
      `/**
 * Método que inserta un nuevo elemento en el árbol AVL.
 * @param valor Elemento a insertar.
 * @return true si el elemento fue insertado, false si ya existía.
 */`,
      `public boolean insert(T {0}) {`,
      `    this.insertado = false;`,
      `    this.raiz = this.insert(this.raiz, {0});`,
      `    if (this.insertado) {`,
      `        {1}++;`,
      `    }`,
      `    return this.insertado;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que inserta un nuevo nodo en el subárbol dado, a partir del elemento proporcionado
 * y aplicando las rotaciones necesarias para mantener el balance del árbol AVL.
 * @param r Nodo raíz del subárbol actual.
 * @param info Elemento a insertar.
 * @return Nodo raíz del subárbol actualizado tras la inserción.
 */`,
      `private NodoAVL<T> insert(NodoAVL<T> r, T {0}) {`,
      `    if (r == null) {`,
      `        r = new NodoAVL<>({0});`,
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
      `    this.recalcularAltura(r);`,
      `    r = this.rebalancear(r);`,
      `    return r;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que rebalancea el subárbol dado si se detecta un desbalance, aplicando 
 * las rotaciones necesarias (LL, LR, RL o RR) según el caso.
 * @param z Nodo raíz del subárbol actual.
 * @return Nuevo nodo raíz del subárbol tras aplicar las rotaciones correspondientes.
 */`,
      `private NodoAVL<T> rebalancear(NodoAVL<T> z) {`,
      `    int bf = this.getBalance(z);`,
      `    if (bf == 2) {`,
      `        NodoAVL<T> y = z.izquierdo;`,
      `        if (this.getBalance(y) < 0) {`,
      `            z.izquierdo = this.rotacionIzquierda(y);`,
      `            z = this.rotacionDerecha(z);`,
      `        }`,
      `        else {`,
      `            z = this.rotacionDerecha(z);`,
      `        }`,
      `    }`,
      `    else if (bf == -2) {`,
      `        NodoAVL<T> y = z.derecho;`,
      `        if (this.getBalance(y) > 0) {`,
      `            z.derecho = this.rotacionDerecha(y);`,
      `            z = this.rotacionIzquierda(z);`,
      `        }`,
      `        else {`,
      `            z = this.rotacionIzquierda(z);`,
      `        }`,
      `    }`,
      `    return z;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una rotación simple a la derecha en el subárbol dado.
 * @param y Nodo raíz del subárbol a rotar.
 * @return Nuevo nodo raíz del subárbol tras la rotación.
 */`,
      `private NodoAVL<T> rotacionDerecha(NodoAVL<T> y) {`,
      `    NodoAVL<T> x = y.izquierdo;`,
      `    NodoAVL<T> T2 = x.derecho;`,
      `\n`,
      `    x.derecho = y;`,
      `    y.izquierdo = T2;`,
      `\n`,
      `    this.recalcularAltura(y);`,
      `    this.recalcularAltura(x);`,
      `\n`,
      `    return x;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una rotación simple a la izquierda en el subárbol dado.
 * @param x Nodo raíz del subárbol a rotar.
 * @return Nuevo nodo raíz del subárbol tras la rotación.
 */`,
      `private NodoAVL<T> rotacionIzquierda(NodoAVL<T> x) {`,
      `    NodoAVL<T> y = x.derecho;`,
      `    NodoAVL<T> T2 = y.izquierdo;`,
      `\n`,
      `    y.izquierdo = x;`,
      `    x.derecho = T2;`,
      `\n`,
      `    this.recalcularAltura(x);`,
      `    this.recalcularAltura(y);`,
      `\n`,
      `    return y;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que recalcula la altura del nodo dado
 * en función de las alturas de sus subárboles izquierdo y derecho.
 * @param r Nodo del cual se recalcula la altura.
 */`,
      `private void recalcularAltura(NodoAVL<T> r) {`,
      `    int alturaIzq = r.izquierdo != null ? r.izquierdo.altura : 0;`,
      `    int alturaDer = r.derecho != null ? r.derecho.altura : 0;`,
      `    r.altura = 1 + Math.max(alturaIzq, alturaDer);`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el factor de balance del nodo dado, definido como la diferencia
 * entre la altura del subárbol izquierdo y la altura del subárbol derecho.
 * @param r Nodo del cual se obtiene el factor de balance
 * @return Factor de balance del nodo.
 */`,
      `private int getBalance(NodoAVL<T> r) {`,
      `    if (r == null) {`,
      `        return 0;`,
      `    }`,
      `    int alturaIzq = r.izquierdo != null ? r.izquierdo.altura : 0;`,
      `    int alturaDer = r.derecho != null ? r.derecho.altura : 0;`,
      `    return alturaIzq - alturaDer;`,
      `}`,
    ],
    labels: {
      RESET_INSERTED_FLAG: 2,
      CALL_RECURSIVE_INSERT: 3,
      IF_INSERTED: 4,
      INC_SIZE: 5,
      RETURN_RESULT: 7,

      // Método insert(NodoAVL<T> r, T info)
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
      UPDATE_HEIGHT: 26,
      CALL_REBALANCE: 27,
      RETURN_NODE: 28,

      // Método rebalancear(NodoAVL<T> z)
      COMPUTE_BF: 34,
      IF_BF_POS_TWO: 35,
      SET_Y_LEFT: 36,
      IF_INNER_LR: 37,
      APPLY_LR_LEFT_ROT: 38,
      APPLY_LR_RIGHT_ROT: 39,
      ELSE_LL: 41,
      APPLY_LL_ROT: 42,
      ELSE_IF_BF_NEG_TWO: 45,
      SET_Y_RIGHT: 46,
      IF_INNER_RL: 47,
      APPLY_RL_RIGHT_ROT: 48,
      APPLY_RL_LEFT_ROT: 49,
      ELSE_RR: 51,
      APPLY_RR_ROT: 52,
      RETURN_REBALANCED: 55,

      // Método rotacionDerecha(NodoAVL<T> y)
      ROT_RIGHT_DECL_X: 61,
      ROT_RIGHT_DECL_T2: 62,
      SET_X_RIGHT_LINK: 64,
      SET_Y_LEFT_LINK: 65,
      ROT_RIGHT_RECALC_Y: 67,
      ROT_RIGHT_RECALC_X: 68,
      ROT_RIGHT_RETURN: 70,

      // Método rotacionIzquierda(NodoAVL<T> x)
      ROT_LEFT_DECL_Y: 76,
      ROT_LEFT_DECL_T2: 77,
      SET_Y_LEFT_LINK2: 79,
      SET_X_RIGHT_LINK2: 80,
      ROT_LEFT_RECALC_X: 82,
      ROT_LEFT_RECALC_Y: 83,
      ROT_LEFT_RETURN: 85,

      // Método recalcularAltura(NodoAVL<T> r)
      GET_LEFT_HEIGHT: 91,
      GET_RIGHT_HEIGHT: 92,
      SET_HEIGHT: 93,

      // Método getBalance(NodoAVL<T> r)
      IF_NODE_NULL_BALANCE: 99,
      RETURN_ZERO_BALANCE: 100,
      GET_LEFT_HEIGHT2: 102,
      GET_RIGHT_HEIGHT2: 103,
      RETURN_BF: 104
    }
  },
  delete: {
    lines: [
      `/**
 * Método que elimina el elemento especificado del árbol AVL.
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
      `        {1}--;`,
      `    }`,
      `    return this.eliminado;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que elimina el nodo correspondiente al elemento proporcionado en el subárbol dado, 
 * aplicando las rotaciones necesarias para mantener el balance del árbol AVL.
 * @param root Nodo raíz del subárbol actual.
 * @param valor Elemento a eliminar.
 * @return Nodo raíz del subárbol actualizado tras la eliminación.
 */`,
      `private NodoAVL<T> delete(NodoAVL<T> r, T {0}) {`,
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
      `        NodoAVL<T> suc = r.derecho;`,
      `        while (suc.izquierdo != null) {`,
      `            suc = suc.izquierdo;`,
      `        }`,
      `        r.info = suc.info;`,
      `        r.derecho = this.delete(r.derecho, suc.info);`,
      `    }`,
      `    this.recalcularAltura(r);`,
      `    r = this.rebalancear(r);`,
      `    return r;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que rebalancea el subárbol dado si se detecta un desbalance, aplicando 
 * las rotaciones necesarias (LL, LR, RL o RR) según el caso.
 * @param z Nodo raíz del subárbol actual.
 * @return Nuevo nodo raíz del subárbol tras aplicar las rotaciones correspondientes.
 */`,
      `private NodoAVL<T> rebalancear(NodoAVL<T> z) {`,
      `    int bf = this.getBalance(z);`,
      `    if (bf == 2) {`,
      `        NodoAVL<T> y = z.izquierdo;`,
      `        if (this.getBalance(y) < 0) {`,
      `            z.izquierdo = this.rotacionIzquierda(y);`,
      `            z = this.rotacionDerecha(z);`,
      `        }`,
      `        else {`,
      `            z = this.rotacionDerecha(z);`,
      `        }`,
      `    }`,
      `    else if (bf == -2) {`,
      `        NodoAVL<T> y = z.derecho;`,
      `        if (this.getBalance(y) > 0) {`,
      `            z.derecho = this.rotacionDerecha(y);`,
      `            z = this.rotacionIzquierda(z);`,
      `        }`,
      `        else {`,
      `            z = this.rotacionIzquierda(z);`,
      `        }`,
      `    }`,
      `    return z;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una rotación simple a la derecha en el subárbol dado.
 * @param y Nodo raíz del subárbol a rotar.
 * @return Nuevo nodo raíz del subárbol tras la rotación.
 */`,
      `private NodoAVL<T> rotacionDerecha(NodoAVL<T> y) {`,
      `    NodoAVL<T> x = y.izquierdo;`,
      `    NodoAVL<T> T2 = x.derecho;`,
      `\n`,
      `    x.derecho = y;`,
      `    y.izquierdo = T2;`,
      `\n`,
      `    this.recalcularAltura(y);`,
      `    this.recalcularAltura(x);`,
      `\n`,
      `    return x;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que realiza una rotación simple a la izquierda en el subárbol dado.
 * @param x Nodo raíz del subárbol a rotar.
 * @return Nuevo nodo raíz del subárbol tras la rotación.
 */`,
      `private NodoAVL<T> rotacionIzquierda(NodoAVL<T> x) {`,
      `    NodoAVL<T> y = x.derecho;`,
      `    NodoAVL<T> T2 = y.izquierdo;`,
      `\n`,
      `    y.izquierdo = x;`,
      `    x.derecho = T2;`,
      `\n`,
      `    this.recalcularAltura(x);`,
      `    this.recalcularAltura(y);`,
      `\n`,
      `    return y;`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que recalcula la altura del nodo dado en función de las alturas 
 * de sus subárboles izquierdo y derecho.
 * @param r Nodo del cual se recalcula la altura.
 */`,
      `private void recalcularAltura(NodoAVL<T> r) {`,
      `    int alturaIzq = r.izquierdo != null ? r.izquierdo.altura : 0;`,
      `    int alturaDer = r.derecho != null ? r.derecho.altura : 0;`,
      `    r.altura = 1 + Math.max(alturaIzq, alturaDer);`,
      `}`,
      `\n`,
      `\n`,
      `/**
 * Método auxiliar que obtiene el factor de balance del nodo dado, definido como la diferencia
 * entre la altura del subárbol izquierdo y la altura del subárbol derecho.
 * @param r Nodo del cual se obtiene el factor de balance
 * @return Factor de balance del nodo.
 */`,
      `private int getBalance(NodoAVL<T> r) {`,
      `    if (r == null) {`,
      `        return 0;`,
      `    }`,
      `    int alturaIzq = r.izquierdo != null ? r.izquierdo.altura : 0;`,
      `    int alturaDer = r.derecho != null ? r.derecho.altura : 0;`,
      `    return alturaIzq - alturaDer;`,
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

      // Método delete(NodoAVL<T> r, T valor)
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
      DECLARE_SUCC_NODE: 32,
      WHILE_TRAVERSAL: 33,
      SET_SUCC_NODE: 34,
      UPDATE_NODE_INFO: 36,
      CALL_DELETE_SUCCESSOR: 37,
      UPDATE_HEIGHT: 39,
      CALL_REBALANCE: 40,
      RETURN_NODE: 41,

      // Método rebalancear(NodoAVL<T> z)
      COMPUTE_BF: 47,
      IF_BF_POS_TWO: 48,
      SET_Y_LEFT: 49,
      IF_INNER_LR: 50,
      APPLY_LR_LEFT_ROT: 51,
      APPLY_LR_RIGHT_ROT: 52,
      ELSE_LL: 54,
      APPLY_LL_ROT: 55,
      ELSE_IF_BF_NEG_TWO: 58,
      SET_Y_RIGHT: 59,
      IF_INNER_RL: 60,
      APPLY_RL_RIGHT_ROT: 61,
      APPLY_RL_LEFT_ROT: 62,
      ELSE_RR: 64,
      APPLY_RR_ROT: 65,
      RETURN_REBALANCED: 68,

      // Método rotacionDerecha(NodoAVL<T> y)
      ROT_RIGHT_DECL_X: 74,
      ROT_RIGHT_DECL_T2: 75,
      SET_X_RIGHT_LINK: 77,
      SET_Y_LEFT_LINK: 78,
      ROT_RIGHT_RECALC_Y: 80,
      ROT_RIGHT_RECALC_X: 81,
      ROT_RIGHT_RETURN: 83,

      // Método rotacionIzquierda(NodoAVL<T> x)
      ROT_LEFT_DECL_Y: 89,
      ROT_LEFT_DECL_T2: 90,
      SET_Y_LEFT_LINK2: 92,
      SET_X_RIGHT_LINK2: 93,
      ROT_LEFT_RECALC_X: 95,
      ROT_LEFT_RECALC_Y: 96,
      ROT_LEFT_RETURN: 98,

      // Método recalcularAltura(NodoAVL<T> r)
      GET_LEFT_HEIGHT: 104,
      GET_RIGHT_HEIGHT: 105,
      SET_HEIGHT: 106,

      // Método getBalance(NodoAVL<T> r)
      IF_NODE_NULL_BALANCE: 112,
      RETURN_ZERO_BALANCE: 113,
      GET_LEFT_HEIGHT2: 115,
      GET_RIGHT_HEIGHT2: 116,
      RETURN_BF: 117
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
 * Método que comprueba la existencia del elemento especificado en el árbol AVL.
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
      `private boolean search(NodoAVL<T> r, T {0}) {`,
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

      // Método search(NodoAVL<T> r, T info)
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
 * Método que realiza el recorrido inorden del árbol AVL.
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
      `private void getInOrder(NodoAVL<T> r, ListaCD<T> nodos) {`,
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

      // Método getInOrder(NodoAVL<T> r, ListaCD<T> nodos)
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
 * Método que realiza el recorrido preorden del árbol AVL.
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
      `private void getPreOrder(NodoAVL<T> r, ListaCD<T> nodos) {`,
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

      // Método getPreOrder(NodoAVL<T> r, ListaCD<T> nodos)
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
 * Método que realiza el recorrido postorden del árbol AVL.
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
      `private void getPostOrder(NodoAVL<T> r, ListaCD<T> nodos) {`,
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

      // Método getPostOrder(NodoAVL<T> r, ListaCD<T> nodos)
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
 * Método que realiza el recorrido por niveles del árbol AVL.
 * @return Lista con la información de los nodos del árbol por niveles.
 */`,
      `public ListaCD<T> getLevelOrder() {`,
      `    ListaCD<T> nodos = new ListaCD<>();`,
      `    if (this.raiz != null) {`,
      `        Cola<NodoAVL<T>> cola = new Cola<>();`,
      `        cola.enqueue(this.raiz);`,
      `        \n`,
      `        while (!cola.isEmpty()) {`,
      `             NodoAVL<T> nodo = cola.dequeue();`,
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
 * Método que elimina todos los nodos del árbol AVL.
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