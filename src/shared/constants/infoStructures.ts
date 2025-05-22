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
                description:
                    "Cantidad actual de elementos almacenados en la pila.",
            },
        ],
    },
    cola: {
        info: [
            {
                key: "Tamaño",
                description:
                    "Cantidad actual de elementos almacenados en la cola.",
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
    lista_simple: {
        info: [
            {
                key: "Tamaño",
                description:
                    "Cantidad actual de elementos almacenados en la lista simple.",
            },
        ],
    },
    lista_doble: {
        info: [
            {
                key: "Tamaño",
                description:
                    "Cantidad actual de elementos almacenados en la lista doble.",
            },
        ],
    },
    lista_circular: {
        info: [
            {
                key: "Tamaño",
                description:
                    "Cantidad actual de elementos almacenados en la lista circular.",
            },
        ],
    },
    lista_circular_doble: {
        info: [
            {
                key: "Tamaño",
                description:
                    "Cantidad actual de elementos almacenados en la lista circular doble.",
            },
        ],
    },
    tabla_hash: {
        info: [
            {
                key: "Número de elementos",
                description:
                    "Cantidad de pares (clave-valor) almacenados en la tabla.",
            },
            {
                key: "Número de slots",
                description:
                    "Total de posiciones internas donde se pueden colocar los elementos (capacidad de la tabla)",
            },
        ],
    },

    bst: {
        info: ["Peso", "Altura"],
    },

    avl: {
        info: ["Peso", "Altura"],
    },

    roji_negro: {
        info: ["Peso", "Altura"],
    },

    splay: {
        info: ["Peso", "Altura"],
    },

    heap: {
        info: ["Peso", "Altura"],
    },

    arbol_eneario: {
        info: ["Peso", "Altura", "Gordura"],
    },

    arbol_b: {
        info: ["Peso", "Altura", "Gordura"],
    },

    arbol_b_plus: {
        info: ["Peso", "Altura", "Gordura"],
    },
};
