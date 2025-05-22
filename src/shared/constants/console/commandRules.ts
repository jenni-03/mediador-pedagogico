// Reglas de comandos para cada estructura de datos
export const commandRules: Record<string, (parts: string[]) => boolean | { valid: boolean; message?: string }> = {
    secuencia: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar la capacidad de la secuencia como argumento." };
                    }
                    const num = Number(parts[1]);
                    if (isNaN(num)) {
                        return { valid: false, message: "La capacidad de la secuencia debe ser un número válido." };
                    }
                    const createPattern = /^(1[0-9]|20|[1-9])$/; // Coincide con números del 1 al 20
                    if (!createPattern.test(parts[1])) {
                        return { valid: false, message: "La capacidad de la secuencia debe ser un número entero mayor que 0 y menor que 21." };
                    }
                    return true;
                }

            case "insertlast": {
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar el valor a insertar como argumento." };
                }
                const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                if (!insertPattern.test(parts[1])) {
                    return { valid: false, message: "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos." };
                }
                return true;
            }

            case "delete":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar el índice del elemento a eliminar como argumento." };
                    }
                    if (isNaN(Number(parts[1]))) {
                        return { valid: false, message: "El índice del elemento a eliminar debe ser un número válido." };
                    }
                    const positionDelPattern = /^-?\d+$/; // Número entero para la posición

                    if (!positionDelPattern.test(parts[1])) {
                        return { valid: false, message: "El índice del valor a eliminar debe ser un número entero positivo." };
                    }
                    return true;
                }

            case "get":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar el valor a obtener como argumento." };
                    }
                    if (isNaN(Number(parts[1]))) {
                        return { valid: false, message: "El valor a obtener debe ser un número válido." };
                    }
                    return true;
                }

            case "set":
                {
                    if (parts.length !== 3) {
                        return { valid: false, message: "Debe proporcionar dos números como argumentos (posición, valor)." };
                    }
                    if (isNaN(Number(parts[1])) || isNaN(Number(parts[2]))) {
                        return { valid: false, message: "Ambos argumentos deben ser números válidos." };
                    }
                    const positionPattern = /^-?\d+$/; // Número entero para la posición
                    const valuePattern = /^\d{1,4}$/; // Número entero de hasta 4 dígitos para el nuevo valor

                    if (!positionPattern.test(parts[1])) {
                        return { valid: false, message: "La posición debe ser un número entero positivo." };
                    }
                    if (!valuePattern.test(parts[2])) {
                        return { valid: false, message: "El nuevo valor debe ser un número entero positivo de hasta 4 dígitos." };
                    }
                    return true;
                }

            case "clean":
                {
                    if (parts.length !== 1) {
                        return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                    }
                    return true;
                }

            default:
                return false;
        }
    },

    pila: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "push":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar el valor a apilar como argumento." };
                    }
                    const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                    if (!insertPattern.test(parts[1])) {
                        return { valid: false, message: "El valor a apilar debe ser un número entero positivo de hasta 4 dígitos." };
                    }
                    return true;
                }

            case "pop":
            case "gettop":
            case "clean":
                if (parts.length !== 1) {
                    return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                }
                return true;

            default:
                return false;
        }
    },

    cola: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "enqueue":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar el valor a encolar como argumento." };
                    }
                    const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                    if (!insertPattern.test(parts[1])) {
                        return { valid: false, message: "El valor a encolar debe ser un número entero positivo de hasta 4 dígitos." };
                    }
                    return true;
                }

            case "dequeue":
            case "getfront":
            case "clean":
                if (parts.length !== 1) {
                    return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                }
                return true;

            default:
                return false;
        }
    },

    cola_de_prioridad: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "enqueue":
                if (parts.length !== 3) {
                    return { valid: false, message: "Debe proporcionar dos números como argumentos." };
                }
                const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                if (!insertPattern.test(parts[1])) {
                    return { valid: false, message: "El valor a insertar debe ser un número entero de hasta 4 dígitos." };
                }
                const priorityPattern = /^(10|[1-9])$/;
                if (!priorityPattern.test(parts[2])) {
                    return { valid: false, message: "La prioridad debe ser un número entero desde el 1 hasta el 10." };
                }
                return true;

            case "dequeue":
            case "getfront":
            case "clean":
                if (parts.length !== 1) {
                    return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                }
                return true;

            default:
                return false;
        }
    },

    lista_enlazada: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insertfirst":
            case "insertlast":
                {
                    if (parts.length !== 2) {
                        return { valid: false, message: "Debe proporcionar el valor a insertar como argumento." };
                    }
                    const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                    if (!insertPattern.test(parts[1])) {
                        return { valid: false, message: "El valor a insertar debe ser un número entero positivode hasta 4 dígitos." };
                    }
                    return true;
                }

            case "insertat":
                {
                    if (parts.length !== 3) {
                        return { valid: false, message: "Debe proporcionar 2 números como argumentos (posición, valor)." };
                    }
                    const positionPattern = /^-?\d+$/; // Número entero para la posición
                    const valuePattern = /^\d{1,4}$/; // Número entero de hasta 4 dígitos para el valor
                    if (!valuePattern.test(parts[1])) {
                        return { valid: false, message: "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos." };
                    }
                    if (!positionPattern.test(parts[2])) {
                        return { valid: false, message: "La posición a insertar debe ser un número entero positivo." };
                    }
                    return true;
                }

            case "removefirst":
            case "removelast":
                {
                    if (parts.length !== 1) {
                        return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                    }
                    return true;
                }

            case "removeat": {
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar la posición del elemento a remover como argumento." };
                }
                if (isNaN(Number(parts[1]))) {
                    return { valid: false, message: "El argumento debe ser un número válido." };
                }
                const positionDelPattern = /^-?\d+$/; // Número entero para la posición
                if (!positionDelPattern.test(parts[1])) {
                    return { valid: false, message: "La posición del elemento a remover debe ser un número entero positivo." };
                }
                return true;
            }

            case "search":
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar el valor a buscar como argumento." };
                }
                if (isNaN(Number(parts[1]))) {
                    return { valid: false, message: "El valor a buscar debe ser un número válido." };
                }
                return true;

            case "clean":
                {
                    if (parts.length !== 1) {
                        return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                    }
                    return true;
                }

            default:
                return false;
        }
    },

    tabla_hash: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create": // Crear una tabla hash con un tamaño de slots específicos
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar un número como argumento." };
                }
                const num = Number(parts[1]);
                if (isNaN(num)) {
                    return { valid: false, message: "El argumento debe ser un número válido." };
                }
                const createPattern = /^(1[0-9]|20|[1-9])$/; // Coincide con números del 1 al 20
                if (!createPattern.test(parts[1])) {
                    return { valid: false, message: "El valor debe ser un número entero mayor que 0 y menor que 21." };
                }
                return true;

            case "put": // Insertar o actualizar un elemento en la tabla hash
                if (parts.length !== 3) {
                    return { valid: false, message: "Debe proporcionar una clave y un valor(número entero) como argumentos." };
                }
                const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
                if (!insertPattern.test(parts[2])) {
                    return { valid: false, message: "El valor a insertar o actualizar debe ser un número entero de hasta 4 dígitos." };
                }
                return true;

            case "remove": // Eliminar un elemento basado en su clave
            case "get": // Obtener un valor asociado a una clave
            case "containskey": // Verificar si una clave existe en la tabla
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar una clave como argumento." };
                }
                return true;

            case "clean":
            case "values": // Recorrer todos los elementos de la tabla
                if (parts.length !== 1) {
                    return { valid: false, message: "El método debe ser vacío, no espera ningún argumento." };
                }
                return true;

            default:
                return false;
        }
    },

    arbol_binario: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insert":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1]));
            case "traverse":
                return parts.length === 2 && ["inorder", "preorder", "postorder"].includes(parts[1].toLowerCase());
            case "height":
            case "size":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },

    bst: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        return commandRules.binary_tree(parts) || ["findmin", "findmax"].includes(keyword) && parts.length === 1;
    },

    avl: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        return commandRules.bst(parts) ||
            (keyword === "balance" && parts.length === 2 && !isNaN(Number(parts[1])));
        // || (keyword === "isbalanced" && parts.length === 1);
    },

    roji_negro: (parts) => {
        // const keyword = parts[0]?.toLowerCase();
        return commandRules.bst(parts);
        // || (keyword === "color" && parts.length === 2 && !isNaN(Number(parts[1]))); // Obtener el color de un nodo
    },

    splay: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        return commandRules.bst(parts) || (keyword === "splay" && parts.length === 2 && !isNaN(Number(parts[1])));
    },

    heap: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        return ["extract_min", "extract_max", "get_min", "get_max"].includes(keyword) && parts.length === 1 ||
            (["heapify", "insert", "delete"].includes(keyword) && parts.length === 2 && !isNaN(Number(parts[1]))) ||
            keyword === "clean" && parts.length === 1;
    },

    arbol_eneario: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insert":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Requiere un solo número
            case "traverse":
                return parts.length === 2 && ["levelorder", "preorder", "postorder"].includes(parts[1].toLowerCase());
            case "clean":
                return parts.length === 1; // No requiere parámetros
            default:
                return false;
        }
    },

    arbol_1_2_3: (parts) => {
        return commandRules.arbol_eneario(parts);
        // case "split":
        // case "merge":
    },

    arbol_b: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insert":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Requiere un solo número
            // case "split": // Si un nodo se llena, se divide en dos.
            // case "merge": // Si un nodo tiene muy pocas claves, se fusiona con un hermano.
            case "traverse":
                return parts.length === 2 && ["levelorder", "inorder"].includes(parts[1].toLowerCase());
            case "clean":
                return parts.length === 1; // No requiere parámetros
            default:
                return false;
        }
    },

    arbol_b_plus: (parts) => {
        return commandRules.arbol_b(parts);
    },
};