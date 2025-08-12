import { TourStep } from "../typesTour";

export function getTablaHashTour(): TourStep[] {
  return [
    // Introducción
    {
      type: "info",
      description: `🔐 Una **tabla hash** permite almacenar pares clave → valor y acceder a ellos rápidamente usando una función hash.`,
    },
    {
      type: "info",
      description: `🧠 Para decidir dónde almacenar cada par, usamos la fórmula: \`hash = key % tamaño\`. Es decir, la **clave se divide entre el número de slots** y se toma el residuo como índice.`,
    },
    {
      type: "info",
      description: `📦 Por ejemplo, si la clave es **12** y la tabla tiene **10 slots**, entonces: \`12 % 10 = 2\`, por lo tanto, ese par irá al **slot 2**.`,
    },

    // CREATE
    {
      id: "inputConsola",
      text: "create(10);",
      type: "write",
    },
    {
      id: "console",
      description: `🛠️ Este comando crea una tabla hash con **10 slots** disponibles.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔢 Se muestran 10 buckets numerados del **0 al 9**, cada uno con su dirección simulada de memoria.`,
      type: "element",
    },
    {
      id: "info-cards",
      description: `📊 La tarjeta superior muestra cuántos elementos hay actualmente. La inferior muestra la capacidad total (slots).`,
      type: "element",
    },

    // SET 12 → 100
    {
      id: "inputConsola",
      text: "set(12, 100);",
      type: "write",
    },
    {
      id: "console",
      description: `📥 Insertamos el par **12 → 100**. El índice se calcula con: \`12 % 10 = 2\`. Se usará el slot **2**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `📌 El par fue almacenado en el bucket **B2**. Puedes visualizarlo encajado en su posición.`,
      type: "element",
    },

    // SET 22 → 200 (colisión)
    {
      id: "inputConsola",
      text: "set(22, 200);",
      type: "write",
    },
    {
      id: "console",
      description: `⚠️ Insertamos **22 → 200**. La función hash es: \`22 % 10 = 2\`. Se produce una **colisión** con el slot **2**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔗 Ambos pares (**12 → 100** y **22 → 200**) se agrupan en el mismo bucket **B2**, usando listas encadenadas.`,
      type: "element",
    },

    // SET 12 → 300 (actualización)
    {
      id: "inputConsola",
      text: "set(12, 300);",
      type: "write",
    },
    {
      id: "console",
      description: `✏️ Ya existe la clave **12**, así que su valor será actualizado a **300**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `♻️ El bucket **B2** ahora contiene: **12 → 300** y **22 → 200**.`,
      type: "element",
    },

    // GET 12
    {
      id: "inputConsola",
      text: "get(12);",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 Este comando busca el valor asociado a la clave **12**, empezando en el slot \`12 % 10 = 2\`.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `✅ Se encontró el par **12 → 300** en el bucket **B2**.`,
      type: "element",
    },

    // DELETE 22
    {
      id: "inputConsola",
      text: "delete(22);",
      type: "write",
    },
    {
      id: "console",
      description: `🗑️ Este comando elimina el par con clave **22**. Se busca en el bucket \`22 % 10 = 2\`.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `💥 El valor **22 → 200** fue eliminado del slot **2**. Solo queda **12 → 300**.`,
      type: "element",
    },

    // CLEAN
    {
      id: "inputConsola",
      text: "clean();",
      type: "write",
    },
    {
      id: "console",
      description: `🧼 Este comando vacía la tabla. Todos los buckets se limpian, pero la estructura permanece.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🌫️ Todos los buckets quedaron vacíos. Puedes insertar nuevos pares desde cero.`,
      type: "element",
    },
  ];
}
