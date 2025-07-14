// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { LinkedListInterface } from "../../../types";
import { linkedListToArray } from "../listUtils";
import { NodoD } from "../nodes/NodoD";

/**
 * Clase que representa el funcionamiento de una lista circular doble.
 */
export class ListaCircularDoble implements LinkedListInterface {

    // Nodo cabecera de la lista.
    private cabeza: NodoD | null;

    // Tamaño de la lista.
    private tamanio: number;

    // Tamaño máximo permitido para la lista circular doble.
    private readonly MAX_TAMANIO = 15;

    /**
     * Constructor de la clase ListaCircularDoble.
     */
    constructor() {
        this.cabeza = null;
        this.tamanio = 0;
    }

    /**
     * Método que inserta un nuevo elemento al inicio de la lista circular doble.
     * @param valor Elemento a insertar.
     * @returns Nodo inicial insertado.
     */
    public insertarAlInicio(valor: number): NodoD {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        const nuevoNodo = new NodoD(valor);

        if (this.esVacia()) {
            nuevoNodo.setSiguiente(nuevoNodo);
            nuevoNodo.setAnterior(nuevoNodo);
            this.cabeza = nuevoNodo;
        } else {
            const ultimoNodo = this.cabeza!.getAnterior()!;

            // Conectar el nuevo nodo
            nuevoNodo.setSiguiente(this.cabeza);
            nuevoNodo.setAnterior(ultimoNodo);

            // Actualizar los punteros
            this.cabeza!.setAnterior(nuevoNodo);
            ultimoNodo.setSiguiente(nuevoNodo);

            this.cabeza = nuevoNodo;
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que inserta un nuevo elemento al final de la lista circular doble.
     * @param valor Elemento a insertar.
     * @returns Nodo final insertado.
     */
    public insertarAlFinal(valor: number): NodoD {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        const nuevoNodo = new NodoD(valor);

        if (this.esVacia()) {
            nuevoNodo.setSiguiente(nuevoNodo);
            nuevoNodo.setAnterior(nuevoNodo);
            this.cabeza = nuevoNodo;
        } else {
            const ultimoNodo = this.cabeza!.getAnterior()!;

            // Actualizar los punteros
            ultimoNodo.setSiguiente(nuevoNodo);
            this.cabeza!.setAnterior(nuevoNodo);

            // Conectar el nuevo nodo
            nuevoNodo.setSiguiente(this.cabeza);
            nuevoNodo.setAnterior(ultimoNodo);
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que inserta un nuevo elemento en una posición especifica de la lista circular doble.
     * @param valor Elemento a insertar.
     * @param posicion Posición en la que se desea insertar el elemento.
     * @return Nodo insertado en la posición especificada.
     */
    public insertarEnPosicion(valor: number, posicion: number): NodoD {
        if (posicion < 0 || posicion > this.tamanio) {
            throw new Error(`No fue posible insertar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Simple.`);
        }

        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar el nodo en la posición especificada: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        if (posicion === 0) {
            return this.insertarAlInicio(valor);
        }

        if (posicion === this.tamanio) {
            return this.insertarAlFinal(valor);
        }

        const nuevoNodo = new NodoD(valor);
        const nodoAnt = this.getPos(posicion - 1)!;

        // Conectar el nuevo nodo a la lista
        nuevoNodo.setSiguiente(nodoAnt.getSiguiente());
        nuevoNodo.setAnterior(nodoAnt);

        // Reorganizar los punteros
        nodoAnt.getSiguiente()?.setAnterior(nuevoNodo);
        nodoAnt.setSiguiente(nuevoNodo);

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que elimina el primer nodo de la lista circular doble.
     * @returns Nodo inicial eliminado.
     */
    public eliminarAlInicio(): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");

        const nodoEliminado = this.cabeza!;

        if (this.cabeza!.getSiguiente() === this.cabeza) {
            this.cabeza = null;
        } else {
            const newHead = this.cabeza!.getSiguiente()!;
            const tail = this.cabeza!.getAnterior()!;

            newHead.setAnterior(tail);
            tail.setSiguiente(newHead);

            this.cabeza = newHead;
        }

        this.tamanio--;
        return nodoEliminado;
    }

    /**
     * Método que elimina el último nodo de la lista circular doble.
     * @returns Nodo final eliminado.
     */
    public eliminarAlFinal(): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");

        const ultimo = this.cabeza!.getAnterior()!;

        if (this.cabeza === ultimo) {
            this.cabeza = null;
        } else {
            const nuevoUltimo = ultimo.getAnterior()!;
            nuevoUltimo.setSiguiente(this.cabeza);
            this.cabeza!.setAnterior(nuevoUltimo);
        }

        this.tamanio--;
        return ultimo;
    }

    /**
     * Método que elimina un nodo en una posición especifica de la lista circular doble.
     * @param posicion Posición del nodo a eliminar.
     * @returns Nodo eliminado.
     */
    public eliminarEnPosicion(posicion: number): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0).");

        if (posicion < 0 || posicion >= this.tamanio) {
            throw new Error(`No fue posible eliminar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Simple.`);
        }

        if (posicion === 0) {
            return this.eliminarAlInicio();
        }

        if (posicion === this.tamanio - 1) {
            return this.eliminarAlFinal();
        }

        const nodoEliminado = this.getPos(posicion)!;

        nodoEliminado.getAnterior()?.setSiguiente(nodoEliminado.getSiguiente());
        nodoEliminado.getSiguiente()?.setAnterior(nodoEliminado.getAnterior());

        this.tamanio--;
        return nodoEliminado;
    }

    /**
     * Método que busca un nodo en la lista circular doble.
     * @param valor Valor a buscar.
     * @returns True si se encuentra el nodo, false en caso contrario.
     */
    public buscar(valor: number): boolean {
        if (this.esVacia()) return false;

        let nodoActual = this.cabeza!;

        do {
            if (nodoActual.getValor() === valor) return true;
            nodoActual = nodoActual.getSiguiente()!;
        }
        while (nodoActual !== this.cabeza);

        return false;
    }

    /**
     * Método que vacia la lista circular doble.
     */
    public vaciar(): void {
        this.cabeza = null;
        this.tamanio = 0;
    }

    /**
     * Método que verifica si la lista circular doble está vacía.
     * @returns True si se encuentra vacía, false en caso contrario.
     */
    public esVacia(): boolean {
        return this.cabeza === null;
    }

    /**
     * Método que obtiene el tamaño de la lista circular doble.
     * @returns Número de elementos dentro de la lista.
     */
    public getTamanio(): number {
        return this.tamanio;
    }

    /**
     * Método que transforma la lista circular doble en un array de nodos.
     * @returns Array de nodos con la información de la lista.
     */
    public getArrayDeNodos() {
        return linkedListToArray(this.cabeza);
    }

    /**
     * Método que clona la lista actual.
     * @returns Nueva lista clonada.
     */
    public clonar() {
        const nuevaLista = new (this.constructor as new () => this)();

        if (this.esVacia()) {
            return nuevaLista;
        }

        let nodoActual = this.cabeza!;
        let ultimoNodoClonado: NodoD | null = null;

        do {
            const nuevoNodo = new NodoD(
                nodoActual.getValor(),
                nodoActual.getId(),
                nodoActual.getDireccionMemoria()
            );

            if (nuevaLista.cabeza === null) {
                nuevaLista.cabeza = nuevoNodo;
            } else {
                if (ultimoNodoClonado) {
                    ultimoNodoClonado.setSiguiente(nuevoNodo);
                    nuevoNodo.setAnterior(ultimoNodoClonado);
                }
            }

            ultimoNodoClonado = nuevoNodo;
            nodoActual = nodoActual.getSiguiente()!;
        }
        while (nodoActual !== this.cabeza);

        // Cerramos la circularidad
        if (nuevaLista.cabeza && ultimoNodoClonado) {
            // último -> primero
            ultimoNodoClonado.setSiguiente(nuevaLista.cabeza);

            // primero -> último
            nuevaLista.cabeza.setAnterior(ultimoNodoClonado);
        }

        nuevaLista.tamanio = this.tamanio;
        return nuevaLista;
    }

    /**
     * Método auxiliar que obtiene el nodo en una posición específica.
     * @param pos Posición del nodo a obtener.
     * @returns Nodo en la posición especificada o null si no existe.
     */
    private getPos(pos: number) {
        let nodoActual = this.cabeza;
        while (pos > 0) {
            if (nodoActual) {
                nodoActual = nodoActual.getSiguiente();
            }
            pos--;
        }

        return nodoActual;
    }

}

