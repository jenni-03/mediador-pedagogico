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

/* ============================== Constantes de layout ============================== */
const ADDR_COL = "11ch";
const GAP = "0.32rem";
const ROWS_PER_CHIP = 8;
const PINS = 48;
const PLACEHOLDER_ROWS = 6;

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

function groupBgCSS(bytesPerRow: number, groupSize: number) {
  const w = `calc(${groupSize} * 100% / ${bytesPerRow} - 1px)`;
  return `repeating-linear-gradient(90deg, transparent, transparent ${w}, rgba(255,255,255,.08) 0, rgba(255,255,255,.08) 1px)`;
}

/* Paleta por tono */
const TONE_CLS: Record<
  Tone,
  { bg: string; ring: string; glow: string; text: string }
> = {
  header: {
    bg: "bg-cyan-900/40",
    ring: "ring-cyan-400/70",
    glow: "shadow-[0_0_8px_rgba(34,211,238,.35)]",
    text: "text-cyan-100",
  },
  data: {
    bg: "bg-emerald-900/35",
    ring: "ring-emerald-400/70",
    glow: "shadow-[0_0_8px_rgba(52,211,153,.35)]",
    text: "text-emerald-100",
  },
  slot: {
    bg: "bg-zinc-900/70",
    ring: "ring-zinc-400/60",
    glow: "shadow-[0_0_6px_rgba(161,161,170,.25)]",
    text: "text-zinc-200",
  },
  object: {
    bg: "bg-fuchsia-900/35",
    ring: "ring-fuchsia-400/70",
    glow: "shadow-[0_0_8px_rgba(232,121,249,.35)]",
    text: "text-fuchsia-100",
  },
  prim: {
    bg: "bg-sky-900/35",
    ring: "ring-sky-400/70",
    glow: "shadow-[0_0_8px_rgba(56,189,248,.35)]",
    text: "text-sky-100",
  },
  array: {
    bg: "bg-emerald-900/35",
    ring: "ring-emerald-400/70",
    glow: "shadow-[0_0_8px_rgba(52,211,153,.35)]",
    text: "text-emerald-100",
  },
  string: {
    bg: "bg-indigo-900/35",
    ring: "ring-indigo-400/70",
    glow: "shadow-[0_0_8px_rgba(129,140,248,.35)]",
    text: "text-indigo-100",
  },
};

/* ============================== PCB / Decoración ============================== */
function PcbBoard() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% -10%, rgba(16,185,129,.11), transparent 62%), radial-gradient(1200px 700px at 85% 110%, rgba(34,197,94,.12), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(16,185,129,.22) 0 1px, transparent 1px 22px), repeating-linear-gradient(0deg, rgba(16,185,129,.14) 0 1px, transparent 1px 22px)",
        }}
      />
      <svg
        className="absolute inset-0 opacity-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="trace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(74,222,128,.35)" />
            <stop offset="100%" stopColor="rgba(45,212,191,.25)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={i}
            d={`M ${-10 + i * 18} 0 C ${10 + i * 18} 25, ${
              -10 + i * 18
            } 75, ${10 + i * 18} 100`}
            fill="none"
            stroke="url(#trace)"
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <circle
            key={`v${i}`}
            cx={(i * 100) / 17}
            cy={(i * 70) % 100}
            r="1.2"
            fill="rgba(250,250,250,.06)"
          />
        ))}
      </svg>
    </>
  );
}

function ModuleNotch() {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 -translate-x-1/2 top-0 w-24 h-3 rounded-b-2xl bg-emerald-900/70"
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.15)",
        border: "1px solid rgba(6,95,70,.6)",
        borderTop: "none",
      }}
    />
  );
}

function GoldPins() {
  return (
    <div className="pointer-events-none absolute left-10 right-10 bottom-1 h-3 flex items-end gap-[2px]">
      {Array.from({ length: PINS }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-[10px] rounded-[2px] bg-amber-300 shadow-[inset_0_1px_0_rgba(255,255,255,.6),inset_0_-1px_0_rgba(124,45,18,.5)]"
          style={{ opacity: i % 2 === 0 ? 0.95 : 0.8, filter: "saturate(1.2)" }}
        />
      ))}
    </div>
  );
}

/* ===== Leyenda de tonos (para estudiantes) ===== */
function LegendChip({ tone, label }: { tone: Tone; label: string }) {
  const c = TONE_CLS[tone];
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ring-1",
        c.bg,
        c.text,
        c.ring,
      ].join(" ")}
    >
      <span className="h-2 w-2 rounded-full bg-white/80" />
      {label}
    </span>
  );
}

function LegendBar() {
  return (
    <div className="relative z-10 px-4 pb-2 flex flex-wrap items-center gap-2 text-[10px]">
      <LegendChip tone="header" label="header · metadatos" />
      <LegendChip tone="prim" label="prim · valor directo" />
      <LegendChip tone="string" label="string · texto / ref" />
      <LegendChip tone="object" label="object · campos" />
      <LegendChip tone="data" label="data · bloque de datos" />
      <LegendChip tone="slot" label="slot · puntero / stack" />
      <span className="ml-auto text-emerald-100/70">
        Tip: algunos campos guardan un puntero (ptr →) a otro bloque.
      </span>
    </div>
  );
}

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
  ranges: ByteRange[],
  prefer?: ByteRange | null
): LabelSpan[] {
  const spans: LabelSpan[] = [];
  let current: LabelSpan | null = null;

  for (let i = 0; i < count; i++) {
    const addr = rowAddr + i;
    const best = pickBestRangeAt(addr, ranges, prefer);

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
      if (current) {
        spans.push(current);
        current = null;
      }
    }
  }
  if (current) spans.push(current);
  return spans;
}

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
      <div
        className="grid px-3 pt-2 pb-2 bg-zinc-900/70"
        style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
      >
        <div className="text-xs text-emerald-200/60 font-mono">Addr</div>
        <div
          className="grid relative pr-2"
          style={{
            gridTemplateColumns: `repeat(${bytesPerRow}, minmax(1rem, 1fr))`,
            columnGap: GAP,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 right-0"
            style={{ backgroundImage: groupBgCSS(bytesPerRow, groupSize) }}
          />
          {Array.from({ length: bytesPerRow }, (_, i) => (
            <div
              key={i}
              className="text-[10px] md:text-[11px] font-mono text-center text-emerald-300/40"
            >
              {toHex2(i)}
            </div>
          ))}
        </div>
      </div>

      <div className="pb-2">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, r) => (
          <div
            key={r}
            className="grid items-center px-3 py-2.5"
            style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
          >
            <div className="font-mono text-xs">
              <span className="inline-block px-2 py-1 rounded-lg bg-zinc-900/60 border border-emerald-900/40 text-emerald-200/50">
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
                    className={[
                      "h-10 rounded-lg border font-mono text-[11px] flex items-center justify-center select-none",
                      "border-emerald-900/40 text-emerald-200/25 bg-zinc-900/40",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,.04)]",
                      groupSep ? "border-l-2 border-l-emerald-900/40" : "",
                    ].join(" ")}
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
        <div className="rounded-xl border border-emerald-800/40 bg-zinc-950/70 px-4 py-2 shadow-lg">
          <div className="text-sm font-mono text-emerald-200/90">
            RAM vacía. Ejecuta un comando para ver bytes.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Componente ============================ */
export default function RamView({ snap }: { snap: UiRamSnapshot }) {
  const baseAddr = Number.isFinite(snap?.baseAddr) ? snap.baseAddr : 0;
  const BPR = snap?.bytesPerRow ?? 16;
  const G = snap?.groupSize ?? 4;

  const buf = toU8(snap?.bytes);
  const rows = React.useMemo(
    () => splitRows(buf, baseAddr, BPR),
    [buf, baseAddr, BPR]
  );
  const isEmpty = buf.length === 0;

  const usagePct =
    snap?.used != null && snap?.capacity != null
      ? clamp((snap.used / Math.max(1, snap.capacity)) * 100)
      : null;

  const sortedRanges = React.useMemo(
    () => sortRanges(snap?.ranges ?? []),
    [snap?.ranges]
  );
  const activeEmphRange = React.useMemo(
    () => pickActiveEmphRange(sortedRanges, snap?.activeAddr),
    [sortedRanges, snap?.activeAddr]
  );

  const chips: { id: number; rows: { addr: number; slice: Uint8Array }[] }[] =
    React.useMemo(() => {
      if (isEmpty) return [{ id: 0, rows: [] }];
      const out: {
        id: number;
        rows: { addr: number; slice: Uint8Array }[];
      }[] = [];
      for (let i = 0; i < rows.length; i += ROWS_PER_CHIP)
        out.push({ id: out.length, rows: rows.slice(i, i + ROWS_PER_CHIP) });
      return out.length ? out : [{ id: 0, rows: [] }];
    }, [rows, isEmpty]);

  React.useEffect(() => {
    if (typeof snap?.activeAddr !== "number") return;
    const el = document.getElementById(`ram-${snap.activeAddr >>> 0}`);
    el?.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });
  }, [snap?.activeAddr]);

  return (
    <section
      className={[
        "relative w-full rounded-2xl border bg-emerald-950/20 text-zinc-100 shadow-2xl",
        "border-emerald-900/60 overflow-hidden flex flex-col",
      ].join(" ")}
      style={{
        height: "clamp(360px,48vh,680px)", // 💡 misma altura que RamIndexPanel
      }}
      role="region"
      aria-label="Módulo de memoria RAM"
    >
      {/* 🎨 Estilo de scroll específico para RamView */}
      <style>{`
        .ramview-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148,163,184,0.8) transparent; /* Firefox */
        }
        .ramview-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .ramview-scroll::-webkit-scrollbar-track {
          background: radial-gradient(circle at 50% 0%, rgba(148,163,184,0.18), transparent 55%);
          border-radius: 9999px;
        }
        .ramview-scroll::-webkit-scrollbar-thumb {
          background-image: linear-gradient(
            to bottom,
            rgba(148,163,184,0.95),
            rgba(56,189,248,0.95)
          );
          border-radius: 9999px;
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.95),
            0 0 8px rgba(56,189,248,0.65);
        }
        .ramview-scroll::-webkit-scrollbar-thumb:hover {
          background-image: linear-gradient(
            to bottom,
            rgba(226,232,240,0.98),
            rgba(59,130,246,0.98)
          );
        }
        .ramview-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <PcbBoard />
      <ModuleNotch />
      <GoldPins />

      {/* Header */}
      <div className="relative z-10 p-4 pb-2 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,.8)]" />
          <h2 className="text-lg font-semibold tracking-tight">
            SIMM / DIMM · RAM
          </h2>
          <span className="ml-2 text-[11px] text-emerald-200/90 font-mono">
            base <span className="text-emerald-100">{toHex8(baseAddr)}</span>
          </span>
        </div>
        {usagePct != null && (
          <div className="w-56">
            <div className="text-[10px] text-emerald-200/80 text-right mb-1">
              uso {usagePct.toFixed(0)}%
            </div>
            <div className="h-2 rounded-full bg-emerald-900/40 overflow-hidden ring-1 ring-emerald-700/40">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400 transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Leyenda de colores */}
      <LegendBar />

      {/* Área de bytes */}
      <div className="relative z-10 px-4 pb-6 w-full flex-1 min-h-0">
        <div className="h-full pr-1 overflow-y-auto overflow-x-hidden ramview-scroll">
          {isEmpty ? (
            <div className="mb-4 rounded-2xl border border-emerald-800/50 bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_8px_24px_rgba(0,0,0,.35)] overflow-hidden min-h-[240px]">
              <EmptyState baseAddr={baseAddr} bytesPerRow={BPR} groupSize={G} />
            </div>
          ) : (
            chips.map((chip) => (
              <div
                key={chip.id}
                className="mb-4 rounded-2xl border border-emerald-800/50 bg-zinc-950/60 shadow-[inset_0_1px_0_rgba(255,255,255,.04),0_8px_24px_rgba(0,0,0,.35)] overflow-hidden"
              >
                {/* encabezado columnas */}
                <div
                  className="grid px-3 pt-2 pb-3 bg-zinc-900/70"
                  style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
                >
                  <div className="text-xs text-emerald-200/80 font-mono">
                    Addr
                  </div>
                  <div
                    className="grid relative pr-2"
                    style={{
                      gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                      columnGap: GAP,
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 left-0 right-0"
                      style={{ backgroundImage: groupBgCSS(BPR, G) }}
                    />
                    {Array.from({ length: BPR }, (_, i) => (
                      <div
                        key={i}
                        className="text-[10px] md:text-[11px] font-mono text-center text-emerald-300/70"
                      >
                        {toHex2(i)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* filas */}
                <div className="pt-2 pb-2">
                  {chip.rows.map((row, ridx) => {
                    const bytes = Array.from(row.slice);
                    const spans = computeLabelSpans(
                      row.addr,
                      bytes.length,
                      sortedRanges,
                      activeEmphRange
                    );

                    return (
                      <div
                        key={`${row.addr}-${ridx}`}
                        className="grid px-3 py-3 transition-colors hover:bg-zinc-900/55"
                        style={{
                          gridTemplateColumns: `${ADDR_COL} 1fr`,
                          gridTemplateRows: "auto auto",
                          rowGap: "0.35rem",
                        }}
                      >
                        {/* fila 1, col 1: vacío */}
                        <div />

                        {/* fila 1, col 2: etiquetas */}
                        <div
                          className="grid"
                          style={{
                            gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                            columnGap: GAP,
                          }}
                        >
                          {spans.map((s, i) => (
                            <div
                              key={i}
                              style={{
                                gridColumn: `${s.start + 1} / ${s.end + 2}`,
                              }}
                              className="justify-self-center"
                            >
                              <RowLabel range={s.range} />
                            </div>
                          ))}
                        </div>

                        {/* fila 2, col 1: dirección */}
                        <div className="font-mono text-xs text-emerald-100/90">
                          <span className="inline-block px-2 py-1 rounded-lg bg-zinc-900/70 border border-emerald-800/60">
                            {toHex8(row.addr)}
                          </span>
                        </div>

                        {/* fila 2, col 2: bytes */}
                        <div
                          className="grid"
                          style={{
                            gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                            columnGap: GAP,
                          }}
                        >
                          {bytes.map((b, i) => {
                            const addr = row.addr + i;
                            const best = pickBestRangeAt(
                              addr,
                              sortedRanges,
                              activeEmphRange
                            );
                            const hasRange = !!best;
                            const tone = hasRange
                              ? normalizeTone(best?.tone)
                              : "data";
                            const isEmph =
                              !!activeEmphRange &&
                              inRange(addr, activeEmphRange);
                            const isActive = snap?.activeAddr === addr;
                            const groupSep = i % G === 0 && i !== 0;

                            const rangeLabel = best?.label?.trim();
                            const tooltip = rangeLabel
                              ? `${toHex8(addr)}  •  dec ${b}  •  ${rangeLabel}`
                              : `${toHex8(addr)}  •  dec ${b}`;

                            return (
                              <div
                                id={`ram-${addr}`}
                                key={i}
                                className={[
                                  "relative h-10 rounded-lg border font-mono text-[11px] flex items-center justify-center select-none",
                                  "border-emerald-800/60 text-emerald-50",
                                  hasRange
                                    ? TONE_CLS[tone].bg
                                    : "bg-zinc-900/40",
                                  "shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_2px_6px_rgba(0,0,0,.25)]",
                                  "transition-transform will-change-transform hover:-translate-y-[1px] active:translate-y-0",
                                  groupSep
                                    ? "border-l-2 border-l-emerald-800/60"
                                    : "",
                                  hasRange && isEmph
                                    ? `ring-2 ${TONE_CLS[tone].ring} ${TONE_CLS[tone].glow} z-10`
                                    : "",
                                  isActive
                                    ? "outline outline-2 outline-white/40 z-10"
                                    : "",
                                ].join(" ")}
                                title={tooltip}
                              >
                                <span className="tracking-tight">
                                  {toHex2(b)}
                                </span>
                                <span className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.06] bg-gradient-to-b from-white/30 to-transparent" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
