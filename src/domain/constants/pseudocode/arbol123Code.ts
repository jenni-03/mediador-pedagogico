import { OperationCode } from "./typesPseudoCode";

export const getArbol123Code = (): Record<string, OperationCode> => ({
  /* ───────────────── insert(value) ───────────────── */
  insert: {
    lines: [
      `/**`,
      ` * Inserta una clave en el Árbol 1-2-3 (2-3).`,
      ` * Desciende hasta una hoja, inserta la clave en orden`,
      ` * y luego repara posibles overflows (nodos con 3 claves).`,
      ` */`,
      `public void insert(T {0}){`,
      `    // Caso 1: árbol vacío → crear raíz (validando capacidad)`,
      `    if (raiz == null){`,
      `        checkCap(1);  // verifica capacidad para 1 nodo (raíz)`,
      `        Nodo23<T> nuevaRaiz = new Nodo23<T>();`,
      `        nuevaRaiz.keys.add({0});`,
      `        raiz = nuevaRaiz;`,
      `        // tamanio = 1`,
      `        return;`,
      `    }`,
      ``,
      `    // Caso 2: no se permiten claves duplicadas`,
      `    if (contiene({0})){`,
      `        throw new IllegalStateException("La clave ya existe en el árbol");`,
      `    }`,
      ``,
      `    // Caso 3: árbol no vacío → descender hasta una hoja`,
      `    Nodo23<T> cur = raiz;`,
      `    while (!cur.isLeaf()){`,
      `        int i = posicionDescenso(cur.keys, {0});`,
      `        Nodo23<T> hijo = cur.child[i];`,
      `        if (hijo == null){`,
      `            throw new IllegalStateException("Árbol inconsistente: hijo nulo durante el descenso");`,
      `        }`,
      `        cur = hijo;`,
      `    }`,
      ``,
      `    // Insertar la clave en la hoja encontrada`,
      `    insertarOrdenado(cur.keys, {0});`,
      ``,
      `    // Reparar posibles overflows hacia arriba (splits en cadena)`,
      `    repararOverflow(cur);`,
      `}`,
      ``,
      `/**`,
      ` * Repara overflows empezando en el nodo n y subiendo hacia la raíz.`,
      ` * Cada vez que un nodo tiene 3 claves, se separa en:`,
      ` *   L = [k0], R = [k2] y k1 se promueve al padre.`,
      ` */`,
      `private void repararOverflow(Nodo23<T> n){`,
      `    Nodo23<T> actual = n;`,
      `    int creados = 0;`,
      `    while (actual != null && actual.keys.size() > 2){`,
      `        // Debe haber exactamente 3 claves en el overflow`,
      `        if (actual.keys.size() != 3){`,
      `            throw new IllegalStateException("Overflow inválido: se esperaban 3 claves");`,
      `        }`,
      `        T k0 = actual.keys.get(0);`,
      `        T k1 = actual.keys.get(1);  // promovida`,
      `        T k2 = actual.keys.get(2);`,
      ``,
      `        // Copiar hijos actuales (si existen)`,
      `        Nodo23<T>[] hijos = actual.child;`,
      ``,
      `        // L = el mismo nodo actual (conserva su id)`,
      `        Nodo23<T> L = actual;`,
      `        L.keys.clear();`,
      `        L.keys.add(k0);`,
      ``,
      `        // R = nuevo hermano derecho`,
      `        checkCap(1);  // verifica capacidad para nuevo nodo R`,
      `        Nodo23<T> R = new Nodo23<T>();`,
      `        R.keys.add(k2);`,
      `        creados++;`,
      ``,
      `        // Repartir hijos entre L y R, si no es hoja`,
      `        if (hijos.length > 0){`,
      `            // [c0,c1] -> L, [c2,c3] -> R`,
      `            L.child[0] = hijos[0];`,
      `            L.child[1] = hijos[1];`,
      `            R.child[0] = hijos[2];`,
      `            R.child[1] = hijos[3];`,
      `        }`,
      ``,
      `        Nodo23<T> padre = L.parent;`,
      `        if (padre == null){`,
      `            // Overflow en la raíz → crear nueva raíz [k1] con hijos [L, R]`,
      `            checkCap(1);  // verifica capacidad para nueva raíz`,
      `            Nodo23<T> nuevaRaiz = new Nodo23<T>();`,
      `            nuevaRaiz.keys.add(k1);`,
      `            nuevaRaiz.child[0] = L;`,
      `            nuevaRaiz.child[1] = R;`,
      `            raiz = nuevaRaiz;`,
      `            creados++;`,
      `            actual = null;  // fin del lazo`,
      `        } else {`,
      `            // Insertar k1 en el padre y ubicar R a la derecha de L`,
      `            int posK = posicionDescenso(padre.keys, k1);`,
      `            insertarEnPosicion(padre.keys, posK, k1);`,
      ``,
      `            // Reubicar hijos del padre para insertar R`,
      `            int idxL = indiceDeHijo(padre, L);`,
      `            if (idxL == -1){`,
      `                throw new IllegalStateException("Inconsistencia: L no se encontró en el padre");`,
      `            }`,
      `            shiftRight(padre.child, idxL + 1);`,
      `            padre.child[idxL + 1] = R;`,
      ``,
      `            actual = padre;  // seguir subiendo por si el padre ahora overflowea`,
      `        }`,
      `    }`,
      ``,
      `    if (creados > 0){`,
      `        // Actualizar el número total de nodos del árbol`,
      `        tamanio = tamanio + creados;`,
      `    }`,
      `}`,
    ],
    labels: {
      // insert(...)
      INSERT_TREE_EMPTY_IF: 7,
      INSERT_CHECK_CAP_ROOT: 8,
      INSERT_NEW_ROOT_NODE: 9,
      INSERT_NEW_ROOT_KEY: 10,
      INSERT_SET_ROOT: 11,
      INSERT_ROOT_SIZE_COMMENT: 12,
      INSERT_RETURN: 13,

      INSERT_DUPLICATE_IF: 17,
      INSERT_DUPLICATE_THROW: 18,

      INSERT_INIT_CUR: 22,
      INSERT_WHILE_DESCEND: 23,
      INSERT_DESC_POS: 24,
      INSERT_DESC_CHILD_LOOKUP: 25,
      INSERT_DESC_CHILD_NULL_IF: 26,
      INSERT_DESC_CHILD_NULL_THROW: 27,

      INSERT_LEAF_INSERT: 33,
      INSERT_CALL_REPAIR: 36,

      // repararOverflow(...)
      OVERFLOW_INIT_ACTUAL: 45, // Nodo23<T> actual = n;
      OVERFLOW_INIT_CREATED: 46, // int creados = 0;
      OVERFLOW_WHILE: 47, // while (actual != null && actual.keys.size() > 2){
      OVERFLOW_SIZE_CHECK_IF: 49, // if (actual.keys.size() != 3){
      OVERFLOW_SIZE_CHECK_THROW: 50, // throw new IllegalStateException(...);

      OVERFLOW_GET_K0: 52, // T k0 = actual.keys.get(0);
      OVERFLOW_GET_K1: 53, // T k1 = actual.keys.get(1);
      OVERFLOW_GET_K2: 54, // T k2 = actual.keys.get(2);

      OVERFLOW_CHILDREN_ASSIGN: 57, // Nodo23<T>[] hijos = actual.child;

      OVERFLOW_SET_L: 60, // Nodo23<T> L = actual;
      OVERFLOW_L_CLEAR: 61, // L.keys.clear();
      OVERFLOW_L_ADD_K0: 62, // L.keys.add(k0);

      OVERFLOW_CHECK_CAP_NEW_R: 65, // checkCap(1);  // nuevo R
      OVERFLOW_NEW_R_NODE: 66, // Nodo23<T> R = new Nodo23<T>();
      OVERFLOW_R_ADD_K2: 67, // R.keys.add(k2);
      OVERFLOW_CREATED_INC: 68, // creados++;

      OVERFLOW_HAS_CHILDREN_IF: 71, // if (hijos.length > 0){
      OVERFLOW_DISTRIB_CHILDREN: 73, // L.child[0] = hijos[0]; (representa todo el bloque de reasignación)

      OVERFLOW_PARENT_ASSIGN: 79, // Nodo23<T> padre = L.parent;
      OVERFLOW_PARENT_IS_NULL_IF: 80, // if (padre == null){

      // Caso overflow en la raíz
      OVERFLOW_CHECK_CAP_NEW_ROOT: 82, // checkCap(1);  // nueva raíz
      OVERFLOW_NEW_ROOT_NODE: 83, // Nodo23<T> nuevaRaiz = new Nodo23<T>();
      OVERFLOW_NEW_ROOT_ADD_K1: 84, // nuevaRaiz.keys.add(k1);
      OVERFLOW_NEW_ROOT_SET_CHILDREN: 85, // nuevaRaiz.child[0] = L; (representa ambas asignaciones de hijos)
      OVERFLOW_SET_ROOT_NODE: 87, // raiz = nuevaRaiz;
      OVERFLOW_CREATED_INC_ROOT: 88, // creados++;
      OVERFLOW_SET_ACTUAL_NULL: 89, // actual = null;

      // Caso padre != null
      OVERFLOW_POSK_COMPUTE: 92, // int posK = posicionDescenso(padre.keys, k1);
      OVERFLOW_INSERT_EN_POSICION: 93, // insertarEnPosicion(padre.keys, posK, k1);

      OVERFLOW_FIND_IDX_L: 96, // int idxL = indiceDeHijo(padre, L);
      OVERFLOW_IDX_L_NOT_FOUND_IF: 97, // if (idxL == -1){
      OVERFLOW_IDX_L_NOT_FOUND_THROW: 98, // throw new IllegalStateException(...);

      OVERFLOW_SHIFT_RIGHT: 100, // shiftRight(padre.child, idxL + 1);
      OVERFLOW_SET_R_CHILD: 101, // padre.child[idxL + 1] = R;

      OVERFLOW_SET_ACTUAL_PARENT: 103, // actual = padre;

      OVERFLOW_CREATED_IF: 107, // if (creados > 0){
      OVERFLOW_UPDATE_TAMANIO: 109, // tamanio = tamanio + creados;
    },
    errorPlans: {
      KEY_ALREADY_EXISTS: [
        { lineLabel: "INSERT_DUPLICATE_IF", hold: 600 },
        { lineLabel: "INSERT_DUPLICATE_THROW", hold: 800 },
      ],
      MAX_NODES_REACHED: [
        { lineLabel: "INSERT_CHECK_CAP_ROOT", hold: 600 },
        { lineLabel: "OVERFLOW_CHECK_CAP_NEW_R", hold: 600 },
        { lineLabel: "OVERFLOW_CHECK_CAP_NEW_ROOT", hold: 600 },
      ],
      INCONSISTENT_TREE: [
        { lineLabel: "INSERT_DESC_CHILD_NULL_IF", hold: 600 },
        { lineLabel: "INSERT_DESC_CHILD_NULL_THROW", hold: 800 },
        { lineLabel: "OVERFLOW_SIZE_CHECK_IF", hold: 600 },
        { lineLabel: "OVERFLOW_SIZE_CHECK_THROW", hold: 800 },
        { lineLabel: "OVERFLOW_IDX_L_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "OVERFLOW_IDX_L_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── delete(value) ───────────────── */
  delete: {
    lines: [
      `/**`,
      ` * Elimina una clave del Árbol 1-2-3 (2-3).`,
      ` * Busca la clave, la elimina de una hoja`,
      ` * y repara posibles underflows (nodos con 0 claves).`,
      ` */`,
      `public void delete(T {0}){`,
      `    // Caso 0: árbol vacío`,
      `    if (raiz == null){`,
      `        throw new IllegalStateException("Árbol vacío: no se puede eliminar");`,
      `    }`,
      ``,
      `    // Paso 1: buscar la clave y asegurar que existe`,
      `    Nodo23<T> cur = raiz;`,
      `    int idxClave = -1;`,
      `    T clave = {0};`,
      ``,
      `    while (!cur.isLeaf()){`,
      `        int pos = posicionDescenso(cur.keys, clave);`,
      `        if (pos < cur.keys.size() && cur.keys.get(pos).compareTo(clave) == 0){`,
      `            // La clave está en un nodo interno → usar sucesor in-order`,
      `            Nodo23<T> succ = cur.child[pos + 1];`,
      `            while (!succ.isLeaf()){`,
      `                succ = succ.child[0];`,
      `            }`,
      `            T sucesor = succ.keys.get(0);`,
      `            cur.keys.set(pos, sucesor);`,
      `            clave = sucesor;`,
      `            cur = succ;`,
      `            break;`,
      `        } else {`,
      `            Nodo23<T> hijo = cur.child[pos];`,
      `            if (hijo == null){`,
      `                throw new IllegalStateException("Árbol inconsistente: hijo nulo durante delete");`,
      `            }`,
      `            cur = hijo;`,
      `        }`,
      `    }`,
      ``,
      `    // Ahora cur es la hoja en la que debe estar la clave`,
      `    idxClave = indiceEnNodo(cur.keys, clave);`,
      `    if (idxClave == -1){`,
      `        throw new IllegalStateException("Clave no encontrada en el árbol");`,
      `    }`,
      ``,
      `    // Paso 2: borrar la clave de la hoja`,
      `    eliminarEnPosicion(cur.keys, idxClave);`,
      ``,
      `    // Caso especial: si la raíz es hoja`,
      `    if (cur == raiz){`,
      `        if (raiz.keys.size() == 0){`,
      `            if (raiz.child[0] != null){`,
      `                raiz = raiz.child[0];`,
      `                raiz.parent = null;`,
      `            } else {`,
      `                raiz = null;  // árbol queda vacío`,
      `            }`,
      `        }`,
      `        return;`,
      `    }`,
      ``,
      `    // Paso 3: reparar underflow hacia arriba si la hoja quedó sin claves`,
      `    if (cur.keys.size() == 0){`,
      `        repararUnderflow(cur);`,
      `    }`,
      `}`,
      ``,
      `/**`,
      ` * Repara underflows empezando en el nodo n y subiendo hacia la raíz.`,
      ` * Si un nodo queda con 0 claves, intenta:`,
      ` *   1) Rotar (tomar prestada una clave de un hermano con 2 claves), o`,
      ` *   2) Fusionar con un hermano, bajando una clave del padre.`,
      ` */`,
      `private void repararUnderflow(Nodo23<T> n){`,
      `    Nodo23<T> actual = n;`,
      `    while (actual != null && actual.keys.size() == 0){`,
      `        Nodo23<T> padre = actual.parent;`,
      `        if (padre == null){`,
      `            // Underflow en la raíz`,
      `            if (actual.child[0] != null){`,
      `                raiz = actual.child[0];`,
      `                raiz.parent = null;`,
      `            } else {`,
      `                raiz = null;`,
      `            }`,
      `            actual = null;  // fin del lazo`,
      `        } else {`,
      `            int idxHijo = indiceDeHijo(padre, actual);`,
      `            if (idxHijo == -1){`,
      `                throw new IllegalStateException("Inconsistencia: hijo no encontrado en el padre (underflow)");`,
      `            }`,
      ``,
      `            Nodo23<T> hermanoIzq = (idxHijo > 0) ? padre.child[idxHijo - 1] : null;`,
      `            Nodo23<T> hermanoDer = (idxHijo < padre.numChildren() - 1) ? padre.child[idxHijo + 1] : null;`,
      ``,
      `            // Intentar rotación desde la izquierda`,
      `            if (hermanoIzq != null && hermanoIzq.keys.size() > 1){`,
      `                // mover última clave de hermanoIzq al padre`,
      `                T kMovida = hermanoIzq.keys.remove(hermanoIzq.keys.size() - 1);`,
      `                T kPadre = padre.keys.get(idxHijo - 1);`,
      `                insertarEnPosicion(actual.keys, 0, kPadre);`,
      `                padre.keys.set(idxHijo - 1, kMovida);`,
      ``,
      `                // reubicar hijo derecho de hermanoIzq como hijo izquierdo de actual`,
      `                Nodo23<T> sub = hermanoIzq.child[hermanoIzq.numChildren()];`,
      `                actual.child[1] = actual.child[0];`,
      `                actual.child[0] = sub;`,
      `                if (sub != null) sub.parent = actual;`,
      ``,
      `                actual = null;  // underflow resuelto`,
      `            }`,
      `            // Intentar rotación desde la derecha`,
      `            else if (hermanoDer != null && hermanoDer.keys.size() > 1){`,
      `                T kMovida = hermanoDer.keys.remove(0);`,
      `                T kPadre = padre.keys.get(idxHijo);`,
      `                insertarEnPosicion(actual.keys, actual.keys.size(), kPadre);`,
      `                padre.keys.set(idxHijo, kMovida);`,
      ``,
      `                // reubicar hijo izquierdo de hermanoDer como hijo derecho de actual`,
      `                Nodo23<T> sub = hermanoDer.child[0];`,
      `                actual.child[1] = sub;`,
      `                if (sub != null) sub.parent = actual;`,
      ``,
      `                actual = null;  // underflow resuelto`,
      `            }`,
      `            // Ningún hermano puede prestar: fusionar`,
      `            else {`,
      `                if (hermanoIzq != null){`,
      `                    // Fusionar hermanoIzq + clave del padre + actual`,
      `                    T kPadre = padre.keys.remove(idxHijo - 1);`,
      `                    insertarEnPosicion(hermanoIzq.keys, hermanoIzq.keys.size(), kPadre);`,
      ``,
      `                    // mover claves de actual a hermanoIzq`,
      `                    while (actual.keys.size() > 0){`,
      `                        T k = actual.keys.remove(0);`,
      `                        insertarEnPosicion(hermanoIzq.keys, hermanoIzq.keys.size(), k);`,
      `                    }`,
      ``,
      `                    // mover hijos de actual a hermanoIzq`,
      `                    for (int i = 0; i <= actual.numChildren(); i++){`,
      `                        Nodo23<T> sub = actual.child[i];`,
      `                        hermanoIzq.child[hermanoIzq.numChildren()] = sub;`,
      `                        if (sub != null) sub.parent = hermanoIzq;`,
      `                    }`,
      ``,
      `                    // correr hijos en el padre para cerrar hueco`,
      `                    shiftLeft(padre.child, idxHijo);`,
      ``,
      `                    actual = padre;  // el padre podría quedar con 0 claves`,
      `                } else if (hermanoDer != null){`,
      `                    // Fusionar actual + clave del padre + hermanoDer`,
      `                    T kPadre = padre.keys.remove(idxHijo);`,
      `                    insertarEnPosicion(actual.keys, actual.keys.size(), kPadre);`,
      ``,
      `                    while (hermanoDer.keys.size() > 0){`,
      `                        T k = hermanoDer.keys.remove(0);`,
      `                        insertarEnPosicion(actual.keys, actual.keys.size(), k);`,
      `                    }`,
      ``,
      `                    for (int i = 0; i <= hermanoDer.numChildren(); i++){`,
      `                        Nodo23<T> sub = hermanoDer.child[i];`,
      `                        actual.child[actual.numChildren()] = sub;`,
      `                        if (sub != null) sub.parent = actual;`,
      `                    }`,
      ``,
      `                    shiftLeft(padre.child, idxHijo + 1);`,
      ``,
      `                    actual = padre;`,
      `                } else {`,
      `                    throw new IllegalStateException("Underflow sin hermanos válidos");`,
      `                }`,
      `            }`,
      `        }`,
      `    }`,
      `}`,
    ],
    labels: {
      // delete(...)
      DELETE_ROOT_EMPTY_IF: 7, // if (raiz == null){
      DELETE_ROOT_EMPTY_THROW: 8, // throw new IllegalStateException("Árbol vacío...");

      DELETE_INIT_CUR: 12, // Nodo23<T> cur = raiz;
      DELETE_INIT_IDX: 13, // int idxClave = -1;
      DELETE_INIT_CLAVE: 14, // T clave = {0};

      DELETE_WHILE_DESCEND: 16, // while (!cur.isLeaf()){
      DELETE_DESC_POS: 17, // int pos = posicionDescenso(...)
      DELETE_DESC_KEY_INTERNAL_IF: 18, // if (pos < ... && cur.keys.get(pos)...
      DELETE_DESC_SUCC_INIT: 20, // Nodo23<T> succ = cur.child[pos + 1];
      DELETE_DESC_SUCC_WHILE: 21, // while (!succ.isLeaf()){
      DELETE_DESC_SUCC_ADVANCE: 22, // succ = succ.child[0];
      DELETE_DESC_SUCC_KEY: 24, // T sucesor = succ.keys.get(0);
      DELETE_DESC_SUCC_REPLACE: 25, // cur.keys.set(pos, sucesor);
      DELETE_DESC_UPDATE_CLAVE: 26, // clave = sucesor;
      DELETE_DESC_MOVE_TO_SUCC: 27, // cur = succ;
      DELETE_DESC_BREAK: 28, // break;

      DELETE_DESC_ELSE_CHILD: 29, // } else {
      DELETE_DESC_CHILD_LOOKUP: 30, // Nodo23<T> hijo = cur.child[pos];
      DELETE_DESC_CHILD_NULL_IF: 31, // if (hijo == null){
      DELETE_DESC_CHILD_NULL_THROW: 32, // throw new IllegalStateException("Árbol inconsistente...")
      DELETE_DESC_MOVE_CHILD: 34, // cur = hijo;

      DELETE_LEAF_FIND_IDX: 39, // idxClave = indiceEnNodo(...)
      DELETE_LEAF_NOT_FOUND_IF: 40, // if (idxClave == -1){
      DELETE_LEAF_NOT_FOUND_THROW: 41, // throw new IllegalStateException("Clave no encontrada...");

      DELETE_LEAF_REMOVE_CALL: 45, // eliminarEnPosicion(cur.keys, idxClave);

      DELETE_ROOT_LEAF_IF: 48, // if (cur == raiz){
      DELETE_ROOT_LEAF_EMPTY_IF: 49, // if (raiz.keys.size() == 0){
      DELETE_ROOT_LEAF_HAS_CHILD_IF: 50, // if (raiz.child[0] != null){
      DELETE_ROOT_LEAF_SET_ROOT_CHILD: 51, // raiz = raiz.child[0];
      DELETE_ROOT_LEAF_SET_PARENT_NULL: 52, // raiz.parent = null;
      DELETE_ROOT_LEAF_SET_NULL: 54, // raiz = null;
      DELETE_ROOT_LEAF_RETURN: 57, // return;

      DELETE_UNDERFLOW_IF: 61, // if (cur.keys.size() == 0){
      DELETE_UNDERFLOW_CALL: 62, // repararUnderflow(cur);

      // repararUnderflow(...)
      UNDERFLOW_INIT_ACTUAL: 73, // Nodo23<T> actual = n;
      UNDERFLOW_WHILE: 74, // while (actual != null && actual.keys.size() == 0){
      UNDERFLOW_PARENT_ASSIGN: 75, // Nodo23<T> padre = actual.parent;
      UNDERFLOW_PARENT_IS_NULL_IF: 76, // if (padre == null){

      UNDERFLOW_ROOT_CHILD_IF: 78, // if (actual.child[0] != null){
      UNDERFLOW_ROOT_CHILD_SET: 79, // raiz = actual.child[0];
      UNDERFLOW_ROOT_CHILD_PARENT_NULL: 80, // raiz.parent = null;
      UNDERFLOW_ROOT_SET_NULL: 82, // raiz = null;
      UNDERFLOW_SET_ACTUAL_NULL: 84, // actual = null;

      UNDERFLOW_IDX_HIJO_ASSIGN: 86, // int idxHijo = indiceDeHijo(...)
      UNDERFLOW_IDX_HIJO_NOT_FOUND_IF: 87, // if (idxHijo == -1){
      UNDERFLOW_IDX_HIJO_NOT_FOUND_THROW: 88, // throw new IllegalStateException(...);

      UNDERFLOW_SET_HERMANO_IZQ: 91, // hermanoIzq = ...
      UNDERFLOW_SET_HERMANO_DER: 92, // hermanoDer = ...

      UNDERFLOW_ROT_LEFT_IF: 95, // if (hermanoIzq != null && hermanoIzq.keys.size() > 1){
      UNDERFLOW_ROT_LEFT_MOVE_LAST_KEY: 97, // T kMovida = hermanoIzq.keys.remove(...)
      UNDERFLOW_ROT_LEFT_KPADRE: 98, // T kPadre = padre.keys.get(...)
      UNDERFLOW_ROT_LEFT_INSERT_IN_ACTUAL: 99, // insertarEnPosicion(actual.keys, 0, kPadre);
      UNDERFLOW_ROT_LEFT_SET_PADRE_KEY: 100, // padre.keys.set(...);

      UNDERFLOW_ROT_LEFT_SUB_ASSIGN: 103, // Nodo23<T> sub = hermanoIzq.child[...];
      UNDERFLOW_ROT_LEFT_SHIFT_CHILD: 104, // actual.child[1] = actual.child[0];
      UNDERFLOW_ROT_LEFT_SET_CHILD0: 105, // actual.child[0] = sub;
      UNDERFLOW_ROT_LEFT_SUB_PARENT: 106, // if (sub != null) sub.parent = actual;
      UNDERFLOW_ROT_LEFT_SET_ACTUAL_NULL: 108, // actual = null;

      UNDERFLOW_ROT_RIGHT_IF: 111, // else if (hermanoDer != null && ...)
      UNDERFLOW_ROT_RIGHT_MOVE_FIRST: 112, // T kMovida = hermanoDer.keys.remove(0);
      UNDERFLOW_ROT_RIGHT_KPADRE: 113, // T kPadre = padre.keys.get(idxHijo);
      UNDERFLOW_ROT_RIGHT_INSERT_IN_ACTUAL: 114, // insertarEnPosicion(actual.keys, ...);
      UNDERFLOW_ROT_RIGHT_SET_PADRE_KEY: 115, // padre.keys.set(idxHijo, kMovida);

      UNDERFLOW_ROT_RIGHT_SUB_ASSIGN: 118, // Nodo23<T> sub = hermanoDer.child[0];
      UNDERFLOW_ROT_RIGHT_CHILD1: 119, // actual.child[1] = sub;
      UNDERFLOW_ROT_RIGHT_SUB_PARENT: 120, // if (sub != null) sub.parent = actual;
      UNDERFLOW_ROT_RIGHT_SET_ACTUAL_NULL: 122, // actual = null;

      UNDERFLOW_MERGE_ELSE: 125, // else {
      UNDERFLOW_MERGE_WITH_LEFT_IF: 126, // if (hermanoIzq != null){

      UNDERFLOW_MERGE_LEFT_KPADRE: 128, // T kPadre = padre.keys.remove(idxHijo - 1);
      UNDERFLOW_MERGE_LEFT_INSERT_PADRE: 129, // insertarEnPosicion(hermanoIzq.keys,...);
      UNDERFLOW_MERGE_LEFT_MOVE_KEYS_WHILE: 132, // while (actual.keys.size() > 0){
      UNDERFLOW_MERGE_LEFT_MOVE_KEY: 133, // T k = actual.keys.remove(0);
      UNDERFLOW_MERGE_LEFT_INSERT_KEY: 134, // insertarEnPosicion(hermanoIzq.keys,...);

      UNDERFLOW_MERGE_LEFT_MOVE_CHILD_FOR: 138, // for (int i = 0; i <= actual.numChildren(); i++){
      UNDERFLOW_MERGE_LEFT_MOVE_CHILD: 139, // Nodo23<T> sub = actual.child[i];
      UNDERFLOW_MERGE_LEFT_CHILD_ASSIGN: 140, // hermanoIzq.child[...] = sub;
      UNDERFLOW_MERGE_LEFT_SUB_PARENT: 141, // if (sub != null) sub.parent = hermanoIzq;

      UNDERFLOW_MERGE_LEFT_SHIFT_LEFT: 145, // shiftLeft(padre.child, idxHijo);
      UNDERFLOW_MERGE_LEFT_SET_ACTUAL_PADRE: 147, // actual = padre;

      UNDERFLOW_MERGE_WITH_RIGHT_ELSEIF: 148, // } else if (hermanoDer != null){
      UNDERFLOW_MERGE_RIGHT_KPADRE: 150, // T kPadre = padre.keys.remove(idxHijo);
      UNDERFLOW_MERGE_RIGHT_INSERT_PADRE: 151, // insertarEnPosicion(actual.keys,...);

      UNDERFLOW_MERGE_RIGHT_MOVE_KEYS_WHILE: 153, // while (hermanoDer.keys.size() > 0){
      UNDERFLOW_MERGE_RIGHT_MOVE_KEY: 154, // T k = hermanoDer.keys.remove(0);
      UNDERFLOW_MERGE_RIGHT_INSERT_KEY: 155, // insertarEnPosicion(actual.keys,...);

      UNDERFLOW_MERGE_RIGHT_MOVE_CHILD_FOR: 158, // for (int i = 0; i <= hermanoDer.numChildren(); i++){
      UNDERFLOW_MERGE_RIGHT_MOVE_CHILD: 159, // Nodo23<T> sub = hermanoDer.child[i];
      UNDERFLOW_MERGE_RIGHT_CHILD_ASSIGN: 160, // actual.child[actual.numChildren()] = sub;
      UNDERFLOW_MERGE_RIGHT_SUB_PARENT: 161, // if (sub != null) sub.parent = actual;

      UNDERFLOW_MERGE_RIGHT_SHIFT_LEFT: 164, // shiftLeft(padre.child, idxHijo + 1);
      UNDERFLOW_MERGE_RIGHT_SET_ACTUAL_PADRE: 166, // actual = padre;

      UNDERFLOW_MERGE_NO_SIBLINGS_THROW: 168, // throw new IllegalStateException("Underflow sin hermanos válidos");
    },
    errorPlans: {
      KEY_NOT_FOUND: [
        { lineLabel: "DELETE_LEAF_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "DELETE_LEAF_NOT_FOUND_THROW", hold: 800 },
      ],
      EMPTY_TREE: [
        { lineLabel: "DELETE_ROOT_EMPTY_IF", hold: 600 },
        { lineLabel: "DELETE_ROOT_EMPTY_THROW", hold: 800 },
      ],
      INCONSISTENT_TREE: [
        { lineLabel: "DELETE_DESC_CHILD_NULL_IF", hold: 600 },
        { lineLabel: "DELETE_DESC_CHILD_NULL_THROW", hold: 800 },
        { lineLabel: "UNDERFLOW_IDX_HIJO_NOT_FOUND_IF", hold: 600 },
        { lineLabel: "UNDERFLOW_IDX_HIJO_NOT_FOUND_THROW", hold: 800 },
      ],
      UNDERFLOW_NO_SIBLINGS: [
        { lineLabel: "UNDERFLOW_MERGE_NO_SIBLINGS_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── search(value) ───────────────── */
  search: {
    lines: [
      `/**`,
      ` * Busca una clave en el Árbol 1-2-3 (2-3).`,
      ` * Recorre los nodos comparando contra sus claves ordenadas.`,
      ` */`,
      `public boolean search(T {0}){`,
      `    // Si el árbol está vacío no hay nada que buscar`,
      `    if (raiz == null){`,
      `        return false;  // en la implementación real se lanza error de dominio "TREE_EMPTY"`,
      `    }`,
      ``,
      `    boolean found = buscarRec(raiz, {0});`,
      `    if (found){`,
      `        return true;`,
      `    }`,
      ``,
      `    // Si no se encontró la clave, se considera error de dominio "KEY_NOT_FOUND"`,
      `    throw new RuntimeException("La clave no está en el árbol: {0}");`,
      `}`,
      ``,
      `private boolean buscarRec(Nodo23<T> n, T {0}){`,
      `    if (n == null) return false;`,
      ``,
      `    int idx = buscarEnNodo(n.keys, {0});`,
      `    if (idx != -1) return true;`,
      `    if (n.isLeaf()) return false;`,
      ``,
      `    int i = posicionDescenso(n.keys, {0});`,
      `    Nodo23<T> child = n.child[i];`,
      `    if (child == null){`,
      `        // Estado inconsistente: hijo nulo en la rama de búsqueda`,
      `        return false;  // en la implementación real se podría lanzar "INCONSISTENT_TREE"`,
      `    }`,
      `    return buscarRec(child, {0});`,
      `}`,
    ],
    labels: {
      // search(...)
      SEARCH_TREE_EMPTY_IF: 6, // if (raiz == null){
      SEARCH_CALL_REC: 10, // boolean found = buscarRec(raiz, {0});
      SEARCH_RETURN_FOUND_IF: 11, // if (found){
      SEARCH_KEY_NOT_FOUND_THROW: 16, // throw new RuntimeException("La clave no está en el árbol: {0}");

      // buscarRec(...)
      SEARCH_REC_IF_NULL: 20, // if (n == null) return false;

      SEARCH_REC_FIND_IN_NODE: 22, // int idx = buscarEnNodo(n.keys, {0});
      SEARCH_REC_RETURN_FOUND_IN_NODE_IF: 23, // if (idx != -1) return true;

      SEARCH_REC_IS_LEAF_IF: 24, // if (n.isLeaf()) return false;

      SEARCH_REC_DESCEND_INDEX: 26, // int i = posicionDescenso(n.keys, {0});
      SEARCH_REC_CHILD_NULL_IF: 28, // if (child == null){
      SEARCH_REC_CHILD_NULL_RETURN: 30, // return false;  // hijo nulo / INCONSISTENT_TREE
    },

    errorPlans: {
      TREE_EMPTY: [{ lineLabel: "SEARCH_TREE_EMPTY_IF", hold: 600 }],
      KEY_NOT_FOUND: [
        { lineLabel: "SEARCH_CALL_REC", hold: 600 },
        { lineLabel: "SEARCH_KEY_NOT_FOUND_THROW", hold: 800 },
      ],
    },
  },

  /* ───────────────── getInOrder() ───────────────── */
  getInOrder: {
    lines: [
      `/**`,
      ` * Devuelve el recorrido InOrden del Árbol 1-2-3 (2-3).`,
      ` * Para cada nodo 2-3 se respeta el orden de sus subárboles y claves.`,
      ` */`,
      `public ListaCD<T> getInOrder(){`,
      `    ListaCD<T> out = new ListaCD<T>();`,
      `    inOrden(raiz, out);`,
      `    return out;`,
      `}`,
      ``,
      `private void inOrden(Nodo23<T> n, ListaCD<T> out){`,
      `    if (n == null) return;`,
      ``,
      `    if (n.keys.size() == 1){`,
      `        // keys: [k0], child: [c0,c1]`,
      `        if (!n.isLeaf()) inOrden(n.child[0], out);`,
      `        out.insertarAlFinal(n.keys.get(0));`,
      `        if (!n.isLeaf()) inOrden(n.child[1], out);`,
      `    } else {`,
      `        // keys: [k0,k1], child: [c0,c1,c2]`,
      `        if (!n.isLeaf()) inOrden(n.child[0], out);`,
      `        out.insertarAlFinal(n.keys.get(0));`,
      `        if (!n.isLeaf()) inOrden(n.child[1], out);`,
      `        out.insertarAlFinal(n.keys.get(1));`,
      `        if (!n.isLeaf()) inOrden(n.child[2], out);`,
      `    }`,
      `}`,
    ],
    labels: {
      IN_INIT_RESULT: 5, // ListaCD<T> out = new ListaCD<>();
      IN_CALL_HELPER: 6, // inOrden(raiz, out);
      IN_RETURN_RESULT: 7, // return out;

      IN_IF_NULL: 11, // if (n == null) return;

      IN_ONE_KEY_IF: 13, // if (n.keys.size() == 1){
      IN_RECURSE_C0_ONE: 15, // inOrden(n.child[0], out);
      IN_VISIT_K0_ONE: 16, // out.insertarAlFinal(n.keys.get(0));
      IN_RECURSE_C1_ONE: 17, // inOrden(n.child[1], out);

      IN_TWO_KEYS_ELSE: 18, // } else {
      IN_RECURSE_C0_TWO: 20, // inOrden(n.child[0], out);
      IN_VISIT_K0_TWO: 21, // out.insertarAlFinal(n.keys.get(0));
      IN_RECURSE_C1_TWO: 22, // inOrden(n.child[1], out);
      IN_VISIT_K1_TWO: 23, // out.insertarAlFinal(n.keys.get(1));
      IN_RECURSE_C2_TWO: 24, // inOrden(n.child[2], out);
    },
  },

  /* ───────────────── getPreOrder() ───────────────── */
  getPreOrder: {
    lines: [
      `/**`,
      ` * Devuelve el recorrido PreOrden del Árbol 1-2-3 (2-3).`,
      ` * Visita primero las claves del nodo y luego sus hijos de izquierda a derecha.`,
      ` */`,
      `public ListaCD<T> getPreOrder(){`,
      `    ListaCD<T> out = new ListaCD<T>();`,
      `    preOrden(raiz, out);`,
      `    return out;`,
      `}`,
      ``,
      `private void preOrden(Nodo23<T> n, ListaCD<T> out){`,
      `    if (n == null) return;`,
      ``,
      `    // 1) Visitar todas las claves del nodo en orden`,
      `    for (int i = 0; i < n.keys.size(); i++){`,
      `        out.insertarAlFinal(n.keys.get(i));`,
      `    }`,
      ``,
      `    // 2) Recorrer los hijos de izquierda a derecha`,
      `    if (!n.isLeaf()){`,
      `        for (int i = 0; i <= n.keys.size(); i++){`,
      `            preOrden(n.child[i], out);`,
      `        }`,
      `    }`,
      `}`,
    ],
    labels: {
      PRE_INIT_RESULT: 5, // ListaCD<T> out = ...
      PRE_CALL_HELPER: 6, // preOrden(raiz, out);
      PRE_RETURN_RESULT: 7, // return out;

      PRE_IF_NULL: 11, // if (n == null) return;

      PRE_FOR_KEYS: 14, // for (int i = 0; i < n.keys.size(); i++){
      PRE_VISIT_KEY: 15, // out.insertarAlFinal(n.keys.get(i));

      PRE_IF_HAS_CHILDREN: 19, // if (!n.isLeaf()){
      PRE_FOR_CHILDREN: 20, // for (int i = 0; i <= n.keys.size(); i++){
      PRE_RECURSE_CHILD: 21, // preOrden(n.child[i], out);
    },
  },

  /* ───────────────── getPostOrder() ───────────────── */
  getPostOrder: {
    lines: [
      `/**`,
      ` * Devuelve el recorrido PostOrden del Árbol 1-2-3 (2-3).`,
      ` * Recorre primero todos los hijos y al final las claves del nodo.`,
      ` */`,
      `public ListaCD<T> getPostOrder(){`,
      `    ListaCD<T> out = new ListaCD<T>();`,
      `    postOrden(raiz, out);`,
      `    return out;`,
      `}`,
      ``,
      `private void postOrden(Nodo23<T> n, ListaCD<T> out){`,
      `    if (n == null) return;`,
      ``,
      `    // 1) Recorrer hijos de izquierda a derecha`,
      `    if (!n.isLeaf()){`,
      `        for (int i = 0; i <= n.keys.size(); i++){`,
      `            postOrden(n.child[i], out);`,
      `        }`,
      `    }`,
      ``,
      `    // 2) Visitar las claves del nodo en orden`,
      `    for (int i = 0; i < n.keys.size(); i++){`,
      `        out.insertarAlFinal(n.keys.get(i));`,
      `    }`,
      `}`,
    ],
    labels: {
      POST_INIT_RESULT: 5, // ListaCD<T> out = ...
      POST_CALL_HELPER: 6, // postOrden(raiz, out);
      POST_RETURN_RESULT: 7, // return out;

      POST_IF_NULL: 11, // if (n == null) return;

      POST_IF_HAS_CHILDREN: 14, // if (!n.isLeaf()){
      POST_FOR_CHILDREN: 15, // for (int i = 0; i <= n.keys.size(); i++){
      POST_RECURSE_CHILD: 16, // postOrden(n.child[i], out);

      POST_FOR_KEYS: 21, // for (int i = 0; i < n.keys.size(); i++){
      POST_VISIT_KEY: 22, // out.insertarAlFinal(n.keys.get(i));
    },
  },

  /* ───────────────── getLevelOrder() ───────────────── */
  getLevelOrder: {
    lines: [
      `/**`,
      ` * Devuelve el recorrido por niveles (BFS) del Árbol 1-2-3 (2-3).`,
      ` * Encola nodos, visita sus claves y encola todos sus hijos.`,
      ` */`,
      `public ListaCD<T> getLevelOrder(){`,
      `    ListaCD<T> out = new ListaCD<T>();`,
      `    if (raiz == null) return out;`,
      ``,
      `    Cola<Nodo23<T>> q = new Cola<>();`,
      `    q.encolar(raiz);`,
      ``,
      `    while (!q.esVacia()){`,
      `        Nodo23<T> x = q.decolar();`,
      `        // Visitar todas las claves del nodo`,
      `        for (int i = 0; i < x.keys.size(); i++){`,
      `            out.insertarAlFinal(x.keys.get(i));`,
      `        }`,
      `        // Encolar hijos si no es hoja`,
      `        if (!x.isLeaf()){`,
      `            for (int i = 0; i <= x.keys.size(); i++){`,
      `                if (x.child[i] != null) q.encolar(x.child[i]);`,
      `            }`,
      `        }`,
      `    }`,
      `    return out;`,
      `}`,
    ],
    labels: {
      LEVEL_INIT_RESULT: 5, // ListaCD<T> out = ...
      LEVEL_TREE_EMPTY_IF: 6, // if (raiz == null) return out;

      LEVEL_QUEUE_INIT: 8, // Cola<Nodo23<T>> q = ...
      LEVEL_ENQUEUE_ROOT: 9, // q.encolar(raiz);

      LEVEL_WHILE: 11, // while (!q.esVacia()){
      LEVEL_DEQUEUE: 12, // Nodo23<T> x = q.decolar();

      LEVEL_FOR_KEYS: 14, // for (int i = 0; i < x.keys.size(); i++){
      LEVEL_VISIT_KEY: 15, // out.insertarAlFinal...

      LEVEL_IF_HAS_CHILDREN: 18, // if (!x.isLeaf()){
      LEVEL_FOR_CHILDREN: 19, // for (int i = 0; i <= x.keys.size(); i++){
      LEVEL_ENQUEUE_CHILD: 20, // if (x.child[i] != null) q.encolar(x.child[i]);

      LEVEL_RETURN_RESULT: 24, // return out;
    },
  },

  /* ───────────────── clean() ───────────────── */
  clean: {
    lines: [
      `/**`,
      ` * Vacía completamente el Árbol 1-2-3 (2-3).`,
      ` * post: la raíz pasa a ser null y no quedan nodos en el árbol.`,
      ` */`,
      `public void clean(){`,
      `    this.raiz = null;`,
      `    // tamanio = 0`,
      `}`,
    ],
    labels: {
      CLEAR_ROOT: 5, // this.raiz = null;
    },
  },
});
