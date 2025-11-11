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
const GAP = "0.28rem";
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

/* ---------- Prioridad local de rangos (robusto ante snapshots viejos) ---------- */
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

/* ---------- Resolución de solapamientos (núcleo nuevo) ---------- */

// Normalizador de tono
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
    : "slot";

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

/** Devuelve el rango enfatizado activo (si existe): el que contiene activeAddr; si no hay, el *emph* más pequeño. */
function pickActiveEmphRange(ranges: ByteRange[], activeAddr?: number) {
  const emphs = ranges.filter((r) => r.emph);
  if (!emphs.length) return null;
  if (typeof activeAddr === "number") {
    const hit = emphs.find((r) => inRange(activeAddr, r));
    if (hit) return hit;
  }
  return emphs.slice().sort((a, b) => a.size - b.size)[0] ?? null;
}

/** Elige el mejor rango que cubre `addr` (prioriza el activo → menor tamaño → mayor prioridad de tono). */
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

// Fondo de columnas agrupadas
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

/* ============================== Decoración PCB ============================== */
function PcbBackground() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 15% 0%, rgba(16,185,129,.10), transparent 60%), radial-gradient(1200px 700px at 85% 100%, rgba(34,197,94,.10), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(16,185,129,.25) 0 1px, transparent 1px 24px), repeating-linear-gradient(0deg, rgba(16,185,129,.15) 0 1px, transparent 1px 24px)",
        }}
      />
    </>
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
      {/* header de columnas */}
      <div
        className="grid px-3 pt-2 pb-2 bg-zinc-900/70 backdrop-blur-sm"
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

      {/* grid fantasma */}
      <div className="pb-2">
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, r) => (
          <div
            key={r}
            className="grid items-center px-3 py-2"
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
                      "h-8 rounded-lg border font-mono text-[11px] flex items-center justify-center select-none",
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

      {/* Mensaje central flotante */}
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

  // Rangos ordenados localmente + rango activo enfatizado
  const sortedRanges = React.useMemo(
    () => sortRanges(snap?.ranges ?? []),
    [snap?.ranges]
  );
  const activeEmphRange = React.useMemo(
    () => pickActiveEmphRange(sortedRanges, snap?.activeAddr),
    [sortedRanges, snap?.activeAddr]
  );

  // Agrupar filas en “chips”
  const chips: { id: number; rows: { addr: number; slice: Uint8Array }[] }[] =
    React.useMemo(() => {
      if (isEmpty) return [{ id: 0, rows: [] }];
      const out: { id: number; rows: { addr: number; slice: Uint8Array }[] }[] =
        [];
      for (let i = 0; i < rows.length; i += ROWS_PER_CHIP) {
        out.push({ id: out.length, rows: rows.slice(i, i + ROWS_PER_CHIP) });
      }
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
        "relative w-full h-full rounded-2xl border bg-emerald-950/20 text-zinc-100 shadow-2xl",
        "border-emerald-900/60 overflow-hidden",
        "flex flex-col",
      ].join(" ")}
      role="region"
      aria-label="Módulo de memoria RAM"
    >
      <PcbBackground />
      <GoldPins />

      {/* Encabezado del módulo */}
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

      {/* Área de bytes */}
      <div className="relative z-10 px-4 pb-6 w-full flex-1 min-h-0">
        <div
          className={`h-full pr-1 ${isEmpty ? "overflow-y-auto overflow-x-hidden" : "overflow-y-auto overflow-x-hidden"}`}
        >
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
                {/* Header de columnas */}
                <div
                  className="grid px-3 pt-2 pb-2 bg-zinc-900/70 backdrop-blur-sm"
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

                {/* Filas */}
                <div className="pb-2">
                  {chip.rows.map((row, ridx) => {
                    const bytes = Array.from(row.slice);
                    return (
                      <div
                        key={`${row.addr}-${ridx}`}
                        className="grid items-center px-3 py-2 transition-colors hover:bg-zinc-900/55"
                        style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
                      >
                        {/* Dirección */}
                        <div className="font-mono text-xs text-emerald-100/90">
                          <span className="inline-block px-2 py-1 rounded-lg bg-zinc-900/70 border border-emerald-800/60">
                            {toHex8(row.addr)}
                          </span>
                        </div>

                        {/* Bytes HEX */}
                        <div
                          className="grid pr-2"
                          style={{
                            gridTemplateColumns: `repeat(${BPR}, minmax(1rem, 1fr))`,
                            columnGap: GAP,
                          }}
                        >
                          {bytes.map((b, i) => {
                            const addr = row.addr + i;

                            // Rango “mejor” para este byte
                            const best = pickBestRangeAt(
                              addr,
                              sortedRanges,
                              activeEmphRange
                            );
                            const tone = normalizeTone(best?.tone);
                            const lbl = best?.label;

                            // Emph sólo si cae dentro del rango enfatizado activo
                            const isEmph = !!(
                              activeEmphRange && inRange(addr, activeEmphRange)
                            );
                            const isActive = snap?.activeAddr === addr;
                            const groupSep = i % G === 0 && i !== 0;

                            // etiqueta sólo en el primer byte del mismo rango elegido
                            const prevBest = pickBestRangeAt(
                              addr - 1,
                              sortedRanges,
                              activeEmphRange
                            );
                            const showLabelHere =
                              lbl && (!prevBest || prevBest.label !== lbl);

                            return (
                              <div
                                id={`ram-${addr}`}
                                key={i}
                                className={[
                                  "relative h-8 rounded-lg border font-mono text-[11px] flex items-center justify-center select-none",
                                  "border-emerald-800/60 text-emerald-50",
                                  TONE_CLS[tone].bg,
                                  "shadow-[inset_0_1px_0_rgba(255,255,255,.05),0_2px_6px_rgba(0,0,0,.25)]",
                                  "transition-transform will-change-transform hover:-translate-y-[1px] active:translate-y-0",
                                  groupSep
                                    ? "border-l-2 border-l-emerald-800/60"
                                    : "",
                                  isEmph
                                    ? `ring-2 ${TONE_CLS[tone].ring} ${TONE_CLS[tone].glow} z-10`
                                    : "",
                                  isActive
                                    ? "outline outline-2 outline-white/40 z-10"
                                    : "",
                                ].join(" ")}
                                title={`${toHex8(addr)}  •  dec ${b}${lbl ? `  •  ${lbl}` : ""}`}
                              >
                                <span className="tracking-tight">
                                  {toHex2(b)}
                                </span>

                                {showLabelHere && (
                                  <span
                                    className={`pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded px-1.5 py-[1px] text-[10px] ring-1 ${TONE_CLS[tone].text} bg-zinc-950/80 ring-emerald-800/60`}
                                  >
                                    {lbl}
                                  </span>
                                )}

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
