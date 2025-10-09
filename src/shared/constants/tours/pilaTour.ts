import { TourStep } from "../typesTour";

export const getPilaTourSteps = (): TourStep[] => [
  /* ───────────────────────── Introducción ───────────────────────── */
  {
    type: "info",
    description:
      "🍽️ Imagina una pila de platos: solo agregas o quitas desde arriba. Es la regla **LIFO** (Last In, First Out).",
  },
  {
    type: "info",
    description:
      "⚠️ Flujo de uso: el **primer** `push(...)` **crea el objeto `pila`**. Desde ese punto, **todas** las operaciones deben ir con el prefijo **`pila.`**. Tras `pila.clean()`, vuelve a ejecutar `push(...)` (sin prefijo) para **recrear `pila`** y continúa con `pila.`",
  },

  /* ───── Creación del objeto (primer push SIN prefijo) ───── */
  {
    id: "inputConsola",
    text: "push(4);",
    type: "write",
  },
  {
    id: "console",
    description:
      "📥 Este primer `push(4)` **crea la pila** y su referencia se guarda en **`pila`**. A partir de aquí usa **`pila.`** en cada comando.",
    type: "element",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    description:
      "🧩 Aparece **4** en la parte superior. La pila crece hacia arriba con cada `push`.",
    type: "element",
  },
  {
    id: "info-cards",
    description: "📏 El tamaño de la pila ahora es **1**.",
    type: "element",
  },

  /* ─────────────────── Operaciones con `pila.` ─────────────────── */
  // push(7)
  {
    id: "inputConsola",
    text: "pila.push(7);",
    type: "write",
  },
  {
    id: "console",
    description: "📥 Agrega **7** arriba de **4**. **7** será el nuevo tope.",
    type: "element",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    description: "📦 El valor **7** quedó sobre **4**. Tope = **7**.",
    type: "element",
  },
  {
    id: "info-cards",
    description: "📏 El tamaño ahora es **2**.",
    type: "element",
  },
  {
    id: "memory-visualization",
    type: "element",
    description:
      "🧠 Vista de memoria: los nodos se apilan y su enlace superior apunta al anterior.",
  },

  // getTop()
  {
    id: "inputConsola",
    text: "pila.getTop();",
    type: "write",
  },
  {
    id: "console",
    description:
      "🔍 Muestra el elemento en la cima sin retirarlo (operación de **peek**).",
    type: "element",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    description: "👁️ Se resalta el nodo superior: **7**.",
    type: "element",
  },

  // pop()
  {
    id: "inputConsola",
    text: "pila.pop();",
    type: "write",
  },
  {
    id: "console",
    description:
      "🗑️ Elimina el elemento en la cima de la pila siguiendo la regla **LIFO**.",
    type: "element",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    description: "💥 El nodo **7** fue removido. El tope vuelve a ser **4**.",
    type: "element",
  },
  {
    id: "info-cards",
    description: "📉 El tamaño se redujo a **1**.",
    type: "element",
  },

  /* ───────────────────── Limpieza y reinicio ───────────────────── */
  // clean()
  {
    id: "inputConsola",
    text: "pila.clean();",
    type: "write",
  },
  {
    id: "console",
    description:
      "🧼 Vacía por completo la pila, eliminando todos sus elementos.",
    type: "element",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    description:
      "🌪️ Todos los nodos fueron eliminados. La pila está vacía (tamaño **0**).",
    type: "element",
  },
  {
    id: "info-cards",
    description:
      "📦 Para **volver a usar** la pila, ejecuta de nuevo **`push(...)`** (sin prefijo) para **recrear `pila`** y luego continúa con **`pila.`**",
    type: "element",
  },

  /* ───────────────────── Extras visuales ───────────────────── */
  {
    id: "execution-code",
    type: "element",
    description:
      "🧾 Aquí puedes ver el pseudocódigo de **push**, **pop** y **getTop** para conectar la animación con un lenguaje real.",
  },
];
