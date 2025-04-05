import { motion, AnimatePresence } from "framer-motion";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { useState, useEffect } from "react";

interface ChangeTypeModalProps {
  address: string;
  onClose: () => void;
  consolaRef: React.RefObject<Consola>;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

const typeOptions = [
  "boolean",
  "char",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "string",
];

export function ChangeTypeModal({
  address,
  onClose,
  consolaRef,
  setMemoryState,
}: ChangeTypeModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedType) return;

    const result = consolaRef.current?.ejecutarComando(
      `convert address ${address} to ${selectedType}`
    );

    if (result && result[0]) {
      setMemoryState(result[2] as Record<string, any[]>);
      setSuccessMsg("Tipo cambiado exitosamente ✅");

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 2500);
    } else {
      setError(result?.[1] || "Error al convertir el tipo");
    }
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative bg-[#1A1A1A] text-[#E0E0E0] p-6 rounded-2xl shadow-2xl w-[90%] max-w-md border border-red-500"
      >
        <h2 className="text-2xl font-bold text-red-500 mb-5 text-center">
          🧬 Cambiar Tipo de Dato
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Nuevo tipo para{" "}
            <span className="font-bold text-white">{address}</span>:
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setError(null);
            }}
            className="w-full px-4 py-2 bg-[#2A2A2A] border border-[#444] rounded-lg shadow-sm text-sm text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Seleccionar tipo --</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>

          {error && (
            <p className="text-sm mt-2 text-red-400 font-medium">⚠️ {error}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-sm"
          >
            Cancelar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={!selectedType}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
              selectedType
                ? "bg-black hover:bg-gray-900 text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Cambiar
          </motion.button>
        </div>

        {/* ✅ Mensaje de éxito como el de error pero en verde */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 text-sm font-medium text-green-400"
            >
              ✅ {successMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
