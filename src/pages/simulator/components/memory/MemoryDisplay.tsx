import { PrimitiveMemory } from "./PrimitiveMemory";
import { Consola } from "../../../../shared/utils/RAM/Consola";

interface MemoryDisplayProps {
    segment: string;
    searchTerm: string;
    consolaRef: React.RefObject<Consola>;
    memoryState: Record<string, any[]>; // Ahora recibe el estado de la memoria
}

export function MemoryDisplay({ segment, searchTerm, consolaRef, memoryState }: MemoryDisplayProps) {
    return (
        <div className="w-full h-full flex justify-center items-center">
            {[
                "boolean", "char", "byte", "short", "int", "long", 
                "float", "double", "string"
            ].includes(segment) ? (
                <PrimitiveMemory type={segment} searchTerm={searchTerm} consolaRef={consolaRef} memoryState={memoryState} />
            ) : (
                <p className="text-gray-400 text-lg font-semibold">
                    Seleccione un segmento válido
                </p>
            )}
        </div>
    );
}
