import { TourStep } from "../typesTour";

export const getSecuenciaTourSteps = (): TourStep[] => [
  /* ───────── Intro ───────── */
  {
    type: "info",
    description:
      "📦 Una **Secuencia** es como una fila ordenada de cajas, donde cada caja tiene una posición específica. Puedes colocar, modificar, buscar o eliminar elementos fácilmente.",
  },
  {
    type: "info",
    description:
      "📌 En el simulador, una secuencia inicia vacía y puede almacenar una cantidad limitada de elementos, definida por su **capacidad**. Los **índices** empiezan en 0.",
  },

  /* ───────── Crear la secuencia (crea el objeto `se`) ───────── */
  { id: "console", type: "action" },
  {
    id: "inputConsola",
    text: "create(7);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description:
      "🛠️ Este comando crea una secuencia con capacidad para **7** elementos y la asigna al objeto **`se`**. A partir de ahora, usa **`se.`** al inicio de cada comando (por ejemplo, `se.insertLast(20);`).",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    type: "element",
    description:
      "✅ Aquí aparece la estructura de secuencia ya creada, con espacio reservado para 7 posiciones.",
  },
  {
    id: "info-cards",
    type: "element",
    description:
      "📏 Observa que el **tamaño** inicial es **0**, pero la **capacidad** es **7**. Puedes insertar elementos hasta llenar ese límite.",
  },
  {
    id: "memory-visualization",
    type: "element",
    description:
      "💡 La memoria queda reservada para los 7 espacios de la secuencia. Aunque aún no hay valores, la estructura está lista para usarse.",
  },

  /* ───────── Insertar un valor ───────── */
  {
    id: "inputConsola",
    text: "se.insertLast(20);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description: "🧩 Inserta el valor **20** al final de la secuencia.",
  },
  { id: "inputConsola", type: "enter" },
  {
    id: "main-canvas",
    type: "element",
    description:
      "📦 El valor **20** se colocó en la posición **0**. La secuencia se construye desde el inicio.",
  },
  {
    id: "info-cards",
    type: "element",
    description: "🔢 El tamaño ahora es **1**. La capacidad sigue en **7**.",
  },

  /* ───────── Consultar posición ───────── */
  {
    id: "inputConsola",
    text: "se.get(0);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description: "🔍 Obtiene el valor en la posición **0** de la secuencia.",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Modificar valor ───────── */
  {
    id: "inputConsola",
    text: "se.set(0, 10);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description: "✏️ Reemplaza el valor de la posición **0** por **10**.",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Buscar valor ───────── */
  {
    id: "inputConsola",
    text: "se.search(10);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description:
      "🔎 Busca si el número **10** existe en la secuencia y devuelve su posición si lo encuentra (o un indicador de no encontrado).",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Eliminar posición ───────── */
  {
    id: "inputConsola",
    text: "se.delete(0);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description:
      "🗑️ Elimina el elemento en la posición **0** y reorganiza la secuencia si es necesario.",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Limpiar secuencia ───────── */
  {
    id: "inputConsola",
    text: "se.clean();",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description:
      "🚫 Este comando borra todos los elementos de la secuencia. **Nota:** tras `se.clean();`, debes **crear nuevamente** la secuencia con `create(capacidad);` para volver a obtener el objeto **`se`** y seguir usando `se.*`.",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Re-crear después de clean (recordatorio práctico) ───────── */
  {
    id: "inputConsola",
    text: "create(5);",
    type: "write",
  },
  {
    id: "console",
    type: "element",
    description:
      "🆕 Se re-crea la secuencia ahora con capacidad **5** y se vuelve a asignar al objeto **`se`**. Continúa con `se.insertLast(...)`, `se.get(...)`, etc.",
  },
  { id: "inputConsola", type: "enter" },

  /* ───────── Cierre ───────── */
  {
    type: "info",
    description:
      "🎯 ¡Perfecto! Dominas los comandos esenciales. Recuerda: primero `create(capacidad);` (crea **`se`**), luego usa **`se.*`**; si limpias (`se.clean();`), re-crea con `create(...)` y continúa.",
  },
];
