import { useEffect, useState, useRef } from "react";
import {
  FaPlay,
  FaPause,
  FaRedo,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

interface PseudoCodeRunnerProps {
  lines: string[];
  duration?: number; // tiempo total en milisegundos para recorrer todo el código
  args?: any[]; // nuevos argumentos dinámicos
  structurePrueba: any;
}

export function PseudoCodeRunner({
  lines,
  duration = 8000,
  args = [],
}: PseudoCodeRunnerProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timePerLine = lines.length > 0 ? duration / lines.length : 0;

  // console.log(structurePrueba);
  // console.log(args);

  // console.log(structurePrueba.getTamanio()); // Este es this.cant
  // console.log(structurePrueba.vector.length);

  // Combinar los argumentos recibidos con los valores de la estructura
  // const extendedArgs = [
  //   ...args,
  //   structurePrueba?.getTamanio?.(),
  //   structurePrueba?.vector?.length,
  // ];

  //   function replacePlaceholders(line: string, args: any[] = []) {
  //     return line.replace(/{(\d+)}/g, (match, index) => {
  //       return args[index] !== undefined ? args[index] : match;
  //     });
  //   }
  // function replacePlaceholders(line: string, args: any[] = []) {
  //   return line.replace(/{(\d+)}/g, (match, index) => {
  //     const value = args[index];
  //     if (value === undefined) return match;
  //     return `<span class="text-[#00BCD4] font-semibold">${value}</span>`;
  //   });
  // }
  // function replacePlaceholders(line: string, args: any[] = []) {
  //   return line.replace(/\{([^}]+)\}/g, (match, expr) => {
  //     try {
  //       // Reemplaza índices numéricos por sus valores en args
  //       const evaluable = expr.replace(/\b(\d+)\b/g, (_: any, n: any) => {
  //         const val = args[Number(n)];
  //         console.log("Valor 1");
  //         console.log(val);

  //         return val !== undefined ? val : n;
  //       });

  //       console.log("Valor 2");
  //       console.log(evaluable);

  //       // Evalúa la expresión resultante (por ejemplo, "5+1" → 6)
  //       const result = eval(evaluable);

  //       console.log("Valor 3");
  //       console.log(result);

  //       // Devuelve el valor resaltado
  //       return `<span class="text-[#00BCD4] font-semibold">${result}</span>`;
  //     } catch {
  //       // Si falla (por sintaxis o valor faltante), deja el texto original
  //       return match;
  //     }
  //   });
  // }
  // function replacePlaceholders(line: string, args: any[] = []) {
  //   return line.replace(/\{([^}]+)\}/g, (match, expr) => {
  //     try {
  //       // 1) Reemplaza referencias con prefijo: argN, aN o $N  -> por su valor en args
  //       const replacedArgs = expr.replace(/\b(?:arg|a|\$)(\d+)\b/g, (_m: any, n: any) => {
  //         const val = args[Number(n)];
  //         return val !== undefined ? String(val) : "undefined";
  //       });

  //       // 2) Si la expresión es exactamente un número (placeholder simple), devolver su valor
  //       if (/^\d+$/.test(expr)) {
  //         const idx = Number(expr);
  //         const val = args[idx];
  //         return val !== undefined
  //           ? `<span class="text-[#00BCD4] font-semibold">${val}</span>`
  //           : match;
  //       }

  //       // 3) Ahora evaluamos la expresión resultante (puede contener literales y los valores reemplazados)
  //       const evaluated = eval(replacedArgs); // ejemplo: "3-1" -> 2

  //       return `<span class="text-[#00BCD4] font-semibold">${evaluated}</span>`;
  //     } catch (e) {
  //       // si algo falla, devolvemos el placeholder original para no romper la visualización
  //       return match;
  //     }
  //   });
  // }

  function replacePlaceholders(line: string, args: any[] = []) {
    // Paleta de colores para diferenciar argumentos
    const colors = [
      "#00BCD4", // cyan
      "#4CAF50", // green
      "#FFC107", // amber
      "#E91E63", // pink
      "#9C27B0", // purple
      "#FF5722", // deep orange
      "#3F51B5", // indigo
    ];

    return line.replace(/\{([^}]+)\}/g, (match, expr) => {
      try {
        // Detectar si es un placeholder simple {0}, {1}, etc.
        const simpleMatch = expr.match(/^(\d+)$/);
        if (simpleMatch) {
          const idx = Number(simpleMatch[1]);
          const val = args[idx];
          if (val === undefined) return match;

          const color = colors[idx % colors.length];
          return `<span class="font-semibold" style="color: ${color}">${val}</span>`;
        }

        // Reemplazar prefijos de argumentos (aN, argN o $N) por sus valores coloreados
        const replaced = expr.replace(
          /\b(?:arg|a|\$)(\d+)\b/g,
          (_m: any, n: any) => {
            const idx = Number(n);
            const val = args[idx];
            const color = colors[idx % colors.length];
            return `<span class="font-semibold" style="color: ${color}">${val}</span>`;
          }
        );

        // Quitar los <span> para evaluar correctamente la parte numérica
        const evalExpr = replaced.replace(/<[^>]+>/g, "");
        const result = eval(evalExpr);

        // Si el resultado es numérico, se pinta del color del primer arg detectado
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

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  const play = () => {
    if (lines.length === 0 || currentLineIndex >= lines.length - 1) return;

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentLineIndex((prevIndex) => {
        if (prevIndex < lines.length - 1) {
          return prevIndex + 1;
        } else {
          clearInterval(intervalRef.current!);
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, timePerLine);
  };

  const pause = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  const reset = () => {
    pause();
    setCurrentLineIndex(0);
  };

  const next = () => {
    pause();
    setCurrentLineIndex((prev) => (prev < lines.length - 1 ? prev + 1 : prev));
  };

  const prev = () => {
    pause();
    setCurrentLineIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  // Se ejecuta automáticamente al montar el componente
  useEffect(() => {
    if (lines.length > 0) {
      setCurrentLineIndex(0);
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentLineIndex((prevIndex) => {
          if (prevIndex < lines.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(intervalRef.current!);
            setIsPlaying(false);
            return prevIndex;
          }
        });
      }, timePerLine);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lines, duration]);

  return (
    <div>
      {/* Controles */}
      <div className="flex justify-center items-center gap-4 mt-2 mb-4">
        <button
          onClick={prev}
          title="Anterior"
          className="p-2 hover:scale-110 transition-transform"
        >
          <FaArrowLeft />
        </button>

        <button
          onClick={togglePlay}
          title={isPlaying ? "Pausar" : "Reproducir"}
          className="p-2 hover:scale-110 transition-transform"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button
          onClick={next}
          title="Siguiente"
          className="p-2 hover:scale-110 transition-transform"
        >
          <FaArrowRight />
        </button>

        <button
          onClick={reset}
          title="Reiniciar"
          className="p-2 hover:scale-110 transition-transform"
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
          const isPast = index < currentLineIndex;

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
              <div dangerouslySetInnerHTML={{ __html: replacedLine }}></div>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
