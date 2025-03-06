import { ConsoleComponent } from "./components/ConsoleComponent";
import { DataStructureInfo } from "./components/DataStructureInfo";
import { GroupCommandsComponent } from "./components/GroupCommandsComponent";
import { SimulatorProps } from "../../types";
import { useEffect, useState } from "react";
import { commandsData } from "../../shared/constants/commandsData";

export function Simulator({ actions, error, children }: SimulatorProps) {
    const [visibleError, setVisibleError] = useState(error);

    //ASIGNAR EL NOMBRE DE LA ESTRUCTURA AQUI
    const estructura = "secuencia";
    const buttons = commandsData[estructura].buttons;

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
        const value = Number(parts[1]);

        // Ejecutar directamente la acción si existe en actions
        (actions as any)?.[action]?.(value);
    };

    return (
        <div className="h-screen flex flex-col">
            <div>
                <h1 className="font-bold text-3xl text-center mt-2">
                    {estructura.toUpperCase()}
                </h1>
            </div>
            <div className="flex-1 bg-gray-200 mx-6 my-3 flex flex-col rounded-xl px-3 overflow-hidden">
                <div className="flex-[2] flex flex-col lg:flex-row lg:space-x-4 lg:space-y-0 rounded-xl my-3 mx-3 space-y-3">
                    {/* Muestra la estructura */}
                    <DataStructureInfo>{children}</DataStructureInfo>
                    {/* Muestra los comandos */}
                    <GroupCommandsComponent buttons={buttons} />
                </div>
                <div className="flex-[1] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4 overflow-hidden">
                    <div className=" flex-1 bg-gray-900 mr-2 rounded-xl p-1 overflow-y-auto">
                        <ConsoleComponent
                            structureType={estructura}
                            onCommand={handleCommand}
                        />
                        {/* Muestra el error si existe */}
                        {error && (
                            <div className="text-red-500 font-bold text-center mb-3">
                                {visibleError}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 border-2 border-gray-300 bg-gray-100 rounded-xl">
                        <h1 className="font-medium text-center mt-2">
                            CÓDIGO DE EJECUCIÓN
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}