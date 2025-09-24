import { TourStep } from "../typesTour";

/**
 * Tour guiado para Árbol B (t = 2 por defecto).
 * Propiedades clave:
 *  - Cada nodo guarda 1..3 llaves (equivalente a 2-3-4 con t=2).
 *  - Insert: si un nodo se llena, se hace split y se PROMUEVE la mediana.
 *  - Delete: si un hijo queda con pocas llaves, se intenta PRÉSTAMO (borrow) y,
 *    si no es posible, se FUSIONA (merge). La raíz puede contraerse.
 */
export function getArbolBTour(): TourStep[] {
  const steps: TourStep[] = [
    // ───────────────────────── I0: Introducción ─────────────────────────
    {
      type: "info",
      description:
        "🌳 **Árbol B (t=2)**: nodos con 1..3 llaves; altura uniforme; inserciones/borrados balanceados. " +
        "Al insertar, los nodos llenos se **dividen** y asciende la **mediana**; al borrar, se usa **borrow/merge**.",
    },

    // ───────────────────────── T1: Creación implícita + primer split ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T1 – Creación y split de raíz.** El primer comando VA **SIN** prefijo; al ejecutarlo nace **arbolB**.",
    },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🌟 Se creó **arbolB**. A partir de ahora usa **arbolB.** en todos los comandos.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolB.insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolB.insert(30);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolB.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "⚡ La raíz se llena → **split** y se **promueve la mediana**. Queda raíz con una llave y dos hijos balanceados.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolB.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "📶 **BFS**: primero la raíz, luego los hijos. Observa cómo se mantiene la altura mínima necesaria.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T2: Búsqueda (camino guiado) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T2 – Búsqueda**. La animación resalta el camino raíz→nodo objetivo.",
    },
    { id: "inputConsola", text: "arbolB.search(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔍 Se compara en la raíz y se **desciende por el intervalo** correcto hasta encontrar la clave.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T3: Recorridos ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T3 – Recorridos**. InOrder en Árbol B siempre entrega valores ordenados.",
    },
    { id: "inputConsola", text: "arbolB.getPreOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolB.getInOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧭 **Pre**: claves del nodo → hijos. **In**: ordenado (child[0], k0, child[1], …).",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolB.getPostOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T4: Borrow (préstamo) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T4 – Borrow**. Si un hijo queda con pocas llaves, se intenta tomar de un **hermano con ≥ t** llaves.",
    },
    { id: "inputConsola", text: "arbolB.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // Construye raíz estable y provoca underflow para activar borrow
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 30, 40, 50].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbolB.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbolB.delete(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolB.delete(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "↔️ El hijo izquierdo quedó con **déficit** → **borrow** desde el hermano disponible: " +
        "el padre baja una separadora y el hermano **cede** una de sus llaves.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T5: Merge + contracción de raíz ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T5 – Merge**. Si no hay préstamo posible, se **fusionan** hermanos con la separadora del padre. La raíz puede **colapsar**.",
    },
    { id: "inputConsola", text: "arbolB.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 30].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbolB.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbolB.delete(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧩 No hay hermano con llaves suficientes → **merge** (izq + separadora + der). " +
        "La **raíz** puede quedarse sin llaves y **contraerse** al hijo fusionado.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── FIN ─────────────────────────
    { id: "inputConsola", text: "arbolB.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Árbol limpio. Para empezar de nuevo: **insert(x);** (sin prefijo) → se recrea **arbolB**.",
    },
    { id: "inputConsola", type: "enter" },
  ];

  return steps;
}
