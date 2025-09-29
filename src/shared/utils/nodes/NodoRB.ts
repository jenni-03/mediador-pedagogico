import { v4 as uuidv4 } from "uuid";
import { NodoBin } from "./NodoBin";
import { RBColor } from "../../../types";

/**
 * Clase que representa un Nodo Rojo-Negro.
 */
export class NodoRB<T> extends NodoBin<T> {

  private color: RBColor;

  private padre: NodoRB<T> | null;

  /**
   * Constructor de la clase Nodo Rojo-Negro.
   * @param info Información a almacenar en el nodo.
   * @param color Color inicial (por convención, los nuevos se crean ROJOS)
   * @param id Identificador único del nodo (opcional).
   */
  constructor(info: T, color: RBColor = "RED", id?: string) {
    super(info, id ?? `node-${uuidv4()}`);
    this.color = color;
    this.padre = null;
  }

  /**
   * Método que obtiene la información almacenada en el nodo Rojo-Negro.
   * @returns Info almacenada en el nodo Rojo-Negro.
   */
  public override getInfo(): T {
    return super.getInfo();
  }

  /**
   * Método que obtiene la referencia al hijo izquierdo del nodo Rojo-Negro.
   * @returns Hijo izquierdo o null según corresponda.
   */
  public override getIzq(): NodoRB<T> | null {
    return super.getIzq() as NodoRB<T> | null;
  }

  /**
   * Método que obtiene la referencia al hijo derecho del nodo Rojo-Negro.
   * @returns Hijo derecho o null según corresponda.
   */
  public override getDer(): NodoRB<T> | null {
    return super.getDer() as NodoRB<T> | null;
  }

  /**
   * Método que obtiene el Id del nodo Rojo-Negro.
   * @returns Id del nodo Rojo-Negro.
   */
  public override getId(): string {
    return super.getId();
  }

  /**
   * Método que obtiene el color del nodo Rojo-Negro.
   * @returns Color del nodo.
   */
  public getColor(): RBColor {
    return this.color;
  }

  /**
   * Método que obtiene el padre del nodo Rojo-Negro.
   * @returns Padre del nodo o null si no tiene.
   */
  public getPadre(): NodoRB<T> | null {
    return this.padre;
  }

  /**
   * Método que modifica la información almacenada en el nodo Rojo-Negro.
   * @param info Nueva info a almacenar.
   */
  public override setInfo(info: T): void {
    super.setInfo(info);
  }

  /**
   * Método que modifica la referencia al hijo izquierdo del nodo Rojo-Negro.
   * @param nodo Nodo a establecer como hijo izquierdo.
   */
  public override setIzq(nodo: NodoRB<T> | null): void {
    super.setIzq(nodo);
  }

  /**
   * Método que modifica la referencia al hijo derecho del nodo Rojo-Negro.
   * @param nodo Nodo a establecer como hijo derecho.
   */
  public override setDer(nodo: NodoRB<T> | null): void {
    super.setDer(nodo);
  }

  /**
   * Método que modifica el color del nodo Rojo-Negro.
   * @param c Nuevo color del nodo.
   */
  public setColor(c: RBColor): void {
    this.color = c;
  }

  /**
   * Método que modifica el padre del nodo Rojo-Negro.
   * @param padre Nuevo padre del nodo.
   */
  public setPadre(padre: NodoRB<T> | null): void {
    this.padre = padre;
  }

}