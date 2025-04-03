import { motion } from "framer-motion";
import { useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface Props {
  address: string;
  consolaRef: React.RefObject<Consola>;
  onClose: () => void;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function DeleteConfirmationModal({ address, consolaRef, onClose, setMemoryState }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const handleConfirm = () => {
    const result = consolaRef.current?.ejecutarComando(`delete address ${address}`);
    if (result) {
      setIsSuccess(result[0]);
      setFeedback(result[1]);
      if (result[0]) setMemoryState(result[2]);
      setTimeout(() => onClose(), 2000);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center border-t-4 border-red-400"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
      >
        <h2 className="text-lg font-bold text-red-600 mb-4">
          ¿Eliminar la dirección <span className="underline">{address}</span>?
        </h2>
        {!feedback ? (
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-sm"
            >
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-semibold text-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <p className={`mt-3 font-medium text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
            {feedback}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
