// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";
import { dynamicAddressGenerator } from "../memoryAllocator";

/**
 * Clase que representa un Nodo Simple.
 */
export class NodoS<T> {

    // ID único del nodo.
    private id: string;

    // Información almacenada en el nodo.
    private valor: T;

    // Información del nodo siguiente.
    private siguiente: NodoS<T> | null;

    // Dirección de memoria del nodo.
    private direccionMemoria: string;

    /**
     * Constructor de la clase Nodo Simple.
     * @param valor Valor a almacenar en el nodo.
     * @param id Identificador único del nodo (opcional).
     * @param direccion Dirección de memoria del nodo (opcional).
     */
    constructor(valor: T, id?: string, direccion?: string) {
        this.valor = valor;
        this.id = id ?? `node-${uuidv4()}`;
        this.direccionMemoria = direccion ?? dynamicAddressGenerator.generateNextAddress();
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
    public getSiguiente(): NodoS<T> | null {
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
    public setSiguiente(nodo: NodoS<T> | null): void {
        this.siguiente = nodo;
    }

}