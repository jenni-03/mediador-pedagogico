// -----------------------------------------------------------------------------
// StackView (modo estudiante) — gamer sólido (sin glass / sin blur)
// Contrato intacto: recibe UiFrame[]. Solo estilos.
// -----------------------------------------------------------------------------

import React from "react";

/* ===== Tipos espejo del snapshot ===== */
type HexAddr = `0x${string}`;
type ByteRange = { from: HexAddr; to: HexAddr };

type PrimitiveType =
  | "boolean" | "byte" | "short" | "char" | "int" | "long" | "float" | "double" | "string";

type StringPreview = {
  kind: "string"; len: number; text: string;
  chars?: { index: number; code: number; char: string }[];
};

type ArrayItemString = { index: number; ref: HexAddr; kind: "string"; len: number; text: string; };
type ArrayItemNull   = { index: number; ref: HexAddr; kind: "null" };
type ArrayPreview = {
  kind: "array"; length: number; elemType: string;
  items: Array<ArrayItemString | ArrayItemNull>; truncated: boolean;
};

type UiPrimSlot = {
  name: string; kind: "prim"; type: PrimitiveType; addr: HexAddr;
  value: unknown; display?: string; range: ByteRange;
};
type UiRefSlot = {
  name: string; kind: "ref"; refAddr: HexAddr; refKind: "null" | "string" | "array" | "object" | "unknown";
  range: ByteRange; preview?: StringPreview | ArrayPreview;
};

type UiSlot = UiPrimSlot | UiRefSlot;
type UiFrame = { id: number; name: string; slots: UiSlot[] };

/* ===== Utils ===== */
const hexToNum = (h: HexAddr | string) => parseInt(h as string, 16);
const bytesBetween = (r: ByteRange) => Math.max(0, hexToNum(r.to) - hexToNum(r.from));

/* ===== Paleta base sólida (ajustable) ===== */
const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2430",
  ring: "#2E3948",
  ringSoft: "#3A4658",
  label: "text-[11px] text-zinc-300",
  text: "text-zinc-100",
};

const tone = {
  label: C.label,
  kbd:
    "px-1.5 py-0.5 rounded font-mono text-[11px] " +
    "bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]",
  cardBase:
    "rounded-lg ring-1 " +
    "ring-[#354253] bg-[#242E3B] hover:bg-[#273241] transition " +
    "shadow-[inset_0_1px_0_rgba(255,255,255,.04)]",
};

const railAmber = "from-amber-300/80 to-amber-200/60";

/* ===== Píldoras ===== */
const Tag = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
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

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]">
    {children}
  </span>
);

const Mono = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <code className={`font-mono tabular-nums ${className}`}>{children}</code>
);

const AddrBtn = ({ hex }: { hex: HexAddr }) => (
  <button
    onClick={() => navigator?.clipboard?.writeText?.(hex)}
    title="Copiar dirección"
    className={`${tone.kbd} hover:bg-[#324057] active:scale-[.98] transition`}
  >
    📍 {hex}
  </button>
);

/* ===== Rails ===== */
function Rail({ cls }: { cls: string }) {
  return (
    <div
      className={`absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b ${cls} shadow-[0_0_12px_rgba(255,255,255,.08)_inset]`}
      aria-hidden
    />
  );
}

function NamePill({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5
                 text-[13px] font-semibold text-zinc-100
                 bg-[#2D3747] ring-1 ring-[#3B4659]
                 overflow-hidden max-w-[min(58vw,46ch)] sm:max-w-[min(52vw,54ch)] md:max-w-[48ch] lg:max-w-[56ch]"
      title={text}
    >
      <span className="truncate">{text}</span>
    </span>
  );
}

/* ───────── helpers del shell ───────── */
function useScrollInfo(ref: React.RefObject<HTMLDivElement>) {
  const [st, setSt] = React.useState({ pct: 0, atTop: true, atBottom: false });
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
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

function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect; if (r) setW(r.width);
    });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

/* ============================================================
   StackView — gamer sólido
   ============================================================ */
export function StackView({ frames }: { frames: UiFrame[] }) {
  const items = React.useMemo(
    () => (frames ?? []).flatMap((f) => (f.slots ?? []).map((slot, idx) => ({ key: `${f.id}:${idx}`, slot }))),
    [frames]
  );

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const { pct, atTop, atBottom } = useScrollInfo(scrollRef);

  return (
    <section className="relative h-full min-h-0 min-w-0">
      {/* Marco exterior con acento sutil */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
        style={{
          border: `1px solid ${C.ring}`,
          boxShadow: "0 0 20px rgba(167,139,250,.10)",
        }}
      />

      {/* Cuerpo sólido */}
      <div
        className="relative h-full min-h-0 min-w-0 flex flex-col rounded-3xl p-3 overflow-hidden"
        style={{ background: C.panel }}
      >
        {/* Header */}
        <div className="mb-2 flex flex-wrap items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="grid place-items-center h-7 w-7 rounded-full"
              style={{ background: "#2D3747", border: `1px solid ${C.ring}` }}
            >
              🧱
            </span>
            <h2 className={`text-lg sm:text-xl font-semibold tracking-wide truncate ${C.text}`}>Stack</h2>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Tag className="bg-amber-600/20 text-amber-100 ring-amber-400/30">🔢 prim → vive aquí</Tag>
            <Tag className="bg-fuchsia-600/20 text-fuchsia-100 ring-fuchsia-400/30 hidden sm:inline-flex">🧭 ref → apunta al heap</Tag>
            <Tag className="bg-sky-600/20 text-sky-100 ring-sky-400/30 hidden md:inline-flex">📦 bytes = tamaño en RAM</Tag>
          </div>
        </div>

        {/* barra de progreso del scroll */}
        <div
          className="mb-2 h-1 rounded-full overflow-hidden"
          style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>

        {/* Contenedor scrolleable con grid de puntos MUY tenue */}
        <div
          className="relative mt-2 rounded-2xl p-[1px] flex-1 min-h-0"
          style={{ border: `1px solid ${C.ring}` }}
        >
          <div
            ref={scrollRef}
            className="relative h-full min-h-0 overflow-auto rounded-2xl p-2 stk-scroll"
            style={{ background: C.panelSoft }}
          >
            {/* micro-grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background: "radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <ScrollFades showTop={!atTop} showBottom={!atBottom} />

            {items.length === 0 ? (
              <div
                className="rounded-xl border border-dashed p-6 text-center text-sm"
                style={{ borderColor: C.ring, color: "#9aa3af", background: C.panelInner }}
              >
                Stack vacío.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map(({ key, slot }) => (
                  <li key={key} className="relative isolate overflow-visible rounded-xl p-0 min-w-0 contain-paint">
                    <div className="px-2 py-1">
                      {slot.kind === "prim" ? <PrimSlotCard slot={slot as UiPrimSlot} /> : <RefSlotCard slot={slot as UiRefSlot} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScrollFades({ showTop, showBottom }: { showTop: boolean; showBottom: boolean }) {
  return (
    <>
      {showTop && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-0 h-6"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,.28), transparent)" }}
        />
      )}
      {showBottom && (
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-6"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,.28), transparent)" }}
        />
      )}
    </>
  );
}

/* ───────────────────── Helpers visuales para prim ───────────────────── */

function ValueView({ slot }: { slot: UiPrimSlot }) {
  const t = slot.type;
  const v = slot.display ?? slot.value;
  const isNum = typeof v === "number";
  const isInt = t === "byte" || t === "short" || t === "int" || t === "long" || t === "char";

  let hex: string | null = null;
  if (isNum && isInt) {
    const mask = t === "byte" ? 0xff : t === "short" || t === "char" ? 0xffff : 0xffffffff;
    const u = (Number(v) & mask) >>> 0;
    hex = "0x" + u.toString(16).toUpperCase();
  }
  const asChar = t === "char" ? String(v) : null;

  return (
    <>
      <div className="text-2xl font-extrabold leading-6 tracking-tight text-zinc-100">{String(v)}</div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {hex && (
          <span className="inline-flex items-center rounded-full px-2 py-[2px] text-[11px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]">
            {hex}
          </span>
        )}
        {asChar && (
          <span className="inline-flex items-center rounded-full px-2 py-[2px] text-[11px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]">
            {JSON.stringify(asChar)}
          </span>
        )}
      </div>
    </>
  );
}

/* ===== Tarjeta PRIMITIVO ===== */
function PrimSlotCard({ slot }: { slot: UiPrimSlot }) {
  const bytes = bytesBetween(slot.range);
  return (
    <div className={`${tone.cardBase} p-2.5 pl-3 group relative overflow-hidden`}>
      <div className="absolute left-0 top-0 h-[3px] w-[72%] rounded-r bg-gradient-to-r from-amber-300/60 to-transparent" />
      <Rail cls={railAmber} />

      <div className="flex flex-wrap items-center gap-2 pl-1">
        <Tag className="bg-amber-600/20 text-amber-100 ring-amber-400/30">🔢 prim</Tag>
        <NamePill text={slot.name} />
        <Chip>tipo: <Mono className="ml-0.5">{slot.type}</Mono></Chip>
        <span className="ml-auto text-[11px] text-zinc-300 tabular-nums flex items-center gap-1">📦 {bytes} B</span>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md p-2" style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}>
          <div className={tone.label}>valor</div>
          <div className="mt-0.5"><ValueView slot={slot} /></div>
        </div>

        <div className="rounded-md p-2" style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}>
          <div className={tone.label}>dirección</div>
          <div className="mt-0.5"><AddrBtn hex={slot.addr} /></div>
          <div className="mt-1">
            <span
              className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] bg-amber-600/20 text-amber-100 ring-1 ring-amber-400/30"
              title="el valor está aquí mismo, no es un puntero"
            >
              vive aquí
            </span>
          </div>
        </div>

        <div className="rounded-md p-2" style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}>
          <div className={tone.label}>rango RAM</div>
          <div className="mt-0.5 text-xs leading-5 text-zinc-100">
            <Mono>[{slot.range.from} .. {slot.range.to})</Mono>
          </div>
          {/* Sin BytePills; solo indicador de endianness alineado a la derecha */}
          <div className="mt-1 flex items-center justify-end gap-2">
            <span className="shrink-0 inline-flex items-center rounded px-1.5 py-[2px] text-[10px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]">
              LE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── REFERENCIA → puntero al heap ─────────────────── */
const hex4 = (n: number) => "0x" + (n >>> 0).toString(16).padStart(4, "0");
const b2   = (n: number) => n.toString(16).padStart(2, "0");

function StatChip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]">
      {children}
    </span>
  );
}
function MetaChip({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659]">
      {children}
    </span>
  );
}

/* util: polígono de flecha */
const makeArrow = (head: number, inset: number) =>
  `polygon(${inset}px ${inset}px,
           calc(100% - ${head + inset}px) ${inset}px,
           calc(100% - ${inset}px) 50%,
           calc(100% - ${head + inset}px) calc(100% - ${inset}px),
           ${inset}px calc(100% - ${inset}px))`;

/* ───────────────────── Tarjeta REFERENCIA (sólida) ─────────────────── */
function RefSlotCard({ slot }: { slot: UiRefSlot }) {
  const t = refTheme(slot.refKind);
  const { ref: hostRef, width } = useContainerWidth<HTMLDivElement>();

  const headMin = slot.refKind === "string" ? 34 : 44;
  const headMax = slot.refKind === "string" ? 56 : 76;
  const HEAD = Math.max(headMin, Math.min(headMax, Math.round(width * 0.12)));
  const BORDER = 2;
  const SAFE_RIGHT = HEAD + (slot.refKind === "string" ? 18 : 24);
  const PAD_X = width < 420 ? "p-2" : width < 640 ? "p-2.5" : "p-3.5";
  const BUS_H = width < 420 ? 8 : 12;

  const CenterBanner = () => (
    <span
      className="uppercase tracking-[0.14em] text-[10px] font-semibold px-3 py-[6px] rounded-full text-zinc-100"
      style={{
        background: "#2D3747",
        border: `1px solid ${C.ring}`,
        boxShadow: `0 0 0 1px ${t.fillA} inset`,
      }}
    >
      APUNTA → HEAP
    </span>
  );

  return (
    <div ref={hostRef} className="relative min-w-0">
      {/* flecha externa con color (sólida) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          clipPath: makeArrow(HEAD, 0),
          background: `linear-gradient(90deg, ${t.fillA}, ${t.fillB})`,
          boxShadow: "0 16px 26px -18px rgba(0,0,0,.5)",
          borderRadius: 14,
          border: `1px solid ${C.ring}`,
        }}
      />

      {/* cuerpo sólido */}
      <div
        className={`relative ${PAD_X} isolate pl-3`}
        style={{
          clipPath: makeArrow(HEAD - 10, BORDER + 4),
          background: C.panelInner,
          borderRadius: 12,
          paddingRight: SAFE_RIGHT,
          border: `1px solid ${C.ring}`,
        }}
      >
        <div className="absolute left-0 top-0 h-[3px] w-[72%] rounded-r" style={{ background: `linear-gradient(90deg, ${t.edge}, transparent)` }} />

        {/* header */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className={`${t.badge} ml-1`}>🧭 ref</Tag>
            <NamePill text={slot.name} />
            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] ring-1 ${t.badge} shrink-0`}>
              {slot.refKind}
            </span>
          </div>

          <div className="justify-self-center hidden sm:block"><CenterBanner /></div>
          <div className="justify-self-end shrink-0"><AddrBtn hex={slot.refAddr} /></div>
        </div>

        {/* bus sólido con marcas */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659]">
              puntero
            </span>
            <div className="relative flex-1" style={{ height: BUS_H }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(90deg, ${t.fillA} 0%, ${t.fillB} 100%)` }} />
              <div className="absolute inset-[1px] rounded-full" style={{ background: C.panelSoft, boxShadow: "inset 0 1px 0 rgba(255,255,255,.04)" }} />
              <div className="absolute inset-[1px] rounded-full opacity-70"
                   style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.10) 0 6px, transparent 6px 12px)" }} />
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
                   style={{ background: `radial-gradient(circle at 35% 35%, #fff 0 15%, ${t.fillA} 16% 55%, transparent 56%)`, boxShadow: `0 0 8px ${t.fillA}` }}
                   aria-hidden />
            </div>
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659]" title="Destino del puntero">
              <span className="opacity-90">🔌</span><span className="uppercase tracking-wide">HEAP</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Tema por tipo ───────────────────── */
function refTheme(kind: UiRefSlot["refKind"]) {
  switch (kind) {
    case "string":
      return { badge: "bg-pink-700/30 text-pink-100 ring-pink-400/40", edge: "rgb(244,114,182)", fillA: "rgba(244,114,182,.35)", fillB: "rgba(244,114,182,.18)" };
    case "array":
      return { badge: "bg-sky-700/30 text-sky-100 ring-sky-400/40", edge: "rgb(56,189,248)",  fillA: "rgba(56,189,248,.35)",  fillB: "rgba(56,189,248,.18)" };
    case "object":
      return { badge: "bg-emerald-700/30 text-emerald-100 ring-emerald-400/40", edge: "rgb(52,211,153)", fillA: "rgba(52,211,153,.35)", fillB: "rgba(52,211,153,.18)" };
    case "null":
      return { badge: "bg-zinc-600/30 text-zinc-100 ring-zinc-400/35", edge: "rgb(156,163,175)", fillA: "rgba(156,163,175,.28)", fillB: "rgba(156,163,175,.14)" };
    default:
      return { badge: "bg-violet-700/30 text-violet-100 ring-violet-400/40", edge: "rgb(167,139,250)", fillA: "rgba(167,139,250,.35)", fillB: "rgba(167,139,250,.18)" };
  }
}
