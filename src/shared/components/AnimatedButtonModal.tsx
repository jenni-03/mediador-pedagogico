import { motion } from "framer-motion";
import { AnimatedButtonModalProps } from "../../types";

export function AnimatedButtonModal({
    bgColor,
    text,
    onClick,
}: AnimatedButtonModalProps) {
    return (
        <motion.button
            style={{ backgroundColor: bgColor }}
            className="rounded-2xl text-white w-24 py-1 text-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            onClick={onClick}
        >
            {text}
        </motion.button>
    );
}
