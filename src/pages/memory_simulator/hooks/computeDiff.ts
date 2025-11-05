// ui/mem/computeDiff.ts
import type { Snapshot } from "../../../shared/utils/RAM/memoria/Memory";
import type { PrimitiveType } from "../../../shared/utils/RAM/memoria/layout";

// --- Eventos de animación ---
export type AnimEvent =
  | { type: "slot-add"; slot: any }
  | { type: "slot-del"; name: string }
  | { type: "slot-kind-change"; name: string; from: string; to: string }
  | { type: "slot-ref-move"; name: string; from: number; to: number } // a = b;
  | { type: "slot-addr-move"; name: string; from: number; to: number } // re-aloc raro
  | {
      type: "slot-prim-write";
      name: string;
      addr: number;
      prim: PrimitiveType;
      fromVal: unknown;
      toVal: unknown;
      fromBytes: Uint8Array;
      toBytes: Uint8Array;
    } // x = 100;
  | { type: "heap-add"; entry: any }
  | { type: "heap-del"; addr: number }
  | { type: "heap-refcount"; addr: number; from: number; to: number }
  | { type: "alloc-add"; addr: number; size: number; label?: string };

// --- Util: reconstruir bytes desde snapshot.ram (hex por filas de 16) ---
function buildByteArray(snap: Snapshot): Uint8Array {
  const out = new Uint8Array(snap.used);
  for (const row of snap.ram) {
    const base = parseInt(row.addr, 16);
    if (!row.hex) continue;
    const parts = row.hex.split(" ").filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      const a = base + i;
      if (a < out.length) out[a] = parseInt(parts[i], 16);
    }
  }
  return out;
}
function readRegion(bytes: Uint8Array, addr: number, len: number) {
  const end = Math.min(addr + len, bytes.length);
  return bytes.slice(addr, end);
}

// --- Decodificador mínimo para mostrar el "valor" de un primitivo ---
function decodePrim(ty: PrimitiveType, bytes: Uint8Array): unknown {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (ty) {
    case "boolean":
      return (bytes[0] ?? 0) !== 0;
    case "byte":
      return bytes[0] ?? 0;
    case "short":
      return dv.getInt16(0, true);
    case "char":
      return String.fromCharCode(dv.getUint16(0, true));
    case "int":
      return dv.getInt32(0, true);
    case "long":
      return (
        (BigInt(dv.getUint32(4, true)) << 32n) | BigInt(dv.getUint32(0, true))
      );
    case "float":
      return dv.getFloat32(0, true);
    case "double":
      return dv.getFloat64(0, true);
    case "string":
      return "(ptr)"; // el valor real está en heap; aquí solo guardas el puntero u32
  }
}

// Tamaños primitivos (igual que SIZES del runtime)
const SZ: Record<PrimitiveType, number> = {
  boolean: 1,
  byte: 1,
  short: 2,
  char: 2,
  int: 4,
  long: 8,
  float: 4,
  double: 8,
  string: 4,
};

// --- Extraer todas las allocs (por fila) como mapa addr->(size,label) ---
function flattenAllocs(
  snap: Snapshot
): Map<number, { size: number; label?: string }> {
  const m = new Map<number, { size: number; label?: string }>();
  for (const row of snap.ram) {
    for (const a of row.allocs ?? []) {
      const addr = parseInt(a.at, 16);
      m.set(addr, { size: a.size, label: a.label });
    }
  }
  return m;
}

// --- Diff principal ---
export function computeDiff(prev: Snapshot, next: Snapshot): AnimEvent[] {
  const evts: AnimEvent[] = [];

  // Bytes antes/después (para detectar escrituras en sitio de primitivos)
  const bytesPrev = buildByteArray(prev);
  const bytesNext = buildByteArray(next);

  // 1) Slots del stack (por nombre)
  const Sprev = new Map<string, any>();
  const Snext = new Map<string, any>();
  for (const f of prev.stack) for (const s of f.slots) Sprev.set(s.name, s);
  for (const f of next.stack) for (const s of f.slots) Snext.set(s.name, s);

  // a) borrados
  for (const [name] of Sprev)
    if (!Snext.has(name)) evts.push({ type: "slot-del", name });
  // b) añadidos
  for (const [name, s] of Snext)
    if (!Sprev.has(name)) evts.push({ type: "slot-add", slot: s });
  // c) persistentes
  for (const [name, a] of Snext) {
    const b = Sprev.get(name);
    if (!b) continue;
    if (a.kind !== b.kind) {
      evts.push({ type: "slot-kind-change", name, from: b.kind, to: a.kind });
      continue;
    }
    if (a.kind === "ref") {
      if (a.refAddr !== b.refAddr) {
        evts.push({
          type: "slot-ref-move",
          name,
          from: b.refAddr,
          to: a.refAddr,
        });
      }
    } else {
      // primitivo: ¿cambió dirección o bytes?
      if (a.valueAddr !== b.valueAddr) {
        evts.push({
          type: "slot-addr-move",
          name,
          from: b.valueAddr,
          to: a.valueAddr,
        });
      } else {
        const len = SZ[a.type as PrimitiveType];
        const before = readRegion(bytesPrev, a.valueAddr, len);
        const after = readRegion(bytesNext, a.valueAddr, len);
        // comparar rápido
        let changed = before.length !== after.length;
        for (let i = 0; !changed && i < before.length; i++)
          if (before[i] !== after[i]) changed = true;
        if (changed) {
          evts.push({
            type: "slot-prim-write",
            name,
            addr: a.valueAddr,
            prim: a.type as PrimitiveType,
            fromVal: decodePrim(a.type as PrimitiveType, before),
            toVal: decodePrim(a.type as PrimitiveType, after),
            fromBytes: before,
            toBytes: after,
          });
        }
      }
    }
  }

  // 2) Heap entries (por addr)
  const Hprev = new Map(prev.heap.map((e) => [e.addr, e]));
  const Hnext = new Map(next.heap.map((e) => [e.addr, e]));
  for (const [addr] of Hprev)
    if (!Hnext.has(addr)) evts.push({ type: "heap-del", addr });
  for (const [addr, e] of Hnext)
    if (!Hprev.has(addr)) evts.push({ type: "heap-add", entry: e });
  for (const [addr, a] of Hnext) {
    const b = Hprev.get(addr);
    if (b && a.refCount !== b.refCount)
      evts.push({
        type: "heap-refcount",
        addr,
        from: b.refCount,
        to: a.refCount,
      });
  }

  // 3) Nuevas reservas de RAM (para “pop-in” de celdas)
  const Aprev = flattenAllocs(prev);
  const Anext = flattenAllocs(next);
  for (const [addr, meta] of Anext)
    if (!Aprev.has(addr))
      evts.push({
        type: "alloc-add",
        addr,
        size: meta.size,
        label: meta.label,
      });

  return evts;
}
// ─────────────────── Type Guards exportados ───────────────────
export type HeapRefcountEv = Extract<AnimEvent, { type: "heap-refcount" }>;
export type SlotRefMoveEv = Extract<AnimEvent, { type: "slot-ref-move" }>;
export type SlotAddrMoveEv = Extract<AnimEvent, { type: "slot-addr-move" }>;
export type SlotPrimWriteEv = Extract<AnimEvent, { type: "slot-prim-write" }>;
export type HeapAddEv = Extract<AnimEvent, { type: "heap-add" }>;
export type HeapDelEv = Extract<AnimEvent, { type: "heap-del" }>;
export type AllocAddEv = Extract<AnimEvent, { type: "alloc-add" }>;

export function isHeapRefcount(e: AnimEvent): e is HeapRefcountEv {
  return (
    e?.type === "heap-refcount" &&
    typeof (e as any).addr === "number" &&
    typeof (e as any).from === "number" &&
    typeof (e as any).to === "number"
  );
}

export function isSlotRefMove(e: AnimEvent): e is SlotRefMoveEv {
  // OJO: en computeDiff el evento usa 'from'/'to' (no fromAddr/toAddr)
  return (
    e?.type === "slot-ref-move" &&
    typeof (e as any).name === "string" &&
    typeof (e as any).from === "number" &&
    typeof (e as any).to === "number"
  );
}

// (Opcionales, por si los quieres usar)
export function isSlotAddrMove(e: AnimEvent): e is SlotAddrMoveEv {
  return (
    e?.type === "slot-addr-move" &&
    typeof (e as any).name === "string" &&
    typeof (e as any).from === "number" &&
    typeof (e as any).to === "number"
  );
}
export function isSlotPrimWrite(e: AnimEvent): e is SlotPrimWriteEv {
  return e?.type === "slot-prim-write" && typeof (e as any).addr === "number";
}
export function isHeapAdd(e: AnimEvent): e is HeapAddEv {
  return e?.type === "heap-add" && !!(e as any).entry;
}
export function isHeapDel(e: AnimEvent): e is HeapDelEv {
  return e?.type === "heap-del" && typeof (e as any).addr === "number";
}
export function isAllocAdd(e: AnimEvent): e is AllocAddEv {
  return e?.type === "alloc-add" && typeof (e as any).addr === "number";
}
