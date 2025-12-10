import { TourStep } from "../typesTour";

export function getArbolBinarioBusquedaTour(): TourStep[] {
  return [
    // INTRODUCCIÓN + FLUJO
    {
      type: "info",
      description:
        "🌳 Un **árbol binario de búsqueda (ABB)** mantiene la regla: en cada nodo, todos los valores del **subárbol izquierdo** son **menores** y todos los del **derecho** son **mayores**.",
    },
    {
      type: "info",
      description:
        "⚠️ Flujo correcto: el **primer** `insert(valor)` **crea el objeto `arbolBB`**. Desde entonces **todas** las operaciones deben ir con el prefijo **`arbolBB.`**. Tras `arbolBB.clean()`, vuelve a ejecutar `insert(...)` (sin prefijo) para **recrear `arbolBB`** y continúa con `arbolBB.`",
    },

    /* ─────────── Creación del objeto (primer insert SIN prefijo) ─────────── */
    {
      id: "inputConsola",
      text: "insert(40);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌱 `insert(40)` **crea la raíz** con valor **40** y su referencia queda en **`arbolBB`**. A partir de aquí usa **`arbolBB.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    /* ─────────── Operaciones usando el prefijo `arbolBB.` ─────────── */
    // HIJOS DE 40
    {
      id: "inputConsola",
      text: "arbolBB.insert(20);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌿 `insert(20)` agrega **20**; como es menor que **40**, va al **subárbol izquierdo**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBB.insert(60);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌿 `insert(60)` agrega **60**; como es mayor que **40**, va al **subárbol derecho**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    // HIJOS DE 60
    {
      id: "inputConsola",
      text: "arbolBB.insert(50);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌿 `insert(50)` inserta **50** bajo **60** (al **izquierdo** de 60 por ser menor).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBB.insert(80);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌿 `insert(80)` inserta **80** bajo **60** (al **derecho** de 60 por ser mayor).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    // HIJO DE 20
    {
      id: "inputConsola",
      text: "arbolBB.insert(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🌿 `insert(10)` inserta **10** bajo **20** (al **izquierdo** de 20 por ser menor).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "main-canvas",
      description:
        "🌳 ¡Perfecto! Ya tienes un ABB con múltiples niveles. Observa la estructura formada.",
      type: "element",
    },

    // SEARCH
    {
      id: "inputConsola",
      text: "arbolBB.search(80);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 `search(80)` busca si existe un nodo con valor **80** siguiendo las comparaciones del ABB.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🔎 El nodo **80** fue encontrado en el recorrido.",
      type: "element",
    },

    // DELETE
    {
      id: "inputConsola",
      text: "arbolBB.delete(20);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🗑️ `delete(20)` elimina el nodo **20** si existe, reacomodando el subárbol según el caso (hoja, un hijo o dos hijos).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "🧹 El nodo **20** fue eliminado correctamente.",
      type: "element",
    },

    // RECORRIDOS
    {
      id: "inputConsola",
      text: "arbolBB.getPreOrder();",
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
      text: "arbolBB.getInOrder();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔄 **Inorden**: izquierda → nodo → derecha (en un ABB, da los valores **ordenados**).",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "inputConsola",
      text: "arbolBB.getPostOrder();",
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
      text: "arbolBB.getLevelOrder();",
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
      text: "arbolBB.clean();",
      type: "write",
    },
    {
      id: "console",
      description: "🧼 `clean()` borra por completo el ABB.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🫙 El árbol fue eliminado. Para **volver a usarlo**, ejecuta nuevamente **`insert(valor)`** (sin prefijo) para **recrear `arbolBB`** y luego continúa con **`arbolBB.`** en cada comando.",
      type: "element",
    },
  ];
}
