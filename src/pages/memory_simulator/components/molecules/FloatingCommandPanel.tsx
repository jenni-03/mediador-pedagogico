import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { commandsData } from "../../../../shared/constants/commandsData";
import { CommandProps } from "../../../../types";

// Lista de comandos
const comandos: CommandProps[] = commandsData["memoria"].buttons;

/**
 * Renderiza un bloque de texto dividido por '\n':
 * - Si la línea comienza con '->', la reemplaza por '➡️ ' + resto de la línea.
 * - En caso contrario, la muestra tal cual.
 */
function renderWithLineBreaks(text: string) {
  return text.split("\n").map((line, idx) => {
    if (line.startsWith("->")) {
      // Línea con flecha
      return (
        <p key={idx} className="flex items-start gap-1">
          <span className="mt-0.5">➡️</span>
          <span>{line.slice(2).trim()}</span>
        </p>
      );
    } else {
      // Línea normal
      return (
        <p key={idx} className="mt-1">
          {line}
        </p>
      );
    }
  });
}

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
          w-full
          h-auto       /* En móvil, auto */
          sm:h-full    /* En ≥sm, ocupa todo el alto */
          flex
          justify-center sm:justify-end
          mt-4 sm:mt-0
          px-4 sm:px-10
          overflow-visible
        "
      >
        <div
          className="
            w-full
            h-auto sm:h-full
            max-w-md sm:w-[480px]
            bg-[#1F1F1F]
            border border-[#2E2E2E]
            rounded-2xl
            shadow-2xl shadow-black/40
            p-4 sm:p-8
            overflow-auto
          "
          data-tour="comandos"
        >
          <h2
            className="
              text-center
              text-lg sm:text-xl
              font-bold
              text-[#D72638]
              tracking-wide
              mb-4 sm:mb-6
            "
          >
            COMANDOS DEL SIMULADOR DE MEMORIA
          </h2>

          {/* Grilla de botones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {comandos.map((cmd, idx) => (
              <motion.button
                key={idx}
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
                  px-4 py-2 sm:px-5 sm:py-2
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
            className="
              fixed inset-0
              bg-black/40
              backdrop-blur-sm
              z-[10000]
              flex
              items-center
              justify-center
            "
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="
                bg-[#1F1F1F]
                w-[90%]
                max-w-md
                max-h-[80vh]     /* Límite de altura */
                overflow-y-auto  /* Scroll si excede */
                p-6 sm:p-8
                rounded-2xl
                shadow-2xl
                border border-[#2E2E2E]
              "
            >
              <h3 className="
                text-2xl sm:text-3xl
                font-bold
                text-[#D72638]
                mb-4 sm:mb-6
                text-center
                tracking-wide
              ">
                {selected.title.toUpperCase()}
              </h3>

              <div className="space-y-6 text-sm sm:text-base text-[#CCCCCC]">
                {/* Funcionalidad */}
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">🧠 Funcionalidad:</h4>
                  {renderWithLineBreaks(selected.description)}
                </div>

                {/* Estructura */}
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">📌 Estructura del comando:</h4>
                  {renderWithLineBreaks(selected.estructura)}
                </div>

                {/* Ejemplo */}
                <div>
                  <h4 className="font-semibold text-[#E0E0E0] mb-1">🛠️ Ejemplo de uso:</h4>
                  {renderWithLineBreaks(selected.ejemplo)}
                </div>
              </div>

              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(null)}
                  className="
                    bg-[#D72638]
                    hover:bg-[#c41f30]
                    text-white
                    font-bold
                    text-sm sm:text-base
                    px-6 sm:px-8
                    py-2 sm:py-3
                    rounded-full
                    shadow-lg
                  "
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
