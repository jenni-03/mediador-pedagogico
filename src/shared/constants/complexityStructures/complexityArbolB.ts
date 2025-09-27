export const complexityArbolB = [
  {
    title: "1. Constructor Vacío (ArbolB)",
    operationalCost: ["T(n) = 6"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un arbol B vacío con orden por defecto de 2.
 */
public ArbolB() {
    this.raiz = null;
    this.n = 2;
    this.m = n * 2;
    this.m1 = (this.m) + 1;
}
    `,
  },
  {
    title: "2. Constructor Vacío con Orden Específico (ArbolB)",
    operationalCost: ["T(n) = 7"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un arbol B vacío con orden específico.
 */
public ArbolB(int n) {
    if (n <= 0) {
        System.err.println("Tamano del orden del arbol no es válido");
        return;
    }
    this.raiz = null;
    this.n = n;
    this.m = n * 2;
    this.m1 = (this.m) + 1;
}
    `,
  },
  {
    title: "3. Obtener Raíz del Árbol B (getRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite conocer la raíz del Árbol B.
 */
public Pagina getRaiz() {
    return raiz;
}
    `,
  },
  {
    title: "4. Modificar Raíz del Árbol B (setRaiz)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite modificar la raíz del Árbol B.
 */
protected void setRaiz(Pagina raiz) {
    this.raiz = raiz;
}
    `,
  },
  {
    title: "5. Obtener el Orden del Árbol (getN)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite saber el número de orden del Árbol B.
 */
public int getN() {
    return n;
}
    `,
  },
  {
    title: "6. Obtener el Máximo de Elementos por Página (getM)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite saber el número máximo de elementos por página.
 */
public int getM() {
    return m;
}
    `,
  },
  {
    title: "7. Obtener el Máximo de Apuntadores por Página (getM1)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite saber el número máximo de apuntadores por página.
 */
public int getM1() {
    return m1;
}
    `,
  },
  {
    title: "8. Modificar el Orden del Árbol (setN)",
    operationalCost: ["T(n) = 1"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Permite modificar el número de orden del Árbol B.
 */
public void setN(int n) {
    this.n = n;
}
    `,
  },
  {
    title: "9. Insertar Dato en el Árbol B (insertar)",
    operationalCost: ["T(n) = 28n² + 2n²(KTE) + 2n(KTE) + 4n + KTE"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Inserta un nuevo dato en el Árbol B.
 */
public boolean insertar(T x) {
    Pila<Pagina> pila = new Pila<Pagina>();
    T[] subir = (T[]) new Object[1];
    T[] subir1 = (T[]) new Object[1];
    int posicion = 0, i = 0, terminar, separar;
    Pagina p = null, nuevo = null, nuevo1;
    if (this.raiz == null) {
        this.raiz = this.crearPagina(x);
    } else {
        posicion = this.buscar(this.raiz, x, pila);
        if (posicion == -1) {
            return false;
        } else {
            terminar = separar = 0;
            while ((!pila.esVacia()) && (terminar == 0)) {
                p = pila.desapilar();
                if (p.getCont() == this.m) {
                    if (separar == 0) {
                        nuevo = this.romper(p, null, x, subir);
                        separar = 1;
                    } else {
                        nuevo1 = this.romper(p, nuevo, subir[0], subir1);
                        subir[0] = subir1[0];
                        nuevo = nuevo1;
                    }
                } else {
                    if (separar == 1) {
                        separar = 0;
                        i = this.donde(p, subir[0]);
                        i = this.insertar(p, subir[0], i);
                        this.cderechaApunt(p, i + 1);
                        p.getApuntadores()[i + 1] = nuevo;
                    } else {
                        posicion = this.insertar(p, x, posicion);
                    }
                    terminar = 1;
                }
            }
            if ((separar == 1) && (terminar == 0)) {
                this.setRaiz(this.crearPagina(subir[0]));
                this.raiz.getApuntadores()[0] = p;
                this.raiz.getApuntadores()[1] = nuevo;
            }
        }
    }
    return true;
}
    `,
  },
  {
    title: "10. Insertar Página en el Árbol B (insertar)",
    operationalCost: ["T(n) = 6n + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta una página en el Árbol B.
 */
private int insertar(Pagina p, T x, int i) {
    int j;
    if (p.getCont() != 0) {
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        if (compara < 0)
            i++;
        else {
            j = p.getCont() - 1;
            while (j >= i) {
                p.getInfo()[j + 1] = p.getInfo()[j];
                j = j - 1;
            }
        }
    }
    p.setCont(p.getCont() + 1);
    p.getInfo()[i] = x;
    return i;
}
    `,
  },
  {
    title: "11. Eliminar Dato del Árbol B (eliminar)",
    operationalCost: ["T(n) = 28n² + 2n²(KTE) + 2n(KTE) + 4n + KTE"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Elimina un dato del Árbol B.
 */
public boolean eliminar(T x) {
    int posicion, i, k;
    Pagina p, q = null, r, t;
    Pila<Componente> pila = new Pila<Componente>();
    Componente objeto = new Componente();
    posicion = this.esta(this.raiz, x, pila);
    if (posicion == -1) return false;
    else {
        objeto = pila.desapilar();
        p = objeto.getP();
        i = objeto.getV();
        if (!this.esHoja(p)) {
            t = p;
            k = i;
            pila.apilar(new Componente(p, i + 1));
            p = p.getApuntadores()[i + 1];
            while (p != null) {
                pila.apilar(new Componente(p, 0));
                p = p.getApuntadores()[0];
            }
            objeto = pila.desapilar();
            p = objeto.getP();
            i = objeto.getV();
            t.getInfo()[k] = p.getInfo()[0];
            x = (T) p.getInfo()[0];
            posicion = 0;
        }
        if (p.getCont() > this.n)
            this.retirar(p, posicion);
        else {
            if (!pila.esVacia()) {
                objeto = pila.desapilar();
                q = objeto.getP();
                i = objeto.getV();
                if (i < q.getCont()) {
                    r = q.getApuntadores()[i + 1];
                    if (r.getCont() > this.n) {
                        this.retirar(p, posicion);
                        this.cambio(p, q, r, i, x);
                    } else {
                        if (i != 0) {
                            r = q.getApuntadores()[i - 1];
                            if (r.getCont() > this.n) {
                                this.retirar(p, posicion);
                                this.cambio(p, q, r, (i - 1), x);
                            } else {
                                this.unir(q, r, p, (i - 1), pila, x, posicion);
                            }
                        } else {
                            this.unir(q, r, p, i, pila, x, posicion);
                        }
                    }
                } else {
                    r = q.getApuntadores()[i - 1];
                    if (r.getCont() > this.n) {
                        this.retirar(p, posicion);
                        this.cambio(p, q, r, (i - 1), x);
                    } else
                        this.unir(q, r, p, (i - 1), pila, x, posicion);
                }
            } else {
                this.retirar(p, posicion);
                if (p.getCont() == 0) {
                    this.setRaiz(null);
                }
            }
        }
    }
    return true;
}
    `,
  },
  {
    title: "12. Retirar Dato de la Página (retirar)",
    operationalCost: ["T(n) = 6n + 9"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retira un dato de la página indicada.
 */
private void retirar(Pagina p, int i) {
    while (i < p.getCont() - 1) {
        p.getInfo()[i] = p.getInfo()[i + 1];
        i++;
    }
    p.setCont(p.getCont() - 1);
}
    `,
  },
  {
    title: "13. Crear Página en el Árbol B (crearPagina)",
    operationalCost: ["T(n) = 4n + 11"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Crea físicamente una página en memoria.
 */
private Pagina crearPagina(T x) {
    Pagina p = new Pagina(n);
    this.inicializar(p);
    p.setCont(1);
    p.getInfo()[0] = x;
    return p;
}
    `,
  },
  {
    title: "14. Inicializar Página (inicializar)",
    operationalCost: ["T(n) = 4n + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inicializa una página.
 */
private void inicializar(Pagina p) {
    int i = 0;
    p.setCont(0);
    while (i < this.m1)
        p.getApuntadores()[i++] = null;
}
    `,
  },
  {
    title: "15. Evaluar Existencia de un Dato (esta)",
    operationalCost: ["T(n) = n²(KTE) + n(KTE) + 19"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Evalúa la existencia de un dato dentro del Árbol B.
 */
public boolean esta(T dato) {
    Pila pi = new Pila();
    return (this.esta(this.raiz, dato, pi) != (-1));
}
    `,
  },
  {
    title: "16. Determinar si un elemento se encuentra en el árbol (esta)",
    operationalCost: ["T(n) = n²(KTE) + n(KTE) + 14"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Determina si un elemento se encuentra en el árbol.
 */
private int esta(Pagina p, T x, Pila<Componente> pila) {
    int i = 0;
    boolean encontro = false;
    int posicion = -1;
    while ((p != null) && !encontro) {
        i = 0;
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        while ((compara < 0) && (i < (p.getCont() - 1))) {
            i++;
            compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        }
        if (compara > 0) {
            pila.apilar(new Componente(p, i));
            p = p.getApuntadores()[i];
        } else if (compara < 0) {
            pila.apilar(new Componente(p, i + 1));
            p = p.getApuntadores()[i + 1];
        } else {
            pila.apilar(new Componente(p, i));
            encontro = true;
        }
    }
    if (encontro) {
        posicion = i;
    }
    return posicion;
}
    `,
  },
  {
    title: "17. Buscar elemento en el árbol (buscar)",
    operationalCost: ["T(n) = n²(KTE) + n(KTE) + 15"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Busca un elemento en el árbol.
 */
private int buscar(Pagina p, T x, Pila pila) {
    int i = -1, posicion;
    boolean encontro = false;
    posicion = -1;
    while ((p != null) && !encontro) {
        pila.apilar(p);
        i = 0;
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        while ((compara < 0) && (i < (p.getCont() - 1))) {
            i++;
            compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        }
        if (compara > 0)
            p = p.getApuntadores()[i];
        else {
            if (compara < 0)
                p = p.getApuntadores()[i + 1];
            else
                encontro = true;
        }
    }
    if (!encontro)
        posicion = i;
    return posicion;
}
    `,
  },
  {
    title: "18. Lugar físico donde insertar el dato (donde)",
    operationalCost: ["T(n) = n(KTE) + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Indica el lugar físico donde se debe insertar el dato x.
 */
protected int donde(Pagina p, T x) {
    int i;
    i = 0;
    int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
    while ((compara < 0) && (i < (p.getCont() - 1))) {
        i++;
        compara = ((Comparable) p.getInfo()[i]).compareTo(x);
    }
    return i;
}
    `,
  },
  {
    title: "19. Romper una página en dos (romper)",
    operationalCost: ["T(n) = 28n + n(KTE) + 45"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Rompe una página del árbol en dos, para mantener su orden.
 */
private Pagina romper(Pagina p, Pagina t, T x, T[] subir) {
    T[] a = (T[]) new Object[m1];
    int i = 0;
    boolean s = false;
    Pagina[] b = new Pagina[this.m1 + 1];
    while (i < this.m && !s) {
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        if (compara < 0) {
            a[i] = (T) p.getInfo()[i];
            b[i] = p.getApuntadores()[i];
            p.getApuntadores()[i++] = null;
        } else {
            s = true;
        }
    }
    a[i] = x;
    b[i] = p.getApuntadores()[i];
    p.getApuntadores()[i] = null;
    b[++i] = t;
    while (i <= this.m) {
        a[i] = (T) p.getInfo()[i - 1];
        b[i + 1] = p.getApuntadores()[i];
        p.getApuntadores()[i++] = null;
    }
    Pagina q = new Pagina(this.n);
    this.inicializar(q);
    p.setCont(n);
    q.setCont(n);
    i = 0;
    while (i < this.n) {
        p.getInfo()[i] = a[i];
        p.getApuntadores()[i] = b[i];
        q.getInfo()[i] = a[i + n + 1];
        q.getApuntadores()[i] = b[i + n + 1];
        i++;
    }
    p.getApuntadores()[n] = b[n];
    q.getApuntadores()[n] = b[m1];
    subir[0] = a[n];
    return q;
}
    `,
  },
  {
    title: "20. Correr Apuntadores a la Izquierda (cizquierda_apunt)",
    operationalCost: ["T(n) = 6n + 4"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Corre los apuntadores de la página hacia la izquierda.
 */
protected void cizquierda_apunt(Pagina p, int i, int j) {
    while (i < j) {
        p.getApuntadores()[i] = p.getApuntadores()[i + 1];
        i++;
    }
    p.getApuntadores()[i] = null;
}
    `,
  },
  {
    title: "21. Correr Apuntadores a la Derecha (cderechaApunt)",
    operationalCost: ["T(n) = 6n + 5"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Corre los apuntadores de la página hacia la derecha.
 */
protected void cderechaApunt(Pagina p, int i) {
    int j;
    j = p.getCont();
    while (j > i) {
        p.getApuntadores()[j] = p.getApuntadores()[j - 1];
        j--;
    }
}
    `,
  },
  {
    title: "22. Realizar las modificaciones al eliminar un dato (cambio)",
    operationalCost: ["T(n) = 12n + KTE"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Realiza las modificaciones al eliminar un dato, para que el árbol conserve sus características.
 */
protected void cambio(Pagina p, Pagina q, Pagina r, int i, T x) {
    int k;
    T t;
    int compara = ((Comparable) r.getInfo()[r.getCont() - 1]).compareTo(x);
    if (compara < 0) {
        t = (T) q.getInfo()[i];
        this.retirar(q, i);
        k = 0;
        k = this.insertar(p, t, k);
        t = (T) r.getInfo()[r.getCont() - 1];
        this.retirar(r, r.getCont() - 1);
        k = i;
        if (k == -1) k = 0;
        k = this.insertar(q, t, k);
    } else {
        t = (T) q.getInfo()[i];
        this.retirar(q, i);
        k = p.getCont() - 1;
        if (k == -1) k = 0;
        k = this.insertar(p, t, k);
        t = (T) r.getInfo()[0];
        this.retirar(r, 0);
        k = i;
        if (q.getCont() != 0)
            if (k > q.getCont() - 1)
                k = q.getCont() - 1;
        k = this.insertar(q, t, k);
    }
}
    `,
  },
  {
    title: "23. Unir dos páginas (unir)",
    operationalCost: ["T(n) = 28n² + 2n²(KTE) + 2n(KTE) + 4n + KTE"],
    complexity: "Big O = O(n²)",
    javaCode: `
/**
 * Une dos páginas, para conservar las características del árbol B.
 */
private void unir(Pagina q, Pagina r, Pagina p, int i, Pila<Componente> pila, T x, int posicion) {
    int terminar = 0, j = 0, k;
    Pagina t = null;
    Componente objeto = new Componente();
    this.retirar(p, posicion);
    int compara = ((Comparable) r.getInfo()[0]).compareTo(x);
    if (compara > 0) {
        t = p;
        p = r;
        r = t;
    }
    while (terminar == 0) {
        if ((r.getCont() < this.n) && (p.getCont() > this.n)) {
            this.cambio(r, q, p, i, x);
            r.getApuntadores()[r.getCont()] = p.getApuntadores()[0];
            this.cizquierda_apunt(p, 0, p.getCont() + 1);
            terminar = 1;
        } else if ((p.getCont() < this.n) && (r.getCont() > this.n)) {
            this.cambio(p, q, r, i, x);
            this.cderechaApunt(p, 0);
            p.getApuntadores()[0] = r.getApuntadores()[r.getCont() + 1];
            r.getApuntadores()[r.getCont() + 1] = null;
            terminar = 1;
        } else {
            j = r.getCont();
            r.getInfo()[j++] = q.getInfo()[i];
            k = 0;
            while (k <= p.getCont() - 1) {
                r.getInfo()[j++] = (T) p.getInfo()[k++];
            }
            r.setCont(j);
            this.retirar(q, i);
            k = 0;
            j = this.m - p.getCont();
            while (p.getApuntadores()[k] != null) {
                r.getApuntadores()[j++] = p.getApuntadores()[k++];
            }
            p = null;
            if (q.getCont() == 0) {
                q.getApuntadores()[i + 1] = null;
                if (pila.esVacia()) {
                    q = null;
                }
            } else {
                this.cizquierda_apunt(q, i + 1, q.getCont() + 1);
            }
            if (q != null) {
                if (q.getCont() >= this.n) {
                    terminar = 1;
                } else {
                    t = q;
                    if (!pila.esVacia()) {
                        objeto = pila.desapilar();
                        q = objeto.getP();
                        i = objeto.getV();
                        compara = ((Comparable) q.getInfo()[0]).compareTo(x);
                        if (compara <= 0) {
                            p = t;
                            r = q.getApuntadores()[i - 1];
                            i = i - 1;
                        } else {
                            r = t;
                            p = q.getApuntadores()[i + 1];
                        }
                    } else {
                        terminar = 1;
                    }
                }
            } else {
                terminar = 1;
                this.setRaiz(r);
            }
        }
    }
}
    `,
  },
  {
    title: "24. Obtener iterador con las hojas del árbol B (getHojas)",
    operationalCost: ["T(n) = nT(n/n) + O(n) + KTE"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna un iterador con las hojas del árbol B.
 */
public Iterator<T> getHojas() {
    ListaCD<T> l = new ListaCD<>();
    this.getHojas(this.raiz, l);
    return l.iterator();
}
    `,
  },
  {
    title: "25. Obtener iterador privado con las hojas del árbol B (getHojas)",
    operationalCost: ["T(n) = nT(n/n) + O(n)"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método de tipo privado que retorna un iterador con las hojas del árbol B.
 */
private void getHojas(Pagina<T> r, ListaCD<T> l) {
    if (r == null) return;
    if (this.esHoja(r)) {
        for (int j = 0; j < r.getCont(); j++)
            l.insertarAlFinal(r.getInfo()[j]);
    }
    for (int i = 0; i < r.getCont() + 1; i++) {
        this.getHojas(r.getApuntadores()[i], l);
    }
}
    `,
  },
  {
    title: "26. Contar hojas del árbol B (contarHojas)",
    operationalCost: ["T(n) = nT(n/n) + O(n) + 1"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna el número de hojas del árbol B.
 */
public int contarHojas() {
    return this.contarHojas(this.raiz);
}
    `,
  },
  {
    title: "27. Contar hojas del árbol B (privado)",
    operationalCost: ["T(n) = nT(n/n) + O(n)"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado que retorna el número de hojas del árbol B.
 */
private int contarHojas(Pagina<T> r) {
    if (r == null) return 0;
    int cont = 0;
    if (this.esHoja(r)) cont++;
    for (int i = 0; i < r.getCont() + 1; i++) {
        cont += this.contarHojas(r.getApuntadores()[i]);
    }
    return cont;
}
    `,
  },
  {
    title: "28. Determinar si una página es hoja (esHoja)",
    operationalCost: ["T(n) = 2n + 17"],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Determina si una página es hoja.
 */
protected boolean esHoja(Pagina p) {
    int j = 0;
    while ((p.getApuntadores()[j] == null) && (j < (p.getCont() - 1)))
        j++;
    return (p.getApuntadores()[j] == null);
}
    `,
  },
  {
    title: "29. Determinar si el árbol B está vacío (esVacio)",
    operationalCost: ["T(n) = 2"],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Determina si el árbol B está vacío.
 */
public boolean esVacio() {
    return (this.raiz == null);
}
    `,
  },
  {
    title: "30. Obtener el peso del árbol B (getPeso)",
    operationalCost: ["T(n) = nT(n/n) + O(n) + 5"],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna el número de elementos en el árbol B.
 */
public int getPeso() {
    if (this.esVacio())
        return 0;
    return this.getPeso(this.getRaiz());
}
    `,
  },
   {
    title: "31. Obtener el número de elementos del Árbol B (getPeso privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n)"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Devuelve el número de elementos que contiene el Árbol B.
 */
private int getPeso(Pagina<T> r) {
    if (r == null) return 0;
    int cont = 0;
    cont += r.getCont();
    for (int i = 0; i < r.getCont() + 1; i++) {
        cont += this.getPeso(r.getApuntadores()[i]);
    }
    return cont;
}
    `
  },
  {
    title: "32. Obtener la altura del Árbol B (getAltura)",
    operationalCost: [
      "T(n) = 4n + 7"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna la altura del Árbol B.
 */
public int getAltura() {
    return this.getAltura(this.getRaiz());
}
    `
  },
  {
    title: "33. Obtener la altura del Árbol B (getAltura privado)",
    operationalCost: [
      "T(n) = 4n + 5"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Método privado para obtener la altura del Árbol B.
 */
private int getAltura(Pagina<T> r) {
    int alt = 0;
    while (r != null) {
        alt++;
        r = r.getApuntadores()[0];
    }
    return alt;
}
    `
  },
  {
    title: "34. Imprimir el Árbol B (imprime)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n^2) + 3"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Imprime los datos que contiene el árbol.
 */
public String imprime() {
    String msg = "";
    return this.imprime(this.raiz, msg);
}
    `
  },
  {
    title: "35. Imprimir el Árbol B (imprime privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n^2)"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Método privado para imprimir el árbol.
 */
private String imprime(Pagina r, String msg) {
    int i = 0;
    while (i <= r.getCont()) {
        msg += r.toString() + "  pagina = " + i + "   ES =" + r.getApuntadores()[i].toString() + "\\n";
        if (!this.esHoja(r.getApuntadores()[i]))
            msg += this.imprime(r.getApuntadores()[i], msg);
        i++;
    }
    return msg;
}
    `
  },
  {
    title: "36. Clonar la información del Árbol B (clonar)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n) + 7"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Clona la información de un Árbol B.
 */
public ArbolB<T> clonar() {
    ArbolB<T> clon = new ArbolB<T>(this.getN());
    if (raiz == null) return clon;
    clon.setRaiz(this.clonar(this.raiz));
    return clon;
}
    `
  },
  {
    title: "37. Recorrido preOrden (preOrden)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n) + KTE"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna un iterador en preOrden para el Árbol B.
 */
public Iterator<T> preOrden() {
    ListaCD<T> l = new ListaCD<T>();
    this.preOrden(this.raiz, l);
    return l.iterator();
}
    `
  },
  {
    title: "38. Recorrido preOrden (privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n)"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado para el recorrido preOrden.
 */
private void preOrden(Pagina<T> r, ListaCD<T> l) {
    if (r == null) return;
    for (int j = 0; j < r.getCont(); j++)
        l.insertarAlFinal(r.getInfo()[j]);
    for (int i = 0; i < r.getCont() + 1; i++) {
        this.preOrden(r.getApuntadores()[i], l);
    }
}
    `
  },
  {
    title: "39. Recorrido inOrden (inOrden)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n) + KTE"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna un iterador en inOrden para el Árbol B.
 */
public Iterator<T> inOrden() {
    ListaCD<T> l = new ListaCD<T>();
    this.inOrden(this.raiz, l);
    return l.iterator();
}
    `
  },
  {
    title: "40. Recorrido inOrden (privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n)"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado para el recorrido inOrden.
 */
private void inOrden(Pagina<T> r, ListaCD<T> l) {
    if (r == null) return;
    this.inOrden(r.getApuntadores()[0], l);
    for (int j = 0; j < r.getCont(); j++)
        l.insertarAlFinal(r.getInfo()[j]);
    for (int i = 1; i < r.getCont() + 1; i++) {
        this.inOrden(r.getApuntadores()[i], l);
    }
}
    `
  },
  {
    title: "41. Recorrido postOrden (postOrden)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n) + KTE"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Retorna un iterador en postOrden para el Árbol B.
 */
public Iterator<T> postOrden() {
    ListaCD<T> l = new ListaCD<T>();
    this.postOrden(this.raiz, l);
    return l.iterator();
}
    `
  },
  {
    title: "42. Recorrido postOrden (privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n)"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado para el recorrido postOrden.
 */
private void postOrden(Pagina<T> r, ListaCD<T> l) {
    if (r == null) return;
    for (int i = 0; i < r.getCont() + 1; i++) {
        this.postOrden(r.getApuntadores()[i], l);
    }
    for (int j = 0; j < r.getCont(); j++)
        l.insertarAlFinal(r.getInfo()[j]);
}
    `
  },
  {
    title: "43. Recorrido por niveles (impNiveles)",
    operationalCost: [
      "T(n) = n^2(KTE) + 2n(KTE) + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido por niveles del Árbol B.
 */
public Iterator<T> impNiveles() {
    ListaCD<T> l = new ListaCD<T>();
    if (!this.esVacio()) {
        Cola<Pagina<T>> c = new Cola<Pagina<T>>();
        c.enColar(this.getRaiz());
        Pagina<T> x;
        while (!c.esVacia()) {
            x = c.deColar();
            if (x != null) {
                for (int i = 0; i < x.getCont(); i++)
                    l.insertarAlFinal(x.getInfo()[i]);
                for (int j = 0; j < x.getCont() + 1; j++)
                    c.enColar(x.getApuntadores()[j]);
            }
        }
    }
    return l.iterator();
}
    `
  },
  {
    title: "44. Podar las páginas hoja de un Árbol B (podar)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n) + 2n + 19"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Podar las páginas hoja de un Árbol B.
 */
public void podar() {
    if (this.esHoja(raiz))
        this.setRaiz(null);
    this.podar(this.raiz);
}
    `
  },
  {
    title: "45. Podar las páginas hoja de un Árbol B (privado)",
    operationalCost: [
      "T(n) = nT(n/n) + O(n)"
    ],
    complexity: "Big O = O(n log n)",
    javaCode: `
/**
 * Método privado para podar las páginas hoja de un Árbol B.
 */
private void podar(Pagina<T> r) {
    if (r == null) return;
    for (int i = 0; i < r.getCont() + 1; i++) {
        Pagina apunt = r.getApuntadores()[i];
        if (this.esHoja(apunt))
            r.getApuntadores()[i] = null;
    }
    for (int j = 0; j < r.getCont() + 1; j++) {
        if (r.getApuntadores()[j] != null) {
            this.podar(r.getApuntadores()[j]);
        }
    }
}
    `
  },
];
