export const complexityArbolBinario = [
  {
    title: "1. Constructor Vacío (ArbolBinario)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Binario vacio.
 * post: Se creó un Arbol Binario vacío.
 */
public ArbolBinario() {
    this.raiz = null;
}
    `
  },
  {
    title: "2. Constructor Raíz Predefinida (ArbolBinario)",
    operationalCost: ["T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Binario con una raíz predefinida.
 * post: Se creó un nuevo Árbol con su raíz definida.
 * @param raiz Objeto de tipo T que representa el dato en la raíz.
 */
public ArbolBinario(T raiz) {
    this.raiz = new NodoBin(raiz);
}
    `
  },
  {
    title: "3. Obtener Objeto Específico (getObjRaiz)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene el objeto almacenado en la raíz del Árbol Binario.
 * post: Se obtuvo la raíz del Árbol Binario.
 * @return La raíz del Árbol Binario.
 */
public T getObjRaiz() {
    return (raiz.getInfo());
}
    `
  },
  {
    title: "4. Obtener Raíz (getRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene la raíz del Árbol Binario.
 * post: Se obtuvo la raíz del Árbol Binario.
 * @return La raíz del Árbol Binario.
 */
public NodoBin<T> getRaiz() {
    return raiz;
}
    `
  },
  {
    title: "5. Modificar Raíz (setRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Modifica la raíz del Árbol Binario.
 * post: Se modificó la raíz del Árbol Binario.
 * @param raiz Nueva raíz del Árbol Binario.
 */
public void setRaiz(NodoBin<T> raiz) {
    this.raiz = raiz;
}
    `
  },
  {
    title: "6. Insertar Hijo a la Izquierda (insertarHijoIzq)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 12"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un hijo izquierdo a un elemento del árbol.
 * post: Se insertó un hijo a la izquierda.
 * @param padre Elemento padre.
 * @param hijo Elemento nuevo a insertar.
 * @return true si se insertó correctamente, false en caso contrario.
 */
public boolean insertarHijoIzq(T padre, T hijo) {
    if (this.esVacio()) {
        this.setRaiz(new NodoBin<T>(hijo));
        return true;
    }
    NodoBin<T> p = this.buscar(padre);
    if (p != null) {
        if (p.getIzq() == null) {
            p.setIzq(new NodoBin<T>(hijo));
            return true;
        }
        return false;
    }
    return false;
}
    `
  },
  {
    title: "7. Insertar Hijo a la Derecha (insertarHijoDer)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 12"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un hijo derecho a un elemento del árbol.
 * post: Se insertó un hijo a la derecha.
 * @param padre Elemento padre.
 * @param hijo Elemento nuevo a insertar.
 * @return true si se insertó correctamente, false en caso contrario.
 */
public boolean insertarHijoDer(T padre, T hijo) {
    if (this.esVacio()) {
        this.setRaiz(new NodoBin<T>(hijo));
        return true;
    }
    NodoBin<T> p = this.buscar(padre);
    if (p != null) {
        if (p.getDer() == null) {
            p.setDer(new NodoBin<T>(hijo));
            return true;
        }
        return false;
    }
    return false;
}
    `
  },
  {
    title: "8. Eliminar Elemento (eliminar)",
    operationalCost: ["T(n) = 6T(n/2) + O(1) + 44"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina un elemento del Árbol Binario, dada su información.
 * post: Se eliminó el elemento del Árbol Binario.
 * @param info Dato a eliminar.
 * @return true si se eliminó correctamente, false en caso contrario.
 */
public boolean eliminar(T info) {
    NodoBin<T> r = this.buscar(info);
    if (r == null) return false;
    boolean tnd = r.getDer() != null;
    boolean tni = r.getIzq() != null;
    // Caso 1: Sin hijos
    if (!tnd && !tni)
        return eliminarC1(r);
    // Caso 2: Solo hijo derecho
    if (tnd && !tni)
        return eliminarC2(r);
    // Caso 3: Solo hijo izquierdo
    if (!tnd && tni)
        return eliminarC2(r);
    // Caso 4: Ambos hijos
    if (tnd && tni)
        return eliminarC3(r);
    return false;
}
    `
  },
  {
    title: "9. Eliminar Elemento Caso 1 (eliminarC1)",
    operationalCost: ["T(n) = 4T(n/2) + O(1) + 15"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina un elemento para el Caso 1 (sin hijos).
 * post: Se eliminó el nodo del árbol.
 * @param r Nodo a eliminar.
 * @return true si se eliminó, false en caso contrario.
 */
private boolean eliminarC1(NodoBin<T> r) {
    NodoBin<T> p = this.getPadre(r);
    if (p == null) {
        if (this.getRaiz() != r)
            return false;
        this.setRaiz(null);
        return true;
    }
    NodoBin<T> hi = p.getIzq();
    NodoBin<T> hd = p.getDer();
    if (hi == r) {
        this.getPadre(r).setIzq(null);
        return true;
    }
    if (hd == r) {
        this.getPadre(r).setDer(null);
        return true;
    }
    return false;
}
    `
  },
  {
    title: "10. Eliminar Elemento Caso 2 (eliminarC2)",
    operationalCost: ["T(n) = 4T(n/2) + O(1) + 21"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina un elemento para el Caso 2 (con un solo hijo).
 * post: Se eliminó el nodo del árbol.
 * @param r Nodo a eliminar.
 * @return true si se eliminó, false en caso contrario.
 */
private boolean eliminarC2(NodoBin<T> r) {
    NodoBin<T> p = this.getPadre(r);
    NodoBin<T> ha = r.getIzq() != null ? r.getIzq() : r.getDer();
    if (p == null) {
        this.setRaiz(ha);
        return true;
    }
    NodoBin<T> hi = p.getIzq();
    NodoBin<T> hd = p.getDer();
    if (hi == r) {
        this.getPadre(r).setIzq(ha);
        r.setDer(null);
        r.setIzq(null);
        return true;
    }
    if (hd == r) {
        this.getPadre(r).setDer(ha);
        r.setDer(null);
        r.setIzq(null);
        return true;
    }
    return false;
}
    `
  },
   {
    title: "11. Eliminar Elemento Caso 3 (eliminarC3)",
    operationalCost: ["T(n) = T(n/2) + O(1) + 7"],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Elimina un elemento para el Caso 3 (dos hijos).
 * post: Se eliminó el nodo del árbol.
 * @param r Nodo a eliminar.
 * @return true si se eliminó, false en caso contrario.
 */
private boolean eliminarC3(NodoBin<T> r) {
    NodoBin<T> masIzq = this.masIzquierda(r.getDer());
    if (masIzq != null) {
        r.setInfo(masIzq.getInfo());
        return true;
    }
    return false;
}
    `
  },
  {
    title: "12. Nodo más a la izquierda (masIzquierda)",
    operationalCost: ["T(n) = T(n/2) + O(1)"],
    complexity: "Big O = O(log n)",
    javaCode: `
/**
 * Devuelve el nodo más a la izquierda de un subárbol.
 * post: Se retornó el nodo más a la izquierda.
 * @param r Nodo raíz del subárbol.
 * @return NodoBin<T> más a la izquierda.
 */
private NodoBin<T> masIzquierda(NodoBin<T> r) {
    if (r.getIzq() != null) {
        return masIzquierda(r.getIzq());
    }
    return r;
}
    `
  },
  {
    title: "13. Existencia de un Elemento (esta)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna true si existe un dato en el árbol binario.
 * post: Se retornó true si el elemento se encuentra en el árbol.
 * @param info Información a buscar.
 * @return true si está, false en caso contrario.
 */
public boolean esta(T info) {
    return esta(this.raiz, info);
}
    `
  },
  {
    title: "14. Existencia de un Elemento por Raíz (esta)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para verificar existencia de un dato.
 * post: Retorna true si el elemento se encuentra.
 * @param r Raíz o subraíz.
 * @param info Información a buscar.
 * @return true si está, false en caso contrario.
 */
private boolean esta(NodoBin<T> r, T info) {
    if (r == null) return false;
    if (r.getInfo().equals(info)) return true;
    return esta(r.getIzq(), info) || esta(r.getDer(), info);
}
    `
  },
  {
    title: "15. Buscar un Elemento (buscar)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Consulta un elemento existente dentro del árbol binario.
 * post: Retorna el nodo buscado.
 * @param info Elemento a buscar.
 * @return NodoBin<T> buscado o null.
 */
private NodoBin<T> buscar(T info) {
    return buscar(this.raiz, info);
}
    `
  },
  {
    title: "16. Buscar Elemento por Raíz (buscar)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Consulta un elemento existente dentro del árbol desde una raíz dada.
 * post: Retorna el nodo buscado.
 * @param r Raíz o subraíz.
 * @param info Elemento a buscar.
 * @return NodoBin<T> buscado o null.
 */
private NodoBin<T> buscar(NodoBin<T> r, T info) {
    if (r == null) return null;
    if (r.getInfo().equals(info)) return r;
    NodoBin<T> aux = (r.getIzq() == null) ? null : buscar(r.getIzq(), info);
    if (aux != null) return aux;
    else return (r.getDer() == null) ? null : buscar(r.getDer(), info);
}
    `
  },
  {
    title: "17. Modificar Dato (setDato)",
    operationalCost: ["T(n) = 6T(n/2) + O(1) + 8"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Modifica la información de un nodo.
 * post: Edita la información de un nodo.
 * @param info1 Elemento a modificar.
 * @param info2 Nueva información.
 * @return true si se modificó, false si no se pudo.
 */
public boolean setDato(T info1, T info2) {
    if (!this.esta(info1) || this.esta(info2)) return false;
    return setDato(this.raiz, info1, info2);
}
    `
  },
  {
    title: "18. Modificar Dato por Raíz (setDato)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Modifica la información de un nodo desde una raíz dada.
 * post: Edita la información de un nodo.
 * @param r Raíz o subraíz.
 * @param info1 Elemento a modificar.
 * @param info2 Nueva información.
 * @return true si se modificó, false si no se pudo.
 */
private boolean setDato(NodoBin<T> r, T info1, T info2) {
    if (r == null) return false;
    if (r.getInfo().equals(info1)) {
        r.setInfo(info2);
        return true;
    }
    return setDato(r.getIzq(), info1, info2) || setDato(r.getDer(), info1, info2);
}
    `
  },
  {
    title: "19. Obtener Padre por Dato (getPadre)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 9"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el padre de un nodo a partir del dato.
 * post: Retorna el padre del nodo que contiene la información dada.
 * @param r Nodo a buscar.
 * @return El padre o null si no existe.
 */
protected NodoBin<T> getPadre(NodoBin<T> r) {
    if (r == null || this.raiz == null) return null;
    NodoBin<T> x = getPadre(this.raiz, r.getInfo());
    if (x == null) return null;
    return x;
}
    `
  },
  {
    title: "20. Obtener Padre (getPadre)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el padre de un nodo por dato (sin elementos repetidos).
 * post: Retorna el padre del nodo buscado.
 * @param x Nodo raíz.
 * @param info Dato a buscar.
 * @return Padre del nodo, null si no existe.
 */
private NodoBin<T> getPadre(NodoBin<T> x, T info) {
    if (x == null) return null;
    if ((x.getIzq() != null && x.getIzq().getInfo().equals(info)) ||
        (x.getDer() != null && x.getDer().getInfo().equals(info)))
        return x;
    NodoBin<T> y = getPadre(x.getIzq(), info);
    if (y == null)
        return getPadre(x.getDer(), info);
    else
        return y;
}
    `
  },
   {
    title: "21. Obtener Hojas Iterator (getHojas)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con las hojas del árbol binario.
 * post: Se retornó un iterador con las hojas del árbol.
 * @return Iterator<T> de las hojas.
 */
public Iterator<T> getHojas() {
    ListaCD<T> l = new ListaCD<T>();
    getHojas(this.raiz, l);
    return l.iterator();
}
    `
  },
  {
    title: "22. Obtener Hojas Iterator Privado (getHojas)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: agrega hojas a la lista dada.
 * @param r Nodo raíz o subraíz.
 * @param l Lista de almacenamiento.
 */
private void getHojas(NodoBin<T> r, ListaCD<T> l) {
    if (r != null) {
        if (this.esHoja(r))
            l.insertarAlFinal(r.getInfo());
        getHojas(r.getIzq(), l);
        getHojas(r.getDer(), l);
    }
}
    `
  },
  {
    title: "23. Es Hoja (esHoja)",
    operationalCost: ["T(n) = 8"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna true si el nodo es hoja.
 * @param x Nodo a consultar.
 * @return true si es hoja.
 */
private boolean esHoja(NodoBin<T> x) {
    return (x != null && x.getIzq() == null && x.getDer() == null);
}
    `
  },
  {
    title: "24. Contar Hojas (contarHojas)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de hojas del árbol binario.
 * @return número de hojas existentes.
 */
public int contarHojas() {
    return contarHojas(this.raiz);
}
    `
  },
  {
    title: "25. Contar Hojas por Raíz (contarHojas)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de hojas desde una raíz dada.
 * @param r Raíz o subraíz.
 * @return Número de hojas en el subárbol.
 */
private int contarHojas(NodoBin<T> r) {
    if (r == null) return 0;
    if (this.esHoja(r)) return 1;
    int chi = contarHojas(r.getIzq());
    int chd = contarHojas(r.getDer());
    return (chi + chd);
}
    `
  },
  {
    title: "26. Iterador con Pre-Orden (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido preOrden del árbol.
 * post: Retorna un iterador preOrden.
 * @return Iterator<T> preOrden (padre->hijoIzq->hijoDer).
 */
public Iterator<T> preOrden() {
    ListaCD<T> l = new ListaCD<T>();
    preOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "27. Iterador con Pre-Orden Privado (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: agrega preOrden a la lista.
 * @param r Nodo raíz o subraíz.
 * @param l Lista de almacenamiento.
 */
private void preOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null) {
        l.insertarAlFinal(r.getInfo());
        preOrden(r.getIzq(), l);
        preOrden(r.getDer(), l);
    }
}
    `
  },
  {
    title: "28. Iterador con In-Order (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido inOrden del árbol.
 * @return Iterator<T> inOrden (hijoIzq->padre->hijoDer).
 */
public Iterator<T> inOrden() {
    ListaCD<T> l = new ListaCD<T>();
    inOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "29. Iterador con In-Order Privado (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: agrega inOrden a la lista.
 * @param r Nodo raíz o subraíz.
 * @param l Lista de almacenamiento.
 */
private void inOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null) {
        inOrden(r.getIzq(), l);
        l.insertarAlFinal(r.getInfo());
        inOrden(r.getDer(), l);
    }
}
    `
  },
  {
    title: "30. Iterador con Post-Orden (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido postOrden del árbol.
 * @return Iterator<T> postOrden (hijoIzq->hijoDer->padre).
 */
public Iterator<T> postOrden() {
    ListaCD<T> l = new ListaCD<T>();
    postOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "31. Iterador con Post-Orden Privado (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: agrega postOrden a la lista.
 * @param r Nodo raíz o subraíz.
 * @param l Lista de almacenamiento.
 */
private void postOrden(NodoBin<T> r, ListaCD<T> l) {
    if (r != null) {
        postOrden(r.getIzq(), l);
        postOrden(r.getDer(), l);
        l.insertarAlFinal(r.getInfo());
    }
}
    `
  },
  {
    title: "32. Retornar Cadena Pre-Orden Iterativo (preOrden_Iterativo)",
    operationalCost: ["T(n) = n^2(KTE) + 2n(KTE) + 14"],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Retorna en String el recorrido preOrden del árbol binario (iterativo).
 * @return String recorrido preOrden.
 */
public String preOrden_Iterativo() {
    return preOrden_Iterativo(this.raiz);
}
    `
  },
  {
    title: "33. Retornar Cadena Pre-Orden Iterativo Privado (preOrden_Iterativo)",
    operationalCost: ["T(n) = n^2(KTE) + 2n(KTE) + 12"],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Método privado: retorna en String el preOrden iterativo.
 * @param r Nodo raíz o subraíz.
 * @return String preOrden del árbol.
 */
private String preOrden_Iterativo(NodoBin<T> r) {
    Pila<NodoBin> p = new Pila<NodoBin>();
    String rr = "";
    while (r != null) {
        p.apilar(r);
        rr += r.getInfo().toString() + "-";
        r = r.getIzq();
    }
    while (!p.esVacia()) {
        r = p.desapilar();
        r = r.getDer();
        while (r != null) {
            rr += r.getInfo().toString() + "-";
            p.apilar(r);
            r = r.getIzq();
        }
    }
    return rr;
}
    `
  },
  {
    title: "34. Retornar Cadena In-Orden Iterativo (inOrden_Iterativo)",
    operationalCost: ["T(n) = n^2(KTE) + 3n(KTE) + KTE"],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Retorna en String el recorrido inOrden del árbol binario (iterativo).
 * @return String recorrido inOrden.
 */
public String inOrden_Iterativo() {
    return inOrden_Iterativo(this.raiz);
}
    `
  },
  {
    title: "35. Retornar Cadena In-Orden Iterativo Privado (inOrden_Iterativo)",
    operationalCost: ["T(n) = n^2(KTE) + 3n(KTE) + KTE"],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Método privado: retorna en String el inOrden iterativo.
 * @param r Nodo raíz o subraíz.
 * @return String inOrden del árbol.
 */
private String inOrden_Iterativo(NodoBin<T> r) {
    Pila<NodoBin> p = new Pila<NodoBin>();
    String rr = "";
    while (r != null) {
        p.apilar(r);
        r = r.getIzq();
    }
    while (!p.esVacia()) {
        r = p.desapilar();
        rr += r.getInfo().toString() + "-";
        r = r.getDer();
        while (r != null) {
            p.apilar(r);
            r = r.getIzq();
        }
    }
    return rr;
}
    `
  },
   {
    title: "36. Retornar Cadena Pos-Orden-Iterativo (postOrden_Iterativo)",
    operationalCost: ["T(n) = 12 + KTE(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna en un String el recorrido postOrden del árbol binario (iterativo).
 * @return String con el recorrido postOrden.
 */
public String postOrden_Iterativo() {
    return postOrden_Iterativo(this.raiz);
}
    `
  },
  {
    title: "37. Retornar Cadena Pos-Orden-Iterativo Privado (postOrden_Iterativo)",
    operationalCost: ["T(n) = 10 + KTE(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: retorna en un String el postOrden iterativo.
 * @param r Nodo raíz o subraíz.
 * @return String postOrden del árbol.
 */
private String postOrden_Iterativo(NodoBin<T> r) {
    Pila<NodoBin> pila = new Pila<NodoBin>();
    NodoBin<T> tope = null;
    String rr = "";
    while (r != null) {
        if (r.getIzq() != null && r.getIzq() != tope && r.getDer() != tope) {
            pila.apilar(r);
            r = r.getIzq();
        } else if (r.getIzq() == null && r.getDer() == null && r != tope) {
            rr += r.getInfo().toString() + "-";
            tope = r;
            if (!pila.esVacia())
                r = pila.desapilar();
            else r = null;
        } else if (r.getDer() != null && tope != r.getDer()) {
            pila.apilar(r);
            r = r.getDer();
        } else if (r.getDer() != null && tope == r.getDer()) {
            rr += r.getInfo().toString() + "-";
            tope = r;
            if (!pila.esVacia())
                r = pila.desapilar();
            else r = null;
        }
    }
    return rr;
}
    `
  },
  {
    title: "38. Retornar Niveles (impNiveles)",
    operationalCost: ["T(n) = KTE(n) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido por niveles del árbol binario.
 * @return Iterator<T> de recorrido por niveles.
 */
public Iterator<T> impNiveles() {
    ListaCD<T> l = new ListaCD<T>();
    if (!this.esVacio()) {
        Cola<NodoBin<T>> c = new Cola<NodoBin<T>>();
        c.enColar(this.getRaiz());
        NodoBin<T> x;
        while (!c.esVacia()) {
            x = c.deColar();
            l.insertarAlFinal(x.getInfo());
            if (x.getIzq() != null)
                c.enColar(x.getIzq());
            if (x.getDer() != null)
                c.enColar(x.getDer());
        }
    }
    return l.iterator();
}
    `
  },
  {
    title: "39. Obtener Peso (getPeso)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de elementos en el árbol binario.
 * @return cantidad de elementos.
 */
public int getPeso() {
    return getPeso(this.getRaiz());
}
    `
  },
  {
    title: "40. Obtener Peso por Raíz (getPeso)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de elementos desde una raíz dada.
 * @param r Nodo raíz o subraíz.
 * @return cantidad de elementos en el subárbol.
 */
private int getPeso(NodoBin<T> r) {
    if (r == null) return 0;
    return getPeso(r.getIzq()) + 1 + getPeso(r.getDer());
}
    `
  },
  {
    title: "41. Consultar Existencia de Elementos (esVacio)",
    operationalCost: ["T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna true si el árbol binario está vacío.
 * @return true si está vacío.
 */
public boolean esVacio() {
    return (this.raiz == null);
}
    `
  },
  {
    title: "42. Obtener Altura (getAltura)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la altura del árbol binario.
 * @return altura del árbol.
 */
public int getAltura() {
    if (this.raiz == null) return 0;
    return getAltura(this.getRaiz());
}
    `
  },
  {
    title: "43. Obtener Altura Privada (getAltura)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la altura desde una raíz dada.
 * @param r Nodo raíz o subraíz.
 * @return altura del subárbol.
 */
private int getAltura(NodoBin<T> r) {
    int ai = 0, ad = 0;
    if (r.getIzq() != null)
        ai = getAltura(r.getIzq());
    if (r.getDer() != null)
        ad = getAltura(r.getDer());
    if (ai >= ad)
        return (ai + 1);
    return (ad + 1);
}
    `
  },
  {
    title: "44. Obtener Grado (getGrado)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 20"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el grado (número de hijos) del nodo con la información dada.
 * @param info Información del nodo a consultar.
 * @return grado del nodo o -1 si no existe.
 */
public int getGrado(T info) {
    NodoBin nodo = this.buscar(info);
    if (nodo == null) return -1;
    if (this.esHoja(nodo)) return 0;
    int rta = 0;
    if (nodo.getIzq() != null) rta++;
    if (nodo.getDer() != null) rta++;
    return rta;
}
    `
  },
  {
    title: "45. Consultar Árbol Completo (esCompleto)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Indica si el árbol binario es completo.
 * @return true si es completo, false en caso contrario.
 */
public boolean esCompleto() {
    return esCompleto(this.raiz);
}
    `
  },
  {
    title: "46. Consultar Árbol Completo Privado (esCompleto)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: indica si el subárbol es completo.
 * @param r Nodo raíz o subraíz.
 * @return true si es completo.
 */
private boolean esCompleto(NodoBin<T> r) {
    if (this.esHoja(r))
        return true;
    else if (r.getIzq() != null && r.getDer() != null)
        return esCompleto(r.getIzq()) && esCompleto(r.getDer());
    else
        return false;
}
    `
  },
  {
    title: "47. Consultar Árbol Lleno (estaLleno)",
    operationalCost: ["T(n) = 4T(n/2) + O(1) + 6"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Indica si el árbol binario está lleno.
 * @return true si está lleno, false en caso contrario.
 */
public boolean estaLleno() {
    return estaLleno(this.raiz, this.getAltura());
}
    `
  },
  {
    title: "48. Consultar Árbol Lleno Privado (estaLleno)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: indica si el subárbol está lleno.
 * @param r Nodo raíz o subraíz.
 * @param alt Altura esperada.
 * @return true si está lleno.
 */
private boolean estaLleno(NodoBin<T> r, int alt) {
    if (this.esHoja(r))
        return (alt == 1);
    else if (r.getIzq() == null || r.getDer() == null)
        return false;
    else
        return estaLleno(r.getIzq(), alt - 1) && estaLleno(r.getDer(), alt - 1);
}
    `
  },
  {
    title: "49. Podar Árbol (podar)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 10"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina las hojas (nodos terminales) del árbol binario.
 */
public void podar() {
    if (this.esHoja(raiz))
        this.setRaiz(null);
    podar(this.raiz);
}
    `
  },
  {
    title: "50. Podar Árbol Privado (podar)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: elimina hojas del árbol binario.
 * @param x Nodo raíz o subraíz.
 */
private void podar(NodoBin<T> x) {
    if (x == null)
        return;
    if (this.esHoja(x.getIzq()))
        x.setIzq(null);
    if (this.esHoja(x.getDer()))
        x.setDer(null);
    podar(x.getIzq());
    podar(x.getDer());
}
    `
  },
  {
    title: "51. Retornar Łukasiewicz (Luca)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el código Łukasiewicz del árbol binario (etiqueta nodos internos con 'a', externos con 'b').
 * Recorrido en preorden.
 * @return String con el código Łukasiewicz del árbol binario.
 */
public String Luca() {
    return Luca(this.raiz);
}
    `
  },
  {
    title: "52. Retornar Łukasiewicz Privado (Luca)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para retornar el código Łukasiewicz.
 * @param r Nodo raíz o subraíz.
 * @return String Łukasiewicz del subárbol.
 */
private String Luca(NodoBin<T> r) {
    if (r == null)
        return "b";
    return "a" + Luca(r.getIzq()) + Luca(r.getDer());
}
    `
  },
  {
    title: "53. Consultar Árboles Iguales (esIgual)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 3"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Determina si dos árboles binarios son iguales en información y estructura.
 * @param a2 Segundo árbol a comparar.
 * @return true si son iguales, false en caso contrario.
 */
public boolean esIgual(ArbolBinario<T> a2) {
    return esIgual(this.raiz, a2.getRaiz());
}
    `
  },
  {
    title: "54. Consultar Árboles Iguales Privado (esIgual)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: determina igualdad entre dos subárboles.
 * @param r1 Nodo raíz del primer árbol.
 * @param r2 Nodo raíz del segundo árbol.
 * @return true si ambos subárboles son iguales.
 */
private boolean esIgual(NodoBin<T> r1, NodoBin<T> r2) {
    if (r1 == null && r2 == null)
        return true;
    if (r1 == null || r2 == null)
        return false;
    if (r1.getInfo() == r2.getInfo())
        return esIgual(r1.getIzq(), r2.getIzq()) && esIgual(r1.getDer(), r2.getDer());
    else
        return false;
}
    `
  },
  {
    title: "55. Es Isomorfo (esIsomorfo)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 3"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Determina si dos árboles binarios son isomorfos (misma estructura).
 * @param a2 Segundo árbol a comparar.
 * @return true si son isomorfos, false en caso contrario.
 */
public boolean esIsomorfo(ArbolBinario<T> a2) {
    return esIsomorfo(this.raiz, a2.getRaiz());
}
    `
  },
  {
    title: "56. Es Isomorfo Privado (esIsomorfo)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: determina isomorfismo entre dos subárboles.
 * @param r1 Nodo raíz del primer árbol.
 * @param r2 Nodo raíz del segundo árbol.
 * @return true si son isomorfos.
 */
private boolean esIsomorfo(NodoBin<T> r1, NodoBin<T> r2) {
    if (r1 == null && r2 == null)
        return true;
    if (r1 == null || r2 == null)
        return false;
    return esIsomorfo(r1.getIzq(), r2.getIzq()) && esIsomorfo(r1.getDer(), r2.getDer());
}
    `
  },
  {
    title: "57. Consultar Árboles Semejantes (esSemejante)",
    operationalCost: ["T(n) = 4T(n/2) + O(1) + 2T(n/2) + O(n) + 7"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Determina si dos árboles son semejantes (misma información, diferente forma).
 * @param a2 Segundo árbol a comparar.
 * @return true si son semejantes.
 */
public boolean esSemejante(ArbolBinario<T> a2) {
    if (this.getPeso() != a2.getPeso())
        return false;
    return esSemejante(a2.getRaiz());
}
    `
  },
  {
    title: "58. Consultar Árboles Semejantes Privado (esSemejante)",
    operationalCost: ["T(n) = 2T(n/2) + O(n)"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado: determina semejanza entre subárboles.
 * @param r Nodo raíz a evaluar.
 * @return true si es semejante.
 */
private boolean esSemejante(NodoBin<T> r) {
    if (r == null)
        return true;
    if (!this.esta(r.getInfo()))
        return false;
    return esSemejante(r.getIzq()) && esSemejante(r.getDer());
}
    `
  },
  {
    title: "59. Imprimir Árbol (imprime)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Imprime la información del árbol binario en consola.
 */
public void imprime() {
    System.out.println(" ----- Arbol Binario ----- ");
    this.imprime(this.raiz);
}
    `
  },
  {
    title: "60. Imprimir Árbol Privado (imprime)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: imprime información del árbol/subárbol en consola.
 * @param n Nodo raíz.
 */
public void imprime(NodoBin<T> n) {
    T l = null, r = null;
    if (n == null) return;
    if (n.getIzq() != null) l = n.getIzq().getInfo();
    if (n.getDer() != null) r = n.getDer().getInfo();
    System.out.println("NodoIzq: " + l + "\\t Info: " + n.getInfo() + "\\t NodoDer: " + r);
    if (n.getIzq() != null) imprime(n.getIzq());
    if (n.getDer() != null) imprime(n.getDer());
}
    `
  },
  {
    title: "61. Clonar Árbol (clonar)",
    operationalCost: ["T(n) = 2T(n/2) + O(1) + 6"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Clona la información de un Árbol Binario de Búsqueda.
 * @return Nuevo árbol con la información duplicada.
 */
public ArbolBinarioBusqueda<T> clonar() {
    ArbolBinarioBusqueda<T> t = new ArbolBinarioBusqueda<T>();
    t.setRaiz(clonarAB(this.getRaiz()));
    return t;
}
    `
  },
  {
    title: "62. Clonar Árbol Privado (clonarAB)",
    operationalCost: ["T(n) = 2T(n/2) + O(1)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado: clona nodos del árbol.
 * @param r Nodo raíz o subraíz.
 * @return NodoBin clonado.
 */
private NodoBin<T> clonarAB(NodoBin<T> r) {
    if (r == null)
        return r;
    else {
        NodoBin<T> aux = new NodoBin<T>(
            r.getInfo(),
            clonarAB(r.getIzq()),
            clonarAB(r.getDer())
        );
        return aux;
    }
}
    `
  },
];
