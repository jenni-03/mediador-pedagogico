import img1 from "../../../../../assets/images/definicion_arbol_1.png";
import img2 from "../../../../../assets/images/definicion_arbol_2.png";
import img3 from "../../../../../assets/images/definicion_arbol_3.png";
import img4 from "../../../../../assets/images/definicion_arbol_4.png";

export function DefinitionArbolBinario() {
  return (
    <div className="bg-[#101012] text-white min-h-screen py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Binario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura jerárquica
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición de Árbol */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Definición de Árbol
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15px]">
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
              "Los nodos distintos a null se denominan: nodos internos(ni); de lo contrario, son llamados nodos externos (ne).",
            ].map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center my-4">
          <img
            src={img1}
            alt="estructura árbol libro"
            className="w-full h-auto max-w-2xl rounded-xl border-2 border-red-500 shadow"
          />
        </div>
      </section>

      {/* Árboles Binarios */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Árboles Binarios
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="mb-2 text-gray-200">
            Los <b className="text-red-400">árboles binarios</b> son un tipo
            particular de árbol muy utilizado en informática. Se caracterizan
            porque ningún nodo tiene más de dos hijos, es decir, sólo puede
            tener un subárbol izquierdo y uno derecho.
          </p>
          <p className="text-gray-200">
            Un <b className="text-red-400">árbol binario</b> puede estar vacío,
            o bien estar formado por un nodo raíz y dos árboles binarios
            disjuntos: el subárbol izquierdo y el subárbol derecho.
          </p>
        </div>
        <div className="flex justify-center my-4">
          <img
            src={img2}
            alt="árbol binario grande"
            className="w-full h-auto max-w-2xl rounded-xl border-2 border-cyan-400 shadow"
          />
        </div>
      </section>

      {/* Diferencias de disposición */}
      <section className="mb-10">
        <div className="bg-[#18191a] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-4">
          <p className="mb-2 text-gray-200">
            En un árbol normal no se distingue entre subárboles. En un{" "}
            <b className="text-red-400">árbol binario</b> distinguimos entre{" "}
            <span className="font-semibold text-cyan-300">
              subárbol izquierdo
            </span>{" "}
            y{" "}
            <span className="font-semibold text-cyan-300">
              subárbol derecho
            </span>{" "}
            para los dos posibles hijos.
          </p>
          <p className="text-gray-200">
            Así, dos árboles con los mismos nodos pueden tener estructuras
            diferentes según cómo se organicen:
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <img
            src={img3}
            alt="estructura 1"
            className="w-full max-w-xs h-auto rounded-xl border-2 border-yellow-400 shadow object-contain"
          />
          <img
            src={img4}
            alt="estructura 2"
            className="w-full max-w-xs h-auto rounded-xl border-2 border-yellow-400 shadow object-contain"
          />
        </div>
      </section>

      {/* Conceptos Básicos */}
      <section>
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Conceptos Básicos
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15px]">
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
        </div>
      </section>
    </div>
  );
}
