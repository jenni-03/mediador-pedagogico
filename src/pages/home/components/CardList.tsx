import { CardListProps } from "../../../types";
import { Card } from "./Card";
import { useFilteredCard } from "../hooks/useFilteredCard";
import { AnimatePresence, motion } from "framer-motion";

export function CardList({ data, filter }: CardListProps) {
  const filteredData = useFilteredCard(data, filter);

  return (
    <main className="max-w-[1400px] w-full px-6 py-8 grid grid-cols-auto-fit-400 justify-items-center gap-8 mx-auto min-h-[400px]">
      <AnimatePresence>
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              id={item.id}
              img={item.img}
              type={item.type}
              bgCard={item.bgCard}
              bgButton={item.bgButton}
              toConceptos={item.toConceptos}
              toPracticar={item.toPracticar}
            />
          ))
        ) : (
          <motion.div
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
    </main>
  );
}
