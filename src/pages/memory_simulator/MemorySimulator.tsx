import { useState, useRef, useEffect } from "react";
import { ConsoleComponent } from "./components/molecules/ConsoleComponent";
import { MemoryScreen } from "./components/molecules/MemoryScreen";
import { TitleComponent } from "./components/atoms/TitleComponent";
import { Consola } from "../../shared/utils/RAM/Consola";
import { FloatingCommandPanel } from "./components/molecules/FloatingCommandPanel";
import { Header } from "../simulator/components/molecules/Header";
import CustomTour from "../../shared/tour/CustomTour";

export function MemorySimulator() {
  const consolaRef = useRef(new Consola());

  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean>(true);
  const [memoryState, setMemoryState] = useState<Record<string, any[]>>({});
  // Por defecto se muestra el segmento "int"
  const [selectedSegment, setSelectedSegment] = useState<string>("int");

  // Nueva versión de la función para detectar el tipo,
  // sin requerir que empiece con "insert".
  const detectarTipoInsertado = (cmd: string): string | undefined => {
    const trimmed = cmd.trim();
    // Extrae el primer token: ej. "int", "long", "double", etc.
    const match = trimmed.match(/^([a-zA-Z]+)(\[\])?/);
    if (match) {
      let tipo = match[1].toLowerCase();
      if (match[2]) tipo = "array";
      return tipo;
    }
    return undefined;
  };

  const updateMemoryState = (
    newState: Record<string, any[]>,
    tipoInsertado?: string
  ) => {
    setMemoryState(newState);
    // Si se detectó un tipo y hay datos en ese segmento, se actualiza el segmento seleccionado
    if (tipoInsertado && newState[tipoInsertado]?.length > 0) {
      setSelectedSegment(tipoInsertado);
    }
  };

  const handleCommand = (command: string) => {
    try {
      const resultado = consolaRef.current.ejecutarComando(command);
      if (!resultado[0]) {
        setConsoleOutput(resultado[1]);
        setIsSuccess(false);
      } else {
        setConsoleOutput(resultado[1]);
        setIsSuccess(true);
        // Detecta el tipo basándose en el primer token del comando
        const tipo = detectarTipoInsertado(command);
        updateMemoryState(resultado[2], tipo);
      }
    } catch (error) {
      setConsoleOutput(`Error inesperado: ${(error as Error).message}`);
      setIsSuccess(false);
    }
  };

  // Simula que se presiona el botón "limpiar" al iniciar la página (para reiniciar el estado)
  useEffect(() => {
    const limpiarBtn = document.querySelector('[data-tour="limpiar"]');
    if (limpiarBtn instanceof HTMLElement) {
      limpiarBtn.click();
    }
  }, []);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-radial from-[#1A1A1A] to-[#0F0F0F] relative flex flex-col pb-64">
        <TitleComponent />

        <MemoryScreen
          consolaRef={consolaRef}
          memoryState={memoryState}
          setMemoryState={updateMemoryState}
          selectedSegment={selectedSegment}
          setSelectedSegment={setSelectedSegment}
        />

        {/* Contenedor padre para la Consola y el Panel flotante */}
        <div className="
          flex flex-col sm:flex-row
          items-stretch gap-4
          px-4 sm:px-10 mt-6
          h-auto sm:h-96
        ">
          {/* Consola */}
          <div className="w-full sm:w-1/2 h-full">
            <ConsoleComponent
              onCommand={handleCommand}
              outputMessage={consoleOutput}
              isSuccess={isSuccess}
            />
          </div>

          {/* Panel de comandos */}
          <div className="w-full sm:w-1/2 h-full">
            <FloatingCommandPanel />
          </div>
        </div>
      </div>

      <CustomTour tipo="memoria" />
    </>
  );
}
