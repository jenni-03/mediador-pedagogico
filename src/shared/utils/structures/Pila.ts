import { NodoS } from "../nodes/NodoS";

/**
 * Clase que representa una Pila utilizando nodos simples.
 */
export class Pila {

    // Nodo en la cima (tope) de la pila
    private tope: NodoS | null;

    // Tamaño de la pila
    private tamanio: number;

    /**
     * Constructor de la clase Pila.
     */
    constructor() {
        this.tope = null;
        this.tamanio = 0;
    }

    /**
     * Método para apilar un elemento en la pila.
     * @param valor Elemento a apilar.
     */
    public apilar(valor: number): void {
        let direccion = 0;
    
        if (!this.esVacia()) {
            const tope = this.tope!;
            const topeHex = parseInt(tope.getDireccionMemoria(), 16);
            direccion = topeHex + tope.getTamanio();
        } else {
            direccion = 0x10000000; // dirección inicial simulada
        }
    
        const nuevoNodo = new NodoS(valor, undefined, direccion);
        
        if (this.esVacia()) {
            this.tope = nuevoNodo;
        } else {
            nuevoNodo.setSiguiente(this.tope);
            this.tope = nuevoNodo;
        }
    
        this.tamanio++;
    }
    

    /**
     * Método para desapilar (quitar) el elemento en el tope de la pila.
     * @returns Número removido o null si la pila está vacía.
     */
    public desapilar(): number | null {
        if (this.esVacia()) throw new Error("No se puede desapilar: No hay elementos en la pila.");

        const valor = this.tope?.getValor() ?? null;
        this.tope = this.tope?.getSiguiente() ?? null;
        this.tamanio--;

        return valor;
    }

    /**
     * Método para obtener el valor del tope de la pila sin desapilar.
     * @returns Valor del nodo en el tope o null si la pila está vacía.
     */
    public getInfoTope(): number | null {
        return this.tope?.getValor() ?? null;
    }

    /**
     * Método que obtiene el nodo en el tope de la pila.
     * @returns NodoS o null si la pila está vacía.
     */
    public getTope(): NodoS | null {
        // if (this.esVacia()) throw new Error("No existe un elemento tope, ya que no hay elementos en la pila.");
        return this.tope;
    }

    /**
     * Método que devuelve el tamaño actual de la pila.
     * @returns Número de elementos en la pila.
     */
    public getTamanio(): number {
        return this.tamanio;
    }

    /**
     * Método que verifica si la pila está vacía.
     * @returns True si está vacía, false en caso contrario.
     */
    public esVacia(): boolean {
        return this.tamanio === 0;
    }

    /**
     * Método para vaciar la pila.
     */
    public vaciar(): void {
        this.tope = null;
        this.tamanio = 0;
    }

    /**
     * Método que transforma la pila en un array de nodos.
     * @returns Array con los nodos de la pila.
     */
    public getArrayDeNodos() {
        const arregloNodos = [];
        let nodoActual = this.tope;

        while (nodoActual !== null) {
            const siguiente = nodoActual.getSiguiente();
            arregloNodos.push({
                id: nodoActual.getId(),
                value: nodoActual.getValor(),
                next: siguiente ? siguiente.getId() : null,
                memoryAddress: nodoActual.getDireccionMemoria(),
            });
            nodoActual = siguiente;
        }

        return arregloNodos;
    }

    /**
     * Método que clona la pila.
     * @returns Nueva instancia de Pila con los mismos valores.
     */
    public clonar(): Pila {
        const nuevaPila = new Pila();

        if (this.esVacia()) return nuevaPila;

        // Paso 1: recorrer la pila original y almacenar nodos en un array temporal
        const nodosTemporales: NodoS[] = [];
        let nodoActual = this.tope;

        while (nodoActual !== null) {
            nodosTemporales.push(nodoActual);
            nodoActual = nodoActual.getSiguiente();
        }

        // Paso 2: reconstruir la pila en orden inverso
        for (let i = nodosTemporales.length - 1; i >= 0; i--) {
            nuevaPila.apilar(nodosTemporales[i].getValor());
        }

        return nuevaPila;
    }
}