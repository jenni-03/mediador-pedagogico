export function OperationListaDoble() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Doble
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Doblemente Enlazada
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Inserción */}
      <section className="space-y-4 text-sm leading-6">
        <h3 className="text-2xl font-bold text-white">
          Inserción de un Elemento en la Lista
        </h3>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción al Inicio
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para insertar un nodo al principio de la lista, se deben realizar
            los siguientes pasos:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor deseado.</li>
            <li>
              El campo <b>sig</b> del nuevo nodo apunta al nodo que era la
              cabeza.
            </li>
            <li>
              El campo <b>ant</b> del nuevo nodo se deja en{" "}
              <span className="text-cyan-300">NULL</span>.
            </li>
            <li>
              El nodo que era la cabeza ahora debe apuntar hacia atrás al nuevo
              nodo.
            </li>
            <li>
              Finalmente, la cabeza de la lista se actualiza al nuevo nodo.
            </li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción al Final
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para insertar un nodo al final, se realiza un recorrido desde la
            cabeza hasta llegar al último nodo (aquel cuyo campo <b>sig</b> es{" "}
            <span className="text-cyan-300">NULL</span>), y se siguen estos
            pasos:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor a insertar.</li>
            <li>
              El campo <b>ant</b> del nuevo nodo apunta al último nodo actual.
            </li>
            <li>
              El campo <b>sig</b> se deja como{" "}
              <span className="text-cyan-300">NULL</span>.
            </li>
            <li>
              El último nodo actual ahora apunta hacia adelante al nuevo nodo.
            </li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción Ordenada
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Este tipo de inserción permite mantener la lista ordenada al
            insertar elementos. El algoritmo debe:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              Recorrer la lista hasta encontrar el nodo correcto donde insertar.
            </li>
            <li>
              Comparar el valor a insertar con los datos de los nodos
              existentes.
            </li>
            <li>
              Actualizar los punteros <b>ant</b> y <b>sig</b> del nuevo nodo y
              de los nodos adyacentes.
            </li>
            <li>
              Si se inserta al principio o al final, se adapta el proceso como
              los casos anteriores.
            </li>
          </ul>
        </div>
      </section>

      {/* Recorrido en ambas direcciones */}
      <section className="mt-10 text-sm leading-6 space-y-6">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">
          Recorrido hacia adelante y hacia atrás
        </h3>
        <div className="bg-[#19191d] border-l-4 border-green-400 rounded-md p-4 shadow">
          <p>
            Una ventaja fundamental de la lista doble es su capacidad para ser
            recorrida en ambas direcciones:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              <b>Hacia adelante:</b> desde la cabeza, usando el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                sig
              </code>
              .
            </li>
            <li>
              <b>Hacia atrás:</b> desde el final, usando el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                ant
              </code>
              .
            </li>
          </ul>
          <p className="mt-2">
            Esto permite mayor eficiencia en operaciones de búsqueda, edición o
            eliminación dependiendo de la ubicación del elemento en la lista.
          </p>
        </div>
      </section>

      {/* Editar / Buscar / Eliminar */}
      <section className="mt-10 text-sm leading-6 space-y-8">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">Editar</h3>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
          <p>
            Editar un nodo consiste en buscar el nodo que contiene un valor
            específico y modificar su campo de información. Se puede recorrer
            desde cualquier extremo y al encontrar el nodo, se reemplaza su dato
            por el nuevo valor. Este proceso no requiere modificar punteros.
          </p>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Buscar</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Buscar en una lista doble permite recorrer desde la cabeza o desde
            el final, dependiendo de cuál sea más eficiente. Se compara el valor
            de cada nodo con el valor buscado:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              Si se encuentra, se puede retornar el nodo, su valor o su
              posición.
            </li>
            <li>
              Si no se encuentra, se devuelve <code>null</code> o un indicador
              de fallo.
            </li>
          </ul>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Eliminar</h3>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p>
            Eliminar un nodo en una lista doble requiere mantener la integridad
            de las conexiones en ambas direcciones. Para lograrlo:
          </p>
          <ul className="mt-3 space-y-2 list-inside">
            {[
              "Buscar el nodo que contiene el dato.",
              "Si el nodo tiene anterior, actualizar su puntero 'sig' al siguiente nodo.",
              "Si el nodo tiene siguiente, actualizar su puntero 'ant' al nodo anterior.",
              "Si es el nodo cabeza, actualizar la cabeza al siguiente nodo.",
              "Liberar la memoria del nodo eliminado (o dejar que el recolector lo haga).",
            ].map((step, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-400 font-semibold">{index + 1}.</span>{" "}
                {step}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Gracias a la doble conexión, esta operación es más flexible que en
            una lista simple, ya que no es necesario rastrear el nodo anterior
            durante el recorrido: ya está referenciado.
          </p>
        </div>
      </section>
    </div>
  );
}
