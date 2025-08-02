import img1 from "../../../../../assets/images/definicion_123_1.jpg";
import img2 from "../../../../../assets/images/definicion_123_2.jpg";
import img3 from "../../../../../assets/images/definicion_123_3.jpg";
import img4 from "../../../../../assets/images/definicion_123_4.jpg";
import img5 from "../../../../../assets/images/definicion_123_5.jpg";
import img6 from "../../../../../assets/images/definicion_123_6.jpg";
import img7 from "../../../../../assets/images/definicion_123_7.jpg";

export function DefinitionArbol123() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol 1-2-3
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles Enearios
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2 text-red-500">Definición</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 text-[15.5px]">
            Un árbol <b>1-2-3</b> es un árbol n-ario de orden tres, donde cada
            nodo tiene uno o dos elementos.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Árbol 1-2-3 ejemplo nodo"
          />
        </div>
        <p className="text-gray-200 text-sm mb-6">
          <b>Nodo con dos elementos:</b> Un nodo puede almacenar dos valores,
          como <span className="text-red-400">50</span> y{" "}
          <span className="text-red-400">75</span>.
        </p>
      </section>

      {/* Subárboles */}
      <section className="mb-10">
        <div className="text-gray-200 text-sm mb-2">
          Cada nodo tiene <b>1</b>, <b>2</b> o <b>3</b> subárboles asociados.
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Árbol 1-2-3 con subárboles"
          />
        </div>
        <div className="text-gray-200 text-sm mt-2">
          <b>Ejemplo:</b>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>
              Un nodo puede tener{" "}
              <span className="font-bold text-red-400">1 subárbol</span> (como
              el nodo que contiene 60).
            </li>
            <li>
              Otro puede tener{" "}
              <span className="font-bold text-red-400">2 subárboles</span> (como
              el nodo que contiene 80 y 90).
            </li>
            <li>
              Y otro puede tener{" "}
              <span className="font-bold text-red-400">3 subárboles</span> (como
              el nodo raíz 50 y 75).
            </li>
          </ul>
        </div>
      </section>

      {/* Separador */}
      <div className="my-12 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Header de la sección "Balancear el Árbol" */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Características
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol 1-2-3
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Características */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span> No hay elementos
              repetidos.
            </li>
            <li>
              <span className="text-red-400 font-bold">★</span> El elemento de
              la izquierda de cada nodo (<b>raíz izquierda</b>) es menor que el
              elemento de su derecha (<b>raíz derecha</b>).
            </li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Raíces izquierda y derecha"
          />
        </div>
        <div className="text-gray-200 text-sm mb-6">
          <b>Raíz izquierda:</b> Siempre menor que la raíz derecha en el mismo
          nodo.
        </div>
      </section>

      {/* Subárboles detallados */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span> El primer
              subárbol es un Árbol 1-2-3 que contiene los elementos menores que
              la raíz izquierda.
            </li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Primer subárbol"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span> El segundo
              subárbol es un Árbol 1-2-3 que contiene los elementos mayores que
              la raíz izquierda pero menores que la raíz derecha.
            </li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Tercer subárbol"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span> El tercer
              subárbol es un Árbol 1-2-3 que contiene los elementos mayores que
              la raíz derecha.
            </li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img6}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Subárbol vacío"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span> Si la raíz
              derecha está vacía, su tercer subárbol debe ser vacío (El segundo
              puede o no ser vacío).
            </li>
          </ul>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img7}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Subárbol vacío"
          />
        </div>
      </section>
    </div>
  );
}
