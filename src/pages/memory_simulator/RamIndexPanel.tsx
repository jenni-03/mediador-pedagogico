import * as React from "react";

export type HexAddr = `0x${string}`;
export type UiRamItem = {
  id: string;
  source: "stack-prim" | "stack-ref" | "heap-header" | "heap-data";
  label: string;
  type: string;
  range: { from: HexAddr; to: HexAddr };
  bytes: number;
  meta?: Record<string, unknown>;
};

// badge + color lateral por source
function srcTheme(src: UiRamItem["source"]) {
  switch (src) {
    case "stack-prim":
      return {
        tag: "stack prim",
        cls: "bg-emerald-900/40 text-emerald-200 border-emerald-700/60",
        rail: "bg-emerald-400",
      };
    case "stack-ref":
      return {
        tag: "stack ref",
        cls: "bg-zinc-900/70 text-zinc-200 border-zinc-700/60",
        rail: "bg-zinc-400",
      };
    case "heap-header":
      return {
        tag: "heap hdr",
        cls: "bg-cyan-900/40 text-cyan-100 border-cyan-700/60",
        rail: "bg-cyan-400",
      };
    case "heap-data":
      return {
        tag: "heap data",
        cls: "bg-fuchsia-900/35 text-fuchsia-100 border-fuchsia-700/60",
        rail: "bg-fuchsia-400",
      };
  }
}

const fmtBytes = (n: number) =>
  n >= 1024 ? `${(n / 1024).toFixed(1)}K` : String(n);

function Tiny({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
      {children}
    </span>
  );
}

// Chips extra cuando el item es de tipo "object"
function ObjectExtras({ it }: { it: UiRamItem }) {
  if (it.type !== "object") return null;

  const tag = (it.meta as any)?.objTag as string | undefined;
  const fieldCount = (it.meta as any)?.fieldCount as number | undefined;
  const keys = (it.meta as any)?.objKeys as string[] | undefined;
  const displayName = (it.meta as any)?.displayName as string | undefined;

  const hasBadges = !!(tag || fieldCount || displayName);

  return (
    <div className="flex flex-col min-w-0">
      {/* línea de badges */}
      {hasBadges && (
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {displayName && <Tiny>{displayName}</Tiny>}
          {tag && <Tiny>{tag}</Tiny>}
          {typeof fieldCount === "number" && <Tiny>fields={fieldCount}</Tiny>}
        </div>
      )}

      {/* línea con llaves si son pocas */}
      {Array.isArray(keys) && keys.length > 0 && (
        <div className="mt-0.5 text-[10px] text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">
          {keys.map((k, i) => (
            <span key={k}>
              {k}
              {i < keys.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RamIndexPanel({
  items,
  onPick,
  selectedId,
}: {
  items: UiRamItem[];
  onPick: (item: UiRamItem) => void;
  selectedId?: string | null;
}) {
  const [q, setQ] = React.useState("");
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(s) ||
        it.type.toLowerCase().includes(s) ||
        it.id.toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <section className="h-full w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 text-zinc-100 shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 flex items-center gap-3 shrink-0">
        <h2 className="text-xl font-semibold tracking-tight">RAM · índice</h2>
        <div className="ml-auto relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="filtrar: x, String header, heap…"
            className="w-64 rounded-lg bg-zinc-900/60 border border-zinc-700/60 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="px-4 pb-4 flex-1 min-h-0">
        <div className="h-full rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
          {/* Encabezados fijos */}
          <div
            className="grid bg-zinc-900/60 text-xs text-zinc-400 px-3 py-2 shrink-0"
            style={{
              gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr) 6ch 11ch",
            }}
          >
            <div>Nombre / etiqueta</div>
            <div>Tipo</div>
            <div className="text-right">Bytes</div>
            <div className="text-right">Inicio</div>
          </div>

          {/* Filas con scroll */}
          <div className="flex-1 min-h-0 overflow-auto divide-y divide-zinc-800">
            {filtered.map((it) => {
              const theme = srcTheme(it.source);
              const isSel = selectedId === it.id;

              return (
                <button
                  key={it.id}
                  onClick={() => onPick(it)}
                  title={`${it.label} • ${it.type} • ${it.range.from}..${it.range.to}`}
                  className={[
                    "relative w-full grid items-center px-3 py-2 text-left transition-colors",
                    "hover:bg-zinc-900/55",
                    isSel
                      ? "bg-zinc-900/70 ring-1 ring-inset ring-zinc-600"
                      : "",
                  ].join(" ")}
                  style={{
                    gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr) 6ch 11ch",
                  }}
                >
                  {/* rail de selección a la izquierda */}
                  <span
                    className={[
                      "absolute left-0 top-0 bottom-0 w-[3px] opacity-0",
                      isSel ? "opacity-100" : "",
                      theme.rail,
                      "shadow-[0_0_8px_currentColor]",
                    ].join(" ")}
                  />

                  {/* Columna: nombre + badge y extras */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={[
                          "px-2 py-0.5 rounded-md border text-[10px] shrink-0",
                          theme.cls,
                        ].join(" ")}
                      >
                        {theme.tag}
                      </span>
                      <span className="truncate">{it.label}</span>
                    </div>

                    {/* Extras solo para objetos (tag, fields, llaves) */}
                    <ObjectExtras it={it} />
                  </div>

                  {/* Columna: tipo */}
                  <div className="text-zinc-300 truncate">{it.type}</div>

                  {/* Columna: bytes */}
                  <div className="text-right tabular-nums">
                    {fmtBytes(it.bytes)}
                  </div>

                  {/* Columna: inicio */}
                  <div className="text-right font-mono text-xs">
                    {it.range.from}
                  </div>
                </button>
              );
            })}

            {!filtered.length && (
              <div className="px-3 py-8 text-sm text-zinc-400">
                sin resultados
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
