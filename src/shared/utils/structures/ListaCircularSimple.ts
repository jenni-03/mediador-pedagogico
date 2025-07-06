import { LinkedListInterface, ListNodeData } from "../../../types";
import { NodoS } from "../nodes/NodoS";

/**
 * Clase que representa el funcionamiento de una lista circular simple.
 */
export class ListaCircularSimple implements LinkedListInterface {
    private cabeza: NodoS | null;
    private tamanio: number;
    private readonly MAX_TAMANIO = 15;

    constructor() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    insertarAlInicio(valor: number): NodoS {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar al inicio: tamaño máximo alcanzado.`);

        const nuevoNodo = new NodoS(valor);

        if (this.esVacia()) {
            this.cabeza = nuevoNodo;
            nuevoNodo.setSiguiente(nuevoNodo);
        } else {
            const ultimo = this.getUltimoNodo();
            nuevoNodo.setSiguiente(this.cabeza);
            this.cabeza = nuevoNodo;
            ultimo!.setSiguiente(this.cabeza);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    insertarAlFinal(valor: number): NodoS {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar al final: tamaño máximo alcanzado.`);

        const nuevoNodo = new NodoS(valor);

        if (this.esVacia()) {
            this.cabeza = nuevoNodo;
            nuevoNodo.setSiguiente(nuevoNodo);
        } else {
            const ultimo = this.getUltimoNodo();
            ultimo!.setSiguiente(nuevoNodo);
            nuevoNodo.setSiguiente(this.cabeza);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    insertarEnPosicion(valor: number, posicion: number): NodoS {
        if (posicion < 0 || posicion > this.tamanio) throw new Error(`Posición ${posicion} fuera de rango.`);

        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`Tamaño máximo alcanzado.`);

        if (posicion === 0) return this.insertarAlInicio(valor);
        if (posicion === this.tamanio) return this.insertarAlFinal(valor);

        const nuevoNodo = new NodoS(valor);
        const nodoAnt = this.getPos(posicion - 1)!;

        nuevoNodo.setSiguiente(nodoAnt.getSiguiente());
        nodoAnt.setSiguiente(nuevoNodo);

        this.tamanio++;
        return nuevoNodo;
    }

    eliminarAlInicio(): NodoS {
        if (this.esVacia()) throw new Error("Lista vacía.");

        const nodoEliminado = this.cabeza!;

        if (this.tamanio === 1) {
            this.cabeza = null;
        } else {
            const ultimo = this.getUltimoNodo();
            this.cabeza = this.cabeza!.getSiguiente();
            ultimo!.setSiguiente(this.cabeza);
        }

        this.tamanio--;
        return nodoEliminado;
    }

    eliminarAlFinal(): NodoS {
        if (this.esVacia()) throw new Error("Lista vacía.");

        let nodoEliminado: NodoS;

        if (this.tamanio === 1) {
            nodoEliminado = this.cabeza!;
            this.cabeza = null;
        } else {
            const penultimo = this.getPos(this.tamanio - 2)!;
            nodoEliminado = penultimo.getSiguiente()!;
            penultimo.setSiguiente(this.cabeza);
        }

        this.tamanio--;
        return nodoEliminado;
    }

    eliminarEnPosicion(posicion: number): NodoS {
        if (this.esVacia()) throw new Error("Lista vacía.");
        if (posicion < 0 || posicion >= this.tamanio) throw new Error(`Posición ${posicion} fuera de rango.`);

        if (posicion === 0) return this.eliminarAlInicio();
        if (posicion === this.tamanio - 1) return this.eliminarAlFinal();

        const nodoAnt = this.getPos(posicion - 1)!;
        const nodoEliminado = nodoAnt.getSiguiente()!;
        nodoAnt.setSiguiente(nodoEliminado.getSiguiente());

        this.tamanio--;
        return nodoEliminado;
    }

    buscar(valor: number): boolean {
        if (this.esVacia()) return false;

        let nodoActual = this.cabeza;
        let i = 0;

        while (i < this.tamanio) {
            if (nodoActual!.getValor() === valor) return true;
            nodoActual = nodoActual!.getSiguiente();
            i++;
        }

        return false;
    }

    vaciar(): void {
        this.cabeza = null;
        this.tamanio = 0;
    }

    esVacia(): boolean {
        return this.cabeza === null;
    }

    getTamanio(): number {
        return this.tamanio;
    }

    public getArrayDeNodos(): ListNodeData[] {
        const resultArray: ListNodeData[] = [];
        let currentNode = this.cabeza;
    
        for (let i = 0; i < this.tamanio && currentNode !== null; i++) {
            const nextNode = currentNode.getSiguiente();
    
            const nodeData: ListNodeData = {
                id: currentNode.getId(),
                value: currentNode.getValor(),
                next: nextNode ? nextNode.getId() : null,
                memoryAddress: currentNode.getDireccionMemoria()
            };
    
            resultArray.push(nodeData);
            currentNode = nextNode;
        }
    
        return resultArray;
    }

    public clonar() {
        const nuevaLista = new (this.constructor as new () => this)();

        if (this.esVacia()) return nuevaLista;

        let nodoActual = this.cabeza;
        let i = 0;

        while (i < this.tamanio && nodoActual) {
            nuevaLista.insertarAlFinal(
                nodoActual.getValor()
            );
            nodoActual = nodoActual.getSiguiente();
            i++;
        }

        return nuevaLista;
    }

    private getPos(pos: number): NodoS | null {
        if (this.esVacia() || pos < 0 || pos >= this.tamanio) return null;

        let nodoActual = this.cabeza;
        let i = 0;

        while (i < pos) {
            nodoActual = nodoActual!.getSiguiente();
            i++;
        }

        return nodoActual;
    }

    private getUltimoNodo(): NodoS | null {
        return this.getPos(this.tamanio - 1);
    }
}
