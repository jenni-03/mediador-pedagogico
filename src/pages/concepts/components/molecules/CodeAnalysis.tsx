import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CodeAnalysisProps } from "../../../../types";
import { MathJax, MathJaxContext } from "better-react-mathjax";

export function CodeAnalysis({
  code,
  operationalCost,
  complexity,
}: CodeAnalysisProps) {
  const [showConsole, setShowConsole] = useState(false);
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);

  useEffect(() => {
    if (showConsole) {
      const cleanLines = code.split("\n").filter((line) => line.trim() !== "");
      let currentLineIndex = 0;
      setDisplayedLines([]);

      const timer = setInterval(() => {
        if (currentLineIndex < cleanLines.length) {
          setDisplayedLines((prev) => [...prev, cleanLines[currentLineIndex]]);
          currentLineIndex++;
        } else {
          clearInterval(timer);
        }
      }, 300);

      return () => clearInterval(timer);
    }
  }, [code, showConsole]);

  return (
    <MathJaxContext>
      <div className="w-full mx-auto p-4 bg-[#0f0f0f] text-white rounded-xl border border-gray-700 shadow-sm">
        {!showConsole && (
          <motion.button
            className="w-full max-w-sm mx-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-full transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConsole(true)}
          >
            Mostrar Análisis de Código
          </motion.button>
        )}

        {showConsole && (
          <div className="space-y-5">
            {/* Consola */}
            <div className="bg-gray-900 text-white rounded-lg p-4 text-sm font-mono shadow-inner">
              <div className="overflow-x-auto whitespace-pre">
                {displayedLines.map((line, index) => (
                  <div key={index} className="typing-animation">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Análisis */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-red-400">
                Análisis de Complejidad
              </h3>

              <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-md text-sm text-gray-300">
                <strong className="text-white">Costo Operacional:</strong>
                <div className="mt-1 space-y-1">
                  {operationalCost.map((cost, i) => (
                    <MathJax key={i}>{`\\( ${cost} \\)`}</MathJax>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-gray-600 p-4 rounded-md text-sm text-gray-300">
                <strong className="text-white">Complejidad:</strong>{" "}
                {complexity}
              </div>
            </div>

            {/* Botón ocultar */}
            <motion.button
              className="w-full max-w-sm mx-auto bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-full transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConsole(false)}
            >
              Ocultar Código
            </motion.button>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}
