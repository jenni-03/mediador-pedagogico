export function OperationListaCSimple() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Circular Simple
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Circular Simplemente Enlazada
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
            En una lista circular simple, el último nodo apunta siempre a la cabeza.  
            Para insertar al inicio:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo y asignarle el valor.</li>
            <li>Hacer que el campo <b>sig</b> del nuevo nodo apunte a la cabeza actual.</li>
            <li>Recorrer hasta el último nodo (que apunta a la cabeza) y actualizar su puntero para que apunte al nuevo nodo.</li>
            <li>Actualizar la cabeza al nuevo nodo.</li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción al Final
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para insertar al final:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear el nuevo nodo.</li>
            <li>Recorrer la lista hasta el último nodo (aquel que apunta a la cabeza).</li>
            <li>El puntero <b>sig</b> del último nodo se actualiza para apuntar al nuevo nodo.</li>
            <li>El nuevo nodo ahora apunta a la cabeza, manteniendo la circularidad.</li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción Ordenada
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            La inserción ordenada requiere tener en cuenta que el recorrido es circular:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Comenzar en la cabeza y avanzar hasta encontrar la posición correcta.</li>
            <li>Si el valor es menor que la cabeza, se usa la lógica de inserción al inicio.</li>
            <li>Actualizar los punteros del nodo anterior y del nuevo nodo sin romper la conexión circular.</li>
          </ul>
        </div>
      </section>

      {/* Editar / Buscar / Eliminar */}
      <section className="mt-10 text-sm leading-6 space-y-8">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">Editar</h3>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
          <p>
            Editar en una lista circular es similar a la lista simple, con la diferencia
            de que el recorrido debe detectar cuando se ha completado el ciclo. Si se encuentra el nodo,
            se reemplaza el dato sin modificar los enlaces.
          </p>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Buscar</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            La búsqueda también requiere controlar que no se entre en un bucle infinito. Se recorre nodo a nodo
            hasta volver a la cabeza, o hasta encontrar el valor buscado.
          </p>
          <p className="mt-2">Si no se encuentra, se devuelve <code>null</code> o un indicador de fallo.</p>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Eliminar</h3>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p>
            Eliminar un nodo en una lista circular requiere especial cuidado para no romper el enlace que asegura la circularidad:
          </p>
          <ul className="mt-3 space-y-2 list-inside">
            {[
              "Buscar el nodo que contiene el dato y el nodo anterior.",
              "Si el nodo a eliminar es la cabeza, actualizar la cabeza al siguiente nodo y ajustar el puntero del último nodo para que apunte a la nueva cabeza.",
              "Si es cualquier otro nodo, el nodo anterior apunta al nodo siguiente al eliminado.",
              "Liberar el nodo eliminado.",
            ].map((step, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-400 font-semibold">{index + 1}.</span>{" "}
                {step}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Si después de eliminar solo queda un nodo, este apunta a sí mismo, manteniendo la estructura circular.
          </p>
        </div>
      </section>
    </div>
  );
}
