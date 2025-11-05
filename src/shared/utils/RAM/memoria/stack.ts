// src/shared//utils/RAM/memoria/stack.ts
// ============================================================================
// Stack (pila de frames) para la VM de memoria
// ----------------------------------------------------------------------------
// Propósito docente: el Stack NO almacena valores; solo guarda "variables"
// con su nombre y cómo acceder a su contenido en RAM:
//
//  - Primitivos (int, double, ...):
//      Slot { kind:"prim", type, valueAddr }  -> el valor VIVE en RAM en valueAddr
//
//  - Referencias (string, array, object):
//      Slot { kind:"ref", refAddr }           -> refAddr es un puntero (u32) al header en RAM
//        * refAddr = 0 representa null
//
// Un "frame" modela un ámbito de activación (p.ej. "global", "main", una función).
// Cada frame tiene un id incremental, un nombre y un mapa de slots por nombre.
//
// Este módulo es intencionalmente "tonto": no toca RAM ni Heap; no incrementa ni
// decrementa refCounts. Eso lo hace Memory. Aquí solo manejamos estructura.
// ============================================================================

import type { Addr } from "./byte-store";
import type { PrimitiveType } from "./layout";

// ---------------------------------------------------------------------------
// Tipos de slot (discriminados)
// ---------------------------------------------------------------------------

/** Variable primitiva: el valor está por VALOR en RAM en `valueAddr`. */
export type PrimSlot = {
  name: string;
  kind: "prim";
  type: PrimitiveType;
  valueAddr: Addr; // dirección en RAM donde vive el valor primitivo
};

/** Variable de referencia: guarda un PUNTERO (u32) al header en el heap/RAM. */
export type RefSlot = {
  name: string;
  kind: "ref";
  refAddr: Addr; // 0 => null
};

/** Unión discriminada para cualquier variable del stack. */
export type Slot = PrimSlot | RefSlot;

/** Type guards útiles para el runtime/Memory/UI. */
export const isPrimSlot = (s: Slot): s is PrimSlot => s.kind === "prim";
export const isRefSlot = (s: Slot): s is RefSlot => s.kind === "ref";

// ---------------------------------------------------------------------------
// Frame (ámbito de activación)
// ---------------------------------------------------------------------------

export class Frame {
  /**
   * @param id   Identificador incremental del frame (1..N)
   * @param name Nombre del frame (ej: "global", "main", "foo()")
   * @param slots Mapa (por nombre) de variables locales (slots)
   */
  constructor(
    public id: number,
    public name: string,
    public slots: Map<string, Slot> = new Map()
  ) {}

  /** Busca una variable por nombre SOLO en este frame. */
  find(name: string): Slot | undefined {
    return this.slots.get(name);
  }

  /**
   * Declara una variable NUEVA en el frame.
   * Lanza error si ya existe una con el mismo nombre (regla estilo Java).
   */
  declare(slot: Slot): void {
    if (this.slots.has(slot.name)) {
      throw new Error(`Variable ya declarada en este frame: "${slot.name}"`);
    }
    this.slots.set(slot.name, slot);
  }

  /**
   * Inserta o actualiza (upsert) una variable en el frame, sin validar existencia previa.
   * Útil para comportamientos legacy o reasignaciones donde el nombre debe mantenerse.
   */
  upsert(slot: Slot): void {
    this.slots.set(slot.name, slot);
  }

  /** Elimina una variable del frame (si existe). */
  delete(name: string): boolean {
    return this.slots.delete(name);
  }

  /** Devuelve una copia simple (plain) del contenido del frame (útil para snapshot/UI). */
  toPlain(): { id: number; name: string; slots: Slot[] } {
    return {
      id: this.id,
      name: this.name,
      slots: Array.from(this.slots.values()).map((s) => ({ ...s })),
    };
  }
}

// ---------------------------------------------------------------------------
// Stack (pila de frames)
// ---------------------------------------------------------------------------

export class Stack {
  private frames: Frame[] = [];
  private nextId = 0;

  /** Crea un nuevo frame arriba de la pila y lo retorna. */
  push(name: string): Frame {
    const f = new Frame(++this.nextId, name);
    this.frames.push(f);
    return f;
  }

  /**
   * Quita el frame superior y lo retorna (o undefined si está vacío).
   * Nota: NO maneja refCounts ni heap; eso es responsabilidad de Memory.
   */
  pop(): Frame | undefined {
    return this.frames.pop();
  }

  /** Retorna el frame superior (sin quitarlo). */
  top(): Frame | undefined {
    return this.frames[this.frames.length - 1];
  }

  /** Retorna la lista de frames en orden de creación (de abajo hacia arriba). */
  all(): Frame[] {
    return this.frames;
  }

  /** Profundidad actual de la pila (número de frames). */
  depth(): number {
    return this.frames.length;
  }

  /** ¿La pila está vacía? */
  isEmpty(): boolean {
    return this.frames.length === 0;
  }

  // -------------------------------------------------------------------------
  // Utilidades de resolución / snapshot
  // -------------------------------------------------------------------------

  /**
   * Busca una variable por nombre recorriendo la pila desde el frame superior
   * hacia abajo (sombras/ocultamientos respetados).
   */
  resolve(name: string): Slot | undefined {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const s = this.frames[i].find(name);
      if (s) return s;
    }
    return undefined;
  }

  /**
   * Inserta/actualiza un slot en el frame superior. Lanza si no hay frame.
   * Útil para flujos donde ya decidiste el tipo/kind y solo quieres reflejarlo.
   */
  upsertTop(slot: Slot): void {
    const top = this.top();
    if (!top) throw new Error("No hay frame activo para upsert");
    top.upsert(slot);
  }

  /**
   * Declara una variable nueva en el frame superior.
   * Lanza si no hay frame o si el nombre ya existe en ese frame.
   */
  declareTop(slot: Slot): void {
    const top = this.top();
    if (!top) throw new Error("No hay frame activo para declare");
    top.declare(slot);
  }

  /** Elimina una variable del frame superior si existe. */
  deleteTop(name: string): boolean {
    const top = this.top();
    if (!top) return false;
    return top.delete(name);
  }

  /** Snapshot simple de la pila (estructura plain, sin Map). */
  toPlain(): Array<{ id: number; name: string; slots: Slot[] }> {
    return this.frames.map((f) => f.toPlain());
  }
}
