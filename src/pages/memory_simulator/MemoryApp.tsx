// src/app/MemoryApp/MemoryApp.tsx
import { useMemo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useMemorySimulator } from "./hooks/useMemorySimulator";
import { StackView } from "./StackView";
import { HeapView } from "./HeapView";
import RamView from "./RamView";
import { LogPanel } from "./LogPanel";
import { AnchorRegistryProvider } from "./AnchorRegistry";
import { HighlightProvider, useHighlightState } from "./HighlightCtx";
import { Header } from "../../pages/simulator/components/molecules/Header";
import RamIndexPanel from "./RamIndexPanel";
import { buildRamViewSnap } from "./ramViewAdapter";
import BrandCanvas from "./BrandCanvas";
import MemoryCommandPalette from "./MemoryCommandPalette";
import GuidedChallenges from "./GuidedChallenges";
import MobileNavBar from "./MobileNavBar";
import CustomTour from "../../shared/tour/CustomTour";

function AppInner() {
  const { snapshot, logs, animEvents, actions } = useMemorySimulator(1024 * 8);
  const highlight = useHighlightState();

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

  const highlightStart = highlight?.ranges?.[0]?.start;
  const ramSnap = useMemo(
    () =>
      buildRamViewSnap(snapshot as any, {
        selectedId,
        peekRange,
        activeFromHighlight: highlightStart,
        bytesPerRow: 16,
        groupSize: 4,
      }),
    [snapshot, selectedId, peekRange, highlightStart]
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

  const [prefillCmd, setPrefillCmd] = useState("");
  const clearPrefill = useCallback(() => setPrefillCmd(""), []);

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
        <motion.div
          className="flex w-full flex-col gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1
            data-tour="structure-title"
            className="mt-3 mb-7 text-center font-extrabold uppercase tracking-wide leading-tight text-2xl sm:text-4xl"
          >
            <span className="text-[#E0E0E0]">SIMULADOR</span>{" "}
            <span className="text-[#D72638]">&lt;RAM&gt;</span>
          </h1>

          <div className="w-full rounded-2xl border border-[#2E2E2E] bg-[#1F1F22] px-3 py-4 sm:px-4 sm:py-6 pb-20 md:pb-4 shadow-xl shadow-black/40 space-y-4 sm:space-y-6">
            <div className="grid gap-3 sm:gap-4 items-stretch grid-cols-1 xl:grid-cols-2 [grid-auto-rows:minmax(0,1fr)] h-[clamp(280px,50vh,480px)] sm:h-[clamp(380px,60vh,680px)]">
              <div id="section-stack" className="min-w-0 min-h-0 overflow-hidden scroll-mt-20">
                <StackView frames={snapshot.stack as any} />
              </div>
              <div id="section-heap" className="min-w-0 min-h-0 overflow-hidden scroll-mt-20">
                <HeapView heap={snapshot.heap as any} pulseAddrs={pulseAddrs} />
              </div>
            </div>

            <div id="section-ram" className="grid gap-3 sm:gap-4 md:grid-cols-2 items-stretch content-stretch scroll-mt-20">
              <RamView snap={ramSnap} />
              <RamIndexPanel
                items={ramItems}
                selectedId={selectedId}
                onPick={handlePick}
                onFocusRange={handleFocusRange}
                onClearAll={handleClearMemory}
              />
            </div>

            <GuidedChallenges logs={logs} onAutoFill={setPrefillCmd} />
            <div id="section-comandos" className="scroll-mt-20">
              <MemoryCommandPalette onAutoFill={setPrefillCmd} />
            </div>

            <div id="section-consola" className="mt-4 scroll-mt-20">
              <LogPanel
                logs={logs}
                onCommand={actions.executeCommand}
                prefillCommand={prefillCmd}
                onPrefillConsumed={clearPrefill}
              />
            </div>
          </div>
        </motion.div>
      </BrandCanvas>

      <MobileNavBar />
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
