import { useEffect, useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion, AnimatePresence } from "framer-motion";
import { ObjectDetailsModal } from "./ObjectDetailsModal";
import { DeleteConfirmationModal } from "../atoms/DeleteConfirmationModal";

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

    // Calcular tamaño de cada objeto al montar o actualizar el segmento
    useEffect(() => {
        const newSizes: Record<string, string> = {};
        memorySegment.forEach((entry) => {
            const result = consolaRef.current?.ejecutarComando(
                `size address ${entry.address}`
            );
            if (result && result[0]) {
                newSizes[entry.address] = result[1];
            }
        });
        setSizes(newSizes);
    }, [JSON.stringify(memorySegment)]);

    // Colores por tipo de dato
    const colorByType = (type: string) => {
        switch (type) {
            case "int":
            case "long":
            case "short":
            case "byte":
                return "text-blue-600";
            case "float":
            case "double":
                return "text-green-600";
            case "char":
                return "text-purple-600";
            case "boolean":
                return "text-red-500";
            case "string":
                return "text-pink-600";
            default:
                return "text-gray-700";
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Grid de tarjetas de objetos */}
            <div className="w-full max-w-7xl grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 p-4 sm:gap-5 sm:p-6">
                {memorySegment.length > 0 ? (
                    memorySegment
                        .filter((entry) =>
                            searchTerm
                                ? entry.address.includes(searchTerm)
                                : true
                        )
                        .map((entry, index) => (
                            <motion.div
                                key={entry.address}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.25,
                                    delay: index * 0.05,
                                }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedEntry(entry)}
                                className="relative bg-white p-5 rounded-2xl border border-gray-300 shadow-sm 
                           flex flex-col items-center justify-center text-center cursor-pointer 
                           hover:border-red-400 hover:shadow-md transition-all"
                            >
                                {/* Dirección de memoria */}
                                <div className="absolute top-2 left-2">
                                    <span className="text-xs bg-red-500 text-white px-2.5 py-0.5 rounded-full font-semibold shadow">
                                        {entry.address}
                                    </span>
                                </div>

                                {/* Tamaño y botón eliminar */}
                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-medium shadow-sm">
                                        {sizes[entry.address] ?? "…"}
                                    </span>
                                    <button
                                        className="text-purple-500 hover:text-white hover:bg-purple-500 rounded-full p-1 transition-all duration-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget(entry.address);
                                        }}
                                        title="Eliminar objeto"
                                    >
                                        ✖
                                    </button>
                                </div>

                                {/* Nombre del objeto */}
                                <p className="text-lg font-bold uppercase mt-6 truncate w-full px-2">
                                    {entry.name}
                                </p>

                                {/* Tabla de atributos del objeto */}
                                <div className="w-full mt-4 overflow-x-auto">
                                    <table className="min-w-full text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-100 text-gray-700 font-semibold">
                                            <tr>
                                                <th className="px-4 py-2 border-b border-gray-300">
                                                    Tipo
                                                </th>
                                                <th className="px-4 py-2 border-b border-gray-300">
                                                    Key
                                                </th>
                                                <th className="px-4 py-2 border-b border-gray-300">
                                                    Valor
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entry.value.map(
                                                (group: any[], i: number) => {
                                                    const type =
                                                        group.find(
                                                            (attr: any) =>
                                                                attr.key ===
                                                                "type"
                                                        )?.value || "unknown";
                                                    const key =
                                                        group.find(
                                                            (attr: any) =>
                                                                attr.key ===
                                                                "key"
                                                        )?.value || "";
                                                    const value =
                                                        group.find(
                                                            (attr: any) =>
                                                                attr.key ===
                                                                "value"
                                                        )?.value ?? "";

                                                    return (
                                                        <tr
                                                            key={i}
                                                            className="even:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-2 border-b border-gray-200 text-gray-500">
                                                                {type}
                                                            </td>
                                                            <td className="px-4 py-2 border-b border-gray-200 font-medium">
                                                                {key}
                                                            </td>
                                                            <td
                                                                className={`px-4 py-2 border-b border-gray-200 font-semibold ${colorByType(type)}`}
                                                            >
                                                                {typeof value ===
                                                                "object"
                                                                    ? JSON.stringify(
                                                                          value
                                                                      )
                                                                    : String(
                                                                          value
                                                                      )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center text-lg font-semibold">
                        No hay objetos en este segmento.
                    </p>
                )}
            </div>

            {/* Modal de detalles del objeto */}
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

            {/* Modal de confirmación de eliminación */}
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
        </div>
    );
}
