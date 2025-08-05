import { TourStep } from "../typesTour";

export function getListaSimplementeEnlazadaTour(): TourStep[] {
  return [
    {
      id: "console",
      description:
        "🧪 Usaremos esta consola para ejecutar comandos en la **Lista Simplemente Enlazada**. Aquí ocurre toda la magia 🪄.",
      type: "element",
    },

    // insertFirst
    {
      id: "inputConsola",
      text: "insertFirst(5);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🧠 Este comando inserta el número **5** al **inicio de la lista**. Es ideal para construir desde la cabeza.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🎨 Aquí ves el nodo recién insertado. En una lista simplemente enlazada, cada nodo apunta al siguiente formando una cadena.",
      type: "element",
    },

    // insertLast
    {
      id: "inputConsola",
      text: "insertLast(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔚 Este comando añade un nuevo nodo con valor **10** al **final de la lista**.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🧵 Ahora el primer nodo apunta al segundo. ¡Has creado una cadena de nodos enlazados!",
      type: "element",
    },

    // insertAt
    {
      id: "inputConsola",
      text: "insertAt(7, 1);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📌 Con este comando insertamos el número **7** en la **posición 1**, desplazando los elementos hacia la derecha.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🔄 Fíjate cómo se reordenan los punteros para enlazar correctamente los nodos.",
      type: "element",
    },

    // memory-visualization
    {
      id: "memory-visualization",
      description:
        "🧠 En esta sección se simula cómo se almacenan los nodos en memoria. Esto ayuda a entender la dinámica de las referencias.",
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
      description:
        "🔍 Este comando busca el valor **10** dentro de la lista. El nodo será resaltado si se encuentra.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🔎 Se ha resaltado el nodo **10**, indicando que fue encontrado correctamente.",
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
      description:
        "🚫 Aquí eliminamos el **primer nodo** de la lista. El nodo cabeza se actualiza automáticamente.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "❌ El nodo con valor **5** fue eliminado. Ahora **7** es el nuevo primer nodo.",
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
      description:
        "🧹 Elimina el **último nodo** de la lista. Se recorre hasta encontrar el penúltimo para actualizar su referencia.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🧼 El nodo **10** ha sido eliminado. Solo queda **7** en la lista.",
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
      description:
        "🎯 Elimina el nodo en la **posición indicada**, en este caso el nodo con valor **7**.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "💀 El nodo **7** fue eliminado. La lista está vacía nuevamente.",
      type: "element",
    },

    // info-cards (tamaño)
    {
      id: "info-cards",
      description:
        "📦 Aquí puedes observar el **tamaño actual de la lista**. Este se actualiza automáticamente tras cada operación.",
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
      description:
        "🗑️ Este comando borra completamente la lista, liberando todos los nodos.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🌑 Y así, la lista queda vacía. ¡Listo para empezar de nuevo con una estructura limpia!",
      type: "element",
    },
  ];
}
