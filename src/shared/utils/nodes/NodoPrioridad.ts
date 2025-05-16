import { v4 as uuidv4 } from "uuid";

export class NodoPrioridad {
    private id: string;
    private valor: number;
    private prioridad: number;
    private siguiente: NodoPrioridad | null;
    private direccionMemoria: string;
    private tamanio: number;

    constructor(valor: number, prioridad: number, id?: string, direccionMemoria?: number) {
        this.id = id ?? `node-${uuidv4()}`;
        this.valor = valor;
        this.prioridad = prioridad;
        this.siguiente = null;
        const direccion = direccionMemoria ?? Math.floor(Math.random() * 100000);
        this.direccionMemoria = "0x" + direccion.toString(16).padStart(8, "0");
        this.tamanio = 20; // Por ejemplo: 4 bytes extra por la prioridad
    }

    public getValor(): number {
        return this.valor;
    }

    public getPrioridad(): number {
        return this.prioridad;
    }

    public setPrioridad(p: number): void {
        this.prioridad = p;
    }

    public getSiguiente(): NodoPrioridad | null {
        return this.siguiente;
    }

    public setSiguiente(nodo: NodoPrioridad | null): void {
        this.siguiente = nodo;
    }

    public getId(): string {
        return this.id;
    }

    public getDireccionMemoria(): string {
        return this.direccionMemoria;
    }

    public getTamanio(): number {
        return this.tamanio;
    }

    public setId(id: string): void {
        this.id = id;
    }

    public setDireccionMemoria(direccion: string): void {
        this.direccionMemoria = direccion;
    }

    public setTamanio(tamanio: number): void {
        this.tamanio = tamanio;
    }

}
