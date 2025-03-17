// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { NodoD } from "../nodes/NodoD";

/**
 * Clase que representa una Cola utilizando nodos dobles.
 */
export class Cola {

    // Nodo inicial de la cola
    private inicio: NodoD | null;

    // Nodo final de la cola
    private fin: NodoD | null;

    // Tamaño de la cola
    private tamanio: number;

    /**
     * Constructor de la clase Cola
     */
    constructor() {
        this.inicio = null;
        this.fin = null;
        this.tamanio = 0;
    }

    /**
     * Método para encolar un elemento en la cola.
     * @param valor Número a encolar.
     */
    public encolar(valor: number): void {
        const nuevoNodo = new NodoD(valor);

        if (this.esVacia()) {
            this.inicio = nuevoNodo;
            this.fin = nuevoNodo;
        } else {
            if (this.fin) {
                this.fin.setSiguiente(nuevoNodo);
                nuevoNodo.setAnterior(this.fin);
                this.fin = nuevoNodo;
            }
        }
        this.tamanio++;
    }

    /**
     * Método para decolar (quitar) el primer elemento de la cola.
     * @returns Número removido o null si la cola está vacía.
     */
    public decolar(): number | null {
        if (this.esVacia()) return null;

        const valorEliminado = this.inicio?.getValor() ?? null;

        if (this.inicio === this.fin) {
            this.inicio = null;
            this.fin = null;
        } else {
            if (this.inicio) {
                this.inicio = this.inicio.getSiguiente();
                if (this.inicio) this.inicio.setAnterior(null);
            }
        }
        this.tamanio--;
        return valorEliminado;
    }

    /**
     * Vacía la cola completamente.
     */
    public vaciar(): void {
        this.inicio = null;
        this.fin = null;
        this.tamanio = 0;
    }

    /**
     * Obtiene el nodo en el inicio de la cola.
     * @returns NodoD o null si la cola está vacía.
     */
    public getInicio(): NodoD | null {
        return this.inicio;
    }

    /**
     * Obtiene el valor del nodo en el inicio de la cola.
     * @returns Número o null si la cola está vacía.
     */
    public getInfoInicio(): number | null {
        return this.inicio?.getValor() ?? null;
    }

    /**
     * Devuelve el tamaño actual de la cola.
     * @returns Número de elementos en la cola.
     */
    public getTamanio(): number {
        return this.tamanio;
    }

    /**
     * Verifica si la cola está vacía.
     * @returns True si está vacía, false en caso contrario.
     */
    public esVacia(): boolean {
        return this.tamanio === 0;
    }
}

// Crear una nueva cola
const cola = new Cola();

// Verificar si la cola está vacía (Debe ser true)
console.log("¿Cola está vacía?:", cola.esVacia());

// Encolar elementos
cola.encolar(10);
cola.encolar(20);
cola.encolar(30);

// Mostrar el tamaño de la cola (Debe ser 3)
console.log("Tamaño de la cola:", cola.getTamanio());

// Obtener el inicio de la cola (Debe ser el NodoD que tiene el valor 10)
console.log("Inicio de la cola:", cola.getInicio());

// Obtener el valor del nodo al inicio (Debe ser 10)
console.log("Valor del nodo al inicio:", cola.getInfoInicio());

// Desencolar un elemento (Debe eliminar el 10)
cola.decolar();

// Mostrar el tamaño de la cola después de desencolar (Debe ser 2)
console.log("Tamaño de la cola después de desencolar:", cola.getTamanio());

// Obtener el nuevo valor al inicio (Debe ser 20)
console.log("Nuevo valor al inicio:", cola.getInfoInicio());

// Vaciar la cola
cola.vaciar();

// Verificar si la cola está vacía nuevamente (Debe ser true)
console.log("¿Cola está vacía después de vaciarla?:", cola.esVacia());
