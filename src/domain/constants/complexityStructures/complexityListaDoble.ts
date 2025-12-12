export const complexityListaDoble = [
  {
    title: "1. Constructor (ListaD)",
    operationalCost: ["T(n) = 1 + 1", "T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Constructor de la Clase Lista Doble Enlazada, por defecto la cabeza es NULL. 
             * post:  Se construyo una lista doble vacia.
             */
            public ListaD() {
                            1
                this.cabeza = null;
                            1
                this.tamanio = 0;
            }
        `,
  },
  {
    title: "2. Insertar Elemento al Inicio (insertarAlInicio)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1 + 1 + 2", "T(n) = 7"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Adiciona un Elemento al Inicio de la Lista doble. 
             * post:  Se inserto un nuevo elemento al inicio de la Lista Doble.
             * @param x Informacion que desea almacenar en la Lista doble. La informacion debe ser un Objeto.
             */
            public void insertarAlInicio(T x) {
                                1
                if (this.cabeza == null)
                    //Mejor de los casos
                    this.cabeza = new NodoD < T > (x, null, null);
                else {
                    //Peor de los casos 
                                1       1
                    this.cabeza = new NodoD < T > (x, this.cabeza, null);
                                1       1
                    this.cabeza.getSig().setAnt(this.cabeza);
                }
                        2
                this.tamanio++;
            }
        `,
  },
  {
    title: "3. Insertar Elemento al Final (insertarAlFinal)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + ( 5n + 13 ) 1 + 1 + 1 + 1 + 2",
      "T(n) = 3 + 5(n) + 19",
      "T(n) = 5n + 22",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Inserta un Elemento al Final de la Lista. 
             * post:  Se inserto un nuevo elemento al final de la Lista Doble.
             * @param x Informacion que desea almacenar en la Lista. La informacion debe ser un Objecto. 
             */
            public void insertarAlFinal(T x) {
                                1
                if (this.cabeza == null)
                    //Mejor de los casos
                    this.insertarAlInicio(x);
                else {
                    //Peor de los casos 
                            1
                    NodoD < T > ult;
                    try {
                            1      (5n + 13)              1
                        ult = this.getPos(this.tamanio - 1);
                                1
                        if (ult == null)
                            //Mejor de los casos
                            return;
                        //Peor de los casos
                            1           1
                        ult.setSig(new NodoD < T > (x, null, ult));
                                2
                        this.tamanio++;
                    } catch (ExceptionUFPS ex) {
                        //Mejor de los casos                   
                        System.err.println(ex.getMessage());
                    }
                }
            }
        `,
  },
  {
    title: "4. Insertar Elemento Ordenado a la Cabeza (insertarOrdenado)",
    operationalCost: [
      "T(n) = 1 + 1 + KTE + 3 + 1 + KTE + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + K T E + 1 + 1 + \\sum_{p=0}^{n-1}( 1 + 1 + 1 + 1 + KTE + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = 1 + 1 + KTE + 3 + 1 + KTE + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + K T E + 1 + 1 + n( 1 + 1 + 1 + 1 + KTE + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = KTE + n(KTE) + KTE + 9",
      "T(n) = KTEn + KTE",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. 
             * post:  Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.
             * @param info Información que desea almacenar en la Lista de manera Ordenada.
             */
            public void insertarOrdenado(T info) {
                    1        1      KTE
                Comparable x = (Comparable)(info);
                        3        1        KTE                1        1
                if (this.esVacia() || x.compareTo(this.cabeza.getInfo()) <= 0) {
                    // Mejor de los casos
                    this.insertarAlInicio(info);
                    return;
                }
                //Peor de los casos
                        1         1       1
                NodoD < T > nuevo = new NodoD < T > (info, null, null);
                        1     1
                NodoD < T > p = this.cabeza;
                        1        1       KTE         1      1        1     1
                for ((p != null && x.compareTo(p.getInfo()) >= 0); p = p.getSig()) {}
                    1
                if (p == null)
                    //Mejor de los casos
                    this.insertarAlFinal(info);
                else {
                    //Peor de los casos
                            1        1
                    nuevo.setAnt(p.getAnt());
                            1
                    nuevo.setSig(p);
                        1
                    p.setAnt(nuevo);
                            1        1
                    nuevo.getAnt().setSig(nuevo);
                            2
                    this.tamanio++;
                }
            }
        `,
  },
  {
    title: "5. Eliminar Elemento segun la Posicion (eliminar)",
    operationalCost: [
      "T(n) = 1 + 1 + ( 5n + 13 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1",
      "T(n) = 2 + 5(n) + 28",
      "T(n) = 5n + 30",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que remueve un elemento de la lista con la posicion de esta en la lista. 
             * post:  Se elimina un elemento de la Lista dada una posicion determinada.
             * @param i es de tipo integer que contiene la posicion del elemento en la lista
             * @return De tipo T que contiene el elemento removido de la lista
             */
            public T eliminar(int i) {
                try {
                            1
                    NodoD < T > x;
                    1       (5n + 13)
                    x = this.getPos(i);
                        1
                    if (x == this.cabeza) {
                        //Mejor de los casos
                        //Mover el Nodo cabeza
                        this.cabeza = this.cabeza.getSig();
                        //Referencias de Nodo x a null
                    } else {
                        //Peor de los casos
                            1       1        1
                        x.getAnt().setSig(x.getSig());
                                1      1
                        if (x.getSig() != null) //Si no es el ultimo nodo
                            //Si entra, cuenta como peor de los casos 
                            1        1        1
                        x.getSig().setAnt(x.getAnt());
                    }
                    //Libero Nodo x 
                        1
                    x.setAnt(null);
                        1
                    x.setSig(null);
                            2
                    this.tamanio--;
                    1         1
                    return (x.getInfo());
                } catch (ExceptionUFPS ex) {
                    //Mejor de los casos
                    System.err.println(ex.getMessage());
                    return (null);
                }
            }
        `,
  },
  {
    title: "6. Eliminar Todos los Elementos (vaciar)",
    operationalCost: ["T(n) = 1 + 1", "T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Elimina todos los datos de la Lista Doble. 
             * post:  Se elimino todos los datos que encontraban en la lista doble.
             */
            public void vaciar(){  
                            1      
                this.cabeza = null;
                            1
                this.tamanio = 0;
            }
        `,
  },
  {
    title: "7. Obtener el Contenido de un Nodo (get)",
    operationalCost: ["T(n) = 1 + 1 (5n + 13) + 1 + 1", "T(n) = 5n + 17"],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que permite obtener el contenido de un nodo en la lista doble. 
             * post:  Se obtiene un elemento de la lista dada una posicion determinada.
             * @param i es de tipo integer y contiene la posicion del nodo en la lista doble. 
             * @return de tipo T que contiene la informacion en el nodo de la lista doble
             */
            public T get(int i) {
                        1
                NodoD < T > t;
                try {
                    1     (5n + 13)
                    t = this.getPos(i);
                    1           1
                    return (t.getInfo());
                } catch (ExceptionUFPS ex) {
                    //Mejor de los casos
                    System.err.println(ex.getMessage());
                    return (null);
                }
            }
        `,
  },
  {
    title: "8. Modificar Elemento segun la Posición (set)",
    operationalCost: [
      "T(n) = 1 + 1 + ( 5n + 13 ) + 1",
      "T(n) = 2 + 5n + 14",
      "T(n) = 5n + 16",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que permite modificar el elemento que se encuentre en una posicion dada. 
             * post:  Se edita la informacion de un elemento de la lista dada un pasicion determinada.
             * @param i Una Posicion dentro de la Lista doble
             * @param dato es el nuevo valor que toma el elmento en la lista doble
             */
            public void set(int i, T dato) {
                try {
                            1     1       (5n + 13)
                    NodoD < T > t = this.getPos(i);
                        1
                    t.setInfo(dato);
                } catch (ExceptionUFPS e) {
                    //Mejor de los casos
                    System.err.println(e.getMessage());
                }
            }
        `,
  },
  {
    title: "9. Obtener Cantidad de Elementos (getTamanio)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que retorna el tamanio de la lista doble. 
             * post:  Se retorno el numero de elementos existentes en la Lista Doble.
             * @return de tipo integer que contiene el tamaño del a lista doble
             */
            public int getTamanio() {
                1
                return this.tamanio;
            }
        `,
  },
  {
    title: "10. Consultar Existencia de Elementos (esVacia)",
    operationalCost: ["T(n) = 1 + 1", "T(n) = 2"],
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
        `,
  },
  {
    title: "11. Consultar Existencia de un Elemento (esta)",
    operationalCost: ["T(n) = 1 + (8n + 12) + 1", "T(n) = 8n + 14"],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que busca un elemento en la lista. 
             * post:  Retorna true,si el elemento consultado se encuentra en la Lista.
             * @param info que es el valor del elemento a buscar en la Lista. 
             * @return Un boolean, si es true encontro el dato en la Lista Doble. 
             */
            public boolean esta(T info) {
                1           (8n + 12)           1
                return (this.getIndice(info) != -1);
            }
        `,
  },
  {
    title: "12. Obtener Iterator (iterator)",
    operationalCost: ["T(n) = 1 + 1", "T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que permite obtener un Iterador para una Lista Doble. 
             * post:  Retorna una Iterador para la Lista.
             * @return Un objeto de tipo IteratorLD<T> que permite recorrer la Lista.
             */
            @Override
            public Iterator < T > iterator() {
                1             1
                return (new IteratorLD < T > (this.cabeza));
            }
        `,
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
        `,
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
        `,
  },
  {
    title: "15. Obtener el elemento de una Posición (getPos)",
    operationalCost: [
      "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{i>0}^{n-1}( 1 + 1 + 2 + 1 ) + 1 + 1 + 1",
      "T(n) = 3 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + n(  1 + 1 + 2 + 1 ) + 1 + 1 + 1",
      "T(n) = 10 + n( 5 ) + 3",
      "T(n) = 5n + 13",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo de tipo privado de la clase que devuelve al elemento en la posicion. 
             * post:  Retorna el Nodo que se encuentra en esa posicion indicada. 
             
            * @param i es de tipo integer y contiene la posicion del elemento en la lista. 
            * @return un tipo NodoD<T> con el nodo de la posicion.
            */
            private NodoD < T > getPos(int i) throws ExceptionUFPS {
                            3          1    1               1   1
                if (this.esVacia() || i > this.tamanio || i < 0) {
                    //Mejor de los casos
                    throw new ExceptionUFPS("El índice solicitado no existe en la Lista Doble");
                }
                //Peor de los casos   
                        1     1
                NodoD < T > t = this.cabeza;
                        1
                while (i > 0) {
                    1      1
                    t = t.getSig();
                    2
                    i--;
                }
                1
                return (t);
                // en algun punto i llega a valer n, entonces i = n     
            }
        `,
  },
  {
    title: "16 Obtener la Posición de un Elemento (getIndice)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + 1 + 1 + \\sum_{x=0}^{n-1}( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1",
      "T(n) = 1 + 1 + 1 + 1 + 1 + n( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1",
      "T(n) = 5 + n( 8 ) + 7",
      "T(n) = 8n + 12",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que obtiene la posicion de un objeto en la Lista. Se recomienda
             * que la clase tenga sobre escrito el metodo equals. 
             * post:  Retorna la posicion en la que se encuentra el dato buscado. 
             * @param info Objeto que se desea buscar en la Lista
             * @return un int con la posición del elemento,-1 si el elemento no se 
             * encuentra en la Lista
             */
            public int getIndice(T info) {
                1    1
                int i = 0;
                            1     1                1          1      1
                for (NodoD < T > x = this.cabeza; x != null; x = x.getSig()) {
                            1        2
                    if (x.getInfo().equals(info))
                        // Mejor de los casos
                        return (i);
                    2
                    i++;
                }
                1
                return (-1);
            }
        `,
  },
];
