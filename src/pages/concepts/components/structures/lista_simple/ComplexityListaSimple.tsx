import { complexitySecuencia } from "../../../../../shared/constants/complexityStructures/complexitySecuencia";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityListaSimple() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <h1 className="text-3xl font-extrabold text-white mb-1">
        Costo Operacional y Complejidad
      </h1>
      <h2 className="text-sm text-red-400 mb-4">Lista Simple</h2>
      <hr className="border-t-2 border-red-500 mb-6 w-full" />

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Análisis Algorítmico
        </h2>

        <div className="bg-[#1f1f1f] text-gray-300 text-sm leading-6 rounded-xl p-5 shadow-md border border-gray-700">
          <p className="mb-2">
            Los análisis que se harán a continuación son para el peor de los
            casos
            <strong> Big(O)</strong> con la siguiente nomenclatura:
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
            Cada instrucción se revisa línea por línea. Métodos de la misma
            clase que son llamados en otros métodos tienen su hipervínculo para
            un análisis más detallado.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        {complexitySecuencia.map((method, index) => (
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

      <section className="mt-10 bg-[#1a1a1a] p-5 rounded-xl border border-gray-700 shadow-inner">
        <h3 className="text-xl font-bold text-red-500 mb-3">Conclusión</h3>
        <p className="text-sm text-gray-300 leading-6">
          En el análisis anterior se pudo observar que la estructura{" "}
          <strong>Secuencia</strong> opta en el mejor de los casos a ser{" "}
          <span className="text-green-400">constante</span> y en el peor de los
          casos a ser <span className="text-yellow-400">lineal</span>. Teniendo
          en cuenta que su comportamiento lineal depende de{" "}
          <code className="bg-gray-800 px-1 rounded">this.cant</code>, este
          mismo puede considerarse como{" "}
          <code className="bg-gray-800 px-1 rounded">n</code> para evaluar el
          coste operacional de cada algoritmo.
        </p>
      </section>
    </div>
  );
}
