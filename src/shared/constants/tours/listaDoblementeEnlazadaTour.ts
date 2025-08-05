import { TourStep } from "../typesTour";

export function getListaDoblementeEnlazadaTour(): TourStep[] {
  return [
    // insertFirst
    {
      id: "inputConsola",
      text: "insertFirst(10);",
      type: "write",
    },
    {
      id: "console",
      description: `📌 Este comando inserta el valor **10** al inicio de la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `👀 Observa cómo el nodo **10** aparece como el primero (y único) de la lista.`,
    },

    // insertLast
    {
      id: "inputConsola",
      text: "insertLast(20);",
      type: "write",
    },
    {
      id: "console",
      description: `📌 Este comando agrega el valor **20** al final de la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🔗 Ahora hay dos nodos: **10** apunta hacia **20**, y **20** apunta hacia atrás a **10**.`,
    },

    // insertAt
    {
      id: "inputConsola",
      text: "insertAt(15, 1);",
      type: "write",
    },
    {
      id: "console",
      description: `📌 Inserta el valor **15** en la posición **1**, entre **10** y **20**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `📐 El nodo **15** se ha insertado en el medio, conservando enlaces dobles entre todos los nodos.`,
    },

    // removeFirst
    {
      id: "inputConsola",
      text: "removeFirst();",
      type: "write",
    },
    {
      id: "console",
      description: `🧹 Este comando elimina el primer nodo.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `⛔ El nodo **10** ha sido eliminado. **15** ahora es el nuevo primero.`,
    },

    // removeLast
    {
      id: "inputConsola",
      text: "removeLast();",
      type: "write",
    },
    {
      id: "console",
      description: `🧹 Elimina el último nodo de la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🗑️ El nodo **20** ha sido eliminado. La lista contiene solo **15**.`,
    },

    // removeAt
    {
      id: "inputConsola",
      text: "removeAt(0);",
      type: "write",
    },
    {
      id: "console",
      description: `❌ Elimina el nodo en la posición **0**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🧨 El nodo **15** fue removido. La lista está ahora vacía.`,
    },

    // search
    {
      id: "inputConsola",
      text: "search(20);",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 Busca si el valor **20** existe en la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🔎 El sistema buscó el valor **20**, pero la lista está vacía.`,
    },

    // clean
    {
      id: "inputConsola",
      text: "clean();",
      type: "write",
    },
    {
      id: "console",
      description: `🧼 Limpia toda la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      type: "element",
      description: `🧽 Todo ha sido borrado. Tu lista doblemente enlazada está limpia y lista para comenzar de nuevo.`,
    },

  ];
}
