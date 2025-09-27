import { OperationCode } from "./typesPseudoCode";

export const getArbolNarioCode = (): OperationCode => ({
  /* ───────────────────────────── Crear raíz ───────────────────────────── */
  createRoot: [
    `/** Crea la raíz del árbol N-ario. */`,
    `public void createRoot(T valor) {`,
    `    if (raiz != null) throw new Error("La raíz ya existe");`,
    `    raiz = new NodoN(valor);`,
    `    // hijos = lista vacía`,
    `}`,
  ],

  /* ───────────────────────────── Insertar hijo ───────────────────────────── */
  insertChild: [
    `/**`,
    ` * Inserta un nuevo hijo bajo un padre dado (por id).`,
    ` * Si 'index' se omite, agrega al final; si se especifica, inserta en esa posición.`,
    ` */`,
    `public void insertChild(String parentId, T valor, Integer index = null) {`,
    `    if (raiz == null) throw new Error("Árbol vacío: primero crea la raíz");`,
    `    NodoN padre = buscarPorIdBFS(raiz, parentId);`,
    `    if (padre == null) throw new Error("Padre no existe");`,
    `    NodoN nuevo = new NodoN(valor);`,
    `    if (index == null) padre.hijos.agregar(nuevo);`,
    `    else padre.hijos.insertar(index, nuevo);`,
    `    nuevo.padre = padre;`,
    `}`,
  ],

  /* ───────────────────────────── Eliminar nodo ───────────────────────────── */
  deleteNode: [
    `/**`,
    ` * Elimina un nodo (y todo su subárbol) por id.`,
    ` * Si el nodo es la raíz, el árbol queda vacío.`,
    ` */`,
    `public void deleteNode(String id) {`,
    `    if (raiz == null) return;`,
    `    NodoN objetivo = buscarPorIdBFS(raiz, id);`,
    `    if (objetivo == null) return;`,
    `    if (objetivo == raiz) {`,
    `        raiz = null;`,
    `        return;`,
    `    }`,
    `    NodoN p = objetivo.padre;`,
    `    int k = p.hijos.indiceDe(objetivo);`,
    `    p.hijos.eliminarEn(k);`,
    `}`,
  ],

  /* ───────────────────────────── Mover nodo ───────────────────────────── */
  moveNode: [
    `/**`,
    ` * Mueve un subárbol (id) para que cuelgue de 'nuevoPadreId'.`,
    ` * Usa 'index' opcional para indicar la posición del nuevo hijo.`,
    ` * No permite mover dentro de su propio subárbol (evita ciclos).`,
    ` */`,
    `public void moveNode(String id, String nuevoPadreId, Integer index = null) {`,
    `    if (id.equals(nuevoPadreId)) throw new Error("Movimiento inválido");`,
    `    NodoN x = buscarPorIdBFS(raiz, id);`,
    `    NodoN p = buscarPorIdBFS(raiz, nuevoPadreId);`,
    `    if (x == null || p == null) throw new Error("Nodo no encontrado");`,
    `    if (esDescendiente(p, x)) throw new Error("Crearía un ciclo");`,
    `    if (x == raiz) throw new Error("No se puede mover la raíz");`,
    `    // Desvincular de su padre actual`,
    `    NodoN actual = x.padre;`,
    `    int i = actual.hijos.indiceDe(x);`,
    `    actual.hijos.eliminarEn(i);`,
    `    // Vincular en el nuevo padre`,
    `    if (index == null) p.hijos.agregar(x);`,
    `    else p.hijos.insertar(index, x);`,
    `    x.padre = p;`,
    `}`,
  ],

  /* ───────────────────────────── Actualizar valor ───────────────────────────── */
  updateValue: [
    `/** Actualiza el valor almacenado en un nodo por id. */`,
    `public void updateValue(String id, T nuevoValor) {`,
    `    NodoN n = buscarPorIdBFS(raiz, id);`,
    `    if (n == null) throw new Error("Nodo no existe");`,
    `    n.info = nuevoValor;`,
    `}`,
  ],

  /* ───────────────────────────── Buscar por valor ───────────────────────────── */
  search: [
    `/**`,
    ` * Busca el primer nodo cuyo valor coincida (BFS).`,
    ` * Retorna true si se encuentra; además permite resaltar el camino.`,
    ` */`,
    `public boolean search(T valor) {`,
    `    if (raiz == null) return false;`,
    `    Cola<NodoN> q = new Cola<>();`,
    `    q.encolar(raiz);`,
    `    while (!q.esVacia()) {`,
    `        NodoN u = q.decolar();`,
    `        if (u.info.equals(valor)) return true;`,
    `        for (NodoN h : u.hijos) q.encolar(h);`,
    `    }`,
    `    return false;`,
    `}`,
  ],

  /* ───────────────────────────── Preorden ───────────────────────────── */
  getPreOrder: [
    `/**`,
    ` * Obtiene el recorrido en preorden (nodo → hijos).`,
    ` */`,
    `public void getPreOrder(NodoN n, Lista<T> resultado) {`,
    `    if (n == null) return;`,
    `    resultado.agregar(n.info);`,
    `    for (NodoN h : n.hijos) getPreOrder(h, resultado);`,
    `}`,
  ],

  /* ───────────────────────────── Postorden ───────────────────────────── */
  getPostOrder: [
    `/**`,
    ` * Obtiene el recorrido en postorden (hijos → nodo).`,
    ` */`,
    `public void getPostOrder(NodoN n, Lista<T> resultado) {`,
    `    if (n == null) return;`,
    `    for (NodoN h : n.hijos) getPostOrder(h, resultado);`,
    `    resultado.agregar(n.info);`,
    `}`,
  ],

  /* ───────────────────────────── Recorrido por niveles ───────────────────────────── */
  getLevelOrder: [
    `/**`,
    ` * Obtiene el recorrido por niveles (BFS).`,
    ` */`,
    `public void getLevelOrder(Lista<T> resultado) {`,
    `    if (raiz == null) return;`,
    `    Cola<NodoN> q = new Cola<>();`,
    `    q.encolar(raiz);`,
    `    while (!q.esVacia()) {`,
    `        NodoN u = q.decolar();`,
    `        resultado.agregar(u.info);`,
    `        for (NodoN h : u.hijos) q.encolar(h);`,
    `    }`,
    `}`,
  ],

  /* ───────────────────────────── Vaciar ───────────────────────────── */
  clean: [
    `/** Vacía por completo el árbol N-ario. */`,
    `public void clean() {`,
    `    raiz = null;`,
    `}`,
  ],
});
