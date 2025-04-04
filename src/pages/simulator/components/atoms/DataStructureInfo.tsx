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
        <div className="flex-[4] flex flex-col bg-white rounded-3xl p-4 overflow-auto shadow-lg border border-gray-300">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Sección izquierda (Código de asignación de memoria) */}
                {memoryAddress && (
                    <MemoryAllocationVisualizer
                        n={structurePrueba.vector.length}
                        direccionBase={structurePrueba.direccionBase}
                        tamanioNodo={structurePrueba.tamanioNodo}
                    />
                )}

                {/* Sección derecha (Info de estructura) */}
                <div className="ml-auto flex flex-col items-end h-full">
                    {info.map((infoKey: string, index: number) => (
                        <h1
                            key={index}
                            className="font-medium text-right text-md"
                        >
                            {`${infoKey.toUpperCase()}: ${
                                infoKey === "Tamaño"
                                    ? structurePrueba.getTamanio()
                                    : infoKey === "Capacidad"
                                      ? structurePrueba.vector.length
                                      : "N/A"
                            }`}
                        </h1>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex items-center">{children}</div>
        </div>
    );
}
