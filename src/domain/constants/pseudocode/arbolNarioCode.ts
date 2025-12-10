import { OperationCode } from "./typesPseudoCode";

export const getArbolNarioCode = (): Record<string, OperationCode> => ({
  /* ───────────────── createRoot(v) ─────────────────
   * Crea la raíz del árbol N-ario.
   * - valida que no exista raíz previa
   * - crea NodoN con valor v y lista de hijos vacía
   */
  createRoot: {
    lines: [
      `/**`,
      ` * Crea la raíz del árbol N-ario.`,
      ` * <b>post:</b> el árbol pasa de vacío a tener una única raíz.`,
      ` */`,
      `public void createRoot(T {0}){`,
      `    // Validar que aún no exista una raíz`,
      `    if (raiz != null){`,
      `        throw new IllegalStateException("La raíz ya existe");`,
      `    }`,
      ``,
      `    raiz = new NodoN({0});`,
      `    raiz.hijos = new ListaNodos();  // hijos = lista vacía`,
      `}`,
    ],
    labels: {
      ROOT_EXISTS_IF: 6, // if (raiz != null){
      ROOT_EXISTS_THROW: 7, // throw new IllegalStateException...
      NEW_ROOT: 10, // raiz = new NodoN({0});
      INIT_CHILDREN: 11, // raiz.hijos = new ListaNodos();
    },
    errorPlans: {
      ROOT_ALREADY_EXISTS: [
        { lineLabel: "ROOT_EXISTS_IF", hold: 600 },
        { lineLabel: "ROOT_EXISTS_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── insertChild(parentId, value, index) ─────────────────
   * Inserta un nuevo hijo bajo un padre dado (por id).
   * - valida árbol no vacío
   * - busca padre por id (BFS auxiliar)
   * - crea nodo hijo
   * - inserta al final o en posición index
   */
  insertChild: {
    lines: [
      `/**`,
      ` * Inserta un nuevo hijo bajo un padre dado (por id).`,
      ` * Si 'index' es null, agrega al final; de lo contrario inserta en esa posición.`,
      ` */`,
      `public void insertChild(String {0}, T {1}, Integer index){`,
      `    // Validar que el árbol no esté vacío`,
      `    if (raiz == null){`,
      `        throw new IllegalStateException("Árbol vacío: primero crea la raíz");`,
      `    }`,
      ``,
      `    // Buscar nodo padre por id usando BFS`,
      `    NodoN padre = buscarPorIdBFS(raiz, {0});`,
      `    if (padre == null){`,
      `        throw new RuntimeException("Padre no existe");`,
      `    }`,
      ``,
      `    // Crear el nuevo nodo hijo`,
      `    NodoN nuevo = new NodoN({1});`,
      ``,
      `    // Insertar según la posición indicada`,
      `    if (index == null){`,
      `        padre.hijos.agregar(nuevo);`,
      `    } else {`,
      `        padre.hijos.insertar(index, nuevo);`,
      `    }`,
      ``,
      `    nuevo.padre = padre;`,
      `}`,
      ``,
      `/**`,
      ` * Busca un nodo por id usando recorrido BFS.`,
      ` */`,
      `private NodoN buscarPorIdBFS(NodoN raiz, String id){`,
      `    if (raiz == null){`,
      `        return null;`,
      `    }`,
      ``,
      `    Cola<NodoN> q = new Cola<>();`,
      `    q.encolar(raiz);`,
      ``,
      `    while (!q.esVacia()){`,
      `        NodoN u = q.decolar();`,
      `        if (u.id.equals(id)){`,
      `            return u;`,
      `        }`,
      `        for (NodoN h : u.hijos){`,
      `            q.encolar(h);`,
      `        }`,
      `    }`,
      `    return null;`,
      `}`,
      ``,
      `/**`,
      ` * Lista de hijos: agrega al final.`,
      ` */`,
      `public void agregar(NodoN x){`,
      `    hijos[size] = x;`,
      `    size++;`,
      `}`,
      ``,
      `/**`,
      ` * Lista de hijos: inserta en la posición 'index'.`,
      ` */`,
      `public void insertar(int index, NodoN x){`,
      `    for (int i = size; i > index; i--){`,
      `        hijos[i] = hijos[i - 1];`,
      `    }`,
      `    hijos[index] = x;`,
      `    size++;`,
      `}`,
    ],
    labels: {
      // insertChild(...)
      TREE_EMPTY_IF: 6, // if (raiz == null){
      TREE_EMPTY_THROW: 7, // throw new IllegalStateException...

      FIND_PARENT: 11, // NodoN padre = buscarPorIdBFS(raiz, {0});
      PARENT_NOT_FOUND_IF: 12, // if (padre == null){
      PARENT_NOT_FOUND_THROW: 13, // throw new RuntimeException("Padre no existe");

      NEW_NODE: 17, // NodoN nuevo = new NodoN({1});

      IF_INDEX_NULL: 20, // if (index == null){
      APPEND_CHILD: 21, // padre.hijos.agregar(nuevo);
      ELSE_INSERT_AT: 22, // } else {
      INSERT_AT_INDEX: 23, // padre.hijos.insertar(index, nuevo);

      SET_PARENT: 26, // nuevo.padre = padre;

      // buscarPorIdBFS(...)
      BFS_ROOT_NULL_IF: 33, // if (raiz == null){
      BFS_QUEUE_INIT: 37, // Cola<NodoN> q = new Cola<>();
      BFS_ENQUEUE_ROOT: 38, // q.encolar(raiz);

      BFS_WHILE: 40, // while (!q.esVacia()){
      BFS_DEQUEUE: 41, // NodoN u = q.decolar();
      BFS_CHECK_ID: 42, // if (u.id.equals(id)){
      BFS_RETURN_MATCH: 43, // return u;
      BFS_FOR_CHILDREN: 45, // for (NodoN h : u.hijos){
      BFS_ENQUEUE_CHILD: 46, // q.encolar(h);
      BFS_RETURN_NULL: 49, // return null;

      // agregar(...)
      AGREGAR_HEADER: 55, // public void agregar(NodoN x){
      AGREGAR_ASSIGN: 56, // hijos[size] = x;
      AGREGAR_INCREMENT: 57, // size++;

      // insertar(...)
      INSERT_HEADER: 63, // public void insertar(int index, NodoN x){
      INSERT_FOR: 64, // for (int i = size; i > index; i--){
      INSERT_SHIFT_ASSIGN: 65, // hijos[i] = hijos[i - 1];
      INSERT_FOR_END: 66, // }
      INSERT_SET_AT: 67, // hijos[index] = x;
      INSERT_INCREMENT: 68, // size++;
    },
    errorPlans: {
      TREE_NOT_CREATED: [
        { lineLabel: "TREE_EMPTY_IF", hold: 600 },
        { lineLabel: "TREE_EMPTY_THROW", hold: 800 },
      ],
      PARENT_NOT_FOUND: [
        { lineLabel: "FIND_PARENT", hold: 600 },
        { lineLabel: "PARENT_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "PARENT_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── deleteNode(id) ─────────────────
   * Elimina un nodo (y su subárbol) por id.
   * - si árbol vacío → return
   * - busca objetivo por id (BFS auxiliar)
   * - si no existe → lanza excepción
   * - si es la raíz → raíz = null
   * - si no → se elimina de la lista de hijos de su padre
   */
  deleteNode: {
    lines: [
      `/**`,
      ` * Elimina un nodo (y todo su subárbol) por id.`,
      ` * Si el nodo es la raíz, el árbol queda vacío.`,
      ` */`,
      `public void deleteNode(String {0}){`,
      `    // Si el árbol está vacío no hay nada que eliminar`,
      `    if (raiz == null){`,
      `        return;`,
      `    }`,
      ``,
      `    // Buscar el nodo objetivo por id (BFS auxiliar)`,
      `    NodoN objetivo = buscarPorIdBFS(raiz, {0});`,
      `    if (objetivo == null){`,
      `        throw new RuntimeException("No existe el nodo con id: {0}");`,
      `    }`,
      ``,
      `    // Caso especial: eliminar la raíz`,
      `    if (objetivo == raiz){`,
      `        raiz = null;`,
      `        return;`,
      `    }`,
      ``,
      `    // Desvincular el nodo de la lista de hijos de su padre`,
      `    NodoN p = objetivo.padre;`,
      `    int k = p.hijos.indiceDe(objetivo);`,
      `    p.hijos.eliminarEn(k);`,
      `}`,
      ``,
      `/**`,
      ` * Busca un nodo por id usando recorrido BFS.`,
      ` */`,
      `private NodoN buscarPorIdBFS(NodoN raiz, String id){`,
      `    if (raiz == null){`,
      `        return null;`,
      `    }`,
      ``,
      `    Cola<NodoN> q = new Cola<>();`,
      `    q.encolar(raiz);`,
      ``,
      `    while (!q.esVacia()){`,
      `        NodoN u = q.decolar();`,
      `        if (u.id.equals(id)){`,
      `            return u;`,
      `        }`,
      `        for (NodoN h : u.hijos){`,
      `            q.encolar(h);`,
      `        }`,
      `    }`,
      `    return null;`,
      `}`,
    ],
    labels: {
      // Validación árbol vacío
      TREE_EMPTY_IF: 6, // if (raiz == null){
      TREE_EMPTY_RETURN: 7, // return;

      // Búsqueda del objetivo
      FIND_TARGET: 11, // NodoN objetivo = buscarPorIdBFS(raiz, {0});
      TARGET_NOT_FOUND_IF: 12, // if (objetivo == null){
      TARGET_NOT_FOUND_THROW: 13, // throw new RuntimeException(...)

      // Caso especial: eliminar la raíz
      IF_IS_ROOT: 17, // if (objetivo == raiz){
      SET_ROOT_NULL: 18, // raiz = null;
      RETURN_AFTER_ROOT_DELETE: 19, // return;

      // Desvincular del padre
      GET_PARENT: 23, // NodoN p = objetivo.padre;
      FIND_INDEX_IN_CHILDREN: 24, // int k = p.hijos.indiceDe(objetivo);
      REMOVE_AT_INDEX: 25, // p.hijos.eliminarEn(k);

      // --- Auxiliar BFS (para animar la búsqueda) ---
      BFS_ROOT_NULL_IF: 32, // if (raiz == null){
      BFS_RETURN_NULL_EARLY: 33, // return null;

      BFS_QUEUE_INIT: 36, // Cola<NodoN> q = new Cola<>();
      BFS_ENQUEUE_ROOT: 37, // q.encolar(raiz);

      BFS_WHILE: 39, // while (!q.esVacia()){
      BFS_DEQUEUE: 40, // NodoN u = q.decolar();
      BFS_CHECK_ID: 41, // if (u.id.equals(id)){
      BFS_RETURN_MATCH: 42, // return u;
      BFS_FOR_CHILDREN: 44, // for (NodoN h : u.hijos){
      BFS_ENQUEUE_CHILD: 45, // q.encolar(h);
      BFS_RETURN_NULL: 48, // return null;
    },
    errorPlans: {
      NODE_NOT_FOUND: [
        { lineLabel: "FIND_TARGET", hold: 600 },
        { lineLabel: "TARGET_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "TARGET_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── moveNode(idNodo, nuevoPadreId, index) ─────────────────
   * Mueve un subárbol para colgarlo de un nuevo padre.
   * - valida que idNodo != nuevoPadreId
   * - busca x (nodo a mover) y p (nuevo padre)
   * - valida existencia
   * - valida que p NO sea descendiente de x (evitar ciclos)
   * - valida que x no sea la raíz
   * - desvincula de su padre actual
   * - inserta en nuevo padre (al final o por index)
   */
  moveNode: {
    lines: [
      `/**`,
      ` * Mueve un subárbol (idNodo) para que cuelgue de 'nuevoPadreId'.`,
      ` * Usa 'index' opcional para indicar la posición del nuevo hijo.`,
      ` * No permite mover dentro de su propio subárbol (evita ciclos).`,
      ` */`,
      `public void moveNode(String {0}, String {1}, Integer index){`,
      `    // No tiene sentido mover un nodo sobre sí mismo`,
      `    if ({0}.equals({1})){`,
      `        throw new IllegalArgumentException("Movimiento inválido: mismo origen y destino");`,
      `    }`,
      ``,
      `    // Buscar nodo a mover (x) y nuevo padre (p)`,
      `    NodoN x = buscarPorIdBFS(raiz, {0});`,
      `    NodoN p = buscarPorIdBFS(raiz, {1});`,
      `    if (x == null || p == null){`,
      `        throw new RuntimeException("Nodo no encontrado");`,
      `    }`,
      ``,
      `    // Evitar ciclos: p no puede ser descendiente de x`,
      `    if (esDescendiente(p, x)){`,
      `        throw new RuntimeException("Movimiento inválido: crearía un ciclo");`,
      `    }`,
      ``,
      `    // No permitimos mover la raíz`,
      `    if (x == raiz){`,
      `        throw new RuntimeException("No se puede mover la raíz");`,
      `    }`,
      ``,
      `    // Desvincular de su padre actual`,
      `    NodoN actualPadre = x.padre;`,
      `    int i = actualPadre.hijos.indiceDe(x);`,
      `    actualPadre.hijos.eliminarEn(i);`,
      ``,
      `    // Vincular en el nuevo padre`,
      `    if (index == null){`,
      `        p.hijos.agregar(x);`,
      `    } else {`,
      `        p.hijos.insertar(index, x);`,
      `    }`,
      `    x.padre = p;`,
      `}`,
      ``,
      `/**`,
      ` * Retorna true si 'posibleDescendiente' está en el subárbol de 'posibleAncestro'.`,
      ` */`,
      `private boolean esDescendiente(NodoN posibleDescendiente, NodoN posibleAncestro){`,
      `    if (posibleAncestro == null){`,
      `        return false;`,
      `    }`,
      `    if (posibleDescendiente == posibleAncestro){`,
      `        return true;`,
      `    }`,
      `    for (NodoN h : posibleAncestro.hijos){`,
      `        if (esDescendiente(posibleDescendiente, h)){`,
      `            return true;`,
      `        }`,
      `    }`,
      `    return false;`,
      `}`,
    ],
    labels: {
      // Validaciones básicas
      SAME_NODE_IF: 7, // if ({0}.equals({1})){
      SAME_NODE_THROW: 8, // throw new IllegalArgumentException...

      // Búsqueda de x y p
      FIND_X: 12, // NodoN x = buscarPorIdBFS(raiz, {0});
      FIND_P: 13, // NodoN p = buscarPorIdBFS(raiz, {1});
      NODES_NOT_FOUND_IF: 14, // if (x == null || p == null){
      NODES_NOT_FOUND_THROW: 15, // throw new RuntimeException("Nodo no encontrado");

      // Validación de ciclo
      CHECK_CYCLE_IF: 19, // if (esDescendiente(p, x)){
      CHECK_CYCLE_THROW: 20, // throw new RuntimeException("Movimiento inválido: crearía un ciclo");

      // No mover raíz
      CHECK_IS_ROOT_IF: 24, // if (x == raiz){
      CHECK_IS_ROOT_THROW: 25, // throw new RuntimeException("No se puede mover la raíz");

      // Desvincular de padre original
      GET_OLD_PARENT: 29, // NodoN actualPadre = x.padre;
      FIND_INDEX_IN_OLD: 30, // int i = actualPadre.hijos.indiceDe(x);
      REMOVE_FROM_OLD: 31, // actualPadre.hijos.eliminarEn(i);

      // Insertar en nuevo padre
      IF_INDEX_NULL: 34, // if (index == null){
      APPEND_IN_NEW: 35, // p.hijos.agregar(x);
      ELSE_INSERT_IN_NEW: 36, // } else {
      INSERT_IN_NEW: 37, // p.hijos.insertar(index, x);
      SET_NEW_PARENT: 39, // x.padre = p;

      // esDescendiente(...)
      DESC_IF_NULL_ANCESTOR: 46, // if (posibleAncestro == null){
      DESC_BASE_EQUAL: 49, // if (posibleDescendiente == posibleAncestro){
      DESC_FOR_CHILDREN: 52, // for (NodoN h : posibleAncestro.hijos){
      DESC_RECURSE_CHILD: 53, // if (esDescendiente(posibleDescendiente, h)){
      DESC_RETURN_FALSE: 57, // return false;
    },

    errorPlans: {
      SAME_ORIGIN_AND_DESTINATION: [
        { lineLabel: "SAME_NODE_IF", hold: 600 },
        { lineLabel: "SAME_NODE_THROW", hold: 800 },
      ],
      NODE_NOT_FOUND: [
        { lineLabel: "FIND_X", hold: 400 },
        { lineLabel: "FIND_P", hold: 400 },
        { lineLabel: "NODES_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "NODES_NOT_FOUND_THROW", hold: 800 },
      ],
      MOVE_CREATES_CYCLE: [
        { lineLabel: "CHECK_CYCLE_IF", hold: 600 },
        { lineLabel: "CHECK_CYCLE_THROW", hold: 800 },
      ],
      MOVE_ROOT_FORBIDDEN: [
        { lineLabel: "CHECK_IS_ROOT_IF", hold: 600 },
        { lineLabel: "CHECK_IS_ROOT_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── updateValue(id, value) ─────────────────
   * Actualiza el valor almacenado en un nodo por id.
   */
  updateValue: {
    lines: [
      `/** Actualiza el valor almacenado en un nodo por id. */`,
      `public void updateValue(String {0}, T {1}){`,
      `    if (raiz == null){`,
      `        throw new IllegalStateException("Árbol vacío: primero crea la raíz");`,
      `    }`,
      ``,
      `    NodoN n = buscarPorIdBFS(raiz, {0});`,
      `    if (n == null){`,
      `        throw new RuntimeException("No existe el nodo con id: {0}");`,
      `    }`,
      ``,
      `    n.info = {1};`,
      `}`,
    ],
    labels: {
      TREE_EMPTY_IF: 2, // if (raiz == null){
      TREE_EMPTY_THROW: 3, // throw new IllegalStateException...

      FIND_NODE: 6, // NodoN n = buscarPorIdBFS(raiz, {0});
      NODE_NOT_FOUND_IF: 7, // if (n == null){
      NODE_NOT_FOUND_THROW: 8, // throw new RuntimeException...

      ASSIGN_NEW_VALUE: 11, // n.info = {1};
    },
    errorPlans: {
      TREE_NOT_CREATED: [
        { lineLabel: "TREE_EMPTY_IF", hold: 600 },
        { lineLabel: "TREE_EMPTY_THROW", hold: 800 },
      ],
      NODE_NOT_FOUND: [
        { lineLabel: "FIND_NODE", hold: 600 },
        { lineLabel: "NODE_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "NODE_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── search(value) ─────────────────
   * Búsqueda BFS por valor:
   * - si el árbol está vacío → false
   * - BFS con cola desde la raíz
   * - si encuentra u.info == value → true
   * - si termina la cola sin encontrar → false
   */
  search: {
    lines: [
      `/**`,
      ` * Busca el primer nodo cuyo valor coincida (recorrido BFS).`,
      ` * Retorna true si se encuentra, lanza error si no.`,
      ` */`,
      `public boolean search(T {0}){`,
      `    // Si el árbol está vacío no hay nada que buscar`,
      `    if (raiz == null){`,
      `        return false;`,
      `    }`,
      ``,
      `    Cola<NodoN> q = new Cola<>();`,
      `    q.encolar(raiz);`,
      ``,
      `    while (!q.esVacia()){`,
      `        NodoN u = q.decolar();`,
      `        if (u.info.equals({0})){`,
      `            return true;`,
      `        }`,
      `        for (NodoN h : u.hijos){`,
      `            q.encolar(h);`,
      `        }`,
      `    }`,
      `    // Si se vacía la cola y no se encontró el valor, lanzamos error`,
      `    throw new RuntimeException("No existe un nodo con valor: {0}");`,
      `}`,
    ],
    labels: {
      // if (raiz == null){
      TREE_EMPTY_IF: 6,

      // Cola<NodoN> q = new Cola<>();
      QUEUE_INIT: 10,
      // q.encolar(raiz);
      QUEUE_ENQUEUE_ROOT: 11,

      // while (!q.esVacia()){
      BFS_WHILE: 13,
      // NodoN u = q.decolar();
      BFS_DEQUEUE: 14,
      // if (u.info.equals({0})){
      BFS_CHECK_VALUE: 15,
      // return true;
      BFS_RETURN_TRUE: 16,

      // for (NodoN h : u.hijos){
      BFS_FOR_CHILDREN: 18,
      // q.encolar(h);
      BFS_ENQUEUE_CHILD: 19,

      // throw new RuntimeException("No existe un nodo con valor: {0}");
      VALUE_NOT_FOUND_THROW: 23,
    },
    errorPlans: {
      TREE_EMPTY: [{ lineLabel: "TREE_EMPTY_IF", hold: 600 }],
      VALUE_NOT_FOUND: [
        { lineLabel: "QUEUE_INIT", hold: 400 },
        { lineLabel: "QUEUE_ENQUEUE_ROOT", hold: 400 },
        { lineLabel: "BFS_WHILE", hold: 600 },
        { lineLabel: "VALUE_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },
  getPreOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido en preorden (nodo → hijos).`,
      ` */`,
      `public Lista<T> getPreOrder(){`,
      `    Lista<T> resultado = new Lista<>();`,
      `    getPreOrder(raiz, resultado);`,
      `    return resultado;`,
      `}`,
      ``,
      `private void getPreOrder(NodoN n, Lista<T> resultado){`,
      `    if (n == null){`,
      `        return;`,
      `    }`,
      ``,
      `    resultado.agregar(n.info);`,
      `    for (NodoN h : n.hijos){`,
      `        getPreOrder(h, resultado);`,
      `    }`,
      `}`,
    ],
    labels: {
      // Wrapper público
      PRE_INIT_RESULT: 4, // Lista<T> resultado = new Lista<>();
      PRE_CALL_HELPER: 5, // getPreOrder(raiz, resultado);
      PRE_RETURN_RESULT: 6, // return resultado;

      // Helper recursivo
      PRE_IF_NULL: 10, // if (n == null){
      PRE_RETURN_NULL: 11, // return;
      PRE_VISIT_NODE: 14, // resultado.agregar(n.info);
      PRE_FOR_CHILDREN: 15, // for (NodoN h : n.hijos){
      PRE_RECURSE_CHILD: 16, // getPreOrder(h, resultado);
    },
  },

  /* ───────────────── getPostOrder(...) ─────────────────
   * Recorrido en postorden: hijos → nodo.
   * Wrapper público + helper recursivo.
   */
  getPostOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido en postorden (hijos → nodo).`,
      ` */`,
      `public Lista<T> getPostOrder(){`,
      `    Lista<T> resultado = new Lista<>();`,
      `    getPostOrder(raiz, resultado);`,
      `    return resultado;`,
      `}`,
      ``,
      `public void getPostOrder(NodoN n, Lista<T> resultado){`,
      `    if (n == null){`,
      `        return;`,
      `    }`,
      `    for (NodoN h : n.hijos){`,
      `        getPostOrder(h, resultado);`,
      `    }`,
      `    resultado.agregar(n.info);`,
      `}`,
    ],
    labels: {
      POST_IF_NULL: 10, // if (n == null){
      POST_RETURN_NULL: 11, // return;

      POST_FOR_CHILDREN: 13, // for (NodoN h : n.hijos){
      POST_RECURSE_CHILD: 14, // getPostOrder(h, resultado);
      POST_VISIT_NODE: 16, // resultado.agregar(n.info);
    },
  },

  /* ───────────────── getLevelOrder(...) ─────────────────
   * Recorrido por niveles (BFS).
   * Wrapper público + método que consume la lista resultado.
   */
  getLevelOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido por niveles (BFS).`,
      ` */`,
      `public Lista<T> getLevelOrder(){`,
      `    Lista<T> resultado = new Lista<>();`,
      `    getLevelOrder(resultado);`,
      `    return resultado;`,
      `}`,
      ``,
      `public void getLevelOrder(Lista<T> resultado){`,
      `    if (raiz == null){`,
      `        return;`,
      `    }`,
      ``,
      `    Cola<NodoN> q = new Cola<>();`,
      `    q.encolar(raiz);`,
      ``,
      `    while (!q.esVacia()){`,
      `        NodoN u = q.decolar();`,
      `        resultado.agregar(u.info);`,
      `        for (NodoN h : u.hijos){`,
      `            q.encolar(h);`,
      `        }`,
      `    }`,
      `}`,
    ],
    labels: {
      LEVEL_TREE_EMPTY_IF: 10, // if (raiz == null){

      LEVEL_QUEUE_INIT: 14, // Cola<NodoN> q = new Cola<>();
      LEVEL_ENQUEUE_ROOT: 15, // q.encolar(raiz);

      LEVEL_WHILE: 17, // while (!q.esVacia()){
      LEVEL_DEQUEUE: 18, // NodoN u = q.decolar();
      LEVEL_VISIT_NODE: 19, // resultado.agregar(u.info);
      LEVEL_FOR_CHILDREN: 20, // for (NodoN h : u.hijos){
      LEVEL_ENQUEUE_CHILD: 21, // q.encolar(h);
    },
  },

  /* ───────────────── clean() ─────────────────
   * Vacía por completo el árbol N-ario.
   */
  clean: {
    lines: [
      `/**`,
      ` * Vacía por completo el árbol N-ario.`,
      ` * <b>post:</b> la raíz pasa a ser null.`,
      ` */`,
      `public void clean(){`,
      `    raiz = null;`,
      `}`,
    ],
    labels: {
      CLEAR_ROOT: 5, // raiz = null;
    },
  },
});
