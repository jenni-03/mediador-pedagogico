import { TourStep } from "../typesTour";

export function getArbolNarioTour(): TourStep[] {
  return [
    // ================= INTRO =================
    {
      type: "info",
      description:
        "🌿 Un **Árbol N-ario** permite 0..N hijos por nodo. Útil para jerarquías (menús, carpetas, organigramas).",
    },
    {
      type: "info",
      description:
        "⚙️ Reglas del simulador: (1) **createRoot(valor)** crea la raíz **y** el objeto **arbolNario**. (2) Desde ahí, todos los comandos se invocan como **arbolNario.*** (3) Tras **clean()**, el árbol queda vacío y **se elimina el objeto**; para continuar debes volver a llamar **createRoot(valor)** (sin prefijo).",
    },
    {
      type: "info",
      description:
        "🆔 Importante: el **id es numérico y consecutivo**. La raíz queda con id **1**; luego cada nueva inserción incrementa el id (**2, 3, 4, ...**). Usa esos ids en `insertChild`, `updateValue`, `moveNode`, `deleteNode`.",
    },

    // ================= CREAR RAÍZ (id=1) =================
    { id: "inputConsola", text: "createRoot(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🌱 Se creó la raíz con valor **10** e **id=1**. También quedó disponible el objeto **arbolNario**.",
    },
    { id: "inputConsola", type: "enter" },

    // ================= INSERTAR HIJOS (id=2,3,4) =================
    {
      type: "info",
      description:
        "➕ **INSERTCHILD(parentId, valor, index?)**: inserta bajo el padre `parentId`. Si omites `index`, agrega al final; con `index` (0-based) fijas posición.",
    },

    // hijo con valor 35 como último (id=2)
    {
      id: "inputConsola",
      text: "arbolNario.insertChild(1, 35);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **35** como hijo de **id=1** (al final). Este nuevo nodo recibe **id=2**.",
    },
    { id: "inputConsola", type: "enter" },

    // hijo con valor 99 en posición 0 (id=3)
    {
      id: "inputConsola",
      text: "arbolNario.insertChild(1, 99, 0);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description:
        "📍 Insertamos **99** en la **posición 0** entre los hijos de **id=1**. Este nodo recibe **id=3**. El orden de hijos queda: [99(id=3), 35(id=2)].",
    },
    { id: "inputConsola", type: "enter" },

    // hijo con valor 12 bajo id=3 (id=4)
    {
      id: "inputConsola",
      text: "arbolNario.insertChild(3, 12);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **12** como hijo de **id=3**. Este nodo recibe **id=4**.",
    },
    { id: "inputConsola", type: "enter" },

    {
      id: "main-canvas",
      type: "element",
      description:
        "👀 Deberías ver 10(id=1) con hijos 99(id=3) y 35(id=2); y 12(id=4) colgando de 99(id=3).",
    },

    // ================= UPDATEVALUE =================
    {
      type: "info",
      description:
        "✏️ **UPDATEVALUE(id, nuevoValor)**: actualiza el valor almacenado en el nodo indicado.",
    },
    {
      id: "inputConsola",
      text: "arbolNario.updateValue(2, 33);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description: "✏️ Actualizamos el nodo **id=2** de **35 → 33**.",
    },
    { id: "inputConsola", type: "enter" },

    // ================= SEARCH =================
    {
      type: "info",
      description:
        "🔎 **SEARCH(valor)**: busca por BFS el primer nodo con ese valor y resalta el camino.",
    },
    { id: "inputConsola", text: "arbolNario.search(12);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔎 Buscamos el valor **12**.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "✅ Se resalta el camino hasta **12 (id=4)** si existe.",
    },

    // ================= MOVENODE =================
    {
      type: "info",
      description:
        "📦 **MOVENODE(id, newParentId, index?)**: mueve un subárbol a otro padre. `index` fija la posición entre los hijos del nuevo padre.",
    },
    // mover id=4 (12) a ser hijo de la raíz id=1 en posición 1
    {
      id: "inputConsola",
      text: "arbolNario.moveNode(4, 1, 1);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description:
        "📦 Movemos el nodo **id=4** (12) a **padre id=1**, en **posición 1**.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Observa que **12(id=4)** ahora cuelga de la raíz, colocado entre sus hijos según `index`.",
    },

    // ================= GET TRAVERSALS =================
    {
      type: "info",
      description:
        "🧭 **GETPREORDER / GETPOSTORDER / GETLEVELORDER**: obtén recorridos clásicos del árbol.",
    },
    { id: "inputConsola", text: "arbolNario.getPreOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧭 **Preorden**: nodo → hijos.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolNario.getPostOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔁 **Postorden**: hijos → nodo.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolNario.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "📶 **Por niveles (BFS)**.",
    },
    { id: "inputConsola", type: "enter" },

    // ================= DELETENODE =================
    {
      type: "info",
      description:
        "🗑️ **DELETENODE(id)**: elimina un nodo y todo su subárbol. Si eliminas la raíz, el árbol queda vacío.",
    },
    // elimina el 99 con su subárbol (si 12 aún estuviera debajo, también se iría)
    { id: "inputConsola", text: "arbolNario.deleteNode(3);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🗑️ Eliminamos el nodo **id=3** (y su subárbol si lo tuviera).",
    },
    { id: "inputConsola", type: "enter" },

    // ================= CLEAN → OBJETO DESAPARECE =================
    { id: "inputConsola", text: "arbolNario.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧽 **LIMPIEZA COMPLETA**: el árbol queda vacío y **se elimina el objeto arbolNario**.",
    },
    { id: "inputConsola", type: "enter" },

    // ================= REINICIO TRAS CLEAN (sin prefijo) =================
    {
      type: "info",
      description:
        "🔁 Tras `clean()`, para seguir debes **re-crear** el objeto con **createRoot(valor)** **SIN** prefijo.",
    },
    { id: "inputConsola", text: "createRoot(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🌱 Nueva raíz **50** creada. Se reinstanció **arbolNario** con **id=1** nuevamente (contador reiniciado en esta sesión vacía).",
    },
    { id: "inputConsola", type: "enter" },

    // ================= CIERRE =================
    {
      type: "info",
      description:
        "🎯 Resumen: crea con **createRoot** → opera con **arbolNario.*** usando **ids numéricos** consecutivos → `clean()` borra todo y el objeto → vuelve a empezar con `createRoot(valor)`.",
    },
  ];
}
