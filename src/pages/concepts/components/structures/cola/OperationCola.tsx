import img1 from "../../../../../assets/images/operacion_encolar_1.png";

export function OperationCola() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Cola
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Secuencia de operaciones
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Encolar */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Encolar <span className="text-base text-white">(Enqueue)</span>
        </h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5">
          <p>
            Es la operación que agrega un elemento al <b>final</b> de la cola.
            Si hay espacio disponible, el elemento se almacena en la posición
            indicada por <span className="text-cyan-300">rear</span>, y luego
            este índice se incrementa.
          </p>
          <div className="flex justify-center my-4">
            <img
              src={img1}
              alt="Operación encolar"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-red-500 shadow"
            />
          </div>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">•</span> Verificar si la
              cola está llena (si es tamaño fijo). Si está llena, lanzar error
              de <span className="text-red-400">overflow</span>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Si la cola está
              vacía (<b>front == -1</b>), inicializar <b>front = 0</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Incrementar{" "}
              <b>rear</b> (<b>rear = rear + 1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Insertar el
              nuevo elemento en <b>queue[rear]</b>.
            </li>
          </ul>
        </div>
      </section>

      {/* Decolar */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Decolar <span className="text-base text-white">(Dequeue)</span>
        </h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5">
          <p>
            Elimina el primer elemento de la cola. Se accede al elemento en{" "}
            <b>front</b>, se elimina y <b>front</b> se incrementa en 1.
          </p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">•</span> Verificar si la
              cola está vacía (<b>front == -1</b> o <b>front &gt; rear</b>). Si
              está vacía, lanzar error de{" "}
              <span className="text-red-400">underflow</span>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Guardar el
              elemento en <b>queue[front]</b> para devolverlo.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Incrementar{" "}
              <b>front</b> (<b>front = front + 1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Si <b>front</b>{" "}
              supera a <b>rear</b>, restablecer la cola (
              <b>front = rear = -1</b>).
            </li>
          </ul>
        </div>
      </section>

      {/* Consulta del Frente */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Frente{" "}
          <span className="text-base text-white">(Front/Peek)</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p>Permite ver el primer elemento de la cola sin eliminarlo.</p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">•</span> Verificar si la
              cola está vacía (<b>front == -1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Devolver el
              valor en <b>queue[front]</b> sin modificar la estructura.
            </li>
          </ul>
        </div>
      </section>

      {/* Consulta del Final */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Final{" "}
          <span className="text-base text-white">(Rear/Peek Rear)</span>
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p>Permite ver el último elemento de la cola sin eliminarlo.</p>
          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">•</span> Verificar si la
              cola está vacía (<b>front == -1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">•</span> Devolver el
              valor en <b>queue[rear]</b> sin modificar la estructura.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
