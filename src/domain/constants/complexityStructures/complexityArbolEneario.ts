export const complexityArbolEneario = [
  {
    title: "1. Constructor Vacío (ArbolEneario)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Eneario vacio.
 */
public ArbolEneario() {
    this.raiz = null;
}
    `
  },
  {
    title: "2. Constructor Raíz Predefinida (ArbolEneario)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un Arbol Eneario con una raiz predefinida.
 */
public ArbolEneario(NodoEneario<T> raiz) {
    this.raiz = raiz;
}
    `
  },
  {
    title: "3. Obtener Objeto de la Raíz (getObjRaiz)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite conocer el objeto en la raiz del Arbol Eneario.
 */
public T getObjRaiz() {
    return raiz.getInfo();
}
    `
  },
  {
    title: "4. Obtener Raíz Árbol (getRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite conocer la raiz del Arbol Eneario.
 */
public NodoEneario<T> getRaiz() {
    return raiz;
}
    `
  },
  {
    title: "5. Modificar Raíz Árbol (setRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite modificar la raiz del Arbol Eneario.
 */
public void setRaiz(NodoEneario<T> raiz) {
    this.raiz = raiz;
}
    `
  },
  {
    title: "6. Insertar Hijo Árbol (insertarHijo)",
    operationalCost: [
      "T(n) = 2[1T(n/2)] + 2[O(n)] + 31"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un nuevo NodoEneario como hijo de un NodoEneario.
 */
public boolean insertarHijo(T padre, T dato) {
    NodoEneario<T> nuevo = new NodoEneario(dato);
    if (this.esVacio()) {
        this.setRaiz(nuevo);
        return true;
    }
    NodoEneario p = this.buscar(padre);
    NodoEneario n = this.buscar(dato);
    if (n != null || p == null)
        return false;
    if (this.esHoja(p)) {
        p.setHijo(nuevo);
        return true;
    }
    NodoEneario<T> q = p.getHijo();
    p.setHijo(nuevo);
    nuevo.setHermano(q);
    return true;
}
    `
  },
  {
    title: "7. Insertar Hermano Árbol (insertarHermano)",
    operationalCost: [
      "T(n) = 2[1T(n/2)] + 2[O(n)] + 29"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un nuevo NodoEneario como hermano de un NodoEneario.
 */
public boolean insertarHermano(T hermano, T dato) {
    NodoEneario<T> nuevo = new NodoEneario(dato);
    if (this.esVacio()) {
        this.raiz = nuevo;
        return true;
    }
    NodoEneario h = this.buscar(hermano);
    NodoEneario n = this.buscar(dato);
    if (this.raiz == h || h == null || n != null)
        return false;
    NodoEneario<T> sigH = h.getHermano();
    h.setHermano(nuevo);
    nuevo.setHermano(sigH);
    return true;
}
    `
  },
  {
    title: "8. Eliminar Dato del Árbol (eliminar)",
    operationalCost: [
      "T(n) = 4T(n/2) + 3[O(n)] + 3n + 31"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Elimina un dato del Arbol Eneario.
 */
public boolean eliminar(T dato) {
    if (!this.esta(dato))
        return false;
    return elimina(dato);
}
    `
  },
  {
    title: "9. Eliminar Dato del Árbol Privado (elimina)",
    operationalCost: [
      "T(n) = 3T(n/2) + 2[O(n)] + 3n + 23"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que elimina un dato del Arbol Eneario.
 */
private boolean elimina(T dato) {
    NodoEneario<T> n, h, p, s;
    n = this.getPadre(dato);
    if (n != null) {
        h = n.getHijo();
        if (h.getHijo() != null) {
            s = h.getHijo();
            n.setHijo(s);
            p = s;
            while (s != null) {
                p = s;
                s = s.getHermano();
            }
            p.setHermano(h.getHermano());
        } else {
            n.setHijo(h.getHermano());
        }
        return true;
    }
    n = this.getHermano(dato);
    if (n != null) {
        h = n.getHermano();
        if (h.getHijo() != null) {
            s = h.getHijo();
            n.setHermano(s);
            p = s;
            while (s != null) {
                p = s;
                s = s.getHermano();
            }
            p.setHermano(h.getHermano());
        } else {
            n.setHermano(n.getHermano().getHermano());
        }
        return true;
    }
    return eliminaR(dato);
}
    `
  },
  {
    title: "10. Eliminar Raíz del Árbol Privado (eliminaR)",
    operationalCost: [
      "T(n) = 3n + 18"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que elimina la raiz del Arbol Eneario.
 */
private boolean eliminaR(T dato) {
    if (this.raiz.getInfo() != dato)
        return false;
    NodoEneario<T> h, p, s;
    this.setRaiz(this.raiz.getHijo());
    if (this.raiz != null) {
        h = this.raiz.getHijo();
        s = this.raiz.getHermano();
        if (h == null) {
            this.raiz.setHijo(s);
        } else {
            p = h;
            while (h != null) {
                p = h;
                h = h.getHermano();
            }
            p.setHermano(s);
        }
    }
    return true;
}
    `
  },
  {
    title: "11. Obtener Padre Árbol (getPadre)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n) + 1"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Conocer el NodoEneario padre de un dato dentro del Arbol.
 */
private NodoEneario<T> getPadre(T info) {
    return gPadre(this.raiz, null, info);
}
    `
  },
  {
    title: "12. Obtener Padre Árbol Privado (gPadre)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para conocer el NodoEneario padre.
 */
private NodoEneario<T> gPadre(NodoEneario<T> r, NodoEneario<T> t, T dato) {
    if (r == null) return null;
    if (r.getInfo().equals(dato)) return t;
    NodoEneario<T> q = r.getHijo();
    while (q != null) {
        NodoEneario<T> s = gPadre(q, r, dato);
        if (s != null) return s;
        r = null;
        q = q.getHermano();
    }
    return null;
}
    `
  },
  {
    title: "13. Obtener Hermano Árbol (getHermano)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(n) + 1"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Conocer el NodoEneario hermano a la izquierda de un dato.
 */
private NodoEneario<T> getHermano(T info) {
    return gHermano(this.raiz, null, info);
}
    `
  },
  {
    title: "14. Obtener Hermano Árbol Privado (gHermano)",
    operationalCost: [
      "T(n) = 2T(n/2) + O(n)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para conocer el NodoEneario hermano de un dato.
 */
private NodoEneario<T> gHermano(NodoEneario<T> r, NodoEneario<T> h, T dato) {
    NodoEneario<T> p = null, q, s;
    if (r == null) return null;
    if (r.getInfo().equals(dato)) return h;
    q = r.getHijo();
    while (q != null) {
        s = gHermano(q, p, dato);
        if (s != null) return s;
        p = q;
        q = q.getHermano();
    }
    return null;
}
    `
  },
  {
    title: "15. Consultar Existencia Elemento en el Árbol (esta)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n) + 6"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Evalua la existencia de un dato dentro del Arbol Eneario.
 */
public boolean esta(T dato) {
    if (this.esVacio()) return false;
    boolean rta = this.esta(this.raiz, dato);
    return rta;
}
    `
  },
{
    title: "16. Consultar Existencia Elemento en el Árbol Privado (esta)",
    operationalCost: ["T(n) = 1T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Evalúa la existencia de un dato dentro del Arbol Eneario (privado).
 */
private boolean esta(NodoEneario<T> r, T dato) {
    NodoEneario<T> q;
    boolean s;
    if (r == null) return false;
    if (r.getInfo().equals(dato)) return true;
    q = r.getHijo();
    while (q != null) {
        s = esta(q, dato);
        if (s) return true;
        q = q.getHermano();
    }
    return false;
}
    `
  },
  {
    title: "17. Buscar Nodo en el Árbol por Dato Privado (buscar)",
    operationalCost: ["T(n) = 1T(n/2) + O(n) + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Busca un dato y retorna el Nodo que lo contiene (privado).
 */
private NodoEneario<T> buscar(T dato) {
    if (this.esVacio()) return null;
    return this.buscar(this.raiz, dato);
}
    `
  },
  {
    title: "18. Buscar Nodo en el Árbol por Raiz y Dato Privado (buscar)",
    operationalCost: ["T(n) = 1T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Busca un dato y retorna el Nodo que lo contiene desde una raíz dada (privado).
 */
private NodoEneario<T> buscar(NodoEneario<T> r, T dato) {
    NodoEneario<T> q, s;
    if (r == null) return r;
    if (r.getInfo().equals(dato)) return r;
    q = r.getHijo();
    while (q != null) {
        s = buscar(q, dato);
        if (s != null) return s;
        q = q.getHermano();
    }
    return null;
}
    `
  },
  {
    title: "19. Obtener Iterador Hijos por Padre (getHijos)",
    operationalCost: ["T(n) = 1T(n/2) + O(n) + n(KTE) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna los hijos de un dato insertado en el Arbol Eneario.
 */
public Iterator<T> getHijos(T padre) {
    ListaCD<T> l = new ListaCD<T>();
    NodoEneario p = this.buscar(this.raiz, padre);
    if (p == null) return l.iterator();
    NodoEneario q = p.getHijo();
    while (q != null) {
        l.insertarAlFinal((T) q.getInfo());
        q = q.getHermano();
    }
    return l.iterator();
}
    `
  },
  {
    title: "20. Obtener Iterador Hojas (getHojas)",
    operationalCost: ["T(n) = 1T(n/2) + O(n) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con las hojas del Arbol Eneario.
 */
public Iterator<T> getHojas() {
    ListaCD<T> l = new ListaCD();
    getHojas(this.raiz, l);
    return l.iterator();
}
    `
  },
  {
    title: "21. Obtener Iterador Hojas Privado (getHojas)",
    operationalCost: ["T(n) = 1T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para obtener iterador con las hojas del Arbol Eneario.
 */
private void getHojas(NodoEneario<T> r, ListaCD<T> l) {
    NodoEneario<T> q;
    if (r == null) return;
    q = r.getHijo();
    if (q == null) {
        l.insertarAlFinal(r.getInfo());
        return;
    }
    while (q != null) {
        getHojas(q, l);
        q = q.getHermano();
    }
}
    `
  },
  {
    title: "22. Consultar Existencia Hoja en Nodo Privado (esHoja)",
    operationalCost: ["T(n) = 3"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Evalúa si un NodoEneario es una Hoja.
 */
private boolean esHoja(NodoEneario<T> r) {
    return (r.getHijo() == null);
}
    `
  },
  {
    title: "23. Consultar Número Hojas en el Árbol (contarHojas)",
    operationalCost: ["T(n) = 1T(n/2) + O(n) + 1"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de hojas del Arbol Eneario.
 */
public int contarHojas() {
    return contarHojas(this.raiz);
}
    `
  },
  {
    title: "24. Consultar Número Hojas en el Árbol Privado (contarHojas)",
    operationalCost: ["T(n) = 1T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que retorna el número de hojas del Arbol Eneario.
 */
private int contarHojas(NodoEneario<T> r) {
    NodoEneario q;
    if (r == null) return 0;
    q = r.getHijo();
    if (q == null) return 1;
    int acum = 0;
    while (q != null) {
        acum += contarHojas(q);
        q = q.getHermano();
    }
    return acum;
}
    `
  },
  {
    title: "25. Obtener Iterador en Pre-Orden (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido preOrden del Arbol Eneario.
 */
public Iterator<T> preOrden() {
    ListaCD<T> l = new ListaCD<T>();
    preOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "26. Obtener Iterador en Pre-Orden Privado (preOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que retorna el recorrido preOrden del Arbol Eneario.
 */
private void preOrden(NodoEneario<T> r, ListaCD<T> l) {
    NodoEneario<T> q;
    if (r != null) {
        l.insertarAlFinal(r.getInfo());
        q = r.getHijo();
        if (q != null) {
            preOrden(q, l);
            q = q.getHermano();
            while (q != null) {
                preOrden(q, l);
                q = q.getHermano();
            }
        }
    }
}
    `
  },
  {
    title: "27. Obtener Iterador en In-Orden (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido inOrden del Arbol Eneario.
 */
public Iterator<T> inOrden() {
    ListaCD<T> l = new ListaCD<T>();
    inOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "28. Obtener Iterador en In-Orden Privado (inOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que retorna el recorrido inOrden del Arbol Eneario.
 */
private void inOrden(NodoEneario<T> r, ListaCD<T> l) {
    NodoEneario<T> q;
    if (r != null) {
        q = r.getHijo();
        if (q == null) {
            l.insertarAlFinal(r.getInfo());
        } else {
            inOrden(q, l);
            l.insertarAlFinal(r.getInfo());
            q = q.getHermano();
            while (q != null) {
                inOrden(q, l);
                q = q.getHermano();
            }
        }
    }
}
    `
  },
  {
    title: "29. Obtener Iterador en Post-Orden (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido postOrden del Arbol Eneario.
 */
public Iterator<T> postOrden() {
    ListaCD<T> l = new ListaCD<T>();
    postOrden(this.getRaiz(), l);
    return l.iterator();
}
    `
  },
  {
    title: "30. Obtener Iterador en Post-Orden Privado (postOrden)",
    operationalCost: ["T(n) = 2T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que retorna el recorrido postOrden del Arbol Eneario.
 */
private void postOrden(NodoEneario<T> r, ListaCD<T> l) {
    NodoEneario<T> q;
    if (r != null) {
        q = r.getHijo();
        while (q != null) {
            postOrden(q, l);
            q = q.getHermano();
        }
        l.insertarAlFinal(r.getInfo());
    }
}
    `
  },
  {
    title: "31. Obtener Iterador Niveles Árbol (impNiveles)",
    operationalCost: ["T(n) = n(KTE)^2 + KTE"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido por niveles del Arbol Eneario.
 */
public Iterator<T> impNiveles() {
    Cola<NodoEneario<T>> c = new Cola();
    ListaCD<T> l = new ListaCD();
    if (this.esVacio()) return l.iterator();
    NodoEneario<T> s, q;
    c.enColar(this.raiz);
    while (!c.esVacia()) {
        q = c.deColar();
        if (q != null) {
            l.insertarAlFinal(q.getInfo());
            s = q.getHijo();
            while (s != null) {
                c.enColar(s);
                s = s.getHermano();
            }
        }
    }
    return l.iterator();
}
    `
  },
  {
    title: "32. Obtener Peso Árbol (getPeso)",
    operationalCost: ["T(n) = 2T(n/2) + O(n) + 2"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de elementos en el Arbol Eneario.
 */
public int getPeso() {
    return getPeso(this.getRaiz());
}
    `
  },
  {
    title: "33. Obtener Peso Árbol Privado (getPeso)",
    operationalCost: ["T(n) = 2T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para retornar el número de elementos del Arbol Eneario.
 */
private int getPeso(NodoEneario<T> r) {
    NodoEneario<T> q;
    int cant = 0;
    if (r != null) {
        cant++;
        q = r.getHijo();
        if (q != null) {
            cant += getPeso(q);
            q = q.getHermano();
            while (q != null) {
                cant += getPeso(q);
                q = q.getHermano();
            }
        }
    }
    return cant;
}
    `
  },
  {
    title: "34. Consultar Existencia Elementos Árbol (esVacio)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite saber si el Arbol Eneario está vacío.
 */
public boolean esVacio() {
    return (this.raiz == null);
}
    `
  },
  {
    title: "35. Obtener Grado Árbol (gordura)",
    operationalCost: ["T(n) = n(KTE)^2 + KTE"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Retorna la gordura del Arbol Eneario (mayor número de hijos de un nodo).
 */
public int gordura() {
    if (this.esVacio()) return 0;
    int masGordo = -1;
    Cola<NodoEneario<T>> cola = new Cola<NodoEneario<T>>();
    Cola<Integer> c = new Cola<Integer>();
    NodoEneario<T> s, q;
    int i = 0;
    int cont = 1, ant = -1;
    cola.enColar(this.getRaiz());
    c.enColar(i);
    while (!cola.esVacia()) {
        q = cola.deColar();
        i = c.deColar();
        if (i != ant) {
            if (masGordo < cont) masGordo = cont;
            cont = 0;
            ant = i;
        }
        cont++;
        s = q.getHijo();
        while (s != null) {
            cola.enColar(s);
            c.enColar(i + 1);
            s = s.getHermano();
        }
    }
    return ((masGordo < cont) ? cont : masGordo);
}
    `
  },
  {
    title: "36. Obtener Altura Árbol (getAltura)",
    operationalCost: ["T(n) = 1T(n/2) + O(n) + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la altura del Arbol Eneario.
 */
public int getAltura() {
    if (this.esVacio()) return 0;
    return getAltura(this.getRaiz());
}
    `
  },
  {
    title: "37. Obtener Altura Árbol Privado (getAltura)",
    operationalCost: ["T(n) = 1T(n/2) + O(n)"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado que retorna la altura del Arbol Eneario.
 */
private int getAltura(NodoEneario<T> r) {
    if (this.esHoja(r)) return 1;
    int maxAltura = 0;
    NodoEneario<T> q;
    if (r != null) {
        q = r.getHijo();
        if (q != null) {
            while (q != null) {
                int auxAltura = getAltura(q);
                if (auxAltura > maxAltura)
                    maxAltura = auxAltura;
                q = q.getHermano();
            }
        }
    }
    return (maxAltura + 1);
}
    `
  },

];
