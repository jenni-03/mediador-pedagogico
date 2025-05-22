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
 * Método que inserta un nuevo elemento a la secuencia. <br>
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
 * Método que cambia un elemento de la secuencia en la posición indicada , por otro. <br>
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
 * Método que elimina un elemento a la secuencia dada su posición. <br>
 * <b>post: </b> Se eliminó un elemento en la Secuencia.<br>
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
 * Método que retorna un objeto tipo T de la secuencia dada la posición. <br>
 * <b>post:</b> Se ha retornado un elemento de la Secuencia dada su posición<br>
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
 * Método que vacia la secuencia. <br>
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
 * Método que inserta un elemento en la Pila. <br>
 * <b>post: </b> Se insertó un elemento dentro de la Pila.<br>
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
 * Método que retira y devuelve un elemento de la Pila. <br>
 * <b>post: </b> Se retiró y eliminó el elemento tope de la Pila.<br>
 * @return un tipo T que contiene la información retirada de la pila.<br>
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
 * Método devuelve el elemento que se encuentra en el tope de la Pila. <br>
 * <b>post: </b> Se retornó el elemento tope de la Pila.<br>
 * @return El elemento que esta en el tope de la Pila.
 */`,
            `public T getTope(){`,
            `    return (this.tope.getInfo());`,
            `}`
        ],
        clean: [
            `/**
 * Elimina todos los datos de la Pila. <br>
 * <b>post: </b> Se eliminó todos los datos que se encontraban en la Pila.<br>
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
 * Método que permite agregar un elemento a la Cola. <br>
 * <b>post: </b> Se insertó un nuevo elemento a la Cola.<br>
 * @param info es de tipo T y contiene la informacion a encolar
 */`,
            `public void enColar(T info){`,
            `    Nodo<T>nuevoNodo=new Nodo(valor);`,
            `    if (this.esVacia()) {`,
            `      this.inicio = nuevoNodo;`,
            `      this.fin = nuevoNodo;`,
            `    } else {`,
            `      this.fin.setSiguiente(nuevoNodo);`,
            `      this.fin = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        dequeue: [
            `/**
 * Método que permite retirar el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se elimina el primer elemento que fue insertado en la cola.<br>
 * @return un tipo T que contiene la informacion del nodo retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return (null);`,
            `    NodoD<T> x=this.inicio`,
            `    if (this.inicio === this.fin) {`,
            `        this.inicio = null;`,
            `        this.fin = null;`,
            `    } else {`,
            `        this.inicio = this.inicio.getSiguiente();`,
            `    }`,
            `    this.tamanio--;`,
            `    return x.getInfo();`,
            `}`
        ],
        getFront: [
            `/**
 * Método que permite conocer el primer elemento que fue insertado en la Cola. <br>
 * <b>post: </b> Se obtiene el primer elemento que fue insertado en la Cola.<br>
 * @return El primer elemento insertado en la cola
 */`,
            `protected NodoD<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Método que permite eliminar toda la información que contiene la Cola. <br>
 * <b>post: </b> Se eliminó todos los datos que se encontraban en la Cola.<br>
 */`,
            `public void vaciar(){`,
            `    this.inicio = null;`,
            `    this.fin = null;`,
            `    this.tamanio = 0;`,
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
    lista_enlazada: {
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
        insertAt: [
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
        deleteFirst: [
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
        deleteLast: [
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
        deleteAt: [
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
        search: [
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
        clean: [
            `/**
 * Metodo que elimina todos los datos de la Lista Simple. <br>
 * <b>post:</b> La Lista Simple se encuentra vacia.
 */`,
            `public void vaciar(){`,
            `    this.cabeza=null;`,
            `    this.tamanio=0;`,
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
