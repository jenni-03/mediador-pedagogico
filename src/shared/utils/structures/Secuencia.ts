// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

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

  // Tamaño simulado de cada nodo en bytes
  private tamanioNodo: number;

  /**
   * Constructor de la clase Secuencia.
   * @param n Tamaño (capacidad) de la secuencia.
   * @param memoriaExistente Vector de direcciones de memoria (opcional).
   * @param tamanioNodo Tamaño de cada nodo en bytes (opcional, por defecto 4)
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
   * Método que inserta un nuevo elemento a la secuencia.
   * @param elem Elemento a insertar.
   */
  public insertar(elem: T) {
    if (this.cant >= this.vector.length) {
      throw new Error(
        `No hay espacio para insertar el elemento ${elem}, debe crear la secuencia primero.`
      );
    }
    this.vector[this.cant++] = elem;
  }

  /**
   * Método que elimina un elemento a la secuencia dada su posición.
   * @param pos Posición del elemento a eliminar.
   */
  public eliminarPos(pos: number) {
    if (this.cant === 0) {
      throw new Error(
        "No fue posible eliminar el elemento en la posición especificada: la secuencia está vacía (tamaño actual: 0)."
      );
    }

    if (pos < 0 || pos >= this.cant) {
      throw new Error(
        `Posición inválida: se intentó acceder a la posición ${pos}, pero el rango válido es de 0 a ${this.cant - 1}, ya que su tamaño es ${this.getTamanio()}.`
      );
    }
    for (let i = pos; i < this.cant - 1; i++) {
      this.vector[i] = this.vector[i + 1];
    }
    this.vector[this.cant - 1] = null;
    this.cant--;
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
      throw new Error(
        "No fue posible acceder al elemento en la posición especificada: la secuencia está vacía (tamaño actual: 0), debe crear la secuencia primero."
      );
    }
    if (i < 0 || i >= this.cant) {
      throw new Error(
        `Posición inválida: se intentó acceder a la posición ${i}, pero el rango válido es de 0 a ${this.cant - 1}, ya que su tamaño es ${this.getTamanio()}.`
      );
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
      throw new Error(
        `Posición inválida, no se puede acceder a la posición ${i} porque no está en un rango válido. Primero debe insertar el elemento ${nuevo} en la posición ${i} antes de poder modificarlo. Le recomendamos primero hacer "insertLast(${nuevo});"`
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
    if (this.vector.includes(elem)) {
      return true;
    }
    throw new Error(`El elemento ${elem} no se encontró en la secuencia.`);
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
