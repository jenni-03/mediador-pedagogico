export function OperationArbolBinario() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Binario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Inserción · Búsqueda · Recorridos · Eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro */}
      <section className="mb-10 text-sm leading-6">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            En este apartado trabajaremos sobre un{" "}
            <b className="text-red-400">Árbol Binario de Búsqueda (ABB)</b>, es
            decir, un árbol binario donde:
          </p>
          <ul className="list-disc ml-6 space-y-1 text-gray-200">
            <li>
              Todos los valores del <b>subárbol izquierdo</b> de un nodo son{" "}
              <b>menores</b> que el valor del nodo.
            </li>
            <li>
              Todos los valores del <b>subárbol derecho</b> son{" "}
              <b>mayores</b> que el valor del nodo.
            </li>
          </ul>
          <p className="text-gray-300 text-[13px] mt-2">
            Esta propiedad permite que las operaciones de búsqueda, inserción y
            eliminación sean eficientes cuando la estructura no está muy
            desbalanceada.
          </p>
        </div>
      </section>

      {/* INSERTAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Insertar</h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            Para insertar un nuevo valor en un <b>ABB</b>, partimos desde la{" "}
            <b>raíz</b> y vamos tomando decisiones izquierda/derecha:
          </p>
          <ul className="list-decimal ml-6 text-gray-200 space-y-1">
            <li>
              Si el árbol está vacío, el nuevo nodo se convierte en la{" "}
              <b>raíz</b>.
            </li>
            <li>
              Comparar el valor a insertar con el valor del nodo actual.
            </li>
            <li>
              Si el valor es{" "}
              <span className="text-cyan-300 font-semibold">menor</span>, bajar
              al <b>subárbol izquierdo</b>.
            </li>
            <li>
              Si es{" "}
              <span className="text-cyan-300 font-semibold">mayor</span>, bajar
              al <b>subárbol derecho</b>.
            </li>
            <li>
              Repetir el proceso hasta encontrar una posición{" "}
              <span className="text-cyan-300">null</span>, donde se crea el
              nuevo nodo.
            </li>
          </ul>
          <div className="bg-[#15161b] border border-cyan-400/60 rounded-md p-3 text-[13px]">
            <p className="text-cyan-300 font-semibold mb-1">Nota:</p>
            <p className="text-gray-200">
              En una implementación típica no se permiten <b>valores
              duplicados</b>. Si el valor ya existe, se ignora la inserción o se
              define una regla especial (por ejemplo, contar repeticiones).
            </p>
          </div>
          <p className="text-[13px] text-gray-300">
            En promedio, la inserción tarda <b>O(log n)</b>, pero si el árbol se
            desbalancea (por ejemplo, insertando datos ya ordenados) puede
            degradarse a <b>O(n)</b>.
          </p>
        </div>
      </section>

      {/* BUSCAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Buscar</h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>La búsqueda aprovecha exactamente la misma lógica que la inserción:</p>
          <ul className="list-decimal ml-6 text-gray-200 space-y-1">
            <li>Comenzar en la <b>raíz</b>.</li>
            <li>
              Comparar el valor buscado con el valor del nodo actual.
            </li>
            <li>
              Si son iguales → <b>encontrado</b>.
            </li>
            <li>
              Si el valor buscado es menor → continuar por el{" "}
              <b>subárbol izquierdo</b>.
            </li>
            <li>
              Si el valor buscado es mayor → continuar por el{" "}
              <b>subárbol derecho</b>.
            </li>
            <li>
              Si se llega a un nodo <span className="text-cyan-300">null</span>,
              el valor <b>no está</b> en el árbol.
            </li>
          </ul>
          <p className="text-[13px] text-cyan-200">
            En un ABB bien estructurado, la búsqueda también tiene costo
            promedio <b>O(log n)</b>.
          </p>
        </div>
      </section>

      {/* RECORRIDOS */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Recorridos clásicos</h2>
        <div className="bg-[#19191d] border-l-4 border-green-400 rounded-md p-4 shadow space-y-4 text-sm leading-6">
          <p>
            Un <b>recorrido</b> es el orden en que visitamos los nodos del
            árbol. Los más utilizados son:
          </p>

          <div className="space-y-2">
            <p className="font-semibold text-green-300">1. Preorden</p>
            <ul className="list-disc ml-6 text-gray-200 space-y-1 text-[14px]">
              <li>Visitar el nodo actual (raíz).</li>
              <li>Recorrer el subárbol izquierdo en preorden.</li>
              <li>Recorrer el subárbol derecho en preorden.</li>
            </ul>
            <p className="text-xs text-gray-300">
              Útil para clonar el árbol o mostrar su estructura con raíz primero.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-green-300">2. Inorden</p>
            <ul className="list-disc ml-6 text-gray-200 space-y-1 text-[14px]">
              <li>Recorrer el subárbol izquierdo en inorden.</li>
              <li>Visitar el nodo actual.</li>
              <li>Recorrer el subárbol derecho en inorden.</li>
            </ul>
            <p className="text-xs text-gray-300">
              En un <b>ABB</b>, el recorrido inorden produce los valores en{" "}
              <b>orden ascendente</b>.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-green-300">3. Posorden</p>
            <ul className="list-disc ml-6 text-gray-200 space-y-1 text-[14px]">
              <li>Recorrer el subárbol izquierdo en posorden.</li>
              <li>Recorrer el subárbol derecho en posorden.</li>
              <li>Visitar el nodo actual.</li>
            </ul>
            <p className="text-xs text-gray-300">
              Muy usado cuando se requiere <b>destruir</b> o liberar el árbol
              desde las hojas hacia la raíz.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-green-300">4. Por niveles (BFS)</p>
            <p className="text-[14px] text-gray-200">
              Se recorren los nodos de arriba hacia abajo y de izquierda a
              derecha usando una cola (orden por niveles).
            </p>
          </div>
        </div>
      </section>

      {/* EDITAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Editar</h2>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow text-sm leading-6 space-y-3">
          <p>
            Editar un nodo significa cambiar el <b>valor</b> almacenado en él.
          </p>
          <ul className="list-decimal ml-6 text-gray-200 space-y-1">
            <li>Buscar el nodo que se quiere modificar.</li>
            <li>Decidir el nuevo valor que debe almacenarse.</li>
          </ul>
          <div className="flex items-start gap-2 mt-2">
            <span className="text-yellow-300 text-xl font-bold mt-0.5">!</span>
            <p className="text-yellow-200 text-[14px]">
              <span className="font-semibold">Importante:</span> si se cambia
              el valor directamente, puede violarse la{" "}
              <b>propiedad de búsqueda</b> del ABB. La forma más segura es:
              <br />
              <b>1)</b> eliminar el nodo con el valor antiguo y{" "}
              <b>2)</b> volver a insertarlo con el nuevo valor.
            </p>
          </div>
        </div>
      </section>

      {/* ELIMINAR */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Eliminar</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-sm leading-6 space-y-3">
          <p className="mb-1">
            Para eliminar un nodo manteniendo la propiedad de ABB, se consideran
            tres casos clásicos:
          </p>

          <ul className="list-disc ml-6 text-gray-200 space-y-2 text-[15px]">
            <li>
              <b>Nodo hoja (sin hijos):</b> se elimina simplemente, ajustando
              el puntero del padre a <span className="text-cyan-300">null</span>.
            </li>
            <li>
              <b>Nodo con un solo hijo:</b> el padre pasa a apuntar directamente
              al hijo (se “salta” el nodo eliminado).
            </li>
            <li>
              <b>Nodo con dos hijos:</b>
              <ul className="list-disc ml-6 mt-1 space-y-1 text-[14px]">
                <li>
                  Se busca el <b>sucesor inorden</b> (el valor mínimo del
                  subárbol derecho) o el <b>predecesor inorden</b> (máximo del
                  subárbol izquierdo).
                </li>
                <li>Se copia ese valor en el nodo a eliminar.</li>
                <li>
                  Luego se elimina el nodo donde realmente estaba ese sucesor /
                  predecesor (que tendrá a lo sumo un hijo).
                </li>
              </ul>
            </li>
          </ul>

          <p className="italic text-[13px] text-red-300 mt-1">
            El objetivo de estos pasos es mantener siempre que los valores
            menores queden a la izquierda y los mayores a la derecha, de modo
            que el árbol siga siendo un <b>Árbol Binario de Búsqueda</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
