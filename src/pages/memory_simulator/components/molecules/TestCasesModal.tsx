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

export function TestCasesModal({
    consolaRef,
    setMemoryState,
    closeModal,
}: TestCasesModalProps) {
    const [input, setInput] = useState("");
    const [testCommands, setTestCommands] = useState<string[]>([]);
    const [executed, setExecuted] = useState(false);
    const [results, setResults] = useState<Result[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Añadir o actualizar un comando en la lista
    const addCommand = () => {
        if (input.trim() === "") return;

        if (editingIndex !== null) {
            const updated = [...testCommands];
            updated[editingIndex] = input.trim();
            setTestCommands(updated);
            setEditingIndex(null);
        } else {
            setTestCommands((prev) => [...prev, input.trim()]);
        }

        setInput("");
    };

    // Alternar selección individual de comandos
    const toggleSelect = (index: number) => {
        setSelected((prev) => {
            const newSet = new Set(prev);
            newSet.has(index) ? newSet.delete(index) : newSet.add(index);
            return newSet;
        });
    };

    // Seleccionar todos los comandos
    const selectAll = () => {
        const all = new Set(testCommands.map((_, i) => i));
        setSelected(all);
    };

    // Cargar comandos predefinidos
    const loadPredefinedCases = () => {
        const cases = [
            "insert int edad = 25;",
            "insert float temperatura = 36.7;",
            'insert string nombre = "Carlos";',
            "insert boolean activo = true;",
            "insert double precio = 99.99;",
            'insert char inicial = "C";',
            "insert long poblacion = 7800000000;",
            "insert short dia = 15;",
            "insert byte codigo = 120;",
            "insert int[] edades = [20, 30, 40, 50];",
            "insert float[] alturas = [1.65, 1.75, 1.80];",
            "insert boolean[] flags = [true, false, true, false];",
            "insert double[] medidas = [12.345, 67.89, 101.11];",
            'insert char[] iniciales = ["A", "B", "Z"];',
            'insert string[] nombres = ["Ana", "Luis", "Carlos"];',
            "insert long[] cantidades = [1000000000, 2000000000];",
            "insert short[] niveles = [1, 2, 3];",
            "insert byte[] codigos = [12, 34, 56];",
            'insert object persona = (string nombre = "Efrain"; int edad = 24; float[] deudas = [21412.12, 234.12];);',
            'insert object curso = (string nombre = "Algoritmos"; int[] calificaciones = [100, 95, 88]; boolean aprobado = true;);',
            'insert object sistema = (boolean encendido = true; long memoria = 8000000000; string[] modulos = ["RAM", "CPU", "SSD"];);',
        ];

        setTestCommands(cases);
    };

    // Ejecutar comandos seleccionados
    const executeTestCases = () => {
        const localResults: Result[] = [];
        selected.forEach((index) => {
            const cmd = testCommands[index];
            if (cmd) {
                const result = consolaRef.current?.ejecutarComando(cmd);
                if (result) {
                    localResults.push({
                        command: cmd,
                        message: result[1],
                        isSuccess: result[0],
                    });
                }
            }
        });

        setResults(localResults);
        setExecuted(true);

        const printResult = consolaRef.current?.ejecutarPrintMemory();
        if (printResult && printResult[0]) {
            setMemoryState(printResult[1] as Record<string, any[]>);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="bg-white text-black p-6 rounded-xl shadow-xl border border-red-200 w-[90%] max-w-md sm:w-[70%] lg:w-[50%]"
            >
                <h2 className="text-2xl font-bold mb-5 text-red-600 text-center">
                    🧪 Casos de Prueba
                </h2>

                {/* Formulario y lista de comandos si aún no se han ejecutado */}
                {!executed && (
                    <>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Escribe un comando..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-red-400"
                            />
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
                                onClick={addCommand}
                            >
                                {editingIndex !== null
                                    ? "Actualizar"
                                    : "Añadir"}
                            </motion.button>
                        </div>

                        {/* Lista de comandos añadidos */}
                        <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {testCommands.map((cmd, idx) => (
                                <li
                                    key={idx}
                                    className={`flex items-center gap-2 text-red-800 rounded-full px-4 py-1 text-sm cursor-pointer transition-all duration-200
                    ${
                        selected.has(idx)
                            ? "bg-red-50 border-red-500 border-2 ring-1 ring-red-400 shadow-sm"
                            : "bg-red-50 border-red-200"
                    }`}
                                    onClick={() => toggleSelect(idx)}
                                >
                                    <span className="truncate flex-1">
                                        {cmd}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInput(cmd);
                                            setEditingIndex(idx);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setTestCommands((prev) =>
                                                prev.filter((_, i) => i !== idx)
                                            );
                                            setSelected((prev) => {
                                                const newSet = new Set(prev);
                                                newSet.delete(idx);
                                                return newSet;
                                            });
                                            if (editingIndex === idx) {
                                                setInput("");
                                                setEditingIndex(null);
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                        title="Eliminar"
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Botones de acciones adicionales */}
                        <div className="flex justify-between mt-6 flex-wrap gap-2">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={closeModal}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold"
                            >
                                Cancelar
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={loadPredefinedCases}
                                className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-full text-sm font-semibold"
                            >
                                Cargar Pruebas
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={selectAll}
                                className="bg-purple-100 text-purple-600 hover:bg-purple-200 px-4 py-2 rounded-full text-sm font-semibold"
                            >
                                Seleccionar Todos
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={executeTestCases}
                                disabled={selected.size === 0}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm disabled:opacity-50"
                            >
                                Ejecutar Seleccionados
                            </motion.button>
                        </div>
                    </>
                )}

                {/* Resultados luego de ejecución */}
                {executed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1"
                    >
                        {results.map((res, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg border ${
                                    res.isSuccess
                                        ? "bg-green-50 border-green-300 text-green-700"
                                        : "bg-red-50 border-red-300 text-red-700"
                                }`}
                            >
                                <span className="flex-1 truncate font-medium">
                                    {res.command}
                                </span>
                                <span className="text-lg">
                                    {res.isSuccess ? "✅" : "❌"}
                                </span>
                                <span className="text-xs">{res.message}</span>
                            </div>
                        ))}

                        {/* Botón para cerrar el modal después de ejecutar */}
                        <div className="text-center mt-5">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={closeModal}
                                className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold"
                            >
                                Finalizar
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
