// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";

/**
 * Clase que representa un Nodo Simple
 */
export class NodoS {

    // ID único del nodo
    private id: string;

    // Información almacenada en el nodo
    private valor: number;

    // Información del nodo siguiente
    private siguiente: NodoS | null;

    /**
     * Constructor de la clase Nodo Simple
     * @param valor Valor a almacenar en el nodo
     */
    constructor(valor: number, id?: string) {
        this.id = id ?? `node-${uuidv4()}`;
        this.valor = valor;
        this.siguiente = null;
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
    public getSiguiente(): NodoS | null {
        return this.siguiente;
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
    public setSiguiente(nodo: NodoS | null): void {
        this.siguiente = nodo;
    }

    /**
     * Método encargado de obtener el ID del nodo
     * @returns ID del nodo
     */
    public getId(): string {
        return this.id;
    }

}