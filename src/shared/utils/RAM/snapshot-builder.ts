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
export type UiRamItemSource =
  | "stack-prim"
  | "stack-ref"
  | "heap-header"
  | "heap-data";

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

export type UiRamItem = {
  id: string; // estable: p.ej. "frame1:x" ó "heap#12:header"
  source: UiRamItemSource;
  label: string; // lo que verá el alumno ("x:int", "String header", "Array<String> data")
  type: string; // tipo docente ("int", "ref32", "string", "array<String>")
  range: ByteRange; // [from..to)
  bytes: number; // tamaño en bytes
  meta?: Record<string, unknown>; // opcional (frameId, heapId, etc.)
};

// Rango con tono para colorear la grilla (lo usa RamView)
export type UiRamTone = {
  start: number;
  size: number;
  label?: string;
  tone: "header" | "data" | "slot" | "object";
};

// ── Previews tipados para docencia ───────────────────────────────────────────
type StringPreview = {
  kind: "string";
  len: number;
  text: string;
  chars?: { index: number; code: number; char: string }[];
};
type ArrayPrimPreview = {
  kind: "array-prim";
  elemType: string; // ej: "int"
  items: Array<number | string>; // números o string si long > MAX_SAFE_INTEGER
  truncated: boolean;
};

type ArrayStringPreview = {
  kind: "array-string";
  items: { index: number; ref: HexAddr; len: number; text: string }[];
  truncated: boolean;
};
type ArrayRefPreview = {
  kind: "array-ref";
  items: { index: number; ref: HexAddr }[];
  truncated: boolean;
};
type ObjectPreview = {
  kind: "object";
  fields: { key: string; type: string; value: unknown }[];
  truncated?: boolean;
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
        tag?: string; // "array-inline-prim" | "array-ref32"
        length: number;
        dataPtr: HexAddr;
        elem?: unknown;
        elemType?: string;
        elemSize?: number;
      };
      range: ByteRange;
      dataRange: ByteRange;
      preview?: ArrayPrimPreview | ArrayStringPreview | ArrayRefPreview; // ← NUEVO
      id?: number;
    }
  | {
      kind: "string";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string;
        length: number;
        dataPtr: HexAddr;
      };
      range: ByteRange;
      dataRange: ByteRange;
      preview?: StringPreview; // ← NUEVO
      id?: number;
    }
  | {
      kind: "object";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: unknown;
      range: ByteRange;
      preview?: ObjectPreview; // ← NUEVO
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
  ramIndex: UiRamItem[];
  ramTones: UiRamTone[];
};

// Tamaño de un campo inline dentro de objeto-compact
function objectFieldSize(t: PrimitiveType | "ptr32" | "string"): number {
  if (t === "ptr32" || t === "string") return 4; // puntero
  return primSizeOf(t);
}

// Calcula el tamaño del header de un objeto compacto:
// [len:u32] + suma de tamaños inline de sus campos
function compactObjectHeaderSize(meta: any): number {
  if (!meta || meta.tag !== "object-compact" || !Array.isArray(meta.schema)) {
    return 0;
  }
  let size = 4; // len:u32
  for (const f of meta.schema as Array<{
    key: string;
    type: PrimitiveType | "ptr32";
  }>) {
    size += objectFieldSize(f.type);
  }
  return size;
}

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
  const bs = mem.getByteStore();
  const out: UiHeapEntry[] = [];

  const toHex = (n: number): HexAddr =>
    ("0x" + (n >>> 0).toString(16).padStart(8, "0")) as HexAddr;

  const STRING_PREVIEW_MAX = 64; // chars máx para preview
  const ARRAY_PREVIEW_MAX = 16; // elementos máx para preview

  const readU16 = (addr: number) => readU16Safe(bs, addr);

  const readStringPreviewFull = (headerAddr: number) => {
    const len = bs.readU32(headerAddr);
    const data = bs.readU32(headerAddr + 4);
    const max = Math.min(len, STRING_PREVIEW_MAX);
    let text = "";
    const chars: { index: number; code: number; char: string }[] = [];
    for (let i = 0; i < max; i++) {
      const code = readU16(data + i * 2);
      const ch = String.fromCharCode(code);
      text += ch;
      chars.push({ index: i, code, char: ch });
    }
    return { len, text, chars };
  };

  const readInlinePrim = (elem: string, addr: number): number | string => {
    switch (elem) {
      case "boolean":
        return (bs.readU8(addr) & 1) === 1 ? 1 : 0;
      case "byte":
        return sign8(bs.readU8(addr));
      case "short":
        return sign16(readU16(addr));
      case "char":
        return readU16(addr);
      case "int":
        return bs.readI32(addr);
      case "long": {
        const bi = readLongAsBigInt(bs, addr);
        return bi >= BigInt(Number.MIN_SAFE_INTEGER) &&
          bi <= BigInt(Number.MAX_SAFE_INTEGER)
          ? Number(bi)
          : bi.toString();
      }
      case "float":
        return bs.readF32(addr);
      case "double":
        return bs.readF64(addr);
      default:
        return bs.readU8(addr);
    }
  };

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
      const tag = String(meta.tag ?? ""); // "array-inline-prim" | "array-ref32"

      // Bytes de data reales
      let dataBytes = 0;
      if (tag === "array-inline-prim") {
        const elemSize =
          typeof meta.elemSize === "number" && meta.elemSize > 0
            ? Number(meta.elemSize)
            : primSizeOf(String(meta.elemType) as PrimitiveType);
        dataBytes = length * elemSize;
      } else {
        dataBytes = length * 4;
      }

      // ==== PREVIEW ====
      let preview:
        | ArrayPrimPreview
        | ArrayStringPreview
        | ArrayRefPreview
        | undefined;

      if (tag === "array-inline-prim" && typeof meta.elemType === "string") {
        const elemType = meta.elemType as string;
        const elemSize =
          typeof meta.elemSize === "number" && meta.elemSize > 0
            ? Number(meta.elemSize)
            : primSizeOf(elemType as PrimitiveType);

        const count = Math.min(length, ARRAY_PREVIEW_MAX);
        const items: Array<number | string> = [];
        let cursor = dataPtrNum;
        for (let i = 0; i < count; i++) {
          items.push(readInlinePrim(elemType, cursor));
          cursor += elemSize;
        }
        preview = {
          kind: "array-prim",
          elemType,
          items,
          truncated: length > count,
        };
      } else if (tag === "array-ref32" && meta.elem?.name === "string") {
        const count = Math.min(length, ARRAY_PREVIEW_MAX);
        const items: {
          index: number;
          ref: HexAddr;
          len: number;
          text: string;
        }[] = [];
        for (let i = 0; i < count; i++) {
          const ref = bs.readU32(dataPtrNum + i * 4);
          if (ref === 0) {
            items.push({ index: i, ref: toHex(0), len: 0, text: "" });
          } else {
            const sp = readStringPreviewFull(ref);
            items.push({
              index: i,
              ref: toHex(ref),
              len: sp.len,
              text: sp.text,
            });
          }
        }
        preview = { kind: "array-string", items, truncated: length > count };
      } else if (tag === "array-ref32") {
        const count = Math.min(length, ARRAY_PREVIEW_MAX);
        const items: { index: number; ref: HexAddr }[] = [];
        for (let i = 0; i < count; i++) {
          const ref = bs.readU32(dataPtrNum + i * 4);
          items.push({ index: i, ref: toHex(ref) });
        }
        preview = { kind: "array-ref", items, truncated: length > count };
      }

      out.push({
        kind: "array",
        ...baseCommon,
        meta: {
          tag,
          length,
          dataPtr: dataPtrHex,
          ...(meta.elem ? { elem: meta.elem } : {}),
          ...(meta.elemType ? { elemType: meta.elemType } : {}),
          ...(meta.elemSize ? { elemSize: meta.elemSize } : {}),
        } as any,
        range: { from: baseAddr, to: toHex(addrNum + 8) },
        dataRange: { from: dataPtrHex, to: toHex(dataPtrNum + dataBytes) },
        preview, // ← aquí va
      });
      continue;
    }

    if (e.kind === "string") {
      const meta = e.meta ?? {};
      const length = Number(meta.length ?? 0);
      const dataPtrNum = Number(meta.dataPtr ?? 0);
      const dataPtrHex = toHex(dataPtrNum);

      const sp = readStringPreviewFull(addrNum);

      out.push({
        kind: "string",
        ...baseCommon,
        meta: { tag: meta.tag, length, dataPtr: dataPtrHex },
        range: { from: baseAddr, to: toHex(addrNum + 8) },
        dataRange: { from: dataPtrHex, to: toHex(dataPtrNum + length * 2) },
        preview: {
          kind: "string",
          len: sp.len,
          text: sp.text,
          chars: sp.chars,
        },
      });
      continue;
    }

    if (e.kind === "object") {
      const meta = e.meta ?? {};
      const headerBytes =
        meta?.tag === "object-compact" ? compactObjectHeaderSize(meta) : 0;

      // ==== PREVIEW object-compact (si viene schema) ====
      let preview: ObjectPreview | undefined;
      if (meta?.tag === "object-compact" && Array.isArray(meta?.schema)) {
        const schema = meta.schema as Array<{
          key: string;
          type: PrimitiveType | "ptr32" | "string";
        }>;
        const fields: { key: string; type: string; value: unknown }[] = [];
        let cur = addrNum + 4; // tras len

        for (const f of schema) {
          const t = f.type;
          let value: unknown;
          switch (t) {
            case "boolean":
              value = (bs.readU8(cur) & 1) === 1;
              cur += 1;
              break;
            case "byte":
              value = sign8(bs.readU8(cur));
              cur += 1;
              break;
            case "short":
              value = sign16(readU16(cur));
              cur += 2;
              break;
            case "char":
              value = String.fromCharCode(readU16(cur));
              cur += 2;
              break;
            case "int":
              value = bs.readI32(cur);
              cur += 4;
              break;
            case "long": {
              const bi = readLongAsBigInt(bs, cur);
              cur += 8;
              value =
                bi >= BigInt(Number.MIN_SAFE_INTEGER) &&
                bi <= BigInt(Number.MAX_SAFE_INTEGER)
                  ? Number(bi)
                  : bi.toString();
              break;
            }
            case "float":
              value = bs.readF32(cur);
              cur += 4;
              break;
            case "double":
              value = bs.readF64(cur);
              cur += 8;
              break;
            case "string": {
              const sh = bs.readU32(cur);
              cur += 4;
              value = sh ? readStringPreviewFull(sh).text : null;
              break;
            }
            case "ptr32":
            default: {
              const p = bs.readU32(cur);
              cur += 4;
              value = toHex(p);
            }
          }
          fields.push({ key: f.key, type: String(t), value });
        }
        preview = { kind: "object", fields };
      }

      out.push({
        kind: "object",
        ...baseCommon,
        meta,
        range: { from: baseAddr, to: toHex(addrNum + headerBytes) },
        preview, // ← aquí va
      });
      continue;
    }

    // fallback
    out.push({
      kind: "object",
      ...baseCommon,
      meta: e.meta,
      range: { from: baseAddr, to: baseAddr },
    });
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
    typeof (mem as any).getNullGuard === "function"
      ? (mem as any).getNullGuard()
      : 0;
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
  const ram = buildUiRam(mem, heap, opts?.ram);

  const { items: ramIndex, tones: ramTones } = buildUiRamIndex(stack, heap);

  return { stack, heap, ram, ramIndex, ramTones };
}

// -----------------------------------------------------------------------------
// Helpers de lectura/decodificación
// -----------------------------------------------------------------------------
const hexToNum = (h: HexAddr) => parseInt(h, 16);
const sizeOfRange = (r: ByteRange) =>
  Math.max(0, hexToNum(r.to) - hexToNum(r.from));

export function buildUiRamIndex(
  stackUi: UiFrame[],
  heapUi: UiHeapEntry[]
): { items: UiRamItem[]; tones: UiRamTone[] } {
  const items: UiRamItem[] = [];
  const tones: UiRamTone[] = [];

  // 1) stack prims / refs (igual que lo llevas)
  for (const f of stackUi) {
    for (const s of f.slots) {
      if (s.kind === "prim") {
        const id = `frame${f.id}:${s.name}`;
        const bytes = sizeOfRange(s.range);
        items.push({
          id,
          source: "stack-prim",
          label: `${s.name}: ${s.type}`,
          type: s.type,
          range: s.range,
          bytes,
          meta: { frameId: f.id, var: s.name, rangeKind: "data" },
        });
        tones.push({
          start: hexToNum(s.range.from),
          size: bytes,
          label: id,           // ← EXACTO igual que item.id
          tone: "data",
        });
      } else {
        const ref: any = s as any;
        if (ref.range) {
          const id = `frame${f.id}:${s.name}@ref`;
          const bytes = sizeOfRange(ref.range);
          items.push({
            id,
            source: "stack-ref",
            label: `${s.name}: ref32`,
            type: "ref32",
            range: ref.range,
            bytes,
            meta: { frameId: f.id, var: s.name, rangeKind: "slot" },
          });
          tones.push({
            start: hexToNum(ref.range.from),
            size: bytes,
            label: id,          // ← EXACTO igual que item.id
            tone: "slot",
          });
        }
      }
    }
  }

  // 2) heap headers + data (lo importante es que label === item.id)
  for (const h of heapUi) {
    const hid = `heap#${h.id ?? hexToNum(h.addr)}`;

    // header
    {
      const hdrBytes = sizeOfRange(h.range);
      const itemId = `${hid}:header`;
      items.push({
        id: itemId,
        source: "heap-header",
        label:
          h.kind === "string"
            ? "String header"
            : h.kind === "array"
            ? "Array header"
            : "Object header (compact)",
        type: h.kind,
        range: h.range,
        bytes: hdrBytes,
        meta: {
          heapId: h.id,
          at: h.addr,
          rangeKind: "header",
          // extras para panel (opcionales)
          ...(h.kind === "object" ? {
            objTag: (h.meta as any)?.tag,
            fieldCount: Array.isArray((h.meta as any)?.schema)
              ? (h.meta as any).schema.length
              : undefined,
            objKeys: Array.isArray((h.meta as any)?.schema)
              ? (h.meta as any).schema.map((f: any) => f.key)
              : undefined,
            displayName: (h.label as string) || undefined,
          } : {}),
        },
      });
      tones.push({
        start: hexToNum(h.range.from),
        size: hdrBytes,
        label: itemId,      // ← EXACTO igual que item.id
        tone: "header",
      });
    }

    // data (si aplica)
    const dr: any = (h as any).dataRange;
    if (dr?.from && dr?.to && hexToNum(dr.to) > hexToNum(dr.from)) {
      const dataBytes = sizeOfRange(dr);
      const elemName =
        (h as any).meta?.elem?.name ??
        (h as any).meta?.elemType ??
        "?";
      const dataLabel =
        h.kind === "string"
          ? "String data (UTF-16)"
          : h.kind === "array"
          ? `Array<${elemName}> data`
          : "Object data";

      const itemId = `${hid}:data`;
      items.push({
        id: itemId,
        source: "heap-data",
        label: dataLabel,
        type: h.kind,
        range: dr,
        bytes: dataBytes,
        meta: { heapId: h.id, at: h.addr, rangeKind: "data", elemName },
      });
      tones.push({
        start: hexToNum(dr.from),
        size: dataBytes,
        label: itemId,      // ← EXACTO igual que item.id
        tone: "data",
      });
    }
  }

  return { items, tones };
}

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
