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
      whileHover={{
        scale: 1.02,
        boxShadow: `
          0 0 15px ${bgCard}cc,
          0 0 30px ${bgCard}99,
          0 0 60px ${bgCard}66
        `,
      }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: "#1e1e1e",
        boxShadow: `
          0 0 10px ${bgCard}88,
          0 0 20px ${bgCard}44
        `,
      }}
      className="rounded-2xl w-[21rem] min-h-[24rem] p-5 flex flex-col gap-5 items-center justify-between border border-white/10 transition-all duration-300"
    >
      <h3 className="text-xl font-bold tracking-wide text-white text-center">
        {title.toUpperCase()}
      </h3>

      <img
        className="rounded-xl object-contain h-40 w-full bg-white p-2"
        src={img}
        alt={`Estructura ${title}`}
      />

      <div className="flex justify-between gap-4 w-full">
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
