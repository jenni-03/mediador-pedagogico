import { TourStep } from "../typesTour";

export function getArbolBinarioTour(): TourStep[] {
  return [
    // INTRODUCCIÓN
    {
      type: "info",
      description: `🌳 El **árbol binario** es una estructura jerárquica donde cada nodo puede tener como máximo **dos hijos**: uno izquierdo y uno derecho.\n\nSirve para organizar datos de forma que facilita operaciones como búsquedas, inserciones y recorridos.`,
    },
    {
      type: "info",
      description: `🧩 En este simulador, puedes insertar nodos, eliminarlos, buscar valores, y visualizar distintos recorridos: preorden, inorden, postorden y por niveles.`,
    },

    // CREAR RAÍZ
    {
      id: "inputConsola",
      text: "insertLeft(0, 1);",
      type: "write",
    },
    {
      id: "console",
      description: `🌱 \`insertLeft(0, 1)\` crea el primer nodo del árbol con valor **1** como raíz (se ignora el padre).`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },

    // INSERTAR HIJOS DE 1
    {
      id: "inputConsola",
      text: "insertLeft(1, 4);",
      type: "write",
    },
    {
      id: "console",
      description: `🌿 \`insertLeft(1, 4)\` agrega un nodo con valor **4** como hijo izquierdo de **1**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },

    {
      id: "inputConsola",
      text: "insertRight(1, 5);",
      type: "write",
    },
    {
      id: "console",
      description: `🌿 \`insertRight(1, 5)\` agrega un nodo con valor **5** como hijo derecho de **1**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },

    // INSERTAR HIJOS DE 5
    {
      id: "inputConsola",
      text: "insertLeft(5, 6);",
      type: "write",
    },
    {
      id: "console",
      description: `🌿 \`insertLeft(5, 6)\` inserta un nodo **6** como hijo izquierdo de **5**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },

    {
      id: "inputConsola",
      text: "insertRight(5, 2);",
      type: "write",
    },
    {
      id: "console",
      description: `🌿 \`insertRight(5, 2)\` inserta un nodo **2** como hijo derecho de **5**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },

    // INSERTAR HIJO DE 2
    {
      id: "inputConsola",
      text: "insertLeft(2, 56);",
      type: "write",
    },
    {
      id: "console",
      description: `🌿 \`insertLeft(2, 56)\` inserta un nodo **56** como hijo izquierdo de **2**.`,
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
      text: "search(56);",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 \`search(56)\` busca si el nodo con valor 56 existe en el árbol.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔎 El nodo 56 fue encontrado en el recorrido.`,
      type: "element",
    },

    // DELETE
    {
      id: "inputConsola",
      text: "delete(4);",
      type: "write",
    },
    {
      id: "console",
      description: `🗑️ \`delete(4)\` elimina el nodo con valor 4 si existe.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🧹 El nodo 4 fue eliminado correctamente.`,
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
      description: `🧼 \`clean()\` borra por completo el árbol binario.`,
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
