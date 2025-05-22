export const operationsCode: Record<string, any> = {
    secuencia: {
        create: [
            `/**
 * Constructor con parametros de la clase secuencia. <br>
 * <b>post: </b> Se construye una Secuencia vacia. <br>
 * @param n es de tipo integer que contiene el tamaño en capacidad de la Secuencia. <br>
 */`,
            `public Secuencia(int n){`,
            `    if (n<=0){`,
            `        System.err.println("Tamaño de secuencia no valido!");`,
            `        return;`,
            `    }    `,
            `    Object r[]=new Object[n];`,
            `    cant=0;`,
            `    this.vector=(T[])r;`,
            `}`
        ],
        insertLast: [
            `/**
 * Metodo que inserta un nuevo elemento a la secuencia. <br>
 * <b>post: </b> Se inserto un elemento en la Secuencia.<br>
 * @param elem es de tipo T que contiene el elemento a insertar
 */`,
            `public void insertar(T elem){        `,
            `    if(this.cant>=this.vector.length)`,
            `        System.err.println("No hay más espacio!");`,
            `    else`,
            `        this.vector[this.cant++]=elem;`,
            `}`
        ],
        set: [
            `/**
 * Metodo que cambia un elemento de la secuencia en la posición indicada , por otro. <br>
 * <b>post:</b> Se ha modificado un elemento de la Secuencia.<br>
 * @param i de tipo integer que contiene la posicion de la secuencia que se va ha cambiar.<br>
 * @param nuevo Representa el nuevo objeto que reemplazara al objeto editado. <br>
 */`,
            `public void set(int i, T nuevo){        `,
            `    if (i<0 || i>this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return;`,
            `    }`,
            `    if(nuevo==null){`,
            `        System.err.println("No se pueden ingresar datos nulos!");`,
            `        return;`,
            `    }`,
            `    this.vector[i]=nuevo;`,
            `}`
        ],
        delete: [
            `/**
 * Metodo que elimina un elemento a la secuencia dada su posicion. <br>
 * <b>post: </b> Se elimino un elemento en la Secuencia.<br>
 * @param pos es de tipo int que contiene la posicion del elemento a eliminar
 */`,
            `public void eliminarP(int pos){        `,
            `    if (pos<0 || pos>this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return;`,
            `    }`,
            `    boolean e = false;`,
            `    for( int i=0, j=0; i < this.cant; i++ ){`,
            `        if(i!=pos){`,
            `            this.vector[j]=vector[i];`,
            `            j++;`,
            `        }else{`,
            `            e=true;`,
            `            this.vector[j]=null;`,
            `        }`,
            `    }`,
            `    if(e)`,
            `        this.cant--;`,
            `}`
        ],
        get: [
            `/**
 * Metodo que retorna un objeto tipo T de la secuencia dada la posición. <br>
 * <b>post:</b> Se ha retornado un elemento de la Secuencia dada su posicion<br>
 * @param i es de tipo integer y contiene la posicion en la secuencia. <br>
 * @return un tipo T que contiene el elemento del nodo en la posicion indicada <br>
 */`,
            `public T get(int i){        `,
            `    if (i<0 || i>this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return (null);`,
            `    }`,
            `    else`,
            `        return (this.vector[i]);`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que vacia la secuencia. <br>
 * <b>post:</b> La Secuencia se encuentra vacia.
 */`,
            `public void vaciar(){`,
            `    for( int i = 0; i < this.cant; i++ )`,
            `        this.vector[i] = null;`,
            `    this.cant = 0;`,
            `}`
        ]
    },
    pila: {
        push: [
            `/**
 * Metodo que inserta un elemento en la Pila. <br>
 * <b>post: </b> Se inserto un elemento dentro de la Pila.<br>
 * @param info es de tipo T y contiene la información a insertar en la pila.
 */`,
            `public void apilar(T info){`,
            `    if(this.esVacia())`,
            `        this.tope = new Nodo<T>(info, null);`,
            `    else`,
            `        this.tope=new Nodo<T>(info, this.tope);`,
            `    this.tamanio++;`,
            `}`
        ],
        pop: [
            `/**
 * Metodo que retira y devuelve un elemneto de la Pila. <br>
 * <b>post: </b> Se retiro y elimino el elemento tope de la Pila.<br>
 * @return un tipo T y contiene la información retirada de la pila.<br>
 */`,
            `public T desapilar(){`,
            `    if(this.esVacia())`,
            `        return (null);`,
            `    Nodo<T> x=this.tope;`,
            `    this.tope = tope.getSig();`,
            `    this.tamanio--;`,
            `    if(tamanio==0)`,
            `        this.tope=null;`,
            `    return(x.getInfo());`,
            `}`
        ],
        getTop: [
            `/**
 * Metodo devuelve el elemento que se encuentra en el tope de la Pila. <br>
 * <b>post: </b> Se retorno el elemento tope de la Pila.<br>
 * @return El elemento que esta en el tope de la Pila.
 */`,
            `public T getTope(){`,
            `    return (this.tope.getInfo());`,
            `}`
        ],
        clean: [
            `/**
 * Elimina todos los datos de la Pila. <br>
 * <b>post: </b> Se elimino todos los datos que se encontraban en la Pila.<br>
 */`,
            `public void vaciar(){`,
            `    this.tope = null;`,
            `    this.tamanio=0;`,
            `}`
        ]
    },
    cola: {
        enqueue: [
            `/**
 * Metodo que permite agregar un elemento a la Cola. <br>
 * <b>post: </b> Se inserto un nuevo elemento a la Cola.<br>
 * @param info es de tipo T y contiene la informacion a en colar
 */`,
            `public void enColar(T info){`,
            `    NodoD<T>x=new NodoD<T>(info,inicio,inicio.getAnt());`,
            `    inicio.getAnt().setSig(x);`,
            `    inicio.setAnt(x);`,
            `    this.aumentarTamanio();`,
            `}`
        ],
        dequeue: [
            `/**
 * Metodo que permite retirar el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se elimina el primer elemento que fue insertado en la cola.<br>
 * @return un tipo T que contiene la informacion del nodo retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return (null);`,
            `    NodoD<T> x=this.inicio.getSig();`,
            `    this.inicio.setSig(x.getSig());`,
            `    x.getSig().setAnt(inicio);`,
            `    x.setSig(null);`,
            `    x.setAnt(null);`,
            `    this.tamanio--;`,
            `    return(x.getInfo());`,
            `}`
        ],
        getFront: [
            `/**
 * Metodo que permite conocer el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se obtiene el primer elemento que fue insertado en la Cola.<br>
 * @return El primer elemento que fue insertado en la cola
 */`,
            `protected NodoD<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que permite elimar todos los datos que contiene la Cola. <br>
 * <b>post: </b> Se elimino todos los datos que se encontraban en la Cola.<br>
 */`,
            `public void vaciar(){`,
            `    this.inicio.setSig(this.inicio);`,
            `    this.inicio.setAnt(this.inicio);`,
            `    this.tamanio=0;`,
            `}`
        ]
    },
    "cola de prioridad": {
        enqueue: [
            `/**
 * Metodo que permite agregar un elemento a la Cola. <br>
 * <b>post: </b> Se inserto un nuevo elemento a la Cola.<br>
 * @param info es de tipo T y contiene la informacion a en colar. <br>
 * @param p es de tipo entero y representa la prioridad del elemento. 
 */`,
            `public void enColar(T info, int p){`,
            `    NodoP<T> nuevo=new NodoP<T>(info,null,null,p);`,
            `    if(this.esVacia()){`,
            `        NodoP<T> x = new NodoP<T>(info,(NodoP<T>)super.getInicio(),(NodoP<T>)super.getInicio().getAnt(),p);`,
            `        ((NodoP<T>)super.getInicio()).getAnt().setSig(x);`,
            `        ((NodoP<T>)super.getInicio()).setAnt(x);`,
            `        this.aumentarTamanio();`,
            `    }`,
            `    else{`,
            `        if(((NodoP<T>)super.getInicio().getSig()).getPrioridad()<nuevo.getPrioridad()){`,
            `            //Inserta al inicio`,
            `            nuevo.setSig(((NodoP<T>)super.getInicio()).getSig());`,
            `            ((NodoP<T>)super.getInicio()).getSig().setAnt(nuevo);`,
            `            ((NodoP<T>)super.getInicio()).setSig(nuevo);`,
            `            nuevo.setAnt(((NodoP<T>)super.getInicio()));`,
            `            super.aumentarTamanio();`,
            `        }else{`,
            `            //NodoP iterado`,
            `            NodoP<T> c = ((NodoP<T>)super.getInicio()).getSig();`,
            `            boolean ins = false;`,
            `            while(c!=((NodoP<T>)super.getInicio()) && !ins){`,
            `                if(c.getSig()!=((NodoP<T>)super.getInicio()) && c.getSig().getPrioridad()<nuevo.getPrioridad()){`,
            `                    nuevo.setSig(c.getSig());`,
            `                    c.getSig().setAnt(nuevo);`,
            `                    c.setSig(nuevo);`,
            `                    nuevo.setAnt(c);`,
            `                    super.aumentarTamanio();`,
            `                    ins = true;`,
            `                }else{`,
            `                c = c.getSig();`,
            `                }`,
            `            }`,
            `            //Si no inserto, es porque tiene la menor prioridad`,
            `            if(c == ((NodoP<T>)super.getInicio())){`,
            `                NodoP<T> x = new NodoP<T>(info,(NodoP<T>)super.getInicio(),(NodoP<T>)super.getInicio().getAnt(),p);`,
            `                ((NodoP<T>)super.getInicio()).getAnt().setSig(x);`,
            `                ((NodoP<T>)super.getInicio()).setAnt(x);`,
            `                this.aumentarTamanio();`,
            `            }`,
            `        }`,
            `    }`,
            `}`
        ],
        dequeue: [
            `/**
 * Metodo que permite retirar el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se elimina el primer elemento que fue insertado en la cola.<br>
 * @return un tipo T que contiene la informacion del nodo retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return (null);`,
            `    NodoD<T> x=this.inicio.getSig();`,
            `    this.inicio.setSig(x.getSig());`,
            `    x.getSig().setAnt(inicio);`,
            `    x.setSig(null);`,
            `    x.setAnt(null);`,
            `    this.tamanio--;`,
            `    return(x.getInfo());`,
            `}`
        ],
        getFront: [
            `/**
 * Metodo que permite conocer el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se obtiene el primer elemento que fue insertado en la Cola.<br>
 * @return El primer elemento que fue insertado en la cola
 */`,
            `protected NodoD<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que permite elimar todos los datos que contiene la Cola. <br>
 * <b>post: </b> Se elimino todos los datos que se encontraban en la Cola.<br>
 */`,
            `public void vaciar(){`,
            `    this.inicio.setSig(this.inicio);`,
            `    this.inicio.setAnt(this.inicio);`,
            `    this.tamanio=0;`,
            `}`
        ]
    },
    lista_simple: {
        create: [
            `/**
 * Constructor de la Clase Lista Simple Enlazada, por defecto la cabeza es NULL. <br>
 * <b>post: </b> Se construyo una lista vacia.
 */`,
            `public ListaS(){`,
            `    this.cabeza=null;`,
            `    this.tamanio=0;`,
            `}`,
            ``,
            `public ListaS(int cantidad) {`,
            `    this();`,
            `    for (int i = 0; i < cantidad; i++) {`,
            `        this.insertarAlFinal(0); // O null, o algún valor predeterminado`,
            `    }`,
            `}`
        ],
        insertFirst: [
            `/**
 * Metodo que inserta un Elemento al Inicio de la Lista. <br>
 * <b>post: </b> Se inserto un nuevo elemento al inicio de la Lista.<br>
 * @param x Informacion que desea almacenar en la Lista. La informacion debe ser un Objeto.
 */`,
            `public void insertarAlInicio(T x){`,
            `    this.cabeza=new Nodo<T>(x, this.cabeza);`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Metodo que inserta un Elemento al Final de la Lista. <br>
 * <b>post: </b> Se inserto un nuevo elemento al final de la Lista.<br>
 * @param x Información que desea almacenar en la Lista. 
 */`,
            `public void insertarAlFinal(T x){`,
            `    if(this.cabeza==null)`,
            `        this.insertarAlInicio(x);`,
            `    else {`,
            `        try {`,
            `            Nodo<T> ult=this.getPos(this.tamanio-1);`,
            `            if(ult==null)`,
            `                return;`,
            `            ult.setSig(new Nodo<T>(x, null));`,
            `            this.tamanio++;`,
            `        }catch(ExceptionUFPS e) {`,
            `            System.err.println(e.getMensaje());`,
            `        }`,
            `    }`,
            `}`
        ],
        insertSorted: [
            `/**
 * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. <br>
 * <b>post: </b> Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.<br>
 * @param info Información que desea almacenar en la Lista de manera Ordenada.
 */`,
            `public void insertarOrdenado(T info){`,
            `    if (this.esVacia())`,
            `        this.insertarAlInicio(info);`,
            `    else{`,
            `        Nodo<T> x=this.cabeza;`,
            `        Nodo<T> y=x;`,
            `            while(x!=null){`,
            `                Comparable comparador=(Comparable)info;`,
            `                int rta=comparador.compareTo(x.getInfo());`,
            `                if(rta<0)`,
            `                    break;`,
            `                y=x;`,
            `                x=x.getSig();`,
            `            }`,
            `        if(x==y)`,
            `            this.insertarAlInicio(info);`,
            `        else{`,
            `            y.setSig(new Nodo<T>(info, x));`,
            `            this.tamanio++;`,
            `            }`,
            `        }`,
            `}`
        ],
        delete: [
            `/**
 * Metodo que elimina un elemento dada una posición. <br>
 * <b>post: </b> Se elimino el dato en la posicion de la lista indicada.<br>
 * @param i Una posición en la Lista <br>
 * @return El elemento que elimino. Si la posición no es válida retorna NULL.
 */`,
            `public T eliminar(int i) {`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    Nodo<T> t=this.cabeza;`,
            `    if(i==0)`,
            `        this.cabeza=this.cabeza.getSig();`,
            `    else{`,
            `        try {`,
            `            Nodo<T> y=this.getPos(i-1);`,
            `            t=y.getSig();`,
            `            y.setSig(t.getSig());`,
            `        }catch(ExceptionUFPS e){`,
            `                System.err.println(e.getMensaje());`,
            `                return (null);`,
            `        }`,
            `    }`,
            `    t.setSig(null);`,
            `    this.tamanio--;`,
            `    return(t.getInfo());`,
            `}`
        ],
        get: [
            `/**
 * Metodo que retorna el elemento que se encuentre en una posicion dada. <br>
 * <b>post: </b> Se retorno el elemento indicado por la posicion recibida.<br>
 * @param i Una Posición dentro de la Lista. <br>
 * @return El objeto que se encuentra en esa posición. El objeto <br>
 * retorna su valor parametrizada "T". Si la posición no se <br>
 * encuentra en la Lista retorna null.
 */`,
            `public T get(int i) {`,
            `    try {`,
            `        Nodo<T> t=this.getPos(i);`,
            `        return (t.getInfo());`,
            `    }catch(ExceptionUFPS e) {`,
            `        System.err.println(e.getMensaje());`,
            `        return (null);`,
            `    }`,
            `}`,
        ],
        set: [
            `/**
 * Metodo que edita el elemento que se encuentre en una posición dada. <br>
 * <b>post: </b> Se edito la informacion del elemento indicado por la posicion recibida.<br>
 * @param i Una Posición dentro de la Lista. <br>
 * @param dato es el nuevo valor que toma el elmento en la lista
 */`,
            `public void set(int i, T dato){`,
            `    try{`,
            `        Nodo<T> t=this.getPos(i);`,
            `         t.setInfo(dato);`,
            `    }catch(ExceptionUFPS e){`,
            `        System.err.println(e.getMensaje());`,
            `    }`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que elimina todos los datos de la Lista Simple. <br>
 * <b>post:</b> La Lista Simple se encuentra vacia.
 */`,
            `public void vaciar(){`,
            `    this.cabeza=null;`,
            `    this.tamanio=0;`,
            `}`
        ],
        traverse: [
            `/**
 * Metodo que permite retornar la informacion de una Lista en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVector(){`,
            `     if(this.esVacia())`,
            `            return (null);`,
            `    Object vector[]=new Object[this.getTamanio()];`,
            `    Iterator<T> it=this.iterator();`,
            `    int i=0;`,
            `    while(it.hasNext())`,
            `        vector[i++]=it.next();`,
            `    return(vector);`,
            `}`
        ]
    },
    lista_doble: {
        create: [
            `/**
 * Constructor de la Clase Lista Doble Enlazada, por defecto la cabeza es NULL. <br>
 * <b>post: </b> Se construyo una lista doble vacia.
 */`,
            `public ListaD(){`,
            `    this.cabeza=null;`,
            `    this.tamanio=0;`,
            `}`,
            ``,
            `public ListaD(int cantidad) {`,
            `    this();`,
            `    for (int i = 0; i < cantidad; i++) {`,
            `        this.insertarAlFinal(0); // O null, o algún valor predeterminado`,
            `    }`,
            `}`
        ],
        insertFirst: [
            `/**
 * Adiciona un Elemento al Inicio de la Lista doble. <br>
 * <b>post: </b> Se inserto un nuevo elemento al inicio de la Lista Doble.<br>
 * @param x Informacion que desea almacenar en la Lista doble. La informacion debe ser un Objeto.
 */`,
            `public void insertarAlInicio(T x){`,
            `    if (this.cabeza==null)`,
            `        this.cabeza=new NodoD<T>(x,null,null);`,
            `    else{`,
            `        this.cabeza=new NodoD<T>(x, this.cabeza, null);`,
            `        this.cabeza.getSig().setAnt(this.cabeza);`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Inserta un Elemento al Final de la Lista. <br>
 * <b>post: </b> Se inserto un nuevo elemento al final de la Lista Doble.<br>
 * @param x Informacion que desea almacenar en la Lista. La informacion debe ser un Objecto. <br>
 */`,
            `public void insertarAlFinal(T x){`,
            `    if(this.cabeza==null)`,
            `        this.insertarAlInicio(x);`,
            `    else{`,
            `        NodoD<T> ult;`,
            `        try {`,
            `            ult = this.getPos(this.tamanio - 1);`,
            `            if(ult==null)`,
            `                return;`,
            `            ult.setSig(new NodoD<T>(x, null, ult));`,
            `            this.tamanio++;`,
            `        } catch (ExceptionUFPS ex) {`,
            `           System.err.println(ex.getMessage());`,
            `        }`,
            `    }`,
            `}`
        ],
        insertSorted: [
            `/**
 * Metodo que inserta un Elemento  de manera Ordenada desde la cabeza de la Lista. <br>
 * <b>post: </b> Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.<br>
 * @param info Información que desea almacenar en la Lista de manera Ordenada.
 */`,
            `public void insertarOrdenado(T info){`,
            `    Comparable x=(Comparable)(info);`,
            `    if(this.esVacia()|| x.compareTo(this.cabeza.getInfo())<=0){`,
            `        this.insertarAlInicio(info);`,
            `        return;`,
            `    }`,
            `    NodoD<T> nuevo=new NodoD<T>(info, null, null);`,
            `    NodoD<T> p=this.cabeza;`,
            `    `,
            `    for(;(p!=null && x.compareTo(p.getInfo())>=0); p=p.getSig()){}`,
            `    if(p==null)`,
            `        this.insertarAlFinal(info);`,
            `    else{`,
            `        nuevo.setAnt(p.getAnt());`,
            `        nuevo.setSig(p);`,
            `        p.setAnt(nuevo);`,
            `        nuevo.getAnt().setSig(nuevo);`,
            `        this.tamanio++;`,
            `    }`,
            `}`
        ],
        delete: [
            `/**
 * Metodo que remueve un elemento de la lista con la posicion de esta en la lista. <br>
 * <b>post: </b> Se elimina un elemento de la Lista dada una posicion determinada.<br>
 * @param i es de tipo integer que contiene la posicion del elemento en la lista
 * @return De tipo T que contiene el elemento removido de la lista
 */`,
            `public T eliminar(int i){`,
            `   try {`,
            `        NodoD<T> x;`,
            `        x = this.getPos(i);`,
            `        if(x==this.cabeza){`,
            `            //Mover el Nodo cabeza`,
            `            this.cabeza=this.cabeza.getSig();`,
            `            //Referencias de Nodo x a null`,
            `    }`,
            `    else {`,
            `        x.getAnt().setSig(x.getSig());`,
            `        if(x.getSig()!=null)//Si no es el ultimo nodo`,
            `            x.getSig().setAnt(x.getAnt());`,
            `        }`,
            `    //Libero Nodo x`,
            `    x.setAnt(null);`,
            `    x.setSig(null);`,
            `    this.tamanio--;`,
            `    return(x.getInfo());`,
            `    }catch (ExceptionUFPS ex) {`,
            `        System.err.println(ex.getMessage());`,
            `    }`,
            `    return(null);`,
            `}`
        ],
        get: [
            `/**
 * Metodo que permite obtener el contenido de un nodo en la lista doble. <br>
 * <b>post: </b> Se obtiene un elemento de la lista dada una posicion determinada.<br>
 * @param i es de tipo integer y contiene la posicion del nodo en la lista doble. <br>
 * @return de tipo T que contiene la informacion en el nodo de la lista doble
 */`,
            `public T get(int i)	{`,
            `    NodoD<T> t;`,
            `    try {`,
            `        t = this.getPos(i);`,
            `        return (t.getInfo());`,
            `    } catch (ExceptionUFPS ex) {`,
            `         System.err.println(ex.getMessage());`,
            `    }`,
            `    return (null);`,
            `}`
        ],
        set: [
            `/**
 * Metodo que permite modificar el elemento que se encuentre en una posicion dada. <br>
 * <b>post: </b> Se edita la informacion de un elemento de la lista dada un pasicion determinada.<br>
 * @param i Una Posicion dentro de la Lista doble
 * @param dato es el nuevo valor que toma el elmento en la lista doble
 */`,
            `public void set(int i, T dato){`,
            `    try{`,
            `        NodoD<T> t=this.getPos(i);`,
            `         t.setInfo(dato);`,
            `     }catch(ExceptionUFPS e){`,
            `         System.err.println(e.getMessage());`,
            `     }`,
            `}`
        ],
        clean: [
            `/**
 * Elimina todos los datos de la Lista Doble. <br>
 * <b>post: </b> Se elimino todos los datos que encontraban en la lista doble.<br>
 */`,
            `public void vaciar(){`,
            `    this.cabeza = null;`,
            `    this.tamanio=0;`,
            `}`
        ],
        traverseForward: [
            `/**
 * Metodo que permite retornar la informacion de una Lista en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVector(){`,
            `    if(this.esVacia())`,
            `            return (null);`,
            `    Object vector[]=new Object[this.getTamanio()];`,
            `    Iterator<T> it=this.iterator();`,
            `    int i=0;`,
            `    while(it.hasNext())`,
            `        vector[i++]=it.next();`,
            `    return(vector);`,
            `}`
        ],
        traverseBackward: [
            `/**
 * Metodo que permite retornar la informacion de una Lista de atrás hacia adelante en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVectorReverso() {`,
            `    Object[] resultado = new int[tamanio];`,
            `    Nodo actual = cola;`,
            `    int i = 0;`,
            `    while (actual != null) {`,
            `        resultado[i++] = actual.dato;`,
            `        actual = actual.anterior;`,
            `    }`,
            `    return resultado;`,
            `}`
        ]
    },
    lista_circular: {
        create: [
            `/**
 * Constructor de la Clase Lista Circular Enlazada, por defecto la cabeza es NULL. <br>
 * <b>post:</b> Se construyo una lista vacia.<br>
 */`,
            `public ListaC() {`,
            `    this.cabeza=new Nodo (null,null);`,
            `    this.cabeza.setSig(cabeza);     `,
            `}`
        ],
        insertFirst: [
            `/**
 * Metodo que permite insertar un Elemento al Inicio de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento al inicio de la Lista.<br>
 * @param dato Informacion que desea almacenar en la Lista. La informacion
 * debe ser un Objeto.
 */`,
            `public void insertarAlInicio(T dato){        `,
            `    Nodo x=new Nodo(dato, cabeza.getSig());`,
            `    cabeza.setSig(x);`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Inserta un Elemento al Final de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento al final de la Lista.<br>
 * @param x Representa el dato a Insertar al final de la Lista.
 */`,
            `public void insertarAlFinal(T x){`,
            `    if(this.esVacia())`,
            `        this.insertarAlInicio(x);`,
            `    else {            `,
            `        try {                `,
            `                Nodo ult=this.getPos(this.tamanio-1);`,
            `                ult.setSig(new Nodo(x, this.cabeza));`,
            `                this.tamanio++;                `,
            `            }catch(ExceptionUFPS e){                `,
            `                System.err.println(e.getMensaje());                `,
            `            }            `,
            `        }`,
            `}`
        ],
        insertSorted: [
            `/**
 * Metodo que inserta un Elemento de manera Ordenada desde la cabeza de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.<br>
 * @param info Información que desea almacenar en la Lista de manera Ordenada.
 */`,
            `public void insertarOrdenado(T info){`,
            `    if (this.esVacia())`,
            `        this.insertarAlInicio(info);`,
            `    else{`,
            `        Nodo x=this.cabeza;`,
            `        Nodo y=x;`,
            `        x = x.getSig();`,
            `        while(x!=this.cabeza){`,
            `            Comparable comparador=(Comparable)info;`,
            `            int rta=comparador.compareTo(x.getInfo());`,
            `            if(rta<0)`,
            `                break;`,
            `            y=x;`,
            `            x=x.getSig();`,
            `        }`,
            `        if(x==cabeza.getSig())`,
            `            this.insertarAlInicio(info);`,
            `        else{`,
            `            y.setSig(new Nodo(info, x));`,
            `            this.tamanio++;`,
            `            }`,
            `        }`,
            `}`
        ],
        delete: [
            `/**
 * Metodo que permite eliminar un elemento de la lista dada una posicion. <br>
 * <b>post:</b> Se elimino el dato en la posicion indicada de la lista.<br>
 * @param i Posicion del objeto. Debe ir desde 0 hasta el tamaño de la lista menos uno.<br>  
 * @return Retorna el objeto eliminado de la Lista.
 */`,
            `public T eliminar(int i){`,
            `    try{`,
            `        Nodo x;`,
            `        if(i==0){`,
            `            x = this.cabeza.getSig();`,
            `            this.cabeza.setSig(x.getSig());`,
            `            this.tamanio--;`,
            `            return (x.getInfo());`,
            `        }`,
            `        x=this.getPos(i-1);`,
            `        if(x==null)`,
            `            return (null);`,
            `        Nodo y = x.getSig();`,
            `        x.setSig(y.getSig());`,
            `        this.tamanio--;`,
            `        return(y.getInfo());`,
            `       }catch(ExceptionUFPS ex) {`,
            `            System.err.println(ex.getMensaje());`,
            `        }`,
            `    return(null);`,
            `}`
        ],
        get: [
            `/**
 * Metodo que retorna el Objeto de la posicion i. <br>
 * <b>post:</b> Se retorno el elemento indicado por la posicion recibida i.<br>
 * @param i posicion de un elemento de la lista.<br> 
 * @return Devuelve el Objeto de la posicion especificada, null en caso contrario.
 */`,
            `public T get(int i){        `,
            `    try {           `,
            `            Nodo x=this.getPos(i);`,
            `            if(x==null)`,
            `                return (null);`,
            `            return(x.getInfo());`,
            `        }catch (ExceptionUFPS ex) {`,
            `            System.err.println(ex.getMensaje());`,
            `        }`,
            `        return (null);`,
            `}`
        ],
        set: [
            `/**
 * Modifica el elemento que se encuentre en una posicion dada. <br>
 * <b>post:</b> Se edito la informacion del elemento indicado por la posicion recibida.<br>
 * @param i Una Posición dentro de la Lista.<br>
 * @param dato es el nuevo valor que toma el elmento en la lista
 */`,        
            `public void set(int i, T dato){        `,
            `    try{`,
            `            Nodo t=this.getPos(i);   `,
            `            if(t==null)`,
            `                return;`,
            `            t.setInfo(dato);`,
            `    }catch(ExceptionUFPS e){`,
            `            System.err.println(e.getMensaje());`,
            `        }`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que elimina todos los datos de la Lista Circular. <br>
 * <b>post:</b> Elimina todos los datos que contenga la lista circular.<br>
 */`,
            `public void vaciar(){        `,
            `    this.cabeza.setSig(cabeza);`,
            `    this.tamanio=0;`,
            `}`
        ],
        traverse: [
            `/**
 * Metodo que permite retornar la informacion de una Lista en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVector(){`,
            `     if(this.esVacia())`,
            `            return (null);`,
            `    Object vector[]=new Object[this.getTamanio()];`,
            `    Iterator it=this.iterator();`,
            `    int i=0;`,
            `    while(it.hasNext())`,
            `        vector[i++]=it.next();`,
            `    return(vector);`,
            `}`
        ]
    },
    lista_circular_doble: {
        create: [
            `/**
 * Constructor de la Clase Lista Circular Doble Enlazada, Crea
 * un nodo que sirve como cabezaecera de la ListaCD. <br>
 * <b>post:</b> Se construyo una lista circular doble vacia.<br>
 */`,
            `public ListaCD() {`,
            `    this.cabeza=new NodoD (null,null,null);`,
            `    this.cabeza.setSig(cabeza);`,
            `    cabeza.setAnt(cabeza);        `,
            `}`
        ],
        insertFirst: [
            `/**
 * Metodo que permite adicionar un Elemento al Inicio de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento al inicio de la Lista.<br>
 * @param dato Informacion que desea almacenar en la Lista. La informacion
 * debe ser un Objeto.
 */`,
            `public void insertarAlInicio(T dato){`,
            `        NodoD x=new NodoD (dato, cabeza.getSig(), cabeza);`,
            `        cabeza.setSig(x);`,
            `        x.getSig().setAnt(x);`,
            `        this.tamanio++;`,
            `    }`
        ],
        insertLast: [
            `/**
 * Metodo que permite insertar un Elemento al Final de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento al final de la Lista.<br>
 * @param dato Informacion que desea almacenar en la Lista. La informacion
 * debe ser un Objeto.
 */`,
            `public void insertarAlFinal(T dato){`,
            `    NodoD x=new NodoD(dato, cabeza, cabeza.getAnt());`,
            `    cabeza.getAnt().setSig(x);`,
            `    cabeza.setAnt(x);`,
            `    this.tamanio++;`,
            `}`
        ],
        insertSorted: [
            `/**
 * Metodo que inserta un Elemento de manera Ordenada desde la cabeza de la Lista. <br>
 * <b>post:</b> Se inserto un nuevo elemento en la posicion segun el Orden de la Lista.<br>
 * @param info Información que desea almacenar en la Lista de manera Ordenada.
 */`,
            `public void insertarOrdenado(T info){`,
            `    if (this.esVacia())`,
            `        this.insertarAlInicio(info);`,
            `    else{`,
            `        NodoD x=this.cabeza;`,
            `        NodoD y=x;`,
            `        x = x.getSig();`,
            `        while(x!=this.cabeza){`,
            `            Comparable comparador=(Comparable)info;`,
            `            int rta=comparador.compareTo(x.getInfo());`,
            `            if(rta<0)`,
            `                break;`,
            `            y=x;`,
            `            x=x.getSig();`,
            `        }`,
            `        if(x==cabeza.getSig())`,
            `            this.insertarAlInicio(info);`,
            `        else{`,
            `            y.setSig(new NodoD(info, x, y));`,
            `            x.setAnt(y.getSig());`,
            `            this.tamanio++;`,
            `            }`,
            `        }`,
            `}`
        ],
        delete: [
            `/**
 * Metodo que permite eliminar un elemento de la lista dada una posicion. <br>
 * <b>post:</b> Se elimino el dato en la posicion indicada de la lista.<br>
 * @param i Posicion del objeto<br>
 * @return el objeto que se elimino de la lista
 */`,
            `public T eliminar(int i){`,
            `    try{`,
            `        NodoD x;`,
            `        if(i==0){`,
            `            x = this.cabeza.getSig();`,
            `            this.cabeza.setSig(x.getSig());`,
            `            this.cabeza.getSig().setAnt(this.cabeza);`,
            `            x.setSig(null);`,
            `            x.setAnt(null);`,
            `            this.tamanio--;`,
            `            return (x.getInfo());`,
            `        }`,
            `        x=this.getPos(i-1);`,
            `        NodoD y = x.getSig();`,
            `        x.setSig(y.getSig());`,
            `        y.getSig().setAnt(x);`,
            `        y.setSig(null);`,
            `        y.setAnt(null);`,
            `        this.tamanio--;`,
            `        return(y.getInfo());`,
            `    }catch(ExceptionUFPS ex) {`,
            `        System.err.println(ex.getMessage());`,
            `    }`,
            `return(null);`,
            `}`
        ],
        get: [
            `/**
 * Metodo que retorna el objeto de la posicion i. <br>
 * <b>post:</b> Se retorno el elemento indicado por la posicion recibida i.<br>
 * @param i posicion de un elemento de la lista<br>
 * @return Devuelve el Objeto de la posicion especificada, null en caso contrario
 */`,
            `public T get(int i){`,
            `    try {`,
            `            NodoD x=this.getPos(i);`,
            `            return(x.getInfo());`,
            `        }catch (ExceptionUFPS ex) {`,
            `            System.err.println(ex.getMessage());`,
            `        }`,
            `        return (null);`,
            `    }`
        ],
        set: [
            `/**
 * Metodo que modifica el elemento que se encuentre en una posicion dada. <br>
 * <b>post:</b> Se edito el elemento indicado en la posicion indicada.<br>
 * @param i Una Posicion dentro de la Lista<br>
 * @param dato es el nuevo valor que toma el elmento en la lista
 */`,
            `public void set(int i, T dato){`,
            `    try{`,
            `        NodoD t=this.getPos(i);        `,
            `        t.setInfo(dato);`,
            `    }catch(ExceptionUFPS e){`,
            `        System.err.println(e.getMessage());`,
            `    }`,
            `}`
        ],
        clean: [
            `/**
 * Metodo que elimina todos los datos de la Lista Circular Doble. <br>
 * <b>post:</b> Elimina todos los datos que contenga la lista circular doble.<br>
 */`,
            `public void vaciar(){ `,
            `    this.cabeza=new NodoD (null,null,null);`,
            `    this.cabeza.setSig(cabeza);`,
            `    cabeza.setAnt(cabeza);`,
            `    this.tamanio=0;`,
            `}`
        ],
        traverseForward: [
            `/**
 * Metodo que permite retornar la informacion de una Lista en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVector(){`,
            `     if(this.esVacia())`,
            `            return (null);`,
            `    Object vector[]=new Object[this.getTamanio()];`,
            `    Iterator it=this.iterator();`,
            `    int i=0;`,
            `    while(it.hasNext())`,
            `        vector[i++]=it.next();`,
            `    return(vector);`,
            `}`
        ],
        traverseBackward: [
            `/**
 * Metodo que permite retornar la informacion de una Lista en un Vector. <br>
 * @return Un vector de Objetos con la informacion de cada posicion de la Lista.
 */`,
            `public Object[] aVectorReverso() {`,
            `    Object resultado[] = new Object[tamanio];`,
            `    NodoD actual = cabeza.getAnt();`,
            `    int i = 0;`,
            `    while (actual != cabeza) {`,
            `        resultado[i++] = actual.getInfo();`,
            `        actual = actual.getAnt();`,
            `    }`,
            `    return resultado;`,
            `}`
        ]
    },
    tabla_hash: {
        /* ───────────────── create(n) ───────────────── */
        create: [
          `/**`,
          ` * Constructor de una tabla hash con n slots.`,
          ` * <b>post:</b> se crean los buckets vacíos y se inicia el contador en 0.`,
          ` */`,
          `public TablaHash(int n){`,
          `    this.capacidad   = n;`,
          `    this.contador    = 0;`,
          `    this.buckets     = new Lista[n];     // arreglo de listas`,
          `    inicializarBuckets();`,
          `}`,
        ],
    
        /* ───────────────── set(k,v) ───────────────── */
        set: [
          `/**`,
          ` * Inserta o actualiza un par clave→valor.`,
          ` * <b>post:</b> si la clave existe se actualiza el valor,`,
          ` *            si no existe se agrega un nuevo nodo.`,
          ` */`,
          `public void put(int key,int value){`,
          `    int idx = hash(key);`,
          `    Nodo n = buscarNodo(idx,key);`,
          `    if(n != null) n.value = value;       // update`,
          `    else {`,
          `        buckets[idx].agregar(new Nodo(key,value));`,
          `        contador++;`,
          `    }`,
          `}`,
        ],
    
        /* ───────────────── get(k) ───────────────── */
        get: [
          `/**`,
          ` * Retorna el valor asociado a la clave o lanza excepción.`,
          ` */`,
          `public int get(int key){`,
          `    Nodo n = buscarNodo(hash(key),key);`,
          `    if(n==null) throw new Error("Clave no encontrada");`,
          `    return n.value;`,
          `}`,
        ],
    
        /* ───────────────── remove(k) ───────────────── */
        delete: [
          `/**`,
          ` * Elimina el nodo con la clave dada.`,
          ` * <b>post:</b> contador se decrementa si la clave existía.`,
          ` */`,
          `public void remove(int key){`,
          `    Lista bucket = buckets[hash(key)];`,
          `    if(bucket.eliminar(key)) contador--;`,
          `}`,
        ],
        
        /* ───────────────── clean() ───────────────── */
        clean: [
          `/**`,
          ` * Vacía por completo la tabla hash.`,
          ` * <b>post:</b> contador = 0 y todos los buckets quedan vacíos.`,
          ` */`,
          `public void clean(){`,
          `    limpiarBuckets();`,
          `    contador = 0;`,
          `}`,
        ],
      },
};
