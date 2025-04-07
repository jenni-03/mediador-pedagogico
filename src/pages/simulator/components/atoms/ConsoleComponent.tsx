import { useEffect, useRef, useState } from "react";
import { commandRules } from "../../../../shared/constants/console/commandRules";
import { useAnimation } from "../../../../shared/hooks/useAnimation";
import { parseCommand } from "../../../../shared/constants/console/parseCommand";

interface ConsoleComponentProps {
    structureType: string;
    onCommand: (command: string[], isValid: boolean) => void;
    error: { message: string; id: number } | null;
}

export function ConsoleComponent({
    structureType,
    onCommand,
    error,
}: ConsoleComponentProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]); // Solo comandos válidos
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isCreated, setIsCreated] = useState<boolean>(false);

    const { isAnimating, setIsAnimating } = useAnimation();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isAnimating && inputRef.current) {
            const timeout = setTimeout(() => {
                inputRef.current?.focus(); // Hace que el input obtenga el foco después de 1 segundo
            }, 1000); // 1000 ms = 1 segundo

            return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta o el estado cambia
        }
    }, [isAnimating]);

    useEffect(() => {
        if (error) {
            // setVisibleError(error?.message);
            setHistory([...history, `Error: ${error.message}`]);
            setIsAnimating(false); // Detener la animación
        }
    }, [error?.id]);

    // TODO: Cambiar el nombre de las estructuras, revisar si esos son los correctos
    const structuresRequiringCreate = [
        "secuencia",
        "lista_simple",
        "lista_circular",
        "lista_circular_doble",
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isAnimating) return;
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            if (input.trim().toLowerCase() === "clear") {
                setHistory([]);
                setInput("");
            } else {
                // Verifica si el comando es válido con el formato de metodos para java
                // Si no es válido, no se ejecuta el comando
                const parsed = parseCommand(input.trim(), structureType);

                if ("error" in parsed) {
                    console.log("Error en el comando:", parsed.error);
                    onCommand([], false);
                    setHistory([
                        ...history,
                        `$ ${input}`,
                        `Error: ${parsed.error}`,
                    ]);
                    //Guardamos el comando en el historial
                    setCommandHistory([...commandHistory, input.trim()]);
                    setInput("");
                    setHistoryIndex(-1);
                    return;
                }

                const parts = parsed;

                console.log("Comando parseado:", parts);

                const commandValidation = commandRules[structureType](parts);

                if (typeof commandValidation === "boolean") {
                    if (commandValidation) {
                        const command = parts[0]?.toLowerCase();

                        // Verificar si la estructura necesita "create"
                        const needsCreate =
                            structuresRequiringCreate.includes(structureType);

                        // Si la estructura no ha sido creada solo se permite el cmd create
                        if (needsCreate && !isCreated && command !== "create") {
                            onCommand([], false);
                            setHistory([
                                ...history,
                                `$ ${input}`,
                                "Error: Debe crear la estructura primero con 'create'",
                            ]);
                        } else if (isCreated && command == "clean") {
                            onCommand(parsed, true);
                            setHistory([
                                ...history,
                                `$ ${input}`,
                                "Comando válido, procesando...",
                            ]);
                            setCommandHistory([
                                ...commandHistory,
                                input.trim(),
                            ]); // Guardamos solo el comando
                            setIsCreated(false); // Marcar como no creada
                        } else {
                            if (command == "create") {
                                setIsCreated(true); // Marcar como creada
                            }
                            onCommand(parsed, true);
                            setHistory([
                                ...history,
                                `$ ${input}`,
                                "Comando válido, procesando...",
                            ]);
                        }
                    } else {
                        onCommand([], false);
                        setHistory([
                            ...history,
                            `$ ${input}`,
                            "Error: Comando no válido",
                        ]);
                    }
                } else {
                    onCommand([], false);
                    setHistory([
                        ...history,
                        `$ ${input}`,
                        `Error: ${commandValidation.message}`,
                    ]);
                }

                //Guardamos el comando en el historial
                setCommandHistory([...commandHistory, input.trim()]);

                setInput("");
                setHistoryIndex(-1); // Reiniciamos el índice del historial
            }
        }

        // Manejo de Flecha Arriba (recorre solo commandHistory)
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? commandHistory.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        }

        // Manejo de Flecha Abajo
        else if (e.key === "ArrowDown") {
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

    return (
        <div
            data-tour="console"
            className="flex-1 bg-[#101014] text-white mr-2 rounded-xl font-mono"
        >
            {history.map((cmd, index) => (
                <div
                    key={index}
                    className={
                        cmd.startsWith("Error:")
                            ? "text-red-500"
                            : cmd == "Comando válido, procesando..."
                              ? "text-blue-500"
                              : "text-white"
                    }
                >
                    {cmd}
                </div>
            ))}

            <div className="flex">
                <span className="text-white">$</span>
                <input
                    type="text"
                    className="bg-transparent border-none outline-none text-white ml-2 flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAnimating}
                    ref={inputRef}
                    autoFocus
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
