export function OperationListaCDoble() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Circular Doble
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Circular Doblemente Enlazada
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
            En una lista circular doble, el primer nodo (cabeza) está conectado
            con el último, y viceversa. Para insertar al inicio:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor deseado.</li>
            <li>
              El nuevo nodo apunta hacia adelante al nodo cabeza actual y hacia
              atrás al nodo final.
            </li>
            <li>
              El nodo final debe actualizar su puntero <b>sig</b> al nuevo nodo.
            </li>
            <li>
              La cabeza actual debe apuntar hacia atrás (<b>ant</b>) al nuevo
              nodo.
            </li>
            <li>Actualizar la cabeza al nuevo nodo.</li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción al Final
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>Para insertar al final:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor a insertar.</li>
            <li>
              El nuevo nodo apunta hacia atrás al nodo final actual y hacia
              adelante a la cabeza.
            </li>
            <li>
              El nodo final actual actualiza su puntero <b>sig</b> para apuntar
              al nuevo nodo.
            </li>
            <li>
              La cabeza actual actualiza su puntero <b>ant</b> para apuntar al
              nuevo nodo.
            </li>
          </ul>
        </div>

        <h4 className="text-2xl font-semibold text-red-400 mb-2">
          Inserción Ordenada
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para mantener la lista ordenada, se recorre desde la cabeza
            comparando valores hasta encontrar el punto adecuado:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              Si el nuevo valor es menor que el de la cabeza, se usa la lógica
              de inserción al inicio.
            </li>
            <li>
              Si se llega nuevamente a la cabeza sin insertar, el nuevo nodo se
              agrega al final.
            </li>
            <li>
              Los punteros <b>ant</b> y <b>sig</b> de los nodos adyacentes se
              actualizan para enlazar correctamente al nuevo nodo.
            </li>
          </ul>
        </div>
      </section>

      {/* Editar / Buscar / Eliminar */}
      <section className="mt-10 text-sm leading-6 space-y-8">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">Editar</h3>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
          <p>
            Editar un nodo en esta estructura es eficiente, ya que se puede
            recorrer desde cualquier extremo. Una vez localizado el nodo, se
            modifica su valor sin necesidad de ajustar los punteros.
          </p>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Buscar</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            La búsqueda se puede hacer desde la cabeza o desde el final,
            recorriendo con los punteros <b>sig</b> o <b>ant</b>. El recorrido
            finaliza cuando se vuelve al punto de inicio o cuando se encuentra
            el valor buscado.
          </p>
        </div>

        <h3 className="text-2xl font-semibold text-red-400 mb-2">Eliminar</h3>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p>
            Eliminar en una lista circular doble requiere ajustar correctamente
            los enlaces de ambos lados y considerar el caso donde se elimina la
            cabeza:
          </p>
          <ul className="mt-3 space-y-2 list-inside">
            {[
              "Localizar el nodo a eliminar.",
              "Si el nodo es el único de la lista, la lista queda vacía.",
              "Si el nodo es la cabeza, se actualiza la cabeza al nodo siguiente.",
              "El nodo anterior al eliminado apunta con 'sig' al nodo siguiente.",
              "El nodo siguiente al eliminado apunta con 'ant' al nodo anterior.",
              "Liberar el nodo eliminado (o permitir que el recolector lo maneje).",
            ].map((step, index) => (
              <li key={index} className="text-sm">
                <span className="text-red-400 font-semibold">{index + 1}.</span>{" "}
                {step}
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Gracias a su doble conexión, no es necesario buscar el nodo anterior
            antes de eliminar, lo que simplifica la operación.
          </p>
        </div>
      </section>
    </div>
  );
}
