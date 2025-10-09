import { TourStep } from "../typesTour";

export function getColaPrioridadTour(): TourStep[] {
  return [
    // INTRODUCCIÓN + FLUJO
    {
      type: "info",
      description:
        "🎯 Una **cola de prioridad** atiende por **prioridad** (mayor primero), no por orden de llegada.\n\n⚠️ Flujo correcto: el **primer** `enqueue(valor, prioridad)` **crea el objeto `colaP`**. Desde entonces **todas** las operaciones deben ir con el prefijo **`colaP.`**. Tras `colaP.clean()`, vuelve a ejecutar `enqueue(...)` (sin prefijo) para **recrear `colaP`** y continúa con `colaP.`",
    },
    {
      type: "info",
      description:
        "📌 Ejemplo: si insertas `(1, p1)`, `(5, p3)`, `(2, p2)`, el orden de salida será **5 → 2 → 1**.",
    },

    /* ─────────── Creación del objeto (primer enqueue SIN prefijo) ─────────── */
    {
      id: "inputConsola",
      text: "enqueue(10, 3);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📥 Este primer `enqueue(10, 3)` **crea la cola de prioridad** y su referencia queda en **`colaP`**. A partir de aquí, usa **`colaP.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "📦 Se insertó **10** con **prioridad 3** y se ubicó según su prioridad.",
      type: "element",
    },

    /* ─────────── Operaciones usando el prefijo `colaP.` ─────────── */
    // ENQUEUE extra
    {
      id: "inputConsola",
      text: "colaP.enqueue(7, 5);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🚀 Insertamos **7** con **prioridad 5** (más alta que 3); quedará al **frente**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔝 La cola reordena por prioridad: **7** queda delante de **10**.",
      type: "element",
    },

    // GETFRONT
    {
      id: "inputConsola",
      text: "colaP.getFront();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 `getFront()` muestra el elemento con **mayor prioridad** sin eliminarlo.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "📊 El frente actual es **7** (prioridad 5).",
      type: "element",
    },

    // DEQUEUE
    {
      id: "inputConsola",
      text: "colaP.dequeue();",
      type: "write",
    },
    {
      id: "console",
      description:
        "📤 `dequeue()` elimina el elemento de **mayor prioridad** (el primero en la cola).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "❌ Se removió **7**. **10** (p3) pasa a ser el nuevo frente si no hay otro con prioridad mayor.",
      type: "element",
    },

    /* ─────────── Limpieza y recordatorio de recreación ─────────── */
    // CLEAN
    {
      id: "inputConsola",
      text: "colaP.clean();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🧼 `clean()` elimina **todos** los elementos; `colaP` queda vacía.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🫙 La cola quedó vacía. Para **volver a usarla**, ejecuta de nuevo **`enqueue(valor, prioridad)`** (sin prefijo) para **recrear `colaP`** y luego continúa con **`colaP.`**",
      type: "element",
    },
  ];
}
