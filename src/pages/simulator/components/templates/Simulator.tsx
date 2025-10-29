// src/pages/simulator/components/organisms/Simulator.tsx
import { useEffect, useMemo, useState } from "react";
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
import { createBus } from "../../../../shared/events/eventBus";
import { BusProvider } from "../../../../shared/context/BusProvider";

/**
 * Simulator
 *  - Contenedor principal del simulador por estructura.
 *  - Orquesta: vista de estructura, consola, comandos y pseudocódigo.
 *  - No “encapsula” la consola con otro scroller: la propia consola gestiona su scroll.
 */
export function Simulator<T extends string>({
    structureName, // clave usada en rutas/constantes (p.ej. "arbol_nario")
    structureType, // nombre “humano” cuando aplique (opcional)
    structure, // instancia de la estructura en memoria
    actions, // funciones mutadoras de la estructura
    error, // error proveniente del hook/render de la estructura
    children, // SVG/canvas u otros elementos de la visualización
}: SimulatorProps<T>) {
    /* ─────────────────────────── Estado local ─────────────────────────── */
    // Código de ejecución a mostrar a la derecha
    const [executionCode, setExecutionCode] = useState<string[]>([]);
    // Línea del código a resaltar
    const [currentLine, setCurrentLine] = useState<number | null>(null);
    // Flag para mostrar/ocultar bloque de “asignación de memoria”
    const [memoryCode, setMemoryCode] = useState(false);

    // Control de animaciones globales (evita que el input procese mientras anima)
    const { setIsAnimating } = useAnimation();

    /* ─────────────────────────── Derivados ─────────────────────────── */
    // Instancia propia del bus de eventos
    const bus = useMemo(() => createBus(), []);
    // Título visible
    const pageTitle = structureType || structureName;
    // Selector para constantes (botones, etc.)
    const dataSelector = structureName;
    // Botones propios de la estructura (fallback a [])
    const buttons = commandsData[dataSelector]?.buttons ?? [];
    // Mapa de pseudocódigo para cada operación
    const operationsCode = useMemo(
        () => getPseudoCodeByStructure(pageTitle),
        [pageTitle]
    );
    console.log(operationsCode);

    /* ─────────────────────────── Handler consola ─────────────────────────── */
    const handleCommand = (command: string[], isValid: boolean) => {
        // Si el parser dice que NO es válido, simplemente no ejecutamos nada.
        if (!isValid) return;

        // 1) separar acción y argumentos crudos
        const action = command[0];
        const rawArgs = command.slice(1);

        // 2) aplanar si vino como único array: ['insertChild', [1,25,0]] -> [1,25,0]
        const flatArgs =
            rawArgs.length === 1 && Array.isArray(rawArgs[0])
                ? rawArgs[0]
                : rawArgs;

        // 3) normalización prudente de tipos (booleans, null/undefined, números, strings)
        const stripQuotes = (v: string) => v.replace(/^['"]|['"]$/g, "");
        const isNumeric = (v: string) => /^-?\d+(\.\d+)?$/.test(v.trim());
        const normalizeArg = (v: unknown) => {
            if (typeof v !== "string") return v; // ya tipado: no tocar
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
            return s; // string sin tocar
        };
        const args = (Array.isArray(flatArgs) ? flatArgs : [flatArgs]).map(
            normalizeArg
        );

        // 4) banderín de animación para operaciones que modifican la estructura
        if (action !== "create" && action !== "clean") {
            setIsAnimating(true);
        }

        // 5) ejecutar la acción con spread (...args) — soporta 0..n argumentos
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

        // 6) decidir si mostramos panel de “asignación de memoria”
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
    };

    /* ─────────────────────────── Eventos de código ─────────────────────────── */
    useEffect(() => {
        console.log("Entrando en el hook");
        const offStart = bus.on<{ op: string }>("op:start", ({ op }) => {
            const script = operationsCode[op];
            console.log("SUSCRIPCIÓN");
            setExecutionCode(script.lines);
            setCurrentLine(null);
        });

        const offProgress = bus.on<{ stepId: string; lineIndex: number }>(
            "step:progress",
            ({ lineIndex }) => {
                console.log("PROGRESO");
                setCurrentLine((prev) =>
                    prev === lineIndex ? prev : lineIndex
                );
            }
        );

        const offDone = bus.on("op:done", () => setCurrentLine(null));

        return () => {
            console.log("Limpieza del hook");
            offStart();
            offProgress();
            offDone();
        };
    }, [bus, operationsCode]);

    /* ─────────────────────────── Render ─────────────────────────── */
    return (
        <BusProvider bus={bus}>
            <Header />

            {/* Lienzo general del simulador */}
            <div className="min-h-screen bg-gradient-to-br from-[#0E0E11] to-[#0A0A0D] text-[#E0E0E0] py-6 px-4 sm:px-6 xl:px-10 2xl:px-40">
                <div className="flex w-full flex-col gap-6">
                    {/* Título */}
                    <h1
                        data-tour="structure-title"
                        className="mt-2 mb-6 bg-gradient-to-br from-[#E0E0E0] to-[#A0A0A0] bg-clip-text text-center text-2xl font-extrabold uppercase tracking-wide text-transparent sm:text-4xl drop-shadow-[0_2px_6px_rgba(215,38,56,0.5)]"
                    >
                        {pageTitle.replace(/_/g, " ").toUpperCase()}{" "}
                        <span className="text-[#D72638]">&lt;Integer&gt;</span>
                    </h1>

                    {/* Card principal */}
                    <div className="w-full rounded-2xl border border-[#2E2E2E] bg-[#1A1A1F] px-4 py-6 shadow-xl shadow-black/40">
                        <div className="mb-6 flex flex-col gap-6 overflow-hidden lg:flex-row">
                            {/* Zona de Estructura */}
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

                            {/* Pseudocódigo de ejecución */}
                            <div className="flex w-full flex-col lg:w-[40%]">
                                <span className="mb-3 rounded-xl border border-[#2E2E2E] bg-[#1F1F22] px-3 py-1 text-center font-semibold text-[#E0E0E0]">
                                    CÓDIGO DE EJECUCIÓN
                                </span>
                                <div
                                    data-tour="execution-code"
                                    className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D72638]/60 max-h-[450px] flex-1 overflow-auto rounded-xl border border-[#2E2E2E] bg-[#1F1F22] p-4"
                                >
                                    <PseudoCodeRunner
                                        lines={executionCode}
                                        currentLineIndex={currentLine}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consola + comandos */}
                        <div className="flex w-full flex-col gap-4 sm:flex-row">
                            {/* Consola — SIN wrapper scrolleable: el componente se autogestiona */}
                            <ConsoleComponent
                                className="flex-1"
                                historyMaxHeight={180}
                                structureType={structureName} // usa la clave técnica para prefijos/reglas
                                onCommand={handleCommand}
                                error={error}
                                structurePrueba={structure}
                            />

                            {/* Botonera de comandos */}
                            <div className="sm:w-[40%]">
                                <GroupCommandsComponent buttons={buttons} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tour contextual */}
            <CustomTour tipo={pageTitle as TourType} />
        </BusProvider>
    );
}
