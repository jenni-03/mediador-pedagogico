// src/shared/utils/nodes/NodoAVL.ts
// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";
import { NodoBin } from "./NodoBin";

/**
 * Nodo AVL que extiende NodoBin y agrega la propiedad 'altura'.
 * - Altura por defecto: 1 (una hoja tiene altura 1 en esta convención).
 * - Provee helpers tipados getIzqAVL/getDerAVL y setIzqAVL/setDerAVL.
 */
export class NodoAVL<T> extends NodoBin<T> {
  private altura: number;

  /**
   * @param info  Información a almacenar en el nodo.
   * @param id    Identificador único del nodo (opcional).
   */
  constructor(info: T, id?: string) {
    super(info, id ?? `node-${uuidv4()}`);
    this.altura = 1;
  }

  /** Obtiene la altura del nodo. */
  public getAltura(): number {
    return this.altura;
  }

  /** Asigna la altura del nodo. */
  public setAltura(h: number): void {
    this.altura = h;
  }

  /**
   * Helpers tipados para trabajar con hijos como NodoAVL sin castings externos.
   * Nota: los métodos heredados getIzq/getDer siguen existiendo y retornan NodoBin<T> | null.
   */
  public getIzqAVL(): NodoAVL<T> | null {
    const n = this.getIzq();
    return n instanceof NodoAVL ? n : (n as unknown as NodoAVL<T> | null);
  }

  public getDerAVL(): NodoAVL<T> | null {
    const n = this.getDer();
    return n instanceof NodoAVL ? n : (n as unknown as NodoAVL<T> | null);
  }

  /** Setters tipados (aceptan NodoAVL o null). */
  public setIzqAVL(nodo: NodoAVL<T> | null): void {
    super.setIzq(nodo);
  }

  public setDerAVL(nodo: NodoAVL<T> | null): void {
    super.setDer(nodo);
  }

  /**
   * Factor de balance (útil para tooltips/depuración):
   * bf(n) = altura(izq) - altura(der).
   */
  public getBalance(): number {
    const li = this.getIzq() as NodoAVL<T> | null;
    const ld = this.getDer() as NodoAVL<T> | null;
    const hi = li ? li.getAltura() : 0;
    const hd = ld ? ld.getAltura() : 0;
    return hi - hd;
  }

  /** Type guard para distinguir en tiempo de ejecución. */
  public static esAVL<N>(n: NodoBin<N> | null): n is NodoAVL<N> {
    return n instanceof NodoAVL;
  }
}
