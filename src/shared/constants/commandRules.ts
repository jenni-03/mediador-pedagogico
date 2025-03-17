// Reglas de comandos para cada estructura de datos
    export const commandRules: Record<string, (parts: string[]) => boolean | { valid: boolean; message?: string }> = {    
    secuencia: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create":
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar un número como argumento." };
                }
                const num = Number(parts[1]);
                if (isNaN(num)) {
                    return { valid: false, message: "El argumento debe ser un número válido." };
                }
                if (num <= 0 || num > 20) {
                    return { valid: false, message: "El número debe ser mayor que 0 y menor que 21." };
                }
                return true; // Si todo está bien, solo devuelve `true`
            case "insert": {
                if (parts.length !== 2) {
                    return { valid: false, message: "Debe proporcionar un número como argumento." };
                }
                const value = parts[1];
                const pattern = /^(\d{1,3}|\d{1,2}\.\d{1})$/; // Regex para validar el formato permitido
            
                if (!pattern.test(value)) {
                    return { valid: false, message: "El número debe ser un entero de hasta 3 dígitos o un decimal con máximo 2 dígitos enteros y 1 decimal." };
                }
                return true;
            }
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Válida que solo venga el comando y el elemento, y además que el elemento sea un número
            case "update":
                if (parts.length !== 3) {
                    return { valid: false, message: "Debe proporcionar dos números como argumentos." };
                }
                if (isNaN(Number(parts[1])) || isNaN(Number(parts[2]))) {
                    return { valid: false, message: "Ambos argumentos deben ser números válidos" };
                }
                const value = parts[2];
                const pattern = /^(\d{1,3}|\d{1,2}\.\d{1})$/; // Regex para validar el formato permitido
                if (!pattern.test(value)) {
                    return { valid: false, message: "El argumento debe ser un número entero de hasta 3 dígitos o un decimal con máximo 2 dígitos enteros y 1 decimal." };
                }
                return true;
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },

    lista_simple: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create": // Crea una lista vacía o con un valor inicial
                return parts.length === 1 || (parts.length === 2 && !isNaN(Number(parts[1])));
            case "insert_first":
            case "insert_last":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1]));
            case "insert_at": // Inserta en una posición específica
            case "update":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]));
            case "clean":
            case "traverse": // Recorre la lista
                return parts.length === 1;
            default:
                return false;
        }
    },

    lista_doble: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create":
                return parts.length === 1 || (parts.length === 2 && !isNaN(Number(parts[1])));
            case "insert_first":
            case "insert_last":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1]));
            case "insert_at": // Inserta en una posición específica
            case "update":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]));
            case "clean":
            case "traverse_forward": // Recorre la lista hacia adelante
            case "traverse_backward": // Recorre la lista hacia atrás
                return parts.length === 1;
            default:
                return false;
        }
    },

    lista_circular: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create":
                return parts.length === 1 || (parts.length === 2 && !isNaN(Number(parts[1])));
            case "insert_first":
            case "insert_last":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1]));
            case "insert_at":
            case "update":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]));
            case "clean":
            case "traverse": // Recorre la lista
                return parts.length === 1;
            default:
                return false;
        }
    },

    lista_circular_doble: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "create":
                return parts.length === 1 || (parts.length === 2 && !isNaN(Number(parts[1])));
            case "insert_first":
            case "insert_last":
            case "delete":
            case "search":
                return parts.length === 2 && !isNaN(Number(parts[1]));
            case "insert_at":
            case "update":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]));
            case "clean":
            case "traverse_forward": // Recorre la lista hacia adelante
            case "traverse_backward": // Recorre la lista hacia atrás
                return parts.length === 1;
            default:
                return false;
        }
    },

    pila: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "push":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Solo permite agregar números
            case "pop":
            case "top":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },

    cola: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "enqueue":
                return parts.length === 2 && !isNaN(Number(parts[1])); // Agrega elementos a la cola
            case "dequeue":
            case "front":
            case "rear":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },

    cola_de_prioridad: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "enqueue":
                return parts.length === 3 && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2])); // Agrega elementos a la cola con prioridad
            case "dequeue": // Elimina el elemento con mayor prioridad.
            case "front":
            case "rear":
            case "clean":
                return parts.length === 1;
            default:
                return false;
        }
    },

    tabla_hash: (parts) => {
        const keyword = parts[0]?.toLowerCase();
        switch (keyword) {
            case "insert": // Agregar un nuevo elemento con una clave y un valor
            case "update": // Modificar el valor de un elemento existente
                return parts.length === 3 && !isNaN(Number(parts[1])); // Clave debe ser un número, valor puede ser cualquier tipo de dato.
            case "delete": // Eliminar un elemento basado en su clave
            case "search": // Obtener un valor asociado a una clave
            case "contains": // Verificar si una clave existe en la tabla
                return parts.length === 2 && !isNaN(Number(parts[1]));; // La clave debe ser un número
            case "resize":
                return parts.length === 2 && !isNaN(Number(parts[1])) && Number(parts[1]) > 0;
            case "clean":
            case "traverse": // Recorrer todos los elementos de la tabla
                return parts.length === 1;
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
            (["heapify" , "insert", "delete"].includes(keyword) && parts.length === 2 && !isNaN(Number(parts[1]))) ||
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