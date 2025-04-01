export const complexitySecuencia = [
    {
        title: "1. Constructor (ListaS)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Constructor de la Clase Lista Simple Enlazada, por defecto la cabeza es NULL. 
             * post:  Se construyo una lista vacia.
             */
            public ListaS() {
                            1
                this.cabeza = null;
                            1
                this.tamanio = 0;
            }
        `
    },
    {
        title: "2. Insertar Elemento al Inicio (insertarAlInicio)",
        operationalCost: [
            "T(n) = 1 + 1 + 2",
            "T(n) = 4",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que inserta un Elemento al Inicio de la Lista. 
             * post:  Se inserto un nuevo elemento al inicio de la Lista.
             * @param x Informacion que desea almacenar en la Lista. La informacion debe ser un Objeto.
             */
            public void insertarAlInicio(T x) {
                            1    1
                this.cabeza = new Nodo < T > (x, this.cabeza);
                        2
                this.tamanio++;
            }
        `
    },
    {
        title: "3. Insertar Elemento al Final (insertarAlFinal)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + ( 5n + 11 ) 1 + 1 + 1 + 1 + 2",
            "T(n) = 3 + 5(n) + 17",
            "T(n) = 5n + 20",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que inserta un Elemento al Final de la Lista. 
             * post:  Se inserto un nuevo elemento al final de la Lista.
             * @param x Información que desea almacenar en la Lista. 
             */
            public void insertarAlFinal(T x) {
                                1
                if (this.cabeza == null)
                    //Mejor de los casos
                    this.insertarAlInicio(x);
                else {
                    try {
                            1       1      (5(n) + 11)         1
                        Nodo < T > ult = this.getPos(this.tamanio - 1);
                                1
                        if (ult == null)
                            return;
                            1         1              
                        ult.setSig(new Nodo < T > (x, null));
                            2
                        this.tamanio++;
                    } catch (ExceptionUFPS e) {
                        //Mejor de los casos
                        System.err.println(e.getMensaje());
                    }
                }
            }
        `
    },
    {
        title: "4. Insertar Elemento Ordenado a la Cabeza (insertarOrdenado)",
        operationalCost: [
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + \\sum_{x=0}^{n-1}( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 2",
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + n( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 2",
            "T(n) = 8 + n( 2 + KTE + 2 + KTE + 6 ) + 7",
            "T(n) = KTEn + 15",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. 
             * post:  Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.
             * @param info Información que desea almacenar en la Lista de manera Ordenada.
             */
            public void insertarOrdenado(T info) {
                        3 
                if (this.esVacia())
                    //Mejor de los casos
                    this.insertarAlInicio(info);
                else {
                    //Peor de los casos
                        1     1
                    Nodo < T > x = this.cabeza;
                        1     1
                    Nodo < T > y = x;
                            1
                    while (x != null) {
                            1                 1            KTE
                        Comparable comparador = (Comparable) info;
                        1      1               KTE         1
                        int rta = comparador.compareTo(x.getInfo());
                                1
                        if (rta < 0)
                        // Se ejecuta cuando se encuentre el orden, por tanto suma fuera del ciclo una vez
                            1
                            break;
                        // el peor de los casos sigue si no se ejecuta el break
                        1
                        y = x;
                        1     1
                        x = x.getSig();
                    }
                        1
                    if (x == y)
                        //Mejor de los casos
                        this.insertarAlInicio(info);
                    else {
                        //Peor de los casos
                            1         1
                        y.setSig(new Nodo < T > (info, x));
                                2
                        this.tamanio++;
                    }
                }
            }
        `
    },
    {
        title: "5. Eliminar Elemento segun la Posicion (eliminar)",
        operationalCost: [
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + ( 5n + 11 ) + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1",
            "T(n) = 8 + 5(n) + 21",
            "T(n) = 5n + 29",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que elimina un elemento dada una posición. 
             * post:  Se elimino el dato en la posicion de la lista indicada.
             * @param i Una posición en la Lista 
             * @return El elemento que elimino. Si la posición no es válida retorna NULL.
             */
            public T eliminar(int i) {
                        3
                if (this.esVacia())
                    //Mejor de los casos
                    return null;
                //Peor de los casos
                    1     1
                Nodo < T > t = this.cabeza;
                    1
                if (i == 0)
                    //Mejor de los casos
                    this.cabeza = this.cabeza.getSig();
                else {
                    //Peor de los casos
                    try {
                            1     1    (5(n) + 11)     1
                        Nodo < T > y = this.getPos(i - 1);
                        1     1
                        t = y.getSig();
                            1        1
                        y.setSig(t.getSig());
                    } catch (ExceptionUFPS e) {
                        //Mejor de los casos
                        System.err.println(e.getMensaje());
                        return (null);
                    }
                }
                    1
                t.setSig(null);
                    2
                this.tamanio--;
                1         1
                return (t.getInfo());
            }
        `
    },
    {
        title: "6. Eliminar Todos los Elementos (vaciar)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que elimina todos los datos de la Lista Simple. 
             * post: La Lista Simple se encuentra vacia.
             */
            public void vaciar() {
                            1
                this.cabeza = null;
                            1
                this.tamanio = 0;
            }
        `
    },
    {
        title: "7. Obtener Elemento segun la Posicion (get)",
        operationalCost: [
            "T(n) = 1 + 1 (5n + 11) + 1 + 1",
            "T(n) = 2 + 5n + 13",
            "T(n) = 5n + 15",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que retorna el elemento que se encuentre en una posicion dada. 
             * post:  Se retorno el elemento indicado por la posicion recibida.
             * @param i Una Posición dentro de la Lista. 
             * @return El objeto que se encuentra en esa posición. El objeto 
             * retorna su valor parametrizada "T". Si la posición no se 
             * encuentra en la Lista retorna null.
             */
            public T get(int i) {
                try {
                    //Peor de los casos
                        1     1      (5n + 11) 
                    Nodo < T > t = this.getPos(n);
                        1       1
                    return (t.getInfo());
                } catch (ExceptionUFPS e) {
                    //Mejor de los casos
                    System.err.println(e.getMensaje());
                    return (null);
                }
            }
        `
    },
    {
        title: "8. Modificar Elemento segun la Posición (set)",
        operationalCost: [
            "T(n) = 1 + 1 + ( 5n + 11 ) + 1",
            "T(n) = 2 + 5n + 12",
            "T(n) = 5n + 14",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que edita el elemento que se encuentre en una posición dada. 
             * post:  Se edito la informacion del elemento indicado por la posicion recibida.
             * @param i Una Posición dentro de la Lista. 
             * @param dato es el nuevo valor que toma el elmento en la lista
             */
            public void set(int i, T dato) {
                try {
                    //Peor de los casos
                        1     1      (5n + 11)
                    Nodo < T > t = this.getPos(i);
                        1
                    t.setInfo(dato);
                } catch (ExceptionUFPS e) {
                    //Mejor de los casos
                    System.err.println(e.getMensaje());
                }
            }
        `
    },
    {
        title: "9. Obtener Cantidad de Elementos (getTamanio)",
        operationalCost: [
            "T(n) = 1",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que obtiene la cantidad de elementos de la Lista. 
             * post:  Se retorno el numero de elementos existentes en la Lista.
             * @return int con el tamaño de la lista. Si la Lista esta vacía retorna 0
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
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que verifica si la Lista esta o no vacia. 
             * post:  Se retorno true si la lista se encuentra vacia, false si tiene elementos.
             * @return true si la lista esta vacia , false si contiene elementos.
             */
            public boolean esVacia() {
                1                 1
                return (this.cabeza == null);
            }
        `
    },
    {
        title: "11. Consultar Existencia de un Elemento (esta)",
        operationalCost: [
            "T(n) = 1 + (8n + 9) + 1",
            "T(n) = 1 + 8n + 10",
            "T(n) = 8n + 11",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que busca un elemento en la lista si lo encuentra retorna true, de lo contrario false. 
             * post:  Se retorno true si se encontro el elementos buscado, false si no fue asi.
             * @param info el cual contiene el valor del parametro a buscar en la lista. 
             * @return un boolean, si es true encontro el dato en la lista y si es false no lo encontro.
             */
            public boolean esta(T info) {
                    1        (8n + 9)              1   
                return (this.getIndice(info) != -1);
            }
        `
    },
    {
        title: "12. Obtener Iterator (iterator)",
        operationalCost: [
            "T(n) = 1 + 1",
            "T(n) = 2",
        ],
        complexity: "Big O = O(1)",
        javaCode: `
            /**
             * Metodo que crea para la lista simple un elemento Iterator.
             * post:  Se retorno un Iterator para la Lista.
             * @return Un iterator tipo <T> de la lista.
             */
            @Override
            public Iterator < T > iterator() {
                1           1         
                return new IteratorLS < T > (this.cabeza) {};
            }
        `
    },
    {
        title: "13. Obtener Contenido en un Vector (aVector)",
        operationalCost: [
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + \\sum_{x=0}^{n-1}( 2 + 1 + KTE + 1 + KTE) + KTE + 1",
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + n( 2 + 1 + KTE + 1 + KTE ) + KTE + 1",
            "T(n) = 14 + n( KTE ) + KTE",
            "T(n) = KTE(n) + KTE",
        ],
        complexity: "Big O = O(N)",
        javaCode: `
            /**
             * Metodo que permite retornar la informacion de una Lista en un Vector. 
             * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
             */
            public Object[] aVector() {
                        3
                if (this.esVacia())
                //Mejor de los casos
                    return (null);
                //Peor de los casos 
                    1        1       1             1
                Object vector[] = new Object[this.getTamanio()];
                        1      1          2
                Iterator < T > it = this.iterator();
                1   1
                int i = 0;
                        KTE
                while (it.hasNext())
                            2   1    KTE
                    vector[i++] = it.next();
                    1
                return (vector);
            }
        `
    },
    {
        title: "14. Imprimir Contenido (toString)",
        operationalCost: [
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + \\sum_{x=0}^{n-1}( 2 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + n( 2 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
            "T(n) = 8 + n( 8 ) + 4",
            "T(n) = 8n + 12",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que retorna toda la informacion de los elementos en un String de la Lista. 
             * post:  Se retorno la representacion en String de la Lista. 
             * El String tiene el formato "e1->e2->e3..->en", donde e1, e2, ..., en son los los elementos de la Lista. 
             * @return Un String con los datos de los elementos de la Lista
             */
            @Override
            public String toString() {
                        3
                if (this.esVacia())
                //Mejor de los casos
                    return ("Lista Vacia");
                //Peor de los casos
                    1    1
                String r = "";
                            1     1                1          1     1
                for (Nodo < T > x = this.cabeza; x != null; x = x.getSig())
                    2     1        1       1  
                    r += x.getInfo().toString() + "->";
                    1
                return (r);
            }
        `
    },
    {
        title: "15. Obtener el elemento de una Posición (getPos)",
        operationalCost: [
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{i>0}^{n-1}( 1 + 1 + 2 + 1 ) + 1 + 1",
            "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + n(  1 + 1 + 2 + 1 ) + 1 + 1",
            "T(n) = 10 + n( 5 ) + 1 + 1",
            "T(n) = 5n + 12",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo privado de la clase que devuelve al elemento en la posicion. 
             * post:  Se retorno el Nodo que se encuentra en esa posicion indicada. 
             
            * @param i Una posici�n en la Lista. 
            * @return El elemento encontrado. Si la posici�n no es v�lida
            * retorna null
            */
            private Nodo < T > getPos(int i) throws ExceptionUFPS {
                        3              1   1               1   1
                if (this.esVacia() || i > this.tamanio || i < 0) {
                    //Mejor de los casos
                    throw new ExceptionUFPS("El índice solicitado no existe en la Lista Simple");
                } 
                //Peor de los casos
                    1     1
                Nodo < T > t = this.cabeza;
                        1
                while (i > 0) {
                    1     1
                    t = t.getSig();
                    2
                    i--;
                }
                    1
                return (t);
                // en algun punto i llega a valer n, entonces i = n 
            }
        `
    },
    {
        title: "16 Obtener la Posición de un Elemento (getIndice)",
        operationalCost: [
            "T(n) = 1 + 1 + 1 + 1 + 1 + \\sum_{x=0}^{n-1}( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
            "T(n) = 1 + 1 + 1 + 1 + 1 + n( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
            "T(n) = 5 + n( 8 ) + 4",
            "T(n) = 8n + 9",
        ],
        complexity: "Big O = O(n)",
        javaCode: `
            /**
             * Metodo que obtiene la posición de un objeto en la Lista. 
             * post:  Se retorno la posicion en la que se encuentra el dato buscado. 
             * @param info Objeto que se desea buscar en la Lista 
             * @return un int con la posición del elemento,-1 si el elemento no se 
             * encuentra en la Lista
             */
            public int getIndice(T info) {
                1   1
                int i = 0;
                            1     1                1          1    1
                for (Nodo < T > x = this.cabeza; x != null; x = x.getSig()) {
                            1          2
                    if (x.getInfo().equals(info))
                        //Mejor de los casos
                        return (i);
                    2
                    i++;
                }
                //Peor de los casos
                    1
                return (-1);
            }
        `
    },
];