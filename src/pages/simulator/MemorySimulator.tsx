import { useState, useRef } from "react";
import { ConsoleComponent } from "./components/memory/ConsoleComponent";
import { MemoryScreen } from "./components/memory/MemoryScreen";
import { BackgroundEffect } from "./components/memory/Background";
import { TitleComponent } from "./components/memory/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola"; 

export function MemorySimulator() {
    const consolaRef = useRef(new Consola()); // Instancia única de Consola
    const [consoleOutput, setConsoleOutput] = useState<string>(""); // Mensaje mostrado en la consola
    const [isSuccess, setIsSuccess] = useState<boolean>(true); // Control del color en consola
    const [memoryState, setMemoryState] = useState<Record<string, any[]>>({}); // Estado de la memoria

    const handleCommand = (command: string) => {
    
        try {
            const resultado = consolaRef.current.ejecutarComando(command);

            if (!resultado[0]) {
                setConsoleOutput(resultado[1]); 
                setIsSuccess(false);
            } else {
                setConsoleOutput(resultado[1]); 
                setIsSuccess(true);
                setMemoryState(resultado[2]);
            }
        } catch (error) {
            setConsoleOutput(`Error inesperado: ${(error as Error).message}`);
            setIsSuccess(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent relative">
            <BackgroundEffect />
            <TitleComponent />
            <MemoryScreen 
            consolaRef={consolaRef} 
            memoryState={memoryState} 
            setMemoryState={setMemoryState}
            />
            <ConsoleComponent onCommand={handleCommand} outputMessage={consoleOutput} isSuccess={isSuccess} />
        </div>
    );
}
