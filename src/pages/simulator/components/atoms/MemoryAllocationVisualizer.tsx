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
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

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

  const codeLines = getCodeLines();
  const isShowingCode = step === 0;

  const getMaxSteps = () => {
    if (
      structure === "pila" ||
      structure === "cola de prioridad" ||
      structure === "lista_simplemente_enlazada"
    ) {
      return Math.min(1, n);
    } else if (
      structure === "cola" ||
      structure === "lista_doblemente_enlazada"
    ) {
      return Math.min(2, n);
    }
    return n;
  };

  const maxSteps = getMaxSteps();
  const isShowingMemory = step > 0 && step <= maxSteps;

  useEffect(() => {
    setStep(0);
  }, [n, direccionBase, tamanioNodo]);

  const handleNext = () => {
    if (step < maxSteps) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const getVisibleElements = () => {
    if (
      structure === "pila" ||
      structure === "cola de prioridad" ||
      structure === "lista_simplemente_enlazada"
    ) {
      return direcciones.slice(0, Math.min(step, 1));
    } else if (
      structure === "cola" ||
      structure === "lista_doblemente_enlazada"
    ) {
      if (step === 1) {
        return direcciones.slice(0, 1);
      } else if (step === 2 && direcciones.length > 1) {
        return [direcciones[0], direcciones[direcciones.length - 1]];
      }
      return [];
    }
    return direcciones.slice(0, step);
  };

  if (!isOpen) {
    return (
      <div className="bg-[#1F1F22] border border-[#2E2E2E] rounded-2xl p-5 shadow-md flex items-center justify-between">
        {/* Título */}
        <h2 className="text-xl font-semibold text-[#E0E0E0] text-center w-full">
          Visualización Paso a Paso de Asignación de Memoria
        </h2>

        {/* Botón Expandir */}
        <button
          onClick={toggleOpen}
          className="ml-4 p-3 bg-[#2E2E2E] border border-[#3A3A3A]
                   rounded-lg hover:bg-[#3A3A3A] transition flex items-center justify-center"
        >
          <i className="pi pi-expand text-sm text-lg"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:w-[90%] bg-[#1F1F22] text-[#E0E0E0] rounded-2xl p-4 border border-[#2E2E2E] space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-[#A0A0A0] text-center">
          Visualización Paso a Paso de Asignación de Memoria
        </h2>

        <button
          onClick={toggleOpen}
          className="px-3 py-2 bg-[#2E2E2E] border border-[#3A3A3A] text-[#E0E0E0] 
                   rounded-lg hover:bg-[#3A3A3A] transition flex items-center"
        >
          <i className="pi pi-window-minimize text-sm"></i>
        </button>
      </div>

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
          {getVisibleElements().map((direccion, index) => {
            const address =
              typeof direccion === "string"
                ? direccion
                : direccion.memoryAddress;

            let realIndex = index;
            if (
              (structure === "cola" ||
                structure === "lista_doblemente_enlazada") &&
              step === 2 &&
              index === 1
            ) {
              realIndex = direcciones.length - 1;
            }

            return (
              <div
                key={`${realIndex}-${step}`}
                className="flex flex-col items-center justify-center bg-[#2E2E2E] rounded-xl p-2 border border-[#3A3A3A] text-center shadow transition-all duration-300"
              >
                <span className="text-xs text-[#A0A0A0]">Índice</span>
                <span className="text-sm font-bold">{realIndex}</span>
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
          disabled={step >= maxSteps}
          className="px-4 py-1 rounded-lg bg-[#D72638] text-white hover:bg-[#b71c2e] disabled:opacity-40 transition"
        >
          Siguiente
        </button>
      </div>

      <div className="text-center text-sm text-[#A0A0A0]">
        Paso {step} de {maxSteps}
      </div>
    </div>
  );
}
