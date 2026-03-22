import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  memoryCommandCategories,
  type MemoryCommandEntry,
} from "../../domain/constants/memoryCommandsData";

const C = {
  panel: "#202734",
  panelSoft: "#242E3B",
  panelInner: "#1C2734",
  ring: "#2E3948",
};

/* ─── Modal de detalle del comando ─── */
function CommandModal({
  cmd,
  onClose,
  onAutoFill,
}: {
  cmd: MemoryCommandEntry;
  onClose: () => void;
  onAutoFill: (c: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
        style={{ background: C.panel, borderColor: C.ring }}
      >
        <h3 className="mb-4 text-center text-xl font-bold text-[#D72638] uppercase tracking-wide">
          {cmd.title}
        </h3>

        <div className="space-y-3 text-sm text-zinc-300">
          <p>
            <span className="font-semibold text-[#D72638]">🧠 Qué hace:</span>{" "}
            {cmd.description}
          </p>
          <p>
            <span className="font-semibold text-[#1E88E5]">🛠️ Sintaxis:</span>{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-zinc-200">
              {cmd.estructura}
            </code>
          </p>
          <p>
            <span className="font-semibold text-[#00C896]">📌 Ejemplo:</span>{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-emerald-200">
              {cmd.ejemplo}
            </code>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              onAutoFill(cmd.autoCommand);
              onClose();
            }}
            className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110 transition"
          >
            Probar en consola
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 transition"
            style={{ borderColor: C.ring }}
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Paleta principal ─── */
export default function MemoryCommandPalette({
  onAutoFill,
}: {
  onAutoFill: (cmd: string) => void;
}) {
  const [activeTab, setActiveTab] = useState(memoryCommandCategories[0].key);
  const [modalCmd, setModalCmd] = useState<MemoryCommandEntry | null>(null);

  const activeCategory = memoryCommandCategories.find(
    (c) => c.key === activeTab
  )!;

  return (
    <section
      data-tour="comandos"
      className="rounded-2xl border overflow-hidden"
      style={{ background: C.panel, borderColor: C.ring }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: `1px solid ${C.ring}` }}
      >
        <span className="text-lg">⌨️</span>
        <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
          Comandos de ejemplo
        </h2>
        <span className="ml-auto text-[10px] text-zinc-400">
          Haz click en un comando para ver su sintaxis
        </span>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 px-4 py-2 overflow-x-auto"
        style={{ background: C.panelSoft }}
      >
        {memoryCommandCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              activeTab === cat.key
                ? "bg-emerald-500/20 text-emerald-100 ring-2 ring-emerald-400/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid de botones */}
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
          >
            {activeCategory.commands.map((cmd) => (
              <motion.button
                key={cmd.title}
                onClick={() => setModalCmd(cmd)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                style={{ borderColor: C.ring }}
              >
                <div className="text-xs font-semibold text-zinc-100 truncate">
                  {cmd.title}
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-400 font-mono truncate">
                  {cmd.autoCommand}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalCmd && (
          <CommandModal
            cmd={modalCmd}
            onClose={() => setModalCmd(null)}
            onAutoFill={onAutoFill}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
