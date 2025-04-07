// types
export type TourStep = {
  id?: string; // opcional porque solo lo necesitan los pasos tipo "element"
  description: string;
  type: "element" | "info";
};

//Categoría: MEMORIA
export const memoriaDescriptions: TourStep[] = [
  {
    type: "info",
    description:
      "¡Bienvenido al simulador de memoria! Acá puedes aprender cómo se almacenan y funcionan las variables, arrays y objetos en Java y la RAM.",
  },
  {
    id: "limpiar",
    description:
      "Usa este botón para limpiar completamente toda la memoria, incluyendo objetos, arrays, variables y sus registros.",
    type: "element",
  },
  {
    id: "buscador",
    description:
      "Puedes buscar una dirección de memoria específica y ver en qué segmento está y qué contiene.",
    type: "element",
  },
  {
    id: "casosPrueba",
    description:
      "Aquí puedes ejecutar casos de prueba predefinidos o añadir tus propios comandos para ejecutarlos en lote.",
    type: "element",
  },
  {
    type: "info",
    description:
      "Los casos de prueba son los mismos comandos que puedes escribir en la consola, pero listos para ejecutarse con un solo clic.",
  },
  {
    id: "segment-buttons",
    description:
      "Usa estos botones para visualizar cada segmento de memoria: primitivos, arrays y objetos. Así entenderás cómo se distribuye la RAM.",
    type: "element",
  },
  {
    id: "consola",
    description:
      "En la consola puedes insertar variables, cambiar tipos, actualizar valores, consultar tamaños, y mucho más usando comandos de texto.",
    type: "element",
  },
  {
    id: "comandos",
    description:
      "Haz clic aquí para ver la lista de comandos que puedes usar, con ejemplos y su sintaxis.",
    type: "element",
  },
  {
    type: "info",
    description:
      "Recuerda: puedes limpiar la memoria, modificar valores, insertar arrays u objetos, borrar variables o incluso convertir sus tipos si es válido.",
  },
  {
    type: "info",
    description:
      "¡Todo lo que haces se refleja en tiempo real! Aprovecha para entender cómo funciona la memoria de forma visual y práctica.",
  },
];

//Categoría: ESTRUCTURAS
export const estructurasDescriptions: TourStep[] = [
  {
    type: "info",
    description: "Aquí aprenderás cómo funciona una estructura de árbol.",
  },
  {
    id: "tree-visualizer",
    description: "Visualiza cómo se estructura el árbol.",
    type: "element",
  },
  {
    id: "insert-node",
    description: "Inserta un nuevo nodo en la estructura.",
    type: "element",
  },
  {
    id: "delete-node",
    description: "Elimina un nodo existente.",
    type: "element",
  },
  {
    type: "info",
    description: "¡Muy bien! Ya sabes lo básico para comenzar.",
  },
];

// Función para obtener por tipo
export const getTourDescriptions = (
  tipo: "memoria" | "estructuras"
): TourStep[] => {
  switch (tipo) {
    case "memoria":
      return memoriaDescriptions;
    case "estructuras":
      return estructurasDescriptions;
    default:
      return [];
  }
};
