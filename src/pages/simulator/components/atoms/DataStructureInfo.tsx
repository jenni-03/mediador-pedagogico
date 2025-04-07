import { infoStructures } from "../../../../shared/constants/infoStructures";
import MemoryAllocationVisualizer from "./MemoryAllocationVisualizer";
import { InfoModal } from "../molecules/InfoModal";

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
        <div className="flex-[4] flex flex-col rounded-3xl p-5 bg-[#1F1F22] border border-[#2E2E2E] text-[#E0E0E0] overflow-x-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent">
            <div
                data-tour="structure-info"
                className="flex flex-col md:flex-row gap-4 items-start justify-between"
            >
                {/* Info lateral izquierda en cards */}
                <div className="flex flex-col gap-4 w-full max-w-xs ">
                    {info.map(
                        (
                            item: { key: string; description: string },
                            index: number
                        ) => {
                            const value =
                                item.key === "Tamaño"
                                    ? structurePrueba.getTamanio()
                                    : item.key === "Capacidad"
                                      ? structurePrueba.vector.length
                                      : "N/A";

                            return (
                                <InfoModal
                                    key={index}
                                    title={item.key}
                                    description={item.description}
                                >
                                    <div className="flex items-center justify-between bg-gradient-to-br from-[#2B2B2F] to-[#1F1F22] hover:from-[#35353A] hover:to-[#2A2A2E] transition-all p-4 rounded-2xl shadow-md border border-[#3A3A3A] cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">
                                                {item.key === "Tamaño"
                                                    ? "📏"
                                                    : item.key === "Capacidad"
                                                      ? "📦"
                                                      : "📘"}
                                            </div>
                                            <div>
                                                <p className="text-xs text-[#A0A0A0] uppercase tracking-widest">
                                                    {item.key}
                                                </p>
                                                <h3 className="text-lg font-bold text-[#E0E0E0]">
                                                    {value}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="text-[#D72638] text-sm font-semibold">
                                            Ver más
                                        </span>
                                    </div>
                                </InfoModal>
                            );
                        }
                    )}
                </div>

                {/* Visualización de memoria */}
                <div className="flex-[2]">
                    {memoryAddress && (
                        <MemoryAllocationVisualizer
                            n={structurePrueba.vector.length}
                            direccionBase={structurePrueba.direccionBase}
                            tamanioNodo={structurePrueba.tamanioNodo}
                        />
                    )}
                </div>
            </div>

            {/* Contenido visual (estructura de datos) */}
            <div
                data-tour="main-canvas"
                className="flex-1 flex items-center mt-5"
            >
                {children}
            </div>
        </div>
    );
}
