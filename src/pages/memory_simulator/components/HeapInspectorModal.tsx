// src/app/MemoryApp/components/HeapInspectorModal.tsx
// -----------------------------------------------------------------------------
// Modal pedagógico con UI clara y responsive. NO lee RAM; usa UiHeapEntry + preview.
// - string: texto + grilla de chars
// - array:  elementos (prims/strings/refs) con índice y truncado
// - object: tabla de campos (schema)
// Incluye: cabecera compacta, métricas en tarjetas, secciones por tipo y
// "Detalles técnicos" colapsables para evitar ruido visual.
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

const fmtB = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(1)} MB`;

/* ===== Tema por tipo ===== */
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

/* ===== UI atoms ===== */
function Chip({
  children,
  className = "",
  mono = false,
}: {
  children: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] ring-1",
        "shadow-[inset_0_1px_0_rgba(255,255,255,.06)]",
        mono ? "font-mono" : "",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  extra,
  children,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[13px] font-medium text-neutral-200">{title}</h4>
        {extra}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/* ===== Modal ===== */
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

  const Title = () => (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-full ${theme.dot}`} />
      <h3 className="text-xl font-semibold text-white">
        {entry.kind === "array"
          ? "Arreglo"
          : entry.kind === "string"
            ? "Cadena"
            : "Objeto"}
      </h3>
    </div>
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
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-3">
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

  const pctData =
    headerBytes + dataBytes > 0
      ? (dataBytes * 100) / (headerBytes + dataBytes)
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Fondo */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-5xl sm:mx-auto sm:rounded-2xl
                   bg-[#0c0c0d] border border-neutral-800 shadow-2xl
                   max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Cabecera */}
        <div
          className={`px-4 py-3 border-b border-neutral-800 bg-gradient-to-r ${theme.accent}`}
        >
          <div className="flex flex-wrap items-center gap-2 text-white">
            <Chip className={theme.chip}>{entry.kind}</Chip>
            <Chip className={theme.chip} mono>
              {entry.addr}
            </Chip>
            <Chip className={theme.chip}>refCount={entry.refCount}</Chip>
            {entry.label && (
              <Chip className={theme.chip}>
                <span className="font-semibold">{entry.label}</span>
              </Chip>
            )}

            <div className="ml-auto flex items-center gap-2">
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

        {/* Rail color */}
        <div className="absolute left-0 top-0 h-full w-1.5">
          <div className={`h-full w-full ${theme.rail}`} />
        </div>

        {/* Cuerpo */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          <Title />

          {/* Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-3 mb-2">
            <Stat
              label="Header range"
              value={
                <code className="font-mono">
                  [{entry.range.from} .. {entry.range.to})
                </code>
              }
            />
            <Stat
              label="Header bytes"
              value={<span>{fmtB(headerBytes)}</span>}
            />
            {"dataRange" in entry && (entry as any).dataRange?.from ? (
              <>
                <Stat
                  label="Data range"
                  value={
                    <code className="font-mono">
                      [{(entry as any).dataRange.from} ..{" "}
                      {(entry as any).dataRange.to})
                    </code>
                  }
                />
                <Stat
                  label="Data bytes"
                  value={<span>{fmtB(dataBytes)}</span>}
                  barPct={pctData}
                />
              </>
            ) : (
              <>
                <Stat
                  label="Data range"
                  value={<span className="text-neutral-400">—</span>}
                />
                <Stat
                  label="Data bytes"
                  value={<span className="text-neutral-400">—</span>}
                />
              </>
            )}
          </div>

          {/* Resumen breve */}
          <p className="text-[13px] text-neutral-300">
            {entry.kind === "string" &&
              `Texto (len=${(entry.meta as any).length}). El contenido empieza en ${(entry.meta as any).dataPtr}.`}
            {entry.kind === "array" &&
              (() => {
                const m = entry.meta as any;
                const elem =
                  m?.elem?.name ??
                  m?.elemType ??
                  (typeof m?.elem === "string" ? m.elem : "?");
                return `Arreglo de ${elem} con ${m.length} elemento(s).`;
              })()}
            {entry.kind === "object" &&
              ((entry.meta as any)?.tag === "object-compact"
                ? "Objeto compacto (campos fijos)."
                : "Objeto en heap.")}
          </p>

          {/* Secciones por tipo */}
          {entry.kind === "string" && (
            <Section
              title="Contenido"
              extra={
                <div className="flex items-center gap-2">
                  <Chip className="bg-white/8 text-neutral-200 ring-white/10">
                    len={(entry.meta as any).length}
                  </Chip>
                  <Chip
                    className="bg-white/8 text-neutral-200 ring-white/10"
                    mono
                  >
                    dataPtr={(entry.meta as any).dataPtr}
                  </Chip>
                </div>
              }
            >
              {entry.preview ? (
                <>
                  <div className="text-sm">
                    <span className="text-neutral-400">texto:</span>{" "}
                    <code className="font-mono">“{entry.preview.text}”</code>
                  </div>

                  {entry.preview.chars?.length ? (
                    <div className="mt-3">
                      <div className="text-[12px] text-neutral-400 mb-1">
                        Chars (UTF-16)
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
                        {entry.preview.chars.map((c) => (
                          <div
                            key={c.index}
                            className="text-[11px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700 text-neutral-100 flex items-center justify-between"
                            title={`code ${c.code}`}
                          >
                            <span className="font-mono">[{c.index}]</span>
                            <span className="opacity-80">'{c.char}'</span>
                            <span className="font-mono text-neutral-400">
                              #{c.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-sm text-neutral-400">
                  Sin preview (snapshot antiguo).
                </div>
              )}
            </Section>
          )}

          {entry.kind === "array" && (
            <Section
              title="Elementos"
              extra={
                <div className="flex items-center gap-2">
                  <Chip className="bg-white/8 text-neutral-200 ring-white/10">
                    len={entry.meta.length}
                  </Chip>
                  {(entry.meta as any).elemType && (
                    <Chip className="bg-white/8 text-neutral-200 ring-white/10">
                      elemType={(entry.meta as any).elemType}
                    </Chip>
                  )}
                </div>
              }
            >
              {entry.preview ? (
                <>
                  {entry.preview.kind === "array-prim" && (
                    <>
                      <div className="text-sm text-neutral-400 mt-1 mb-2">
                        elemType=
                        <code className="font-mono">
                          {entry.preview.elemType}
                        </code>
                        {entry.preview.truncated && " · (preview)"}
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
                        {entry.preview.items.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">
                              [{i}]
                            </span>
                            <span className="text-neutral-100">
                              {String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {entry.preview.kind === "array-string" && (
                    <>
                      {entry.preview.truncated && (
                        <div className="text-[11px] text-neutral-400 mb-1">
                          (preview)
                        </div>
                      )}
                      <div className="grid gap-1">
                        {entry.preview.items.map((it) => (
                          <div
                            key={it.index}
                            className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">
                              [{it.index}]
                            </span>
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
                        <div className="text-[11px] text-neutral-400 mb-1">
                          (preview)
                        </div>
                      )}
                      <div className="grid gap-1">
                        {entry.preview.items.map((it) => (
                          <div
                            key={it.index}
                            className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1 ring-1 bg-black/30 ring-neutral-700"
                          >
                            <span className="font-mono text-neutral-400">
                              [{it.index}]
                            </span>
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
                <div className="text-sm text-neutral-400">
                  Sin preview (snapshot antiguo).
                </div>
              )}
            </Section>
          )}

          {entry.kind === "object" && (
            <Section
              title="Atributos"
              extra={
                <button
                  className="text-[12px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                  onClick={() => setShowRawMeta((v) => !v)}
                >
                  {showRawMeta ? "Ocultar JSON raw" : "Ver JSON raw"}
                </button>
              }
            >
              {entry.preview?.kind === "object" &&
              entry.preview.fields.length ? (
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full text-sm min-w-[520px]">
                    <thead className="text-[11px] text-neutral-400 sticky top-0 bg-neutral-900/60 backdrop-blur">
                      <tr>
                        <th className="text-left font-normal pr-3 py-1">
                          Campo
                        </th>
                        <th className="text-left font-normal pr-3 py-1">
                          Tipo
                        </th>
                        <th className="text-left font-normal py-1">Valor</th>
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
                              <code className="font-mono">
                                {String(f.value)}
                              </code>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {entry.preview.truncated && (
                    <div className="mt-1 text-[11px] text-neutral-500">
                      (preview)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-neutral-400">
                  Sin preview de atributos (snapshot antiguo).
                </div>
              )}

              {showRawMeta && (
                <pre className="mt-3 text-xs whitespace-pre-wrap break-words text-neutral-200">
                  {JSON.stringify(entry.meta, null, 2)}
                </pre>
              )}
            </Section>
          )}

          {/* Detalles técnicos (plegable) */}
          <details className="mt-3 group">
            <summary className="cursor-pointer list-none select-none rounded-lg px-3 py-2 text-[12.5px] bg-white/[0.06] hover:bg-white/[0.09] ring-1 ring-white/10 text-neutral-200 flex items-center justify-between">
              <span>Detalles técnicos</span>
              <span className="text-neutral-400 group-open:rotate-180 transition">
                ▾
              </span>
            </summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-800 p-3">
                <div className="text-[11px] text-neutral-400">Header</div>
                <div className="mt-1 text-sm font-mono">
                  [{entry.range.from} .. {entry.range.to}) · {fmtB(headerBytes)}
                </div>
              </div>
              {"dataRange" in entry && (entry as any).dataRange?.from && (
                <div className="rounded-lg border border-neutral-800 p-3">
                  <div className="text-[11px] text-neutral-400">Data</div>
                  <div className="mt-1 text-sm font-mono">
                    [{(entry as any).dataRange.from} ..{" "}
                    {(entry as any).dataRange.to}) · {fmtB(dataBytes)}
                  </div>
                </div>
              )}
              {entry.kind === "array" && (
                <>
                  {(entry.meta as any).elemType && (
                    <div className="rounded-lg border border-neutral-800 p-3">
                      <div className="text-[11px] text-neutral-400">
                        elemType
                      </div>
                      <div className="mt-1 text-sm">
                        {(entry.meta as any).elemType}
                      </div>
                    </div>
                  )}
                  {(entry.meta as any).elemSize != null && (
                    <div className="rounded-lg border border-neutral-800 p-3">
                      <div className="text-[11px] text-neutral-400">
                        elemSize
                      </div>
                      <div className="mt-1 text-sm">
                        {(entry.meta as any).elemSize}
                      </div>
                    </div>
                  )}
                  {(entry.meta as any).tag && (
                    <div className="rounded-lg border border-neutral-800 p-3 sm:col-span-2">
                      <div className="text-[11px] text-neutral-400">tag</div>
                      <div className="mt-1 text-sm">
                        {(entry.meta as any).tag}
                      </div>
                    </div>
                  )}
                </>
              )}
              {entry.kind === "string" && (
                <div className="rounded-lg border border-neutral-800 p-3 sm:col-span-2">
                  <div className="text-[11px] text-neutral-400">
                    Codificación
                  </div>
                  <div className="mt-1 text-sm">
                    UTF-16LE (2 bytes por carácter)
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
