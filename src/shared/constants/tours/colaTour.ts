import { TourStep } from "../typesTour";

export function getColaTourSteps(): TourStep[] {
  return [
    {
      type: "info",
      description:
        "🧭 Flujo correcto: el **primer** `enqueue(...)` **crea el objeto `cola`**. Desde entonces **todas** las operaciones deben ir con el prefijo **`cola.`**. Tras `cola.clean()`, vuelve a ejecutar `enqueue(...)` (sin prefijo) para **recrear `cola`** y continúa con `cola.`",
    },

    /* ─────────── Creación del objeto (primer enqueue SIN prefijo) ─────────── */
    {
      id: "console",
      description:
        "🎮 Usa esta consola para encolar, desencolar y consultar el frente de la **Cola**.",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "enqueue(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📥 Este primer `enqueue(10)` **crea la cola** y su referencia queda en **`cola`**. A partir de aquí, usa **`cola.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🚚 Se añadió **10**. Recuerda la regla **FIFO** (First In, First Out): el primero en entrar es el primero en salir.",
      type: "element",
    },

    /* ─────────── Operaciones usando el prefijo `cola.` ─────────── */
    // enqueue(20)
    {
      id: "inputConsola",
      text: "cola.enqueue(20);",
      type: "write",
    },
    {
      id: "console",
      description: "⏩ Encolamos **20** al final, detrás de **10**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "📦 La cola crece por el **final**, manteniendo el orden de llegada.",
      type: "element",
    },

    // memory-visualization
    {
      id: "memory-visualization",
      description:
        "🧠 Visualización de memoria: los nodos se enlazan secuencialmente del frente hacia el final.",
      type: "element",
    },

    // getFront()
    {
      id: "inputConsola",
      text: "cola.getFront();",
      type: "write",
    },
    {
      id: "console",
      description: "🔍 Consulta el **frente** de la cola sin eliminarlo.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "📌 El elemento al frente es **10** (el primero que entró).",
      type: "element",
    },

    // dequeue()
    {
      id: "inputConsola",
      text: "cola.dequeue();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🚪 `dequeue()` elimina el **primer** elemento (el más antiguo) siguiendo **FIFO**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🧹 El nodo frontal desaparece y el siguiente pasa a ser el nuevo frente.",
      type: "element",
    },

    // info-cards (tamaño)
    {
      id: "info-cards",
      description:
        "📊 Revisa el **tamaño** actual de la cola; se actualiza tras cada operación.",
      type: "element",
    },

    /* ─────────── Limpieza y recordatorio de recreación ─────────── */
    // clean()
    {
      id: "inputConsola",
      text: "cola.clean();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🗑️ `clean()` borra **todos** los elementos de la cola. `cola` queda vacía.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🌌 ¡Todo limpio! Para **volver a usar** la cola, ejecuta de nuevo **`enqueue(...)`** (sin prefijo) para **recrear `cola`** y continúa con **`cola.`** en cada comando.",
      type: "element",
    },
  ];
}
