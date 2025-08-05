// constants/tours/estructuras/secuenciaTour.ts
import { TourStep } from "../typesTour";

export const getSecuenciaTourSteps = (): TourStep[] => [
  {
    type: "info",
    description: `📦 Una **Secuencia** es como una fila ordenada de cajas, donde cada caja tiene una posición específica. Puedes colocar, modificar, buscar o eliminar elementos fácilmente.`,
  },
  {
    type: "info",
    description: `📌 En el simulador, una secuencia inicia vacía y puede almacenar una cantidad limitada de elementos, definida por su **capacidad**.`,
  },

  // Crear la secuencia
  {
    id: "console",
    type: "action",
  },
  {
    id: "inputConsola",
    text: "create(7);",
    type: "write",
  },
  {
    id: "console",
    description: `🛠️ Este comando crea una secuencia con capacidad para 7 elementos.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    type: "element",
    description: `✅ Aquí aparece la estructura de secuencia ya creada, con espacio reservado para 7 posiciones.`,
  },
  {
    id: "info-cards",
    type: "element",
    description: `📏 Observa que el **tamaño** inicial es 0, pero la **capacidad** es 7. Puedes insertar elementos hasta llenar ese límite.`,
  },
  {
    id: "memory-visualization",
    type: "element",
    description: `💡 Aquí se visualiza cómo la memoria es reservada para los 7 espacios de la secuencia. Aunque aún no hay valores, la estructura está lista para usarse.`,
  },

  // Insertar un valor
  {
    id: "inputConsola",
    text: "insertLast(20);",
    type: "write",
  },
  {
    id: "console",
    description: `🧩 Este comando inserta el valor **20** al final de la secuencia.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },
  {
    id: "main-canvas",
    type: "element",
    description: `📦 El valor **20** se colocó en la posición 0. Así se construye la secuencia desde el inicio.`,
  },
  {
    id: "info-cards",
    type: "element",
    description: `🔢 El tamaño ahora es **1**, porque agregaste un elemento. La capacidad sigue en 7.`,
  },

  // Consultar posición
  {
    id: "inputConsola",
    text: "get(0);",
    type: "write",
  },
  {
    id: "console",
    description: `🔍 Este comando obtiene el valor en la posición 0 de la secuencia.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },

  // Modificar valor
  {
    id: "inputConsola",
    text: "set(0, 10);",
    type: "write",
  },
  {
    id: "console",
    description: `✏️ Este comando reemplaza el valor de la posición 0 por **10**.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },

  // Buscar valor
  {
    id: "inputConsola",
    text: "search(10);",
    type: "write",
  },
  {
    id: "console",
    description: `🔎 Busca si el número **10** existe en la secuencia y devuelve su posición si lo encuentra.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },

  // Eliminar posición
  {
    id: "inputConsola",
    text: "delete(0);",
    type: "write",
  },
  {
    id: "console",
    description: `🗑️ Elimina el elemento en la posición 0 y reorganiza la secuencia si es necesario.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },

  // Limpiar secuencia
  {
    id: "inputConsola",
    text: "clean();",
    type: "write",
  },
  {
    id: "console",
    description: `🚫 Este comando borra todos los elementos de la secuencia, dejándola vacía.`,
    type: "element",
  },
  {
    id: "inputConsola",
    type: "enter",
  },

  // Cierre
  {
    type: "info",
    description: `🎯 ¡Perfecto! Ahora dominas los comandos más importantes de una secuencia. Experimenta libremente creando secuencias, editándolas y observando cómo se comportan en memoria.`,
  },
];
