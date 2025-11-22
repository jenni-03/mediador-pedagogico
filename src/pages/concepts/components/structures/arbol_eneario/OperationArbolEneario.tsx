import imgInorden from "../../../../../assets/images/operation_eneario_1.jpg";
import imgPreorden from "../../../../../assets/images/operation_eneario_2.jpg";
import imgPosorden from "../../../../../assets/images/operation_eneario_3.jpg";

export function OperationArbolEneario() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
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
          <p className="block text-[15.5px] text-gray-100 mb-1">
            Igual que los árboles binarios, los árboles enearios pueden
            recorrerse de distintas formas. Cuando se representan con punteros{" "}
            <b>hijo</b> y <b>hermano</b>, los recorridos de profundidad más
            usados son:
          </p>
          <ul className="mt-2 text-[15px] text-gray-100 space-y-1 pl-2">
            <li>
              <span className="text-red-400">★</span> <b>Inorden</b>.
            </li>
            <li>
              <span className="text-red-400">★</span> <b>Preorden</b>.
            </li>
            <li>
              <span className="text-red-400">★</span> <b>Posorden</b>.
            </li>
          </ul>
          <p className="mt-2 text-[14px] text-gray-300">
            El recorrido <b>por niveles</b> también es posible (usando una cola),
            pero aquí nos centraremos en los recorridos de profundidad.
          </p>
        </div>
      </section>

      {/* Inorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Recorrido Inorden
        </h2>
        <span className="text-gray-300 text-sm mb-2 block">
          Observemos el siguiente árbol:
        </span>
        <div className="flex justify-center my-5">
          <img
            src={imgInorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Inorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-[15.5px] text-gray-100 mb-2">
            El recorrido <b>Inorden</b> de este árbol es:{" "}
            <span className="font-bold text-red-400">
              2, 1, 5, 3, 6, 10, 7, 4, 11, 8, 12, 13, 9
            </span>
            .
          </span>
          <span className="block text-gray-200 text-sm mb-2">
            Usando la representación hijo / hermano, el orden de visita es:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Visitar el{" "}
              <b>primer hijo</b> en Inorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Visitar el <b>padre</b>.
            </li>
            <li>
              <span className="text-red-400">★</span> Avanzar al{" "}
              <b>hermano</b> y repetir Inorden.
            </li>
          </ul>
        </div>
      </section>

      {/* Preorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Recorrido Preorden
        </h2>
        <span className="text-gray-300 text-sm mb-2 block">
          Veamos el siguiente árbol:
        </span>
        <div className="flex justify-center my-5">
          <img
            src={imgPreorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Preorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-gray-100 text-[15.5px] mb-2">
            Un árbol se recorre en <b>Preorden</b> siguiendo este patrón:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Visitar primero el{" "}
              <b>padre</b>.
            </li>
            <li>
              <span className="text-red-400">★</span> Recorrer el{" "}
              <b>primer hijo</b> en Preorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Continuar con cada{" "}
              <b>hermano</b> en Preorden.
            </li>
          </ul>
          <span className="block text-[15.5px] text-gray-100 mt-2">
            Siguiendo este orden, el recorrido del árbol mostrado es:{" "}
            <span className="font-bold text-red-400">
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
            </span>
            .
          </span>
        </div>
      </section>

      {/* Posorden */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Recorrido en Posorden
        </h2>
        <span className="text-gray-300 text-sm mb-2 block">
          Observemos el siguiente árbol:
        </span>
        <div className="flex justify-center my-5">
          <img
            src={imgPosorden}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Recorrido Posorden Eneario"
          />
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <span className="block text-gray-100 text-[15.5px] mb-2">
            El recorrido en <b>Posorden</b> de este árbol sigue la regla:
          </span>
          <ul className="space-y-1 text-[15px] text-gray-100 pl-2">
            <li>
              <span className="text-red-400">★</span> Visitar primero cada{" "}
              <b>hijo</b> en Posorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Continuar con cada{" "}
              <b>hermano</b> en Posorden.
            </li>
            <li>
              <span className="text-red-400">★</span> Visitar al final el{" "}
              <b>padre</b>.
            </li>
          </ul>
          <span className="block text-[15.5px] text-gray-100 mt-2">
            Aplicando estas reglas, el recorrido resultante es:{" "}
            <span className="font-bold text-red-400">
              2, 10, 13, 14, 15, 11, 12, 3, 9, 1
            </span>
            .
          </span>
        </div>
      </section>
    </div>
  );
}
