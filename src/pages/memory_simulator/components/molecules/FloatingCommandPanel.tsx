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
        className="
          w-full
          h-auto           /* En móvil, auto para que no se recorte */
          sm:h-full        /* A partir de sm, ocupa todo el alto del contenedor padre */
          flex
          justify-center    /* En móvil, centrado */
          sm:justify-end    /* En sm, alineado a la derecha */
          mt-4 sm:mt-0      /* Espacio arriba en móvil, 0 en pantallas mayores */
          px-4 sm:px-10
          overflow-visible  /* Deja que el contenido se expanda si hace falta */
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
            shadow-2xl
            shadow-black/40
            p-4 sm:p-8       /* Menos padding en móvil, más en desktop */
            overflow-auto     /* Scroll interno si excede en pantallas pequeñas */
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
            {comandos.map((cmd: CommandProps, idx: number) => (
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
                p-6 sm:p-8
                rounded-2xl
                shadow-2xl
                w-[90%]
                max-w-md
                border border-[#2E2E2E]
              "
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#D72638] mb-4 sm:mb-6 text-center tracking-wide">
                {selected.title.toUpperCase()}
              </h3>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-[#CCCCCC] leading-relaxed">
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
              <div className="text-center mt-6 sm:mt-8">
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
