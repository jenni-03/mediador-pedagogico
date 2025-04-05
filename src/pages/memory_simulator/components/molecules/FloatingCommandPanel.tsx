import { useState } from "react";
import { commandsData } from "../../../../shared/constants/commandsData";
import { CommandProps } from "../../../../types";
import { motion, AnimatePresence } from "framer-motion";

const comandos: CommandProps[] = commandsData["memoria"].buttons;

export function FloatingCommandPanel() {
  const [selected, setSelected] = useState<CommandProps | null>(null);

  return (
    <>
      {/* Panel flotante */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full flex justify-center sm:justify-end px-4 sm:px-10 mt-6 sm:-mt-60"
      >
        <div className="w-full sm:w-[40%] max-w-screen-md bg-[#1F1F1F] border border-[#2E2E2E] rounded-2xl shadow-xl shadow-black/40 p-5">
          <h2 className="text-center font-bold text-sm text-[#D72638] tracking-wide mb-4">
            COMANDOS DEL SIMULADOR DE MEMORIA
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {comandos.map((cmd: CommandProps, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelected(cmd)}
                className="text-xs font-semibold text-[#E0E0E0] bg-[#2B2B2B] border border-[#3A3A3A] hover:border-[#D72638] hover:text-[#D72638] rounded-full px-4 py-1 transition-all shadow-sm hover:shadow-md"
              >
                {cmd.title}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal de detalle */}
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
              className="bg-[#1F1F1F] p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-[#2E2E2E]"
            >
              <h3 className="text-2xl font-bold text-[#D72638] mb-5 text-center tracking-wide">
                {selected.title.toUpperCase()}
              </h3>
              <div className="space-y-3 text-sm text-[#CCCCCC]">
                <p>
                  <span className="font-semibold text-[#E0E0E0]">
                    🧠 Funcionalidad:
                  </span>{" "}
                  {selected.description}
                </p>
                <p>
                  <span className="font-semibold text-[#E0E0E0]">
                    📌 Estructura del comando:
                  </span>{" "}
                  {selected.estructura}
                </p>
                <p>
                  <span className="font-semibold text-[#E0E0E0]">
                    🛠️ Ejemplo de uso:
                  </span>{" "}
                  {selected.ejemplo}
                </p>
              </div>
              <div className="text-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(null)}
                  className="bg-[#D72638] hover:bg-[#c41f30] text-white font-semibold text-sm px-6 py-2 rounded-full shadow"
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
