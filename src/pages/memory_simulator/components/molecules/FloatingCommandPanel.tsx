import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { commandsData } from "../../../../shared/constants/commandsData";
import { CommandProps } from "../../../../types";

const allCommands: CommandProps[] = commandsData["memoria"].buttons;

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};
const cardVariants = { hover: { y: -2, scale: 1.02 }, tap: { scale: 0.98 } };

export function FloatingCommandPanel() {
  const [selected, setSelected] = useState<CommandProps | null>(null);
  const [query, setQuery] = useState("");
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter((c) =>
      [c.title, c.description, c.estructura, c.ejemplo]
        .filter(Boolean)
        .some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter"].includes(e.key)) return;
      const items = Array.from(el.querySelectorAll<HTMLButtonElement>("[data-cmd]"));
      if (!items.length) return;
      const cols = 2;
      const idx = focusedIdx === -1 ? 0 : focusedIdx;

      let next = idx;
      if (e.key === "ArrowRight") next = Math.min(idx + 1, items.length - 1);
      if (e.key === "ArrowLeft")  next = Math.max(idx - 1, 0);
      if (e.key === "ArrowDown")  next = Math.min(idx + cols, items.length - 1);
      if (e.key === "ArrowUp")    next = Math.max(idx - cols, 0);
      if (e.key === "Enter") { e.preventDefault(); items[idx]?.click(); return; }

      e.preventDefault();
      setFocusedIdx(next);
      items[next]?.focus();
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [focusedIdx, filtered.length]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const copyExample = async () => {
    if (selected?.ejemplo) {
      await navigator.clipboard.writeText(selected.ejemplo.replace(/^->\s*/gm, "").trim());
    }
  };

  return (
    <>
      {/* Wrapper BOXED y centrado como la consola */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="
          w-full
          px-4 sm:px-6 xl:px-10 2xl:px-20
          max-w-[1100px] mx-auto
          mt-4 sm:mt-0
          flex justify-center sm:justify-end
        "
      >
        {/* Tarjeta del panel */}
        <section
          className="
            w-full sm:w-[480px]
            bg-[#111]/95
            border border-white/10
            rounded-2xl
            shadow-[0_10px_40px_-10px_rgba(0,0,0,.8)]
            /* Altura estable como la consola */
            min-h-[360px]
            h-[clamp(460px,60vh,800px)]
            max-h-[calc(100vh-140px)]
            /* Sellado y scroll interno */
            overflow-hidden
            flex flex-col
          "
          data-tour="comandos"
          aria-labelledby="cmd-panel-title"
        >
          {/* Header sticky dentro del panel */}
          <header className="sticky top-0 z-10 bg-[#111]/95 border-b border-white/10 p-4 sm:p-5">
            <h2
              id="cmd-panel-title"
              className="text-center text-lg sm:text-xl font-bold text-[#D72638] tracking-wider"
            >
              COMANDOS SIMULADOR MEMORIA
            </h2>

            {/* Búsqueda + contador */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1">
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setFocusedIdx(-1); }}
                  placeholder="Buscar comando… (declarar, update, size)"
                  className="
                    w-full bg-white/5 border border-white/10 rounded-xl
                    px-3 py-2 text-sm text-gray-200 placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-[#D72638]/60 focus:border-[#D72638]/40
                  "
                />
              </div>
              <span className="px-2 py-1 text-[11px] rounded-lg bg-white/5 text-gray-400">
                {filtered.length}/{allCommands.length}
              </span>
            </div>
          </header>

          {/* Zona scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pt-4" ref={gridRef} tabIndex={0} aria-label="Lista de comandos">
            <div className="grid grid-cols-2 gap-3 sm:gap-3 outline-none">
              {filtered.map((cmd, i) => (
                <motion.button
                  key={cmd.title}
                  data-cmd
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setSelected(cmd)}
                  onFocus={() => setFocusedIdx(i)}
                  className="
                    group relative overflow-hidden text-left
                    rounded-xl px-3 py-3
                    bg-[#1b1b1b] border border-white/10
                    hover:border-[#D72638] transition-all
                    shadow-sm hover:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-[#D72638]/60
                  "
                  title={cmd.title}
                >
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/0 via-white/0 to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] sm:text-sm md:text-base font-semibold text-gray-200">
                      {cmd.title}
                    </h3>
                    <span className="shrink-0 px-2 py-0.5 text-[10px] rounded-full bg-[#D72638]/15 text-[#ff7a8a] border border-[#D72638]/30">
                      Ver
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400 line-clamp-2">
                    {cmd.description?.split("\n")[0] ?? "Detalles del comando"}
                  </div>
                </motion.button>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-8 text-sm text-gray-500 border border-dashed border-white/10 rounded-xl">
                  No hay resultados para “{query}”.
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center px-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-[#111]/95 w-full max-w-lg max-h-[82vh] overflow-y-auto p-6 sm:p-7 rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
              role="dialog" aria-modal="true" aria-labelledby="cmd-title"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 id="cmd-title" className="text-2xl sm:text-3xl font-extrabold text-[#D72638] tracking-wide">
                  {selected.title.toUpperCase()}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg px-2 py-1 text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10"
                  aria-label="Cerrar"
                  autoFocus
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-6 text-[13px] sm:text-[15px] text-[#DCDCDC]">
                <Section title="🧠 Funcionalidad">{renderWithLineBreaks(selected.description)}</Section>
                <Section title="📌 Estructura">{renderWithLineBreaks(selected.estructura)}</Section>
                <Section title="🛠️ Ejemplo">
                  <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-3">
                    {renderWithLineBreaks(selected.ejemplo)}
                  </div>
                </Section>
              </div>

              <div className="mt-7 flex items-center justify-center gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={copyExample}
                  className="bg-white/5 hover:bg-white/10 text-gray-200 font-semibold text-sm px-5 py-2 rounded-full border border-white/10">
                  Copiar ejemplo
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(null)}
                  className="bg-[#D72638] hover:bg-[#c01f2f] text-white font-bold text-sm px-6 py-2 rounded-full shadow-lg">
                  Aceptar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ───────── Subcomponentes ───────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="font-semibold text-[#EAEAEA] mb-1">{title}</h4>
      <div className="prose prose-invert prose-sm max-w-none">{children}</div>
    </section>
  );
}

function renderWithLineBreaks(text: string) {
  return text.split("\n").map((line, idx) => {
    if (line.startsWith("->")) {
      return (
        <p key={idx} className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 rounded-full bg-[#D72638]" />
          <span>{line.slice(2).trim()}</span>
        </p>
      );
    }
    return <p key={idx} className="mt-1 leading-6">{line}</p>;
  });
}
