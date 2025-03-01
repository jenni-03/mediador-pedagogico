import { ConsoleComponent } from "./components/ConsoleComponent";
import { DataStructureInfo } from "./components/DataStructureInfo";
import { GroupCommandsComponent } from "./components/GroupCommandsComponent";
import { SimulatorProps } from "../../types";
import { useEffect, useState } from "react";

export function Simulator({ actions, error, children }: SimulatorProps) {
    //const nombre = conceptosData[estructura].nombre;
    const [visibleError, setVisibleError] = useState(error);

    useEffect(() => {
        if (error) {
            setVisibleError(error);
            const timer = setTimeout(() => {
                setVisibleError(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const buttons = [
        { label: "Create", tooltip: "Crear un nodo..." },
        { label: "Insert", tooltip: "Insertar un nodo..." },
        { label: "Delete", tooltip: "Borrar un nodo..." },
        { label: "Edit", tooltip: "Editar el nodo..." },
        { label: "Search", tooltip: "Buscar el nodo..." },
        { label: "Clear", tooltip: "Borrar el nodo..." },
    ];

    // Llama a la operación a realizar en la estructura de datos
    const handleCommand = (command: string) => {
        const parts = command.trim().split(/\s+/);
        const keyword = parts[0]?.toLowerCase();
        const value = Number(parts[1]);
        switch (keyword) {
            case "create":
                actions.create(value);
                break;
            case "insert":
                actions.insert(value);
                break;
            case "delete":
                actions.remove(value);
                break;
            case "search":
                actions.search(value);
                break;
            case "clean":
                actions.clear();
                break;
            case "update":
                console.log("El comando 'update' aún no está implementado.");
                break;
            default:
                break;
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div>
                <h1 className="font-bold text-3xl text-center mt-2">
                    {"secuencia".toUpperCase()}
                </h1>
            </div>
            <div className="flex-1 bg-gray-200 mx-6 my-3 flex flex-col rounded-xl px-3 overflow-hidden">
                <div className="flex-[2] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4">
                    <DataStructureInfo>{children}</DataStructureInfo>
                    {/* Muestra los comandos */}
                    <div className="flex-[1] flex items-center flex-col rounded-xl">
                        <span
                            className="w-full text-center font-medium rounded-2xl border-2 border-gray-300 bg-gray-100 mb-3 px-3 py-1 
                shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff]"
                        >
                            COMANDOS DISPONIBLES
                        </span>
                        <GroupCommandsComponent buttons={buttons} />
                    </div>
                </div>
                <div className="flex-[1] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4 overflow-hidden">
                    <div className=" flex-1 bg-gray-900 mr-2 rounded-xl p-1 overflow-y-auto">
                        <ConsoleComponent
                            structureType="secuencia"
                            onCommand={handleCommand}
                        />
                        {/* Muestra el error si existe */}
                        {error && (
                            <div className="text-red-500 font-bold text-center mb-3">
                                {visibleError}
                            </div>
                        )}
                    </div>
                    {/* SEPARAR EN UN COMPONENTE */}
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
