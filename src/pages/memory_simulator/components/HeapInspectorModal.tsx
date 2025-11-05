// src/app/MemoryApp/components/HeapInspectorModal.tsx
// -----------------------------------------------------------------------------
// Modal pedagógico con tema por tipo. NO lee RAM; usa UiHeapEntry + preview.
// - string: texto + grilla de chars
// - array:  elementos (prims/strings/refs) con índice y truncado
// - object: tabla de campos decodificados (schema)
// Incluye: header con acento, chips útiles, barras de bytes, copy helpers.
// -----------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from "react";

/* ===== Tipos espejo del snapshot ===== */
type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr };

/* ---- Previews del builder ---- */
type StringPreview = {
  kind: "string";
  len: number;
  text: string;
  chars?: { index: number; code: number; char: string }[];
};

type ArrayPrimPreview = {
  kind: "array-prim";
  elemType: string;
  items: Array<number | string>;
  truncated: boolean;
};

type ArrayStringPreview = {
  kind: "array-string";
  items: { index: number; ref: HexAddr; len: number; text: string }[];
  truncated: boolean;
};

type ArrayRefPreview = {
  kind: "array-ref";
  items: { index: number; ref: HexAddr }[];
  truncated: boolean;
};

type ObjectPreview = {
  kind: "object";
  fields: { key: string; type: string; value: unknown }[];
  truncated?: boolean;
};

type ArrayPreview = ArrayPrimPreview | ArrayStringPreview | ArrayRefPreview;

/* ---- UiHeapEntry con 'preview' opcional por tipo ---- */
export type UiHeapEntry =
  | {
      kind: "array";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string; // "array-inline-prim" | "array-ref32"
        length: number;
        dataPtr: HexAddr;
        elem?: unknown;
        elemType?: string;
        elemSize?: number;
      };
      range: ByteRange;
      dataRange: ByteRange;
      preview?: ArrayPreview;
      id?: number;
    }
  | {
      kind: "string";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string;
        length: number;
        dataPtr: HexAddr;
      };
      range: ByteRange;
      dataRange: ByteRange;
      preview?: StringPreview;
      id?: number;
    }
  | {
      kind: "object";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: unknown; // { tag:"object-compact", schema:[{key,type}], ... }
      range: ByteRange;
      preview?: ObjectPreview;
      id?: number;
    };

/* ===== Utils ===== */
const hexToNum = (h: HexAddr | string) => parseInt(h as string, 16);
const bytesBetween = (r?: ByteRange) =>
  r ? Math.max(0, hexToNum(r.to) - hexToNum(r.from)) : 0;

const copy = (s: string) => navigator?.clipboard?.writeText?.(s);

function kindTheme(kind: UiHeapEntry["kind"]) {
  switch (kind) {
    case "string":
      return {
        accent: "from-sky-500 to-blue-500",
        chip: "bg-sky-600/15 text-sky-200 ring-1 ring-sky-700/40",
        rail: "bg-sky-500",
        bar: "bg-gradient-to-r from-sky-400 to-blue-400",
        dot: "bg-sky-400",
      };
    case "array":
      return {
        accent: "from-emerald-500 to-teal-500",
        chip: "bg-emerald-600/15 text-emerald-200 ring-1 ring-emerald-700/40",
        rail: "bg-emerald-500",
        bar: "bg-gradient-to-r from-emerald-400 to-teal-400",
        dot: "bg-emerald-400",
      };
    default:
      return {
        accent: "from-fuchsia-500 to-pink-500",
        chip: "bg-fuchsia-600/15 text-fuchsia-200 ring-1 ring-fuchsia-700/40",
        rail: "bg-fuchsia-500",
        bar: "bg-gradient-to-r from-fuchsia-400 to-pink-400",
        dot: "bg-fuchsia-400",
      };
  }
}

function Tiny({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] rounded px-1 py-0.5 ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
      {children}
    </span>
  );
}

export function HeapInspectorModal({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: UiHeapEntry | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const [showRawMeta, setShowRawMeta] = useState(false);

  const headerBytes = useMemo(
    () => (entry ? bytesBetween(entry.range) : 0),
    [entry]
  );
  const dataBytes = useMemo(() => {
    if (!entry) return 0;
    if ("dataRange" in entry && (entry as any).dataRange) {
      return bytesBetween((entry as any).dataRange);
    }
    return 0;
  }, [entry]);

  if (!open || !entry) return null;
  const theme = kindTheme(entry.kind);

  const HeadChip = ({
    children,
    mono = false,
    tone = "default",
  }: {
    children: React.ReactNode;
    mono?: boolean;
    tone?: "default" | "accent";
  }) => (
    <span
      className={`text-[11px] px-2 py-0.5 rounded ring-1 ${
        tone === "accent"
          ? theme.chip
          : "bg-neutral-100 text-neutral-800 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700"
      } ${mono ? "font-mono" : ""}`}
    >
      {children}
    </span>
  );

  const Stat = ({
    label,
    value,
    barPct,
  }: {
    label: string;
    value: React.ReactNode;
    barPct?: number | null;
  }) => (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-neutral-100">{value}</div>
      {typeof barPct === "number" && (
        <div className="mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
          <div
            className={`h-1.5 ${theme.bar}`}
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>
      )}
    </div>
  );

  const Title = () => (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-full ${theme.dot}`} />
      <h3 className="text-xl font-semibold text-white">
        {entry.kind === "array"
          ? "Arreglo (Array)"
          : entry.kind === "string"
          ? "Cadena (String)"
          : "Objeto"}
      </h3>
    </div>
  );


  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-5xl sm:mx-auto sm:rounded-2xl
                   bg-[#0c0c0d] border border-neutral-800 shadow-2xl
                   max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header con acento */}
        <div
          className={`px-4 py-3 border-b border-neutral-800 bg-gradient-to-r ${theme.accent}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-white">
              <HeadChip tone="accent">{entry.kind}</HeadChip>
              <HeadChip mono tone="accent">
                {entry.addr}
              </HeadChip>
              <HeadChip tone="accent">refCount={entry.refCount}</HeadChip>
              {entry.label && <HeadChip tone="accent">{entry.label}</HeadChip>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copy(entry.addr)}
                className="px-3 py-1.5 rounded bg-black/30 text-white text-sm hover:bg-black/40"
                title="Copiar dirección"
              >
                Copiar addr
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-white/10 text-white text-sm hover:bg-white/20 ring-1 ring-white/30"
                title="Cerrar (Esc)"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>

        {/* Rail de color a la izquierda */}
        <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: "transparent" }}>
          <div className={`h-full w-full ${theme.rail}`} />
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          <Title />

          {/* Métricas comunes */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 mb-2">
            <Stat
              label="Header range"
              value={
                <code className="font-mono">
                  [{entry.range.from} .. {entry.range.to})
                </code>
              }
              barPct={null}
            />
            <Stat label="Header bytes" value={<span>{headerBytes} B</span>} />
            {"dataRange" in entry && (entry as any).dataRange?.from ? (
              <>
                <Stat
                  label="Data range"
                  value={
                    <code className="font-mono">
                      [{(entry as any).dataRange.from} .. {(entry as any).dataRange.to})
                    </code>
                  }
                />
                <Stat
                  label="Data bytes"
                  value={<span>{dataBytes} B</span>}
                  barPct={headerBytes > 0 ? (dataBytes * 100) / (headerBytes + dataBytes) : 100}
                />
              </>
            ) : (
              <>
                <Stat label="Data range" value={<span className="text-neutral-400">—</span>} />
                <Stat label="Data bytes" value={<span className="text-neutral-400">—</span>} />
              </>
            )}
          </div>

          {/* Chips de meta */}
          <div className="flex flex-wrap gap-1">
            {entry.kind === "array" && (
              <>
                {(entry.meta as any).tag && <HeadChip>{(entry.meta as any).tag}</HeadChip>}
                {"elemType" in entry.meta && entry.meta.elemType && (
                  <HeadChip>elemType={entry.meta.elemType}</HeadChip>
                )}
                {"elemSize" in entry.meta && typeof entry.meta.elemSize === "number" && (
                  <HeadChip>elemSize={entry.meta.elemSize}</HeadChip>
                )}
                {"elem" in entry.meta && entry.meta.elem !== undefined && (
                  <HeadChip>
                    elem=<code className="font-mono">{JSON.stringify(entry.meta.elem)}</code>
                  </HeadChip>
                )}
              </>
            )}
            {entry.kind === "object" && (entry.meta as any)?.tag && (
              <HeadChip>{(entry.meta as any).tag}</HeadChip>
            )}
          </div>

          {/* ====== Contenido pedagógico (usa preview) ====== */}
          {entry.kind === "string" && (
            <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-neutral-300">Contenido</div>
                <div className="flex items-center gap-2">

                </div>
              </div>

              {entry.preview ? (
                <>
                  <div className="mt-1 text-sm">
                    <span className="text-neutral-400">texto:</span>{" "}
                    <code className="font-mono">“{entry.preview.text}”</code>
                  </div>

                  {entry.preview.chars?.length ? (
                    <div className="mt-3">
                      <div className="text-[12px] text-neutral-400 mb-1">Chars (UTF-16)</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
                        {entry.preview.chars.map((c) => (
                          <div
                            key={c.index}
                            className="text-[11px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700 text-neutral-100 flex items-center justify-between"
                            title={`code ${c.code}`}
                          >
                            <span className="font-mono">[{c.index}]</span>
                            <span className="opacity-80">'{c.char}'</span>
                            <span className="font-mono text-neutral-400">#{c.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-sm text-neutral-400 mt-1">Sin preview (snapshot antiguo).</div>
              )}

              <div className="mt-3 text-sm leading-6">
                <span className="text-neutral-400">length:</span>{" "}
                <code className="font-mono">{entry.meta.length}</code>{" "}
                <span className="ml-3 text-neutral-400">dataPtr:</span>{" "}
                <button
                  onClick={() => copy(entry.meta.dataPtr)}
                  className="underline-offset-2 hover:underline font-mono"
                  title="Copiar puntero"
                >
                  {entry.meta.dataPtr}
                </button>
              </div>
            </section>
          )}

          {entry.kind === "array" && (
            <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-neutral-300">Elementos</div>
                <div className="flex items-center gap-2">
                  <Tiny>len={entry.meta.length}</Tiny>

                </div>
              </div>

              {entry.preview ? (
                <>
                  {entry.preview.kind === "array-prim" && (
                    <>
                      <div className="text-sm text-neutral-400 mt-1 mb-2">
                        elemType=<code className="font-mono">{entry.preview.elemType}</code>
                        {entry.preview.truncated && " · (preview)"}
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
                        {entry.preview.items.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">[{i}]</span>
                            <span className="text-neutral-100">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {entry.preview.kind === "array-string" && (
                    <>
                      {entry.preview.truncated && (
                        <div className="text-[11px] text-neutral-400 mb-1">(preview)</div>
                      )}
                      <div className="grid gap-1">
                        {entry.preview.items.map((it) => (
                          <div
                            key={it.index}
                            className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">[{it.index}]</span>
                            <span className="text-neutral-400">→</span>
                            <code className="font-mono">“{it.text}”</code>
                            <button
                              onClick={() => copy(it.ref)}
                              className="ml-auto text-[11px] text-neutral-400 hover:text-neutral-200"
                              title="Copiar addr"
                            >
                              @{it.ref}
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {entry.preview.kind === "array-ref" && (
                    <>
                      {entry.preview.truncated && (
                        <div className="text-[11px] text-neutral-400 mb-1">(preview)</div>
                      )}
                      <div className="grid gap-1">
                        {entry.preview.items.map((it) => (
                          <div
                            key={it.index}
                            className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">[{it.index}]</span>
                            <span className="text-neutral-400">→</span>
                            <button
                              onClick={() => copy(it.ref)}
                              className="text-neutral-300 hover:underline underline-offset-2"
                              title="Copiar addr"
                            >
                              @{it.ref}
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="text-sm text-neutral-400 mt-1">Sin preview (snapshot antiguo).</div>
              )}

              <div className="mt-3 text-sm leading-6">
                <span className="text-neutral-400">dataPtr:</span>{" "}
                <button
                  onClick={() => copy(entry.meta.dataPtr)}
                  className="underline-offset-2 hover:underline font-mono"
                  title="Copiar puntero"
                >
                  {entry.meta.dataPtr}
                </button>
              </div>
            </section>
          )}

          {entry.kind === "object" && (
            <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-neutral-300">Atributos</div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-[12px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                    onClick={() => setShowRawMeta((v) => !v)}
                  >
                    {showRawMeta ? "Ocultar JSON raw" : "Ver JSON raw"}
                  </button>
                </div>
              </div>

              {entry.preview?.kind === "object" && entry.preview.fields.length ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-[11px] text-neutral-400">
                      <tr>
                        <th className="text-left font-normal pr-3">Campo</th>
                        <th className="text-left font-normal pr-3">Tipo</th>
                        <th className="text-left font-normal">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.preview.fields.map((f) => (
                        <tr key={f.key} className="border-t border-neutral-800">
                          <td className="py-1 pr-3">{f.key}</td>
                          <td className="py-1 pr-3">
                            <code className="font-mono">{f.type}</code>
                          </td>
                          <td className="py-1">
                            {typeof f.value === "string" ? (
                              <code className="font-mono">“{f.value}”</code>
                            ) : (
                              <code className="font-mono">{String(f.value)}</code>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {entry.preview.truncated && (
                    <div className="mt-1 text-[11px] text-neutral-500">(preview)</div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-sm text-neutral-400">
                  Sin preview de atributos (snapshot antiguo).
                </div>
              )}

              {showRawMeta && (
                <pre className="mt-3 text-xs whitespace-pre-wrap break-words text-neutral-200">
                  {JSON.stringify(entry.meta, null, 2)}
                </pre>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
