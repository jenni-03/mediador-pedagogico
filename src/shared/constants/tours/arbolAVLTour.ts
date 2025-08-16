import { TourStep } from "../typesTour";

export function getArbolAVLTour(): TourStep[] {
  return [
    // Introducción
    {
      type: "info",
      description:
        "🌲 Un **Árbol AVL** es un árbol binario de búsqueda **auto-balanceado**. Tras cada inserción/eliminación mantiene el **factor de balance (bf)** de cada nodo en {−1, 0, 1}. Si se desbalancea, aplica **rotaciones** automáticamente.",
    },
    {
      type: "info",
      description:
        "🧠 En el canvas verás etiquetas como **bf** (balance factor) y **h** (altura). Cuando bf sale del rango, el AVL se reequilibra con rotaciones **LL**, **RR**, **LR** o **RL**.",
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
      description: "➕ Insertamos **30** como raíz.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** a la izquierda de 30.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **10** a la izquierda de 20. El nodo 30 queda desbalanceado (LL).",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Se aplica **rotación a la derecha** sobre 30. La nueva raíz pasa a ser **20** (con 10 como izq. y 30 como der.).",
    },

    // Limpieza
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧼 Limpiamos para el siguiente caso.",
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
      description: "➕ Insertamos **30** como raíz.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **40** a la derecha de 30.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **50** a la derecha de 40. 30 se desbalancea (RR).",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Se aplica **rotación a la izquierda** sobre 30. La nueva raíz pasa a ser **40** (30 a la izq., 50 a la der.).",
    },

    // Limpieza
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧼 Limpiamos para el siguiente caso.",
    },
    { id: "inputConsola", type: "enter" },

    // --- LR (rotación doble izquierda-derecha) ---
    {
      type: "info",
      description:
        "🧪 **Caso LR** (hijo izquierdo derecho-pesado) → rotación doble: **izquierda en el hijo**, luego **derecha en el padre**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "console", type: "element", description: "➕ Raíz **30**." },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **10** (izq. de 30).",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **20** (der. de 10). Se produce un **LR** en 30.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación doble **LR**: primero **izquierda en 10**, luego **derecha en 30**. La raíz queda en **20**.",
    },

    // Limpieza
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧼 Limpiamos para el siguiente caso.",
    },
    { id: "inputConsola", type: "enter" },

    // --- RL (rotación doble derecha-izquierda) ---
    {
      type: "info",
      description:
        "🧪 **Caso RL** (hijo derecho izquierdo-pesado) → rotación doble: **derecha en el hijo**, luego **izquierda en el padre**.",
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "console", type: "element", description: "➕ Raíz **30**." },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **50** (der. de 30).",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **40** (izq. de 50). Se produce un **RL** en 30.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Rotación doble **RL**: primero **derecha en 50**, luego **izquierda en 30**. La raíz queda en **40**.",
    },

    // Limpieza para construir árbol final
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧼 Limpiamos para construir un AVL más completo.",
    },
    { id: "inputConsola", type: "enter" },

    // =============== CONSTRUIR AVL COMPLETO ===============
    {
      type: "info",
      description:
        "🏗️ Ahora construiremos un AVL equilibrado con varias inserciones (rebalances automáticos si son necesarios).",
    },
    { id: "inputConsola", text: "insert(31);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **31** (raíz).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **20** (izq. de 31).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **40** (der. de 31).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **10** (subárbol de 20).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **30** (subárbol de 20). Si se desbalancea, el AVL lo corrige.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(41);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "➕ Insertamos **41** (der. de 40). Árbol equilibrado.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🌳 Deberías ver un AVL balanceado (altura mínima posible). Revisa **bf** y **h** en los nodos.",
    },

    // =============== SEARCH + DELETE (con rebalanceo) ===============
    { id: "inputConsola", text: "search(30);", type: "write" },
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

    { id: "inputConsola", text: "delete(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🗑️ Eliminamos **20**. El AVL reorganiza sus enlaces y **rebalancea** si fuera necesario.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔁 Tras la eliminación, observa cómo **bf** vuelve a estar en {−1, 0, 1}.",
    },

    // =============== RECORRIDOS ===============
    { id: "inputConsola", text: "getPreOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧭 **Preorden**: nodo → izquierda → derecha.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "getInOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔄 **Inorden**: izquierda → nodo → derecha (ordena los valores).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "getPostOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔁 **Postorden**: izquierda → derecha → nodo.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "📶 **Por niveles (BFS)**: de arriba hacia abajo, izquierda a derecha.",
    },
    { id: "inputConsola", type: "enter" },

    // =============== CLEAN ===============
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧽 Limpiamos el árbol AVL por completo.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "🫙 El árbol quedó vacío. ¡Listo para nuevos experimentos!",
    },
  ];
}
