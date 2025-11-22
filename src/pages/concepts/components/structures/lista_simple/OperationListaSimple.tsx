export function OperationListaSimple() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Simple
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Inserción · Búsqueda · Edición · Eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* ================== INSERCIÓN ================== */}
      <section className="space-y-6 text-sm leading-6">
        <h2 className="text-2xl font-bold text-white">
          Inserción de elementos en la Lista
        </h2>

        {/* Resumen de posiciones */}
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
          <p>
            El nuevo nodo puede insertarse en distintas posiciones, según la
            estrategia que se quiera usar:
          </p>
          <ul className="list-disc ml-4 space-y-1">
            <li>
              <b>Al inicio</b>: el nuevo nodo se convierte en la cabeza.
            </li>
            <li>
              <b>Al final</b>: se agrega detrás del último nodo.
            </li>
            <li>
              <b>De forma ordenada</b>: se ubica respetando un criterio (por
              ejemplo, de menor a mayor).
            </li>
          </ul>
          <p className="text-xs text-gray-400 mt-1">
            Nota: En todos los casos el trabajo consiste en ajustar el puntero{" "}
            <code className="bg-black/60 px-1 rounded text-cyan-200">sig</code>{" "}
            de uno o más nodos.
          </p>
        </div>

        {/* Inserción al inicio */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-red-400">
            Inserción al inicio (cabeza)
          </h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
            <p>
              Se usa cuando queremos que el nuevo dato quede como primer nodo de
              la lista.
            </p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Crear un nodo con la información a insertar.</li>
              <li>
                Apuntar su puntero{" "}
                <code className="bg-black/60 px-1 rounded text-cyan-200">
                  sig
                </code>{" "}
                a la cabeza actual.
              </li>
              <li>Actualizar la cabeza para que sea el nuevo nodo.</li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`nuevo = crearNodo(dato)
nuevo.sig = cabeza
cabeza = nuevo`}
              </pre>
              <p className="text-[11px] text-emerald-300 mt-1">
                Costo: O(1) — siempre se realizan las mismas operaciones.
              </p>
            </div>
          </div>
        </div>

        {/* Inserción al final */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-red-400">
            Inserción al final
          </h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
            <p>
              El nuevo nodo se coloca como último elemento de la lista,
              apuntando a <span className="text-cyan-300">NULL</span>.
            </p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Crear el nuevo nodo con el dato y puntero sig = NULL.</li>
              <li>
                Si la lista está vacía, la cabeza pasa a ser el nuevo nodo.
              </li>
              <li>
                En caso contrario, recorrer desde la cabeza hasta el último
                nodo.
              </li>
              <li>
                Ajustar el puntero{" "}
                <code className="bg-black/60 px-1 rounded text-cyan-200">
                  sig
                </code>{" "}
                del último nodo para que apunte al nuevo.
              </li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`nuevo = crearNodo(dato)
nuevo.sig = NULL

si cabeza == NULL entonces
  cabeza = nuevo
sino
  act = cabeza
  mientras act.sig != NULL hacer
    act = act.sig
  fin mientras
  act.sig = nuevo
fin si`}
              </pre>
              <p className="text-[11px] text-amber-300 mt-1">
                Costo: O(n) — hay que recorrer la lista hasta el último nodo.
              </p>
            </div>
          </div>
        </div>

        {/* Inserción ordenada */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-red-400">
            Inserción ordenada
          </h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
            <p>
              Se utiliza cuando la lista debe mantenerse ordenada (por ejemplo,
              de menor a mayor). Se busca la posición adecuada antes de insertar
              el nodo.
            </p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Crear el nuevo nodo.</li>
              <li>
                Si la lista está vacía o el dato es menor que la información de
                la cabeza, insertar al inicio.
              </li>
              <li>
                En caso contrario, recorrer con dos punteros:
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>
                    <b>ant</b>: nodo anterior.
                  </li>
                  <li>
                    <b>act</b>: nodo actual.
                  </li>
                </ul>
              </li>
              <li>
                Avanzar mientras{" "}
                <code className="bg-black/60 px-1 rounded text-cyan-200">
                  act.info &lt; dato
                </code>{" "}
                y ajustar enlaces: <b>ant.sig = nuevo</b> y{" "}
                <b>nuevo.sig = act</b>.
              </li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`nuevo = crearNodo(dato)

si cabeza == NULL o dato < cabeza.info entonces
  nuevo.sig = cabeza
  cabeza = nuevo
sino
  ant = cabeza
  act = cabeza.sig
  mientras act != NULL y act.info < dato hacer
    ant = act
    act = act.sig
  fin mientras
  nuevo.sig = act
  ant.sig = nuevo
fin si`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ================== OTRAS OPERACIONES ================== */}
      <section className="mt-12 text-sm leading-6 space-y-8 mb-10">
        {/* Buscar */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-red-400 mb-1">Buscar</h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
            <p>
              La búsqueda recorre la lista desde la cabeza comparando la
              información de cada nodo con el dato solicitado.
            </p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Inicializar un puntero en la cabeza.</li>
              <li>
                Mientras el puntero no sea <code>NULL</code> y el dato no
                coincida, avanzar al siguiente nodo.
              </li>
              <li>
                Si se encontró, devolver la referencia al nodo; en caso
                contrario, devolver <code>NULL</code> o <code>false</code>.
              </li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`act = cabeza
mientras act != NULL y act.info != dato hacer
  act = act.sig
fin mientras

si act != NULL entonces
  // encontrado
sino
  // no encontrado`}
              </pre>
            </div>
          </div>
        </div>

        {/* Editar */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-red-400 mb-1">Editar</h3>
          <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow space-y-2">
            <p>
              Editar consiste en localizar un nodo y reemplazar su información
              por un nuevo valor, manteniendo los enlaces intactos.
            </p>
            <ul className="list-decimal ml-5 space-y-1">
              <li>Buscar el nodo que contiene el dato a modificar.</li>
              <li>
                Si se encuentra, actualizar el campo{" "}
                <b>información</b> con el nuevo valor.
              </li>
              <li>Devolver éxito o fracaso de la operación.</li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`nodo = buscar(datoViejo)
si nodo != NULL entonces
  nodo.info = datoNuevo
  devolver true
sino
  devolver false`}
              </pre>
            </div>
          </div>
        </div>

        {/* Eliminar */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-red-400 mb-1">Eliminar</h3>
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
            <p>
              Para eliminar un nodo de una lista simple es necesario “sacarlo”
              de la cadena de enlaces ajustando el puntero del nodo anterior.
            </p>

            <ul className="list-decimal ml-5 space-y-1">
              <li>Usar dos punteros: <b>ant</b> (anterior) y <b>act</b>.</li>
              <li>
                Recorrer la lista hasta que{" "}
                <code className="bg-black/60 px-1 rounded text-cyan-200">
                  act.info == dato
                </code>{" "}
                o <code>act == NULL</code>.
              </li>
              <li>
                Si no se encontró el dato, no se realiza ningún cambio.
              </li>
              <li>
                Si el nodo a eliminar es la <b>cabeza</b>, mover la cabeza al
                siguiente nodo.
              </li>
              <li>
                En caso contrario, hacer que{" "}
                <code className="bg-black/60 px-1 rounded text-cyan-200">
                  ant.sig
                </code>{" "}
                apunte a <code className="bg-black/60 px-1 rounded text-cyan-200">
                  act.sig
                </code>{" "}
                y liberar el nodo.
              </li>
            </ul>

            <div className="mt-2">
              <p className="text-xs text-gray-300 mb-1 font-semibold">
                Pseudocódigo:
              </p>
              <pre className="bg-black/60 border border-gray-700 rounded-md px-3 py-2 text-xs font-mono text-gray-100 overflow-x-auto">
{`ant = NULL
act = cabeza

mientras act != NULL y act.info != dato hacer
  ant = act
  act = act.sig
fin mientras

si act == NULL entonces
  // dato no encontrado
sino si ant == NULL entonces
  // eliminar cabeza
  cabeza = act.sig
  liberar(act)
sino
  ant.sig = act.sig
  liberar(act)
fin si`}
              </pre>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              En listas doblemente enlazadas o circulares también habría que
              actualizar el puntero hacia atrás, pero en una{" "}
              <b>lista simple</b> solo se ajusta el enlace hacia adelante.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
