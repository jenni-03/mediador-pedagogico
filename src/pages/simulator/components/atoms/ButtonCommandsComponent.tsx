import { useEffect, useRef, useState } from "react";
import { CommandProps } from "../../../../types";
import { CustomModal } from "../molecules/CustomModal";
import { motion } from "framer-motion";

export function ButtonCommandsComponent({
  title,
  description,
  estructura,
  ejemplo,
}: CommandProps) {
  const [isActive, setIsActive] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Detecta si el texto está truncado
  useEffect(() => {
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [title]);

  return (
    <CustomModal
      title={title.toUpperCase()}
      description={description}
      structure={estructura}
      example={ejemplo}
      onClose={() => setIsActive(false)}
    >
      <div className="relative group w-full">
        <motion.div
          ref={textRef}
          onClick={() => setIsActive(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.1 }}
          className={`px-5 py-2 max-w-[150px] text-sm sm:text-base text-center
          font-bold tracking-wide rounded-full border transition-all duration-300 
          cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis 
    ${
      isActive
        ? "bg-[#292944] border-[#4f4f78] text-[#A0A0FF] shadow-lg ring-2 ring-[#6366f1]/40"
        : "bg-[#ff2323] border-[#3C3C5C] text-[#F0F0F0] hover:bg-[#ff3e38] hover:text-white hover:ring-1 hover:ring-[#6366f1]/20 hover:shadow-md"
    }`}
        >
          {title}
        </motion.div>
        {/* Tooltip estilizado solo si el texto sobrepasó el tamaño del botón */}
        {isTruncated && (
          <span
            className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 
              bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-normal max-w-[250px]"
          >
            {title}
          </span>
        )}
      </div>
    </CustomModal>
  );
}
