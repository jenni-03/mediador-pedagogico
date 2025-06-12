export function OperationArbolBinario() {
  return (
    <div className="bg-[#101012] text-white min-h-screen py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Binario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol Binario
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* INSERTAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Insertar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p className="mb-4">
            Para insertar un nuevo nodo en un árbol binario, se parte desde la{" "}
            <b>raíz</b> y se compara el valor a insertar:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>
              Si el valor es{" "}
              <span className="text-cyan-400 font-semibold">menor</span>, se
              recorre el subárbol izquierdo.
            </li>
            <li>
              Si es <span className="text-cyan-400 font-semibold">mayor</span>,
              se recorre el subárbol derecho.
            </li>
            <li>
              Se repite hasta encontrar un nodo nulo donde se pueda insertar.
            </li>
          </ul>
          <p className="italic text-cyan-200">
            La estructura del árbol se mantiene balanceada si se insertan los
            nodos de forma ordenada.
          </p>
        </div>
      </section>

      {/* BUSCAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Buscar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p className="mb-4">Para buscar un valor en un árbol binario:</p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>Comparar el valor buscado con el nodo actual.</li>
            <li>Si coincide, se ha encontrado.</li>
            <li>
              Si es menor, se busca en el subárbol izquierdo; si es mayor, en el
              derecho.
            </li>
          </ul>
          <p className="italic text-cyan-200">
            Este proceso es eficiente (<b>O(log n)</b>) si el árbol está
            balanceado.
          </p>
        </div>
      </section>

      {/* EDITAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Editar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
          <p className="mb-4">
            Para editar un nodo, primero debes buscarlo y luego modificar su
            valor.
          </p>
          <div className="flex items-start gap-2">
            <span className="text-yellow-300 text-xl font-bold mt-1">⚠️</span>
            <p className="text-yellow-200">
              <span className="text-yellow-300 font-semibold">Importante:</span>{" "}
              Cambiar el valor puede violar la propiedad del árbol binario de
              búsqueda. Es recomendable eliminar el nodo y volver a insertarlo
              con el nuevo valor para mantener la estructura correcta.
            </p>
          </div>
        </div>
      </section>

      {/* ELIMINAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Eliminar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p className="mb-4">
            Eliminar un nodo en un árbol binario implica considerar tres casos:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>
              🔹 <b>Nodo hoja:</b> simplemente se elimina.
            </li>
            <li>
              🔹 <b>Nodo con un solo hijo:</b> se reemplaza por su hijo.
            </li>
            <li>
              🔹 <b>Nodo con dos hijos:</b> se reemplaza por su sucesor inorden
              (el menor del subárbol derecho).
            </li>
          </ul>
          <p className="italic text-red-300">
            Es esencial mantener el orden del árbol tras la eliminación para
            conservar su eficiencia y propiedad de búsqueda.
          </p>
        </div>
      </section>
    </div>
  );
}
