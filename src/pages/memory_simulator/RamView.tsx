import * as React from "react";

/* ======================= Tipos (snapshot) ======================= */
export type ByteRange = {
  start: number;
  size: number;
  label?: string;
  tone: "header" | "prim" | "array" | "string" | "object" | "slot" | "data";
  emph?: boolean;
};
export type UiRamSnapshot = {
  baseAddr: number;
  bytes: Uint8Array;
  bytesPerRow: 16 | 8 | 32;
  groupSize: 1 | 2 | 4 | 8;
  ranges: ByteRange[];
  activeAddr?: number;
  used?: number;
  capacity?: number;
};

/* ============================== Constantes ============================== */
const ADDR_COL = "11ch";
const GAP = "0.32rem";
const ROW_H = 82; // altura estimada de cada fila (px) para virtualización
const BUFFER_ROWS = 3;
const PLACEHOLDER_ROWS = 6;

/* ============================== Paleta del panel ============================== */
const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2734",
  ring: "#2E3948",
};

/* ============================== Utils ============================== */
const toHex2 = (n: number) => n.toString(16).padStart(2, "0");
const toHex8 = (n: number) => `0x${n.toString(16).padStart(8, "0")}` as const;
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const toU8 = (x: unknown): Uint8Array =>
  x instanceof Uint8Array
    ? x
    : Array.isArray(x)
      ? new Uint8Array(x as number[])
      : new Uint8Array(0);

function splitRows(bytes: Uint8Array, baseAddr: number, bytesPerRow: number) {
  const rows: { addr: number; slice: Uint8Array }[] = [];
  for (let i = 0; i < bytes.length; i += bytesPerRow) {
    rows.push({
      addr: baseAddr + i,
      slice: bytes.subarray(i, i + bytesPerRow),
    });
  }
  return rows;
}

/* ---------- Prioridad local de rangos ---------- */
const toneOrder = (t?: ByteRange["tone"]) => (t === "header" ? 1 : 0);
const prioKey = (r: ByteRange) =>
  [r.emph ? 0 : 1, r.size >>> 0, toneOrder(r.tone), r.start >>> 0] as const;

function sortRanges(ranges: ByteRange[]): ByteRange[] {
  const copy = ranges.slice();
  copy.sort((a, b) => {
    const A = prioKey(a);
    const B = prioKey(b);
    if (A[0] !== B[0]) return A[0] - B[0];
    if (A[1] !== B[1]) return A[1] - B[1];
    if (A[2] !== B[2]) return A[2] - B[2];
    return A[3] - B[3];
  });
  return copy;
}

/* ---------- Resolución de solapamientos ---------- */
type Tone = NonNullable<ByteRange["tone"]>;
const normalizeTone = (t: ByteRange["tone"] | undefined): Tone =>
  t === "header" ||
  t === "prim" ||
  t === "array" ||
  t === "string" ||
  t === "object" ||
  t === "slot" ||
  t === "data"
    ? t
    : "data";

const inRange = (addr: number, r: ByteRange) =>
  addr >= r.start && addr < r.start + r.size;

const toneWeight: Record<Tone, number> = {
  data: 5,
  header: 4,
  prim: 3,
  array: 3,
  string: 3,
  object: 3,
  slot: 2,
};

function pickActiveEmphRange(ranges: ByteRange[], activeAddr?: number) {
  const emphs = ranges.filter((r) => r.emph);
  if (!emphs.length) return null;
  if (typeof activeAddr === "number") {
    const hit = emphs.find((r) => inRange(activeAddr, r));
    if (hit) return hit;
  }
  return emphs.slice().sort((a, b) => a.size - b.size)[0] ?? null;
}

function pickBestRangeAt(
  addr: number,
  ranges: ByteRange[],
  prefer?: ByteRange | null
): ByteRange | null {
  const candidates = ranges.filter((r) => inRange(addr, r));
  if (!candidates.length) return null;
  if (prefer && inRange(addr, prefer)) return prefer;
  return candidates.slice().sort((a, b) => {
    if (!!b.emph !== !!a.emph) return (b.emph ? 1 : 0) - (a.emph ? 1 : 0);
    if (a.size !== b.size) return a.size - b.size;
    return (
      toneWeight[normalizeTone(b.tone)] - toneWeight[normalizeTone(a.tone)]
    );
  })[0];
}

/* Paleta por tono — sin glow (rendimiento) */
const TONE_CLS: Record<
  Tone,
  { bg: string; ring: string; text: string }
> = {
  header: { bg: "bg-cyan-900/40", ring: "ring-cyan-400/70", text: "text-cyan-100" },
  data: { bg: "bg-emerald-900/35", ring: "ring-emerald-400/70", text: "text-emerald-100" },
  slot: { bg: "bg-zinc-900/70", ring: "ring-zinc-400/60", text: "text-zinc-200" },
  object: { bg: "bg-fuchsia-900/35", ring: "ring-fuchsia-400/70", text: "text-fuchsia-100" },
  prim: { bg: "bg-sky-900/35", ring: "ring-sky-400/70", text: "text-sky-100" },
  array: { bg: "bg-emerald-900/35", ring: "ring-emerald-400/70", text: "text-emerald-100" },
  string: { bg: "bg-indigo-900/35", ring: "ring-indigo-400/70", text: "text-indigo-100" },
};

/* ===== Leyenda de tonos (para estudiantes) ===== */
function LegendChip({ tone, label }: { tone: Tone; label: string }) {
  const c = TONE_CLS[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ring-1 ${c.bg} ${c.text} ${c.ring}`}
    >
      <span className="h-2 w-2 rounded-full bg-white/80" />
      {label}
    </span>
  );
}

const LegendBar = React.memo(function LegendBar() {
  return (
    <div className="px-3 sm:px-4 pb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px]">
      <LegendChip tone="header" label="header · metadatos" />
      <LegendChip tone="prim" label="prim · valor directo" />
      <LegendChip tone="string" label="string · texto / ref" />
      <span className="hidden sm:inline-flex"><LegendChip tone="object" label="object · campos" /></span>
      <span className="hidden sm:inline-flex"><LegendChip tone="data" label="data · bloque de datos" /></span>
      <span className="hidden sm:inline-flex"><LegendChip tone="slot" label="slot · puntero / stack" /></span>
    </div>
  );
});

/* ===== Burbuja centrada para spans ===== */
function RowLabel({ range }: { range: ByteRange }) {
  const tone = normalizeTone(range.tone);
  const raw = (range.label ?? "").trim();
  const parts = raw.split(":");
  const namePart = parts[0]?.trim() ?? "";
  const typePart = parts[1]?.trim() ?? "";
  const isField = !!typePart;
  const isPtrField =
    isField &&
    range.size === 4 &&
    (tone === "string" || tone === "array" || tone === "object");
  const mainText = namePart || raw || "campo";
  const typeText = !typePart ? "" : isPtrField ? `ptr → ${typePart}` : typePart;

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-[2px] text-[10px] rounded-md ring-1 ${TONE_CLS[tone].text}`}
      style={{
        background: "rgba(5,10,12,.92)",
        borderColor: "rgba(16,185,129,.45)",
        letterSpacing: ".015em",
        position: "relative",
      }}
    >
      {isField ? (
        <span className="flex flex-col items-center leading-tight">
          <span className="font-medium">{mainText}</span>
          {typeText && (
            <span className="text-[9px] opacity-85 uppercase tracking-wide">
              {typeText}
            </span>
          )}
        </span>
      ) : (
        <span>{mainText}</span>
      )}
      <span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-[-7px] h-2 w-2 rotate-45"
        style={{
          background: "rgba(5,10,12,.92)",
          borderLeft: "1px solid rgba(16,185,129,.45)",
          borderBottom: "1px solid rgba(16,185,129,.45)",
        }}
      />
    </span>
  );
}

/* ===== Cálculo de spans por fila (label centrada) ===== */
type LabelSpan = { start: number; end: number; range: ByteRange };

function computeLabelSpans(
  rowAddr: number,
  count: number,
  rangeMap: Map<number, ByteRange | null>,
): LabelSpan[] {
  const spans: LabelSpan[] = [];
  let current: LabelSpan | null = null;
  for (let i = 0; i < count; i++) {
    const addr = rowAddr + i;
    const best = rangeMap.get(addr) ?? null;
    const label = best?.label?.trim();
    if (label) {
      if (
        current &&
        current.range.label?.trim() === label &&
        normalizeTone(current.range.tone) === normalizeTone(best!.tone)
      ) {
        current.end = i;
      } else {
        if (current) spans.push(current);
        current = { start: i, end: i, range: best! };
      }
    } else {
      if (current) { spans.push(current); current = null; }
    }
  }
  if (current) spans.push(current);
  return spans;
}

/* ===== Columna de encabezado (sticky) ===== */
const ColumnHeader = React.memo(function ColumnHeader({
  bytesPerRow,
  groupSize,
}: {
  bytesPerRow: number;
  groupSize: number;
}) {
  return (
    <div
      className="sticky top-0 z-10 grid px-3 pt-2 pb-2"
      style={{
        gridTemplateColumns: `${ADDR_COL} 1fr`,
        background: C.panelInner,
        borderBottom: `1px solid ${C.ring}`,
      }}
    >
      <div className="text-xs text-zinc-400 font-mono">Addr</div>
      <div
        className="grid pr-2"
        style={{
          gridTemplateColumns: `repeat(${bytesPerRow}, minmax(1rem, 1fr))`,
          columnGap: GAP,
        }}
      >
        {Array.from({ length: bytesPerRow }, (_, i) => (
          <div key={i} className="text-[10px] md:text-[11px] font-mono text-center text-zinc-500">
            {toHex2(i)}
          </div>
        ))}
      </div>
    </div>
  );
});

/* ============================== Empty State ============================== */
function EmptyState({
  baseAddr,
  bytesPerRow,
  groupSize,
}: {
  baseAddr: number;
  bytesPerRow: number;
  groupSize: number;
}) {
  return (
    <div className="relative">
      <ColumnHeader bytesPerRow={bytesPerRow} groupSize={groupSize} />
      <div className="pb-2">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, r) => (
          <div
            key={r}
            className="grid items-center px-3 py-2.5"
            style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
          >
            <div className="font-mono text-xs">
              <span className="inline-block px-2 py-1 rounded-lg border text-zinc-500" style={{ background: C.panelSoft, borderColor: C.ring }}>
                {toHex8(baseAddr + r * bytesPerRow)}
              </span>
            </div>
            <div
              className="grid pr-2"
              style={{
                gridTemplateColumns: `repeat(${bytesPerRow}, minmax(1rem, 1fr))`,
                columnGap: GAP,
              }}
            >
              {Array.from({ length: bytesPerRow }, (_, i) => {
                const groupSep = i % groupSize === 0 && i !== 0;
                return (
                  <div
                    key={i}
                    className={`h-9 rounded-md border font-mono text-[11px] flex items-center justify-center select-none border-zinc-700/40 text-zinc-600 bg-zinc-900/40 ${groupSep ? "border-l-2 border-l-zinc-700/40" : ""}`}
                    aria-hidden
                  >
                    {toHex2(0)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl border px-4 py-2" style={{ background: C.panel, borderColor: C.ring }}>
          <div className="text-sm font-mono text-zinc-300">
            RAM vacía. Ejecuta un comando para ver bytes.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Hook de virtualización por scroll ===== */
function useVirtualRows(totalRows: number, rowHeight: number, containerRef: React.RefObject<HTMLDivElement | null>) {
  const [range, setRange] = React.useState({ start: 0, end: 20 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const scrollTop = el.scrollTop;
      const viewH = el.clientHeight;
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
      const end = Math.min(totalRows, Math.ceil((scrollTop + viewH) / rowHeight) + BUFFER_ROWS);
      setRange((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [totalRows, rowHeight, containerRef]);

  return range;
}

/* ============================ Componente principal ============================ */
function RamViewInner({ snap }: { snap: UiRamSnapshot }) {
  const baseAddr = Number.isFinite(snap?.baseAddr) ? snap.baseAddr : 0;
  const BPR = snap?.bytesPerRow ?? 16;
  const G = snap?.groupSize ?? 4;

  const buf = toU8(snap?.bytes);
  const rows = React.useMemo(() => splitRows(buf, baseAddr, BPR), [buf, baseAddr, BPR]);
  const isEmpty = buf.length === 0;

  const usagePct =
    snap?.used != null && snap?.capacity != null
      ? clamp((snap.used / Math.max(1, snap.capacity)) * 100)
      : null;

  const sortedRanges = React.useMemo(() => sortRanges(snap?.ranges ?? []), [snap?.ranges]);
  const activeEmphRange = React.useMemo(
    () => pickActiveEmphRange(sortedRanges, snap?.activeAddr),
    [sortedRanges, snap?.activeAddr]
  );

  const byteRangeMap = React.useMemo(() => {
    const map = new Map<number, ByteRange | null>();
    for (let addr = baseAddr; addr < baseAddr + buf.length; addr++) {
      map.set(addr, pickBestRangeAt(addr, sortedRanges, activeEmphRange));
    }
    return map;
  }, [sortedRanges, activeEmphRange, baseAddr, buf.length]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const { start: vStart, end: vEnd } = useVirtualRows(rows.length, ROW_H, scrollRef);

  // ScrollIntoView para activeAddr
  React.useEffect(() => {
    if (typeof snap?.activeAddr !== "number") return;
    const rowIdx = Math.floor((snap.activeAddr - baseAddr) / BPR);
    const el = scrollRef.current;
    if (!el || rowIdx < 0) return;
    const timer = setTimeout(() => {
      el.scrollTop = Math.max(0, rowIdx * ROW_H - el.clientHeight / 2 + ROW_H / 2);
    }, 100);
    return () => clearTimeout(timer);
  }, [snap?.activeAddr, baseAddr, BPR]);

  const totalH = rows.length * ROW_H;

  return (
    <section
      className="relative w-full rounded-2xl border overflow-hidden flex flex-col text-zinc-100"
      data-tour="panelRamView"
      style={{
        height: "clamp(360px,48vh,680px)",
        background: C.panel,
        borderColor: C.ring,
      }}
      role="region"
      aria-label="Módulo de memoria RAM"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
          <h2 className="text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap">
            SIMM / DIMM · RAM
          </h2>
          <span className="ml-1 sm:ml-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono hidden xs:inline">
            base <span className="text-zinc-200">{toHex8(baseAddr)}</span>
          </span>
        </div>
        {usagePct != null && (
          <div className="w-full sm:w-56">
            <div className="text-[10px] text-zinc-400 text-right mb-1">
              uso {usagePct.toFixed(0)}%
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.panelInner }}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400"
                style={{ width: `${usagePct}%`, transition: "width 300ms ease" }}
              />
            </div>
          </div>
        )}
      </div>

      <LegendBar />

      {/* Área de bytes virtualizada */}
      <div className="px-4 pb-4 w-full flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto overflow-x-hidden mem-scroll rounded-xl"
          style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
        >
          {isEmpty ? (
            <EmptyState baseAddr={baseAddr} bytesPerRow={BPR} groupSize={G} />
          ) : (
            <>
              <ColumnHeader bytesPerRow={BPR} groupSize={G} />
              <div style={{ height: totalH, position: "relative" }}>
                {rows.slice(vStart, vEnd).map((row, i) => {
                  const rowIdx = vStart + i;
                  const bytes = row.slice;
                  const spans = computeLabelSpans(row.addr, bytes.length, byteRangeMap);

                  return (
                    <div
                      key={row.addr}
                      className="absolute left-0 right-0 grid px-3 py-2"
                      style={{
                        top: rowIdx * ROW_H,
                        height: ROW_H,
                        gridTemplateColumns: `${ADDR_COL} 1fr`,
                        gridTemplateRows: "auto 1fr",
                        rowGap: "0.25rem",
                      }}
                    >
                      {/* etiquetas */}
                      <div />
                      <div
                        className="grid"
                        style={{
                          gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                          columnGap: GAP,
                        }}
                      >
                        {spans.map((s, si) => (
                          <div
                            key={si}
                            style={{ gridColumn: `${s.start + 1} / ${s.end + 2}` }}
                            className="justify-self-center"
                          >
                            <RowLabel range={s.range} />
                          </div>
                        ))}
                      </div>

                      {/* dirección */}
                      <div className="font-mono text-xs text-zinc-300 self-center">
                        <span
                          className="inline-block px-2 py-0.5 rounded-md text-[11px]"
                          style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
                        >
                          {toHex8(row.addr)}
                        </span>
                      </div>

                      {/* bytes */}
                      <div
                        className="grid self-center"
                        style={{
                          gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                          columnGap: GAP,
                        }}
                      >
                        {Array.from(bytes).map((b, ci) => {
                          const addr = row.addr + ci;
                          const best = byteRangeMap.get(addr) ?? null;
                          const hasRange = !!best;
                          const tone = hasRange ? normalizeTone(best?.tone) : "data";
                          const isEmph = !!activeEmphRange && inRange(addr, activeEmphRange);
                          const isActive = snap?.activeAddr === addr;
                          const groupSep = ci % G === 0 && ci !== 0;

                          return (
                            <div
                              key={ci}
                              className={`h-9 rounded-md border font-mono text-[11px] flex items-center justify-center select-none transition-colors duration-200 ${
                                hasRange ? TONE_CLS[tone].bg : "bg-zinc-900/40"
                              } ${
                                hasRange && isEmph ? `ring-2 ${TONE_CLS[tone].ring} z-10` : ""
                              } ${
                                isActive ? "outline outline-2 outline-white/40 z-10" : ""
                              } ${
                                groupSep ? "border-l-2 border-l-zinc-700/30" : ""
                              } border-zinc-700/30 text-zinc-200`}
                              title={`${toHex8(addr)}  •  dec ${b}${best?.label ? `  •  ${best.label.trim()}` : ""}`}
                            >
                              <span className="tracking-tight">{toHex2(b)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const RamView = React.memo(RamViewInner);
export default RamView;
