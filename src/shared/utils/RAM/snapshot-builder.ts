// src/checkers/snapshot-builder.ts
// -----------------------------------------------------------------------------
// SnapshotBuilder: genera un snapshot "amigable para el frontend" a partir de
// Memory (Stack + Heap + ByteStore), y además ofrece formateadores de consola.
// -----------------------------------------------------------------------------

import { Memory } from "./memoria/Memory";
import type { PrimitiveType } from "./memoria/layout";

// -----------------------------------------------------------------------------
// Tipos "planos" para la UI (contrato cerrado)
// -----------------------------------------------------------------------------

type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr }; // semiabierto [from, to)

export type HexAlloc = { at: HexAddr; size: number; label?: string };

export type HexRow = {
  addr: HexAddr; // inicio de la fila (alineado a 16)
  hex: string; // "00 2A 10 00 …"
  ascii?: string; // opcional
  labels?: string[]; // "stack", "heap:header", "heap:data", etc.
  allocs?: HexAlloc[]; // ayudas para resaltar bloques
};

export type UiPrimSlot = {
  name: string;
  kind: "prim";
  type: PrimitiveType;
  addr: HexAddr; // dirección del valor en RAM
  value: unknown; // decodificado desde RAM
  display?: string; // ej. char: "'A' (65)"
  range: ByteRange; // bytes ocupados por el prim en RAM
};

// ── Previews tipados para docencia ───────────────────────────────────────────
type StringPreview = {
  kind: "string";
  len: number;
  text: string;
  chars?: { index: number; code: number; char: string }[];
};

type ArrayItemString = {
  index: number;
  ref: HexAddr;
  kind: "string";
  len: number;
  text: string;
};
type ArrayItemNull = { index: number; ref: HexAddr; kind: "null" };
type ArrayPreview = {
  kind: "array";
  length: number;
  elemType: string;
  items: Array<ArrayItemString | ArrayItemNull>;
  truncated: boolean;
};

export type UiRefSlot = {
  name: string;
  kind: "ref";
  refAddr: HexAddr; // dirección del puntero en stack (0x00000000 => null)
  refKind: "null" | "string" | "array" | "object" | "unknown";
  preview?: StringPreview | ArrayPreview; // preview docente
};

export type UiSlot = UiPrimSlot | UiRefSlot;

export type UiFrame = {
  id: number;
  name: string;
  slots: UiSlot[];
};

// Heap normalizado a hex + rangos para colorear RAM
export type UiHeapEntry =
  | {
      kind: "array";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string; // ej: "array-ref32"
        length: number;
        dataPtr: HexAddr;
        elem?: unknown; // p. ej. { tag: "prim", name: "string" }
      };
      range: ByteRange; // header (len+dataPtr)
      dataRange: ByteRange; // área de datos (refs o prims)
      id?: number;
    }
  | {
      kind: "string";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string; // ej: "string"
        length: number;
        dataPtr: HexAddr;
      };
      range: ByteRange; // header (len+dataPtr)
      dataRange: ByteRange; // bytes UTF-16 = len*2
      id?: number;
    }
  | {
      kind: "object";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: unknown;
      range: ByteRange; // si no hay tamaño claro, deja from==to
      id?: number;
    };

export type UiRamView = {
  used: number;
  capacity: number;
  from: HexAddr; // rango del dump
  to: HexAddr;
  rows: HexRow[]; // filas listas para pintar (sin funciones)
};

export type UiSnapshot = {
  stack: UiFrame[];
  heap: UiHeapEntry[];
  ram: UiRamView;
  // meta opcional si luego necesitas activeFrameId u otros campos
};

// ─────────────────────────────────────────────────────────────────────────────
// Opciones de RAM para la UI
// • hideGuards: oculta etiquetas/allocs de “guard” (p. ej. null guard @0x0).
// • extraHiddenLabels: lista adicional para filtrar etiquetas por nombre.
// Esto mantiene el ByteStore genérico y la UI decide qué mostrar al alumno.
// ─────────────────────────────────────────────────────────────────────────────
type UiRamOpts = {
  hideGuards?: boolean; // default: true
  extraHiddenLabels?: string[];
};

// -----------------------------------------------------------------------------
// Builders por sección
// -----------------------------------------------------------------------------

export function buildUiStack(mem: Memory): UiFrame[] {
  const bs = mem.getByteStore();
  const heap = mem.getHeap();
  const stack = mem.getStack();

  const frames: UiFrame[] = stack.all().map((f) => {
    const uiSlots: UiSlot[] = [];

    for (const s of f.slots.values()) {
      if (s.kind === "prim") {
        const addrHex = toHex(s.valueAddr);
        const decoded = decodePrimitive(bs, s.type, s.valueAddr);
        uiSlots.push({
          name: s.name,
          kind: "prim",
          type: s.type,
          addr: addrHex,
          value: decoded.value,
          display: decoded.display,
          range: hexRange(s.valueAddr, primSizeOf(s.type)),
        });
      } else {
        const refHex = toHex(s.refAddr);
        if (s.refAddr === 0) {
          uiSlots.push({
            name: s.name,
            kind: "ref",
            refAddr: refHex,
            refKind: "null",
          });
        } else {
          const e = heap.get(s.refAddr);
          const refKind: UiRefSlot["refKind"] = !e
            ? "unknown"
            : e.kind === "array"
              ? "array"
              : e.kind;

          let preview: UiRefSlot["preview"] = undefined;

          // Preview para String: texto corto desde header + dataPtr
          if (refKind === "string") {
            const sp = readStringPreview(bs, s.refAddr);
            preview = { kind: "string", len: sp.len, text: sp.text };
          }

          // Preview para ARRAY de String: primeros N elementos (indirecto)
          if (refKind === "array" && e && isArrayOfString(e)) {
            const length = bs.readU32(s.refAddr);
            const dataPtr = bs.readU32(s.refAddr + 4);
            const max = Math.min(length, ARRAY_PREVIEW_MAX);
            const items: Array<ArrayItemString | ArrayItemNull> = [];
            for (let i = 0; i < max; i++) {
              const elemRef = bs.readU32(dataPtr + i * 4);
              if (elemRef === 0) {
                items.push({ index: i, ref: toHex(0), kind: "null" });
              } else {
                const sp = readStringPreview(bs, elemRef);
                items.push({
                  index: i,
                  ref: toHex(elemRef),
                  kind: "string",
                  len: sp.len,
                  text: sp.text,
                });
              }
            }
            preview = {
              kind: "array",
              length,
              elemType: "String",
              items,
              truncated: length > max,
            };
          }

          uiSlots.push({
            name: s.name,
            kind: "ref",
            refAddr: refHex,
            refKind,
            preview,
          });
        }
      }
    }

    return { id: f.id, name: f.name, slots: uiSlots };
  });

  return frames;
}

/** Normaliza Heap.list() → entradas con direcciones en hex + rangos para RAM */
export function buildUiHeap(mem: Memory): UiHeapEntry[] {
  const list = mem.getHeap().list() as any[];
  const out: UiHeapEntry[] = [];

  for (const e of list) {
    const id = e.id as number | undefined;
    const addrNum = Number(e.addr ?? 0);
    const baseAddr = toHex(addrNum);
    const baseCommon = {
      addr: baseAddr,
      refCount: Number(e.refCount ?? 0),
      label: e.label as string | undefined,
      id,
    };

    if (e.kind === "array") {
      const meta = e.meta ?? {};
      const length = Number(meta.length ?? 0);
      const dataPtrNum = Number(meta.dataPtr ?? 0);
      const dataPtrHex = toHex(dataPtrNum);

      out.push({
        kind: "array",
        ...baseCommon,
        meta: {
          tag: meta.tag,
          length,
          dataPtr: dataPtrHex,
          elem: meta.elem,
        },
        range: { from: baseAddr, to: toHex(addrNum + 8) }, // header (len+ptr)
        dataRange: { from: dataPtrHex, to: toHex(dataPtrNum + length * 4) }, // array-ref32
      });
    } else if (e.kind === "string") {
      const meta = e.meta ?? {};
      const length = Number(meta.length ?? 0);
      const dataPtrNum = Number(meta.dataPtr ?? 0);
      const dataPtrHex = toHex(dataPtrNum);

      out.push({
        kind: "string",
        ...baseCommon,
        meta: {
          tag: meta.tag,
          length,
          dataPtr: dataPtrHex,
        },
        range: { from: baseAddr, to: toHex(addrNum + 8) }, // header
        dataRange: { from: dataPtrHex, to: toHex(dataPtrNum + length * 2) }, // UTF-16
      });
    } else if (e.kind === "object") {
      out.push({
        kind: "object",
        ...baseCommon,
        meta: e.meta,
        range: { from: baseAddr, to: baseAddr }, // si no sabes tamaño, deja from=to
      });
    } else {
      out.push({
        kind: "object",
        ...baseCommon,
        meta: e.meta,
        range: { from: baseAddr, to: baseAddr },
      });
    }
  }

  return out;
}

export function buildUiRam(
  mem: Memory,
  heapUi?: UiHeapEntry[],
  opts?: UiRamOpts
): UiRamView {
  const bs = mem.getByteStore();

  // Rango por defecto: [NULL_GUARD, used)
   const fromNum =
    typeof (mem as any).getNullGuard === "function" ? (mem as any).getNullGuard() : 0;
  const toNum = bs.used();
 const usedExposed = Math.max(0, toNum - fromNum);
  // dumpRows() nuevo devuelve bytes, labels y allocations numéricas
  const rawRows =
    typeof (bs as any).dumpRows === "function"
      ? ((bs as any).dumpRows(fromNum, toNum) as Array<{
          addr: number;
          bytes: number[];
          labels?: string[];
          allocations?: Array<{ at: number; size: number; label?: string }>;
        }>)
      : [];

  const toHexStr = (bytes: number[]) =>
    bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ");

  const rows: HexRow[] = [];

  // ── Filtro de "guards" (null guard y similares) controlado por opts ────────
  const hideGuards = opts?.hideGuards !== false; // por defecto true
  const extraHiddenSet = new Set(
    (opts?.extraHiddenLabels ?? []).map((s) => s.toLowerCase())
  );
  const isGuardish = (s?: string) =>
    !!s &&
    (s.toLowerCase().includes("guard") || extraHiddenSet.has(s.toLowerCase()));

  if (rawRows.length > 0) {
    for (const r of rawRows) {
      // Limpia etiquetas/allocs con aspecto de guard para no confundir al alumno
      const cleanedLabels = (r.labels ?? []).filter((l) =>
        hideGuards ? !isGuardish(l) : true
      );

      const cleanedAllocs = (r.allocations ?? [])
        .filter((a) =>
          hideGuards ? !(a.at === 0 || isGuardish(a.label)) : true
        )
        .map((a) => ({ at: toHex(a.at), size: a.size, label: a.label }));

      rows.push({
        addr: toHex(r.addr),
        hex: toHexStr(r.bytes ?? []),
        labels: cleanedLabels.length ? cleanedLabels : undefined,
        allocs: cleanedAllocs.length ? cleanedAllocs : undefined,
      });
    }
  } else {
    // Fallback: genera filas a partir de lecturas directas
    const rowHex = (addr: number, width = 16) => {
      const bytes: number[] = [];
      for (let i = 0; i < width; i++) {
        const a = addr + i;
        if (a < 0 || a >= toNum) {
          bytes.push(0);
          continue;
        }
        bytes.push(bs.readU8(a));
      }
      return toHexStr(bytes);
    };
    for (let addr = fromNum; addr < toNum; addr += 16) {
      rows.push({ addr: toHex(addr), hex: rowHex(addr, 16) });
    }
  }

  // ── Etiquetado docente usando rangos del heap ──────────────────────────────
  if (heapUi && heapUi.length) {
    // marca la fila (addr alineada a 16) que contiene el inicio de cada rango
    const labelAt = (addrHex: HexAddr, label: string) => {
      const a = parseInt(addrHex, 16);
      const rowAddr = toHex(a & ~0xf);
      const row = rows.find((r) => r.addr === rowAddr);
      if (!row) return;
      row.labels = [...(row.labels ?? []), label];
    };

    for (const h of heapUi) {
      labelAt(h.range.from, `${h.kind}:header`);
      if ((h as any).dataRange?.from) {
        labelAt((h as any).dataRange.from, `${h.kind}:data`);
      }
    }
  }

  return {
    used: usedExposed,
    capacity: bs.capacity(),
    from: toHex(fromNum),
    to: toHex(toNum),
    rows,
  };
}

// Compositor: snapshot completo (ahora acepta opciones para RAM)
export function buildUiSnapshot(
  mem: Memory,
  opts?: { ram?: UiRamOpts }
): UiSnapshot {
  const stack = buildUiStack(mem);
  const heap = buildUiHeap(mem);
  // Pasamos heap a RAM para que pueda etiquetar filas con header/data
  const ram = buildUiRam(mem, heap, opts?.ram);
  return { stack, heap, ram };
}

// -----------------------------------------------------------------------------
// Helpers de lectura/decodificación
// -----------------------------------------------------------------------------

function toHex(n: number): HexAddr {
  return ("0x" + (n >>> 0).toString(16).padStart(8, "0")) as HexAddr;
}

function hexRange(addr: number, size: number): ByteRange {
  return { from: toHex(addr), to: toHex(addr + size) };
}

function primSizeOf(kind: PrimitiveType): number {
  switch (kind) {
    case "boolean":
      return 1;
    case "byte":
      return 1;
    case "char":
      return 2;
    case "short":
      return 2;
    case "int":
      return 4;
    case "float":
      return 4;
    case "long":
      return 8;
    case "double":
      return 8;
    case "string":
      return 8; // header expuesto por compatibilidad (len+ptr)
  }
}

function sign8(u: number): number {
  return (u << 24) >> 24;
}
function sign16(u: number): number {
  return (u << 16) >> 16;
}

// lectura segura de u16 (por si tu ByteStore no implementa readU16)
function readU16Safe(
  bs: ReturnType<Memory["getByteStore"]>,
  addr: number
): number {
  if (typeof (bs as any).readU16 === "function") {
    return (bs as any).readU16(addr);
  }
  const lo = bs.readU8(addr);
  const hi = bs.readU8(addr + 1);
  return (hi << 8) | lo;
}

function readI32FromU32(u32: number): number {
  // en JS, (u32|0) produce int32 con signo
  return u32 | 0;
}

function readLongAsBigInt(
  bs: ReturnType<Memory["getByteStore"]>,
  addr: number
): bigint {
  const lo = BigInt(bs.readU32(addr)); // bits 31..0
  const hi = BigInt(bs.readU32(addr + 4)); // bits 63..32
  let v = (hi << 32n) | lo;
  // Sign-extend si bit 63 está encendido
  if (hi & 0x80000000n) {
    v = v - (1n << 64n);
  }
  return v;
}

const ARRAY_PREVIEW_MAX = 8;
const STRING_PREVIEW_MAX = 128;

function readStringPreview(
  bs: ReturnType<Memory["getByteStore"]>,
  strAddr: number
): { len: number; text: string } {
  const len = bs.readU32(strAddr);
  const dataPtr = bs.readU32(strAddr + 4);
  const max = Math.min(len, STRING_PREVIEW_MAX);
  let text = "";
  for (let i = 0; i < max; i++) {
    const code = readU16Safe(bs, dataPtr + i * 2);
    text += String.fromCharCode(code);
  }
  return { len, text };
}

// Detecta un array de referencias a String según la meta del heap
function isArrayOfString(e: any): boolean {
  return (
    e?.kind === "array" &&
    e.meta?.tag === "array-ref32" &&
    e.meta?.elem?.name === "string"
  );
}

function decodePrimitive(
  bs: ReturnType<Memory["getByteStore"]>,
  kind: PrimitiveType,
  addr: number
): { value: unknown; display?: string } {
  switch (kind) {
    case "boolean": {
      const u = bs.readU8(addr);
      return { value: (u & 1) === 1 };
    }
    case "byte": {
      const u = bs.readU8(addr);
      return { value: sign8(u) };
    }
    case "short": {
      const u = readU16Safe(bs, addr);
      return { value: sign16(u) };
    }
    case "char": {
      const u = readU16Safe(bs, addr);
      const ch = String.fromCharCode(u);
      return { value: u, display: `'${ch}' (${u})` };
    }
    case "int": {
      const u = bs.readU32(addr);
      return { value: readI32FromU32(u) };
    }
    case "long": {
      const bi = readLongAsBigInt(bs, addr);
      const asNum =
        bi >= BigInt(Number.MIN_SAFE_INTEGER) &&
        bi <= BigInt(Number.MAX_SAFE_INTEGER)
          ? Number(bi)
          : undefined;
      return { value: asNum ?? bi.toString() };
    }
    case "float": {
      return { value: bs.readF32(addr) };
    }
    case "double": {
      return { value: bs.readF64(addr) };
    }
    case "string": {
      const len = bs.readU32(addr);
      const ptr = bs.readU32(addr + 4);
      return {
        value: { len, dataPtr: toHex(ptr) },
        display: `string@${toHex(addr)} len=${len}`,
      };
    }
  }
}

// -----------------------------------------------------------------------------
// Pretty printers para tests / consola
// -----------------------------------------------------------------------------

export function formatStack(frames: UiFrame[]): string {
  const lines: string[] = [];
  lines.push("stack:");
  if (!frames.length) {
    lines.push(" (vacío)");
    return lines.join("\n");
  }
  for (const f of frames) {
    lines.push(` - frame#${f.id} "${f.name}"`);
    if (!f.slots.length) {
      lines.push("    (sin variables)");
      continue;
    }
    for (const v of f.slots) {
      if (v.kind === "prim") {
        const base = `    • ${v.name}: prim ${v.type} @${v.addr} = ${String(v.value)}`;
        lines.push(v.display ? `${base}  (${v.display})` : base);
      } else {
        const base = `    • ${v.name}: ref -> ${v.refAddr} (${v.refKind})`;
        lines.push(base);
        if (v.preview?.kind === "string") {
          const pv = v.preview as StringPreview;
          lines.push(`      ⤷ string len=${pv.len} preview="${pv.text}"`);
        }
        if (v.preview?.kind === "array") {
          const ap = v.preview as ArrayPreview;
          lines.push(
            `      ⤷ array<String> len=${ap.length}${ap.truncated ? " (preview)" : ""}`
          );
          for (const it of ap.items) {
            lines.push(
              it.kind === "null"
                ? `         [${it.index}] → null`
                : `         [${it.index}] → "${it.text}" @${it.ref}`
            );
          }
        }
      }
    }
  }
  return lines.join("\n");
}

export function formatHeap(heapList: UiHeapEntry[]): string {
  return "heap:\n" + JSON.stringify(heapList, null, 2);
}

export function formatRam(
  ram: UiRamView,
  opts?: { from?: number; to?: number; maxRows?: number }
): string {
  const { maxRows = 8 } = opts ?? {};
  const rows = ram.rows.slice(0, maxRows);
  const lines: string[] = [];
  lines.push(
    `ram: used=${ram.used} / capacity=${ram.capacity} (${ram.from}..${ram.to})`
  );
  if (!rows.length) {
    lines.push(" (sin filas)");
    return lines.join("\n");
  }
  for (const r of rows) {
    const lbl = r.labels?.length ? `  ${r.labels.join(", ")}` : "";
    lines.push(`  ${r.addr}: ${r.hex}${lbl}`);
    if (r.allocs?.length) {
      for (const a of r.allocs) {
        lines.push(
          `    alloc at ${a.at} size=${a.size}${a.label ? ` "${a.label}"` : ""}`
        );
      }
    }
  }
  return lines.join("\n");
}
