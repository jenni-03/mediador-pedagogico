// src/shared//utils/RAM/memoria/layout.ts
// ============================================================================
// Layout de memoria: cómo mapeamos tipos a BYTES en la RAM (ByteStore)
// ----------------------------------------------------------------------------
// Este módulo NO administra stack/heap/refcounts. Solo define cómo se escriben
// y leen estructuras en RAM, cuidando alineaciones y endianness.
//
// Casos cubiertos:
// - Primitivos: boolean, byte, short, char, int, long, float, double, string*
//     *string -> puntero u32 a un header propio UTF-16: [len:u32][dataPtr:u32]
// - Arrays:
//     a) inline-prim (no-string): header [len:u32][dataPtr:u32] + bloque contiguo
//     b) strings: tabla ref32 (u32 por elemento) a headers de string
//     c) ref32 genérico: tabla de punteros a headers de objetos/strings/arrays
// - Objetos:
//     a) Compacto contiguo: [len:u32][valores en orden]. Prims inline; refs como u32.
//     b) Disperso: header + metadatos; cada valor se reserva aparte (legacy/UI).
//
// Diseño didáctico: RAM es la fuente de verdad. Lo demás (heap/stack) apunta acá.
// ============================================================================

import { ByteStore, Addr } from "./byte-store";

// ---------------------------------------------------------------------------
// Tipos y tamaños básicos
// ---------------------------------------------------------------------------
export type PrimitiveType =
  | "boolean"
  | "byte"
  | "short"
  | "char"
  | "int"
  | "long"
  | "float"
  | "double"
  | "string"; // string se representa por referencia (u32 al header)

export const SIZES: Record<PrimitiveType, number> = {
  boolean: 1,
  byte: 1,
  short: 2,
  char: 2,
  int: 4,
  long: 8,
  float: 4,
  double: 8,
  string: 4, // tamaño inline = puntero u32 al header
};

export const ALIGN: Record<PrimitiveType, number> = {
  boolean: 1,
  byte: 1,
  short: 2,
  char: 2,
  int: 4,
  float: 4,
  string: 4, // puntero u32
  long: 8,
  double: 8,
};

export function sizeOf(t: PrimitiveType) {
  return SIZES[t];
}
export function alignOf(t: PrimitiveType) {
  return ALIGN[t];
}

// ---------------------------------------------------------------------------
// Strings UTF-16 (header 8B = [len:u32][dataPtr:u32])
// ---------------------------------------------------------------------------

/** Escribe string UTF-16 como: header + data. Devuelve dirección del HEADER. */
export function allocUtf16String(
  store: ByteStore,
  s: string,
  label?: string
): Addr {
  const hdr = store.reservarAlineado(8, 4, label ? `${label}#hdr` : undefined);
  store.writeU32(hdr, s.length);

  const data = store.reservarAlineado(
    s.length * 2,
    2,
    label ? `${label}#data` : undefined
  );
  store.writeU32(hdr + 4, data);

  for (let i = 0; i < s.length; i++) {
    store.writeCharU16(data + i * 2, s.charCodeAt(i));
  }
  return hdr;
}

/** Lee una string usando la dirección de su HEADER. */
export function readUtf16String(store: ByteStore, headerAddr: Addr): string {
  const len = store.readU32(headerAddr);
  const data = store.readU32(headerAddr + 4);
  const codes: number[] = new Array(len);
  for (let i = 0; i < len; i++) codes[i] = store.readCharU16(data + i * 2);
  return String.fromCharCode(...codes);
}

// ---------------------------------------------------------------------------
// API de primitivos
// ---------------------------------------------------------------------------

/**
 * Escribe un PRIMITIVO (o puntero a string) reservando espacio nuevo.
 * - string: crea su header/data y escribe un puntero u32; devuelve la dir del puntero.
 * - otros: escribe valor en el bloque recién reservado.
 */
function writePrimitive(
  store: ByteStore,
  type: PrimitiveType,
  value: any,
  label?: string
) {
  if (type === "string") {
    const sh = allocUtf16String(
      store,
      String(value),
      label ? `${label}#str` : undefined
    );
    const addr = store.reservar(4, label);
    store.writePtr32(addr, sh);
    return { addr, size: 4 };
  }

  const sz = sizeOf(type);
  const alg = alignOf(type);
  const addr =
    alg > 1
      ? store.reservarAlineado(sz, alg, label)
      : store.reservar(sz, label);

  writePrimitiveAt(store, type, value, addr, label);
  return { addr, size: sz };
}

/**
 * Escribe un PRIMITIVO **en una dirección dada** (no reserva).
 * - string: crea header/data y guarda el puntero u32 en `addr`.
 * - otros: escribe bytes del valor en `addr`.
 */
function writePrimitiveAt(
  store: ByteStore,
  type: PrimitiveType,
  value: any,
  addr: Addr,
  label?: string
) {
  switch (type) {
    case "boolean":
      store.writeBool(addr, !!value);
      break;
    case "byte":
      store.writeU8(addr, (value | 0) & 0xff);
      break;
    case "short":
      store.writeI16(addr, value | 0);
      break;
    case "char": {
      const cu = typeof value === "string" ? value.charCodeAt(0) : value | 0;
      store.writeCharU16(addr, cu & 0xffff);
      break;
    }
    case "int":
      store.writeI32(addr, value | 0);
      break;
    case "long":
      store.writeI64(addr, BigInt(value));
      break; // signed 64
    case "float":
      store.writeF32(addr, Number(value));
      break;
    case "double":
      store.writeF64(addr, Number(value));
      break;
    case "string": {
      const sh = allocUtf16String(
        store,
        String(value),
        label ? `${label}#str` : undefined
      );
      store.writePtr32(addr, sh);
      break;
    }
  }
  return { addr, size: sizeOf(type) };
}

/** Lee un PRIMITIVO desde `addr`. Para string, sigue el puntero al header. */
function readPrimitive(store: ByteStore, type: PrimitiveType, addr: Addr): any {
  switch (type) {
    case "boolean":
      return store.readBool(addr);
    case "byte":
      return store.readU8(addr);
    case "short":
      return store.readI16(addr);
    case "char":
      return String.fromCharCode(store.readCharU16(addr));
    case "int":
      return store.readI32(addr);
    case "long":
      return store.readI64(addr); // BigInt
    case "float":
      return store.readF32(addr);
    case "double":
      return store.readF64(addr);
    case "string": {
      const sh = store.readPtr32(addr);
      return readUtf16String(store, sh);
    }
  }
}

// ---------------------------------------------------------------------------
// Arrays
// ---------------------------------------------------------------------------

/**
 * Array inline-prim (NO string):
 *  Header 8B: [len:u32][dataPtr:u32]
 *  Data: bloque contiguo de len * elemSize (alineado a alignOf(elemType)).
 */
function writeArrayInlinePrim<T>(
  store: ByteStore,
  elemType: Exclude<PrimitiveType, "string">,
  values: T[],
  label?: string
) {
  const elemSize = sizeOf(elemType);
  const elemAlign = alignOf(elemType);

  const hdr = store.reservarAlineado(
    8,
    4,
    label ? `${label}#arrHdr` : undefined
  );
  store.writeU32(hdr, values.length);

  const data =
    elemAlign > 1
      ? store.reservarAlineado(
          elemSize * values.length,
          elemAlign,
          label ? `${label}#arrData` : undefined
        )
      : store.reservar(
          elemSize * values.length,
          label ? `${label}#arrData` : undefined
        );

  store.writePtr32(hdr + 4, data);

  let cursor = data;
  for (let i = 0; i < values.length; i++) {
    writePrimitiveAt(
      store,
      elemType,
      values[i],
      cursor,
      label ? `${label}[${i}]` : undefined
    );
    cursor += elemSize;
  }
  return { addr: hdr, size: 8 + elemSize * values.length };
}

/** Lee un array inline-prim (NO string) apuntado por `addr` (header). */
function readArrayInlinePrim<T>(
  store: ByteStore,
  elemType: Exclude<PrimitiveType, "string">,
  addr: Addr
): T[] {
  const len = store.readU32(addr);
  const data = store.readPtr32(addr + 4);
  const elemSize = sizeOf(elemType);

  const out: T[] = new Array(len);
  let cursor = data;
  for (let i = 0; i < len; i++) {
    out[i] = readPrimitive(store, elemType, cursor) as T;
    cursor += elemSize;
  }
  return out;
}

/**
 * Array de strings (tabla ref32):
 *  Header 8B: [len:u32][tablePtr:u32]
 *  Tabla: len * 4 bytes, cada entrada es un puntero u32 al HEADER de cada string.
 */
function writeArrayOfStrings(
  store: ByteStore,
  values: string[],
  label?: string
) {
  const hdr = store.reservarAlineado(
    8,
    4,
    label ? `${label}#arrStrHdr` : undefined
  );
  store.writeU32(hdr, values.length);

  const table = store.reservarAlineado(
    Math.max(1, values.length) * 4,
    4,
    label ? `${label}#arrStrTab` : undefined
  );
  store.writePtr32(hdr + 4, table);

  for (let i = 0; i < values.length; i++) {
    const sh = allocUtf16String(
      store,
      String(values[i]),
      label ? `${label}[${i}]#str` : undefined
    );
    store.writePtr32(table + i * 4, sh);
  }
  return { addr: hdr, size: 8 + values.length * 4 };
}

/** Lee un array de strings desde `addr` (header de la tabla ref32). */
function readArrayOfStrings(store: ByteStore, addr: Addr): string[] {
  const len = store.readU32(addr);
  const table = store.readPtr32(addr + 4);
  const out: string[] = new Array(len);
  for (let i = 0; i < len; i++) {
    const sh = store.readPtr32(table + i * 4);
    out[i] = readUtf16String(store, sh);
  }
  return out;
}

/**
 * Array ref32 genérico:
 *  Header 8B: [len:u32][tablePtr:u32]
 *  Tabla: len * 4 bytes con punteros u32 a headers de objetos/arrays/strings.
 *  Útil para arrays de objetos o mixtos (siempre referencias).
 */
function writeArrayRef32(store: ByteStore, ptrs: Addr[], label?: string) {
  const hdr = store.reservarAlineado(
    8,
    4,
    label ? `${label}#arrRefHdr` : undefined
  );
  store.writeU32(hdr, ptrs.length);

  const table = store.reservarAlineado(
    Math.max(1, ptrs.length) * 4,
    4,
    label ? `${label}#arrRefTab` : undefined
  );
  store.writePtr32(hdr + 4, table);

  for (let i = 0; i < ptrs.length; i++) {
    store.writePtr32(table + i * 4, ptrs[i] >>> 0);
  }
  return { addr: hdr, size: 8 + ptrs.length * 4 };
}

/** Lee un array ref32 genérico devolviendo las direcciones (punteros). */
function readArrayRef32(store: ByteStore, addr: Addr): Addr[] {
  const len = store.readU32(addr);
  const table = store.readPtr32(addr + 4);
  const out: Addr[] = new Array(len);
  for (let i = 0; i < len; i++) out[i] = store.readPtr32(table + i * 4);
  return out;
}

// ---------------------------------------------------------------------------
// Objetos
// ---------------------------------------------------------------------------

/**
 * Objeto DISPERSO (legacy): header + metadatos; valores se escriben aparte.
 * Formato didáctico:
 *   [len:u32] [ (keyPtr:u32)(kind:u8) ]*  (solo metadatos contiguos)
 * Los valores los escribe quien llama (o esta función, reservándolos luego).
 * Útil para mostrar "todo por referencia".
 */
function writeObjectDispersed(
  store: ByteStore,
  props: Array<{ key: string; type: PrimitiveType; value: any }>,
  label?: string
) {
  const len = props.length;
  const hdr = store.reservarAlineado(
    4,
    4,
    label ? `${label}#objHdr` : undefined
  );
  store.writeU32(hdr, len);

  // bloque contiguo de metadatos (5 bytes por campo)
  const meta = store.reservar(5 * len, label ? `${label}#objMeta` : undefined);
  let cursor = meta;

  for (let i = 0; i < len; i++) {
    const p = props[i];
    const kptr = allocUtf16String(
      store,
      p.key,
      label ? `${label}.key${i}` : undefined
    );
    store.writePtr32(cursor, kptr); // keyPtr
    store.writeU8(cursor + 4, 0); // kind=0 (placeholder docente)
    cursor += 5;

    // valor se reserva aparte (no-inline)
    writePrimitive(
      store,
      p.type,
      p.value,
      label ? `${label}.${p.key}` : undefined
    );
  }
  return { addr: hdr, size: cursor - hdr };
}

/**
 * Objeto COMPACTO contiguo:
 *   [len:u32][ (valor_i) ]*
 * Donde cada valor_i:
 *   - si es primitivo no-string → bytes inline (alineación por campo NO se fuerza; el bloque completo se alinea a 4)
 *   - si es string               → puntero u32 al header de la string
 *   - si es "ptr32" explícito    → puntero u32 (para arrays/objetos ya construidos)
 *
 * Para soportar arrays/objetos dentro de objeto compacto, usamos un "FieldSpec":
 *   - kind:"prim", type:PrimitiveType, value:any
 *   - kind:"ptr",  ptr:Addr
 */
export type FieldSpec =
  | { kind: "prim"; key: string; type: PrimitiveType; value: any }
  | { kind: "ptr"; key: string; ptr: Addr };

function writeObjectCompact(
  store: ByteStore,
  fields: FieldSpec[],
  label?: string
) {
  const len = fields.length;

  // Calcula tamaño total de la zona de datos (strings/ptr => 4 bytes)
  const fieldSize = (f: FieldSpec) =>
    f.kind === "prim" ? (f.type === "string" ? 4 : sizeOf(f.type)) : 4;

  const total = fields.reduce((acc, f) => acc + fieldSize(f), 0);

  // Reserva UN SOLO bloque contiguo: [len:u32][data...]
  const hdr = store.reservarAlineado(
    4 + total,
    4,
    label ? `${label}#objC` : undefined
  );
  store.writeU32(hdr, len);

  // Escribe valores en orden
  let cursor = hdr + 4;
  for (let i = 0; i < len; i++) {
    const f = fields[i];
    const flabel = label ? `${label}.${f.key}` : undefined;
    if (f.kind === "prim") {
      writePrimitiveAt(store, f.type, f.value, cursor, flabel);
      cursor += fieldSize(f);
    } else {
      // puntero explícito (arrays/objetos/strings ya construidos)
      store.writePtr32(cursor, f.ptr >>> 0);
      cursor += 4;
    }
  }

  return { addr: hdr, size: 4 + total };
}

/** Lee objeto compacto a partir de un "schema" que indica los tipos inline. */
function readObjectCompact(
  store: ByteStore,
  schema: Array<{ key: string; type: PrimitiveType | "ptr32" }>,
  addr: Addr
): Record<string, unknown> {
  const len = store.readU32(addr);
  if (len !== schema.length) {
    throw new Error(
      `Schema length mismatch: obj=${len}, schema=${schema.length}`
    );
  }

  const obj: Record<string, unknown> = {};
  let cursor = addr + 4;

  for (let i = 0; i < len; i++) {
    const { key, type } = schema[i];
    if (type === "ptr32") {
      obj[key] = store.readPtr32(cursor);
      cursor += 4;
      continue;
    }
    obj[key] = readPrimitive(store, type, cursor);
    cursor += type === "string" ? 4 : sizeOf(type);
  }
  return obj;
}

// ---------------------------------------------------------------------------
// Export público
// ---------------------------------------------------------------------------

export const Layout = {
  // tamaños/alineaciones
  SIZES,
  ALIGN,
  sizeOf,
  alignOf,

  // strings
  allocUtf16String,
  readUtf16String,

  // primitivos
  writePrimitive,
  writePrimitiveAt,
  readPrimitive,

  // arrays (elegir la variante adecuada según el caso)
  writeArrayInlinePrim,
  readArrayInlinePrim,
  writeArrayOfStrings,
  readArrayOfStrings,
  writeArrayRef32,
  readArrayRef32,

  // objetos
  writeObjectDispersed, // legacy/explicativo
  writeObjectCompact, // recomendado para docencia
  readObjectCompact,
};
