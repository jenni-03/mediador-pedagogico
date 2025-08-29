import { ConsoleComponent } from "../atoms/ConsoleComponent";
import { DataStructureInfo } from "../atoms/DataStructureInfo";
import { GroupCommandsComponent } from "../molecules/GroupCommandsComponent";
import { SimulatorProps } from "../../../../types";
import { useRef, useState } from "react";
import { commandsData } from "../../../../shared/constants/commandsData";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { Header } from "../molecules/Header";
import CustomTour, { TourType } from "../../../../shared/tour/CustomTour";
import { PseudoCodeRunner } from "../atoms/PseudoCodeRunner";
import { getPseudoCodeByStructure } from "../../../../shared/constants/pseudocode/getPseudoCodeByStructure";

export function Simulator<T extends string>({
  structureName,
  structureType,
  structure,
  actions,
  error,
  children,
}: SimulatorProps<T>) {
  //temporal
  // const structureN = "secuencia";
  // Estado para el manejo de la visualización del código
  const [executionCode, setExecutionCode] = useState<string[]>([]);

  // Estado para el manejo de la visualización de la asignación de memoria
  const [memoryCode, setMemoryCode] = useState(false);

  // Estado para el manejo de la animación
  const { setIsAnimating } = useAnimation();

  // Título de la página del simulador
  const pageTitle = structureType ? structureType : structureName;

  // Elemento para la selección de los datos referentes a la estructura a mostrar
  const dataSelector = structureName;

  // Botones de comandos propios de la estructura
  const buttons = commandsData[dataSelector].buttons;

  // Pseudocódigo de las operaciones de la estructura
  const operations_code = getPseudoCodeByStructure(pageTitle);

  // Referencia al elemento de consola
  const consoleRef = useRef<HTMLDivElement>(null);

  const handleCommand = (command: string[], isValid: boolean) => {
    if (!isValid) {
      if (consoleRef.current) {
        requestAnimationFrame(() => {
          consoleRef.current!.scrollTop = consoleRef.current!.scrollHeight;
        });
      }
      return;
    }

    // 1) separar acción y argumentos crudos
    const action = command[0];
    const rawArgs = command.slice(1);

    // 2) aplanar si vino como único array: ['insertChild', [1,25,0]] -> [1,25,0]
    const flatArgs =
      rawArgs.length === 1 && Array.isArray(rawArgs[0]) ? rawArgs[0] : rawArgs;

    // 3) normalización prudente de tipos (sin romper otras estructuras)
    const stripQuotes = (v: string) => v.replace(/^['"]|['"]$/g, "");
    const isNumeric = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim());
    const normalizeArg = (v: unknown) => {
      if (typeof v !== "string") return v; // ya no es string => se deja igual
      const s = v.trim();
      // booleans
      if (s === "true") return true;
      if (s === "false") return false;
      // null / undefined literales (útil si parseCommand los entrega así)
      if (s === "null") return null;
      if (s === "undefined") return undefined;
      // si viene entre comillas, lo tratamos como string literal
      if (
        (s.startsWith("'") && s.endsWith("'")) ||
        (s.startsWith('"') && s.endsWith('"'))
      ) {
        return stripQuotes(s);
      }
      // números (enteros o decimales)
      if (isNumeric(s)) return Number(s);
      // default: string sin tocar
      return s;
    };

    const args = flatArgs.map(normalizeArg);

    // 4) animación (como ya lo tenías)
    if (action !== "create" && action !== "clean") {
      setIsAnimating(true);
    }

    // 5) ejecutar la acción SIEMPRE con spread (...args) — soporta 0,1,2,3,n
    const fn = (actions as any)?.[action];
    if (typeof fn !== "function") {
      console.warn(`[Simulator] Acción no encontrada: "${action}"`, {
        disponibles: Object.keys(actions || {}),
        command,
      });
    } else {
      // logger compacto y útil
      console.groupCollapsed(
        `[Simulator] ${action}(${args.map((a) => JSON.stringify(a)).join(", ")})`
      );
      console.log("command:", command);
      console.log("rawArgs:", rawArgs);
      console.log("flatArgs:", flatArgs);
      console.log("args(normalized):", args);
      console.groupEnd();

      try {
        fn(...args);
      } catch (e) {
        console.error(`[Simulator] Error ejecutando "${action}"`, e);
      }
    }

    // 6) código de ejecución (igual que antes)
    setExecutionCode(operations_code[action as keyof typeof operations_code]);

    // 7) cuándo mostrar asignación de memoria (igual que antes)
    if (
      action === "create" ||
      action === "push" ||
      action === "enqueue" ||
      action === "insertFirst" ||
      action === "insertLast" ||
      action === "insertAt"
    ) {
      setMemoryCode(true);
    } else {
      setMemoryCode(false);
    }

    if (consoleRef.current) {
      requestAnimationFrame(() => {
        consoleRef.current!.scrollTop = consoleRef.current!.scrollHeight;
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
            {pageTitle.replace(/_/g, " ").toUpperCase()}{" "}
            <span className="text-[#D72638]">&lt;Integer&gt;</span>
          </h1>
          {/* Contenedor principal */}
          <div className="w-full bg-[#1A1A1F] border border-[#2E2E2E] rounded-2xl shadow-xl shadow-black/40 px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-6 mb-6 overflow-hidden">
              {/* Estructura */}
              <div
                id="main-container"
                className="flex-[2] flex flex-col lg:flex-row lg:space-x-4 rounded-xl space-y-3 overflow-hidden"
              >
                <DataStructureInfo
                  structure={
                    structureName === "lista_enlazada"
                      ? structureType!
                      : structureName
                  }
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
                  className="flex-1 bg-[#1F1F22] rounded-xl p-4 max-h-[450px] overflow-auto border border-[#2E2E2E] scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent"
                >
                  <PseudoCodeRunner lines={executionCode} />
                </div>
              </div>
            </div>
            {/* Consola + comandos */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Consola */}
              <div
                ref={consoleRef}
                className="flex-1 bg-[#101014] border border-[#2E2E2E] rounded-2xl px-4 py-2 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent"
                data-tour="console"
              >
                <ConsoleComponent
                  structureType={dataSelector}
                  onCommand={handleCommand}
                  error={error}
                  structurePrueba={structure}
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
      <CustomTour tipo={pageTitle as TourType} />
    </>
  );
}
