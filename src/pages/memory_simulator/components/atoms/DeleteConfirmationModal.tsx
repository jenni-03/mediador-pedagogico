import { motion } from "framer-motion";
import { useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface Props {
  address: string;
  consolaRef: React.RefObject<Consola>;
  onClose: () => void;
  setMemoryState: (newState: Record<string, any[]>) => void;
}

export function DeleteConfirmationModal({
  address,
  consolaRef,
  onClose,
  setMemoryState,
}: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const handleConfirm = () => {
    const result = consolaRef.current?.ejecutarComando(
      `delete address ${address}`
    );
    if (result) {
      setIsSuccess(result[0]);
      setFeedback(result[1]);
      if (result[0]) setMemoryState(result[2]);
      setTimeout(() => onClose(), 2500);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#1A1A1A] text-[#E0E0E0] p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-red-500"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
      >
        <h2 className="text-lg font-bold text-red-500 mb-4 text-center">
          ¿Eliminar la dirección <span className="underline">{address}</span>?
        </h2>

        {!feedback ? (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-sm"
            >
              Eliminar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold text-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <p
            className={`mt-4 text-sm px-4 py-2 rounded-xl text-center font-medium border ${
              isSuccess
                ? "bg-green-100 text-green-700 border-green-400"
                : "bg-red-100 text-red-700 border-red-400"
            }`}
          >
            {feedback}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
