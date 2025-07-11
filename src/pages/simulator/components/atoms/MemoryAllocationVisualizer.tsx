import { useEffect, useState } from "react";

export default function MemoryAllocationVisualizer({
  n,
  direccionBase,
  tamanioNodo,
  direcciones,
  structure,
}: {
  n: number;
  direccionBase: number;
  tamanioNodo: number;
  direcciones: any[];
  structure: string;
}) {
  const [step, setStep] = useState(0);

  const getCodeLines = () => {
    if (structure === "secuencia") {
      return [
        `// Dirección base inicial`,
        `int dirBase = ${direccionBase};`,
        ``,
        `// Tamaño fijo de cada nodo`,
        `int tamNodo = ${tamanioNodo};`,
        ``,
        `// Se crea un arreglo para guardar las direcciones`,
        `String[] vectorMemoria = new String[${n}];`,
        ``,
        `for (int i = 0; i < ${n}; i++) {`,
        `    int dirDecimal = dirBase + (i * tamNodo);`,
        `    vectorMemoria[i] = String.format("0x%06X", dirDecimal);`,
        `}`,
      ];
    } else {
      return [
        `int dirBase = ${direccionBase}; // Dirección base inicial`,
        ``,
        `int tamNodo = ${tamanioNodo}; // Tamaño base de cada nodo`,
        ``,
        `int maxPasosAlea = 4; // Máximo número de pasos aleatorios`,
        ``,
        `int tamPasoExtra = 6; // Tamaño del paso aleatorio extra`,
        ``,
        `String[] direcciones = new String[${n}];`,
        ``,
        `for (int i = 0; i < ${n}; i++) {`,
        `    int incremAlea = (int)(Math.random()*(maxPasosAlea + 1))*tamPasoExtra;`,
        `    int incrementoTotal = tamNodo + incremAlea;`,
        ``,
        `    int direccionDecimal = dirBase;`,
        `    direcciones[i] = String.format("0x%06X", direccionDecimal);`,
        ``,
        `    dirBase += incrementoTotal;`,
        `}`,
      ];
    }
  };

  // const getCodeLines = () => {
  //     if (structure === "secuencia") {
  //         return [
  //             `public static String[] generarDireccionesSecuencia(int direccionBase, int tamanioNodo, int n) {`,
  //             `    String[] vectorMemoria = new String[n];`,
  //             ``,
  //             `    for (int i = 0; i < n; i++) {`,
  //             `        int dirDecimal = direccionBase + (i * tamanioNodo);`,
  //             `        vectorMemoria[i] = String.format("0x%06X", dirDecimal);`,
  //             `    }`,
  //             ``,
  //             `    return vectorMemoria;`,
  //             `}`,
  //             ``,
  //             `// Ejecución con valores actuales:` ,
  //             `// generarDireccionesSecuencia(${direccionBase}, ${tamanioNodo}, ${n});`,
  //         ];
  //     } else {
  //         return [
  //             `public static String[] generarDireccionesAleatorias(int direccionBase, int tamanioNodo, int n, int maxPasosAlea, int tamPasoExtra) {`,
  //             `    String[] direcciones = new String[n];`,
  //             `    for (int i = 0; i < n; i++) {`,
  //             `        int incremAlea = (int)(Math.random() * (maxPasosAlea + 1)) * tamPasoExtra;`,
  //             `        int incrementoTotal = tamanioNodo + incremAlea;`,
  //             `        int direccionDecimal = direccionBase;`,
  //             `        direcciones[i] = String.format("0x%06X", direccionDecimal);`,
  //             `        direccionBase += incrementoTotal;`,
  //             `    }`,
  //             `    return direcciones;`,
  //             `}`,
  //             `// Ejecución con valores actuales:`,
  //             `// generarDireccionesAleatorias(${direccionBase}, ${tamanioNodo}, ${n}, 4, 6);`,
  //         ];
  //     }
  // };

  const codeLines = getCodeLines();

  const isShowingCode = step === 0;
  const isShowingMemory = step > 0 && step <= n;

  // 👇 Se reinicia el paso cuando cambian las props (nuevo proceso)
  useEffect(() => {
    setStep(0);
  }, [n, direccionBase, tamanioNodo]);

  const handleNext = () => {
    if (step < n) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  return (
    <div className="flex flex-col lg:w-[90%] bg-[#1F1F22] text-[#E0E0E0] rounded-2xl p-4 border border-[#2E2E2E] space-y-6">
      <h2 className="text-xl font-semibold text-[#A0A0A0] text-center">
        Visualización Paso a Paso de Asignación de Memoria
      </h2>

      {isShowingCode && (
        <pre className="bg-[#2E2E2E] p-2 rounded-lg text-sm leading-6 max-h-[200px] overflow-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent">
          {codeLines.map((line, index) => (
            <div key={index} className="text-[#40B4C4]">
              {line}
            </div>
          ))}
        </pre>
      )}

      {isShowingMemory && (
        <div className="flex justify-start gap-4 px-4 overflow-auto scrollbar-thin scrollbar-thumb-[#D72638]/60 scrollbar-track-transparent">
          {direcciones.slice(0, step).map((direccion, index) => {
            // Detectamos si el item es string o un objeto con memoryAddress
            const address =
              typeof direccion === "string"
                ? direccion
                : direccion.memoryAddress;
            return (
              <div
                key={index}
                className="flex flex-col items-center justify-center bg-[#2E2E2E] rounded-xl p-2 border border-[#3A3A3A] text-center shadow transition-all duration-300"
              >
                <span className="text-xs text-[#A0A0A0]">Índice</span>
                <span className="text-sm font-bold">{index}</span>
                <span className="text-xs mt-1 text-[#A0A0A0]">Dirección</span>
                <span className="text-sm text-[#40B4C4]">{address}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="px-4 py-1 rounded-lg bg-[#2E2E2E] border border-[#3A3A3A] hover:bg-[#3A3A3A] disabled:opacity-40 transition"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          disabled={step >= n}
          className="px-4 py-1 rounded-lg bg-[#D72638] text-white hover:bg-[#b71c2e] disabled:opacity-40 transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
