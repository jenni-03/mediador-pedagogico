import Simulador from "../../../../shared/utils/RAM/Simulador";

interface StateComponentProps {
    stateInfo: string;
}

export function StateComponent({ stateInfo = "{}" }: StateComponentProps) {
    const sim = Simulador.getInstance();
    let parsedData: Record<string, any> = {};

    try {
        parsedData = JSON.parse(stateInfo); 
    } catch (error) {
        console.error("Error al analizar el estado de memoria:", error);
        parsedData = {};
    }

    const entries = Object.entries(parsedData);

    return (
        <div className="w-full flex justify-end px-4 sm:pr-12 mt-4 sm:mt-[-240px] mb-8">
            {/* Contenedor del segmento de memoria con tamaño fijo */}
            <div className="relative w-full sm:w-[71%] max-w-screen-sm h-[240px] bg-gray-900 text-green-300 p-4 font-mono border-4 border-green-600 rounded-lg shadow-lg flex flex-col ml-auto">
                
                {/* Título */}
                <h2 className="text-center text-lg font-bold text-yellow-400 mb-2">SEGMENTO DE MEMORIA</h2>

                {/* Grid de memoria con scroll cuando sea necesario */}
                <div
                    className="flex-1 overflow-y-auto scrollbar-none overscroll-contain touch-auto grid grid-cols-4 gap-2 p-2"
                >
                    {entries.length > 0 ? (
                        entries.map(([address, value], index) => {
                            let displayValue = value;

                            if (Array.isArray(value)) {
                                displayValue = value.map(addr => sim.getValue(addr));
                            }

                            return (
                                <div
                                    key={index}
                                    className="bg-green-800 border-2 border-green-500 p-2 rounded-md text-center shadow-md flex flex-col justify-between min-w-[80px] max-w-[150px]"
                                >
                                    <p className="text-blue-300 text-xs font-bold">{address}</p>
                                    <p className="text-white text-sm mt-1 break-words text-wrap max-h-16 overflow-y-auto">
                                        {JSON.stringify(displayValue) || "N/A"}
                                    </p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-4 text-center text-gray-400">Segmento vacío</div>
                    )}
                </div>

                {/* Pines FIJOS */}
                <div className="sticky bottom-0 left-0 w-full bg-gray-900 flex justify-center py-1">
                    <div className="w-[95%] h-4 bg-yellow-500 flex justify-between px-1 rounded-sm shadow-md">
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                        <div className="w-2 h-4 bg-yellow-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
