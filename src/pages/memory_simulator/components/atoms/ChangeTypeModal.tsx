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

            // Cierra modal después del mensaje
            setTimeout(() => {
                setSuccessMsg(null);
                onClose();
            }, 3000);
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
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md border border-red-300"
            >
                <h2 className="text-2xl font-bold text-red-600 mb-5 text-center">
                    🧬 Cambiar Tipo de Dato
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nuevo tipo para{" "}
                        <span className="font-bold text-black">{address}</span>:
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => {
                            setSelectedType(e.target.value);
                            setError(null);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-400 text-sm"
                    >
                        <option value="">-- Seleccionar tipo --</option>
                        {typeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type.toUpperCase()}
                            </option>
                        ))}
                    </select>

                    {error && (
                        <p className="text-sm mt-2 text-red-600 font-medium">
                            ⚠️ {error}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium text-sm transition"
                    >
                        Cancelar
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!selectedType}
                        className={`px-4 py-2 text-white rounded-full font-semibold text-sm transition ${
                            selectedType
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-red-300 cursor-not-allowed"
                        }`}
                    >
                        Cambiar
                    </motion.button>
                </div>

                {/* ✅ Feedback animado tipo toast */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="
        absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2
        rounded-full shadow-md text-sm font-medium border
        bg-green-100 border-green-300 text-green-800
      "
                        >
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
