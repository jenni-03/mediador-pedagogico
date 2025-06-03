import { complexityColaPrioridad } from "../../../../../shared/constants/complexityStructures/complexityColaPrioridad";
import { CodeAnalysis } from "../../molecules/CodeAnalysis";

export function ComplexityColaPrioridad() {
    return (
        <div className="py-4 px-10">
            <h1 className="text-2xl font-extrabold text-white mb-1">
                COSTO OPERACIONAL Y COMPLEJIDAD
            </h1>
            <h1 className="text-sm text-red-400 mb-3">Cola de Prioridad</h1>
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
                    {complexityColaPrioridad.map((method, index) => (
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

                <div className="mt-10 bg-[#1a1a1a] p-5 rounded-xl border border-gray-700 shadow-inner">
                    <h2 className="text-xl font-bold text-red-500 mb-3">
                        Conclusión
                    </h2>
                    <p className="text-gray-300 text-sm leading-6">
                        En el análisis anterior se pudo observar que la
                        estructura Cola prioridad toma como base la cola simple,
                        sin embargo esta al tener que recorrer multiples veces
                        su tamaño y al mismo tiempo dar prioridad esta llega en
                        el peor de los casos a ser cuadratica.
                    </p>
                </div>
            </div>
        </div>
    );
}
