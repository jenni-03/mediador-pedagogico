import { TourStep } from "../typesTour";

/** Tutorial interactivo del Árbol B+ (orden m = 4, t = 2 en el ejemplo de UI). */
export function getArbolBPTour(): TourStep[] {
  return [
    /* =============== INTRO TEÓRICA =============== */
    {
      type: "info",
      description:
        "🌳 Un **Árbol B+** es un árbol *multi-rama* (m-ario) usado en bases de datos y sistemas de archivos. Todas las **claves reales viven en las hojas**; los nodos internos solo **enrutan** con separadores.",
    },
    {
      type: "info",
      description:
        "🧩 Propiedades clave: 1) El árbol se mantiene **equilibrado** (todas las hojas a la misma altura). 2) Cada nodo (salvo la raíz) respeta mínimos/máximos de claves según el **orden m** (fan-out). 3) Las hojas están **encadenadas** con punteros izquierda↔derecha para escaneos rápidos.",
    },
    {
      type: "info",
      description:
        "📐 En el panel verás algo como **t = 2 (orden m = 4)**. Intuición: una hoja admite hasta **m−1** claves (aquí 3). Si se desborda, **se divide (split)** y se **duplica** el separador hacia el padre. Si el padre también se llena, el *split* **cascada** hasta la raíz.",
    },

    /* =============== DEMO A — INSERT + SPLIT DE HOJA =============== */
    {
      type: "info",
      description:
        "🧪 Empecemos creando el árbol y provocando el **primer split de hoja**. Si el objeto no existe, `insert()` lo crea; luego usaremos `arbolBP.insert()`.",
    },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description: "➕ Se crea la **hoja raíz** con {10}.",
    },

    { id: "inputConsola", text: "arbolBP.insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** en la hoja: {10, 20}.",
    },

    { id: "inputConsola", text: "arbolBP.insert(30);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description: "➕ Ahora la hoja es {10, 20, 30} (aún en capacidad).",
    },

    { id: "inputConsola", text: "arbolBP.insert(40);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔀 **Split de hoja**: {10,20} | {30,40}. El separador **30** se **duplica** hacia el padre (nuevo nodo interno si no existía). Las hojas quedan enlazadas por sus punteros laterales.",
    },

    /* Limpieza visual opcional (no borra el árbol; solo explica) */
    {
      type: "info",
      description:
        "💡 Observa el **separador 30** en el nodo interno y los **punteros hoja↔hoja**. Este patrón es la base de B+.",
    },

    /* =============== DEMO B — SPLIT EN CASCADA (INTERNOS Y RAÍZ) =============== */
    {
      type: "info",
      description:
        "🚧 Ahora forzaremos **más splits** para que el padre se llene y ocurra **cascada** (incluso división de la raíz).",
    },
    { id: "inputConsola", text: "arbolBP.insert(50);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolBP.insert(60);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolBP.insert(70);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolBP.insert(80);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Al llenarse varias hojas, se crean **nuevos separadores** en el padre. Si el padre supera su capacidad, también **se divide**. Si la **raíz** se divide, aparece una **nueva raíz** un nivel arriba.",
    },

    /* =============== DEMO C — SEARCH =============== */
    {
      type: "info",
      description:
        "🔎 **Búsqueda**: los internos actúan como *routers*. Bajamos por el camino guiado por los separadores hasta la hoja.",
    },
    { id: "inputConsola", text: "arbolBP.search(60);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "✅ Si **60** existe, se **resalta** en su **hoja**. Recuerda: **todas** las claves reales están en las **hojas**.",
    },
    { id: "inputConsola", text: "arbolBP.search(65);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description: "❌ Si una clave no está, la hoja destino lo confirma.",
    },

    /* =============== DEMO D — RANGE [from, to] =============== */
    {
      type: "info",
      description:
        "📚 **Rango inclusivo [from, to]**: localiza la hoja de `from` y recorre **hojas contiguas** por sus punteros `nextLeaf` hasta pasar `to`.",
    },
    { id: "inputConsola", text: "arbolBP.range(25, 65);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description:
        "📤 Se devuelven las claves ordenadas en [25, 65]. Este barrido es eficiente gracias al **encadenamiento de hojas**.",
    },

    /* =============== DEMO E — SCANFROM (start, limit) =============== */
    {
      type: "info",
      description:
        "➡️ **ScanFrom(start, limit)**: comienza en `start` (o en la **siguiente clave mayor** si no existe) y recorre `limit` elementos hacia la derecha.",
    },
    { id: "inputConsola", text: "arbolBP.scanFrom(35, 5);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description:
        "📑 Útil para *paginación por clave* (por ejemplo, leer 5 registros a partir de ≈35).",
    },

    /* =============== DEMO F — DELETE (préstamo / fusión / contracción de raíz) =============== */
    {
      type: "info",
      description:
        "🧹 **Eliminación**: borramos en la **hoja**. Si una hoja queda por debajo del mínimo, primero intenta **préstamo** de un hermano; si no es posible, realiza **fusión (merge)** y ajusta separadores. La **raíz** puede **contraerse** si se queda con un único hijo.",
    },
    { id: "inputConsola", text: "arbolBP.delete(30);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔧 Si tras borrar **30** hay **underflow** en su hoja, se intentará **redistribuir** (préstamo) con un hermano. Observa la actualización de separadores.",
    },
    { id: "inputConsola", text: "arbolBP.delete(25);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🧩 Si no hay préstamo posible, se **fusiona** la hoja con su hermana; el **separador** correspondiente se **elimina** del padre. Si el padre cae por debajo del mínimo, la corrección sube como en inserción pero a la inversa.",
    },
    { id: "inputConsola", text: "arbolBP.delete(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "⬇️ Si la **raíz** termina con un único hijo, el árbol **se contrae** (esa rama pasa a ser la nueva raíz). Altura disminuye en 1.",
    },

    /* =============== DEMO G — RECORRIDOS =============== */
    {
      type: "info",
      description:
        "🧭 **Recorridos**: en B+ el inorden práctico es “hoja por hoja” siguiendo enlaces laterales; BFS recorre la jerarquía (internos y hojas).",
    },
    { id: "inputConsola", text: "arbolBP.getInOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description:
        "🔄 Claves en **orden ascendente global** (salen desde las hojas).",
    },

    { id: "inputConsola", text: "arbolBP.getLevelOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "📶 **BFS** por niveles: primero la raíz (interno), luego sus hijos, etc. Útil para entender **separadores** y **fan-out**.",
    },

    /* =============== CLEAN FINAL =============== */
    { id: "inputConsola", text: "arbolBP.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "console",
      type: "element",
      description: "🫙 Árbol B+ **vacío**. Listo para nuevos experimentos.",
    },

    /* =============== NOTAS FINALES (INFO) =============== */
    {
      type: "info",
      description:
        "⚙️ Rendimiento: búsquedas/insert/eliminan toman **O(logₘ n)** por la gran **ramificación (m)**. Las operaciones por rango son **muy eficientes** gracias a los **punteros de hojas**.",
    },
    {
      type: "info",
      description:
        "📎 Recordatorio de comandos: `arbolBP.insert(x)`, `arbolBP.delete(x)`, `arbolBP.search(x)`, `arbolBP.range(a,b)`, `arbolBP.scanFrom(start,limit)`, `arbolBP.getInOrder()`, `arbolBP.getLevelOrder()`, `arbolBP.clean()`.",
    },
  ];
}
