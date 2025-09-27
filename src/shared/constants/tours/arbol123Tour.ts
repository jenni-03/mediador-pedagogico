// constants/tours/arbol123Tour.ts
import { TourStep } from "../typesTour";

/**
 * Tour guiado para Árbol 1-2-3 (2-3 multikey).
 * Política exacta del código:
 *  - Split: [k0,k1,k2] → sube k1; L=[k0] (conserva id), R=[k2]; hijos: L=h0,h1; R=h2,h3.
 *  - Borrow: PRIORIDAD izquierda; si izq no puede (>1 llave requerido), intenta derecha.
 *  - Merge: si no hay borrow posible, PRIORIDAD fusionar con izquierda; si no existe, con derecha.
 *  - Delete interno: reemplaza por PREDECESOR (máximo del subárbol izquierdo).
 */
export function getArbol123Tour(): TourStep[] {
  const steps: TourStep[] = [
    // ───────────────────────── I0: Introducción ─────────────────────────
    {
      type: "info",
      description:
        "🌱 **Árbol 1-2-3 (2-3 multikey)**: nodos con 1 o 2 llaves; altura uniforme. " +
        "Los splits promueven la **mediana**; los borrados usan **borrow/merge**.",
    },

    // ───────────────────────── T1: Inserciones + split de raíz ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T1 – Split de raíz y split local**. El primer comando VA SIN prefijo; al ejecutarlo nace **arbol123**.",
    },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🌟 Se creó **arbol123**. A partir de ahora usa **arbol123.** en todos los comandos.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbol123.insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbol123.insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "⚡ Raíz [10,20,30] → **split**: sube **20**; hijos **[10]** y **[30]**.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbol123.insert(5);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbol123.insert(15);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🍰 Hoja izquierda [5,10,15] → **split local**: sube **10**. Raíz **[10,20]** con hijos **[5]**, **[15]**, **[30]**.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbol123.getInOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🔄 Inorden (ordenado): `5, 10, 15, 20, 30`.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T2: Splits en cascada ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T2 – Splits en cascada**. Limpiamos y RECREAMOS el objeto empezando con `insert(...)` sin prefijo.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // recreación después de clean
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "✅ **arbol123** recreado.",
    },
    { id: "inputConsola", type: "enter" },

    ...[20, 30, 40, 50, 60, 70, 80].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "📶 **BFS**: observa cómo la altura crece sólo cuando es necesario; hojas a igual profundidad.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T3: Delete hoja (sin underflow) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T3 – Borrado simple** en hoja que no provoca underflow.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // recreación
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 30, 5, 15].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(15);", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🗑️ Se borra **15** sin necesidad de borrow/merge.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T4: Borrow desde IZQUIERDA (preferencia del código) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T4 – Borrow desde la izquierda**. El algoritmo INTENTA primero el hermano izquierdo.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // estructura determinística: root [20] con hijos [5,10] y [30]; borrar 30 → underflow derecha → toma de IZQ
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 30, 5].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "↔️ **Borrow izq→der**: el padre baja su separadora; el hermano **izquierdo** sube su **última** llave al padre.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T5: Borrow desde DERECHA (cuando izq no puede) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T5 – Borrow desde la derecha**. Ocurre cuando el izquierdo no tiene 2 llaves.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // estructura: root [20] con hijos [10] y [25,30]; borrar 10 → underflow izquierda → toma de DERECHA
    { id: "inputConsola", text: "insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[10, 30, 25].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "↔️ **Borrow der→izq**: el padre baja al hijo; el hermano **derecho** sube su **primera** llave.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T6: Merge + contracción de raíz ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T6 – Merge y contracción**: sin préstamo disponible, se fusiona y la raíz puede colapsar.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // root [20] con hijos [10] y [30]; borrar 10 → no hay borrow → merge con DERECHA (porque es el hijo más izquierdo)
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 30].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧩 **Merge** (hijo izq + separadora + der) → la **raíz** se queda sin llaves y se **contrae** al hijo fusionado.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T7: Merge con IZQUIERDA (preferencia de merge) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T7 – Merge con izquierda**: cuando el hijo del medio queda vacío y ambos hermanos tienen 1 llave.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // construir root [20,40] con hijos [10], [30], [50]; borrar 30 → merge con IZQUIERDA (preferencia)
    { id: "inputConsola", text: "insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[10, 30, 40, 50].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧩 El hijo **centro** queda vacío y no hay préstamos → **merge con la izquierda** (preferencia del algoritmo).",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T8: Borrado de clave interna (predecesor) ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T8 – Borrado interno**: se reemplaza por el **predecesor** del subárbol izquierdo y se repara.",
    },
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // configuración que hace a 40 clave interna (en la raíz) y su predecesor sea 35
    { id: "inputConsola", text: "insert(40);", type: "write" },
    { id: "inputConsola", type: "enter" },
    ...[20, 60, 10, 30, 50, 70, 25, 35].flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `arbol123.insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    { id: "inputConsola", text: "arbol123.delete(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔁 **40** se sustituye por su **predecesor (35)**; luego se borra 35 en la hoja y se aplica borrow/merge si hace falta.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T9: Búsqueda y recorridos ─────────────────────────
    {
      type: "info",
      description: "🔍 **Search + recorridos**. InOrder siempre ordena.",
    },
    { id: "inputConsola", text: "arbol123.search(25);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbol123.getPreOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbol123.getInOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbol123.getPostOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbol123.getLevelOrder();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧭 **Pre**: nodo→hijos. **In**: ordenado. **Post**: hijos→nodo. **Level**: de arriba hacia abajo.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── FIN ─────────────────────────
    { id: "inputConsola", text: "arbol123.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Árbol limpio. Para volver a empezar: **insert(x);** (sin prefijo) → se recrea **arbol123**.",
    },
    { id: "inputConsola", type: "enter" },
  ];

  return steps;
}
