import { useState } from "react";
import { ConsoleComponent } from "./components/memory/ConsoleComponent";
import { ScreenComponent } from "./components/memory/ScreenComponent";
import { StateComponent } from "./components/memory/StateComponent";
import { BackgroundEffect } from "./components/memory/Background";
import { TitleComponent } from "./components/memory/TitleComponent";
import Simulador from "../../shared/utils/RAM/Simulador";

export function MemorySimulator() {
    const sim = Simulador.getInstance();
    const [screenMessage, setScreenMessage] = useState("Estado de la memoria: Vacía");
    const [stateInfo, setStateInfo] = useState("Memoria sin datos.");
    const [segmentInfo, setSegmentInfo] = useState("Segmento vacío.");

    const handleCommand = (command: string) => {
        console.log(`Comando recibido: ${command}`);
        
        try {
            const { estadoMemoria, segmentoMemoria, descripcion } = sim.allocateWithDetails(command);
            
            setScreenMessage(JSON.stringify(estadoMemoria, null, 2)); // Estado completo en ScreenComponent
            setStateInfo(JSON.stringify(segmentoMemoria, null, 2)); // Segmento de memoria en StateComponent
        } catch (error) {
            setScreenMessage(`Error: ${(error as Error).message}`);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent relative">
            <BackgroundEffect /> 

            <TitleComponent />

            {/* 🔹 Estado completo de la memoria en ScreenComponent */}
            <ScreenComponent content={screenMessage} />

            <ConsoleComponent onCommand={handleCommand} />

            {/* 🔹 Segmento específico en StateComponent */}
            <StateComponent stateInfo={stateInfo} />
        </div>
    );
}
