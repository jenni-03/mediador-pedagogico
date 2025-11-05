import { useEffect, useMemo, useRef, useState } from "react";
import type { PrimitiveType } from "../../../shared/utils/RAM/memoria/layout";

type Props = {
  length: number;
  base: number; // dataPtr
  elemSize: number; // bytes por elemento
  elemType?: PrimitiveType;
  resolveValue?: (type: PrimitiveType, addr: number) => unknown;

  /** Opciones de UI */
  chunkSize?: number; // elementos por bloque (default 16)
  maxHeight?: number; // tope duro (px)
  vhCap?: number; // tope relativo al viewport (%, default 60)
  compact?: boolean; // reduce paddings
  className?: string;

  /** Personalización de tarjetas */
  valueLabel?: string; // texto del label (p.ej. "carácter")
  renderValue?: (v: unknown) => React.ReactNode; // formateo del valor
};

const hex = (n: number) => "0x" + n.toString(16);

export function ArrayElementsPanel({
  length,
  base,
  elemSize,
  elemType,
  resolveValue,
  chunkSize = 16,
  maxHeight = 520,
  vhCap = 60,
  compact = false,
  className = "",
  valueLabel,
  renderValue,
}: Props) {
  // Bloques [start..end]
  const groups = useMemo(() => {
    const g: Array<{ start: number; end: number }> = [];
    for (let start = 0; start < length; start += chunkSize) {
      const end = Math.min(length - 1, start + chunkSize - 1);
      g.push({ start, end });
    }
    return g;
  }, [length, chunkSize]);

  // refs de grupo (para saltar)
  const groupRefs = useRef<Array<HTMLDivElement | null>>([]);
  groupRefs.current = [];
  const setGroupRef = (el: HTMLDivElement | null) => {
    if (el) groupRefs.current.push(el);
  };

  const [activeIdx, setActiveIdx] = useState(0);
  const onJump = (i: number) => {
    const el = groupRefs.current[i];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveIdx(i);
  };

  // Altura efectiva (cap por viewport)
  const [effectiveMaxH, setEffectiveMaxH] = useState<number>(maxHeight);
  useEffect(() => {
    const compute = () => {
      const byVh =
        typeof window !== "undefined"
          ? Math.floor((vhCap / 100) * window.innerHeight)
          : maxHeight;
      setEffectiveMaxH(Math.min(maxHeight, byVh));
    };
    compute();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", compute);
      return () => window.removeEventListener("resize", compute);
    }
  }, [vhCap, maxHeight]);

  // vacío
  if (length <= 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-sm text-neutral-400">
        — arreglo vacío —
      </div>
    );
  }

  const defaultValueLabel =
    valueLabel ?? (elemType === "char" ? "carácter" : "valor");

  const cardPad = compact ? "p-2" : "p-3";

  return (
    <div
      className={`rounded-xl border border-neutral-800 bg-neutral-900/40 ${className}`}
    >
      {/* índice de bloques */}
      <div className="sticky top-0 z-[1] flex flex-wrap gap-1.5 p-2 border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
        {groups.map((g, i) => (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`px-2 py-1 rounded text-[11px] ring-1 transition
              ${
                i === activeIdx
                  ? "bg-red-600/20 text-red-200 ring-red-500/40"
                  : "bg-neutral-800 text-neutral-200 ring-neutral-700 hover:bg-neutral-700"
              }`}
            title={`Ir a elementos ${g.start}–${g.end}`}
          >
            {g.start}–{g.end}
          </button>
        ))}
      </div>

      {/* área scrolleable */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight: effectiveMaxH }}
        onScroll={(e) => {
          const container = e.currentTarget as HTMLDivElement;
          const cTop = container.getBoundingClientRect().top;
          let current = 0;
          for (let i = 0; i < groupRefs.current.length; i++) {
            const node = groupRefs.current[i];
            if (!node) continue;
            const nTop = node.getBoundingClientRect().top - cTop;
            if (nTop <= 8) current = i;
            else break;
          }
          if (current !== activeIdx) setActiveIdx(current);
        }}
      >
        {groups.map((g, gi) => (
          <div key={gi} ref={setGroupRef}>
            {/* cabecera del bloque */}
            <div className="sticky top-0 z-[1] px-3 py-1 bg-neutral-950/70 backdrop-blur border-b border-neutral-800">
              <div className="text-[12px] text-neutral-300 font-mono">
                Bloque {gi}: [{g.start} – {g.end}] · addr{" "}
                {hex(base + g.start * elemSize)} —{" "}
                {hex(base + g.end * elemSize + (elemSize - 1))}
              </div>
            </div>

            {/* grid */}
            <div
              className={`p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3`}
            >
              {Array.from({ length: g.end - g.start + 1 }).map((_, k) => {
                const i = g.start + k;
                const addr = base + i * elemSize;

                let raw: unknown = "¿?";
                if (resolveValue && elemType) {
                  try {
                    raw = resolveValue(elemType, addr);
                  } catch {
                    raw = "¿?";
                  }
                }

                const valNode = renderValue ? (
                  renderValue(raw)
                ) : (
                  <code className="font-mono text-neutral-50 text-lg">
                    {typeof raw === "bigint"
                      ? (raw as bigint).toString()
                      : String(raw)}
                  </code>
                );

                return (
                  <div
                    key={i}
                    className={`rounded-xl border border-neutral-800 bg-neutral-900/40 ${cardPad}
                                hover:border-red-700/70 hover:shadow-[0_0_0_1px_rgba(220,38,38,0.25)] transition`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-neutral-400">[{i}]</div>
                      <div className="text-[11px] text-neutral-400">
                        addr <code className="font-mono">{hex(addr)}</code>
                      </div>
                    </div>

                    <div className={compact ? "text-sm" : "text-base"}>
                      <span className="opacity-70 mr-1 text-neutral-300">
                        {defaultValueLabel}:
                      </span>
                      {valNode}
                    </div>

                    {/* pistas: bytes del elemento */}
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: elemSize }).map((__, b) => (
                        <span
                          key={b}
                          className="h-3.5 w-3.5 rounded-sm border border-neutral-700 bg-neutral-800"
                          title={`Byte ${b} del elemento`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* pie */}
      <div className="px-3 py-2 border-t border-neutral-800 text-[12px] text-neutral-400">
        Consejo: usa el índice superior para saltar por bloques. Cada bloque
        muestra {chunkSize} elementos.
      </div>
    </div>
  );
}
