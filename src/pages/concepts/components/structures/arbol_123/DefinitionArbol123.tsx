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
        <div className="h-7 w-2 rounded bg-red-500" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol 1-2-3
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles enearios de orden tres
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición general */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-500">Definición</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p className="text-gray-100 text-[15.5px]">
            Un árbol <b>1-2-3</b> es un árbol n-ario de orden tres en el que
            cada nodo puede almacenar <b>uno o dos elementos</b> (claves), y por
            lo tanto puede tener <b>uno, dos o tres subárboles</b> asociados.
          </p>
        </div>

        {/* Resumen visual rápido */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="bg-[#151519] rounded-lg border border-red-500/60 p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-red-400 mb-1">
              Nodos
            </p>
            <p className="text-gray-100">
              Cada nodo tiene <b>1 o 2 elementos</b> (por ejemplo, 50 o 50–75).
            </p>
          </div>
          <div className="bg-[#151519] rounded-lg border border-red-500/60 p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-red-400 mb-1">
              Subárboles
            </p>
            <p className="text-gray-100">
              Según la cantidad de elementos, el nodo puede tener{" "}
              <b>1, 2 o 3 subárboles</b>.
            </p>
          </div>
          <div className="bg-[#151519] rounded-lg border border-red-500/60 p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-red-400 mb-1">
              Orden
            </p>
            <p className="text-gray-100">
              Los valores se distribuyen ordenados:{" "}
              <b>subárbol izquierdo &lt; raíces &lt; subárbol derecho</b>.
            </p>
          </div>
        </div>

        {/* Ejemplo global */}
        <div className="flex justify-center my-6">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Ejemplo general de árbol 1-2-3"
          />
        </div>
        <p className="text-gray-200 text-sm">
          <b>Nodo con dos elementos:</b> un nodo puede almacenar dos valores,
          como <span className="text-red-400">50</span> y{" "}
          <span className="text-red-400">75</span>, compartiendo los mismos
          subárboles.
        </p>
      </section>

      {/* Subárboles por nodo */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          ¿Cuántos subárboles puede tener un nodo?
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p className="text-gray-100 text-[15.5px] mb-2">
            Cada nodo de un árbol 1-2-3 tiene asociados <b>1, 2 o 3 subárboles</b>,
            según la cantidad de elementos que almacene.
          </p>
          <ul className="list-disc list-inside ml-3 mt-1 space-y-1 text-sm text-gray-100">
            <li>
              <b>1 subárbol:</b> nodo con un único elemento que solo tiene un
              hijo.
            </li>
            <li>
              <b>2 subárboles:</b> nodo (con uno o dos elementos) que conecta
              con dos subárboles.
            </li>
            <li>
              <b>3 subárboles:</b> caso típico de un nodo con dos elementos
              (como la raíz 50–75).
            </li>
          </ul>
        </div>

        <div className="flex justify-center my-6">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Subárboles asociados a cada nodo en un árbol 1-2-3"
          />
        </div>

        <div className="text-gray-200 text-sm">
          <b>Ejemplo:</b>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>
              El nodo <span className="text-red-400">60</span> tiene{" "}
              <b>1 subárbol</b>.
            </li>
            <li>
              El nodo <span className="text-red-400">80–90</span> tiene{" "}
              <b>2 subárboles</b>.
            </li>
            <li>
              La raíz <span className="text-red-400">50–75</span> tiene{" "}
              <b>3 subárboles</b>.
            </li>
          </ul>
        </div>
      </section>

      {/* Separador visual */}
      <div className="my-10 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Bloque de características de orden */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-7 w-2 rounded bg-red-600" />
          <h2 className="text-2xl font-extrabold tracking-wide drop-shadow">
            Características de orden
          </h2>
        </div>
        <span className="text-base text-red-400 ml-3 font-medium block mb-4">
          Árbol 1-2-3 como árbol de búsqueda
        </span>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="text-red-400 font-bold">★</span>{" "}
              <b>No hay elementos repetidos.</b>
            </li>
            <li>
              <span className="text-red-400 font-bold">★</span> En cada nodo con
              dos elementos, el de la izquierda (<b>raíz izquierda</b>) es
              <b> menor</b> que el de la derecha (<b>raíz derecha</b>).
            </li>
          </ul>
        </div>

        <div className="flex justify-center my-6">
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Raíz izquierda y raíz derecha en un nodo 1-2-3"
          />
        </div>

        <p className="text-gray-200 text-sm">
          Piensa en cada nodo con dos elementos como un “separador” que divide
          el árbol en tres zonas ordenadas.
        </p>

        {/* Esquema mental */}
        <div className="mt-4 bg-[#141418] border border-red-500/60 rounded-lg p-3 text-xs sm:text-sm text-gray-100">
          <p className="font-semibold mb-2 text-red-300">
            Esquema mental de orden:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full border border-red-500/70 bg-black/40">
              1.º subárbol: valores &lt; raíz izquierda
            </span>
            <span className="px-3 py-1 rounded-full border border-red-500/70 bg-black/40">
              raíz izquierda
            </span>
            <span className="px-3 py-1 rounded-full border border-red-500/70 bg-black/40">
              2.º subárbol: entre raíz izquierda y raíz derecha
            </span>
            <span className="px-3 py-1 rounded-full border border-red-500/70 bg-black/40">
              raíz derecha
            </span>
            <span className="px-3 py-1 rounded-full border border-red-500/70 bg-black/40">
              3.º subárbol: valores &gt; raíz derecha
            </span>
          </div>
        </div>
      </section>

      {/* Subárboles detallados */}
      <section className="mb-12">
        {/* Primer subárbol */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-[15.5px] text-gray-100">
            <span className="text-red-400 font-bold">★</span> El{" "}
            <b>primer subárbol</b> es un árbol 1-2-3 que contiene todos los
            elementos <b>menores que la raíz izquierda</b>.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Primer subárbol en árbol 1-2-3"
          />
        </div>

        {/* Segundo subárbol */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-[15.5px] text-gray-100">
            <span className="text-red-400 font-bold">★</span> El{" "}
            <b>segundo subárbol</b> contiene los elementos{" "}
            <b>mayores que la raíz izquierda</b> pero <b>menores que la raíz derecha</b>.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Segundo subárbol en árbol 1-2-3"
          />
        </div>

        {/* Tercer subárbol */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-[15.5px] text-gray-100">
            <span className="text-red-400 font-bold">★</span> El{" "}
            <b>tercer subárbol</b> agrupa los elementos{" "}
            <b>mayores que la raíz derecha</b>.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img6}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Tercer subárbol en árbol 1-2-3"
          />
        </div>

        {/* Caso especial: raíz derecha vacía */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-[15.5px] text-gray-100">
            <span className="text-red-400 font-bold">★</span> Si la{" "}
            <b>raíz derecha está vacía</b>, el <b>tercer subárbol</b> debe ser
            también vacío (el segundo subárbol puede existir o no).
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img7}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Caso especial: raíz derecha vacía en árbol 1-2-3"
          />
        </div>
      </section>
    </div>
  );
}
