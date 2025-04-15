import { useEffect, useRef, useState } from "react";

interface ConsoleComponentProps {
  onCommand: (command: string) => void;
  outputMessage: string;
  isSuccess: boolean;
}

export function ConsoleComponent({
  onCommand,
  outputMessage,
  isSuccess,
}: ConsoleComponentProps) {
  const [history, setHistory] = useState<
    { command: string; response: string; success: boolean }[]
  >([]);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autoscroll para siempre mostrar el último mensaje
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [history]);

  // Actualiza la respuesta del último comando en el historial
  useEffect(() => {
    if (history.length > 0) {
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        newHistory[newHistory.length - 1].response = outputMessage;
        newHistory[newHistory.length - 1].success = isSuccess;
        return newHistory;
      });
    }
  }, [outputMessage, isSuccess]);

  const executeCommand = (cmd: string) => {
    if (
      cmd.trim().toLowerCase() === "clear" ||
      cmd.trim().toLowerCase() === "cls"
    ) {
      setHistory([]);
      setInput("");
      return;
    }

    const commandText = `$ ${cmd}`;
    setHistory((prev) => [
      ...prev,
      { command: commandText, response: "", success: true },
    ]);
    onCommand(cmd.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex].command.replace("$ ", ""));
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex === history.length - 1 ? -1 : historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? "" : history[newIndex].command.replace("$ ", ""));
      }
    }
  };

  // Ejecuta comando si se dispara Enter externamente
  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const handleManualEnter = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputEl.value.trim() !== "") {
        e.preventDefault();
        executeCommand(inputEl.value);
        inputEl.value = "";
      }
    };
    inputEl.addEventListener("keydown", handleManualEnter);
    return () => inputEl.removeEventListener("keydown", handleManualEnter);
  }, []);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    // Contenedor principal ocupa el 100% del alto asignado por su padre
    <div className="w-full h-full flex flex-col">
      {/* Caja negra que contiene el historial y el input */}
      <div className="flex flex-col w-full h-full bg-black text-green-400 rounded-lg border-2 border-gray-600">
        {/* Área de historial (scrollable) */}
        <div
          ref={consoleRef}
          className="flex-1 min-h-0 overflow-y-auto p-4"
          onClick={focusInput}
          data-tour="consola"
        >
          {history.map((entry, index) => (
            <div key={index}>
              <div className="text-green-400">{entry.command}</div>
              {entry.response && (
                <div className={entry.success ? "text-green-400" : "text-red-500"}>
                  → {entry.response}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Área del input, dentro de la misma caja */}
        <div className="flex items-center px-4 py-2 border-t border-gray-700">
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
            data-tour="inputConsola"
          />
        </div>
      </div>
    </div>
  );
}
