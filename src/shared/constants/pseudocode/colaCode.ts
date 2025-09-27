import { OperationCode } from "./typesPseudoCode";

export const getColaCode = (): OperationCode => ({
 enqueue: [
            `/**
 * Método que permite agregar un elemento al final de la cola.
 * post: Se insertó un nuevo elemento al final de la cola.
 * @param info es de tipo T y corresponde a la informacion a encolar.
 */`,
            `public void enColar(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if (this.esVacia()) {`,
            `        this.inicio = nuevoNodo;`,
            `        this.fin = nuevoNodo;`,
            `    } else {`,
            `        this.fin.setSig(nuevoNodo);`,
            `        this.fin = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        dequeue: [
            `/**
 * Método que permite retirar el primer elemento insertado en la cola.
 * post: Se retiró el primer elemento de la cola.
 * @return un tipo T correspondiente a la informacion del elemento retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    NodoD<T>x = this.inicio`,
            `    if (this.inicio == this.fin) {`,
            `        this.inicio = null;`,
            `        this.fin = null;`,
            `    } else {`,
            `        this.inicio = this.inicio.getSig();`,
            `    }`,
            `    this.tamanio--;`,
            `    return x.getInfo();`,
            `}`
        ],
        getFront: [
            `/**
 * Método que permite obtener el primer elemento insertado en la cola.
 * post: Se obtuvó el primer elemento de la cola.
 * @return El primer elemento de la cola.
 */`,
            `protected Nodo<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Método que permite eliminar toda la información que contiene la cola.
 * post: Se eliminó todos los elementos que se encontraban en la Cola.
 */`,
            `public void vaciar(){`,
            `    this.inicio = null;`,
            `    this.fin = null;`,
            `    this.tamanio = 0;`,
            `}`
        ]
});
