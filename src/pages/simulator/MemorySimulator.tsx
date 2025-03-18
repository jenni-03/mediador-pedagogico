import { useState, useRef } from "react";
import { ConsoleComponent } from "./components/memory/ConsoleComponent";
import { ScreenComponent } from "./components/memory/ScreenComponent";
import { StateComponent } from "./components/memory/StateComponent";
import { BackgroundEffect } from "./components/memory/Background";
import { TitleComponent } from "./components/memory/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola"; 

export function MemorySimulator() {
    const consolaRef = useRef(new Consola()); // Instancia única de Consola
    const [consoleOutput, setConsoleOutput] = useState<string>(""); // Mensaje mostrado en la consola
    const [memoryState, setMemoryState] = useState<string>("Memoria sin datos aún."); // Estado de ScreenComponent
    const [globalState, setGlobalState] = useState<string>(""); // Estado de StateComponent
    const [isSuccess, setIsSuccess] = useState<boolean>(true); // Control del color en consola

    const handleCommand = (command: string) => {
        console.log(`Comando recibido: ${command}`);

        try {
            const resultado = consolaRef.current.ejecutarComando(command); 

            if (!resultado[0]) {
                // ❌ Si hay error, mostrarlo en rojo en la consola
                setConsoleOutput(`$ ${command}\n→ ❌ ${resultado[1]}`);
                setIsSuccess(false);
            } else {
                // ✅ Si la primera posición es `true`, manejar según el tamaño del array
                setConsoleOutput(`$ ${command}\n→ ${resultado[1]}`); // Mensaje en la consola
                setIsSuccess(true);
                setMemoryState(resultado[2]); // Mensaje en ScreenComponent

                if (resultado.length === 4) {
                    setGlobalState(resultado[3]); // Mensaje en StateComponent si aplica
                }
            }
        } catch (error) {
            setConsoleOutput(`$ ${command}\n→ Error inesperado: ${(error as Error).message}`);
            setIsSuccess(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent relative">
            <BackgroundEffect />
            <TitleComponent />

            {/* 🔹 Muestra el estado actual de la RAM en ScreenComponent */}
            <ScreenComponent content={memoryState} />

            {/* 🔹 Consola donde se ingresan comandos */}
            <ConsoleComponent onCommand={handleCommand} outputMessage={consoleOutput} isSuccess={isSuccess} />

            {/* 🔹 Estado global si aplica */}
            <StateComponent stateInfo={globalState} />
        </div>
    );
}
