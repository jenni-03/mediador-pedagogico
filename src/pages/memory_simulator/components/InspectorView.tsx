import * as React from "react";
import type {
  ByteRange,
  UiInspector,
  UiInspectorArrayInlinePrim,
  UiInspectorArrayRef32,
  UiInspectorObjectCompact,
} from "../types/inspector-types";

/* ─────────── Helpers visuales (acotados al inspector) ─────────── */
const Section = ({
  title,
  meta,
  children,
  className = "",
}: {
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-xl bg-zinc-950/60 ring-1 ring-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] ${className}`}
  >
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] sticky top-0 z-10 bg-zinc-950/70 backdrop-blur">
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-zinc-300">
        {title}
      </h3>
      {meta}
    </header>
    <div className="p-3 sm:p-4">{children}</div>
  </section>
);

const KVGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
);

const KV = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="rounded-lg bg-zinc-900/50 ring-1 ring-white/[0.04] p-3">
    <div className="text-[10px] uppercase tracking-widest text-zinc-400">
      {k}
    </div>
    <div className="mt-1 font-mono text-[12px] tabular-nums text-zinc-100 break-all">
      {v}
    </div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg bg-zinc-900/40 ring-1 ring-white/[0.04] p-3">
    <div className="text-[10px] uppercase tracking-widest text-zinc-400">
      {label}
    </div>
    <div className="mt-1 text-sm font-semibold tabular-nums">{value}</div>
  </div>
);

const QuietChip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-200">
    {children}
  </span>
);

const RangeBtn = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="inline-flex items-center rounded-md border border-white/[0.08] bg-zinc-900/60 px-2 py-[3px] text-[11px] text-zinc-200 hover:bg-zinc-900 transition"
    title="Resaltar bytes en RAM"
  >
    {label}
  </button>
);

const Address = ({ hex }: { hex: string }) => {
  const copy = () => navigator.clipboard?.writeText(hex).catch(() => {});
  return (
    <button
      onClick={copy}
      className="inline-flex items-center rounded-md px-2 py-[2px] font-mono text-[11px] tabular-nums bg-zinc-900/60 ring-1 ring-white/[0.06] hover:bg-zinc-900 transition"
      title="Copiar dirección"
    >
      {hex}
    </button>
  );
};

const SimpleTable = ({
  head,
  rows,
  compact = false,
}: {
  head: React.ReactNode;
  rows: React.ReactNode;
  compact?: boolean;
}) => (
  <div className="max-h-64 overflow-auto rounded-lg ring-1 ring-white/[0.06]">
    <table className={`w-full text-xs ${compact ? "leading-5" : ""}`}>
      <thead className="sticky top-0 bg-zinc-950/80 backdrop-blur text-zinc-400">
        {head}
      </thead>
      <tbody className="[&>tr]:border-t [&>tr]:border-white/[0.06] [&>tr:hover]:bg-white/[0.03]">
        {rows}
      </tbody>
    </table>
  </div>
);

/* ─────────── Componente público ─────────── */
export function InspectorView({
  inspector,
  onFocusRange,
}: {
  inspector: UiInspector;
  onFocusRange: (r: ByteRange) => void;
}) {
  if (!inspector) return null;

  if (inspector.kind === "array-inline-prim") {
    const ins = inspector as UiInspectorArrayInlinePrim;
    return (
      <div className="flex flex-col gap-4">
        <Section
          title="Array · inline prim"
          meta={
            <QuietChip>
              {ins.elemType} · {ins.elemSize}B
            </QuietChip>
          }
        >
          <KVGrid>
            <KV k="header" v={<Address hex={ins.header} />} />
            <KV k="dataPtr" v={<Address hex={ins.dataPtr} />} />
            <Stat label="length" value={ins.length} />
            <Stat label="resumen" value={`${ins.length} elementos`} />
          </KVGrid>
        </Section>

        <Section title="Elementos">
          <SimpleTable
            compact
            head={
              <tr>
                <th className="px-3 py-1 text-left">idx</th>
                <th className="px-3 py-1 text-left">valor</th>
                <th className="px-3 py-1 text-right">rango</th>
              </tr>
            }
            rows={
              <>
                {ins.items.map((it) => (
                  <tr key={it.index}>
                    <td className="px-3 py-1 tabular-nums">{it.index}</td>
                    <td className="px-3 py-1 font-mono break-words">
                      {String(it.preview)}
                    </td>
                    <td className="px-3 py-1 text-right">
                      <RangeBtn
                        label={`${it.range.from}…`}
                        onClick={() => onFocusRange(it.range)}
                      />
                    </td>
                  </tr>
                ))}
              </>
            }
          />
        </Section>
      </div>
    );
  }

  if (inspector.kind === "array-ref32") {
    const ins = inspector as UiInspectorArrayRef32;
    return (
      <div className="flex flex-col gap-4">
        <Section title="Array · ref32" meta={<QuietChip>u32 ptr</QuietChip>}>
          <KVGrid>
            <KV k="header" v={<Address hex={ins.header} />} />
            <KV k="dataPtr" v={<Address hex={ins.dataPtr} />} />
            <Stat label="length" value={ins.length} />
            <Stat label="resumen" value={`${ins.length} celdas`} />
          </KVGrid>
        </Section>

        <Section title="Celdas">
          <SimpleTable
            compact
            head={
              <tr>
                <th className="px-3 py-1 text-left">idx</th>
                <th className="px-3 py-1 text-left">ptr</th>
                <th className="px-3 py-1 text-right">rangos</th>
              </tr>
            }
            rows={
              <>
                {ins.items.map((it) => (
                  <tr key={it.index}>
                    <td className="px-3 py-1 tabular-nums">{it.index}</td>
                    <td className="px-3 py-1">
                      <Address hex={it.ptr} />
                    </td>
                    <td className="px-3 py-1">
                      <div className="flex items-center justify-end gap-1">
                        <RangeBtn
                          label="ptr"
                          onClick={() => onFocusRange(it.ptrRange)}
                        />
                        {it.target && (
                          <>
                            <RangeBtn
                              label="header"
                              onClick={() =>
                                onFocusRange(it.target!.headerRange)
                              }
                            />
                            {it.target.dataRange && (
                              <RangeBtn
                                label="data"
                                onClick={() =>
                                  onFocusRange(it.target!.dataRange!)
                                }
                              />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            }
          />
        </Section>
      </div>
    );
  }

  // object-compact
  const ins = inspector as UiInspectorObjectCompact;
  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Objeto · compact"
        meta={<QuietChip>header + inlines</QuietChip>}
      >
        <KVGrid>
          <KV k="header" v={<Address hex={ins.header} />} />
        </KVGrid>
      </Section>

      <Section title="Campos">
        <SimpleTable
          compact
          head={
            <tr>
              <th className="px-3 py-1 text-left">campo</th>
              <th className="px-3 py-1 text-left">tipo</th>
              <th className="px-3 py-1">valor</th>
              <th className="px-3 py-1 text-right">rangos</th>
            </tr>
          }
          rows={
            <>
              {ins.fields.map((f) => (
                <tr key={f.key}>
                  <td className="px-3 py-1">{f.key}</td>
                  <td className="px-3 py-1">
                    <QuietChip>{f.type}</QuietChip>
                  </td>
                  <td className="px-3 py-1 font-mono break-words">
                    {typeof f.preview === "string" ||
                    typeof f.preview === "number"
                      ? String(f.preview)
                      : JSON.stringify(f.preview)}
                  </td>
                  <td className="px-3 py-1">
                    <div className="flex items-center justify-end gap-1">
                      <RangeBtn
                        label="inline"
                        onClick={() => onFocusRange(f.inlineRange)}
                      />
                      {f.target && (
                        <>
                          <RangeBtn
                            label={`${f.target.kind}:hdr`}
                            onClick={() => onFocusRange(f.target!.headerRange)}
                          />
                          {f.target.dataRange && (
                            <RangeBtn
                              label="data"
                              onClick={() => onFocusRange(f.target!.dataRange!)}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </>
          }
        />
      </Section>
    </div>
  );
}

export default InspectorView;
