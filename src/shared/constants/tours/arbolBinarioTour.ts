import { TourStep } from "../typesTour";

export function getArbolBinarioTour(): TourStep[] {
  return [
    // INTRODUCCIÓN + FLUJO
    {
      type: "info",
      description:
        "🌳 Un **árbol binario** tiene a lo sumo dos hijos por nodo (izquierdo y derecho). Útil para búsquedas, inserciones y recorridos.",
    },
    {
      type: "info",
      description:
        "⚠️ Flujo correcto: el **primer** `insertLeft(padre, valor)` **crea el objeto `arbolBi`** (para la raíz se ignora el padre). Desde entonces **todas** las operaciones deben ir con el prefijo **`arbolBi.`**. Tras `arbolBi.clean()`, vuelve a ejecutar `insertLeft(...)` (sin prefijo) para **recrear `arbolBi`** y continúa con `arbolBi.`",
    },

    /* ─────────── Creación del objeto (primer insertLeft SIN prefijo) ─────────── */
    {
      id: "inputConsola",
      text: "insertLeft(0, 1);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌱 `insertLeft(0, 1)` **crea la raíz** con valor **1** (se ignora el padre) y su referencia queda en **`arbolBi`**. A partir de aquí usa **`arbolBi.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    /* ─────────── Operaciones usando el prefijo `arbolBi.` ─────────── */
    // HIJOS DE 1
    {
      id: "inputConsola",
      text: "arbolBi.insertLeft(1, 4);",
      type: "write",
    },
    {
      id: "console",
      description: "🌿 Inserta **4** como **hijo izquierdo** de **1**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBi.insertRight(1, 5);",
      type: "write",
    },
    {
      id: "console",
      description: "🌿 Inserta **5** como **hijo derecho** de **1**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    // HIJOS DE 5
    {
      id: "inputConsola",
      text: "arbolBi.insertLeft(5, 6);",
      type: "write",
    },
    {
      id: "console",
      description: "🌿 Inserta **6** como hijo **izquierdo** de **5**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBi.insertRight(5, 2);",
      type: "write",
    },
    {
      id: "console",
      description: "🌿 Inserta **2** como hijo **derecho** de **5**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    // HIJO DE 2
    {
      id: "inputConsola",
      text: "arbolBi.insertLeft(2, 56);",
      type: "write",
    },
    {
      id: "console",
      description: "🌿 Inserta **56** como hijo **izquierdo** de **2**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "main-canvas",
      description:
        "🌳 ¡Perfecto! Ya tienes un árbol con múltiples niveles. Observa la estructura formada.",
      type: "element",
    },

    // SEARCH
    {
      id: "inputConsola",
      text: "arbolBi.search(56);",
      type: "write",
    },
    {
      id: "console",
      description: "🔍 Busca si existe un nodo con valor **56** en el árbol.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🔎 El nodo **56** fue encontrado en el recorrido.",
      type: "element",
    },

    // DELETE
    {
      id: "inputConsola",
      text: "arbolBi.delete(4);",
      type: "write",
    },
    {
      id: "console",
      description: "🗑️ Elimina el nodo con valor **4** si existe.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🧹 El nodo **4** fue eliminado correctamente.",
      type: "element",
    },

    // RECORRIDOS
    {
      id: "inputConsola",
      text: "arbolBi.getPreOrder();",
      type: "write",
    },
    {
      id: "console",
      description: "🧭 **Preorden**: nodo → izquierda → derecha.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBi.getInOrder();",
      type: "write",
    },
    {
      id: "console",
      description: "🔄 **Inorden**: izquierda → nodo → derecha.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBi.getPostOrder();",
      type: "write",
    },
    {
      id: "console",
      description: "🔁 **Postorden**: izquierda → derecha → nodo.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBi.getLevelOrder();",
      type: "write",
    },
    {
      id: "console",
      description:
        "📶 **Por niveles**: recorre de izquierda a derecha por nivel.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    /* ─────────── Limpieza y recordatorio de recreación ─────────── */
    {
      id: "inputConsola",
      text: "arbolBi.clean();",
      type: "write",
    },
    {
      id: "console",
      description: "🧼 `clean()` borra por completo el árbol binario.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🫙 El árbol fue eliminado. Para **volver a usarlo**, ejecuta nuevamente **`insertLeft(padre, valor)`** (sin prefijo) para **recrear `arbolBi`** y luego continúa con **`arbolBi.`** en cada comando.",
      type: "element",
    },
  ];
}
