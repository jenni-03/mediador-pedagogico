import { TourStep } from "../typesTour";

export function getListaCircularSimplementeEnlazadaTour(): TourStep[] {
  return [
    // insertFirst
    {
      id: "inputConsola",
      text: "insertFirst(10);",
      type: "write",
    },
    {
      id: "console",
      description: `🧠 Este comando inserta el valor **10** al inicio de la lista circular.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔄 Se ha insertado el nodo **10**, y como es el único, se apunta a sí mismo cerrando el ciclo.`,
      type: "element",
    },

    // insertLast
    {
      id: "inputConsola",
      text: "insertLast(20);",
      type: "write",
    },
    {
      id: "console",
      description: `📌 Este comando añade el valor **20** al final de la lista, manteniendo el ciclo.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔗 El nodo **10** ahora apunta a **20**, y **20** apunta de nuevo a **10**, completando el círculo.`,
      type: "element",
    },

    // insertAt
    {
      id: "inputConsola",
      text: "insertAt(15, 1);",
      type: "write",
    },
    {
      id: "console",
      description: `🔁 Inserta el valor **15** en la posición **1**. La estructura circular se ajusta automáticamente.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `📍 El nodo **15** ha sido insertado entre **10** y **20**, manteniendo el ciclo intacto.`,
      type: "element",
    },

    // removeFirst
    {
      id: "inputConsola",
      text: "removeFirst();",
      type: "write",
    },
    {
      id: "console",
      description: `🧹 Este comando elimina el primer nodo de la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🪓 El nodo **10** fue removido. Ahora **15** es el nuevo inicio del ciclo.`,
      type: "element",
    },

    // removeLast
    {
      id: "inputConsola",
      text: "removeLast();",
      type: "write",
    },
    {
      id: "console",
      description: `🧹 Este comando elimina el último nodo. El puntero al inicio se actualiza si es necesario.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🗑️ El nodo **20** ha sido eliminado. **15** apunta nuevamente a sí mismo.`,
      type: "element",
    },

    // removeAt
    {
      id: "inputConsola",
      text: "removeAt(0);",
      type: "write",
    },
    {
      id: "console",
      description: `❌ Elimina el nodo en la posición **0** sin romper la circularidad.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🧨 El nodo **15** fue eliminado. La lista ahora está vacía.`,
      type: "element",
    },

    // search
    {
      id: "inputConsola",
      text: "search(20);",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 Busca el valor **20** recorriendo la lista desde el inicio hasta cerrar el ciclo.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `👁️ Como la lista está vacía, no se encontró ningún valor.`,
      type: "element",
    },

    // clean
    {
      id: "inputConsola",
      text: "clean();",
      type: "write",
    },
    {
      id: "console",
      description: `🧼 Elimina todos los nodos y reinicia la lista circular a su estado inicial.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🌪️ La lista ha sido limpiada por completo. Todo listo para comenzar de nuevo.`,
      type: "element",
    },
  ];
}
