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
  tone: "header" | "prim" | "array" | "string" | "object" | "slot";
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
  range: ByteRange;
  preview?: StringPreview | ArrayPreview; // preview docente
};

export type UiSlot = UiPrimSlot | UiRefSlot;

export type UiFrame = {
  id: number;
  name: string;
  slots: UiSlot[];
};
// --- Inspector para panel derecho -------------------------------------------
export type UiInspectorArrayInlinePrim = {
  kind: "array-inline-prim";
  id: string; // p.ej. "heap#12:data"
  header: HexAddr; // addr del header
  dataPtr: HexAddr;
  length: number;
  elemType: PrimitiveType;
  elemSize: number;
  items: Array<{
    index: number;
    range: ByteRange; // bytes del elemento en RAM
    preview: number | string; // valor ya decodificado
  }>;
};

export type UiInspectorArrayRef32 = {
  kind: "array-ref32";
  id: string; // p.ej. "heap#12:data"
  header: HexAddr;
  dataPtr: HexAddr;
  length: number;
  items: Array<{
    index: number;
    ptrRange: ByteRange; // bytes del *puntero* (celda u32)
    ptr: HexAddr; // 0x00000000 si null
    // info del objetivo si existe (útil para un "ver destino" rápido)
    target?: {
      kind: "string" | "array" | "object";
      headerRange: ByteRange;
      dataRange?: ByteRange;
    };
  }>;
};

export type UiInspectorObjectCompact = {
  kind: "object-compact";
  id: string; // p.ej. "heap#27:header"
  header: HexAddr;
  fields: Array<{
    key: string;
    type: PrimitiveType | "string" | "ptr32";
    inlineRange: ByteRange; // bytes del campo dentro del header
    preview: unknown; // valor mostrado
    // si es string/ptr32 y no-null, también el objetivo:
    target?: {
      kind: "string" | "array" | "object";
      headerRange: ByteRange;
      dataRange?: ByteRange;
    };
  }>;
};

export type UiInspector =
  | UiInspectorArrayInlinePrim
  | UiInspectorArrayRef32
  | UiInspectorObjectCompact;

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
      dataRange?: ByteRange; //  ← antes: dataRange: ByteRange
      preview?: ArrayPrimPreview | ArrayStringPreview | ArrayRefPreview;
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
      dataRange?: ByteRange; //  ← antes: dataRange: ByteRange
      preview?: StringPreview;
      id?: number;
    }
  | {
      kind: "object";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: unknown;
      range: ByteRange;
      preview?: ObjectPreview;
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
  inspectors: Record<string, UiInspector>; // ← NUEVO
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
        // s.refAddr = dirección de la CELDA (u32) en el STACK
        const cellAddr = s.refAddr;
        const target = bs.readU32(cellAddr); // ← valor del puntero (header en heap)
        const targetHex = toHex(target);

        if (target === 0) {
          uiSlots.push({
            name: s.name,
            kind: "ref",
            refAddr: toHex(cellAddr), // dirección de la celda en stack
            refKind: "null",
            range: hexRange(cellAddr, 4),
          });
        } else {
          const e = heap.get(target);
          const refKind: UiRefSlot["refKind"] = !e
            ? "unknown"
            : e.kind === "array"
              ? "array"
              : e.kind;

          let preview: UiRefSlot["preview"] = undefined;

          // Preview para String
          if (refKind === "string") {
            const sp = readStringPreview(bs, target);
            preview = { kind: "string", len: sp.len, text: sp.text };
          }

          // Preview para ARRAY de String (array-ref32 a strings)
          if (refKind === "array" && e && isArrayOfString(e)) {
            const length = bs.readU32(target);
            const dataPtr = bs.readU32(target + 4);
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
            refAddr: toHex(cellAddr), // ← dirección de la celda en STACK
            refKind,
            range: hexRange(cellAddr, 4), // ← rango del slot (no del header)
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

  // ===== NUEVO: construir mapa headerAddr -> nombre de variable del stack =====
  const ownerByHeader = new Map<number, string>();
  const stk = mem.getStack();
  for (const f of stk.all()) {
    for (const s of f.slots.values()) {
      if ((s as any).kind === "ref") {
        const cell = (s as any).refAddr as number; // celda en stack (u32)
        const target = bs.readU32(cell); // header en heap
        if (target && !ownerByHeader.has(target)) {
          ownerByHeader.set(target, s.name); // p.ej. 0x... → "x"
        }
      }
    }
  }
  // ===========================================================================

  const toHex = (n: number): HexAddr =>
    ("0x" + (n >>> 0).toString(16).padStart(8, "0")) as HexAddr;

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

    // ===== CAMBIO: elegir label => e.label || "var <nombreEnStack>" ==========
    const owner = ownerByHeader.get(addrNum);
    const computedLabel: string | undefined =
      (e.label as string | undefined) ?? (owner ? `var ${owner}` : undefined);
    // ========================================================================

    const baseCommon = {
      addr: baseAddr,
      refCount: Number(e.refCount ?? 0),
      label: computedLabel, // ← antes: e.label
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
          if (ref === 0)
            items.push({ index: i, ref: toHex(0), len: 0, text: "" });
          else {
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

      const hasData = dataPtrNum > 0 && dataBytes > 0;

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
        ...(hasData
          ? {
              dataRange: {
                from: dataPtrHex,
                to: toHex(dataPtrNum + dataBytes),
              },
            }
          : {}),
        preview,
      });
      continue;
    }

    if (e.kind === "string") {
      const meta = e.meta ?? {};
      const length = Number(meta.length ?? 0);
      const dataPtrNum = Number(meta.dataPtr ?? 0);
      const dataPtrHex = toHex(dataPtrNum);

      const sp = readStringPreviewFull(addrNum);

      const strBytes = length * 2;
      const hasStrData = dataPtrNum > 0 && strBytes > 0;

      out.push({
        kind: "string",
        ...baseCommon,
        meta: { tag: meta.tag, length, dataPtr: dataPtrHex },
        range: { from: baseAddr, to: toHex(addrNum + 8) },
        ...(hasStrData
          ? {
              dataRange: { from: dataPtrHex, to: toHex(dataPtrNum + strBytes) },
            }
          : {}),
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

      // Header siempre existe (puede ser 0 si no es compact)
      const headerFrom = addrNum;
      const headerTo = addrNum + headerBytes;

      // Para object-compact: el "data" es el payload inline (después de len:u32)
      const payloadFrom = headerBytes > 0 ? addrNum + 4 : addrNum;
      const hasPayload = headerBytes > 4;

      out.push({
        kind: "object",
        ...baseCommon,
        meta,
        range: { from: baseAddr, to: toHex(headerTo) }, // header
        ...(hasPayload
          ? { dataRange: { from: toHex(payloadFrom), to: toHex(headerTo) } }
          : {}),
        preview,
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
  const inspectors = buildUiInspectors(mem, heap); // ← NUEVO

  return { stack, heap, ram, ramIndex, ramTones, inspectors };
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

  const pushTone = (t: UiRamTone) => {
    if (t.size > 0) tones.push(t);
  };

  // 1) stack prims / refs
  for (const f of stackUi) {
    for (const s of f.slots) {
      if (s.kind === "prim") {
        const id = `frame${f.id}:${s.name}`;
        const bytes = sizeOfRange(s.range);
        items.push({
          id,
          source: "stack-prim",
          // etiqueta interna; la UI ya no la usa como título
          label: `${s.name}: ${s.type}`,
          type: s.type,
          range: s.range,
          bytes,
          meta: {
            frameId: f.id,
            var: s.name,
            displayName: s.name, // ← CORRECCIÓN
            rangeKind: "data",
          },
        });
        pushTone({
          start: hexToNum(s.range.from),
          size: bytes,
          label: id,
          tone: "prim",
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
            meta: {
              frameId: f.id,
              var: s.name,
              displayName: s.name, // ← CORRECCIÓN
              rangeKind: "slot",
            },
          });
          const fromNumRef = hexToNum(ref.range.from);
          if (fromNumRef !== 0) {
            pushTone({
              start: fromNumRef,
              size: bytes,
              label: id,
              tone: "slot",
            });
          }
        }
      }
    }
  }

  // 2) heap headers + data
  for (const h of heapUi) {
    const hid = `heap#${h.id ?? hexToNum(h.addr)}`;
    const displayName = (h.label as string | undefined) || undefined; // ← CORRECCIÓN

    // header
    {
      const hdrBytes = sizeOfRange(h.range);
      const itemId = `${hid}:header`;
      const headerLabel =
        h.kind === "string"
          ? "String header"
          : h.kind === "array"
            ? "Array header"
            : (h as any).meta?.tag === "object-compact"
              ? "Object header (compact)"
              : "Object header";

      items.push({
        id: itemId,
        source: "heap-header",
        label: headerLabel,
        type: h.kind,
        range: h.range,
        bytes: hdrBytes,
        meta: {
          heapId: h.id,
          at: h.addr,
          rangeKind: "header",
          displayName, // ← CORRECCIÓN (si hay nombre, úsalo)
          inspectorId: h.kind === "object" ? `${hid}:header` : undefined,
          ...(h.kind === "object"
            ? {
                objTag: (h.meta as any)?.tag,
                fieldCount: Array.isArray((h.meta as any)?.schema)
                  ? (h as any).meta.schema.length
                  : undefined,
                objKeys: Array.isArray((h.meta as any)?.schema)
                  ? (h as any).meta.schema.map((f: any) => f.key)
                  : undefined,
              }
            : {}),
        },
      });

      pushTone({
        start: hexToNum(h.range.from),
        size: hdrBytes,
        label: itemId,
        tone: "header",
      });
    }

    // data (si aplica)
    const dr: any = (h as any).dataRange;
    if (dr?.from && dr?.to && hexToNum(dr.to) > hexToNum(dr.from)) {
      const dataBytes = sizeOfRange(dr);
      const elemName =
        (h as any).meta?.elem?.name ?? (h as any).meta?.elemType ?? "?";
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
        meta: {
          heapId: h.id,
          at: h.addr,
          rangeKind: "data",
          elemName,
          displayName, // ← CORRECCIÓN (mismo nombre)
          inspectorId: h.kind === "array" ? `${hid}:data` : undefined,
        },
      });

      const dataTone: UiRamTone["tone"] =
        h.kind === "array"
          ? "array"
          : h.kind === "string"
            ? "string"
            : "object";
      pushTone({
        start: hexToNum(dr.from),
        size: dataBytes,
        label: itemId,
        tone: dataTone,
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
function buildUiInspectors(
  mem: Memory,
  heapUi: UiHeapEntry[]
): Record<string, UiInspector> {
  const bs = mem.getByteStore();
  const heap = mem.getHeap();
  const out: Record<string, UiInspector> = {};

  const toH = (n: number) => toHex(n);
  const num = (h: HexAddr) => parseInt(h, 16);

  // tamaño de header según el tipo del heap entry
  const headerRangeFor = (e: any, addr: number): ByteRange => {
    if (e.kind === "object") {
      const sz = compactObjectHeaderSize(e.meta);
      return { from: toH(addr), to: toH(addr + sz) };
    }
    // strings y arrays: 8 bytes (len + dataPtr)
    return { from: toH(addr), to: toH(addr + 8) };
  };

  for (const h of heapUi) {
    const hid = `heap#${h.id ?? num(h.addr)}`;

    // ---------- ARRAYS ----------
    if (h.kind === "array") {
      const tag = (h.meta as any)?.tag;
      const len = Number((h.meta as any)?.length ?? 0);
      const dataPtr = parseInt((h.meta as any)?.dataPtr as HexAddr, 16);
      const dataId = `${hid}:data`;

      if (tag === "array-inline-prim") {
        const elemType = String((h.meta as any)?.elemType) as PrimitiveType;
        const elemSize =
          typeof (h.meta as any)?.elemSize === "number"
            ? Number((h.meta as any).elemSize)
            : primSizeOf(elemType);

        const items: UiInspectorArrayInlinePrim["items"] = [];
        let cursor = dataPtr;
        for (let i = 0; i < len; i++) {
          const range = { from: toH(cursor), to: toH(cursor + elemSize) };
          const preview = ((): number | string => {
            switch (elemType) {
              case "boolean":
                return (bs.readU8(cursor) & 1) === 1 ? 1 : 0;
              case "byte":
                return sign8(bs.readU8(cursor));
              case "short":
                return sign16(readU16Safe(bs, cursor));
              case "char":
                return readU16Safe(bs, cursor);
              case "int":
                return bs.readI32(cursor);
              case "long":
                return ((): string | number => {
                  const bi = readLongAsBigInt(bs, cursor);
                  return bi >= BigInt(Number.MIN_SAFE_INTEGER) &&
                    bi <= BigInt(Number.MAX_SAFE_INTEGER)
                    ? Number(bi)
                    : bi.toString();
                })();
              case "float":
                return bs.readF32(cursor);
              case "double":
                return bs.readF64(cursor);
              default:
                return bs.readU8(cursor);
            }
          })();
          items.push({ index: i, range, preview });
          cursor += elemSize;
        }

        out[dataId] = {
          kind: "array-inline-prim",
          id: dataId,
          header: h.addr,
          dataPtr: toH(dataPtr),
          length: len,
          elemType,
          elemSize,
          items,
        };
      } else if (tag === "array-ref32") {
        const items: UiInspectorArrayRef32["items"] = [];
        for (let i = 0; i < len; i++) {
          const cell = dataPtr + i * 4;
          const ptr = bs.readU32(cell);
          const ptrRange = { from: toH(cell), to: toH(cell + 4) };

          let target: UiInspectorArrayRef32["items"][number]["target"];
          if (ptr) {
            const e = heap.get(ptr);
            if (e) {
              const headerRange = headerRangeFor(e, ptr);
              let dataRange: ByteRange | undefined;
              if (e.kind === "string") {
                const len = (e.meta as any).length as number;
                const dp = (e.meta as any).dataPtr as number;
                dataRange = { from: toH(dp), to: toH(dp + len * 2) };
              }
              if (e.kind === "array") {
                const dp = (e.meta as any).dataPtr as number;
                const tag = (e.meta as any).tag;
                const length = (e.meta as any).length as number;
                const bytes =
                  tag === "array-inline-prim"
                    ? length * Number((e.meta as any).elemSize ?? 1)
                    : length * 4;
                dataRange = { from: toH(dp), to: toH(dp + bytes) };
              }
              target = { kind: e.kind as any, headerRange, dataRange };
            }
          }

          items.push({ index: i, ptrRange, ptr: toH(ptr), target });
        }

        out[dataId] = {
          kind: "array-ref32",
          id: dataId,
          header: h.addr,
          dataPtr: toH(dataPtr),
          length: len,
          items,
        };
      }

      continue;
    }

    // ---------- OBJETO (compact) ----------
    if (h.kind === "object" && (h.meta as any)?.tag === "object-compact") {
      const headId = `${hid}:header`;
      const schema = (h.meta as any).schema as Array<{
        key: string;
        type: PrimitiveType | "ptr32" | "string";
      }>;
      let cur = parseInt(h.addr, 16) + 4; // saltar len:u32

      const fields: UiInspectorObjectCompact["fields"] = [];
      for (const f of schema) {
        const t = f.type;
        const size = t === "ptr32" || t === "string" ? 4 : objectFieldSize(t);
        const inlineRange = { from: toH(cur), to: toH(cur + size) };

        let preview: unknown;
        let target: UiInspectorObjectCompact["fields"][number]["target"];

        switch (t) {
          case "boolean":
            preview = (bs.readU8(cur) & 1) === 1;
            break;
          case "byte":
            preview = sign8(bs.readU8(cur));
            break;
          case "short":
            preview = sign16(readU16Safe(bs, cur));
            break;
          case "char":
            preview = String.fromCharCode(readU16Safe(bs, cur));
            break;
          case "int":
            preview = bs.readI32(cur);
            break;
          case "long":
            {
              const bi = readLongAsBigInt(bs, cur);
              preview =
                bi >= BigInt(Number.MIN_SAFE_INTEGER) &&
                bi <= BigInt(Number.MAX_SAFE_INTEGER)
                  ? Number(bi)
                  : bi.toString();
            }
            break;
          case "float":
            preview = bs.readF32(cur);
            break;
          case "double":
            preview = bs.readF64(cur);
            break;
          case "string":
          case "ptr32": {
            const p = bs.readU32(cur);
            preview = toH(p);
            if (p) {
              const e = heap.get(p);
              if (e) {
                const headerRange = headerRangeFor(e, p);
                let dataRange: ByteRange | undefined;
                if (e.kind === "string") {
                  const len = (e.meta as any).length as number;
                  const dp = (e.meta as any).dataPtr as number;
                  dataRange = { from: toH(dp), to: toH(dp + len * 2) };
                }
                if (e.kind === "array") {
                  const dp = (e.meta as any).dataPtr as number;
                  const tag = (e.meta as any).tag;
                  const length = (e.meta as any).length as number;
                  const bytes =
                    tag === "array-inline-prim"
                      ? length * Number((e.meta as any).elemSize ?? 1)
                      : length * 4;
                  dataRange = { from: toH(dp), to: toH(dp + bytes) };
                }
                target = { kind: e.kind as any, headerRange, dataRange };
              }
            }
            break;
          }
        }

        fields.push({ key: f.key, type: t, inlineRange, preview, target });
        cur += size;
      }

      out[headId] = {
        kind: "object-compact",
        id: headId,
        header: h.addr,
        fields,
      };
    }
  }

  return out;
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
        const base = `    • ${v.name}: ref @cell=${v.refAddr} (${v.refKind})`;
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
