import { useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion } from "framer-motion";

interface PrimitiveMemoryProps {
    type: string;
    searchTerm: string;
    consolaRef: React.RefObject<Consola>;
    memoryState: Record<string, any[]>;
}

export function PrimitiveMemory({ type, searchTerm, consolaRef, memoryState }: PrimitiveMemoryProps) {
    const memorySegment = memoryState[type] || [];

    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [tempValue, setTempValue] = useState("");

    const getValueColor = (type: string) => {
        switch (type) {
            case "boolean": return "text-red-600";
            case "char": return "text-black";
            case "byte":
            case "short":
            case "int":
            case "long": return "text-gray-700";
            case "float":
            case "double": return "text-gray-900";
            case "string": return "text-red-800";
            default: return "text-gray-500";
        }
    };

    const handleDelete = (address: string) => {
        console.log(`Eliminar dirección: ${address}`);
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-6">
                {memorySegment.length > 0 ? (
                    memorySegment
                        .filter(entry => searchTerm ? entry.address.includes(searchTerm) : true)
                        .map((entry, index) => (
                            <motion.div
                                key={entry.address}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                onClick={() => {
                                    setSelectedEntry(entry);
                                    setTempValue(entry.value);
                                }}
                                className="relative bg-white text-black p-4 rounded-lg border-4 border-gray-300
                                           flex flex-col items-center justify-center text-center cursor-pointer
                                           hover:scale-105 transition-all duration-200 transform
                                           hover:border-red-500 hover:shadow-[0px_0px_15px_rgba(255,0,0,0.4)]"
                            >
                                <button 
                                    className="absolute top-1.5 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(entry.address);
                                    }}
                                >
                                    ✖
                                </button>

                                <p className="text-xs bg-red-500 text-white px-2 py-1 rounded-md absolute -top-3 left-2">
                                    {entry.address}
                                </p>

                                <p className="text-lg font-bold uppercase truncate w-full px-2">
                                    {entry.name}
                                </p>

                                <p className={`${getValueColor(entry.type)} text-sm mt-2 truncate w-full px-2`}>
                                    {JSON.stringify(entry.value)}
                                </p>
                            </motion.div>
                        ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center text-lg font-semibold">
                        No hay datos en este segmento.
                    </p>
                )}
            </div>

            {selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-white text-black p-6 rounded-lg shadow-lg max-w-sm w-full border-4 border-red-500"
                    >
                        <h2 className="text-xl font-bold mb-4 text-red-600">Detalles de la Variable</h2>
                        <div className="space-y-2">
                            <p><span className="text-gray-600">🔹 Tipo:</span> {selectedEntry.type}</p>
                            <p><span className="text-gray-600">🏷️ Nombre:</span> {selectedEntry.name}</p>
                            <p><span className="text-gray-600">📍 Dirección:</span> {selectedEntry.address}</p>

                            <div>
                                <label className="text-gray-700 block mb-1">✏️ Nuevo Valor:</label>
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full p-2 rounded-md bg-gray-100 border border-gray-300 
                                               focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-4">
                            <button 
                                onClick={() => setSelectedEntry(null)} 
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all"
                            >
                                Cerrar
                            </button>
                            <button 
                                onClick={() => console.log("Aceptar presionado (sin función aún)")}
                                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all"
                            >
                                Aceptar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
