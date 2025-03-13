import { useEffect, useRef, useState } from "react";
import { commandRules } from "../../../shared/constants/commandRules";

interface ConsoleComponentProps {
    structureType: string;
    onCommand: (command: string) => void;
}

export function ConsoleComponent({
    structureType,
    onCommand,
}: ConsoleComponentProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]); // Solo comandos válidos
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [isCreated, setIsCreated] = useState<boolean>(false);
    const consoleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [history]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            if (input.trim().toLowerCase() === "clear") {
                setHistory([]);
                setInput("");
            } else {
                const parts = input.trim().split(/\s+/);
                const commandValidation = commandRules[structureType](parts);

                if (typeof commandValidation === "boolean") {
                    if (commandValidation) {
                        const command = parts[0]?.toLowerCase();
                        // Si la estructura no ha sido creada solo se permite el cmd create
                        if (!isCreated && command !== "create") {
                            setHistory([
                                ...history,
                                `$ ${input}`,
                                "Error: Debe crear la estructura primero con 'create'",
                            ]);
                        } else if (isCreated && command == "clean") {
                            onCommand(input.trim());
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
                            onCommand(input.trim());
                            setHistory([
                                ...history,
                                `$ ${input}`,
                                "Comando válido, procesando...",
                            ]);
                            setCommandHistory([
                                ...commandHistory,
                                input.trim(),
                            ]); // Guardamos solo el comando
                        }
                    } else {
                        setHistory([
                            ...history,
                            `$ ${input}`,
                            "Error: Comando no válido",
                        ]);
                    }
                } else {
                    setHistory([
                        ...history,
                        `$ ${input}`,
                        `Error: ${commandValidation.message}`,
                    ]);
                }

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
            ref={consoleRef}
            className="flex-1 bg-gray-900 text-white p-4 mr-2 rounded-xl font-mono"
        >
            {history.map((cmd, index) => (
                <div
                    key={index}
                    className={
                        cmd.startsWith("Error:")
                            ? "text-red-500"
                            : "text-green-400"
                    }
                >
                    {cmd}
                </div>
            ))}

            <div className="flex">
                <span className="text-green-400">$</span>
                <input
                    type="text"
                    className="bg-transparent border-none outline-none text-white ml-2 flex-1"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    spellCheck={false}
                />
            </div>
        </div>
    );
}
