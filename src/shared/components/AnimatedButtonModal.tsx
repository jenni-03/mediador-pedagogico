import { motion } from "framer-motion";
import { AnimatedButtonLinkProps } from "../../types";

interface AnimatedButtonModalProps extends Omit<AnimatedButtonLinkProps, "to" | "params"> {
    onClick?: () => void;
}

export function AnimatedButtonModal({
    bgColor,
    text,
    onClick,
}: AnimatedButtonModalProps) {
    return (
        <motion.button
            style={{ backgroundColor: bgColor }}
            className="rounded-full italic w-24 py-1 text-center shadow-black shadow"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            onClick={onClick}
        >
            {text}
        </motion.button>
    );
}
