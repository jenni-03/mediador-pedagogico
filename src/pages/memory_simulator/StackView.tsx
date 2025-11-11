// -----------------------------------------------------------------------------
// StackView (modo estudiante) — sin “cristal” detrás de las flechas
// Contrato intacto: recibe UiFrame[]. Solo cambia la presentación.
// -----------------------------------------------------------------------------

import React from "react";

/* ===== Tipos espejo del snapshot ===== */
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
type UiFrame = { id: number; name: string; slots: UiSlot[] };

/* ===== Utils ===== */
const hexToNum = (h: HexAddr | string) => parseInt(h as string, 16);
const bytesBetween = (r: ByteRange) =>
  Math.max(0, hexToNum(r.to) - hexToNum(r.from));

/* ===== Tokens ===== */
const tone = {
  label: "text-[11px] text-neutral-400",
  kbd: "px-1.5 py-0.5 rounded bg-neutral-900/70 ring-1 ring-neutral-700/50 font-mono text-[11px]",
  cardBase:
    "rounded-lg ring-1 ring-neutral-700/40 bg-neutral-900/60 hover:bg-white/[0.02] transition",
};
const railAmber = "from-amber-200/70 to-amber-300/50";

/* ===== Píldoras ===== */
const Tag = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
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
  <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] bg-neutral-800/60 text-neutral-200 ring-1 ring-neutral-700/40 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
    {children}
  </span>
);
const Mono = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <code className={`font-mono tabular-nums ${className}`}>{children}</code>;
const AddrBtn = ({ hex }: { hex: HexAddr }) => (
  <button
    onClick={() => navigator?.clipboard?.writeText?.(hex)}
    title="Copiar dirección"
    className={`${tone.kbd} hover:bg-neutral-900 active:scale-[.98] transition`}
  >
    📍 {hex}
  </button>
);

/* ===== Rails ===== */
function Rail({ cls }: { cls: string }) {
  return (
    <div
      className={`absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b ${cls} shadow-[0_0_14px_rgba(255,255,255,.06)_inset]`}
      aria-hidden
    />
  );
}

/* ============================================================
   StackView — shell sólido (sin blur ni panel translúcido)
   ============================================================ */
export function StackView({ frames }: { frames: UiFrame[] }) {
  const items = React.useMemo(
    () =>
      (frames ?? []).flatMap((f) =>
        (f.slots ?? []).map((slot, idx) => ({ key: `${f.id}:${idx}`, slot }))
      ),
    [frames]
  );

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const { pct, atTop, atBottom } = useScrollInfo(scrollRef);

  return (
    <section className="relative h-full min-h-0">
      {/* Marco exterior con borde y glow (sin cristal) */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl pointer-events-none"
        style={{
          border: "1px solid rgba(236,72,153,.38)", // rosa-500 ≈ #ec4899
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.05)," + // filo interno tenue
            "0 0 24px 4px rgba(236,72,153,.10)", // glow exterior
        }}
      />

      {/* Cuerpo: 🔴 sin backdrop-blur y sin fondo semitransparente */}
      <div className="relative h-full min-h-0 flex flex-col rounded-3xl p-3 overflow-hidden">
        {/* Header */}
        <div className="mb-2 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-7 w-7 rounded-full bg-white/6 ring-1 ring-white/10 shadow-inner">
              🧱
            </span>
            <h2 className="text-lg font-semibold tracking-wide">Stack</h2>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Tag className="bg-amber-900/45 text-amber-100 ring-amber-700/50">
              🔢 prim → vive aquí
            </Tag>
            <Tag className="bg-violet-900/45 text-violet-100 ring-violet-700/50">
              🧭 ref → apunta al heap
            </Tag>
            <Tag className="bg-sky-900/40 text-sky-100 ring-sky-700/40">
              📦 bytes = tamaño en RAM
            </Tag>
          </div>
        </div>

        {/* micro barra de progreso del scroll */}
        <div className="mb-2 h-1 rounded-full bg-white/[0.06] ring-1 ring-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-400/60 via-pink-400/60 to-amber-400/60"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>

        {/* Contenedor scrolleable + borde (resultado) que sí llena */}
        <div
          className="relative mt-2 rounded-2xl p-[1px] flex-1 min-h-0"
          style={{
            border: "1px solid rgba(236,72,153,.30)",
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,.04), 0 0 20px rgba(236,72,153,.08)",
          }}
        >
          <div
            ref={scrollRef}
            className="h-full min-h-0 overflow-auto rounded-2xl p-2 stk-scroll"
          >
            <ScrollFades showTop={!atTop} showBottom={!atBottom} />

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-700 p-6 text-center text-sm text-neutral-400">
                Stack vacío.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map(({ key, slot }) => (
                  <li
                    key={key}
                    className="relative isolate overflow-visible rounded-xl p-0 min-w-0 contain-paint"
                  >
                    <div className="px-2 py-1">
                      {slot.kind === "prim" ? (
                        <PrimSlotCard slot={slot as UiPrimSlot} />
                      ) : (
                        <RefSlotCard slot={slot as UiRefSlot} />
                      )}
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

/* ───────── helpers del shell ───────── */
function useScrollInfo(ref: React.RefObject<HTMLDivElement>) {
  const [st, setSt] = React.useState({ pct: 0, atTop: true, atBottom: false });
  React.useEffect(() => {
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
          className="pointer-events-none absolute left-0 right-0 top-0 h-6"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,.45), transparent)",
          }}
        />
      )}
      {showBottom && (
        <div
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-6"
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,.45), transparent)",
          }}
        />
      )}
    </>
  );
}

/* ───────────────────── Helpers visuales para prim ───────────────────── */
function BytePills({ count }: { count: number }) {
  const n = Math.max(1, count | 0);
  return (
    <div className="grid auto-cols-max grid-flow-col gap-1">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-[12px] w-[16px] rounded-[5px] ring-1 ring-white/10 bg-neutral-900/70 shadow-[inset_0_1px_0_rgba(255,255,255,.14)]"
          title={`byte ${i}`}
        >
          <div className="h-full w-full rounded-[5px] bg-gradient-to-b from-white/10 to-white/0" />
        </div>
      ))}
    </div>
  );
}

function ValueView({ slot }: { slot: UiPrimSlot }) {
  const t = slot.type;
  const v = slot.display ?? slot.value;
  const isNum = typeof v === "number";
  const isInt =
    t === "byte" ||
    t === "short" ||
    t === "int" ||
    t === "long" ||
    t === "char";

  let hex: string | null = null;
  if (isNum && isInt) {
    const mask =
      t === "byte" ? 0xff : t === "short" || t === "char" ? 0xffff : 0xffffffff;
    const u = (Number(v) & mask) >>> 0;
    hex = "0x" + u.toString(16).toUpperCase();
  }
  const asChar = t === "char" ? String(v) : null;

  return (
    <>
      <div className="text-xl font-extrabold leading-6 tracking-tight">
        {String(v)}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {hex && (
          <span
            className="inline-flex items-center rounded-full px-2 py-[2px] text-[11px] bg-white/10 ring-1 ring-white/15"
            title="representación hexadecimal"
          >
            {hex}
          </span>
        )}
        {asChar && (
          <span
            className="inline-flex items-center rounded-full px-2 py-[2px] text-[11px] bg-white/10 ring-1 ring-white/15"
            title="carácter"
          >
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
    <div
      className={`${tone.cardBase} p-2.5 pl-3 group relative overflow-hidden`}
    >
      <div className="absolute left-0 top-0 h-[3px] w-[72%] rounded-r bg-gradient-to-r from-amber-300/40 to-transparent" />
      <Rail cls={railAmber} />

      <div className="flex flex-wrap items-center gap-2 pl-1">
        <Tag className="bg-amber-900/45 text-amber-100 ring-amber-700/50">
          🔢 prim
        </Tag>
        <span className="font-semibold text-sm">{slot.name}</span>
        <Chip>
          tipo: <Mono className="ml-0.5">{slot.type}</Mono>
        </Chip>
        <span className="ml-auto text-[11px] text-neutral-400 tabular-nums flex items-center gap-1">
          📦 {bytes} B
        </span>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <div className="rounded-md bg-neutral-900/60 ring-1 ring-neutral-700/40 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] sm:col-span-1">
          <div className={tone.label}>valor</div>
          <div className="mt-0.5">
            <ValueView slot={slot} />
          </div>
        </div>

        <div className="rounded-md bg-neutral-900/60 ring-1 ring-neutral-700/40 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <div className={tone.label}>dirección</div>
          <div className="mt-0.5">
            <AddrBtn hex={slot.addr} />
          </div>
          <div className="mt-1">
            <span
              className="inline-flex items-center rounded-full px-2 py-[2px] text-[10px] bg-amber-900/40 text-amber-100 ring-1 ring-amber-700/50"
              title="el valor está aquí mismo, no es un puntero"
            >
              vive aquí
            </span>
          </div>
        </div>

        <div className="rounded-md bg-neutral-900/60 ring-1 ring-neutral-700/40 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          <div className={tone.label}>rango RAM</div>
          <div className="mt-0.5 text-xs leading-5">
            <Mono>
              [{slot.range.from} .. {slot.range.to})
            </Mono>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <BytePills count={bytes} />
            <span className="shrink-0 inline-flex items-center rounded px-1.5 py-[2px] text-[10px] bg-white/5 ring-1 ring-white/10">
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
const b2 = (n: number) => n.toString(16).padStart(2, "0");

function StatChip({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] bg-white/[0.06] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.25)]"
    >
      {children}
    </span>
  );
}

function CharCell({
  idx,
  ch,
  code,
}: {
  idx: number;
  ch: string;
  code: number;
}) {
  const lo = code & 0xff;
  const hi = (code >> 8) & 0xff;
  const vis = ch === " " ? "␣" : ch;
  return (
    <div
      className="rounded-lg bg-neutral-900/70 ring-1 ring-white/10 px-2 py-1 grid grid-rows-[auto_1fr_auto] w-[74px] h-[72px] text-center shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"
      title={`[${idx}] ${JSON.stringify(ch)}  •  ${hex4(code)}  •  ${b2(lo)} ${b2(hi)}`}
    >
      <div className="text-[10px] text-neutral-400">[{idx}]</div>
      <div className="text-base leading-7 font-semibold truncate">{vis}</div>
      <div className="text-[10px] text-neutral-300 tabular-nums">
        {hex4(code)}
        <span className="block text-[10px] text-neutral-400">
          {b2(lo)} {b2(hi)}
        </span>
      </div>
    </div>
  );
}

/* ——— Dims de flecha por tipo (string = compacto) ——— */
function arrowDims(kind: UiRefSlot["refKind"]) {
  if (kind === "string") {
    return {
      HEAD: 42,
      BORDER: 2,
      SAFE_RIGHT: 42 + 18,
      PAD_X: "p-2.5",
      BUS_H: 10,
    };
  }
  return {
    HEAD: 62,
    BORDER: 2,
    SAFE_RIGHT: 62 + 22,
    PAD_X: "p-3 sm:p-3.5",
    BUS_H: 12,
  };
}

/* ——— Meta chips ——— */
function MetaChip({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[11px] bg-white/[0.06] ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.22)]"
    >
      {children}
    </span>
  );
}

/* ——— Preview string ——— */
function StringCompact({ s }: { s: StringPreview }) {
  const totalBytes = s.len * 2;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <MetaChip title="Tipo">🧵 string</MetaChip>
        <MetaChip title="Codificación">UTF-16LE · 2B/char</MetaChip>
        <MetaChip title="Longitud">len={s.len}</MetaChip>
        <MetaChip title="Tamaño">≈ {totalBytes} B</MetaChip>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(s.text)}
          className="ml-auto rounded-md px-2 py-1 text-[11px] bg-white/[0.07] hover:bg-white/[0.12] ring-1 ring-white/10"
          title="Copiar contenido"
        >
          copiar texto
        </button>
      </div>
      <div className="rounded-lg bg-neutral-900/70 ring-1 ring-white/10 px-2 py-1">
        <code className="block truncate font-mono text-sm" title={s.text}>
          “{s.text}”
        </code>
      </div>
    </div>
  );
}

function StringDetails({ s }: { s: StringPreview }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[11px] rounded-md px-2 py-1 ring-1 ring-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
      >
        {open ? "ocultar bytes/char" : "ver bytes/char"}
      </button>
      {open && <StringViz s={s} />}
    </div>
  );
}

/* ───────────────────── Visualizador de String ───────────────────── */
function StringViz({ s }: { s: StringPreview }) {
  const chars =
    Array.isArray(s.chars) && s.chars.length
      ? s.chars
      : [...s.text].map((c, i) => ({
          index: i,
          char: c,
          code: c.codePointAt(0) ?? 0,
        }));
  const totalBytes = s.len * 2;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatChip title="Formato de almacenamiento">🧵 string</StatChip>
        <StatChip title="Codificación en heap">UTF-16LE · 2B/char</StatChip>
        <StatChip title="Longitud en caracteres">len={s.len}</StatChip>
        <StatChip title="Tamaño aproximado en bytes">≈ {totalBytes} B</StatChip>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(s.text)}
          className="ml-auto rounded-md px-2 py-1 text-[11px] bg-white/[0.06] hover:bg-white/[0.1] ring-1 ring-white/10"
          title="Copiar contenido"
        >
          copiar texto
        </button>
      </div>

      <div className="rounded-xl bg-neutral-900/60 ring-1 ring-white/10 p-2 overflow-x-auto shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
        <div className="grid auto-cols-max grid-flow-col gap-2">
          {chars.map((c) => (
            <CharCell key={c.index} idx={c.index} ch={c.char} code={c.code} />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-neutral-900/70 ring-1 ring-white/10 p-2">
        <div className="text-[11px] text-neutral-400 mb-1">contenido</div>
        <code
          className="block w-full max-w-full truncate font-mono text-sm bg-neutral-900/80 ring-1 ring-white/10 rounded px-2 py-1"
          title={s.text}
        >
          “{s.text}”
        </code>
      </div>
    </div>
  );
}

/* ───────────────────── Tema por tipo ───────────────────── */
function refTheme(kind: UiRefSlot["refKind"]) {
  switch (kind) {
    case "string":
      return {
        badge: "bg-pink-900/60 text-pink-100 ring-pink-700/60",
        edge: "rgb(244,114,182)",
        fillA: "rgba(244,114,182,.16)",
        fillB: "rgba(244,114,182,.06)",
      };
    case "array":
      return {
        badge: "bg-sky-900/60 text-sky-100 ring-sky-700/60",
        edge: "rgb(56,189,248)",
        fillA: "rgba(56,189,248,.16)",
        fillB: "rgba(56,189,248,.06)",
      };
    case "object":
      return {
        badge: "bg-emerald-900/60 text-emerald-100 ring-emerald-700/60",
        edge: "rgb(52,211,153)",
        fillA: "rgba(52,211,153,.16)",
        fillB: "rgba(52,211,153,.06)",
      };
    case "null":
      return {
        badge: "bg-neutral-800/70 text-neutral-200 ring-neutral-700/60",
        edge: "rgb(156,163,175)",
        fillA: "rgba(156,163,175,.14)",
        fillB: "rgba(156,163,175,.06)",
      };
    default:
      return {
        badge: "bg-violet-900/60 text-violet-100 ring-violet-700/60",
        edge: "rgb(167,139,250)",
        fillA: "rgba(167,139,250,.16)",
        fillB: "rgba(167,139,250,.06)",
      };
  }
}

/* util: polígono de flecha */
const makeArrow = (head: number, inset: number) =>
  `polygon(${inset}px ${inset}px,
           calc(100% - ${head + inset}px) ${inset}px,
           calc(100% - ${inset}px) 50%,
           calc(100% - ${head + inset}px) calc(100% - ${inset}px),
           ${inset}px calc(100% - ${inset}px))`;

/* ───────────────────── Tarjeta REFERENCIA ─────────────────── */
function RefSlotCard({ slot }: { slot: UiRefSlot }) {
  const t = refTheme(slot.refKind);
  const isNull = slot.refKind === "null";
  const dims = arrowDims(slot.refKind);
  const HEAD = dims.HEAD;
  const BORDER = 2;
  const SAFE_RIGHT = dims.SAFE_RIGHT;

  const CenterBanner = () => (
    <span
      className="uppercase tracking-[0.14em] text-[10px] font-semibold px-3 py-[6px] rounded-full bg-gradient-to-b from-white/[0.06] to-white/[0.03] text-neutral-200 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.25)]"
      style={{
        boxShadow: `inset 0 0 0 1px ${t.fillA}, 0 0 0 1px rgba(255,255,255,.06)`,
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      APUNTA → HEAP
    </span>
  );

  return (
    <div className="relative">
      {/* Borde/fondo de la flecha */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          clipPath: makeArrow(HEAD, 0),
          background: `linear-gradient(90deg, ${t.fillA}, ${t.fillB})`,
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.06), 0 14px 28px -18px rgba(0,0,0,.7)",
          borderRadius: 14,
        }}
      />

      {/* Cuerpo */}
      <div
        className={`relative ${dims.PAD_X} isolate pl-[6px]`}
        style={{
          clipPath: makeArrow(HEAD - 10, BORDER + 4),
          background:
            "linear-gradient(180deg, rgba(20,20,23,.86), rgba(12,12,15,.78))",
          borderRadius: 12,
          paddingRight: SAFE_RIGHT,
        }}
      >
        <div
          className="absolute left-0 top-0 h-[3px] w-[72%] rounded-r"
          style={{
            background: `linear-gradient(90deg, ${t.edge}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <Tag className={t.badge}>🧭 ref</Tag>
            <span className="font-semibold text-sm truncate">{slot.name}</span>
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] ring-1 ${t.badge}`}
            >
              {slot.refKind}
            </span>
          </div>
          <div className="justify-self-center">
            <CenterBanner />
          </div>
          <div className="justify-self-end">
            <AddrBtn hex={slot.refAddr} />
          </div>
        </div>

        {/* Bus */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-neutral-900/70 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.12)] text-neutral-300">
              puntero
            </span>
            <div className="relative flex-1" style={{ height: dims.BUS_H }}>
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${t.fillA} 0%, ${t.fillB} 100%)`,
                  filter: "saturate(1.1)",
                }}
              />
              <div
                className="absolute inset-[1px] rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(18,18,22,.85), rgba(10,10,12,.7))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 0 1px rgba(255,255,255,.06)",
                }}
              />
              <div
                className="absolute inset-[1px] rounded-full mix-blend-screen opacity-60"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,.18) 0 6px, transparent 6px 12px)",
                }}
              />
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #fff 0 15%, ${t.fillA} 16% 55%, transparent 56%)`,
                  boxShadow: `0 0 10px ${t.fillA}`,
                }}
                aria-hidden
              />
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] bg-neutral-900/70 ring-1 ring-white/10 text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,.12)]"
              title="Destino del puntero"
            >
              <span className="opacity-80">🔌</span>
              <span className="uppercase tracking-wide">HEAP</span>
            </span>
          </div>
        </div>

        {/* STRING → compacto + detalle opcional */}
        {!isNull && slot.preview?.kind === "string" && (
          <>
            <StringCompact s={slot.preview as StringPreview} />
            <StringDetails s={slot.preview as StringPreview} />
          </>
        )}
      </div>
    </div>
  );
}
