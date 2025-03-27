import { useState, useEffect } from "react";
import { infoStructures } from "../../../shared/constants/infoStructures";
import { FaSpinner } from "react-icons/fa"; // Icono de carga animado

export function DataStructureInfo({
    children,
    structure,
    structurePrueba,
    memoryAddress,
}: {
    children: React.ReactNode;
    structure: string;
    structurePrueba: any;
    memoryAddress?: { message: string; id: number };
}) {
    const info = infoStructures[structure].info;

    // Convertir el código de memoria en un array de líneas
    const codeLines = memoryAddress
        ? memoryAddress.message.trim().split("\n")
        : [];

    // Estado para controlar qué línea se muestra
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true); // Controla el efecto de carga

    useEffect(() => {
        if (codeLines.length > 0) {
            setVisibleLines([codeLines[0]]); // Agrega la primera línea inmediatamente
            setIsLoading(true); // Activa la animación de carga

            let index = 1; // Comienza en la segunda línea
            const interval = setInterval(() => {
                if (index < codeLines.length) {
                    setVisibleLines((prevLines) => [
                        ...prevLines,
                        codeLines[index],
                    ]);
                    index++;
                } else {
                    clearInterval(interval);
                    setIsLoading(false); // Finaliza la animación
                }
            }, 700);

            return () => clearInterval(interval);
        }
    }, [memoryAddress?.id]); // Se ejecuta cuando cambia memoryAddress

    return (
        <div className="flex-[4] flex flex-col bg-white rounded-3xl p-4 overflow-auto shadow-lg border border-gray-300">
            <div className="flex flex-row gap-4">
                {/* Sección izquierda (Código de asignación de memoria) */}
                {memoryAddress && (
                    <div className="bg-gray-200 rounded-xl p-4 w-full max-w-[600px] shadow-md">
                        <h1 className="font-semibold text-md text-center mb-3 text-black">
                            ASIGNACIÓN DE MEMORIA
                        </h1>

                        {/* Bloque de código con animación */}
                        <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-md p-4 shadow-inner border border-gray-600 overflow-hidden max-w-[550px]">
                            {visibleLines.map((line, index) => (
                                <div
                                    key={index}
                                    className={`transition-all duration-300 ${
                                        isLoading &&
                                        index === visibleLines.length - 1
                                            ? "text-white font-bold" // Resalta la línea actual
                                            : "text-green-400"
                                    }`}
                                >
                                    {line}
                                </div>
                            ))}

                            {/* Efecto de cursor de escritura */}
                            {isLoading && (
                                <span className="text-white animate-blink">
                                    ▌
                                </span>
                            )}
                        </div>

                        {/* Icono de carga mientras se muestra el código */}
                        {isLoading && (
                            <div className="flex justify-center mt-3">
                                <FaSpinner className="text-gray-400 animate-spin text-xl" />
                            </div>
                        )}
                    </div>
                )}

                {/* Sección derecha (Info de estructura) */}
                <div className="ml-auto flex flex-col items-end h-full">
                    {info.map((infoKey: string, index: number) => (
                        <h1
                            key={index}
                            className="font-medium text-right text-md"
                        >
                            {`${infoKey.toUpperCase()}: ${
                                infoKey === "Tamaño"
                                    ? structurePrueba.getTamanio()
                                    : infoKey === "Capacidad"
                                      ? structurePrueba.vector.length
                                      : "N/A"
                            }`}
                        </h1>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex items-center">{children}</div>
        </div>
    );
}
