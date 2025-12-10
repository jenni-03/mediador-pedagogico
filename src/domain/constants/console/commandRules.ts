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
        if (num >= 21) {
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
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
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

    if (!keyword) {
      return {
        valid: false,
        message:
          "Debes escribir una operación para tabla_hash (create, set, get, delete o clean).",
      };
    }

    // Helper para validar que un argumento es un número válido (sin hablar de rangos)
    const isNumeric = (s: string | undefined) => {
      if (s === undefined) return false;
      const n = Number(s);
      return !isNaN(n);
    };

    switch (keyword) {
      case "create": {
        // tabla_hash create <slots>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "El comando create espera un argumento numérico: create <slots>."
                : "El comando create solo recibe un argumento: create <slots>.",
          };
        }
        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message:
              "El número de slots debe ser un valor numérico válido. Ej: create 8",
          };
        }
        return true;
      }

      case "set": {
        // tabla_hash set <key> <value>
        if (parts.length !== 3) {
          return {
            valid: false,
            message:
              "El comando set espera dos argumentos: set <clave> <valor>.",
          };
        }
        if (!isNumeric(parts[1]) || !isNumeric(parts[2])) {
          return {
            valid: false,
            message:
              "La clave y el valor en set deben ser numéricos. Ej: set 12 45",
          };
        }
        return true;
      }

      case "get": {
        // tabla_hash get <key>
        if (parts.length !== 2) {
          return {
            valid: false,
            message: "El comando get espera un solo argumento: get <clave>.",
          };
        }
        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "La clave en get debe ser un número. Ej: get 21",
          };
        }
        return true;
      }

      case "delete": {
        // tabla_hash delete <key>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              "El comando delete espera un solo argumento: delete <clave>.",
          };
        }
        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "La clave en delete debe ser un número. Ej: delete 21",
          };
        }
        return true;
      }

      case "clean": {
        // tabla_hash clean
        if (parts.length !== 1) {
          return {
            valid: false,
            message:
              "El comando clean no recibe argumentos: solo escribe clean.",
          };
        }
        return true;
      }

      default:
        return {
          valid: false,
          message:
            "Operación no válida para tabla_hash. Usa create, set, get, delete o clean.",
        };
    }
  },

  arbol_binario: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insertleft":
      case "insertright": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor del nodo padre y el valor a insertar como argumento."
                : "Debe proporcionar únicamente 2 números como argumentos (padre, valor).",
          };
        }
        const insertPattern = /^\d{1,2}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor del nodo padre debe ser un número entero positivo de hasta 2 dígitos.",
          };
        }
        if (!insertPattern.test(parts[2])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_avl: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // hasta 2 dígitos (consistente con arbol_binario)
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_binario_busqueda: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // Regex para validar un número entero de hasta 4 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_rojinegro: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // hasta 2 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_splay: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // hasta 2 dígitos (consistente con arbol_binario)
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_nario: (parts: string[]) => {
    const keyword = parts[0]?.toLowerCase();

    if (!keyword) {
      return {
        valid: false,
        message:
          "Debes escribir una operación para arbol_nario (createRoot, insertChild, deleteNode, moveNode, updateValue, search, getPreOrder, getPostOrder, getLevelOrder o clean).",
      };
    }

    // Helper simple: solo valida que pueda convertirse a número
    const isNumeric = (s: string | undefined) => {
      if (s === undefined) return false;
      const n = Number(s);
      return !isNaN(n);
    };

    switch (keyword) {
      case "createroot": {
        // arbol_nario createRoot <valor>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "El comando createRoot espera un argumento: createRoot <valor>."
                : "El comando createRoot solo recibe un argumento: createRoot <valor>.",
          };
        }
        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "El valor de la raíz debe ser numérico. Ej: createRoot 10",
          };
        }
        return true;
      }

      case "insertchild": {
        // arbol_nario insertChild <parentId> <valor> [index]
        if (parts.length !== 3 && parts.length !== 4) {
          return {
            valid: false,
            message:
              "Uso: insertChild <idPadre> <valor> [index]. Ej: insertChild 1 25 0",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "El id del padre debe ser numérico. Ej: insertChild 1 25",
          };
        }

        if (!isNumeric(parts[2])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser numérico. Ej: insertChild 1 25",
          };
        }

        if (parts.length === 4 && !isNumeric(parts[3])) {
          return {
            valid: false,
            message:
              "El índice (si se indica) debe ser numérico. Ej: insertChild 1 25 0",
          };
        }

        return true;
      }

      case "deletenode": {
        // arbol_nario deleteNode <id>
        if (parts.length !== 2) {
          return {
            valid: false,
            message: "Uso: deleteNode <id>. Ej: deleteNode 3",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message:
              "El id del nodo a eliminar debe ser numérico. Ej: deleteNode 3",
          };
        }

        return true;
      }

      case "movenode": {
        // arbol_nario moveNode <id> <nuevoPadreId> [index]
        if (parts.length !== 3 && parts.length !== 4) {
          return {
            valid: false,
            message:
              "Uso: moveNode <id> <nuevoPadreId> [index]. Ej: moveNode 5 1 2",
          };
        }

        if (!isNumeric(parts[1]) || !isNumeric(parts[2])) {
          return {
            valid: false,
            message:
              "Los ids del nodo y del nuevo padre deben ser numéricos. Ej: moveNode 5 1",
          };
        }

        if (parts.length === 4 && !isNumeric(parts[3])) {
          return {
            valid: false,
            message:
              "El índice (si se indica) debe ser numérico. Ej: moveNode 5 1 2",
          };
        }

        return true;
      }

      case "updatevalue": {
        // arbol_nario updateValue <id> <nuevoValor>
        if (parts.length !== 3) {
          return {
            valid: false,
            message: "Uso: updateValue <id> <nuevoValor>. Ej: updateValue 7 42",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "El id del nodo debe ser numérico. Ej: updateValue 7 42",
          };
        }

        if (!isNumeric(parts[2])) {
          return {
            valid: false,
            message: "El nuevo valor debe ser numérico. Ej: updateValue 7 42",
          };
        }

        return true;
      }

      case "search": {
        // arbol_nario search <valor>
        if (parts.length !== 2) {
          return {
            valid: false,
            message: "Uso: search <valor>. Ej: search 25",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message: "El valor a buscar debe ser numérico. Ej: search 25",
          };
        }

        return true;
      }

      case "getpreorder":
      case "getpostorder":
      case "getlevelorder":
      case "clean": {
        // sin argumentos
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "Este comando no recibe argumentos. Ej: getPreOrder",
          };
        }
        return true;
      }

      default:
        return {
          valid: false,
          message:
            "Operación no válida para arbol_nario. Usa createRoot, insertChild, deleteNode, moveNode, updateValue, search, getPreOrder, getPostOrder, getLevelOrder o clean.",
        };
    }
  },

  arbol_123: (parts: string[]) => {
    const keyword = parts[0]?.toLowerCase();

    if (!keyword) {
      return {
        valid: false,
        message:
          "Debes escribir una operación para arbol_123 (insert, delete, search, getPreOrder, getInOrder, getPostOrder, getLevelOrder o clean).",
      };
    }

    // Helper para validar que un argumento es un número (sin hablar de rangos)
    const isNumeric = (s: string | undefined) => {
      if (s === undefined) return false;
      const n = Number(s);
      return !isNaN(n);
    };

    switch (keyword) {
      case "insert": {
        // arbol_123 insert <valor>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "El comando insert espera un argumento numérico: insert <valor>."
                : "El comando insert solo recibe un argumento: insert <valor>.",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número válido. Ej: insert 12",
          };
        }

        return true;
      }

      case "delete": {
        // arbol_123 delete <valor>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              "El comando delete espera un solo argumento numérico: delete <valor>.",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a eliminar debe ser un número válido. Ej: delete 7",
          };
        }

        return true;
      }

      case "search": {
        // arbol_123 search <valor>
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              "El comando search espera un solo argumento numérico: search <valor>.",
          };
        }

        if (!isNumeric(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a buscar debe ser un número válido. Ej: search 5",
          };
        }

        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
      case "clean": {
        // arbol_123 <comando>   (sin argumentos)
        if (parts.length !== 1) {
          return {
            valid: false,
            message: "Este comando no recibe argumentos adicionales.",
          };
        }
        return true;
      }

      default:
        return {
          valid: false,
          message:
            "Operación no válida para arbol_123. Usa insert, delete, search, getPreOrder, getInOrder, getPostOrder, getLevelOrder o clean.",
        };
    }
  },

  arbol_b: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // hasta 2 dígitos (consistente con arbol_binario)
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getpreorder":
      case "getinorder":
      case "getpostorder":
      case "getlevelorder":
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

  arbol_b_plus: (parts) => {
    const k = parts[0]?.toLowerCase();

    // helpers
    const isTwoDigits = (v: unknown) => /^\d{1,2}$/.test(String(v));
    const toNum = (v: unknown) => Number(String(v));
    const noArgsMsg = {
      valid: false,
      message: "El método no espera ningún argumento.",
    };

    switch (k) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        if (!isTwoDigits(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(toNum(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(toNum(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      // Alias aceptado: getRange
      case "range":
      case "getrange": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message: "Uso: range from to. Ej.: range 10 25",
          };
        }
        const [fromStr, toStr] = [parts[1], parts[2]];
        if (!isTwoDigits(fromStr) || !isTwoDigits(toStr)) {
          return {
            valid: false,
            message:
              "Los parámetros from y to deben ser enteros positivos de hasta 2 dígitos.",
          };
        }
        const from = toNum(fromStr);
        const to = toNum(toStr);
        if (from > to) {
          return {
            valid: false,
            message:
              "El primer argumento debe ser menor o igual que el segundo (from ≤ to).",
          };
        }
        return true;
      }

      case "scanfrom": {
        if (parts.length !== 3) {
          return {
            valid: false,
            message: "Uso: scanFrom start limit. Ej.: scanFrom 15 5",
          };
        }
        const [startStr, limitStr] = [parts[1], parts[2]];
        if (!isTwoDigits(startStr)) {
          return {
            valid: false,
            message:
              "El parámetro start debe ser un entero positivo de hasta 2 dígitos.",
          };
        }
        if (!/^\d+$/.test(String(limitStr)) || toNum(limitStr) <= 0) {
          return {
            valid: false,
            message: "El parámetro limit debe ser un entero positivo (≥ 1).",
          };
        }
        return true;
      }

      case "getinorder":
      case "getlevelorder":
      case "clean": {
        if (parts.length !== 1) return noArgsMsg;
        return true;
      }

      default:
        return false;
    }
  },

  arbol_heap: (parts) => {
    const keyword = parts[0]?.toLowerCase();

    switch (keyword) {
      case "insert": {
        if (parts.length !== 2) {
          return {
            valid: false,
            message:
              parts.length === 1
                ? "Debe proporcionar el valor a insertar como argumento."
                : "El método únicamente espera el valor a insertar como argumento.",
          };
        }
        const insertPattern = /^\d{1,2}$/; // hasta 2 dígitos
        if (!insertPattern.test(parts[1])) {
          return {
            valid: false,
            message:
              "El valor a insertar debe ser un número entero positivo de hasta 2 dígitos.",
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
                ? "Debe proporcionar el valor a eliminar como argumento."
                : "El método únicamente espera el valor a eliminar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a eliminar debe ser un número válido.",
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
                ? "Debe proporcionar el valor a buscar como argumento."
                : "El método únicamente espera el valor a buscar como argumento.",
          };
        }
        if (isNaN(Number(parts[1]))) {
          return {
            valid: false,
            message: "El valor a buscar debe ser un número válido.",
          };
        }
        return true;
      }

      case "getlevelorder":
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
};
