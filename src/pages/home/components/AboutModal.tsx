import { Modal } from "./Modal";
import { motion } from "framer-motion";
import { HiOutlineChip } from "react-icons/hi";
import { FaProjectDiagram } from "react-icons/fa";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={
        <div className="space-y-10 text-gray-200 leading-relaxed">
          {/* Encabezado */}
          <div className="space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Equipo de <span className="text-red-500">Desarrollo</span>
            </h1>
            <p className="text-base text-gray-300 max-w-2xl mx-auto">
              A continuación, te presentamos al equipo de desarrollo detrás de
              esta aplicación, junto con el grupo que realizó la versión inicial
              del proyecto Seed, base para las mejoras actuales.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Equipo versión actual */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative group bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-red-600/40 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.18)] transition-all flex flex-col"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative z-10 flex-1 space-y-4">
                <FaProjectDiagram size={36} className="text-red-400" />
                <h2 className="text-xl font-bold text-white">
                  Colaboradores Versión 2.0 SEEDigital
                </h2>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-300 text-sm">Jennifer Salazar</p>
                  <p className="text-gray-300 text-sm">
                    Anderson Efrain Quintero
                  </p>
                  <p className="text-gray-300 text-sm">Jaider Oliveros</p>
                </div>
              </div>
            </motion.div>

            {/* Equipo versión anterior */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="relative group bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-red-600/40 rounded-2xl p-8 shadow-[0_0_20px_rgba(255,0,0,0.18)] transition-all flex flex-col"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="relative z-10 flex-1 space-y-4">
                <HiOutlineChip size={36} className="text-red-400" />
                <h2 className="text-xl font-bold text-white">
                  Colaboradores Versión 1.0
                </h2>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-300 text-sm">Marco Adarme</p>
                  <p className="text-gray-300 text-sm">Wilfred García</p>
                  <p className="text-gray-300 text-sm">Cindy Pabón</p>
                  <p className="text-gray-300 text-sm">Brayan Peñaranda</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      }
    />
  );
}
