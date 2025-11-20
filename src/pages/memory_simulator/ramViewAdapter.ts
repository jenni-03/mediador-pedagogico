// Adaptador: UiSnapshot (builder) -> UiRamSnapshot (RamView)
import type { UiSnapshot } from "../../shared/utils/RAM/snapshot-builder";
import type { UiRamSnapshot as RamSnap, ByteRange } from "./RamView";

type PeekRange = { start: number; size: number } | null;

const h2n = (h: `0x${string}` | string) => parseInt(String(h), 16) >>> 0;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function packRows(rows: UiSnapshot["ram"]["rows"]): Uint8Array {
  const out: number[] = [];
  for (const r of rows) {
    if (!r.hex) continue;
    for (const b of r.hex.split(" ").filter(Boolean)) out.push(parseInt(b, 16));
  }
  return new Uint8Array(out);
}

// "heap#12:header" | "heap#12:data" | "heap#12" -> "heap#12"
const gidOf = (id?: string | null) => (id ? String(id).split(":")[0] : null);

// ─────────────────────────────────────────────────────────────────────────────
// Tonos base (stack/heap) + énfasis por grupo heap#X
// ─────────────────────────────────────────────────────────────────────────────
function rangesFromTones(
  tones: UiSnapshot["ramTones"],
  items: UiSnapshot["ramIndex"],
  selectedId?: string | null
): ByteRange[] {
  const idToPretty = new Map(
    items.map((it) => [String(it.id), String(it.label)])
  );
  const selGid = gidOf(selectedId);

  return tones.map((t) => {
    const idLike = String(t.label); // en tones.label guardamos el id del item
    const pretty = (t.label && idToPretty.get(idLike)) || t.label;
    const thisGid = gidOf(idLike);

    return {
      start: t.start >>> 0,
      size: t.size >>> 0,
      label: pretty,
      tone: t.tone as ByteRange["tone"],
      // énfasis si coincide exacto o comparte grupo heap#X
      emph:
        !!selectedId &&
        (idLike === selectedId || (!!selGid && selGid === thisGid)),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Inspectores: pintar payload inline de object-compact y destinos seleccionados
// (selección por grupo: cualquier id dentro de heap#X activa el bloque)
// ─────────────────────────────────────────────────────────────────────────────
function rangesFromInspectors(
  inspectors: UiSnapshot["inspectors"],
  selectedId?: string | null
): ByteRange[] {
  const out: ByteRange[] = [];
  if (!inspectors) return out;

  const selGid = gidOf(selectedId);

  for (const ins of Object.values(inspectors)) {
    if (ins?.kind !== "object-compact") continue;

    const headerId = ins.id; // "heap#X:header"
    const headerGid = gidOf(headerId);
    const isSelGroup = !!selGid && selGid === headerGid;

    // 0) si el grupo está seleccionado, envolver TODO el payload inline
    if (isSelGroup && ins.fields.length) {
      const minFrom = Math.min(
        ...ins.fields.map((f) => parseInt(f.inlineRange.from as any, 16) >>> 0)
      );
      const maxTo = Math.max(
        ...ins.fields.map((f) => parseInt(f.inlineRange.to as any, 16) >>> 0)
      );
      out.push({
        start: minFrom,
        size: Math.max(0, maxTo - minFrom),
        label: "Object data",
        tone: "object",
        emph: true,
      });
    }

    // 1) siempre: cada campo inline dentro del header
    for (const f of ins.fields) {
      const a = parseInt(f.inlineRange.from as any, 16) >>> 0;
      const b = parseInt(f.inlineRange.to as any, 16) >>> 0;

      out.push({
        start: a,
        size: Math.max(0, b - a),
        label: `${f.key}: ${String(f.type)}`,
        tone: f.type === "ptr32" || f.type === "string" ? "slot" : "data",
        emph: false,
      });

      // 2) si el grupo está seleccionado, resaltar también el DESTINO
      if (isSelGroup && f.target?.dataRange) {
        const da = parseInt(f.target.dataRange.from as any, 16) >>> 0;
        const db = parseInt(f.target.dataRange.to as any, 16) >>> 0;

        out.push({
          start: da,
          size: Math.max(0, db - da),
          label: `${f.key}`,
          tone: f.target.kind === "object" ? "object" : "data",
          emph: true,
        });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adaptador principal
// ─────────────────────────────────────────────────────────────────────────────
export function buildRamViewSnap(
  snapshot: UiSnapshot,
  opts?: {
    selectedId?: string | null;
    peekRange?: PeekRange;
    activeFromHighlight?: number | undefined;
    bytesPerRow?: 16 | 8 | 32;
    groupSize?: 1 | 2 | 4 | 8;
  }
): RamSnap {
  const {
    selectedId,
    peekRange,
    activeFromHighlight,
    bytesPerRow = 16,
    groupSize = 4,
  } = opts ?? {};

  const baseAddr = h2n(snapshot.ram.from);
  const bytes = packRows(snapshot.ram.rows);

  const ranges: ByteRange[] = [
    ...rangesFromTones(snapshot.ramTones, snapshot.ramIndex, selectedId),
    ...rangesFromInspectors(snapshot.inspectors, selectedId),
  ];

  // Peek (inspector)
  if (peekRange) {
    ranges.push({
      start: peekRange.start >>> 0,
      size: peekRange.size >>> 0,
      label: "inspector",
      tone: "data",
      emph: true,
    });
  }

  // ── BOOST: si el seleccionado pertenece a heap#X y existe el item "heap#X:data" objeto,
  //            sobreponemos un bloque completo "Object data" (enfatizado)
  if (selectedId) {
    const selGid = gidOf(selectedId);

    let objData =
      snapshot.ramIndex.find(
        (it) =>
          it.id === selectedId &&
          it.source === "heap-data" &&
          it.type === "object"
      ) ||
      (selGid
        ? snapshot.ramIndex.find(
            (it) =>
              it.source === "heap-data" &&
              it.type === "object" &&
              String(it.id).startsWith(`${selGid}:data`)
          )
        : undefined);

    if (objData) {
      const start = h2n(objData.range.from);
      const end = h2n(objData.range.to);
      ranges.push({
        start,
        size: Math.max(0, end - start),
        label: "Object data",
        tone: "object",
        emph: true,
      });
    }
  }

  // Prioridad para que lo importante quede arriba
  const prio = (r: ByteRange) =>
    [
      r.emph ? 0 : 1,
      r.size >>> 0,
      r.tone === "header" ? 1 : 0,
      r.start >>> 0,
    ] as const;

  ranges.sort((a, b) => {
    const A = prio(a),
      B = prio(b);
    if (A[0] !== B[0]) return A[0] - B[0];
    if (A[1] !== B[1]) return A[1] - B[1];
    if (A[2] !== B[2]) return A[2] - B[2];
    return A[3] - B[3];
  });

  // Cursor activo: tolerante a selección por grupo (header/campo)
  let activeAddr: number | undefined = activeFromHighlight;
  if (!activeAddr && selectedId) {
    const selGid = gidOf(selectedId);
    const resolved =
      snapshot.ramIndex.find((it) => it.id === selectedId) ||
      (selGid
        ? snapshot.ramIndex.find((it) =>
            String(it.id).startsWith(`${selGid}:data`)
          ) ||
          snapshot.ramIndex.find((it) =>
            String(it.id).startsWith(`${selGid}:header`)
          )
        : undefined);

    if (resolved) activeAddr = h2n(resolved.range.from);
  }

  return {
    baseAddr,
    bytes,
    bytesPerRow,
    groupSize,
    ranges,
    activeAddr,
    used: snapshot.ram.used,
    capacity: snapshot.ram.capacity,
  };
}
