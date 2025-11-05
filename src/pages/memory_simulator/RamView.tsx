import * as React from "react";

/* ======================= Tipos (snapshot) ======================= */
export type ByteRange = {
  start: number;
  size: number;
  label?: string;
  tone: "header" | "data" | "slot" | "object";
};

export type UiRamSnapshot = {
  baseAddr: number;
  bytes: Uint8Array;
  bytesPerRow: 16;
  groupSize: 1 | 2 | 4 | 8; // ignorado aquí
  ranges: ByteRange[]; // ignorado aquí
  activeAddr?: number;
  used?: number;
  capacity?: number;
};

/* ============================== Constantes de layout ============================== */
const ADDR_COL = "10ch"; // ancho de la columna de direcciones
const CELL = "2.0rem"; // ancho de cada celda
const GAP = "0.25rem"; // gap ≈ gap-1 de Tailwind

/* ============================== Utils ============================== */
const toHex2 = (n: number) => n.toString(16).padStart(2, "0");
const toHex8 = (n: number) => `0x${n.toString(16).padStart(8, "0")}` as const;
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

function toU8(x: unknown): Uint8Array {
  if (x instanceof Uint8Array) return x;
  if (Array.isArray(x)) return new Uint8Array(x as number[]);
  if (x != null)
    console.warn("[RamView] bytes no es Uint8Array; usando buffer vacío.");
  return new Uint8Array(0);
}

function splitRows(bytes: Uint8Array, baseAddr: number, bytesPerRow = 16) {
  const rows: { addr: number; slice: Uint8Array }[] = [];
  for (let i = 0; i < bytes.length; i += bytesPerRow) {
    rows.push({
      addr: baseAddr + i,
      slice: bytes.subarray(i, i + bytesPerRow),
    });
  }
  if (rows.length === 0)
    rows.push({ addr: baseAddr, slice: new Uint8Array(0) });
  return rows;
}

/* ============================ Componente ============================ */
export default function RamView({ snap }: { snap: UiRamSnapshot }) {
  const baseAddr = Number.isFinite(snap?.baseAddr) ? snap.baseAddr : 0;
  const buf = toU8(snap?.bytes);

  const rows = React.useMemo(
    () => splitRows(buf, baseAddr, 16),
    [buf, baseAddr]
  );

  const usagePct =
    snap?.used != null && snap?.capacity != null
      ? clamp((snap.used / Math.max(1, snap.capacity)) * 100)
      : null;

  const isEmpty = buf.length === 0;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-zinc-100 shadow-xl">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">RAM</h2>
        {usagePct != null && (
          <div className="w-56 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-400"
              style={{ width: `${usagePct}%` }}
            />
          </div>
        )}
      </div>

      {/* Contenedor común: header offsets + filas */}
      <div className="mt-2 max-h-[520px] overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        {/* Header de offsets alineado */}
        <div
          className="sticky top-0 z-[1] grid px-3 pt-3 pb-2 bg-zinc-900/60 backdrop-blur-sm"
          style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
        >
          <div className="text-xs text-zinc-400 font-mono">Addr</div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(16, ${CELL})`,
              gap: GAP,
            }}
          >
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="text-[10px] font-mono text-center text-zinc-400"
              >
                {toHex2(i)}
              </div>
            ))}
          </div>
        </div>

        {/* Filas */}
        {rows.map((row, ridx) => {
          const bytes = Array.from(row.slice);
          return (
            <div
              key={`${row.addr}-${ridx}`}
              className="grid items-center px-3 py-2"
              style={{ gridTemplateColumns: `${ADDR_COL} 1fr` }}
            >
              <div className="font-mono text-xs text-zinc-300">
                {toHex8(row.addr)}
              </div>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(16, ${CELL})`,
                  gap: GAP,
                }}
              >
                {bytes.length
                  ? bytes.map((b, i) => {
                      const addr = row.addr + i;
                      const active = snap?.activeAddr === addr;
                      return (
                        <div
                          key={i}
                          className={[
                            "h-7 rounded-md border font-mono text-xs flex items-center justify-center select-none",
                            "bg-zinc-950/80 border-zinc-700 text-zinc-100",
                            active
                              ? "ring-2 ring-red-400 shadow-[0_0_8px_rgba(244,63,94,.35)]"
                              : "",
                          ].join(" ")}
                          title={`${toHex8(addr)} • dec ${b}`}
                        >
                          {toHex2(b)}
                        </div>
                      );
                    })
                  : Array.from({ length: 16 }, (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="h-7 rounded-md border border-zinc-800/70 bg-zinc-900/30"
                        title="sin dato"
                      />
                    ))}
              </div>
            </div>
          );
        })}
      </div>

      {isEmpty && (
        <div className="mt-3 text-xs text-zinc-400">
          Sin datos de RAM aún. Asegúrate de que{" "}
          <span className="font-mono">snapshot.ram.bytes</span> sea
          <span className="font-mono"> Uint8Array</span> y que{" "}
          <span className="font-mono">baseAddr</span> esté inicializado.
        </div>
      )}
    </section>
  );
}
