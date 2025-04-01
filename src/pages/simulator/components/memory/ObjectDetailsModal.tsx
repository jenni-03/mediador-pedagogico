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
    const [localValue, setLocalValue] = useState(entry.value);
    const [tempValues, setTempValues] = useState(
        entry.value.map(
            (group: any[]) =>
                group.find((a: any) => a.key === "value")?.value ?? ""
        )
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
        const updatedValue = [...localValue];
        const attr = updatedValue[index].find((a: any) => a.key === "value");
        if (attr) attr.value = tempValues[index];

        const result = consolaRef.current?.ejecutarComando(
            `set address ${entry.address} value ${JSON.stringify(updatedValue)}`
        );

        if (result) {
            const [success, message, updatedState] = result;
            setFeedbacks((prev) => ({
                ...prev,
                [index]: { success, message },
            }));

            if (success) {
                setLocalValue(updatedValue);
                setMemoryState(updatedState as Record<string, any[]>);
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
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
        >
            <motion.div
                layout
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.1 }}
                className="bg-white text-black p-6 rounded-2xl shadow-xl w-[95%] max-w-2xl border border-red-300"
            >
                <h2 className="text-2xl font-bold text-red-600 mb-4 text-center flex items-center justify-center gap-2">
                    🧩 Detalles del Objeto
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4 text-gray-700">
                    <p>
                        <span className="font-semibold text-red-500">
                            🔹 Tipo:
                        </span>{" "}
                        {entry.type}
                    </p>
                    <p>
                        <span className="font-semibold text-red-500">
                            🏷️ Nombre:
                        </span>{" "}
                        {entry.name}
                    </p>
                    <p>
                        <span className="font-semibold text-red-500">
                            📍 Dirección:
                        </span>{" "}
                        {entry.address}
                    </p>
                    <p>
                        <span className="font-semibold text-red-500">
                            📦 Tamaño:
                        </span>{" "}
                        {size}
                    </p>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-red-50 text-red-600 font-semibold text-left">
                            <tr>
                                <th className="px-4 py-2 border-b border-red-200">
                                    Tipo
                                </th>
                                <th className="px-4 py-2 border-b border-red-200">
                                    Key
                                </th>
                                <th className="px-4 py-2 border-b border-red-200">
                                    Valor
                                </th>
                                <th className="px-2 py-2 border-b border-red-200 text-center">
                                    ✔️
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {localValue.map((group: any[], i: number) => {
                                const type =
                                    group.find((a: any) => a.key === "type")
                                        ?.value ?? "";
                                const key =
                                    group.find((a: any) => a.key === "key")
                                        ?.value ?? "";
                                return (
                                    <tr key={i} className="even:bg-gray-50">
                                        <td className="px-4 py-2 border-b border-gray-200 text-gray-600">
                                            {type}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200 font-medium">
                                            {key}
                                        </td>
                                        <td className="px-4 py-2 border-b border-gray-200">
                                            <input
                                                value={tempValues[i]}
                                                onChange={(e) =>
                                                    updateAttributeValue(
                                                        i,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-2 py-1 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                            />
                                            {feedbacks[i] && (
                                                <div
                                                    className={`mt-1 text-xs px-2 py-1 rounded ${
                                                        feedbacks[i].success
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {feedbacks[i].message}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 border-b border-gray-200 text-center">
                                            <button
                                                onClick={() => confirmChange(i)}
                                                className="text-green-600 hover:text-white hover:bg-green-500 rounded-full p-1 transition-all"
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

                <div className="flex justify-end gap-2 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold"
                    >
                        Cerrar
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
