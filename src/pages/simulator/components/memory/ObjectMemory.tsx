import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { ObjectDetailsModal } from "./ObjectDetailsModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { ChangeTypeModal } from "./ChangeTypeModal";

interface ObjectMemoryProps {
  searchTerm: string;
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function ObjectMemory({
  searchTerm,
  consolaRef,
  memoryState,
  setMemoryState,
}: ObjectMemoryProps) {
  const memorySegment = memoryState["object"] || [];

  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(null);

  // Actualizar selectedEntry si memoryState cambia
  useEffect(() => {
    if (selectedEntry) {
      const updated = memoryState["object"].find(
        (obj) => obj.address === selectedEntry.address
      );
      if (updated) setSelectedEntry(updated);
    }
  }, [memoryState]);

  // Calcular tamaños
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

  const colorByType = (type: string) => {
    switch (type) {
      case "int":
      case "long":
      case "short":
      case "byte":
        return "text-blue-600";
      case "float":
      case "double":
        return "text-green-600";
      case "char":
        return "text-purple-600";
      case "boolean":
        return "text-red-500";
      case "string":
        return "text-pink-600";
      default:
        return "text-gray-700";
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedEntry(entry)}
                className="relative bg-white p-5 rounded-2xl border border-gray-300 shadow-sm 
                           flex flex-col items-center justify-center text-center cursor-pointer 
                           hover:border-red-400 hover:shadow-md transition-all"
              >
                {/* Dirección */}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-red-500 text-white px-2.5 py-0.5 rounded-full font-semibold shadow">
                    {entry.address}
                  </span>
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
                    title="Eliminar objeto"
                  >
                    ✖
                  </button>
                </div>

                {/* Nombre */}
                <p className="text-lg font-bold uppercase mt-6 truncate w-full px-2">
                  {entry.name}
                </p>

                {/* Tabla */}
                <div className="w-full mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm text-left border border-gray-300 rounded-2xl overflow-hidden shadow-sm">
                    <thead className="bg-red-50 text-red-700 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-4 py-2 border-b border-red-200">Dirección</th>
                        <th className="px-4 py-2 border-b border-red-200">Tipo</th>
                        <th className="px-4 py-2 border-b border-red-200">Key</th>
                        <th className="px-4 py-2 border-b border-red-200">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.value.map((group: any[], i: number) => {
                        const type = group.find((a: any) => a.key === "type")?.value || "unknown";
                        const key = group.find((a: any) => a.key === "key")?.value || "";
                        const value = group.find((a: any) => a.key === "value")?.value ?? "";
                        const cmd = `address of ${entry.name}_${key}`;
                        const result = consolaRef.current?.ejecutarComando(cmd);
                        const address = result && result[0] ? result[1] : "—";

                        return (
                          <tr key={i} className="even:bg-white odd:bg-gray-50 hover:bg-red-50 transition-all">
                            <td className="px-4 py-2 border-b border-gray-200 text-xs text-gray-600 font-mono">
                              {address}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 text-gray-600 flex items-center gap-2">
                              {type}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChangeTypeTarget(address);
                                }}
                                className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-full text-xs font-bold shadow-sm"
                                title="Cambiar tipo"
                              >
                                ⚙️
                              </button>
                            </td>
                            <td className="px-4 py-2 border-b border-gray-200 font-semibold text-black">
                              {key}
                            </td>
                            <td className={`px-4 py-2 border-b border-gray-200 font-semibold ${colorByType(type)}`}>
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-gray-500 col-span-full text-center text-lg font-semibold">
            No hay objetos en este segmento.
          </p>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedEntry && (
          <ObjectDetailsModal
            entry={selectedEntry}
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
            setMemoryState={setMemoryState}
            onClose={() => setChangeTypeTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
