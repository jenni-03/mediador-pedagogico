import { useState } from "react";
import { commandsData } from "../../../../shared/constants/commandsData";
import { CommandProps } from "../../../../types";
import { motion, AnimatePresence } from "framer-motion";

const comandos: CommandProps[] = commandsData["memoria"].buttons;

export function FloatingCommandPanel() {
  const [selected, setSelected] = useState<CommandProps | null>(null);

  return (
    <>
      {/* Panel flotante alineado y responsivo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full flex justify-center sm:justify-end px-14 sm:pr-12 mt-6 sm:-mt-60"
      >
        <div className="w-full sm:w-[40%] max-w-screen-md bg-[#f9f9f9] border border-red-200 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.05)] p-5">
          <h2 className="text-center font-bold text-sm text-red-600 tracking-wide mb-4">
            COMANDOS SIMULADOR MEMORIA
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {comandos.map((cmd: CommandProps, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelected(cmd)}
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:border-red-400 hover:text-red-600 rounded-full px-4 py-1 transition-all shadow-sm hover:shadow-md"
              >
                {cmd.title}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal animado */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-red-600 mb-5 text-center tracking-wide">
                {selected.title.toUpperCase()}
              </h3>
              <p className="mb-3 text-sm text-gray-700">
                <strong>🧠 Funcionalidad:</strong> {selected.description}
              </p>
              <p className="mb-3 text-sm text-gray-700">
                <strong>📌 Estructura del comando:</strong> {selected.estructura}
              </p>
              <p className="mb-5 text-sm text-gray-700">
                <strong>🛠️ Ejemplo de uso:</strong> {selected.ejemplo}
              </p>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(null)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2 rounded-full shadow"
                >
                  Aceptar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
