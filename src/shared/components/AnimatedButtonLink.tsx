import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AnimatedButtonLinkProps } from "../../types";

export function AnimatedButtonLink({
    bgColor,
    to,
    text,
    params,
}: AnimatedButtonLinkProps) {
    return (
        <Link to={to} params={{ estructura: params }}>
            <motion.button
                style={{ backgroundColor: bgColor }}
                className={`rounded-full italic  w-24 py-1 text-center`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
                {text}
            </motion.button>
        </Link>
    );
}
