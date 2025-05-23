// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { NodoS } from "../nodes/NodoS";

/**
 * Clase que representa una Cola utilizando nodos dobles.
 */
export class Cola {

    // Nodo inicial de la cola.
    private inicio: NodoS | null;

    // Nodo final de la cola.
    private fin: NodoS | null;

    // Tamaño de la cola.
    private tamanio: number;

    // Tamaño simulado de cada elemento en bytes
    private tamanioNodo: number;

    /**
     * Constructor de la clase Cola.
     */
    constructor(
        tamanioNodo: number = 16
    ) {
        this.inicio = null;
        this.fin = null;
        this.tamanio = 0;
        this.tamanioNodo = tamanioNodo;
    }

    /**
     * Método que encola un nuevo elemento en la cola.
     * @param valor Elemento a encolar.
     */
    public encolar(valor: number): void {
        if (this.tamanio >= 10) throw new Error("No fue posible encolar: Cantidad de nodos máxima alcanzada (tamaño máximo: 10).");

        const nuevoNodo = new NodoS(valor);

        if (this.esVacia()) {
            this.inicio = nuevoNodo;
            this.fin = nuevoNodo;
        } else {
            if (this.fin) {
                this.fin.setSiguiente(nuevoNodo);
                this.fin = nuevoNodo;
            }
        }

        this.tamanio++;
    }

    /**
     * Método que decola (remueve) el primer elemento de la cola.
     * @returns Elemento removido o null si la cola está vacía.
     */
    public decolar(): number | null {
        if (this.esVacia()) throw new Error("No fue posible decolar: La cola está vacía (tamaño actual: 0).");

        const valorEliminado = this.inicio?.getValor() ?? null;

        if (this.inicio === this.fin) {
            this.inicio = null;
            this.fin = null;
        } else {
            if (this.inicio) {
                this.inicio = this.inicio.getSiguiente();
            }
        }

        this.tamanio--;
        return valorEliminado;
    }

    /**
     * Método que vacia la cola.
     */
    public vaciar(): void {
        this.inicio = null;
        this.fin = null;
        this.tamanio = 0;
    }

    /**
     * Método que obtiene el nodo inicial de la cola.
     * @returns NodoS o null si la cola está vacía.
     */
    public getInicio(): NodoS | null {
        return this.inicio;
    }

    /**
     * Método que obtiene el valor del nodo inicial de la cola.
     * @returns Valor del nodo o null si la cola está vacía.
     */
    public getInfoInicio(): number | null {
        return this.inicio?.getValor() ?? null;
    }

    /**
     * Método que obtiene el nodo final de la cola.
     * @returns NodoS o null si la cola está vacía.
     */
    public getFin(): NodoS | null {
        return this.fin;
    }

    /**
     * Método que obtiene el valor del nodo final de la cola.
     * @returns Valor del nodo o null si la cola está vacía.
     */
    public getInfoFin(): number | null {
        return this.fin?.getValor() ?? null;
    }

    /**
     * Método que devuelve el tamaño actual de la cola.
     * @returns Número de elementos en la cola.
     */
    public getTamanio(): number {
        return this.tamanio;
    }
    
    /**
     * Método que retorna el tamaño en bytes de los nodos almacenados.
     * @returns Tamaño en bytes de los nodos.
     */
    getTamanioNodo() {
        return this.tamanioNodo;
    }

    /**
     * Método que verifica si la cola está vacía.
     * @returns True si está vacía, false en caso contrario.
     */
    public esVacia(): boolean {
        return this.tamanio === 0;
    }

    /**
     * Método que transforma la cola en un array de nodos.
     * @returns Array de nodos con la información de la cola.
     */
    public getArrayDeNodos() {
        const arregloNodos = [];
        let nodoActual = this.inicio;

        while (nodoActual !== null) {
            const nodoSiguiente = nodoActual.getSiguiente();

            arregloNodos.push({
                id: nodoActual.getId(),
                value: nodoActual.getValor(),
                next: nodoSiguiente ? nodoSiguiente.getId() : null,
                memoryAddress: nodoActual.getDireccionMemoria()
            });

            nodoActual = nodoActual.getSiguiente();
        }

        return arregloNodos;
    }

    /**
     * Método que clona la cola actual.
     * @returns Nueva cola clonada.
     */
    public clonar() {
        const nuevaCola = new Cola();

        if (this.esVacia()) {
            return nuevaCola;
        }

        let nodoActual = this.inicio;
        let ultimoNodoClonado: NodoS | null = null;

        while (nodoActual !== null) {
            const nuevoNodo = new NodoS(
                nodoActual.getValor(),
                nodoActual.getId(),
                nodoActual.getDireccionMemoria()
            );

            if (nuevaCola.inicio === null) {
                nuevaCola.inicio = nuevoNodo;
                nuevaCola.fin = nuevoNodo;
            } else {
                if (ultimoNodoClonado) {
                    ultimoNodoClonado.setSiguiente(nuevoNodo);
                }
                nuevaCola.fin = nuevoNodo;
            }

            ultimoNodoClonado = nuevoNodo;
            nodoActual = nodoActual.getSiguiente();
        }

        nuevaCola.tamanio = this.tamanio;
        return nuevaCola;
    }

}