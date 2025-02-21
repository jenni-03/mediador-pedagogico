import { useState } from "react";

export function ConsoleComponent() {
    // Para manejar el historial de comandos
    const [history, setHistory] = useState<string[]>([]);
    // Guarda el comando
    const [input, setInput] = useState("");
    // Para buscar en el historial de comandos
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim() !== "") {
            e.preventDefault(); //Evita salto de línea
            if (input.trim() === "") return;

            if (input.trim().toLowerCase() === "clear") {
                setHistory([]); //Vacía la consola
                setInput("");
            } else {
                setHistory([...history, input]); // Guarda el comando en el historial
                setInput("");
            }
        }
        // Manejo de Flecha Arriba
        else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex =
                    historyIndex === -1
                        ? history.length - 1
                        : Math.max(0, historyIndex - 1);
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        }

        // Manejo de Flecha Abajo
        else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex =
                    historyIndex === history.length - 1 ? -1 : historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(newIndex === -1 ? "" : history[newIndex]);
            }
        }
    };

    return (
        <div className="flex-1 bg-gray-900 text-white p-4 mr-2 rounded-xl font-mono">
            {history.map((cmd, index) => (
                <div key={index} className="text-green-400">
                    $ {cmd}
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
