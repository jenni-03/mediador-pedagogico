import { complexityTablaHash } from "../../../../../shared/constants/complexityStructures/complexityTablaHash";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityTablaHash() {
  return (
    <div className="py-4 px-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Costo Operacional y Complejidad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Tabla Hash
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />
      <div>
        <h1 className="text-2xl font-bold mb-3 text-white">
          Análisis Algorítmico
        </h1>
      </div>
      <div>
        <h1 className="text-lg font-bold mb-4 text-white">
          Costo Operacional y Complejidad
        </h1>

        <div className="bg-[#18191a] p-4 text-gray-200 text-sm leading-6 rounded-md mb-6 border-l-4 border-red-500">
          <p>
            Los análisis realizados a continuación corresponden al{" "}
            <b>peor de los casos Big(O)</b>, usando la siguiente nomenclatura:
          </p>
          <ul className="list-disc list-inside ml-4 my-2">
            <li>
              <b>KTE</b> - Constante para operaciones en listas pequeñas (slot).
            </li>
            <li>
              <b>n</b> - Tamaño de la estructura (slots o elementos).
            </li>
            <li>
              <b>Número</b> - Número de operaciones elementales.
            </li>
          </ul>
          <p className="mt-2">
            Cada instrucción se revisa línea a línea. <br />
            Los métodos de la misma clase que son llamados desde otros métodos
            están hipervinculados.
          </p>
        </div>

        <div className="space-y-6">
          {complexityTablaHash.map((method, index) => (
            <div key={index} className="border-b border-red-700/30 pb-4">
              <h2 className="text-xl font-semibold mb-2 text-red-400">
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

        <div className="mt-6 bg-[#18191a] p-4 rounded-md border-l-4 border-red-500">
          <h2 className="text-xl font-bold mb-4 text-white">Conclusión</h2>
          <p className="text-gray-200 text-sm leading-6">
            Se observa que las operaciones principales de la tabla hash tienen
            costo constante <b>O(1)</b>
            siempre que la función hash esté bien distribuida (KTE pequeño). Sin
            embargo, la inicialización (constructor) depende de la cantidad de
            slots <b>O(n)</b>, ya que debe preparar cada lista enlazada.
            <br />
            El uso de un buen hash y bajo factor de carga asegura un excelente
            desempeño.
          </p>
        </div>
      </div>
    </div>
  );
}
