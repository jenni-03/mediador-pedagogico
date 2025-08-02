import imgInorden from "../../../../../assets/images/operation_eneario_1.jpg";
import imgPreorden from "../../../../../assets/images/operation_eneario_2.jpg";
import imgPosorden from "../../../../../assets/images/operation_eneario_3.jpg";

export function OperationArbolEneario() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Eneario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Recorridos y algoritmos clásicos
      </span>
      <hr className="border-t-2 border-red-500 mb-10 w-40 rounded" />

      {/* Intro */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-[15.5px] text-gray-100">
            Lo mismo que los Árboles Binarios, los Árboles Enearios pueden recorrerse de 4 formas: <b>Inorden, Preorden, Posorden y por niveles</b>. Veamos cada uno de ellos.
          </span>
        </div>
      </section>

      {/* Inorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">Recorrido Inorden</h2>
        <span className="text-gray-300 text-sm mb-2 block">Observemos el siguiente Árbol:</span>
        <div className="flex justify-center my-5">
          <img
            src={imgInorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Inorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-[15.5px] text-gray-100 mb-2">
            El recorrido <b>Inorden</b> es: <span className="font-bold text-red-400">2, 1, 5, 3, 6, 10, 7, 4, 11, 8, 12, 13, 9</span>.
          </span>
          <span className="block text-gray-200 text-sm mb-2">
            El Orden del recorrido es:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Primer Hijo en Inorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Padre.
            </li>
            <li>
              <span className="text-red-400">★</span> Hermano en Inorden.
            </li>
          </ul>
        </div>
      </section>

      {/* Preorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">Recorrido Preorden</h2>
        <span className="text-gray-300 text-sm mb-2 block">Vemos el siguiente Árbol:</span>
        <div className="flex justify-center my-5">
          <img
            src={imgPreorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Preorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-gray-100 text-[15.5px] mb-2">
            Un Árbol se recorre el <b>Preorden</b>, así:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Padre.
            </li>
            <li>
              <span className="text-red-400">★</span> Primer hijo en Preorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Hermano en Preorden.
            </li>
          </ul>
          <span className="block text-[15.5px] text-gray-100 mt-2">
            Siguiendo este orden, el recorrido es: <span className="font-bold text-red-400">1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.</span>
          </span>
        </div>
      </section>

      {/* Posorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">Recorrido en Posorden</h2>
        <span className="text-gray-300 text-sm mb-2 block">Observemos el siguiente Árbol:</span>
        <div className="flex justify-center my-5">
          <img
            src={imgPosorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Posorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-gray-100 text-[15.5px] mb-2">
            El recorrido en <b>Posorden</b> del anterior Árbol es:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Hijo en Posorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Hermano en Posorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Padre.
            </li>
          </ul>
          <span className="block text-[15.5px] text-gray-100 mt-2">
            Con lo cual el árbol anterior en Posorden es: <span className="font-bold text-red-400">2, 10, 13, 14, 15, 11, 12, 3, 9, 1.</span>
          </span>
        </div>
      </section>
    </div>
  );
}
