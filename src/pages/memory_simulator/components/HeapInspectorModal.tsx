// src/app/MemoryApp/components/HeapInspectorModal.tsx
// -----------------------------------------------------------------------------
// Modal simplificado: NO depende de layout, SIZES ni lecturas de RAM.
// Solo pinta los campos que ya entrega UiHeapEntry (addr/range/dataRange/meta).
// -----------------------------------------------------------------------------

import React, { useEffect } from "react";

/* ===== Tipos espejo del snapshot (copiados para el frontend) ===== */

type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr };

export type UiHeapEntry =
  | {
      kind: "array";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string; // ej: "array-ref32"
        length: number;
        dataPtr: HexAddr;
        elem?: unknown; // p. ej. { tag: "prim", name: "string" }
      };
      range: ByteRange; // header (len+ptr)
      dataRange: ByteRange; // área de datos
      id?: number;
    }
  | {
      kind: "string";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: {
        tag?: string; // "string"
        length: number;
        dataPtr: HexAddr;
      };
      range: ByteRange;
      dataRange: ByteRange;
      id?: number;
    }
  | {
      kind: "object";
      addr: HexAddr;
      refCount: number;
      label?: string;
      meta: unknown;
      range: ByteRange;
      id?: number;
    };

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

  if (!open || !entry) return null;

  const HeadChip = ({
    children,
    mono = false,
  }: {
    children: React.ReactNode;
    mono?: boolean;
  }) => (
    <span
      className={`text-[11px] px-2 py-0.5 rounded ring-1 bg-red-600/10 text-red-200 ring-red-500/30 ${
        mono ? "font-mono" : ""
      }`}
    >
      {children}
    </span>
  );

  const Stat = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <div className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-neutral-100">{value}</div>
    </div>
  );

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
        className="relative w-full sm:max-w-4xl sm:mx-auto sm:rounded-2xl
                   bg-[#0c0c0d] border border-neutral-800 shadow-2xl
                   max-h-[86vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <HeadChip>{entry.kind}</HeadChip>
              <HeadChip mono>{entry.addr}</HeadChip>
              <HeadChip>refCount={entry.refCount}</HeadChip>
              {entry.label && <HeadChip>{entry.label}</HeadChip>}
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Cerrar (Esc)"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          <h3 className="text-xl font-semibold text-white mb-3">
            {entry.kind === "array"
              ? "Arreglo (Array)"
              : entry.kind === "string"
                ? "Cadena (String)"
                : "Objeto"}
          </h3>

          {/* Común */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <Stat
              label="Header range"
              value={
                <code className="font-mono">
                  [{entry.range.from} .. {entry.range.to})
                </code>
              }
            />
            {"dataRange" in entry && (entry as any).dataRange?.from ? (
              <Stat
                label="Data range"
                value={
                  <code className="font-mono">
                    [{(entry as any).dataRange.from} ..{" "}
                    {(entry as any).dataRange.to})
                  </code>
                }
              />
            ) : (
              <Stat
                label="Data range"
                value={<span className="text-neutral-400">—</span>}
              />
            )}
            <Stat
              label="Etiqueta"
              value={entry.label ?? <span className="text-neutral-400">—</span>}
            />
          </div>

          {/* Específico por tipo (sin lógica) */}
          {entry.kind === "array" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="text-[13px] text-neutral-300 mb-2">Metadatos</div>
              <ul className="text-sm leading-6">
                <li>
                  <span className="text-neutral-400">tag:</span>{" "}
                  <code className="font-mono">{entry.meta.tag ?? "—"}</code>
                </li>
                <li>
                  <span className="text-neutral-400">length:</span>{" "}
                  <code className="font-mono">{entry.meta.length}</code>
                </li>
                <li>
                  <span className="text-neutral-400">dataPtr:</span>{" "}
                  <code className="font-mono">{entry.meta.dataPtr}</code>
                </li>
                {"elem" in entry.meta && entry.meta.elem !== undefined && (
                  <li className="break-all">
                    <span className="text-neutral-400">elem:</span>{" "}
                    <code className="font-mono">
                      {JSON.stringify(entry.meta.elem)}
                    </code>
                  </li>
                )}
              </ul>
            </div>
          )}

          {entry.kind === "string" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="text-[13px] text-neutral-300 mb-2">Metadatos</div>
              <ul className="text-sm leading-6">
                <li>
                  <span className="text-neutral-400">tag:</span>{" "}
                  <code className="font-mono">{entry.meta.tag ?? "—"}</code>
                </li>
                <li>
                  <span className="text-neutral-400">length:</span>{" "}
                  <code className="font-mono">{entry.meta.length}</code>
                </li>
                <li>
                  <span className="text-neutral-400">dataPtr:</span>{" "}
                  <code className="font-mono">{entry.meta.dataPtr}</code>
                </li>
              </ul>
            </div>
          )}

          {entry.kind === "object" && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-3">
              <div className="text-[13px] text-neutral-300 mb-2">Metadatos</div>
              <pre className="text-xs whitespace-pre-wrap break-words text-neutral-200">
                {JSON.stringify(entry.meta, null, 2)}
              </pre>
            </div>
          )}

          <div className="pt-3 text-[11px] text-neutral-500">
            Tip: estos rangos permiten colorear RAM sin adivinar ni leer bytes
            desde el modal. El modal es puro “pinta lo que llega”.
          </div>
        </div>
      </div>
    </div>
  );
}
