import { motion } from "framer-motion";
import { FaCode, FaGraduationCap } from "react-icons/fa";

export function Welcome() {
    return (
        <div className="mt-20 sm:mt-16 md:mt-12 lg:mt-8 w-full min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center py-10">
            <div className="max-w-[1400px] w-full px-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12 items-center">
                {/* Texto principal */}
                <div className="space-y-8 max-w-2xl mx-auto text-left">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                            Bienvenidos al{" "}
                            <span className="text-red-500">
                                Mediador Pedagógico{" "}
                            </span>
                            sobre
                        </h1>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                            <span className="text-red-500">
                                Estructuras de Datos
                            </span>
                        </h1>
                    </div>

                    <p className="text-lg text-gray-300">
                        Aprende Estructuras de Datos en Java de forma
                        interactiva.
                    </p>

                    <p className="text-lg text-gray-300 mt-8">
                        A continuación, encontrarás enlaces al código fuente en
                        el cuál se basaron las estructuras de datos, y a
                        recursos de aprendizaje adicionales.
                    </p>

                    {/* Botones */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* <motion.a
              href="#documentacion"
              className="w-full px-6 py-3 bg-[#1a1a1a] text-white border-2 border-red-500 rounded-3xl font-semibold shadow-md flex items-center justify-center gap-2 transition-transform"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              Documentación
              <HiOutlineDocumentText size={22} className="text-red-400" />
            </motion.a> */}

                        <motion.a
                            href="https://gitlab.com/estructuras-de-datos/proyecto-seed"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-6 py-3 bg-[#1a1a1a] text-white border-2 border-red-500 rounded-3xl font-semibold shadow-md flex items-center justify-center gap-2 transition-transform"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Código Fuente
                            <FaCode size={20} className="text-red-400" />
                        </motion.a>

                        <motion.a
                            href="https://repositorio.ufps.edu.co/bitstream/handle/ufps/485/SEED.%20A%20software%20tool%20and%20an%20active-learning%20strategy%20for%20data%20structures%20courses.pdf?sequence=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-6 py-3 bg-[#1a1a1a] text-white border-2 border-red-500 rounded-3xl font-semibold shadow-md flex items-center justify-center gap-2 transition-transform"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Learning
                            <FaGraduationCap
                                size={20}
                                className="text-red-400"
                            />
                        </motion.a>
                    </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center items-center lg:self-center">
                    <img
                        src="/assets/images/logo_ufps.png"
                        alt="Logo UFPS"
                        className="w-full max-w-xs drop-shadow-2xl rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}
