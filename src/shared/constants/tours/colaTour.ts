import { TourStep } from "../typesTour";

export function getColaTourSteps(): TourStep[] {
  return [
    {
      id: "console",
      description:
        "🎮 En esta consola puedes escribir comandos para manipular la cola. Aquí es donde vas a encolar, desencolar y consultar el frente.",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "enqueue(10);",
      type: "write",
    },
    {
      id: "console",
      description:
        "📥 Este comando encola el número **10** al final de la cola.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🚚 ¡Genial! El valor 10 fue añadido a la estructura de cola. Recuerda: **primero en entrar, primero en salir** (FIFO).",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "enqueue(20);",
      type: "write",
    },
    {
      id: "console",
      description:
        "⏩ Encolamos ahora el número **20**. Se añadirá al final de la cola, detrás del 10.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "📦 La cola crece. Los elementos nuevos siempre van al **final**, manteniendo el orden de entrada.",
      type: "element",
    },
    {
      id: "memory-visualization",
      description:
        "🧠 Aquí puedes visualizar cómo se gestiona la memoria de la cola: cada nodo se enlaza de forma secuencial hasta vaciarse.",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "getFront();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🔍 Con este comando puedes **consultar el frente** de la cola, sin eliminarlo.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "📌 El valor que aparece al frente es el primero que fue encolado: **10**.",
      type: "element",
    },
    {
      id: "inputConsola",
      text: "dequeue();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🚪 Al ejecutar `dequeue()`, eliminamos el primer elemento de la cola (el que lleva más tiempo).",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🧹 Observa cómo **el nodo frontal desaparece**. El siguiente nodo toma su lugar como nuevo frente.",
      type: "element",
    },
    {
      id: "info-cards",
      description:
        "📊 El tamaño de la cola también cambia. Esta tarjeta te muestra cuántos elementos contiene actualmente.",
      type: "element",
    },

    {
      id: "inputConsola",
      text: "clean();",
      type: "write",
    },
    {
      id: "console",
      description:
        "🗑️ El comando `clean()` borra completamente todos los elementos de la cola.",
      type: "element",
    },
    {
      id: "inputConsola",
      type: "enter",
    },
    {
      id: "main-canvas",
      description:
        "🌌 ¡Todo limpio! Ahora puedes empezar una nueva simulación desde cero.",
      type: "element",
    },
  ];
}
