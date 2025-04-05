import { infoStructures } from "../../../../shared/constants/infoStructures";
import MemoryAllocationVisualizer from "./MemoryAllocationVisualizer";

export function DataStructureInfo({
    children,
    structure,
    structurePrueba,
    memoryAddress,
}: {
    children: React.ReactNode;
    structure: string;
    structurePrueba: any;
    memoryAddress?: boolean;
}) {
    const info = infoStructures[structure].info;

    return (
        <div className="flex-[4] flex flex-col bg-[#2a2a40] rounded-3xl p-4 overflow-auto shadow-lg border border-gray-600 text-white">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Visualización de memoria */}
                {/* {memoryAddress && (
                    <MemoryAllocationVisualizer
                        n={structurePrueba.vector.length}
                        direccionBase={structurePrueba.direccionBase}
                        tamanioNodo={structurePrueba.tamanioNodo}
                    />
                )} */}

                {/* Info de la estructura */}
                <div className="ml-auto flex flex-col items-end h-full">
                    {info.map((infoKey: string, index: number) => (
                        <h1
                            key={index}
                            className="font-medium text-right text-sm text-white"
                        >
                            <span>{infoKey.toUpperCase() + ": "}</span>
                            {infoKey === "Tamaño"
                                ? structurePrueba.getTamanio()
                                : infoKey === "Capacidad"
                                  ? structurePrueba.vector.length
                                  : "N/A"}
                        </h1>
                    ))}
                </div>
            </div>

            {/* <div className="flex-1 flex items-center mt-4">{children}</div> */}
            <div className="flex-1 flex items-center mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-white scrollbar-track-transparent">
                {children}
            </div>
        </div>
    );
}
