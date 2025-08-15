import { Comparator } from "../../../types";
import { NodoBin } from "../nodes/NodoBin";
import { defaultComparator } from "../treeUtils";
import { ArbolBinario } from "./ArbolBinario";

/**
 * Clase que representa el funcionamiento de un árbol binario de búsqueda.
 */
export class ArbolBinarioBusqueda<T> extends ArbolBinario<T> {

    /**
     * Constructor de la clase ArbolBinarioBusqueda.
     */
    constructor(
        private compare: Comparator<T> = defaultComparator
    ) {
        super((a, b) => compare(a, b) === 0);
    }

    /**
     * Método que inserta un nuevo nodo en el árbol binario de búsqueda.
     * @param valor Elemento a insertar. 
     * @returns Nodo insertado.
     */
    public insertar(valor: T): NodoBin<T> {
        if (this.getTamanio() >= this.MAX_NODOS) {
            throw new Error(`No fue posible insertar el nodo: Límite máximo de nodos alcanzado (${this.MAX_NODOS}).`);
        }
        const salida = { inserted: null };
        this.setRaiz(this.insertarABB(this.getRaiz(), valor, salida));
        this.setTamanio(this.getTamanio() + 1);
        return salida.inserted!;
    }

    /**
     * Método que elimina un nodo del árbol binario de búsqueda dado un valor especificado.
     * @param valor Valor del nodo a ser eliminado.
     * @returns Objeto que contiene el nodo eliminado y la raíz del subárbol actualizado.
     */
    public eliminarABB(valor: T): { removed: NodoBin<T> | null, updated: NodoBin<T> | null } {
        if (this.esVacio()) throw new Error("No fue posible eliminar el nodo: El árbol encuentra vacío (cantidad de nodos: 0).");

        const salida = { removed: null, updated: null };
        this.setRaiz(this.eliminarABBrec(this.getRaiz(), valor, salida));

        if (salida.removed === null) throw new Error("No fue posible eliminar el nodo: El elemento no existe en el árbol binario.");

        this.setTamanio(this.getTamanio() - 1);
        return salida;
    }

    /**
     * Método que verifica la existencia de un elemento dentro del árbol binario de búsqueda.
     * @param valor Valor del elemento a buscar.
     * @returns Booleano que indica si el elemento fue encontrado o no. 
     */
    public esta(valor: T): boolean {
        return this.estaABB(this.getRaiz(), valor);
    }

    /**
     * Método que obtiene la raíz del árbol binario de búsqueda.
     * @returns Nodo raíz del árbol o null si está vacío.
     */
    public getRaiz(): NodoBin<T> | null {
        return super.getRaiz();
    }

    /**
     * Método que modifica la raíz del árbol binario de búsqueda.
     * @param raiz Nuevo nodo raíz del árbol binario de búsqueda.
     */
    public setRaiz(raiz: NodoBin<T> | null) {
        super.setRaiz(raiz);
    }

    /**
     * Método que obtiene todos los nodos hojas del árbol binario de búsqueda.
     * @returns Array de nodos que representan las hojas del árbol.
     */
    public getHojas(): NodoBin<T>[] {
        return super.getHojas();
    }

    /**
     * Método que cuenta el número de nodos hoja del árbol binario de búsqueda.
     * @returns Número de nodos hoja del árbol.
     */
    public contarHojas(): number {
        return super.contarHojas();
    }

    /**
     * Método que calcula el peso total (número de nodos) del árbol binario de búsqueda.
     * @returns Número total de nodos del árbol.
     */
    public getPeso(): number {
        return super.getPeso();
    }

    /**
     * Método que calcula la altura del árbol binario de búsqueda.
     * @returns Altura del árbol.
     */
    public getAltura(): number {
        return super.getAltura();
    }

    /**
     * Método que vacia el árbol binario de búsqueda.
     */
    public vaciar(): void {
        super.vaciar();
    }

    /**
     * Método que verifica si el árbol binario de búsqueda está vacío.
     * @returns True si se encuentra vacío, false en caso contrario.
     */
    public esVacio(): boolean {
        return super.esVacio()
    }

    /**
     * Método que realiza el recorrido in-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia in-orden.
     */
    public inOrden(): NodoBin<T>[] {
        return super.inOrden();
    }

    /**
     * Método que realiza el recorrido pre-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia pre-orden.
     */
    public preOrden(): NodoBin<T>[] {
        return super.preOrden();
    }

    /**
     * Método que realiza el recorrido post-orden del árbol binario de búsqueda.
     * @returns Array de nodos en secuencia post-orden.
     */
    public postOrden(): NodoBin<T>[] {
        return super.postOrden();
    }

    /**
     * Método que realiza el recorrido por niveles del árbol binario de búsqueda.
     * @returns Array de nodos por niveles.
     */
    public getNodosPorNiveles(): NodoBin<T>[] {
        return super.getNodosPorNiveles();
    }

    /**
     * Método que convierte el árbol binario de búsqueda en una estructura jerárquica.
     * @returns Representación jerárquica del árbol o null si está vacío.
     */
    public convertirEstructuraJerarquica() {
        return super.convertirEstructuraJerarquica();
    }

    /**
     * Método que crea una copia profunda del árbol binario de búsqueda.
     * @returns Retorna un nuevo árbol correspondiente a una copia profunda del árbol actual.
     */
    public clonarABB(): ArbolBinarioBusqueda<T> {
        const nuevoArbol = new ArbolBinarioBusqueda<T>();
        nuevoArbol.setRaiz(this.clonarABBrec(this.getRaiz()));
        nuevoArbol.setTamanio(this.getTamanio());
        return nuevoArbol;
    }

    /**
     * Método recursivo que inserta un nuevo nodo en el árbol binario de búsqueda.
     * @param root Nodo raíz del subárbol actual.
     * @param valor Valor a insertar.
     * @param salida Objeto usado para guardar la referencia al nodo insertado.
     * @returns Nodo raíz del subárbol actualizado luego de la inserción.
     */
    private insertarABB(root: NodoBin<T> | null, valor: T, salida: { inserted: NodoBin<T> | null }): NodoBin<T> {
        if (root === null) {
            const nuevo = new NodoBin(valor);
            salida.inserted = nuevo;
            return nuevo;
        }

        const cmp = this.compare(valor, root.getInfo());
        if (cmp < 0) {
            root.setIzq(this.insertarABB(root.getIzq(), valor, salida));
        } else if (cmp > 0) {
            root.setDer(this.insertarABB(root.getDer(), valor, salida));
        } else {
            throw new Error(`No fue posible insertar el nodo: El elemento ya existe en el árbol.`);
        }

        return root;
    }

    /**
     * Método recursivo que elimina un nodo con el valor especificado del árbol binario de búsqueda.
     * @param root Nodo raíz del subárbol actual que se esta procesando.
     * @param valor Valor del nodo a ser eliminado.
     * @param salida Objeto usado para guardar las referencias al nodo eliminado y actualizado.
     * @returns Nodo raíz del subárbol actualizado luego de la eliminación.
     */
    private eliminarABBrec(
        root: NodoBin<T> | null,
        valor: T,
        salida: { removed: NodoBin<T> | null, updated: NodoBin<T> | null }
    ): NodoBin<T> | null {
        if (!root) return null;

        const cmp = this.compare(valor, root.getInfo());
        if (cmp < 0) {
            root.setIzq(this.eliminarABBrec(root.getIzq(), valor, salida));
            return root;
        } else if (cmp > 0) {
            root.setDer(this.eliminarABBrec(root.getDer(), valor, salida));
            return root;
        } else {
            if (!root.getIzq()) {
                salida.removed = root;
                return root.getDer();
            }

            if (!root.getDer()) {
                salida.removed = root;
                return root.getIzq();
            }

            const succ = this.minValorNodo(root.getDer()!);
            root.setInfo(succ.getInfo());
            salida.updated = root;

            root.setDer(this.eliminarABBrec(root.getDer(), succ.getInfo(), salida));
            return root;
        }
    }

    /**
     * Método recursivo que determina si un elemento se encuentra dentro del árbol binario de búsqueda.
     * @param root Nodo raíz del árbol.
     * @param valor Valor del elemento a buscar.
     * @returns Un booleano que indica si se encontro o no el elemento.
     */
    private estaABB(root: NodoBin<T> | null, valor: T): boolean {
        if (root === null) return false;

        const cmp = this.compare(valor, root.getInfo());
        if (cmp < 0) {
            return this.estaABB(root.getIzq(), valor);
        } else if (cmp > 0) {
            return this.estaABB(root.getDer(), valor);
        } else {
            return true;
        }
    }

    /**
     * Método que obtiene el nodo con menor valor del árbol binario de búsqueda.
     * @param n Nodo raíz del árbol.
     * @returns Nodo más izquierdo del árbol.
     */
    private minValorNodo(n: NodoBin<T>): NodoBin<T> {
        while (n.getIzq()) n = n.getIzq()!;
        return n;
    }

    /**
     * Método recursivo que clona un árbol binario iniciando desde el nodo raíz dado.
     * @param root Nodo raíz del árbol BST a clonar.
     * @returns Nuevo subárbol clonado con raíz en el nodo dado.
     */
    private clonarABBrec(root: NodoBin<T> | null): NodoBin<T> | null {
        if (root === null) return null;

        const nuevoNodo = new NodoBin(root.getInfo(), root.getId());
        nuevoNodo.setIzq(this.clonarABBrec(root.getIzq()));
        nuevoNodo.setDer(this.clonarABBrec(root.getDer()));

        return nuevoNodo;
    }

}