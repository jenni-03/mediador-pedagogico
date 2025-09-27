// complexityArbolAVL.ts
export const complexityArbolAVL = [
  {
    title: "1. Constructor vacío (ArbolAVL)",
    operationalCost: [
      "T(n) = 1",
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol AVL vacio. 
 * post:  Se creo un Arbol AVL vacio.
 */
public ArbolAVL() {
      1
    super();
}
    `
  },
  {
    title: "2. Constructor con una raíz predefinida",
    operationalCost: [
      "T(n) = 1 + 1",
      "T(n) = 2",
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol AVL con una raiz predefinida. 
 * post:  Se creo un nuevo Arbol AVL con raiz predeterminada.
 * @param r  Un tipo <T>, almacena la direccion de memoria de un nodo de un Arbol AVL
 */
public ArbolAVL(T r) {
         1         1 
    super.setRaiz(new NodoAVL<T>(r));
}
    `
  },
  {
    title: "3. Obtener objeto raíz del Arbol AVL (getObjRaiz)",
    operationalCost: [
      "T(n) = 1 + 1",
      "T(n) = 2",
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Metodo que permite conocer el objeto raiz del Arbol AVL. 
 * post:  Se retorno el objeto raiz del Arbol. 
 * @return Un objeto de tipo T que representa el dato en la raiz del Arbol.
 */
@Override
public T getObjRaiz() {
      1          1
    return (super.getObjRaiz());
}
    `
  },
  {
    title: "4. Insertar nuevo dato (insertar)",
    operationalCost: [
      "T(n) = 1 + 1 + 1 + 1 + T(n/2) + O(n) + 1 + 1",
      "T(n) = T(n/2) + O(n) + 6",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite insertar un nuevo dato dentro del Arbol AVL sin que se pierda el balance. 
 * post:  Se inserto un nuevo dato dentro del Arbol AVL. 
 * @param nuevo Representa el nuevo que se pretende ingresar al Arbol AVL. 
 * @return true o false dependiendo si se pudo o no insertar el nuevo elemento dentro del Arbol
 */
@Override
public boolean insertar(T nuevo) {
       1            1  1  
    NodoAVL<T> n = new NodoAVL<T>(nuevo);
       1       T(n/2)+O(n)   1                  1
    return (insertaAVL((NodoAVL<T>) super.getRaiz(), n));
}
    `
  },
  {
    title: "5. Insertar nuevo dato dentro del AVL (insertaAVL)",
    operationalCost: [
      "T(n) = T(n/2) + O(n)",
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite insertar un nuevo dato dentro del Arbol AVL sin que se pierda el balance. 
 * post:  Se inserto un nuevo dato dentro del Arbol AVL. 
 * @param p Representa la raiz del Arbol AVL en el cual se inserta el nuevo dato. 
 * @param q Representa el Nodo<T> que sera insertado dentro del Arbol AVL. 
 * @return true o false dependiendo si se pudo o no insertar el nuevo elemento dentro del Arbol
 */
private boolean insertaAVL(NodoAVL<T> p, NodoAVL<T> q) {
    //Si el Arbol se encuentra vacio
           1   KTE
    if (this.esVacio()) {
           1
        setRaiz(q);
           1
        return (true);
    }
     1       1       1        1          1           1
    int comp = ((Comparable) q.getInfo()).compareTo(p.getInfo());
             1
    if (comp == 0)
           1
        return (false); //Esta nodo ya existe
             1
    if (comp < 0) {
             1          1
        if (p.getIzq() == null) {
             1
            p.setIzq(q);
             1
            q.setPadre(p);
            24T(n/2)+O(1) + 85
            balancear(p);
             1
            return (true);
        } else {
             1                  1
            return (insertaAVL(p.getIzq(), q));
        }
    } else
             1
    if (comp > 0) {
             1          1
        if (p.getDer() == null) {
             1
            p.setDer(q);
             1
            q.setPadre(p);
            //El nodo ha sido insertado, ahora se balancea.
            24T(n/2)+O(1) + 85
            balancear(p);
             1
            return (true);
        } else {
                   //lamado recursivo
             1                  1
            return (insertaAVL(p.getDer(), q));
        }
    }
      1
    return false;
}
    `
  },
  {
    title: "6. Balancear el Arbol AVL (balancear)",
    operationalCost: [
      "T(n) = 24T(n/2) + O(1) + 85"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Metodo que permite balancear el Arbol AVL de manera que siga manteniendo sus propiedades. 
 * post:  EL Arbol AVL ha sido balanceado, por lo que sigue cumpliendo con sus propiedades. 
 * @param r Representa el Nodo del Arbol desde el cual se quiere realizar el balance.
 */
private void balancear(NodoAVL<T> r) {
    // Se actualiza el factor de balance del Nodo
    4T(n/2)+O(1) + 4
    setBalance(r);
     1          1  1
    int balance = r.getBal();
    // Se evalua el balance
                 1
    if (balance == -2) {
                2T(n/2)+O(1)   1        1           1     2T(n/2)+O(1)   1        1
        if (getAlturaNodo(r.getIzq().getIzq()) >= getAlturaNodo(r.getIzq().getDer())) {
              1  8T(n/2)+O(1) + 32
            r = rDerecha(r);
        } else {
              1 16T(n/2)+O(1) + 67
            r = drIzqDer(r);
        }
    } else
                1
    if (balance == 2) {
                2T(n/2)+O(1)   1        1           1      2T(n/2)+O(1)   1        1
        if (getAlturaNodo(r.getDer().getDer()) >= getAlturaNodo(r.getDer().getIzq())) {
              1  8T(n/2)+O(1) + 32
            r = rIzquierda(r);
        } else {
              1 16T(n/2)+O(1) + 67
            r = drDerIzq(r);
        }
    }
    // Se modifica el padre
         1           1
    if (r.getPadre() != null) {
        //llamada recursiva
                   1
        balancear(r.getPadre());
    } else {
            1
        this.setRaiz(r);
    }
}
    `
  },
  {
  title: "7. Balancear Altura del Árbol AVL (balancearAltura)",
  operationalCost: [
    "T(n) = 2T(n/2) + O(n) + 1 + 1",
    "T(n) = 2T(n/2) + O(n) + 2"
  ],
  complexity: "Big O = O(n log n)",
  javaCode: `
/**
 * Metodo que permite Balancear la altura el Arbol AVL.
 */
public void balancearAltura() {
        2T(n/2)+O(n)      1                  1
    balancearAltura((NodoAVL<T>) super.getRaiz());
}
  `
},
{
  title: "8. Balancear Altura del Árbol AVL (privado, recursivo)",
  operationalCost: [
    "T(n) = 2T(n/2) + O(n)"
  ],
  complexity: "Big O = O(n log n)",
  javaCode: `
/**
 * Metodo de tipo privado que permite balancear la altura del ArbolAVL.
 * @param r Representa la raiz del Arbol o subArbol.
 */
private void balancearAltura(NodoAVL<T> r) {
           1
    if (r == null)
           1
        return;
     4T(n/2)+O(1) + 4
    this.setBalance(r);
    //llamado recursivo 1
                     1
    balancearAltura(r.getIzq());
    //llamado recursivo 2
                     1
    balancearAltura(r.getDer());
}
  `
},
{
  title: "9. Modificar factor de balance (setBalance)",
  operationalCost: [
    "T(n) = 4T(n/2) + O(1) + 4"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite modificar el factor de balance de un Nodo de acuerdo a sus nuevas condiciones. 
 * post:  Se ha modificado el factor de balance del NodoAVL<T> indicado. 
 * @param r Representa el NodoAVL<T> el cual sera recalculado su nuevo factos de balance.
 */
private void setBalance(NodoAVL<T> r) {
     1            2T(n/2)+O(1)  1           1      2T(n/2)+O(1)  1
    r.setBal(getAlturaNodo(r.getDer()) - getAlturaNodo(r.getIzq()));
}
  `
},
{
  title: "10. Obtener altura de un nodo (getAlturaNodo)",
  operationalCost: [
    "T(n) = 2T(n/2) + O(1)"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite conocer la altura de un Nodo dentro del Arbol AVl para determinar su balance. 
 * post:  Se retorno la altura del Nodo dentro del ArbolAVL. 
 * @param r Representa el NodoAVL<T> del cual se pretende conocer su altura. 
 * @return Un objeto de tipo int con la altura del Nodo dentro del ArbolAVL.
 */
private int getAlturaNodo(NodoAVL<T> r) {
           1
    if (r == null)
           1
        return -1;
         1         1        1  1         1
    if (r.getIzq() == null && r.getDer() == null)
           1
        return 0;
         1         1
    if (r.getIzq() == null)
           1     1                1
        return 1 + getAlturaNodo(r.getDer());
         1          1
    if (r.getDer() == null)
           1     1                1
        return 1 + getAlturaNodo(r.getIzq());
                      //llamado recursivo 1       //llamado recursivo 2
       1     1        2                   1                          1
    return 1 + getMax(getAlturaNodo(r.getIzq()), getAlturaNodo(r.getDer()));
}
  `
},
{
  title: "11. Obtener valor máximo entre dos valores (getMax)",
  operationalCost: [
    "T(n) = 1 + 1",
    "T(n) = 2"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite obtener el valor maximo entre dos valores a evaluar. 
 * post:  Se retorno el valor maximo de dos datos evaluados. 
 * @param a Representa el primer valor a evaluar. 
 * @param b Representa el segundo valor a evaluar. 
 * @return Un objeto de tipo int con el dato de Mayor valor entre los datos evaluados.
 */
private int getMax(int a, int b) {
           1
    if (a >= b)
           1
        return a;
       1
    return b;
}
  `
},
{
  title: "12. Doble rotación a la derecha (drIzqDer)",
  operationalCost: [
    "T(n) = 16T(n/2) + O(1) + 67"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite efectuar una doble rotacion hacia la derecha de un Nodo. 
 * post:  Se realizo una doble rotacion a la derecha. 
 * @param r Nodo que se encuentra desbalanceado y no cumple la propiedad. 
 * @return Un objeto de tipo NodoAVL<T> con las rotaciones ya realizadas. 
 */
private NodoAVL<T> drIzqDer(NodoAVL<T> r) {
     1    8T(n/2)+O(1) + 32  1
    r.setIzq(rIzquierda(r.getIzq()));
     1    8T(n/2)+O(1) + 32
    return rDerecha(r);
}
  `
},
{
  title: "13. Doble rotación a la izquierda (drDerIzq)",
  operationalCost: [
    "T(n) = 16T(n/2) + O(1) + 67"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite efectuar una doble rotacion hacia la izquierda de un Nodo. 
 * post:  Se realizo una doble rotacion a la izquierda. 
 * @param r Nodo que se encuentra desbalanceado y no cumple la propiedad. 
 * @return Un objeto de tipo NodoAVL<T> con las rotaciones ya realizadas. 
 */
private NodoAVL<T> drDerIzq(NodoAVL<T> r) {
     1   8T(n/2)+O(1) + 32  1
    r.setDer(rDerecha(r.getDer()));
      1     8T(n/2)+O(1) + 32
    return rIzquierda(r);
}
  `
},
{
  title: "14. Rotación simple a la izquierda (rIzquierda)",
  operationalCost: [
    "T(n) = 8T(n/2) + O(1) + 32"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite efectuar una rotacion simple hacia la izquierda de un Nodo. 
 * post:  Se realizo una rotacion simple a la izquierda. 
 * @param r Nodo que se encuentra desbalanceado y no cumple la propiedad. 
 * @return Un objeto de tipo NodoAVL<T> con las rotaciones ya realizadas. 
 */
private NodoAVL<T> rIzquierda(NodoAVL<T> r) {
       1            1  1
    NodoAVL<T> v = r.getDer();
     1          1
    v.setPadre(r.getPadre());
     1        1  
    r.setDer(v.getIzq());
         1          1
    if (r.getDer() != null) {
         1        1
        r.getDer().setPadre(r);
    }
     1
    v.setIzq(r);
     1
    r.setPadre(v);
         1            1
    if (v.getPadre() != null) {
             1          1         1
        if (v.getPadre().getDer() == r) {
             1          1
            v.getPadre().setDer(v);
        } else
             1          1          1
        if (v.getPadre().getIzq() == r) {
             1          1
            v.getPadre().setIzq(v);
        }
    }
    4T(n/2)+O(1) + 4
    setBalance(r);
    4T(n/2)+O(1) + 4
    setBalance(v);
       1
    return (v);
}
  `
},
{
  title: "15. Rotación simple a la derecha (rDerecha)",
  operationalCost: [
    "T(n) = 8T(n/2) + O(1) + 32"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite efectuar una rotacion simple hacia la derecha de un Nodo. 
 * post:  Se realizo una rotacion simple a la derecha. 
 * @param r Nodo que se encuentra desbalanceado y no cumple la propiedad. 
 * @return Un objeto de tipo NodoAVL<T> con las rotaciones ya realizadas. 
 */
private NodoAVL<T> rDerecha(NodoAVL<T> r) {
       1            1  1
    NodoAVL<T> v = r.getIzq();
     1          1
    v.setPadre(r.getPadre());
     1        1  
    r.setIzq(v.getDer());
         1          1
    if (r.getIzq() != null) {
         1        1
        r.getIzq().setPadre(r);
    }
     1
    v.setDer(r);
     1
    r.setPadre(v);
         1            1
    if (v.getPadre() != null) {
             1          1         1
        if (v.getPadre().getDer() == r) {
             1          1
            v.getPadre().setDer(v);
        } else
             1          1          1
        if (v.getPadre().getIzq() == r) {
             1          1
            v.getPadre().setIzq(v);
        }
    }
    4T(n/2)+O(1) + 4
    setBalance(r);
    4T(n/2)+O(1) + 4
    setBalance(v);
      1
    return (v);
}
  `
},
{
  title: "16. Eliminar un dato del Árbol AVL (eliminar)",
  operationalCost: [
    "T(n) = T(n/2) + O(n) + KTE"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite eliminar un dato del ArbolAVL; manteniendo el Arbol sus propiedades de balanceado. 
 * post:  Se elimino un elemento del ArbolAVL y este ha mantenido sus propiedades.
 * @param dato Representa el Objeto de tipo T que se desea eliminar del Arbol.
 * @return Un objeto de tipo boolean con true si el dato ha sido eliminado correctamente.
 */
@Override
public boolean eliminar(T dato) {
            1  KTE          1          KTE
    if (this.esVacio() || !this.esta(dato))
          1
        return (false);
      1         T(n/2)+O(n)    1                  1
    return (eliminarAVL((NodoAVL<T>) super.getRaiz(), dato));
}
  `
},
{
  title: "17. Eliminar un dato del Árbol AVL (eliminarAVL)",
  operationalCost: [
    "T(n) = T(n/2) + O(n)"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite eliminar un dato del ArbolAVL; manteniendo el Arbol sus propiedades de balanceado. 
 * post:  Se elimino un elemento del ArbolAVL y este ha mantenido sus propiedades. 
 * @param p Representa la raiz del ArbolAVL sobre el cual se va a realizar la eliminacion. 
 * @param q Rerpesenta el Objeto de tipo T que desea ser eliminado del Arbol. 
 * @return true o false dependiendo se si se puedo eliminar el dato del Arbol.
 */
private boolean eliminarAVL(NodoAVL<T> p, T q) {
     1       1      1         1          1
    int comp = ((Comparable) p.getInfo()).compareTo(q);
             1
    if (comp == 0)
          1   24T(n/2)+O(1) + 7n + 125$
        return (eliminaAVL(p));
             1
    if (comp > 0)
          1                  1
        return (eliminarAVL(p.getIzq(), q));
    else
                   //lamado recursivo
          1                  1
        return (eliminarAVL(p.getDer(), q));
}
  `
},
{
  title: "18. Eliminar un nodo específico (eliminaAVL)",
  operationalCost: [
    "T(n) = 24T(n/2) + O(1) + 7n + 125"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite eliminar un dato del ArbolAVL; manteniendo el Arbol sus propiedades de balanceado. 
 * post:  Se elimino un elemento del ArbolAVL y este ha mantenido sus propiedades. 
 * @param q Representa el NodoAVL<T> que debe ser eliminado del Arbol. 
 * @return true o false dependiendo se si se puedo eliminar el dato del Arbol.
 */
private boolean eliminaAVL(NodoAVL<T> q) {
       1
    NodoAVL<T> s;
    //Si el Nodo es una hoja
         1         1       1   1         1
    if (q.getIzq() == null || q.getDer() == null) {
        //Si el Nodo es la raiz
             1           1
        if (q.getPadre() == null) {
            if (q.getIzq() != null) {
                q.getIzq().setPadre(null);
                this.setRaiz(q.getIzq());
            } else {
                if (q.getDer() != null) {
                    q.getDer().setPadre(null);
                    this.setRaiz(q.getDer());
                } else
                    setRaiz(null);
            }
            return (true);
        }
          1
        s = q;
    } else {
        // Se recupera el hijo sucesor al Nodo
          1     7n + 14
        s = getSucesor(q);
         1         1
        q.setInfo(s.getInfo());
    }
       1
    NodoAVL<T> p;
         1          1
    if (s.getIzq() != null) {
        p = s.getIzq();
    } else {
          1  1
        p = s.getDer();
    }
           1
    if (p != null) {
         1          1
        p.setPadre(s.getPadre());
    }
         1            1
    if (s.getPadre() == null) {
        this.setRaiz(p);
    } else {
              1   1          1
        if (s == s.getPadre().getIzq()) {
            s.getPadre().setIzq(p);
        } else {
             1          1
            s.getPadre().setDer(p);
        }
        // Se realiza el balanceo del Arbol
        24T(n/2)+O(1) + 85
        balancear(s.getPadre());
    }
      1
    s = null;
      1
    return (true);
}
  `
},
{
  title: "19. Encontrar el sucesor de un nodo (getSucesor)",
  operationalCost: [
    "T(n) = 7n + 14"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite encontrar el Nodo sucesor al Nodo que se pretende eliminar. 
 * post:  Se retorno el sucesor al NodoAVL<T> que se desea eliminar de Arbol. 
 * @param q Representa el NodoAVL<T> sobre el cual se desea evaluar su sucesor. 
 * @return Un objeto de tipo NodoAVL<T> que representa el sucesor al Nodo que se pretende eliminar.
 */
private NodoAVL<T> getSucesor(NodoAVL<T> q) {
         1          1
    if (q.getDer() != null) {
          1             1  1
        NodoAVL<T> r = q.getDer();
                1          1
        while (r.getIzq() != null) {
              1  1
            r = r.getIzq();
        }
          1
        return r;
    } else {
          1             1  1
        NodoAVL<T> p = q.getPadre();
                 1        1   1   1
        while (p != null && q == p.getDer()) {
              1
            q = p;
              1  1
            p = q.getPadre();
        }
          1
        return p;
    }
}
  `
},
{
  title: "20. Evaluar la existencia de un objeto (esta)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite evaluar la existencia de un objeto dentro del Arbol AVL. 
 * post:  Se retorno true si el elemento se encuentra en el Arbol.
 * @param x Representa el elemento el cual se desea evaluar su existencia en el Arbol. 
 * @return Un boolean , true si el dato esta o false en caso contrario.
 */
@Override
public boolean esta(T x) {
       1         KTE
    return (super.estaABB(x));
}
  `
},
{
  title: "21. Retornar un iterador con las hojas del Árbol (getHojas)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que retorna un iterador con las hojas del Arbol AVL. 
 * post:  Se retorno un iterador con las hojas del Arbol.
 * @return un iterador con las hojas delArbol.
 */
@Override
public Iterator<T> getHojas() {
       1         KTE
    return (super.getHojas());
}
  `
},
{
  title: "22. Determinar número de hojas (contarHojas)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite determinar el numero de Nodo hojas dentro del Arbol. 
 * post:  Se retorno el numero de hojas del Arbol. 
 * @return El numero de hojas existentes en el Arbol.
 */
@Override
public int contarHojas() {
       1         KTE
    return (super.contarHojas());
}
  `
},
{
  title: "23. Recorrido preOrden (preOrden)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que retorna un iterador con el recorrido preOrden del Arbol. 
 * post:  Se retorno un iterador en preOrden para el arbol.
 * @return un iterador en preorden (padre->hijoIzq->hijoDer) para el Arbol AVL.
 */
@Override
public Iterator<T> preOrden() {
       1         KTE
    return (super.preOrden());
}
  `
},
{
  title: "24. Recorrido inOrden (inOrden)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que retorna un iterador con el recorrido in Orden del Arbol. 
 * post:  Se retorno un iterador inOrden para el arbol.
 * @return un iterador en inOrden (hijoIzq->padre->hijoDer) para el Arbol AVL. 
 */
@Override
public Iterator<T> inOrden() {
       1         KTE
    return (super.inOrden());
}
  `
},
{
  title: "25. Recorrido postOrden (postOrden)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que retorna un iterador con el recorrido postOrden del Arbol. 
 * post:  Se retorno un iterador postOrden para el arbol.
 * @return un iterador en postOrden (hijoIzq->hijoDer->padre) para el Arbol AVL. 
 */
@Override
public Iterator<T> postOrden() {
       1         KTE
    return (super.postOrden());
}
  `
},
{
  title: "26. Recorrido por niveles (impNiveles)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite retornar un iterador con el recorrido por niveles del Arbol. 
 * post:  Se retorno el recorrido por niveles del Arbol AVL.
 * @return un un iterador con el recorrido por niveles del Arbol AVL.
 */
@Override
public Iterator<T> impNiveles() {
       1         KTE
    return (super.impNiveles());
}
  `
},
{
  title: "27. Obtener el peso del Árbol (getPeso)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite obtener el peso del Arbol AVL. 
 * post:  Se retorno el numero de elementos en el Arbol AVL.
 * @return Un entero con la cantidad de elementos del Arbol AVL.
 */
@Override
public int getPeso() {
       1         KTE
    return (super.getPeso());
}
  `
},
{
  title: "28. Saber si el Árbol está vacío (esVacio)",
  operationalCost: [
    "T(n) = KTE"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite saber si el Arbol AVL se encuentra vacio. 
 * post:  Se retorno true si el arbol no contiene elementos.
 * @return true si no hay datos en el Arbol AVL.
 */
@Override
public boolean esVacio() {
      1         KTE
    return (super.esVacio());
}
  `
},
{
  title: "29. Obtener la altura del Árbol (getAltura)",
  operationalCost: [
    "T(n) = 1 + 1",
    "T(n) = 2"
  ],
  complexity: "Big O = O(1)",
  javaCode: `
/**
 * Metodo que permite obtener la altura del Arbol AVL. 
 * post:  Se retorno la altura del Arbol AVL.
 * @return Un entero con la altura del Arbol AVL.
 */
@Override
public int getAltura() {
       1         1
    return (super.getAltura());
}
  `
},
{
  title: "30. Mostrar información del Árbol (imprime)",
  operationalCost: [
    "T(n) = 2T(n/2) + O(1) + 3"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo que permite conocer por consola la informacion del Arbol Binario.
 */
@Override
public void imprime() {
          1
    System.out.println(" ----- Arbol AVL ----- ");
    2T(n/2)+O(1)  1                  1
    imprimeAVL((NodoAVL<T>) super.getRaiz());
}
  `
},
{
  title: "31. Mostrar información del Árbol (imprimeAVL)",
  operationalCost: [
    "T(n) = 2T(n/2) + O(1)"
  ],
  complexity: "Big O = O(n)",
  javaCode: `
/**
 * Metodo de tipo privado que permite mostrar por consola la informacion del Arbol AVL. 
 * @param n Representa la raiz del ArbolAVL o de alguno de sus subarboles.
 */
public void imprimeAVL(NodoAVL<T> n) {
     1    1
    int l = 0;
     1    1
    int r = 0;
     1    1    
    int p = 0;
           1
    if (n == null)
           1
        return;
         1          1
    if (n.getIzq() != null) {
          1        1          1        1         1
        l = Integer.parseInt(n.getIzq().getInfo().toString());
    }
         1          1
    if (n.getDer() != null) {
          1        1          1        1         1
        r = Integer.parseInt(n.getDer().getInfo().toString());
    }
         1          1
    if (n.getPadre() != null) {
          1        1          1        1         1
        p = Integer.parseInt(n.getPadre().getInfo().toString());
    }
          1                        1   1             1  1          1                1   1              1   1                1  1
    System.out.println("NodoIzq: " + l + "\\t Info: " + n.getInfo() + "\\t NodoDer: " + r + "\\t Padre: " + p + "\\t Balance: " + n.getBal());
         1          1
    if (n.getIzq() != null) {
        //llamado recursivo 1
        imprimeAVL(n.getIzq());
    }
         1          1
    if (n.getDer() != null) {
        //llamado recursivo 2
        imprimeAVL(n.getDer());
    }
}
  `
},

];
