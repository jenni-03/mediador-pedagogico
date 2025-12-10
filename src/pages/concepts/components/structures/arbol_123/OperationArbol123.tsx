/* OperationArbol123.tsx
   © 2025 – componente educativo / SEED
*/

export function OperationArbol123() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol 1-2-3
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Búsqueda · Inserción · Eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-10 w-40 rounded" />

      {/* ============ BÚSQUEDA ============ */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold text-red-500">Búsqueda</h2>
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-red-400/60 text-red-300">
            Complejidad O(log n)
          </span>
        </div>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p className="text-[15.5px] text-gray-100">
            La búsqueda en un árbol <b>1-2-3</b> es muy similar a la de un árbol B
            o un árbol binario de búsqueda balanceado: en cada nodo se decide
            hacia qué subárbol bajar comparando la clave con las raíces del nodo.
          </p>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            {/* Paso a paso */}
            <div>
              <p className="text-sm font-semibold text-red-300 mb-1">
                Algoritmo paso a paso
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-4 text-[15.5px] text-gray-100">
                <li>
                  En cada nodo se compara la clave buscada con la{" "}
                  <b>raíz izquierda</b> y, si existe, con la{" "}
                  <b>raíz derecha</b>.
                </li>
                <li>
                  Según el rango de la clave, se desciende al{" "}
                  <b>subárbol 1, 2 o 3</b>:
                  <ul className="list-disc list-inside ml-4 mt-1 text-[14px] text-gray-200 space-y-1">
                    <li>
                      Clave &lt; raíz izquierda → subárbol 1 (izquierdo).
                    </li>
                    <li>
                      Entre raíz izquierda y raíz derecha → subárbol 2 (central).
                    </li>
                    <li>
                      Clave &gt; raíz derecha → subárbol 3 (derecho).
                    </li>
                  </ul>
                </li>
                <li>
                  El proceso se repite hasta llegar a una <b>hoja</b>, donde se
                  verifica si la clave está o no almacenada.
                </li>
              </ol>
            </div>

            {/* Observaciones */}
            <div className="bg-[#151519] rounded-lg border border-red-500/60 p-3 text-sm text-gray-100">
              <p className="font-semibold text-red-300 mb-1">
                ¿Por qué es eficiente?
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  El árbol se mantiene <b>balanceado</b>; todas las hojas están
                  a la misma profundidad.
                </li>
                <li>
                  En cada nivel solo se hacen unas pocas comparaciones (1 o 2),
                  por lo que el número de pasos crece como <b>log n</b>.
                </li>
                <li>
                  Esta estructura es adecuada para búsquedas frecuentes sobre
                  conjuntos grandes de datos ordenados.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ INSERCIÓN ============ */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-red-500 mb-2">Inserción</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-4">
          {/* Idea general */}
          <div className="bg-[#141418] rounded-lg border border-red-500/40 p-3 text-[14.5px] text-gray-100">
            <p className="text-sm font-semibold text-red-300 mb-1">
              Idea clave
            </p>
            <p>
              Insertar en un árbol 1-2-3 consiste en <b>buscar la hoja correcta</b>,
              colocar allí la nueva clave y, si el nodo se llena,{" "}
              <b>dividirlo (split)</b> y subir el elemento del medio al padre.
            </p>
          </div>

          {/* Pasos */}
          <ol className="list-decimal list-inside space-y-3 pl-4 text-[15.5px] text-gray-100">
            <li>
              <b>Localizar la hoja destino.</b> Se realiza una búsqueda normal
              para encontrar la hoja donde debería quedar la nueva clave según
              su orden.
            </li>

            <li>
              <b>Caso 1 · hoja con 0 o 1 elementos.</b>
              <ul className="list-disc list-inside ml-4 mt-1 text-[14px] text-gray-200 space-y-1">
                <li>Se inserta la clave en la hoja.</li>
                <li>Se reordenan localmente los elementos (menor a la izquierda).</li>
                <li>No se modifican niveles superiores.</li>
              </ul>
            </li>

            <li>
              <b>Caso 2 · hoja con 2 elementos (desbordamiento).</b>
              <p className="mt-1 text-[14px] text-gray-200">
                Al intentar insertar una tercera clave, el nodo se “rompe” en
                dos:
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 text-[14px] text-gray-200 space-y-1">
                <li>
                  Se ordenan las 3 claves y se identifica la{" "}
                  <b>clave del medio</b>.
                </li>
                <li>
                  La clave del medio <b>sube al padre</b> (operación{" "}
                  <i>split</i>).
                </li>
                <li>
                  Las otras dos claves se quedan en <b>dos nodos hijos</b>,
                  cada uno con una sola clave.
                </li>
                <li>
                  Los subárboles que tenía la hoja se redistribuyen para
                  respetar el orden.
                </li>
              </ul>
            </li>

            <li>
              <b>Propagación del split.</b>
              <p className="mt-1 text-[14px] text-gray-200">
                Si el padre al que sube la clave del medio también tenía ya
                2 elementos, se produce un nuevo <i>split</i> en ese nodo, que
                puede seguir propagándose hacia arriba hasta la raíz.
              </p>
              <p className="mt-1 text-[14px] text-gray-200">
                Si la raíz se divide, aparece una <b>nueva raíz</b> y la altura
                del árbol aumenta en 1, pero sigue estando perfectamente
                balanceado.
              </p>
            </li>
          </ol>

          <p className="text-sm text-gray-300">
            La inserción en un árbol 1-2-3 siempre preserva el orden y el
            balance: las hojas siguen al mismo nivel y no aparecen nodos con más
            de 2 claves.
          </p>
        </div>
      </section>

      {/* ============ ELIMINACIÓN ============ */}
      <section className="mb-20">
        <h2 className="text-xl font-bold text-red-500 mb-2">Eliminación</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-4">
          {/* Idea general */}
          <div className="bg-[#141418] rounded-lg border border-red-500/40 p-3 text-[14.5px] text-gray-100">
            <p className="text-sm font-semibold text-red-300 mb-1">
              Idea clave
            </p>
            <p>
              Para eliminar una clave, primero se la lleva (si es necesario) a
              una <b>hoja</b>, y luego se ajusta el árbol para que ningún nodo
              quede “demasiado vacío”, usando <b>préstamos</b> o{" "}
              <b>fusiones (merge)</b>.
            </p>
          </div>

          {/* Paso a paso */}
          <ol className="list-decimal list-inside space-y-3 pl-4 text-[15.5px] text-gray-100">
            <li>
              <b>Localizar la clave.</b> Se busca la clave como en la operación
              de búsqueda.
              <br />
              <span className="text-[14px] text-gray-300">
                Si la clave está en un nodo interno, se intercambia con su{" "}
                <b>sucesor en inorden</b> para trabajar siempre en una hoja.
              </span>
            </li>

            <li>
              <b>Caso 1 · hoja con 2 elementos.</b>
              <ul className="list-disc list-inside ml-4 mt-1 text-[14px] text-gray-200 space-y-1">
                <li>
                  Se elimina la clave y la hoja queda con un solo elemento.
                </li>
                <li>No es necesario ajustar nada más en el árbol.</li>
              </ul>
            </li>

            <li>
              <b>Caso 2 · hoja con 1 elemento (nodo “débil”).</b>
              <p className="mt-1 text-[14px] text-gray-200">
                El nodo quedaría vacío, lo cual no está permitido. Se actúa
                sobre los hermanos:
              </p>
              <ul className="list-disc list-inside ml-4 mt-1 text-[14px] text-gray-200 space-y-1">
                <li>
                  <b>Préstamo:</b> si un hermano adyacente tiene 2 elementos,
                  se “presta” una clave:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>
                      Una clave del hermano sube al padre y una clave del padre
                      baja a la hoja débil.
                    </li>
                    <li>Todos los nodos vuelven a tener al menos 1 elemento.</li>
                  </ul>
                </li>
                <li>
                  <b>Fusión (merge):</b> si ambos hermanos tienen solo 1
                  elemento:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>
                      Se combinan la hoja, un hermano y una clave del padre en
                      un único nodo con 2 elementos.
                    </li>
                    <li>
                      El padre pierde una clave y un hijo, lo que puede dejarlo
                      a su vez con 0 elementos.
                    </li>
                  </ul>
                </li>
              </ul>
            </li>

            <li>
              <b>Propagación hacia arriba.</b>
              <p className="mt-1 text-[14px] text-gray-200">
                Si después de una fusión el padre queda con 0 elementos, se
                vuelve a aplicar el mismo razonamiento un nivel más arriba. En
                el límite, la <b>raíz</b> puede quedarse sin claves y se
                reemplaza por su único hijo, reduciendo la altura del árbol en 1.
              </p>
            </li>
          </ol>

          <p className="text-sm text-gray-300">
            Al terminar la eliminación, el árbol 1-2-3 mantiene sus propiedades:
            todos los nodos tienen 1 o 2 elementos, no hay claves duplicadas y
            todas las hojas siguen a la misma profundidad.
          </p>
        </div>
      </section>
    </div>
  );
}
