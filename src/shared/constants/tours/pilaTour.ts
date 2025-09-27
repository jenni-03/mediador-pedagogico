import { TourStep } from "../typesTour";

export const getPilaTourSteps = (): TourStep[] => [
  // Introducción
  {
    type: "info",
    description: `🍽️ Imagina una pila de platos en una cocina: solo puedes agregar o quitar el de arriba. Así funciona nuestra estructura **Pila**. Es un ejemplo clásico de la regla **LIFO**: Last In, First Out.`,
  },
  {
    type: "info",
    description: `📚 Formalmente, una pila permite almacenar elementos y operar con ellos a través de 3 comandos principales: **push**, **pop** y **getTop**. ¡Vamos a verlos en acción!`,
  },

  // Comando: push(4)
  {
    id: "inputConsola",
    text: "push(4);",
    type: "write",
  },
  {
    id: "console",
    description: `📥 Este comando inserta el número **4** al tope de la pila.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    description: `🧩 El número **4** aparece en la parte superior de la pila. La pila crece hacia arriba con cada nuevo elemento.`,
    type: "element",
  },
  {
    id: "info-cards",
    description: `📏 El tamaño de la pila ha aumentado a **1**.`,
    type: "element",
  },

  // Comando: push(7)
  {
    id: "inputConsola",
    text: "push(7);",
    type: "write",
  },
  {
    id: "console",
    description: `📥 Ahora agregamos el número **7**. Este quedará por encima del **4**.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    description: `📦 El valor **7** se apiló arriba de **4**. Ahora **7** es el tope.`,
    type: "element",
  },
  {
    id: "info-cards",
    description: `📏 El tamaño de la pila ahora es **2**.`,
    type: "element",
  },
  {
    id: "memory-visualization",
    type: "element",
    description: `🧠 Esta vista muestra cómo se asignan direcciones de memoria a los nodos apilados.`,
  },

  // Comando: getTop()
  {
    id: "inputConsola",
    text: "getTop();",
    type: "write",
  },
  {
    id: "console",
    description: `🔍 Este comando permite ver el elemento en la cima de la pila sin quitarlo.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    description: `👁️ El sistema resalta el nodo superior: **7**.`,
    type: "element",
  },

  // Comando: pop()
  {
    id: "inputConsola",
    text: "pop();",
    type: "write",
  },
  {
    id: "console",
    description: `🗑️ Este comando elimina el elemento en la cima de la pila (LIFO).`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    description: `💥 El nodo con valor **7** desapareció. **4** vuelve a ser el tope.`,
    type: "element",
  },
  {
    id: "info-cards",
    description: `📉 El tamaño de la pila se redujo a **1**.`,
    type: "element",
  },

  // Comando: clean()
  {
    id: "inputConsola",
    text: "clean();",
    type: "write",
  },
  {
    id: "console",
    description: `🧼 Este comando vacía por completo la pila, eliminando todos sus elementos.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    description: `🌪️ Todos los nodos fueron eliminados. La pila está vacía.`,
    type: "element",
  },
  {
    id: "info-cards",
    description: `📦 El tamaño vuelve a ser **0**. Puedes comenzar desde cero.`,
    type: "element",
  },

  // Extras visuales
  {
    id: "execution-code",
    type: "element",
    description: `🧾 Aquí puedes ver el pseudocódigo de cada operación. Esto te ayuda a entender cómo funcionaría en un lenguaje real como Java.`,
  },
];
