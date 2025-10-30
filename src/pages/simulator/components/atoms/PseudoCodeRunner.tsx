import { useEffect, useRef, useState } from "react";
import {
    FaArrowLeft,
    FaArrowRight,
    FaPause,
    FaPlay,
    FaRedo,
} from "react-icons/fa";

export function PseudoCodeRunner({
    lines,
    linesId,
    currentLinesIndex,
    args = [],
}: {
    lines: string[];
    linesId: number;
    currentLinesIndex: number | null;
    args: string[];
}) {
    const [currentLineIndex, setCurrentLineIndex] = useState<number | null>(
        null
    );
    const [highlightedLines, setHighlightedLines] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(true); // true mientras se hace el recorrido base
    const intervalRef = useRef<number | null>(null);

    const lastLinesIdRef = useRef<number>(linesId);
    const lastResetTimeRef = useRef<number>(0);

    useEffect(() => {
        if (lastLinesIdRef.current !== linesId) {
            const now = Date.now();
            const timeSinceLastReset = now - lastResetTimeRef.current;

            // Si el último reset fue hace menos de 100ms, ignorar este
            if (timeSinceLastReset < 100) {
                lastLinesIdRef.current = linesId; // Actualizar el ref pero no resetear
                return;
            }

            lastLinesIdRef.current = linesId;
            lastResetTimeRef.current = now;

            setHighlightedLines([]);
            setCurrentLineIndex(null);
            setIsRecording(true);
            setIsPlaying(false);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, [linesId]);

    // Durante el recorrido base: almacenar las líneas que se van resaltando
    useEffect(() => {
        if (isRecording && currentLinesIndex !== null) {
            setHighlightedLines((prev) =>
                prev.includes(currentLinesIndex)
                    ? prev
                    : [...prev, currentLinesIndex]
            );
            setCurrentLineIndex(currentLinesIndex);
        }
    }, [currentLinesIndex, isRecording]);

    // Detectar fin del recorrido
    useEffect(() => {
        if (
            currentLinesIndex === null &&
            isRecording &&
            highlightedLines.length > 0
        ) {
            setIsRecording(false);
            setCurrentLineIndex(highlightedLines[0]);
        }
    }, [currentLinesIndex, isRecording, highlightedLines]);

    useEffect(() => {
        return () => clearExistingInterval();
    }, []);

    const clearExistingInterval = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const togglePlay = () => (isPlaying ? pause() : play());

    const play = () => {
        if (highlightedLines.length === 0) return;

        setIsPlaying(true);
        clearExistingInterval();

        intervalRef.current = window.setInterval(() => {
            setCurrentLineIndex((prev) => {
                if (prev === null) return highlightedLines[0];
                const idx = highlightedLines.indexOf(prev);
                if (idx < highlightedLines.length - 1) {
                    return highlightedLines[idx + 1];
                } else {
                    pause();
                    return prev;
                }
            });
        }, 1500);
    };

    const pause = () => {
        clearExistingInterval();
        setIsPlaying(false);
    };

    const reset = () => {
        pause();
        if (highlightedLines.length > 0) {
            setCurrentLineIndex(highlightedLines[0]);
        }
    };

    const next = () => {
        pause();
        if (currentLineIndex === null) return;
        const idx = highlightedLines.indexOf(currentLineIndex);
        if (idx < highlightedLines.length - 1) {
            setCurrentLineIndex(highlightedLines[idx + 1]);
        }
    };

    const prev = () => {
        pause();
        if (currentLineIndex === null) return;
        const idx = highlightedLines.indexOf(currentLineIndex);
        if (idx > 0) {
            setCurrentLineIndex(highlightedLines[idx - 1]);
        }
    };

    function replacePlaceholders(line: string, args: any[] = []) {
        const colors = [
            "#00BCD4",
            "#4CAF50",
            "#FFC107",
            "#E91E63",
            "#9C27B0",
            "#FF5722",
            "#3F51B5",
        ];

        return line.replace(/\{([^}]+)\}/g, (match, expr) => {
            try {
                const simpleMatch = expr.match(/^(\d+)$/);
                if (simpleMatch) {
                    const idx = Number(simpleMatch[1]);
                    const val = args[idx];
                    if (val === undefined) return match;

                    const color = colors[idx % colors.length];
                    return `<span class="font-semibold" style="color: ${color}">${val}</span>`;
                }

                const replaced = expr.replace(
                    /\b(?:arg|a|\$)(\d+)\b/g,
                    (_m: any, n: any) => {
                        const idx = Number(n);
                        const val = args[idx];
                        const color = colors[idx % colors.length];
                        return `<span class="font-semibold" style="color: ${color}">${val}</span>`;
                    }
                );

                const evalExpr = replaced.replace(/<[^>]+>/g, "");
                const result = eval(evalExpr);

                const firstIdx = expr.match(/\d+/)?.[0];
                const color =
                    firstIdx !== undefined
                        ? colors[Number(firstIdx) % colors.length]
                        : colors[0];

                return `<span class="font-semibold" style="color: ${color}">${result}</span>`;
            } catch {
                return match;
            }
        });
    }

    return (
        <div>
            {/* Controles */}
            <div className="flex justify-center items-center gap-4 mt-2 mb-4">
                <button
                    onClick={prev}
                    title="Anterior"
                    disabled={isRecording}
                    className={`p-2 hover:scale-110 transition-transform ${
                        isRecording ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <FaArrowLeft />
                </button>

                <button
                    onClick={togglePlay}
                    title={isPlaying ? "Pausar" : "Reproducir"}
                    disabled={isRecording}
                    className={`p-2 hover:scale-110 transition-transform ${
                        isRecording ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                <button
                    onClick={next}
                    title="Siguiente"
                    disabled={isRecording}
                    className={`p-2 hover:scale-110 transition-transform ${
                        isRecording ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <FaArrowRight />
                </button>

                <button
                    onClick={reset}
                    title="Reiniciar"
                    disabled={isRecording}
                    className={`p-2 hover:scale-110 transition-transform ${
                        isRecording ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <FaRedo />
                </button>
            </div>

            <hr className="border-t-2 border-red-500 mb-4 w-120 rounded" />

            {/* Contenedor del código */}
            <pre className="font-mono text-sm py-2 px-4 whitespace-pre rounded-md overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D72638]/60">
                {lines.map((line, index) => {
                    const replacedLine = replacePlaceholders(line, args);
                    const isCurrent = index === currentLineIndex;

                    return (
                        <div
                            key={index}
                            className={
                                isCurrent
                                    ? "text-[#FF1744] font-bold"
                                    : "text-[#E0E0E0]"
                            }
                        >
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: replacedLine,
                                }}
                            ></div>
                        </div>
                    );
                })}
            </pre>
        </div>
    );
}
