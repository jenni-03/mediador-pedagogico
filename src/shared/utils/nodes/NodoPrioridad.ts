// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";
import { priorityQueueAddressGenerator } from "../memoryAllocator";

/**
 * Clase que representa un Nodo de Prioridad.
 */
export class NodoPrioridad<T> {

    // ID único del nodo.
    private id: string;

    // Información almacenada en el nodo.
    private valor: T;

    // Prioridad del nodo
    private prioridad: number;

    // Información del nodo siguiente.
    private siguiente: NodoPrioridad<T> | null;

    // Dirección de memoria del nodo.
    private direccionMemoria: string;

    /**
     * Constructor de la clase NodoPrioridad.
     * @param valor Valor a almacenar en el nodo.
     * @param prioridad Prioridad del nodo.
     * @param id Identificador único del nodo (opcional).
     * @param direccionMemoria Dirección de memoria del nodo (opcional).
     */
    constructor(valor: T, prioridad: number, id?: string, direccionMemoria?: string) {
        this.valor = valor;
        this.id = id ?? `node-${uuidv4()}`;
        this.prioridad = prioridad;
        this.direccionMemoria = direccionMemoria ?? priorityQueueAddressGenerator.generateNextAddress();
        this.siguiente = null;
    }

    /**
     * Método que obtiene la información almacenada en el nodo.
     * @returns Valor almacenado en el nodo.
     */
    public getValor(): T {
        return this.valor;
    }

    /**
     * Método que obtiene la referencia al nodo siguiente.
     * @returns Nodo siguiente o null según corresponda.
     */
    public getSiguiente(): NodoPrioridad<T> | null {
        return this.siguiente;
    }

    /**
     * Método que obtiene el ID del nodo.
     * @returns ID del nodo.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Método que obtiene el valor de prioridad del nodo.
     * @returns Prioridad actual del nodo.
     */
    public getPrioridad(): number {
        return this.prioridad;
    }

    /**
     * Método que obtiene la dirección de memoria del nodo.
     * @returns Dirección de memoria del nodo.
     */
    public getDireccionMemoria(): string {
        return this.direccionMemoria;
    }

    /**
     * Método que establece el valor del nodo.
     * @param valor Valor a establecer.
     */
    public setValor(valor: T): void {
        this.valor = valor;
    }

    /**
     * Método que establece la referencia al nodo siguiente.
     * @param nodo Nodo a establecer como siguiente.
     */
    public setSiguiente(nodo: NodoPrioridad<T> | null): void {
        this.siguiente = nodo;
    }

    /**
     * Método que establece la prioridad del nodo.
     * @param p Prioridad del nodo a establecer.
     */
    public setPrioridad(p: number): void {
        this.prioridad = p;
    }

}
