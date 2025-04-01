import { CardListProps } from "../../../types";
import { Card } from "./Card";
import { useFilteredCard } from "../hooks/useFilteredCard";
import { AnimatePresence } from "framer-motion";

export function CardList({ data, filter }: CardListProps) {
    const filteredData = useFilteredCard(data, filter);

    return (
        <main className="max-w-[1200px] w-full grid grid-cols-auto-fit-400 m-auto justify-items-center gap-11 py-2 min-h-[400px] flex items-center justify-center">
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
                    <p className="text-gray-500 text-lg font-semibold text-center">
                        No se encontraron resultados. Intenta con otro término.
                    </p>
                )}
            </AnimatePresence>
        </main>
    );
}
