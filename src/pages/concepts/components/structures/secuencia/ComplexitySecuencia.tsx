import { complexitySecuencia } from "../../../../../shared/constants/complexityStructures/complexitySecuencia";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexitySecuencia() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Costo Operacional y Complejidad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Secuencia
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Sección: Análisis Algorítmico */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">
          Análisis Algorítmico
        </h2>

        <h3 className="text-lg font-bold mb-4 text-white">
          Costo Operacional y Complejidad
        </h3>

        <div className="bg-[#18191a] p-4 text-gray-200 text-sm leading-6 rounded-md mb-6 border-l-4 border-red-500 shadow">
          <p className="mb-2">
            Los análisis que se presentan a continuación corresponden al{" "}
            <strong>peor caso</strong> <b>Big(O)</b>, utilizando la siguiente
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
            Cada instrucción se evalúa línea por línea. Si existen métodos de la
            misma clase invocados dentro de otros, estos cuentan con
            hipervínculos para su análisis detallado.
          </p>
        </div>
      </section>

      {/* Métodos con análisis de complejidad */}
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

      {/* Conclusión */}
      <section className="mt-6 bg-[#18191a] p-4 rounded-md border-l-4 border-red-500 shadow">
        <h3 className="text-xl font-bold text-white mb-3">Conclusión</h3>
        <p className="text-sm text-gray-300 leading-6">
          En el análisis se observó que la estructura <strong>Secuencia</strong>{" "}
          presenta un comportamiento{" "}
          <span className="text-green-400">constante (O(1))</span> en las
          operaciones que no requieren recorrido, y{" "}
          <span className="text-yellow-400">lineal (O(n))</span> en aquellas que
          implican desplazamiento o búsqueda de elementos. Este comportamiento
          depende directamente del valor de{" "}
          <code className="bg-gray-800 px-1 rounded">this.cant</code>, el cual
          determina el número de elementos y, por tanto, el coste operacional.
        </p>
      </section>
    </div>
  );
}
