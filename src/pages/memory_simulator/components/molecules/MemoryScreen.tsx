import { useMemo, useState } from "react";
import { MemoryDisplay } from "./MemoryDisplay";
import { FaSearch } from "react-icons/fa";
import { TestCasesModal } from "./TestCasesModal";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion } from "framer-motion";

/* ───────── Constantes ───────── */
const PRIMITIVE_SEGMENTS = [
  "boolean",
  "char",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "string",
] as const;

const COMPLEX_SEGMENTS = ["array", "object"] as const;

const PREFIX_TO_SEG: Record<string, string> = {
  "0x": "boolean",
  "1x": "char",
  "2x": "byte",
  "3x": "short",
  "4x": "int",
  "5x": "long",
  "6x": "float",
  "7x": "double",
  "8x": "string",
  "9x": "object",
  ax: "array",
};

interface MemoryScreenProps {
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (
    newState: Record<string, any[]>,
    typeInserted?: string
  ) => void;
  selectedSegment: string;
  setSelectedSegment: (segment: string) => void;
}

export function MemoryScreen({
  consolaRef,
  memoryState,
  setMemoryState,
  selectedSegment,
  setSelectedSegment,
}: MemoryScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Scrollbar local (sin tocar tailwind.config)
  const SCROLLBAR_CSS = `
    .nice-scroll{overflow-y:auto;scrollbar-width:thin;scrollbar-color:#d72638 transparent;scrollbar-gutter:stable both-edges}
    .nice-scroll::-webkit-scrollbar{width:10px;height:10px}
    .nice-scroll::-webkit-scrollbar-track{background:transparent}
    .nice-scroll::-webkit-scrollbar-thumb{background:#d72638;border-radius:9999px;border:2px solid transparent;background-clip:content-box;transition:background .16s ease}
    .nice-scroll:hover::-webkit-scrollbar-thumb{background:#ff8ea0;background-clip:content-box}
    .nice-scroll::-webkit-scrollbar-corner{background:transparent}
  `;

  const handleUpdateMemory = (
    newState: Record<string, any[]>,
    lastInsertedType?: string
  ) => setMemoryState(newState, lastInsertedType);

  const hasDataInSelected = useMemo(() => {
    const arr = memoryState[selectedSegment] as any[] | undefined;
    return Array.isArray(arr) && arr.length > 0;
  }, [memoryState, selectedSegment]);

  const clearMemory = () => {
    const result = consolaRef.current?.ejecutarComando("clear memory");
    if (result && result[0]) handleUpdateMemory(result[2]);
  };

  const onSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.length >= 2) {
      const prefix = val.slice(0, 2).toLowerCase();
      if (prefix in PREFIX_TO_SEG) setSelectedSegment(PREFIX_TO_SEG[prefix]);
    }
  };

  return (
    <>
      <style>{SCROLLBAR_CSS}</style>

      <div className="w-full flex flex-col items-center px-4 sm:px-6 xl:px-10 2xl:px-20 max-w-[1800px] mx-auto mt-4 sm:mt-6 relative">
        {/* Panel con un ÚNICO contenedor scrolleable */}
        <div className="w-full bg-[#111]/95 border border-white/10 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,.8)] overflow-hidden">
          <div className="nice-scroll max-h-[85vh]">
            {/* Header sticky dentro del MISMO scroll */}
            <div className="sticky top-0 left-0 z-20 bg-[#111]/95 backdrop-blur-sm border-b border-white/10">
              <div className="p-4">
                <h3 className="text-[#E0E0E0] text-2xl font-extrabold tracking-wider text-center flex items-center justify-center gap-2">
                  <span>SEGMENTO DE MEMORIA:</span>
                  <span className="text-[#D72638]">
                    {selectedSegment.toUpperCase()}
                  </span>
                </h3>

                <div className="mt-3 w-full max-w-5xl mx-auto flex flex-wrap items-center gap-3 justify-center sm:justify-between">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={clearMemory}
                    className="px-5 py-2 text-sm font-bold uppercase text-[#ff7a8a] bg-[#D72638]/15 border border-[#D72638]/40 rounded-full hover:bg-[#D72638]/25 transition-colors flex items-center gap-2 shadow-sm"
                    data-tour="limpiar"
                  >
                    🧹 <span>Limpiar Memoria</span>
                  </motion.button>

                  <div
                    className="flex items-center flex-1 min-w-[200px] max-w-xl bg-white/5 border border-white/10 rounded-full px-4 py-2 shadow-sm"
                    data-tour="buscador"
                  >
                    <FaSearch className="text-[#A0A0A0] mr-2" />
                    <input
                      type="text"
                      placeholder="Buscar dirección… (0x, 4x, ax)"
                      className="w-full bg-transparent text-sm text-[#E0E0E0] placeholder-[#8c8c8c] outline-none"
                      value={searchTerm}
                      onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => onSearchChange("")}
                        className="ml-2 text-xs text-gray-400 hover:text-gray-200"
                        aria-label="Limpiar búsqueda"
                        title="Limpiar"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2 text-sm font-bold uppercase text-[#ff7a8a] bg-[#D72638]/15 border border-[#D72638]/40 rounded-full hover:bg-[#D72638]/25 transition-colors flex items-center gap-2 shadow-sm"
                    data-tour="casosPrueba"
                  >
                    🧪 <span>Casos de Prueba</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="px-2 pt-4 pb-32" data-tour="visualizacionVariables">
              {!hasDataInSelected && !searchTerm ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center text-sm text-gray-400">
                    No hay datos en este segmento.
                  </div>
                </div>
              ) : (
                <MemoryDisplay
                  segment={selectedSegment}
                  searchTerm={searchTerm}
                  consolaRef={consolaRef}
                  memoryState={memoryState}
                  setMemoryState={setMemoryState}
                />
              )}
            </div>

            {/* Footer sticky dentro del MISMO scroll */}
            <div
              className="sticky bottom-0 left-0 z-20 bg-[#111]/95 border-t border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,.04)]"
              data-tour="segment-buttons"
            >
              <div className="w-full px-2 py-4 flex flex-wrap justify-center gap-3">
                {PRIMITIVE_SEGMENTS.map((seg) => (
                  <Chip
                    key={seg}
                    label={seg}
                    active={selectedSegment === seg}
                    onClick={() => setSelectedSegment(seg)}
                  />
                ))}
                <span
                  className="mx-2 hidden sm:inline-block text-[#444] font-bold select-none"
                  aria-hidden
                >
                  |
                </span>
                {COMPLEX_SEGMENTS.map((seg) => (
                  <Chip
                    key={seg}
                    label={seg}
                    active={selectedSegment === seg}
                    onClick={() => setSelectedSegment(seg)}
                    dataTour={seg === "array" ? "botonArray" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <TestCasesModal
            consolaRef={consolaRef}
            setMemoryState={handleUpdateMemory}
            closeModal={() => setShowModal(false)}
          />
        )}
      </div>
    </>
  );
}


/* ───────── UI Atómicas ───────── */
function Chip({
  label,
  active,
  onClick,
  dataTour,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dataTour?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      data-tour={dataTour}
      className={[
        "px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide rounded-full border transition-all duration-300 shadow-sm",
        active
          ? "bg-[#D72638]/20 border-[#D72638] text-[#ff7a8a] shadow"
          : "bg-white/5 border-white/10 text-[#BFBFBF] hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {label}
    </motion.button>
  );
}
