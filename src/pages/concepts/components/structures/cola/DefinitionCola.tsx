import img1 from "../../../../../assets/images/definicion_cola_1.jpg";

export function DefinitionCola() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Cola
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Descripción principal */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h2 className="text-xl font-bold text-red-500 mb-1">Descripción</h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una <b className="text-red-400">cola</b> es una estructura de datos
            lineal donde las operaciones de inserción y eliminación se realizan
            en extremos opuestos: la inserción ocurre en el <b>final</b> y el
            borrado en el <b>inicio</b>. Esto significa que el primer elemento
            en entrar es también el primero en salir (<b>FIFO</b>:{" "}
            <span className="italic">First In First Out</span>).
          </p>
          <div className="flex flex-col items-center gap-2 my-4">
            <img
              src={img1}
              alt="Ejemplo visual cola"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-red-500 shadow-lg"
            />
            <span className="text-gray-400 text-xs text-center max-w-lg mt-2">
              <b className="text-red-400">Ejemplo:</b> Los elementos se eliminan
              en el mismo orden en que se insertaron.
            </span>
          </div>
          <div className="bg-[#161618] border-l-4 border-cyan-400 p-3 rounded mb-3 mt-2">
            <span className="block text-cyan-300 font-semibold mb-1">
              ¿Cómo funciona FIFO?
            </span>
            <p>
              Si insertas los elementos <b>A, B, C, D, E</b> en ese orden,
              también saldrán en ese mismo orden. La cola siempre elimina el
              elemento que está al principio (<b>inicio</b>), y agrega al final
              (<b>final</b>).
            </p>
          </div>
        </div>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow">
          <span className="block text-red-400 font-bold mb-1">
            Aplicaciones comunes
          </span>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Organización de
              tareas en sistemas operativos.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Administración de
              impresoras y periféricos.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Procesamiento
              secuencial de solicitudes o clientes.
            </li>
          </ul>
          <p className="mt-2 text-gray-400">
            El ordenador encola los trabajos y los procesa uno a uno según su
            orden de llegada. Si hay prioridades, puede haber una cola para cada
            nivel.
          </p>
        </div>
      </section>

      {/* Cola Simple */}
      <section className="mt-10 space-y-4 text-[15px] text-gray-200 leading-7">
        <h2 className="text-xl font-bold text-red-500 mb-1">Cola Simple</h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow">
          <p>
            En la <b>cola simple</b>, se inserta por el <b>final</b> y se
            elimina por el <b>inicio</b>. Es importante llevar registro del
            elemento siguiente a eliminar (<b>inicio</b>) y del último elemento
            insertado (<b>final</b>).
          </p>
          <ul className="pl-4 mt-2 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span> Inserción: por el{" "}
              <b>final</b>.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span> Eliminación: por el{" "}
              <b>inicio</b>.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}