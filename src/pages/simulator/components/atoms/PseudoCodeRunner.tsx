import { useEffect, useState } from "react";

interface PseudoCodeRunnerProps {
    lines: string[];
}

export function PseudoCodeRunner({ lines }: PseudoCodeRunnerProps) {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);

    useEffect(() => {
        setCurrentLineIndex(0);

        if (!lines || lines.length === 0) return;

        const interval = setInterval(() => {
            setCurrentLineIndex((prevIndex) => {
                if (prevIndex <= lines.length) {
                    return prevIndex + 1;
                } else {
                    clearInterval(interval);
                    return prevIndex;
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [lines]);

    return (
        <pre className="font-mono text-sm py-2 px-4 whitespace-pre rounded-md">
            {lines.map((line, index) => {
                const isCurrent = index === currentLineIndex - 1;
                const isPast = index < currentLineIndex - 1;

                return (
                    <div
                        key={index}
                        className={
                            isCurrent
                                ? "text-[#FF1744] font-bold"
                                : isPast
                                  ? "text-[#E0E0E0]"
                                  : "text-[#555]"
                        }
                    >
                        {line}
                    </div>
                );
            })}
        </pre>
    );
}
