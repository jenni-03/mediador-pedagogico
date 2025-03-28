import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CodeAnalysisProps } from "../../../../types";

export function CodeAnalysis({
    code,
    operationalCost,
    complexity,
}: CodeAnalysisProps) {
    const [showConsole, setShowConsole] = useState(false);
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);

    useEffect(() => {
        if (showConsole) {
            // Divide el código en líneas, eliminando líneas en blanco
            const cleanLines = code
                .split("\n")
                .filter((line) => line.trim() !== "");

            // Simular escritura de líneas en consola
            const linesArray = cleanLines;
            let currentLineIndex = 0;
            setDisplayedLines([]); // Limpiar líneas anteriores

            const timer = setInterval(() => {
                if (currentLineIndex < linesArray.length) {
                    setDisplayedLines((prevLines) => [
                        ...prevLines,
                        linesArray[currentLineIndex],
                    ]);
                    currentLineIndex++;
                } else {
                    clearInterval(timer);
                }
            }, 300); // Intervalo entre líneas

            return () => clearInterval(timer);
        }
    }, [code, showConsole]);
    return (
        <div className={`w-full mx-auto p-4 ${showConsole ? "bg-gray-100 rounded-lg shadow-md" : ""}`}>
            {!showConsole && (
                <motion.button
                    style={{ backgroundColor: "#00b4d8" }}
                    className="w-full max-w-sm rounded text-white py-2 px-2 text-center mt-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                    }}
                    onClick={() => setShowConsole(true)}
                >
                    Mostrar Análisis de Código
                </motion.button>
            )}

            {showConsole && (
                <div>
                    <div className="code-container bg-gray-900 rounded-md p-4 mb-4 text-white font-mono">
                        <div className="overflow-x-auto whitespace-pre-wrap break-all text-sm">
                            {displayedLines.map((line, index) => (
                                <div key={index} className="typing-animation">
                                    {line}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-bold text-xl mb-2">
                            Análisis de Complejidad
                        </h3>
                        <div className="space-y-2">
                            <div className="bg-gray-200 p-2 rounded">
                                <strong>Costo Operacional:</strong>
                                {operationalCost.map((cost, index) => (
                                    <div key={index} className="mt-1">
                                        {cost}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-200 p-2 rounded">
                                <strong>Complejidad:</strong>
                                {complexity}
                            </div>
                        </div>
                    </div>

                    <motion.button
                        style={{ backgroundColor: "#D02222" }}
                        className="w-full max-w-sm rounded text-white py-2 px-2 text-center mt-4"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10,
                        }}
                        onClick={() => setShowConsole(false)}
                    >
                        Ocultar Código
                    </motion.button>
                </div>
            )}
        </div>
    );
}
