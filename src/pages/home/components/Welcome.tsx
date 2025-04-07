import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function Welcome() {
  return (
    <div className="w-full min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
      <div className="max-w-[1400px] w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
        {/* Texto principal */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Bienvenidos al{" "}
              <span className="text-red-500">Mediador Pedagógico</span> sobre
            </h1>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-red-500">
              Estructuras de Datos
            </h1>
          </div>

          <p className="text-lg text-gray-300">
            Aquí podrás encontrar dos tipos de simuladores:
          </p>

          {/* Simulador de Memoria */}
          <div className="bg-[#1a1a1a] border border-red-500 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Simulador de Memoria
            </h2>
            <p className="text-gray-300">
              En este simulador aprenderás cómo se manejan las direcciones de
              memoria para todas las variables existentes en Java, permitiéndote
              visualizar cómo se asigna, utiliza y libera la memoria en tiempo
              real.
            </p>

            <Link to="/simulador/memoria">
              <motion.button
                className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ver Simulador
              </motion.button>
            </Link>
          </div>

          {/* Simulador de Estructuras */}
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Simuladores de Estructuras de Datos
            </h2>
            <p className="text-gray-300">
              Este simulador abarca estructuras de datos lineales, árboles
              binarios y árboles n-arios. Podrás aprender cómo funcionan sus
              operaciones más comunes y cómo se almacenan y manipulan en la
              memoria.
            </p>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center items-start lg:self-end">
          <img
            src="/assets/images/logo_ufps.png"
            alt="Logo UFPS"
            className="w-full max-w-sm drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
