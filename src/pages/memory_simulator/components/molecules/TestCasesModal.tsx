import { useState } from "react";
import { motion } from "framer-motion";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface TestCasesModalProps {
  consolaRef: React.RefObject<Consola>;
  setMemoryState: (
    newState: Record<string, any[]>,
    typeInserted?: string
  ) => void;
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

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const selectAll = () => {
    const all = new Set(testCommands.map((_, i) => i));
    setSelected(all);
  };

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

  const executeTestCases = () => {
    const localResults: Result[] = [];
    let lastTypeInserted: string | undefined = undefined;

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

          // Detectar tipo insertado si es un comando "insert"
          if (cmd.trim().startsWith("insert ")) {
            const match = cmd.match(/^insert\s+([a-zA-Z]+)(\[\])?/);
            if (match) {
              lastTypeInserted = match[1].toLowerCase();
              if (match[2]) lastTypeInserted = "array";
              if (lastTypeInserted === "object") lastTypeInserted = "object";
            }
          }
        }
      }
    });

    setResults(localResults);
    setExecuted(true);

    const printResult = consolaRef.current?.ejecutarPrintMemory();
    if (printResult && printResult[0]) {
      setMemoryState(printResult[1] as Record<string, any[]>, lastTypeInserted);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="
  w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg
  max-h-[90vh] overflow-y-auto
  bg-[#1A1A1A] text-[#E0E0E0]
  p-5 sm:p-6 md:p-8
  rounded-2xl
  shadow-xl shadow-black/40
  border border-[#2E2E2E]
"
      >
        <h2 className="text-2xl font-bold mb-5 text-[#D72638] text-center">
          🧪 Casos de Prueba
        </h2>

        {!executed && (
          <>
            {/* Input + botón */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Escribe un comando..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-[#262626] border border-[#2E2E2E] rounded-full px-4 py-2 text-sm placeholder-[#888] text-white focus:outline-none focus:ring-2 focus:ring-[#D72638]"
                data-tour="inputCasos"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-[#D72638] hover:bg-[#c01f30] text-white px-4 py-2 rounded-full text-sm font-semibold transition"
                onClick={addCommand}
                data-tour="botonAñadirCasos"
              >
                {editingIndex !== null ? "Actualizar" : "Añadir"}
              </motion.button>
            </div>

            {/* Lista de comandos */}
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1"
            data-tour="listaComandos">
              {testCommands.map((cmd, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm cursor-pointer border transition-all duration-200
                    ${
                      selected.has(idx)
                        ? "bg-[#2A2A2A] ring-1 ring-[#D72638]/50 border-[#D72638]"
                        : "bg-[#262626] border-[#2E2E2E]"
                    }`}
                  onClick={() => toggleSelect(idx)}
                >
                  <span className="truncate flex-1 text-[#D72638] font-medium">
                    {cmd}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInput(cmd);
                      setEditingIndex(idx);
                    }}
                    className="text-white hover:text-[#D72638] text-sm"
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
                    className="text-white hover:text-[#D72638] text-sm"
                    title="Eliminar"
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>

            {/* Botones inferiores */}
            <div className="flex flex-wrap justify-center sm:justify-between mt-6 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className="bg-[#333] text-white hover:bg-[#444] px-4 py-2 rounded-full text-sm font-semibold"
                data-tour="botonCerrarModalPruebas"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={loadPredefinedCases}
                className="bg-[#333] text-[#D72638] hover:bg-[#444] px-4 py-2 rounded-full text-sm font-semibold"
                data-tour="botonCargarPruebas"
              >
                Cargar Pruebas
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={selectAll}
                className="bg-[#333] text-purple-400 hover:bg-[#444] px-4 py-2 rounded-full text-sm font-semibold"
                data-tour="botonSeleccionarPruebas"
              >
                Seleccionar Todos
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={executeTestCases}
                disabled={selected.size === 0}
                className="bg-[#D72638] hover:bg-[#c01f30] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-sm disabled:opacity-40"
                data-tour="botonEjecutarPruebas"
              >
                Ejecutar Seleccionados
              </motion.button>
            </div>
          </>
        )}

        {executed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1"
            data-tour="resultadosComandos"
          >
            {results.map((res, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg border ${
                  res.isSuccess
                    ? "bg-green-900 text-green-300 border-green-700"
                    : "bg-red-900 text-red-300 border-red-700"
                }`}
              >
                <span className="flex-1 truncate font-medium">
                  {res.command}
                </span>
                <span className="text-lg">{res.isSuccess ? "✅" : "❌"}</span>
                <span className="text-xs">{res.message}</span>
              </div>
            ))}
            <div className="text-center mt-5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-full text-sm font-semibold"
                data-tour="cerrarModalPruebas"
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
