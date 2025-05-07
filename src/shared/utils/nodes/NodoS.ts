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

    // Dirección en formato hexadecimal
    private direccionMemoria: string; 

    // Tamaño del nodo en bytes
    private tamanio: number; 


    /**
     * Constructor de la clase Nodo Simple
     * @param valor Valor a almacenar en el nodo
     */
    constructor(valor: number, id?: string, direccionMemoria?: number) {
        this.id = id ?? `node-${uuidv4()}`;
        this.valor = valor;
        this.siguiente = null;
        const direccion = direccionMemoria ?? Math.floor(Math.random() * 100000); // Simulamos una dirección
        this.direccionMemoria = "0x" + direccion.toString(16).padStart(8, "0"); // Convierte a formato hexadecimal, 8 dígitos
        this.tamanio = 16;
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

    public getDireccionMemoria(): string {
        return this.direccionMemoria;
    }
    
    public getTamanio(): number {
        return this.tamanio;
    }
    
}