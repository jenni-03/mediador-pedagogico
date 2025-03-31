export const complexityCola = [
    {
        title: "1. Constructor (Cola)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1",
            "T(n) = 5",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Constructor de la Clase Cola, por defecto el primer y ultimo nodo es NULL y su tamaño es 0. <br>
             * <b>post: </b> Se construyo una Cola sin elementos.
             */
            public Cola() {
                            1    1
                this.inicio = new NodoD < T > (null, null, null);
                            1
                this.inicio.setSig(inicio);
                        1
                inicio.setAnt(inicio);
                            1
                this.tamanio = 0;
            }
        `
    },
    {
        title: "2. Insertar Elemento (enColar)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2",
            "T(n) = 9",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite agregar un elemento a la Cola. <br>
             * <b>post: </b> Se inserto un nuevo elemento a la Cola.<br>
             * @param info es de tipo T y contiene la informacion a en colar
             */
            public void enColar(T info) {
                    1        1    1                                 1
                NodoD < T > x = new NodoD < T > (info, inicio, inicio.getAnt());
                    1            1
                inicio.getAnt().setSig(x);
                    1
                inicio.setAnt(x);
                        2
                this.aumentarTamanio();
            }
        `
    },
    {
        title: "3. Eliminar Elemento (deColar)",
        operationalCost: [
            "T(n) = 5 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1",
            "T(n) = 18",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite retirar el primer elemento que fue insertado en la Cola. <br>
             * <b>post: </b> Se elimina el primer elemento que fue insertado en la cola.<br>
             * @return un tipo T que contiene la informacion del nodo retirado.
             */
            public T deColar() {
                        5
                if (this.esVacia())
                    //Mejor de los casos
                    return (null);
                    1        1            1
                NodoD < T > x = this.inicio.getSig();
                            1      1
                this.inicio.setSig(x.getSig());
                    1        1
                x.getSig().setAnt(inicio);
                    1
                x.setSig(null);
                    1
                x.setAnt(null);
                    2
                this.tamanio--;
                    1         1
                return (x.getInfo());
            }
        `
    },
    {
        title: "4. Vaciar la Cola (vaciar)",
        operationalCost: [
            "T(n) = 1 + 1 + 1",
            "T(n) = 3",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite elimar todos los datos que contiene la Cola. <br>
             * <b>post: </b> Se elimino todos los datos que se encontraban en la Cola.<br>
             */
            public void vaciar() {
                            1
                this.inicio.setSig(this.inicio);
                            1
                this.inicio.setAnt(this.inicio);
                            1
                this.tamanio = 0;
            }
        `
    },
    {
        title: "5. Obtener Primer Elemento (getInicio)",
        operationalCost: [
            "T(n) = 1",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite conocer el primer elemento que fue insertado en la Cola. <br>
             * <b>post: </b> Se obtiene el primer elemento que fue insertado en la Cola.<br>
             * @return El primer elemento que fue insertado en la cola
             */
            protected NodoD < T > getInicio() {
                    1
                return this.inicio;
            }
        `
    },
    {
        title: "6. Obtener Informacion Primer Elemento (getInfoInicio)",
        operationalCost: [
            "T(n) = 3",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite conocer el primer elemento que fue insertado en la Cola. <br>
             * <b>post: </b> Se obtiene el primer elemento que fue insertado en la Cola.<br>
             * @return El primer elemento que fue insertado en la cola
             */
            public T getInfoInicio() {
                    1               1        1
                return this.inicio.getSig().getInfo();
            }
        `
    },
    {
        title: "7. Aumentar Tamanio (aumentarTamanio)",
        operationalCost: [
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite aumentar el tamaño de la Cola para dar uso en Cola de Prioridad. <br>
             */
            protected void aumentarTamanio() {
                    2
                this.tamanio++;
            }
        `
    },
    {
        title: "8. Modificar Nodo Inicial (setInicio)",
        operationalCost: [
            "T(n) = 1",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite modificar el Nodo inicial de la Cola para uso de la Cola de prioridad. <br>
             * @param ini Representa el nuevo Nodo inicial de la cola.
             */
            protected void setInicio(NodoD < T > ini) {
                            1
                this.inicio = ini;
            }
        `
    },
    {
        title: "9. Obtener Tamanio (getTamanio)",
        operationalCost: [
            "T(n) = 1",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que retorna el tamaño de la cola<br>
             * <b>post: </b> Se retorno el numero de elementos existentes en la Cola.<br>
             * @return un tipo integer qeu contiene el tamaño de la cola
             */
            public int getTamanio() {
                    1
                return (this.tamanio);
            }
        `
    },
    {
        title: "10. Consultar Existencia de Elementos (esVacia)",
        operationalCost: [
            "T(n) = 1 + 1 + 1",
            "T(n) = 3",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que retorna si la cola esta vacia o no<br>
             * <b>post: </b> Retorna si la Cola se encuentra vacia, retorna false si hay elementos en la Cola.<br>
             * @return un tipo boolean, true si es vacio y false si contiene nodos
             */
            public boolean esVacia() {
                    1              1           1
                return (this.getTamanio() == 0);
            }
        `
    },
    {
        title: "11. Imprimir Contenido (toString)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + n(2 + 1 + 1 + 1 + 1 + 1 + 1) + 1 + 1",
            "T(n) = 6 + n(8) + 2",
            "T(n) = 8n + 8",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Convierte la pila a una cadena de String. <br>
             * <b>post: </b> Se retorno la representacion en String de la pila. 
             * El String tiene el formato "e1->e2->e3..->en", donde e1, e2, ..., en son los los elementos de la Pila. <br>
             * @return La representacion en String de la Pila.
             */
            @Override
            public String toString() {
                    1       1
                String msj = "";
                    1          1            1
                NodoD < T > c = this.inicio.getSig();
                        1
                while (c != inicio) {
                        2        1         1      1
                    msj += c.getInfo().toString() + "->";
                        1      1
                    c = c.getSig();
                }
                    1
                return msj;
            }
        `
    },
];