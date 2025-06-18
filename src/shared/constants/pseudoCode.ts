export const operationsCode: Record<string, any> = {
    secuencia: {
        create: [
            `/**
 * Constructor con parámetros de la clase secuencia.
 * post: Se construye una secuencia vacia.
 * @param n de tipo integer que contiene el tamaño en capacidad de la secuencia. 
 */`,
            `public Secuencia(int n){`,
            `    if (n <= 0){`,
            `        System.err.println("Tamaño de secuencia no válido!");`,
            `        return;`,
            `    }    `,
            `    Object r[] = new Object[n];`,
            `    cant = 0;`,
            `    this.vector = (T[])r;`,
            `}`
        ],
        insertLast: [
            `/**
 * Método que inserta un nuevo elemento en la secuencia.
 * post: Se insertó un elemento en la secuencia.
 * @param elem de tipo T que contiene el elemento a insertar.
 */`,
            `public void insertar(T elem){        `,
            `    if(this.cant >= this.vector.length)`,
            `        System.err.println("No hay más espacio!");`,
            `    else`,
            `        this.vector[this.cant++]=elem;`,
            `}`
        ],
        get: [
            `/**
 * Método que obtiene un elemento dentro de la secuecia por su posición.
 * post: Se ha retornado el elemento de la secuencia en la posición especificada.
 * @param i es de tipo integer y contiene la posición del elemento en la secuencia.
 * @return un tipo T que contiene el valor del elemento.
 */`,
            `public T get(int i){        `,
            `    if (i<0 || i>this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return null;`,
            `    }`,
            `    return this.vector[i];`,
            `}`
        ],
        set: [
            `/**
 * Método que cambia un elemento de la secuencia en la posición indicada por otro.
 * post: Se ha modificado un elemento de la secuencia.
 * @param i de tipo integer que contiene la posición del elemento en la secuencia que se va a cambiar.
 * @param nuevo elemento que reemplazará al elemento indicado.
 */`,
            `public void set(int i, T nuevo){        `,
            `    if (i < 0 || i > this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return;`,
            `    }`,
            `    this.vector[i] = nuevo;`,
            `}`
        ],
        delete: [
            `/**
 * Método que elimina un elemento en la secuencia dada su posición.
 * post: Se eliminó un elemento en la secuencia.
 * @param pos Posicion del elemento a eliminar.
 */`,
            `public void eliminarP(int pos){        `,
            `    if (pos < 0 || pos > this.cant){`,
            `        System.err.println("Indíce fuera de rango!");`,
            `        return;`,
            `    }`,
            `    boolean e = false;`,
            `    for(int i=0, j=0; i < this.cant; i++){`,
            `        if(i != pos){`,
            `            this.vector[j] = vector[i];`,
            `            j++;`,
            `        }else{`,
            `            e = true;`,
            `            this.vector[j] = null;`,
            `        }`,
            `    }`,
            `    if(e)`,
            `        this.cant--;`,
            `}`
        ],
        search: [
            `/**
 * Método que recibe un elemento y comprueba si existe en la secuencia.
 * post: Se ha retornado true si el elemento se encuentra en la secuencia.
 * @param elem es de tipo T y contiene el elemento que se va a buscar.
 * @return un tipo boolean, retorna true si el objeto existe y false en caso contrario.
 */`,
            `public boolean search(T elem){        `,
            `    for (int i = 0; i < this.cant; i++){`,
            `        if (this.vector[i].equals(elem)) {`,
            `          return true;`,
            `        }`,
            `    }`,
            `    return false;`,
            `}`
        ],
        clean: [
            `/**
 * Método que vacia la secuencia.
 * post: La Secuencia se encuentra vacia.
 */`,
            `public void vaciar(){`,
            `    for(int i = 0; i < this.cant; i++)`,
            `        this.vector[i] = null;`,
            `    this.cant = 0;`,
            `}`
        ]
    },
    pila: {
        push: [
            `/**
 * Método que inserta un elemento en la pila.
 * post: Se insertó un elemento dentro de la pila.
 * @param info es de tipo T y contiene la información a insertar en la pila.
 */`,
            `public void apilar(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if(this.esVacia()) {`,
            `        this.tope = nuevoNodo;`,
            `    }`,
            `    else {`,
            `        nuevoNodo.setSig(this.tope);`,
            `        this.tope = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        pop: [
            `/**
 * Método que retira un elemento de la pila.
 * post: Se retiró el elemento tope de la pila.
 * @return un tipo T que contiene la informacion del elemento retirado.
 */`,
            `public T desapilar(){`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    Nodo<T> x = this.tope;`,
            `    this.tope = tope.getSig();`,
            `    this.tamanio--;`,
            `    return(x.getInfo());`,
            `}`
        ],
        getTop: [
            `/**
 * Método que devuelve el elemento tope de la pila.
 * post: Se retornó el elemento tope de la pila.
 * @return Elemento tope de la pila.
 */`,
            `public Nodo<T> getTope(){`,
            `    return this.tope;`,
            `}`
        ],
        clean: [
            `/**
 * Método que elimina todos los datos de la pila.
 * post: Se eliminó todos los datos que se encontraban en la pila.
 */`,
            `public void vaciar(){`,
            `    this.tope = null;`,
            `    this.tamanio = 0;`,
            `}`
        ]
    },
    cola: {
        enqueue: [
            `/**
 * Método que permite agregar un elemento a la cola.
 * post: Se insertó un nuevo elemento en la cola.
 * @param info es de tipo T y contiene la informacion a encolar.
 */`,
            `public void enColar(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `      this.inicio = nuevoNodo;`,
            `      this.fin = nuevoNodo;`,
            `    } else {`,
            `      this.fin.setSig(nuevoNodo);`,
            `      this.fin = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        dequeue: [
            `/**
 * Método que permite retirar el primer elemento insertado en la cola.
 * post: Se eliminó el primer elemento de la cola.
 * @return un tipo T que contiene la informacion del elemento retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    NodoD<T>x = this.inicio`,
            `    if (this.inicio === this.fin) {`,
            `        this.inicio = null;`,
            `        this.fin = null;`,
            `    } else {`,
            `        this.inicio = this.inicio.getSig();`,
            `    }`,
            `    this.tamanio--;`,
            `    return x.getInfo();`,
            `}`
        ],
        getFront: [
            `/**
 * Método que permite conocer el primer elemento insertado en la cola.
 * post: Se obtuvó el primer elemento de la cola.
 * @return El primer elemento de la cola.
 */`,
            `protected Nodo<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Método que permite eliminar toda la información que contiene la cola.
 * post: Se eliminó todos los datos que se encontraban en la Cola.
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
    lista_simplemente_enlazada: {
        insertFirst: [
            `/**
 * Método que inserta un nodo al inicio de la lista.
 * post: Se insertó un nuevo nodo al inicio de la lista.
 * @param info es de tipo T y contiene la información a almacenar en la lista.
 */`,
            `public void insertarAlInicio(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `      this.cabeza = nuevoNodo;`,
            `    } else {`,
            `      nuevoNodo.setSig(this.cabeza);`,
            `      this.cabeza = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Método que inserta un nodo al final de la lista.
 * post: Se insertó un nuevo nodo al final de la lista.
 * @param info es de tipo T y contiene la información a almacenar en la lista. 
 */`,
            `public void insertarAlFinal(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `      this.cabeza = nuevoNodo;`,
            `    } else {`,
            `      Nodo<T>nodoUlt = this.getPos(this.tamanio - 1);`,
            `      nodoUlt.setSig(nuevoNodo);`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertAt: [
            `/**
 * Método que inserta un nodo en una posición especifica de la lista.
 * post: Se insertó un nuevo nodo en la posición especificada.
 * @param info es de tipo T y contiene la información a almacenar en la lista.
 * @param pos es de tipo integer y corresponde a la posición de inserción.
 */`,
            `public void insertarEnPosicion(T info, int pos){`,
            `    if (pos < 0 || pos > this.tamanio) {`,
            `      System.err.println("Posición de inserción no válida!");`,
            `      return;`,
            `    }`,
            `    if (pos == 0) {`,
            `      this.insertarAlInicio(info);`,
            `    }`,
            `    if (pos == this.tamanio) {`,
            `      this.insertarAlFinal(info);`,
            `    }`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    Nodo<T>nodoAnt = this.getPos(pos - 1);`,
            `    nuevoNodo.setSig(nodoAnt.getSig());`,
            `    nodoAnt.setSig(nuevoNodo);`,
            `    this.tamanio++;`,
            `}`
        ],
        removeFirst: [
            `/**
 * Método que remueve el nodo inicial de la lista.
 * post: Se eliminó el nodo inicial de la lista.
 */`,
            `public void removerAlInicio(){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    this.cabeza = this.cabeza.getSig();`,
            `    this.tamanio--;`,
            `}`
        ],
        removeLast: [
            `/**
 * Método que remueve el nodo final de la lista.
 * post: Se eliminó el nodo final de la lista.
 */`,
            `public void removerAlFinal(){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    if (this.tamanio === 1) {`,
            `      this.cabeza = null`,
            `    } else {`,
            `      Nodo<T>nodoAntUlt = this.getPos(this.tamanio - 2);`,
            `      nodoAntUlt.setSig(null);`,
            `    }`,
            `    this.tamanio--;`,
            `}`
        ],
        removeAt: [
            `/**
 * Método que elimina un nodo dada su posición.
 * post: Se eliminó el nodo en la posicion especificada.
 * @param pos es de tipo integer y corresponde a la posición del nodo a eliminar.
 */`,
            `public void removerEnPosición(int pos){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    if (pos < 0 || pos >= this.tamanio) {`,
            `      System.err.println("Posición de eliminación no válida!");`,
            `      return;`,
            `    }`,
            `    if (pos == 0) {`,
            `      this.removerAlInicio();`,
            `    }`,
            `    if (pos == this.tamanio - 1) {`,
            `      this.removerAlFinal();`,
            `    }`,
            `    Nodo<T>nodoAnt = this.getPos(pos - 1);`,
            `    Nodo<T>nodoEliminado = nodoAnt.getSig();`,
            `    nodoAnt.setSig(nodoEliminado.getSig());`,
            `    this.tamanio--;`,
            `}`
        ],
        search: [
            `/**
 * Método que busca el elemento especificado en la lista.
 * post: Se retornó un booleano que indica si el elemento especificado fue encontrado en la lista.
 * @param elem es de tipo T y corresponde al elemento a buscar.
 * @return True o false si el elemento fue encontrado.
 */`,
            `public boolean search(T elem) {`,
            `    Nodo<T> nodoActual = this.cabeza;`,
            `    while(nodoActual) {`,
            `        if (nodoActual.getValor().equals(elem)) {`,
            `          return true;`,
            `        }`,
            `        nodoActual = nodoActual.getSig();`,
            `    }`,
            `    return false;`,
            `}`,
        ],
        clean: [
            `/**
 * Método que elimina todos los datos de la lista.
 * post: Se eliminó todos los datos encontrados en la lista.
 */`,
            `public void vaciar(){`,
            `    this.cabeza = null;`,
            `    this.tamanio = 0;`,
            `}`
        ]
    },
    lista_doblemente_enlazada: {
        insertFirst: [
            `/**
 * Método que inserta un nodo al inicio de la lista.
 * post: Se insertó un nuevo nodo al inicio de la lista.
 * @param info es de tipo T y contiene la información a almacenar en la lista.
 */`,
            `public void insertarAlInicio(T info){`,
            `    NodoD<T>nuevoNodo = new NodoD(info);`,
            `    if (this.esVacia()) {`,
            `      this.cabeza = nuevoNodo;`,
            `      this.cola = nuevoNodo;`,
            `    } else {`,
            `      nuevoNodo.setSig(this.cabeza);`,
            `      this.cabeza.setAnt(nuevoNodo);`,
            `      this.cabeza = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertLast: [
            `/**
 * Método que inserta un nodo al final de la lista.
 * post: Se insertó un nuevo nodo al final de la lista.
 * @param info es de tipo T y contiene la información a almacenar en la lista. 
 */`,
            `public void insertarAlFinal(T info){`,
            `    NodoD<T>nuevoNodo = new NodoD(info);`,
            `    if (this.esVacia()) {`,
            `      this.cabeza = nuevoNodo;`,
            `      this.cola = nuevoNodo;`,
            `    } else {`,
            `      this.cola.setSig(nuevoNodo);`,
            `      nuevoNodo.setAnt(this.cola);`,
            `      this.cola = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        insertAt: [
            `/**
 * Método que inserta un nodo en una posición especifica de la lista.
 * post: Se insertó un nuevo nodo en la posición especificada.
 * @param info es de tipo T y contiene la información a almacenar en la lista.
 * @param pos es de tipo integer y corresponde a la posición de inserción.
 */`,
            `public void insertarEnPosicion(T info, int pos){`,
            `    if (pos < 0 || pos > this.tamanio) {`,
            `      System.err.println("Posición de inserción no válida!");`,
            `      return;`,
            `    }`,
            `    if (pos == 0) {`,
            `      this.insertarAlInicio(info);`,
            `    }`,
            `    if (pos == this.tamanio) {`,
            `      this.insertarAlFinal(info);`,
            `    }`,
            `    NodoD<T>nuevoNodo = new NodoD(info);`,
            `    NodoD<T>nodoAnt = this.getPos(pos - 1);`,
            `    nuevoNodo.setSig(nodoAnt.getSig());`,
            `    nuevoNodo.setAnt(nodoAnt);`,
            `    nodoAnt.getSig().setAnt(nuevoNodo);`,
            `    nodoAnt.setSig(nuevoNodo);`,
            `    this.tamanio++;`,
            `}`
        ],
        removeFirst: [
            `/**
 * Método que remueve el nodo inicial de la lista.
 * post: Se eliminó el nodo inicial de la lista.
 */`,
            `public void removerAlInicio(){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    this.cabeza = this.cabeza.getSig();`,
            `    this.cabeza.setAnt(null);`,
            `    this.tamanio--;`,
            `}`
        ],
        removeLast: [
            `/**
 * Método que remueve el nodo final de la lista.
 * post: Se eliminó el nodo final de la lista.
 */`,
            `public void removerAlFinal(){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    this.cola = this.cola.getAnt();`,
            `    this.cola.setSig(null);`,
            `    this.tamanio--;`,
            `}`
        ],
        removeAt: [
            `/**
 * Método que elimina un nodo dada su posición.
 * post: Se eliminó el nodo en la posicion especificada.
 * @param pos es de tipo integer y corresponde a la posición del nodo a eliminar.
 */`,
            `public void removerEnPosición(int pos){`,
            `    if (this.esVacia()) {`,
            `      System.err.println("Lista vacía!");`,
            `      return;`,
            `    }`,
            `    if (pos < 0 || pos >= this.tamanio) {`,
            `      System.err.println("Posición de eliminación no válida!");`,
            `      return;`,
            `    }`,
            `    if (pos == 0) {`,
            `      this.removerAlInicio();`,
            `    }`,
            `    if (pos == this.tamanio - 1) {`,
            `      this.removerAlFinal();`,
            `    }`,
            `    NodoD<T>nodoEliminado = this.getPos(pos);`,
            `    nodoEliminado.getAnt().setSig(nodoEliminado.getSig());`,
            `    nodoEliminado.getSig().setAnt(nodoEliminado.getAnt());`,
            `    this.tamanio--;`,
            `}`
        ],
        search: [
            `/**
 * Método que busca el elemento especificado en la lista.
 * post: Se retorno un booleano que indica si el elemento especificado fue encontrado en la lista.
 * @param elem es de tipo T y corresponde al elemento a buscar.
 * @return True o false si el elemento fue encontrado.
 */`,
            `public boolean search(T elem) {`,
            `    NodoD<T> nodoActual = this.cabeza;`,
            `    while(nodoActual) {`,
            `        if (nodoActual.getValor().equals(elem)) {`,
            `          return true;`,
            `        }`,
            `        nodoActual = nodoActual.getSig();`,
            `    }`,
            `    return false;`,
            `}`,
        ],
        clean: [
            `/**
 * Método que elimina todos los datos de la lista.
 * post: Se eliminó todos los datos encontrados en la lista.
 */`,
            `public void vaciar(){`,
            `    this.cabeza = null;`,
            `    this.cola = null;`,
            `    this.tamanio = 0;`,
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
