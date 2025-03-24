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

  const addCommand = () => {
    if (input.trim() !== "") {
      setTestCommands((prev) => [...prev, input.trim()]);
      setInput("");
    }
  };

  const loadPredefinedCases = () => {
    const cases = [
      // Primitivos
      "insert int edad = 25;",
      "insert float temperatura = 36.7;",
      "insert string nombre = \"Carlos\";",
      "insert boolean activo = true;",
      "insert double precio = 99.99;",
      "insert char inicial = \"C\";",
      "insert long poblacion = 7800000000;",
      "insert short dia = 15;",
      "insert byte codigo = 120;",
  
      // Arrays por tipo primitivo
      "insert int[] edades = [20, 30, 40, 50];",
      "insert float[] alturas = [1.65, 1.75, 1.80];",
      "insert boolean[] flags = [true, false, true, false];",
      "insert double[] medidas = [12.345, 67.89, 101.11];",
      "insert char[] iniciales = [\"A\", \"B\", \"Z\"];", 
      "insert string[] nombres = [\"Ana\", \"Luis\", \"Carlos\"];", 
      "insert long[] cantidades = [1000000000, 2000000000];",
      "insert short[] niveles = [1, 2, 3];",
      "insert byte[] codigos = [12, 34, 56];",
  
      // Objetos con atributos primitivos y arrays
      "insert object persona = (string nombre = \"Efrain\"; int edad = 24; float[] deudas = [21412.12, 234.12];);",
      "insert object curso = (string nombre = \"Algoritmos\"; int[] calificaciones = [100, 95, 88]; boolean aprobado = true;);",
      "insert object sistema = (boolean encendido = true; long memoria = 8000000000; string[] modulos = [\"RAM\", \"CPU\", \"SSD\"];);",
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
      }
    }

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
        className="bg-white text-black p-6 rounded-xl shadow-xl max-w-xl w-full border border-red-200"
      >
        <h2 className="text-2xl font-bold mb-5 text-red-600 text-center">
          🧪 Casos de Prueba
        </h2>

        {!executed && (
          <>
            {/* Input + Añadir */}
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
                Añadir
              </motion.button>
            </div>

            {/* Lista de comandos */}
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {testCommands.map((cmd, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-red-50 border border-red-200 text-red-800 rounded-full px-4 py-1 text-sm"
                >
                  <span className="truncate flex-1">{cmd}</span>
                  <button
                    onClick={() => {
                      setInput(cmd);
                      setTestCommands((prev) =>
                        prev.filter((_, i) => i !== idx)
                      );
                    }}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                    title="Editar comando"
                  >
                    ✏️
                  </button>
                </li>
              ))}
            </ul>

            {/* Botones inferiores */}
            <div className="flex justify-between mt-6">
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
                onClick={executeTestCases}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
              >
                Ejecutar
              </motion.button>
            </div>
          </>
        )}

        {/* Resultados */}
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
                <span className="flex-1 truncate font-medium">{res.command}</span>
                <span className="text-lg">{res.isSuccess ? "✅" : "❌"}</span>
                <span className="text-xs">{res.message}</span>
              </div>
            ))}

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
