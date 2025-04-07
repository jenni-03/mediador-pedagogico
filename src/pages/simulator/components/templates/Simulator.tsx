import { ConsoleComponent } from "../atoms/ConsoleComponent";
import { DataStructureInfo } from "../atoms/DataStructureInfo";
import { GroupCommandsComponent } from "../molecules/GroupCommandsComponent";
import { SimulatorProps } from "../../../../types";
import { useRef, useState } from "react";
import { commandsData } from "../../../../shared/constants/commandsData";
import { operations_pseudoCode } from "../../../../shared/constants/pseudoCode";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { Header } from "../molecules/Header";
import CustomTour, { TourType } from "../../../../shared/tour/CustomTour";

export function Simulator<T extends string>({
    structureName,
    structure,
    actions,
    error,
    children,
}: SimulatorProps<T>) {
    // Estado para el manejo de la visualización del código
    const [executionCode, setExecutionCode] = useState<string[]>([]);

    // Estado para el manejo de la visualización de la asignación de memoria
    const [memoryCode, setMemoryCode] = useState(false);

    // Estado para el manejo de la animación
    const { setIsAnimating } = useAnimation();

    // Botones de comandos propios de la estructura
    const buttons = commandsData[structureName].buttons;

    // Pseudocódigo de las operaciones de la estructura
    const operations_code = operations_pseudoCode[structureName];

    // Referencia al elemento de consola
    const consoleRef = useRef<HTMLDivElement>(null);

    const handleCommand = (command: string[], isValid: boolean) => {
        if (!isValid) {
            if (consoleRef.current) {
                requestAnimationFrame(() => {
                    consoleRef.current!.scrollTop =
                        consoleRef.current!.scrollHeight;
                });
            }
            return;
        }

        const action = command[0];
        const values = command.slice(1).map(Number);

        if (action !== "create" && action !== "clean") {
            setIsAnimating(true);
        }

        if (values.length === 2) {
            (actions as any)?.[action]?.(values[0], values[1]); // Llama con dos parámetros
        } else if (values.length === 1) {
            (actions as any)?.[action]?.(values[0]); // Llama con un parámetro
        } else {
            (actions as any)?.[action]?.(); // Llama sin parámetros
        }

        setExecutionCode(
            operations_code[action as keyof typeof operations_code]
        );

        if (action === "create") {
            setMemoryCode(true);
        } else {
            setMemoryCode(false);
        }

        if (consoleRef.current) {
            requestAnimationFrame(() => {
                consoleRef.current!.scrollTop =
                    consoleRef.current!.scrollHeight;
            });
        }
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-br from-[#0E0E11] to-[#0A0A0D] text-[#E0E0E0] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40">
                <div className="flex flex-col gap-6 w-full">
                    {/* Título */}
                    <h1
                        data-tour="structure-title"
                        className="text-2xl sm:text-4xl font-extrabold text-center uppercase tracking-wide bg-gradient-to-br from-[#E0E0E0] to-[#A0A0A0] text-transparent bg-clip-text drop-shadow-[0_2px_6px_rgba(215,38,56,0.5)] mt-2 mb-6"
                    >
                        {structureName.toUpperCase()}{" "}
                        <span className="text-[#D72638]">&lt;Integer&gt;</span>
                    </h1>
                    {/* Contenedor principal */}
                    <div className="w-full bg-[#1A1A1F] border border-[#2E2E2E] rounded-2xl shadow-xl shadow-black/40 px-4 py-6">
                        <div className="flex flex-col xl:flex-row gap-6 mb-6 overflow-hidden">
                            {/* Estructura */}
                            <div
                                id="main-container"
                                className="flex-[2] flex flex-col lg:flex-row lg:space-x-4 rounded-xl space-y-3 overflow-hidden"
                            >
                                <DataStructureInfo
                                    structure={structureName}
                                    structurePrueba={structure}
                                    memoryAddress={memoryCode}
                                >
                                    {children}
                                </DataStructureInfo>
                            </div>
                            {/* Código de ejecución */}
                            <div className="w-full lg:w-[40%] flex flex-col">
                                <span className="text-center font-semibold rounded-xl bg-[#1F1F22] text-[#E0E0E0] border border-[#2E2E2E] mb-3 px-3 py-1">
                                    CÓDIGO DE EJECUCIÓN
                                </span>
                                <div
                                    data-tour="execution-code"
                                    className="flex-1 bg-[#1F1F22] rounded-xl p-4 overflow-auto border border-[#2E2E2E] scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent"
                                >
                                    <pre className="font-mono text-sm py-2 px-4 whitespace-pre rounded-md text-[#A0A0A0]">
                                        {executionCode.map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        {/* Consola + comandos */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            {/* Consola */}
                            <div
                                ref={consoleRef}
                                className="flex-1 bg-[#101014] border border-[#2E2E2E] rounded-2xl px-4 py-2 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent"
                            >
                                <ConsoleComponent
                                    structureType={structureName}
                                    onCommand={handleCommand}
                                    error={error}
                                />
                            </div>
                            {/* Comandos */}
                            <div className="sm:w-[40%]">
                                <GroupCommandsComponent buttons={buttons} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <CustomTour tipo={structureName as TourType} />
        </>
    );
}
