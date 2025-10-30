import { motion } from "framer-motion";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  content: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, content }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden"; // bloqueo en <html>
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#222] border border-red-600/40 rounded-2xl shadow-xl relative 
                   max-w-3xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg"
        >
          ✕
        </button>

        {/* Título */}
        <h2 className="text-2xl font-bold text-white mb-4 px-8 pt-8">
          {title}
        </h2>

        {/* Contenido */}
        <div className="px-8 pb-8 overflow-y-auto text-gray-300 text-sm space-y-3 scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent">
          {content}
        </div>
      </motion.div>
    </div>
  );
}
