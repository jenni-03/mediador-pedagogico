import { useState, useMemo } from "react";
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

/* ───────── Colores por tipo ───────── */
function kindColor(kind: HeapEntry["kind"]) {
  switch (kind) {
    case "string":
      return {
        side: "bg-blue-600",
        badge: "bg-blue-600/15 text-blue-300 ring-1 ring-blue-700/40",
        dot: "bg-blue-500",
      };
    case "array":
      return {
        side: "bg-emerald-600",
        badge: "bg-emerald-600/15 text-emerald-300 ring-1 ring-emerald-700/40",
        dot: "bg-emerald-500",
      };
    case "object":
    default:
      return {
        side: "bg-red-600",
        badge: "bg-red-600/15 text-red-300 ring-1 ring-red-700/40",
        dot: "bg-red-500",
      };
  }
}

export function HeapView({
  heap,
  pulseAddrs = [],
}: {
  heap: HeapEntry[];
  pulseAddrs?: number[];
}) {
  const [inspect, setInspect] = useState<HeapEntry | null>(null);
  const pulseSet = useMemo(() => new Set(pulseAddrs ?? []), [pulseAddrs]);

  return (
    <section className="rounded-2xl border p-3 bg-white dark:bg-[#0b0b0c] border-neutral-200 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Heap
        </h2>
        <span className="text-xs text-neutral-500">{heap.length} items</span>
      </div>

      {heap.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-neutral-700">
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

      <HeapInspectorModal
        open={!!inspect}
        entry={inspect}
        onClose={() => setInspect(null)}
      />
    </section>
  );
}

/* ─────────────────────── Subcomponentes ─────────────────────── */

function HeapCard({
  entry,
  pulse,
  onInspect,
}: {
  entry: HeapEntry;
  pulse?: boolean;
  onInspect: () => void;
}) {
  const color = kindColor(entry.kind);
  const { bind } = useAnchors();

  const headerBytes = bytesBetween(entry.range?.from, entry.range?.to);
  const dataRange = (entry as any).dataRange as
    | { from?: `0x${string}`; to?: `0x${string}` }
    | undefined;
  const dataBytes = dataRange ? bytesBetween(dataRange.from, dataRange.to) : 0;

  return (
    <div className="relative overflow-hidden rounded-xl border p-2 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black/30">
      {/* ancla (para futuras navegaciones/enlaces) */}
      <span
        ref={bind(`heap-${entry.addr}`)}
        id={`heap-${entry.addr}`}
        className="pointer-events-none absolute -left-2 top-4 h-4 w-4"
      />
      <div
        className={`absolute left-0 top-0 h-full w-1 ${color.side}`}
        aria-hidden
      />
      <div className="pl-2">
        <div className="flex flex-wrap items-center gap-2">
          <KindBadge kind={entry.kind} />
          <AddrChip addr={entry.addr} />
          <RefCountPill count={entry.refCount} pulse={pulse} />
          <TagPill entry={entry} />
          {entry.label && (
            <span className="text-[11px] rounded-md px-1.5 py-0.5 bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
              {entry.label}
            </span>
          )}
          <span className="ml-auto text-[11px] text-neutral-500">
            hdr:{headerBytes}B
            {"dataRange" in entry && dataBytes > 0 ? (
              <> · data:{dataBytes}B</>
            ) : null}
          </span>
          <button
            onClick={onInspect}
            className="px-2 py-1 rounded text-sm bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          >
            inspeccionar
          </button>
        </div>

        {/* Preview simple: pinta meta sin leer RAM */}
        <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-200">
          {entry.kind === "string" && <StringMeta meta={entry.meta} />}
          {entry.kind === "array" && <ArrayMeta meta={entry.meta} />}
          {entry.kind === "object" && <ObjectMeta meta={entry.meta} />}
        </div>

        {/* Rangos en RAM */}
        <div className="mt-1 text-[11px] text-neutral-500">
          <span className="mr-2">header:</span>
          <code className="font-mono">
            [{entry.range.from} .. {entry.range.to})
          </code>
          {dataRange?.from && dataRange?.to && (
            <>
              <span className="mx-2">| data:</span>
              <code className="font-mono">
                [{dataRange.from} .. {dataRange.to})
              </code>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────── Metas por tipo ───────── */

function StringMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "string" }>["meta"];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-neutral-500">string</span>
      <TinyBadge>len={meta.length}</TinyBadge>
      <TinyBadge>
        dataPtr=<code className="font-mono">{meta.dataPtr}</code>
      </TinyBadge>
    </div>
  );
}

function ArrayMeta({
  meta,
}: {
  meta: Extract<HeapEntry, { kind: "array" }>["meta"];
}) {
  const tag = (meta as any).tag ?? "";
  const elem =
    (meta as any).elem?.name ??
    (meta as any).elemType ??
    (typeof (meta as any).elem === "string" ? (meta as any).elem : undefined);
  const elemSize =
    typeof (meta as any).elemSize === "number"
      ? (meta as any).elemSize
      : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-neutral-500">array</span>
      <TinyBadge>length={meta.length}</TinyBadge>
      <TinyBadge>
        dataPtr=<code className="font-mono">{meta.dataPtr}</code>
      </TinyBadge>
      {tag && <TinyBadge>{tag}</TinyBadge>}
      {elem && <TinyBadge>elem={elem}</TinyBadge>}
      {elemSize !== undefined && <TinyBadge>elemSize={elemSize}</TinyBadge>}
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
          <span className="text-neutral-500">object</span>
          <TinyBadge>object-compact</TinyBadge>
          <TinyBadge>fields={schema.length}</TinyBadge>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {schema.map((f) => (
            <span
              key={f.key}
              className="text-[11px] rounded px-1 py-0.5 ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
              title={`${f.key}: ${f.type}`}
            >
              {f.key}: <code className="font-mono">{f.type}</code>
            </span>
          ))}
        </div>
      </div>
    );
  }

  // fallback: meta cruda
  return (
    <div className="flex flex-col gap-1">
      <span className="text-neutral-500">object</span>
      <pre className="text-xs whitespace-pre-wrap break-words text-neutral-200 bg-neutral-900/40 rounded p-2 ring-1 ring-neutral-800">
        {JSON.stringify(meta, null, 2)}
      </pre>
    </div>
  );
}

/* ───────── UI atómica ───────── */

function KindBadge({ kind }: { kind: HeapEntry["kind"] }) {
  const color = kindColor(kind);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ring-1 ${color.badge}`}
    >
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${color.dot}`} />
      <span className="font-medium">{kind}</span>
    </span>
  );
}

function TagPill({ entry }: { entry: HeapEntry }) {
  const tag =
    entry.kind === "array"
      ? (entry.meta as any)?.tag
      : entry.kind === "object"
        ? (entry.meta as any)?.tag
        : undefined;

  if (!tag) return null;
  return (
    <span className="text-[11px] rounded px-1.5 py-0.5 ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
      {tag}
    </span>
  );
}

function RefCountPill({ count, pulse }: { count: number; pulse?: boolean }) {
  const cls =
    count <= 0
      ? "bg-red-900/30 text-red-200 ring-red-900/60"
      : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700";
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

function AddrChip({ addr }: { addr: HeapEntry["addr"] }) {
  const hex = addr;
  return (
    <button
      type="button"
      onClick={() => navigator?.clipboard?.writeText?.(hex)}
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px]
                 bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 hover:bg-neutral-200
                 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700 dark:hover:bg-neutral-700"
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

function TinyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] rounded px-1 py-0.5 ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
      {children}
    </span>
  );
}
