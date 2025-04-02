import { useState, useRef } from "react";
import { ConsoleComponent } from "./components/memory/ConsoleComponent";
import { MemoryScreen } from "./components/memory/MemoryScreen";
import { TitleComponent } from "./components/memory/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola"; 
import { FloatingCommandPanel } from "./components/memory/FloatingCommandPanel";

export function MemorySimulator() {
  // Referencia a la consola para ejecutar comandos
  const consolaRef = useRef(new Consola());

  // Estado para salida de consola, estado de éxito y estado de la memoria
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [memoryState, setMemoryState] = useState<Record<string, any[]>>({});

  // Maneja la ejecución de comandos desde la consola
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
    <div className="min-h-[100dvh] bg-gray-140 relative flex flex-col pb-64">
      {/* Título principal del simulador */}
      <TitleComponent />
      
      {/* Pantalla de visualización de la memoria */}
      <MemoryScreen 
        consolaRef={consolaRef} 
        memoryState={memoryState} 
        setMemoryState={setMemoryState}
      />

      {/* Consola de comandos */}
      <ConsoleComponent 
        onCommand={handleCommand} 
        outputMessage={consoleOutput} 
        isSuccess={isSuccess} 
      />

      {/* Panel Comandos */}
      <FloatingCommandPanel />
    </div>
  );
}
