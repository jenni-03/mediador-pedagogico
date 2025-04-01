import img1 from "../../../../../assets/images/definicion_arbol_1.png";
import img2 from "../../../../../assets/images/definicion_arbol_2.png";
import img3 from "../../../../../assets/images/definicion_arbol_3.png";
import img4 from "../../../../../assets/images/definicion_arbol_4.png";

export function DefinitionArbolBinario() {
    return (
        <div className="bg-white text-gray-900 min-h-screen py-10 px-4 md:px-10 lg:px-20">
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-1 uppercase">
                Árbol Binario
            </h1>
            <h2 className="text-sm md:text-base text-gray-600 mb-6">
                Estructura jerárquica
            </h2>
            <hr className="border-t-2 border-red-600 mb-10 w-24 md:w-32" />

            {/* DEFINICIÓN */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    Definición de Árbol
                </h2>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-800 space-y-3">
                    {[
                        "Hay un nodo, especialmente designado, llamado la raíz del árbol T.",
                        "Los nodos restantes, excluyendo la raíz, son particionados en m (m ≥ 0) conjuntos disjuntos T1, T2, ..., Tm, cada uno de los cuales es, a su vez, un árbol, llamado subárbol de la raíz del árbol T.",
                        "A los nodos que no son raíces de otros subárboles se les denomina hojas del árbol T, o sea, no tienen sucesores o hijos.",
                        "Si n es un nodo y A1, A2, ..., Ak son árboles con raíces n1, n2, ..., nk. Se puede construir un nuevo árbol haciendo que n se constituya en padre de los nodos n1, n2, ..., nk.",
                        "En dicho árbol, n es la raíz y A1, A2, ..., Ak son los subárboles de la raíz.",
                        "Los nodos n1, ..., nk reciben el nombre de hijos del nodo n.",
                        "Si el conjunto finito T de nodos del árbol es vacío, entonces se trata de un árbol vacío.",
                        "En esta estructura existe sólo un nodo sin padre, que es la raíz del árbol.",
                        "Todo nodo, a excepción del nodo raíz, tiene uno y sólo un padre.",
                        "Los nodos distintos a null se denominan: nodos internos(ni); de lo contrario, son llamados nodos externos (ne)."
                    ].map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </section>

            <img
                src={img1}
                alt="estructura árbol libro"
                className="w-full max-w-4xl mx-auto h-auto rounded-lg shadow-md mb-12 object-contain"
            />

            {/* ÁRBOLES BINARIOS */}
            <section className="mb-12">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    Árboles Binarios
                </h2>
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    Los{" "}
                    <span className="text-red-600 font-semibold">
                        árboles binarios
                    </span>{" "}
                    constituyen un tipo particular de árboles de gran aplicación.
                    Estos árboles se caracterizan porque no existen nodos con
                    grado mayor que dos, es decir, un nodo tendrá como máximo dos
                    subárboles.
                </p>
                <p className="text-sm md:text-base text-gray-800 mb-6">
                    Un{" "}
                    <span className="text-red-600 font-semibold">
                        árbol binario
                    </span>{" "}
                    es un conjunto finito de nodos que puede estar vacío o
                    consistir en un nodo raíz y dos árboles binarios disjuntos,
                    llamados subárbol izquierdo y subárbol derecho.
                </p>
                <img
                    src={img2}
                    alt="árbol binario grande"
                    className="w-full max-w-4xl mx-auto h-auto rounded-lg shadow-md object-contain"
                />
            </section>

            {/* DIFERENCIAS DE DISPOSICIÓN */}
            <section className="mb-12">
                <p className="text-sm md:text-base text-gray-800 mb-4">
                    En un árbol normal no se distingue entre los subárboles, pero
                    en un árbol binario se suele utilizar la nomenclatura{" "}
                    <span className="font-semibold text-red-600">
                        subárbol izquierdo
                    </span>{" "}
                    y{" "}
                    <span className="font-semibold text-red-600">
                        subárbol derecho
                    </span>{" "}
                    para distinguir los dos posibles hijos.
                </p>
                <p className="text-sm md:text-base text-gray-800 mb-6">
                    Por eso, aunque dos árboles tengan los mismos nodos, su
                    estructura puede cambiar dependiendo de cómo se organizan:
                </p>
                <div className="flex flex-col lg:flex-row justify-center items-center gap-6">
                    <img
                        src={img3}
                        alt="estructura 1"
                        className="w-full max-w-xs h-auto rounded-lg shadow-md object-contain"
                    />
                    <img
                        src={img4}
                        alt="estructura 2"
                        className="w-full max-w-xs h-auto rounded-lg shadow-md object-contain"
                    />
                </div>
            </section>

            {/* CONCEPTOS BÁSICOS */}
            <section>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    Conceptos Básicos
                </h2>
                <ul className="list-disc list-inside text-sm md:text-base text-gray-800 space-y-3">
                    {[
                        "Grado de un nodo: Número de subárboles que cuelgan de un nodo.",
                        "Nodo terminal: Nodo con grado 0, sin subárboles.",
                        "Grado de un árbol: Máximo grado entre todos los nodos del árbol.",
                        "Hijos de un nodo: Nodos que dependen directamente de él.",
                        "Padre de un nodo: Nodo del que depende directamente.",
                        "Nodos hermanos: Hijos del mismo nodo padre.",
                        "Camino: Sucesión de nodos donde ni es padre de ni+1.",
                        "Antecesores de un nodo: Todos los nodos desde la raíz hasta ese nodo.",
                        "Nivel de un nodo: Longitud desde la raíz hasta él.",
                        "Altura (profundidad): Nivel máximo de un nodo en el árbol.",
                        "Longitud del camino: Suma de los caminos a todos los nodos.",
                        "Bosque: Conjunto de árboles disjuntos.",
                    ].map((text, i) => (
                        <li key={i}>{text}</li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
