import { useEffect, useRef, useState } from "react";

interface ConsoleComponentProps {
    onCommand: (command: string) => void;
    outputMessage: string;  // Mensaje a mostrar
    isSuccess: boolean;     // Define si el mensaje es exitoso o error
}

export function ConsoleComponent({ onCommand, outputMessage, isSuccess }: ConsoleComponentProps) {
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const consoleRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [lastOutput, setLastOutput] = useState<string>("");

    useEffect(() => {
        if (consoleRef.current) {
            consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
        }
    }, [history]);

    useEffect(() => {
        if (outputMessage) {
            setLastOutput(outputMessage); 
        }
    }, [outputMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault();

            if (input.trim().toLowerCase() === "clear" || input.trim().toLowerCase() === "cls") {
                setHistory([]);
                setLastOutput("");
                setInput("");
            } else {
                onCommand(input.trim());
                setHistory([...history, `$ ${input}`]); 
                setInput("");
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex].replace("$ ", ""));
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex === history.length - 1 ? -1 : historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(newIndex === -1 ? "" : history[newIndex].replace("$ ", ""));
            }
        }
    };

    // Permitir que cualquier parte de la consola active la escritura
    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <div className="w-full flex justify-center sm:justify-start px-4 sm:pl-12 mt-6 sm:mt-8">
            <div
                ref={consoleRef}
                className="relative w-full sm:w-[40%] max-w-screen-md h-40 sm:h-52 lg:h-60 bg-black text-green-400 p-4 rounded-lg font-mono overflow-y-auto border-2 border-gray-600"
                onClick={focusInput}
            >
                {/* Renderiza el historial de comandos */}
                {history.map((cmd, index) => (
                    <div key={index} className="text-green-400">{cmd}</div>
                ))}

                {/* Muestra el mensaje con color dinámico */}
                {lastOutput && (
                    <div className={isSuccess ? "text-green-400" : "text-red-500"}>
                        → {lastOutput}
                    </div>
                )}

                {/* Input de la consola */}
                <div className="flex items-center">
                    <span className="text-green-400">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="bg-transparent border-none outline-none text-white ml-2 flex-1 caret-green-400 animate-blink"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
