import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { VariableDetailsModal } from "../atoms/VariableDetailsModal";
import { DeleteConfirmationModal } from "../atoms/DeleteConfirmationModal";
import { ChangeTypeModal } from "../atoms/ChangeTypeModal";

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
  const [addresses, setAddresses] = useState<Record<string, string[]>>({});
  const [types, setTypes] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(null);

  useEffect(() => {
    const newSizes: Record<string, string> = {};
    const newAddresses: Record<string, string[]> = {};
    const newTypes: Record<string, string> = {};

    memorySegment.forEach((entry) => {
      const sizeRes = consolaRef.current?.ejecutarComando(
        `size address ${entry.address}`
      );
      if (sizeRes?.[0]) newSizes[entry.address] = sizeRes[1];

      const typeRes = consolaRef.current?.ejecutarComando(
        `type address ${entry.address}`
      );
      if (typeRes?.[0]) newTypes[entry.address] = typeRes[1];

      const addrs = entry.value.map((_: any, idx: number) => {
        const res = consolaRef.current?.ejecutarComando(
          `address of ${entry.name}_${idx}`
        );
        return res?.[0] ? res[1] : "—";
      });

      newAddresses[entry.address] = addrs;
    });

    setSizes(newSizes);
    setAddresses(newAddresses);
    setTypes(newTypes);
  }, [JSON.stringify(memorySegment)]);

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
                onClick={() => {
                  setSelectedEntry(entry);
                  setTempValue(JSON.stringify(entry.value));
                }}
                className="relative bg-gradient-to-br from-[#262626] to-[#1F1F1F] p-5 rounded-2xl border border-[#2E2E2E] shadow-xl shadow-black/40 hover:ring-2 hover:ring-[#D72638]/50 transition-all cursor-pointer"
              >
                {/* Dirección y engranaje */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="text-xs bg-[#D72638] text-white px-2.5 py-0.5 rounded-full font-semibold shadow">
                    {entry.address}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChangeTypeTarget(entry.address);
                    }}
                    className="bg-[#1A1A1A] text-[#E0E0E0] w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#D72638] hover:text-white transition shadow-sm"
                    title="Cambiar tipo de dato"
                  >
                    ⚙️
                  </button>
                </div>

                {/* Tamaño y eliminar */}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="text-xs bg-[#4B4B4B] text-white px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                    {sizes[entry.address] ?? "…"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(entry.address);
                    }}
                    className="text-[#D72638] hover:text-white hover:bg-[#D72638] rounded-full p-1 transition"
                    title="Eliminar variable"
                  >
                    ✖
                  </button>
                </div>

                {/* Nombre y tipo */}
                <p className="text-lg font-bold uppercase mt-6 truncate w-full px-2 text-[#E0E0E0]">
                  {entry.name}
                </p>
                <p className="text-sm font-medium text-[#A0A0A0] mb-2">
                  Tipo:{" "}
                  <span className="text-[#E0E0E0] font-semibold">
                    {types[entry.address] ?? "—"}
                  </span>
                </p>

                {/* Tabla de valores */}
                <div className="mt-4 w-full overflow-x-auto">
                  <table className="min-w-full border border-[#2E2E2E] text-sm rounded-xl overflow-hidden">
                    <thead className="bg-[#1F1F1F] text-[#D72638] text-xs uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Dirección
                        </th>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Índice
                        </th>
                        <th className="py-2 px-3 border-b border-[#2E2E2E]">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.value.map((val: any, idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#2B2B2B] transition-all"
                        >
                          <td className="px-4 py-2 border-b border-[#2E2E2E] text-xs text-[#E0E0E0] font-mono tracking-wider">
                            {addresses[entry.address]?.[idx] ?? "—"}
                          </td>
                          <td className="px-3 py-2 border-b border-[#2E2E2E] text-center font-semibold text-[#D0D0D0]">
                            [{idx}]
                          </td>
                          <td className="px-3 py-2 border-b border-[#2E2E2E] text-center text-[#E0E0E0]">
                            {typeof val === "object"
                              ? JSON.stringify(val)
                              : String(val)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-[#A0A0A0] col-span-full text-center text-lg font-semibold">
            No hay arrays en este segmento.
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
