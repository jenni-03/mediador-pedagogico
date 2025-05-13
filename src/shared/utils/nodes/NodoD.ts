// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

/**
 * Clase que representa un Nodo Doble
 */
export class NodoD {

    // Información almacenada en el nodo
    private valor: number;

    // Información del nodo siguiente
    private siguiente: NodoD | null;

    // Información del nodo anterior
    private anterior: NodoD | null;

    /**
     * Constructor de la clase Nodo Doble
     * @param valor Valor a almacenar en el nodo
     */
    constructor(valor: number) {
        this.valor = valor;
        this.siguiente = null;
        this.anterior = null;
    }

    /**
     * Método encargado de obtener la información almacenada en el nodo
     * @returns valor almacenado en el nodo
     */
    public getValor(): number {
        return this.valor;
    }

    /**
     * Método encargado de obtener el nodo siguiente
     * @returns nodo siguiente o null según corresponda
     */
    public getSiguiente(): NodoD | null {
        return this.siguiente;
    }

    /**
     * Método encargado de obtener el nodo anterior
     * @returns nodo anterior o null según corresponda
     */
    public getAnterior(): NodoD | null {
        return this.anterior;
    }

    /**
     * Método encargado de establecer el valor del nodo
     * @param valor Valor a establecer
     */
    public setValor(valor: number): void {
        this.valor = valor;
    }

    /**
     * Método encargado de establecer el nodo siguiente
     * @param nodo Nodo a establecer como siguiente
     */
    public setSiguiente(nodo: NodoD | null): void {
        this.siguiente = nodo;
    }

    /**
     * Método encargado de establecer el nodo anterior
     * @param nodo Nodo a establecer como anterior
     */
    public setAnterior(nodo: NodoD | null): void {
        this.anterior = nodo;
    }
}