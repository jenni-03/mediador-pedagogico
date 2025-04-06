export const operations_pseudoCode: Record<string, any> = {
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
    cola: {
        create: [
            "función constructor(n):",
            "si n <= 0 entonces",
            "vector ← arreglo vacío",
            "cant ← 0",
            "retornar",
            "fin si",
            "",
            "vector ← nuevo arreglo de tamaño n",
            "para i desde 0 hasta n - 1 hacer:",
            "vector[i] ← null",
            "fin para",
            "cant ← 0",
            "fin función"
        ],
        insert_last: [
            "función insertar(elem):",
            "si cant es mayor o igual a la longitud del vector entonces",
            'lanzar error "No hay espacio para insertar el elemento {elem}"',
            "fin si",
            "",
            "vector[cant] ← elem",
            "cant ← cant + 1",
            "fin función"
        ],
        update: [
            "función set(i, nuevo):",
            "si i < 0 o i >= cant entonces",
            'lanzar error "Índice fuera de rango!"',
            "fin si",
            "si el vector contiene nuevo entonces",
            'lanzar error "El elemento {nuevo} ya está en la secuencia"',
            "fin si",
            "vector[i] ← nuevo",
            "fin función"
        ],
        delete: [
            "función eliminar(elem):",
            "indice ← getIndice(elem)",
            "si indice es igual a -1 entonces",
            'lanzar error "El elemento {elem} no está en la secuencia"',
            "fin si",
            "",
            "// Mover los elementos hacia la izquierda",
            "para i desde indice hasta cant - 2 hacer:",
            "vector[i] ← vector[i + 1]",
            "fin para",
            "",
            "// Reducir cantidad y limpiar el último espacio",
            "vector[cant - 1] ← null",
            "cant ← cant - 1",
            "fin función"
        ],
        search: [
            "función esta(elem):",
            "si el vector contiene elem entonces",
            "retornar true",
            "fin si",
            'lanzar error "El elemento {elem} no se encontró en la secuencia"',
            "fin función"
        ],
        clean: [
            "función vaciar():",
            "vector ← arreglo vacío",
            "cant ← 0",
            "fin función"
        ]
    }
};
