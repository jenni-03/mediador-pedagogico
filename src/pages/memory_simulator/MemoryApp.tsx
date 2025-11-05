// src/app/MemoryApp/MemoryApp.tsx
import { useMemo, useState, useCallback } from "react";
import { useMemorySimulator } from "./hooks/useMemorySimulator";
import { StackView } from "./StackView";
import { HeapView } from "./HeapView";
import RamView from "./RamView";
import { LogPanel } from "./LogPanel";
import { AnchorRegistryProvider } from "./AnchorRegistry";
import { HighlightProvider, useHighlight } from "./HighlightCtx";
import { Header } from "../../pages/simulator/components/molecules/Header";
import { RamIndexPanel } from "./RamIndexPanel"; // ← índice RAM

// ---- Tipado local mínimo para la grilla RAM (no acoplar a la VM)
type ByteRange = {
  start: number;
  size: number;
  label?: string;
  tone: "header" | "data" | "slot" | "object";
  emph?: boolean;
};
type UiRamSnapshot = {
  baseAddr: number;
  bytes: Uint8Array;
  bytesPerRow: 16 | 8 | 32; // ← ahora coincide con RamView
  groupSize: 1 | 2 | 4 | 8;
  ranges: ByteRange[];
  activeAddr?: number;
  used?: number;
  capacity?: number;
};
type LegacyRamRow = {
  addr: `0x${string}`;
  hex: string;
  labels?: string[];
  allocs?: { at: `0x${string}`; size: number; label?: string }[];
};
type LegacyUiRam = {
  used: number;
  capacity: number;
  from: `0x${string}`;
  to: `0x${string}`;
  rows: LegacyRamRow[];
};

function isUint8Array(x: unknown): x is Uint8Array {
  return x instanceof Uint8Array;
}
function isLegacyRam(x: any): x is LegacyUiRam {
  return !!x && Array.isArray(x.rows) && typeof x.from === "string";
}
function hexRowToBytes(hex: string): number[] {
  const clean = (hex ?? "").replace(/[^0-9a-fA-F]/g, "");
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const b = clean.slice(i, i + 2);
    if (b.length === 2) out.push(parseInt(b, 16));
  }
  return out;
}
const hexToNum = (h: `0x${string}`) => parseInt(h, 16);

// Asegura UiRamSnapshot: si viene shape nuevo se respeta; si viene legado, se convierte.
function ensureUiRamSnapshot(ram: any): UiRamSnapshot {
  // Shape nuevo
  if (ram && isUint8Array(ram.bytes)) {
    return {
      baseAddr: Number(ram.baseAddr ?? 0) >>> 0,
      bytes: ram.bytes,
      bytesPerRow:
        typeof ram.bytesPerRow === "number"
          ? (ram.bytesPerRow as 16 | 8 | 32)
          : 16,
      groupSize:
        typeof ram.groupSize === "number"
          ? (ram.groupSize as 1 | 2 | 4 | 8)
          : 4,
      ranges: Array.isArray(ram.ranges) ? ram.ranges : [],
      activeAddr:
        typeof ram.activeAddr === "number" ? ram.activeAddr >>> 0 : undefined,
      used: typeof ram.used === "number" ? ram.used : undefined,
      capacity: typeof ram.capacity === "number" ? ram.capacity : undefined,
    };
  }

  // Shape legado
  if (isLegacyRam(ram)) {
    let base = parseInt(ram.from, 16);
    const bytes: number[] = [];
    for (const row of ram.rows) {
      const addr = parseInt(row.addr, 16);
      if (bytes.length === 0) base = addr;
      bytes.push(...hexRowToBytes(row.hex));
    }
    return {
      baseAddr: base >>> 0,
      bytes: new Uint8Array(bytes),
      bytesPerRow: 16,
      groupSize: 4,
      ranges: [], // en esta vista básica ignoramos overlays
      used: ram.used,
      capacity: ram.capacity,
    };
  }

  // Fallback vacío para no romper
  console.warn(
    "[MemoryApp] snapshot.ram no es UiRamSnapshot ni legacy; usando snapshot vacío."
  );
  return {
    baseAddr: 0,
    bytes: new Uint8Array(0),
    bytesPerRow: 16,
    groupSize: 4,
    ranges: [],
  };
}

function AppInner() {
  const { snapshot, logs, animEvents, actions } = useMemorySimulator(1024 * 8);
  const { highlight } = useHighlight();

  // Selección desde el panel de índice
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Ítems para el panel lateral (los necesitamos antes para mapear labels)
  const ramItems = useMemo(() => {
    return Array.isArray((snapshot as any).ramIndex)
      ? (snapshot as any).ramIndex
      : [];
  }, [snapshot]);

  // Proyección de tones → ranges con énfasis si coincide el selectedId
  const baseRanges: ByteRange[] = useMemo(() => {
    const tones = (snapshot as any).ramTones as
      | {
          start: number;
          size: number;
          label?: string;
          tone: ByteRange["tone"];
        }[]
      | undefined;

    if (!Array.isArray(tones)) return [];

    const labelById = new Map<string, string>(
      ramItems.map((it: any) => [String(it.id), String(it.label)])
    );

    return tones.map((t) => ({
      start: t.start >>> 0,
      size: t.size >>> 0,
      label: (t.label && labelById.get(String(t.label))) || t.label,
      tone: t.tone,
      emph: selectedId ? String(t.label) === selectedId : false,
    }));
  }, [snapshot, ramItems, selectedId]);

  // Normalizamos lo que venga en snapshot.ram y le inyectamos ranges + activeAddr
  const ramSnap = useMemo(() => {
    const snap = ensureUiRamSnapshot((snapshot as any).ram);

    // dirección activa desde highlight o desde el ítem seleccionado
    const activeFromHighlight = highlight?.ranges?.[0]?.start;
    const sel = selectedId
      ? ramItems.find((it: any) => it.id === selectedId)
      : null;
    const selectedStart = sel ? hexToNum(sel.range.from) >>> 0 : undefined;

    const active = (activeFromHighlight ?? selectedStart ?? snap.activeAddr) as
      | number
      | undefined;

    return { ...snap, ranges: baseRanges, activeAddr: active };
  }, [snapshot, highlight, baseRanges, ramItems, selectedId]);

  // Selección desde el panel
  const handlePick = useCallback((item: any) => {
    setSelectedId(item.id); // el énfasis lo aplica baseRanges al coincidir label===id
  }, []);

  const pulseAddrs = useMemo(
    () =>
      (animEvents ?? [])
        .filter(
          (e: any) => e?.kind === "heap-refcount" && typeof e.addr === "number"
        )
        .map((e: any) => e.addr),
    [animEvents]
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E11] to-[#0A0A0D] text-[#E0E0E0] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40">
        <div className="flex w-full flex-col gap-6">
          <h1
            data-tour="structure-title"
            className="mt-2 mb-6 bg-gradient-to-br from-[#E0E0E0] to-[#A0A0A0] bg-clip-text text-center text-2xl font-extrabold uppercase tracking-wide text-transparent sm:text-4xl drop-shadow-[0_2px_6px_rgba(215,38,56,0.5)]"
          >
            SIMULADOR
            <span className="text-[#D72638]">&lt;RAM&gt;</span>
          </h1>
          <div className="w-full rounded-2xl border border-[#2E2E2E] bg-[#1A1A1F] px-4 py-6 shadow-xl shadow-black/40 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <StackView frames={snapshot.stack as any} />
              <HeapView heap={snapshot.heap as any} pulseAddrs={pulseAddrs} />
            </div>

            {/* RAM + Índice lado a lado */}
            <div className="grid gap-4 md:grid-cols-2 items-stretch content-stretch">
              <RamView snap={ramSnap} />
              <RamIndexPanel
                items={ramItems}
                onPick={handlePick}
                selectedId={selectedId}
              />
            </div>

            <div className="mt-4">
              <LogPanel logs={logs} onCommand={actions.executeCommand} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MemoryApp() {
  return (
    <AnchorRegistryProvider>
      <HighlightProvider>
        <AppInner />
      </HighlightProvider>
    </AnchorRegistryProvider>
  );
}
