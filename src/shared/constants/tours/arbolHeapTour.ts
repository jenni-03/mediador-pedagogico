import { TourStep } from "../typesTour";

export function getArbolHeapTour(): TourStep[] {
  return [
    // ================== INTRO ==================
    {
      type: "info",
      description:
        "🧱 Un **Heap binario** es un árbol casi completo que mantiene la **propiedad de Heap**.\n- **Max-Heap**: cada nodo ≥ a sus hijos.\n- **Min-Heap**: cada nodo ≤ a sus hijos.\nOperaciones clave: **insert** (burbujeo arriba) y **delete** de la raíz (heapify abajo).",
    },
    {
      type: "info",
      description:
        "⚠️ Importante: el **primer `insert(...)`** crea el objeto `arbolHeap`. A partir de ahí, usa **`arbolHeap.`** en todos los comandos (p. ej., `arbolHeap.insert(30)`). Tras `arbolHeap.clean()`, repite el proceso: un `insert(...)` SIN prefijo para re-crear y luego `arbolHeap.*`.",
    },

    // ============== CREAR EL OBJETO + INSERTS (UP-HEAP) ==============
    {
      type: "info",
      description:
        "➕ Empecemos. El primer insert **crea** el objeto. Luego seguimos con `arbolHeap.`",
    },
    { id: "inputConsola", text: "insert(19);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🆕 Se crea `arbolHeap` y se inserta **19** como raíz.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolHeap.insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **30**. Como es mayor que su padre, **sube** (percolate-up).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolHeap.insert(24);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **24**. Se compara con su padre; si corresponde, sube para mantener el Max-Heap.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolHeap.insert(14);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **14** (no supera a su padre, se queda).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolHeap.insert(1);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **1**. Sin burbujeo en Max-Heap.",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "main-canvas",
      type: "element",
      description:
        "📌 Observa comparaciones padre↔hijo y los **⇅** cuando hay swap. En Max-Heap el padre siempre queda ≥ que sus hijos.",
    },

    // ============== SEARCH ==============
    {
      type: "info",
      description:
        "🔎 **search** recorre desde la raíz hacia el objetivo, iluminando el camino.",
    },
    { id: "inputConsola", text: "arbolHeap.search(24);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔎 Buscamos **24** en el heap.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "✅ Se resalta el camino y el nodo si existe.",
    },

    // ============== DELETE ROOT (DOWN-HEAP) ==============
    {
      type: "info",
      description:
        "🗑️ **delete(30)** elimina la **raíz**: sube el último nodo y hace **heapify-down** contra el **hijo más grande** (en Max-Heap).",
    },
    { id: "inputConsola", text: "arbolHeap.delete(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🗑️ Quitamos la raíz. El nuevo root baja intercambiando con su mejor hijo hasta restaurar la propiedad.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Verás comparaciones y swaps **⇅** al ir bajando el valor hasta su posición correcta.",
    },

    // ============== LEVEL-ORDER (BFS / ARRAY) ==============
    {
      type: "info",
      description:
        "📶 **getLevelOrder()** muestra el heap **por niveles** (BFS) y su representación en **arreglo**.",
    },
    { id: "inputConsola", text: "arbolHeap.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧭 Desplegamos el arreglo level-order con índices.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🧊 Fichas vuelan a la bandeja; debajo verás la **píldora de índice** de cada posición.",
    },

    // ============== CLEAN + RECREAR OBJETO ==============
    { id: "inputConsola", text: "arbolHeap.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧽 Limpiamos el heap (se elimina el objeto interno).",
    },
    { id: "inputConsola", type: "enter" },

    {
      type: "info",
      description:
        "🔁 Tras `clean()`, el objeto se elimina. Para continuar debes **re-crear** el heap con un **nuevo `insert(...)` SIN prefijo**, y luego volver a usar `arbolHeap.*`.",
    },
    { id: "inputConsola", text: "insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🆕 Se re-crea `arbolHeap` con **50** como raíz.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolHeap.insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** usando `arbolHeap.insert(...)`.",
    },
    { id: "inputConsola", type: "enter" },

    // ============== NOTAS FINALES ==============
    {
      type: "info",
      description:
        "📎 Complejidades: **insert** O(log n), **delete** O(log n), **getLevelOrder** O(n). La forma casi completa garantiza altura **O(log n)**. Cambiando el modo a **Min-Heap**, simplemente se invierten las comparaciones.",
    },
  ];
}
