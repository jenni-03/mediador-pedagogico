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
             * Constructor con parametros de la clase secuencia. 
             * post:  Se construye una Secuencia vacia. 
             * @param n es de tipo integer que contiene el tamaño en capacidad de la Secuencia. 
             */
            public Secuencia(int n) {
                    1
                if (n <= 0) {
                    //Mejor de los casos
                    System.err.println("Tamaño de secuencia no valido!");
                    return;
                }
                //Peor de los casos
                        1  1  1
                Object r[] = new Object[n];
                    1
                cant = 0;
                            1   1
                this.vector = (T[]) r;
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
             * Metodo que inserta un nuevo elemento a la secuencia. 
             * post: Se inserto un elemento en la Secuencia.
             * @param elem es de tipo T que contiene el elemento a insertar
             */
            public void insertar(T elem) {
                            1
                if (this.cant >= this.vector.length) 
                    //Mejor de los casos
                    System.err.println("No hay más espacio!");
                else
                    //Peor de los casos
                                    2        1
                    this.vector[this.cant++] = elem;
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
             * Metodo que elimina un elemento a la secuencia.
             * post: Se elimino un elemento en la Secuencia.
             * @param elem es de tipo T que contiene el elemento a eliminar
             */
            public void eliminar(T elem) {
                    1     1
                boolean e = false;
                    2    1      1      1             2    
                for (int i = 0, j = 0; i &lt; this.cant; i++) {
                    //Peor de los casos
                        1                 2
                    if (!this.vector[i].equals(elem)) {
                                    1
                        this.vector[j] = vector[i];
                        2
                        j++;
                    } else {
                        //Mejor de los casos
                        1
                        e = true;
                                    1
                        this.vector[j] = null;
                    }
                }
                    1
                if (e)
                        2
                    this.cant--;
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
             * Metodo que elimina un elemento a la secuencia dada su posicion.
             * post: Se elimino un elemento en la Secuencia.
             * @param pos es de tipo int que contiene la posicion del elemento a eliminar
             */
            public void eliminarP(int pos) {
                        1    1     1
                if (pos &lt; 0 || pos &gt; this.cant) {
                    //Mejor de los casos
                    System.err.println("Indíce fuera de rango!");
                    return;
                }
                //Peor de los casos
                1      1
                boolean e = false;
                    2    1      1      1             2 
                for (int i = 0, j = 0; i &lt; this.cant; i++) {
                        1
                    if (i != pos) {
                        //Peor de los casos
                                    1
                        this.vector[j] = vector[i];
                        2
                        j++;
                    } else {
                        //Mejor de los casos
                        1
                        e = true;
                                    1
                        this.vector[j] = null;
                    }
                }
                    1
                if (e)
                        2
                    this.cant--;
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
             * Metodo que vacia la secuencia. 
             * post: La Secuencia se encuentra vacia.
             */
            public void vaciar() {
                //Peor de los casos
                    1    1      1             2
                for (int i = 0; i &lt; this.cant; i++)
                                1
                    this.vector[i] = null;
                        1
                this.cant = 0;
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
             * Metodo que retorna un objeto tipo T de la secuencia dada la posición.
             * post: Se ha retornado un elemento de la Secuencia dada su posición.
             * @param i es de tipo integer y contiene la posicion en la secuencia. 
             * @return un tipo T que contiene el elemento del nodo en la posicion indicada.
             */
            public T get(int i) {
                    1    1   1
                if (i < 0 || i > this.cant) {
                    //Mejor de los casos
                    System.err.println("Indíce fuera de rango!");
                    return (null);
                } else
                    //Peor de los casos
                    1
                    return (this.vector[i]);
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
             * Metodo que cambia un elemento de la secuencia en la posición indicada , por otro. <br>
             * <b>post:</b> Se ha modificado un elemento de la Secuencia.<br>
             * @param i de tipo integer que contiene la posicion de la secuencia que se va ha cambiar.<br>
             * @param nuevo Representa el nuevo objeto que reemplazara al objeto editado. <br>
             */

            public void set(int i, T nuevo) {
                    1    1   1
                if (i &lt; 0 || i &gt; this.cant) {
                    //Mejor de los casos
                    System.err.println("Indíce fuera de rango!");
                    return;
                }
                //Peor de los casos
                        1
                if (nuevo == null) {
                    //Mejor de los casos
                    System.err.println("No se pueden ingresar datos nulos!");
                    return;
                }
                //Peor de los casos
                            1
                this.vector[i] = nuevo;
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
             * Metodo que recibe un un elemento y comprueba si existe en la secuencia. <br>
             * <b>post:</b> Se ha retornado true si el elemento se encuentra en la Secuencia.<br>
             * @param elem es de tipo T y contiene el elemnto que se va ha buscar. <br>
             * @return un tipo boolean, retorna true si el objeto existe y false en caso contrario.
             */
            public boolean esta(T elem) {
                //Peor de los casos
                    1   1      1             2
                for (int i = 0; i < this.cant; i++)
                                        2
                    if (this.vector[i].equals(elem))
                        //Mejor de los casos
                        return true;
                //Mejor de los casos
                    1
                return false;
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
             * Metodo que permite conocer el indice de un Elemento dentro de la Secuencia. <br>
             * <b>post:</b> Se ha retornado el indice del elemento dentro de la Secuencia. <br>
             * @param elem Representa el elemento al cual se le quiere determinar el indice en la Secuencia. <br>
             * @return Un objeto de tipo (int) con la posicion del elemento dentro de la Secuencia.
             */
            public int getIndice(T elem) {
                //Peor de los casos
                    1   1      1             2
                for (int i = 0; i < this.cant; i++)
                                        2
                    if (this.vector[i].equals(elem))
                        //Mejor de los casos
                        return (i);
                //Mejor de los casos
                    1
                return (-1);
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
             * Metodo que retorna el tamaño lógico de la secuencia, esto es el numero de datos almacenados. <br>
             * <b>post:</b> Se ha retornado el numero de elementos dentro de la secuencia.<br>
             * @return un tipo integer que contiene el tamaño lógico de la secuencia
             */
            public int getTamanio() {
                    1
                return this.cant;
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
             * Metodo que permite conocer si la Secuencia esta vacia. <br>
             * <b>post:</b> Se ha retornado true o false dependiendo si la Secuencia esta vacia.<br>
             * @return de tipo boolean true indica que la Secuencia esta vacia.
             */
            public boolean esVacia() {
                    1            1
                return (this.cant == 0);
            }
        `
    },
];