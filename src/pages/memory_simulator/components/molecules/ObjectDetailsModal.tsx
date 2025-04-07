import { useState } from "react";
import { motion } from "framer-motion";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface ObjectDetailsModalProps {
  entry: any;
  onClose: () => void;
  consolaRef: React.RefObject<Consola>;
  size: string;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function ObjectDetailsModal({
  entry,
  onClose,
  consolaRef,
  size,
  setMemoryState,
}: ObjectDetailsModalProps) {
  const [localValue, _setLocalValue] = useState(entry.value);
  const [tempValues, setTempValues] = useState(
    entry.value.map((group: any[]) => {
      const val = group.find((a: any) => a.key === "value")?.value ?? "";
      return Array.isArray(val) ? JSON.stringify(val) : val;
    })
  );
  const [feedbacks, setFeedbacks] = useState<
    Record<number, { success: boolean; message: string }>
  >({});

  const updateAttributeValue = (index: number, newValue: string) => {
    const updated = [...tempValues];
    updated[index] = newValue;
    setTempValues(updated);
  };

  const confirmChange = (index: number) => {
    const group = localValue[index];
    const key = group.find((a: any) => a.key === "key")?.value ?? "";
    const command = `address of ${entry.name}_${key}`;
    const result = consolaRef.current?.ejecutarComando(command);
    const address = result && result[0] ? result[1] : null;

    if (!address) {
      setFeedbacks((prev) => ({
        ...prev,
        [index]: { success: false, message: "No se encontró dirección" },
      }));
      return;
    }

    const setResult = consolaRef.current?.ejecutarComando(
      `set address ${address} value ${tempValues[index]}`
    );

    if (setResult) {
      const [success, message, updatedState] = setResult;
      setFeedbacks((prev) => ({
        ...prev,
        [index]: { success, message },
      }));

      if (success) {
        setMemoryState(updatedState);
        setTimeout(() => {
          setFeedbacks((prev) => {
            const copy = { ...prev };
            delete copy[index];
            return copy;
          });
        }, 3000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000]"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.2 }}
        className="bg-[#1A1A1A] text-[#E0E0E0] p-6 rounded-2xl shadow-2xl border border-red-500 w-[95%] max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-red-500 mb-5 text-center flex items-center justify-center gap-2">
          🧩 Detalles del Objeto
        </h2>

        {/* Info básica */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6 text-gray-300">
          <p>
            <span className="font-semibold text-red-400">🔹 Tipo:</span>{" "}
            {entry.type}
          </p>
          <p>
            <span className="font-semibold text-red-400">🏷️ Nombre:</span>{" "}
            {entry.name}
          </p>
          <p>
            <span className="font-semibold text-red-400">📍 Dirección:</span>{" "}
            {entry.address}
          </p>
          <p>
            <span className="font-semibold text-red-400">📦 Tamaño:</span>{" "}
            {size}
          </p>
        </div>

        {/* Tabla editable */}
        <div className="overflow-x-auto border border-[#2E2E2E] rounded-xl">
          <table className="min-w-full text-sm text-left text-[#E0E0E0]">
            <thead className="bg-[#2E2E2E] text-red-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2 border-b border-[#444]">Dirección</th>
                <th className="px-4 py-2 border-b border-[#444]">Tipo</th>
                <th className="px-4 py-2 border-b border-[#444]">Key</th>
                <th className="px-4 py-2 border-b border-[#444]">Valor</th>
                <th className="px-2 py-2 border-b border-[#444] text-center">
                  ✔️
                </th>
              </tr>
            </thead>
            <tbody>
              {localValue.map((group: any[], i: number) => {
                const type =
                  group.find((a: any) => a.key === "type")?.value ?? "";
                const key =
                  group.find((a: any) => a.key === "key")?.value ?? "";
                const command = `address of ${entry.name}_${key}`;
                const result = consolaRef.current?.ejecutarComando(command);
                const address = result && result[0] ? result[1] : "—";

                return (
                  <tr key={i} className="even:bg-[#1F1F1F] odd:bg-[#262626]">
                    <td className="px-4 py-2 border-b border-[#333] text-xs text-[#A0A0A0] font-mono">
                      {address}
                    </td>
                    <td className="px-4 py-2 border-b border-[#333]">{type}</td>
                    <td className="px-4 py-2 border-b border-[#333] font-semibold">
                      {key}
                    </td>
                    <td className="px-4 py-2 border-b border-[#333]">
                      <input
                        value={tempValues[i]}
                        onChange={(e) =>
                          updateAttributeValue(i, e.target.value)
                        }
                        className="w-full px-2 py-1 rounded-md border border-[#444] bg-[#2A2A2A] text-sm text-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
                      />
                      {feedbacks[i] && (
                        <div
                          className={`mt-1 text-xs px-2 py-1 rounded shadow-sm ${
                            feedbacks[i].success
                              ? "bg-green-600/20 text-green-400 border border-green-600"
                              : "bg-red-600/20 text-red-400 border border-red-600"
                          }`}
                        >
                          {feedbacks[i].message}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 border-b border-[#333] text-center">
                      <button
                        onClick={() => confirmChange(i)}
                        className="text-green-500 hover:bg-green-600 hover:text-white rounded-full p-1 transition-all"
                        title="Confirmar cambio"
                      >
                        ✅
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold"
          >
            Cerrar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
