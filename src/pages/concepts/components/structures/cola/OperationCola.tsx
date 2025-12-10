import img1 from "../../../../../assets/images/operacion_encolar_1.png";

export function OperationCola() {
  return (
    <div className="py-8 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Cola
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Secuencia de operaciones (FIFO)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro breve */}
      <p className="text-[14.5px] text-gray-200 mb-6 leading-7">
        En una <b className="text-red-400">cola</b>, todas las operaciones se
        organizan alrededor de dos posiciones clave:{" "}
        <b>front (inicio)</b>, donde se atiende al siguiente elemento, y{" "}
        <b>rear (final)</b>, donde se insertan los nuevos elementos. A
        continuación se describen las operaciones más importantes.
      </p>

      {/* ENCOLAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Encolar <span className="text-base text-white">(Enqueue)</span>
        </h2>

        <div className="bg-[#18191a] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p className="text-[15px] leading-7">
            La operación <b>encolar</b> agrega un nuevo elemento al{" "}
            <b>final</b> de la cola. El valor se almacena en la posición
            señalada por <span className="text-cyan-300 font-semibold">rear</span>,
            y luego este índice se ajusta para apuntar al nuevo último elemento.
          </p>

          <div className="flex flex-col items-center gap-2 my-4">
            <img
              src={img1}
              alt="Operación encolar en una cola"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-cyan-400 shadow bg-white"
            />
            <span className="text-[11px] text-gray-400 text-center max-w-md">
              El nuevo dato entra siempre por el final; el frente de la cola no
              cambia durante la inserción.
            </span>
          </div>

          <div className="text-sm text-gray-200 mt-1 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">1.</span> Verificar si
              la cola está llena (en colas de tamaño fijo). Si está llena, se
              produce un{" "}
              <span className="text-red-400 font-semibold">overflow</span>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span> Si la cola
              está vacía (<b>front == -1</b>), inicializar{" "}
              <b>front = 0</b> y <b>rear = 0</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3.</span> En caso
              contrario, incrementar <b>rear</b> (<b>rear = rear + 1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">4.</span> Insertar el
              nuevo elemento en <b>queue[rear]</b>.
            </li>
          </ul>

          <p className="mt-3 text-[13px] text-gray-300">
            En una implementación dinámica (con lista enlazada) el concepto es
            el mismo, pero <b>rear</b> es un puntero al último nodo.
          </p>
        </div>
      </section>

      {/* DESENCOLAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Desencolar <span className="text-base text-white">(Dequeue)</span>
        </h2>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mb-5">
          <p className="text-[15px] leading-7">
            La operación <b>desencolar</b> elimina el elemento ubicado en el{" "}
            <b>inicio</b> de la cola, es decir, aquel que llegó primero. Este
            valor se obtiene desde <b>front</b> y luego se avanza la posición de
            inicio.
          </p>

          <div className="text-sm text-gray-200 mt-3 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">1.</span> Verificar si
              la cola está vacía (<b>front == -1</b> o <b>front &gt; rear</b>).
              Si está vacía, se produce un{" "}
              <span className="text-red-400 font-semibold">underflow</span>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span> Guardar el
              elemento actual en <b>queue[front]</b> para devolverlo.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3.</span> Incrementar{" "}
              <b>front</b> (<b>front = front + 1</b>) para que apunte al
              siguiente elemento de la cola.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">4.</span> Si{" "}
              <b>front</b> supera a <b>rear</b>, significa que la cola quedó
              vacía; restablecer <b>front = rear = -1</b>.
            </li>
          </ul>

          <p className="mt-3 text-[13px] text-gray-300">
            La operación siempre respeta el orden FIFO: nunca se puede eliminar
            un elemento que no sea el que está al frente.
          </p>
        </div>
      </section>

      {/* CONSULTA DEL FRENTE */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Frente{" "}
          <span className="text-base text-white">(Front / Peek)</span>
        </h2>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p className="text-[15px] leading-7">
            Permite ver el primer elemento de la cola sin eliminarlo, útil para
            verificar quién será el siguiente en ser atendido.
          </p>

          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">1.</span> Verificar si
              la cola está vacía (<b>front == -1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span> Devolver el
              valor almacenado en <b>queue[front]</b> sin modificar{" "}
              <b>front</b> ni <b>rear</b>.
            </li>
          </ul>
        </div>
      </section>

      {/* CONSULTA DEL FINAL */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Consulta del Final{" "}
          <span className="text-base text-white">(Rear / Peek Rear)</span>
        </h2>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-5">
          <p className="text-[15px] leading-7">
            Permite observar el último elemento insertado en la cola sin
            retirarlo, es decir, el valor apuntado por <b>rear</b>.
          </p>

          <div className="text-sm text-gray-200 mt-2 mb-2 font-bold">
            Pasos del proceso:
          </div>
          <ul className="space-y-2 text-gray-100 pl-2 text-[15px]">
            <li>
              <span className="text-cyan-400 font-bold">1.</span> Verificar si
              la cola está vacía (<b>front == -1</b>).
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2.</span> Devolver el
              valor almacenado en <b>queue[rear]</b> sin alterar la cola.
            </li>
          </ul>
        </div>
      </section>

      {/* RESUMEN DE COMPLEJIDAD */}
      <section className="mb-4">
        <div className="bg-[#111113] border border-red-500/60 rounded-xl p-4 shadow text-[13px] text-gray-200 space-y-1">
          <h3 className="font-semibold text-red-400 mb-1">
            Resumen de complejidad
          </h3>
          <p>
            En colas bien implementadas (con índices o punteros), las
            operaciones <b>Encolar</b>, <b>Desencolar</b>, <b>Front</b> y{" "}
            <b>Rear</b> se realizan en tiempo <b>O(1)</b>.
          </p>
          <p className="text-gray-400">
            La eficiencia de la cola la convierte en una pieza clave en
            planificadores de tareas, buffers y sistemas de atención por turno.
          </p>
        </div>
      </section>
    </div>
  );
}
