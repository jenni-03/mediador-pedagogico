// src/app/MemoryApp/MemoryApp.tsx
import { useMemo } from "react";
import { useMemorySimulator } from "./hooks/useMemorySimulator";
import { StackView } from "./StackView";
import { HeapView } from "./HeapView";
import RamView from "./RamView";
import { LogPanel } from "./LogPanel";
import { AnchorRegistryProvider } from "./AnchorRegistry";
import { HighlightProvider, useHighlight } from "./HighlightCtx";
import { Header } from "../../pages/simulator/components/molecules/Header";

// ---- Tipado local mínimo para la RAM nueva y la legada ----
type ByteRange = { start: number; size: number; label?: string; tone: "header" | "data" | "slot" | "object" };
type UiRamSnapshot = {
  baseAddr: number;
  bytes: Uint8Array;
  bytesPerRow: 16;
  groupSize: 1 | 2 | 4 | 8;
  ranges: ByteRange[];
  activeAddr?: number;
  used?: number;
  capacity?: number;
};
type LegacyRamRow = { addr: `0x${string}`; hex: string; labels?: string[]; allocs?: { at: `0x${string}`; size: number; label?: string }[] };
type LegacyUiRam = { used: number; capacity: number; from: `0x${string}`; to: `0x${string}`; rows: LegacyRamRow[] };

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

/** Asegura UiRamSnapshot: si viene el shape nuevo lo deja igual; si viene legado lo convierte. */
function ensureUiRamSnapshot(ram: any): UiRamSnapshot {
  // Shape nuevo
  if (ram && isUint8Array(ram.bytes)) {
    return {
      baseAddr: Number(ram.baseAddr ?? 0) >>> 0,
      bytes: ram.bytes,
      bytesPerRow: 16,
      groupSize: (ram.groupSize ?? 4) as 1 | 2 | 4 | 8,
      ranges: Array.isArray(ram.ranges) ? ram.ranges : [],
      activeAddr: typeof ram.activeAddr === "number" ? ram.activeAddr >>> 0 : undefined,
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
  console.warn("[MemoryApp] snapshot.ram no es UiRamSnapshot ni legacy; usando snapshot vacío.");
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

  const pulseAddrs = useMemo(
    () =>
      (animEvents ?? [])
        .filter((e: any) => e?.kind === "heap-refcount" && typeof e.addr === "number")
        .map((e: any) => e.addr),
    [animEvents]
  );

  // Normalizamos SIEMPRE lo que venga en snapshot.ram
  const ramSnap = useMemo(() => {
    const snap = ensureUiRamSnapshot((snapshot as any).ram);
    const active = highlight?.ranges?.[0]?.start;
    return active != null ? { ...snap, activeAddr: Number(active) >>> 0 } : snap;
  }, [snapshot, highlight]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E11] to-[#0A0A0D] text-[#E0E0E0] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40">
        <div className="flex w-full flex-col gap-6">
          <h1 className="mt-2 mb-4 text-2xl font-semibold tracking-tight">
            SIMULADOR RAM — INTRO ED <span className="text-[#D72638]">&lt;Memory&gt;</span>
          </h1>

          <div className="w-full rounded-2xl border border-[#2E2E2E] bg-[#1A1A1F] px-4 py-6 shadow-xl shadow-black/40 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <StackView frames={snapshot.stack as any} />
              <HeapView heap={snapshot.heap as any} pulseAddrs={pulseAddrs} />
            </div>

            <div>
              <RamView snap={ramSnap} />
              <div className="mt-4">
                <LogPanel logs={logs} onCommand={actions.executeCommand} />
              </div>
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
