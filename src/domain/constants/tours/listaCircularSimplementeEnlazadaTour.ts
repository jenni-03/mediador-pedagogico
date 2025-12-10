import { TourStep } from "../typesTour";

export function getListaCircularSimplementeEnlazadaTour(): TourStep[] {
  return [
    {
      type: "info",
      description:
        "🔁 Flujo correcto: el **primer** `insertFirst(...)` **crea el objeto `le`**. Desde entonces **todas** las operaciones deben ir con el prefijo **`le.`**. Tras `le.clean()`, vuelve a ejecutar `insertFirst(...)` (sin prefijo) para **recrear `le`** y continúa usando `le.`",
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
        "🧠 Este primer `insertFirst(10)` **crea la lista circular** y su referencia se guarda en **`le`**. A partir de aquí usa **`le.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔄 Se inserta **10**. Como es el único nodo, **apunta a sí mismo**, cerrando el ciclo.",
      type: "element",
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
      description: "📌 Añade **20** al final manteniendo la **circularidad**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔗 Queda **10 → 20 → 10**. El último siempre vuelve al primero.",
      type: "element",
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
        "🔁 Inserta **15** en la **posición 1**. La estructura circular se ajusta automáticamente.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "📍 Queda **10 → 15 → 20 → 10** manteniendo el ciclo intacto.",
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
        "🧹 Elimina el **primer nodo** de la lista (actualiza el inicio y el enlace del último).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🪓 Se removió **10**. El ciclo inicia ahora en **15**: **15 → 20 → 15**.",
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
        "🧹 Elimina el **último nodo** (se actualiza el enlace del nuevo último hacia el inicio).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🗑️ Se eliminó **20**. Queda un único nodo **15** que apunta a sí mismo.",
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
        "❌ Elimina el nodo en la **posición 0** sin romper la circularidad.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🧨 Se removió **15**. La lista ha quedado **vacía**.",
      type: "element",
    },

    // search
    {
      id: "inputConsola",
      text: "le.search(20);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 Busca el valor **20** recorriendo desde el inicio hasta cerrar el ciclo (o detectar lista vacía).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "👁️ La lista está vacía, por lo que **no se encontró** el valor.",
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
        "🧼 Elimina todos los nodos y reinicia la lista circular. `le` queda sin elementos.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🌪️ La lista fue limpiada. Para **volver a usarla**, ejecuta de nuevo **`insertFirst(...)`** (sin prefijo) para **recrear `le`** y continúa con **`le.`** en cada comando.",
      type: "element",
    },
  ];
}
