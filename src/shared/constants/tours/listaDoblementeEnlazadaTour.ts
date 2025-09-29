import { TourStep } from "../typesTour";

export function getListaDoblementeEnlazadaTour(): TourStep[] {
  return [
    {
      type: "info",
      description:
        "🔧 Flujo correcto: el **primer** `insertFirst(...)` **crea el objeto `le`**. Desde ese punto, **todas** las operaciones deben usar el prefijo **`le.`**. Si limpias con `le.clean()`, vuelve a ejecutar `insertFirst(...)` (sin prefijo) para **recrear `le`** y continúa con `le.`",
    },

    /* ─────────── Creación del objeto (primer insertFirst SIN prefijo) ─────────── */
    {
      id: "inputConsola",
      text: "insertFirst(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📌 Este primer `insertFirst(10)` **crea la lista** y su referencia queda en **`le`**. A partir de ahora, usa **`le.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "👀 Aparece el nodo **10** como cabeza y cola (lista de un solo elemento). En listas doblemente enlazadas cada nodo tiene **prev** y **next**.",
    },

    /* ─────────── Operaciones usando el prefijo `le.` ─────────── */
    // insertLast
    {
      id: "inputConsola",
      text: "le.insertLast(20);",
      type: "write",
    },
    {
      id: "console",
      description: "📌 Agrega **20** al final de la lista.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔗 Ahora hay dos nodos: **10 ⇄ 20** (ambos enlaces quedan consistentes).",
    },

    // insertAt
    {
      id: "inputConsola",
      text: "le.insertAt(15, 1);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📌 Inserta **15** en la **posición 1**, entre **10** y **20**, ajustando **prev/next**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "📐 Queda **10 ⇄ 15 ⇄ 20** con enlaces dobles correctos.",
    },

    // removeFirst
    {
      id: "inputConsola",
      text: "le.removeFirst();",
      type: "write",
    },
    {
      id: "console",
      description: "🧹 Elimina el **primer nodo** de la lista.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "⛔ Se eliminó **10**. La nueva cabeza es **15**.",
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
        "🧹 Elimina el **último nodo** (se actualiza la cola y su `next = null`).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "🗑️ Se eliminó **20**. La lista contiene solo **15**.",
    },

    // removeAt
    {
      id: "inputConsola",
      text: "le.removeAt(0);",
      type: "write",
    },
    {
      id: "console",
      description: "❌ Elimina el nodo en la **posición 0** (valor **15**).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "🧨 Se removió **15**. La lista está vacía.",
    },

    // search
    {
      id: "inputConsola",
      text: "le.search(20);",
      type: "write",
    },
    {
      id: "console",
      description: "🔍 Busca el valor **20** en la lista.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔎 Se intentó buscar **20**, pero la lista actual está vacía.",
    },

    // info-cards (tamaño)
    {
      id: "info-cards",
      type: "element",
      description:
        "📦 Observa el **tamaño** y las referencias de **cabeza/cola**. Se actualizan automáticamente en cada operación.",
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
        "🧼 Limpia toda la lista liberando todos los nodos. `le` queda sin elementos.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🧽 Todo ha sido borrado. Para **volver a usar** la lista, ejecuta nuevamente **`insertFirst(...)`** (sin prefijo) para **recrear `le`** y luego continúa con **`le.`** en cada comando.",
    },

    // Cierre
    {
      type: "info",
      description:
        "🎯 Resumen: primer `insertFirst(...)` crea `le`; después todo con `le.`; tras `le.clean()` repite la creación con `insertFirst(...)` y sigue usando `le.`",
    },
  ];
}
