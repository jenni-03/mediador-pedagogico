import { infoStructures } from "../../../shared/constants/infoStructures";

export function DataStructureInfo({ children, structure, structurePrueba }: { children: React.ReactNode, structure: string, structurePrueba:any }) {
    const info = infoStructures[structure].info;
    
    return (
        <div className="flex-[4] flex flex-col border-2 border-gray-300 bg-gray-100 rounded-3xl p-4 overflow-auto">
            <div className="ml-auto">
                {info.map((infoKey: string, index: number) => (
                    <h1 key={index} className="font-medium">
                        {`${infoKey.toUpperCase()}: ${
                            infoKey === "Tamaño" ? structurePrueba.getTamanio() :
                            infoKey === "Capacidad" ? structurePrueba.vector.length :
                            "N/A"
                        }`}
                    </h1>
                ))}
            </div>
            <div className="flex-1 flex items-center">{children}</div>
        </div>
    );
}
