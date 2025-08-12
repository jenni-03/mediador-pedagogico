export const complexityListaCSimple = [
  {
    title: "1. Constructor (ListaCD)",
    operationalCost: ["T(n) = 1 + 1 + 1", "T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Constructor de la Clase Lista Circular Enlazada, por defecto la cabeza es NULL. 
             * post:  Se construyo una lista vacia.
             */
            public ListaC() {
                            1    1
                this.cabeza = new Nodo < T > (null, null);
                            1
                this.cabeza.setSig(cabeza);
            }
        `,
  },
  {
    title: "2. Insertar Elemento al Inicio (insertarAlInicio)",
    operationalCost: ["T(n) = 1 + 1 + + 1 + 1 + 1 + 2", "T(n) = 7"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que permite insertar un Elemento al Inicio de la Lista. 
             * post:  Se inserto un nuevo elemento al inicio de la Lista.
             * @param dato Informacion que desea almacenar en la Lista. La informacion
             * debe ser un Objeto.
             */
            public void insertarAlInicio(T dato) {
                    1     1    1                           1
                Nodo < T > x = new Nodo < T > (dato, cabeza.getSig());
                        1
                cabeza.setSig(x);
                    2
                this.tamanio++;
            }
        `,
  },
  {
    title: "3. Insertar Elemento al Final (insertarAlFinal)",
    operationalCost: [
      "T(n) = 6 + 1 + 1 +( 5n + 15 ) + 1 + 1 + 1 + 2",
      "T(n) = 8 + 5n + 20",
      "T(n) = 5n + 28",
    ],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Inserta un Elemento al Final de la Lista. 
             * post:  Se inserto un nuevo elemento al final de la Lista.
             * @param x Representa el dato a Insertar al final de la Lista.
             */
            public void insertarAlFinal(T x) {
                        6
                if (this.esVacia())
                    //Mejor de los casos
                    this.insertarAlInicio(x);
                else {
                    try {
                            1          1       (5n + 15)              1
                        Nodo < T > ult = this.getPos(this.tamanio - 1);
                            1         1         
                        ult.setSig(new Nodo < T > (x, this.cabeza));
                            2
                        this.tamanio++;
                    } catch (ExceptionUFPS e) {
                    //Mejor de los casos
                        System.err.println(e.getMensaje());
                    }
                }
            }
        `,
  },
  {
    title: "4. Insertar Elemento Ordenado a la Cabeza (insertarOrdenado)",
    operationalCost: [
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + \\sum_{i=0}^{n-1}( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + n( 1 + 1 + KTE + 1 + 1 + KTE + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1 + 1 + 2",
      "T(n) = 13 + n( KTE ) + 7",
      "T(n) = KTEn + 20",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
 * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. 
 * post:  Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.
 * @param info Información que desea almacenar en la Lista de manera Ordenada.
 */
public void insertarOrdenado(T info) {
              6
    if (this.esVacia())
        //Mejor de los casos
        this.insertarAlInicio(info);
    else {
            1        1
        Nodo < T > x = this.cabeza;
            1        1
        Nodo < T > y = x;
          1     1
        x = x.getSig();
                 1
        while (x != this.cabeza) {
                   1              1       KTE
            Comparable comparador = (Comparable) info;
               1    1           KTE            1
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
            //Mejor de los casos
            this.insertarAlInicio(info);
        else {
               1        1
            y.setSig(new Nodo < T > (info, x));
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
      "T(n) = 1 + 1 + 1 + ( 5n + 15 ) + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1",
      "T(n) = 3 + 5(n) + 26",
      "T(n) = 5n + 29",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que permite eliminar un elemento de la lista dada una posicion. 
             * post:  Se elimino el dato en la posicion indicada de la lista.
             * @param i Posicion del objeto. Debe ir desde 0 hasta el tamaño de la lista menos uno.  
             * @return Retorna el objeto eliminado de la Lista.
             */
            public T eliminar(int i) {
                try {
                        1
                    Nodo < T > x;
                        1
                    if (i == 0) {
                        // Mejor de los casos
                        x = this.cabeza.getSig();
                        this.cabeza.setSig(x.getSig());
                        this.tamanio--;
                        return (x.getInfo());
                    }
                    1      (5n + 15)       1
                    x = this.getPos(i - 1);
                        1
                    if (x == null)
                        //Mejor de los casos
                        return (null);
                    1        1    1
                    Nodo < T > y = x.getSig();
                    1        1
                    x.setSig(y.getSig());
                    2
                    this.tamanio--;
                    1        1
                    return (y.getInfo());
                } catch (ExceptionUFPS ex) {
                    //Mejor de los casos
                    System.err.println(ex.getMensaje());
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
             * Metodo que elimina todos los datos de la Lista Circular. 
             * post:  Elimina todos los datos que contenga la lista circular.
             */
            public void vaciar() {
                            1
                this.cabeza.setSig(cabeza);
                            1
                this.tamanio = 0;
            }
        `,
  },
  {
    title: "7. Obtener Elemento segun la Posicion (get)",
    operationalCost: [
      "T(n) = 1 + 1 (5n + 15) + 1 + 1 + 1",
      "T(n) = 2 + 5n + 18",
      "T(n) = 5n + 20",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Metodo que retorna el Objeto de la posicion i. 
             * post:  Se retorno el elemento indicado por la posicion recibida i.
             * @param i posicion de un elemento de la lista. 
             * @return Devuelve el Objeto de la posicion especificada ,null en caso contrario.
             */
            public T get(int i) {
                try {
                        1       1      (5n + 15)
                    Nodo < T > x = this.getPos(i);
                        1
                    if (x == null)
                        //Mejor de los casos
                        return (null);
                    1          1
                    return (x.getInfo());
                } catch (ExceptionUFPS ex) {
                //Mejor de los casos
                    System.err.println(ex.getMensaje());
                    return (null);
                }
            }
        `,
  },
  {
    title: "8. Modificar Elemento segun la Posición (set)",
    operationalCost: [
      "T(n) = 1 + 1 + ( 5n + 15 ) + 1 + 1",
      "T(n) = 2 + 5n + 17",
      "T(n) = 5n + 19",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Modifica el elemento que se encuentre en una posicion dada. 
             * post:  Se edito la informacion del elemento indicado por la posicion recibida.
             * @param i Una Posici�n dentro de la Lista. 
             * @param dato es el nuevo valor que toma el elmento en la lista
             */
            public void set(int i, T dato) {
                try {
                        1        1     (5n + 15)
                    Nodo < T > t = this.getPos(i);
                        1
                    if (t == null)
                    //Independientemente si es nulo o no solo va a ejucutar la linea y salir, por tanto solo se contara uno de los dos para el T(n)
                        return; // --> si es null 1 
                    t.setInfo(dato); // -- si no es null 1
                } catch (ExceptionUFPS e) {
                    //Mejor de los casos
                    System.err.println(e.getMensaje());
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
             * Metodo que devuelve el tamaño de la lista. 
             * post:  Se retorno el numero de elementos existentes en la Lista.
             * @return un int con el tamaño de la lista
             */
            public int getTamanio() { 
                1
                return (this.tamanio);
            }
        `,
  },
  {
    title: "10. Consultar Existencia de Elementos (esVacia)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1 + 1", "T(n) = 6"],
    complexity: "Big O = O(1)",
    javaCode: `
            /**
             * Metodo que retorna true si la lista esta vacia, false en caso contrario. 
             * post:  Se retorno true si la lista se encuentra vacia, false si tiene elementos.
             * @return un boolean con true o false en caso de que la lista se encuentre vacia.
             */
            public boolean esVacia() {
                1            1        1         1                1  
                return (cabeza == cabeza.getSig() || this.tamanio == 0);
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
                return new IteratorLC < T > (this.cabeza) {};
            }
        `,
  },
  {
    title: "13. Obtener Contenido en un Vector (aVector)",
    operationalCost: [
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + \\sum_{I=0}^{n-1}( 2 + 1 + KTE + 1 + KTE) + 1 + KTE + 1",
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + 1 + 1 + KTE + n( 2 + 1 + KTE + 1 + KTE ) + 1 + KTE + 1",
      "T(n) = 17 + KTE + n( KTE ) + KTE",
      "T(n) = KTE(n) + KTE",
    ],
    complexity: "Big O = O(N)",
    javaCode: `
            /**
             * Metodo que permite retornar la informacion de una Lista en un Vector. 
             * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
             */
            public Object[] aVector() {
                        6
                if (this.esVacia())
                    //Mejor de los casos
                    return (null);
                    1           1       1               1
                Object vector[] = new Object[this.getTamanio()];
                    1             1         2
                Iterator < T > it = this.iterator();
                1   1
                int i = 0;
                        1 + KTE
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
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + + 1 + \\sum_{x=0}^{n-1}( 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
      "T(n) = 6 + 1 + 1 + 1 + 1 + 1 + + 1 + n( 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 ) + 1 + 1 + 1 + 1",
      "T(n) = 13 + n( 9 ) + 4",
      "T(n) = 9n + 17",
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
                        6
                if (this.esVacia())
                    //MEjor de los casos
                    return ("Lista Vacia");
                    1    1
                String r = "";
                        1        1            1              1        1         1     1
                for (Nodo < T > x = this.cabeza.getSig(); x.getInfo() != null; x = x.getSig())
                    2       1          1      1
                    r += x.getInfo().toString() + "->";
                    1
                return (r);
            }
        `,
  },
  {
    title: "15. Obtener el elemento de una Posición (getPos)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + \\sum_{i>0}^{n-1}( 1 + 1 + 2 + 1 ) + 1 + 1 + 2 + 1 ",
      "T(n) = 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1 + n( 1 + 1 + 2 + 1 ) + 1 + 1 + 2 + 1 ",
      "T(n) = 9 + n( 5 ) + 6",
      "T(n) = 5n + 15",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
            /**
             * Elemento privado de la clase que devuelve al elemento en la posicion. 
             * post:  Se retorno el Nodo que se encuentra en esa posicion indicada. 
             
            * @param i es de tipo integer y contiene la posicion del elemento en la lista. 
            * @return un tipo NodoD<T> con el nodo de la posicion.
            */
            @SuppressWarnings("empty-statement")
            private Nodo < T > getPos(int i) throws ExceptionUFPS {
                    1   1    1      
                if (i < 0 || i >= this.tamanio) {
                    //Mejor de los casos
                    System.err.println("Error indice no valido en una Lista Circular!");
                    return (null);
                }
                    1       1        1
                Nodo < T > x = cabeza.getSig();
                        2  1      1     1
                for (; i-- > 0; x = x.getSig());
                    1
                return x;
                // en algun punto i llega a valer n, entonces i = n 
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
             * Obtiene la posición de un objeto en la Lista. 
             * post:  Se retorno la posicion en la que se encuentra el dato buscado. 
             * @param dato Representa el datoa a encontrar dentro de la Lista. 
             * @return un int con la posición del elemento,-1 si el elemento no se encuentra en la Lista.
             */
            public int getIndice(T dato) {
                1   1
                int i = 0;
                        1        1            1            1                 1      1
                for (Nodo < T > x = this.cabeza.getSig(); x != this.cabeza; x = x.getSig()) {
                        1          1
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
