import { TourStep } from "../typesTour";

export function getListaCircularDoblementeEnlazadaTour(): TourStep[] {
  return [
    // insertFirst
    {
      id: "inputConsola",
      text: "insertFirst(10);",
      type: "write",
    },
    {
      id: "console",
      description: `🧠 Este comando inserta el valor **10** al inicio de la lista circular doblemente enlazada.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔄 Como es el primer nodo, sus punteros anterior y siguiente apuntan a sí mismo, cerrando el ciclo.`,
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
      description: `📌 Este comando añade el valor **20** al final de la lista.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔁 Ahora **10** apunta a **20**, y **20** apunta a **10**. Ambos tienen referencias dobles, cerrando el ciclo.`,
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
      description: `🧩 Inserta el valor **15** en la posición **1**, entre **10** y **20**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔗 El nodo **15** fue insertado entre los otros dos. Las referencias dobles se ajustaron correctamente.`,
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
      description: `🧹 Elimina el primer nodo de la lista circular doble.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🧼 El nodo **10** fue eliminado. **15** pasa a ser el nuevo inicio del ciclo.`,
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
      description: `🗑️ Elimina el último nodo, actualizando el puntero anterior del nuevo final.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🚮 El nodo **20** ha sido removido. Solo queda **15**, que apunta a sí mismo.`,
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
      description: `❌ Elimina el nodo en la posición **0**, en este caso **15**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `💥 Todos los nodos han sido eliminados. La lista está vacía.`,
      type: "element",
    },

    // search
    {
      id: "inputConsola",
      text: "search(10);",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 Busca el valor **10** recorriendo la lista circularmente.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🧐 Como la lista está vacía, no se encontró ningún nodo con valor **10**.`,
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
      description: `🧽 Este comando elimina todos los nodos y reinicia la lista a su estado vacío.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🪣 ¡Todo limpio! Tu lista circular doblemente enlazada está lista para comenzar desde cero.`,
      type: "element",
    },
  ];
}
