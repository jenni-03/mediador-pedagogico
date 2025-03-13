import { useState, useEffect } from "react";
import { FaChevronDown, FaChevronRight, FaSyncAlt } from "react-icons/fa"; // Ícono de intercambio
import { MemoryMapComponent } from "./MemoryMapComponent"; // Importamos la nueva vista

interface ScreenComponentProps {
    content: string; // Recibe un string JSON representando la RAM
}

export function ScreenComponent({ content }: ScreenComponentProps) {
    const [memoryData, setMemoryData] = useState<Record<string, Record<string, any>> | null>(null);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({}); // Estado de cada tipo de dato
    const [isCircuitView, setIsCircuitView] = useState(false); // Estado para intercambiar la vista

    useEffect(() => {
        if (!content.trim()) return; // No hacer nada si el contenido está vacío

        try {
            const parsedData = JSON.parse(content);
            setMemoryData(parsedData);
        } catch (error) {
            // Si hay un error, no actualizamos la memoria
        }
    }, [content]);

    const toggleCategory = (category: string) => {
        setCollapsed((prev) => ({
            ...prev,
            [category]: !prev[category],
        }));
    };

    return (
        <div className="w-full flex justify-center sm:justify-start px-4 sm:pl-12 mt-4 sm:mt-6">
            {/* Televisor */}
            <div className="relative w-full sm:w-[65%] max-w-screen-md bg-gray-900 border-8 border-gray-700 rounded-lg p-4 shadow-2xl">
                
                {/* Pantalla */}
                <div className="relative w-full h-36 sm:h-48 lg:h-60 bg-black text-green-400 p-2 rounded-md border-4 border-gray-600 overflow-auto font-mono text-xs sm:text-sm leading-tight">
                    
                    {isCircuitView ? (
                        // 🔌 Modo Tablero de Circuitos
                        <MemoryMapComponent memoryData={memoryData} />
                    ) : memoryData ? (
                        // 📜 Modo Texto Tradicional
                        Object.entries(memoryData).map(([dataType, addresses], index) => (
                            <div key={index} className="mb-2">
                                {/* Botón para expandir/colapsar */}
                                <button 
                                    className="flex items-center w-full text-left text-yellow-300 font-bold border-b border-gray-500 pb-1 hover:text-yellow-400 transition"
                                    onClick={() => toggleCategory(dataType)}
                                >
                                    {collapsed[dataType] ? <FaChevronRight className="mr-2" /> : <FaChevronDown className="mr-2" />}
                                    {dataType.toUpperCase()}
                                </button>
                                
                                {/* Contenedor flexible para celdas (se oculta si está colapsado) */}
                                {!collapsed[dataType] && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Object.entries(addresses).map(([address, value]) => (
                                            <div key={address} className="bg-gray-800 text-center p-2 rounded border border-gray-700 w-auto min-w-[80px] max-w-full break-words">
                                                <p className="text-blue-400 text-xs">{address}</p>
                                                <p className="text-white text-sm break-words">{JSON.stringify(value)}</p>
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

                {/* Controles del televisor */}
                <div className="mt-4 flex justify-center">
                    {/* 🔄 Botón de intercambio de vista */}
                    <button
                        onClick={() => setIsCircuitView((prev) => !prev)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg transition flex items-center"
                    >
                        <FaSyncAlt className="mr-2" />
                        {isCircuitView ? "Jerarquia" : "Mapa"}
                    </button>
                </div>
            </div>
        </div>
    );
}
