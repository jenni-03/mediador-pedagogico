export function OperationArbolAVL() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol AVL
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol Binario Balanceado (AVL)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* INSERTAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Insertar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-3">
          <p className="mb-4">
            Para insertar un nodo en un <b>Árbol AVL</b>, se parte desde la raíz
            como en un ABB:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>Comparar el valor con el nodo actual.</li>
            <li>
              Si es menor, recorrer el subárbol izquierdo; si es mayor, el
              derecho.
            </li>
            <li>
              Repetir hasta encontrar una posición nula e insertar el nodo.
            </li>
          </ul>
          <p className="italic text-red-300">
            Después de insertar, es necesario verificar y{" "}
            <span className="text-red-400 font-semibold">rebalancear</span> el
            árbol desde el nodo insertado hasta la raíz para asegurar que todos
            los factores de equilibrio estén en el rango [-1, 0, 1].
          </p>
        </div>
      </section>

      {/* BUSCAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          <span>Buscar</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-3">
          <p className="mb-4">Buscar en un Árbol AVL es igual que en un ABB:</p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>Comparar el valor buscado con el nodo actual.</li>
            <li>Si coincide, se ha encontrado el nodo.</li>
            <li>
              Si es menor, buscar en el subárbol izquierdo; si es mayor, en el
              derecho.
            </li>
          </ul>
          <p className="italic text-red-300">
            La búsqueda mantiene eficiencia <b>O(log n)</b> ya que el AVL
            siempre está balanceado.
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
            Para editar el valor de un nodo, primero debes buscarlo. Si el nuevo
            valor altera el orden del árbol, es recomendable eliminar el nodo y
            volver a insertarlo.
          </p>
          <div className="flex items-start gap-2">
            <span className="text-yellow-300 text-xl font-bold mt-1">⚠️</span>
            <p className="text-yellow-200">
              <span className="text-yellow-300 font-semibold">Importante:</span>{" "}
              Cambiar el valor directamente puede romper la propiedad AVL y el
              orden. Lo correcto es eliminar y volver a insertar el nodo con el
              nuevo valor, reequilibrando si es necesario.
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
            Al eliminar un nodo en un <b>Árbol AVL</b> debes considerar los
            mismos tres casos que en un ABB, pero además:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-2 mb-3 text-[15px]">
            <li>
              🔹 <b>Nodo hoja:</b> simplemente se elimina.
            </li>
            <li>
              🔹 <b>Nodo con un solo hijo:</b> se reemplaza por su hijo.
            </li>
            <li>
              🔹 <b>Nodo con dos hijos:</b> se reemplaza por el sucesor inorden
              (menor del subárbol derecho).
            </li>
          </ul>
          <p className="italic text-red-300 mb-1">
            Después de eliminar, debes{" "}
            <span className="text-red-400 font-semibold">
              verificar y rebalancear
            </span>{" "}
            el árbol desde el nodo afectado hasta la raíz, aplicando rotaciones
            simples o dobles si algún nodo queda con un factor de equilibrio
            fuera de [-1, 0, 1].
          </p>
        </div>
      </section>
    </div>
  );
}

