import { CardData } from "../../types";

export function Card({
    bgCard,
    img,
    title,
    bgButton,
    toConceptos,
    toPracticar,
}: CardData) {
    return (
        <div
            style={{ backgroundColor: bgCard }}
            className="rounded-2xl text-white w-[21rem] p-6 flex flex-col gap-4 items-center justify-center"
        >
            <h3 className="font-bold text-xl">{title}</h3>
            <img
                className="rounded-2xl object-fill h-44 w-full"
                src={img}
                alt="Imagen de estructura"
            />
            <div className="flex justify-between items-center w-full">
                <button
                    style={{ backgroundColor: bgButton }}
                    className="rounded-full italic  w-24 py-1 text-center shadow-black shadow"
                >
                    Conceptos
                </button>
                <button
                    style={{ backgroundColor: bgButton }}
                    className="rounded-full italic  w-24 py-1 text-center shadow-black shadow"
                >
                    Practicar
                </button>
            </div>
        </div>
    );
}
