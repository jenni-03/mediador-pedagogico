import { TourStep } from "../typesTour";

export function getTablaHashTour(): TourStep[] {
  return [
    // Introducción + flujo correcto
    {
      type: "info",
      description:
        "🔐 Una **tabla hash** almacena pares **clave → valor** y accede a ellos rápidamente mediante una función hash.",
    },
    {
      type: "info",
      description:
        "🧠 Para ubicar un par usamos `hash = key % tamaño`. Si la clave es **12** y hay **10 slots**, `12 % 10 = 2` ⇒ va al **slot 2**.",
    },
    {
      type: "info",
      description:
        "⚠️ Flujo de uso: el **primer** `create(tamaño)` **crea el objeto `th`**. Desde ese punto **todas** las operaciones deben ir con el prefijo **`th.`**. Tras `th.clean()`, vuelve a ejecutar **`create(...)`** (sin prefijo) para **recrear `th`** y continúa usando **`th.`**",
    },

    /* ─────────── Creación del objeto (primer create SIN prefijo) ─────────── */
    {
      id: "inputConsola",
      text: "create(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🛠️ Este primer `create(10)` **crea la tabla hash** con **10 slots** y su referencia queda en **`th`**. A partir de aquí usa **`th.`** en cada comando.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔢 Se muestran 10 buckets del **0 al 9**, cada uno con su dirección de memoria simulada.",
      type: "element",
    },
    {
      id: "info-cards",
      description:
        "📊 La tarjeta superior muestra cuántos elementos hay. La inferior muestra la capacidad total (slots).",
      type: "element",
    },

    /* ─────────── Operaciones usando el prefijo `th.` ─────────── */
    // SET 12 → 100
    {
      id: "inputConsola",
      text: "th.set(12, 100);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📥 Insertamos **12 → 100**. Índice: `12 % 10 = 2` ⇒ slot **2**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "📌 El par quedó almacenado en el bucket **B2** (slot 2).",
      type: "element",
    },

    // SET 22 → 200 (colisión)
    {
      id: "inputConsola",
      text: "th.set(22, 200);",
      type: "write",
    },
    {
      id: "console",
      description:
        "⚠️ Insertamos **22 → 200**. `22 % 10 = 2` ⇒ **colisión** en el slot **2**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🔗 Ambos pares (**12 → 100** y **22 → 200**) conviven en **B2** usando **encadenamiento**.",
      type: "element",
    },

    // SET 12 → 300 (actualización)
    {
      id: "inputConsola",
      text: "th.set(12, 300);",
      type: "write",
    },
    {
      id: "console",
      description:
        "✏️ La clave **12** ya existe, se **actualiza** su valor a **300**.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "♻️ El bucket **B2** ahora contiene: **12 → 300** y **22 → 200**.",
      type: "element",
    },

    // GET 12
    {
      id: "inputConsola",
      text: "th.get(12);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 Busca el valor asociado a **12**, comenzando en `12 % 10 = 2` y recorriendo la cadena si es necesario.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description: "✅ Encontrado: **12 → 300** en **B2**.",
      type: "element",
    },

    // DELETE 22
    {
      id: "inputConsola",
      text: "th.delete(22);",
      type: "write",
    },
    {
      id: "console",
      description:
        "🗑️ Elimina el par con clave **22** buscando en `22 % 10 = 2`.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "💥 Se removió **22 → 200** del slot **2**. Permanece **12 → 300**.",
      type: "element",
    },

    /* ─────────── Limpieza y recordatorio de recreación ─────────── */
    // CLEAN
    {
      id: "inputConsola",
      text: "th.clean();",
      type: "write",
    },
    {
      id: "console",
      description: "🧼 Vacía **todos** los buckets; `th` queda sin elementos.",
      type: "element",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      description:
        "🌫️ Todos los buckets han quedado vacíos. Para **volver a usar** la tabla desde cero, ejecuta nuevamente **`create(tamaño)`** (sin prefijo) para **recrear `th`** y luego continúa con **`th.`** en cada comando.",
      type: "element",
    },
  ];
}
