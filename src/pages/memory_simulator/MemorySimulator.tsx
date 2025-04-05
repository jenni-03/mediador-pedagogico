import { useState, useRef } from "react";
import { ConsoleComponent } from "./components/molecules/ConsoleComponent";
import { MemoryScreen } from "./components/molecules/MemoryScreen";
import { TitleComponent } from "./components/atoms/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola";
import { FloatingCommandPanel } from "./components/molecules/FloatingCommandPanel";
import { Header } from "../simulator/components/molecules/Header";

export function MemorySimulator() {
  const consolaRef = useRef(new Consola());

  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [memoryState, setMemoryState] = useState<Record<string, any[]>>({});
  const [selectedSegment, setSelectedSegment] = useState<string>("int");

  // 🔍 Detecta tipo desde el comando "insert"
  const detectarTipoInsertado = (cmd: string): string | undefined => {
    const match = cmd.match(/^insert\s+([a-zA-Z]+)(\[\])?/);
    if (match) {
      let tipo = match[1].toLowerCase();
      if (match[2]) tipo = "array";
      if (tipo === "object") return "object";
      return tipo;
    }
    return undefined;
  };

  // ✅ Función para actualizar la memoria y seleccionar segmento automáticamente
  const updateMemoryState = (newState: Record<string, any[]>, tipoInsertado?: string) => {
    setMemoryState(newState);
    if (tipoInsertado && newState[tipoInsertado]?.length > 0) {
      setSelectedSegment(tipoInsertado);
    }
  };

  // ⚙ Comando desde consola
  const handleCommand = (command: string) => {
    try {
      const resultado = consolaRef.current.ejecutarComando(command);

      if (!resultado[0]) {
        setConsoleOutput(resultado[1]);
        setIsSuccess(false);
      } else {
        setConsoleOutput(resultado[1]);
        setIsSuccess(true);

        const tipo = detectarTipoInsertado(command);
        updateMemoryState(resultado[2], tipo); // 👈 ahora funciona correctamente
      }
    } catch (error) {
      setConsoleOutput(`Error inesperado: ${(error as Error).message}`);
      setIsSuccess(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-radial from-[#1A1A1A] to-[#0F0F0F] relative flex flex-col pb-64">
        <TitleComponent />

        <MemoryScreen
          consolaRef={consolaRef}
          memoryState={memoryState}
          setMemoryState={updateMemoryState} // 👈 usamos la función universal
          selectedSegment={selectedSegment}
          setSelectedSegment={setSelectedSegment}
        />

        <ConsoleComponent
          onCommand={handleCommand}
          outputMessage={consoleOutput}
          isSuccess={isSuccess}
        />

        <FloatingCommandPanel />
      </div>
    </>
  );
}
