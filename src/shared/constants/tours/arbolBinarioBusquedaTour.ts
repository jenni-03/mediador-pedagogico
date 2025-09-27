import { TourStep } from "../typesTour";

export function getArbolBinarioBusquedaTour(): TourStep[] {
    return [
        // INTRODUCCIÓN
        {
            type: "info",
            description: `🌳 El **árbol binario de búsqueda** es una estructura jerárquica donde cada nodo puede tener como máximo **dos hijos**: uno izquierdo y uno derecho.\n\n La característica principal de un ABB es que para cada nodo, todos los valores en su subárbol izquierdo son menores que el valor del nodo, y todos los valores en su subárbol derecho son mayores.`,
        },
        {
            type: "info",
            description: `🧩 En este simulador, puedes insertar nodos, eliminarlos, buscar valores, y visualizar distintos recorridos: preorden, inorden, postorden y por niveles.`,
        },

        // CREAR RAÍZ
        {
            id: "inputConsola",
            text: "insert(40);",
            type: "write",
        },
        {
            id: "console",
            description: `🌱 \`insert(40)\` crea el primer nodo del árbol con valor **40** como raíz.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        // INSERTAR HIJOS DE 40
        {
            id: "inputConsola",
            text: "insert(20);",
            type: "write",
        },
        {
            id: "console",
            description: `🌿 \`insert(20)\` agrega un nodo con valor **20** como hijo izquierdo de **40** (puesto que el valor es menor a la raíz).`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "inputConsola",
            text: "insert(60);",
            type: "write",
        },
        {
            id: "console",
            description: `🌿 \`insert(60)\` agrega un nodo con valor **60** como hijo derecho de **40** (puesto que el valor es mayor a la raíz).`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        // INSERTAR HIJOS DE 60
        {
            id: "inputConsola",
            text: "insert(50);",
            type: "write",
        },
        {
            id: "console",
            description: `🌿 \`insert(50)\` inserta un nodo **50** como hijo izquierdo de **60** (puesto que el valor es menor a la raíz del subárbol).`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "inputConsola",
            text: "insert(80);",
            type: "write",
        },
        {
            id: "console",
            description: `🌿 \`insert(80)\` inserta un nodo **80** como hijo derecho de **60** (puesto que el valor es mayor a la raíz del subárbol).`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        // INSERTAR HIJO DE 20
        {
            id: "inputConsola",
            text: "insert(10);",
            type: "write",
        },
        {
            id: "console",
            description: `🌿 \`insertLeft(10)\` inserta un nodo **10** como hijo izquierdo de **20** (puesto que el valor es menor a la raíz del subárbol).`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "main-canvas",
            description: `🌳 ¡Perfecto! Ya tienes un árbol con múltiples niveles. Observa la estructura formada.`,
            type: "element",
        },

        // SEARCH
        {
            id: "inputConsola",
            text: "search(80);",
            type: "write",
        },
        {
            id: "console",
            description: `🔍 \`search(80)\` busca si el nodo con valor 80 existe en el árbol.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            description: `🔎 El nodo 80 fue encontrado en el recorrido.`,
            type: "element",
        },

        // DELETE
        {
            id: "inputConsola",
            text: "delete(20);",
            type: "write",
        },
        {
            id: "console",
            description: `🗑️ \`delete(20)\` elimina el nodo con valor 20 si existe.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            description: `🧹 El nodo 20 fue eliminado correctamente.`,
            type: "element",
        },

        // RECORRIDOS
        {
            id: "inputConsola",
            text: "getPreOrder();",
            type: "write",
        },
        {
            id: "console",
            description: `🧭 \`getPreOrder()\`: nodo → izquierda → derecha.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "inputConsola",
            text: "getInOrder();",
            type: "write",
        },
        {
            id: "console",
            description: `🔄 \`getInOrder()\`: izquierda → nodo → derecha.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "inputConsola",
            text: "getPostOrder();",
            type: "write",
        },
        {
            id: "console",
            description: `🔁 \`getPostOrder()\`: izquierda → derecha → nodo.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        {
            id: "inputConsola",
            text: "getLevelOrder();",
            type: "write",
        },
        {
            id: "console",
            description: `📶 \`getLevelOrder()\`: recorre por niveles, de izquierda a derecha.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },

        // CLEAN
        {
            id: "inputConsola",
            text: "clean();",
            type: "write",
        },
        {
            id: "console",
            description: `🧼 \`clean()\` borra por completo el árbol binario de búsqueda.`,
            type: "element",
        },
        {
            id: "inputConsola",
            type: "enter",
        },
        {
            id: "main-canvas",
            description: `🫙 El árbol fue eliminado. Puedes comenzar de nuevo.`,
            type: "element",
        },
    ];
}