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

/* ───────────────────────────────── App ───────────────────────────────── */
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

  return (
    <>
      <Header />
      {/* Fondo pastel más claro, con degradado colorido y grid */}
      <div
        className="
          relative isolate min-h-screen overflow-hidden
          text-[#E6E6E6] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40
          before:content-[''] before:absolute before:inset-0 before:-z-10
          after:content-['']  after:absolute  after:inset-0  after:-z-10
        "
      >
        <style>{`
          .isolate:before{
            background:
              radial-gradient(1200px 420px at 20% -10%, rgba(186,230,253,.25), transparent 55%),
              radial-gradient(1000px 480px at 120% 120%, rgba(244,114,182,.18), transparent 55%),
              linear-gradient(180deg, #191a1e 0%, #141519 50%, #101115 100%);
          }
          .isolate:after{
            opacity: .05;
            background:
              repeating-linear-gradient(0deg, #ffffff 0 1px, transparent 1px 28px),
              repeating-linear-gradient(90deg, #ffffff 0 1px, transparent 1px 28px);
            -webkit-mask-image: linear-gradient(#000, rgba(0,0,0,.25));
                    mask-image: linear-gradient(#000, rgba(0,0,0,.25));
          }
        `}</style>
        <style>{`
  /* Firefox */
  .stk-scroll{
    scrollbar-width: thin;                /* thin | auto | none */
    scrollbar-color: rgba(167,139,250,.55) rgba(255,255,255,.06); /* thumb | track */
    scrollbar-gutter: stable both-edges;  /* evita saltos de layout */
  }

  /* Chrome / Edge / Safari */
  .stk-scroll::-webkit-scrollbar{
    width: 12px;            /* grosor vertical */
    height: 12px;           /* grosor horizontal (si aplica) */
  }
  .stk-scroll::-webkit-scrollbar-track{
    background: linear-gradient(180deg, rgba(10,10,15,.35), rgba(10,10,15,.18));
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
  }
  .stk-scroll::-webkit-scrollbar-thumb{
    background: linear-gradient(180deg,
                  rgba(167,139,250,.65),
                  rgba(244,114,182,.60) 55%,
                  rgba(251,191,36,.55));
    border-radius: 10px;
    border: 2px solid rgba(16,16,20,.9); /* aro oscuro para que “flote” */
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18),
                0 0 0 1px rgba(255,255,255,.06);
  }
  .stk-scroll::-webkit-scrollbar-thumb:hover{
    background: linear-gradient(180deg,
                  rgba(167,139,250,.85),
                  rgba(244,114,182,.80) 55%,
                  rgba(251,191,36,.75));
  }
  .stk-scroll::-webkit-scrollbar-corner{
    background: transparent;
  }
`}</style>

        <div className="flex w-full flex-col gap-6">
          <h1
            data-tour="structure-title"
            className="mt-2 mb-6 bg-gradient-to-br from-[#E0E0E0] to-[#A0A0A0] bg-clip-text text-center text-2xl font-extrabold uppercase tracking-wide text-transparent sm:text-4xl drop-shadow-[0_2px_6px_rgba(215,38,56,0.5)]"
          >
            SIMULADOR <span className="text-[#D72638]">&lt;RAM&gt;</span>
          </h1>

          <div
            className="
              w-full rounded-2xl border border-neutral-700/40 bg-neutral-900/60 px-4 py-6
              shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)]
              backdrop-saturate-150 space-y-6
            "
          >
            {/* Stack + Heap */}
            <div
              className="
    grid gap-4 items-stretch
    grid-cols-1 xl:grid-cols-2
    [grid-auto-rows:minmax(0,1fr)]
    h-[clamp(380px,60vh,680px)]  /* altura responsiva como RAM */
  "
            >
              {/* IMPORTANTES: min-w-0 + min-h-0 para permitir scroll interno */}
              <div className="min-w-0 min-h-0 overflow-hidden">
                <StackView frames={snapshot.stack as any} />
              </div>

              <div className="min-w-0 min-h-0 overflow-hidden">
                <HeapView heap={snapshot.heap as any} pulseAddrs={pulseAddrs} />
              </div>
            </div>

            {/* RAM + Índice */}
            <div className="grid gap-4 md:grid-cols-2 items-stretch content-stretch">
              <RamView snap={ramSnap} />
              <RamIndexPanel
                items={ramItems}
                selectedId={selectedId}
                onPick={handlePick}
                onFocusRange={handleFocusRange}
              />
            </div>

            {/* Consola */}
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
