import { v4 as uuidv4 } from "uuid";
import { NodoBin } from "./NodoBin";

/**
 * Clase que representa un Nodo AVL.
 */
export class NodoAVL<T> extends NodoBin<T> {

  private altura: number;

  /**
   * Constructor de la clase Nodo AVL.
   * @param info Información a almacenar en el nodo.
   * @param id Identificador único del nodo (opcional).
   */
  constructor(info: T, id?: string) {
    super(info, id ?? `node-${uuidv4()}`);
    this.altura = 1;
  }

  /**
   * Método que obtiene la información almacenada en el nodo AVL.
   * @returns Info almacenada en el nodo AVL.
   */
  public override getInfo(): T {
    return super.getInfo();
  }

  /**
   * Método que obtiene la referencia al hijo izquierdo del nodo AVL.
   * @returns Hijo izquierdo o null según corresponda.
   */
  public override getIzq(): NodoAVL<T> | null {
    return super.getIzq() as NodoAVL<T> | null;
  }

  /**
   * Método que obtiene la referencia al hijo derecho del nodo binario.
   * @returns Hijo derecho o null según corresponda.
   */
  public override getDer(): NodoAVL<T> | null {
    return super.getDer() as NodoAVL<T> | null;
  }

  /**
   * Método que obtiene el Id del nodo AVL.
   * @returns Id del nodo AVL.
   */
  public override getId(): string {
    return super.getId();
  }

  /**
   * Método que obtiene la altura del nodo AVL.
   * @returns Altura del nodo AVL.
   */
  public getAltura(): number {
    return this.altura;
  }

  /**
   * Método que cambia la información almacenada en el nodo AVL.
   * @param info Nueva info a almacenar.
   */
  public override setInfo(info: T): void {
    super.setInfo(info);
  }

  /**
   * Método que modifica la referencia al hijo izquierdo del nodo AVL.
   * @param nodo Nodo a establecer como hijo izquierdo.
   */
  public override setIzq(nodo: NodoAVL<T> | null): void {
    super.setIzq(nodo);
  }

  /**
   * Método que modifica la referencia al hijo derecho del nodo AVL.
   * @param nodo Nodo a establecer como hijo derecho.
   */
  public override setDer(nodo: NodoAVL<T> | null): void {
    super.setDer(nodo);
  }

  /**
   * Método que modifica la altura del nodo AVL.
   * @param h Nueva altura a establecer.
   */
  public setAltura(h: number): void {
    this.altura = h;
  }

  /**
   * Método estático que obtiene la altura de un nodo AVL.
   * @param nodo Nodo AVL del cual se desea obtener la altura.
   * @returns Altura del nodo AVL o 0 si es nulo.
   */
  public static altura<N>(nodo: NodoAVL<N> | null): number {
    return nodo ? nodo.getAltura() : 0;
  }

  /**
   * Método que recomputa la altura del nodo AVL.
   * @returns Nueva altura del nodo AVL.
   */
  public recomputarAltura(): number {
    this.altura = 1 + Math.max(
      NodoAVL.altura(this.getIzq()),
      NodoAVL.altura(this.getDer())
    );
    return this.altura;
  }

  /**
   * Método que obtiene el factor de balance del nodo AVL.
   * @returns Factor de balance del nodo AVL.
   */
  public getBalance(): number {
    return NodoAVL.altura(this.getIzq()) - NodoAVL.altura(this.getDer());
  }

}