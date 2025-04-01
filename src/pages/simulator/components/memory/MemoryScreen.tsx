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
        <div
      className="
        w-full max-w-6xl
        bg-[#f9f9f9]
        border border-red-400
        rounded-lg
        shadow-[0px_0px_15px_rgba(0,0,0,0.05)]
        flex flex-col
        relative
        max-h-[85vh]
        overflow-visible
      "
    >


          {/* 📢 Cabecera */}
          <div
            className="
              sticky top-0 left-0 w-full
              bg-[#f9f9f9]
              p-4
              z-20
              text-center
              border-b border-red-200
              flex flex-col items-center
            "
          >
            <h3 className="text-neutral-900 text-2xl font-bold tracking-wider">
            SEGMENTO DE MEMORIA: {selectedSegment.toUpperCase()} 
            </h3>

            <div className="flex flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4 w-full max-w-3xl mt-3">
    {/* Botón Limpiar */}
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

    {/* Buscador */}
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

    {/* Botón Casos de Prueba */}
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

          {/* 📜 Contenido de memoria */}
          <div className="w-full flex-1 min-h-0 overflow-y-auto px-2 pt-4 pb-28 scrollbar-thin scrollbar-thumb-red-400 scrollbar-track-gray-200">



          <MemoryDisplay
    segment={selectedSegment}
    searchTerm={searchTerm}
    consolaRef={consolaRef}
    memoryState={memoryState}
    setMemoryState={setMemoryState}
  />
          </div>

          {/* 🎮 Barra inferior de segmentos */}
  <div className="w-full bg-[#f4f4f4] py-4 px-2 flex flex-wrap justify-center gap-3 border-t border-red-200 shadow-inner relative z-10">
    {[
      "boolean", "char", "byte", "short", "int",
      "long", "float", "double", "string",
    ].map((seg) => (
      <button
        key={seg}
        onClick={() => setSelectedSegment(seg)}
        className={`
          px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
          rounded-full border transition-all duration-300
          ${
            selectedSegment === seg
              ? "bg-red-100 border-red-400 text-red-700 shadow"
              : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
          }
        `}
      >
        {seg}
      </button>
    ))}

    <span className="mx-3 hidden sm:inline-block text-gray-300 font-bold select-none">|</span>

    {["array", "object"].map((seg) => (
      <button
        key={seg}
        onClick={() => setSelectedSegment(seg)}
        className={`
          px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide
          rounded-full border transition-all duration-300
          ${
            selectedSegment === seg
              ? "bg-red-100 border-red-400 text-red-700 shadow"
              : "bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600"
          }
        `}
      >
        {seg}
      </button>
    ))}
  </div>

        </div>

        {/* 📌 Modal de prueba */}
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
