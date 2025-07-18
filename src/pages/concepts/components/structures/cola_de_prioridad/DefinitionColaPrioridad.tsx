import img1 from "../../../../../assets/images/definicion_cola_prioridad_1.jpg";

export function DefinitionColaPrioridad() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Cola de Prioridad
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h2 className="text-xl font-bold text-red-500 mb-1">Descripción</h2>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Las <b className="text-red-400">colas de prioridad</b> son una
            extensión de la estructura de datos cola, en la que el orden de
            salida depende tanto del orden de llegada como de la prioridad
            asignada a cada elemento. Cuando un elemento ingresa, se posiciona
            al final del segmento de su misma prioridad.
          </p>
          <ul className="mt-3 pl-5 space-y-1">
            <li className="flex items-start">
              <span className="text-cyan-400 mt-1 mr-2">•</span>
              <span>
                No es necesario seguir un orden <b>FIFO</b> estricto.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-cyan-400 mt-1 mr-2">•</span>
              <span>
                El orden puede basarse en una <b>función de comparación</b>{" "}
                (prioridad numérica).
              </span>
            </li>
          </ul>
          <p className="mt-3">
            Las operaciones principales son las mismas que en una cola estándar,
            pero se consideran las prioridades al encolar y desencolar.
          </p>
        </div>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow">
          <span className="block font-bold text-red-400 mb-2">
            Reglas de procesamiento:
          </span>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span> El elemento con
              mayor prioridad es procesado primero.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-400 mt-1">•</span> Si dos elementos
              tienen la misma prioridad, se procesan según el orden de llegada
              (FIFO entre iguales).
            </li>
          </ul>
          <p className="text-gray-400 mt-3">
            Ejemplo: Si la prioridad más alta es <b>0</b> y la más baja es{" "}
            <b>3</b>, la estructura se organiza de mayor a menor prioridad.
          </p>
          <div className="flex justify-center my-4">
            <img
              src={img1}
              alt="Ejemplo visual cola de prioridad"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border-2 border-red-500 shadow"
            />
          </div>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            La cola de prioridad cuenta con las mismas rutinas que la estructura
            de cola genérica, pero al encolar y desencolar siempre se tiene en
            cuenta la prioridad para posicionar y procesar los elementos.
          </p>
        </div>
      </section>
    </div>
  );
}