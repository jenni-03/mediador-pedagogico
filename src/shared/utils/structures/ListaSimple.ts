// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { EqualityFn, LinkedListInterface } from "../../../types";
import { linkedListToArray } from "../listUtils";
import { NodoS } from "../nodes/NodoS";

/**
 * Clase que representa el funcionamiento de una lista simple.
 */
export class ListaSimple<T> implements LinkedListInterface<T> {
  // Nodo cabecera de la lista.
  private cabeza: NodoS<T> | null;

  // Tamaño de la lista.
  private tamanio: number;

  // Tamaño máximo permitido para la lista simple.
  private readonly MAX_TAMANIO = 15;

  // Tamaño simulado de cada nodo en bytes.
  private tamanioNodo: number;

  /**
   * Constructor de la clase ListaSimple.
   */
  constructor(
    tamanioNodo: number = 24,

    private equals: EqualityFn<T> = (a, b) => a === b
  ) {
    this.cabeza = null;
    this.tamanio = 0;
    this.tamanioNodo = tamanioNodo;
  }

  /**
   * Método que inserta un nuevo elemento al inicio de la lista simple.
   * @param valor Elemento a insertar.
   * @returns Nodo inicial insertado.
   */
  public insertarAlInicio(valor: T): NodoS<T> {
    if (this.tamanio >= this.MAX_TAMANIO)
      throw new Error(
        `No fue posible insertar el nodo al inicio: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`
      );

    const nuevoNodo = new NodoS(valor);

    if (this.esVacia()) {
      this.cabeza = nuevoNodo;
    } else {
      nuevoNodo.setSiguiente(this.cabeza);
      this.cabeza = nuevoNodo;
    }

    this.tamanio++;
    return nuevoNodo;
  }

  /**
   * Método que inserta un nuevo elemento al final de la lista simple.
   * @param valor Elemento a insertar.
   * @returns Nodo final insertado.
   */
  public insertarAlFinal(valor: T): NodoS<T> {
    if (this.tamanio >= this.MAX_TAMANIO)
      throw new Error(
        `No fue posible insertar el nodo al final: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`
      );

    const nuevoNodo = new NodoS(valor);

    if (this.esVacia()) {
      this.cabeza = nuevoNodo;
    } else {
      const ultimoNodo = this.getPos(this.tamanio - 1)!;
      ultimoNodo.setSiguiente(nuevoNodo);
    }

    this.tamanio++;
    return nuevoNodo;
  }

  /**
   * Método que inserta un nuevo elemento en una posición especifica de la lista simple.
   * @param valor Elemento a insertar.
   * @param posicion Posición en la que se desea insertar el elemento.
   * @return Nodo insertado en la posición especificada.
   */
  public insertarEnPosicion(valor: T, posicion: number): NodoS<T> {
    if (posicion < 0 || posicion > this.tamanio) {
      throw new Error(
        `No fue posible insertar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Simple.`
      );
    }

    if (this.tamanio >= this.MAX_TAMANIO)
      throw new Error(
        `No fue posible insertar el nodo en la posición especificada: Cantidad de nodos máxima alcanzada (tamaño máximo: ${this.MAX_TAMANIO}).`
      );

    if (posicion === 0) {
      return this.insertarAlInicio(valor);
    }

    if (posicion === this.tamanio) {
      return this.insertarAlFinal(valor);
    }

    const nuevoNodo = new NodoS(valor);
    const nodoAnt = this.getPos(posicion - 1)!;

    nuevoNodo.setSiguiente(nodoAnt.getSiguiente());
    nodoAnt.setSiguiente(nuevoNodo);

    this.tamanio++;
    return nuevoNodo;
  }

  /**
   * Método que elimina el primer nodo de la lista simple.
   * @returns Nodo inicial eliminado.
   */
  public eliminarAlInicio(): NodoS<T> {
    if (this.esVacia())
      throw new Error(
        "No fue posible eliminar el nodo inicial: La lista se encuentra vacía (tamaño actual: 0)."
      );

    const nodoEliminado = this.cabeza!;
    if (this.cabeza) {
      this.cabeza = this.cabeza.getSiguiente();
    }

    this.tamanio--;
    return nodoEliminado;
  }

  /**
   * Método que elimina el último nodo de la lista simple.
   * @returns Nodo final eliminado.
   */
  public eliminarAlFinal(): NodoS<T> {
    if (this.esVacia())
      throw new Error(
        "No fue posible eliminar el nodo final: La lista se encuentra vacía (tamaño actual: 0)."
      );

    let nodoEliminado: NodoS<T>;

    if (this.tamanio === 1) {
      nodoEliminado = this.cabeza!;
      this.cabeza = null;
    } else {
      const nodoAnt = this.getPos(this.tamanio - 2)!;
      nodoEliminado = nodoAnt.getSiguiente()!;
      nodoAnt.setSiguiente(null);
    }

    this.tamanio--;
    return nodoEliminado;
  }

  /**
   * Método que elimina un nodo en una posición especifica de la lista simple.
   * @param posicion Posición del nodo a eliminar.
   * @returns Nodo eliminado.
   */
  public eliminarEnPosicion(posicion: number): NodoS<T> {
    if (this.esVacia())
      throw new Error(
        "No fue posible eliminar el nodo en la posición especificada: La lista se encuentra vacía (tamaño actual: 0)."
      );

    if (posicion < 0 || posicion >= this.tamanio) {
      throw new Error(
        `No fue posible eliminar el nodo en la posición especificada: La posición ${posicion} no existe dentro de la Lista Simple.`
      );
    }

    if (posicion === 0) {
      return this.eliminarAlInicio();
    }

    if (posicion === this.tamanio - 1) {
      return this.eliminarAlFinal();
    }

    const nodoAnt = this.getPos(posicion - 1)!;
    const nodoEliminado = nodoAnt.getSiguiente()!;

    nodoAnt.setSiguiente(nodoEliminado.getSiguiente());

    this.tamanio--;
    return nodoEliminado;
  }

  /**
   * Método que busca un nodo en la lista simple.
   * @param valor Valor a buscar.
   * @returns True si se encuentra el nodo, false en caso contrario.
   */
  public buscar(valor: T): boolean {
    let nodoActual = this.cabeza;

    while (nodoActual) {
      if (this.equals(nodoActual.getValor(), valor)) {
        return true;
      }
      nodoActual = nodoActual.getSiguiente();
    }

    return false;
  }

  /**
   * Método que vacia la lista simple.
   */
  public vaciar(): void {
    this.cabeza = null;
    this.tamanio = 0;
  }

  /**
   * Método que verifica si la lista simple está vacía.
   * @returns True si se encuentra vacía, false en caso contrario.
   */
  public esVacia(): boolean {
    return this.cabeza === null;
  }

  /**
   * Método que obtiene el tamaño de la lista simple.
   * @returns Número de elementos dentro de la lista.
   */
  public getTamanio(): number {
    return this.tamanio;
  }

  /**
   * Método que transforma la lista simple en un array de nodos.
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

    let nodoActual = this.cabeza;
    let ultimoNodoClonado: NodoS<T> | null = null;

    while (nodoActual !== null) {
      const nuevoNodo = new NodoS(
        nodoActual.getValor(),
        nodoActual.getId(),
        nodoActual.getDireccionMemoria()
      );

      if (nuevaLista.cabeza === null) {
        nuevaLista.cabeza = nuevoNodo;
      } else {
        if (ultimoNodoClonado) {
          ultimoNodoClonado.setSiguiente(nuevoNodo);
        }
      }

      ultimoNodoClonado = nuevoNodo;
      nodoActual = nodoActual.getSiguiente();
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

  /**
   * Método que retorna el tamaño en bytes de los nodos almacenados.
   * @returns Tamaño en bytes de los nodos.
   */
  getTamanioNodo() {
    return this.tamanioNodo;
  }
}
