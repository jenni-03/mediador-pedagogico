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

// Función auxiliar para detectar el tipo a partir del primer token del comando.
const detectarTipo = (cmd: string): string | undefined => {
  const trimmed = cmd.trim();
  // Extrae el primer token, ignorando si hay [].
  const match = trimmed.match(/^([a-zA-Z]+)(\[\])?/i);
  if (match) {
    let tipo = match[1].toLowerCase();
    if (tipo === "object") return "object";
    if (match[2]) return "array";
    return tipo;
  }
  return undefined;
};

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
      "int edad = 25;",
      "float temperatura = 36.7;",
      'string nombre = "Carlos";',
      "boolean activo = true;",
      "double precio = 99.99;",
      "char inicial = 'C';",
      "long poblacion = 7800000000;",
      "short dia = 15;",
      "byte codigo = 120;",
      "int[] edades = {20, 30, 40, 50};",
      "float[] alturas = {1.65, 1.75, 1.80};",
      "boolean[] flags = {true, false, true, false};",
      "double[] medidas = {12.345, 67.89, 101.11};",
      "char[] iniciales = {'A', 'B', 'Z'};",
      'string[] nombres = {"Ana", "Luis", "Carlos"};',
      "long[] cantidades = {1000000000, 2000000000};",
      "short[] niveles = {1, 2, 3};",
      "byte[] codigos = {12, 34, 56};",
      'object persona = new object( string nombre = "Efrain"; int edad = 24; float[] deudas = {21412.12, 234.12}; );',
      'object curso = new object( string nombre = "Algoritmos"; int[] calificaciones = {100, 95, 88}; boolean aprobado = true; );',
      'object sistema = new object( boolean encendido = true; long memoria = 8000000000; string[] modulos = {"RAM", "CPU", "SSD"}; );',
    ];
    setTestCommands(cases);
  };

  const executeTestCases = () => {
    const localResults: Result[] = [];
    let lastTypeInserted: string | undefined = undefined;

    // Recorrer cada comando seleccionado
    selected.forEach((index) => {
      const cmd = testCommands[index];
      if (cmd && consolaRef.current) {
        const result = consolaRef.current.ejecutarComando(cmd);
        if (result) {
          localResults.push({
            command: cmd,
            message: result[1],
            isSuccess: result[0],
          });
          // Usamos detectarTipo para obtener el segmento deseado
          const tipo = detectarTipo(cmd);
          if (tipo) lastTypeInserted = tipo;
        }
      }
    });

    setResults(localResults);
    setExecuted(true);

    const printResult = consolaRef.current?.ejecutarPrintMemory();
    if (printResult && printResult[0]) {
      // Pasamos el nuevo estado de memoria junto con lastTypeInserted.
      setMemoryState(printResult[1] as Record<string, any[]>, lastTypeInserted);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.3 }}
        className="
          w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg
          max-h-[90vh] overflow-y-auto
          bg-[#1A1A1A] text-[#E0E0E0]
          p-5 sm:p-6 md:p-8
          rounded-2xl
          shadow-2xl shadow-black/50
          border border-[#2E2E2E]
        "
      >
        <h2 className="text-2xl font-extrabold mb-5 text-[#D72638] text-center flex items-center justify-center gap-2">
          <span>🧪 Casos de Prueba</span>
        </h2>

        {/* Si todavía no se han ejecutado los comandos */}
        {!executed && (
          <>
            {/* Sección de ingreso de comandos */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                data-tour="inputCasos"
                placeholder="Escribe un comando..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="
                  flex-1 bg-[#262626] border border-[#3A3A3A]
                  rounded-full px-4 py-2 text-sm placeholder-[#888]
                  text-white focus:outline-none
                  focus:ring-2 focus:ring-[#D72638]
                "
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="
                  bg-[#D72638] hover:bg-[#c01f30]
                  text-white px-4 py-2 rounded-full
                  text-sm font-semibold transition
                "
                onClick={addCommand}
                data-tour="botonAñadirCasos"
              >
                {editingIndex !== null ? "Actualizar" : "Añadir"}
              </motion.button>
            </div>

            {/* Lista de comandos creados */}
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
              {testCommands.map((cmd, idx) => (
                <li
                  key={idx}
                  data-tour={`comandoCreado.${idx + 1}`} 
                  className={`
        flex items-center gap-2
        rounded-full px-4 py-2 text-sm
        cursor-pointer border
        transition-all duration-200
        ${
          selected.has(idx)
            ? "bg-[#2A2A2A] ring-1 ring-[#D72638]/50 border-[#D72638]"
            : "bg-[#262626] border-[#2E2E2E]"
        }
      `}
                  onClick={() => toggleSelect(idx)}
                >
                  <span className="truncate flex-1 text-[#D72638] font-medium">
                    {cmd}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInput(cmd);
                      setEditingIndex(idx);
                    }}
                    className="
          text-white hover:text-[#D72638]
          text-xs px-2 py-1
          bg-[#333] border border-[#2E2E2E]
          rounded-md
        "
                    title="Editar"
                    data-tour="lapiz"
                  >
                    ✏️
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
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
                    className="
          text-white hover:text-[#D72638]
          text-xs px-2 py-1
          bg-[#333] border border-[#2E2E2E]
          rounded-md
        "
                    title="Eliminar"
                    data-tour="equis"
                  >
                    ❌
                  </motion.button>
                </li>
              ))}
            </ul>

            {/* Botones de acción (abajo) */}
            <div className="flex flex-wrap justify-center sm:justify-between gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className="
                  bg-[#333] text-white hover:bg-[#444]
                  px-4 py-2 rounded-full text-sm font-semibold
                "
              >
                Cancelar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={loadPredefinedCases}
                data-tour="botonCargarPruebas"
                className="
                  bg-[#333] text-[#D72638]
                  hover:bg-[#444] px-4 py-2
                  rounded-full text-sm font-semibold
                "
              >
                Cargar Pruebas
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={selectAll}
                data-tour="botonSeleccionarPruebas"
                className="
                  bg-[#333] text-purple-400
                  hover:bg-[#444] px-4 py-2
                  rounded-full text-sm font-semibold
                "
              >
                Seleccionar Todos
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={executeTestCases}
                disabled={selected.size === 0}
                data-tour="botonEjecutarPruebas"
                className="
                  bg-[#D72638] hover:bg-[#c01f30]
                  text-white px-4 py-2
                  rounded-full text-sm font-semibold
                  shadow-sm disabled:opacity-40
                "
              >
                Ejecutar Seleccionados
              </motion.button>
            </div>
          </>
        )}

        {/* Resultados ejecutados */}
        {executed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-tour="resultadosComandos"
              className="
                mt-4 space-y-3
                max-h-60
                overflow-y-auto
                pr-1
              "
            >
              {results.map((res, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`
                    flex items-center gap-3
                    px-4 py-3
                    text-sm rounded-lg
                    border-2 shadow-md
                    ${
                      res.isSuccess
                        ? "bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white border-green-600"
                        : "bg-gradient-to-r from-red-800 via-red-700 to-red-600 text-white border-red-600"
                    }
                  `}
                >
                  <span
                    className="
                      w-8 h-8 flex items-center justify-center
                      rounded-full border-2
                    "
                    style={{
                      borderColor: res.isSuccess ? "limegreen" : "red",
                    }}
                  >
                    {res.isSuccess ? "✅" : "❌"}
                  </span>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold truncate">{res.command}</span>
                    <span className="text-xs font-light truncate">
                      {res.message}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                data-tour="cerrarModalPruebas"
                onClick={closeModal}
                className="
                  bg-[#333] hover:bg-[#444]
                  text-white px-4 py-2
                  rounded-full text-sm
                  font-semibold
                "
              >
                Finalizar
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
