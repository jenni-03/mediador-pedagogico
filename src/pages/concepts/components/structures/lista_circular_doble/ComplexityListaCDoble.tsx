import { complexityListaCDoble } from "../../../../../shared/constants/complexityStructures/complexityListaCDoble";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityListaCDoble() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Costo Operacional y Complejidad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Circular Doblemente Enlazada
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          Análisis Algorítmico
        </h2>

        <h1 className="text-lg font-bold mb-4 text-white">
          Costo Operacional y Complejidad
        </h1>

        <div className="bg-[#18191a] p-4 text-gray-200 text-sm leading-6 rounded-md mb-6 border-l-4 border-red-500">
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
        {complexityListaCDoble.map((method, index) => (
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

      <section className="mt-6 bg-[#18191a] p-4 rounded-md border-l-4 border-red-500">
        <h3 className="text-xl font-bold text-white mb-3">Conclusión</h3>
        <p className="text-sm text-gray-300 leading-6">
          En el análisis anterior se pudo observar que la estructura{" "}
          <strong>Lista Circular Doble</strong> en comparacion a la{" "}
          <span className="text-green-400">Lista Circular Simple</span> para
          esta implementacion en especifico se modificaron algunos metodos
          auxiliares que disminuyeron o aumentaron su costo operacional sin
          cambiar su complejidad.
        </p>
      </section>
    </div>
  );
}
