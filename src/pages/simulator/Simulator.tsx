import { ConsoleComponent } from "./components/ConsoleComponent";
import { GroupCommandsComponent } from "./components/GroupCommandsComponent";

export function Simulator() {
    // const route = getRouteApi("/simulador/$estructura");
    // const { estructura } = route.useParams();
    const buttonsLeft = [
        { label: "Insert", tooltip: "Insertar un nodo..." },
        { label: "Delete", tooltip: "Borrar un nodo..." },
        { label: "Create", tooltip: "Crear un nodo..." },
    ];

    const buttonsRight = [
        { label: "Search", tooltip: "Buscar el nodo..." },
        { label: "Edit", tooltip: "Editar el nodo..." },
        { label: "Clear", tooltip: "Borrar el nodo..." },
    ];

    return (
        <div className="h-screen flex flex-col">
            <div>
                <h1 className="font-bold text-3xl text-center mt-2">
                    NOMBRE ESTRUCTURA
                </h1>
            </div>
            <div className="flex-1 bg-gray-200 mx-6 my-3 flex flex-col rounded-xl px-3">
                <div className="flex-[2] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* SEPARAR EN UN COMPONENTE */}
                    <div className="flex-[4] flex flex-row border-2 border-gray-300 bg-gray-100 rounded-3xl p-4">
                        <div className="flex-[5]"></div>
                        <div className="flex-[1] mt-2">
                            <h1 className="font-medium">TAMAÑO: </h1>
                            <h1 className="font-medium">CAPACIDAD: </h1>
                        </div>
                    </div>
                    {/* Muestra los comandos */}
                    <div className="flex-[1] flex items-center flex-col rounded-xl">
                        <span
                            className="w-full text-center font-medium rounded-2xl border-2 border-gray-300 bg-gray-100 mb-3 px-3 py-1 
                shadow-[6px_6px_10px_#b8b8b8,-6px_-6px_10px_#ffffff]"
                        >
                            COMANDOS DISPONIBLES
                        </span>
                        <div className="flex flex-row justify-between w-full">
                            <GroupCommandsComponent buttons={buttonsLeft} />
                            <GroupCommandsComponent buttons={buttonsRight} />
                        </div>
                    </div>
                </div>
                <div className="flex-[1] flex flex-col sm:flex-row justify-center sm:justify-start rounded-xl my-3 mx-3 space-y-3 sm:space-y-0 sm:space-x-4 overflow-hidden">
                {/* <div className="flex-[1] flex flex-col sm:flex-row rounded-xl mb-3 mx-3 overflow-hidden"> */}
                    <div className=" flex-1 bg-gray-900 mr-2 rounded-xl p-1 overflow-y-auto">
                        <ConsoleComponent></ConsoleComponent>
                    </div>
                    {/* SEPARAR EN UN COMPONENTE */}
                    <div className="flex-1 border-2 border-gray-300 bg-gray-100 ml-2 rounded-xl shadow-[6px_6px_10px_#b8b8b8]">
                        <h1 className="font-medium text-center mt-2">
                            CÓDIGO DE EJECUCIÓN
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
