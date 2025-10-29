export function PseudoCodeRunner({
    lines,
    currentLineIndex,
}: {
    lines: string[];
    currentLineIndex: number | null;
}) {
    console.log("lineas", lines);
    console.log(currentLineIndex);
    return (
        <pre className="font-mono text-sm py-2 px-4 whitespace-pre rounded-md">
            {lines.map((line, index) => {
                return (
                    <div
                        key={index}
                        className={
                            index === currentLineIndex
                                ? "text-[#FF1744] font-bold"
                                : "text-[#E0E0E0]"
                        }
                    >
                        {line}
                    </div>
                );
            })}
        </pre>
    );
}
