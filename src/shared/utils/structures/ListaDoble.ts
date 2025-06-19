import { LinkedListInterface } from "../../../types";
import { linkedListToArray } from "../listUtils";
import { NodoD } from "../nodes/NodoD";

/**
 * Clase que representa el funcionamiento de una lista doble.
 */
export class ListaDoble implements LinkedListInterface {

    // Nodo cabeza de la lista.
    private cabeza: NodoD | null;

    // Nodo cola de la lista.
    private cola: NodoD | null;

    // Tamaño de la lista.
    private tamanio: number;

    // Tamaño máximo permitido para la lista doble.
    private readonly MAX_TAMANIO = 15;

    /**
     * Constructor de la clase ListaDoble.
     */
    constructor() {
        this.cabeza = null;
        this.cola = null;
        this.tamanio = 0;
    }

    /**
     * Método que inserta un nuevo elemento al inicio de la lista doble.
     * @param valor Elemento a insertar.
     * @returns Nodo inicial insertado.
     */
    insertarAlInicio(valor: number): NodoD {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        const nuevoNodo = new NodoD(valor);

        if (this.esVacia()) {
            this.cabeza = nuevoNodo;
            this.cola = nuevoNodo;
        } else {
            nuevoNodo.setSiguiente(this.cabeza);
            this.cabeza?.setAnterior(nuevoNodo);
            this.cabeza = nuevoNodo;
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que inserta un nuevo elemento al final de la lista doble.
     * @param valor Elemento a insertar.
     * @returns Nodo final insertado.
     */
    insertarAlFinal(valor: number): NodoD {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error(`No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`);

        const nuevoNodo = new NodoD(valor);

        if (this.esVacia()) {
            this.cabeza = nuevoNodo;
            this.cola = nuevoNodo;
        } else {
            this.cola?.setSiguiente(nuevoNodo);
            nuevoNodo.setAnterior(this.cola);
            this.cola = nuevoNodo;
        }

        this.tamanio++;
        return nuevoNodo;
    }

    /**
     * Método que inserta un nuevo elemento en una posición especifica de la lista doble.
     * @param valor Elemento a insertar.
     * @param posicion Posición en la que se desea insertar el elemento.
     * @return Nodo insertado en la posición especificada.
     */
    insertarEnPosicion(valor: number, posicion: number): NodoD {
        if (posicion < 0 || posicion > this.tamanio) {
            throw new Error(`No fue posible insertar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Doble.`);
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
     * Método que elimina el primer nodo de la lista doble.
     * @returns Nodo inicial eliminado. 
     */
    eliminarAlInicio(): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0).");

        const nodoEliminado = this.cabeza;
        this.cabeza = this.cabeza?.getSiguiente() || null;

        if (this.cabeza) {
            this.cabeza.setAnterior(null);
        } else {
            this.cola = null;
        }

        this.tamanio--;
        return nodoEliminado!;
    }

    /**
     * Método que elimina el último nodo de la lista doble.
     * @returns Nodo final eliminado.
     */
    eliminarAlFinal(): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0).");

        const nodoEliminado = this.cola;
        this.cola = nodoEliminado?.getAnterior() || null;

        if (this.cola) {
            this.cola.setSiguiente(null);
        } else {
            this.cabeza = null;
        }

        this.tamanio--;
        return nodoEliminado!;
    }

    /**
     * Método que elimina un nodo en una posición especifica de la lista doble.
     * @param posicion Posición del nodo a eliminar.
     * @returns Nodo eliminado.
     */
    eliminarEnPosicion(posicion: number): NodoD {
        if (this.esVacia()) throw new Error("No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0).");

        if (posicion < 0 || posicion >= this.tamanio) {
            throw new Error(`No fue posible eliminar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Doble.`);
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
     * Método que busca un nodo en la lista doble.
     * @param valor Valor a buscar.
     * @returns True si se encuentra el nodo, false en caso contrario.
     */
    buscar(valor: number): boolean {
        let nodoActual = this.cabeza;

        while (nodoActual) {
            if (nodoActual.getValor() === valor) {
                return true;
            }
            nodoActual = nodoActual.getSiguiente();
        }

        return false;
    }

    /**
     * Método que verifica si la lista doble está vacía.
     * @returns True si se encuentra vacía, false en caso contrario.
     */
    esVacia(): boolean {
        return this.cabeza === null;
    }

    /**
     * Método que vacia la lista doble.
     */
    public vaciar(): void {
        this.cabeza = null;
        this.cola = null;
        this.tamanio = 0;
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

        let nodoActual = this.cabeza;
        let ultimoNodoClonado: NodoD | null = null;

        while (nodoActual !== null) {
            const nuevoNodo = new NodoD(
                nodoActual.getValor(),
                nodoActual.getId(),
                nodoActual.getDireccionMemoria()
            );

            if (nuevaLista.cabeza === null) {
                nuevaLista.cabeza = nuevoNodo;
                nuevaLista.cola = nuevoNodo;
            } else {
                if (ultimoNodoClonado) {
                    ultimoNodoClonado.setSiguiente(nuevoNodo);
                    nuevoNodo.setAnterior(ultimoNodoClonado);
                }
                nuevaLista.cola = nuevoNodo;
            }

            ultimoNodoClonado = nuevoNodo;
            nodoActual = nodoActual.getSiguiente();
        }

        nuevaLista.tamanio = this.tamanio;
        return nuevaLista;
    }

    /**
     * Método que transforma la lista doble en un array de nodos.
     * @returns Array de nodos con la información de la lista.
     */
    public getArrayDeNodos() {
        return linkedListToArray(this.cabeza);
    }

    /**
     * Método que obtiene el tamaño de la lista doble.
     * @returns Número de elementos dentro de la lista.
     */
    getTamanio(): number {
        return this.tamanio;
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