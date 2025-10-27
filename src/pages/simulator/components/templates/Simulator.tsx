import { useState } from "react";
import { Header } from "../molecules/Header";
import { ConsoleComponent } from "../atoms/ConsoleComponent";
import { DataStructureInfo } from "../atoms/DataStructureInfo";
import { GroupCommandsComponent } from "../molecules/GroupCommandsComponent";
import { PseudoCodeRunner } from "../atoms/PseudoCodeRunner";
import { commandsData } from "../../../../shared/constants/commandsData";
import { getPseudoCodeByStructure } from "../../../../shared/constants/pseudocode/getPseudoCodeByStructure";
import CustomTour, { TourType } from "../../../../shared/tour/CustomTour";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { SimulatorProps } from "../../../../types";

export function Simulator<T extends string>({
  structureName,
  structureType,
  structure, // instancia de la estructura en memoria.
  actions,
  error, // error proveniente del hook de la estructura.
  children,
}: SimulatorProps<T>) {
  // Código de ejecución a mostrar a la derecha
  const [executionCode, setExecutionCode] = useState<string[]>([]);
  // Flag para mostrar/ocultar bloque de “asignación de memoria”
  const [memoryCode, setMemoryCode] = useState(false);
  // Código de ejecución a mostrar a la derecha
  const [extendedArgsCode, setExtendedArgsCode] = useState<string[]>([]);

  // Control de animaciones globales (evita que el input procese mientras anima)
  const { setIsAnimating } = useAnimation();

  const pageTitle = structureType || structureName;
  const dataSelector = structureName;
  const buttons = commandsData[dataSelector]?.buttons ?? [];
  const operationsCode = getPseudoCodeByStructure(pageTitle);

  const handleCommand = (command: string[], isValid: boolean) => {
    if (!isValid) return;

    // separar acción y argumentos
    const action = command[0];
    const rawArgs = command.slice(1);

    // aplanar si vino como único array: ['insertChild', [1,25,0]] -> [1,25,0]
    const flatArgs =
      rawArgs.length === 1 && Array.isArray(rawArgs[0]) ? rawArgs[0] : rawArgs;

    // setArgsCode(flatArgs);

    const stripQuotes = (v: string) => v.replace(/^['"]|['"]$/g, "");
    const isNumeric = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim());
    const normalizeArg = (v: unknown) => {
      if (typeof v !== "string") return v;
      const s = v.trim();
      if (s === "true") return true;
      if (s === "false") return false;
      if (s === "null") return null;
      if (s === "undefined") return undefined;
      if (
        (s.startsWith("'") && s.endsWith("'")) ||
        (s.startsWith('"') && s.endsWith('"'))
      ) {
        return stripQuotes(s);
      }
      if (isNumeric(s)) return Number(s);
      return s;
    };
    const args = (Array.isArray(flatArgs) ? flatArgs : [flatArgs]).map(
      normalizeArg
    );

    if (action !== "create" && action !== "clean") {
      setIsAnimating(true);
    }

    const fn = (actions as any)?.[action];
    if (typeof fn !== "function") {
      console.warn(`[Simulator] Acción no encontrada: "${action}"`, {
        disponibles: Object.keys(actions || {}),
        command,
      });
    } else {
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

    // actualiza el código a mostrar
    setExecutionCode(
      operationsCode[action as keyof typeof operationsCode] ?? []
    );

    // se decide si mostrar el panel de asignación de memoria
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

    const structurePrueba: any = structure;
    // Combinar los argumentos recibidos con los valores de la estructura
    const extendedArgs = [
      ...flatArgs,
      structurePrueba?.getTamanio?.(),
      structurePrueba?.vector?.length,
      structurePrueba?.getMaxTamanio?.(),
      structurePrueba?.getPeso?.(),
      structurePrueba?.getAltura?.(),
      structurePrueba?.contarHojas?.(),
    ];
    setExtendedArgsCode(extendedArgs);

    console.log(extendedArgs);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-[#0E0E11] to-[#0A0A0D] text-[#E0E0E0] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40">
        <div className="flex w-full flex-col gap-6">
          <h1
            data-tour="structure-title"
            className="mt-2 mb-6 bg-gradient-to-br from-[#E0E0E0] to-[#A0A0A0] bg-clip-text text-center text-2xl font-extrabold uppercase tracking-wide text-transparent sm:text-4xl drop-shadow-[0_2px_6px_rgba(215,38,56,0.5)]"
          >
            {pageTitle.replace(/_/g, " ").toUpperCase()}{" "}
            <span className="text-[#D72638]">&lt;Integer&gt;</span>
          </h1>

          <div className="w-full rounded-2xl border border-[#2E2E2E] bg-[#1A1A1F] px-4 py-6 shadow-xl shadow-black/40">
            <div className="mb-6 flex flex-col gap-6 overflow-hidden lg:flex-row">
              {/* Simulación de la estructura */}
              <div
                id="main-container"
                className="flex flex-[2] flex-col space-y-3 overflow-hidden rounded-xl lg:flex-row lg:space-x-4"
              >
                <DataStructureInfo
                  structure={
                    structureName === "lista_enlazada"
                      ? (structureType as string)
                      : structureName
                  }
                  structurePrueba={structure}
                  memoryAddress={memoryCode}
                >
                  {children}
                </DataStructureInfo>
              </div>

              {/* Código de ejecución */}
              <div className="flex w-full flex-col lg:w-[40%]">
                <span className="mb-3 rounded-xl border border-[#2E2E2E] bg-[#1F1F22] px-3 py-1 text-center font-semibold text-[#E0E0E0]">
                  CÓDIGO DE EJECUCIÓN
                </span>
                <div
                  data-tour="execution-code"
                  className="max-h-[450px] flex-1 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D72638]/60 rounded-xl border border-[#2E2E2E] bg-[#1F1F22] p-4"
                >
                  <PseudoCodeRunner
                    lines={executionCode}
                    args={extendedArgsCode}
                    structurePrueba={structure}
                  />
                </div>
              </div>
            </div>

            {/* Consola + comandos */}
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <ConsoleComponent
                className="flex-1"
                historyMaxHeight={180}
                structureType={structureName} // usa la clave técnica para prefijos/reglas
                onCommand={handleCommand}
                error={error}
                structurePrueba={structure}
              />

              {/* Botones con los comandos */}
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
