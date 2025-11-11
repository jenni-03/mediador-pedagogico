import { useState, useMemo, useRef, useEffect } from "react";
import { useAnchors } from "./AnchorRegistry";
import {
  HeapInspectorModal,
  type UiHeapEntry as HeapEntry,
} from "./components/HeapInspectorModal";

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

/* ───────── tema por tipo (coherente con el stack) ───────── */
function kindTheme(kind: HeapEntry["kind"]) {
  switch (kind) {
    case "string":
      return {
        badge: "bg-pink-900/60 text-pink-100 ring-pink-700/60",
        stripe: "from-pink-300/70 to-pink-400/40",
        bar: "from-pink-400/70 to-pink-300/40",
        dot: "bg-pink-400",
      };
    case "array":
      return {
        badge: "bg-sky-900/60 text-sky-100 ring-sky-700/60",
        stripe: "from-sky-300/70 to-sky-400/40",
        bar: "from-sky-400/70 to-sky-300/40",
        dot: "bg-sky-400",
      };
    case "object":
      return {
        badge: "bg-emerald-900/60 text-emerald-100 ring-emerald-700/60",
        stripe: "from-emerald-300/70 to-emerald-400/40",
        bar: "from-emerald-400/70 to-emerald-300/40",
        dot: "bg-emerald-400",
      };
    default:
      return {
        badge: "bg-neutral-800/70 text-neutral-200 ring-neutral-700/60",
        stripe: "from-zinc-300/60 to-zinc-400/30",
        bar: "from-zinc-400/60 to-zinc-300/30",
        dot: "bg-zinc-300",
      };
  }
}

/* ───────── chips comunes ───────── */
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
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]
                 bg-white/8 text-neutral-200 ring-1 ring-white/10 hover:bg-white/14"
      title="Copiar dirección"
    >
      {hex}
      <svg
        className="h-3.5 w-3.5 opacity-70"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 17H8V7h11v15Z" />
      </svg>
    </button>
  );
}

/* Nombre destacado */
function NameBadge({ name, kind }: { name?: string; kind: HeapEntry["kind"] }) {
  if (!name) return null;
  const tone =
    kind === "array"
      ? "from-sky-400/14 to-sky-300/6"
      : kind === "string"
        ? "from-pink-400/14 to-pink-300/6"
        : kind === "object"
          ? "from-emerald-400/14 to-emerald-300/6"
          : "from-white/10 to-white/5";
  return (
    <span
      className={`text-[12px] sm:text-[13px] font-semibold tracking-wide
                  rounded-md px-2.5 py-0.5 ring-1 ring-white/12
                  bg-gradient-to-b ${tone} text-neutral-50`}
      title="nombre de la variable (si viene del stack)"
    >
      {name}
    </span>
  );
}

/* ───────── Shell con progreso + fades (sin modo guía) ───────── */
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
          className="pointer-events-none absolute left-0 right-0 top-0 h-6 rounded-t-2xl"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,.45), transparent)",
          }}
        />
      )}
      {showBottom && (
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-6 rounded-b-2xl"
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,.45), transparent)",
          }}
        />
      )}
    </>
  );
}

/* ───────── Vista principal del Heap ───────── */
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
      {/* borde glam */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg, rgba(56,189,248,.12), rgba(244,114,182,.10) 40%, rgba(52,211,153,.10))",
          boxShadow:
            "0 18px 40px -20px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.04)",
        }}
      />
      <div className="relative h-full min-h-0 rounded-3xl bg-neutral-950/35 ring-1 ring-white/8 backdrop-blur-sm p-3 flex flex-col">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
          style={{ boxShadow: "inset 0 0 120px rgba(56,189,248,.05)" }}
        />

        {/* header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-white/6 ring-1 ring-white/10 shadow-inner">
              🧰
            </span>
            <h2 className="text-lg font-semibold tracking-wide">Heap</h2>
          </div>
          <div className="ml-auto text-xs text-neutral-400">
            {heap.length} items
          </div>
        </div>

        {/* progreso scroll */}
        <div className="mb-2 h-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400/60 via-pink-400/60 to-emerald-400/60"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>

        {/* contenedor scrollable */}
        <div
          ref={scrollRef}
          className="relative flex-1 min-h-0 overflow-auto rounded-2xl bg-neutral-950/25 ring-1 ring-white/8 p-2 stk-scroll"
        >
          <ScrollFades showTop={!atTop} showBottom={!atBottom} />

          {heap.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-400">
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

/* ───────── resumen amigable por tarjeta (conciso) ───────── */
function friendlySummary(e: HeapEntry) {
  if (e.kind === "string") {
    const m = e.meta as any;
    return `Texto (len=${m.length}). Header = tamaño y puntero; el contenido vive en data desde ${m.dataPtr}.`;
  }
  if (e.kind === "array") {
    const m = e.meta as any;
    const elem =
      m?.elem?.name ??
      m?.elemType ??
      (typeof m?.elem === "string" ? m.elem : "?");
    return `Arreglo de ${elem} con ${m.length} elemento(s). Header guarda longitud y dataPtr (${m.dataPtr}).`;
  }
  if (e.kind === "object") {
    const m = e.meta as any;
    if (m?.tag === "object-compact" && Array.isArray(m?.schema)) {
      return `Objeto compacto con ${m.schema.length} campo(s).`;
    }
    return `Objeto en heap.`;
  }
  return `Bloque en heap.`;
}

/* ───────── Tarjeta de bloque en heap ───────── */
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
  const totalBytes = headerBytes + dataBytes || 1;
  const pctHeader = Math.max(0, Math.min(1, headerBytes / totalBytes));
  const pctData = Math.max(0, Math.min(1, dataBytes / totalBytes));

  return (
    <div className="relative overflow-hidden rounded-2xl p-2.5 bg-neutral-900/55 ring-1 ring-white/8 hover:bg-white/[0.03] transition">
      {/* ancla */}
      <span
        ref={bind(`heap-${entry.addr}`)}
        id={`heap-${entry.addr}`}
        className="pointer-events-none absolute -left-2 top-4 h-4 w-4"
      />
      {/* stripe de color */}
      <div
        className={`absolute left-0 top-0 h-full w-[6px] rounded-l-2xl bg-gradient-to-b ${t.stripe}`}
        aria-hidden
      />
      {/* bisel superior */}
      <div
        className="absolute left-0 top-0 h-[3px] w-[72%] rounded-r"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,.18), transparent)",
        }}
      />

      {/* header meta (compacto y sin duplicados) */}
      <div className="flex flex-wrap items-center gap-2 pl-1">
        <Tag className={t.badge}>
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${t.dot}`} />
        </Tag>
        <span className="text-[12px] text-neutral-200 capitalize">
          {entry.kind}
        </span>

        <NameBadge name={prettyName(entry.label)} kind={entry.kind} />

        <div className="ml-auto flex items-center gap-2">
          <AddrBtn hex={entry.addr} />
          <RefCountPill count={entry.refCount} pulse={pulse} />
        </div>

        {/* Extras del header:
            - ARRAY → nada (tag/elemSize se ven en meta abajo)
            - OBJECT → sólo tag si aporta (e.g. object-compact)
            - STRING → nada */}
        <KindTagExtras entry={entry} />
      </div>

      {/* resumen corto */}
      <p className="mt-1 text-[12px] text-neutral-300">
        {friendlySummary(entry)}
      </p>

      {/* MemoryBar proporcional */}
      <div className="mt-2">
        <div className="relative h-5 w-full rounded-full ring-1 ring-white/10 bg-neutral-950/40 overflow-hidden">
          {/* header */}
          <div
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${t.bar}`}
            style={{ width: `${pctHeader * 100}%` }}
            title={`header · ${fmtB(headerBytes)} (${Math.round(pctHeader * 100)}%)`}
          />
          {/* data */}
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${pctHeader * 100}%`,
              width: `${pctData * 100}%`,
              background:
                dataBytes > 0
                  ? "linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,.08))"
                  : "transparent",
            }}
            title={
              dataBytes > 0
                ? `data · ${fmtB(dataBytes)} (${Math.round(pctData * 100)}%)`
                : "sin data"
            }
          />
          {/* marcas */}
          <div
            className="absolute inset-0 mix-blend-screen opacity-40"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0 10px, transparent 10px 20px)",
            }}
          />
          {/* rótulos */}
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-200/90">
            header <span className="opacity-70">(metadatos)</span>
          </span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-200/90">
            {dataBytes > 0 ? (
              <>
                data <span className="opacity-70">(contenido)</span>
              </>
            ) : (
              "sin data"
            )}
          </span>
        </div>

        {/* rangos */}
        <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
          <span>
            header:{" "}
            <Mono>
              [{entry.range.from} .. {entry.range.to})
            </Mono>
          </span>
          {dataRange?.from && dataRange?.to ? (
            <span>
              data:{" "}
              <Mono>
                [{dataRange.from} .. {dataRange.to})
              </Mono>
            </span>
          ) : (
            <span className="opacity-60">sin data</span>
          )}
        </div>
      </div>

      {/* meta por tipo (limpia, sin repetir info del header) */}
      <div className="mt-2 text-xs text-neutral-200">
        {entry.kind === "string" && <StringMeta meta={entry.meta} />}
        {entry.kind === "array" && <ArrayMeta meta={entry.meta} />}
        {entry.kind === "object" && <ObjectMeta meta={entry.meta} />}
      </div>

      {/* botón inspector */}
      <div className="mt-2">
        <button
          onClick={onInspect}
          className="rounded-md px-2 py-1 text-[12px] bg-white/10 hover:bg-white/16 ring-1 ring-white/12"
        >
          inspeccionar
        </button>
      </div>
    </div>
  );
}

/* ───────── extras rápidos en el header (sin tag/elemSize para arrays) ───────── */
function KindTagExtras({ entry }: { entry: HeapEntry }) {
  if (entry.kind === "array") {
    return null; // no duplicamos tag ni elemSize en el header
  }
  if (entry.kind === "object") {
    const tag = (entry.meta as any)?.tag;
    return tag ? (
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">{tag}</Tag>
    ) : null;
  }
  return null; // string → nada
}

/* ───────── Metas por tipo (amables y sin duplicados) ───────── */
function StringMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "string" }>["meta"];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">
        len={meta.length}
      </Tag>
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">
        dataPtr=<Mono>{meta.dataPtr}</Mono>
      </Tag>
      <span className="text-[11px] text-neutral-400">
        2B por carácter (UTF-16LE)
      </span>
    </div>
  );
}

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
    <div className="flex flex-wrap items-center gap-2">
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">
        length={meta.length}
      </Tag>
      {elem && (
        <Tag className="bg-white/8 text-neutral-200 ring-white/10">
          elem=<Mono>{elem}</Mono>
        </Tag>
      )}
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">
        dataPtr=<Mono>{meta.dataPtr}</Mono>
      </Tag>
      <span className="text-[11px] text-neutral-400">
        Los elementos viven en “data”.
      </span>
    </div>
  );
}

function ObjectMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "object" }>["meta"];
}) {
  const tag = (meta as any)?.tag;
  const schema = (meta as any)?.schema as
    | Array<{ key: string; type: string }>
    | undefined;

  if (tag === "object-compact" && Array.isArray(schema)) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Tag className="bg-white/8 text-neutral-200 ring-white/10">
            object-compact
          </Tag>
          <Tag className="bg-white/8 text-neutral-200 ring-white/10">
            fields={schema.length}
          </Tag>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {schema.map((f) => (
            <span
              key={f.key}
              className="text-[11px] rounded px-1 py-0.5 ring-1 bg-white/8 text-neutral-200 ring-white/10"
              title={`${f.key}: ${f.type}`}
            >
              {f.key}: <Mono>{f.type}</Mono>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // fallback minimal
  return (
    <div className="flex items-center gap-2">
      <Tag className="bg-white/8 text-neutral-200 ring-white/10">object</Tag>
    </div>
  );
}

/* ───────── UI atómica ───────── */
function RefCountPill({ count, pulse }: { count: number; pulse?: boolean }) {
  let cls = "bg-white/10 text-neutral-200 ring-1 ring-white/12";
  if (count <= 0) cls = "bg-red-900/40 text-red-200 ring-1 ring-red-700/50";
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
