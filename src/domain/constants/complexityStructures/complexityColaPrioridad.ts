export const complexityColaPrioridad = [
    {
        title: "1. Constructor (ColaP)",
        operationalCost: [
            "T(n) = 5 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1",
            "T(n) = 13",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Constructor de la Clase ColaP, por defecto el primer y ultimo nodo es NULL y su tamaño es 0. <br>
             * <b>post: </b> Se construyo una ColaP .
             */
            public ColaP() {
                5
                super();
                    1            1
                super.setInicio(new NodoP < T > (null, null, null, 0));
                        1     1       1              1
                NodoP < T > x = (NodoP < T > ) super.getInicio();
                    1
                x.setSig(x);
                    1
                x.setAnt(x);
            }
        `
    },
    {
        title: "2. Insertar Elemento (enColar)",
        operationalCost: [
            "T(n) = 1 + 1 + 4 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + n(1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + 1 + 1 + 1) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1",
            "T(n) = 26 + n(23) + 25",
            "T(n) = 23n + 51",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que permite agregar un elemento a la Cola. 
             * post:  Se inserto un nuevo elemento a la Cola.
             * @param info es de tipo T y contiene la informacion a en colar. 
             * @param p es de tipo entero y representa la prioridad del elemento. 
             */
            public void enColar(T info, int p) {
                    1            1    1 
                NodoP < T > nuevo = new NodoP < T > (info, null, null, p);
                        4            1
                if (this.esVacia()) {
                    //Mejor de los casos
                    NodoP < T > x = new NodoP < T > (info, (NodoP < T > ) super.getInicio(), (NodoP < T> ) super.getInicio().getAnt(),p);
                    ((NodoP < T > ) super.getInicio()).getAnt().setSig(x);
                    ((NodoP < T > ) super.getInicio()).setAnt(x);
                    this.aumentarTamanio();
                } else {
                    //Peor de los casos
                                1                  1          1             1        1             1
                    if (((NodoP < T > ) super.getInicio().getSig()).getPrioridad() < nuevo.getPrioridad()) {
                        //Mejor de los casos
                        //Inserta al inicio
                        nuevo.setSig(((NodoP < T > ) super.getInicio()).getSig());
                        ((NodoP < T > ) super.getInicio()).getSig().setAnt(nuevo);
                        ((NodoP < T > ) super.getInicio()).setSig(nuevo);
                        nuevo.setAnt(((NodoP < T > ) super.getInicio()));
                        super.aumentarTamanio();
                    } else {
                        //Peor de los casos
                        //NodoP iterado
                                1        1        1                  1          1
                        NodoP < T > c = ((NodoP < T > ) super.getInicio()).getSig();
                                1      1
                        boolean ins = false;
                                    1        1             1             1    1
                        while (c != ((NodoP < T > ) super.getInicio()) && !ins) {
                                        1     1         1                  1         1    1            1         1             1
                                if (c.getSig() != ((NodoP < T > ) super.getInicio()) && c.getSig().getPrioridad() < nuevo.getPrioridad()) {
                                        1        1
                                    nuevo.setSig(c.getSig());
                                        1        1   
                                    c.getSig().setAnt(nuevo);
                                        1
                                    c.setSig(nuevo);
                                            1
                                    nuevo.setAnt(c);
                                                2
                                    super.aumentarTamanio();
                                        1
                                    ins = true;
                                } else {
                                    //Mejor de los casos
                                    c = c.getSig();
                                }
                        }
                        //Si no inserto, es porque tiene la menor prioridad
                                1        1                 1
                        if (c == ((NodoP < T > ) super.getInicio())) {
                                    1        1    1                         1             1
                                NodoP < T > x = new NodoP < T > (info, (NodoP < T > ) super.getInicio(), 
                                    1              1               1 
                                (NodoP < T > ) super.getInicio().getAnt(), p);
                                    1                     1          1        1
                                ((NodoP < T > ) super.getInicio()).getAnt().setSig(x);
                                    1                   1           1
                                ((NodoP < T > ) super.getInicio()).setAnt(x);
                                            2
                                this.aumentarTamanio();
                        }
                    }
                }
            }
        `
    },
    {
        title: "3. Eliminar Elemento (deColar)",
        operationalCost: [
            "T(n) = 1 + 18",
            "T(n) = 19",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite retirar el primer elemento que fue insertado en la Cola. 
             * post:  Se elimina el primer elemento que fue insertado en la Cola. 
             * @return un tipo T que contiene la informacion del nodo retirado
             */
            @Override
            public T deColar() {
                1           18
                return (super.deColar());
            }
        `
    },
    {
        title: "4. Vaciar la Cola (vaciar)",
        operationalCost: [
            "T(n) = 3",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite elimar todos los datos que contiene la Cola. 
             * post:  Se elimino todos los datos que se encontraban en la Cola.
             */
            @Override
            public void vaciar() {
                    3
                super.vaciar();
            }
        `
    },
    {
        title: "5. Obtener Informacion Primer Elemento (getInfoInicio)",
        operationalCost: [
            "T(n) = 4",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite conocer el primer elemento que fue insertado en la Cola. 
             * post:  Se obtiene el primer elemento que fue insertado en la Cola.
             * @return el primer elemento que fue insertado en la cola
             */
            @Override
            public T getInfoInicio() {
                    1          3
                return (super.getInfoInicio());
            }
        `
    },
    {
        title: "6. Obtener Tamanio (getTamanio)",
        operationalCost: [
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que retorna el tamaño de la Cola. 
             * post:  Se retorno el numero de elementos existentes en la Cola.
             * @return un tipo integer qeu contiene el tamaño de la Cola.
             */
            @Override
            public int getTamanio() {
                    1            1
                return (super.getTamanio());
            }
        `
    },
    {
        title: "7. Consultar Existencia de Elementos (esVacia)",
        operationalCost: [
            "T(n) = 1 + 3",
            "T(n) = 4",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que permite evaluar si la Cola se encuentra o no vacia. 
             * post:  Retorna si la Cola se encuentra vacia, retorna false si hay elementos en la Cola.
             * @return Un tipo boolean, true si es vacio y false si contiene nodos
             */
            @Override
            public boolean esVacia() {
                    1         3
                return (super.esVacia());
            }
        `
    },
    {
        title: "8. Imprimir Contenido (toString)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + n(2 + 1 + 1 + 1 + 1 + 1 + 1 + 1) + 1 + 1 + 1 + 1",
            "T(n) = 6 + n(9) + 4",
            "T(n) = 9n + 10",
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
                    1     1
                String msj = "";
                    1        1       1              1
                NodoP < T > c = ((NodoP < T > ) super.getInicio());
                    1        1
                NodoP < T > x = c;
                1     1
                x = x.getSig();
                        1         1             1
                while (x != ((NodoP < T > ) super.getInicio())) {
                        2         1     1
                    msj += x.toString() + "->";
                        1     1
                    x = x.getSig();
                }
                    1
                return msj;
            }
        `
    },
];