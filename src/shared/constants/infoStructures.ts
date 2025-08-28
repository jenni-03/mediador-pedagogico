export const infoStructures: Record<string, any> = {
  secuencia: {
    info: [
      {
        key: "Tamaño",
        description:
          "Cantidad actual de elementos almacenados en la secuencia.",
      },
      {
        key: "Capacidad",
        description:
          "Número máximo de elementos que puede contener la secuencia sin necesidad de redimensionar el arreglo.",
      },
    ],
  },
  pila: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la pila.",
      },
    ],
  },
  cola: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la cola.",
      },
    ],
  },
  "cola de prioridad": {
    info: [
      {
        key: "Tamaño",
        description:
          "Cantidad actual de elementos almacenados en la cola de prioridad.",
      },
    ],
  },
  lista_simplemente_enlazada: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la lista.",
      },
    ],
  },
  lista_doblemente_enlazada: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la lista.",
      },
    ],
  },
  lista_circular_simplemente_enlazada: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la lista.",
      },
    ],
  },
  lista_circular_doblemente_enlazada: {
    info: [
      {
        key: "Tamaño",
        description: "Cantidad actual de elementos almacenados en la lista.",
      },
    ],
  },
  tabla_hash: {
    info: [
      {
        key: "Número de elementos",
        description: "Cantidad de pares (clave-valor) almacenados en la tabla.",
      },
      {
        key: "Número de slots",
        description:
          "Total de posiciones internas donde se pueden colocar los elementos (capacidad de la tabla)",
      },
    ],
  },
  arbol_binario: {
    info: [
      {
        key: "Peso",
        description: "Número total de nodos en el árbol binario.",
      },
      {
        key: "Altura",
        description:
          "Camino o distancia desde la raíz hasta el nodo hoja más profundo del árbol binario.",
      },
      {
        key: "Hojas",
        description:
          "Nodo terminal en la estructura del árbol que no posee descendientes.",
      },
    ],
  },
  arbol_binario_busqueda: {
    info: [
      {
        key: "Peso",
        description: "Número total de nodos en el árbol binario.",
      },
      {
        key: "Altura",
        description:
          "Camino o distancia desde la raíz hasta el nodo hoja más profundo del árbol binario.",
      },
      {
        key: "Hojas",
        description:
          "Nodo terminal en la estructura del árbol que no posee descendientes.",
      },
    ],
  },

  arbol_avl: {
    info: [
      {
        key: "Peso",
        description: "Número total de nodos en el árbol.",
      },
      {
        key: "Altura",
        description:
          "Camino o distancia desde la raíz hasta el nodo hoja más profundo del árbol.",
      },
      {
        key: "Hojas",
        description:
          "Nodo terminal en la estructura del árbol que no posee descendientes.",
      },
    ],
  },

  arbol_rojinegro: {
    info: [
      {
        key: "Peso",
        description: "Número total de nodos en el árbol.",
      },
      {
        key: "Altura",
        description:
          "Camino o distancia desde la raíz hasta el nodo hoja más profundo del árbol.",
      },
      {
        key: "Hojas",
        description:
          "Nodo terminal en la estructura del árbol que no posee descendientes.",
      },
    ],
  },

  splay: {
    info: ["Peso", "Altura"],
  },

  heap: {
    info: ["Peso", "Altura"],
  },

  arbol_nario: {
    info: [
      {
        key: "Peso",
        description: "Número total de nodos en el árbol.",
      },
      {
        key: "Altura",
        description:
          "Camino o distancia desde la raíz hasta el nodo hoja más profundo del árbol.",
      },
      {
        key: "Hojas",
        description:
          "Nodo terminal en la estructura del árbol que no posee descendientes.",
      },
    ],
  },

  arbol_b: {
    info: ["Peso", "Altura", "Gordura"],
  },

  arbol_b_plus: {
    info: ["Peso", "Altura", "Gordura"],
  },
};
