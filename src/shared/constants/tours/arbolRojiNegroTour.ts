// constants/tours/arbolRojiNegroTour.ts
import { TourStep } from "../typesTour";

/**
 * Tour guiado para Árbol Rojo-Negro (RB-Tree).
 * Incluye casos clásicos de recoloreo/rotaciones y ejemplos de búsqueda, recorridos y borrado.
 */
export function getArbolRojiNegroTour(): TourStep[] {
  const steps: TourStep[] = [
   
    // ───────────────────────── T1: Recoloreo simple ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T1 – Recoloreo simple**: inserciones que solo requieren **recolorear** (tío rojo), sin rotaciones.",
    },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🌱 Insertamos **10**. Si es el primer nodo, se convierte en **raíz negra** automáticamente.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description: "✔️ La **raíz** es **negra**.",
    },

    { id: "inputConsola", text: "insert(5);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **5** como hijo. Si el padre es **negro**, no hay fix-up.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(15);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **15**. Padre **negro** → seguimos sin ajustes.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(1);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **1**. Si se produce **padre rojo** con **tío rojo**, se hace **recoloreo** (padre/tío negros, abuelo rojo) y quizá propagación hacia arriba.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(7);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **7**. Caso típico donde el **recoloreo** basta para restaurar reglas.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T2: Rotación izquierda ───────────────────────
    {
      type: "info",
      description:
        "🧪 **T2 – Rotación izquierda (RR)**: tres insert ascendente fuerzan rotación **a la izquierda**.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Reiniciamos el árbol (alias: `clean();` si usas ese comando).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔁 **10–20–30** crea una cadena a derecha → **rotación izquierda** + posibles recoloreos.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T3: Rotación derecha ─────────────────────────
    {
      type: "info",
      description:
        "🧪 **T3 – Rotación derecha (LL)**: tres insert descendente fuerzan rotación **a la derecha**.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔁 **30–20–10** crea cadena a izquierda → **rotación derecha** + posibles recoloreos.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T4: Doble LR ─────────────────────────────────
    {
      type: "info",
      description:
        "🧪 **T4 – Doble rotación LR**: primero derecha en hijo, luego izquierda en abuelo.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔁 Configuración **30–10–20** → **LR**: (rotación derecha en 10) + (rotación izquierda en 30).",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T5: Doble RL ─────────────────────────────────
    {
      type: "info",
      description:
        "🧪 **T5 – Doble rotación RL**: primero izquierda en hijo, luego derecha en abuelo.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔁 Configuración **10–30–20** → **RL**: (rotación izquierda en 30) + (rotación derecha en 10).",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T6: Caso CLRS clásico ───────────────────────
    {
      type: "info",
      description:
        "🧪 **T6 – CLRS**: secuencia clásica del libro (Cormen). Mezcla de recoloreos y rotaciones.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(41);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(38);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(31);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(12);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(19);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(8);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔧 Observa **recoloreos** y **rotaciones** encadenadas para mantener black-height constante.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T7: Inserción ascendente larga ──────────────
    {
      type: "info",
      description:
        "🧪 **T7 – Ascendente**: inserciones 1..10. Verás cómo RB mantiene altura pequeña con re-balanceo automático.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // insert 1..10
    ...Array.from({ length: 10 }, (_, i) => i + 1).flatMap((v): TourStep[] => [
      { id: "inputConsola", text: `insert(${v});`, type: "write" },
      { id: "inputConsola", type: "enter" },
    ]),
    {
      id: "info-cards",
      type: "element",
      description:
        "📈 A pesar de 10 inserciones en orden, el **peso/altura** se mantiene controlado gracias al balance RB.",
    },

    // ───────────────────────── T8: Delete nodo rojo ────────────────────────
    {
      type: "info",
      description:
        "🧪 **T8 – Borrado de nodo rojo**: no requiere fix-up complejo.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(5);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(15);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "delete(5);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🗑️ Eliminar **rojo** suele ser directo: se desconecta el nodo sin afectar black-height.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T9: Delete negro con hijo rojo ──────────────
    {
      type: "info",
      description:
        "🧪 **T9 – Borrado de negro con hijo rojo**: el hijo se vuelve **negro** para compensar la negrura.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(10);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(5);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(15);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(12);", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "delete(15);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🩹 El hijo **rojo** absorbe la negrura → se pinta **negro** y listo. No hay cascada de fix-up.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────────── T10–12: Fix-up variados (CLRS style) ────────
    {
      type: "info",
      description:
        "🧪 **T10–12 – Fix-up variados**: mezcla de inserciones y eliminaciones que fuerzan diferentes caminos de reparación.",
    },
    { id: "inputConsola", text: "clean();", type: "write" },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "insert(11);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(2);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(14);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(1);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(7);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(15);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(5);", type: "write" },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(8);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧱 Con esta configuración hay varios **recolores/rotaciones** a lo largo del camino.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "delete(1);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "❌ Borrado que puede introducir **doble-negro** → se corrige con los casos de fix-up (hermano rojo/negro, sobrinos, etc.).",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "delete(2);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔧 Otro borrado encadena reparaciones: **recoloreos** y **rotaciones** según el caso.",
    },
    { id: "inputConsola", type: "enter" },

    // SEARCH + RECORRIDOS + CLEAN
    {
      id: "inputConsola",
      text: "search(8);",
      type: "write",
    },
    {
      id: "console",
      type: "element",
      description:
        "🔍 `search(8)` recorre como ABB: izquierda si menor, derecha si mayor. Se resalta si existe.",
    },
    { id: "inputConsola", type: "enter" },

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
        "🔄 **Inorden**: izquierda → nodo → derecha (devuelve ordenado).",
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
        "📶 **BFS**: de arriba hacia abajo, izquierda a derecha. Ideal para inspección general.",
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description: "🧼 Árbol limpio. ¡Listo para experimentar más!",
    },
    { id: "inputConsola", type: "enter" },
  ];

  return steps;
}
