export const complexityArbolHeap = [
  {
    title: "1. Constructor vacío con tamaño predefinido",
    operationalCost: ["T(n) = 8"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Heap vacio con un tamaño predefinido.
 */
public ArbolHeap() {
    T[] temp = (T[]) new Object[def];
    this.datos = temp;
    this.peso = 0;
}
    `
  },
  {
    title: "2. Constructor vacío con tamaño ingresado",
    operationalCost: ["T(n) = 8"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Heap vacio, y se le define un tamaño ingresado.
 */
public ArbolHeap(int cap) {
    T[] temp = (T[]) new Object[cap];
    this.datos = temp;
    this.peso = 0;
}
    `
  },
  {
    title: "3. Obtener la raíz del Heap (getRaiz)",
    operationalCost: ["T(n) = 8"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna el dato de mayor valor dentro del Arbol Heap.
 */
public T getRaiz() {
    T r = null;
    if (!this.esVacio())
        r = this.datos[0];
    return r;
}
    `
  },
  {
    title: "4. Insertar un nuevo elemento en el Heap (insertar)",
    operationalCost: ["T(n) = 24n + 27"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un nuevo elemento dentro del Arbol Heap.
 */
public void insertar(T nuevo) {
    if (peso >= this.datos.length)
        return; // El Arbol está lleno
    if (this.esVacio()) {
        this.datos[peso++] = nuevo;
        return;
    }
    int indice = peso++;
    this.datos[indice] = nuevo;
    while ((indice != 0) && (((Comparable) this.datos[indice]).compareTo(this.datos[this.getPosPadre(indice)])) > 0) {
        this.datos = intercambiar(this.datos, indice, this.getPosPadre(indice));
        indice = this.getPosPadre(indice);
    }
}
    `
  },
  {
    title: "5. Eliminar el primer elemento (raíz) del Heap (eliminarRaiz)",
    operationalCost: ["T(n) = 22n + 29"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina el elemento mayor (raíz) del Heap.
 */
public T eliminarRaiz() {
    if (peso <= 0)
        return null;
    this.datos = intercambiar(this.datos, 0, --peso);
    if (peso != 0)
        reorganiza(0);
    T x = this.datos[peso];
    this.datos[peso] = null;
    return x;
}
    `
  },
  {
    title: "6. Reorganizar los datos del Heap (reorganiza)",
    operationalCost: ["T(n) = 22n + 15"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Reorganiza los datos después de una eliminación.
 */
private void reorganiza(int pos) {
    if (pos < 0 || pos > peso)
        return;
    while (!esHoja(pos)) {
        int j = getHijoIzq(pos);
        if ((j < (peso - 1)) && (((Comparable) this.datos[j]).compareTo(this.datos[j + 1]) < 0))
            j++;
        if (((Comparable) this.datos[pos]).compareTo(this.datos[j]) >= 0) return;
        this.datos = intercambiar(this.datos, pos, j);
        pos = j;
    }
}
    `
  },
  {
    title: "7. Saber si un elemento es hoja en el Heap (esHoja)",
    operationalCost: ["T(n) = 5"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Determina si un elemento es hoja en el Heap.
 */
private boolean esHoja(int pos) {
    return ((pos >= peso / 2) && (pos < peso));
}
    `
  },
  {
    title: "8. Eliminar un elemento cualquiera del Heap (eliminar)",
    operationalCost: ["T(n) = 41n + 56"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina un elemento cualquiera del Heap.
 */
public T eliminar(T info) {
    int pos = this.getPos(info);
    T x;
    if (pos == (-1))
        return null;
    if (pos == (peso - 1)) {
        x = this.datos[peso - 1];
        this.peso--;
        this.datos[peso] = null;
        return x;
    } else {
        this.datos = intercambiar(this.datos, pos, --peso);
        while ((pos > 0) && (((Comparable) this.datos[pos]).compareTo(this.datos[this.getPosPadre(pos)]) > 0)) {
            this.datos = intercambiar(this.datos, pos, this.getPosPadre(pos));
            pos = this.getPosPadre(pos);
        }
        if (peso != 0)
            reorganiza(pos);
    }
    x = this.datos[peso];
    this.datos[peso] = null;
    return x;
}
    `
  },
  {
    title: "9. Intercambiar información de un vector dadas sus posiciones (intercambiar)",
    operationalCost: ["T(n) = 5"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Intercambia información de dos posiciones en el vector.
 */
private T[] intercambiar(T[] h, int p1, int p2) {
    T temp = h[p1];
    h[p1] = h[p2];
    h[p2] = temp;
    return h;
}
    `
  },
  {
    title: "10. Obtener los datos existentes dentro del Heap (getDatos)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna los datos existentes dentro del Heap.
 */
public T[] getDatos() {
    return this.datos;
}
    `
  },
  {
    title: "11. Saber si un dato se encuentra en el Heap (esta)",
    operationalCost: ["T(n) = 4n + 7"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Determina si un dato existe dentro del Heap.
 */
public boolean esta(T info) {
    for (int i = 0; i < this.peso; i++)
        if (this.datos[i].equals(info))
            return true;
    return false;
}
    `
  },
  {
    title: "12. Obtener un Iterador por niveles del Heap (impNiveles)",
    operationalCost: ["T(n) = n(KTE) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador para recorrer el Heap por niveles.
 */
public Iterator<T> impNiveles() {
    ListaCD<T> l = new ListaCD<T>();
    for (int i = 0; i < this.peso; i++)
        l.insertarAlFinal(this.datos[i]);
    return l.iterator();
}
    `
  },
  {
    title: "13. Conocer el peso del Heap (getPeso)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna el peso del Heap.
 */
public int getPeso() {
    return this.peso;
}
    `
  },
  {
    title: "14. Saber si el Heap está vacío (esVacio)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Determina si el Heap está vacío.
 */
public boolean esVacio() {
    return (this.peso < 1);
}
    `
  },
  {
    title: "15. Conocer la altura del Heap (getAltura)",
    operationalCost: ["T(n) = n(KTE) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la altura del Heap.
 */
public int getAltura() {
    int alt = 0;
    while (Math.pow(2, alt) <= peso)
        alt++;
    return alt;
}
    `
  },
  {
    title: "16. Ordenar un vector por HeapSort (heapSort)",
    operationalCost: ["T(n) = 22n^2 + 33n + 12"],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Ordena los datos usando HeapSort.
 */
public T[] heapSort() {
    T aux[] = (T[]) new Object[this.datos.length];
    for (int i = this.peso - 1; i >= 0; i--) {
        aux[i] = this.eliminarRaiz();
    }
    return aux;
}
    `
  },
  {
    title: "17. Limpiar la información de los datos (limpiar)",
    operationalCost: ["T(n) = 4n + 5"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Limpia la información de los datos en el Heap.
 */
public void limpiar() {
    for (; this.peso >= 0; this.peso--)
        this.datos[this.peso] = null;
    this.peso = 0;
}
    `
  },
  {
    title: "18. Obtener la posición del padre en el Heap (getPosPadre)",
    operationalCost: ["T(n) = 4"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene la posición del padre en el Heap.
 */
private int getPosPadre(int hijo) {
    if (hijo <= 0)
        return -1;
    return (hijo - 1) / 2;
}
    `
  },
  {
    title: "19. Obtener hijo izquierdo (getHijoIzq)",
    operationalCost: ["T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna la posición del hijo izquierdo.
 */
private int getHijoIzq(int posPadre) {
    return ((2 * posPadre) + 1);
}
    `
  },
  {
    title: "20. Obtener hijo derecho (getHijoDer)",
    operationalCost: ["T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna la posición del hijo derecho.
 */
private int getHijoDer(int posPadre) {
    return ((2 * posPadre) + 2);
}
    `
  },
  {
    title: "21. Obtener la posición de un dato en el Heap (getPos)",
    operationalCost: ["T(n) = 4n + 5"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la posición de un dato en el Heap.
 */
private int getPos(T info) {
    for (int i = 0; i < this.peso; i++) {
        if (this.datos[i].equals(info))
            return i;
    }
    return -1;
}
    `
  },
  {
    title: "22. Contar las hojas del Heap (contarHojas)",
    operationalCost: ["T(n) = 10n + 9"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Cuenta la cantidad de hojas en el Heap.
 */
public int contarHojas() {
    int cant = 0;
    for (int i = 0; i < this.peso; i++) {
        if (this.esHoja(i))
            cant++;
    }
    return cant;
}
    `
  },
  {
    title: "23. Retornar las hojas en un listado (getHojas)",
    operationalCost: ["T(n) = n(KTE) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna las hojas del Heap en un listado.
 */
public Iterator getHojas() {
    ListaCD<T> l = new ListaCD<T>();
    for (int i = 0; i < this.peso; i++) {
        if (this.esHoja(i))
            l.insertarAlFinal(this.datos[i]);
    }
    return l.iterator();
}
    `
  },
  {
    title: "24. Eliminar elementos hoja del Heap (podar)",
    operationalCost: ["T(n) = 11n + 10"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina los elementos hoja del Heap.
 */
public void podar() {
    int cant = 0;
    for (int i = 0; i < this.peso; i++) {
        if (this.esHoja(i)) {
            this.datos[i] = null;
            cant++;
        }
    }
    this.peso = this.peso - cant;
}
    `
  },
  {
    title: "25. Recorrido preOrden del Heap (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido preOrden.
 */
public Iterator<T> preOrden() {
    ListaCD<T> l = new ListaCD<T>();
    preOrden(0, l);
    return l.iterator();
}
    `
  },
  {
    title: "26. Recorrido preOrden privado (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: recorrido preOrden.
 */
private void preOrden(int pos, ListaCD<T> l) {
    T r = this.datos[pos];
    if (r != null) {
        l.insertarAlFinal(r);
        preOrden(this.getHijoIzq(pos), l);
        preOrden(this.getHijoDer(pos), l);
    }
}
    `
  },
  {
    title: "27. Recorrido inOrden del Heap (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido inOrden.
 */
public Iterator<T> inOrden() {
    ListaCD<T> l = new ListaCD<T>();
    inOrden(0, l);
    return l.iterator();
}
    `
  },
  {
    title: "28. Recorrido inOrden privado (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: recorrido inOrden.
 */
private void inOrden(int pos, ListaCD<T> l) {
    T r = this.datos[pos];
    if (r != null) {
        inOrden(this.getHijoIzq(pos), l);
        l.insertarAlFinal(r);
        inOrden(this.getHijoDer(pos), l);
    }
}
    `
  },
  {
    title: "29. Recorrido postOrden del Heap (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido postOrden.
 */
public Iterator<T> postOrden() {
    ListaCD<T> l = new ListaCD<T>();
    postOrden(0, l);
    return l.iterator();
}
    `
  },
  {
    title: "30. Recorrido postOrden privado (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: recorrido postOrden.
 */
private void postOrden(int pos, ListaCD<T> l) {
    T r = this.datos[pos];
    if (r != null) {
        postOrden(this.getHijoIzq(pos), l);
        postOrden(this.getHijoDer(pos), l);
        l.insertarAlFinal(r);
    }
}
    `
  },
  {
    title: "31. Convertir el Heap a String (toString)",
    operationalCost: ["T(n) = n(KTE) + 9"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Convierte el Heap a String.
 */
@Override
public String toString() {
    String cad = "";
    for (int i = 0; i < this.peso; i++) {
        cad += this.datos[i].toString() + "-";
    }
    return cad;
}
    `
  },
];
