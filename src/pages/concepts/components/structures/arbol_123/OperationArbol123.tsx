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

      {/* BÚSQUEDA */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-red-500 mb-2">Búsqueda</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p className="text-[15.5px] text-gray-100">
            El algoritmo recorre la estructura igual que en un árbol B:
          </p>

          <ol className="list-decimal list-inside space-y-2 pl-4 text-[15.5px] text-gray-100">
            <li>
              En cada nodo se compara la clave con la raíz&nbsp;izquierda y, si
              existe, con la raíz&nbsp;derecha.
            </li>
            <li>Según el rango, se desciende al subárbol&nbsp;1, 2 o 3.</li>
            <li>Al llegar a una hoja se verifica si la clave está presente.</li>
          </ol>

          <p className="text-sm text-gray-300">
            Todos los nodos hoja están a la misma profundidad, por lo que la
            búsqueda es <b>O(log n)</b>.
          </p>
        </div>
      </section>

      {/* INSERCIÓN */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-red-500 mb-2">Inserción</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <ol className="list-decimal list-inside space-y-2 pl-4 text-[15.5px] text-gray-100">
            <li>
              <b>Localizar hoja destino.</b> Se busca la hoja donde debería
              estar la nueva clave.{" "}
            </li>
            <li>
              <b>Caso 1 (hoja con 0 o 1 elementos).</b> Insertar la clave y
              reordenar localmente.
            </li>
            <li>
              <b>Caso 2 (hoja con 2 elementos).</b> • Se crea un nodo temporal
              de 3 claves.
              <br />• El elemento medio sube al padre (<i>split</i>).
              <br />• Los otros dos forman 2 nodos hijos.
              <br />• Si el padre ya tenía 2 claves, el <i>split</i> se propaga.
            </li>
            <li>
              Si el <i>split</i> llega hasta la raíz, puede aumentar la altura
              del árbol en 1.
            </li>
          </ol>

          <p className="text-sm text-gray-300">
            La operación siempre preserva el balance; la altura crece a lo sumo
            en una unidad.
          </p>
        </div>
      </section>

      {/* ELIMINACIÓN */}
      <section className="mb-20">
        <h2 className="text-xl font-bold text-red-500 mb-2">Eliminación</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p className="text-[15.5px] text-gray-100">
            Para borrar una clave se distinguen tres situaciones:
          </p>

          <ul className="list-disc list-inside space-y-2 text-[15.5px] text-gray-100">
            <li>
              <b>Hoja con 2 elementos.</b> Basta con eliminar la clave y dejar
              una hoja de un solo elemento.
            </li>

            <li>
              <b>Hoja con 1 elemento.</b>
              <br />
              &nbsp;&nbsp;• Si un hermano adyacente tiene 2 elementos, se hace
              un <i>préstamo</i>: se pasa la clave más cercana al padre.
              <br />
              &nbsp;&nbsp;• Si ambos hermanos tienen 1 elemento, se fusiona el
              nodo con un hermano y una clave del padre (<i>merge</i>).
            </li>

            <li>
              <b>Propagación hacia arriba.</b> Si tras la fusión el padre queda
              con 0 claves, el ajuste se repite un nivel más arriba; en el
              extremo la raíz puede perder altura.
            </li>
          </ul>

          <p className="text-sm text-gray-300">
            Al finalizar, el árbol sigue siendo perfectamente balanceado y sin
            claves duplicadas.
          </p>
        </div>
      </section>
    </div>
  );
}
