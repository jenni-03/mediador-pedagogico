import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { commandsData } from "../../../../shared/constants/commandsData";
import { CommandProps } from "../../../../types";

// Lista plana de todos los comandos
const allCommands: CommandProps[] = commandsData["memoria"].buttons;

export function FloatingCommandPanel() {
  const [selected, setSelected] = useState<CommandProps | null>(null);

  return (
    <>
      {/* Panel flotante */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
          w-full h-auto sm:h-full
          flex justify-center sm:justify-end
          mt-4 sm:mt-0
          px-4 sm:px-10
        "
      >
        <div
          className="
            w-full sm:w-[480px]
            bg-[#1F1F1F]
            border border-[#2E2E2E]
            rounded-2xl
            shadow-2xl shadow-black/40
            p-4 sm:p-8
          "
          data-tour="comandos"
        >
          <h2 className="text-center text-lg sm:text-xl font-bold text-[#D72638] tracking-wide mb-6">
            COMANDOS SIMULADOR MEMORIA
          </h2>

          {/* Grid plano de 2 columnas */}
          <div className="grid grid-cols-2 gap-3">
            {allCommands.map((cmd) => (
              <motion.button
                key={cmd.title}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setSelected(cmd)}
                className="
                  text-xs sm:text-sm md:text-base
                  font-semibold
                  text-[#E0E0E0]
                  bg-[#2B2B2B]
                  border border-[#3A3A3A]
                  hover:border-[#D72638] hover:text-[#D72638]
                  rounded-full
                  px-3 py-2
                  transition-all
                  shadow-sm hover:shadow-md
                "
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
              className="bg-[#1F1F1F] w-[90%] max-w-md max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl shadow-2xl border border-[#2E2E2E]"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#D72638] mb-6 text-center tracking-wide">
                {selected.title.toUpperCase()}
              </h3>
              <div className="space-y-6 text-sm sm:text-base text-[#CCCCCC]">
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">
                    🧠 Funcionalidad:
                  </h4>
                  {renderWithLineBreaks(selected.description)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">
                    📌 Estructura:
                  </h4>
                  {renderWithLineBreaks(selected.estructura)}
                </div>
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">
                    🛠️ Ejemplo:
                  </h4>
                  {renderWithLineBreaks(selected.ejemplo)}
                </div>
              </div>
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(null)}
                  className="bg-[#D72638] hover:bg-[#c41f30] text-white font-bold text-sm sm:text-base px-6 py-2 rounded-full shadow-lg"
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

// Función de renderizado de líneas (igual que antes)
function renderWithLineBreaks(text: string) {
  return text.split("\n").map((line, idx) => {
    if (line.startsWith("->")) {
      return (
        <p key={idx} className="flex items-start gap-1">
          <span className="mt-0.5">➡️</span>
          <span>{line.slice(2).trim()}</span>
        </p>
      );
    }
    return (
      <p key={idx} className="mt-1">
        {line}
      </p>
    );
  });
}
