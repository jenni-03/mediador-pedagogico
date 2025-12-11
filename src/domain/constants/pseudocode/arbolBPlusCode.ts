import { OperationCode } from "./typesPseudoCode";

/**
 * Pseudocódigo de Árbol B+ (grado mínimo t ≥ 2)
 *
 * BPlusNode:
 *   keys: lista ordenada de T
 *   child: arreglo de hijos (solo si !leaf)  // child.length = keys.length + 1
 *   leaf: boolean
 *   nextLeaf: ref a la hoja derecha (o null)
 *   t: grado mínimo
 *
 * Propiedades:
 *  - Toda hoja al mismo nivel (altura uniforme).
 *  - Todo nodo interno (excepto la raíz) tiene entre t-1 y 2t-1 claves.
 *  - Toda hoja (excepto la raíz si es la única) tiene entre t-1 y 2t-1 claves.
 *  - En B+ las claves "de datos" viven en HOJAS; los internos sólo enrutan.
 *  - Hojas encadenadas por nextLeaf para recorridos/rangos eficientes.
 */
export const getArbolBPlusCode = (): Record<string, OperationCode> => ({
  /* ╔════════════════════════════════════════════╗
     ║                 INSERT                    ║
     ╚════════════════════════════════════════════╝ */
  insert: {
    lines: [
      `/** Inserta una clave k en el B+. Duplica la separadora al subir en splits de hoja. */`, // 0
      `public void insert(T {0}) {`, // 1
      `    // (1) Árbol vacío -> crear raíz hoja`, // 2
      `    if (root == null) {`, // 3
      `        root = new BPlusNode(t, /*leaf=*/true);`, // 4
      `        root.keys.add({0});`, // 5
      `        return;`, // 6
      `    }`, // 7
      ``, // 8
      `    // (2) Verificar duplicados -> DomainError KEY_ALREADY_EXISTS`, // 9
      `    // if (contains(root, {0})) raiseDomainError(KEY_ALREADY_EXISTS);`, // 10
      ``, // 11
      `    // (3) Si la raíz está llena, dividir antes de descender`, // 12
      `    if (isFull(root)) {`, // 13
      `        // Si al crear nuevos nodos se supera el límite -> DomainError MAX_NODES_REACHED`, // 14
      `        BPlusNode s = new BPlusNode(t, /*leaf=*/false);`, // 15
      `        s.child[0] = root;`, // 16
      `        splitChild(s, 0); // decide split de hoja o interno según s.child[0].leaf`, // 17
      `        root = s;`, // 18
      `    }`, // 19
      ``, // 20
      `    // (4) Insertar en subárbol cuya raíz ya no está llena`, // 21
      `    insertNonFull(root, {0});`, // 22
      `}`, // 23
      ``, // 24
      `/** Inserción estándar B+ en un subárbol cuya raíz NO está llena. */`, // 25
      `private void insertNonFull(BPlusNode x, T {0}) {`, // 26
      `    if (x.leaf) {`, // 27
      `        // Insertar en orden dentro de la hoja`, // 28
      `        int i = lowerBound(x.keys, {0});`, // 29
      `        x.keys.add(i, {0});`, // 30
      `        // si se desborda, tratar arriba (el caller garantiza x no lleno en entrada)`, // 31
      `    } else {`, // 32
      `        // Descenso por intervalo`, // 33
      `        int i = childIndexToDescend(x.keys, {0});`, // 34
      `        if (isFull(x.child[i])) {`, // 35
      `            splitChild(x, i);`, // 36
      `            // tras split, decidir si bajamos a i o i+1 según separadora`, // 37
      `            if ({0}.compareTo(x.keys.get(i)) >= 0) i++;`, // 38
      `        }`, // 39
      `        insertNonFull(x.child[i], {0});`, // 40
      `    }`, // 41
      `}`, // 42
      ``, // 43
      `/** Divide el hijo y = x.child[i].`, // 44
      ` *  - Si y es HOJA:`, // 45
      ` *      z recibe las últimas (t) o (t-1) claves (según convención),`, // 46
      ` *      duplicar la clave separadora en el PADRE (NO se elimina de la hoja),`, // 47
      ` *      enlazar hojas: y.nextLeaf -> z -> antiguoSiguiente.`, // 48
      ` *  - Si y es INTERNO:`, // 49
      ` *      promover la clave media (se elimina de y) y dividir en y (izq) y z (der). */`, // 50
      `private void splitChild(BPlusNode x, int i) {`, // 51
      `    BPlusNode y = x.child[i];`, // 52
      `    BPlusNode z = new BPlusNode(t, y.leaf);`, // 53
      `    int mid = y.keys.size() / 2;`, // 54
      `    if (y.leaf) {`, // 55
      `        // z <- claves [mid .. end)`, // 56
      `        moveRange(y.keys, mid, y.keys.size(), z.keys);`, // 57
      `        // ajustar lista de hojas`, // 58
      `        z.nextLeaf = y.nextLeaf;`, // 59
      `        y.nextLeaf = z;`, // 60
      `        // separadora a insertar/duplicar en x`, // 61
      `        T sep = z.keys.get(0); // en B+ la separadora es la PRIMERA de z`, // 62
      `        x.keys.add(i, sep);`, // 63
      `        shiftRight(x.child, i+1);`, // 64
      `        x.child[i+1] = z;`, // 65
      `    } else {`, // 66
      `        // interno: promover la media y repartir hijos`, // 67
      `        T up = y.keys.get(mid);`, // 68
      `        // z <- claves (mid+1 .. end)`, // 69
      `        moveRange(y.keys, mid+1, y.keys.size(), z.keys);`, // 70
      `        // niños derechos a z`, // 71
      `        moveRange(y.child, mid+1, mid+1 + z.keys.size() + 1, z.child);`, // 72
      `        // recortar y: claves [0..mid-1] y niños [0..mid]`, // 73
      `        shrinkTo(y.keys, 0, mid);`, // 74
      `        shrinkTo(y.child, 0, mid+1);`, // 75
      `        // subir "up" al padre`, // 76
      `        x.keys.add(i, up);`, // 77
      `        shiftRight(x.child, i+1);`, // 78
      `        x.child[i+1] = z;`, // 79
      `    }`, // 80
      `}`, // 81
    ],
    labels: {
      // insert(...)
      BPLUS_INSERT_HEADER: 1,
      BPLUS_INSERT_EMPTY_IF: 3,
      BPLUS_INSERT_CREATE_ROOT: 4,
      BPLUS_INSERT_INSERT_ROOT_KEY: 5,
      BPLUS_INSERT_RETURN_AFTER_NEW_ROOT: 6,

      BPLUS_INSERT_DUP_CHECK_COMMENT: 9,

      BPLUS_INSERT_ROOT_FULL_IF: 13,
      BPLUS_INSERT_NEW_INTERNAL_ROOT: 15,
      BPLUS_INSERT_ATTACH_OLD_ROOT: 16,
      BPLUS_INSERT_SPLIT_OLD_ROOT: 17,
      BPLUS_INSERT_SET_NEW_ROOT: 18,

      BPLUS_INSERT_CALL_NONFULL_ROOT: 22,

      // insertNonFull(...)
      BPLUS_INSERT_NONFULL_HEADER: 26,
      BPLUS_INSERT_NONFULL_IF_LEAF: 27,
      BPLUS_INSERT_NONFULL_LOWER_BOUND: 29,
      BPLUS_INSERT_NONFULL_LEAF_INSERT: 30,

      BPLUS_INSERT_NONFULL_INTERNAL_ELSE: 32,
      BPLUS_INSERT_NONFULL_CHILD_INDEX: 34,
      BPLUS_INSERT_NONFULL_CHILD_FULL_IF: 35,
      BPLUS_INSERT_NONFULL_CHILD_SPLIT: 36,
      BPLUS_INSERT_NONFULL_CHILD_DECIDE_SIDE: 38,
      BPLUS_INSERT_NONFULL_RECURSE: 40,

      // splitChild(...)
      BPLUS_SPLIT_CHILD_HEADER: 51,
      BPLUS_SPLIT_CHILD_LEAF_IF: 55,
      BPLUS_SPLIT_CHILD_LEAF_MOVE_KEYS: 57,
      BPLUS_SPLIT_CHILD_LEAF_LINKS: 59,
      BPLUS_SPLIT_CHILD_LEAF_SEP: 62,
      BPLUS_SPLIT_CHILD_LEAF_INSERT_SEP: 63,

      BPLUS_SPLIT_CHILD_INTERNAL_IF: 66,
      BPLUS_SPLIT_CHILD_INTERNAL_UP: 68,
      BPLUS_SPLIT_CHILD_INTERNAL_MOVE_KEYS: 70,
      BPLUS_SPLIT_CHILD_INTERNAL_MOVE_CHILDREN: 72,
      BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_KEYS: 74,
      BPLUS_SPLIT_CHILD_INTERNAL_SHRINK_CHILDREN: 75,
      BPLUS_SPLIT_CHILD_INTERNAL_INSERT_UP: 77,
    },
    errorPlans: {
      KEY_ALREADY_EXISTS: [
        // Duplicado al insertar
        { lineLabel: "BPLUS_INSERT_HEADER", hold: 600 },
        { lineLabel: "BPLUS_INSERT_DUP_CHECK_COMMENT", hold: 900 },
      ],
      MAX_NODES_REACHED: [
        // Capacidad superada al intentar crear nuevos nodos
        { lineLabel: "BPLUS_INSERT_HEADER", hold: 600 },
        { lineLabel: "BPLUS_INSERT_ROOT_FULL_IF", hold: 900 },
      ],
    },
  },

  /* ╔════════════════════════════════════════════╗
     ║                 DELETE                    ║
     ╚════════════════════════════════════════════╝ */
  delete: {
    lines: [
      `/** Elimina k del B+. Borra en hoja; repara hojas/intervalos y ajusta separadoras. */`, // 0
      `public void delete(T {0}) {`, // 1
      `    // Pre: si root == null -> DomainError TREE_EMPTY; si la clave no está -> DomainError KEY_NOT_FOUND`, // 2
      `    if (root == null) return;`, // 3
      `    deleteFrom(root, {0});`, // 4
      `    // Contracción de raíz`, // 5
      `    if (!root.leaf && root.keys.isEmpty()) root = root.child[0];`, // 6
      `    if (root.leaf && root.keys.isEmpty()) root = null;`, // 7
      `}`, // 8
      ``, // 9
      `private void deleteFrom(BPlusNode x, T {0}) {`, // 10
      `    if (x.leaf) {`, // 11
      `        int i = indexOf(x.keys, {0});`, // 12
      `        if (i == -1) return;`, // 13
      `        boolean firstKeyChanged = (i == 0);`, // 14
      `        x.keys.remove(i);`, // 15
      `        if (firstKeyChanged) updateSeparatorUpwards(x); // si cambió la primera clave de la hoja`, // 16
      `        if (underMin(x) && x != root) fixLeafUnderflow(x);`, // 17
      `    } else {`, // 18
      `        // bajar hasta la hoja correspondiente`, // 19
      `        int i = childIndexToDescend(x.keys, {0});`, // 20
      `        BPlusNode c = x.child[i];`, // 21
      `        deleteFrom(c, {0});`, // 22
      `        // si el hijo quedó por debajo del mínimo, reparar en el nivel interno`, // 23
      `        if (!c.leaf && underMin(c)) fixInternalUnderflow(x, i);`, // 24
      `        // Nota: fixLeafUnderflow se llamó en la rama de hoja si fue necesario`, // 25
      `    }`, // 26
      `}`, // 27
      ``, // 28
      `/** Si una HOJA quedó por debajo del mínimo: intentar pedir a hermano o fusionar. */`, // 29
      `private void fixLeafUnderflow(BPlusNode leaf) {`, // 30
      `    ParentRef pr = findParent(root, leaf); // (p, idx)`, // 31
      `    if (pr == null) return;`, // 32
      `    BPlusNode p = pr.node; int i = pr.index;`, // 33
      `    // hermano izquierdo`, // 34
      `    if (i > 0 && p.child[i-1].keys.size() > minLeafKeys()) {`, // 35
      `        borrowFromPrevLeaf(p, i);`, // 36
      `        updateSeparatorAfterBorrow(p, i);`, // 37
      `        return;`, // 38
      `    }`, // 39
      `    // hermano derecho`, // 40
      `    if (i < p.keys.size() && p.child[i+1].keys.size() > minLeafKeys()) {`, // 41
      `        borrowFromNextLeaf(p, i);`, // 42
      `        updateSeparatorAfterBorrow(p, i+1);`, // 43
      `        return;`, // 44
      `    }`, // 45
      `    // fusionar con izquierdo o derecho`, // 46
      `    if (i < p.keys.size()) mergeLeaves(p, i); else mergeLeaves(p, i-1);`, // 47
      `}`, // 48
      ``, // 49
      `private void borrowFromPrevLeaf(BPlusNode p, int i) {`, // 50
      `    BPlusNode L = p.child[i-1], C = p.child[i];`, // 51
      `    // mover última clave de L a la cabeza de C`, // 52
      `    C.keys.add(0, L.keys.remove(L.keys.size()-1));`, // 53
      `}`, // 54
      ``, // 55
      `private void borrowFromNextLeaf(BPlusNode p, int i) {`, // 56
      `    BPlusNode C = p.child[i], R = p.child[i+1];`, // 57
      `    // mover primera clave de R al final de C`, // 58
      `    C.keys.add(R.keys.remove(0));`, // 59
      `}`, // 60
      ``, // 61
      `private void mergeLeaves(BPlusNode p, int i) {`, // 62
      `    BPlusNode L = p.child[i], R = p.child[i+1];`, // 63
      `    // concatenar claves y reparar enlaces`, // 64
      `    for (T v : R.keys) L.keys.add(v);`, // 65
      `    L.nextLeaf = R.nextLeaf;`, // 66
      `    // quitar separadora p.keys[i] y el hijo R`, // 67
      `    p.keys.remove(i);`, // 68
      `    removeChildAt(p.child, i+1);`, // 69
      `    if (p != root && underMinInternal(p)) fixInternalUnderflowParent(p);`, // 70
      `}`, // 71
      ``, // 72
      `/** Si un INTERNO quedó por debajo del mínimo tras borrar en subárbol. */`, // 73
      `private void fixInternalUnderflow(BPlusNode p, int i) {`, // 74
      `    if (i > 0 && p.child[i-1].keys.size() > minInternalKeys()) {`, // 75
      `        borrowFromLeftInternal(p, i);`, // 76
      `        return;`, // 77
      `    }`, // 78
      `    if (i < p.keys.size() && p.child[i+1].keys.size() > minInternalKeys()) {`, // 79
      `        borrowFromRightInternal(p, i);`, // 80
      `        return;`, // 81
      `    }`, // 82
      `    if (i < p.keys.size()) mergeInternals(p, i); else mergeInternals(p, i-1);`, // 83
      `}`, // 84
      ``, // 85
      `private void borrowFromLeftInternal(BPlusNode p, int i) {`, // 86
      `    BPlusNode L = p.child[i-1], C = p.child[i];`, // 87
      `    // rotar una clave de p hacia C y mover la mayor de L hacia p`, // 88
      `    C.keys.add(0, p.keys.get(i-1));`, // 89
      `    p.keys.set(i-1, L.keys.remove(L.keys.size()-1));`, // 90
      `    // mover el último hijo de L como primer hijo de C`, // 91
      `    shiftRight(C.child, 0);`, // 92
      `    C.child[0] = L.child.popBack();`, // 93
      `}`, // 94
      ``, // 95
      `private void borrowFromRightInternal(BPlusNode p, int i) {`, // 96
      `    BPlusNode C = p.child[i], R = p.child[i+1];`, // 97
      `    C.keys.add(p.keys.get(i));`, // 98
      `    p.keys.set(i, R.keys.remove(0));`, // 99
      `    C.child.pushBack(R.child.remove(0));`, // 100
      `}`, // 101
      ``, // 102
      `private void mergeInternals(BPlusNode p, int i) {`, // 103
      `    BPlusNode L = p.child[i], R = p.child[i+1];`, // 104
      `    // bajar separadora entre L y R`, // 105
      `    L.keys.add(p.keys.remove(i));`, // 106
      `    // concatenar claves e hijos de R`, // 107
      `    for (T v : R.keys) L.keys.add(v);`, // 108
      `    for (Node h : R.child) L.child.pushBack(h);`, // 109
      `    removeChildAt(p.child, i+1);`, // 110
      `}`, // 111
      ``, // 112
      `/** Si cambia la PRIMERA clave de una hoja, actualizar separadoras en ancestros. */`, // 113
      `private void updateSeparatorUpwards(BPlusNode leaf) {`, // 114
      `    T newFirst = leaf.keys.isEmpty() ? null : leaf.keys.get(0);`, // 115
      `    // subir y actualizar la primera clave igual al viejo valor que apuntaba a esta hoja`, // 116
      `    updateSeparators(root, leaf, newFirst);`, // 117
      `}`, // 118
    ],
    labels: {
      // delete(...)
      BPLUS_DELETE_HEADER: 1,
      BPLUS_DELETE_PRECOND_COMMENT: 2,
      BPLUS_DELETE_ROOT_NULL_IF: 3,
      BPLUS_DELETE_CALL_DELETE_FROM: 4,
      BPLUS_DELETE_CONTRACT_ROOT_INTERNAL: 6,
      BPLUS_DELETE_CONTRACT_ROOT_LEAF_EMPTY: 7,

      // deleteFrom(...)
      BPLUS_DELETE_FROM_HEADER: 10,
      BPLUS_DELETE_FROM_LEAF_IF: 11,
      BPLUS_DELETE_FROM_LEAF_INDEX: 12,
      BPLUS_DELETE_FROM_LEAF_NOT_FOUND_IF: 13,
      BPLUS_DELETE_FROM_LEAF_REMOVE: 15,
      BPLUS_DELETE_FROM_LEAF_UPDATE_SEP_IF: 16,
      BPLUS_DELETE_FROM_LEAF_UNDERMIN_IF: 17,

      BPLUS_DELETE_FROM_INTERNAL_ELSE: 18,
      BPLUS_DELETE_FROM_INTERNAL_CHILD_INDEX: 20,
      BPLUS_DELETE_FROM_INTERNAL_CHILD_REF: 21,
      BPLUS_DELETE_FROM_INTERNAL_RECURSE: 22,
      BPLUS_DELETE_FROM_INTERNAL_FIX_UNDERMIN_IF: 24,

      // fixLeafUnderflow(...)
      BPLUS_FIX_LEAF_UNDERFLOW_HEADER: 30,
      BPLUS_FIX_LEAF_FIND_PARENT: 31,
      BPLUS_FIX_LEAF_PARENT_NULL_IF: 32,
      BPLUS_FIX_LEAF_BORROW_LEFT_IF: 35,
      BPLUS_FIX_LEAF_BORROW_RIGHT_IF: 41,
      BPLUS_FIX_LEAF_MERGE: 47,

      // internos varios
      BPLUS_BORROW_PREV_LEAF_HEADER: 50,
      BPLUS_BORROW_NEXT_LEAF_HEADER: 56,
      BPLUS_MERGE_LEAVES_HEADER: 62,

      BPLUS_FIX_INTERNAL_UNDERFLOW_HEADER: 74,
      BPLUS_FIX_INTERNAL_BORROW_LEFT_IF: 75,
      BPLUS_FIX_INTERNAL_BORROW_RIGHT_IF: 79,
      BPLUS_FIX_INTERNAL_MERGE_IF: 83,

      BPLUS_UPDATE_SEP_UPWARDS_HEADER: 114,
      BPLUS_UPDATE_SEP_NEWFIRST_ASSIGN: 115,
    },
    errorPlans: {
      TREE_EMPTY: [
        // delete sobre árbol vacío
        { lineLabel: "BPLUS_DELETE_HEADER", hold: 600 },
        { lineLabel: "BPLUS_DELETE_ROOT_NULL_IF", hold: 800 },
      ],
      KEY_NOT_FOUND: [
        // delete de clave inexistente (se controla antes de entrar a deleteFrom)
        { lineLabel: "BPLUS_DELETE_HEADER", hold: 600 },
        { lineLabel: "BPLUS_DELETE_PRECOND_COMMENT", hold: 800 },
      ],
    },
  },

  /* ╔════════════════════════════════════════════╗
     ║                 SEARCH                    ║
     ╚════════════════════════════════════════════╝ */
   search: {
    lines: [
      `/** Busca k en el B+: baja por internos y verifica en hoja. */`, // 0
      `public boolean search(T {0}) {`, // 1
      `    BPlusNode x = root;`, // 2
      `    while (x != null && !x.leaf) {`, // 3
      `        int i = childIndexToDescend(x.keys, {0});`, // 4
      `        x = x.child[i];`, // 5
      `    }`, // 6
      `    if (x == null) return false;`, // 7
      `    int i = lowerBound(x.keys, {0});`, // 8
      `    return (i < x.keys.size() && x.keys.get(i).equals({0}));`, // 9
      `}`, // 10
    ],
    labels: {
      BPLUS_SEARCH_HEADER: 1,
      BPLUS_SEARCH_INIT_X: 2,
      BPLUS_SEARCH_WHILE_DESCEND: 3,
      BPLUS_SEARCH_CHILD_INDEX: 4,
      BPLUS_SEARCH_MOVE_CHILD: 5,
      BPLUS_SEARCH_X_NULL_IF: 7,
      BPLUS_SEARCH_LOWER_BOUND: 8,
      BPLUS_SEARCH_RETURN_CMP: 9,
    },
    errorPlans: {
      TREE_EMPTY: [
        // search sobre árbol vacío
        { lineLabel: "BPLUS_SEARCH_HEADER", hold: 600 },
        { lineLabel: "BPLUS_SEARCH_INIT_X", hold: 800 },
        { lineLabel: "BPLUS_SEARCH_X_NULL_IF", hold: 900 },
      ],
      KEY_NOT_FOUND: [
        // clave no encontrada (tu capa de dominio decide lanzar DomainError)
        { lineLabel: "BPLUS_SEARCH_HEADER", hold: 600 },
        { lineLabel: "BPLUS_SEARCH_LOWER_BOUND", hold: 800 },
        { lineLabel: "BPLUS_SEARCH_RETURN_CMP", hold: 900 },
      ],
    },
  },


  /* ╔════════════════════════════════════════════╗
     ║                 RANGE / SCAN               ║
     ╚════════════════════════════════════════════╝ */
   range: {
    lines: [
      `/** Emite claves en [from, to] recorriendo hojas con nextLeaf. */`, // 0
      `public ListaCD<T> range(T {0}, T {1}) {`, // 1
      `    ListaCD<T> out = new ListaCD<>();`, // 2
      `    if (root == null || {0}.compareTo({1}) > 0) return out;`, // 3
      `    // ubicar hoja de inicio`, // 4
      `    BPlusNode x = root;`, // 5
      `    while (!x.leaf) {`, // 6
      `        int i = childIndexToDescend(x.keys, {0});`, // 7
      `        x = x.child[i];`, // 8
      `    }`, // 9
      `    int i = lowerBound(x.keys, {0});`, // 10
      `    while (x != null) {`, // 11
      `        while (i < x.keys.size() && x.keys.get(i).compareTo({1}) <= 0) {`, // 12
      `            out.insertarAlFinal(x.keys.get(i));`, // 13
      `            i++;`, // 14
      `        }`, // 15
      `        if (i < x.keys.size()) break; // el resto ya supera '{1}'`, // 16
      `        x = x.nextLeaf;`, // 17
      `        i = 0;`, // 18
      `    }`, // 19
      `    return out;`, // 20
      `}`, // 21
    ],
    labels: {
      BPLUS_RANGE_HEADER: 1,
      BPLUS_RANGE_INIT_OUT: 2,
      BPLUS_RANGE_ROOT_NULL_OR_INVALID_IF: 3,
      BPLUS_RANGE_FIND_LEAF_COMMENT: 4,
      BPLUS_RANGE_INIT_X: 5,
      BPLUS_RANGE_DESCEND_WHILE: 6,
      BPLUS_RANGE_CHILD_INDEX: 7,
      BPLUS_RANGE_LOWER_BOUND: 10,
      BPLUS_RANGE_WHILE_LEAVES: 11,
      BPLUS_RANGE_INNER_WHILE_RANGE: 12,
      BPLUS_RANGE_EMIT_KEY: 13,
      BPLUS_RANGE_NEXT_LEAF: 17,
      BPLUS_RANGE_RETURN_OUT: 20,
    },
    errorPlans: {
      TREE_EMPTY: [
        // range sobre árbol vacío
        { lineLabel: "BPLUS_RANGE_HEADER", hold: 600 },
        { lineLabel: "BPLUS_RANGE_ROOT_NULL_OR_INVALID_IF", hold: 900 },
      ],
      INVALID_RANGE: [
        // from > to
        { lineLabel: "BPLUS_RANGE_HEADER", hold: 600 },
        { lineLabel: "BPLUS_RANGE_ROOT_NULL_OR_INVALID_IF", hold: 900 },
      ],
    },
  },


    scanFrom: {
    lines: [
      `/** Emite hasta 'limit' claves comenzando en 'start' (inclusive). */`, // 0
      `public ListaCD<T> scanFrom(T {0}, int {1}) {`, // 1
      `    ListaCD<T> out = new ListaCD<>();`, // 2
      `    if (root == null || {1} <= 0) return out;`, // 3
      `    BPlusNode x = root;`, // 4
      `    while (!x.leaf) {`, // 5
      `        int i = childIndexToDescend(x.keys, {0});`, // 6
      `        x = x.child[i];`, // 7
      `    }`, // 8
      `    int i = lowerBound(x.keys, {0});`, // 9
      `    int left = {1};`, // 10
      `    while (x != null && left > 0) {`, // 11
      `        while (i < x.keys.size() && left > 0) {`, // 12
      `            out.insertarAlFinal(x.keys.get(i));`, // 13
      `            i++; left--;`, // 14
      `        }`, // 15
      `        x = x.nextLeaf;`, // 16
      `        i = 0;`, // 17
      `    }`, // 18
      `    return out;`, // 19
      `}`, // 20
    ],
    labels: {
      BPLUS_SCAN_HEADER: 1,
      BPLUS_SCAN_INIT_OUT: 2,
      BPLUS_SCAN_ROOT_NULL_OR_LIMIT_IF: 3,
      BPLUS_SCAN_INIT_X: 4,
      BPLUS_SCAN_DESCEND_WHILE: 5,
      BPLUS_SCAN_CHILD_INDEX: 6,
      BPLUS_SCAN_LOWER_BOUND: 9,
      BPLUS_SCAN_INIT_LEFT: 10,
      BPLUS_SCAN_WHILE_LEAVES: 11,
      BPLUS_SCAN_INNER_WHILE: 12,
      BPLUS_SCAN_EMIT_KEY: 13,
      BPLUS_SCAN_NEXT_LEAF: 16,
      BPLUS_SCAN_RETURN_OUT: 19,
    },
    errorPlans: {
      TREE_EMPTY: [
        // scanFrom sobre árbol vacío
        { lineLabel: "BPLUS_SCAN_HEADER", hold: 600 },
        { lineLabel: "BPLUS_SCAN_ROOT_NULL_OR_LIMIT_IF", hold: 900 },
      ],
      INVALID_SCAN_LIMIT: [
        // limit <= 0
        { lineLabel: "BPLUS_SCAN_HEADER", hold: 600 },
        { lineLabel: "BPLUS_SCAN_ROOT_NULL_OR_LIMIT_IF", hold: 900 },
      ],
    },
  },


  /* ╔════════════════════════════════════════════╗
     ║              TRAVERSALS UI                 ║
     ╚════════════════════════════════════════════╝ */
  getInOrder: {
    lines: [
      `/** In-Order para UI: recorrer todas las hojas por nextLeaf y emitir sus claves. */`, // 0
      `public void inOrderUI(ListaCD<T> out) {`, // 1
      `    if (root == null) return;`, // 2
      `    // ir a la hoja más a la izquierda`, // 3
      `    BPlusNode x = root;`, // 4
      `    while (!x.leaf) x = x.child[0];`, // 5
      `    // recorrer por el "belt" de hojas`, // 6
      `    while (x != null) {`, // 7
      `        for (int i=0; i<x.keys.size(); i++) out.insertarAlFinal(x.keys.get(i));`, // 8
      `        x = x.nextLeaf;`, // 9
      `    }`, // 10
      `}`, // 11
    ],
    labels: {
      BPLUS_INORDER_HEADER: 1,
      BPLUS_INORDER_ROOT_NULL_IF: 2,
      BPLUS_INORDER_GO_LEFT_COMMENT: 3,
      BPLUS_INORDER_INIT_X: 4,
      BPLUS_INORDER_DESCEND_WHILE: 5,
      BPLUS_INORDER_TRAVERSE_BELT_COMMENT: 6,
      BPLUS_INORDER_WHILE_LEAVES: 7,
      BPLUS_INORDER_FOR_EMIT_KEYS: 8,
    },
    errorPlans: {
      TREE_EMPTY: [
        { lineLabel: "BPLUS_INORDER_HEADER", hold: 600 },
        { lineLabel: "BPLUS_INORDER_ROOT_NULL_IF", hold: 800 },
      ],
    },
  },

  getLevelOrder: {
    lines: [
      `/** BFS de nodos (útil para depurar estructura interna). Emite keys por nodo visitado. */`, // 0
      `public ListaCD<T> getLevelOrder() {`, // 1
      `    ListaCD<T> out = new ListaCD<>();`, // 2
      `    if (root == null) return out;`, // 3
      `    Cola<BPlusNode> q = new Cola<>();`, // 4
      `    q.encolar(root);`, // 5
      `    while (!q.esVacia()) {`, // 6
      `        BPlusNode x = q.decolar();`, // 7
      `        for (int i=0; i<x.keys.size(); i++) out.insertarAlFinal(x.keys.get(i));`, // 8
      `        if (!x.leaf)`, // 9
      `            for (int i=0; i<=x.keys.size(); i++) q.encolar(x.child[i]);`, // 10
      `    }`, // 11
      `    return out;`, // 12
      `}`, // 13
    ],
    labels: {
      BPLUS_LEVEL_HEADER: 1,
      BPLUS_LEVEL_INIT_OUT: 2,
      BPLUS_LEVEL_ROOT_NULL_IF: 3,
      BPLUS_LEVEL_INIT_QUEUE: 4,
      BPLUS_LEVEL_ENQUEUE_ROOT: 5,
      BPLUS_LEVEL_WHILE_LOOP: 6,
      BPLUS_LEVEL_DEQUEUE_X: 7,
      BPLUS_LEVEL_FOR_EMIT_KEYS: 8,
      BPLUS_LEVEL_IF_NOT_LEAF: 9,
      BPLUS_LEVEL_FOR_ENQUEUE_CHILDREN: 10,
      BPLUS_LEVEL_RETURN_OUT: 12,
    },
    errorPlans: {
      TREE_EMPTY: [
        { lineLabel: "BPLUS_LEVEL_HEADER", hold: 600 },
        { lineLabel: "BPLUS_LEVEL_ROOT_NULL_IF", hold: 800 },
      ],
    },
  },

  /* ╔════════════════════════════════════════════╗
     ║                  CLEAN                     ║
     ╚════════════════════════════════════════════╝ */
  clean: {
    lines: [
      `/** Vacía completamente el Árbol B+. */`, // 0
      `public void clean() {`, // 1
      `    root = null;`, // 2
      `}`, // 3
    ],
    // Reutilizamos el mismo label genérico que en otros árboles.
    labels: {
      CLEAR_ROOT: 2, // root = null;
    },
  },
});
