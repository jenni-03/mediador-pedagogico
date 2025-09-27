export const complexityArbolSplay = [
  {
    title: "1. Metodo Constructor, Arbol Splay vacio",
    operationalCost: [
      "T(n) = 1"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Splay vacio con sus datos Nulos. 
 */
public ArbolSplay() {
    super();
}
    `
  },
  {
    title: "2. Metodo Constructor, Arbol Splay con una raiz predefinida",
    operationalCost: [
      "T(n) = 1"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Splay con una raiz predefinida. 
 * @param raiz Un objeto de tipo T.
 */
public ArbolSplay(T raiz) {
    super(raiz);
}
    `
  },
  {
    title: "3. Conocer el objeto almacenado en la raiz del Arbol Splay (getObjRaiz)",
    operationalCost: [
      "T(n) = 1 + KTE = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite conocer el objeto almacenado en la raiz del Arbol Splay.
 */
@Override
public T getObjRaiz() {
    return super.getObjRaiz();
}
    `
  },
  {
    title: "4. Insertar un dato en el Arbol Splay de manera que este se ubique en la raiz (insertar)",
    operationalCost: [
      "T(n) = T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Inserta un dato en el Arbol Splay de manera que este se ubique en la raiz.
 */
@Override
public boolean insertar(T dato) {
    if (esVacio()) {
        super.setRaiz(new NodoBin<T>(dato));
        return true;
    }
    super.setRaiz(buscarAS(dato));
    int cmp = ((Comparable) dato).compareTo(super.getRaiz().getInfo());
    if (cmp < 0) {
        NodoBin<T> n = new NodoBin<T>(dato);
        n.setIzq(super.getRaiz().getIzq());
        n.setDer(super.getRaiz());
        super.getRaiz().setIzq(null);
        super.setRaiz(n);
        return true;
    } else if (cmp > 0) {
        NodoBin<T> n = new NodoBin<T>(dato);
        n.setDer(super.getRaiz().getDer());
        n.setIzq(super.getRaiz());
        super.getRaiz().setDer(null);
        super.setRaiz(n);
        return true;
    }
    return false;
}
    `
  },
  {
    title: "5. Trasladar un nodo x, que es el nodo al que se accede, a la raíz (biselar)",
    operationalCost: [
      "T(n) = T(n/2) + O(1)"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Traslada un nodo x a la raíz (splaying).
 */
private NodoBin<T> biselar(NodoBin<T> r, T dato) {
    if (r == null)
        return null;
    int cmp1 = ((Comparable) dato).compareTo(r.getInfo());
    if (cmp1 < 0) {
        if (r.getIzq() == null)
            return r;
        int cmp2 = ((Comparable) dato).compareTo(r.getIzq().getInfo());
        if (cmp2 < 0) {
            r.getIzq().setIzq(biselar(r.getIzq().getIzq(), dato));
            r = rDerecha(r);
        } else if (cmp2 > 0) {
            r.getIzq().setDer(biselar(r.getIzq().getDer(), dato));
            if (r.getIzq().getDer() != null)
                r.setIzq(rIzquierda(r.getIzq()));
        }
        if (r.getIzq() == null)
            return r;
        else
            return rDerecha(r);
    } else if (cmp1 > 0) {
        if (r.getDer() == null)
            return r;
        int cmp2 = ((Comparable) dato).compareTo(r.getDer().getInfo());
        if (cmp2 < 0) {
            r.getDer().setIzq(biselar(r.getDer().getIzq(), dato));
            if (r.getDer().getIzq() != null)
                r.setDer(rDerecha(r.getDer()));
        } else if (cmp2 > 0) {
            r.getDer().setDer(biselar(r.getDer().getDer(), dato));
            r = rIzquierda(r);
        }
        if (r.getDer() == null)
            return r;
        else
            return rIzquierda(r);
    } else return r;
}
    `
  },
  {
    title: "6. Efectuar una rotacion simple hacia la derecha de un Nodo (rDerecha)",
    operationalCost: [
      "T(n) = 7"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Rotacion simple hacia la derecha de un nodo.
 */
private NodoBin<T> rDerecha(NodoBin<T> r) {
    NodoBin<T> x = r.getIzq();
    r.setIzq(x.getDer());
    x.setDer(r);
    return x;
}
    `
  },
  {
    title: "7. Efectuar una rotacion simple hacia la izquierda de un Nodo (rIzquierda)",
    operationalCost: [
      "T(n) = 7"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Rotacion simple hacia la izquierda de un nodo.
 */
private NodoBin<T> rIzquierda(NodoBin<T> r) {
    NodoBin<T> x = r.getDer();
    r.setDer(x.getIzq());
    x.setIzq(r);
    return x;
}
    `
  },
  {
    title: "8. Eliminar un dato del Arbol Splay (eliminar)",
    operationalCost: [
      "T(n) = T(n/2) + O(1)"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Elimina un dato del Arbol Splay.
 */
@Override
public boolean eliminar(T dato) {
    if (esVacio())
        return false;
    super.setRaiz(buscarAS(dato));
    int cmp = ((Comparable) dato).compareTo(super.getRaiz().getInfo());
    if (cmp == 0) {
        if (super.getRaiz().getIzq() == null) {
            super.setRaiz(super.getRaiz().getDer());
        } else {
            NodoBin<T> x = super.getRaiz().getDer();
            super.setRaiz(super.getRaiz().getIzq());
            super.setRaiz(biselar(super.getRaiz(), dato));
            super.getRaiz().setDer(x);
        }
        return true;
    }
    return false;
}
    `
  },
  {
    title: "9. Hallar un elemento dentro del Arbol Splay (buscarAS)",
    operationalCost: [
      "T(n) = T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Hallar un elemento dentro del Arbol Splay.
 */
private NodoBin<T> buscarAS(T dato) {
    if (esVacio())
        return null;
    return biselar(super.getRaiz(), dato);
}
    `
  },
  {
    title: "10. Evaluar la existencia de un objeto dentro del Arbol Splay (estaAS)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Evalua la existencia de un objeto dentro del Arbol Splay.
 */
public boolean estaAS(T dato) {
    if (esVacio())
        return false;
    super.setRaiz(buscarAS(dato));
    return super.getRaiz().getInfo().equals(dato);
}
    `
  },
  {
    title: "11. Retornar un iterador con las hojas del Arbol Splay (getHojas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con las hojas del Arbol Splay.
 */
@Override
public Iterator<T> getHojas() {
    return super.getHojas();
}
    `
  },
  {
    title: "12. Determinar el numero de Nodo hojas dentro del Arbol (contarHojas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Determina el numero de Nodo hojas dentro del Arbol.
 */
@Override
public int contarHojas() {
    return super.contarHojas();
}
    `
  },
  {
    title: "13. Retornar un iterador con el recorrido preOrden del Arbol (preOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido preOrden del Arbol.
 */
@Override
public Iterator<T> preOrden() {
    return super.preOrden();
}
    `
  },
  {
    title: "14. Retornar un iterador con el recorrido inOrden del Arbol (inOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido inOrden del Arbol.
 */
@Override
public Iterator<T> inOrden() {
    return super.inOrden();
}
    `
  },
  {
    title: "15. Retornar un iterador con el recorrido postOrden del Arbol (postOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido postOrden del Arbol.
 */
@Override
public Iterator<T> postOrden() {
    return super.postOrden();
}
    `
  },
  {
    title: "16. Retornar un iterador con el recorrido por niveles del Arbol (impNiveles)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido por niveles del Arbol.
 */
@Override
public Iterator<T> impNiveles() {
    return super.impNiveles();
}
    `
  },
  {
    title: "17. Obtener el peso del Arbol Splay (getPeso)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene el peso del Arbol Splay.
 */
@Override
public int getPeso() {
    return super.getPeso();
}
    `
  },
  {
    title: "18. Saber si el Arbol Splay se encuentra vacio (esVacio)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Saber si el Arbol Splay se encuentra vacio.
 */
@Override
public boolean esVacio() {
    return super.esVacio();
}
    `
  },
  {
    title: "19. Obtener la altura del Arbol Splay (getAltura)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtener la altura del Arbol Splay.
 */
@Override
public int getAltura() {
    return super.getAltura();
}
    `
  },
  {
    title: "20. Clonar la informacion de un Arbol Splay en un nuevo objeto ArbolSplay (clonar)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Clona la informacion de un Arbol Splay en un nuevo objeto ArbolSplay.
 */
@Override
public ArbolSplay<T> clonar() {
    ArbolSplay<T> t = new ArbolSplay<T>();
    t.setRaiz(clonarAS(this.getRaiz()));
    return t;
}
    `
  },
  {
    title: "21. Metodo Privado: Clonar la informacion de un Arbol Splay en un nuevo objeto ArbolSplay (clonarAS)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo privado: clona la informacion de un Arbol Splay.
 */
private NodoBin<T> clonarAS(NodoBin<T> r) {
    if (r == null)
        return r;
    else {
        NodoBin<T> aux = new NodoBin<T>(r.getInfo(), clonarAS(r.getIzq()), clonarAS(r.getDer()));
        return aux;
    }
}
    `
  },
  {
    title: "22. Conocer por consola la informacion del Arbol Binario (imprime)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Imprime por consola la informacion del Arbol Splay.
 */
@Override
public void imprime() {
    System.out.println(" ----- Arbol Splay ----- ");
    imprimeAS(super.getRaiz());
}
    `
  },
  {
    title: "23. Conocer el objeto almacenado en la raiz del Arbol Splay (imprimeAS)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(1)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo privado: imprime recursivamente la informacion del Arbol Splay.
 */
public void imprimeAS(NodoBin<T> n) {
    int l = 0, r = 0;
    if (n == null) return;
    if (n.getIzq() != null)
        l = Integer.parseInt(n.getIzq().getInfo().toString());
    if (n.getDer() != null)
        r = Integer.parseInt(n.getDer().getInfo().toString());
    System.out.println("NodoIzq: " + l + "\\t Info: " + n.getInfo() + "\\t NodoDer: " + r);
    if (n.getIzq() != null)
        imprimeAS(n.getIzq());
    if (n.getDer() != null)
        imprimeAS(n.getDer());
}
    `
  },
];
