import { CardListProps } from "../../../types";
import { Card } from "./Card";
import { useFilteredCard } from "../hooks/useFilteredCard";
import { AnimatePresence, motion } from "framer-motion";

export function CardList({ data, filter }: CardListProps) {
  const filteredData = useFilteredCard(data, filter);

  return (
    <div className="max-w-[1400px] w-full px-6 py-8 grid grid-cols-auto-fit-400 justify-items-center gap-8 mx-auto min-h-[400px]">
      <AnimatePresence mode="sync">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut",
              }}
            >
              <Card
                title={item.title}
                id={item.id}
                img={item.img}
                type={item.type}
                bgCard={item.bgCard}
                bgButton={item.bgButton}
                toConceptos={item.toConceptos}
                toPracticar={item.toPracticar}
              />
            </motion.div>
          ))
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center col-span-full"
          >
            <p className="text-gray-400 text-lg font-medium">
              No se encontraron resultados. <br />
              <span className="text-red-500 font-semibold">
                Intenta con otro término.
              </span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
