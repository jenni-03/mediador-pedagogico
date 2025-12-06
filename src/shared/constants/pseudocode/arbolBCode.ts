// pseudocode/arbol_b/getArbolBCode.ts
import { OperationCode } from "./typesPseudoCode";

/**
 * Pseudocódigo de Árbol B (grado mínimo t ≥ 2)
 * BTreeNode:
 *   keys: lista ordenada de T (t-1 .. 2t-1 claves)
 *   child: arreglo de hijos (0 .. 2t)   // child.length = keys.length + 1 cuando no es hoja
 *   leaf: boolean
 *   t: grado mínimo
 *
 * Propiedades:
 *  - Toda hoja al mismo nivel.
 *  - Todo nodo (excepto raíz) tiene al menos t-1 claves y como máximo 2t-1.
 *  - La raíz tiene entre 1 y 2t-1 claves (o 0 si árbol vacío).
 */
export const getArbolBCode = (): Record<string, OperationCode> => ({
  /* ───────────────── insert(k) ───────────────── */
insert: {
  lines: [
    `/**`,
    ` * Inserta un valor en el Árbol B.`,
    ` * Si la raíz está llena, se crea una nueva raíz y se hace split.`,
    ` */`,
    `public void insert(T {0}) {`,
    `    // Caso 0: árbol vacío → crear raíz [k] hoja`,
    `    if (root == null){`,
    `        checkCap(1);  // verifica capacidad para 1 nodo (raíz)`,
    `        root = new BTreeNode(t, true);`,
    `        root.keys.add({0});`,
    `        // size = 1`,
    `        return;`,
    `    }`,
    ``,
    `    // Caso 1: no se permiten claves duplicadas`,
    `    if (contiene({0})){`,
    `        throw new IllegalStateException("La clave ya existe en el árbol");`,
    `    }`,
    ``,
    `    // Caso 2: raíz llena → dividir antes de descender`,
    `    if (root.keys.size() == 2*t - 1){`,
    `        checkCap(1);  // nueva raíz (s)`,
    `        BTreeNode s = new BTreeNode(t, false);`,
    `        s.child[0] = root;`,
    `        splitChild(s, 0, root);`,
    `        int i = ({0}.compareTo(s.keys.get(0)) > 0) ? 1 : 0;`,
    `        insertNonFull(s.child[i], {0});`,
    `        root = s;`,
    `    } else {`,
    `        insertNonFull(root, {0});`,
    `    }`,
    `}`,
    ``,
    `/** Inserta k en un nodo que NO está lleno. */`,
    `private void insertNonFull(BTreeNode x, T {0}) {`,
    `    int i = x.keys.size() - 1;`,
    `    if (x.leaf) {`,
    `        // Insertar en la posición ordenada`,
    `        x.keys.add(null); // espacio`,
    `        while (i >= 0 && {0}.compareTo(x.keys.get(i)) < 0) {`,
    `            x.keys.set(i+1, x.keys.get(i));`,
    `            i--;`,
    `        }`,
    `        x.keys.set(i+1, {0});`,
    `    } else {`,
    `        // Encontrar hijo de descenso`,
    `        while (i >= 0 && {0}.compareTo(x.keys.get(i)) < 0) i--;`,
    `        i++;`,
    `        if (x.child[i] == null){`,
    `            throw new IllegalStateException("Árbol B inconsistente: hijo nulo durante inserción");`,
    `        }`,
    `        if (x.child[i].keys.size() == 2*t - 1) {`,
    `            splitChild(x, i, x.child[i]);`,
    `            if ({0}.compareTo(x.keys.get(i)) > 0) i++;`,
    `        }`,
    `        insertNonFull(x.child[i], {0});`,
    `    }`,
    `}`,
    ``,
    `/** Divide el hijo y de x en dos nodos con t-1 claves y promueve la clave media. */`,
    `private void splitChild(BTreeNode x, int i, BTreeNode y) {`,
    `    if (y.keys.size() != 2*t - 1){`,
    `        throw new IllegalStateException("splitChild: se esperaba hijo lleno (2t-1 claves)");`,
    `    }`,
    `    checkCap(1);  // se creará un nuevo nodo z`,
    `    BTreeNode z = new BTreeNode(t, y.leaf);`,
    `    // z recibe las últimas t-1 claves de y`,
    `    for (int j = 0; j < t-1; j++) z.keys.add(y.keys.remove(t));`,
    `    if (!y.leaf) {`,
    `        for (int j = 0; j < t; j++) z.child[j] = y.child[t + j];`,
    `        for (int j = 0; j < t; j++) y.child[t + j] = null;`,
    `    }`,
    `    // Insertar nueva clave media en x`,
    `    x.keys.add(i, y.keys.remove(t-1));`,
    `    // Reacomodar hijos de x`,
    `    shiftRight(x.child, i+1);`,
    `    x.child[i+1] = z;`,
    `}`,
  ],

  labels: {
    // ───────── public void insert(T k) ─────────
    BT_INSERT_ROOT_EMPTY_COMMENT: 5,           // // Caso 0: árbol vacío...
    BT_INSERT_ROOT_EMPTY_IF: 6,                // if (root == null){
    BT_INSERT_CHECK_CAP_ROOT_EMPTY: 7,         // checkCap(1)...
    BT_INSERT_NEW_ROOT_NODE: 8,                // root = new BTreeNode...
    BT_INSERT_ROOT_ADD_KEY: 9,                 // root.keys.add(k);
    BT_INSERT_ROOT_SIZE_COMMENT: 10,           // // size = 1
    BT_INSERT_RETURN_AFTER_NEW_ROOT: 11,       // return;

    BT_INSERT_DUPLICATE_COMMENT: 14,           // // Caso 1: no se permiten...
    BT_INSERT_DUPLICATE_IF: 15,                // if (contiene(k)){
    BT_INSERT_DUPLICATE_THROW: 16,             // throw new IllegalStateException(...);

    BT_INSERT_ROOT_FULL_COMMENT: 19,           // // Caso 2: raíz llena...
    BT_INSERT_ROOT_FULL_IF: 20,                // if (root.keys.size() == 2*t - 1){
    BT_INSERT_CHECK_CAP_NEW_ROOT: 21,          // checkCap(1);  // nueva raíz
    BT_INSERT_NEW_S_NODE: 22,                  // BTreeNode s = new BTreeNode(t, false);
    BT_INSERT_ATTACH_OLD_ROOT: 23,             // s.child[0] = root;
    BT_INSERT_SPLIT_OLD_ROOT: 24,              // splitChild(s, 0, root);
    BT_INSERT_COMPUTE_I: 25,                   // int i = (...)? 1 : 0;
    BT_INSERT_CALL_NONFULL_S_CHILD: 26,        // insertNonFull(s.child[i], k);
    BT_INSERT_SET_NEW_ROOT: 27,                // root = s;
    BT_INSERT_CALL_NONFULL_ROOT: 29,           // insertNonFull(root, k);

    // ───────── insertNonFull(x, k) ─────────
    BT_NONFULL_INIT_I: 35,                     // int i = x.keys.size() - 1;
    BT_NONFULL_IF_LEAF: 36,                    // if (x.leaf) {
    BT_NONFULL_LEAF_COMMENT: 37,               // // Insertar en la posición ordenada
    BT_NONFULL_LEAF_ADD_SPACE: 38,             // x.keys.add(null); // espacio
    BT_NONFULL_LEAF_WHILE_SHIFT_COND: 39,      // while (i >= 0 && k.compareTo(...) < 0) {
    BT_NONFULL_LEAF_SHIFT_ASSIGN: 40,          // x.keys.set(i+1, x.keys.get(i));
    BT_NONFULL_LEAF_SHIFT_DEC_I: 41,           // i--;
    BT_NONFULL_LEAF_SET_KEY: 43,               // x.keys.set(i+1, k);

    BT_NONFULL_INTERNAL_ELSE: 44,              // } else {
    BT_NONFULL_DESC_COMMENT: 45,               // // Encontrar hijo de descenso
    BT_NONFULL_DESC_WHILE_COND: 46,            // while (i >= 0 && k.compareTo(...) < 0) i--;
    BT_NONFULL_DESC_INC_I: 47,                 // i++;
    BT_NONFULL_CHILD_NULL_IF: 48,              // if (x.child[i] == null){
    BT_NONFULL_CHILD_NULL_THROW: 49,           // throw new IllegalStateException("Árbol B inconsistente...");
    BT_NONFULL_CHILD_FULL_IF: 51,              // if (x.child[i].keys.size() == 2*t - 1) {
    BT_NONFULL_CHILD_SPLIT_CALL: 52,           // splitChild(x, i, x.child[i]);
    BT_NONFULL_CHILD_UPDATE_I_AFTER_SPLIT: 53, // if (k.compareTo(x.keys.get(i)) > 0) i++;
    BT_NONFULL_RECURSE_CHILD: 55,              // insertNonFull(x.child[i], k);

    // ───────── splitChild(x, i, y) ─────────
    BT_SPLIT_EXPECT_FULL_IF: 61,               // if (y.keys.size() != 2*t - 1){
    BT_SPLIT_EXPECT_FULL_THROW: 62,            // throw new IllegalStateException("splitChild: se esperaba hijo lleno...");
    BT_SPLIT_CHECK_CAP_Z: 64,                  // checkCap(1);  // se creará un nuevo nodo z
    BT_SPLIT_INIT_Z: 65,                       // BTreeNode z = new BTreeNode(t, y.leaf);
    BT_SPLIT_COMMENT_LAST_KEYS: 66,            // // z recibe las últimas...
    BT_SPLIT_MOVE_LAST_KEYS_FOR: 67,           // for (int j = 0; j < t-1; j++) ...
    BT_SPLIT_IF_Y_NOT_LEAF: 68,                // if (!y.leaf) {
    BT_SPLIT_MOVE_CHILDREN_FOR: 69,            // for (int j = 0; j < t; j++) z.child[j] = ...
    BT_SPLIT_CLEAR_CHILDREN_FOR: 70,           // for (int j = 0; j < t; j++) y.child[t + j] = null;
    BT_SPLIT_INSERT_MEDIAN_IN_X: 73,           // x.keys.add(i, y.keys.remove(t-1));
    BT_SPLIT_SHIFT_CHILDREN_ARRAY: 75,         // shiftRight(x.child, i+1);
    BT_SPLIT_ATTACH_Z_CHILD: 76,               // x.child[i+1] = z;
  },

  errorPlans: {
    KEY_ALREADY_EXISTS: [
      { lineLabel: "BT_INSERT_DUPLICATE_IF", hold: 600 },
      { lineLabel: "BT_INSERT_DUPLICATE_THROW", hold: 800 },
    ],
    MAX_NODES_REACHED: [
      { lineLabel: "BT_INSERT_CHECK_CAP_ROOT_EMPTY", hold: 600 },
      { lineLabel: "BT_INSERT_CHECK_CAP_NEW_ROOT", hold: 600 },
      { lineLabel: "BT_SPLIT_CHECK_CAP_Z", hold: 600 },
    ],
    INCONSISTENT_TREE: [
      { lineLabel: "BT_NONFULL_CHILD_NULL_IF", hold: 600 },
      { lineLabel: "BT_NONFULL_CHILD_NULL_THROW", hold: 800 },
      { lineLabel: "BT_SPLIT_EXPECT_FULL_IF", hold: 600 },
      { lineLabel: "BT_SPLIT_EXPECT_FULL_THROW", hold: 800 },
    ],
  },
},

  /* ───────────────── delete(k) ───────────────── */
  delete: {
    lines: [
      `/**`,
      ` * Elimina una clave k del Árbol B (CLRS-style).`,
      ` */`,
      `public void delete(T {0}) {`,
      `    if (root == null) return;`,
      `    deleteFromNode(root, {0});`,
      `    // Ajuste de raíz: si quedó sin claves y tiene hijo, desciende`,
      `    if (root.keys.size() == 0 && !root.leaf) root = root.child[0];`,
      `    if (root.keys.size() == 0 && root.leaf) root = null;`,
      `}`,
      ``,
      `/** Elimina k del subárbol enraizado en x. */`,
      `private void deleteFromNode(BTreeNode x, T {0}) {`,
      `    int idx = indexOf(x.keys, {0}); // -1 si no está`,
      `    if (idx != -1) {`,
      `        if (x.leaf) {`,
      `            x.keys.remove(idx);`,
      `        } else {`,
      `            // Reemplazar por predecesor o sucesor y borrar abajo`,
      `            BTreeNode y = x.child[idx];`,
      `            BTreeNode z = x.child[idx+1];`,
      `            if (y.keys.size() >= t) {`,
      `                T pred = getPredecessor(y);`,
      `                x.keys.set(idx, pred);`,
      `                deleteFromNode(y, pred);`,
      `            } else if (z.keys.size() >= t) {`,
      `                T succ = getSuccessor(z);`,
      `                x.keys.set(idx, succ);`,
      `                deleteFromNode(z, succ);`,
      `            } else {`,
      `                merge(x, idx); // fusiona y + {0} + z en y`,
      `                deleteFromNode(y, {0});`,
      `            }`,
      `        }`,
      `    } else {`,
      `        if (x.leaf) return;`,
      `        int i = childIndexToDescend(x.keys, {0});`,
      `        // Asegurar que el hijo tiene >= t claves antes de descender`,
      `        if (x.child[i].keys.size() < t) fill(x, i);`,
      `        // Tras fill, puede que i cambie si fusionamos con el derecho`,
      `        if (i > x.keys.size()) i = x.keys.size();`,
      `        deleteFromNode(x.child[i], {0});`,
      `    }`,
      `}`,
      ``,
      `/** Si child[i] tiene t-1 claves, lo arregla tomando de hermanos o fusionando. */`,
      `private void fill(BTreeNode x, int i) {`,
      `    if (i > 0 && x.child[i-1].keys.size() >= t)`,
      `        borrowFromPrev(x, i);`,
      `    else if (i < x.keys.size() && x.child[i+1].keys.size() >= t)`,
      `        borrowFromNext(x, i);`,
      `    else {`,
      `        if (i < x.keys.size()) merge(x, i); else merge(x, i-1);`,
      `    }`,
      `}`,
      ``,
      `private void borrowFromPrev(BTreeNode x, int i) {`,
      `    BTreeNode c = x.child[i];`,
      `    BTreeNode s = x.child[i-1];`,
      `    // Desplazar claves/hijos en c hacia la derecha`,
      `    shiftRight(c.child, 0);`,
      `    c.keys.add(0, x.keys.get(i-1));`,
      `    if (!c.leaf) c.child[0] = s.child[s.keys.size()+1];`,
      `    x.keys.set(i-1, s.keys.remove(s.keys.size()-1));`,
      `}`,
      ``,
      `private void borrowFromNext(BTreeNode x, int i) {`,
      `    BTreeNode c = x.child[i];`,
      `    BTreeNode s = x.child[i+1];`,
      `    c.keys.add(x.keys.get(i));`,
      `    if (!c.leaf) c.child[c.keys.size()] = s.child[0];`,
      `    x.keys.set(i, s.keys.remove(0));`,
      `    shiftLeft(s.child, 0);`,
      `}`,
      ``,
      `/** Fusiona child[k] + x.keys[k] + child[k+1] en child[k]. */`,
      `private void merge(BTreeNode x, int k) {`,
      `    BTreeNode y = x.child[k];`,
      `    BTreeNode z = x.child[k+1];`,
      `    y.keys.add(x.keys.remove(k));`,
      `    // mover claves de z`,
      `    for (T val : z.keys) y.keys.add(val);`,
      `    if (!z.leaf) {`,
      `        int base = y.keys.size() - z.keys.size();`,
      `        for (int i=0; i<=z.keys.size(); i++) y.child[base + i] = z.child[i];`,
      `    }`,
      `    removeChildAt(x.child, k+1);`,
      `}`,
      ``,
      `private T getPredecessor(BTreeNode x) {`,
      `    while (!x.leaf) x = x.child[x.keys.size()];`,
      `    return x.keys.get(x.keys.size()-1);`,
      `}`,
      ``,
      `private T getSuccessor(BTreeNode x) {`,
      `    while (!x.leaf) x = x.child[0];`,
      `    return x.keys.get(0);`,
      `}`,
    ],
      labels: {
    /* ────────────── delete(k) wrapper ────────────── */
    BT_DELETE_FN_HEADER: 3,                         // public void delete(T {0}) {
    BT_DELETE_ROOT_NULL_IF: 4,                      // if (root == null) return;
    BT_DELETE_CALL_DELETE_FROM_NODE: 5,             // deleteFromNode(root, {0});
    BT_DELETE_ROOT_FIX_INTERNAL: 7,                 // if (root.keys.size() == 0 && !root.leaf) ...
    BT_DELETE_ROOT_FIX_LEAF: 8,                     // if (root.keys.size() == 0 && root.leaf) ...

    /* ────────────── deleteFromNode(x, k) ────────────── */
    BT_DELETE_NODE_HEADER: 12,                      // private void deleteFromNode...
    BT_DELETE_NODE_IDX_INIT: 13,                    // int idx = indexOf(x.keys, {0});
    BT_DELETE_NODE_IF_FOUND: 14,                    // if (idx != -1) {
    BT_DELETE_NODE_IF_LEAF: 15,                     // if (x.leaf) {
    BT_DELETE_NODE_REMOVE_FROM_LEAF: 16,            // x.keys.remove(idx);
    BT_DELETE_NODE_INTERNAL_ELSE: 17,               // } else {
    BT_DELETE_NODE_COMMENT_REPLACE: 18,             // // Reemplazar por predecesor...
    BT_DELETE_NODE_Y_ASSIGN: 19,                    // BTreeNode y = x.child[idx];
    BT_DELETE_NODE_Z_ASSIGN: 20,                    // BTreeNode z = x.child[idx+1];
    BT_DELETE_NODE_LEFT_CAN_GIVE_IF: 21,            // if (y.keys.size() >= t) {
    BT_DELETE_NODE_PRED_ASSIGN: 22,                 // T pred = getPredecessor(y);
    BT_DELETE_NODE_SET_KEY_PRED: 23,                // x.keys.set(idx, pred);
    BT_DELETE_NODE_RECURSE_PRED: 24,                // deleteFromNode(y, pred);
    BT_DELETE_NODE_RIGHT_CAN_GIVE_ELSEIF: 25,       // } else if (z.keys.size() >= t) {
    BT_DELETE_NODE_SUCC_ASSIGN: 26,                 // T succ = getSuccessor(z);
    BT_DELETE_NODE_SET_KEY_SUCC: 27,                // x.keys.set(idx, succ);
    BT_DELETE_NODE_RECURSE_SUCC: 28,                // deleteFromNode(z, succ);
    BT_DELETE_NODE_MERGE_ELSE: 29,                  // } else {
    BT_DELETE_NODE_CALL_MERGE: 30,                  // merge(x, idx);
    BT_DELETE_NODE_RECURSE_AFTER_MERGE: 31,         // deleteFromNode(y, {0});

    BT_DELETE_NODE_NOT_FOUND_ELSE: 34,              // } else {
    BT_DELETE_NODE_LEAF_RETURN_IF: 35,              // if (x.leaf) return;
    BT_DELETE_NODE_CHILD_INDEX_ASSIGN: 36,          // int i = childIndexToDescend...
    BT_DELETE_NODE_FILL_COMMENT: 37,                // // Asegurar que el hijo...
    BT_DELETE_NODE_CHILD_NEEDS_FILL_IF: 38,         // if (x.child[i].keys.size() < t) ...
    BT_DELETE_NODE_AFTER_FILL_COMMENT: 39,          // // Tras fill, puede que i cambie...
    BT_DELETE_NODE_FIX_I_IF: 40,                    // if (i > x.keys.size()) ...
    BT_DELETE_NODE_RECURSE_DESCEND: 41,             // deleteFromNode(x.child[i], {0});

    /* ────────────── fill(x, i) ────────────── */
    BT_FILL_HEADER: 46,                             // private void fill(BTreeNode x, int i) {
    BT_FILL_BORROW_PREV_IF: 47,                     // if (i > 0 && x.child[i-1]...
    BT_FILL_CALL_BORROW_PREV: 48,                   // borrowFromPrev(x, i);
    BT_FILL_BORROW_NEXT_ELSEIF: 49,                 // else if (i < x.keys.size()...
    BT_FILL_CALL_BORROW_NEXT: 50,                   // borrowFromNext(x, i);
    BT_FILL_ELSE: 51,                               // else {
    BT_FILL_MERGE_OR_MERGELEFT: 52,                 // if (i < x.keys.size()) merge...

    /* ────────────── borrowFromPrev(x, i) ────────────── */
    BT_BORROW_PREV_HEADER: 56,                      // private void borrowFromPrev...
    BT_BORROW_PREV_CHILD_ASSIGN: 57,                // BTreeNode c = x.child[i];
    BT_BORROW_PREV_SIBLING_ASSIGN: 58,              // BTreeNode s = x.child[i-1];
    BT_BORROW_PREV_COMMENT_SHIFT: 59,               // // Desplazar claves/hijos...
    BT_BORROW_PREV_SHIFT_RIGHT: 60,                 // shiftRight(c.child, 0);
    BT_BORROW_PREV_INSERT_KEY_FROM_PARENT: 61,      // c.keys.add(0, x.keys.get(i-1));
    BT_BORROW_PREV_MOVE_CHILD: 62,                  // if (!c.leaf) c.child[0] = ...
    BT_BORROW_PREV_SET_PARENT_KEY: 63,              // x.keys.set(i-1, s.keys.remove(...));

    /* ────────────── borrowFromNext(x, i) ────────────── */
    BT_BORROW_NEXT_HEADER: 66,                      // private void borrowFromNext...
    BT_BORROW_NEXT_CHILD_ASSIGN: 67,                // BTreeNode c = x.child[i];
    BT_BORROW_NEXT_SIBLING_ASSIGN: 68,              // BTreeNode s = x.child[i+1];
    BT_BORROW_NEXT_ADD_KEY_FROM_PARENT: 69,         // c.keys.add(x.keys.get(i));
    BT_BORROW_NEXT_MOVE_CHILD: 70,                  // if (!c.leaf) c.child[c.keys.size()] = ...
    BT_BORROW_NEXT_SET_PARENT_KEY: 71,              // x.keys.set(i, s.keys.remove(0));
    BT_BORROW_NEXT_SHIFT_LEFT: 72,                  // shiftLeft(s.child, 0);

    /* ────────────── merge(x, k) ────────────── */
    BT_MERGE_HEADER: 76,                            // private void merge(BTreeNode x, int k) {
    BT_MERGE_Y_ASSIGN: 77,                          // BTreeNode y = x.child[k];
    BT_MERGE_Z_ASSIGN: 78,                          // BTreeNode z = x.child[k+1];
    BT_MERGE_PULL_SEP_KEY: 79,                      // y.keys.add(x.keys.remove(k));
    BT_MERGE_MOVE_Z_KEYS_COMMENT: 80,               // // mover claves de z
    BT_MERGE_MOVE_Z_KEYS_FOR: 81,                   // for (T val : z.keys) ...
    BT_MERGE_MOVE_Z_CHILDREN_IF: 82,                // if (!z.leaf) {
    BT_MERGE_BASE_INDEX_ASSIGN: 83,                 // int base = ...
    BT_MERGE_ASSIGN_CHILDREN_FOR: 84,               // for (int i=0; i<=z.keys.size()...
    BT_MERGE_REMOVE_RIGHT_CHILD: 86,                // removeChildAt(x.child, k+1);

    /* ────────────── getPredecessor / getSuccessor ────────────── */
    BT_GET_PRED_HEADER: 89,                         // private T getPredecessor...
    BT_GET_PRED_WHILE: 90,                          // while (!x.leaf) ...
    BT_GET_PRED_RETURN: 91,                         // return x.keys.get(x.keys.size()-1);

    BT_GET_SUCC_HEADER: 94,                         // private T getSuccessor...
    BT_GET_SUCC_WHILE: 95,                          // while (!x.leaf) ...
    BT_GET_SUCC_RETURN: 96,                         // return x.keys.get(0);
  },

  errorPlans: {
    /* 
       TREE_EMPTY / KEY_NOT_FOUND vienen de ArbolB.eliminar(), 
       antes de llamar a deleteRec/deleteFromNode.
       Los planes simplemente “ponen contexto” en el pseudocódigo de delete.
    */

    TREE_EMPTY: [
      // Árbol vacío al intentar borrar
      { lineLabel: "BT_DELETE_ROOT_NULL_IF", hold: 700 },
    ],

    KEY_NOT_FOUND: [
      // Se intentó borrar una clave que no está en el árbol
      { lineLabel: "BT_DELETE_NODE_IDX_INIT", hold: 600 },      // cálculo de idx
      { lineLabel: "BT_DELETE_NODE_NOT_FOUND_ELSE", hold: 800 } // rama "else" (no encontrada)
    ],

    INCONSISTENT_TREE: [
      // Cualquier DomainError "INCONSISTENT_TREE" durante delete/borrow/merge
      { lineLabel: "BT_DELETE_NODE_CHILD_NEEDS_FILL_IF", hold: 500 },
      { lineLabel: "BT_FILL_HEADER", hold: 500 },
      { lineLabel: "BT_BORROW_PREV_HEADER", hold: 500 },
      { lineLabel: "BT_BORROW_NEXT_HEADER", hold: 500 },
      { lineLabel: "BT_MERGE_HEADER", hold: 700 },
    ],
  },
},

 /* ───────────────── search(k) ───────────────── */
search: {
  lines: [
    `/**`,
    ` * Busca un valor en el Árbol B.`,
    ` */`,
    `public boolean search(T {0}) {`,
    `    if (root == null) return false;`,
    `    return searchRec(root, {0});`,
    `}`,
    ``,
    `private boolean searchRec(BTreeNode x, T {0}) {`,
    `    if (x == null) return false;`,
    `    int i = lowerBound(x.keys, {0}); // primer índice >= {0}`,
    `    if (i < x.keys.size() && x.keys.get(i).equals({0})) return true;`,
    `    if (x.leaf) return false;`,
    `    return searchRec(x.child[i], {0});`,
    `}`,
  ],

  labels: {
    /* ────────────── search(k) wrapper ────────────── */
    BT_SEARCH_FN_HEADER: 3,             // public boolean search(T {0}) {
    BT_SEARCH_ROOT_NULL_IF: 4,          // if (root == null) return false;
    BT_SEARCH_CALL_RECURSIVE: 5,        // return searchRec(root, {0});

    /* ────────────── searchRec(x, k) ────────────── */
    BT_SEARCH_REC_HEADER: 8,            // private boolean searchRec(BTreeNode x, T {0}) {
    BT_SEARCH_REC_X_NULL_IF: 9,         // if (x == null) return false;
    BT_SEARCH_REC_LOWER_BOUND: 10,      // int i = lowerBound(x.keys, {0});
    BT_SEARCH_REC_HIT_IF: 11,           // if (i < x.keys.size() && x.keys.get(i).equals({0})) return true;
    BT_SEARCH_REC_LEAF_RETURN_IF: 12,   // if (x.leaf) return false;
    BT_SEARCH_REC_RECURSE_CHILD: 13,    // return searchRec(x.child[i], {0});
  },

  errorPlans: {
    /*
      Igual que en delete, estos errores no los lanza directamente searchRec,
      sino la capa de dominio (ArbolB / UI) antes o después de la búsqueda.
      Aquí solo usamos el pseudocódigo para "explicar" qué pasó.
    */

    TREE_EMPTY: [
      // Se intentó buscar en un árbol vacío
      { lineLabel: "BT_SEARCH_FN_HEADER", hold: 500 },     // public boolean search...
      { lineLabel: "BT_SEARCH_ROOT_NULL_IF", hold: 900 },  // if (root == null) return false;
    ],

    KEY_NOT_FOUND: [
      // Se recorrió el árbol y la clave no se encontró
      { lineLabel: "BT_SEARCH_REC_LOWER_BOUND", hold: 600 },   // cálculo de i
      { lineLabel: "BT_SEARCH_REC_HIT_IF", hold: 700 },        // if (...) return true; (condición falla)
      { lineLabel: "BT_SEARCH_REC_LEAF_RETURN_IF", hold: 900 } // if (x.leaf) return false;
    ],

    INCONSISTENT_TREE: [
      // Cualquier DomainError "INCONSISTENT_TREE" detectado al consultar estructura
      { lineLabel: "BT_SEARCH_REC_HEADER", hold: 500 },
      { lineLabel: "BT_SEARCH_REC_LOWER_BOUND", hold: 600 },
      { lineLabel: "BT_SEARCH_REC_RECURSE_CHILD", hold: 700 },
    ],
  },
},

  /* ───────────────── getInOrder() ───────────────── */
  getInOrder: {
    lines: [
      `/**`,
      ` * InOrden generalizado:`,
      ` *  Para m = keys.size() claves ->`,
      ` *  child[0], k0, child[1], k1, ..., child[m],`,
      ` */`,
      `private void inOrder(BTreeNode n, ListaCD<T> out) {`,
      `    if (n == null) return;`,
      `    for (int i=0; i<n.keys.size(); i++) {`,
      `        if (!n.leaf) inOrder(n.child[i], out);`,
      `        out.insertarAlFinal(n.keys.get(i));`,
      `    }`,
      `    if (!n.leaf) inOrder(n.child[n.keys.size()], out);`,
      `}`,
    ],
    labels: {
      // private void inOrder(BTreeNode n, ListaCD<T> out) {
      BT_INORDER_HEADER: 5,

      // if (n == null) return;
      BT_INORDER_NULL_IF: 6,

      // for (int i=0; i<n.keys.size(); i++) {
      BT_INORDER_FOR_LOOP: 7,

      // if (!n.leaf) inOrder(n.child[i], out);
      BT_INORDER_RECURSE_CHILD_IN_FOR: 8,

      // out.insertarAlFinal(n.keys.get(i));
      BT_INORDER_EMIT_KEY_IN_FOR: 9,

      // if (!n.leaf) inOrder(n.child[n.keys.size()], out);
      BT_INORDER_RECURSE_LAST_CHILD: 11,
    },
    errorPlans: {
      TREE_EMPTY: [
        // Árbol vacío al intentar InOrden
        { lineLabel: "BT_INORDER_HEADER", hold: 600 },
        { lineLabel: "BT_INORDER_NULL_IF", hold: 800 },
      ],
    },
  },

  /* ───────────────── getPreOrder() ───────────────── */
  getPreOrder: {
    lines: [
      `/**`,
      ` * PreOrden: primero todas las claves del nodo, luego hijos de izq→der.`,
      ` */`,
      `private void preOrder(BTreeNode n, ListaCD<T> out) {`,
      `    if (n == null) return;`,
      `    for (int i=0; i<n.keys.size(); i++) out.insertarAlFinal(n.keys.get(i));`,
      `    if (!n.leaf)`,
      `        for (int i=0; i<=n.keys.size(); i++) preOrder(n.child[i], out);`,
      `}`,
    ],
    labels: {
      // private void preOrder(BTreeNode n, ListaCD<T> out) {
      BT_PREORDER_HEADER: 3,

      // if (n == null) return;
      BT_PREORDER_NULL_IF: 4,

      // for (int i=0; i<n.keys.size(); i++) out.insertarAlFinal(n.keys.get(i));
      BT_PREORDER_FOR_EMIT_KEYS: 5,

      // if (!n.leaf)
      BT_PREORDER_IF_NOT_LEAF: 6,

      // for (int i=0; i<=n.keys.size(); i++) preOrder(n.child[i], out);
      BT_PREORDER_FOR_CHILDREN: 7,
    },
    errorPlans: {
      TREE_EMPTY: [
        // Árbol vacío al intentar PreOrden
        { lineLabel: "BT_PREORDER_HEADER", hold: 600 },
        { lineLabel: "BT_PREORDER_NULL_IF", hold: 800 },
      ],
    },
  },

  /* ───────────────── getPostOrder() ───────────────── */
  getPostOrder: {
    lines: [
      `/**`,
      ` * PostOrden: visitar todos los hijos y luego las claves del nodo.`,
      ` */`,
      `private void postOrder(BTreeNode n, ListaCD<T> out) {`,
      `    if (n == null) return;`,
      `    if (!n.leaf)`,
      `        for (int i=0; i<=n.keys.size(); i++) postOrder(n.child[i], out);`,
      `    for (int i=0; i<n.keys.size(); i++) out.insertarAlFinal(n.keys.get(i));`,
      `}`,
    ],
    labels: {
      // private void postOrder(BTreeNode n, ListaCD<T> out) {
      BT_POSTORDER_HEADER: 3,

      // if (n == null) return;
      BT_POSTORDER_NULL_IF: 4,

      // if (!n.leaf)
      BT_POSTORDER_IF_NOT_LEAF: 5,

      // for (int i=0; i<=n.keys.size(); i++) postOrder(n.child[i], out);
      BT_POSTORDER_FOR_CHILDREN: 6,

      // for (int i=0; i<n.keys.size(); i++) out.insertarAlFinal(n.keys.get(i));
      BT_POSTORDER_FOR_EMIT_KEYS: 7,
    },
    errorPlans: {
      TREE_EMPTY: [
        // Árbol vacío al intentar PostOrden
        { lineLabel: "BT_POSTORDER_HEADER", hold: 600 },
        { lineLabel: "BT_POSTORDER_NULL_IF", hold: 800 },
      ],
    },
  },

  /* ───────────────── getLevelOrder() ───────────────── */
  getLevelOrder: {
    lines: [
      `/**`,
      ` * BFS: encolar nodos; al visitar uno, emitir sus claves y encolar sus hijos.`,
      ` */`,
      `public ListaCD<T> getLevelOrder(BTreeNode root) {`,
      `    ListaCD<T> out = new ListaCD<T>();`,
      `    if (root == null) return out;`,
      `    Cola<BTreeNode> q = new Cola<BTreeNode>();`,
      `    q.encolar(root);`,
      `    while (!q.esVacia()) {`,
      `        BTreeNode x = q.decolar();`,
      `        for (int i=0; i<x.keys.size(); i++) out.insertarAlFinal(x.keys.get(i));`,
      `        if (!x.leaf)`,
      `            for (int i=0; i<=x.keys.size(); i++) q.encolar(x.child[i]);`,
      `    }`,
      `    return out;`,
      `}`,
    ],
    labels: {
      // public ListaCD<T> getLevelOrder(BTreeNode root) {
      BT_LEVEL_FN_HEADER: 3,

      // ListaCD<T> out = new ListaCD<T>();
      BT_LEVEL_INIT_OUT: 4,

      // if (root == null) return out;
      BT_LEVEL_ROOT_NULL_IF: 5,

      // Cola<BTreeNode> q = new Cola<BTreeNode>();
      BT_LEVEL_INIT_QUEUE: 6,

      // q.encolar(root);
      BT_LEVEL_ENQUEUE_ROOT: 7,

      // while (!q.esVacia()) {
      BT_LEVEL_WHILE_LOOP: 8,

      // BTreeNode x = q.decolar();
      BT_LEVEL_DEQUEUE_X: 9,

      // for (int i=0; i<x.keys.size(); i++) out.insertarAlFinal(x.keys.get(i));
      BT_LEVEL_FOR_EMIT_KEYS: 10,

      // if (!x.leaf)
      BT_LEVEL_IF_NOT_LEAF: 11,

      // for (int i=0; i<=x.keys.size(); i++) q.encolar(x.child[i]);
      BT_LEVEL_FOR_ENQUEUE_CHILDREN: 12,

      // return out;
      BT_LEVEL_RETURN_OUT: 14,
    },
    errorPlans: {
      TREE_EMPTY: [
        // Árbol vacío al intentar LevelOrder
        { lineLabel: "BT_LEVEL_FN_HEADER", hold: 600 },
        { lineLabel: "BT_LEVEL_INIT_OUT", hold: 600 },
        { lineLabel: "BT_LEVEL_ROOT_NULL_IF", hold: 800 },
      ],
    },
  },


  /* ───────────────── clean() ───────────────── */
  clean: {
    lines: [
      `/**`,
      ` * Vacía completamente el Árbol B.`,
      ` */`,
      `public void clean() {`,
      `    this.root = null;`,
      `}`,
    ],
    // Reutilizamos el mismo label que en el Árbol 1-2-3 para coherencia visual.
    labels: {
      CLEAR_ROOT: 5, // this.root = null;
    },
  },
});
