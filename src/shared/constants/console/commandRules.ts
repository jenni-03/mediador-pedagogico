// Reglas de comandos para cada estructura de datos
export const commandRules: Record<
  string,
  (parts: string[]) => boolean | { valid: boolean; message?: string }
> = {
  secuencia: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    switch (keyword) {
      case "create": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar la capacidad de la secuencia como argumento."
                : "El método únicamente espera la capacidad de la secuencia como argumento.",
          };
        }
        const num = Number(parts[1]);
        if (isNaN(num)) {
          return {
            valid: false,
            message: "La capacidad de la secuencia debe ser un número válido.",
          };
        }
        const createPattern = /^(1[0-9]|20|[1-9])$/; // Coincide con números del 1 al 20
        if (!createPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "La capacidad de la secuencia debe ser un número entero mayor que 0 y menor que 21.",
          };
        }
        return true;
      }

      case "insertlast": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor del elemento a insertar como argumento."
                : "El método únicamente espera el valor del elemento a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor del elemento a insertar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        return true;
      }

      case "delete": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar la posición del elemento a eliminar como argumento."
                : "El método únicamente espera la posición del elemento a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message:
              "La posición del elemento a eliminar debe ser un número válido.",
          };
        }
        const positionDelPattern = /^-?\d+$/; // Número entero para la posición

        if (!positionDelPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "La posición del elemento a eliminar debe ser un número entero positivo.",
          };
        }
        return true;
      }

      case "get": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar la posición del elemento a obtener como argumento."
                : "El método únicamente acepta la posición del elemento a obtener como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message:
              "La posición del elemento a obtener debe ser un número válido.",
          };
        }
        return true;
      }

      case "set": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message:
              "Debe proporcionar únicamente dos argumentos (posición, valor).",
          };
        }
        if (isNaN(Number(parts[1])) || isNaN(Number(parts[2]))) {
          return {
            valid: false,
            message: "Ambos argumentos deben ser números válidos.",
          };
        }
        const positionPattern = /^-?\d+$/; // Número entero para la posición
        const valuePattern = /^\d{1,4}$/; // Número entero de hasta 4 dígitos para el nuevo valor

        if (!positionPattern.test(parts[1])) {
          return {
            valid: false,
            message: "La posición debe ser un número entero positivo.",
          };
        }
        if (!valuePattern.test(parts[2])) {
          return {
            valid: false,
            message:
              "El nuevo valor del elemento debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        return true;
      }

      case "search": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el elemento a buscar como argumento."
                : "El método únicamente acepta el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El elemento a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "clean": {
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método no espera ningún argumento.",
          };
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
      case "push": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a apilar como argumento."
                : "El método únicamente espera el valor a apilar como argumento.",
          };
        }
        const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a apilar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        return true;
      }

      case "pop":
      case "gettop":
      case "clean":
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método no espera ningún argumento.",
          };
        }
        return true;

      default:
        return false;
    }
  },

  cola: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    switch (keyword) {
      case "enqueue": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a encolar como argumento."
                : "El método únicamente espera el valor a encolar como argumento.",
          };
        }
        const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a encolar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        return true;
      }

      case "dequeue":
      case "getfront":
      case "clean":
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método no espera ningún argumento.",
          };
        }
        return true;

      default:
        return false;
    }
  },

  "cola de prioridad": (parts) => {
    const keyword = parts[0]?.toLowerCase();
    switch (keyword) {
      case "enqueue": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a encolar y su prioridad como argumentos."
                : "Debe proporcionar únicamente dos argumentos (valor, prioridad).",
          };
        }
        const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        const priorityPattern = /^(10|[1-9])$/;
        if (!priorityPattern.test(parts[2])) {
          return {
            valid: false,
            message: "La prioridad debe ser un número entre el 1 y el 10.",
          };
        }
        return true;
      }

      case "dequeue":
      case "getfront":
      case "clean":
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método no espera ningún argumento.",
          };
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
      case "insertlast": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        return true;
      }

      case "insertat": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a encolar y su posición como argumentos."
                : "Debe proporcionar únicamente 2 números como argumentos (valor, posición).",
          };
        }
        const positionPattern = /^\d+$/; // Número entero para la posición
        const valuePattern = /^\d{1,4}$/; // Número entero de hasta 4 dígitos para el valor
        if (!valuePattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos.",
          };
        }
        if (!positionPattern.test(parts[2])) {
          return {
            valid: false,
            message:
              "La posición a insertar debe ser un número entero positivo o 0.",
          };
        }
        return true;
      }

      case "removefirst":
      case "removelast": {
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método no espera ningún argumento.",
          };
        }
        return true;
      }

      case "removeat": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar la posición del elemento a remover como argumento."
                : "El método únicamente espera la posición del elemento a remover como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message:
              "La posición del elemento a remover debe ser un número válido.",
          };
        }
        const positionDelPattern = /^\d+$/; // Número entero para la posición
        if (!positionDelPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "La posición del elemento a remover debe ser un número entero positivo o 0.",
          };
        }
        return true;
      }

      case "search":
        if (parts.length !== 2) {
          return { valid: false, message: parts.length === 1 ? "Debe proporcionar el valor a buscar como argumento." : "El método únicamente espera el valor a buscar como argumento." };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;

      case "clean": {
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "El método debe ser vacío, no espera ningún argumento.",
          };
        }
        return true;
      }

      default:
        return false;
    }
  },

  tabla_hash: (parts: string[]) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "create":
      case "set":
      case "get":
      case "delete":
      case "clean": {
        return true;
      }
      default:
        return false;
    }
  },
  arbol_binario: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    switch (keyword) {
      case "insertleft":
      case "insertright":
        {
          if (parts.length !== 3) {
            return { valid: false, message: parts.length === 1 ? "Debe proporcionar el valor del nodo padre y el valor a insertar como argumento." : "Debe proporcionar únicamente 2 números como argumentos (padre, valor)." };
          }
          const insertPattern = /^\d{1,4}$/; // Regex para validar un número entero de hasta 4 dígitos
          if (!insertPattern.test(parts[1])) {
            return { valid: false, message: "El valor del nodo padre debe ser un número entero positivo de hasta 4 dígitos." };
          }
          if (!insertPattern.test(parts[2])) {
            return { valid: false, message: "El valor a insertar debe ser un número entero positivo de hasta 4 dígitos." };
          }
          return true;
        }

      case "delete": {
        if (parts.length !== 2) {
          return { valid: false, message: parts.length === 1 ? "Debe proporcionar el valor a eliminar como argumento." : "El método únicamente espera el valor a eliminar como argumento." };
        }
        if (isNaN(Number(parts[1]))) {
          return { valid: false, message: "El valor a eliminar debe ser un número válido." };
        }
        return true;
      }

      case "search": {
        if (parts.length !== 2) {
          return { valid: false, message: parts.length === 1 ? "Debe proporcionar el valor a buscar como argumento." : "El método únicamente espera el valor a buscar como argumento." };
        }
        if (isNaN(Number(parts[1]))) {
          return { valid: false, message: "El valor a buscar debe ser un número válido." };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
      case "clean":
        {
          if (parts.length !== 1) {
            return { valid: false, message: "El método no espera ningún argumento." };
          }
          return true;
        }

      default:
        return false;
    }
  },

  bst: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    return (
      commandRules.binary_tree(parts) ||
      (["findmin", "findmax"].includes(keyword) && parts.length === 1)
    );
  },

  avl: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    return (
      commandRules.bst(parts) ||
      (keyword === "balance" && parts.length === 2 && !isNaN(Number(parts[1])))
    );
    // || (keyword === "isbalanced" && parts.length === 1);
  },

  roji_negro: (parts) => {
    // const keyword = parts[0]?.toLowerCase();
    return commandRules.bst(parts);
    // || (keyword === "color" && parts.length === 2 && !isNaN(Number(parts[1]))); // Obtener el color de un nodo
  },

  splay: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    return (
      commandRules.bst(parts) ||
      (keyword === "splay" && parts.length === 2 && !isNaN(Number(parts[1])))
    );
  },

  heap: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    return (
      (["extract_min", "extract_max", "get_min", "get_max"].includes(keyword) &&
        parts.length === 1) ||
      (["heapify", "insert", "delete"].includes(keyword) &&
        parts.length === 2 &&
        !isNaN(Number(parts[1]))) ||
      (keyword === "clean" && parts.length === 1)
    );
  },

  arbol_eneario: (parts) => {
    const keyword = parts[0]?.toLowerCase();
    switch (keyword) {
      case "insert":
      case "delete":
      case "search":
        return parts.length === 2 && !isNaN(Number(parts[1])); // Requiere un solo número
      case "traverse":
        return (
          parts.length === 2 &&
          ["levelorder", "preorder", "postorder"].includes(
            parts[1].toLowerCase()
          )
        );
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
        return (
          parts.length === 2 &&
          ["levelorder", "inorder"].includes(parts[1].toLowerCase())
        );
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
