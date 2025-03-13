import { ConsoleComponent } from "./components/ConsoleComponent";
import { DataStructureInfo } from "./components/DataStructureInfo";
import { GroupCommandsComponent } from "./components/GroupCommandsComponent";
import { SimulatorProps } from "../../types";
import { useEffect, useState } from "react";
import { commandsData } from "../../shared/constants/commandsData";
import { operations_pseudoCode } from "../../shared/constants/pseudoCode";

export function Simulator({
    structure: structure,
    actions,
    error,
    children,
}: SimulatorProps) {
    // Estado para el manejo del error
    const [visibleError, setVisibleError] = useState(error);

    // Estado para el manejo de la visualización del código
    const [codigoEjecucion, setCodigoEjecucion] = useState("");

    //ASIGNAR EL NOMBRE DE LA ESTRUCTURA AQUI
    const structureName = "secuencia";
    const buttons = commandsData[structureName].buttons;

    // Pseudocódigo de las operaciones de la estructura
    const operations_code = operations_pseudoCode[structureName];

    useEffect(() => {
        if (error) {
            setVisibleError(error);
            const timer = setTimeout(() => {
                setVisibleError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Llama a la operación a realizar en la estructura de datos
    const handleCommand = (command: string) => {
        const parts = command.trim().split(/\s+/);
        const action = parts[0]?.toLowerCase();
        const values = parts.slice(1).map(Number); // Convierte los valores a números

        if (values.length === 2) {
            (actions as any)?.[action]?.(values[0], values[1]); // Llama con dos parámetros
        } else if (values.length === 1) {
            (actions as any)?.[action]?.(values[0]); // Llama con un parámetro
        } else {
            (actions as any)?.[action]?.(); // Llama sin parámetros
        }

        setCodigoEjecucion(
            operations_code[action as keyof typeof operations_code]
        );
    };

    return (
        <div className="h-screen flex flex-col">
            <div>
                <h1 className="font-bold text-3xl text-center mt-2">
                    {structureName.toUpperCase()}
                </h1>
            </div>
            <div className="flex-1 bg-gray-200 mx-6 my-3 flex flex-col rounded-xl px-3 overflow-hidden">
                <div className="flex-[2] flex flex-col lg:flex-row lg:space-x-4 lg:space-y-0 rounded-xl my-3 mx-3 space-y-3">
                    {/* Muestra la estructura */}
                    <DataStructureInfo
                        structure={structureName}
                        structurePrueba={structure}
                    >
                        {children}
                    </DataStructureInfo>
                    {/* Muestra los comandos */}
                    <GroupCommandsComponent buttons={buttons} />
                </div>
                <div className="flex-[1] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4 overflow-hidden">
                    <div className="flex-1 bg-gray-900 mr-2 rounded-xl p-1 overflow-y-auto">
                        <ConsoleComponent
                            structureType={structureName}
                            onCommand={handleCommand}
                        />
                        {/* Muestra el error si existe */}
                        {error && (
                            <div className="text-red-500 font-bold text-center mb-3">
                                {visibleError}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 border-2 border-gray-300 bg-gray-100 rounded-xl overflow-auto">
                        <h1 className="font-medium text-center mt-2">
                            CÓDIGO DE EJECUCIÓN
                        </h1>
                        <pre className="font-mono text-md py-3 px-6 whitespace-pre rounded-md bg-gray-100">
                            {codigoEjecucion.trim()}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
