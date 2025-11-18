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

// Nota: mantenemos ALIGN para arrays/objetos, pero
// los PRIMITIVOS ya no se alinean individualmente en RAM.
// Esto evita “huecos” entre int, long, etc. para estudiantes novatos.
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

/**
 * Escribe string UTF-16 como: header + data. Devuelve dirección del HEADER.
 * Fix: strings vacías reservan un bloque “sentinela” de 2 bytes para evitar n=0.
 */
export function allocUtf16String(
  store: ByteStore,
  s: string,
  label?: string
): Addr {
const hdr = store.reservar(8, label ? `${label}#hdr` : undefined);
  const len = s.length;
  store.writeU32(hdr, len);

  const dataBytes = Math.max(1, len) * 2; // evita alloc(0)
const data = store.reservar(
  dataBytes,
  label ? `${label}#data` : undefined
);
  store.writeU32(hdr + 4, data);

  for (let i = 0; i < len; i++) {
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
 *
 * Simplificación docente: los primitivos se reservan SIN alineación especial
 * para que queden pegados (int, luego long, etc.) sin padding visible.
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
  // ⬇ Antes usábamos alignOf + reservarAlineado. Ahora siempre es contiguo.
  const addr = store.reservar(sz, label);

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
    case "boolean": {
      store.writeBool(addr, !!value);
      break;
    }

    case "byte": {
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        throw new RangeError(
          `byte solo admite enteros en 0..255 (recibido: ${value}).`
        );
      }
      if (n < 0 || n > 255) {
        throw new RangeError(`Valor ${n} fuera de rango para byte (0..255).`);
      }
      store.writeU8(addr, n);
      break;
    }

    case "short": {
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        throw new RangeError(
          `short solo admite enteros en -32768..32767 (recibido: ${value}).`
        );
      }
      if (n < -32768 || n > 32767) {
        throw new RangeError(
          `Valor ${n} fuera de rango para short (-32768..32767).`
        );
      }
      store.writeI16(addr, n);
      break;
    }

    case "char": {
      const cu =
        typeof value === "string" ? value.charCodeAt(0) : Number(value);
      if (!Number.isFinite(cu) || !Number.isInteger(cu)) {
        throw new RangeError(
          `char solo admite un carácter o un entero en 0..65535 (recibido: ${value}).`
        );
      }
      if (cu < 0 || cu > 0xffff) {
        throw new RangeError(
          `Valor ${cu} fuera de rango para char (0..65535).`
        );
      }
      store.writeCharU16(addr, cu & 0xffff);
      break;
    }

    case "int": {
      const n = Number(value);
      if (!Number.isFinite(n) || !Number.isInteger(n)) {
        throw new RangeError(
          `int solo admite enteros en -2147483648..2147483647 (recibido: ${value}).`
        );
      }
      if (n < -2147483648 || n > 2147483647) {
        throw new RangeError(
          `Valor ${n} fuera de rango para int (-2147483648..2147483647).`
        );
      }
      store.writeI32(addr, n);
      break;
    }

    case "long": {
      let big: bigint;
      try {
        big = typeof value === "bigint" ? value : BigInt(value);
      } catch {
        throw new RangeError(
          `Valor ${value} no es válido para long (usa enteros sin punto).`
        );
      }
      const MIN = -(1n << 63n);
      const MAX = (1n << 63n) - 1n;
      if (big < MIN || big > MAX) {
        throw new RangeError(
          `Valor ${value} fuera de rango para long (-2^63 .. 2^63-1).`
        );
      }
      store.writeI64(addr, big);
      break;
    }

    case "float": {
      // Para float/double dejamos que IEEE haga lo suyo (NaN/∞).
      store.writeF32(addr, Number(value));
      break;
    }

    case "double": {
      store.writeF64(addr, Number(value));
      break;
    }

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
 * Fix: si len=0, se reserva un bloque sentinela mínimo para no llamar alloc(0).
 */
function writeArrayInlinePrim<T>(
  store: ByteStore,
  elemType: Exclude<PrimitiveType, "string">,
  values: T[],
  label?: string
) {
  const elemSize = sizeOf(elemType);
  const elemAlign = alignOf(elemType);

const hdr = store.reservar(8, label ? `${label}#arrHdr` : undefined);
  store.writeU32(hdr, values.length);

  const dataBytes = Math.max(1, values.length) * elemSize; // evita alloc(0)
  const data =
    elemAlign > 1
      ? store.reservarAlineado(
          dataBytes,
          elemAlign,
          label ? `${label}#arrData` : undefined
        )
      : store.reservar(dataBytes, label ? `${label}#arrData` : undefined);

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
  return { addr: hdr, size: 8 + values.length * elemSize };
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
 * Fix: usa Math.max(1, len) para evitar alloc(0) cuando len=0.
 */
function writeArrayOfStrings(
  store: ByteStore,
  values: string[],
  label?: string
) {
const hdr = store.reservar(8, label ? `${label}#arrStrHdr` : undefined);
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
 * Fix: usa Math.max(1, len) para evitar alloc(0).
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
// API de RESERVA (sin escribir datos) — para “ocupado pero no tocado”
// ---------------------------------------------------------------------------

/** Reserva un bloque para un primitivo y NO escribe su valor (solo marca ocupado).
 *  Simplificación docente: sin alineación, para que los primitivos queden contiguos.
 */
export function allocPrimitiveReserve(
  store: ByteStore,
  type: PrimitiveType,
  label?: string
) {
  const sz = sizeOf(type);
  // ⬇ Antes usábamos alignOf + reservarAlineado; ahora solo reservar.
  const addr = store.reservar(sz, label ?? `prim#reserve`);
  return { addr, size: sz };
}

/**
 * Reserva header + bloque de datos para array inline-prim y NO escribe los datos.
 * Se escribe únicamente el header [len][dataPtr] para que la UI/Heap tengan meta.
 * Fix: para len=0, reserva bloque sentinela mínimo.
 */
export function allocArrayInlinePrimReserve(
  store: ByteStore,
  elem: Exclude<PrimitiveType, "string">,
  length: number,
  label?: string
) {
  const elemSize = sizeOf(elem);
  const elemAlign = alignOf(elem);

  const hdr = store.reservarAlineado(8, 4, (label ?? "arr#inline") + " hdr");
  const dataBytes = Math.max(1, length) * elemSize; // evita alloc(0)
  const dataPtr =
    elemAlign > 1
      ? store.reservarAlineado(
          dataBytes,
          elemAlign,
          (label ?? "arr#inline") + " data"
        )
      : store.reservar(dataBytes, (label ?? "arr#inline") + " data");

  store.writeU32(hdr + 0, length);
  store.writeU32(hdr + 4, dataPtr);

  return { addr: hdr, dataPtr, length, elemSize };
}

/**
 * Reserva header + tabla u32 para array ref32 y NO escribe la tabla.
 * Para len=0, reserva una celda sentinela de 4 bytes.
 */
export function allocArrayRef32Reserve(
  store: ByteStore,
  length: number,
  label?: string
) {
  const hdr = store.reservarAlineado(8, 4, (label ?? "arr#ref32") + " hdr");
  const tablePtr = store.reservarAlineado(
    Math.max(1, length) * 4,
    4,
    (label ?? "arr#ref32") + " table"
  );
  store.writeU32(hdr + 0, length);
  store.writeU32(hdr + 4, tablePtr);
  return { addr: hdr, tablePtr, length };
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

  // reservas sin escritura (nuevo)
  allocPrimitiveReserve,
  allocArrayInlinePrimReserve,
  allocArrayRef32Reserve,
};
