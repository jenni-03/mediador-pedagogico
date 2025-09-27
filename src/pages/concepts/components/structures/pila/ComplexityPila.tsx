import { complexityPila } from "../../../../../shared/constants/complexityStructures/complexityPila";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityPila() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Costo Operacional y Complejidad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Pila
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Análisis Algorítmico */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          Análisis Algorítmico
        </h2>

        <h3 className="text-lg font-bold mb-4 text-white">
          Costo Operacional y Complejidad
        </h3>

        <div className="bg-[#18191a] p-4 text-gray-200 text-sm leading-6 rounded-md mb-6 border-l-4 border-red-500">
          <p className="mb-2">
            Los análisis que se presentan a continuación corresponden al{" "}
            <strong>peor de los casos Big(O)</strong>, utilizando la siguiente
            nomenclatura:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>KTE</strong> – Constante
            </li>
            <li>
              <strong>n</strong> – Tamaño de la estructura
            </li>
            <li>
              <strong>Número</strong> – Número de operaciones elementales
            </li>
          </ul>
          <p className="mt-4">
            Cada algoritmo es analizado línea por línea. Métodos de la misma
            clase que se invocan dentro de otros métodos cuentan con
            hipervínculos que permiten un análisis más detallado.
          </p>
        </div>
      </section>

      {/* Renderizado dinámico de métodos */}
      <section className="space-y-8">
        {complexityPila.map((method, index) => (
          <div key={index} className="border-b border-gray-700 pb-4">
            <h3 className="text-xl font-semibold text-red-400 mb-3">
              {method.title}
            </h3>
            <CodeAnalysis
              code={method.javaCode}
              operationalCost={method.operationalCost}
              complexity={method.complexity}
            />
          </div>
        ))}
      </section>

      {/* Conclusión */}
      <section className="mt-6 bg-[#18191a] p-4 rounded-md border-l-4 border-red-500">
        <h3 className="text-xl font-bold text-white mb-3">Conclusión</h3>
        <p className="text-sm text-gray-300 leading-6">
          Del análisis realizado se concluye que la estructura{" "}
          <strong>Pila</strong> presenta una complejidad{" "}
          <span className="text-green-400">constante</span> en la mayoría de sus
          operaciones básicas como <b>push</b> y <b>pop</b>, ya que siempre
          afectan únicamente al tope. Sin embargo, en algunos escenarios donde
          se requiere recorrer la pila, el costo se vuelve{" "}
          <span className="text-yellow-400">lineal</span> en función de{" "}
          <code className="bg-gray-800 px-1 rounded">n</code>, el tamaño de la
          estructura.
        </p>
      </section>
    </div>
  );
}
