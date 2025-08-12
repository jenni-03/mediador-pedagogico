import { TourStep } from "../typesTour";

export function getColaPrioridadTour(): TourStep[] {
  return [
    // INTRODUCCIÓN
    {
      type: "info",
      description: `🎯 Una **cola de prioridad** es una estructura especial donde cada elemento tiene una prioridad asociada.\n\n🧠 A diferencia de una cola normal, los elementos **no se atienden por orden de llegada**, sino por **su prioridad**: los de mayor prioridad se procesan primero.`,
    },
    {
      type: "info",
      description: `📌 Por ejemplo, si insertas los valores: \`(1, prioridad 1)\`, \`(5, prioridad 3)\`, y \`(2, prioridad 2)\`, el orden de salida será: \`5 → 2 → 1\`, ya que se atienden de mayor a menor prioridad.`,
    },

    // ENQUEUE
    {
      id: "inputConsola",
      text: "enqueue(10, 3);",
      type: "write",
    },
    {
      id: "console",
      description: `📥 El comando \`enqueue(10, 3)\` inserta el número **10** con **prioridad 3**.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `📦 El elemento fue insertado y **ordenado automáticamente** en función de su prioridad.`,
      type: "element",
    },

    // ENQUEUE extra
    {
      id: "inputConsola",
      text: "enqueue(7, 5);",
      type: "write",
    },
    {
      id: "console",
      description: `🚀 Insertamos otro elemento con mayor prioridad: \`enqueue(7, 5)\`.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🔝 El número **7** fue ubicado al frente de la cola por tener prioridad **más alta**.`,
      type: "element",
    },

    // GETFRONT
    {
      id: "inputConsola",
      text: "getFront();",
      type: "write",
    },
    {
      id: "console",
      description: `🔍 \`getFront()\` muestra el elemento con **mayor prioridad**, sin eliminarlo.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `📊 Se muestra que el elemento con mayor prioridad en el frente es: **7**.`,
      type: "element",
    },

    // DEQUEUE
    {
      id: "inputConsola",
      text: "dequeue();",
      type: "write",
    },
    {
      id: "console",
      description: `📤 Con \`dequeue()\`, se elimina el elemento de **mayor prioridad** (el primero en la cola).`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `❌ El número **7** fue removido de la estructura. El siguiente con mayor prioridad será ahora el nuevo frente.`,
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
      description: `🧼 \`clean()\` elimina todos los elementos de la cola de prioridad, dejándola vacía.`,
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description: `🫙 La cola quedó vacía. Puedes volver a insertar nuevos elementos cuando desees.`,
      type: "element",
    },
  ];
}
