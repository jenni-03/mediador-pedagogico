import { complexitySecuencia } from "../../../../../shared/constants/complexityStructures/complexitySecuencia";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexitySecuencia() {
  return (
    <div className="py-6 px-8 sm:px-12 bg-[#0f0f0f] text-white leading-relaxed">
      {/* Título principal */}
      <h1 className="text-3xl font-extrabold text-white mb-1">
        COSTO OPERACIONAL Y COMPLEJIDAD
      </h1>
      <h2 className="text-base text-red-500 font-semibold mb-3">Secuencia</h2>
      <hr className="mt-2 mb-6 border-t-2 border-red-500" />

      {/* Análisis */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Análisis Algorítmico
        </h2>
        <h3 className="text-lg font-semibold text-white mb-4">
          Costo Operacional y Complejidad
        </h3>

        <div className="bg-[#1a1a1a] border border-gray-700 p-4 rounded-xl text-sm text-gray-300 leading-6 mb-8 shadow-sm">
          <p>
            Los análisis que se harán a continuación son para el{" "}
            <strong>peor caso</strong> Big(O), con la siguiente nomenclatura:
          </p>
          <ul className="list-disc list-inside ml-4 mt-2">
            <li>
              <span className="text-white font-medium">KTE</span> - Constante
            </li>
            <li>
              <span className="text-white font-medium">n</span> - Tamaño de la
              estructura
            </li>
            <li>
              <span className="text-white font-medium">Número</span> - Número de
              operaciones elementales
            </li>
          </ul>
          <p className="mt-3">Cada instrucción se revisa línea por línea.</p>
          <p>
            Métodos de la misma clase que son llamados en otros métodos tienen
            su hipervínculo.
          </p>
        </div>
      </div>

      {/* Métodos */}
      <div className="space-y-10">
        {complexitySecuencia.map((method, index) => (
          <div key={index} className="border-b border-gray-700 pb-6">
            <h2 className="text-xl font-bold text-white mb-2">
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
      <div className="mt-10 bg-[#1a1a1a] border border-gray-700 p-5 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-red-500 mb-3">Conclusión</h2>
        <p className="text-sm text-gray-300 leading-6">
          En el análisis anterior se pudo observar que la estructura Secuencia
          tiende en el mejor de los casos a ser constante (O(1)) y en el peor a
          ser lineal (O(n)). Este comportamiento depende del valor de{" "}
          <code className="text-white">this.cant</code>, que representa el
          número de elementos y sirve como referencia para determinar el coste
          operacional.
        </p>
      </div>
    </div>
  );
}
