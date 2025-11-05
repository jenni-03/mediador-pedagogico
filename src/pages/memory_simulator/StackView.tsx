// -----------------------------------------------------------------------------
// Pinta el Stack usando el contrato UiFrame/UiSlot del snapshot-builder.
// Capa 100% presentacional: NO lee RAM ni decodifica; solo muestra lo recibido.
// -----------------------------------------------------------------------------

import React from "react";

/* ===== Tipos espejo del snapshot (copiados para el frontend) ===== */

type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr };

type PrimitiveType =
  | "boolean"
  | "byte"
  | "short"
  | "char"
  | "int"
  | "long"
  | "float"
  | "double"
  | "string";

type StringPreview = {
  kind: "string";
  len: number;
  text: string;
  chars?: { index: number; code: number; char: string }[];
};

type ArrayItemString = {
  index: number;
  ref: HexAddr;
  kind: "string";
  len: number;
  text: string;
};
type ArrayItemNull = { index: number; ref: HexAddr; kind: "null" };
type ArrayPreview = {
  kind: "array";
  length: number;
  elemType: string;
  items: Array<ArrayItemString | ArrayItemNull>;
  truncated: boolean;
};

type UiPrimSlot = {
  name: string;
  kind: "prim";
  type: PrimitiveType;
  addr: HexAddr;
  value: unknown;
  display?: string;
  range: ByteRange;
};

type UiRefSlot = {
  name: string;
  kind: "ref";
  refAddr: HexAddr;
  refKind: "null" | "string" | "array" | "object" | "unknown";
  preview?: StringPreview | ArrayPreview;
};

type UiSlot = UiPrimSlot | UiRefSlot;

type UiFrame = {
  id: number;
  name: string;
  slots: UiSlot[];
};

/* ===== Utils ===== */
const hexToNum = (h: HexAddr | string) => parseInt(h as string, 16);
const bytesBetween = (r: ByteRange) =>
  Math.max(0, hexToNum(r.to) - hexToNum(r.from));

/* ===== Componente ===== */

export function StackView({ frames }: { frames: UiFrame[] }) {
  return (
    <section className="rounded-2xl border p-3 bg-white dark:bg-[#0b0b0c] border-neutral-200 dark:border-neutral-800">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Stack
        </h2>
        <span className="text-xs text-neutral-500">
          {frames.length} frame(s)
        </span>
      </div>

      {frames.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-sm text-neutral-500 dark:text-neutral-400 dark:border-neutral-700">
          Stack vacío.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {frames.map((f) => (
            <FrameCard key={f.id} frame={f} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────── Subcomponentes ─────────────────────── */

function FrameCard({ frame }: { frame: UiFrame }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-black/30">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] ring-1 bg-neutral-100 text-neutral-800 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700">
            frame
          </span>
          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            #{frame.id} “{frame.name}”
          </span>
        </div>
        <span className="text-xs text-neutral-500">
          {frame.slots.length} var(s)
        </span>
      </div>

      {frame.slots.length === 0 ? (
        <div className="rounded-lg border border-dashed p-3 text-sm text-neutral-500 dark:text-neutral-400 dark:border-neutral-700">
          (sin variables)
        </div>
      ) : (
        <div className="grid gap-2">
          {frame.slots.map((s, i) =>
            s.kind === "prim" ? (
              <PrimSlotRow key={i} slot={s} />
            ) : (
              <RefSlotRow key={i} slot={s} />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ===== UI atómica ===== */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
      {children}
    </span>
  );
}

function Mono({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <code className={`font-mono ${className}`}>{children}</code>;
}

function AddrButton({ hex }: { hex: HexAddr }) {
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

function SideBar({ tone }: { tone: "prim" | "ref" }) {
  const cls = tone === "prim" ? "bg-amber-500" : "bg-violet-500";
  return (
    <div className={`absolute left-0 top-0 h-full w-1 ${cls}`} aria-hidden />
  );
}

/* ===== Filas ===== */

function PrimSlotRow({ slot }: { slot: UiPrimSlot }) {
  const bytes = bytesBetween(slot.range);

  return (
    <div className="relative rounded-lg border p-2 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40">
      <SideBar tone="prim" />
      <div className="flex flex-wrap items-center gap-2 pl-1">
        <Chip>prim</Chip>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {slot.name}
        </span>
        <Chip>
          tipo: <Mono className="ml-0.5">{slot.type}</Mono>
        </Chip>
        <AddrButton hex={slot.addr} />
        <span className="ml-auto text-[11px] text-neutral-500">
          bytes:{bytes}
        </span>
      </div>

      {/* Valor mostrado tal cual viene del snapshot (display > value) */}
      <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
        {slot.display ? String(slot.display) : String(slot.value)}
      </div>

      {/* Rango en RAM */}
      <div className="mt-1 text-[11px] text-neutral-500">
        <span className="mr-1">rango:</span>
        <Mono>
          [{slot.range.from} .. {slot.range.to})
        </Mono>
      </div>
    </div>
  );
}

function RefSlotRow({ slot }: { slot: UiRefSlot }) {
  const isNull = slot.refKind === "null";

  return (
    <div className="relative rounded-lg border p-2 border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40">
      <SideBar tone="ref" />
      <div className="flex flex-wrap items-center gap-2 pl-1">
        <Chip>ref</Chip>
        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
          {slot.name}
        </span>
        <Chip>{slot.refKind}</Chip>
        <AddrButton hex={slot.refAddr} />
      </div>

      {/* Previews ya calculados por el snapshot */}
      {!isNull && slot.preview?.kind === "string" && (
        <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-200">
          <span className="text-neutral-500 mr-2">string</span>
          <Chip>len={(slot.preview as StringPreview).len}</Chip>
          <code
            className="ml-2 truncate max-w-full sm:max-w-[60%] font-mono bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200 rounded px-1.5 py-0.5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700"
            title={(slot.preview as StringPreview).text}
          >
            “{(slot.preview as StringPreview).text}”
          </code>
        </div>
      )}

      {!isNull && slot.preview?.kind === "array" && (
        <div className="mt-1 text-xs text-neutral-700 dark:text-neutral-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-neutral-500">
              array&lt;{(slot.preview as ArrayPreview).elemType}&gt;
            </span>
            <Chip>length={(slot.preview as ArrayPreview).length}</Chip>
            {(slot.preview as ArrayPreview).truncated && (
              <span className="text-[11px] text-neutral-500">(preview)</span>
            )}
          </div>
          <div className="mt-1 grid gap-1">
            {(slot.preview as ArrayPreview).items.map((it) =>
              it.kind === "null" ? (
                <div key={`it-${it.index}`} className="flex items-center gap-2">
                  <Mono>[{it.index}]</Mono>
                  <span className="text-neutral-400">→ null</span>
                </div>
              ) : (
                <div key={`it-${it.index}`} className="flex items-center gap-2">
                  <Mono>[{it.index}]</Mono>
                  <span className="text-neutral-400">→</span>
                  <code className="font-mono rounded px-1 py-0.5 ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700">
                    “{it.text}”
                  </code>
                  <span className="text-[11px] text-neutral-500">
                    @{it.ref}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
