import { CardListProps } from "../../../types";
import { Card } from "./Card";
import { useFilteredCard } from "../hooks/useFilteredCard";
import { AnimatePresence } from "framer-motion";

export function CardList({ data, filter }: CardListProps) {
    const filteredData = useFilteredCard(data, filter);

    return (
        <main className="max-w-[1200px] w-full grid grid-cols-auto-fit-400 m-auto justify-items-center gap-11 py-8">
            <AnimatePresence>
                {filteredData.map((item) => (
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
                ))}
            </AnimatePresence>
        </main>
    );
}
