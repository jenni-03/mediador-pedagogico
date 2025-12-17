import * as React from "react";
import type { HexAddr, ByteRange, UiRamItem } from "./types/inspector-types";

/* =================== Paleta sólida (teal/slate gamer) =================== */
const C = {
  panel: "#202734",
  panelSoft: "#243042",
  panelInner: "#1C2734",
  ring: "#334255",
  ringSoft: "#3C4D63",
  text: "text-zinc-100",
  subtext: "text-zinc-300",
};

/* =================== Utils =================== */
const fmtBytes = (n: number) =>
  n >= 1024 ? `${(n / 1024).toFixed(1)}K` : String(n);
const ZERO = "0x00000000" as HexAddr;

function cleanOwnerName(s: string | undefined | null): string | undefined {
  return typeof s === "string"
    ? s.replace(/^\s*var\s+/i, "").trim()
    : undefined;
}

function pickMetaStr(
  meta: Record<string, unknown> | undefined,
  keys: string[]
) {
  const m = (meta ?? {}) as any;
  for (const k of keys) {
    const v = m?.[k];
    if (typeof v === "string" && v.trim()) return v as string;
  }
  return undefined;
}

function varFromMeta(meta?: Record<string, unknown>) {
  return (
    pickMetaStr(meta, [
      "displayName",
      "pretty",
      "name",
      "var",
      "label",
      "ownerVar",
      "fromVar",
      "rootVar",
      "srcVar",
      "ofVar",
      "idName",
    ]) ?? undefined
  );
}

function groupIdFromMeta(meta?: Record<string, unknown>) {
  return (
    pickMetaStr(meta, [
      "groupId",
      "objectId",
      "objId",
      "arrayId",
      "stringId",
      "rootId",
      "ownerId",
      "headerId",
      "dataId",
      "inspectorId",
    ]) ?? undefined
  );
}

function fieldKeyFromMeta(meta?: Record<string, unknown>) {
  return pickMetaStr(meta, ["fieldKey", "key", "field", "prop"]);
}

/** dedupe robusto por (source,type,from,bytes,groupId) */
function dedupeItems(items: UiRamItem[]): UiRamItem[] {
  const seen = new Set<string>();
  const out: UiRamItem[] = [];
  for (const it of items) {
    const gid = groupIdFromMeta(it.meta) ?? "";
    const key = `${it.source}|${it.type}|${it.range.from}|${
      (it as any).bytes ?? ""
    }|${gid}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

/** etiqueta de “segmento” (tooltip) */
function segmentLabel(it: UiRamItem): string {
  const m = (it.meta ?? {}) as any;
  switch (it.source) {
    case "stack-ref":
      return "ref";
    case "stack-prim":
      return it.type || "prim";
    case "heap-header":
      if (it.type === "string") return "String header";
      if (it.type === "array") return "Array header";
      if (it.type === "object")
        return Array.isArray(m?.objKeys) && m.objKeys.length
          ? "Object header (compact)"
          : "Object header";
      return "Header";
    case "heap-data":
      if (it.type === "string") return "String data";
      if (it.type === "array") {
        const elem = m.elemName || m.elem?.name || m.elemType;
        return elem ? `Array<${elem}> data` : "Array data";
      }
      return "Object data";
  }
}

function kindPill(it: UiRamItem): { label: string; cls: string } {
  if (it.type === "array")
    return {
      label: "array",
      cls: "bg-cyan-600/20 text-cyan-100 ring-1 ring-cyan-400/30",
    };
  if (it.type === "string")
    return {
      label: "string",
      cls: "bg-fuchsia-600/20 text-fuchsia-100 ring-1 ring-fuchsia-400/30",
    };
  if (it.type === "object")
    return {
      label: "object",
      cls: "bg-emerald-600/20 text-emerald-100 ring-1 ring-emerald-400/30",
    };
  return {
    label: it.type || "prim",
    cls: "bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]",
  };
}

function chipLabelBySource(
  src: UiRamItem["source"]
): "ref" | "prim" | "header" | "data" {
  switch (src) {
    case "stack-ref":
      return "ref";
    case "stack-prim":
      return "prim";
    case "heap-header":
      return "header";
    case "heap-data":
      return "data";
  }
}

/* =================== Tema por fuente =================== */
function srcTheme(src: UiRamItem["source"]) {
  switch (src) {
    case "stack-prim":
      return {
        chip: "bg-sky-600/20 text-sky-100 ring-1 ring-sky-400/35",
        rail: "from-sky-300/80 to-cyan-300/60",
        ringStrong: "ring-sky-300/60",
      };
    case "stack-ref":
      return {
        chip: "bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/40",
        rail: "from-amber-300/80 to-emerald-300/70",
        ringStrong: "ring-amber-300/60",
      };
    case "heap-header":
      return {
        chip: "bg-cyan-600/20 text-cyan-100 ring-1 ring-cyan-400/35",
        rail: "from-cyan-300/85 to-emerald-300/70",
        ringStrong: "ring-cyan-300/60",
      };
    case "heap-data":
      return {
        chip: "bg-emerald-600/20 text-emerald-100 ring-1 ring-emerald-400/35",
        rail: "from-emerald-300/85 to-fuchsia-300/70",
        ringStrong: "ring-emerald-300/60",
      };
  }
}

/* =================== Backdrop PCB (sutil y sólido) =================== */
function IndexBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(56,189,248,.18) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, rgba(56,189,248,.18) 0 1px, transparent 1px 20px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1100px 520px at -10% 110%, rgba(56,189,248,.12), transparent 60%), radial-gradient(1000px 460px at 120% -10%, rgba(16,185,129,.12), transparent 60%)",
        }}
      />
    </>
  );
}

/* =================== Leyenda =================== */
function LegendBar() {
  const Item = ({ label, cls }: { label: string; cls: string }) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] ${cls}`}
    >
      <span className="h-2 w-2 rounded-full bg-white/70" />
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap gap-2">
      <Item
        label="ref"
        cls="bg-amber-500/25 text-amber-100 ring-1 ring-amber-300/40"
      />
      <Item
        label="prim"
        cls="bg-sky-600/20 text-sky-100 ring-1 ring-sky-400/35"
      />
      <Item
        label="header"
        cls="bg-cyan-600/20 text-cyan-100 ring-1 ring-cyan-400/35"
      />
      <Item
        label="data"
        cls="bg-emerald-600/20 text-emerald-100 ring-1 ring-emerald-400/35"
      />
      <span className={`ml-auto text-[10px] ${C.subtext}`}>
        Toca para resaltar rango en RAM
      </span>
    </div>
  );
}

/* =================== Botón de pestaña =================== */
function TabButton({
  active,
  label,
  count,
  tone,
  onClick,
  tourId,
}: {
  active: boolean;
  label: string;
  count: number;
  tone: "amber" | "sky" | "cyan" | "emerald";
  onClick: () => void;
  tourId?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide transition-all";
  const common = active
    ? "bg-emerald-500/20 text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,.7),0_0_14px_rgba(16,185,129,.8)]"
    : "bg-[#141925]/85 text-zinc-300 hover:bg-[#1b2332] hover:text-zinc-50 border border-white/5";
  const dotColor =
    tone === "amber"
      ? "bg-amber-400"
      : tone === "sky"
        ? "bg-sky-400"
        : tone === "cyan"
          ? "bg-cyan-400"
          : "bg-emerald-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${common}`}
      data-tour={tourId}
    >
      <span
        className={`h-2 w-2 rounded-full ${dotColor} shadow-[0_0_8px_rgba(250,250,250,.9)]`}
      />
      <span>{label}</span>
      <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-black/40 font-mono tabular-nums">
        {count}
      </span>
    </button>
  );
}

/* =================== Card =================== */
function ItemCard({
  it,
  pressed,
  onToggle,
  onHoverRange,
  onLeaveRange,
  heapOwnerName,
  attrChips,
}: {
  it: UiRamItem;
  pressed: boolean;
  onToggle: () => void;
  onHoverRange?: (r: ByteRange) => void;
  onLeaveRange?: () => void;
  heapOwnerName?: string;
  attrChips?: string[];
}) {
  const theme = srcTheme(it.source)!;
  const pill = kindPill(it);
  const seg = segmentLabel(it);

  const isStackPrim = it.source === "stack-prim";
  const isStackRef = it.source === "stack-ref";
  const isHeap = it.source === "heap-header" || it.source === "heap-data";

  const owner = cleanOwnerName(heapOwnerName ?? varFromMeta(it.meta));
  const fieldKey = fieldKeyFromMeta(it.meta);
  let titleText = isStackPrim
    ? (varFromMeta(it.meta) ?? (it.type || "prim"))
    : isStackRef
      ? (varFromMeta(it.meta) ?? "ref")
      : fieldKey && owner
        ? `${owner}.${fieldKey}`
        : (owner ?? "sin nombre");

  return (
    <div
      className={[
        "icq-card",
        "relative rounded-2xl overflow-hidden transition-transform",
        "bg-[linear-gradient(180deg,rgba(36,48,66,1),rgba(28,39,52,1))]",
      ].join(" ")}
      style={{ border: `1px solid ${C.ring}` }}
      data-pressed={pressed ? "y" : "n"}
      onMouseEnter={() => onHoverRange?.(it.range)}
      onMouseLeave={() => onLeaveRange?.()}
    >
      <style>{`
        .icq-card{ container-type:inline-size; }
        .icq-body{ padding:.65rem .75rem; gap:.55rem; }
        .icq-title{ font-size:clamp(.96rem,1.0vw + .52rem,1.06rem); }
        .icq-chip,.icq-badge{ border-radius:9999px; padding:.18rem .55rem; }
        .icq-metrics{ display:flex; gap:.45rem; align-items:center; }
        .icq-card[data-pressed="y"]{ outline:2px solid transparent; box-shadow:0 0 0 2px rgba(167,139,250,.35) inset; }
        @container (max-width: 430px){
          .icq-body{ padding:.5rem .6rem; gap:.48rem; }
          .icq-title{ font-size:.98rem; }
          .icq-chip{ font-size:.62rem; padding:.12rem .45rem; }
          .icq-badge{ font-size:.62rem; padding:.12rem .45rem; }
          .icq-metrics{ width:100%; justify-content:space-between; flex-wrap:wrap; order:4; }
        }
      `}</style>

      {/* rail */}
      <div
        className={[
          "absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b",
          theme.rail,
        ].join(" ")}
      />

      {/* botón accesible */}
      <div
        role="button"
        aria-pressed={pressed}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={[
          "icq-body relative w-full text-left flex flex-wrap items-center",
          pressed ? "bg-black/15" : "hover:bg-black/10",
        ].join(" ")}
        title={`${titleText}${isHeap ? ` • ${seg}` : ""}`}
      >
        {!(it.source === "heap-header" || it.source === "heap-data") && (
          <span className={["icq-chip", theme.chip].join(" ")}>
            {chipLabelBySource(it.source)}
          </span>
        )}

        {!isStackRef && (
          <span className={["icq-chip", pill.cls].join(" ")}>{pill.label}</span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`icq-title truncate font-semibold tracking-tight ${C.text}`}
            >
              {titleText}
            </div>
            {attrChips && attrChips.length > 0 && (
              <div className="hidden sm:flex flex-wrap gap-1">
                {attrChips.map((c) => (
                  <span
                    key={c}
                    className="icq-badge bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]"
                    title={c}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isHeap && (
            <div className={`mt-0.5 text-[11px] ${C.subtext}`}>{seg}</div>
          )}
        </div>

        <div className="icq-metrics shrink-0">
          {(it.source === "heap-header" || it.source === "heap-data") && (
            <span className="icq-badge bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659] tabular-nums">
              {fmtBytes((it as any).bytes ?? 0)}
            </span>
          )}
          <span className="icq-badge bg-[#2D3747] text-zinc-100 ring-1 ring-[#3B4659] font-mono tabular-nums">
            {(it.range.from as string).toUpperCase()}
          </span>
        </div>

        {attrChips && attrChips.length > 0 && (
          <div className="sm:hidden basis-full pt-1 flex flex-wrap gap-1">
            {attrChips.map((c) => (
              <span
                key={c}
                className="icq-badge bg-[#2F394B] text-zinc-100 ring-1 ring-[#3B4659]"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =================== Agrupación =================== */
type Groups = {
  stackPrim: UiRamItem[];
  stackRef: UiRamItem[];
  heapHdr: UiRamItem[];
  heapData: UiRamItem[];
};

function collapseHeapObjectData(items: UiRamItem[]): UiRamItem[] {
  const buckets = new Map<string, UiRamItem[]>();
  const noGroup: UiRamItem[] = [];

  for (const it of items) {
    if (it.source !== "heap-data") {
      noGroup.push(it);
      continue;
    }

    const gid = groupIdFromMeta(it.meta);

    if (!gid || it.type === "string") {
      noGroup.push(it);
      continue;
    }

    const arr = buckets.get(gid) ?? [];
    arr.push(it);
    buckets.set(gid, arr);
  }

  const result: UiRamItem[] = [];
  for (const [gid, arr] of buckets) {
    const groupItem = arr.find(
      (x) => x.id === `${gid}:data` && x.type === "object"
    );
    if (groupItem) result.push(groupItem);
    else result.push(...arr);
  }
  result.push(...noGroup);
  return result;
}

function groupItems(items: UiRamItem[]): Groups {
  const g: Groups = { stackPrim: [], stackRef: [], heapHdr: [], heapData: [] };
  for (const it of items) {
    if (it.source === "stack-prim") g.stackPrim.push(it);
    else if (it.source === "stack-ref") g.stackRef.push(it);
    else if (it.source === "heap-header") g.heapHdr.push(it);
    else g.heapData.push(it);
  }
  g.heapData = collapseHeapObjectData(g.heapData);

  const byAddr = (a: UiRamItem, b: UiRamItem) =>
    parseInt(a.range.from, 16) - parseInt(b.range.from, 16);
  g.stackPrim.sort(byAddr);
  g.stackRef.sort(byAddr);
  g.heapHdr.sort(byAddr);
  g.heapData.sort(byAddr);
  return g;
}

/** Índice de nombres para items de heap */
function buildHeapOwnerNameIndex(items: UiRamItem[]) {
  const nameByGroup = new Map<string, string>();
  for (const it of items) {
    const gid = groupIdFromMeta(it.meta);
    const own = cleanOwnerName(varFromMeta(it.meta));
    if (gid && own) nameByGroup.set(gid, own);
  }
  for (const it of items) {
    const gid = groupIdFromMeta(it.meta);
    if (!gid || nameByGroup.has(gid)) continue;
    const peer = items.find(
      (x) => x !== it && groupIdFromMeta(x.meta) === gid && varFromMeta(x.meta)
    );
    const nm = cleanOwnerName(peer && varFromMeta(peer?.meta));
    if (gid && nm) nameByGroup.set(gid, nm);
  }
  return (it: UiRamItem): string | undefined => {
    const gid = groupIdFromMeta(it.meta);
    return gid ? nameByGroup.get(gid) : undefined;
  };
}

/** Id canónico para selección (colapsa campos → heap#X:data) */
function canonicalSelectId(it: UiRamItem): string {
  const gid = groupIdFromMeta(it.meta);
  if (it.source === "heap-data" && gid) return `${gid}:data`;
  if (it.source === "heap-header" && gid) return `${gid}:header`;
  return it.id;
}

/** Busca un rango representativo para un id canónico (usa todos los items) */
function rangeForSelectId(
  selId: string,
  itemsAll: UiRamItem[]
): ByteRange | undefined {
  const exact = itemsAll.find((x) => x.id === selId);
  if (exact) return exact.range;
  const gid = selId.split(":").slice(0, 2).join(":"); // heap#N
  const any =
    itemsAll.find(
      (x) => groupIdFromMeta(x.meta) === gid && x.source === "heap-data"
    ) ?? itemsAll.find((x) => groupIdFromMeta(x.meta) === gid);
  return any?.range;
}

/* =================== Columna =================== */
function Column({
  title,
  items,
  allItems,
  selectedId,
  onToggleItem,
  onFocusRange,
  heapOwnerNameOf,
  attrsOf,
}: {
  title: string;
  items: UiRamItem[];
  allItems: UiRamItem[];
  selectedId: string | null;
  onToggleItem: (it: UiRamItem) => void;
  onFocusRange: (r: ByteRange) => void;
  heapOwnerNameOf: (it: UiRamItem) => string | undefined;
  attrsOf: (it: UiRamItem) => string[];
}) {
  return (
    <div
      className="flex flex-col flex-1 min-h-0 rounded-xl overflow-hidden"
      style={{ background: C.panelInner, border: `1px solid ${C.ring}` }}
    >
      <div
        className="shrink-0 px-3 py-2"
        style={{
          background: C.panelSoft,
          borderBottom: `1px solid ${C.ring}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400/85 shadow-[0_0_6px_rgba(52,211,153,.9)]" />
          <span className="text-[12px] tracking-wide uppercase text-emerald-100">
            {title}
          </span>
          <span className="ml-auto text-[10px] text-zinc-300">
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 ramindex-scroll">
        {items.length === 0 ? (
          <div
            className="px-3 py-10 text-sm text-zinc-300 text-center border border-dashed rounded-xl"
            style={{ borderColor: C.ring }}
          >
            vacío
          </div>
        ) : (
          items.map((it) => {
            const canonicalId = canonicalSelectId(it);
            const pressed = selectedId === canonicalId;
            const ownerName =
              it.source === "heap-header" || it.source === "heap-data"
                ? heapOwnerNameOf(it)
                : undefined;

            return (
              <ItemCard
                key={it.id}
                it={it}
                pressed={pressed}
                heapOwnerName={ownerName}
                attrChips={attrsOf(it)}
                onToggle={() => {
                  const willSelect = !pressed;
                  onToggleItem(it);
                  onFocusRange(
                    willSelect
                      ? (rangeForSelectId(canonicalId, allItems) ?? it.range)
                      : { from: ZERO, to: ZERO }
                  );
                }}
                onHoverRange={(r) => {
                  if (!pressed) onFocusRange(r);
                }}
                onLeaveRange={() => {
                  if (!pressed) onFocusRange({ from: ZERO, to: ZERO });
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/* =================== Panel principal (controlable) =================== */
export default function RamIndexPanel({
  items,
  onFocusRange,
  selectedId,
  onPick,
  onClearAll, // 👈 NUEVO
}: {
  items: UiRamItem[];
  onFocusRange?: (range: ByteRange) => void;
  selectedId?: string | null;
  onPick?: (item: UiRamItem | null) => void;
  onClearAll?: () => void; // 👈 NUEVO
}) {
  // 1) dedupe
  const itemsClean = React.useMemo(() => dedupeItems(items), [items]);

  // 2) agrupar + colapsar heap-data objetos
  const groups = React.useMemo(() => groupItems(itemsClean), [itemsClean]);

  // 3) índice de nombres para owner
  const heapOwnerNameOf = React.useMemo(
    () => buildHeapOwnerNameIndex(itemsClean),
    [itemsClean]
  );

  // 4) chips de atributos
  const attrsOf = React.useCallback(
    (it: UiRamItem) => {
      if (it.source !== "heap-data") return [];
      const owner = heapOwnerNameOf(it) ?? "";
      const fk = fieldKeyFromMeta(it.meta);
      if (fk) return [`${owner}.${fk}`];
      if (it.type === "object") {
        const gid = groupIdFromMeta(it.meta);
        const header = itemsClean.find(
          (x) => x.source === "heap-header" && groupIdFromMeta(x.meta) === gid
        );
        const keys =
          ((header?.meta as any)?.objKeys as string[] | undefined) ?? [];
        return keys.map((k) => `${owner}.${k}`);
      }
      return [];
    },
    [itemsClean, heapOwnerNameOf]
  );

  // 5) selección controlada / no controlada
  const isControlled = selectedId !== undefined;
  const [localSel, setLocalSel] = React.useState<string | null>(
    selectedId ?? null
  );
  React.useEffect(() => {
    if (isControlled) setLocalSel(selectedId ?? null);
  }, [isControlled, selectedId]);
  const selId = isControlled ? (selectedId ?? null) : localSel;

  // 6) foco en RAM cuando cambia selección
  React.useEffect(() => {
    if (!onFocusRange) return;
    if (selId) {
      const r = rangeForSelectId(selId, itemsClean);
      if (r) onFocusRange(r);
    } else {
      onFocusRange({ from: ZERO, to: ZERO });
    }
  }, [selId, itemsClean, onFocusRange]);

  const toggle = React.useCallback(
    (it: UiRamItem) => {
      const canonicalId = canonicalSelectId(it);
      const nextId = selId === canonicalId ? null : canonicalId;
      if (!isControlled) setLocalSel(nextId);
      onPick?.(nextId ? it : null);
    },
    [isControlled, selId, onPick]
  );

  // 7) pestañas
  const [tab, setTab] = React.useState<"stack" | "headers" | "data">("stack");

  const stackItems = React.useMemo(
    () => [...groups.stackRef, ...groups.stackPrim],
    [groups.stackRef, groups.stackPrim]
  );
  const headersItems = groups.heapHdr;
  const dataItems = groups.heapData;

  const counts = {
    stack: stackItems.length,
    headers: headersItems.length,
    data: dataItems.length,
  };

  const { currentTitle, currentItems } = React.useMemo(() => {
    switch (tab) {
      case "stack":
        return { currentTitle: "STACK", currentItems: stackItems };
      case "headers":
        return { currentTitle: "HEAP · HEADERS", currentItems: headersItems };
      case "data":
      default:
        return { currentTitle: "HEAP · DATA", currentItems: dataItems };
    }
  }, [tab, stackItems, headersItems, dataItems]);

  return (
    <section
      className="relative w-full rounded-2xl overflow-hidden"
      data-tour="panelRamIndex"
      style={{
        height: "clamp(360px,48vh,680px)",
        color: "white",
        background: C.panel,
        border: `1px solid ${C.ring}`,
        boxShadow:
          "0 20px 36px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04)",
      }}
    >
      <IndexBackdrop />

      {/* scroll del índice */}
      <style>{`
        .ramindex-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148,163,184,0.9) transparent;
        }
        .ramindex-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .ramindex-scroll::-webkit-scrollbar-track {
          background: radial-gradient(circle at 50% 0%, rgba(15,23,42,0.95), transparent 55%);
          border-radius: 9999px;
        }
        .ramindex-scroll::-webkit-scrollbar-thumb {
          background-image: linear-gradient(to bottom, rgba(129,140,248,0.97), rgba(45,212,191,0.94));
          border-radius: 9999px;
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.98),
            0 0 10px rgba(45,212,191,0.75);
        }
        .ramindex-scroll::-webkit-scrollbar-thumb:hover {
          background-image: linear-gradient(to bottom, rgba(244,244,245,0.98), rgba(56,189,248,0.98));
        }
        .ramindex-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      {/* Título + leyenda */}
      <div className="relative p-3 sm:p-4 pb-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]" />
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              RAM · Índice
            </h2>
          </div>
          <div className="ml-auto w-full sm:w-auto">
            <LegendBar />
          </div>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="relative px-3 sm:px-4 pb-4 h-[calc(100%-3.25rem)] min-h-0">
        <div
          className="relative h-full rounded-xl overflow-hidden flex flex-col min-h-0"
          style={{ background: C.panelSoft, border: `1px solid ${C.ring}` }}
        >
          <div className="flex-1 min-w-0 min-h-0 p-3 sm:p-4 flex">
            <Column
              title={currentTitle}
              items={currentItems}
              allItems={itemsClean}
              selectedId={selId}
              onToggleItem={toggle}
              onFocusRange={(r) => onFocusRange?.(r)}
              heapOwnerNameOf={heapOwnerNameOf}
              attrsOf={attrsOf}
            />
          </div>

          {/* barra de pestañas + botón Limpiar RAM */}
          <div
            className="shrink-0 px-3 sm:px-4 pb-3 pt-2 border-t border-[rgba(148,163,184,0.35)] bg-gradient-to-t from-black/45 via-black/15 to-transparent"
            data-tour="tabsRamIndex"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              {onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  data-tour="limpiar"
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/80 bg-rose-500/15 px-3 py-1.5 text-[11px] font-semibold text-rose-50 shadow-[0_0_0_1px_rgba(248,113,113,0.7),0_0_18px_rgba(248,113,113,0.7)] hover:bg-rose-500/30 hover:border-rose-200/90 hover:shadow-[0_0_0_1px_rgba(254,202,202,0.9),0_0_22px_rgba(248,113,113,0.95)] transition-colors"
                  title="Borrar todas las estructuras de la memoria"
                >
                  <span className="text-sm">🧹</span>
                  <span>Limpiar RAM</span>
                  <span className="hidden sm:inline text-[9px] px-1.5 py-[1px] rounded-full bg-black/40 font-mono uppercase tracking-wide">
                    Reset total
                  </span>
                </button>
              )}

              <div className="flex-1 flex justify-center">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <TabButton
                    tourId="tabRamStack"
                    active={tab === "stack"}
                    label="STACK"
                    count={counts.stack}
                    tone="amber"
                    onClick={() => setTab("stack")}
                  />
                  <TabButton
                    tourId="tabRamHeaders"
                    active={tab === "headers"}
                    label="HEADERS"
                    count={counts.headers}
                    tone="cyan"
                    onClick={() => setTab("headers")}
                  />
                  <TabButton
                    tourId="tabRamData"
                    active={tab === "data"}
                    label="DATA"
                    count={counts.data}
                    tone="emerald"
                    onClick={() => setTab("data")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
