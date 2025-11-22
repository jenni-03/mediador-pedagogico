import img1 from "../../../../../assets/images/definicion_pila_1.jpg";

export function DefinitionPila() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Pila
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-6 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>

        {/* Qué es una pila */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Una <b className="text-red-400">pila</b> es una estructura lineal
            donde los elementos se agregan y se eliminan únicamente por un
            extremo llamado <b>tope</b>. Esto significa que el último elemento
            en entrar es el primero en salir, propiedad conocida como{" "}
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-semibold text-red-300 border border-red-500/60">
              LIFO · Last In, First Out
            </span>
            .
          </p>
          <p>
            Puedes imaginar una pila como una <b>torre de platos</b>: siempre
            colocas el plato nuevo encima y, cuando necesitas uno, también lo
            tomas desde arriba.
          </p>

          <div className="my-5 flex justify-center">
            <div className="bg-white rounded-2xl border-2 border-red-500 shadow-lg p-4 max-w-md w-full">
              <img
                src={img1}
                alt="Estructura de una pila con tope"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>

          <p className="text-sm text-gray-300">
            En la representación gráfica, el <b>tope</b> es el elemento superior
            de la pila; todas las operaciones se realizan sobre él.
          </p>
        </div>

        {/* Operaciones básicas */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <h4 className="text-lg font-semibold text-red-400">
            Operaciones básicas
          </h4>

          <ul className="space-y-2">
            <li className="flex gap-2 items-start">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <div>
                <b>Push (apilar):</b>{" "}
                inserta un nuevo elemento en el{" "}
                <span className="font-semibold">tope</span> de la pila.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <span className="mt-1 h-2 w-2 rounded-full bg-red-400" />
              <div>
                <b>Pop (desapilar):</b>{" "}
                elimina y devuelve el elemento que está en el tope.
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <span className="mt-1 h-2 w-2 rounded-full bg-yellow-300" />
              <div>
                <b>Peek (consultar tope):</b>{" "}
                permite ver el valor del tope sin quitarlo de la pila.
              </div>
            </li>
          </ul>
        </div>

        {/* Implementación y uso */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <h4 className="text-lg font-semibold text-red-400">
            Implementación y uso
          </h4>
          <p>
            Una pila puede implementarse con{" "}
            <b>arreglos (secuencia estática)</b> o con{" "}
            <b>listas enlazadas</b>. En ambos casos, las operaciones se
            realizan siempre sobre el tope para preservar la propiedad LIFO.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Aplicaciones:</span>{" "}
            control de llamadas a funciones (pila de ejecución), evaluación de
            expresiones, navegación con botones de adelante/atrás en un
            navegador o sistemas de deshacer/rehacer en aplicaciones.
          </p>
        </div>
      </section>
    </div>
  );
}
