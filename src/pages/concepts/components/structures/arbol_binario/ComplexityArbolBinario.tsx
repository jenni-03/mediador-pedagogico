import { complexityArbolBinario } from "../../../../../shared/constants/complexityStructures/complexityArbolBinario";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityArbolBinario() {
  return (
    <div className="text-white py-8 px-5 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Costo Operacional y Complejidad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol Binario
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Análisis Algorítmico */}
      <h2 className="text-2xl font-bold mb-3 text-white">
        Análisis Algorítmico
      </h2>
      <h3 className="text-lg font-bold mb-4 text-white">
        Costo Operacional y Complejidad
      </h3>

      <div className="bg-[#18191a] border-l-4 border-red-500 p-4 text-gray-200 text-sm leading-6 rounded-md mb-6">
        <p>
          Los análisis realizados a continuación corresponden al{" "}
          <b>peor de los casos Big(O)</b>, usando la siguiente nomenclatura:
        </p>
        <ul className="list-disc list-inside ml-4 my-2">
          <li>
            <b>KTE</b> - Constante
          </li>
          <li>
            <b>n</b> - Tamaño de la estructura
          </li>
          <li>
            <b>Número</b> - Número de operaciones elementales
          </li>
        </ul>
        <p className="mt-2">
          Cada instrucción se revisa línea a línea.
          <br />
          Métodos de la misma clase llamados en otros métodos, tienen su
          hipervínculo.
        </p>
      </div>

      <div className="space-y-6">
        {complexityArbolBinario.map((method, index) => (
          <div key={index} className="border-b border-red-700/30 pb-4">
            <h2 className="text-xl font-semibold mb-2 text-red-400">
              {method.title}
            </h2>
            <CodeAnalysis
              code={method.javaCode}
              operationalCost={method.operationalCost}
              complexity={method.complexity}
            />
          </div>
        ))}
      </div>

      {/* Conclusión */}
      <div className="mt-6 bg-[#18191a] p-4 rounded-md border-l-4 border-red-500">
        <h2 className="text-xl font-bold mb-4 text-white">Conclusión</h2>
        <p className="text-gray-200 text-sm leading-6">
          El análisis de los métodos del <b>Árbol Binario</b> permite comprender
          el impacto de sus operaciones en términos de tiempo, mostrando que
          muchos de ellos se comportan de manera constante o lineal en el peor
          de los casos, dependiendo de las llamadas recursivas o búsquedas. Es
          fundamental considerar la naturaleza recursiva de algunas funciones al
          estimar el costo operacional.
        </p>
      </div>
    </div>
  );
}
