// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";
import { binaryNodeAddressGenerator } from "../memoryAllocator";

/**
 * Clase que representa un Nodo Binario.
 */
export class NodoBin<T> {

    // Id único del nodo binario.
    private id: string;

    // Información almacenada en el nodo binario.
    private info: T;

    // Hijo izquierdo del nodo binario.
    private izquierdo: NodoBin<T> | null;

    // Hijo derecho del nodo binario.
    private derecho: NodoBin<T> | null;

    // Dirección de memoria del nodo binario.
    private direccionMemoria: string;

    /**
     * Constructor de la clase Nodo Binario.
     * @param info Información a almacenar en el nodo.
     * @param id Identificador único del nodo (opcional).
     * @param direccion Dirección de memoria del nodo (opcional).
     */
    constructor(info: T, id?: string, direccion?: string) {
        this.info = info;
        this.id = id ?? `node-${uuidv4()}`;
        this.direccionMemoria = direccion ?? binaryNodeAddressGenerator.generateNextAddress();
        this.izquierdo = null;
        this.derecho = null;
    }

    /**
     * Método que obtiene la información almacenada en el nodo binario.
     * @returns Info almacenada en el nodo binario.
     */
    public getInfo(): T {
        return this.info;
    }

    /**
     * Método que obtiene la referencia al hijo izquierdo del nodo binario.
     * @returns Hijo izquierdo o null según corresponda.
     */
    public getIzq(): NodoBin<T> | null {
        return this.izquierdo;
    }

    /**
     * Método que obtiene la referencia al hijo derecho del nodo binario.
     * @returns Hijo derecho o null según corresponda.
     */
    public getDer(): NodoBin<T> | null {
        return this.derecho;
    }

    /**
     * Método que obtiene el Id del nodo binario.
     * @returns Id del nodo binario.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Método que obtiene la dirección de memoria del nodo binario.
     * @returns Dirección de memoria del nodo binario.
     */
    public getDireccionMemoria(): string {
        return this.direccionMemoria;
    }

    /**
     * Método que cambia la información almacenada en el nodo binario.
     * @param info Nueva info a almacenar.
     */
    public setInfo(info: T): void {
        this.info = info;
    }

    /**
     * Método que modifica la referencia al hijo izquierdo del nodo binario.
     * @param nodo Nodo a establecer como hijo izquierdo.
     */
    public setIzq(nodo: NodoBin<T> | null): void {
        this.izquierdo = nodo;
    }

    /**
     * Método que modifica la referencia al hijo derecho del nodo binario.
     * @param nodo Nodo a establecer como hijo derecho.
     */
    public setDer(nodo: NodoBin<T> | null): void {
        this.derecho = nodo;
    }

}