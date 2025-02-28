import { useEffect, useRef, useState } from "react";
import { commandRules } from "../../../shared/constants/commandRules";

interface ConsoleComponentProps {
    structureType: string;
    onCommand: (command: string) => void;
}

export function ConsoleComponent({ structureType, onCommand }: ConsoleComponentProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const consoleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(consoleRef.current){
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [history])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            if (input.trim().toLowerCase() === "clear") {
                setHistory([]);
                setInput("");
            } else {
                // Se divide el comando escrito en el input
                const parts = input.trim().split(/\s+/);
                // Se verifica si es o no un comando con formato válido
                const commandValid = commandRules[structureType](parts) ?? false;

                if (commandValid) {
                    onCommand(input.trim()); // Enviamos el comando a simulator
                    setHistory([...history, `$ ${input}`, "Comando válido, procesando..."]);
                } else {
                    setHistory([...history, `$ ${input}`, "Comando no válido"]);
                }
                setInput("");
            }
        }

        // Manejo de Flecha Arriba
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex].replace("$ ", ""));
            }
        }

        // Manejo de Flecha Abajo
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === history.length - 1 ? -1 : historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(newIndex === -1 ? "" : history[newIndex].replace("$ ", ""));
            }
        }
    };

    return (
        <div ref={consoleRef} className="flex-1 bg-gray-900 text-white p-4 mr-2 rounded-xl font-mono">
        {/* <div ref={consoleRef} className="flex-1 bg-gray-900 text-white p-4 mr-2 rounded-xl font-mono overflow-y-auto max-h-60"> */}
            {history.map((cmd, index) => (
                <div key={index} className={cmd === "OK" ? "text-green-400" : cmd === "Comando no válido" ? "text-red-500" : "text-green-400"}>
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
                />
            </div>
        </div>
    );
}
