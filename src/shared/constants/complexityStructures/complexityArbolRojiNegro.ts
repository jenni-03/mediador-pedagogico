export const complexityArbolRojiNegro = [
  {
    title: "1. Constructor Vacío (ArbolRojiNegro)",
    operationalCost: [
      "T(n) = 1 + 2 + 1 + 1 + 1 + 1 + 1 = 8"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un arbol RojiNegro vacio. 
 * post:  Se creo un arbol RojiNegro vacio. 
 */
public ArbolRojiNegro() {
       1
    super();
         1         1
    nulo = new NodoRN<T>();
            1
    nulo.setInfo(null);
            1
    nulo.setPadre(nulo);
           1
    nulo.setIzq(nulo);
            1
    nulo.setDer(nulo);
            1
    nulo.setColor(1);
}
    `
  },
  {
    title: "2. Constructor Raíz Predefinida (ArbolRojiNegro)",
    operationalCost: [
      "T(n) = KTE + 1"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un arbol con una raiz predefinida. 
 * post:  Se creo un arbol RojiNegro con una raiz predefinida. 
 * @param r Representa la raiz del ArbolRojiNegro que se quiere crear.
 */
public ArbolRojiNegro(T r) {
             KTE        1
    super.setRaiz(new NodoRN<T>(r));
}
    `
  },
  {
    title: "3. Obtener objeto de la raíz (getObjRaiz)",
    operationalCost: [
      "T(n) = 1 + KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite conocer el objeto raiz del Arbol RojiNegro. 
 * post:  Se retorno el objeto raiz del Arbol. 
 * @return Un objeto de tipo T que representa el dato en la raiz del Arbol.
 */
@Override
public T getObjRaiz() {
       1              KTE
    return (super.getObjRaiz());
}
    `
  },
  {
    title: "4. Insertar dato (insertar)",
    operationalCost: [
      "T(n) = n(KTE) + KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite insertar un dato en el arbol Rojinegro. 
 * post:  Se inserto un nuevo dato al arbol Rojinegro. 
 * @param dato un elemento tipo T que se desea almacenar en el arbol. 
 * @return  true si el elemento fue insertado o false en caso contrario.
 */
@Override
public boolean insertar(T dato) {
    //Insertarlo como en ABB y con color 0.
               1   1       1      
    NodoRN<T> z = new NodoRN<T>(dato, nulo, nulo, nulo);
    //codigo del PDF
           1       1
    NodoRN<T> y = nulo;
           1       1         1              KTE
    NodoRN<T> x = (NodoRN<T>) super.getRaiz();
              1      1       1       1
    while (x != null && x.getInfo() != null) {
          1
        y = x;
            1       1        1            1          KTE         1
        int compara = ((Comparable) z.getInfo()).compareTo(x.getInfo());
                    1
        if (compara < 0)
              1      1
            x = x.getIzq();
        else
              1      1
            x = x.getDer();
    }
           1
    z.setPadre(y);
              1      1
    if (y.getInfo() == null)
        //Mejor de los casos
                KTE
        super.setRaiz(z);
    else {
        //Peor de los casos
              1     1       1             1         KTE         1
        int compara = ((Comparable) z.getInfo()).compareTo(y.getInfo());
                    1
        if (compara < 0)
                 1
            y.setIzq(z);
        else
                 1
            y.setDer(z);
    }
         1
    z.setIzq(nulo);
        1
    z.setDer(nulo);
        1
    z.setColor(0);
         (61(n) + KTE)
    corregirInsercion(z);
          1
    return (true);
}
    `
  },
  {
    title: "5. Corregir inserción propiedades (corregirInsercion)",
    operationalCost: [
      "T(n) = 61(n) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite corregir las propiedades del ArbolRojiNegro despues de realizada la insercion del dato. 
 * @param z Representa la raiz del Arbol del arbol RojiNegro. 
 */
private void corregirInsercion(NodoRN<T> z) {
            1
    NodoRN<T> y;
                 1         1        1
    while (z.getPadre().getColor() == 0) {
        // ... lógica de balanceo ...
    }
           1                 KTE          1
    ((NodoRN<T>) super.getRaiz()).setColor(1);
}
    `
  },
  {
    title: "6. Buscar nodo (buscarRN)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n log₂(n)) → O(n)",
    javaCode: `
/**
 * Metodo que permite buscar un Nodo RojiNegro y conocer su informacion y direccion de memoria. 
 * @param r Representa la raiz del Arbol o subarbol del rojinegro. 
 * @param info Representa la informacion del Nodo que se quieren ubicar. 
 * @return Un objeto de tipo NodoRN<T> con el Nodo que contiene la informacion que desea buscar.
 */
private NodoRN<T> buscarRN(NodoRN<T> r, T info) {
           1      1       1       1
    if (r == null || r.getInfo() == null)
        //Mejor de los casos
              1
        return (nulo);
             1         2
    if (r.getInfo().equals(info))
        //Mejor de los casos
            1
        return r;
    else {
        //Peor de los casos
        NodoRN<T> aux = ((r.getIzq().getInfo() == null)) ? nulo : buscarRN(r.getIzq(), info);
        if (aux != nulo && aux.getInfo() != null)
            //Mejor de los casos
            return (aux);
        else
            return ((r.getDer().getInfo() == null)) ? nulo : buscarRN(r.getDer(), info);
    }
}
    `
  },
  {
    title: "7. Eliminar dato del árbol (eliminar)",
    operationalCost: [
      "T(n) = 2[1T(n/2)] + 2[O(n)] + 29"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo de tipo publico que permite eliminar un dato del Arbol RojiNegro. 
 * @param x Representa el dato de tipo T que desea ser eliminado del ArbolRojinegro.
 * @return Un objeto de tipo boolean con true si se pudo eliminar exitosamente y false en caso contrario.
 */
@Override
public boolean eliminar(T x) {
            1      1 (2T(n/2) + O(1))     1             KTE
    NodoRN<T> n = buscarRN((NodoRN<T>) super.getRaiz(), x);
           1      1       1       1
    if (n == nulo || n.getInfo() == null)
        //Mejor de los casos
        return (false); //No encontrado
    
    eliminarRN(n);
          1
    return (true);
}
    `
  },
  {
    title: "8. Eliminar dato del árbol (eliminarRN)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1) + n(KTE) + KTE"
    ],
    complexity: "Big O = O(n * log(n))",
    javaCode: `
/**
 * Metodo que permite eliminar un dato de un Arbol Rojinegro. 
 * @param z Representa la raiz del Arbol Rojinegro. 
 * @return Un objeto de tipo NodoRN<T> con la informacion del Nodo desconectado del Arbol. 
 */
public NodoRN<T> eliminarRN(NodoRN<T> z) {
            2
    NodoRN<T> x, y;
    if (z.getIzq().getInfo() != null && z.getDer().getInfo() != null)
        //Peor de los casos
        y = getMayor(z.getIzq()); //también sirve buscarMin(z.getDer())
    else
        //Mejor de los casos
        y = z;
    if (y.getIzq().getInfo() != null)
        x = y.getIzq();
    else
        x = y.getDer();
    x.setPadre(y.getPadre());
    if (y.getPadre().getInfo() == null)
        //Mejor de los casos
        super.setRaiz(x);
    else {
        if (y == y.getPadre().getIzq())
            y.getPadre().setIzq(x);
        else
            y.getPadre().setDer(x);
    }
    if (y.getInfo() != z.getInfo())
        z.setInfo(y.getInfo()); //copiar datos adicionales si aplica
    if (y.getColor() == 1)
        corregirBorrado(x);
    return (y);
}
    `
  },
  {
    title: "9. Corregir borrado propiedades (corregirBorrado)",
    operationalCost: [
      "T(n) = n(KTE) + KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite corregir las propiedades del ArbolRojinegro despues de realizada la eliminacion del dato. 
 * @param x Representa el NodoRN desde el cual se desea corregir las propiedades del Arbol.
 */
private void corregirBorrado(NodoRN<T> x) {
    // Lógica interna del balanceo del árbol RojiNegro...
    x.setColor(1);
}
    `
  },
  {
    title: "10. Obtener elemento menor (getMenor)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n * log(n))",
    javaCode: `
/**
 * Metodo que permite conocer el elemento menor al NodoRN recibido. 
 * @param r Representa el NodoRN del cual se desea hallar el Nodo menor. 
 * @return El Nodo menor por la Izquierda del NodoRN recibido.
 */
private NodoRN<T> getMenor(NodoRN<T> r) {
        1       1      1      /*Llamado Recursivo 1*/ 1
    return r.getIzq() == nulo ? r : getMenor(r.getIzq());
}
    `
  },

  {
    title: "11. Obtener Elemento Mayor Árbol (getMayor)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n * log(n))",
    javaCode: `
/**
 * Metodo que permite conocer el elemento mayor al NodoRN recibido. 
 * @param r Representa el NodoRn del cual se desea hallar el Nodo mayor. 
 * @return El Nodo mayor por la Derecha del NodoRn recibido.
 */
private NodoRN<T> getMayor(NodoRN<T> r) {
    return r.getDer().getInfo() == null ? r : getMayor(r.getDer());
}
    `
  },
  {
    title: "12. Rotar Izquierda Árbol (rotarIzq)",
    operationalCost: [
      "T(n) = 19"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite rotar hacia la izquierda para mantener la altura negra. 
 * post:  Se realizó una rotación hacia la izquierda en el arbol RojiNegro. 
 * @param t representa la raiz del arbol 
 */
public void rotarIzq(NodoRN<T> t) {
    NodoRN<T> t2 = t.getDer();
    t.setDer(t2.getIzq());
    t2.getIzq().setPadre(t);
    t2.setPadre(t.getPadre());
    if (t.getPadre().getInfo() == null) {
        super.setRaiz(t2);
        t2.setPadre(nulo);
    } else {
        if (t == t.getPadre().getIzq())
            t.getPadre().setIzq(t2);
        else
            t.getPadre().setDer(t2);
    }
    t2.setIzq(t);
    t.setPadre(t2);
}
    `
  },
  {
    title: "13. Rotar Derecha Árbol (rotarDer)",
    operationalCost: [
      "T(n) = 19"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite rotar hacia la derecha para mantener la altura negra. 
 * post:  Se realizó una rotación hacia la derecha en el arbol RojiNegro. 
 * @param t representa la raiz del arbol. 
 */
public void rotarDer(NodoRN<T> t) {
    NodoRN<T> t2 = t.getIzq();
    t.setIzq(t2.getDer());
    t2.getDer().setPadre(t);
    t2.setPadre(t.getPadre());
    if (t.getPadre().getInfo() == null) {
        super.setRaiz(t2);
        t2.setPadre(nulo);
    } else {
        if (t == t.getPadre().getIzq())
            t.getPadre().setIzq(t2);
        else
            t.getPadre().setDer(t2);
    }
    t2.setDer(t);
    t.setPadre(t2);
}
    `
  },
  {
    title: "14. Consultar Existencia Dato en el Árbol (esta)",
    operationalCost: [
      "T(n) = 19"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite saber si existe un dato en el arbol RojiNegro. 
 * post:  Se retorno true si el elemento se encuentra en el arbol RojiNegro. 
 * @param x 
 * @return un boolean, true si el dato está o false en caso contrario.
 */
@Override
public boolean esta(T x) {
    return (estaRN((NodoRN<T>) super.getRaiz(), x));
}
    `
  },
  {
    title: "15. Consultar Existencia Dato en el Árbol Private (estaRN)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n * log(n))",
    javaCode: `
/**
 * Metodo que permite conocer si un elemento específico se encuentra en el arbol. 
 * post:  Se retorno true si el elemento se encuentra en el arbol. 
 * @param r representa la raiz del arbol. 
 * @param x representa la información del elemento a buscar. 
 * @return un boolean, true si el dato está o false en caso contrario.
 */
private boolean estaRN(NodoRN<T> r, T x) {
    if (r == null || r.getInfo() == null)
        return false;
    int compara = ((Comparable) r.getInfo()).compareTo(x);
    if (compara > 0)
        return estaRN(r.getIzq(), x);
    else if (compara < 0)
        return estaRN(r.getDer(), x);
    else
        return true;
}
    `
  },
  {
    title: "16. Obtener Iterador Hojas Árbol (getHojas)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que retorna un iterador con las hojas del arbol binario. 
 * post:  Se retorno un iterador con las hojas del arbol binario.
 * @return un iterador con las hojas del arbol binario 
 */
@Override
public Iterator<T> getHojas() {
    ListaCD<T> l = new ListaCD<T>();
    getHojas((NodoRN<T>) super.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "17. Obtener Iterador Hojas Árbol Privado (getHojas)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo de tipo privado que retorna un iterador con las hojas del arbol binario. 
 * @param r representa la raiz del arbol, o subraiz. 
 * @param l Lista para almacenamiento de los datos del arbol.
 */
private void getHojas(NodoRN<T> r, ListaCD<T> l) {
    if (r != null && r.getInfo() != null) {
        if (this.esHoja(r))
            l.insertarAlFinal(r.getInfo());
        getHojas(r.getIzq(), l);
        getHojas(r.getDer(), l);
    }
}
    `
  },
  {
    title: "18. Obtener Número Hojas en el Árbol (contarHojas)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite determinar el número de nodos hoja dentro del Árbol Binario. 
 * post:  Se retorno el número de hojas del Árbol. 
 * @return El número de hojas existentes en el Árbol Binario.
 */
@Override
public int contarHojas() {
    return contarHojas((NodoRN<T>) super.getRaiz());
}
    `
  },
  {
    title: "19. Obtener Número Hojas en el Árbol Privado (contarHojas)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite determinar el número de nodos hoja dentro del Árbol Binario. 
 * post:  Se retorno el número de hojas del Árbol. 
 * @param r representa la raíz del árbol, o subraiz. 
 * @return El número de hojas existentes en el Árbol Binario.
 */
private int contarHojas(NodoRN<T> r) {
    if (r == null || r.getInfo() == null)
        return 0;
    if (this.esHoja(r))
        return 1;
    int chi = contarHojas(r.getIzq());
    int chd = contarHojas(r.getDer());
    return chi + chd;
}
    `
  },
  {
    title: "20. Valida Hoja en el Árbol (esHoja)",
    operationalCost: [
      "T(n) = 19"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
private boolean esHoja(NodoRN<T> n) {
    return (
      n != null &&
      n.getInfo() != null &&
      (n.getIzq() == null || n.getIzq().getInfo() == null) &&
      (n.getDer() == null || n.getDer().getInfo() == null)
    );
}
    `
  },
    {
    title: "21. Obtener Iterador Pre-Orden (preOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 *  Metodo que retorna un iterador con el recorrido preOrden del Arbol Binario. 
 * post:  Se retorno un iterador en preOrden para el arbol.
 * @return un iterador en preorden (padre->hijoIzq->hijoDer) para el arbol binario.
 */
@Override
public Iterator<T> preOrden() {
    ListaCD<T> l = new ListaCD<T>();
    preOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "22. Obtener Iterador Pre-Orden Privado (preOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que tipo privado que retorna un iterador con el recorrido preOrden del Arbol Binario. 
 * @param r representa la raiz del arbol, o subraiz. 
 * @param l Lista para el almacenamiento de los datos del arbol. 
 */
private void preOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null && r.getInfo() != null) {
        l.insertarAlFinal(r.getInfo());
        preOrden(r.getIzq(), l);
        preOrden(r.getDer(), l);
    }
}
    `
  },
  {
    title: "23. Obtener Iterador In-Orden (inOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que retorna un iterador con el recorrido in Orden del Arbol Binario. 
 * @return un iterador en inOrden (hijoIzq->padre->hijoDer) para el arbol binario. 
 */
@Override
public Iterator<T> inOrden() {
    ListaCD<T> l = new ListaCD<T>();
    inOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "24. Obtener Iterador In-Orden Privado (inOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo de tipo privado que retorna un iterador con el recorrido in Orden del Arbol Binario. 
 * @param r representa la raiz del arbol, o subraiz. 
 * @param l Lista para el almacenamiento de los datos del arbol. 
 */
private void inOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null && r.getInfo() != null) {
        inOrden(r.getIzq(), l);
        l.insertarAlFinal(r.getInfo());
        inOrden(r.getDer(), l);
    }
}
    `
  },
  {
    title: "25. Obtener Iterador en Post-Orden (postOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que retorna un iterador con el recorrido postOrden del Arbol Binario. 
 * @return un iterador en postOrden (hijoIzq->hijoDer->padre) para el arbol binario. 
 */
@Override
public Iterator<T> postOrden() {
    ListaCD<T> l = new ListaCD<T>();
    postOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "26. Obtener Iterador en Post-Orden Private (postOrden)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo de tipo privado que retorna un iterador con el recorrido postOrden del Arbol Binario. 
 * @param r representa la raiz del arbol, o subraiz. 
 * @param l Lista para el almacenamiento de los datos del arbol
 */
private void postOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null && r.getInfo() != null) {
        postOrden(r.getIzq(), l);
        postOrden(r.getDer(), l);
        l.insertarAlFinal(r.getInfo());
    }
}
    `
  },
  {
    title: "27. Obtener Iterador por Niveles Árbol (impNiveles)",
    operationalCost: [
      "T(n) = n(KTE) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite retornar un iterador con el recorrido por niveles del Arbol RojiNegro. 
 * @return un iterador con el recorrido por niveles del Arbol RojiNegro.
 */
@Override
public Iterator<T> impNiveles() {
    ListaCD<T> l = new ListaCD<T>();
    if (!this.esVacio()) {
        Cola<NodoRN<T>> c = new Cola<NodoRN<T>>();
        c.enColar((NodoRN<T>) this.getRaiz());
        NodoRN<T> x;
        while (!c.esVacia()) {
            x = c.deColar();
            l.insertarAlFinal(x.getInfo());
            if (x.getIzq() != null && x.getIzq().getInfo() != null)
                c.enColar(x.getIzq());
            if (x.getDer() != null && x.getDer().getInfo() != null)
                c.enColar(x.getDer());
        }
    }
    return l.iterator();
}
    `
  },
  {
    title: "28. Obtener Peso Árbol (getPeso)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite obtener el peso del Arbol RojiNegro. 
 * @return Un entero con la cantidad de elementos del Arbol RojiNegro.
 */
@Override
public int getPeso() {
    return this.getPesoRN((NodoRN<T>) super.getRaiz());
}
    `
  },
  {
    title: "29. Obtener Peso Árbol Privado (getPesoRN)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
private int getPesoRN(NodoRN<T> r) {
    if (r == null || r.getInfo() == null)
        return 0;
    return getPesoRN(r.getIzq()) + 1 + getPesoRN(r.getDer());
}
    `
  },
  {
    title: "30. Consultar Existencia Elementos Árbol (esVacio)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite saber si el arbol se encuentra vacio. 
 * @return true si no hay datos en el arbol.
 */
@Override
public boolean esVacio() {
    return (((NodoRN<T>) super.getRaiz()) == null || ((NodoRN<T>) super.getRaiz()).getInfo() == null);
}
    `
  },
  {
    title: "31. Obtener Altura Árbol (getAltura)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite obtener la altura del Arbol RojiNegro. 
 * @return Un entero con la altura del Arbol RojiNegro.
 */
@Override
public int getAltura() {
    if (super.getRaiz() == null || super.getRaiz().getInfo() == null)
        return 0;
    return getAltura((NodoRN<T>) this.getRaiz());
}
    `
  },
  {
    title: "32. Obtener Altura Árbol Private (getAltura)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
private int getAltura(NodoRN<T> r) {
    int ai = 0, ad = 0;
    if (r.getIzq().getInfo() != null)
        ai = getAltura(r.getIzq());
    if (r.getDer().getInfo() != null)
        ad = getAltura(r.getDer());
    if (ai >= ad)
        return ai + 1;
    return ad + 1;
}
    `
  },
  {
    title: "33. Limpiar Árbol (limpiar)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite limpiar la informacion del Arbol Rojinegro.
 */
public void limpiar() {
    super.setRaiz(null);
}
    `
  },
  {
    title: "34. Clonar Árbol (clonar)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite clonar la informacion de un Arbol Rojinegro en un nuevo Arbol RojiNegro con la misma informacion. 
 * @return Un nuevo ArbolRojiNegro con la misma informacion del ArbolRojiNegro actual. 
 */
@Override
public ArbolRojiNegro<T> clonar() {
    ArbolRojiNegro<T> t = new ArbolRojiNegro<T>();
    t.setRaiz(clonarRN((NodoRN<T>) getRaiz(), nulo));
    return t;
}
    `
  },
  {
    title: "35. Clonar Árbol Private (clonarRN)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
private NodoBin<T> clonarRN(NodoRN<T> r, NodoRN<T> p) {
    if (r == null || r.getInfo() == null)
        return r;
    else {
        NodoRN<T> aux = new NodoRN<T>(r.getInfo());
        aux.setColor(r.getColor());
        aux.setPadre(p);
        aux.setIzq(clonarRN(r.getIzq(), aux));
        aux.setDer(clonarRN(r.getDer(), aux));
        return aux;
    }
}
    `
  },
  {
    title: "36. Imprimir Árbol (imprime)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite imprimir los datos que contiene el Arbol RojiNegro. 
 */
@Override
public void imprime() {
    this.imprimeRN((NodoRN<T>) getRaiz());
}
    `
  },
  {
    title: "37. Imprimir Árbol Privado (imprimeRN)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite imprimir los datos que contiene el Arbol RojiNegro. 
 * @param n representa la raiz o subraiz del Arbol RojiNegro. 
 */
public void imprimeRN(NodoRN<T> n) {
    int l = -1, r = -1, p = -1;
    if (n.getIzq() != nulo)
        l = Integer.parseInt(n.getIzq().getInfo().toString());
    if (n.getDer() != nulo)
        r = Integer.parseInt(n.getDer().getInfo().toString());
    if (n.getPadre() != nulo)
        p = Integer.parseInt(n.getPadre().getInfo().toString());
    System.out.println("Izquierdo: " + l + " Info: " + n.getInfo() + " Derecha: " + r + " Padre: " + p + " Color: " + n.getColor() + "\\n");
    if (n.getIzq() != nulo)
        imprimeRN(n.getIzq());
    if (n.getDer() != nulo)
        imprimeRN(n.getDer());
}
    `
  },
];
