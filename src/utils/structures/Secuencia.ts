// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

/**
 * Clase que representa un vector
 */
export class Secuencia<T> {

    // Vector donde se almacena los objetos
    private vector: (T | null)[];

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
        this.vector = new Array<T | null>(n);
        for (let i = 0; i < n; i++) {
            this.vector[i] = null;
        }
        this.cant = 0;
    }

    /**
     * Método que inserta un nuevo elemento a la secuencia
     * @param elem Elemento a insertar
     */
    insertar(elem: T) {
        if (this.cant >= this.vector.length) {
            console.error("No hay más espacio");
            return;
        } else {
            this.vector[this.cant++] = elem;
        }
    }

    /**
     * Método que elimina un elemento de la secuencia
     * @param elem Elemento a eliminar
     */
    eliminar(elem: T) {
        let encontrado = false;
        let j = 0;
        for (let i = 0; i < this.cant; i++) {
            if (this.vector[i] !== elem) {
                this.vector[j] = this.vector[i];
                j++;
            } else {
                encontrado = true;
                this.vector[j] = null;
            }
        }
        if (encontrado) {
            this.cant--;
        }
    }

    /**
     * Método que elimina un elemento a la secuencia dada su posición
     * @param pos Posición del elemento a eliminar
     */
    eliminarPos(pos: number) {
        if (pos < 0 || pos >= this.cant) {
            console.error("Indice fuera de rango");
            return;
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
    }

    /**
     * Método que retorna el elemento en la posición indicda
     * @param i Posición del elemento
     * @returns El elemento de tipo T o null si la posición es inválida.
     */
    get(i: number): T | null {
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
    set(i: number, nuevo: T) {
        if (i < 0 || i >= this.cant) {
            console.error("Indíce fuera de rango!");
            return;
        }
        if (nuevo === null || nuevo === undefined) {
            console.error("No se pueden ingresar datos nulos!");
            return;
        }
        this.vector[i] = nuevo;
    }

    /**
     * Método que comprueba si el elemento se encuentra en la secuencia.
     * @param elem Elemento a buscar.
     * @returns true si se encuentra, false en caso contrario.
     */
    esta(elem: T) {
        for (let i = 0; i < this.cant; i++) {
            if (this.vector[i] === elem) {
                return true;
            }
        }
        return false;
    }

    /**
     * Método que retorna el índice de un elemento dentro de la secuencia.
     * @param elem Elemento a ubicar.
     * @returns El índice si se encuentra o -1 en caso contrario.
     */
    getIndice(elem: T): number {
        for (let i = 0; i < this.cant; i++) {
            if (this.vector[i] === elem) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Método que retorna el número de elementos almacenados.
     * @returns Cantidad de elementos.
     */
    getTamanio(): number {
        return this.cant;
    }

    /**
     * Método que verifica si la secuencia está vacía.
     * @returns true si está vacía.
     */
    esVacia(): boolean {
        return this.cant === 0;
    }

    /**
     * Método que retorna la capacidad (tamaño real) del vector.
     * @returns Capacidad de la secuencia.
     */
    getCapacidad(): number {
        return this.vector.length;
    }

}

// const secuencia = new Secuencia<number>(4);
// console.log(secuencia)

// console.log(secuencia.getCapacidad());
// console.log(secuencia.getTamanio());

// secuencia.insertar(1);
// secuencia.insertar(2);
// secuencia.insertar(3);
// secuencia.insertar(4);
// console.log(secuencia)

// secuencia.eliminarPos(2);

// console.log(secuencia);

// console.log(secuencia.get(1));

// secuencia.set(1, 3);

// console.log(secuencia);

// console.log(secuencia.esta(5));

// console.log(secuencia.getIndice(3));

// console.log(secuencia.getTamanio());

// console.log(secuencia.esVacia());

// console.log(secuencia.getCapacidad());

// const secuencia2 = new Secuencia<number>(4);

// secuencia2.insertar(4);
// secuencia2.insertar(4);
// secuencia2.insertar(4);
// secuencia2.insertar(4);

// console.log(secuencia2);

// secuencia2.eliminar(4);

// console.log(secuencia2);