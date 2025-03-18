import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// Definir la interfaz para la estructura de memoria
interface MemoryEntry {
    type: string;
    name: string;
    value: any;
    address: string;
}

interface ScreenComponentProps {
    content: string; // Recibe un string con la memoria en el formato mostrado
}

export function ScreenComponent({ content }: ScreenComponentProps) {
    const [memoryData, setMemoryData] = useState<Record<string, MemoryEntry[]>>({});
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!content.trim()) return;

        try {
            const lines = content.split("\n").map(line => line.trim());
            const parsedMemory: Record<string, MemoryEntry[]> = { ...memoryData };
            let currentType = "";

            for (const line of lines) {
                if (line.startsWith("[") && line.endsWith("]:")) {
                    currentType = line.replace(/[\[\]:]/g, "").toLowerCase();
                    if (!parsedMemory[currentType]) {
                        parsedMemory[currentType] = [];
                    }
                } else if (line.startsWith("{") && line.endsWith("}")) {
                    try {
                        const entry: MemoryEntry = JSON.parse(line);
                        if (currentType && !parsedMemory[currentType].some(e => e.address === entry.address)) {
                            parsedMemory[currentType].push(entry);
                        }
                    } catch {
                        console.error("Error al parsear la línea:", line);
                    }
                }
            }

            setMemoryData(parsedMemory);
        } catch (error) {
            console.error("Error al procesar la memoria:", error);
        }
    }, [content]); // ✅ La RAM se mantiene en estado y no se borra con nuevas actualizaciones

    const toggleCategory = (category: string) => {
        setCollapsed(prev => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    return (
        <div className="w-full flex justify-center sm:justify-start px-4 sm:pl-12 mt-4 sm:mt-6">
            {/* Contenedor del televisor */}
            <div className="relative w-full sm:w-[65%] max-w-screen-md bg-gray-900 border-8 border-gray-700 rounded-lg p-4 shadow-2xl">
                
                {/* Pantalla */}
                <div className="relative w-full h-36 sm:h-48 lg:h-60 bg-black text-green-400 p-2 rounded-md border-4 border-gray-600 overflow-auto font-mono text-xs sm:text-sm leading-tight">
                    
                    {Object.keys(memoryData).length > 0 ? (
                        Object.entries(memoryData).map(([dataType, entries], index) => (
                            <div key={index} className="mb-2">
                                {/* Botón para expandir/colapsar */}
                                <button 
                                    className="flex items-center w-full text-left text-yellow-300 font-bold border-b border-gray-500 pb-1 hover:text-yellow-400 transition"
                                    onClick={() => toggleCategory(dataType)}
                                >
                                    {collapsed[dataType] ? <FaChevronRight className="mr-2" /> : <FaChevronDown className="mr-2" />}
                                    {dataType.toUpperCase()}
                                </button>
                                
                                {/* Contenedor flexible para celdas */}
                                {!collapsed[dataType] && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {entries.map((entry, i) => (
                                            <div key={entry.address} className="bg-gray-800 text-center p-2 rounded border border-gray-700 w-auto min-w-[100px] max-w-full break-words">
                                                <p className="text-blue-400 text-xs">{entry.address}</p>
                                                <p className="text-white text-sm break-words">{entry.name}: {JSON.stringify(entry.value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">Esperando datos...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
