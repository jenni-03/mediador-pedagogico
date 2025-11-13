// src/app/MemoryApp/components/HeapInspectorModal.tsx
// -----------------------------------------------------------------------------
// Inspector de datos — gamer sólido (sin glass/blur)
// - Mantiene portal, bloqueo de scroll y accesos (Esc / click fuera).
// - Paleta y ring alineados con Stack/Heap.
// - Secciones con scroll interno y micro-grid tenue.
// -----------------------------------------------------------------------------

import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/* ===== Tipos espejo del snapshot ===== */
type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr };

/* ---- Previews ---- */
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

/* ---- UiHeapEntry ---- */
export type UiHeapEntry =
  | {
      kind: "array";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string;
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
      meta: { tag?: string; length: number; dataPtr: HexAddr };
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
      meta: unknown;
      range: ByteRange;
      preview?: ObjectPreview;
      id?: number;
    };

/* ===== Paleta (match Stack/Heap) ===== */
const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2430",
  ring: "#2E3948",
  text: "text-zinc-100",
  label: "text-[11px] text-zinc-300",
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
const toUHex = (n: number) =>
  "U+" + n.toString(16).toUpperCase().padStart(4, "0");

const kindText = (k: UiHeapEntry["kind"]) =>
  k === "array" ? "Array" : k === "string" ? "String" : "Objeto";

const cleanLabel = (label?: string) =>
  label ? label.replace(/^\s*var\b[:\-]?\s*/i, "").trim() : label;

/* ===== Tema por tipo (acento) ===== */
function kindTheme(kind: UiHeapEntry["kind"]) {
  switch (kind) {
    case "string":
      return {
        bar: "bg-gradient-to-r from-pink-400 to-pink-300",
        dot: "bg-pink-300",
        icon: "🔤",
      };
    case "array":
      return {
        bar: "bg-gradient-to-r from-sky-400 to-sky-300",
        dot: "bg-sky-300",
        icon: "🧱",
      };
    default:
      return {
        bar: "bg-gradient-to-r from-emerald-400 to-emerald-300",
        dot: "bg-emerald-300",
        icon: "🧩",
      };
  }
}

/* ===== UI atoms ===== */
function Token({
  children,
  mono = false,
  className = "",
}: {
  children: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[11px]",
        "text-zinc-100",
        "ring-1",
        className || `bg-[#2F394B] ring-[#3B4659]`,
        mono ? "font-mono" : "",
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
  scroll = false,
}: {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <section
      className="mt-3 rounded-2xl p-3"
      style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-zinc-100 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full`}
            style={{ background: "#cbd5e1" }}
          />
          {title}
        </h4>
        {extra}
      </div>
      <div
        className={[
          "mt-2",
          scroll ? "max-h-[40vh] overflow-auto pr-1 fancy-scroll" : "",
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  barPct,
  colorClass,
}: {
  label: string;
  value: React.ReactNode;
  barPct?: number | null;
  colorClass: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
    >
      <div className="text-[11px] uppercase tracking-wide text-zinc-300">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-zinc-100">{value}</div>
      {typeof barPct === "number" && (
        <div
          className="mt-2 h-1.5 rounded-full overflow-hidden"
          style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
        >
          <div
            className={`h-1.5 ${colorClass}`}
            style={{ width: `${Math.max(0, Math.min(100, barPct))}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ====================== MODAL (Portal) ====================== */
export function HeapInspectorModal({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: UiHeapEntry | null;
  onClose: () => void;
}) {
  // Bloquea scroll y compensa scrollbar
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - html.clientWidth;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [open]);

  // Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !entry) return null;

  const theme = kindTheme(entry.kind);
  const headerBytes = bytesBetween(entry.range);
  const dataBytes =
    "dataRange" in entry && (entry as any).dataRange
      ? bytesBetween((entry as any).dataRange)
      : 0;

  const title = cleanLabel(entry.label) ?? kindText(entry.kind);
  const showTypeToken = Boolean(entry.label);

  const node = (
    <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
      <style>{STATIC_CSS}</style>

      {/* Backdrop más claro, sin blur */}
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      {/* Contenedor centrado */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          height: "100dvh",
          width: "100dvw",
          padding:
            "max(.5rem, env(safe-area-inset-top)) max(.5rem, env(safe-area-inset-right)) max(.5rem, env(safe-area-inset-bottom)) max(.5rem, env(safe-area-inset-left))",
        }}
      >
        <div
          className="pointer-events-auto relative max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden rounded-3xl w-[min(96vw,56rem)] sm:w-[min(92vw,72rem)]"
          style={{
            background: C.panel,
            border: `1px solid ${C.ring}`,
            boxShadow: "0 28px 80px rgba(0,0,0,.45)",
          }}
        >
          {/* Barra superior/acento */}
          <div className="h-1 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300" />

          {/* Cabecera sólida */}
          <div
            className="px-4 sm:px-5 py-3"
            style={{
              background: C.panelSoft,
              borderBottom: `1px solid ${C.ring}`,
            }}
          >
            <div className="flex flex-wrap items-center gap-3 text-white">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full"
                style={{ background: "#2D3747", border: `1px solid ${C.ring}` }}
              >
                {theme.icon}
              </span>

              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>

              {/* Metadatos */}
              <div className="flex flex-wrap items-center gap-2">
                <Token mono>{entry.addr}</Token>
                {showTypeToken && <Token>tipo={kindText(entry.kind)}</Token>}
                <Token>refs={entry.refCount}</Token>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => copy(entry.addr)}
                  className="px-3 py-1.5 rounded-md text-[12px]"
                  style={{
                    background: "#2D3747",
                    border: `1px solid ${C.ring}`,
                    color: "#fff",
                  }}
                  title="Copiar dirección"
                >
                  Copiar dirección
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-md text-[12px]"
                  style={{
                    background: "#2D3747",
                    border: `1px solid ${C.ring}`,
                    color: "#fff",
                  }}
                  title="Cerrar (Esc)"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>

          {/* Cuerpo con micro-grid tenue */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 fancy-scroll grid-bg">
            {/* Resumen por tipo */}
            <KindSummaryTokens entry={entry} />

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <MiniStat
                label="Rango encabezado"
                value={
                  <code className="font-mono">
                    [{entry.range.from} .. {entry.range.to})
                  </code>
                }
                colorClass={theme.bar}
              />
              <MiniStat
                label="Tamaño encabezado"
                value={<span>{fmtB(headerBytes)}</span>}
                colorClass={theme.bar}
              />
              {"dataRange" in entry && (entry as any).dataRange?.from ? (
                <>
                  <MiniStat
                    label="Rango datos"
                    value={
                      <code className="font-mono">
                        [{(entry as any).dataRange.from} ..{" "}
                        {(entry as any).dataRange.to})
                      </code>
                    }
                    colorClass={theme.bar}
                  />
                  <MiniStat
                    label="Tamaño datos"
                    value={<span>{fmtB(dataBytes)}</span>}
                    colorClass={theme.bar}
                    barPct={
                      headerBytes + dataBytes > 0
                        ? (dataBytes * 100) / (headerBytes + dataBytes)
                        : null
                    }
                  />
                </>
              ) : (
                <>
                  <MiniStat
                    label="Rango datos"
                    value={<span className="text-zinc-400">—</span>}
                    colorClass={theme.bar}
                  />
                  <MiniStat
                    label="Tamaño datos"
                    value={<span className="text-zinc-400">—</span>}
                    colorClass={theme.bar}
                  />
                </>
              )}
            </div>

            {/* Secciones por tipo */}
            {entry.kind === "string" && <StringSection entry={entry} />}
            {entry.kind === "array" && <ArraySection entry={entry} />}
            {entry.kind === "object" && <ObjectSection entry={entry} />}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

/* ---------- Tokens de resumen por tipo ---------- */
function TokenWrap({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function KindSummaryTokens({ entry }: { entry: UiHeapEntry }) {
  if (entry.kind === "string") {
    const m = entry.meta as any;
    return (
      <TokenWrap>
        <Token>tamaño={m.length}</Token>
        <Token mono>datos={m.dataPtr}</Token>
      </TokenWrap>
    );
  }
  if (entry.kind === "array") {
    const m = entry.meta as any;
    const elem =
      m?.elem?.name ??
      m?.elemType ??
      (typeof m?.elem === "string" ? m.elem : undefined);
    return (
      <TokenWrap>
        <Token>tamaño={m.length}</Token>
        {elem && <Token>tipoElem={elem}</Token>}
      </TokenWrap>
    );
  }
  const fields =
    (entry.preview?.kind === "object" && entry.preview.fields.length) || 0;
  return (
    <TokenWrap>{fields ? <Token>atributos={fields}</Token> : null}</TokenWrap>
  );
}

/* ---------- Secciones ---------- */
function StringSection({
  entry,
}: {
  entry: Extract<UiHeapEntry, { kind: "string" }> | UiHeapEntry;
}) {
  if (entry.kind !== "string") return null;
  return (
    <Section
      title="Datos"
      extra={
        <div className="flex items-center gap-2">
          <Token>tamaño={(entry.meta as any).length}</Token>
          <Token mono>datos={(entry.meta as any).dataPtr}</Token>
        </div>
      }
      scroll
    >
      {entry.preview ? (
        <>
          <div className="text-base sm:text-lg text-zinc-100">
            <span className="text-zinc-300">contenido:</span>{" "}
            <code className="font-mono break-words">
              “{entry.preview.text}”
            </code>
          </div>
          {entry.preview.chars?.length ? (
            <div className="mt-3">
              <div className="text-[12px] text-zinc-300 mb-1">
                Caracteres (UTF-16LE)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
                {entry.preview.chars.map((c) => (
                  <div
                    key={c.index}
                    className="text-[11px] rounded-lg px-2 py-1 flex items-center justify-between"
                    style={{
                      background: C.panelInner,
                      border: `1px solid ${C.ring}`,
                      color: "#e5e7eb",
                    }}
                    title={`código ${c.code}`}
                  >
                    <span className="font-mono text-zinc-300">[{c.index}]</span>
                    <span className="opacity-90">'{c.char}'</span>
                    <span className="font-mono text-zinc-400">
                      {toUHex(c.code)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-sm text-zinc-400">Sin vista previa.</div>
      )}
    </Section>
  );
}

function ArraySection({
  entry,
}: {
  entry: Extract<UiHeapEntry, { kind: "array" }> | UiHeapEntry;
}) {
  if (entry.kind !== "array") return null;
  const m = entry.meta as any;
  return (
    <Section
      title="Elementos"
      extra={
        <div className="flex items-center gap-2">
          <Token>tamaño={m.length}</Token>
          {m.elemType && <Token>tipoElem={m.elemType}</Token>}
        </div>
      }
      scroll
    >
      {entry.preview ? (
        <>
          {entry.preview.kind === "array-prim" && (
            <>
              {entry.preview.truncated && (
                <div className="text-[11px] text-zinc-400 mb-1">(muestra)</div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] min-w-[320px]">
                  <thead
                    className="text-[11px] text-zinc-300 sticky top-0"
                    style={{ background: C.panelSoft }}
                  >
                    <tr>
                      <th className="text-left font-normal pr-3 py-1">
                        índice
                      </th>
                      <th className="text-left font-normal py-1">valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entry.preview.items.map((v, i) => (
                      <tr
                        key={i}
                        className="odd:bg-white/[0.02]"
                        style={{ borderTop: `1px solid ${C.ring}` }}
                      >
                        <td className="py-1 pr-3 font-mono text-zinc-300">
                          [{i}]
                        </td>
                        <td className="py-1 text-zinc-100">{String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {entry.preview.kind === "array-string" && (
            <>
              {entry.preview.truncated && (
                <div className="text-[11px] text-zinc-400 mb-1">(muestra)</div>
              )}
              <div className="grid gap-1">
                {entry.preview.items.map((it) => (
                  <div
                    key={it.index}
                    className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1"
                    style={{
                      background: C.panelInner,
                      border: `1px solid ${C.ring}`,
                      color: "#e5e7eb",
                    }}
                  >
                    <span className="font-mono text-zinc-300">
                      [{it.index}]
                    </span>
                    <span className="text-zinc-400">→</span>
                    <code className="font-mono break-words">“{it.text}”</code>
                    <button
                      onClick={() => copy(it.ref)}
                      className="ml-auto text-[11px] underline-offset-2 hover:underline"
                      title="Copiar dirección"
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
                <div className="text-[11px] text-zinc-400 mb-1">(muestra)</div>
              )}
              <div className="grid gap-1">
                {entry.preview.items.map((it) => (
                  <div
                    key={it.index}
                    className="flex items-center gap-2 text-[12px] rounded-lg px-2 py-1"
                    style={{
                      background: C.panelInner,
                      border: `1px solid ${C.ring}`,
                      color: "#e5e7eb",
                    }}
                  >
                    <span className="font-mono text-zinc-300">
                      [{it.index}]
                    </span>
                    <span className="text-zinc-400">→</span>
                    <button
                      onClick={() => copy(it.ref)}
                      className="underline-offset-2 hover:underline"
                      title="Copiar dirección"
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
        <div className="text-sm text-zinc-400">Sin vista previa.</div>
      )}
    </Section>
  );
}

function ObjectSection({
  entry,
}: {
  entry: Extract<UiHeapEntry, { kind: "object" }> | UiHeapEntry;
}) {
  if (entry.kind !== "object") return null;
  return (
    <Section title="Atributos" scroll>
      {entry.preview?.kind === "object" && entry.preview.fields.length ? (
        <>
          {/* Tabla desktop */}
          <div className="mt-1 overflow-x-auto hidden md:block">
            <table className="w-full text-sm min-w-[520px]">
              <thead
                className="text-[11px] text-zinc-300 sticky top-0"
                style={{ background: C.panelSoft }}
              >
                <tr>
                  <th className="text-left font-normal pr-3 py-1">clave</th>
                  <th className="text-left font-normal pr-3 py-1">tipo</th>
                  <th className="text-left font-normal py-1">valor</th>
                </tr>
              </thead>
              <tbody>
                {entry.preview.fields.map((f) => (
                  <tr
                    key={f.key}
                    className="odd:bg-white/[0.02]"
                    style={{ borderTop: `1px solid ${C.ring}` }}
                  >
                    <td className="py-1 pr-3">{f.key}</td>
                    <td className="py-1 pr-3">
                      <code className="font-mono">{f.type}</code>
                    </td>
                    <td className="py-1">
                      {typeof f.value === "string" ? (
                        <code className="font-mono break-words">
                          “{f.value}”
                        </code>
                      ) : (
                        <code className="font-mono break-words">
                          {String(f.value)}
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fichas móvil */}
          <div className="grid md:hidden gap-2">
            {entry.preview.fields.map((f) => (
              <div
                key={f.key}
                className="rounded-lg p-2"
                style={{
                  background: C.panelInner,
                  border: `1px solid ${C.ring}`,
                }}
              >
                <div className="text-[12px] text-zinc-300">
                  {f.key} · <code className="font-mono">{f.type}</code>
                </div>
                <div className="mt-1 text-sm text-zinc-100">
                  {typeof f.value === "string" ? (
                    <code className="font-mono break-words">“{f.value}”</code>
                  ) : (
                    <code className="font-mono break-words">
                      {String(f.value)}
                    </code>
                  )}
                </div>
              </div>
            ))}
          </div>

          {entry.preview.truncated && (
            <div className="mt-1 text-[11px] text-zinc-400">(muestra)</div>
          )}
        </>
      ) : (
        <div className="text-sm text-zinc-400">
          Sin vista previa de atributos.
        </div>
      )}
    </Section>
  );
}

/* ===== CSS estático ===== */
const STATIC_CSS = `
/* Grid sutil en el body del modal */
.grid-bg{
  background:
    radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px) 0 0 / 18px 18px,
    linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0));
}
/* Scrollbar */
.fancy-scroll{ scrollbar-width: thin; scrollbar-color: rgba(180,190,210,.45) transparent; }
.fancy-scroll::-webkit-scrollbar{ width: 10px; height: 10px; }
.fancy-scroll::-webkit-scrollbar-track{ background: rgba(255,255,255,.05); border-radius: 8px; }
.fancy-scroll::-webkit-scrollbar-thumb{
  background: linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.12));
  border-radius: 8px; border: 2px solid rgba(20,22,26,.8);
}
`;
