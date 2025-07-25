// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { EqualityFn, HierarchyNodeData } from "../../../types";
import { NodoBin } from "../nodes/NodoBin";
import { Cola } from "./Cola";

/**
 * Clase que representa el funcionamiento de una lista circular doble.
 */
export class ArbolBinario<T> {

    // Nodo raíz del árbol binario.
    private raiz: NodoBin<T> | null;

    // Contador para limitar el número de nodos.
    private tamanio: number;

    // Limite de nodos.
    private readonly MAX_NODOS = 30;

    /**
     * Constructor de la clase ArbolBinario.
     */
    constructor(
        private equals: EqualityFn<T> = (a, b) => a === b
    ) {
        this.raiz = null;
        this.tamanio = 0;
    }

    /**
     * Método que inserta un nuevo nodo como hijo izquierdo.
     * @param padre Padre del nuevo nodo.
     * @param valor Elemento a insertar.
     * @returns Nodo izquierdo insertado.
     */
    public insertarHijoIzq(padre: T, valor: T): NodoBin<T> {
        if (this.tamanio >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        if (this.esta(valor)) {
            throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
        }

        const nuevoNodo = new NodoBin(valor);

        if (this.esVacio()) {
            this.setRaiz(nuevoNodo);
        } else {
            const nodoPadre = this.get(this.getRaiz(), padre);

            if (nodoPadre === null) {
                throw new Error(`No fue posible insertar el nodo: El nodo padre con valor ${padre} no existe.`);
            }

            if (nodoPadre.getIzq() !== null) {
                throw new Error(`No fue posible insertar el nodo: El nodo padre con valor ${padre} ya cuenta con un hijo izquierdo.`);
            }

            nodoPadre.setIzq(nuevoNodo);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que inserta un nuevo nodo como hijo derecho.
     * @param padre Padre del nuevo nodo.
     * @param valor Elemento a insertar.
     * @returns Nodo derecho insertado.
     */
    public insertarHijoDer(padre: T, valor: T): NodoBin<T> {
        if (this.tamanio >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }

        if (this.esta(valor)) {
            throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
        }

        const nuevoNodo = new NodoBin(valor);

        if (this.esVacio()) {
            this.setRaiz(nuevoNodo);
        } else {
            const nodoPadre = this.get(this.getRaiz(), padre);

            if (nodoPadre === null) {
                throw new Error(`No fue posible insertar el nodo: El nodo padre con valor ${padre} no existe.`);
            }

            if (nodoPadre.getDer() !== null) {
                throw new Error(`No fue posible insertar el nodo: El nodo padre con valor ${padre} ya cuenta con un hijo derecho.`);
            }

            nodoPadre.setDer(nuevoNodo);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que elimina un nodo del árbol binario dado un valor especificado.
     * @param info Valor del nodo a eliminar.
     * @returns Nodo eliminado.
     */
    eliminar(info: T): { removed: NodoBin<T>, updated?: NodoBin<T> } {
        if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol encuentra vacío (cantidad de nodos: 0).");

        if (this.getRaiz()!.getInfo() === info) {
            return this.eliminarRaiz();
        }

        const padre = this.getPadre(this.getRaiz(), info);
        if (!padre) throw new Error("No fue posible eliminar el nodo: El elemento no existe en el árbol binario.");

        let nodo = padre.getIzq();
        if (!nodo || (nodo && nodo.getInfo() !== info)) {
            nodo = padre.getDer()!;
        }

        const izq = nodo.getIzq();
        const der = nodo.getDer();

        // CASO 1 – nodo hoja
        if (this.esHoja(nodo)) {
            this.reemplazarHijo(padre, nodo, null);
            this.tamanio--;
            return { removed: nodo };
        }

        // CASO 2 – un solo hijo
        if (!izq || !der) {
            const unico = izq ? izq : der;
            this.reemplazarHijo(padre, nodo, unico);
            this.tamanio--;
            return { removed: nodo };
        }

        // CASO 3 – dos hijos
        let sucPadre = nodo;
        let succ = der;
        while (succ.getIzq()) {
            sucPadre = succ;
            succ = succ.getIzq()!;
        }
        nodo.setInfo(succ.getInfo());
        const hijoSuc = succ.getDer();
        this.reemplazarHijo(sucPadre, succ, hijoSuc);

        this.tamanio--;
        return { removed: succ, updated: nodo };
    }

    /**
     * Método que verifica la existencia de un elemento dentro del árbol binario.
     * @param info Información del elemento a buscar.
     * @returns True o false si el elemento se encuentra o no. 
     */
    public esta(info: T): boolean {
        return this.buscar(this.getRaiz(), info);
    }

    /**
     * Método que obtiene todos los nodos hojas del árbol binario.
     * @returns Array que contiene todos los nodos hoja del árbol.
     */
    public getHojas(): NodoBin<T>[] {
        const hojas: NodoBin<T>[] = [];
        this.getArrayHojas(this.getRaiz(), hojas);
        return hojas;
    }

    /**
     * Método que cuenta el número de nodos hoja del árbol binario.
     * @returns Número de nodos hoja del árbol.
     */
    public contarHojas(): number {
        return this.contarHojasAux(this.getRaiz());
    }

    /**
     * Método que calcula el peso total (número de nodos) del árbol binario.
     * @returns Número total de nodos del árbol.
     */
    public getPeso(): number {
        return this.getPesoAux(this.getRaiz());
    }

    /**
     * Método que vacia el árbol binario.
     */
    public vaciar(): void {
        this.setRaiz(null);
        this.tamanio = 0;
    }

    /**
     * Método que verifica si el árbol binario está vacío.
     * @returns True si se encuentra vacío, false en caso contrario.
     */
    public esVacio(): boolean {
        return this.raiz === null;
    }

    /**
     * Método que calcula la altura del árbol binario.
     * @returns Altura del árbol.
     */
    public getAltura(): number {
        return this.getAlturaAux(this.getRaiz());
    }

    /**
     * Método que devuelve el grado (número de hijos no nulos) del nodo con el valor especificado.
     * @param info Valor del nodo.
     * @returns Grado del nodo.
     */
    public getGrado(info: T): number {
        const nodo = this.get(this.getRaiz(), info);

        if (!nodo) return -1;

        if (this.esHoja(nodo)) return 0;

        let ramas = 0;

        if (nodo.getIzq()) ramas++;
        if (nodo.getDer()) ramas++;

        return ramas;
    }

    /**
     * Método que realiza el recorrido in-orden del árbol binario.
     * @returns Array que contiene los nodos del árbol en secuencia in-orden.
     */
    public inOrden(): NodoBin<T>[] {
        const nodos: NodoBin<T>[] = [];
        this.getInOrden(this.getRaiz(), nodos);
        return nodos;
    }

    /**
     * Método que realiza el recorrido pre-orden del árbol binario.
     * @returns Array que contiene los nodos del árbol en secuencia pre-orden.
     */
    public preOrden(): NodoBin<T>[] {
        const nodos: NodoBin<T>[] = [];
        this.getPreOrden(this.getRaiz(), nodos);
        return nodos;
    }

    /**
     * Método que realiza el recorrido post-orden del árbol binario.
     * @returns Array que contiene los nodos del árbol en secuencia post-orden.
     */
    public postOrden(): NodoBin<T>[] {
        const nodos: NodoBin<T>[] = [];
        this.getPostOrden(this.getRaiz(), nodos);
        return nodos;
    }

    /**
     * Método que realiza el recorrido por niveles del árbol binario.
     * @returns Array que contiene los nodos del árbol por niveles.
     */
    public getNodosPorNiveles(): NodoBin<T>[] {
        const nodos: NodoBin<T>[] = [];

        if (!this.esVacio()) {
            const cola = new Cola<NodoBin<T>>();
            cola.encolar(this.getRaiz()!);
            let x: NodoBin<T>;

            while (!cola.esVacia()) {
                x = cola.decolar().getValor();
                nodos.push(x);
                if (x.getIzq() !== null) cola.encolar(x.getIzq()!);
                if (x.getDer() !== null) cola.encolar(x.getDer()!);
            }
        }

        return nodos;
    }

    /**
     * Método que obtiene la raíz del árbol binario.
     * @returns Nodo raíz del árbol o null si está vacío.
     */
    public getRaiz(): NodoBin<T> | null {
        return this.raiz;
    }

    /**
     * Método que modifica la raíz del árbol binario.
     * @param raiz Nuevo nodo raíz del árbol binario.
     */
    public setRaiz(raiz: NodoBin<T> | null) {
        this.raiz = raiz;
    }

    /**
     * Método que convierte el árbol binario en una estructura jerárquica.
     * @returns Representación jerárquica del árbol o null si está vacío.
     */
    public convertirEstructuraJerarquica() {
        if (this.esVacio()) return null;
        return this.toHierarchy(this.getRaiz()!);
    }

    /**
     * Método que crea una copia profunda del árbol binario.
     * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
     */
    public clonar(): ArbolBinario<T> {
        const nuevoArbol = new ArbolBinario<T>();
        nuevoArbol.setRaiz(this.clonarAB(this.getRaiz()));
        nuevoArbol.tamanio = this.tamanio;
        return nuevoArbol;
    }

    /**
     * Método que obtiene el nodo padre de un elemento particular.
     * @param root Raíz del árbol binario.
     * @param info Elemento a buscar.
     * @returns El nodo padre del elemento almacenado en el árbol o null en caso de no existir.
     */
    protected getPadre(root: NodoBin<T> | null, info: T): NodoBin<T> | null {
        if (root === null || !this.raiz || this.equals(this.raiz.getInfo(), info)) {
            return null;
        }

        if ((root.getIzq() !== null && this.equals(root.getIzq()!.getInfo(), info)) || (root.getDer() !== null && this.equals(root.getDer()!.getInfo(), info))) {
            return root;
        }

        const izq = this.getPadre(root.getIzq(), info);
        if (izq) return izq;

        return this.getPadre(root.getDer(), info);
    }

    /**
     * Método que clona un árbol binario.
     * @param root Nodo raíz del árbol binario.
     * @returns Nuevo árbol clonado.
     */
    private clonarAB(root: NodoBin<T> | null): NodoBin<T> | null {
        if (root === null) return null;

        const nuevoNodo = new NodoBin(root.getInfo(), root.getId(), root.getDireccionMemoria());
        nuevoNodo.setIzq(this.clonarAB(root.getIzq()));
        nuevoNodo.setDer(this.clonarAB(root.getDer()));

        return nuevoNodo;
    }

    /**
     * Método que transforma el árbol binario en una estructura jerárquica.
     * @param root Nodo raíz del árbol binario.
     * @returns Estructura jerárquica representando el árbol.
     */
    private toHierarchy(root: NodoBin<T>): HierarchyNodeData<T> {
        const hijos = [];
        if (root.getIzq()) hijos.push(this.toHierarchy(root.getIzq()!));
        if (root.getDer()) hijos.push(this.toHierarchy(root.getDer()!));

        return {
            id: root.getId(),
            value: root.getInfo(),
            memoryAddress: root.getDireccionMemoria(),
            children: hijos.length ? hijos : undefined
        }
    }

    /**
     * Método que realiza el recorrido in-orden del árbol binario iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del árbol.
     * @param nodos Array que acumula los nodos visitados durante el recorrido en in-orden.
     */
    private getInOrden(root: NodoBin<T> | null, nodos: NodoBin<T>[]) {
        if (root === null) return;

        this.getInOrden(root.getIzq(), nodos);
        nodos.push(root);
        this.getInOrden(root.getDer(), nodos);
    }

    /**
     * Método que realiza el recorrido pre-orden del árbol binario iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del árbol.
     * @param nodos Array que acumula los nodos visitados durante el recorrido en pre-orden.
     */
    private getPreOrden(root: NodoBin<T> | null, nodos: NodoBin<T>[]) {
        if (root === null) return;

        nodos.push(root);
        this.getPreOrden(root.getIzq(), nodos);
        this.getPreOrden(root.getDer(), nodos);
    }

    /**
     * Método que realiza el recorrido post-orden del árbol binario iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del árbol.
     * @param nodos Array que acumula los nodos visitados durante el recorrido en post-orden.
     */
    private getPostOrden(root: NodoBin<T> | null, nodos: NodoBin<T>[]) {
        if (root === null) return;

        this.getPostOrden(root.getIzq(), nodos);
        this.getPostOrden(root.getDer(), nodos);
        nodos.push(root);
    }

    /**
     * Método que calcula recursivamente la altura del árbol binario iniciando en un nodo raíz dado.
     * @param root Nodo raíz del árbol.
     * @returns Altura del árbol enraizado en el nodo dado.
     */
    private getAlturaAux(root: NodoBin<T> | null): number {
        if (!root) return 0
        const hi = this.getAlturaAux(root.getIzq())
        const hd = this.getAlturaAux(root.getDer())
        return 1 + Math.max(hi, hd)
    }

    /**
     * Método que calcula recursivamente el número de nodos (peso) del árbol binario.
     * @param root Nodo raíz del árbol.
     * @returns Número total de nodos del árbol.
     */
    private getPesoAux(root: NodoBin<T> | null): number {
        if (root === null) {
            return 0;
        }
        return this.getPesoAux(root.getIzq()) + 1 + this.getPesoAux(root.getDer());
    }

    /**
     * Método que verifica si un nodo es una hoja.
     * @param nodo Nodo a verificar.
     * @returns True si sus 2 hijos son nulos.
     */
    private esHoja(nodo: NodoBin<T> | null): boolean {
        return nodo !== null && nodo.getIzq() === null && nodo.getDer() === null;
    }

    /**
     * Método que cuenta el número de nodo hoja en un árbol binario.
     * @param root Nodo raíz del árbol.
     * @returns Número de nodos hoja en el árbol binario.
     */
    private contarHojasAux(root: NodoBin<T> | null): number {
        if (root === null) return 0;

        if (this.esHoja(root)) {
            return 1;
        }

        const chi = this.contarHojasAux(root.getIzq());
        const chd = this.contarHojasAux(root.getDer());
        return chi + chd;
    }

    /**
     * Método que recolecta recursivamente todas las hojas de un árbol binario.
     * @param root Nodo raíz del árbol.
     * @param hojas Array para almacenar los nodos hoja ubicados.
     * @returns Array que contiene todos los nodos hoja encontrados en el árbol.
     */
    private getArrayHojas(root: NodoBin<T> | null, hojas: NodoBin<T>[] = []): NodoBin<T>[] {
        if (!root) return hojas;

        if (this.esHoja(root)) {
            hojas.push(root);
        } else {
            this.getArrayHojas(root.getIzq(), hojas);
            this.getArrayHojas(root.getDer(), hojas);
        }

        return hojas;
    }

    /**
     * Método que elimina el nodo raíz del árbol binario.
     * @returns El nodo raíz eliminado o null si el árbol se encontraba vacío.
     */
    private eliminarRaiz(): { removed: NodoBin<T>, updated?: NodoBin<T> } {
        const r = this.raiz!;
        const izq = r.getIzq(), der = r.getDer();

        if (!izq && !der) {
            this.setRaiz(null);
            this.tamanio--;
            return { removed: r };
        }

        if (!izq || !der) {
            this.setRaiz(izq ? izq : der);
            this.tamanio--;
            return { removed: r };
        }

        let sucPadre = r, succ = der;
        while (succ.getIzq()) {
            sucPadre = succ;
            succ = succ.getIzq()!;
        }
        r.setInfo(succ.getInfo());

        const hijoSucc = succ.getDer();
        this.reemplazarHijo(sucPadre, succ, hijoSucc);

        this.tamanio--;
        return { removed: succ, updated: r };
    }

    /**
     * Método que reemplaza uno de los nodos hijos del nodo padre con uno nodo nuevo.
     * @param padre Nodo padre cuyo hijo será reemplazado.
     * @param antiguo Nodo hijo a ser reemplazado.
     * @param nuevo Nuevo nodo para reemplazar el nodo antiguo.
     */
    private reemplazarHijo(padre: NodoBin<T>, antiguo: NodoBin<T>, nuevo: NodoBin<T> | null) {
        if (padre.getIzq() === antiguo) padre.setIzq(nuevo);
        else padre.setDer(nuevo);
    }

    /**
     * Método que busca un elemento dentro del árbol binario.
     * @param root Nodo raíz del árbol.
     * @param info Información del elemento a buscar.
     * @returns Un booleano que indica si se encontro o no el elemento.
     */
    private buscar(root: NodoBin<T> | null, info: T): boolean {
        if (root === null) return false;

        if (this.equals(root.getInfo(), info)) {
            return true;
        }

        return (this.buscar(root.getIzq(), info) || this.buscar(root.getDer(), info));
    }

    /**
     * Método que obtiene un elemento existente dentro del árbol binario. 
     * @param root Nodo raíz del árbol.
     * @param info Información del elemento a obtener.
     * @returns Nodo encontrado o null si no existe.
     */
    private get(root: NodoBin<T> | null, info: T): NodoBin<T> | null {
        if (root === null) return null;

        if (this.equals(root.getInfo(), info)) {
            return root;
        }

        const left = this.get(root.getIzq(), info);
        if (left !== null) {
            return left;
        } else {
            return this.get(root.getDer(), info);
        }
    }
}