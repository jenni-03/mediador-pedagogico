export const complexityPila = [
    {
        title: "1. Constructor (Pila)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo constructor vacio de la clase Pila. 
             * post:  Se construye una Pila vacia
             */
            public Pila() {
                        1
                this.tope = null;
                            1
                this.tamanio = 0;
            }
        `
    },
    {
        title: "2. Insertar Elemento (apilar)",
        operationalCost: [
            "T(n) = 5 + 1 + 1 + 2",
            "T(n) = 9",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que inserta un elemento en la Pila. 
             * post:  Se inserto un elemento dentro de la Pila.
             * @param info es de tipo T y contiene la información a insertar en la pila.
             */
            public void apilar(T info) {
                        5
                if (this.esVacia())
                    this.tope = new Nodo < T > (info, null);
                else
                                1       1      
                    this.tope = new Nodo < T > (info, this.tope);
                        2
                this.tamanio++;
            }
        `
    },
    {
        title: "3. Eliminar Elemento (desapilar)",
        operationalCost: [
            "T(n) = 5 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + 1",
            "T(n) = 15",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que retira y devuelve un elemento de la Pila. 
             * post:  Se retiro y elimino el elemento tope de la Pila.
             * @return un tipo T y contiene la información retirada de la pila.
             */
            public T desapilar() {
                        5
                if (this.esVacia())
                //Mejor de los casos
                    return (null);
                //Peor de los casos
                    1      1
                Nodo < T > x = this.tope;
                        1         1
                this.tope = tope.getSig();
                        2
                this.tamanio--;
                            1
                if (tamanio == 0)
                                1
                    this.tope = null;
                    1         1
                return (x.getInfo());
            }
        `
    },
    {
        title: "4. Eliminar Todos los Elementos (vaciar)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Elimina todos los datos de la Pila. 
             * post:  Se elimino todos los datos que se encontraban en la Pila.
             */
            public void vaciar() {
                        1
                this.tope = null;
                            1
                this.tamanio = 0;
}
        `
    },
    {
        title: "5. Obtener Elemento Tope (getTope)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo devuelve el elemento que se encuentra en el tope de la Pila. 
             * post:  Se retorno el elemento tope de la Pila.
             * @return El elemento que esta en el tope de la Pila.
             */
            public T getTope() {
                1                  1
                return (this.tope.getInfo());
            }
        `
    },
    {
        title: "6. Obtener Cantidad de Elementos (getTamanio)",
        operationalCost: [
            "T(n) = 1",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que retorna el tamaño de la pila. 
             * post:  Se retorno el tamaño de la Pila.
             * @return un tipo de dato Integer que contiene el tamaño de la Pila.
             */
            public int getTamanio() {
                    1 
                return (this.tamanio);
            }
        `
    },
    {
        title: "7. Consultar Existencia de Elementos (esVacia)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1",
            "T(n) = 4",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que comprueba si la pila esta vacía. 
             * post:  Se retorno true si la Pila se encuentra vacia y false si no lo esta. 
             * @return un tipo boolean, true si es vacía y false si no.
             */
            public boolean esVacia() {
                    1               1       1              1
                return (this.tope == null || this.tamanio == 0);
            }
        `
    },
    {
        title: "8. Imprimir Contenido (toString)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1 + \\sum_{p=0}^{n-1}(2 + 1 + 1 + 1 + 1 + 1) + 1 + 1",
            "T(n) = 1 + 1 + 1 + 1 + 1 + n(2 + 1 + 1 + 1 + 1 + 1) + 1 + 1",
            "T(n) = 5 + n(7) + 2",
            "T(n) = 7n + 7",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Convierte la pila a una cadena de String. 
             * post:  Se retorno la representacion en String de la pila. 
             * El String tiene el formato "e1->e2->e3..->en", donde e1, e2, ..., en son los los elementos de la Pila. 
             * @return La representacion en String de la Pila.
             */
            @Override
            public String toString() {
                    1      1
                String msj = "";
                    1         1
                Nodo < T > p = tope;
                        1
                while (p != null) {
                        2      1          1      1
                    msj += p.getInfo().toString() + "->";
                        1     1
                    p = p.getSig();
                }
                    1
                return msj;
}
        `
    },
];