import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface VariableDetailsModalProps {
  entry: any;
  tempValue: string;
  setTempValue: (value: string) => void;
  onClose: () => void;
  consolaRef: React.RefObject<Consola>;
  memoryState: Record<string, any[]>;
  size: string;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function VariableDetailsModal({
  entry,
  tempValue,
  setTempValue,
  onClose,
  consolaRef,
  memoryState,
  size,
  setMemoryState
}: VariableDetailsModalProps) {
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleAccept = () => {
    const result = consolaRef.current?.ejecutarComando(
      `set address ${entry.address} value ${tempValue}`
    );

    if (result) {
      const [success, message, updatedState] = result;
      setFeedback({ success, message });

      if (success) {
        setMemoryState(updatedState as Record<string, any[]>);
        setTimeout(() => {
          setFeedback(null);
          onClose();
        }, 2000);
      } else {
        setTimeout(() => setFeedback(null), 3000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.1 }}
        className="bg-white text-black p-6 rounded-2xl shadow-xl max-w-sm w-full border border-red-300"
      >
        <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
          🧾 Detalles de la Variable
        </h2>

        <div className="space-y-3 text-sm text-gray-700">
          <p><span className="font-semibold text-red-500">🔹 Tipo:</span> {entry.type}</p>
          <p><span className="font-semibold text-red-500">🏷️ Nombre:</span> {entry.name}</p>
          <p><span className="font-semibold text-red-500">📍 Dirección:</span> {entry.address}</p>
          <p><span className="font-semibold text-red-500">📦 Tamaño:</span> {size}</p>

          <div>
            <label className="text-gray-700 block mb-1 font-medium">✏️ Nuevo Valor:</label>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-100 border border-gray-300 
                         focus:outline-none focus:ring-2 focus:ring-red-400 text-center"
            />
          </div>
        </div>

        {/* Mensaje de feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 px-4 py-2 rounded-full text-sm font-medium text-center transition-all duration-300 ${
                feedback.success
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300"
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end gap-2 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold"
          >
            Cerrar
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            className="px-4 py-2 bg-black hover:bg-gray-900 text-white rounded-full text-sm font-semibold"
          >
            Aceptar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
