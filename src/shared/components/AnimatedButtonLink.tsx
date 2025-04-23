import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AnimatedButtonLinkProps } from "../../types";

export function AnimatedButtonLink({
  to,
  text,
  params,
  bgColor = "#ff0000", // Color para el glow
}: AnimatedButtonLinkProps & { bgColor?: string }) {
  return (
    <Link to={to} params={{ estructura: params }}>
      <motion.button
        className={`
          px-6 py-2 rounded-full font-semibold text-sm uppercase tracking-wide
          bg-[#1e1e1e] text-gray-200
          border-2
          transition-all duration-300 ease-in-out
        `}
        style={{
          borderColor: bgColor,
          boxShadow: `0 0 6px ${bgColor}55, 0 0 12px ${bgColor}33`,
        }}
        whileHover={{
          scale: 1.05,
          backgroundColor: bgColor,
          color: "#fff",
          boxShadow: `0 0 10px ${bgColor}, 0 0 20px ${bgColor}99`,
        }}
        whileTap={{ scale: 0.95 }}
      >
        {text}
      </motion.button>
    </Link>
  );
}
