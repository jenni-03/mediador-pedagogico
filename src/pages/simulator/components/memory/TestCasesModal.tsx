import { useState } from "react";
import { motion } from "framer-motion";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface TestCasesModalProps {
    consolaRef: React.RefObject<Consola>;
    setMemoryState: (newState: Record<string, any[]>) => void;
    closeModal: () => void;
}

interface Result {
    command: string;
    message: string;
    isSuccess: boolean;
}

export function TestCasesModal({ consolaRef, setMemoryState, closeModal }: TestCasesModalProps) {
    const [input, setInput] = useState("");
    const [testCommands, setTestCommands] = useState<string[]>([]);
    const [executed, setExecuted] = useState(false);
    const [results, setResults] = useState<Result[]>([]);

    const addCommand = () => {
        if (input.trim() !== "") {
            setTestCommands(prev => [...prev, input.trim()]);
            setInput("");
        }
    };

    const loadPredefinedCases = () => {
        const cases = [
            "insert int edad = 25;",
            "insert float temperatura = 36.7;",
            "insert string nombre = \"Carlos\";",
            "insert boolean activo = true;",
            "insert double precio = 99.99;",
            "insert char inicial = 'C';",
        ];
        setTestCommands(cases);
    };

    const executeTestCases = async () => {
        const localResults: Result[] = [];

        for (const cmd of testCommands) {
            if (cmd) {
                const result = consolaRef.current?.ejecutarComando(cmd);
                if (result) {
                    localResults.push({
                        command: cmd,
                        message: result[1],
                        isSuccess: result[0],
                    });
                }
                await new Promise(res => setTimeout(res, 200));
            }
        }

        setResults(localResults);
        setExecuted(true);

        const final = consolaRef.current?.ejecutarComando("print memory");
        if (final && final[0]) {
            setMemoryState(final.length === 3 ? final[2] : final[1]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white text-black p-6 rounded-lg shadow-lg max-w-xl w-full border-4 border-red-500"
            >
                <h2 className="text-xl font-bold mb-4 text-red-600">🧪 Casos de Prueba</h2>

                {!executed && (
                    <>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Escribe un comando..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 text-sm"
                            />
                            <button
                                onClick={addCommand}
                                className="bg-black text-white hover:bg-gray-800 px-3 py-2 rounded-md text-sm"
                            >
                                Añadir
                            </button>
                        </div>

                        {testCommands.map((cmd, idx) => (
                            <li
                                key={idx}
                                className="text-sm bg-gray-100 text-black rounded px-2 py-1 flex justify-between items-center gap-2"
                            >
                                <span className="truncate flex-1">{cmd}</span>
                                <button
                                    onClick={() => {
                                        setInput(cmd);
                                        setTestCommands(prev => prev.filter((_, i) => i !== idx));
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                    title="Editar comando"
                                >
                                    ✏️
                                </button>
                            </li>
                        ))}

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={closeModal}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded-md"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={loadPredefinedCases}
                                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
                            >
                                Cargar Pruebas
                            </button>
                            <button
                                onClick={executeTestCases}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                Ejecutar
                            </button>
                        </div>
                    </>
                )}

                {executed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1"
                    >
                        {results.map((res, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 bg-gray-100 text-black rounded-md px-3 py-2 text-sm"
                            >
                                <span className="flex-1 text-left truncate">{res.command}</span>
                                <span className="text-lg">
                                    {res.isSuccess ? "✅" : "❌"}
                                </span>
                                <span className={`text-sm ${res.isSuccess ? "text-green-600" : "text-red-600"} text-right`}>
                                    {res.message}
                                </span>
                            </div>
                        ))}

                        <div className="text-center mt-3">
                            <button
                                onClick={closeModal}
                                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
                            >
                                Finalizar
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
