// src/shared/utils/RAM/memoria/byte-store.ts
// ============================================================================
// ByteStore: "RAM didáctica"
// ----------------------------------------------------------------------------
// La RAM es un gran arreglo de bytes (Uint8Array). Cada celda tiene una
// dirección: 0, 1, 2, 3, ...
//
// - "Reservar" (alloc) aparta N bytes contiguos y devuelve la dirección inicial.
// - "Alineado" (allocAligned) garantiza que el bloque comience en dirección
//   múltiplo de 2/4/8... (útil para int32, double, etc.).
// - Lecturas/escrituras usan LITTLE-ENDIAN (byte bajo primero).
//
// Regla docente que reforzamos en TODO el proyecto:
//   - Primitivos → se escriben por VALOR directamente en RAM.
//   - Objetos/arrays/strings → se ubican en el HEAP y el stack guarda una
//     REFERENCIA (puntero u32) al header en RAM.
//
// RAM es la "fuente de verdad": la UI solo pinta lo que hay aquí.
// ============================================================================

import { MemoryBoundsError, OutOfMemoryError } from "./errors";

export type Addr = number; // Dirección en RAM (índice dentro del Uint8Array)
export type Size = number; // Cantidad de bytes

export interface Allocation {
  addr: Addr; // Dirección donde comienza la reserva
  size: Size; // Tamaño del bloque reservado (en bytes)
  label?: string; // Etiqueta opcional para la UI (ej: "obj#hdr", "arr#data")
}

/** Fila cruda para volcado de memoria (ideal para snapshot/UI). */
export interface DumpRow {
  addr: number; // dirección de inicio de la fila (típicamente múltiplo de 16)
  bytes: number[]; // hasta 16 bytes (0..255)
  labels?: string[]; // etiquetas que comienzan EXACTAMENTE en 'addr'
  allocations?: Array<{ at: number; size: number; label?: string }>;
}

/**
 * ByteStore: RAM cruda con un bump allocator (monotónico, sin `free`).
 * - Ofrece métodos seguros de lectura/escritura (valida rangos).
 * - Mantiene historial de reservas con etiquetas para facilitar la visualización.
 * - Expone dumps crudos para snapshots y un dump "legacy" en hex.
 */
export class ByteStore {
  /** RAM cruda. */
  private mem: Uint8Array;

  /** Visor de datos tipados sobre el mismo buffer (para enteros de 16/32/64 bits y floats). */
  private dv: DataView;

  /** Puntero de "cima" del bump allocator: siguiente byte libre. */
  private bump: Addr = 0;

  /** Etiquetas por dirección (para UI/depuración). */
  private labels = new Map<Addr, string>();

  /** Historial de reservas (addr, size, label). */
  private allocs: Allocation[] = [];

  /**
   * @param sizeBytes Tamaño total de la RAM en bytes (por defecto 64 KiB).
   */
  constructor(sizeBytes: number = 1024 * 64) {
    if (sizeBytes <= 0) throw new Error("ByteStore size must be > 0");
    this.mem = new Uint8Array(sizeBytes);
    this.dv = new DataView(this.mem.buffer);
  }

  // --------------------------------------------------------------------------
  // Información general
  // --------------------------------------------------------------------------

  /** Capacidad total de la RAM (en bytes). */
  capacity(): number {
    return this.mem.length;
  }

  /** Bytes utilizados (desde 0 hasta `bump`). */
  used(): number {
    return this.bump;
  }

  // Alias en español (opcionales):
  capacidad(): number {
    return this.capacity();
  }
  usados(): number {
    return this.used();
  }

  // --------------------------------------------------------------------------
  // Reserva de memoria (bump allocator)
  // --------------------------------------------------------------------------

  /** Registra internamente una reserva para fines de UI/depuración. */
  private recordAlloc(addr: Addr, size: Size, label?: string) {
    this.allocs.push({ addr, size, label });
    if (label) this.labels.set(addr, label);
  }

  /**
   * Redondea hacia arriba a múltiplos de `alignment`.
   * Funciona para cualquier entero > 0 (potencia de 2 o no).
   */
  private alignUp(x: number, alignment: number): number {
    if (alignment <= 1) return x;
    // Si es potencia de 2 → hacer bitmask (rápido)
    if ((alignment & (alignment - 1)) === 0) {
      return (x + (alignment - 1)) & ~(alignment - 1);
    }
    // Caso general → ceil al múltiplo
    return Math.ceil(x / alignment) * alignment;
  }

  /**
   * Reserva N bytes contiguos y devuelve la dirección inicial.
   * @throws OutOfMemoryError si no hay espacio suficiente.
   */
  alloc(n: Size, label?: string): Addr {
    if (n <= 0) throw new Error("Alloc size must be > 0");
    if (this.bump + n > this.mem.length) throw new OutOfMemoryError();
    const addr = this.bump;
    this.bump += n;
    this.recordAlloc(addr, n, label);
    return addr;
  }

  /**
   * Igual que `alloc`, pero alinea el inicio del bloque a `align` bytes.
   * @example reservarAlineado(8, 4) → dirección múltiplo de 4
   */
  allocAligned(n: Size, align: number, label?: string): Addr {
    if (n <= 0) throw new Error("Alloc size must be > 0");
    const aligned = this.alignUp(this.bump, align > 0 ? align : 1);
    if (aligned + n > this.mem.length) throw new OutOfMemoryError();
    const addr = aligned;
    this.bump = aligned + n;
    this.recordAlloc(addr, n, label);
    return addr;
  }

  // Alias en español (azúcar):
  reservar(n: Size, etiqueta?: string): Addr {
    return this.alloc(n, etiqueta);
  }
  reservarAlineado(n: Size, alineacion: number, etiqueta?: string): Addr {
    return this.allocAligned(n, alineacion, etiqueta);
  }

  // --------------------------------------------------------------------------
  // Guardas de rango (no leer/escribir fuera de la RAM)
  // --------------------------------------------------------------------------

  /** Lanza `MemoryBoundsError` si [addr, addr+n) excede la capacidad. */
  private assertRange(addr: Addr, n: Size) {
    if (addr < 0 || n < 0 || addr + n > this.mem.length) {
      throw new MemoryBoundsError(addr, n);
    }
  }

  /** Devuelve la etiqueta registrada en esa dirección (si existe). */
  labelAt(addr: Addr): string | undefined {
    return this.labels.get(addr);
  }
  etiquetaEn(addr: Addr): string | undefined {
    return this.labelAt(addr);
  } // alias

  // --------------------------------------------------------------------------
  // Lecturas/Escrituras numéricas (LITTLE-ENDIAN)
  // --------------------------------------------------------------------------
  // Nota: usamos DataView para 16/32/64 bits y flotantes. Para U8 usamos
  // acceso directo al Uint8Array.

  /** Escribe 1 byte sin signo. */
  writeU8(addr: Addr, v: number) {
    this.assertRange(addr, 1);
    this.mem[addr] = v & 0xff;
  }
  /** Lee 1 byte sin signo. */
  readU8(addr: Addr): number {
    this.assertRange(addr, 1);
    return this.mem[addr];
  }

  /** Escribe 2 bytes sin signo (U16, LE). */
  writeU16(addr: Addr, v: number) {
    this.assertRange(addr, 2);
    this.dv.setUint16(addr, v & 0xffff, true);
  }
  /** Lee 2 bytes sin signo (U16, LE). */
  readU16(addr: Addr): number {
    this.assertRange(addr, 2);
    return this.dv.getUint16(addr, true);
  }

  /** Escribe 2 bytes con signo (I16, LE). */
  writeI16(addr: Addr, v: number) {
    this.assertRange(addr, 2);
    this.dv.setInt16(addr, v | 0, true);
  }
  /** Lee 2 bytes con signo (I16, LE). */
  readI16(addr: Addr): number {
    this.assertRange(addr, 2);
    return this.dv.getInt16(addr, true);
  }

  /** Escribe 4 bytes sin signo (U32, LE). */
  writeU32(addr: Addr, v: number) {
    this.assertRange(addr, 4);
    this.dv.setUint32(addr, v >>> 0, true);
  }
  /** Lee 4 bytes sin signo (U32, LE). */
  readU32(addr: Addr): number {
    this.assertRange(addr, 4);
    return this.dv.getUint32(addr, true) >>> 0;
  }

  /** Escribe 4 bytes con signo (I32, LE). */
  writeI32(addr: Addr, v: number) {
    this.assertRange(addr, 4);
    this.dv.setInt32(addr, v | 0, true);
  }
  /** Lee 4 bytes con signo (I32, LE). */
  readI32(addr: Addr): number {
    this.assertRange(addr, 4);
    return this.dv.getInt32(addr, true) | 0;
  }

  /** Escribe 8 bytes sin signo (U64, LE) usando BigInt. */
  writeU64(addr: Addr, v: bigint) {
    this.assertRange(addr, 8);
    this.dv.setBigUint64(addr, v, true);
  }
  /** Lee 8 bytes sin signo (U64, LE) como BigInt. */
  readU64(addr: Addr): bigint {
    this.assertRange(addr, 8);
    return this.dv.getBigUint64(addr, true);
  }

  /** Escribe 8 bytes con signo (I64, LE) usando BigInt. */
  writeI64(addr: Addr, v: bigint) {
    this.assertRange(addr, 8);
    this.dv.setBigInt64(addr, v, true);
  }
  /** Lee 8 bytes con signo (I64, LE) como BigInt. */
  readI64(addr: Addr): bigint {
    this.assertRange(addr, 8);
    return this.dv.getBigInt64(addr, true);
  }

  /** Escribe 4 bytes float (Float32, LE). */
  writeF32(addr: Addr, v: number) {
    this.assertRange(addr, 4);
    this.dv.setFloat32(addr, v, true);
  }
  /** Lee 4 bytes float (Float32, LE). */
  readF32(addr: Addr): number {
    this.assertRange(addr, 4);
    return this.dv.getFloat32(addr, true);
  }

  /** Escribe 8 bytes float (Float64, LE). */
  writeF64(addr: Addr, v: number) {
    this.assertRange(addr, 8);
    this.dv.setFloat64(addr, v, true);
  }
  /** Lee 8 bytes float (Float64, LE). */
  readF64(addr: Addr): number {
    this.assertRange(addr, 8);
    return this.dv.getFloat64(addr, true);
  }

  // Azúcar semántico (útil para claridad en el dominio):
  writeBool(addr: Addr, b: boolean) {
    this.writeU8(addr, b ? 1 : 0);
  }
  readBool(addr: Addr): boolean {
    return this.readU8(addr) !== 0;
  }

  /** Escribe una unidad de código UTF-16 (para strings internas como U16[]). */
  writeCharU16(addr: Addr, codeUnit: number) {
    this.writeU16(addr, codeUnit & 0xffff);
  }
  readCharU16(addr: Addr): number {
    return this.readU16(addr);
  }

  /** Punteros de 32 bits (claridad semántica): */
  writePtr32(addr: Addr, ptr: Addr) {
    this.writeU32(addr, ptr >>> 0);
  }
  readPtr32(addr: Addr): Addr {
    return this.readU32(addr) >>> 0;
  }

  // Alias en español (opcionales):
  escribirU8(a: Addr, v: number) {
    this.writeU8(a, v);
  }
  escribirU16(a: Addr, v: number) {
    this.writeU16(a, v);
  }
  escribirU32(a: Addr, v: number) {
    this.writeU32(a, v);
  }
  leerU8(a: Addr) {
    return this.readU8(a);
  }
  leerU16(a: Addr) {
    return this.readU16(a);
  }
  leerU32(a: Addr) {
    return this.readU32(a);
  }

  // --------------------------------------------------------------------------
  // Bloques de bytes y utilidades
  // --------------------------------------------------------------------------

  /** Copia `bytes.length` bytes a partir de `addr`. */
  writeBytes(addr: Addr, bytes: Uint8Array) {
    this.assertRange(addr, bytes.length);
    this.mem.set(bytes, addr);
  }

  /** Lee `n` bytes desde `addr`. */
  readBytes(addr: Addr, n: Size): Uint8Array {
    this.assertRange(addr, n);
    return this.mem.slice(addr, addr + n);
  }

  /** Rellena `n` bytes a partir de `addr` con `value` (0..255). Útil para demos. */
  memset(addr: Addr, n: Size, value: number) {
    this.assertRange(addr, n);
    this.mem.fill(value & 0xff, addr, addr + n);
  }

  // Alias en español:
  escribirBytes(a: Addr, b: Uint8Array) {
    this.writeBytes(a, b);
  }
  leerBytes(a: Addr, n: Size) {
    return this.readBytes(a, n);
  }

  // --------------------------------------------------------------------------
  // Metadatos de reservas (para UI/Printer)
  // --------------------------------------------------------------------------

  /** Lista de reservas realizadas (addr/size/label). */
  listAllocations(): Allocation[] {
    return [...this.allocs];
  }
  listarReservas(): Allocation[] {
    return this.listAllocations();
  }

  /**
   * Vuelca la RAM en "filas" (de 16 bytes) con datos **crudos**.
   * Ideal para snapshots/UI (no obliga a convertir a strings).
   */
  dumpRows(from: Addr = 0, to: Addr = this.bump): DumpRow[] {
    const out: DumpRow[] = [];

    for (let a = from; a < to; a += 16) {
      const bytes: number[] = [];
      for (let i = 0; i < 16 && a + i < to; i++) bytes.push(this.mem[a + i]);

      const labelsAtRowStart: string[] = [];
      const lbl = this.labels.get(a);
      if (lbl) labelsAtRowStart.push(lbl);

      const rowAllocs = this.allocs
        .filter((al) => al.addr >= a && al.addr < a + 16)
        .map((al) => ({ at: al.addr, size: al.size, label: al.label }));

      out.push({
        addr: a,
        bytes,
        labels: labelsAtRowStart.length ? labelsAtRowStart : undefined,
        allocations: rowAllocs.length ? rowAllocs : undefined,
      });
    }
    return out;
  }

  /**
   * Dump "legacy": mismo contenido que `dumpRows()` pero formateado a strings
   * de hex (conserva compatibilidad con UI/impresores existentes).
   */
  dump(
    from: Addr = 0,
    to: Addr = this.bump
  ): Array<{
    addr: string;
    hex: string;
    labels?: string[];
    allocs?: Array<{ at: string; size: number; label?: string }>;
  }> {
    const rows = this.dumpRows(from, to);
    return rows.map((r) => ({
      addr: "0x" + r.addr.toString(16).padStart(4, "0"),
      hex: r.bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "),
      labels: r.labels,
      allocs: r.allocations?.map((a) => ({
        at: "0x" + a.at.toString(16).padStart(4, "0"),
        size: a.size,
        label: a.label,
      })),
    }));
  }
}
