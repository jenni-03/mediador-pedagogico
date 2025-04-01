import { complexitySecuencia } from "../../../../../shared/constants/complexityStructures/complexitySecuencia";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexitySecuencia() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-bold mb-1">
                COSTO OPERACIONAL Y COMPLEJIDAD
            </h1>
            <h1 className="text-sm text-gray-500 mb-3">Secuencia</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-2xl font-bold mb-3">
                    Análisis Algorítmico
                </h1>
            </div>
            <div>
                <h1 className="text-lg font-bold mb-4">
                    Costo Operacional y Complejidad
                </h1>

                {/* <p className="mb-4">
                    <a
                        href="https://gitlab.com/Yoner_Silva/proyecto-seed/-/blob/master/src/ufps/util/colecciones_seed/Secuencia.java"
                        className="text-blue-600 hover:underline"
                    >
                        CODIGO FUENTE (SECUENCIAS)
                    </a>
                </p> */}

                <div className="bg-gray-50 p-4 text-gray-800 text-sm leading-6 rounded-md mb-6">
                    <p>
                        Los análisis que se harán a continuación son para el
                        peor de los casos Big(O) con la siguiente nomenclatura:
                    </p>
                    <ul className="list-disc list-inside ml-4">
                        <li>KTE - Constante</li>
                        <li>n - Tamaño de la estructura</li>
                        <li>Número - Número de operaciones elementales</li>
                    </ul>
                    <p className="mt-2">
                        Cada instrucción se revisa línea a línea
                    </p>
                    <p>
                        Métodos de la misma clase que son llamados en otros
                        métodos, tienen su hipervínculo.
                    </p>
                </div>

                <div className="space-y-6">
                    {complexitySecuencia.map((method, index) => (
                        <div key={index} className="border-b pb-4">
                            <h2 className="text-xl font-semibold mb-2">
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

                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                    <h2 className="text-xl font-bold mb-4">Conclusión</h2>
                    <p className="text-gray-700 text-sm leading-6">
                        En el análisis anterior se pudo observar que la
                        estructura Secuencia opta en el mejor de los casos a ser
                        constante y en el peor de los casos a ser lineal.
                        Teniendo en cuenta que su comportamiento lineal es en
                        base a "this.cant", este mismo se puede considerar su
                        "n" para saber el coste operacional de cada algoritmo.
                    </p>
                </div>
            </div>
        </div>
    );
}
