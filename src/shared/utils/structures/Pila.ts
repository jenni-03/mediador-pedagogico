import { NodoS } from "../nodes/NodoS";

/**
 * Clase que representa una Pila utilizando nodos simples.
 */
export class Pila {

    // Nodo tope de la pila.
    private tope: NodoS | null;

    // Tamaño de la pila.
    private tamanio: number;

    // Tamaño simulado de cada nodo en bytes.
    private tamanioNodo: number;

    /**
     * Constructor de la clase Pila.
     */
    constructor(
        tamanioNodo: number = 16
    ) {
        this.tope = null;
        this.tamanio = 0;
        this.tamanioNodo = tamanioNodo;
    }

    /**
     * Método que apila un nuevo elemento en la pila.
     * @param valor Elemento a apilar.
     */
    public apilar(valor: number): void {
        if (this.tamanio >= 15) throw new Error("No fue posible apilar el elemento: Cantidad de elementos máxima alcanzada (tamaño máximo: 15).");

        const nuevoNodo = new NodoS(valor);

        if (this.esVacia()) {
            this.tope = nuevoNodo;
        } else {
            nuevoNodo.setSiguiente(this.tope);
            this.tope = nuevoNodo;
        }

        this.tamanio++;
    }


    /**
     * Método que desapila (quita) el elemento tope de la pila.
     * @returns Elemento removido o null si la pila está vacía.
     */
    public desapilar(): number | null {
        if (this.esVacia()) throw new Error("No fue posible desapilar: No hay elementos en la pila.");

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
     * Método que retorna el tamaño en bytes de los nodos almacenados.
     * @returns Tamaño en bytes de los nodos.
     */
    getTamanioNodo() {
        return this.tamanioNodo;
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
     * @returns Array con la información de los nodos de la pila.
     */
    public getArrayDeNodos() {
        const resultArray = [];
        let currentNode = this.tope;

        while (currentNode !== null) {
            const nextNode = currentNode.getSiguiente();

            resultArray.push({
                id: currentNode.getId(),
                value: currentNode.getValor(),
                next: nextNode ? nextNode.getId() : null,
                memoryAddress: currentNode.getDireccionMemoria()
            });

            currentNode = nextNode;
        }

        return resultArray;
    }

    /**
     * Método que clona la pila.
     * @returns Nueva instancia de Pila con los mismos valores.
     */
    public clonar() {
        const nuevaPila = new Pila();

        if (this.esVacia()) return nuevaPila;

        let nodoActual = this.tope;
        let ultimoNodoClonado: NodoS | null = null;

        while (nodoActual !== null) {
            const nuevoNodo = new NodoS(
                nodoActual.getValor(),
                nodoActual.getId(),
                nodoActual.getDireccionMemoria()
            );

            if (nuevaPila.tope === null) {
                nuevaPila.tope = nuevoNodo;
            } else {
                if (ultimoNodoClonado) {
                    ultimoNodoClonado.setSiguiente(nuevoNodo);
                }
            }

            ultimoNodoClonado = nuevoNodo;
            nodoActual = nodoActual.getSiguiente();
        }

        nuevaPila.tamanio = this.tamanio;
        return nuevaPila;
    }

}