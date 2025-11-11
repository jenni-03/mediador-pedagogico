import * as React from "react";
import type { HexAddr, ByteRange, UiRamItem } from "./types/inspector-types";

/* =================== Utils =================== */
const fmtBytes = (n: number) =>
  n >= 1024 ? `${(n / 1024).toFixed(1)}K` : String(n);
const ZERO = "0x00000000" as HexAddr;

/** quita prefijos docentes como "var " del nombre mostrado */
function cleanOwnerName(s: string | undefined | null): string | undefined {
  return typeof s === "string" ? s.replace(/^\s*var\s+/i, "").trim() : undefined;
}


/** Lee en orden la primera propiedad string disponible */
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

/** nombre “variable” más generoso: cubre varios nombres posibles */
function varFromMeta(meta?: Record<string, unknown>): string | undefined {
  // prioriza nombres “bonitos”, luego variantes comunes que suelen usar los builders
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

/** si existe, intenta obtener un id/grupo para cruzar entre header/data y su dueño */
function groupIdFromMeta(meta?: Record<string, unknown>): string | undefined {
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

/** etiqueta de “segmento” (sólo para title/tooltip si hace falta) */
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

/** pill por tipo semántico (array/string/object/prim) */
function kindPill(it: UiRamItem): { label: string; cls: string } {
  if (it.type === "array")
    return {
      label: "array",
      cls: "bg-cyan-900/40 text-cyan-200 border-cyan-600/40",
    };
  if (it.type === "string")
    return {
      label: "string",
      cls: "bg-fuchsia-900/40 text-fuchsia-200 border-fuchsia-600/40",
    };
  if (it.type === "object")
    return {
      label: "object",
      cls: "bg-emerald-900/40 text-emerald-200 border-emerald-600/40",
    };
  return {
    label: it.type || "prim",
    cls: "bg-neutral-800/60 text-neutral-300 border-neutral-700/60",
  };
}

/** Chip corta sin repetir ubicación (stack/heap) */
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
        chip: "bg-sky-900/30 text-sky-200 border-sky-700/40",
        rail: "from-sky-300/70 to-cyan-300/60",
        ringStrong: "ring-sky-300/60",
      };
    case "stack-ref":
      return {
        chip: "bg-amber-900/30 text-amber-200 border-amber-700/40",
        rail: "from-amber-300/70 to-emerald-300/60",
        ringStrong: "ring-amber-300/60",
      };
    case "heap-header":
      return {
        chip: "bg-cyan-900/30 text-cyan-200 border-cyan-700/40",
        rail: "from-cyan-300/80 to-emerald-300/70",
        ringStrong: "ring-cyan-300/60",
      };
    case "heap-data":
      return {
        chip: "bg-emerald-900/35 text-emerald-200 border-emerald-700/40",
        rail: "from-emerald-300/80 to-fuchsia-300/70",
        ringStrong: "ring-emerald-300/60",
      };
  }
}

/* =================== Backdrop PCB =================== */
function IndexBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(16,185,129,.15) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(16,185,129,.15) 0 1px, transparent 1px 24px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(1200px 600px at -10% 110%, rgba(6,182,212,.12), transparent 55%), radial-gradient(1100px 520px at 120% -10%, rgba(34,197,94,.12), transparent 55%)",
        }}
      />
    </>
  );
}

/* =================== Card horizontal (creativa + responsive + toggle) =================== */
function ItemCard({
  it,
  pressed,
  onToggle,
  onHoverRange,
  onLeaveRange,
  heapOwnerName,
}: {
  it: UiRamItem;
  pressed: boolean;
  onToggle: () => void;
  onHoverRange?: (r: ByteRange) => void;
  onLeaveRange?: () => void;
  /** nombre inferido para headers/data (array x, object p, String nombre -> aquí solo “x”, “p”, “nombre”) */
  heapOwnerName?: string;
}) {
  const theme = srcTheme(it.source)!;
  const chipShort = chipLabelBySource(it.source);
  const pill = kindPill(it);
  const seg = segmentLabel(it);

  const isStackPrim = it.source === "stack-prim";
  const isStackRef = it.source === "stack-ref";
  const isHeap = it.source === "heap-header" || it.source === "heap-data";

  // Título (según reglas)
  let titleText = "";
  if (isStackPrim) {
    titleText = varFromMeta(it.meta) ?? (it.type || "prim");
  } else if (isStackRef) {
    titleText = varFromMeta(it.meta) ?? "ref";
  } else {
    // heap: nombre del dueño (sin "var ")
    titleText =
      cleanOwnerName(heapOwnerName ?? varFromMeta(it.meta)) ?? "sin nombre";
  }

  return (
    <div
      className={[
        "icq-card",
        "relative rounded-2xl overflow-hidden transition-all duration-200",
        "bg-[radial-gradient(120%_100%_at_0%_0%,rgba(16,185,129,.06),transparent_40%),linear-gradient(180deg,rgba(9,9,11,.96),rgba(9,9,11,.88))]",
        "border border-neutral-800/80",
        pressed
          ? `ring-2 ${theme.ringStrong} shadow-[inset_0_6px_14px_rgba(0,0,0,.45)] translate-y-[0.5px]`
          : "hover:border-neutral-700/80 hover:shadow-[0_12px_26px_-18px_rgba(0,0,0,.65)]",
      ].join(" ")}
      data-pressed={pressed ? "y" : "n"}
      onMouseEnter={() => onHoverRange?.(it.range)}
      onMouseLeave={() => onLeaveRange?.()}
    >
      <style>{`
        .icq-card{ container-type:inline-size; }
        .icq-body{ padding:.6rem .75rem; gap:.55rem; }
        .icq-title{ font-size:clamp(.95rem,1.0vw + .55rem,1.05rem); }
        .icq-chip,.icq-badge{ border-radius:9999px; padding:.18rem .55rem; }
        .icq-metrics{ display:flex; gap:.4rem; align-items:center; }
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
          pressed ? "bg-neutral-900/40" : "",
        ].join(" ")}
        title={`${titleText}${isHeap ? ` • ${seg}` : ""}`}
      >
        {/* chip corta (ref/prim) — ocultar para heap header/data */}
        {!(it.source === "heap-header" || it.source === "heap-data") && (
          <span
            className={[
              "icq-chip border text-[10px] shrink-0",
              theme.chip,
            ].join(" ")}
          >
            {chipShort}
          </span>
        )}

        {/* pill de tipo:
          - stack-prim: SÍ
          - stack-ref:  NO
          - heap:       SÍ (array/object/string) */}
        {!isStackRef && (
          <span
            className={["icq-chip border text-[10px] shrink-0", pill.cls].join(
              " "
            )}
          >
            {pill.label}
          </span>
        )}

        {/* título */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="icq-title truncate font-semibold tracking-tight text-neutral-100">
              {titleText}
            </div>
          </div>
        </div>

        {/* métricas:
            - stack (prim/ref): solo DIRECCIÓN
            - heap (header/data): BYTES + DIRECCIÓN */}
        <div className="icq-metrics shrink-0">
          {(it.source === "heap-header" || it.source === "heap-data") && (
            <span className="icq-badge border border-neutral-800 bg-neutral-900/60 text-neutral-300 text-[11px] tabular-nums">
              {fmtBytes(it.bytes)}
            </span>
          )}
          <span className="icq-badge border border-neutral-800 bg-neutral-900/60 text-neutral-300 text-[11px] font-mono tabular-nums">
            {it.range.from}
          </span>
        </div>
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
function groupItems(items: UiRamItem[]): Groups {
  const g: Groups = { stackPrim: [], stackRef: [], heapHdr: [], heapData: [] };
  for (const it of items) {
    if (it.source === "stack-prim") g.stackPrim.push(it);
    else if (it.source === "stack-ref") g.stackRef.push(it);
    else if (it.source === "heap-header") g.heapHdr.push(it);
    else g.heapData.push(it);
  }
  const byAddr = (a: UiRamItem, b: UiRamItem) =>
    parseInt(a.range.from, 16) - parseInt(b.range.from, 16);
  g.stackPrim.sort(byAddr);
  g.stackRef.sort(byAddr);
  g.heapHdr.sort(byAddr);
  g.heapData.sort(byAddr);
  return g;
}

/** Índice de nombres para items de heap (mejor “sin nombre”) */
function buildHeapOwnerNameIndex(items: UiRamItem[]) {
  const nameByGroup = new Map<string, string>();

  // 1) si el propio header/data trae nombre
  for (const it of items) {
    const gid = groupIdFromMeta(it.meta);
    const own = cleanOwnerName(varFromMeta(it.meta));
    if (gid && own) nameByGroup.set(gid, own);      // <-- solo set si hay string
  }

  // 2) heredar entre pares con el mismo groupId
  for (const it of items) {
    const gid = groupIdFromMeta(it.meta);
    if (!gid || nameByGroup.has(gid)) continue;

    const peer = items.find(
      (x) => x !== it && groupIdFromMeta(x.meta) === gid && varFromMeta(x.meta)
    );
    const nm = cleanOwnerName(peer && varFromMeta(peer.meta));
    if (gid && nm) nameByGroup.set(gid, nm);         // <-- solo set si hay string
  }

  return (it: UiRamItem): string | undefined => {
    const gid = groupIdFromMeta(it.meta);
    return gid ? nameByGroup.get(gid) : undefined;
  };
}


/* =================== Columna =================== */
function Column({
  title,
  items,
  selectedId,
  onToggleItem,
  onFocusRange,
  heapOwnerNameOf,
}: {
  title: string;
  items: UiRamItem[];
  selectedId: string | null;
  onToggleItem: (it: UiRamItem) => void;
  onFocusRange: (r: ByteRange) => void;
  heapOwnerNameOf: (it: UiRamItem) => string | undefined;
}) {
  return (
    <div className="min-h-0 flex flex-col rounded-xl border border-emerald-900/40 bg-neutral-900/30">
      <div className="shrink-0 px-3 py-2 bg-neutral-900/70 border-b border-emerald-900/40 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_6px_rgba(52,211,153,.9)]" />
          <span className="text-[12px] tracking-wide uppercase text-emerald-200/90">
            {title}
          </span>
          <span className="ml-auto text-[10px] text-neutral-400">
            {items.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {items.length === 0 ? (
          <div className="px-3 py-10 text-sm text-neutral-400 text-center border border-dashed border-neutral-700/60 rounded-xl">
            vacío
          </div>
        ) : (
          items.map((it) => {
            const pressed = selectedId === it.id;
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
                onToggle={() => {
                  const willSelect = !pressed;
                  onToggleItem(it);
                  onFocusRange(
                    willSelect ? it.range : { from: ZERO, to: ZERO }
                  );
                }}
                // hover solo si no está seleccionada
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

/* =================== Panel principal (sin inspector, toggle local + foco persistente) =================== */
export default function RamIndexPanel({
  items,
  onFocusRange,
  selectedId,
}: {
  items: UiRamItem[];
  onFocusRange?: (range: ByteRange) => void;
  selectedId?: string | null;
}) {
  const groups = React.useMemo(() => groupItems(items), [items]);

  // índice para mejorar nombres en heap (evitar “sin nombre”)
  const heapOwnerNameOf = React.useMemo(
    () => buildHeapOwnerNameIndex(items),
    [items]
  );

  // selección local con compat de estado inicial
  const [selId, setSelId] = React.useState<string | null>(selectedId ?? null);

  // foco en RAM sincronizado con selección
  React.useEffect(() => {
    if (!onFocusRange) return;
    if (selId) {
      const it = items.find((x) => x.id === selId);
      if (it) onFocusRange(it.range);
    } else {
      onFocusRange({ from: ZERO, to: ZERO });
    }
  }, [selId, items, onFocusRange]);

  const toggle = React.useCallback((it: UiRamItem) => {
    setSelId((prev) => (prev === it.id ? null : it.id));
  }, []);

  return (
    <section
      className="
        relative
        h-[clamp(360px,48vh,680px)]
        w-full rounded-2xl overflow-hidden
        text-neutral-100
        border border-emerald-900/50
        bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-neutral-950
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_36px_-20px_rgba(0,0,0,0.6)]
      "
    >
      <IndexBackdrop />

      <div className="relative p-3 sm:p-4 pb-2">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          RAM · índice
        </h2>
      </div>

      <div className="relative px-3 sm:px-4 pb-4 h-[calc(100%-3.25rem)]">
        <div className="relative h-full rounded-xl border border-emerald-900/40 bg-neutral-900/20 overflow-hidden flex">
          <div className="flex-1 min-w-0 p-3 sm:p-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 h-full">
              <Column
                title="Stack"
                items={[...groups.stackRef, ...groups.stackPrim]}
                selectedId={selId}
                onToggleItem={toggle}
                onFocusRange={(r) => onFocusRange?.(r)}
                heapOwnerNameOf={heapOwnerNameOf}
              />
              <Column
                title="Heap · headers"
                items={groups.heapHdr}
                selectedId={selId}
                onToggleItem={toggle}
                onFocusRange={(r) => onFocusRange?.(r)}
                heapOwnerNameOf={heapOwnerNameOf}
              />
              <Column
                title="Heap · data"
                items={groups.heapData}
                selectedId={selId}
                onToggleItem={toggle}
                onFocusRange={(r) => onFocusRange?.(r)}
                heapOwnerNameOf={heapOwnerNameOf}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
