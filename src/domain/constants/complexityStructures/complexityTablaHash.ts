export const complexityTablaHash = [
  {
    title: "1. Constructor (23 slots por defecto)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1 + (5n + 3)", "T(n) = 5n + 7"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Constructor de una tabla hash con 23 slots.
 * post: Se creó una tabla hash con 23 slots.
 */
public TablaHash() {
    this.numeroDatos = 0;                 // 1
    this.numeroSlots = 11;                // 1
    this.informacionEntrada = new ListaCD[this.numeroSlots]; // 1 + 1
    // Inicializar los slots de la tabla
    this.inicializarListas();             // 5n + 3
}
    `,
  },
  {
    title: "2. Constructor (Slots Específicos)",
    operationalCost: ["T(n) = 1 + 1 + 1 + 1 + (5n + 3)", "T(n) = 5n + 7"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Constructor de una tabla hash con número específico de slots.
 * post: Se creó tabla hash con el número de slots especificado.
 */
public TablaHash(int numeroSlots) {
    this.numeroDatos = 0;                    // 1
    this.numeroSlots = numeroSlots;          // 1
    this.informacionEntrada = new ListaCD[numeroSlots]; // 1 + 1
    this.inicializarListas();                // 5n + 3
}
    `,
  },
  {
    title: "3. Insertar o Modificar (insertar)",
    operationalCost: ["T(n) = KTE", "KTE = constante si la lista es pequeña"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Inserta o modifica en la tabla un objeto con su clave.
 * post: Se insertó o modificó un objeto en la tabla.
 */
public T insertar(Clave clave, T objeto) {
    int indice = 0;                                    // 1
    InformacionDeEntrada<Clave, T> objetoAnterior = null; // 1
    if (clave == null) {
        throw new RuntimeException("La Clave de Objeto no puede ser vacía!!!");
    } else {
        indice = index(clave);                       // 1
        objetoAnterior = this.registrarEntrada(indice, clave); // 1
        if (objetoAnterior == null) {
            InformacionDeEntrada<Clave, T> nuevoObjeto = new InformacionDeEntrada(clave, objeto);
            this.informacionEntrada[indice].insertarAlFinal(nuevoObjeto);
            this.numeroDatos += 1;
            return nuevoObjeto.getObjeto();
        } else {
            objetoAnterior.setObjeto(objeto);
        }
    }
    return (T) objetoAnterior.getObjeto();
}
    `,
  },
  {
    title: "4. Eliminar Objeto Específico (eliminar)",
    operationalCost: ["T(n) = KTE"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Elimina un objeto de la tabla hash según su clave.
 * post: Se eliminó el objeto en la tabla.
 */
public T eliminar(Clave clave) {
    int i = 0;
    InformacionDeEntrada objeto;
    if (clave == null) {
        throw new RuntimeException("La Clave de Objeto no puede ser vacía!!!");
    } else {
        int indice = index(clave);
        ListaCD<InformacionDeEntrada<Clave, T>> listaObjeto = this.informacionEntrada[indice];
        objeto = new InformacionDeEntrada(clave);
        i = listaObjeto.getIndice(objeto);
        if (i == -1) {
            objeto = null;
        } else {
            objeto = (InformacionDeEntrada) listaObjeto.eliminar(i);
            this.numeroDatos--;
        }
    }
    return (T) objeto.getObjeto();
}
    `,
  },
  {
    title: "5. Existencia de un Objeto por Clave (esta)",
    operationalCost: ["T(n) = KTE"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Verifica si existe un objeto asociado con una clave.
 * post: Consultó la existencia de un objeto para la clave dada.
 */
public boolean esta(Clave clave) {
    return (this.getObjeto(clave) != null);
}
    `,
  },
  {
    title: "6. Obtener Objeto (getObjeto)",
    operationalCost: ["T(n) = KTE"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene el objeto asociado a la clave especificada.
 * post: Se obtuvo el objeto de la tabla para esa clave.
 */
public Object getObjeto(Clave clave) {
    InformacionDeEntrada objeto;
    if (clave == null)
        throw new IllegalArgumentException("Clave null no permitida");
    else {
        int indice = index(clave);
        ListaCD<InformacionDeEntrada<Clave, T>> listaObjeto = this.informacionEntrada[indice];
        objeto = new InformacionDeEntrada(clave);
        int i = listaObjeto.getIndice(objeto);
        if (i == -1)
            return null;
        else {
            objeto = listaObjeto.get(i);
        }
    }
    return objeto.getObjeto();
}
    `,
  },

  {
    title: "7. Registrar Entrada por Clave (registrarEntrada)",
    operationalCost: ["T(n) = 14"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite registrar una entrada con la clave especificada dentro del slot indicado en la tabla.
 * pre: clave!=null, indice!=null, indice>=0.
 * post: Se registro la entrada en el slot de la tabla indicado.
 */
private InformacionDeEntrada registrarEntrada(int indice, Clave clave) {
    InformacionDeEntrada<Clave, T> objeto = new InformacionDeEntrada(clave);
    ListaCD<InformacionDeEntrada<Clave, T>> listaEntradas = this.informacionEntrada[indice];
    int i = listaEntradas.getIndice(objeto);
    if (i == -1)
        objeto = null;
    else
        objeto = listaEntradas.get(i);
    return objeto;
}
    `,
  },
  {
    title: "8. Obtener Indice (index)",
    operationalCost: ["T(n) = KTE"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite dispersar el codigo hash de la clave especifica.
 * pre: hcode!=null.
 * post: Se obtuvo el indice de asignacion de slot en la tabla para la clave de la entrada.
 */
public int index(Clave clave) {
    int hcode = clave.hashCode();
    double num = ((Math.sqrt(5.0) - 1.0) / 2.0);
    double t = (Math.abs(hcode) * num);
    return ((int)((t - (int) t) * (this.numeroSlots)));
}
    `,
  },
  {
    title: "9. Eliminar Entradas (eliminarTodo)",
    operationalCost: ["T(n) = 4n + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite eliminar las entradas de la tabla hash.
 * post: Se eliminaron todos los datos antes almacendos en la tabla.
 */
public void eliminarTodo() {
    this.numeroDatos = 0;
    for (int i = 0; i < this.informacionEntrada.length; i++)
        this.informacionEntrada[i] = null;
}
    `,
  },
  {
    title: "10. Obtener Numero de Objetos Almacenados (getNumeroDatos)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite obtener el numero de objetos almacenados en la tabla hash.
 * post: Se obtuvo el numero de objetos almacenados en la tabla hash.
 */
public int getNumeroDatos() {
    return numeroDatos;
}
    `,
  },
  {
    title: "11. Obtener Numero de Slots (getNumeroSlots)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite obtener el numero de slots de la tabla hash.
 * post: Se obtuvo el numero de slots de la tabla hash.
 */
public int getNumeroSlots() {
    return numeroSlots;
}
    `,
  },
  {
    title: "12. Listado de los Objetos de Entrada (getInformacionEntrada)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite obtener el listado de los objetos de entrada de la tabla hash.
 * post: Se obtuvo el listado de los objetos de entrada de la tabla hash.
 */
public ListaCD<InformacionDeEntrada<Clave, T>>[] getInformacionEntrada() {
    return informacionEntrada;
}
    `,
  },
  {
    title: "13. Obtener Numero de Slots Ocupados (numSlotOcupados)",
    operationalCost: ["T(n) = 9n + 6"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite determinar el numero de Slots ocupados en la Tabla.
 * @return El numero de slots ocupados en la tabla en un entero.
 */
public int numSlotOcupados() {
    int i = 0, cant = 0;
    while (i < this.numeroSlots) {
        if (!this.informacionEntrada[i].esVacia())
            cant++;
        i++;
    }
    return cant;
}
    `,
  },
  {
    title: "14. Modificar Slots Lista (setNumeroSlots)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que modifica el numero de slots de la tabla hash.
 * post: Se modifico el numero de slots de la tabla hash.
 */
public void setNumeroSlots(int numeroSlots) {
    this.numeroSlots = numeroSlots;
}
    `,
  },
  {
    title: "15. Modificar Listado Entrada (setInformacionEntrada)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite modificar el listado de los objetos de entrada de la tabla hash.
 * post: Se modifico el listado de los objetos de entrada de la tabla hash.
 */
public void setInformacionEntrada(ListaCD<InformacionDeEntrada<Clave, T>>[] informacionEntrada) {
    this.informacionEntrada = informacionEntrada;
}
    `,
  },
  {
    title: "16. Inicializar Listas (inicializarListas)",
    operationalCost: ["T(n) = 5n + 3"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inicializa las listas que representan los Slots de la tabla de hashing.
 * post: Se inicializaron las lista que representan los slots.
 */
private void inicializarListas() {
    for (int i = 0; i < this.informacionEntrada.length; i++) {
        this.informacionEntrada[i] = new ListaCD();
    }
}
    `,
  },
  {
    title: "17. Obtener Primo (obtenerPrimo)",
    operationalCost: ["T(n) = 8n² + KTE(n) + 8n + KTE + 4 + 1"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Metodo que permite obtener un numero primo cercano al valor dado.
 * post: Se obtuvo un numero primo cercano al valor dado.
 */
private int obtenerPrimo(int numero) {
    int primo = numero - 1;
    while (!esPrimo(primo)) {
        primo += 2;
    }
    return primo;
}
    `,
  },
  {
    title: "18. Consultar Si es Primo (esPrimo)",
    operationalCost: ["T(n) = 9n + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite verificar si el numero dado es un numero primo.
 * post: Se verifico si el numero dado es primo.
 */
public boolean esPrimo(int numero) {
    boolean esPrimo = false;
    int raizCuadrada = (int) Math.sqrt(numero);
    for (int i = 3; i <= raizCuadrada && !(esPrimo); i += 2) {
        if (numero % i != 0) {
            esPrimo = true;
        }
    }
    return esPrimo;
}
    `,
  },
  {
    title: "19. Imprimir Datos (imprimir)",
    operationalCost: ["T(n) = KTE(n) + 6"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite imprimir los datos almacenados en la tabla.
 * post: Se retorno una cadena de caracteres que representan los datos almacenados en la tabla.
 */
public String imprimir() {
    String msg = "";
    for (int i = 0; i < this.informacionEntrada.length; i++)
        if (this.informacionEntrada[i] != null)
            msg += "Slot de la tabla numero" + i + " ==>" + this.informacionEntrada[i].toString() + "\\n";
    return msg;
}
    `,
  },
  {
    title: "20. Consultar Existencias (esVacia)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite determinar si la Tabla se encuentra vacía.
 * @return Un objeto de tipo boolean con true si la tabla se encuentra vacía.
 */
public boolean esVacia() {
    return (this.numeroDatos == 0);
}
    `,
  },
];
