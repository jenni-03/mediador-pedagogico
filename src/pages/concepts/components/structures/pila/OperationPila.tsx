import img2 from "../../../../../assets/images/definicion_pila_2.jpg";
import img3 from "../../../../../assets/images/definicion_pila_3.jpg";

export function OperationPila() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Pila
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal LIFO
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      <p className="text-sm mb-6">
        La estructura de datos <b className="text-red-400">Pila</b> se
        caracteriza porque las operaciones se realizan siempre en un solo
        extremo llamado <b>tope</b>. Las dos operaciones principales son:
      </p>

      <ul className="list-disc ml-5 text-sm space-y-1 mb-8">
        <li>
          <b>Apilar (Push)</b>: Inserta un elemento en el tope.
        </li>
        <li>
          <b>Desapilar (Pop)</b>: Elimina el elemento del tope.
        </li>
      </ul>

      {/* Apilar */}
      <section className="space-y-4 text-sm leading-6">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">Apilar</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Esta operación inserta un nuevo elemento en la parte superior de la
            pila. No hay restricciones sobre valores repetidos ni orden.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img2}
              alt="apilar en pila"
              className="w-full h-auto max-w-md rounded-lg border border-cyan-400 shadow"
            />
          </div>
          <p className="font-bold mt-3">Pasos del proceso:</p>
          <ul className="list-decimal ml-5 mt-2 space-y-1">
            <li>Crear el nuevo nodo con el valor a insertar.</li>
            <li>
              Apuntar el puntero del nuevo nodo al nodo que actualmente es el
              tope.
            </li>
            <li>
              Actualizar la referencia del tope para que apunte al nuevo nodo.
            </li>
          </ul>
        </div>
      </section>

      {/* Desapilar */}
      <section className="mt-10 text-sm leading-6 space-y-4">
        <h3 className="text-2xl font-semibold text-red-400 mb-2">Desapilar</h3>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p>
            Esta operación elimina el elemento que se encuentra en el tope de la
            pila. Debido a la naturaleza LIFO, siempre se elimina el último
            elemento insertado.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img3}
              alt="desapilar en pila"
              className="w-full h-auto max-w-md rounded-lg border border-red-500 shadow"
            />
          </div>
          <p className="font-bold mt-3">Pasos del proceso:</p>
          <ul className="list-decimal ml-5 mt-2 space-y-1">
            <li>Verificar que la pila no esté vacía.</li>
            <li>
              Guardar una referencia temporal del nodo que está en el tope.
            </li>
            <li>
              Actualizar el puntero del tope para que apunte al siguiente nodo.
            </li>
            <li>Liberar la memoria o descartar el nodo eliminado.</li>
          </ul>
          <p className="mt-3">
            Si después de desapilar no quedan elementos, el tope queda{" "}
            <span className="text-cyan-300">null</span>, indicando que la pila
            está vacía.
          </p>
        </div>
      </section>
    </div>
  );
}
