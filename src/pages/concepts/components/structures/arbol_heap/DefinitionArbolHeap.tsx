import img1 from "../../../../../assets/images/definicion_heap_1.jpg";
import img2 from "../../../../../assets/images/definicion_heap_2.jpg";

export function DefinitionArbolHeap() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Heap
        </h1>
      </div>
      <span className="text-base text-red-500 ml-3 font-medium block mb-2">
        Árbol binario de prioridad (montículo)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Definición de Árbol Heap
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-2 text-[15px]">
            Un <b>heap</b> o montículo es una estructura de datos similar a un
            árbol binario de búsqueda pero ordenado de distinta forma por
            prioridades y además se representa siempre como un árbol binario
            completo representado como un arreglo.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Árbol Heap ejemplo"
          />
        </div>
      </section>

      {/* Características */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">Características</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-4 text-[15px]">
            Un montículo es un árbol binario completo tal que puede:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15.5px] text-gray-100">
            <li>Estar vacío.</li>
            <li>
              El valor de la prioridad en la raíz es mayor, (menor) o igual que
              la prioridad de cualquiera de sus hijos.
            </li>
            <li>Ambos subárboles son montículos o heap.</li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Heap como arreglo"
          />
        </div>
      </section>

      {/* Propiedades */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Propiedades del Heap
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="font-semibold text-gray-100 mb-2">
            Debe cumplir dos propiedades:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15.5px] text-gray-100">
            <li>
              Un árbol binario completamente lleno, con excepción del último
              nivel que se rellena de izquierda a derecha.
            </li>
            <li>
              Todo nodo debe ser mayor que sus descendientes. Por lo tanto, el
              máximo estará en la raíz.
            </li>
          </ul>
        </div>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="font-semibold text-gray-100 mb-2">
            Otras características:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15.5px] text-gray-100">
            <li>
              Todos los heaps son árboles binarios. No son necesariamente ABBs.
            </li>
            <li>
              El árbol está balanceado excepto el último nivel, que se llena de
              izquierda a derecha.
            </li>
            <li>
              Para un elemento del heap en la posición k, sus hijos están en las
              posiciones 2k y 2k+1.
            </li>
            <li>Un HEAP puede representarse en un arreglo.</li>
            <li>Toda lista ordenada es un heap.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
