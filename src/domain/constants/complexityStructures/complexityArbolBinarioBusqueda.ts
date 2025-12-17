export const complexityArbolBinarioBusqueda = [
  {
    title: "1. Método Constructor vacío",
    operationalCost: [
      "T(n) = 1"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Binario de Busqueda vacio. 
 * post:  Se creo un Arbol Binario de Busqueda vacio. 
 */
public ArbolBinarioBusqueda() {
      1
    super();
}
    `
  },
  {
    title: "2. Método Constructor con raíz predeterminada",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un arbol con una raiz predefinida. 
 * post:  Se creo un Arbol Binario de Busqueda con raiz predeterminada. 
 * @param raiz  un tipo T, almacena la direccion de memoria de un nodo de un Arbol Binario de Busqueda. 
 */
public ArbolBinarioBusqueda(T raiz) {
      KTE
    super(raiz);
}
    `
  },
  {
    title: "3. Obtener la raíz del Árbol (getRaiz)",
    operationalCost: [
      "T(n) = 2"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public NodoBin<T> getRaiz() {
       1         1
    return (super.getRaiz());
}
    `
  },
  {
    title: "4. Conocer el objeto raíz del Árbol (getObjRaiz)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite conocer el objeto raiz del Arbol Binario de Busqueda. 
 * post:  Se retorno el objeto raiz del Arbol. 
 * @return Un objeto de tipo T que representa el dato en la raiz del Arbol.
 */
@Override
public T getObjRaiz() {
       1        KTE
    return super.getObjRaiz();
}
    `
  },
  {
    title: "5. Insertar un dato en el Árbol (insertar)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1) + 1T(n/2) + O(1) + 8"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Metodo que permite insertar un dato en el Arbol Binario de Busqueda. 
 * post:  Se inserto un nuevo dato al Arbol Binario de Busqueda. 
 * @param dato un elemento tipo T que se desea almacenar en el arbol. 
 * @return  true si el elemento fue insertado o false en caso contrario
 */
public boolean insertar(T dato) {
       1             1   1T(n/2)+O(1)  1           1T(n/2)+O(1) 1
    NodoBin<T> rr = this.esta(dato) ? null : insertar(this.getRaiz(), dato);
           1
    if (rr != null)
            1
        this.setRaiz(rr);
       1        1
    return (rr != null);
}
    `
  },
  {
    title: "6. Insertar según orden (insertar privado)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1)"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Metodo que permite insertar un dato en el Arbol Binario de Busqueda segun factor de ordenamiento. 
 * post:  Se inserto ordenado un nuevo dato al Arbol Binario de Busqueda. 
 * @param r de tipo NoboBin<T> que representa la raiz del arbol. 
 * @param dato elemento a insertar en el arbol de forma ordenada. 
 * @return true si el elemento fue insertado o false en caso contrario
 */
private NodoBin<T> insertar(NodoBin<T> r, T dato) {
           1
    if (r == null)
           1     1                   
        return (new NodoBin<T>(dato, null, null));
     1                  1        1          1
    int compara = ((Comparable) r.getInfo()).compareTo(dato);
                1
    if (compara > 0)
         1                 1
        r.setIzq(insertar(r.getIzq(), dato));
    else
    //Peor de los casos
                1
    if (compara < 0)
                 //llamado recursivo 1
         1                 1 
        r.setDer(insertar(r.getDer(), dato));
    else {
                1                                  1     1
        System.err.println("Error dato duplicado:" + dato.toString());
    }
       1
    return r;
}
    `
  },
  {
    title: "7. Borrar un elemento (eliminar)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n) + 1T(n/2) + O(n) + 6"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite borrar un elmento del Arbol Binario de Busqueda. 
 * post:  Se elimino el elemento en el Arbol Binario de Busqueda. 
 * @param x dato que se desea eliminar. 
 * @return  el dato borrado o null si no lo encontro
 */
@Override
public boolean eliminar(T x) {
        1    1T(n/2)+O(1)
    if (!this.esta(x)) {
          1
        return (false);
    }
       1            1     1T(n/2)+O(n)   1
    NodoBin<T> z = eliminarABB(this.getRaiz(), x);
        1
    this.setRaiz(z);
       1
    return (true);
}
    `
  },
  {
    title: "8. Eliminar por orden (eliminarABB privado)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo de tipo privado que permite eliminar un dato en el Arbol Binario de Busqueda segun factor de ordenamiento, manteniendo su propiedad de orden,
 * para esto se busca el menor de los derechos y lo intercambia por el dato que desea eliminar.
 */
private NodoBin<T> eliminarABB(NodoBin<T> r, T x) {
          1
    if (r == null)
          1
        return null; //<--Dato no encontrado		
     1          1       1        1          1
    int compara = ((Comparable) r.getInfo()).compareTo(x);
                1
    if (compara > 0)
         1                    1
        r.setIzq(eliminarABB(r.getIzq(), x));
    else
                1   
    if (compara < 0)
         1                    1
        r.setDer(eliminarABB(r.getDer(), x));
    else {
        //Peor de los casos
             1          1       1  1          1
        if (r.getIzq() != null && r.getDer() != null) {
               1                  1      4n + 5           1
            NodoBin<T> cambiar = this.masIzquierda(r.getDer());
            1     1        1
            T aux = cambiar.getInfo();
                   1         1
            cambiar.setInfo(r.getInfo());
             1
            r.setInfo(aux);
                    //llamado recursivo 1
             1                    1
            r.setDer(eliminarABB(r.getDer(), x));
        } else {
              1   1          1       1  1            1
            r = (r.getIzq() != null) ? r.getIzq() : r.getDer();
        }
    }
      1
    return r;
}
    `
  },
  {
    title: "9. Buscar menor dato (masIzquierda)",
    operationalCost: [
      "T(n) = 4n + 5"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que busca el menor dato del arbol. El menor dato del arbol se encuentra en el nodo mas izquierdo. 
 * post:  Se retorno el nodo mas izquierdo del arbol. 
 * @param r reprenta la raiz del arbol. 
 * @return el nodo mas izquierdo del arbol
 */
@SuppressWarnings("empty-statement")
protected NodoBin<T> masIzquierda(NodoBin<T> r) {
            1          1         1  1
    for (; r.getIzq() != null; r = r.getIzq());
       1    
    return (r);
}
    `
  },
  {
    title: "10. Evaluar existencia de dato (estaABB)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1) + 2"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Metodo que permite evaluar la existencia de un dato dentro del Arbol Binario de Busqueda. 
 */
public boolean estaABB(T x) {
      1  1T(n/2)+O(1) 1
    return (esta(this.getRaiz(), x));
}
    `
  },
  {
    title: "11. Buscar existencia (esta privado)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1)"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
private boolean esta(NodoBin<T> r, T x) {
           1
    if (r == null)
           1
        return (false);
      1                  1       1          1
    int compara = ((Comparable) r.getInfo()).compareTo(x);
                1
    if (compara > 0)
           1           1
        return (esta(r.getIzq(), x));
    else
    //Peor de los casos
                1
    if (compara < 0)
           1          1
        return (esta(r.getDer(), x));
    else
           1
        return (true);
}
    `
  },
  {
    title: "12. Consultar un elemento (buscar)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + 2"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
protected NodoBin<T> buscar(T info) {
      1   2T(n/2)+O(1) 1
    return (buscar(this.getRaiz(), info));
}
    `
  },
  {
    title: "13. Consultar elemento (buscar privado)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
protected NodoBin<T> buscar(NodoBin<T> r, T info) {
           1
    if (r == null)
           1
        return (null);
         1         1
    if (r.getInfo().equals(info))
           1
        return r;
    else {
        NodoBin<T> aux = (r.getIzq() == null) ? null : buscar(r.getIzq(), info);
        if (aux != null)
            return (aux);
        else   
            return (r.getDer() == null) ? null : buscar(r.getDer(), info);
    }
}
    `
  },
  {
    title: "14. Iterador de hojas (getHojas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public Iterator<T> getHojas() {
       1         KTE
    return (super.getHojas());
}
    `
  },
  {
    title: "15. Contar hojas (contarHojas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public int contarHojas() {
       1         KTE
    return (super.contarHojas());
}
    `
  },
  {
    title: "16. Recorrido Pre Orden (preOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public Iterator<T> preOrden() {
       1         KTE
    return (super.preOrden());
}
    `
  },
  {
    title: "17. Recorrido In Orden (inOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public Iterator<T> inOrden() {
       1         KTE
    return (super.inOrden());
}
    `
  },
  {
    title: "18. Recorrido Post Orden (postOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public Iterator<T> postOrden() {
       1         KTE   
    return (super.postOrden());
}
    `
  },
  {
    title: "19. Recorrido por niveles (impNiveles)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public Iterator<T> impNiveles() {
       1         KTE
    return (super.impNiveles());
}
    `
  },
  {
    title: "20. Obtener peso del Árbol (getPeso)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public int getPeso() {
       1         KTE
    return (super.getPeso());
}
    `
  },
  {
    title: "21. Saber si el árbol está vacío (esVacio)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public boolean esVacio() {
       1         KTE
    return (super.esVacio());
}
    `
  },
  {
    title: "22. Obtener altura del Árbol (getAltura)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
@Override
public int getAltura() {
       1         KTE
    return (super.getAltura());
}
    `
  },
  {
    title: "23. Clonar el Árbol (clonar)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + 5"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
@Override
public ArbolBinarioBusqueda<T> clonar() {
            1                    1  1
    ArbolBinarioBusqueda<T> t = new ArbolBinarioBusqueda<T>();
     1        2T(n/2)+O(1)  1
    t.setRaiz(clonarABB(this.getRaiz()));
    return (t);
}
    `
  },
  {
    title: "24. Clonar el Árbol (clonarABB privado)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
private NodoBin<T> clonarABB(NodoBin<T> r) {
           1
    if (r == null)
           1
        return r;
    else {
        NodoBin<T> aux = new NodoBin<T>(r.getInfo(), clonarABB(r.getIzq()), clonarABB(r.getDer()));
        return aux;
    }
}
    `
  },
  {
    title: "25. Mostrar información del Árbol (imprime)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + 2"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
@Override
public void imprime() {
            1
    System.out.println(" ----- Arbol Binario de Busqueda ----- ");
      2T(n/2)+O(1)       1
    this.imprimeABB(super.getRaiz());
}
    `
  },
  {
    title: "26. Mostrar información del Árbol (imprimeABB privado)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n log₂(n))",
    javaCode: `
public void imprimeABB(NodoBin<T> n) {
    1   1
    T l = null;
    1   1
    T r = null;
          1
    if (n == null)
          1
        return;
         1          1
    if (n.getIzq() != null) {
          1  1        1
        l = n.getIzq().getInfo();
    }
         1          1
    if (n.getDer() != null) {
          1  1        1
        r = n.getDer().getInfo();
    }
            1                      1   1             1  1          1                1
    System.out.println("NodoIzq: " + l + "\\t Info: " + n.getInfo() + "\\t NodoDer: " + r);
         1          1
    if (n.getIzq() != null) {
        //llamado Recursivo 1
                    1
        imprimeABB(n.getIzq());
    }
         1          1
    if (n.getDer() != null) {
        //llamado Recursivo 2
                    1
        imprimeABB(n.getDer());
    }
}
    `
  }
];
