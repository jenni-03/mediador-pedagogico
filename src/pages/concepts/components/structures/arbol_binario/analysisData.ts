export interface MetodoAnalisis {
    id: number;
    titulo: string;
    metodo: string;
    codigo: string[];
    costo: string;
    bigO: string;
}

export const analisisArbolBinario: MetodoAnalisis[] = [
    {
        id: 1,
        titulo: "Constructor Vacío",
        metodo: "ArbolBinario",
        codigo: [
            "/**",
            " * Crea un Arbol Binario vacio.",
            " * post: Se creo un Arbol Binario vacio.",
            " */",
            "public ArbolBinario() {",
            "    this.raiz = null;",
            "}"
        ],
        costo: "T(n) = O(1)",
        bigO: "O(1)"
    },
    {
        id: 2,
        titulo: "Constructor Raíz Predefinida",
        metodo: "ArbolBinario(T raiz)",
        codigo: [
            "/**",
            " * Crea un Arbol Binario con una raíz predefinida.",
            " * post: Se creo un nuevo Arbol con su raíz definida.",
            " * @param raiz Objeto que representa la raíz.",
            " */",
            "public ArbolBinario(T raiz) {",
            "    this.raiz = new NodoBin(raiz);",
            "}"
        ],
        costo: "T(n) = O(1)",
        bigO: "O(1)"
    },
    // Agrega aquí los otros métodos...
];
