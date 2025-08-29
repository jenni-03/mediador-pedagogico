// src/shared/utils/nodes/NodoRB.ts
// Inspirado de Proyecto SEED - https://project-seed-ufps.vercel.app/

import { v4 as uuidv4 } from "uuid";
import { NodoBin } from "./NodoBin";

/** Colores admitidos por el árbol Roji-Negro */
export type RBColor = "RED" | "BLACK";

/**
 * Nodo Roji-Negro.
 * - Extiende NodoBin (id, info, izq/der) y añade:
 *   • color (RED/BLACK)
 *   • puntero a padre
 * - Incluye helpers tipados para hijos (get/setIzqRB/DerRB) y
 *   helpers de color (isRed/isBlack/setRed/setBlack).
 */
export class NodoRB<T> extends NodoBin<T> {
  private color: RBColor;
  private padre: NodoRB<T> | null;

  /**
   * @param info  Información del nodo
   * @param id    Id único (opcional)
   * @param color Color inicial (por convención, los nuevos se crean ROJOS)
   */
  constructor(info: T, id?: string, color: RBColor = "RED") {
    super(info, id ?? `node-${uuidv4()}`);
    this.color = color;
    this.padre = null;
  }

  /* ───────────── Color ───────────── */

  public getColor(): RBColor {
    return this.color;
  }

  public setColor(c: RBColor): void {
    this.color = c;
  }

  public isRed(): boolean {
    return this.color === "RED";
  }

  public isBlack(): boolean {
    return this.color === "BLACK";
  }

  public setRed(): void {
    this.color = "RED";
  }

  public setBlack(): void {
    this.color = "BLACK";
  }

  /* ───────────── Padre ───────────── */

  public getPadre(): NodoRB<T> | null {
    return this.padre;
  }

  public setPadre(p: NodoRB<T> | null): void {
    this.padre = p;
  }

  /* ───────── Helpers tipados para hijos (RB) ───────── */

  public getIzqRB(): NodoRB<T> | null {
    const n = this.getIzq();
    return n instanceof NodoRB ? n : (n as unknown as NodoRB<T> | null);
  }

  public getDerRB(): NodoRB<T> | null {
    const n = this.getDer();
    return n instanceof NodoRB ? n : (n as unknown as NodoRB<T> | null);
  }

  /**
   * Setters tipados que además actualizan el padre del hijo (si no es null).
   * Nota: La lógica del árbol (rotaciones/transplantes) puede volver a fijar
   * el padre explícitamente; esto es idempotente y no causa problemas.
   */
  public setIzqRB(hijo: NodoRB<T> | null): void {
    super.setIzq(hijo);
    if (hijo) hijo.setPadre(this);
  }

  public setDerRB(hijo: NodoRB<T> | null): void {
    super.setDer(hijo);
    if (hijo) hijo.setPadre(this);
  }

  /* ───────── Type guard ───────── */

  public static esRB<N>(n: NodoBin<N> | null): n is NodoRB<N> {
    return n instanceof NodoRB;
  }
}
