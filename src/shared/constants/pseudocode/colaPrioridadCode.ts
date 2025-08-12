import { OperationCode } from "./typesPseudoCode";

export const getColaPrioridadCode = (): OperationCode => ({
enqueue: [
            `/**
 * Método que permite agregar un elemento a la cola según su prioridad.
 * post: Se insertó un nuevo elemento a la cola.
 * @param info es de tipo T y corresponde a la informacion a encolar.
 * @param p es de tipo entero y corresponde a la prioridad del nuevo elemento. 
 */`,
            `public void enColar(T info, int p){`,
            `    NodoP<T> nuevoNodo = new NodoP<T>(info, p);`,
            `    if (this.esVacia() || p < this.inicio.getPrioridad()) {`,
            `        nuevoNodo.setSig(this.incio);`,
            `        this.inicio = nuevoNodo;`,
            `    } else {`,
            `        NodoP<T> actual = this.inicio;`,
            `        while (actual.getSig() != null && actual.getSig().getPrioridad() <= p) {`,
            `               actual = actual.getSig();`,
            `        }`,
            `        nuevoNodo.setSig(actual.getSig());`,
            `        actual.setSig(nuevoNodo);`,
            `    }`,
            `}`
        ],
        dequeue: [
            `/**
 * Método que permite retirar el elemento con mayor prioridad en la cola (inicio).
 * post: Se retiró el elemento con mayor prioridad en la cola.
 * @return un tipo T correspondiente a la informacion del nodo retirado.
 */`,
            `public T deColar(){`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    NodoP<T> x = this.inicio;`,
            `    if(this.inicio.getSig()) {`,
            `       this.inicio = this.inicio.getSig();`,
            `    }`,
            `    else {`,
            `       this.inicio = null;`,
            `    }`,
            `    this.tamanio--;`,
            `    return x.getInfo();`,
            `}`
        ],
        getFront: [
            `/**
 * Método que permite obtener el elemento inicial de la cola.
 * post: Se obtuvó el elemento inicial de la cola.
 * @return El elemento inicial de la cola.
 */`,
            `protected NodoP<T> getInicio(){`,
            `    return this.inicio;`,
            `}`
        ],
        clean: [
            `/**
 * Método que permite eliminar todos los elementos que contiene la cola. 
 * post: Se eliminó todos los elementos que se encontraban en la cola.
 */`,
            `public void vaciar(){`,
            `    this.inicio = null;`,
            `    this.tamanio=0;`,
            `}`
        ]
});
