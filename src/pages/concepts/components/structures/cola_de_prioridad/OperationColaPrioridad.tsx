import img1 from "../../../../../assets/images/definicion_cola_prioridad_1.jpg";

export function OperationColaPrioridad() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Cola de Prioridad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Secuencia de operaciones
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Encolar */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Encolar <span className="text-base text-white">(Insertar con prioridad)</span>
        </h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5">
          <p>
            La operación de encolar (<b>enqueue</b>) agrega un nuevo elemento a la cola asignándole una prioridad específica.
          </p>
          <div className="flex justify-center my-4">
            <img
              src={img1}
              alt="Encolar con prioridad"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-red-500 shadow"
            />
          </div>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">Pasos del proceso:</div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li><span className="text-cyan-400 font-bold">•</span> Recibir el elemento junto con su nivel de prioridad.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Insertar el elemento en la posición correspondiente, según su prioridad.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Si hay varios con la misma prioridad, mantener el orden de llegada (FIFO entre iguales).</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Implementación con lista ordenada</div>
              <p className="text-gray-300 text-sm">Se inserta en la posición correcta, manteniendo el orden por prioridad.</p>
            </div>
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Complejidad temporal</div>
              <p className="text-gray-300 text-sm">O(n) (peor caso: insertar en la posición correcta).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Decolar */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Decolar <span className="text-base text-white">(Eliminar con mayor prioridad)</span>
        </h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5">
          <p>
            La operación de decolar (<b>dequeue</b>) extrae y devuelve el elemento con la prioridad más alta.
          </p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">Pasos del proceso:</div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li><span className="text-cyan-400 font-bold">•</span> Identificar el elemento de mayor prioridad.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Eliminar ese elemento de la cola.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Si hay varios con la misma prioridad, eliminar el que llegó primero (FIFO).</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Implementación con lista ordenada</div>
              <p className="text-gray-300 text-sm">Eliminar el primer elemento es O(1).</p>
            </div>
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Complejidad temporal</div>
              <p className="text-gray-300 text-sm">O(1).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Consulta del Frente */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Frente <span className="text-base text-white">(Front/Peek)</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p>
            Permite obtener el elemento con mayor prioridad sin eliminarlo.
          </p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">Pasos del proceso:</div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li><span className="text-cyan-400 font-bold">•</span> Buscar el elemento con mayor prioridad.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Devolverlo sin modificar la estructura.</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Implementación con lista ordenada</div>
              <p className="text-gray-300 text-sm">Acceder al primer elemento es O(1).</p>
            </div>
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Complejidad temporal</div>
              <p className="text-gray-300 text-sm">O(1).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Consulta del Final */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Final <span className="text-base text-white">(Rear/Peek Rear)</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p>
            Permite obtener el elemento con menor prioridad sin eliminarlo.
          </p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">Pasos del proceso:</div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li><span className="text-cyan-400 font-bold">•</span> Buscar el elemento con prioridad más baja.</li>
            <li><span className="text-cyan-400 font-bold">•</span> Devolverlo sin modificar la estructura.</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Implementación con lista ordenada</div>
              <p className="text-gray-300 text-sm">Acceder al último elemento es O(1).</p>
            </div>
            <div className="flex-1">
              <div className="font-bold mb-1 text-white">🔹 Complejidad temporal</div>
              <p className="text-gray-300 text-sm">O(1).</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}