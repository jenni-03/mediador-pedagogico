import img1 from "../../../../../assets/images/definicion_cola_1.jpg";

export function DefinitionCola() {
  return (
    <div className="py-8 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Cola
        </h1>
      </div>

      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal · Modelo FIFO
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* DESCRIPCIÓN PRINCIPAL */}
      <section className="space-y-6 text-[15px] text-gray-200 leading-7">
        <h2 className="text-xl font-bold text-red-500 mb-1">Descripción</h2>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-4">
          <p>
            Una <b className="text-red-400">cola</b> es una estructura de datos
            lineal donde las operaciones de inserción y eliminación se realizan
            en extremos opuestos: se inserta por el <b>final</b> y se elimina
            por el <b>inicio</b>. Por esto se comporta como una fila de personas
            esperando turno.
          </p>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/70 font-semibold">
              FIFO · First In, First Out
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-600/15 border border-cyan-400/60">
              Entrada → <b>final</b>
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/60">
              Salida ← <b>inicio</b>
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 my-4">
            <img
              src={img1}
              alt="Ejemplo visual de una cola"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-red-500 shadow-lg bg-white"
            />
            <span className="text-gray-400 text-xs text-center max-w-lg mt-1">
              Los elementos se atienden estrictamente en el orden en que
              llegaron a la estructura.
            </span>
          </div>

          <div className="bg-[#161618] border-l-4 border-cyan-400 p-3 rounded mt-1 space-y-1">
            <span className="block text-cyan-300 font-semibold">
              ¿Cómo funciona FIFO?
            </span>
            <p>
              Si encolamos los elementos <b>A, B, C, D, E</b> en ese orden:
            </p>
            <p className="text-sm">
              <span className="font-semibold text-cyan-200">Primero en entrar:</span>{" "}
              A · <span className="font-semibold text-yellow-200">Primero en salir:</span>{" "}
              A
            </p>
            <p className="text-sm">
              Después saldrán B, C, D y E, siempre respetando el orden de
              llegada.
            </p>
          </div>
        </div>

        {/* COMPONENTES */}
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
          <h3 className="text-base font-semibold text-cyan-300">
            Componentes de una Cola
          </h3>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span>
              <span>
                <b>Inicio (frente)</b>: posición del próximo elemento en ser
                eliminado.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span>
              <span>
                <b>Final (último)</b>: posición donde se inserta el nuevo
                elemento.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span>
              <span>
                <b>Elementos</b>: datos almacenados en orden de llegada.
              </span>
            </li>
          </ul>
          <p className="text-sm text-gray-300 mt-1">
            Internamente puede implementarse con <b>arreglos</b> o{" "}
            <b>listas enlazadas</b>, siempre respetando que las operaciones se
            hagan en extremos opuestos.
          </p>
        </div>

        {/* OPERACIONES BÁSICAS */}
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-2">
          <h3 className="text-base font-semibold text-red-400">
            Operaciones básicas
          </h3>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                <b>Encolar (enqueue)</b>: inserta un elemento en el{" "}
                <b>final</b> de la cola.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                <b>Desencolar (dequeue)</b>: elimina y devuelve el elemento que
                está en el <b>inicio</b>.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                <b>Front / Peek</b>: consulta el valor del elemento en el{" "}
                <b>inicio</b> sin retirarlo.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                <b>IsEmpty / IsFull</b>: permiten saber si la cola está vacía o
                si ha alcanzado su capacidad máxima.
              </span>
            </li>
          </ul>
        </div>

        {/* APLICACIONES */}
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow">
          <span className="block text-red-400 font-bold mb-1">
            Aplicaciones comunes
          </span>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>Gestión de tareas en sistemas operativos (colas de procesos).</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>Administración de trabajos en impresoras y periféricos.</span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>Atención de clientes o peticiones en sistemas distribuidos.</span>
            </li>
          </ul>
          <p className="mt-2 text-gray-400 text-sm">
            En todos estos casos, la cola garantiza que los elementos se
            atienden en orden justo y predecible según su llegada.
          </p>
        </div>
      </section>

      {/* COLA SIMPLE */}
      <section className="mt-10 space-y-4 text-[15px] text-gray-200 leading-7">
        <h2 className="text-xl font-bold text-red-500 mb-1">Cola Simple</h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-2">
          <p>
            En la <b>cola simple</b> clásica se mantiene un puntero al{" "}
            <b>inicio</b> y otro al <b>final</b>:
          </p>
          <ul className="pl-4 mt-1 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span>
              <span>
                <b>Inserción</b>: siempre por el <b>final</b>, agregando el
                nuevo elemento al final de la fila.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span>
              <span>
                <b>Eliminación</b>: siempre por el <b>inicio</b>, retirando el
                elemento que lleva más tiempo en la cola.
              </span>
            </li>
          </ul>
          <p className="text-sm text-gray-300 mt-1">
            Este modelo sirve como base para variantes más avanzadas como la{" "}
            <b>cola circular</b> o la <b>cola de prioridad</b>, que optimizan el
            uso de memoria o cambian las reglas de atención.
          </p>
        </div>
      </section>
    </div>
  );
}
