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
    const [changeTypeTarget, setChangeTypeTarget] = useState<string | null>(
        null
    );

    useEffect(() => {
        const newSizes: Record<string, string> = {};
        const newAddresses: Record<string, string[]> = {};
        const newTypes: Record<string, string> = {};

        memorySegment.forEach((entry) => {
            const sizeRes = consolaRef.current?.ejecutarComando(
                `size address ${entry.address}`
            );
            if (sizeRes && sizeRes[0]) {
                newSizes[entry.address] = sizeRes[1];
            }

            const typeRes = consolaRef.current?.ejecutarComando(
                `type address ${entry.address}`
            );
            if (typeRes && typeRes[0]) {
                newTypes[entry.address] = typeRes[1];
            }

            const addrs: string[] = [];
            entry.value.forEach((_: any, idx: number) => {
                const res = consolaRef.current?.ejecutarComando(
                    `address of ${entry.name}_${idx}`
                );
                addrs.push(res && res[0] ? res[1] : "—");
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
                                onClick={() => {
                                    setSelectedEntry(entry);
                                    setTempValue(JSON.stringify(entry.value));
                                }}
                                className="relative bg-white p-5 rounded-2xl border border-gray-300 shadow-sm 
                    flex flex-col items-center text-center cursor-pointer 
                    hover:border-red-400 hover:shadow-md transition-all"
                            >
                                {/* Dirección y engranaje */}
                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                    <span className="text-xs bg-red-500 text-white px-2.5 py-0.5 rounded-full font-semibold shadow">
                                        {entry.address}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setChangeTypeTarget(entry.address);
                                        }}
                                        className="bg-gray-100 text-xl w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-600 transition shadow-sm"
                                        title="Cambiar tipo de dato"
                                    >
                                        ⚙️
                                    </button>
                                </div>

                                {/* Tamaño y eliminar */}
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
                                        title="Eliminar variable"
                                    >
                                        ✖
                                    </button>
                                </div>

                                {/* Nombre y tipo */}
                                <p className="text-lg font-bold uppercase mt-6 truncate w-full px-2">
                                    {entry.name}
                                </p>
                                <p className="text-sm font-medium text-gray-500 mb-1">
                                    Tipo:{" "}
                                    <span className="text-gray-700 font-semibold">
                                        {types[entry.address] ?? "—"}
                                    </span>
                                </p>

                                {/* Tabla visual del array */}
                                <div className="mt-4 w-full overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 text-sm rounded-xl overflow-hidden">
                                        <thead className="bg-red-50 text-red-700 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="py-2 px-3 border-b border-red-200">
                                                    Dirección
                                                </th>
                                                <th className="py-2 px-3 border-b border-red-200">
                                                    Índice
                                                </th>
                                                <th className="py-2 px-3 border-b border-red-200">
                                                    Valor
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entry.value.map(
                                                (val: any, idx: number) => (
                                                    <tr
                                                        key={idx}
                                                        className="even:bg-gray-50 hover:bg-red-50 transition-all"
                                                    >
                                                        <td className="px-3 py-2 border-b border-gray-200 text-xs font-mono text-gray-500">
                                                            {addresses[
                                                                entry.address
                                                            ]?.[idx] ?? "—"}
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center font-semibold text-gray-700">
                                                            [{idx}]
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center text-gray-800">
                                                            {typeof val ===
                                                            "object"
                                                                ? JSON.stringify(
                                                                      val
                                                                  )
                                                                : String(val)}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center text-lg font-semibold">
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
