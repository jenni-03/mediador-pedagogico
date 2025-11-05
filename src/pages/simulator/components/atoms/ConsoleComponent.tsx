// src/pages/simulator/components/atoms/ConsoleComponent.tsx
import { useEffect, useRef, useState } from "react";
import { commandRules } from "../../../../shared/constants/console/commandRules";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { parseCommand } from "../../../../shared/constants/console/parseCommand";
import { CreatedBadge } from "./CreateBadge";

export const structureNames: Record<string, string> = {
    secuencia: "se",
    pila: "pila",
    cola: "cola",
    "cola de prioridad": "colaP",
    tabla_hash: "th",
    lista_enlazada: "le",
    arbol_binario: "arbolBi",
    arbol_binario_busqueda: "arbolBB",
    arbol_avl: "arbolA",
    arbol_rojinegro: "arbolRN",
    arbol_splay: "arbolS",
    arbol_nario: "arbolNario",
    arbol_123: "arbol123",
    arbol_b: "arbolB",
    arbol_b_plus: "arbolBP",
    arbol_heap: "arbolHeap",
};

interface ConsoleComponentProps {
    structureType: string;
    onCommand: (command: string[], isValid: boolean) => void;
    error: { message: string; id: number } | null;
    structurePrueba: any;

    /** (Opcional) Alto máximo del historial (px). Default: 220 */
    historyMaxHeight?: number;
    /** (Opcional) Clases para el contenedor raíz (para layout) */
    className?: string;
}

/**
 * Consola:
 * - Cabecera estilo terminal + badge del objeto creado.
 * - Historial con auto-scroll al final.
 * - Input con prompt `$` y prefijo `slug.` cuando ya existe el objeto.
 * - No bloquea el tour; ↑/↓ recorre historial.
 */
export function ConsoleComponent({
    structureType,
    onCommand,
    error,
    structurePrueba,
    historyMaxHeight = 220,
    className = "",
}: ConsoleComponentProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const [isCreated, setIsCreated] = useState(false);
    const [justCreated, setJustCreated] = useState(false);

    const { isAnimating, setIsAnimating } = useAnimation();
    const inputRef = useRef<HTMLInputElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);

    // Creación implícita por tamaño
    useEffect(() => {
        if (structurePrueba && structurePrueba.getTamanio() > 0 && !isCreated) {
            setIsCreated(true);
            setJustCreated(true);
            const t = setTimeout(() => setJustCreated(false), 1200);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [structurePrueba?.getTamanio()]);

    // Error → historial
    useEffect(() => {
        if (error) {
            setHistory((prev) => [...prev, `Error: ${error.message}`]);
            setIsAnimating(false);
        }
    }, [error?.id, setIsAnimating]);

    // Auto-scroll al final del historial
    useEffect(() => {
        const el = historyRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [history]);

    const structuresRequiringCreate = ["secuencia", "tabla_hash"];

    // Procesador de comandos
    const processCommand = (commandValue: string, _isFromTutorial = false) => {
        if (commandValue.trim().toLowerCase() === "clear") {
            setHistory([]);
            setInput("");
            return;
        }

        const expectedPrefix = structureNames[structureType];
        const parsed = parseCommand(commandValue.trim(), structureType, {
            isCreated,
            expectedPrefix,
            disallowPrefixBeforeCreation: true,
            structurePrueba,
        });

        if ("error" in parsed) {
            onCommand([], false);
            setHistory((prev) => [
                ...prev,
                `$ ${commandValue}`,
                `Error: ${parsed.error}`,
            ]);
            setCommandHistory((prev) => [...prev, commandValue.trim()]);
            setInput("");
            setHistoryIndex(-1);
            return;
        }

        const parts = parsed;
        const validation = commandRules[structureType](parts);

        if (typeof validation === "boolean") {
            if (validation) {
                const cmd = parts[0]?.toLowerCase();
                const needsCreate =
                    structuresRequiringCreate.includes(structureType);

                if (needsCreate && !isCreated && cmd !== "create") {
                    onCommand([], false);
                    setHistory((prev) => [
                        ...prev,
                        `$ ${commandValue}`,
                        "Error: Debe crear la estructura primero con 'create'",
                    ]);
                    setCommandHistory((prev) => [...prev, commandValue.trim()]);
                } else if (needsCreate && isCreated && cmd === "clean") {
                    onCommand(parts, true);
                    setHistory((prev) => [
                        ...prev,
                        `$ ${commandValue}`,
                        "Comando válido, procesando...",
                    ]);
                    setCommandHistory((prev) => [...prev, commandValue.trim()]);
                    setIsCreated(false);
                } else {
                    if (cmd === "create") {
                        setIsCreated(true);
                        setJustCreated(true);
                        setTimeout(() => setJustCreated(false), 1200);
                    }
                    if (isCreated && cmd === "clean") setIsCreated(false);

                    onCommand(parts, true);
                    setHistory((prev) => [
                        ...prev,
                        `$ ${commandValue}`,
                        "Comando válido, procesando...",
                    ]);
                    setCommandHistory((prev) => [...prev, commandValue.trim()]);
                }
            } else {
                onCommand([], false);
                setHistory((prev) => [
                    ...prev,
                    `$ ${commandValue}`,
                    "Error: Comando no válido",
                ]);
                setCommandHistory((prev) => [...prev, commandValue.trim()]);
            }
        } else {
            onCommand([], false);
            setHistory((prev) => [
                ...prev,
                `$ ${commandValue}`,
                `Error: ${validation.message}`,
            ]);
            setCommandHistory((prev) => [...prev, commandValue.trim()]);
        }

        setInput("");
        setHistoryIndex(-1);
    };

    // Enter simulado (tutorial)
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === "Enter" && el.value.trim() !== "" && !e.isTrusted) {
                e.preventDefault();
                e.stopPropagation();
                processCommand(el.value.trim(), true);
                el.value = "";
            }
        };
        el.addEventListener("keydown", handle);
        return () => el.removeEventListener("keydown", handle);
    }, [structureType, history, commandHistory, isCreated]);

    // Navegación ↑/↓ y envío real
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isAnimating) return;
        if (!e.nativeEvent.isTrusted) return;

        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();
            processCommand(input.trim(), false);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? commandHistory.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex =
                    historyIndex === commandHistory.length - 1
                        ? -1
                        : historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(newIndex === -1 ? "" : commandHistory[newIndex]);
            }
        }
    };

    const slug = structureNames[structureType] ?? "se";

    // --- Estado y ejecución por lotes ---
    const [isBatchOpen, setIsBatchOpen] = useState(false);
    const [batchText, setBatchText] = useState("");
    const [queue, setQueue] = useState<string[]>([]);
    const [isRunningBatch, setIsRunningBatch] = useState(false);

    // Runner: procesa 1 comando cuando no hay animación activa
    useEffect(() => {
        if (!isRunningBatch) return;
        if (isAnimating) return;

        // pequeña pausa para permitir pintar líneas previas
        const t = setTimeout(() => {
            if (queue.length > 0) {
                const next = queue[0];
                // dispara el comando como si lo escribiera el usuario
                processCommand(next, false);
                setQueue((q) => q.slice(1));
            } else {
                setIsRunningBatch(false);
            }
        }, 120);
        return () => clearTimeout(t);
    }, [isRunningBatch, isAnimating, queue]);

    return (
        <section
            className={[
                "relative overflow-hidden rounded-2xl",
                "border border-[#2E2E2E] bg-gradient-to-b from-[#141418] to-[#0F0F12] shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
                "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px",
                "before:bg-gradient-to-r before:from-transparent before:via-[#D72638]/70 before:to-transparent",
                className,
            ].join(" ")}
            data-tour="console"
        >
            {/* Header compacto tipo terminal */}
            <header className="flex items-center justify-between gap-3 border-b border-[#2E2E2E] bg-white/[0.04] px-3 py-2">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-white/75">
                        Consola
                    </h3>
                </div>

                <div className="relative flex items-center gap-2">
                    {/* Indicador de cola si hay elementos */}
                    {queue.length > 0 && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/75">
                            Cola: {queue.length}
                        </span>
                    )}

                    {/* Botón Lote */}
                    <button
                        type="button"
                        title="Abrir lote de comandos"
                        aria-label="Abrir lote de comandos"
                        onClick={() => setIsBatchOpen((v) => !v)}
                        className="rounded-md px-2 py-1 text-[12px] text-white/85 ring-1 ring-inset ring-white/10 hover:bg-white/10 focus:outline-none focus:ring-[#D72638]/60"
                    >
                        Lote
                    </button>

                    {isCreated && (
                        <div className="relative">
                            {/* halo de celebración al crear */}
                            {justCreated && (
                                <span className="pointer-events-none absolute -inset-2 rounded-xl bg-[#D72638]/25 animate-ping" />
                            )}
                            <CreatedBadge
                                structureType={structureType}
                                slug={slug}
                                highlight={justCreated}
                            />
                        </div>
                    )}
                </div>
            </header>

            {/* Panel de lote (desplegable) */}
            {isBatchOpen && (
                <div className="mx-3 mt-3 rounded-xl border border-[#2E2E2E] bg-[#0C0C10]/60 p-3">
                    <label className="mb-2 block text-[12px] uppercase tracking-widest text-white/55">
                        Lista de comandos (uno por línea)
                    </label>
                    <textarea
                        value={batchText}
                        onChange={(e) => setBatchText(e.target.value)}
                        placeholder={`create(5);\npush(10);\npush(20);\nget();`}
                        rows={4}
                        className="w-full resize-y rounded-lg border border-white/10 bg-[#0B0B10] p-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:ring-2 focus:ring-[#D72638]/40"
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-white/45">
                            {queue.length > 0
                                ? `En cola: ${queue.length}`
                                : "Cola vacía"}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const lines = batchText
                                        .split("\n")
                                        .map((l) => l.split("//")[0].trim())
                                        .filter(Boolean);
                                    if (lines.length === 0) return;
                                    setQueue((q) => [...q, ...lines]);
                                    setBatchText("");
                                    setIsBatchOpen(false);
                                    setIsRunningBatch(true);
                                }}
                                className="rounded-md bg-[#D72638]/80 px-3 py-1 text-sm text-white hover:bg-[#D72638] focus:outline-none focus:ring-2 focus:ring-[#D72638]/60"
                            >
                                Aceptar y ejecutar
                            </button>

                            <button
                                type="button"
                                onClick={() => setQueue([])}
                                disabled={queue.length === 0}
                                className="rounded-md px-3 py-1 text-sm text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/10 focus:outline-none focus:ring-[#D72638]/60 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Vaciar cola
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial con patrón sutil y auto-scroll */}
            <div
                ref={historyRef}
                className={[
                    "relative overflow-auto px-4 py-3 text-[13px] leading-6",
                    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D72638]/50",
                    "bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]",
                    "bg-[size:16px_16px] bg-[position:0_0]",
                ].join(" ")}
                style={{ maxHeight: historyMaxHeight }}
                aria-live="polite"
            >
                {/* Banner sticky: recordatorio de prefijo */}
                {isCreated && (
                    <div className="sticky -top-2 z-10 -mx-4 mb-2 px-4">
                        <div className="flex items-center justify-center gap-2 rounded-md border border-white/10 bg-[#0B0B10]/80 px-3 py-1.5 backdrop-blur">
                            <span className="text-[11px] uppercase tracking-widest text-white/50">
                                Objeto creado
                            </span>
                            <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-[12px] text-white/90">
                                {slug}
                            </code>
                            <span className="text-[11px] text-white/45">
                                — usa <b className="font-mono">{slug}.</b> antes
                                de tus comandos
                            </span>
                        </div>
                    </div>
                )}

                {history.length === 0 ? (
                    <p className="select-none text-white/45">
                        Escribe un comando y presiona Enter…
                    </p>
                ) : (
                    history.map((cmd, i) => (
                        <div
                            key={i}
                            className={
                                cmd.startsWith("Error:")
                                    ? "text-red-400"
                                    : cmd === "Comando válido, procesando..."
                                      ? "text-[#7DB6FF]"
                                      : "text-[#E6E6E6]"
                            }
                        >
                            {cmd}
                        </div>
                    ))
                )}

                {/* Overlay central reducido y sin recorte (hermano del historial) */}
                {isCreated && justCreated && (
                    <div className="pointer-events-none absolute inset-x-4 top-1/2 z-30 -translate-y-1/2">
                        <div className="pointer-events-auto relative mx-auto w-[min(92%,20rem)] rounded-xl border border-[#D72638]/40 bg-[#0B0B10]/90 px-4 py-3 text-center shadow-lg backdrop-blur-md">
                            {/* Glow sutil */}
                            <div className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-r from-[#D72638]/25 via-transparent to-[#D72638]/25 blur-lg" />
                            <div className="relative">
                                <p className="text-[10px] uppercase tracking-widest text-[#D72638]/90">
                                    Objeto creado
                                </p>
                                <h4 className="mt-0.5 text-lg font-extrabold tracking-tight">
                                    <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                                        {structureType
                                            .replace(/_/g, " ")
                                            .toUpperCase()}
                                    </span>
                                </h4>
                                <p className="mt-0.5 font-mono text-[12px] text-white/90">
                                    <span className="opacity-70">
                                        prefijo:&nbsp;
                                    </span>
                                    {slug}.
                                </p>
                            </div>
                            {/* halo animado compacto */}
                            <span className="pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-xl ring-1 ring-[#D72638]/40" />
                        </div>
                    </div>
                )}
            </div>

            {/* Command bar: input + controles integrados */}
            <footer className="relative border-t border-[#2E2E2E] px-3 py-2">
                <div
                    className={[
                        "group flex items-center gap-2 rounded-xl px-2.5 py-2",
                        "bg-[#0C0C10]/70 ring-1 ring-inset ring-[#26262C]",
                        justCreated
                            ? "ring-2 ring-[#D72638]/70"
                            : "focus-within:ring-[#D72638]/60",
                    ].join(" ")}
                >
                    {/* Prompt */}
                    <span className="select-none rounded-md bg-white/10 px-2 py-0.5 text-sm text-white/80">
                        $
                    </span>

                    {/* Prefijo como chip (fuera del input) para evitar confusión/solape */}
                    {isCreated && (
                        <button
                            type="button"
                            title={`Insertar prefijo "${slug}."`}
                            aria-label={`Insertar prefijo ${slug}.`}
                            onClick={() => {
                                const trimmed = input.replace(/^\s+/, "");
                                const starts = trimmed.startsWith(`${slug}.`);
                                setInput(
                                    starts ? trimmed : `${slug}.${trimmed}`
                                );
                                inputRef.current?.focus();
                            }}
                            className={[
                                "hidden sm:inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px]",
                                "font-mono text-white/85 ring-1 ring-inset ring-white/10",
                                "bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-[#D72638]/60",
                                justCreated ? "animate-pulse" : "",
                            ].join(" ")}
                        >
                            {slug}.
                        </button>
                    )}

                    {/* Input limpio, sin overlays */}
                    <input
                        type="text"
                        className="min-w-0 flex-1 bg-transparent text-sm text-[#F0F0F0] outline-none placeholder:text-white/40"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isAnimating}
                        ref={inputRef}
                        autoFocus
                        spellCheck={false}
                        data-tour="inputConsola"
                        placeholder={
                            isCreated
                                ? "Escribe tu comando… (p. ej. insertChild(1, 35));"
                                : "create(10); (escribe un comando válido en la estructura actual)"
                        }
                    />

                    {/* Controles ↑ ↓ limpiar (inline, sin helpers) */}
                    <div className="flex shrink-0 items-center gap-1.5 pl-1">
                        {/* ↑ */}
                        <button
                            type="button"
                            title="Comando anterior (↑)"
                            aria-label="Comando anterior"
                            onClick={() => {
                                if (commandHistory.length === 0) return;
                                const newIndex =
                                    historyIndex === -1
                                        ? commandHistory.length - 1
                                        : Math.max(0, historyIndex - 1);
                                setHistoryIndex(newIndex);
                                setInput(commandHistory[newIndex]);
                                inputRef.current?.focus();
                            }}
                            disabled={
                                !(
                                    commandHistory.length > 0 &&
                                    (historyIndex === -1 || historyIndex > 0)
                                )
                            }
                            className="rounded-md p-1.5 text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-[#D72638]/60 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    d="M6 15l6-6 6 6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* ↓ */}
                        <button
                            type="button"
                            title="Comando siguiente (↓)"
                            aria-label="Comando siguiente"
                            onClick={() => {
                                if (commandHistory.length === 0) return;
                                const newIndex =
                                    historyIndex === commandHistory.length - 1
                                        ? -1
                                        : historyIndex + 1;
                                setHistoryIndex(newIndex);
                                setInput(
                                    newIndex === -1
                                        ? ""
                                        : commandHistory[newIndex]
                                );
                                inputRef.current?.focus();
                            }}
                            disabled={
                                !(
                                    commandHistory.length > 0 &&
                                    historyIndex !== -1
                                )
                            }
                            className="rounded-md p-1.5 text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-[#D72638]/60 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    d="M18 9l-6 6-6-6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Limpiar */}
                        <button
                            type="button"
                            title="Limpiar consola"
                            aria-label="Limpiar consola"
                            onClick={() => {
                                setHistory([]);
                                setInput("");
                                setHistoryIndex(-1);
                                inputRef.current?.focus();
                            }}
                            disabled={history.length === 0}
                            className="rounded-md p-1.5 text-white/80 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-[#D72638]/60 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Barra de estado (inline) */}
                <div className="mt-2 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                        {(() => {
                            const last = history[history.length - 1] ?? "";
                            const isError = last.startsWith("Error:");
                            const isProcessing =
                                last === "Comando válido, procesando..." ||
                                isAnimating ||
                                isRunningBatch;
                            const pillClass = isError
                                ? "bg-red-500/15 text-red-300"
                                : isProcessing
                                  ? "bg-blue-500/15 text-blue-300"
                                  : "bg-white/10 text-white/70";
                            const dotClass = isError
                                ? "bg-red-400"
                                : isProcessing
                                  ? "bg-blue-400 animate-pulse"
                                  : "bg-white/70";
                            const label = isError
                                ? "Error"
                                : isProcessing
                                  ? "Procesando…"
                                  : "Listo";
                            return (
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 ${pillClass}`}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
                                    />
                                    {label}
                                </span>
                            );
                        })()}

                        <span className="hidden sm:block text-white/45">
                            {`${
                                commandHistory.length === 0
                                    ? 0
                                    : historyIndex === -1
                                      ? commandHistory.length
                                      : historyIndex + 1
                            }/${commandHistory.length} historial`}{" "}
                            · ESC limpia selección
                        </span>
                    </div>

                    <span className="text-white/40">
                        clear — limpia la consola
                    </span>
                </div>

                {/* Progreso sutil cuando procesa */}
                {((history[history.length - 1] ?? "") ===
                    "Comando válido, procesando..." ||
                    isAnimating ||
                    isRunningBatch) && (
                    <div className="absolute inset-x-0 -bottom-px h-0.5">
                        <div className="h-full w-full animate-pulse bg-[#D72638]/70" />
                    </div>
                )}
            </footer>
        </section>
    );
}
