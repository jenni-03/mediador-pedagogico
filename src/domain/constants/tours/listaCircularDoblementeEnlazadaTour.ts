import { TourStep } from "../typesTour";

export function getListaCircularDoblementeEnlazadaTour(): TourStep[] {
  return [
    {
      type: "info",
      description:
        "🔁 Flujo correcto: el **primer** `insertFirst(...)` **crea el objeto `le`**. Desde entonces **todas** las operaciones deben ir con el prefijo **`le.`**. Tras `le.clean()`, vuelve a ejecutar `insertFirst(...)` (sin prefijo) para **recrear `le`** y continúa con `le.`",
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
        "🧠 Este primer `insertFirst(10)` **crea la lista circular doblemente enlazada** y su referencia se guarda en **`le`**. A partir de aquí usa **`le.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔄 Como es el primer nodo, sus punteros **prev** y **next** apuntan a sí mismo cerrando el ciclo.",
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
      description:
        "📌 Añade **20** al final de la lista (manteniendo la circularidad).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔁 Queda **10 ⇄ 20** y ambos mantienen el ciclo: `10.prev = 20`, `20.next = 10`.",
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
        "🧩 Inserta **15** en la **posición 1** entre **10** y **20**, ajustando **prev/next** correctamente.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔗 Queda **10 ⇄ 15 ⇄ 20** y `20.next = 10` para cerrar el ciclo.",
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
        "🧹 Elimina el **primer nodo** (actualiza cabeza y enlaces del último).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🧼 Se removió **10**. La nueva cabeza es **15**: **15 ⇄ 20** (circular).",
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
        "🗑️ Elimina el **último nodo** (se actualiza la cola y sus referencias).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🚮 Se removió **20**. Queda un único nodo **15** que se enlaza consigo mismo en **prev** y **next**.",
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
      description: "❌ Elimina el nodo en la **posición 0** (valor **15**).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "💥 Todos los nodos han sido eliminados. La lista está **vacía**.",
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
        "🔍 Busca el valor **10** recorriendo la lista de forma circular (o reporta vacío).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🧐 La lista está vacía, por lo que **no se encontró** ningún nodo con valor **10**.",
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
        "🧽 Elimina todos los nodos y reinicia la lista a su estado vacío. `le` queda sin elementos.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🪣 ¡Todo limpio! Para **volver a usar** la estructura, ejecuta nuevamente **`insertFirst(...)`** (sin prefijo) para **recrear `le`** y continúa con **`le.`** en cada comando.",
      type: "element",
    },

    // Cierre
    {
      type: "info",
      description:
        "🎯 Resumen: primer `insertFirst(...)` crea `le`; luego todo con `le.`; tras `le.clean()` repite la creación con `insertFirst(...)` y sigue usando `le.`",
    },
  ];
}
