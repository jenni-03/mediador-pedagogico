export function OperationListaCDoble() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Circular Doble
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Circular Doblemente Enlazada
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* ============ INSERCIÓN ============ */}
      <section className="space-y-5 text-sm leading-6">
        <h3 className="text-2xl font-bold text-white">
          Inserción de elementos en la lista
        </h3>

        {/* Resumen modos de inserción */}
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-2">
          <p>
            En una <b>lista circular doble</b>, el primer nodo (cabeza) está
            conectado con el último y viceversa. Un nuevo nodo puede insertarse:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Al inicio (nueva cabeza).</li>
            <li>Al final (nuevo último nodo).</li>
            <li>De forma ordenada, manteniendo la lista en orden.</li>
          </ul>
        </div>

        {/* Inserción al inicio */}
        <h4 className="text-xl font-semibold text-red-400">
          Inserción al inicio
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>Para insertar un nodo al principio de la lista:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor deseado.</li>
            <li>
              Hacer que el nuevo nodo apunte hacia adelante (<b>sig</b>) a la
              cabeza actual.
            </li>
            <li>
              Hacer que el nuevo nodo apunte hacia atrás (<b>ant</b>) al nodo
              final.
            </li>
            <li>
              El nodo final actual actualiza su puntero <b>sig</b> al nuevo
              nodo.
            </li>
            <li>
              La cabeza anterior actualiza su puntero <b>ant</b> al nuevo nodo.
            </li>
            <li>Actualizar la referencia de cabeza para que sea el nuevo nodo.</li>
          </ul>
        </div>

        {/* Inserción al final */}
        <h4 className="text-xl font-semibold text-red-400">
          Inserción al final
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>Para insertar un nodo al final de la lista:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Crear un nuevo nodo con el valor a insertar.</li>
            <li>
              El nuevo nodo apunta hacia atrás (<b>ant</b>) al nodo final
              actual.
            </li>
            <li>
              El nuevo nodo apunta hacia adelante (<b>sig</b>) a la cabeza.
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

        {/* Inserción ordenada */}
        <h4 className="text-xl font-semibold text-red-400">
          Inserción ordenada
        </h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para mantener la lista en orden (por ejemplo, ascendente), se
            recorre desde la cabeza hasta encontrar la posición adecuada:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              Si el nuevo valor es menor que el de la cabeza, se usa la lógica
              de <b>inserción al inicio</b>.
            </li>
            <li>
              Se avanza nodo a nodo comparando valores hasta encontrar el nodo
              inmediatamente mayor.
            </li>
            <li>
              El nuevo nodo se inserta entre el nodo anterior y el actual,
              actualizando sus punteros <b>ant</b> y <b>sig</b>.
            </li>
            <li>
              Si se vuelve a la cabeza sin haber insertado, el nuevo nodo se
              agrega al final.
            </li>
          </ul>
        </div>
      </section>

      {/* ============ RECORRIDO CIRCULAR ============ */}
      <section className="mt-10 text-sm leading-6 space-y-4">
        <h3 className="text-2xl font-semibold text-red-400 mb-1">
          Recorrido circular en ambos sentidos
        </h3>
        <div className="bg-[#19191d] border-l-4 border-green-400 rounded-md p-4 shadow">
          <p>
            En la lista circular doble se puede recorrer la estructura de forma
            continua:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              <b>Hacia adelante:</b> partiendo de la cabeza y usando el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                sig
              </code>
              , hasta volver de nuevo a la cabeza.
            </li>
            <li>
              <b>Hacia atrás:</b> partiendo del último nodo y usando el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                ant
              </code>
              .
            </li>
          </ul>
          <p className="mt-2">
            Esta propiedad es útil para operaciones donde interesa “ciclar”
            sobre los elementos (menús circulares, turnos, buffers, etc.).
          </p>
        </div>
      </section>

      {/* ============ EDITAR / BUSCAR / ELIMINAR ============ */}
      <section className="mt-10 text-sm leading-6 space-y-8 mb-6">
        {/* Editar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Editar</h3>
          <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
            <p>
              Editar un nodo consiste en localizarlo y modificar su campo de
              información. No es necesario tocar los punteros:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Elegir un punto de inicio (cabeza o último nodo).</li>
              <li>
                Recorrer con <b>sig</b> o <b>ant</b> hasta encontrar el valor
                buscado o volver al punto de inicio.
              </li>
              <li>Reemplazar el dato almacenado por el nuevo valor.</li>
            </ul>
          </div>
        </div>

        {/* Buscar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Buscar</h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
            <p>
              La búsqueda puede iniciarse desde la cabeza o desde el final,
              según convenga:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>
                Se compara el dato de cada nodo con el valor buscado mientras no
                se haya completado un ciclo.
              </li>
              <li>
                Si se encuentra, se retorna la referencia al nodo, su posición o
                un indicador de éxito.
              </li>
              <li>
                Si se recorre la lista completa y se vuelve al inicio sin
                encontrarlo, se devuelve{" "}
                <code className="bg-black/70 px-2 rounded">null</code> o un
                indicador de fallo.
              </li>
            </ul>
          </div>
        </div>

        {/* Eliminar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Eliminar</h3>
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
            <p>
              Eliminar un nodo requiere mantener el ciclo y ajustar los enlaces
              en ambos sentidos:
            </p>
            <ul className="mt-3 space-y-2 list-inside">
              {[
                "Localizar el nodo a eliminar (puede hacerse recorriendo con 'sig' o 'ant').",
                "Si la lista solo tiene un nodo, al eliminarlo la lista queda vacía.",
                "Si el nodo es la cabeza, mover la cabeza al nodo siguiente.",
                "El nodo anterior conecta su puntero 'sig' con el nodo siguiente.",
                "El nodo siguiente conecta su puntero 'ant' con el nodo anterior.",
                "Liberar el nodo eliminado (o permitir que el recolector de basura lo gestione).",
              ].map((step, index) => (
                <li key={index} className="text-sm">
                  <span className="text-red-400 font-semibold">
                    {index + 1}.
                  </span>{" "}
                  {step}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Gracias a la doble conexión, no es necesario recordar el nodo
              anterior durante el recorrido: el propio nodo eliminado ya tiene
              referencia a él mediante <b>ant</b>, lo que simplifica la
              operación.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
