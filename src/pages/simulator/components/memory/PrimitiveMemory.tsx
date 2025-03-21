import { useState } from "react";
import { Consola } from "../../../../shared/utils/RAM/Consola";
import { motion } from "framer-motion";

interface PrimitiveMemoryProps {
    type: string;
    searchTerm: string;
    consolaRef: React.RefObject<Consola>;
    memoryState: Record<string, any[]>; // Recibe el estado de la memoria
}

export function PrimitiveMemory({ type, searchTerm, consolaRef, memoryState }: PrimitiveMemoryProps) {
    const memorySegment = memoryState[type] || []; // Obtiene el segmento de memoria

    // Estado para la ventana modal
    const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
    const [tempValue, setTempValue] = useState(""); // Estado temporal para cambiar el valor

    // Función para determinar el color según el tipo de dato
    const getValueColor = (type: string) => {
        switch (type) {
            case "boolean": return "text-blue-400";   
            case "char": return "text-yellow-400";    
            case "byte":
            case "short":
            case "int":
            case "long": return "text-orange-400";   
            case "float":
            case "double": return "text-green-400";   
            case "string": return "text-red-400";   
            default: return "text-gray-300";  
        }
    };

    // Función para "eliminar" (ahora solo imprime en consola)
    const handleDelete = (address: string) => {
        console.log(`Eliminar dirección: ${address}`);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* 📜 Contenedor de los valores de la memoria */}
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
                                className="relative bg-gray-900 text-white p-4 rounded-lg border-4 border-gray-700 
                                           flex flex-col items-center justify-center text-center cursor-pointer
                                           hover:scale-105 transition-all duration-200 transform
                                           hover:border-blue-500 hover:shadow-[0px_0px_15px_rgba(0,200,255,0.8)]"
                            >
                                {/* ❌ Botón de eliminación más pequeño */}
                                <button 
                                    className="absolute top-1.5 right-2 text-red-400 hover:text-red-500 text-sm font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evitar que abra la modal
                                        handleDelete(entry.address);
                                    }}
                                >
                                    ✖
                                </button>

                                {/* Dirección de memoria */}
                                <p className="text-xs bg-blue-500 px-2 py-1 rounded-md absolute -top-3 left-2">
                                    {entry.address}
                                </p>

                                {/* Nombre de la variable */}
                                <p className="text-lg font-bold uppercase truncate w-full px-2">
                                    {entry.name}
                                </p>

                                {/* Valor con color dinámico según tipo */}
                                <p className={`${getValueColor(entry.type)} text-sm mt-2 truncate w-full px-2`}>
                                    {JSON.stringify(entry.value)}
                                </p>
                            </motion.div>
                        ))
                ) : (
                    <p className="text-gray-400 col-span-full text-center text-lg font-semibold">
                        No hay datos en este segmento.
                    </p>
                )}
            </div>

            {/* 🖼️ Ventana Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-sm w-full border-4 border-blue-500"
                    >
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Detalles de la Variable</h2>
                        <div className="space-y-2">
                            <p><span className="text-gray-400">🔹 Tipo:</span> {selectedEntry.type}</p>
                            <p><span className="text-gray-400">🏷️ Nombre:</span> {selectedEntry.name}</p>
                            <p><span className="text-gray-400">📍 Dirección:</span> {selectedEntry.address}</p>
                            
                            {/* Input para cambiar el valor */}
                            <div>
                                <label className="text-gray-400 block mb-1">✏️ Nuevo Valor:</label>
                                <input
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 
                                               focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button 
                                onClick={() => setSelectedEntry(null)} 
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-all"
                            >
                                Cerrar
                            </button>
                            <button 
                                onClick={() => console.log("Aceptar presionado (sin función aún)")}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-all"
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
