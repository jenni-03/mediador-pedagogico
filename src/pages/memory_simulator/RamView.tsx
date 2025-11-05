import * as React from "react";

/* ======================= Tipos (snapshot) ======================= */
export type ByteRange = {
  start: number;
  size: number;
  label?: string;
  tone: "header" | "data" | "slot" | "object";
  emph?: boolean; // énfasis (selección)
};
export type UiRamSnapshot = {
  baseAddr: number;
  bytes: Uint8Array;
  bytesPerRow: 16 | 8 | 32; // ← úsalo en vez de 16 fijo
  groupSize: 1 | 2 | 4 | 8; // ← úsalo en vez de 4 fijo
  ranges: ByteRange[];
  activeAddr?: number;
  used?: number;
  capacity?: number;
};

/* ============================== Constantes de layout ============================== */
const ADDR_COL = "11ch";
const CELL_RESP = "clamp(1.35rem, 1.0vw + .75rem, 2.0rem)";
const GAP = "0.28rem";

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
function labelAt(addr: number, ranges: ByteRange[]): string | undefined {
  for (const r of ranges) {
    const a0 = r.start,
      a1 = r.start + r.size;
    if (addr >= a0 && addr < a1) return r.label;
  }
  return undefined;
}
function toneAt(
  addr: number,
  ranges: ByteRange[]
): ByteRange["tone"] | undefined {
  for (const r of ranges) {
    const a0 = r.start,
      a1 = r.start + r.size;
    if (addr >= a0 && addr < a1) return r.tone;
  }
  return undefined;
}
function emphAt(addr: number, ranges: ByteRange[]): boolean {
  for (const r of ranges) {
    if (!r.emph) continue;
    const a0 = r.start,
      a1 = r.start + r.size;
    if (addr >= a0 && addr < a1) return true;
  }
  return false;
}

// Fondo de columnas agrupadas: línea sutil cada `groupSize` celdas
function groupBgCSS(bytesPerRow: number, groupSize: number) {
  // ancho de grupo en porcentaje del contenedor de 0..100%
  const w = `calc(${groupSize} * 100% / ${bytesPerRow} - 1px)`;
  return `repeating-linear-gradient(90deg, transparent, transparent ${w}, rgba(255,255,255,.09) 0, rgba(255,255,255,.09) 1px)`;
}

/* Paleta por tono (neón sutil) */
const TONE_CLS: Record<
  NonNullable<ByteRange["tone"]>,
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
};

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

  const usagePct =
    snap?.used != null && snap?.capacity != null
      ? clamp((snap.used / Math.max(1, snap.capacity)) * 100)
      : null;

  return (
    <section
      className={[
        "w-full h-full rounded-2xl border bg-zinc-950 text-zinc-100 shadow-2xl",
        "border-zinc-800 relative overflow-hidden",
        "flex flex-col",
      ].join(" ")}
    >
      {/* Fondo gamer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 24px 24px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,.22) 0px, rgba(255,255,255,.22) 1px, transparent 2px, transparent 4px)",
        }}
      />

      {/* Encabezado */}
      <div className="relative z-10 p-4 pb-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,.8)]" />
          <h2 className="text-xl font-semibold tracking-tight">RAM</h2>
        </div>
        {usagePct != null && (
          <div className="w-56">
            <div className="text-[10px] text-zinc-400 text-right mb-1">
              {usagePct.toFixed(0)}%
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400 transition-all"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Marco principal */}
      <div className="relative z-10 px-4 pb-4 w-full flex-1 min-h-0">
        <div className="h-full rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
          {/* Header offsets */}
          <div
            className="sticky top-0 z-[1] grid px-3 pt-3 pb-2 bg-zinc-900/70 backdrop-blur-sm shrink-0"
            style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
          >
            <div className="text-xs text-zinc-400 font-mono">Addr</div>
            <div
              className="grid relative"
              style={{
                gridTemplateColumns: `repeat(${BPR}, minmax(${CELL_RESP}, 1fr))`,
                gap: GAP,
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
                  className="text-[10px] md:text-[11px] font-mono text-center text-zinc-400"
                >
                  {toHex2(i)}
                </div>
              ))}
            </div>
          </div>

          {/* Filas */}
          <div className="flex-1 min-h-0 overflow-auto">
            {rows.map((row, ridx) => {
              const bytes = Array.from(row.slice);
              return (
                <div
                  key={`${row.addr}-${ridx}`}
                  className="grid items-center px-3 py-2 transition-colors hover:bg-zinc-900/55"
                  style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
                >
                  <div className="font-mono text-xs text-zinc-300">
                    <span className="inline-block px-2 py-1 rounded-lg bg-zinc-900/70 border border-zinc-700/60">
                      {toHex8(row.addr)}
                    </span>
                  </div>

                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${BPR}, minmax(${CELL_RESP}, 1fr))`,
                      gap: GAP,
                    }}
                  >
                    {bytes.map((b, i) => {
                      const addr = row.addr + i;
                      const tone = toneAt(addr, snap.ranges) ?? "slot";
                      const isEmph = emphAt(addr, snap.ranges);
                      const isActive = snap?.activeAddr === addr;
                      const groupSep = i % G === 0 && i !== 0;
                      const lbl = labelAt(addr, snap.ranges);

                      return (
                        <div
                          key={i}
                          className={[
                            "relative h-8 rounded-lg border font-mono text-[11px] flex items-center justify-center select-none",
                            "border-zinc-700/60 text-zinc-100",
                            TONE_CLS[tone].bg,
                            "shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_2px_6px_rgba(0,0,0,.25)]",
                            "transition-transform will-change-transform hover:-translate-y-[1px] active:translate-y-0",
                            groupSep ? "border-l-2 border-l-zinc-700/60" : "",
                            isEmph
                              ? `ring-2 ${TONE_CLS[tone].ring} ${TONE_CLS[tone].glow}`
                              : "",
                            isActive
                              ? "outline outline-2 outline-white/40"
                              : "",
                          ].join(" ")}
                          title={`${toHex8(addr)}  •  dec ${b}${lbl ? `  •  ${lbl}` : ""}`}
                        >
                          <span className="tracking-tight">{toHex2(b)}</span>
                          <span className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.08] bg-gradient-to-b from-white/30 to-transparent" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
