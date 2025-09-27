import { OperationCode } from "./typesPseudoCode";

export const getPilaCode = (): OperationCode => ({
  push: [
            `/**
 * Método que permite insertar un elemento en el tope de la pila.
 * post: Se insertó el elemento en el tope de la pila.
 * @param info es de tipo T y corresponde a la información a insertar en la pila.
 */`,
            `public void apilar(T info){`,
            `    Nodo<T>nuevoNodo = new Nodo(info);`,
            `    if(this.esVacia()) {`,
            `       this.tope = nuevoNodo;`,
            `    }`,
            `    else {`,
            `       nuevoNodo.setSig(this.tope);`,
            `       this.tope = nuevoNodo;`,
            `    }`,
            `    this.tamanio++;`,
            `}`
        ],
        pop: [
            `/**
 * Método que permite retirar el elemento tope actual de la pila.
 * post: Se retiró el elemento tope actual de la pila.
 * @return un tipo T que corresponde al valor del elemento retirado.
 */`,
            `public T desapilar(){`,
            `    if(this.esVacia())`,
            `        return null;`,
            `    Nodo<T> x = this.tope;`,
            `    this.tope = tope.getSig();`,
            `    this.tamanio--;`,
            `    return x.getInfo();`,
            `}`
        ],
        getTop: [
            `/**
 * Método que permite obtener el elemento tope actual de la pila.
 * post: Se retornó el elemento tope actual de la pila.
 * @return Elemento tope de la pila.
 */`,
            `public Nodo<T> getTope(){`,
            `    return this.tope;`,
            `}`
        ],
        clean: [
            `/**
 * Método que permite eliminar todos los elementos de la pila.
 * post: Se eliminó todos los elementos que se encontraban en la pila.
 */`,
            `public void vaciar(){`,
            `    this.tope = null;`,
            `    this.tamanio = 0;`,
            `}`
        ]
});
