import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VariableDetailsModalProps {
  entry: any;
  tempValue: string;
  setTempValue: (value: string) => void;
  onClose: () => void;
  consolaRef: React.RefObject<any>;
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
  const [arrayState, setArrayState] = useState<any[]>([]);

  const isArray = entry.type.toLowerCase() === "array";
  const emoji = isArray ? "📚" : "🧾";
  const title = isArray ? "Detalles del Array" : "Detalles de la Variable";

  const inferType = (sample: any): string => {
    if (typeof sample === "number") return Number.isInteger(sample) ? "int" : "float";
    if (typeof sample === "boolean") return "boolean";
    if (typeof sample === "string") return "string";
    return "string";
  };

  const baseType = isArray && entry.value.length > 0 ? inferType(entry.value[0]) : entry.type;

  const parseByType = (value: string) => {
    switch (baseType) {
      case "int":
        return isNaN(parseInt(value)) ? null : parseInt(value);
      case "float":
        return isNaN(parseFloat(value)) ? null : parseFloat(value);
      case "boolean":
        return value === "true" || value === "false" ? value === "true" : null;
      case "string":
      default:
        return value;
    }
  };

  useEffect(() => {
    if (isArray && Array.isArray(entry.value)) {
      setArrayState(entry.value);
      setTempValue(JSON.stringify(entry.value));
    }
  }, [entry]);

  const updateArrayValue = (index: number, newValue: string) => {
    const parsed = parseByType(newValue);
    const updated = [...arrayState];
    updated[index] = parsed;
    setArrayState(updated);
  };

  const handleAccept = () => {
    if (isArray) {
      const castedArray = arrayState.map((val) => parseByType(String(val)));
      const invalidIndex = castedArray.findIndex((v) => v === null);

      if (invalidIndex !== -1) {
        setFeedback({
          success: false,
          message: `Elemento ${invalidIndex} inválido en "${entry.name}": "${arrayState[invalidIndex]}" no es válido para ${baseType}.`
        });
        return;
      }

      const result = consolaRef.current?.ejecutarComando(
        `set address ${entry.address} value ${JSON.stringify(castedArray)}`
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
    } else {
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
        className="bg-white text-black p-6 rounded-2xl shadow-xl border border-red-300 w-[90%] max-w-xl"
      >
        <h2 className="text-2xl font-bold text-red-600 mb-5 text-center flex justify-center items-center gap-2">
          {emoji} {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-5 text-gray-700">
          <p><span className="font-semibold text-red-500">🔹 Tipo:</span> {entry.type}</p>
          <p><span className="font-semibold text-red-500">🏷️ Nombre:</span> {entry.name}</p>
          <p><span className="font-semibold text-red-500">📍 Dirección:</span> {entry.address}</p>
          <p><span className="font-semibold text-red-500">📦 Tamaño:</span> {size}</p>
        </div>

        {!isArray ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              ✏️ Nuevo Valor:
            </label>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 text-sm transition"
              placeholder="Nuevo valor"
            />
          </div>
        ) : (
          <div className="mb-4 overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-red-50 text-red-600">
                <tr>
                  <th className="px-4 py-2 border-b border-red-200">Índice</th>
                  <th className="px-4 py-2 border-b border-red-200">Valor</th>
                </tr>
              </thead>
              <tbody>
                {arrayState.map((val: any, i: number) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="px-4 py-2 border-b border-gray-200 text-gray-500">{i}</td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateArrayValue(i, e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-red-400 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
