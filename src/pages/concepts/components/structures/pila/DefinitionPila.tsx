import img1 from "../../../../../assets/images/definicion_pila_1.jpg";

export function DefinitionPila() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Pila
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una <b className="text-red-400">pila</b> es una colección de datos
            que representa una estructura lineal en la cual los elementos se
            agregan o se eliminan únicamente por un extremo, denominado{" "}
            <b>tope</b>. Esta característica implica que el último elemento en
            entrar será el primero en salir, razón por la cual se conoce como
            estructura <b>LIFO</b> (Last In, First Out).
          </p>
          <p className="mt-3">
            Sus operaciones básicas son:
            <ul className="pl-4 space-y-1 mt-2">
              <li className="flex gap-2 items-start">
                <span className="text-red-400 mt-1">•</span>
                <b>Push (apilar):</b> inserta un elemento en el tope de la pila.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-400 mt-1">•</span>
                <b>Pop (desapilar):</b> elimina el elemento ubicado en el tope.
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-red-400 mt-1">•</span>
                <b>Peek (consultar tope):</b> permite ver el elemento en el tope
                sin eliminarlo.
              </li>
            </ul>
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura de una pila"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
          <p>
            Una pila puede implementarse mediante arreglos o listas enlazadas.
            En una implementación con listas enlazadas, las operaciones se
            realizan siempre en el principio de la lista para mantener la
            propiedad LIFO.
          </p>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> las
            pilas son simples de implementar y muy útiles para resolver
            problemas donde el orden de procesamiento debe ser inverso al de
            llegada de los datos, como el control de llamadas a funciones, el
            manejo de expresiones matemáticas o el sistema de deshacer en
            aplicaciones.
          </p>
        </div>
      </section>
    </div>
  );
}
