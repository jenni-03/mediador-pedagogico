import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { memoryChallenges, type MemoryChallenge } from "../../domain/constants/memoryChallenges";

const STORAGE_KEY = "ram-sim-challenge-progress";

const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2734",
  ring: "#2E3948",
};

function loadProgress(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Math.min(Number(v), memoryChallenges.length) : 0;
  } catch {
    return 0;
  }
}

function saveProgress(idx: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(idx));
  } catch { /* noop */ }
}

export default function GuidedChallenges({
  logs,
  onAutoFill,
}: {
  logs: string[];
  onAutoFill: (cmd: string) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(loadProgress);
  const [showHint, setShowHint] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const challenge: MemoryChallenge | null =
    currentIdx < memoryChallenges.length ? memoryChallenges[currentIdx] : null;

  const allDone = currentIdx >= memoryChallenges.length;

  // Detectar éxito basándose en el último log
  useEffect(() => {
    if (!challenge || justCompleted) return;
    const recent = logs.slice(-3).join(" ");
    if (challenge.successPattern.test(recent)) {
      setJustCompleted(true);
    }
  }, [logs, challenge, justCompleted]);

  const advance = useCallback(() => {
    const next = currentIdx + 1;
    setCurrentIdx(next);
    saveProgress(next);
    setJustCompleted(false);
    setShowHint(false);
  }, [currentIdx]);

  const skip = useCallback(() => {
    advance();
  }, [advance]);

  const reset = useCallback(() => {
    setCurrentIdx(0);
    saveProgress(0);
    setJustCompleted(false);
    setShowHint(false);
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        style={{ borderColor: C.ring, background: C.panel }}
      >
        <span>🎯</span>
        <span>Retos guiados ({currentIdx}/{memoryChallenges.length})</span>
      </button>
    );
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: C.panelSoft, borderColor: C.ring }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: `1px solid ${C.ring}` }}
      >
        <span className="text-sm">🎯</span>
        <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wide">
          Retos guiados
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {Math.min(currentIdx + 1, memoryChallenges.length)}/{memoryChallenges.length}
        </span>

        {/* Progreso visual */}
        <div className="flex-1 mx-2 h-1 rounded-full overflow-hidden" style={{ background: C.panelInner }}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            style={{
              width: `${(currentIdx / memoryChallenges.length) * 100}%`,
              transition: "width 400ms ease",
            }}
          />
        </div>

        <button
          onClick={() => setCollapsed(true)}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Minimizar"
        >
          ✕
        </button>
      </div>

      {/* Contenido */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          {allDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between gap-3"
            >
              <div className="text-sm text-emerald-200">
                🎉 ¡Completaste todos los retos! Ya entiendes los fundamentos de la RAM.
              </div>
              <button
                onClick={reset}
                className="shrink-0 rounded-lg border px-3 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 transition-colors"
                style={{ borderColor: C.ring }}
              >
                Reiniciar
              </button>
            </motion.div>
          ) : challenge ? (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              {/* Info del reto */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-100">
                  {challenge.title}
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {challenge.description}
                  {challenge.watchPanel && (
                    <span className="ml-1 text-cyan-400/80">
                      → Observa: {challenge.watchPanel}
                    </span>
                  )}
                </div>

                {/* Pista */}
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1.5 flex items-center gap-2">
                        <code className="text-[11px] font-mono text-emerald-300 rounded bg-black/30 px-2 py-0.5">
                          {challenge.hint}
                        </code>
                        <button
                          onClick={() => onAutoFill(challenge.hint)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-200 underline transition-colors"
                        >
                          Usar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                {justCompleted ? (
                  <motion.button
                    onClick={advance}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 ring-1 ring-emerald-400/50 hover:bg-emerald-500/30 transition-colors"
                  >
                    ✅ Siguiente
                  </motion.button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowHint((h) => !h)}
                      className="rounded-lg border px-2.5 py-1.5 text-[11px] text-zinc-300 hover:bg-white/5 transition-colors"
                      style={{ borderColor: C.ring }}
                    >
                      {showHint ? "Ocultar pista" : "💡 Pista"}
                    </button>
                    <button
                      onClick={skip}
                      className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Saltar →
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
