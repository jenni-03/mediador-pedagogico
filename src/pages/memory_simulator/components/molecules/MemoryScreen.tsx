import { useState } from "react";
import { MemoryDisplay } from "./MemoryDisplay";
import { FaSearch } from "react-icons/fa";
import { TestCasesModal } from "./TestCasesModal";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion } from "framer-motion";

interface MemoryScreenProps {
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function MemoryScreen({
  consolaRef,
  memoryState,
  setMemoryState,
}: MemoryScreenProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>("int");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="w-full flex flex-col items-center px-4 lg:px-8 mt-4 sm:mt-6 relative">
      <div
        className="
          w-full
          bg-[#1A1A1A]
          border border-[#2E2E2E]
          rounded-3xl
          shadow-xl shadow-black/50
          flex flex-col
          max-h-[85vh]
          overflow-visible
          transition-all duration-300
        "
      >
        {/* Cabecera */}
        <div
          className="
            sticky top-0 left-0 w-full
            bg-[#1A1A1A]
            p-4 z-20
            border-b border-[#2E2E2E]
            flex flex-col items-center
            rounded-t-3xl shadow
          "
        >
          <h3 className="text-[#E0E0E0] text-2xl font-bold tracking-wider text-center">
            SEGMENTO DE MEMORIA: {selectedSegment.toUpperCase()}
          </h3>

          <div className="flex flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4 w-full max-w-5xl mt-3">
            {/* Botón limpiar */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => {
                const result = consolaRef.current?.ejecutarComando("clear memory");
                if (result && result[0]) {
                  setMemoryState(result[2] as Record<string, any[]>);
                }
              }}
              className="
                px-5 py-2 text-sm font-bold uppercase
                text-[#D72638] border border-[#D72638]
                rounded-full hover:bg-[#2E2E2E]
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              🧹 <span>Limpiar Memoria</span>
            </motion.button>

            {/* Buscador */}
            <div
              className="
                flex items-center flex-1 min-w-[180px]
                bg-[#262626] border border-[#2E2E2E]
                rounded-full px-4 py-2 shadow-sm
              "
            >
              <FaSearch className="text-[#A0A0A0] mr-2" />
              <input
                type="text"
                placeholder="Buscar dirección..."
                className="
                  w-full bg-transparent text-sm text-[#E0E0E0]
                  placeholder-[#A0A0A0] outline-none
                "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botón casos de prueba */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setShowModal(true)}
              className="
                px-5 py-2 text-sm font-bold uppercase
                text-[#D72638] border border-[#D72638]
                rounded-full hover:bg-[#2E2E2E]
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              🧪 <span>Casos de Prueba</span>
            </motion.button>
          </div>
        </div>

        {/* Área de visualización */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-2 pt-4 pb-28 scrollbar-thin scrollbar-thumb-[#D72638] scrollbar-track-[#2E2E2E]">
          <MemoryDisplay
            segment={selectedSegment}
            searchTerm={searchTerm}
            consolaRef={consolaRef}
            memoryState={memoryState}
            setMemoryState={setMemoryState}
          />
        </div>

        {/* Barra de segmentos */}
        <div className="w-full bg-[#1A1A1A] border-t border-[#2E2E2E] shadow-inner rounded-b-3xl relative z-10">
          <div className="w-full px-2 py-4 flex flex-wrap justify-center gap-3">
            {[
              "boolean",
              "char",
              "byte",
              "short",
              "int",
              "long",
              "float",
              "double",
              "string",
            ].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
                  rounded-full border transition-all duration-300
                  ${
                    selectedSegment === seg
                      ? "bg-[#D72638]/20 border-[#D72638] text-[#D72638] shadow"
                      : "bg-[#262626] border-[#2E2E2E] text-[#A0A0A0] hover:bg-[#333] hover:text-[#E0E0E0]"
                  }`}
              >
                {seg}
              </button>
            ))}

            <span className="mx-3 hidden sm:inline-block text-[#444] font-bold select-none">|</span>

            {["array", "object"].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
                  rounded-full border transition-all duration-300
                  ${
                    selectedSegment === seg
                      ? "bg-[#D72638]/20 border-[#D72638] text-[#D72638] shadow"
                      : "bg-[#262626] border-[#2E2E2E] text-[#A0A0A0] hover:bg-[#333] hover:text-[#E0E0E0]"
                  }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <TestCasesModal
          consolaRef={consolaRef}
          setMemoryState={setMemoryState}
          closeModal={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
