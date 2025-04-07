import { useState } from "react";
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

  return (
    <CustomModal
      title={title.toUpperCase()}
      description={description}
      structure={estructura}
      example={ejemplo}
      onClose={() => setIsActive(false)}
    >
      <motion.div
        onClick={() => setIsActive(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.1 }}
        className={`flex items-center justify-center px-5 py-2 text-sm sm:text-base font-bold tracking-wide rounded-full border transition-all duration-300 cursor-pointer
    ${
      isActive
        ? "bg-[#292944] border-[#4f4f78] text-[#A0A0FF] shadow-lg ring-2 ring-[#6366f1]/40"
        : "bg-[#ff2323] border-[#3C3C5C] text-[#F0F0F0] hover:bg-[#ff3e38] hover:text-white hover:ring-1 hover:ring-[#6366f1]/20 hover:shadow-md"
    }`}
      >
        {title}
      </motion.div>
    </CustomModal>
  );
}
