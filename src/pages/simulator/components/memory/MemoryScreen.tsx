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
    <div className="w-full flex flex-col items-center px-4 mt-4 sm:mt-6 relative">
      {/* Contenedor principal con estilos de tarjeta */}
      <div
        className="
          w-full max-w-6xl
          bg-white
          border-2 border-red-400
          rounded-3xl
          shadow-xl shadow-red-100
          flex flex-col
          relative
          max-h-[85vh]
          overflow-visible
          transition-all duration-300
        "
      >
        {/* Cabecera con título y controles */}
        <div
          className="
            sticky top-0 left-0 w-full
            bg-[#f9f9f9]
            p-4 z-20
            text-center
            border-b border-red-200
            flex flex-col items-center
            rounded-t-3xl shadow
          "
        >
          <h3 className="text-neutral-900 text-2xl font-bold tracking-wider">
            SEGMENTO DE MEMORIA: {selectedSegment.toUpperCase()}
          </h3>

          <div className="flex flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4 w-full max-w-3xl mt-3">
            {/* Botón para limpiar la memoria */}
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
                text-red-500 border border-red-400
                rounded-full hover:bg-red-50
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              🧹 <span>Limpiar Memoria</span>
            </motion.button>

            {/* Buscador de direcciones de memoria */}
            <div
              className="
                flex items-center flex-1 min-w-[180px]
                bg-gray-50 border border-gray-300
                rounded-full px-4 py-2 shadow-sm
              "
            >
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar dirección..."
                className="
                  w-full bg-transparent text-sm text-neutral-800
                  placeholder-gray-400 outline-none
                "
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botón para abrir casos de prueba */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => setShowModal(true)}
              className="
                px-5 py-2 text-sm font-bold uppercase
                text-red-500 border border-red-400
                rounded-full hover:bg-red-50
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              🧪 <span>Casos de Prueba</span>
            </motion.button>
          </div>
        </div>

        {/* Área de visualización del segmento de memoria */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto px-2 pt-4 pb-28 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-gray-200">
          <MemoryDisplay
            segment={selectedSegment}
            searchTerm={searchTerm}
            consolaRef={consolaRef}
            memoryState={memoryState}
            setMemoryState={setMemoryState}
          />
        </div>

        {/* Barra inferior con selección de segmentos */}
        <div className="w-full bg-[#f4f4f4] border-t border-red-200 shadow-inner rounded-b-3xl relative z-10">
          <div className="w-full max-w-6xl mx-auto px-2 py-4 flex flex-wrap justify-center gap-3">
            {/* Segmentos primitivos */}
            {[
              "boolean", "char", "byte", "short", "int",
              "long", "float", "double", "string",
            ].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
                  rounded-full border transition-all duration-300
                  ${
                    selectedSegment === seg
                      ? "bg-red-100 border-red-400 text-red-700 shadow"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
              >
                {seg}
              </button>
            ))}

            {/* Separador visual */}
            <span className="mx-3 hidden sm:inline-block text-gray-300 font-bold select-none">|</span>

            {/* Segmentos compuestos */}
            {["array", "object"].map((seg) => (
              <button
                key={seg}
                onClick={() => setSelectedSegment(seg)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
                  rounded-full border transition-all duration-300
                  ${
                    selectedSegment === seg
                      ? "bg-red-100 border-red-400 text-red-700 shadow"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
                  }`}
              >
                {seg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de casos de prueba */}
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
