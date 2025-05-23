import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { VariableDetailsModal } from "../atoms/VariableDetailsModal";
import { DeleteConfirmationModal } from "../atoms/DeleteConfirmationModal";
import { ChangeTypeModal } from "../atoms/ChangeTypeModal";

interface PrimitiveMemoryProps {
  type: string;
  searchTerm: string;
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function PrimitiveMemory({
  type,
  searchTerm,
  consolaRef,
  memoryState,
  setMemoryState,
}: PrimitiveMemoryProps) {
  const memorySegment = memoryState[type] || [];

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(null);

  useEffect(() => {
    const newSizes: Record<string, string> = {};
    memorySegment.forEach((entry) => {
      const result = consolaRef.current?.ejecutarComando(
        `size address ${entry.address}`
      );
      if (result && result[0]) {
        newSizes[entry.address] = result[1];
      }
    });
    setSizes(newSizes);
  }, [JSON.stringify(memorySegment)]);

  const getValueColor = (type: string) => {
    switch (type) {
      case "boolean":
        return "text-[#D72638]";
      case "char":
        return "text-[#E0E0E0]";
      case "byte":
      case "short":
      case "int":
      case "long":
        return "text-[#F59E0B]"; // amarillo cálido para enteros
      case "float":
      case "double":
        return "text-[#1E88E5]";
      case "string":
        return "text-[#00C896]";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-4 sm:gap-5 sm:p-6">
        {memorySegment.length > 0 ? (
          memorySegment
            .filter((entry) =>
              searchTerm ? entry.address.includes(searchTerm) : true
            )
            .map((entry, index) => (
              <motion.div
                key={entry.address}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedEntry(entry);
                  setTempValue(entry.value);
                }}
                className="
    relative
    bg-gradient-to-br from-[#262626] to-[#1F1F1F]
    p-5 rounded-2xl border border-[#2E2E2E]
    shadow-xl shadow-black/40 ring-1 ring-[#2E2E2E]
    hover:ring-[#D72638]/40
    flex flex-col items-center
    text-center cursor-pointer
    transition-all
  "
              >
                {/* Engranaje en esquina superior izquierda */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChangeTypeTarget(entry.address);
                  }}
                  title="Cambiar tipo de dato"
                  className="
      absolute top-3 left-3
      flex items-center gap-1
      text-sm text-gray-300
      hover:text-white hover:bg-[#D72638]
      px-2 py-1
      rounded-full
      transition duration-200
      cursor-pointer
    "
                >
                  <span className="text-base">⚙️</span>
                  {/* Podrías añadir una palabra para que se note más que es un botón */}
                  {/* <span className="text-xs uppercase font-semibold">Tipo</span> */}
                </button>

                {/* Botón de eliminar (X) en esquina superior derecha */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(entry.address);
                  }}
                  title="Eliminar variable"
                  className="
      absolute top-3 right-3
      flex items-center gap-1
      text-sm text-gray-300
      hover:text-white hover:bg-[#D72638]
      px-2 py-1
      rounded-full
      transition duration-200
      cursor-pointer
    "
                >
                  <span className="text-base">✖</span>
                  {/* <span className="text-xs uppercase font-semibold">Del</span> */}
                </button>

                {/* Sección central con ADDR y SIZE */}
                <div className="w-full mt-6 flex flex-wrap justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase text-white/90">
                      ADDR:
                    </span>
                    <span className="text-sm font-bold text-[#D72638]">
                      {entry.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase text-white/90">
                      SIZE:
                    </span>
                    <span className="text-sm font-bold text-[#F59E0B]">
                      {sizes[entry.address] ?? "…"}
                    </span>
                  </div>
                </div>

                {/* Nombre de la variable */}
                <p className="text-lg font-bold uppercase mt-4 truncate w-full px-2 text-[#E0E0E0]">
                  {entry.name}
                </p>

                {/* Tabla tipo/valor */}
                <div className="mt-4 w-full overflow-x-auto">
                  <table className="min-w-full border border-[#2E2E2E] text-sm rounded-xl overflow-hidden">
                    <thead className="bg-[#1F1F1F] text-[#D72638] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Tipo
                        </th>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-[#2B2B2B] transition-all">
                        <td className="px-3 py-2 border-b border-[#2E2E2E] text-center font-semibold text-[#CCCCCC]">
                          {entry.type}
                        </td>
                        <td
                          className={`
              px-3 py-2 border-b border-[#2E2E2E] text-center 
              font-semibold ${getValueColor(entry.type)}
            `}
                        >
                          {typeof entry.value === "object"
                            ? JSON.stringify(entry.value)
                            : String(entry.value)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-[#A0A0A0] col-span-full text-center text-lg font-semibold">
            No hay datos en este segmento.
          </p>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedEntry && (
          <VariableDetailsModal
            entry={selectedEntry}
            tempValue={tempValue}
            setTempValue={setTempValue}
            onClose={() => setSelectedEntry(null)}
            consolaRef={consolaRef}
            setMemoryState={setMemoryState}
            size={sizes[selectedEntry.address] ?? "Desconocido"}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmationModal
            address={deleteTarget}
            consolaRef={consolaRef}
            onClose={() => setDeleteTarget(null)}
            setMemoryState={setMemoryState}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {changeTypeTarget && (
          <ChangeTypeModal
            address={changeTypeTarget}
            consolaRef={consolaRef}
            onClose={() => setChangeTypeTarget(null)}
            setMemoryState={setMemoryState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
