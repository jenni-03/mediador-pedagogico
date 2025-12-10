import { TourStep } from "../typesTour";

export function getArbolAVLTour(): TourStep[] {
  return [
    // Introducción + flujo correcto
    {
      type: "info",
      description:
        "🌲 Un **Árbol AVL** es un ABB **auto-balanceado**: tras cada operación mantiene el **factor de balance (bf)** en {−1, 0, 1}. Si se desbalancea, aplica rotaciones **LL**, **RR**, **LR** o **RL** automáticamente.",
    },
    {
      type: "info",
      description:
        "🧭 Flujo de uso: el **primer** `insert(valor)` **crea el objeto `arbolA`**. Desde entonces **todo** debe ir con el prefijo **`arbolA.`**. Tras `arbolA.clean()`, vuelve a ejecutar `insert(...)` (sin prefijo) para **recrear `arbolA`** y continúa con `arbolA.`",
    },
    {
      type: "info",
      description:
        "🧠 En el canvas verás **bf** (balance factor) y **h** (altura). Cuando bf sale del rango, el AVL se reequilibra con la rotación correspondiente.",
    },

    // =============== DEMO ROTACIONES ===============

    // --- LL (rotación simple a la derecha) ---
    {
      type: "info",
      description:
        "🧪 **Caso LL** (subárbol izquierdo pesado) → rotación **a la derecha**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Este primer `insert(30)` **crea** el AVL y su referencia queda en **`arbolA`**.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** (izquierda de 30).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **10** (izquierda de 20). **30** queda desbalanceado (LL).",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación **a la derecha** sobre 30. Nueva raíz **20** (10 como izq., 30 como der.).",
    },

    // Limpieza
    { id: "inputConsola", text: "arbolA.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 AVL limpio. Para continuar, **recrea `arbolA`** con un nuevo `insert(...)` sin prefijo.",
    },
    { id: "inputConsola", type: "enter" },

    // --- RR (rotación simple a la izquierda) ---
    {
      type: "info",
      description:
        "🧪 **Caso RR** (subárbol derecho pesado) → rotación **a la izquierda**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ `insert(30)` **recrea `arbolA`** con 30 como raíz.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **40** (derecha de 30).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **50** (derecha de 40). **30** se desbalancea (RR).",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación **a la izquierda** sobre 30. Nueva raíz **40** (30 a la izq., 50 a la der.).",
    },

    // Limpieza
    { id: "inputConsola", text: "arbolA.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Limpiamos para el siguiente caso. Recuerda recrear con `insert(...)` sin prefijo.",
    },
    { id: "inputConsola", type: "enter" },

    // --- LR (rotación doble izquierda-derecha) ---
    {
      type: "info",
      description:
        "🧪 **Caso LR** (hijo izquierdo derecho-pesado) → rotación **izquierda en el hijo** y luego **derecha en el padre**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "console", type: "element", description: "➕ Raíz **30**." },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **10** (izquierda de 30).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **20** (derecha de 10). Se produce **LR** en 30.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación doble **LR**: primero **izquierda en 10**, luego **derecha en 30**. Raíz final **20**.",
    },

    // Limpieza
    { id: "inputConsola", text: "arbolA.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Limpiamos para el último caso. Recrea con `insert(...)` sin prefijo.",
    },
    { id: "inputConsola", type: "enter" },

    // --- RL (rotación doble derecha-izquierda) ---
    {
      type: "info",
      description:
        "🧪 **Caso RL** (hijo derecho izquierdo-pesado) → rotación **derecha en el hijo** y luego **izquierda en el padre**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "console", type: "element", description: "➕ Raíz **30**." },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **50** (derecha de 30).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **40** (izquierda de 50). Se produce **RL** en 30.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación doble **RL**: primero **derecha en 50**, luego **izquierda en 30**. Raíz final **40**.",
    },

    // Limpieza para construir árbol final
    { id: "inputConsola", text: "arbolA.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Limpiamos para construir un AVL más completo. Recrea con `insert(...)` sin prefijo.",
    },
    { id: "inputConsola", type: "enter" },

    // =============== CONSTRUIR AVL COMPLETO ===============
    {
      type: "info",
      description:
        "🏗️ Construyamos un AVL equilibrado con varias inserciones (el AVL se reequilibra automáticamente cuando haga falta).",
    },
    { id: "inputConsola", text: "insert(31);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ `insert(31)` **recrea `arbolA`** (raíz).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** (subárbol izquierdo).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **40** (subárbol derecho).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **10** (subárbol de 20).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **30** (subárbol de 20). Si se desbalancea, el AVL lo corrige.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.insert(41);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **41** (derecha de 40). Árbol equilibrado.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🌳 Deberías ver un AVL balanceado (altura mínima posible). Revisa **bf** y **h** en los nodos.",
    },

    // =============== SEARCH + DELETE (con rebalanceo) ===============
    { id: "inputConsola", text: "arbolA.search(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔎 Buscamos el valor **30** en el árbol.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "✅ El nodo **30** se resalta si existe.",
    },

    { id: "inputConsola", text: "arbolA.delete(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🗑️ Eliminamos **20**. El AVL reorganiza enlaces y **rebalancea** si es necesario.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Tras la eliminación, observa cómo **bf** vuelve al rango {−1, 0, 1}.",
    },

    // =============== RECORRIDOS ===============
    { id: "inputConsola", text: "arbolA.getPreOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧭 **Preorden**: nodo → izquierda → derecha.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.getInOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔄 **Inorden**: izquierda → nodo → derecha (devuelve los valores **ordenados**).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.getPostOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔁 **Postorden**: izquierda → derecha → nodo.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolA.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "📶 **Por niveles (BFS)**: de arriba hacia abajo, izquierda a derecha.",
    },
    { id: "inputConsola", type: "enter" },

    // =============== CLEAN ===============
    { id: "inputConsola", text: "arbolA.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧽 Limpiamos el árbol AVL por completo. Para recrearlo, ejecuta **`insert(valor)`** (sin prefijo) y continúa con **`arbolA.`**",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "🫙 El árbol quedó vacío. ¡Listo para nuevos experimentos!",
    },
  ];
}
