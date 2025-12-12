import { OperationCode } from "./typesPseudoCode";

/**
 * Pseudocódigo de Heap binario (min-heap / max-heap) sobre arreglo.
 *
 * Representación:
 *   - array: arreglo de NodoHeap<T> en orden por niveles (level-order).
 *   - parent(i) = (i - 1) / 2
 *   - left(i)   = 2 * i + 1
 *   - right(i)  = 2 * i + 2
 *
 * Códigos de dominio esperados (HeapErrorCode):
 *   - HEAP_EMPTY         → operaciones sobre heap vacío.
 *   - TARGET_NOT_FOUND   → delete/search de elemento inexistente.
 *   - MAX_NODES_REACHED  → al intentar insertar más de MAX_NODOS.
 */
export const getArbolHeapCode = (): Record<string, OperationCode> => ({
  /* ╔════════════════════════════════════════════╗
     ║                 INSERT                     ║
     ╚════════════════════════════════════════════╝ */
  insert: {
    lines: [
      `/** Inserta un valor en el heap manteniendo la propiedad de heap. */`, // 0
      `public void insert(T {0}) {`, // 1
      `    // Pre: si el heap alcanzó el límite de nodos -> DomainError MAX_NODES_REACHED`, // 2
      `    if (count() >= MAX_NODOS) raiseDomainError(MAX_NODES_REACHED);`, // 3
      ``, // 4
      `    // (1) Append: insertar al final del arreglo en orden por niveles`, // 5
      `    NodoHeap<T> nuevo = new NodoHeap<>({0});`, // 6
      `    array.add(nuevo);`, // 7
      ``, // 8
      `    // (2) Heapify-up: mientras el hijo "mejora" al padre, intercambiar payloads`, // 9
      `    int i = array.size() - 1;`, // 10
      `    while (i > 0) {`, // 11
      `        int p = parent(i);`, // 12
      `        NodoHeap<T> child = array.get(i);`, // 13
      `        NodoHeap<T> parent = array.get(p);`, // 14
      `        if (!better(child.priority, parent.priority)) break;`, // 15
      `        swapPayload(parent, child);`, // 16
      `        i = p;`, // 17
      `    }`, // 18
      `}`, // 19
    ],
    labels: {
      HEAP_INSERT_HEADER: 1,
      HEAP_INSERT_MAX_CAP_COMMENT: 2,
      HEAP_INSERT_MAX_CAP_IF: 3,
      HEAP_INSERT_NEW_NODE: 6,
      HEAP_INSERT_APPEND_ARRAY: 7,
      HEAP_INSERT_HEAPIFY_WHILE: 11,
      HEAP_INSERT_HEAPIFY_SWAP: 16,
    },
    errorPlans: {
      MAX_NODES_REACHED: [
        { lineLabel: "HEAP_INSERT_HEADER", hold: 600 },
        { lineLabel: "HEAP_INSERT_MAX_CAP_IF", hold: 900 },
      ],
    },
  },

  /* ╔════════════════════════════════════════════╗
     ║                 DELETE (por valor)         ║
     ╚════════════════════════════════════════════╝ */
  delete: {
    lines: [
      `/** Elimina una ocurrencia del valor {0} en el heap, si existe. */`, // 0
      `public void delete(T {0}) {`, // 1
      `    // Pre: si el heap está vacío -> DomainError HEAP_EMPTY`, // 2
      `    if (esVacio()) raiseDomainError(HEAP_EMPTY);`, // 3
      ``, // 4
      `    // Buscar el índice del elemento a eliminar (primera coincidencia)`, // 5
      `    int idx = indexOfValue({0});`, // 6
      `    // Si no se encuentra -> DomainError TARGET_NOT_FOUND`, // 7
      `    if (idx == -1) raiseDomainError(TARGET_NOT_FOUND);`, // 8
      ``, // 9
      `    int n = array.size();`, // 10
      `    int lastIdx = n - 1;`, // 11
      ``, // 12
      `    // Caso trivial: solo un elemento`, // 13
      `    if (n == 1) {`, // 14
      `        array.clear();`, // 15
      `        return;`, // 16
      `    }`, // 17
      ``, // 18
      `    // Mover el último nodo al hueco y eliminar la última posición física`, // 19
      `    array.set(idx, array.get(lastIdx));`, // 20
      `    array.remove(lastIdx);`, // 21
      ``, // 22
      `    // Decidir si conviene "subir" o "bajar" desde idx`, // 23
      `    int p = parent(idx);`, // 24
      `    boolean hasParent = (idx > 0);`, // 25
      `    if (hasParent && better(array.get(idx).priority, array.get(p).priority)) {`, // 26
      `        // heapify-up`, // 27
      `        heapifyUp(idx);`, // 28
      `    } else {`, // 29
      `        // heapify-down`, // 30
      `        heapifyDown(idx);`, // 31
      `    }`, // 32
      `}`, // 33
    ],
    labels: {
      HEAP_DELETE_HEADER: 1,
      HEAP_DELETE_EMPTY_COMMENT: 2,
      HEAP_DELETE_EMPTY_IF: 3,
      HEAP_DELETE_INDEXOF: 6,
      HEAP_DELETE_NOT_FOUND_COMMENT: 7,
      HEAP_DELETE_NOT_FOUND_IF: 8,
      HEAP_DELETE_TRIVIAL_IF: 14,
      HEAP_DELETE_CLEAR_ARRAY: 15,
      HEAP_DELETE_MOVE_LAST_SET: 20,
      HEAP_DELETE_MOVE_LAST_REMOVE: 21,
      HEAP_DELETE_DECIDE_DIR_IF: 26,
      HEAP_DELETE_HEAPIFY_UP: 28,
      HEAP_DELETE_HEAPIFY_DOWN: 31,
    },
    errorPlans: {
      HEAP_EMPTY: [
        { lineLabel: "HEAP_DELETE_HEADER", hold: 600 },
        { lineLabel: "HEAP_DELETE_EMPTY_IF", hold: 900 },
      ],
      TARGET_NOT_FOUND: [
        { lineLabel: "HEAP_DELETE_HEADER", hold: 600 },
        { lineLabel: "HEAP_DELETE_NOT_FOUND_IF", hold: 900 },
      ],
    },
  },


  /* ╔════════════════════════════════════════════╗
     ║                 SEARCH                     ║
     ╚════════════════════════════════════════════╝ */
  search: {
    lines: [
      `/**`, // 0
      ` * Busca el valor {0} en el heap sin modificar la estructura.`, // 1
      ` *`, // 2
      ` * Dominio:`, // 3
      ` *  - Si el heap está vacío -> DomainError HEAP_EMPTY.`, // 4
      ` *  - Si el valor no se encuentra -> DomainError TARGET_NOT_FOUND.`, // 5
      ` */`, // 6
      `public boolean buscar(T {0}) {`, // 7
      `    if (esVacio()) raiseDomainError(HEAP_EMPTY);`, // 8
      `    // Recorrer arreglo en level-order buscando coincidencias`, // 9
      `    boolean found = false;`, // 10
      `    for (int i = 0; i < array.size(); i++) {`, // 11
      `        if (array.get(i).priority.equals({0})) {`, // 12
      `            found = true;`, // 13
      `            break;`, // 14
      `        }`, // 15
      `    }`, // 16
      `    if (!found) raiseDomainError(TARGET_NOT_FOUND);`, // 17
      `    return true;`, // 18
      `}`, // 19
    ],
    labels: {
      HEAP_SEARCH_HEADER: 7,
      HEAP_SEARCH_EMPTY_IF: 8,
      HEAP_SEARCH_FOR_LOOP: 11,
      HEAP_SEARCH_FOUND_IF: 12,
      HEAP_SEARCH_NOT_FOUND_IF: 17,
    },
    errorPlans: {
      HEAP_EMPTY: [
        { lineLabel: "HEAP_SEARCH_HEADER", hold: 600 },
        { lineLabel: "HEAP_SEARCH_EMPTY_IF", hold: 900 },
      ],
      TARGET_NOT_FOUND: [
        { lineLabel: "HEAP_SEARCH_HEADER", hold: 600 },
        { lineLabel: "HEAP_SEARCH_NOT_FOUND_IF", hold: 900 },
      ],
    },
  },


  /* ╔════════════════════════════════════════════╗
     ║              LEVEL-ORDER (UI)              ║
     ╚════════════════════════════════════════════╝ */
  levelOrder: {
    lines: [
      `/**`, // 0
      ` * Devuelve un recorrido por niveles del heap para la UI.`, // 1
      ` * Cada nodo se visita en orden level-order usando el arreglo interno.`, // 2
      ` */`, // 3
      `public List<NodoHeap<T>> getLevelOrder() {`, // 4
      `    if (esVacio()) raiseDomainError(HEAP_EMPTY);`, // 5
      `    List<NodoHeap<T>> out = new ArrayList<>();`, // 6
      `    for (int i = 0; i < array.size(); i++) {`, // 7
      `        out.add(array.get(i));`, // 8
      `    }`, // 9
      `    return out;`, // 10
      `}`, // 11
    ],
    labels: {
      HEAP_LEVEL_HEADER: 4,
      HEAP_LEVEL_EMPTY_IF: 5,
      HEAP_LEVEL_FOR_LOOP: 7,
      HEAP_LEVEL_RETURN: 10,
    },
    errorPlans: {
      HEAP_EMPTY: [
        { lineLabel: "HEAP_LEVEL_HEADER", hold: 600 },
        { lineLabel: "HEAP_LEVEL_EMPTY_IF", hold: 900 },
      ],
    },
  },

  /* ╔════════════════════════════════════════════╗
     ║                  CLEAN                     ║
     ╚════════════════════════════════════════════╝ */
  clear: {
    lines: [
      `/** Vacía completamente el heap (elimina todos los elementos). */`, // 0
      `public void clean() {`, // 1
      `    array.clear();`, // 2
      `}`, // 3
    ],
    labels: {
      // Reutilizamos label genérico que ya usan otros árboles
      CLEAR_ROOT: 2, // línea que "vacía" la estructura
    },
  },
});
