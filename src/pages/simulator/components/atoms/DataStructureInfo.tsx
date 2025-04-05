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
    <div className="flex-[4] flex flex-col rounded-3xl p-5 bg-[#1F1F22] border border-[#2E2E2E] overflow-auto text-[#E0E0E0]">
      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
        {/* Visualización de memoria (opcional) */}
        {/* {memoryAddress && (
          <MemoryAllocationVisualizer
            n={structurePrueba.vector.length}
            direccionBase={structurePrueba.direccionBase}
            tamanioNodo={structurePrueba.tamanioNodo}
          />
        )} */}

        {/* Info lateral derecha */}
        <div className="ml-auto flex flex-col items-end space-y-1">
          {info.map((infoKey: string, index: number) => (
            <h1
              key={index}
              className="font-semibold text-sm text-[#A0A0A0] text-right"
            >
              <span className="text-[#E0E0E0]">
                {infoKey.toUpperCase() + ": "}
              </span>
              {infoKey === "Tamaño"
                ? structurePrueba.getTamanio()
                : infoKey === "Capacidad"
                ? structurePrueba.vector.length
                : "N/A"}
            </h1>
          ))}
        </div>
      </div>

      {/* Contenido visual (estructura de datos con scroll horizontal) */}
      <div className="flex-1 flex items-center mt-5 overflow-x-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent">
        {children}
      </div>
    </div>
  );
}
