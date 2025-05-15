import { NodoPrioridad } from "../nodes/NodoPrioridad";

export class ColaDePrioridad {

    private inicio: NodoPrioridad | null;
    private tamanio: number;
    private readonly MAX_TAMANIO = 10;

    constructor() {
        this.inicio = null;
        this.tamanio = 0;
    }

    /**
     * Inserta un nodo en la posición correspondiente según su prioridad.
     * @param valor Valor del nodo
     * @param prioridad Prioridad del nodo (menor número = mayor prioridad)
     */
    public encolar(valor: number, prioridad: number): void {
        if (this.tamanio >= this.MAX_TAMANIO) throw new Error("No se puede encolar: Límite de nodos alcanzado.");

        const nuevoNodo = new NodoPrioridad(valor, prioridad);

        // Si está vacía o el nuevo nodo tiene mayor prioridad que el primero
        if (!this.inicio || prioridad < this.inicio.getPrioridad()) {
            nuevoNodo.setSiguiente(this.inicio);
            this.inicio = nuevoNodo;
        } else {
            let actual = this.inicio;

            // Inserta el nuevo nodo después de los de igual prioridad, manteniendo orden de llegada.
            while (
                actual.getSiguiente() !== null &&
                actual.getSiguiente()!.getPrioridad() <= prioridad
            ) {
                actual = actual.getSiguiente()!;
            }

            nuevoNodo.setSiguiente(actual.getSiguiente());
            actual.setSiguiente(nuevoNodo);
        }

        this.tamanio++;
    }

    /**
     * Elimina y retorna el valor del nodo con mayor prioridad (inicio).
     */
    public decolar(): number | null {
        if (!this.inicio) throw new Error("No se puede decolar: la cola está vacía.");

        const valor = this.inicio.getValor();
        this.inicio = this.inicio.getSiguiente();
        this.tamanio--;
        return valor;
    }

    /**
     * Vacía la cola completamente.
     */
    public vaciar(): void {
        this.inicio = null;
        this.tamanio = 0;
    }

    /**
     * Retorna los datos de los nodos como array (útil para visualización).
     */
    public getArrayDeNodos() {
        const arregloNodos = [];
        let actual = this.inicio;

        while (actual !== null) {
            arregloNodos.push({
                id: actual.getId(),
                value: actual.getValor(),
                priority: actual.getPrioridad(),
                direccion: actual.getDireccionMemoria(),
                size: actual.getTamanio(),
                next: actual.getSiguiente() ? actual.getSiguiente()!.getId() : null,
            });

            actual = actual.getSiguiente();
        }

        return arregloNodos;
    }

    public getInicio(): NodoPrioridad | null {
        return this.inicio;
    }

    public getTamanio(): number {
        return this.tamanio;
    }

    public esVacia(): boolean {
        return this.tamanio === 0;
    }
}
