import { complexityCola } from "../../../../../shared/constants/complexityStructures/complexityCola";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityCola() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold text-white mb-1">
                COSTO OPERACIONAL Y COMPLEJIDAD
            </h1>
            <h1 className="text-sm text-red-400 mb-3">Cola</h1>
            <hr className="mt-2 mb-4 border-red-500 border-t-2" />
            <div>
                <h1 className="text-2xl font-bold text-red-500 mb-3">
                    Análisis Algorítmico
                </h1>
            </div>
            <div>
                {/* <p className="mb-4">
                    <a
                        href="https://gitlab.com/Yoner_Silva/proyecto-seed/-/blob/master/src/ufps/util/colecciones_seed/Secuencia.java"
                        className="text-blue-600 hover:underline"
                    >
                        CODIGO FUENTE (SECUENCIAS)
                    </a>
                </p> */}

                <div className="bg-[#1f1f1f] text-gray-300 text-sm leading-6 rounded-xl p-5 shadow-md border border-gray-700 mb-6">
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

                <div className="space-y-8">
                    {complexityCola.map((method, index) => (
                        <div
                            key={index}
                            className="border-b border-gray-700 pb-4"
                        >
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

                <div className="mt-10 bg-[#1a1a1a] p-5 rounded-xl border border-gray-700 shadow-inner">
                    <h2 className="text-xl font-bold text-red-500 mb-3">
                        Conclusión
                    </h2>
                    <p className="text-gray-300 text-sm leading-6">
                        En el análisis anterior se pudo observar que la
                        estructura Cola obta en el mejor de los casos a ser
                        constante y en el peor de los casos a ser lineal.
                        Teniendo en cuenta que su comportamiento lineal es en
                        base a{" "}
                        <code className="bg-gray-800 px-1 rounded">
                            this.tamanio
                        </code>
                        , esté mismo se puede considerar su
                        <code className="bg-gray-800 px-1 rounded">n</code> para
                        saber el coste operacional de cada algoritmo.
                    </p>
                </div>
            </div>
        </div>
    );
}
