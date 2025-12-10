export function OperationListaDoble() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Lista Doble
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Lista Doblemente Enlazada
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Resumen de operaciones */}
      <section className="mb-8 text-sm leading-6">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            En una <b>lista doblemente enlazada</b> las operaciones básicas se
            apoyan en los punteros{" "}
            <code className="bg-black/70 text-cyan-300 px-2 rounded">ant</code>{" "}
            y{" "}
            <code className="bg-black/70 text-cyan-300 px-2 rounded">sig</code>,
            que permiten moverse en ambos sentidos.
          </p>
          <p className="text-gray-300">
            Veremos cómo <b>insertar</b> nodos (al inicio, al final y ordenado),
            cómo <b>recorrer</b> la lista, y cómo <b>editar, buscar y
            eliminar</b> elementos.
          </p>
        </div>
      </section>

      {/* INSERCIÓN */}
      <section className="space-y-5 text-sm leading-6">
        <h3 className="text-2xl font-bold text-white">
          Inserción de un elemento
        </h3>

        {/* Inserción al inicio */}
        <div>
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción al inicio
          </h4>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
            <p>
              Insertar al inicio agrega un nuevo nodo como primera posición de
              la lista. Es una operación directa sobre la cabeza:
            </p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>Crear un nuevo nodo con el valor deseado.</li>
              <li>
                Hacer que su puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                apunte al nodo que actualmente es la cabeza.
              </li>
              <li>
                Colocar su puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>{" "}
                en <span className="text-cyan-300">NULL</span>.
              </li>
              <li>
                Si existía cabeza, actualizar su puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>{" "}
                para que apunte al nuevo nodo.
              </li>
              <li>Actualizar la cabeza de la lista al nuevo nodo.</li>
            </ul>
            <p className="mt-2 text-gray-300">
              Esta inserción es de costo constante: solo modifica unos pocos
              punteros en la zona inicial de la lista.
            </p>
          </div>
        </div>

        {/* Inserción al final */}
        <div>
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción al final
          </h4>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
            <p>
              Para insertar un nodo al final (última posición), se debe localizar
              el último nodo y enlazar el nuevo al final de la cadena:
            </p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                Recorrer la lista desde la cabeza hasta el último nodo (aquel
                cuyo{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                es <span className="text-cyan-300">NULL</span>).
              </li>
              <li>Crear un nuevo nodo con el valor a insertar.</li>
              <li>
                El puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>{" "}
                del nuevo nodo apunta al último nodo actual.
              </li>
              <li>
                Su puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                se deja en <span className="text-cyan-300">NULL</span>.
              </li>
              <li>
                El último nodo actual actualiza su puntero{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                para enlazar al nuevo nodo.
              </li>
            </ul>
          </div>
        </div>

        {/* Inserción ordenada */}
        <div>
          <h4 className="text-xl font-semibold text-red-400 mb-2">
            Inserción ordenada
          </h4>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
            <p>
              La inserción ordenada mantiene la lista ordenada de menor a mayor
              (o según algún criterio). El algoritmo es:
            </p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                Si la lista está vacía o el nuevo valor es menor (o igual) que
                el de la cabeza, insertar usando el caso{" "}
                <b>Inserción al inicio</b>.
              </li>
              <li>
                En otro caso, recorrer la lista usando{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                hasta encontrar el primer nodo con valor mayor al que queremos
                insertar.
              </li>
              <li>
                Insertar el nuevo nodo entre el nodo anterior y el nodo
                encontrado, actualizando los punteros{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>{" "}
                y{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                de ambos.
              </li>
              <li>
                Si no se encuentra un valor mayor, insertar al final reutilizando
                el caso <b>Inserción al final</b>.
              </li>
            </ul>
            <p className="mt-2 text-gray-300">
              Esta inserción requiere recorrido secuencial, pero gracias al
              doble enlace el reacomodo de punteros es local y sencillo.
            </p>
          </div>
        </div>
      </section>

      {/* Separador visual */}
      <div className="my-10 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-sky-500 via-emerald-400 to-fuchsia-500 rounded-full opacity-90 shadow-[0_0_18px_3px_rgba(56,189,248,0.5)]" />
      </div>

      {/* Recorridos */}
      <section className="text-sm leading-6 space-y-6">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">
          Recorrido hacia adelante y hacia atrás
        </h3>
        <div className="bg-[#19191d] border-l-4 border-green-400 rounded-md p-4 shadow">
          <p>
            Una de las grandes ventajas de la lista doble es que puede
            recorrerse en ambos sentidos:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>
              <b>Hacia adelante:</b> desde la cabeza, siguiendo el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                sig
              </code>{" "}
              de cada nodo.
            </li>
            <li>
              <b>Hacia atrás:</b> desde el último nodo, siguiendo el puntero{" "}
              <code className="bg-black/70 text-cyan-300 px-2 rounded">
                ant
              </code>{" "}
              hasta llegar nuevamente al inicio.
            </li>
          </ul>
          <p className="mt-2 text-gray-300">
            Elegir el sentido adecuado puede ahorrar recorrido cuando se conoce
            si el dato está “más cerca” del inicio o del final.
          </p>
        </div>
      </section>

      {/* Editar / Buscar / Eliminar */}
      <section className="mt-10 text-sm leading-6 space-y-8">
        {/* Editar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Editar</h3>
          <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mb-3">
            <p>
              Editar un nodo consiste en localizarlo y modificar su campo de
              información sin tocar los enlaces:
            </p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>Elegir desde qué extremo conviene iniciar el recorrido.</li>
              <li>Recorrer la lista comparando el dato de cada nodo.</li>
              <li>
                Al encontrar el nodo, reemplazar su valor por el nuevo dato.
              </li>
              <li>
                No es necesario cambiar{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>{" "}
                ni{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>
                .
              </li>
            </ul>
          </div>
        </div>

        {/* Buscar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Buscar</h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
            <p>
              La búsqueda puede empezar desde la cabeza o desde el último nodo:
            </p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                Seleccionar el punto de partida (inicio o final) según el
                contexto del problema.
              </li>
              <li>
                Avanzar usando{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  sig
                </code>{" "}
                o retroceder usando{" "}
                <code className="bg-black/70 text-cyan-300 px-1 rounded">
                  ant
                </code>
                .
              </li>
              <li>
                Comparar el dato de cada nodo con el valor buscado hasta
                encontrarlo o llegar al final del recorrido.
              </li>
              <li>
                Si se encuentra, devolver el nodo, su valor o su posición; en
                caso contrario, devolver <code>null</code> o un indicador de que
                no existe.
              </li>
            </ul>
          </div>
        </div>

        {/* Eliminar */}
        <div>
          <h3 className="text-2xl font-semibold text-red-400 mb-2">Eliminar</h3>
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
            <p>
              Al eliminar un nodo, es fundamental mantener la cadena de
              conexiones en ambos sentidos:
            </p>
            <ul className="mt-3 space-y-2 list-inside">
              {[
                "Buscar el nodo que contiene el dato a eliminar.",
                "Si el nodo tiene anterior, actualizar su puntero 'sig' para que apunte al nodo siguiente.",
                "Si el nodo tiene siguiente, actualizar su puntero 'ant' para que apunte al nodo anterior.",
                "Si el nodo eliminado era la cabeza, mover la cabeza al siguiente nodo.",
                "Opcionalmente, liberar la memoria del nodo eliminado o dejar que el recolector de basura lo haga.",
              ].map((step, index) => (
                <li key={index} className="text-sm">
                  <span className="text-red-400 font-semibold">
                    {index + 1}.
                  </span>{" "}
                  {step}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-gray-300">
              Gracias a los punteros{" "}
              <code className="bg-black/70 text-cyan-300 px-1 rounded">
                ant
              </code>{" "}
              y{" "}
              <code className="bg-black/70 text-cyan-300 px-1 rounded">
                sig
              </code>
              , no es necesario recordar el “nodo anterior” durante el
              recorrido: la lista ya mantiene esa referencia.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
