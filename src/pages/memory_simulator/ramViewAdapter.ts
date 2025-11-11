// Adaptador: UiSnapshot (builder) -> UiRamSnapshot (RamView)
import type { UiSnapshot } from "../../shared/utils/RAM/snapshot-builder";
import type { UiRamSnapshot as RamSnap, ByteRange } from "./RamView";

type PeekRange = { start: number; size: number } | null;

const h2n = (h: `0x${string}` | string) => parseInt(String(h), 16) >>> 0;

function packRows(rows: UiSnapshot["ram"]["rows"]): Uint8Array {
  const out: number[] = [];
  for (const r of rows) {
    if (!r.hex) continue;
    for (const b of r.hex.split(" ").filter(Boolean)) out.push(parseInt(b, 16));
  }
  return new Uint8Array(out);
}

function rangesFromTones(
  tones: UiSnapshot["ramTones"],
  items: UiSnapshot["ramIndex"],
  selectedId?: string | null
): ByteRange[] {
  const map = new Map(items.map((it) => [String(it.id), String(it.label)]));
  return tones.map((t) => ({
    start: t.start >>> 0,
    size: t.size >>> 0,
    label: (t.label && map.get(String(t.label))) || t.label,
    tone: t.tone as ByteRange["tone"],
    emph: selectedId ? String(t.label) === selectedId : false,
  }));
}

// Pinta campos inline de object-compact como data/slot dentro del header
function rangesFromInspectors(
  inspectors: UiSnapshot["inspectors"]
): ByteRange[] {
  const out: ByteRange[] = [];
  if (!inspectors) return out;
  for (const v of Object.values(inspectors)) {
    if (v?.kind !== "object-compact") continue;
    for (const f of v.fields) {
      const a = h2n(f.inlineRange.from);
      const b = h2n(f.inlineRange.to);
      out.push({
        start: a,
        size: Math.max(0, b - a),
        label: `${f.key}: ${f.type}`,
        tone: f.type === "ptr32" || f.type === "string" ? "slot" : "data",
      });
    }
  }
  return out;
}

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
    ...rangesFromInspectors(snapshot.inspectors),
  ];

  if (peekRange) {
    ranges.push({
      start: peekRange.start >>> 0,
      size: peekRange.size >>> 0,
      label: "inspector",
      tone: "data",
      emph: true,
    });
  }

  // === PRIORIDAD DE RANGOS PARA EVITAR “HEADER TAPANDO DATA” ===
  // 1) seleccionados (emph) primero
  // 2) más específicos (menor tamaño)
  // 3) no-header antes que header
  const prio = (r: ByteRange) =>
    [r.emph ? 0 : 1, r.size, r.tone === "header" ? 1 : 0, r.start] as const;

  ranges.sort((a, b) => {
    const pa = prio(a);
    const pb = prio(b);
    if (pa[0] !== pb[0]) return pa[0] - pb[0];
    if (pa[1] !== pb[1]) return pa[1] - pb[1];
    if (pa[2] !== pb[2]) return pa[2] - pb[2];
    return pa[3] - pb[3]; // estable por dirección
  });
  // ============================================================

  // Cursor activo
  let activeAddr: number | undefined = activeFromHighlight;
  if (!activeAddr && selectedId) {
    const sel = snapshot.ramIndex.find((it) => it.id === selectedId);
    if (sel) activeAddr = h2n(sel.range.from);
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
