import { useState, useEffect } from "react";

export default function MemoryAllocationVisualizer({
    n,
    direccionBase,
    tamanioNodo,
}: {
    n: number;
    direccionBase: number;
    tamanioNodo: number;
}) {
    const [memory, setMemory] = useState<{ index: number; address: number }[]>(
        []
    );
    const [currentLine, setCurrentLine] = useState(-1);
    
    // Código explicado línea por línea
    const codeLines = [
        `// Se define la dirección base: 
        // dirBase = ${direccionBase}`,
        `// Se define el tamaño de cada nodo en bytes: 
        // tamNodo = ${tamanioNodo}`,
        `for (let i = 0; i < ${n}; i++) {`,
        `    vectorMemoria[i] = dirBase + (i * tamNodo);`,
        `    // Ejm: vectorMemoria[i] = ${direccionBase} + (i * ${tamanioNodo})`,
        `}`,
        `// Fin del proceso.`,
    ];

    const [, setIndex] = useState(0);

    useEffect(() => {
        setMemory([]); // Reinicia la memoria antes de empezar
        setIndex(0); // Asegura que index empiece en 0

        const interval = setInterval(() => {
            setIndex((prevIndex) => {
                if (prevIndex < n) {
                    setMemory((prev) => [
                        ...prev,
                        {
                            index: prevIndex, // Ahora sí toma el 0
                            address: direccionBase + prevIndex * tamanioNodo,
                        },
                    ]);
                    setCurrentLine(prevIndex + 2);
                    return prevIndex + 1;
                } else {
                    clearInterval(interval);
                    return prevIndex; // Retorna el mismo valor para evitar cambios innecesarios
                }
            });
        }, 700);

        return () => clearInterval(interval);
    }, [n, direccionBase, tamanioNodo]);

    return (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 p-4 bg-gray-900 text-white rounded-lg shadow-md w-full max-w-3xl">
            {/* Sección del código */}
            <div className="md:w-2/3 w-full">
                <h1 className="text-lg font-bold text-center mb-2">
                    Código Dirección Base
                </h1>
                <pre className="bg-gray-800 p-3 rounded-md text-white overflow-auto">
                    {codeLines.map((line, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-300 ${
                                index === currentLine
                                    ? "text-white font-bold" // Línea actual en blanco y negrita
                                    : index < currentLine
                                      ? "text-blue-400" // Líneas anteriores en azul
                                      : "text-white" // Líneas futuras siguen blancas
                            }`}
                        >
                            {line}
                        </div>
                    ))}
                </pre>
            </div>

            {/* Tabla de direcciones de memoria */}
            <div className="md:w-1/3 w-full max-h-96 overflow-y-auto">
                <h1 className="text-lg font-bold text-center mb-2">
                    Direcciones de Memoria
                </h1>
                <table className="w-full border-collapse border border-gray-500 text-sm">
                    <thead>
                        <tr className="bg-gray-700">
                            <th className="border border-gray-500 p-2">
                                Índice
                            </th>
                            <th className="border border-gray-500 p-2">
                                Dirección
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {memory.map(({ index, address }) => (
                            <tr key={index} className="bg-gray-800">
                                <td className="border border-gray-500 p-2 text-center">
                                    {index}
                                </td>
                                <td className="border border-gray-500 p-2 text-center">
                                    {address}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
