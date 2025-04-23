export function OperationListaSimple() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <h1 className="text-3xl font-extrabold text-white mb-1">Operaciones</h1>
      <h2 className="text-sm text-red-400 mb-4">Lista Simple</h2>
      <hr className="border-t-2 border-red-500 mb-6 w-full" />

      {/* Inserción */}
      <section className="space-y-4 text-sm text-gray-300 leading-6">
        <h3 className="text-2xl font-bold text-red-500">
          Inserción de un Elemento en la Lista
        </h3>

        <div className="mt-6">
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción al Inicio
          </h4>
          <p>
            El nuevo elemento que se desea incorporar a una lista se puede insertar de distintas formas, según la posición de inserción. Ésta puede ser:
          </p>
          <ul className="ml-4 list-disc">
            <li>✨ En la cabeza (elemento primero) de la lista.</li>
            <li>✨ En el final de la lista (elemento último).</li>
            <li>✨ Ordenado.</li>
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción al Final
          </h4>
          <p>
            El nuevo elemento que se desea incorporar a una lista se puede insertar de distintas formas, según la posición de inserción. Ésta puede ser:
          </p>
          <ul className="ml-4 list-disc">
            <li>✨ En la cabeza (elemento primero) de la lista.</li>
            <li>✨ En el final de la lista (elemento último).</li>
            <li>✨ Ordenado.</li>
          </ul>
        </div>

        <div className="mt-6">
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción Ordenada
          </h4>
          <p>
            El nuevo elemento que se desea incorporar a una lista se puede insertar de distintas formas, según la posición de inserción. Ésta puede ser:
          </p>
          <ul className="ml-4 list-disc">
            <li>✨ En la cabeza (elemento primero) de la lista.</li>
            <li>✨ En el final de la lista (elemento último).</li>
            <li>✨ Ordenado.</li>
          </ul>
        </div>
      </section>

      {/* Editar / Buscar / Eliminar */}
      <section className="mt-10 text-sm text-gray-300 leading-6 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-red-500 mb-2">Editar</h3>
          <p>
            La operación editar un elemento recorre la lista hasta encontrar el nodo deseado y modifica su información. Puede devolver la referencia al nodo modificado o simplemente un valor booleano indicando el éxito de la operación.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-red-500 mb-2">Buscar</h3>
          <p>
            La búsqueda recorre la lista hasta encontrar el nodo con el elemento solicitado. Devuelve la referencia al nodo o <code>null</code> si no se encuentra. Alternativamente puede devolver un booleano.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-red-500 mb-2">Eliminar</h3>
          <p>
            La operación de eliminar un nodo requiere actualizar el enlace del nodo anterior para que apunte al nodo siguiente y liberar la memoria del nodo eliminado.
          </p>
          <ul className="mt-3 space-y-2 list-decimal list-inside text-gray-300">
            {[
              "Buscar el nodo a eliminar y su anterior.",
              "Actualizar el enlace del nodo anterior al nodo siguiente.",
              "Si el nodo a eliminar es la cabeza, actualizar la cabeza al siguiente nodo.",
              "Liberar la memoria del nodo eliminado.",
            ].map((step, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-400 font-semibold">{index + 1}.</span> {step}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            Para listas dobles o circulares dobles, se deben actualizar tanto la referencia adelante como atrás:
          </p>
          <ul className="mt-3 space-y-2 list-decimal list-inside text-gray-300">
            {[
              "Buscar el nodo que contiene el dato.",
              "Actualizar la referencia adelante del nodo anterior.",
              "Actualizar la referencia atrás del nodo siguiente.",
              "Si es el nodo cabeza, actualizar la cabeza.",
              "La memoria del nodo se libera automáticamente.",
            ].map((step, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-400 font-semibold">{index + 1}.</span> {step}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
