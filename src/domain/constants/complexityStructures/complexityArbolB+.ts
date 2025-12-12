export const complexityArbolBPlus = [
  {
    title: "1. Constructor vacío (ArbolBMas)",
    operationalCost: [
      "T(n) = 1 + 1 + KTE",
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un árbol B+ vacío con orden específico.
 * post: Se creó un árbol B+ vacío con orden específico.
 */
public ArbolBMas() {
    super();
    this.vsam = super.getRaiz();
}
    `
  },
  {
    title: "2. Constructor con orden específico (ArbolBMas)",
    operationalCost: [
      "T(n) = 1 + 1 + KTE",
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Crea un árbol B+ vacío con orden específico.
 * post: Se creó un árbol B+ vacío con orden específico.
 * @param n El número de orden del árbol B+.
 */
public ArbolBMas(int n) {
    super(n);
    this.vsam = super.getRaiz();
}
    `
  },
  {
    title: "3. Obtener apuntador principal (getVsam)",
    operationalCost: [
      "T(n) = 1"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Obtiene el apuntador hacia los datos almacenados en el árbol.
 * post: Se retornó el apuntador hacia los datos almacenados en el árbol.
 */
public Pagina<T> getVsam() {
    return vsam;
}
    `
  },
  {
    title: "4. Insertar elemento en el árbol B+ (insertarBMas)",
    operationalCost: [
      "T(n) = n^2(KTE) + n(KTE) + 15 + 6n^2 + n(KTE) + 4n + KTE"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Inserta un nuevo dato en el árbol B+.
 * post: Se insertó un nuevo dato al árbol B+.
 * @param x Dato a insertar.
 * @return true si se insertó correctamente, false en caso contrario.
 */
public boolean insertarBMas(T x) {
    Pila pila = new Pila();
    T[] subir = (T[]) new Object[1];
    T[] subir1 = (T[]) new Object[1];
    int posicion = 0, i = 0, terminar, separar;
    Pagina p = null, nuevo = null, nuevo1 = null;
    if (super.getRaiz() == null) {
        super.setRaiz(this.crearPagina(super.getN(), x));
        vsam = super.getRaiz();
        return true;
    } else {
        posicion = buscar(super.getRaiz(), x, pila);
        if (posicion == -1)
            return false;
        else {
            terminar = separar = 0;
            while ((!pila.esVacia()) && (terminar == 0)) {
                p = (Pagina) pila.desapilar();
                if (p.getCont() == super.getM()) {
                    if (separar == 0) {
                        nuevo = romper(p, null, x, subir, separar);
                        separar = 1;
                    } else { 
                        nuevo1 = romper(p, nuevo, subir[0], subir1, separar);
                        subir[0] = subir1[0];
                        nuevo = nuevo1;
                    }
                } else {
                    if (separar == 1) {
                        separar = 0;
                        i = donde(p, subir[0]);
                        i = insertar(p, subir[0], i);
                        super.cderechaApunt(p, i + 1);
                        p.getApuntadores()[i + 1] = nuevo;
                    } else
                        posicion = insertar(p, x, posicion);
                    terminar = 1;
                }
            }
            if ((separar == 1) && (terminar == 0)) {
                this.setRaiz(this.crearPagina(super.getN(), subir[0]));
                super.getRaiz().getApuntadores()[0] = p;
                super.getRaiz().getApuntadores()[1] = nuevo;
            }
        }
    }
    return true;
}
    `
  },
  {
    title: "5. Insertar elemento en página (insertar)",
    operationalCost: [
      "T(n) = 6n + KTE"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inserta un dato en una página del árbol B+.
 * post: Se insertó el dato en la página.
 * @param p Página donde se inserta el dato.
 * @param x Dato a insertar.
 * @param i Posición en la que se inserta el dato.
 * @return La posición donde se insertó el dato.
 */
private int insertar(Pagina p, T x, int i) {
    int j;
    if (p.getCont() != 0) {
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        if (compara < 0) {
            i++;
        } else {
            j = p.getCont() - 1;
            while (j >= i) {
                p.getInfo()[j + 1] = p.getInfo()[j];
                j = j - 1;
            }
        }
    }
    p.getInfo()[i] = x;
    p.setCont(p.getCont() + 1);
    return i;
}
    `
  },
  {
    title: "6. Eliminar elemento del árbol B+ (eliminarBMas)",
    operationalCost: [
      "T(n) = n^2(KTE) + 20n^2 + 2n(KTE) + 36n + KTE"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Elimina un dato del árbol B+.
 * post: Se eliminó el dato del árbol B+.
 * @param x Dato a eliminar.
 * @return true si se eliminó correctamente, false en caso contrario.
 */
public boolean eliminarBMas(T x) {
    int posicion, i, k;
    T temp = null;
    Pagina p = null, q = null, r = null, t;
    Pila<Componente> pila = new Pila();
    Componente objeto = null;
    posicion = estaBMas(super.getRaiz(), x, pila);
    if (posicion == -1)
        return false;
    objeto = pila.desapilar();
    p = objeto.getP();
    i = objeto.getV();
    if (p.getCont() > super.getN()) {
        retirar(p, posicion);
        return true;
    }
    if (pila.esVacia()) {
        retirar(p, posicion);
        if (p.getCont() == 0) {
            super.setRaiz(null);
            vsam = super.getRaiz();
        }
        return true;
    }
    objeto = (Componente) pila.desapilar();
    q = objeto.getP();
    i = objeto.getV();
    if (i < q.getCont()) {
        r = q.getApuntadores()[i + 1];
        if (r.getCont() > super.getN()) {
            retirar(p, posicion);
            temp = (T) r.getInfo()[0];
            retirar(r, 0);
            retirar(q, i);
            k = donde(p, temp);
            insertar(p, temp, k);
            k = donde(q, (T) r.getInfo()[0]);
            insertar(q, (T) r.getInfo()[0], k);
            return true;
        }
    }
    if (i > 0) {
        r = q.getApuntadores()[i - 1];
        if (r.getCont() > super.getN()) {
            retirar(p, posicion);
            temp = (T) r.getInfo()[r.getCont() - 1];
            retirar(r, r.getCont() - 1);
            retirar(q, i - 1);
            k = this.donde(p, temp);
            insertar(p, temp, k);
            k = this.donde(q, temp);
            insertar(q, temp, k);
            return true;
        }
    }
    if (i > 0) i--;
    unirBMas(q, r, p, i, pila, x, posicion);
    return true;
}
    `
  },
  {
    title: "7. Retirar elemento de página (retirar)",
    operationalCost: [
      "T(n) = 6n + 12"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retira un dato de una página del árbol B+.
 * post: Se eliminó el dato de la página.
 * @param p Página de la que se elimina el dato.
 * @param i Posición del dato a eliminar.
 */
private void retirar(Pagina p, int i) {
    while (i < p.getCont() - 1) {
        p.getInfo()[i] = p.getInfo()[i + 1];
        i++;
    }
    p.setCont(p.getCont() - 1);
}
    `
  },
  {
    title: "8. Crear página (crearPagina)",
    operationalCost: [
      "T(n) = 4n + 14"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Crea físicamente una página en memoria.
 * post: Se creó físicamente una página en memoria.
 * @param n Orden de la página.
 * @param x Información de la nueva hoja.
 * @return Página creada.
 */
private Pagina crearPagina(int n, T x) {
    Pagina p = new Pagina(n);
    inicializar(p);
    p.setCont(1);
    p.getInfo()[0] = (x);
    return p;
}
    `
  },
  {
    title: "9. Inicializar página (inicializar)",
    operationalCost: [
      "T(n) = 4n + 7"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Inicializa una página del árbol B+.
 * post: Se inicializó la página.
 * @param p Página a inicializar.
 */
private void inicializar(Pagina p) {
    int i = 0;
    p.setCont(0);
    while (i < super.getM1())
        p.getApuntadores()[i++] = null;
}
    `
  },
  {
    title: "10. Consultar existencia de elemento (estaBMas)",
    operationalCost: [
      "T(n) = n^2(KTE) + n(KTE) + 21"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Evalúa la existencia de un dato dentro del Árbol B+.
 * post: Se evaluó la existencia de un dato.
 * @param dato Dato a consultar.
 * @return true si encontró el dato, false en caso contrario.
 */
public boolean estaBMas(T dato) {
    Pila<Componente> pi = new Pila();
    return (this.estaBMas(super.getRaiz(), dato, pi) != (-1));
}
    `
  },
  {
    title: "11. Consultar Existencia Elemento Página Árbol (estaBMas)",
    operationalCost: [
      "T(n) = n^2(KTE) + n(KTE) + 15"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Determina si un elemento se encuentra en el árbol B+.
 * post: Se evaluó la existencia de un dato dentro del Árbol.
 * @param p Página a buscar.
 * @param x Dato a buscar.
 * @param pi Pila que almacena el camino de búsqueda.
 * @return Posición de x dentro de la página donde se encontró, o -1 si no está.
 */
private int estaBMas(Pagina p, T x, Pila<Componente> pi) {
    int i = 0;
    boolean encontro = false;
    int posicion = -1;
    while ((p != null) && (!encontro)) {
        i = 0;
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        while ((compara < 0) && (i < (p.getCont() - 1))) {
            i++;
            compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        }
        if ((compara > 0)) {
            pi.apilar(new Componente(p, i));
            p = p.getApuntadores()[i];
        } else if ((compara < 0)) {
            pi.apilar(new Componente(p, i + 1));
            if (p.getApuntadores()[0] != null)
                p = p.getApuntadores()[i + 1];
            else
                p = null;
        } else {
            if (p.getApuntadores()[0] != null) {
                pi.apilar(new Componente(p, i + 1));
                p = p.getApuntadores()[i + 1];
            } else {
                pi.apilar(new Componente(p, i));
                encontro = true;
            }
        }
    }
    if (encontro) {
        posicion = i;
    }
    return posicion;
}
    `
  },
  {
    title: "12. Buscar Elemento Página Árbol (buscar)",
    operationalCost: [
      "T(n) = n^2(KTE) + n(KTE) + 15"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Busca un elemento en el árbol B+.
 * post: Se realizó una búsqueda de x en el árbol.
 * @param p Página a buscar.
 * @param x Dato a buscar.
 * @param pila Pila que almacena el camino de búsqueda.
 * @return Posición de x donde se encontró, o -1 si no está.
 */
private int buscar(Pagina p, T x, Pila pila) {
    int i = 0;
    boolean encontro = false;
    int posicion = -1;
    while ((p != null) && (!encontro)) {
        pila.apilar(p);
        i = 0;
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        while ((compara < 0) && (i < (p.getCont() - 1))) {
            i++;
            compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        }
        if ((compara > 0))
            p = p.getApuntadores()[i];
        else if (compara < 0)
            if (p.getApuntadores()[0] != null)
                p = p.getApuntadores()[i + 1];
            else
                p = null;
        else if (p.getApuntadores()[0] != null)
            p = p.getApuntadores()[i + 1];
        else
            encontro = true;
    }
    if (!encontro)
        posicion = i;
    return posicion;
}
    `
  },
  {
    title: "13. Dividir Página Árbol (romper)",
    operationalCost: [
      "T(n) = n(KTE) + 29n + 83"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Divide una página del árbol en dos para mantener el orden.
 * post: Se dividió una página para mantener características del árbol B+.
 * @param p Página a dividir.
 * @param t Apuntador: null si es hoja.
 * @param x Dato a insertar.
 * @param subir Contenedor de la página a ascender.
 * @param separar Variable que ajusta el último apuntador.
 * @return Nueva página del árbol.
 */
private Pagina romper(Pagina p, Pagina t, T x, T[] subir, int separar) {
    T[] a = (T[]) new Object[super.getM1()];
    int i = 0;
    boolean s = false;
    Pagina[] b = new Pagina[super.getM1() + 1];
    Pagina temp = null;
    if (separar == 0) {
        temp = p.getApuntadores()[super.getM()];
        p.getApuntadores()[super.getM()] = null;
    }
    while ((i < super.getM()) && (!s)) {
        int compara = ((Comparable) p.getInfo()[i]).compareTo(x);
        if (compara < 0) {
            a[i] = (T) p.getInfo()[i];
            b[i] = p.getApuntadores()[i];
            p.getApuntadores()[i++] = null;
        } else
            s = true;
    }
    a[i] = x;
    b[i] = p.getApuntadores()[i];
    p.getApuntadores()[i] = null;
    b[++i] = t;
    while ((i <= super.getM())) {
        a[i] = (T)(p.getInfo()[i - 1]);
        b[i + 1] = p.getApuntadores()[i];
        p.getApuntadores()[i++] = null;
    }
    Pagina q = new Pagina(super.getN());
    inicializar(q);
    i = 0;
    if (separar == 0) {
        p.setCont(super.getN());
        q.setCont(super.getN() + 1);
        q.getInfo()[0] = a[super.getN()];
        while (i < super.getN()) {
            p.getInfo()[i] = a[i];
            p.getApuntadores()[i] = b[i];
            q.getInfo()[i + 1] = a[i + super.getN() + 1];
            q.getApuntadores()[i] = b[i + super.getN() + 1];
            i++;
        }
        q.getApuntadores()[super.getM()] = temp;
        p.getApuntadores()[super.getM()] = q;
    } else {
        p.setCont(super.getN());
        q.setCont(super.getN());
        while (i < super.getN()) {
            p.getInfo()[i] = a[i];
            p.getApuntadores()[i] = b[i];
            q.getInfo()[i] = a[i + super.getN() + 1];
            q.getApuntadores()[i] = b[i + super.getN() + 1];
            i++;
        }
    }
    p.getApuntadores()[super.getN()] = b[super.getN()];
    q.getApuntadores()[super.getN()] = b[super.getM1()];
    subir[0] = a[super.getN()];
    return q;
}
    `
  },
  {
    title: "14. Unir Páginas Árbol (unirBMas)",
    operationalCost: [
      "T(n) = 20n^2 + n(KTE) + 6n + KTE"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Une dos páginas del árbol B+ para mantener sus características.
 * post: Se unieron dos páginas para mantener las propiedades del árbol.
 * @param q Página padre.
 * @param r Página que recibe la información.
 * @param p Página de la llave a eliminar.
 * @param i Posición para incorporar la llave.
 * @param pi Pila con el camino entre q y la raíz.
 * @param x Dato a eliminar.
 * @param posicion Posición de la llave a retirar.
 */
private void unirBMas(Pagina q, Pagina r, Pagina p, int i, Pila pi, T x, int posicion) {
    int terminar = 0, j = 0, k;
    Pagina t = null;
    Componente objeto = new Componente();
    retirar(p, posicion);
    int compara = ((Comparable) r.getInfo()[0]).compareTo(x);
    if (compara > 0) {
        t = p;
        p = r;
        r = t;
    }
    while (terminar == 0) {
        if ((r.getCont() < super.getN()) && (p.getCont() > super.getN())) {
            super.cambio(r, q, p, i, x);
            r.getApuntadores()[r.getCont()] = p.getApuntadores()[0];
            this.cizquierda_apunt(p, 0, p.getCont() + 1);
            terminar = 1;
        } else if ((p.getCont() < super.getN()) && (r.getCont() > super.getN())) {
            super.cambio(p, q, r, i, x);
            this.cderechaApunt(p, 0);
            p.getApuntadores()[0] = r.getApuntadores()[r.getCont() + 1];
            r.getApuntadores()[r.getCont() + 1] = null;
            terminar = 1;
        } else {
            j = r.getCont();
            if (r.getApuntadores()[0] == null)
                r.getApuntadores()[super.getM()] = p.getApuntadores()[super.getM()];
            else
                r.getInfo()[j++] = q.getInfo()[i];
            k = 0;
            while (k <= p.getCont() - 1)
                r.getInfo()[j++] = (T) p.getInfo()[k++];
            r.setCont(j);
            retirar(q, i);
            k = 0;
            j = super.getM() - p.getCont();
            while (p.getApuntadores()[k] != null)
                r.getApuntadores()[j++] = p.getApuntadores()[k++];
            p = null;
            if (q.getCont() == 0) {
                q.getApuntadores()[i + 1] = null;
                if (pi.esVacia()) {
                    q = null;
                }
            } else
                this.cizquierda_apunt(q, i + 1, q.getCont() + 1);
            if (q != null)
                if (q.getCont() >= super.getN())
                    terminar = 1;
                else {
                    t = q;
                    if (!pi.esVacia()) {
                        objeto = (Componente) pi.desapilar();
                        q = objeto.getP();
                        i = objeto.getV();
                        compara = ((Comparable) q.getInfo()[0]).compareTo(x);
                        if (compara <= 0) {
                            p = t;
                            r = q.getApuntadores()[i - 1];
                            i--;
                        } else {
                            r = t;
                            p = q.getApuntadores()[i + 1];
                        }
                    } else
                        terminar = 1;
                }
            else {
                terminar = 1;
                super.setRaiz(r);
            }
        }
    }
}
    `
  },
  {
    title: "15. Obtener Iterador Hojas Árbol (getHojas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con las hojas del Árbol B+.
 * post: Se retornó un iterador con las hojas.
 * @return Iterador con las hojas del árbol.
 */
@Override
public Iterator<T> getHojas() {
    return (super.getHojas());
}
    `
  },
  {
    title: "16. Consultar Existencia Elementos Árbol (esVacio)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Determina si el Árbol B+ se encuentra vacío.
 * post: Se evaluó si el árbol está vacío.
 * @return true si está vacío, false en caso contrario.
 */
@Override
public boolean esVacio() {
    return (super.esVacio());
}
    `
  },
  {
    title: "17. Obtener Iterador In-Orden Árbol (inOrden)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna un iterador con el recorrido in-orden del Árbol B+.
 * post: Se retornó un iterador inOrden para el árbol.
 * @return Iterador en inOrden.
 */
@Override
public Iterator<T> inOrden() {
    return (super.inOrden());
}
    `
  },
  {
    title: "18. Obtener Peso Árbol (getPesoBMas)",
    operationalCost: [
      "T(n) = 7n + 11"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de elementos del Árbol B+.
 * post: Se retornó la cantidad de elementos.
 * @return Entero con la cantidad de elementos.
 */
public int getPesoBMas() {
    return (getPesoBMas(super.getRaiz()));
}
    `
  },
  {
    title: "19. Obtener Peso Árbol Privado (getPesoBMas)",
    operationalCost: [
      "T(n) = 7n + 9"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Retorna el número de elementos del Árbol B+ (privado).
 * post: Se retornó la cantidad de elementos.
 * @param r Raíz o subárbol.
 * @return Entero con la cantidad de elementos.
 */
private int getPesoBMas(Pagina<T> r) {
    int cant = 0;
    while (r.getApuntadores()[0] != null) {
        r = r.getApuntadores()[0];
    }
    while (r != null) {
        cant += r.getCont();
        r = r.getApuntadores()[super.getM()];
    }
    return (cant);
}
    `
  },
  {
    title: "20. Obtener Altura Árbol (getAltura)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Retorna la altura del Árbol B+.
 * post: Se retornó la altura del árbol.
 * @return Altura del árbol.
 */
@Override
public int getAltura() {
    return (super.getAltura());
}
    `
  },
  {
    title: "21. Listar Información Lista VSAM (listar_vsam)",
    operationalCost: [
      "T(n) = n^2(KTE) + 8n + 7"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Lista la información de la lista VSAM del Árbol B+.
 * @return Cadena con la información.
 */
public String listar_vsam() {
    return (listar_vsam(this.vsam));
}
    `
  },
  {
    title: "22. Listar Información Lista VSAM Página (listar_vsam)",
    operationalCost: [
      "T(n) = n^2(KTE) + 8n + 6"
    ],
    complexity: "Big O = O(n^2)",
    javaCode: `
/**
 * Lista la información de la lista VSAM del Árbol B+ desde una página.
 * @param vsam Página inicial.
 * @return Cadena con la información.
 */
public String listar_vsam(Pagina vsam) {
    String msg = "";
    int i;
    while (vsam != null) {
        i = 0;
        while (i < vsam.getCont())
            msg += vsam.getInfo()[i++].toString() + "-->";
        vsam = vsam.getApuntadores()[super.getM()];
    }
    return msg;
}
    `
  },
  {
    title: "23. Imprimir Árbol (imprime)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Imprime los datos del Árbol B+.
 * post: Se imprimió la información.
 * @return Cadena con la información del árbol.
 */
@Override
public String imprime() {
    return (super.imprime());
}
    `
  },
  {
    title: "24. Clonar Árbol (clonar)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n) + 9"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
/**
 * Clona la información del Árbol B+.
 * @return Nuevo Árbol B+ con la información duplicada.
 */
@Override
public ArbolBMas<T> clonar() {
    ArbolBMas<T> clon = new ArbolBMas<T>(this.getN());
    if (super.getRaiz() == null)
        return (clon);
    clon.setRaiz(clonar(super.getRaiz()));
    return (clon);
}
    `
  },
  {
    title: "25. Clonar Árbol Privado (clonar)",
    operationalCost: [
      "T(n) = 1T(n/2) + O(n)"
    ],
    complexity: "Big O = O(n)",
    javaCode: `
private Pagina clonar(Pagina r) {
    if (r == null)
        return (null);
    else {
        T info[] = (T[]) new Object[r.getM()];
        for (int i = 0; i < r.getCont(); i++) {
            info[i] = (T) r.getInfo()[i];
        }
        Pagina aux = new Pagina(r.getN());
        aux.setInfo(info);
        aux.setCont(r.getCont());
        for (int i = 0; i < aux.getCont() + 1; i++) {
            aux.getApuntadores()[i] = clonar(r.getApuntadores()[i]);
        }
        return (aux);
    }
}
    `
  },
  {
    title: "26. Limpiar Árbol (limpiarBMas)",
    operationalCost: [
      "T(n) = KTE"
    ],
    complexity: "Big O = O(1)",
    javaCode: `
/**
 * Limpia la información del Árbol B+.
 */
public void limpiarBMas() {
    super.setRaiz(null);
    this.vsam = super.getRaiz();
}
    `
  },
];
