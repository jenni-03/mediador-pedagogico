import { useState, useRef } from "react";
import { ConsoleComponent } from "./components/memory/ConsoleComponent";
import { MemoryScreen } from "./components/memory/MemoryScreen";
import { TitleComponent } from "./components/memory/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola"; 
import { FloatingCommandPanel } from "./components/memory/FloatingCommandPanel";

export function MemorySimulator() {
  const consolaRef = useRef(new Consola());
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [memoryState, setMemoryState] = useState<Record<string, any[]>>({});

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
      <TitleComponent />
      
      <MemoryScreen 
        consolaRef={consolaRef} 
        memoryState={memoryState} 
        setMemoryState={setMemoryState}
      />
      

  <ConsoleComponent 
    onCommand={handleCommand} 
    outputMessage={consoleOutput} 
    isSuccess={isSuccess} 
  />
  
  <FloatingCommandPanel />



    </div>
  );
}
