import { useState, useMemo, useRef, useEffect } from "react";
import { useAnchors } from "./AnchorRegistry";
import {
  HeapInspectorModal,
  type UiHeapEntry as HeapEntry,
} from "./components/HeapInspectorModal";

/* ───────── Tokens del tema (mismos que Stack) ───────── */
const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2430",
  ring: "#2E3948",
  text: "text-zinc-100",
  label: "text-[11px] text-zinc-300",
};
const KBD =
  "px-1.5 py-0.5 rounded font-mono text-[11px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]";

/* ───────── utils ───────── */
const hexToNum = (h: `0x${string}` | string): number =>
  typeof h === "string" ? parseInt(h, 16) : 0;

const bytesBetween = (fromHex?: `0x${string}`, toHex?: `0x${string}`) =>
  fromHex && toHex ? Math.max(0, hexToNum(toHex) - hexToNum(fromHex)) : 0;

const fmtB = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
    ? `${(n / 1024).toFixed(1)} KB`
    : `${(n / 1024 / 1024).toFixed(1)} MB`;

// nombre sin "var "
const prettyName = (s?: string) =>
  (s ?? "").replace(/^\s*var\s+/i, "").trim() || "";

/* ───────── tema por tipo (alineado a Stack) ───────── */
function kindTheme(kind: HeapEntry["kind"]) {
  switch (kind) {
    case "string":
      return {
        badge: "bg-pink-700/30 text-pink-100 ring-pink-400/40",
        rail: "from-pink-300/80 to-pink-200/60",
        meter: "#f472b6",
      };
    case "array":
      return {
        badge: "bg-sky-700/30 text-sky-100 ring-sky-400/40",
        rail: "from-sky-300/80 to-sky-200/60",
        meter: "#38bdf8",
      };
    case "object":
      return {
        badge: "bg-emerald-700/30 text-emerald-100 ring-emerald-400/40",
        rail: "from-emerald-300/80 to-emerald-200/60",
        meter: "#34d399",
      };
    default:
      return {
        badge: "bg-zinc-600/30 text-zinc-100 ring-zinc-400/35",
        rail: "from-zinc-300/70 to-zinc-200/50",
        meter: "#a1a1aa",
      };
  }
}

/* ───────── chips comunes (matching Stack) ───────── */
function Tag({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ring-1",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.06)]",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
function Mono({ children }: { children: React.ReactNode }) {
  return <code className="font-mono tabular-nums">{children}</code>;
}
function AddrBtn({ hex }: { hex: HeapEntry["addr"] }) {
  return (
    <button
      type="button"
      onClick={() => navigator?.clipboard?.writeText?.(hex)}
      className={`${KBD} hover:bg-[#324057] active:scale-[.98] transition`}
      title="Copiar dirección"
    >
      {hex}
      <svg
        className="h-3.5 w-3.5 opacity-80"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 17H8V7h11v15Z" />
      </svg>
    </button>
  );
}

/* Nombre destacado (como NamePill) */
function NameBadge({ name, kind }: { name?: string; kind: HeapEntry["kind"] }) {
  if (!name) return null;
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5
                 text-[13px] font-semibold text-zinc-100
                 bg-[#2D3747] ring-1 ring-[#3B4659]
                 max-w-[min(56ch,60vw)] truncate"
      title="nombre de la variable (si viene del stack)"
    >
      {name}
    </span>
  );
}

/* ───────── scroll info ───────── */
function useScrollInfo(ref: React.RefObject<HTMLDivElement>) {
  const [st, setSt] = useState({ pct: 0, atTop: true, atBottom: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = Math.max(1, scrollHeight - clientHeight);
      const pct = Math.min(1, Math.max(0, scrollTop / max));
      setSt({ pct, atTop: scrollTop <= 0, atBottom: scrollTop >= max - 1 });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);
  return st;
}

function ScrollFades({
  showTop,
  showBottom,
}: {
  showTop: boolean;
  showBottom: boolean;
}) {
  return (
    <>
      {showTop && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-6"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,.28), transparent)",
          }}
        />
      )}
      {showBottom && (
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-6"
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,.28), transparent)",
          }}
        />
      )}
    </>
  );
}

/* ───────── Vista principal ───────── */
export function HeapView({
  heap,
  pulseAddrs = [],
}: {
  heap: HeapEntry[];
  pulseAddrs?: number[];
}) {
  const [inspect, setInspect] = useState<HeapEntry | null>(null);
  const pulseSet = useMemo(() => new Set(pulseAddrs ?? []), [pulseAddrs]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { pct, atTop, atBottom } = useScrollInfo(scrollRef);

  return (
    <section className="relative h-full min-h-0">
      {/* Marco exterior sólido (igual a Stack) */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
        style={{
          border: `1px solid ${C.ring}`,
          boxShadow: "0 0 20px rgba(56,189,248,.10)",
        }}
      />
      {/* Cuerpo sólido */}
      <div
        className="relative h-full min-h-0 rounded-3xl p-3 flex flex-col overflow-hidden"
        style={{ background: C.panel }}
      >
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="grid place-items-center h-7 w-7 rounded-full"
              style={{ background: "#2D3747", border: `1px solid ${C.ring}` }}
            >
              🧰
            </span>
            <h2 className={`text-lg font-semibold tracking-wide ${C.text}`}>
              Heap
            </h2>
          </div>
          <div className="ml-auto text-xs text-zinc-300">{heap.length} items</div>
        </div>

        {/* barra de progreso del scroll (idéntica a Stack) */}
        <div
          className="mb-2 h-1 rounded-full overflow-hidden"
          style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>

        {/* Contenedor scrolleable con micro-grid tenue */}
        <div
          ref={scrollRef}
          className="relative flex-1 min-h-0 overflow-auto rounded-2xl p-2 stk-scroll"
          style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <ScrollFades showTop={!atTop} showBottom={!atBottom} />

          {heap.length === 0 ? (
            <div
              className="rounded-xl border border-dashed p-6 text-center text-sm"
              style={{ borderColor: C.ring, color: "#9aa3af", background: C.panelInner }}
            >
              Heap vacío.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-1">
              {heap.map((e) => (
                <HeapCard
                  key={e.addr}
                  entry={e}
                  pulse={pulseSet.has(hexToNum(e.addr))}
                  onInspect={() => setInspect(e)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <HeapInspectorModal
        open={!!inspect}
        entry={inspect}
        onClose={() => setInspect(null)}
      />
    </section>
  );
}

/* ───────── Donut + barra (sólidos) ───────── */
function MemoryMeter({
  headerBytes,
  dataBytes,
  color,
}: {
  headerBytes: number;
  dataBytes: number;
  color: string;
}) {
  const total = Math.max(1, headerBytes + Math.max(0, dataBytes));
  const pctH = Math.round((headerBytes / total) * 100);
  const pctD = Math.round((dataBytes / total) * 100);

  const donut = {
    backgroundImage: `conic-gradient(${color} 0 ${pctH}%, rgba(255,255,255,.18) ${pctH}% 100%)`,
  } as React.CSSProperties;

  return (
    <div className="grid grid-cols-[64px,1fr] gap-2 items-center">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full" style={donut} aria-hidden />
        <div
          className="absolute inset-1 rounded-full grid place-items-center"
          style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
        >
          <div className="text-[10px] leading-tight text-zinc-200 text-center">
            <div className="font-semibold">{pctH}%</div>
            <div className="opacity-70">hdr</div>
          </div>
        </div>
      </div>

      <div
        className="relative h-5 w-full rounded-full overflow-hidden"
        style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
      >
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${pctH}%`,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,.08))",
            boxShadow: `inset 0 0 0 9999px ${color}1F`,
          }}
        />
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${pctH}%`,
            width: `${pctD}%`,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.14), rgba(255,255,255,.06))",
          }}
        />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-200/90">
          header
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-200/90">
          {dataBytes > 0 ? "data" : "sin data"}
        </span>
      </div>
    </div>
  );
}

/* ───────── Card ───────── */
function HeapCard({
  entry,
  pulse,
  onInspect,
}: {
  entry: HeapEntry;
  pulse?: boolean;
  onInspect: () => void;
}) {
  const t = kindTheme(entry.kind);
  const { bind } = useAnchors();

  const headerBytes = bytesBetween(entry.range?.from, entry.range?.to);
  const dataRange = (entry as any).dataRange as
    | { from?: `0x${string}`; to?: `0x${string}` }
    | undefined;
  const dataBytes = dataRange ? bytesBetween(dataRange.from, dataRange.to) : 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-3 transition"
      style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
    >
      <span
        ref={bind(`heap-${entry.addr}`)}
        id={`heap-${entry.addr}`}
        className="pointer-events-none absolute -left-2 top-4 h-4 w-4"
      />
      {/* Rail a la izquierda (como Stack) */}
      <div
        className={`absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b ${t.rail}`}
        aria-hidden
      />

      {/* CABECERA */}
      <div className="flex flex-wrap items-center gap-2">
        <Tag className={t.badge}>kind</Tag>
        <span className="text-[12px] text-zinc-200 capitalize">{entry.kind}</span>
        <NameBadge name={prettyName(entry.label)} kind={entry.kind} />
        <div className="ml-auto flex items-center gap-2">
          <AddrBtn hex={entry.addr} />
          <RefCountPill count={entry.refCount} pulse={pulse} />
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="mt-2 grid gap-3 md:grid-cols-[minmax(0,1fr),auto]">
        <div className="grid gap-2">
          <MemoryMeter headerBytes={headerBytes} dataBytes={dataBytes} color={t.meter} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
            <div
              className="rounded-lg px-2 py-1"
              style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
            >
              <div className="opacity-80">header</div>
              <div className="flex items-center justify-between">
                <span className="font-mono">
                  [{entry.range.from} .. {entry.range.to})
                </span>
                <span className="opacity-90">{fmtB(headerBytes)}</span>
              </div>
            </div>

            <div
              className="rounded-lg px-2 py-1"
              style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
            >
              <div className="opacity-80">data</div>
              {dataRange?.from && dataRange?.to ? (
                <div className="flex items-center justify-between">
                  <span className="font-mono">
                    [{dataRange.from} .. {dataRange.to})
                  </span>
                  <span className="opacity-90">{fmtB(dataBytes)}</span>
                </div>
              ) : (
                <div className="text-zinc-400">sin data</div>
              )}
            </div>
          </div>
        </div>

        {/* meta compacta por tipo */}
        <div className="md:w-64">
          {entry.kind === "string" && <StringMeta meta={entry.meta} />}
          {entry.kind === "array" && <ArrayMeta meta={entry.meta} />}
          {entry.kind === "object" && <ObjectMeta meta={entry.meta} />}
          <div className="mt-3">
            <button
              onClick={onInspect}
              className="w-full md:w-auto rounded-md px-3 py-1.5 text-[12px]"
              style={{ background: "#2D3747", border: `1px solid ${C.ring}` }}
            >
              Ver Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Metas por tipo (sólidas) ───────── */

// STRING
function StringMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "string" }>["meta"];
}) {
  return (
    <div
      className="rounded-xl p-2"
      style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200">
        <Tag className="bg-[#2F394B] text-zinc-100 ring-[#3B4659]">len={meta.length}</Tag>
        <span className="text-[11px] text-zinc-300">2B por carácter (UTF-16LE)</span>
      </div>
    </div>
  );
}

// ARRAY
function ArrayMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "array" }>["meta"];
}) {
  const elem =
    (meta as any).elem?.name ??
    (meta as any).elemType ??
    (typeof (meta as any).elem === "string" ? (meta as any).elem : undefined);

  return (
    <div
      className="rounded-xl p-2"
      style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-200">
        <Tag className="bg-[#2F394B] text-zinc-100 ring-[#3B4659]">
          tamaño={meta.length}
        </Tag>
        {elem && (
          <Tag className="bg-[#2F394B] text-zinc-100 ring-[#3B4659]">
            tipo = <Mono>{elem}</Mono>
          </Tag>
        )}
      </div>
    </div>
  );
}

// OBJECT
function ObjectMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "object" }>["meta"];
}) {
  const schema = (meta as any)?.schema as
    | Array<{ key: string; type: string }>
    | undefined;

  if (Array.isArray(schema)) {
    return (
      <div
        className="rounded-xl p-2"
        style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
      >
        <div className="flex items-center gap-2 text-xs text-zinc-200">
          <Tag className="bg-[#2F394B] text-zinc-100 ring-[#3B4659]">
            atributos={schema.length}
          </Tag>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          {schema.map((f) => (
            <span
              key={f.key}
              className="text-[11px] rounded px-1 py-0.5 ring-1"
              style={{ background: "#2F394B", color: "#e5e7eb", borderColor: "#3B4659" }}
              title={`${f.key}: ${f.type}`}
            >
              {f.key}: <Mono>{f.type}</Mono>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-2"
      style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
    >
      <Tag className="bg-[#2F394B] text-zinc-100 ring-[#3B4659]">
        atributos=?
      </Tag>
    </div>
  );
}

/* ───────── UI atómica ───────── */
function RefCountPill({ count, pulse }: { count: number; pulse?: boolean }) {
  let cls = "bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659]";
  if (count <= 0) cls = "bg-rose-900/40 text-rose-200 ring-1 ring-rose-700/50";
  if (count >= 8)
    cls = "bg-emerald-900/40 text-emerald-200 ring-1 ring-emerald-700/50";

  return (
    <span
      className={`text-[11px] rounded px-1.5 py-0.5 ${cls} ${
        pulse ? "animate-pulse" : ""
      }`}
      title="Recuento de referencias"
    >
      refCount={count}
    </span>
  );
}
