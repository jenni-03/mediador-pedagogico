// src/app/MemoryApp/MemoryApp.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import { useMemorySimulator } from "./hooks/useMemorySimulator";
import { StackView } from "./StackView";
import { HeapView } from "./HeapView";
import RamView from "./RamView";
import { LogPanel } from "./LogPanel";
import { AnchorRegistryProvider } from "./AnchorRegistry";
import { HighlightProvider, useHighlight } from "./HighlightCtx";
import { Header } from "../../pages/simulator/components/molecules/Header";
import RamIndexPanel from "./RamIndexPanel";
import { buildRamViewSnap } from "./ramViewAdapter";
import BrandCanvas from "./BrandCanvas";
import CustomTour, { TourType } from "../../shared/tour/CustomTour";

function AppInner() {
  const { snapshot, logs, animEvents, actions } = useMemorySimulator(1024 * 8);
  const { highlight } = useHighlight();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [peekRange, setPeekRange] = useState<{
    start: number;
    size: number;
  } | null>(null);

  const ramItems = useMemo(
    () =>
      Array.isArray((snapshot as any).ramIndex)
        ? (snapshot as any).ramIndex
        : [],
    [snapshot]
  );

  useEffect(() => {
    if (!peekRange) return;
    const t = setTimeout(() => setPeekRange(null), 1200);
    return () => clearTimeout(t);
  }, [peekRange]);

  const ramSnap = useMemo(
    () =>
      buildRamViewSnap(snapshot as any, {
        selectedId,
        peekRange,
        activeFromHighlight: highlight?.ranges?.[0]?.start,
        bytesPerRow: 16,
        groupSize: 4,
      }),
    [snapshot, selectedId, peekRange, highlight]
  );

  const handlePick = useCallback((item: any | null) => {
    setSelectedId(item?.id ?? null);
  }, []);

  const handleFocusRange = useCallback(
    (r: { from: `0x${string}`; to: `0x${string}` }) => {
      const start = parseInt(r.from, 16) >>> 0;
      const end = parseInt(r.to, 16) >>> 0;
      setPeekRange({ start, size: Math.max(0, end - start) });
    },
    []
  );

  const pulseAddrs = useMemo(
    () =>
      (animEvents ?? [])
        .filter(
          (e: any) => e?.kind === "heap-refcount" && typeof e.addr === "number"
        )
        .map((e: any) => e.addr),
    [animEvents]
  );

  // 🔴 Limpiar toda la RAM / estado visual asociado
  const handleClearMemory = useCallback(() => {
  if (typeof (actions as any).reset === "function") {
    (actions as any).reset();
  } else if (typeof (actions as any).clearAll === "function") {
    (actions as any).clearAll();
  } else if (typeof (actions as any).executeCommand === "function") {
    (actions as any).executeCommand("clear");
  }

  setSelectedId(null);
  setPeekRange(null);
}, [actions]);

  return (
    <>
      <Header />

      <BrandCanvas>
        <div className="flex w-full flex-col gap-6">
          <h1
            data-tour="structure-title"
            className="mt-3 mb-7 text-center font-black uppercase tracking-[.18em] leading-tight text-3xl sm:text-5xl"
          >
            <span className="bg-gradient-to-b from-zinc-50 to-zinc-200 bg-clip-text text-transparent">
              SIMULADOR
            </span>
            <span
              className="ml-3 align-middle rounded-md px-3 py-0.5
                   text-rose-300 ring-1 ring-rose-400/40
                   bg-gradient-to-b from-rose-500/15 to-rose-500/8"
            >
              &lt;RAM&gt;
            </span>
          </h1>

          <div
            className="
              w-full rounded-2xl border border-neutral-700/40 bg-neutral-900/60 px-4 py-6
              shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]
              backdrop-saturate-150 space-y-6
            "
          >
            <div
              className="
                grid gap-4 items-stretch
                grid-cols-1 xl:grid-cols-2
                [grid-auto-rows:minmax(0,1fr)]
                h-[clamp(380px,60vh,680px)]
              "
            >
              <div className="min-w-0 min-h-0 overflow-hidden">
                <StackView frames={snapshot.stack as any} />
              </div>

              <div className="min-w-0 min-h-0 overflow-hidden">
                <HeapView heap={snapshot.heap as any} pulseAddrs={pulseAddrs} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 items-stretch content-stretch">
              <RamView snap={ramSnap} />
              <RamIndexPanel
                items={ramItems}
                selectedId={selectedId}
                onPick={handlePick}
                onFocusRange={handleFocusRange}
                onClearAll={handleClearMemory} // 👈 aquí ya está conectado
              />
            </div>

            <div className="mt-4">
              <LogPanel logs={logs} onCommand={actions.executeCommand} />
            </div>
          </div>
        </div>
      </BrandCanvas>
    </>
  );
}


export default function MemoryApp() {
  return (
    
    <AnchorRegistryProvider>
            <CustomTour tipo={"memoria"} />
      <HighlightProvider>
        <AppInner />
      </HighlightProvider>
    </AnchorRegistryProvider>
  );
}
