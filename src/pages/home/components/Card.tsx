import { CardData } from "../../../types";
import { motion } from "framer-motion";
import { AnimatedButtonLink } from "../../../shared/components/AnimatedButtonLink";

export function Card({
    bgCard,
    img,
    title,
    id,
    bgButton,
    toConceptos,
    toPracticar,
}: CardData) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{ backgroundColor: bgCard }}
            className="rounded-2xl w-[21rem] p-4 flex flex-col gap-4 items-center justify-center"
        >
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <img
                className="rounded-2xl object-fill h-44 w-full"
                src={img}
                alt="Imagen de estructura"
            />
            <div className="flex justify-between items-center w-full text-white">
                <AnimatedButtonLink
                    bgColor={bgButton}
                    text={"Conceptos"}
                    to={toConceptos}
                    params={id.toString()}
                />
                <AnimatedButtonLink
                    bgColor={bgButton}
                    text={"Practicar"}
                    to={toPracticar}
                    params={id.toString()}
                />
            </div>
        </motion.div>
    );
}
