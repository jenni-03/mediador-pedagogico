// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { NodoPrioridad } from "../nodes/NodoPrioridad";

/**
 * Clase que representa una Cola de Prioridad.
 */
export class ColaDePrioridad<T> {

    // Nodo inicial de la cola.
    private inicio: NodoPrioridad<T> | null;

    // Tamaño de la cola.
    private tamanio: number;

    // Tamaño simulado de cada nodo en bytes.
    private tamanioNodo: number;

    // Tamaño máximo permitido para la cola de prioridad.
    private readonly MAX_TAMANIO = 15;

    /**
     * Constructor de la clase Cola de Prioridad.
     */
    constructor(
        tamanioNodo: number = 20
    ) {
        this.inicio = null;
        this.tamanio = 0;
        this.tamanioNodo = tamanioNodo;
    }

    /**
     * Método que inserta un elemento en la posición correspondiente según su prioridad.
     * @param valor Elemento a encolar.
     * @param prioridad Prioridad del nodo (menor número = mayor prioridad).
     * @returns Elemento insertado.
     */
    public encolar(valor: T, prioridad: number): NodoPrioridad<T> {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible encolar el nodo: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        const nuevoNodo = new NodoPrioridad(valor, prioridad);

        // Si está vacía o el nuevo nodo tiene mayor prioridad que el primero
        if (this.esVacia() || prioridad < this.inicio!.getPrioridad()) {
            nuevoNodo.setSiguiente(this.inicio);
            this.inicio = nuevoNodo;
        } else {
            let actual = this.inicio!;

            // Inserta el nuevo nodo después de los de igual prioridad, manteniendo orden de llegada.
            while (
                actual.getSiguiente() !== null &&
                actual.getSiguiente()!.getPrioridad() <= prioridad
            ) {
                actual = actual.getSiguiente()!;
            }

            nuevoNodo.setSiguiente(actual.getSiguiente());
            actual.setSiguiente(nuevoNodo);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que elimina el elemento con mayor prioridad (inicio).
     * @returns elemento decolado.
     */
    public decolar(): NodoPrioridad<T> {
        if (this.esVacia()) throw new Error("No fue posible decolar el nodo: la cola está vacía (tamaño actual: 0).");

        const nodoAEliminar = this.inicio!;

        if (this.inicio?.getSiguiente()) {
            this.inicio = this.inicio.getSiguiente();
        } else {
            this.inicio = null;
        }

        this.tamanio--;
        return nodoAEliminar;
    }

    /**
     * Método que vacia la cola.
     */
    public vaciar(): void {
        this.inicio = null;
        this.tamanio = 0;
    }

    /**
     * Método que obtiene el elemento inicial de la cola.
     * @returns NodoPrioridad o null si la cola está vacía.
     */
    public getInicio(): NodoPrioridad<T> | null {
        return this.inicio;
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
    public getTamanioNodo(): number {
        return this.tamanioNodo;
    }

    /**
     * Método que verifica si la cola está vacía.
     * @returns True si está vacía, false en caso contrario.
     */
    public esVacia(): boolean {
        return this.inicio === null
    }

    /**
     * Método que transforma la cola en un array de nodos.
     * @returns Array de nodos con la información de la cola.
     */
    public getArrayDeNodos() {
        const arregloNodos = [];
        let actual = this.inicio;

        while (actual !== null) {
            const nextNode = actual.getSiguiente();

            arregloNodos.push({
                id: actual.getId(),
                value: actual.getValor(),
                next: nextNode ? nextNode.getId() : null,
                memoryAddress: actual.getDireccionMemoria(),
                priority: actual.getPrioridad()
            });

            actual = actual.getSiguiente();
        }

        return arregloNodos;
    }

    /**
     * Método que clona la cola actual.
     * @returns Nueva cola clonada.
     */
    public clonar() {
        const clon = new (this.constructor as new () => this)();

        if (this.esVacia()) {
            return clon;
        }

        let actual = this.inicio;
        let ultimoNodoClonado: NodoPrioridad<T> | null = null;

        while (actual !== null) {
            const nodoCopia = new NodoPrioridad(
                actual.getValor(),
                actual.getPrioridad(),
                actual.getId(),
                actual.getDireccionMemoria()
            );

            if (clon.inicio === null) {
                clon.inicio = nodoCopia;
            } else {
                if (ultimoNodoClonado) {
                    ultimoNodoClonado.setSiguiente(nodoCopia);
                }
            }

            ultimoNodoClonado = nodoCopia;
            actual = actual.getSiguiente();
        }

        clon.tamanio = this.tamanio;
        return clon;
    }

}
