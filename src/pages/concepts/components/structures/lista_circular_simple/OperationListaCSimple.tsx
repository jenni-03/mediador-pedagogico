export function OperationListaCSimple() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Circular Simple
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Circular Simplemente Enlazada
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* INSERCIÓN */}
      <section className="space-y-5 text-sm leading-6">
        <h3 className="text-2xl font-bold text-white">
          Inserción de un elemento en la lista
        </h3>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
          <p>
            En una lista circular simple el <b>último nodo</b> siempre apunta a
            la <b>cabeza</b>, cerrando el ciclo. Cualquier inserción debe
            respetar esta propiedad para no “romper el círculo”.
          </p>
          <p className="text-gray-300">
            A continuación se describen las tres formas típicas de inserción:
            al inicio, al final y de forma ordenada.
          </p>
        </div>

        {/* Inserción al inicio */}
        <h4 className="text-xl font-semibold text-red-400 mt-4">
          Inserción al inicio
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3 space-y-2">
          <p>
            La cabeza cambia y el último nodo debe apuntar a la nueva cabeza:
          </p>
          <ul className="list-none ml-1 mt-1 space-y-1">
            {[
              "Crear un nuevo nodo y asignarle el valor.",
              "Hacer que el campo «sig» del nuevo nodo apunte a la cabeza actual.",
              "Recorrer la lista hasta el último nodo (el que apunta a la cabeza antigua).",
              "Actualizar el «sig» del último nodo para que apunte al nuevo nodo.",
              "Actualizar la referencia de cabeza para que sea el nuevo nodo.",
            ].map((step, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-cyan-300 font-semibold mt-[2px]">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-300 mt-1">
            Después de estos pasos, el recorrido desde la nueva cabeza volverá a
            ella misma tras una vuelta completa.
          </p>
        </div>

        {/* Inserción al final */}
        <h4 className="text-xl font-semibold text-red-400">
          Inserción al final
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3 space-y-2">
          <p>
            En este caso la cabeza se mantiene, pero se actualiza el último
            nodo:
          </p>
          <ul className="list-none ml-1 mt-1 space-y-1">
            {[
              "Crear el nuevo nodo con el valor a insertar.",
              "Recorrer desde la cabeza hasta el nodo cuyo «sig» apunta a la cabeza (último nodo actual).",
              "Hacer que el «sig» del último nodo apunte al nuevo nodo.",
              "Hacer que el «sig» del nuevo nodo apunte a la cabeza para conservar la circularidad.",
            ].map((step, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-cyan-300 font-semibold mt-[2px]">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Inserción ordenada */}
        <h4 className="text-xl font-semibold text-red-400">
          Inserción ordenada
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3 space-y-2">
          <p>
            Se desea mantener la lista ordenada ascendentemente por el dato:
          </p>
          <ul className="list-none ml-1 mt-1 space-y-1">
            {[
              "Si la lista está vacía, el nuevo nodo se convierte en cabeza y su «sig» apunta a sí mismo.",
              "Si el valor es menor que el de la cabeza, se aplica la lógica de inserción al inicio.",
              "En otro caso, recorrer desde la cabeza mientras el siguiente nodo tenga un valor menor al que se desea insertar y no se haya vuelto a la cabeza.",
              "Insertar el nuevo nodo entre el nodo actual y su siguiente, actualizando los punteros «sig» correspondientes.",
            ].map((step, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="text-cyan-300 font-semibold mt-[2px]">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-300 mt-1">
            Es importante detener el recorrido si se vuelve a la cabeza para
            evitar bucles infinitos.
          </p>
        </div>
      </section>

      {/* EDITAR / BUSCAR / ELIMINAR */}
      <section className="mt-10 text-sm leading-6 space-y-8">
        {/* Editar */}
        <div>
          <h3 className="text-2xl font-semibold text-yellow-300 mb-2">
            Editar
          </h3>
          <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow space-y-2">
            <p>
              Editar un nodo consiste en localizarlo en el ciclo y reemplazar su
              información:
            </p>
            <ul className="list-none ml-1 mt-1 space-y-1">
              {[
                "Iniciar el recorrido en la cabeza (o en el cursor elegido).",
                "Avanzar nodo a nodo comparando el dato con el valor buscado.",
                "Detenerse si se encuentra el nodo o si se regresa a la cabeza.",
                "Si se encontró, modificar el campo de información; los punteros no cambian.",
              ].map((step, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-yellow-300 font-semibold mt-[2px]">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Buscar */}
        <div>
          <h3 className="text-2xl font-semibold text-cyan-300 mb-2">
            Buscar
          </h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
            <p>
              La búsqueda es secuencial, pero debe cuidar no caer en un ciclo
              infinito:
            </p>
            <ul className="list-none ml-1 mt-1 space-y-1">
              {[
                "Comenzar en la cabeza y recorrer usando el puntero «sig».",
                "En cada nodo comparar el dato almacenado con el valor buscado.",
                "Si se encuentra, devolver la referencia al nodo o su posición.",
                "Si se regresa a la cabeza sin encontrarlo, la búsqueda termina sin éxito (se puede devolver null).",
              ].map((step, i) => (
                <li key={i} className="flex gap-2 items-start">
                  <span className="text-cyan-300 font-semibold mt-[2px]">
                    {i + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Eliminar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">
            Eliminar
          </h3>
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3 space-y-2">
            <p>
              Al eliminar un nodo, se debe mantener el ciclo sin romper la
              referencia entre el último nodo y la cabeza:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                "Buscar el nodo que contiene el dato y mantener también una referencia al nodo anterior.",
                "Si el nodo a eliminar es la cabeza, localizar además el último nodo para poder redirigir su puntero.",
                "Si se elimina la cabeza: la nueva cabeza será su nodo siguiente y el último nodo debe apuntar a esa nueva cabeza.",
                "Si es un nodo intermedio o el último: el nodo anterior apuntará al nodo siguiente del que se elimina.",
                "Liberar el nodo eliminado (o dejar que el recolector de basura se encargue).",
              ].map((step, index) => (
                <li key={index} className="text-sm flex gap-2">
                  <span className="text-red-400 font-semibold mt-[2px]">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-gray-300">
              Si después de la eliminación solo queda un nodo, su puntero{" "}
              <b>sig</b> debe apuntar a sí mismo, conservando la estructura
              circular incluso en el caso mínimo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
