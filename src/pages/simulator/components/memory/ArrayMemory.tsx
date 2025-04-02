import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { VariableDetailsModal } from "./VariableDetailsModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { ChangeTypeModal } from "./ChangeTypeModal";

interface ArrayMemoryProps {
  searchTerm: string;
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function ArrayMemory({
  searchTerm,
  consolaRef,
  memoryState,
  setMemoryState,
}: ArrayMemoryProps) {
  const memorySegment = memoryState["array"] || [];

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(null);

  useEffect(() => {
    const newSizes: Record<string, string> = {};
    memorySegment.forEach((entry) => {
      const result = consolaRef.current?.ejecutarComando(`size address ${entry.address}`);
      if (result && result[0]) {
        newSizes[entry.address] = result[1];
      }
    });
    setSizes(newSizes);
  }, [JSON.stringify(memorySegment)]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-7xl grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 p-4 sm:gap-5 sm:p-6">
        {memorySegment.length > 0 ? (
          memorySegment
            .filter((entry) => (searchTerm ? entry.address.includes(searchTerm) : true))
            .map((entry, index) => (
              <motion.div
                key={entry.address}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedEntry(entry);
                  setTempValue(JSON.stringify(entry.value));
                }}
                className="relative bg-white p-5 rounded-2xl border border-gray-300 shadow-sm 
                           flex flex-col items-center justify-center text-center cursor-pointer 
                           hover:border-red-400 hover:shadow-md transition-all"
              >
                {/* Dirección y engranaje */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="text-xs bg-red-500 text-white px-2.5 py-0.5 rounded-full font-semibold shadow">
                    {entry.address}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChangeTypeTarget(entry.address);
                    }}
                    className="bg-gray-100 text-xl w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition shadow-sm"
                    title="Cambiar tipo de dato"
                  >
                    ⚙️
                  </button>
                </div>

                {/* Tamaño y eliminar */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                    {sizes[entry.address] ?? "…"}
                  </span>
                  <button
                    className="text-purple-500 hover:text-white hover:bg-purple-500 rounded-full p-1 transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(entry.address);
                    }}
                    title="Eliminar variable"
                  >
                    ✖
                  </button>
                </div>

                <p className="text-lg font-bold uppercase mt-6 truncate w-full px-2">{entry.name}</p>
                <p className="text-gray-700 text-base mt-1 truncate w-full px-2">
                  {Array.isArray(entry.value) ? `[${entry.value.join(", ")}]` : JSON.stringify(entry.value)}
                </p>
              </motion.div>
            ))
        ) : (
          <p className="text-gray-500 col-span-full text-center text-lg font-semibold">
            No hay arrays en este segmento.
          </p>
        )}
      </div>

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
