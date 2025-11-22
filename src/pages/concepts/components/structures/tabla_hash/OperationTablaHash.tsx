import op1 from "../../../../../assets/images/operacion_tabla_hash_1.jpg";
import op2 from "../../../../../assets/images/operacion_tabla_hash_2.jpg";
import op3 from "../../../../../assets/images/operacion_tabla_hash_3.jpg";
import op4 from "../../../../../assets/images/operacion_tabla_hash_4.jpg";
import op5 from "../../../../../assets/images/operacion_tabla_hash_5.jpg";
import op6 from "../../../../../assets/images/operacion_tabla_hash_6.jpg";

export function OperationTablaHash() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-1">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Tabla Hash
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 mb-1 font-medium block">
        Inserción, búsqueda y eliminación con encadenamiento
      </span>
      <hr className="mb-8 border-t-2 border-red-600 w-40 rounded" />

      {/* RESUMEN GENERAL */}
      <section className="mb-8">
        <div className="bg-[#151516] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            En una <b className="text-red-400">tabla hash con encadenamiento</b>, 
            cada posición del arreglo no guarda un único elemento, sino el inicio 
            de una <b>lista enlazada</b> con todos los elementos que han caído en 
            ese mismo índice (colisiones).
          </p>
          <p>
            El flujo de trabajo es siempre el mismo:
          </p>
          <ul className="ml-4 space-y-1">
            <li>• Calcular el índice con la función hash <b>h(k)</b>.</li>
            <li>• Ir al <b>slot</b> correspondiente del arreglo.</li>
            <li>• Insertar, buscar o eliminar dentro de la lista enlazada de ese slot.</li>
          </ul>
          <p className="text-gray-300 text-xs mt-1">
            En promedio, las operaciones básicas (<b>insertar, buscar, eliminar</b>) 
            tienen costo cercano a <b>O(1)</b> cuando el factor de carga está controlado.
          </p>
        </div>
      </section>

      {/* INSERCIÓN */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-2">
          Inserción (Insertar clave en tabla hash)
        </h2>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5 text-sm leading-6">
          <p className="mb-2">
            En <b>hashing abierto con encadenamiento</b>, insertar un elemento 
            significa ubicar primero el índice de la tabla mediante la función hash y 
            luego añadir el nodo a la lista enlazada de ese índice.
          </p>
          <p className="font-semibold text-gray-100 mt-1 mb-2">
            Pasos generales de inserción:
          </p>
          <ul className="space-y-1 text-gray-100 pl-2">
            <li>
              <span className="text-cyan-400 font-bold">1.</span>{" "}
              Aplicar la función hash <b>h(k)</b> a la clave para obtener el índice.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span>{" "}
              Ir al slot <b>tabla[h(k)]</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3.</span>{" "}
              Crear un nuevo nodo con la clave (y valor asociado).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">4.</span>{" "}
              Insertar el nodo en la lista enlazada del slot (comúnmente al inicio).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">5.</span>{" "}
              Si el slot no estaba vacío, se produce una{" "}
              <b className="text-red-400">colisión</b> y el nuevo nodo se encadena.
            </li>
          </ul>
        </div>

        {/* EJEMPLO INSERTAR – TIMELINE VISUAL */}
        <h3 className="text-lg font-bold mb-1 text-red-400">
          Ejemplo visual de inserción con colisiones
        </h3>
        <p className="text-gray-200 text-sm mb-3">
          Tabla hash de <b>3 slots</b>, inicialmente vacía. Se insertan los valores:{" "}
          <b>5, 2, 1, 7</b>. Cada imagen muestra el estado de la tabla en un paso del proceso.
        </p>

        <div className="space-y-6">
          {/* Paso 0 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col items-center mt-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold shadow">
                0
              </div>
              <div className="w-px flex-1 bg-red-600/40 mt-1" />
            </div>
            <div className="flex-1 bg-[#151516] rounded-lg border border-red-500/70 p-3 shadow">
              <p className="text-sm mb-2 font-semibold text-cyan-200">
                Estado inicial · Tabla vacía
              </p>
              <p className="text-xs text-gray-300 mb-3">
                La tabla hash comienza sin elementos. Todos los slots están vacíos
                esperando recibir las claves.
              </p>
              <div className="flex justify-center">
                <img
                  src={op1}
                  alt="Tabla hash vacía e inicio del ejemplo"
                  className="w-full h-auto max-w-md rounded-xl border-2 border-red-500 shadow-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Paso 1 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col items-center mt-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold shadow">
                1
              </div>
              <div className="w-px flex-1 bg-red-600/40 mt-1" />
            </div>
            <div className="flex-1 bg-[#151516] rounded-lg border border-red-500/70 p-3 shadow">
              <p className="text-sm mb-2 font-semibold text-cyan-200">
                Insertar 5
              </p>
              <p className="text-xs text-gray-300 mb-3">
                Se calcula <b>h(5)</b> y se obtiene un índice. El slot está vacío, 
                por lo que 5 se inserta como primer nodo de la lista de ese slot.
              </p>
              <div className="flex justify-center">
                <img
                  src={op2}
                  alt="Insertar 5 en la tabla hash"
                  className="w-full h-auto max-w-md rounded-xl border-2 border-red-500 shadow-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col items-center mt-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold shadow">
                2
              </div>
              <div className="w-px flex-1 bg-red-600/40 mt-1" />
            </div>
            <div className="flex-1 bg-[#151516] rounded-lg border border-red-500/70 p-3 shadow">
              <p className="text-sm mb-2 font-semibold text-cyan-200">
                Insertar 2
              </p>
              <p className="text-xs text-gray-300 mb-3">
                Se calcula <b>h(2)</b>. Si el índice es distinto al de 5, se ocupa 
                un nuevo slot. Si coincide, 2 se encadena en la misma lista.
              </p>
              <div className="flex justify-center">
                <img
                  src={op3}
                  alt="Insertar 2 en la tabla hash (posible colisión)"
                  className="w-full h-auto max-w-md rounded-xl border-2 border-red-500 shadow-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col items-center mt-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold shadow">
                3
              </div>
              <div className="w-px flex-1 bg-red-600/40 mt-1" />
            </div>
            <div className="flex-1 bg-[#151516] rounded-lg border border-red-500/70 p-3 shadow">
              <p className="text-sm mb-2 font-semibold text-cyan-200">
                Insertar 1
              </p>
              <p className="text-xs text-gray-300 mb-3">
                Tras calcular <b>h(1)</b>, el valor se agrega en el slot 
                correspondiente, encadenándose según sea necesario.
              </p>
              <div className="flex justify-center">
                <img
                  src={op4}
                  alt="Insertar 1 en la tabla hash"
                  className="w-full h-auto max-w-md rounded-xl border-2 border-red-500 shadow-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="flex gap-3 items-start">
            <div className="flex flex-col items-center mt-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-xs flex items-center justify-center font-bold shadow">
                4
              </div>
            </div>
            <div className="flex-1 bg-[#151516] rounded-lg border border-red-500/70 p-3 shadow">
              <p className="text-sm mb-2 font-semibold text-cyan-200">
                Insertar 7 · Colisión
              </p>
              <p className="text-xs text-gray-300 mb-3">
                Ahora se inserta <b>7</b>. La función hash produce un índice ya ocupado, 
                por lo que se genera una <b className="text-red-400">colisión</b>. 
                El valor 7 se añade a la lista enlazada asociada a ese slot.
              </p>
              <div className="flex justify-center">
                <img
                  src={op5}
                  alt="Insertar 7 con colisión en tabla hash"
                  className="w-full h-auto max-w-md rounded-xl border-2 border-red-500 shadow-lg bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN INSERCIÓN */}
        <div className="bg-[#151516] border-l-4 border-red-500 rounded-md p-4 mt-7">
          <span className="font-semibold text-red-400 block mb-2">
            Resumen de inserción con encadenamiento:
          </span>
          <ul className="list-disc pl-6 text-gray-100 space-y-1 text-sm">
            <li>Aplicar la función hash a la clave para obtener el índice.</li>
            <li>Localizar el slot de la tabla correspondiente al índice.</li>
            <li>Insertar el nodo en la lista enlazada de ese slot (normalmente al inicio).</li>
            <li>
              Si el slot ya tenía nodos, la colisión se resuelve encadenando el nuevo nodo.
            </li>
            <li>
              Complejidad promedio: <span className="text-white">O(1)</span>.
            </li>
          </ul>
        </div>
      </section>

      {/* ELIMINACIÓN */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-2">
          Eliminación (Eliminar clave de la tabla)
        </h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5 text-sm leading-6">
          <p className="mb-2">
            El proceso de <b>eliminar</b> un elemento en una tabla hash con encadenamiento 
            sigue la misma idea que la búsqueda: primero se localiza el slot mediante la 
            función hash y luego se elimina el nodo en la lista enlazada.
          </p>
          <p className="font-semibold text-gray-100 mt-1 mb-2">
            Pasos generales de eliminación:
          </p>
          <ul className="space-y-1 text-gray-100 pl-2">
            <li>
              <span className="text-cyan-400 font-bold">1.</span>{" "}
              Calcular <b>h(k)</b> para saber en qué slot debería estar la clave.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span>{" "}
              Recorrer la lista enlazada de <b>tabla[h(k)]</b> buscando la clave.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3.</span>{" "}
              Ajustar los punteros de la lista para “saltar” el nodo que se elimina.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">4.</span>{" "}
              Liberar/eliminar el nodo (o dejar que el recolector de basura lo haga).
            </li>
          </ul>
        </div>

        <h3 className="text-lg font-bold mb-1 text-red-400">
          Ejemplo de eliminar
        </h3>
        <p className="text-gray-200 text-sm mb-3">
          Supongamos que queremos eliminar la clave <b>"Ana"</b>. Primero se calcula 
          su hash, se localiza el slot (por ejemplo, la posición <b>0</b>) y luego se 
          la busca dentro de la lista enlazada para retirarla.
        </p>

        <div className="flex flex-col items-center gap-2 mb-6">
          <img
            src={op6}
            alt="Eliminar un elemento de una tabla hash con encadenamiento"
            className="w-full h-auto max-w-md sm:max-w-lg md:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg bg-white"
          />
          <span className="text-gray-400 text-xs text-center max-w-md">
            El nodo que contiene la clave buscada se elimina de la lista enlazada,
            ajustando los enlaces anteriores y siguientes.
          </span>
        </div>
      </section>

      {/* BÚSQUEDA */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-white border-l-4 border-red-500 pl-2">
          Búsqueda
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow text-sm leading-6">
          <p className="mb-2">
            La <b>búsqueda</b> en una tabla hash con encadenamiento es directa:
          </p>
          <ul className="space-y-1 pl-2">
            <li>
              <span className="text-cyan-400 font-bold">1.</span>{" "}
              Calcular <b>h(k)</b> para obtener el índice del slot.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span>{" "}
              Recorrer la lista enlazada de ese slot comparando las claves.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3.</span>{" "}
              Si se encuentra la clave, se devuelve su valor; si se llega al final 
              de la lista sin encontrarla, la clave no está en la tabla.
            </li>
          </ul>
          <p className="mt-3 text-gray-300 text-xs">
            En promedio, si el factor de carga está controlado, la longitud de 
            cada lista es pequeña y la búsqueda sigue siendo cercana a <b>O(1)</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
