import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { ObjectDetailsModal } from "./ObjectDetailsModal";
import { DeleteConfirmationModal } from "../atoms/DeleteConfirmationModal";
import { ChangeTypeModal } from "../atoms/ChangeTypeModal";

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

  useEffect(() => {
    if (selectedEntry) {
      const updated = memoryState["object"].find(
        (obj) => obj.address === selectedEntry.address
      );
      if (updated) setSelectedEntry(updated);
    }
  }, [memoryState]);

  useEffect(() => {
    const newSizes: Record<string, string> = {};
    memorySegment.forEach((entry) => {
      const result = consolaRef.current?.ejecutarComando(
        `size address ${entry.address}`
      );
      if (result?.[0]) {
        newSizes[entry.address] = result[1];
      }
    });
    setSizes(newSizes);
  }, [JSON.stringify(memorySegment)]);

  // Función para formatear el valor (cambia [] por {} en arrays)
  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return JSON.stringify(value).replace(/^\[/, "{").replace(/\]$/, "}");
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  };

  const colorByType = (type: string) => {
    switch (type) {
      case "int":
      case "long":
      case "short":
      case "byte":
        return "text-[#F59E0B]"; // amarillo cálido para enteros
      case "float":
      case "double":
        return "text-[#1E88E5]";
      case "char":
        return "text-[#C084FC]";
      case "boolean":
        return "text-[#D72638]";
      case "string":
        return "text-[#00C896]";
      default:
        return "text-[#A0A0A0]";
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
                data-tour={`divObjeto.${index + 1}`}
                className="
                  relative bg-gradient-to-br from-[#262626] to-[#1F1F1F]
                  p-5 rounded-2xl border border-[#2E2E2E]
                  shadow-xl shadow-black/40 hover:ring-2 hover:ring-[#D72638]/50
                  transition-all cursor-pointer
                "
              >
                {/* Botón: engranaje en esquina superior izquierda */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setChangeTypeTarget(entry.address);
                  }}
                  title="Cambiar tipo de dato"
                  data-tour={`engranajeObjeto.${index + 1}`}
                  className="
                    absolute top-3 left-3 flex items-center gap-1
                    text-sm text-gray-300 hover:text-white hover:bg-[#D72638]
                    px-2 py-1 rounded-full transition duration-200 cursor-pointer
                  "
                >
                  <span className="text-base">⚙️</span>
                </button>

                {/* Botón: eliminar (X) en esquina superior derecha */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(entry.address);
                  }}
                  data-tour={`eliminarObjeto.${index + 1}`}
                  title="Eliminar objeto"
                  className="
                    absolute top-3 right-3 flex items-center gap-1
                    text-sm text-gray-300 hover:text-white hover:bg-[#D72638]
                    px-2 py-1 rounded-full transition duration-200 cursor-pointer
                  "
                >
                  <span className="text-base">✖</span>
                </button>

                {/* Sección central: Información de ADDR y SIZE */}
                <div className="w-full mt-8 flex justify-center gap-8">
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

                {/* Nombre del objeto */}
                <p className="text-lg font-bold uppercase mt-4 truncate w-full px-2 text-[#E0E0E0]">
                  {entry.name}
                </p>

                {/* Tabla de atributos */}
                <div className="w-full mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm border border-[#2E2E2E] rounded-2xl overflow-hidden shadow">
                    <thead className="bg-[#1F1F1F] text-[#D72638] uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-4 py-2 border-b border-[#2E2E2E]">
                          Dirección
                        </th>
                        <th className="px-4 py-2 border-b border-[#2E2E2E]">
                          Tipo
                        </th>
                        <th className="px-4 py-2 border-b border-[#2E2E2E]">
                          Key
                        </th>
                        <th className="px-4 py-2 border-b border-[#2E2E2E]">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.value.map((group: any[], i: number) => {
                        const type =
                          group.find((a: any) => a.key === "type")?.value ||
                          "unknown";
                        const key =
                          group.find((a: any) => a.key === "key")?.value || "";
                        const value =
                          group.find((a: any) => a.key === "value")?.value ??
                          "";
                        const cmd = `address of ${entry.name}_${key}`;
                        const result = consolaRef.current?.ejecutarComando(cmd);
                        const address = result?.[0] ? result[1] : "—";

                        return (
                          <tr
                            key={i}
                            className="hover:bg-[#2B2B2B] transition-all"
                          >
                            <td className="px-4 py-2 border-b border-[#2E2E2E] text-xs text-[#E0E0E0] font-mono tracking-wider">
                              {address}
                            </td>
                            <td className="px-4 py-2 border-b border-[#2E2E2E] text-[#E0E0E0] flex items-center gap-2">
                              {type}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChangeTypeTarget(address);
                                }}
                                className="bg-[#D72638]/10 hover:bg-[#D72638]/30 text-[#D72638] px-2 py-1 rounded-full text-xs font-bold shadow-sm"
                                title="Cambiar tipo"
                              >
                                ⚙️
                              </button>
                            </td>
                            <td className="px-4 py-2 border-b border-[#2E2E2E] font-semibold text-white">
                              {key}
                            </td>
                            <td
                              className={`px-4 py-2 border-b border-[#2E2E2E] font-semibold ${colorByType(type)}`}
                            >
                              {formatValue(value)}
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
          <p className="text-[#A0A0A0] col-span-full text-center text-lg font-semibold">
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
