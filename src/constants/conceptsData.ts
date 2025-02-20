export const conceptosData: Record<string, any> = {
  1: {
    definicion: {
      descripcion:
        "Un árbol es una estructura de datos jerárquica que se compone de nodos...",
      caracteristicas: [
        "Tiene un nodo raíz.",
        "Cada nodo puede tener múltiples hijos.",
        "Se usa en búsquedas eficientes.",
      ],
    },
    operaciones: {
      insertar: "Para insertar un nodo en un árbol binario de búsqueda...",
      editar:
        "Editar un nodo implica cambiar su valor sin alterar la estructura...",
      consultar: "Para buscar un nodo en el árbol, se usa un recorrido...",
      eliminar: "Eliminar un nodo puede requerir reorganizar sus hijos...",
    },
    complejidad: {
      analisis: "El análisis de complejidad del árbol depende de su balance...",
    },
    tipo: "Árboles Binarios",
    nombre: "arbol"
  },

  2: {
    definicion: {
      descripcion: "Una lista es una colección ordenada de elementos...",
      caracteristicas: [
        "Puede ser enlazada o arreglada.",
        "Admite acceso secuencial.",
        "Permite inserciones y eliminaciones dinámicas.",
      ],
    },
    operaciones: {
      insertar:
        "Insertar un elemento en una lista enlazada puede requerir modificar punteros...",
      editar:
        "Para editar un elemento, se accede a su posición y se modifica su valor...",
      consultar:
        "Consultar en una lista enlazada requiere recorrer los nodos...",
      eliminar:
        "Eliminar un nodo requiere modificar el puntero del nodo anterior...",
    },
    complejidad: {
      analisis:
        "El acceso en listas enlazadas es O(n), mientras que en arreglos es O(1)...",
    },
    tipo: "Estructura Lineal",
    nombre: "lista"
  },
};
