// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { DomainError } from "../error/DomainError";
import { sequentialAddressGenerator } from "../memoryAllocator";

/**
 * Clase que representa un vector.
 */
export class Secuencia<T> {
  // Vector donde se almacena los objetos.
  private vector: (T | null)[];

  // Cantidad de elementos actualmente almacenados en la secuencia.
  private cant: number;

  // Vector de direcciones de memoria.
  private vectorMemoria: string[];

  // Tamaño simulado de cada nodo en bytes.
  private tamanioNodo: number;

  /**
   * Constructor de la clase Secuencia.
   * @param n Tamaño (capacidad) de la secuencia.
   * @param memoriaExistente Vector de direcciones de memoria (opcional).
   * @param tamanioNodo Tamaño de cada nodo en bytes (opcional, por defecto 4).
   */
  constructor(n: number, memoriaExistente?: string[], tamanioNodo: number = 4) {
    if (n <= 0) {
      this.vector = [];
      this.vectorMemoria = [];
      this.cant = 0;
      this.tamanioNodo = 0;
      return;
    }

    this.vector = new Array<T | null>(n).fill(null);
    this.cant = 0;
    this.tamanioNodo = tamanioNodo;

    if (memoriaExistente && memoriaExistente.length === n) {
      this.vectorMemoria = [...memoriaExistente];
    } else {
      this.vectorMemoria = new Array<string>(n);
      this.inicializarDireccionesMemoria();
    }
  }

  /**
   * Método que inserta un elemento al final de la secuencia sin realizar recolocación.
   * @param elem Elemento a insertar.
   * @returns Índice en el que se insertó el elemento.
   */
  public insertar(elem: T): number {
    if (this.cant >= this.vector.length) {
      throw new DomainError(`La secuencia está llena, no hay espacio suficiente para insertar el elemento ${elem}.`, "CAPACITY_EXCEEDED");
    }
    const insertIndex = this.cant;
    this.vector[this.cant++] = elem;
    return insertIndex;
  }

  /**
   * Método que elimina el elemento en la posición especificada de la secuencia.
   * Realiza un corrimiento de los elementos a la derecha de la posición hacia la izquierda,
   * y deja la última casilla en null.
   * @param pos Índice del elemento a eliminar.
   * @returns Índice que quedó en null tras la eliminación (índice del último elemento).
   */
  public eliminarPos(pos: number): number {
    if (this.cant === 0) {
      throw new DomainError(
        "No fue posible eliminar el elemento en la posición especificada: la secuencia está vacía (tamaño actual: 0).",
        "DELETE_EMPTY"
      );
    }

    if (pos < 0 || pos >= this.cant) {
      throw new DomainError(
        `Posición inválida: se intentó acceder a la posición ${pos}, pero el rango válido es de 0 a ${this.cant - 1}, ya que su tamaño es ${this.getTamanio()}.`,
        "DELETE_OUT_OF_RANGE"
      );
    }
    const firstNullIndex = this.cant - 1;
    for (let i = pos; i < this.cant - 1; i++) {
      this.vector[i] = this.vector[i + 1];
    }
    this.vector[this.cant - 1] = null;
    this.cant--;
    return firstNullIndex;
  }

  /**
   * Método que vacía la secuencia.
   */
  public vaciar(): void {
    this.cant = 0;
    this.vector = [];
  }

  /**
   * Método que retorna el elemento en la posición indicada.
   * @param i Posición del elemento.
   * @returns El elemento indicado o null si la posición es inválida.
   */
  public get(i: number): T | null {
    if (this.cant === 0) {
      throw new DomainError("No fue posible acceder al elemento en la posición especificada: la secuencia está vacía (tamaño actual: 0), debe crear la secuencia primero.", "GET_EMPTY");
    }
    if (i < 0 || i >= this.cant) {
      throw new DomainError(`Posición inválida: se intentó acceder a la posición ${i}, pero el rango válido es de 0 a ${this.cant - 1}, ya que su tamaño es ${this.getTamanio()}.`, "GET_OUT_OF_RANGE");
    }
    return this.vector[i];
  }

  /**
   * Método que cambia el elemento en la posición indicada por otro.
   * @param i Posición a modificar.
   * @param nuevo Nuevo elemento a insertar.
   */
  public set(i: number, nuevo: T) {
    if (i < 0 || i >= this.cant) {
      throw new DomainError(
        `Posición inválida, no se puede acceder a la posición ${i} porque no está en un rango válido. Primero debe insertar el elemento ${nuevo} en la posición ${i} antes de poder modificarlo. Le recomendamos primero hacer "insertLast(${nuevo});"`,
        "SET_OUT_OF_RANGE"
      );
    }
    this.vector[i] = nuevo;
  }

  /**
   * Método que comprueba si el elemento se encuentra en la secuencia.
   * @param elem Elemento a buscar.
   * @returns true si se encuentra, false en caso contrario.
   */
  public esta(elem: T): boolean {
    return this.vector.includes(elem);
  }

  /**
   * Método que retorna el número de elementos almacenados.
   * @returns Cantidad de elementos.
   */
  public getTamanio() {
    return this.cant;
  }

  /**
   * Método que retorna el tamaño en bytes de los nodos almacenados.
   * @returns Tamaño en bytes de los nodos.
   */
  public getTamanioNodo() {
    return this.tamanioNodo;
  }

  /**
   * Método que verifica si la secuencia está vacía.
   * @returns true si está vacía.
   */
  public esVacia() {
    return this.cant === 0;
  }

  /**
   * Método que retorna la capacidad (tamaño real) del vector.
   * @returns Capacidad de la secuencia.
   */
  public getCapacidad() {
    return this.vector.length;
  }

  /**
   * Método que retorna el vector contenedor de la secuencia.
   * @returns Vector contenedor.
   */
  public getVector() {
    return this.vector;
  }

  /**
   * Método que clona la secuencia actual.
   * @returns Nueva secuencia clonada.
   */
  public clonar() {
    const secuenciaClonada = new Secuencia<T>(
      this.getCapacidad(),
      this.vectorMemoria
    );
    for (let i = 0; i < this.getTamanio(); i++) {
      secuenciaClonada.insertar(this.get(i)!);
    }
    return secuenciaClonada;
  }

  /**
   * Método que retorna la dirección de memoria de un índice dado.
   * @param i Índice del vector.
   * @returns Dirección de memoria correspondiente al índice.
   */
  public getDireccion(i: number): string | null {
    if (i < 0 || i >= this.vector.length) {
      return null;
    }
    return this.vectorMemoria[i];
  }

  /**
   * Método que retorna el vector de direcciones de memoria completo.
   * @returns Vector con las direcciones de memoria.
   */
  public getVectorMemoria(): string[] {
    return this.vectorMemoria;
  }

  /**
   * Método auxiliar que inicializa las direcciones de memoria para cada elemento del vector.
   */
  private inicializarDireccionesMemoria() {
    sequentialAddressGenerator.reset();
    const n = this.vectorMemoria.length;
    for (let i = 0; i < n; i++) {
      this.vectorMemoria[i] = sequentialAddressGenerator.generateNextAddress();
    }
  }
}
