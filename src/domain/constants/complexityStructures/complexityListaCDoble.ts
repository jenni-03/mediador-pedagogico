export const complexityListaCDoble = [
  {
    title: "1. Constructor (ListaCD)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1", "T(n) = 4"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Constructor de la Clase Lista Circular Doble Enlazada, Crea
             * un nodo que sirve como cabezaecera de la ListaCD<T>. 
             * post:  Se construyo una lista circular doble vacia.
             */
            public ListaCD() {
                            1    1  
                this.cabeza = new NodoD < T > (null, null, null);
                            1
                this.cabeza.setSig(cabeza);
                            1
                cabeza.setAnt(cabeza);
            }
        `,
  },
  {
    title: "2. Insertar Elemento al Inicio (insertarAlInicio)",
    operationalCost: ["T(n) = 1 + 1 + + 1 + 1 + 1 + 1 + 1 + 2", "T(n) = 9"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que permite adicionar un Elemento al Inicio de la Lista. 
             * post:  Se inserto un nuevo elemento al inicio de la Lista.
             * @param dato Informacion que desea almacenar en la Lista. La informacion
             * debe ser un Objeto.
             */
            public void insertarAlInicio(T dato) {
                    1        1    1                          1
                NodoD < T > x = new NodoD < T > (dato, cabeza.getSig(), cabeza);
                    1
                cabeza.setSig(x);
                    1        1
                x.getSig().setAnt(x);
                    2
                this.tamanio++;
            }
        `,
  },
  {
    title: "3. Insertar Elemento al Final (insertarAlFinal)",
    operationalCost: ["T(n) = 1 + 1 + + 1 + 1 + 1 + 1 + 1 + 2", "T(n) = 9"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que permite insertar un Elemento al Final de la Lista. 
             * post:  Se inserto un nuevo elemento al final de la Lista.
             * @param dato Informacion que desea almacenar en la Lista. La informacion
             * debe ser un Objeto.
             */
            public void insertarAlFinal(T dato) {
                    1        1    1                                 1
                NodoD < T > x = new NodoD < T > (dato, cabeza, cabeza.getAnt());
                        1        1
                cabeza.getAnt().setSig(x);
                        1
                cabeza.setAnt(x);
                        2
                this.tamanio++;
            }
        `,
  },
  {
    title: "4. Insertar Elemento Ordenado a la Cabeza (insertarOrdenado)",
    operationalCost: [
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{i=0}^{n-1}( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + n( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = 13 + n( KTE ) + 10",
      "T(n) = KTEn + 23",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. 
             * post:  Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.
             * @param info Información que desea almacenar en la Lista de manera Ordenada.
             */
            public void insertarOrdenado(T info) {
                            7
                if (this.esVacia())
                    //Mejor de los casos
                    this.insertarAlInicio(info);
                else {
                        1        1
                    NodoD < T > x = this.cabeza;
                        1        1
                    NodoD < T > y = x;
                    1   1
                    x = x.getSig();
                            1
                    while (x != this.cabeza) {
                            1               1     KTE
                        Comparable comparador = (Comparable) info;
                        1      1          KTE             1
                        int rta = comparador.compareTo(x.getInfo());
                                1
                        if (rta < 0)
                            // Se ejecuta cuando se encuentre el orden, por tanto suma fuera del ciclo una vez
                            1
                            break;
                        1
                        y = x;
                        1     1 
                        x = x.getSig();
                    }
                        1        1
                    if (x == cabeza.getSig())
                        // Mejor de los casos
                        this.insertarAlInicio(info);
                    else {
                        1        1
                        y.setSig(new NodoD < T > (info, x, y));
                        1        1
                        x.setAnt(y.getSig());
                        2
                        this.tamanio++;
                    }
                }
            }
        `,
  },
  {
    title: "5. Eliminar Elemento segun la Posicion (eliminar)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + ( 5n + 9 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1",
      "T(n) = 3 + 5(n) + 23",
      "T(n) = 5n + 26",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que permite eliminar un elemento de la lista dada una posicion. 
             * post:  Se elimino el dato en la posicion indicada de la lista.
             * @param i Posicion del objeto 
             * @return el objeto que se elimino de la lista
             */
            public T eliminar(int i) {
                try {
                        1
                    NodoD < T > x;
                        1
                    if (i == 0) {
                        //Mejor de los casos
                        x = this.cabeza.getSig();
                        this.cabeza.setSig(x.getSig());
                        this.cabeza.getSig().setAnt(this.cabeza);
                        x.setSig(null);
                        x.setAnt(null);
                        this.tamanio--;
                        return (x.getInfo());
                    }
                    1      (5n + 9)      1
                    x = this.getPos(i - 1);
                        1        1     1
                    NodoD < T > y = x.getSig();
                    1         1
                    x.setSig(y.getSig());
                    1         1
                    y.getSig().setAnt(x);
                        1
                    y.setSig(null);
                        1
                    y.setAnt(null);
                            2
                    this.tamanio--;
                    1        1
                    return (y.getInfo());
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
    operationalCost: ["T(n) = 1 + 1+ 1 + 1 + 1", "T(n) = 5"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que elimina todos los datos de la Lista Circular Doble. 
             * post:  Elimina todos los datos que contenga la lista circular doble.
             */
            public void vaciar() {
                            1    1  
                this.cabeza = new NodoD < T > (null, null, null);
                            1
                this.cabeza.setSig(cabeza);
                        1
                cabeza.setAnt(cabeza);
                            1
                this.tamanio = 0;
            }
        `,
  },
  {
    title: "7. Obtener Elemento segun la Posicion (get)",
    operationalCost: [
      "T(n) = 1 + 1 (5n + 9) + 1 + 1",
      "T(n) = 2 + 5n + 13",
      "T(n) = 5n + 13",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que retorna el objeto de la posicion i. 
             * post:  Se retorno el elemento indicado por la posicion recibida i.
             * @param i posicion de un elemento de la lista 
             * @return Devuelve el Objeto de la posicion especificada , null en caso contrario
             */
            public T get(int i) {
                try {
                        1        1     (5n + 9)
                    NodoD < T > x = this.getPos(i);
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
    title: "8. Modificar Elemento segun la Posición (set)",
    operationalCost: [
      "T(n) = 1 + 1 + ( 5n + 9 ) + 1",
      "T(n) = 2 + 5n + 10",
      "T(n) = 5n + 12",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que modifica el elemento que se encuentre en una posicion dada. 
             * post:  Se edito el elemento indicado en la posicion indicada.
             * @param i Una Posicion dentro de la Lista 
             * @param dato es el nuevo valor que toma el elmento en la lista
             */
            public void set(int i, T dato) {
                try {
                        1        1      (5n + 9)
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
             * Metodo que obtiene la cantidad de elementos de la Lista. 
             * post:  Se retorno el numero de elementos existentes en la Lista.
             * @return int con el tamaño de la lista. Si la Lista esta vacía retorna 0
             */
            public int getTamanio() {
                        1
                return (this.tamanio);
            }
        `,
  },
  {
    title: "10. Consultar Existencia de Elementos (esVacia)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1 + 1 + 1", "T(n) = 6"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que permite conocer si en la lista se encuentra elementos. 
             * post:  Se retorno true si la lista no contiene elementos.
             * @return un boolean true si la lista esta vacia, false en caso contrario
             */
            public boolean esVacia() {
                1           1         1        1               1        1
                return (cabeza == cabeza.getSig() || this.getTamanio() == 0);
            }
        `,
  },
  {
    title: "11. Consultar Existencia de un Elemento (esta)",
    operationalCost: [
      "T(n) = 1 + (8n + 10) + 1",
      "T(n) = 1 + 8n + 11",
      "T(n) = 8n + 12",
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
                    1        (8n + 10)              1   
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
             * Metodo que crea para la lista simple un elemento Iterator.
             * post:  Se retorno un Iterator para la Lista.
             * @return Un iterator tipo <T> de la lista.
             */
            @Override
            public Iterator < T > iterator() {
                1           1         
                return new IteratorLCD < T > (this.cabeza) {};
            }
        `,
  },
  {
    title: "13. Obtener Contenido en un Vector (aVector)",
    operationalCost: [
      "T(n) = 7 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + \\sum_{I=0}^{n-1}( 2 + 1 + KTE + 1 + KTE) + 1 + KTE + 1",
      "T(n) = 7 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + n( 2 + 1 + KTE + 1 + KTE ) + 1 + KTE + 1",
      "T(n) = 18 + KTE + n( KTE ) + KTE",
      "T(n) = KTE(n) + KTE",
    ],
    complexity: "Big O = O(N)",
    javaCode: `
            /**
             * Metodo que permite retornar la informacion de una Lista en un Vector. 
             * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
             */
            public Object[] aVector() {
                            7
                if (this.esVacia())
                    //Mejor de los casos
                    return (null);
                    1           1    1               1
                Object vector[] = new Object[this.getTamanio()];
                    1          1         2
                Iterator < T > it = this.iterator();
                1    1
                int i = 0;
                        1+KTE
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
      "T(n) = 7 + 1 + 1 + 1 + 1 + 1 + + 1 + \\sum_{x=0}^{n-1}( 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1",
      "T(n) = 7 + 1 + 1 + 1 + 1 + 1 + + 1 + n( 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1",
      "T(n) = 14 + n( 9 ) + 5",
      "T(n) = 9n + 19",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que permite retornar toda la informacion de los elementos de la Lista Circular Doble en un String. 
             * post:  Retorna la impresion de los datos de la lista Circular Doble en un String. 
             * El String tiene el formato "e1->e2->e3..->en", donde e1, e2, ..., en son los los elementos de la Lista Circular Doble. 
             * @return Un String con los datos de los elementos de la Lista
             */
            @Override
            public String toString() {
                            7
                if (this.esVacia())
                    //Mejor de los casos
                    return ("Lista Vacia");
                1     1
                String r = "";
                        1        1            1               1      1          1     1
                for (NodoD < T > x = this.cabeza.getSig(); x.getInfo() != null; x = x.getSig())
                    2      1         1        1
                    r += x.getInfo().toString() + "<->";
                    1
                return (r);
            }
        `,
  },
  {
    title: "15. Obtener el elemento de una Posición (getPos)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{i>0}^{n-1}( 1 + 1 + 2 + 1 ) + 1 + 1",
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + 1 + n( 1 + 1 + 2 + 1 ) + 1 + 1",
      "T(n) = 7 + n( 5 ) + 2",
      "T(n) = 5n + 9",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo de tipo private, que retorna un nodo con la posicion de este en la
             * lista y ejecuta una exception si sucede un error. 
             * @param i es de tipo integer y contiene la posicion del elemento en la lista. 
             * @return un tipo NodoD<T> con el nodo de la posicion
             */
            @SuppressWarnings("empty-statement")
            private NodoD < T > getPos(int i) throws ExceptionUFPS {
                    1   1    1
                if (i < 0 || i >= this.tamanio) {
                    // Mejor de los casos
                    throw new ExceptionUFPS("El índice solicitado no existe en la Lista Doble");
                } else {
                    1          1           1
                    NodoD < T > t = this.cabeza.getSig();
                            1
                    while (i > 0) {
                        1   1
                        t = t.getSig();
                        2
                        i--;
                    }    
                        1
                    return (t);
                }
            }
        `,
  },
  {
    title: "16 Obtener la Posición de un Elemento (getIndice)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{x=0}^{n-1}( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + n( 1 + 2 + 2 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
      "T(n) = 6 + n( 8 ) + 4",
      "T(n) = 8n + 10",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que busca un elemento de la lista y devuelve su posicion.Los objetos
             * que se almacenan en la lista deben tener el Método equals. 
             * post:  Retorna el Nodo que se encuentra en esa posicion indicada. 
             
            * @param dato de tipo T que indica la informacion del nodo a buscar 
            * @return un entero que representa la posicion del objeto consultado en la lista
            */
            public int getIndice(T dato) {
                1    1
                int i = 0;
                    1           1           1             1                 1      1
                for (NodoD < T > x = this.cabeza.getSig(); x != this.cabeza; x = x.getSig()) {
                            1         2
                    if (x.getInfo().equals(dato))
                        //Mejor de los casos
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
