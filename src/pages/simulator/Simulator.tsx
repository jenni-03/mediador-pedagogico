import { getRouteApi } from "@tanstack/react-router";
import { ConsoleComponent } from "./components/ConsoleComponent";
import { DataStructureInfo } from "./components/DataStructureInfo";
import { GroupCommandsComponent } from "./components/GroupCommandsComponent";
import { conceptosData } from "../../constants/conceptsData";

export function Simulator() {
    const route = getRouteApi("/simulador/$estructura");
    const { estructura } = route.useParams();
    const nombre = conceptosData[estructura].nombre;

    const buttons = [
        { label: "Insert", tooltip: "Insertar un nodo..." },
        { label: "Delete", tooltip: "Borrar un nodo..." },
        { label: "Create", tooltip: "Crear un nodo..." },
        { label: "Search", tooltip: "Buscar el nodo..." },
        { label: "Edit", tooltip: "Editar el nodo..." },
        { label: "Clear", tooltip: "Borrar el nodo..." }
    ];

    const handleCommand = (command: string) => {
        console.log(`Comando a ejecutar: ${command}`);
        // Añadir lógica para procesar el comando
    };

    return (
        <div className="h-screen flex flex-col">
            <div>
                <h1 className="font-bold text-3xl text-center mt-2">
                    {nombre.toUpperCase()}
                </h1>
            </div>
            <div className="flex-1 bg-gray-200 mx-6 my-3 flex flex-col rounded-xl px-3 overflow-hidden">
                <div className="flex-[2] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4">
                    <DataStructureInfo />
                    {/* Muestra los comandos */}
                    <div className="flex-[1] flex items-center flex-col rounded-xl">
                        <span
                            className="w-full text-center font-medium rounded-2xl border-2 border-gray-300 bg-gray-100 mb-3 px-3 py-1 
                shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff]"
                        >
                            COMANDOS DISPONIBLES
                        </span>
                        <GroupCommandsComponent buttons={buttons}/>
                    </div>
                </div>
                <div className="flex-[1] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4 overflow-hidden">
                    <div className=" flex-1 bg-gray-900 mr-2 rounded-xl p-1 overflow-y-auto">
                        <ConsoleComponent structureType="secuencia" onCommand={handleCommand}/>
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
