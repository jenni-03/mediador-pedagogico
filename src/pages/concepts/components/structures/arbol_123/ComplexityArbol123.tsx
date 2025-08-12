import { complexityArbolEneario } from "../../../../../shared/constants/complexityStructures/complexityArbolEneario";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityArbol123() {
  return (
    <div className="py-4 px-10">
      <h1 className="text-2xl font-extrabold text-white mb-1">
        COSTO OPERACIONAL Y COMPLEJIDAD
      </h1>
      <h1 className="text-sm text-red-400 mb-3">Árbol 1-2-3</h1>
      <hr className="mt-2 mb-4 border-red-500 border-t-2" />
      <EnearioAlgorithmAnalysis />
      <div>
        <div className="space-y-8">
          {complexityArbolEneario.map((method, index) => (
            <div key={index} className="border-b border-gray-700 pb-4">
              <h2 className="text-xl font-semibold text-red-400 mb-2">
                {method.title}
              </h2>
              <div>
                <CodeAnalysis
                  code={method.javaCode}
                  operationalCost={method.operationalCost}
                  complexity={method.complexity}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnearioAlgorithmAnalysis() {
  return (
    <section className="mb-10">
      <div className="bg-[#18181b] border-l-4 border-[#ef4444] rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-extrabold text-[#ef4444] mb-1 flex items-center gap-2">
          <span className="drop-shadow">Análisis Algorítmico</span>
        </h2>
        <h3 className="text-lg font-semibold text-[#f87171] mb-4">
          Costo Operacional y Complejidad (Arbol 1-2-3)
        </h3>
        <p className="text-gray-200 text-[15px] mb-3">
          Los análisis que se harán a continuación son para el{" "}
          <span className="font-bold">peor de los casos (Big O)</span> usando el{" "}
          <span className="text-[#ef4444] font-bold">Teorema Maestro</span> y
          notación estándar de algoritmos recursivos:
        </p>
        {/* Teorema Maestro */}
        <div className="rounded-xl border border-[#ef4444] bg-[#23272f]/80 p-4 mb-4 text-[#f87171] shadow flex flex-col md:flex-row md:items-center gap-4 overflow-x-auto">
          <div>
            <span className="font-semibold">Si</span>{" "}
            <span className="font-mono">
              log<sub>B</sub>(A)
            </span>{" "}
            {"<"} <span className="font-mono">C</span>{" "}
            <span className="text-gray-300">→</span>{" "}
            <span className="font-mono text-[#ef4444]">
              T(n) = O(n<sup>C</sup>)
            </span>
          </div>
          <div>
            <span className="font-semibold">Si</span>{" "}
            <span className="font-mono">
              log<sub>B</sub>(A)
            </span>{" "}
            {"="} <span className="font-mono">C</span>{" "}
            <span className="text-gray-300">→</span>{" "}
            <span className="font-mono text-[#ef4444]">
              T(n) = O(n<sup>C</sup> log n)
            </span>
          </div>
          <div>
            <span className="font-semibold">Si</span>{" "}
            <span className="font-mono">
              log<sub>B</sub>(A)
            </span>{" "}
            {">"} <span className="font-mono">C</span>{" "}
            <span className="text-gray-300">→</span>{" "}
            <span className="font-mono text-[#ef4444]">
              T(n) = O(n
              <sup>
                log<sub>B</sub> A
              </sup>
              )
            </span>
          </div>
        </div>
        {/* Fórmula TM */}
        <div className="rounded-xl border border-[#ef4444]/70 bg-[#18181b]/80 p-4 mb-4 text-[#ef4444] shadow">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <span className="font-bold">Fórmula General:</span>
            <span className="font-mono text-[#fff] text-lg">
              T(n) = A · T(n / B) + O(n<sup>C</sup>)
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            <b>A</b>: Llamadas recursivas &nbsp;|&nbsp;
            <b>B</b>: Divisiones del problema &nbsp;|&nbsp;
            <b>C</b>: Todo aquello que no sea recursivo &nbsp;|&nbsp;
            <b>n</b>: Cantidad de veces a iterar
          </div>
        </div>
        <ul className="text-sm text-gray-300 pl-5 list-disc space-y-1 mb-1">
          <li>
            <span className="font-bold text-[#ef4444]">KTE:</span> Constante
          </li>
          <li>
            <span className="font-bold text-[#ef4444]">n:</span> Número de
            operaciones elementales / cantidad de inputs
          </li>
          <li>
            Cada instrucción se revisa línea a línea, y los métodos internos se
            consideran por hipervínculo a su propio análisis.
          </li>
        </ul>
      </div>
    </section>
  );
}
