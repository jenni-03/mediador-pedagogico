import { TourStep } from "../typesTour";

export function getListaSimplementeEnlazadaTour(): TourStep[] {
  return [
    {
      type: "info",
      description:
        "🧪 Usaremos la consola para ejecutar comandos en la **Lista Simplemente Enlazada**. Importante: el **primer** `insertFirst(...)` **crea el objeto `le`**. Desde ese punto, **todos** los comandos deben empezar por **`le.`**. Si limpias la lista con `le.clean()`, **vuelve a ejecutar** `insertFirst(...)` para recrear `le` y continúa con `le.`",
    },

    /* ─────────── Creación del objeto (primer insertFirst SIN prefijo) ─────────── */
    {
      id: "console",
      description:
        "🧪 Esta es la consola donde escribiremos los comandos de la **Lista Simplemente Enlazada**.",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "insertFirst(5);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🧠 Este primer `insertFirst(5)` **crea la lista** y su referencia se guarda en el objeto **`le`**. A partir de ahora usa **`le.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🎨 Se muestra el nodo inicial (valor **5**). En una lista simplemente enlazada, cada nodo apunta al siguiente formando una cadena.",
      type: "element",
    },

    /* ─────────── Operaciones usando el prefijo `le.` ─────────── */
    // insertLast
    {
      id: "inputConsola",
      text: "le.insertLast(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔚 Añade un nodo con valor **10** al **final** de la lista.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🧵 El primer nodo ahora apunta al segundo. ¡La cadena crece!",
      type: "element",
    },

    // insertAt
    {
      id: "inputConsola",
      text: "le.insertAt(7, 1);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📌 Inserta el número **7** en la **posición 1**, reajustando punteros.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔄 Observa cómo se reordenan los enlaces para mantener la integridad de la cadena.",
      type: "element",
    },

    // memory-visualization
    {
      id: "memory-visualization",
      description:
        "🧠 Aquí se simula cómo se almacenan los nodos en memoria y cómo las referencias conectan la estructura.",
      type: "element",
    },

    // search
    {
      id: "inputConsola",
      text: "le.search(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 Busca el valor **10** dentro de la lista. Si existe, se resaltará su nodo.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🔎 El nodo **10** fue encontrado y resaltado.",
      type: "element",
    },

    // removeFirst
    {
      id: "inputConsola",
      text: "le.removeFirst();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🚫 Elimina el **primer nodo**. La cabeza se actualiza automáticamente.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "❌ El nodo con valor **5** fue eliminado. **7** es la nueva cabeza.",
      type: "element",
    },

    // removeLast
    {
      id: "inputConsola",
      text: "le.removeLast();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🧹 Elimina el **último nodo**. Se localiza el penúltimo para actualizar su referencia.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🧼 El nodo **10** fue eliminado. Permanece **7**.",
      type: "element",
    },

    // removeAt
    {
      id: "inputConsola",
      text: "le.removeAt(0);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🎯 Elimina el nodo en la **posición 0**; en este caso, el nodo **7**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "💀 El nodo **7** fue eliminado. La lista ha quedado vacía.",
      type: "element",
    },

    // info-cards (tamaño)
    {
      id: "info-cards",
      description:
        "📦 Aquí ves el **tamaño actual** de la lista. Se actualiza en cada operación.",
      type: "element",
    },

    /* ─────────── Limpieza y recordatorio de recreación ─────────── */
    // clean
    {
      id: "inputConsola",
      text: "le.clean();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🗑️ Limpia por completo la lista, liberando todos los nodos.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🌑 La lista queda vacía. Para **volver a usarla**, ejecuta **`insertFirst(...)`** (sin prefijo) para **recrear `le`** y después continúa con **`le.`** en cada comando.",
      type: "element",
    },

    /* ─────────── Cierre ─────────── */
    {
      type: "info",
      description:
        "🎯 ¡Listo! Ya dominas las operaciones clave de una **Lista Simplemente Enlazada** usando el flujo correcto: primer `insertFirst(...)` crea `le`; luego, todo con `le.`; tras `le.clean()`, repite `insertFirst(...)` y continúa.",
    },
  ];
}
