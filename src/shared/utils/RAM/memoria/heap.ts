// src/shared//utils/RAM/memoria/heap.ts
// ============================================================================
// Heap: tabla de objetos compuestos en memoria (strings, arrays, objetos)
// ----------------------------------------------------------------------------
// Rol docente:
//  - El Heap NO guarda bytes; eso es trabajo de ByteStore (RAM).
//  - Aquí registramos "nodos" compuestos en RAM (su dirección de header),
//    su tipo lógico (kind/meta) y un refCount.
//  - refAddr (punteros u32) que viven en el Stack apuntan a estas direcciones.
//
// Principios:
//  - Strings / Arrays / Objetos tienen un HEADER en RAM (Addr).
//  - El Heap guarda ese Addr como clave y metadatos suficientes para la UI.
//  - refCount: cuántas referencias (punteros) apuntan al nodo.
//    * add() arranca con refCount = 1
//    * inc() / dec()
//    * al llegar a 0, se elimina la entrada (simulando GC por conteo simple)
//
// Meta tipada (unión discriminada):
//  - "string"
//  - "array-inline-prim"
//  - "array-ref32"
//  - "object-compact"
//  - "object-dispersed"
// ============================================================================

import type { Addr } from "./byte-store";
import type { PrimitiveType } from "./layout";
import type { MemType } from "./memtype";

// ---------------------------------------------------------------------------
// Esquemas y metadatos tipados
// ---------------------------------------------------------------------------

/** Para objeto compacto: tipos inline (PrimitiveType) y referencias explícitas como "ptr32". */
export type CompactFieldType = PrimitiveType | "ptr32";

/** Schema para lectura de objeto compacto (orden fijo, como fue escrito). */
export type ObjectCompactSchema = Array<{
  key: string;
  type: CompactFieldType;
}>;

/** Compatibilidad: object schema legacy — puede traer PrimitiveType o MemType recursivo. */
export type ObjectSchema = Array<{
  key: string;
  type: MemType | PrimitiveType;
}>;

/** Almacenamientos de arrays soportados (docente). */
export type ArrayStorageMode = "inline-prim" | "ref32";

/** String UTF-16 con header [len:u32][dataPtr:u32] en RAM. */
export type StringMeta = {
  tag: "string";
  length: number;
  dataPtr: Addr;
};

/** Array inline-prim: header [len:u32][dataPtr:u32] + bloque contiguo de primitivos (no string). */
export type ArrayInlinePrimMeta = {
  tag: "array-inline-prim";
  length: number;
  dataPtr: Addr; // inicio del bloque contiguo
  elemType: Exclude<PrimitiveType, "string">;
  elemSize: number; // tamaño del elemento (bytes)
};

/** Array ref32: header [len:u32][tablePtr:u32] + tabla u32 de punteros a headers. */
export type ArrayRef32Meta = {
  tag: "array-ref32";
  length: number;
  dataPtr: Addr; // inicio de la tabla u32 (punteros)
  elem: MemType; // tipo recursivo del elemento (objeto/array/string/prim – aunque prim aquí no se recomienda)
};

/** Objeto compacto: bloque contiguo [len:u32][valores...] (prims inline, refs como u32). */
export type ObjectCompactMeta = {
  tag: "object-compact";
  schema: ObjectCompactSchema; // describe cómo leer cada campo inline o como ptr32
  memType?: MemType; // opcional: MemType recursivo original (doc/inspección)
};

/** Objeto disperso (legacy/explicativo): header + meta; valores reservados aparte. */
export type ObjectDispersedMeta = {
  tag: "object-dispersed";
  schema: ObjectSchema; // puede contener PrimitiveType o MemType
  memType?: MemType; // opcional
};

/** Unión discriminada de todos los metadatos posibles. */
export type HeapMeta =
  | StringMeta
  | ArrayInlinePrimMeta
  | ArrayRef32Meta
  | ObjectCompactMeta
  | ObjectDispersedMeta;

/** Clases de entrada del heap (coinciden con alto nivel). */
export type HeapKind = "string" | "array" | "object";

/** Entrada del heap: nodo compuesto registrado. */
export interface HeapEntry {
  addr: Addr; // dirección del HEADER en RAM (clave del nodo)
  kind: HeapKind; // clase general (string/array/object) — útil para agrupar en UI
  refCount: number; // conteo de referencias (punteros vivos)
  label?: string; // etiqueta opcional (debug/UI)
  meta: HeapMeta; // metadatos discriminados (exactamente un tag)
}

// ---------------------------------------------------------------------------
// Heap (implementación)
// ---------------------------------------------------------------------------

export class Heap {
  private entries = new Map<Addr, HeapEntry>();

  // ------------------------------- Consulta --------------------------------

  /** ¿Existe un nodo en `addr`? */
  has(addr: Addr): boolean {
    return this.entries.has(addr);
  }

  /** Obtiene la entrada completa (o undefined). */
  get(addr: Addr): HeapEntry | undefined {
    return this.entries.get(addr);
  }

  /** RefCount actual (o 0 si no existe). */
  refCountOf(addr: Addr): number {
    return this.entries.get(addr)?.refCount ?? 0;
  }

  /** Lista todas las entradas (ordenadas por dirección ascendentemente para UI). */
  list(): HeapEntry[] {
    return Array.from(this.entries.values()).sort((a, b) => a.addr - b.addr);
  }

  // ------------------------------- Mutación --------------------------------

  /**
   * Registra una entrada con refCount = 1.
   * Si ya existía, la reemplaza (útil cuando reconstruyes un nodo desde cero).
   */
  add(addr: Addr, kind: HeapKind, meta: HeapMeta, label?: string): void {
    this.entries.set(addr, { addr, kind, meta, refCount: 1, label });
  }

  /** Incrementa refCount si la entrada existe. (No lanza si no existe). */
  inc(addr: Addr): number {
    const e = this.entries.get(addr);
    if (e) e.refCount++;
    return e?.refCount ?? 0;
  }

  /**
   * Decrementa refCount. Si llega a 0, elimina la entrada.
   * Devuelve el refCount resultante (0 si fue borrada o si no existía).
   */
  dec(addr: Addr): number {
    const e = this.entries.get(addr);
    if (!e) return 0;
    e.refCount--;
    if (e.refCount <= 0) {
      this.entries.delete(addr);
      return 0;
    }
    return e.refCount;
  }

  /** Cambia/establece la etiqueta de una entrada (si existe). */
  setLabel(addr: Addr, label?: string): void {
    const e = this.entries.get(addr);
    if (e) e.label = label;
  }

  /**
   * Actualiza metadatos parcialmente.
   * - Requiere que el `tag` sea el MISMO (no permite cambiar de variante).
   * - Propaga los campos del `patch` encima del meta actual.
   */
  patchMeta(
    addr: Addr,
    patch: Partial<HeapMeta> & { tag: HeapMeta["tag"] }
  ): void {
    const e = this.entries.get(addr);
    if (!e) return;
    if (!e.meta || e.meta.tag !== patch.tag) {
      // No cambiamos de variante para evitar estados inválidos.
      return;
    }
    e.meta = { ...e.meta, ...patch } as HeapMeta;
  }

  /** Elimina la entrada sin tocar refCounts de otros (útil en resets/tests). */
  delete(addr: Addr): boolean {
    return this.entries.delete(addr);
  }

  /** Limpia todo el heap (útil para reiniciar la VM). */
  clear(): void {
    this.entries.clear();
  }

  // -------------------------- Helpers especializados ------------------------

  /** Registra una string UTF-16. */
  addString(
    addr: Addr,
    params: { length: number; dataPtr: Addr },
    label?: string
  ): void {
    this.add(addr, "string", { tag: "string", ...params }, label);
  }

  /** Registra un array inline de primitivos NO-string. */
  addArrayInlinePrim(
    addr: Addr,
    params: {
      length: number;
      dataPtr: Addr;
      elemType: Exclude<PrimitiveType, "string">;
      elemSize: number;
    },
    label?: string
  ): void {
    this.add(addr, "array", { tag: "array-inline-prim", ...params }, label);
  }

  /** Registra un array ref32 (punteros u32 a elementos compuestos). */
  addArrayRef32(
    addr: Addr,
    params: { length: number; dataPtr: Addr; elem: MemType },
    label?: string
  ): void {
    this.add(addr, "array", { tag: "array-ref32", ...params }, label);
  }

  /** Registra un objeto compacto contiguo. */
  addObjectCompact(
    addr: Addr,
    params: { schema: ObjectCompactSchema; memType?: MemType },
    label?: string
  ): void {
    this.add(addr, "object", { tag: "object-compact", ...params }, label);
  }

  /** Registra un objeto disperso (legacy/explicativo). */
  addObjectDispersed(
    addr: Addr,
    params: { schema: ObjectSchema; memType?: MemType },
    label?: string
  ): void {
    this.add(addr, "object", { tag: "object-dispersed", ...params }, label);
  }
}
