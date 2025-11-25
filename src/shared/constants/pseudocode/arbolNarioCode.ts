// src/shared/constants/pseudocode/arbolNarioCode.ts
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
      ROOT_EXISTS_IF: 7,      // if (raiz != null){
      ROOT_EXISTS_THROW: 8,   // throw new IllegalStateException...
      NEW_ROOT: 11,           // raiz = new NodoN({0});
      INIT_CHILDREN: 12,      // raiz.hijos = new ListaNodos();
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
      `// Nota: buscarPorIdBFS(raiz, id) se implementa con un recorrido BFS sobre el árbol.`,
    ],
    labels: {
      // Validación árbol creado
      TREE_EMPTY_IF: 7,            // if (raiz == null){
      TREE_EMPTY_THROW: 8,         // throw new IllegalStateException...

      // Búsqueda del padre
      FIND_PARENT: 12,             // NodoN padre = buscarPorIdBFS(raiz, {0});
      PARENT_NOT_FOUND_IF: 13,     // if (padre == null){
      PARENT_NOT_FOUND_THROW: 14,  // throw new RuntimeException("Padre no existe");

      // Crear hijo
      NEW_NODE: 18,                // NodoN nuevo = new NodoN({1});

      // Inserción según index
      IF_INDEX_NULL: 21,           // if (index == null){
      APPEND_CHILD: 22,            // padre.hijos.agregar(nuevo);
      ELSE_INSERT_AT: 23,          // } else {
      INSERT_AT_INDEX: 24,         // padre.hijos.insertar(index, nuevo);

      // Vincular padre
      SET_PARENT: 27,              // nuevo.padre = padre;
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
   * - busca objetivo por id
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
      `    // Buscar el nodo objetivo por id`,
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
    ],
    labels: {
      TREE_EMPTY_IF: 7,             // if (raiz == null){
      // (el return inmediato NO se considera error; simplemente no hace nada)

      FIND_TARGET: 12,              // NodoN objetivo = buscarPorIdBFS(raiz, {0});
      TARGET_NOT_FOUND_IF: 13,      // if (objetivo == null){
      TARGET_NOT_FOUND_THROW: 14,   // throw new RuntimeException...

      IF_IS_ROOT: 18,               // if (objetivo == raiz){
      SET_ROOT_NULL: 19,            // raiz = null;

      GET_PARENT: 23,               // NodoN p = objetivo.padre;
      FIND_INDEX_IN_CHILDREN: 24,   // int k = p.hijos.indiceDe(objetivo);
      REMOVE_AT_INDEX: 25,          // p.hijos.eliminarEn(k);
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
      SAME_NODE_IF: 8,              // if ({0}.equals({1})){
      SAME_NODE_THROW: 9,           // throw new IllegalArgumentException...

      // Búsqueda de x y p
      FIND_X: 13,                   // NodoN x = buscarPorIdBFS(raiz, {0});
      FIND_P: 14,                   // NodoN p = buscarPorIdBFS(raiz, {1});
      NODES_NOT_FOUND_IF: 15,       // if (x == null || p == null){
      NODES_NOT_FOUND_THROW: 16,    // throw new RuntimeException("Nodo no encontrado");

      // Validación de ciclo
      CHECK_CYCLE_IF: 20,           // if (esDescendiente(p, x)){
      CHECK_CYCLE_THROW: 21,        // throw new RuntimeException("Movimiento inválido: crearía un ciclo");

      // No mover raíz
      CHECK_IS_ROOT_IF: 25,         // if (x == raiz){
      CHECK_IS_ROOT_THROW: 26,      // throw new RuntimeException("No se puede mover la raíz");

      // Desvincular de padre original
      GET_OLD_PARENT: 30,           // NodoN actualPadre = x.padre;
      FIND_INDEX_IN_OLD: 31,        // int i = actualPadre.hijos.indiceDe(x);
      REMOVE_FROM_OLD: 32,          // actualPadre.hijos.eliminarEn(i);

      // Insertar en nuevo padre
      IF_INDEX_NULL: 35,            // if (index == null){
      APPEND_IN_NEW: 36,            // p.hijos.agregar(x);
      ELSE_INSERT_IN_NEW: 37,       // } else {
      INSERT_IN_NEW: 38,            // p.hijos.insertar(index, x);
      SET_NEW_PARENT: 40,           // x.padre = p;

      // esDescendiente(...)
      DESC_IF_NULL_ANCESTOR: 47,    // if (posibleAncestro == null){
      DESC_BASE_EQUAL: 50,          // if (posibleDescendiente == posibleAncestro){
      DESC_FOR_CHILDREN: 53,        // for (NodoN h : posibleAncestro.hijos){
      DESC_RECURSE_CHILD: 54,       // if (esDescendiente(posibleDescendiente, h)){
      DESC_RETURN_FALSE: 58,        // return false;
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
      TREE_EMPTY_IF: 3,           // if (raiz == null){
      TREE_EMPTY_THROW: 4,        // throw new IllegalStateException...

      FIND_NODE: 7,               // NodoN n = buscarPorIdBFS(raiz, {0});
      NODE_NOT_FOUND_IF: 8,       // if (n == null){
      NODE_NOT_FOUND_THROW: 9,    // throw new RuntimeException...

      ASSIGN_NEW_VALUE: 11,       // n.info = {1};
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
      ` * Retorna true si se encuentra.`,
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
      `    return false;`,
      `}`,
    ],
    labels: {
      TREE_EMPTY_IF: 7,         // if (raiz == null){

      QUEUE_INIT: 11,           // Cola<NodoN> q = new Cola<>();
      QUEUE_ENQUEUE_ROOT: 12,   // q.encolar(raiz);

      BFS_WHILE: 14,            // while (!q.esVacia()){
      BFS_DEQUEUE: 15,          // NodoN u = q.decolar();
      BFS_CHECK_VALUE: 16,      // if (u.info.equals({0})){
      BFS_RETURN_TRUE: 17,      // return true;

      BFS_FOR_CHILDREN: 19,     // for (NodoN h : u.hijos){
      BFS_ENQUEUE_CHILD: 20,    // q.encolar(h);

      BFS_RETURN_FALSE: 22,     // return false;
    },
    errorPlans: {
      TREE_EMPTY: [
        { lineLabel: "TREE_EMPTY_IF", hold: 600 },
      ],
      VALUE_NOT_FOUND: [
        { lineLabel: "QUEUE_INIT", hold: 400 },
        { lineLabel: "QUEUE_ENQUEUE_ROOT", hold: 400 },
        { lineLabel: "BFS_WHILE", hold: 600 },
        { lineLabel: "BFS_RETURN_FALSE", hold: 800 },
      ],
    },
  },

  /* ───────────────── getPreOrder(n, resultado) ─────────────────
   * Recorrido en preorden: nodo → hijos.
   */
  getPreOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido en preorden (nodo → hijos).`,
      ` */`,
      `public void getPreOrder(NodoN n, Lista<T> resultado){`,
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
      PRE_IF_NULL: 5,          // if (n == null){
      PRE_RETURN_NULL: 6,      // return;

      PRE_VISIT_NODE: 9,       // resultado.agregar(n.info);
      PRE_FOR_CHILDREN: 10,    // for (NodoN h : n.hijos){
      PRE_RECURSE_CHILD: 11,   // getPreOrder(h, resultado);
    },
  },

  /* ───────────────── getPostOrder(n, resultado) ─────────────────
   * Recorrido en postorden: hijos → nodo.
   */
  getPostOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido en postorden (hijos → nodo).`,
      ` */`,
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
      POST_IF_NULL: 5,          // if (n == null){
      POST_RETURN_NULL: 6,      // return;

      POST_FOR_CHILDREN: 8,     // for (NodoN h : n.hijos){
      POST_RECURSE_CHILD: 9,    // getPostOrder(h, resultado);
      POST_VISIT_NODE: 11,      // resultado.agregar(n.info);
    },
  },

  /* ───────────────── getLevelOrder(resultado) ─────────────────
   * Recorrido por niveles (BFS).
   */
  getLevelOrder: {
    lines: [
      `/**`,
      ` * Obtiene el recorrido por niveles (BFS).`,
      ` */`,
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
      LEVEL_TREE_EMPTY_IF: 5,      // if (raiz == null){

      LEVEL_QUEUE_INIT: 9,         // Cola<NodoN> q = new Cola<>();
      LEVEL_ENQUEUE_ROOT: 10,      // q.encolar(raiz);

      LEVEL_WHILE: 12,             // while (!q.esVacia()){
      LEVEL_DEQUEUE: 13,           // NodoN u = q.decolar();
      LEVEL_VISIT_NODE: 14,        // resultado.agregar(u.info);
      LEVEL_FOR_CHILDREN: 15,      // for (NodoN h : u.hijos){
      LEVEL_ENQUEUE_CHILD: 16,     // q.encolar(h);
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
      CLEAR_ROOT: 6,  // raiz = null;
    },
  },
});
