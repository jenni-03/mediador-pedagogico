// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

/**
 * Clase que representa un vector
 */
export class Secuencia {

    // Vector donde se almacena los objetos
    private vector: (number | null)[];

    // Cantidad de elementos actualmente almacenados en la secuencia.
    private cant: number;

    /**
     * Constructor de la clase Secuencia
     * @param n Tamaño (capacidad) de la secuencia
     */
    constructor(n: number) {
        if (n <= 0) {
            this.vector = [];
            this.cant = 0;
            return;
        }
        this.vector = new Array<number | null>(n);
        for (let i = 0; i < n; i++) {
            this.vector[i] = null;
        }
        this.cant = 0;
    }

    /**
     * Método que inserta un nuevo elemento a la secuencia
     * @param elem Elemento a insertar
     */
    insertar(elem: number) {
        if (this.vector.includes(elem)) {
            throw new Error(`El elemento ${elem} ya está en la secuencia`);
        }
        if (this.cant >= this.vector.length) {
            throw new Error(`No hay espacio para insertar el elemento ${elem}`);
        }
        this.vector[this.cant++] = elem;
    }

    /**
     * Método que elimina un elemento de la secuencia
     * @param elem Elemento a eliminar
     */
    eliminar(elem: number) {
        const indice = this.getIndice(elem);
        if (indice === -1) {
            throw new Error(`El elemento ${elem} no está en la secuencia`);
        }
    
        // Mover los elementos hacia la izquierda
        for (let i = indice; i < this.cant - 1; i++) {
            this.vector[i] = this.vector[i + 1];
        }
    
        // Reducir cantidad y limpiar el último espacio
        this.vector[this.cant - 1] = null;
        this.cant--;
    }

    /**
     * Método que elimina un elemento a la secuencia dada su posición
     * @param pos Posición del elemento a eliminar
     */
    eliminarPos(pos: number) {
        if (pos < 0 || pos >= this.cant) {
            throw new Error(`La posición ${pos} no existe, está fuera de rango`);
        }
        let eliminado = false;
        let j = 0;
        for (let i = 0; i < this.cant; i++) {
            if (i !== pos) {
                this.vector[j] = this.vector[i];
                j++;
            } else {
                eliminado = true;
                this.vector[j] = null;
            }
        }
        if (eliminado) {
            this.cant--;
            this.vector[this.cant] = null;
        }
    }

    /**
     * Método que vacía la secuencia
     */
    vaciar(): void {
        for (let i = 0; i < this.cant; i++) {
            this.vector[i] = null;
        }
        this.cant = 0;
        this.vector.length = 0;
    }

    /**
     * Método que retorna el elemento en la posición indicada
     * @param i Posición del elemento
     * @returns El elemento de tipo T o null si la posición es inválida.
     */
    get(i: number): number | null {
        if (i < 0 || i >= this.cant) {
            console.error("Indíce fuera de rango!");
            return null;
        }
        return this.vector[i];
    }

    /**
     * Método que cambia el elemento en la posición indicada por otro.
     * @param i Posición a modificar.
     * @param nuevo Nuevo elemento a insertar.
     */
    set(i: number, nuevo: number) {
        if (i < 0 || i >= this.cant) {
            throw new Error("Indíce fuera de rango!");
        }
        if (this.vector.includes(nuevo)) {
            throw new Error(`El elemento ${nuevo} ya está en la secuencia`);
        }
        this.vector[i] = nuevo;
    }

    /**
     * Método que comprueba si el elemento se encuentra en la secuencia.
     * @param elem Elemento a buscar.
     * @returns true si se encuentra, false en caso contrario.
     */
    esta(elem: number): boolean {
        if(this.vector.includes(elem)){
            return true
        }
        throw new Error(`El elemento ${elem} no se encontró en la secuencia`);
    }

    /**
     * Método que retorna el índice de un elemento dentro de la secuencia.
     * @param elem Elemento a ubicar.
     * @returns El índice si se encuentra o -1 en caso contrario.
     */
    getIndice(elem: number): number {
        return this.vector.indexOf(elem);
    }

    /**
     * Método que retorna el número de elementos almacenados.
     * @returns Cantidad de elementos.
     */
    getTamanio() {
        return this.cant;
    }

    /**
     * Método que verifica si la secuencia está vacía.
     * @returns true si está vacía.
     */
    esVacia() {
        return this.cant === 0;
    }

    /**
     * Método que retorna la capacidad (tamaño real) del vector.
     * @returns Capacidad de la secuencia.
     */
    getCapacidad() {
        return this.vector.length;
    }

    /**
     * Método que retorna el vector contenedor de la secuencia
     * @returns Vector contenedor
     */
    getVector() {
        return this.vector;
    }

    /**
     * Método encargado de clonar la secuencia actual
     * @returns Nueva secuencia clonada
     */
    clonar() {
        const secuenciaClonada = new Secuencia(this.getCapacidad());
        for (let i = 0; i < this.getTamanio(); i++) {
            secuenciaClonada.insertar(this.get(i) ?? -1);
        }
        return secuenciaClonada;
    }

}