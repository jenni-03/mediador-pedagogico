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
     * @param valor 
     */
    constructor(valor: number) {
        this.valor = valor;
        this.siguiente = null;
        this.anterior = null;
    }

    /**
     * 
     * @returns información almacenada en el nodo
     */
    public getValor(): number {
        return this.valor;
    }

    /**
     * 
     * @returns información almacenada en el nodo siguiente
     */
    public getSiguiente(): NodoD | null {
        return this.siguiente;
    }

    /**
     * 
     * @returns información almacenada en el nodo anterior
     */
    public getAnterior(): NodoD | null {
        return this.anterior;
    }

    public setValor(valor: number): void {
        this.valor = valor;
    }

    public setSiguiente(nodo: NodoD | null): void {
        this.siguiente = nodo;
    }

    public setAnterior(nodo: NodoD | null): void {
        this.anterior = nodo;
    }
}