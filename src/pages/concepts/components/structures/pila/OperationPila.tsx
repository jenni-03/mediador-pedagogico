import img2 from "../../../../../assets/images/definicion_pila_2.jpg";
import img3 from "../../../../../assets/images/definicion_pila_3.jpg";

export function OperationPila() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Pila
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal LIFO
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Introducción a las operaciones */}
      <section className="text-sm leading-6 mb-10 space-y-3">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            En una <b className="text-red-400">Pila</b> todas las operaciones se
            realizan sobre un único extremo llamado <b>tope</b>. Por eso decimos
            que es una estructura <b>LIFO</b>{" "}
            <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full border border-red-500/60 ml-1">
              Last In, First Out
            </span>
            : el último en entrar es el primero en salir.
          </p>
          <p className="mt-1">Las operaciones fundamentales son:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <b>Push (apilar)</b>: inserta un elemento en el tope.
            </li>
            <li>
              <b>Pop (desapilar)</b>: elimina el elemento del tope.
            </li>
            <li>
              <b>Peek (consultar)</b>: permite ver el valor del tope sin
              modificar la pila.
            </li>
          </ul>
        </div>
      </section>

      {/* APILAR */}
      <section className="space-y-4 text-sm leading-6 mb-12">
        <h3 className="text-2xl font-semibold text-cyan-300 mb-1">
          Operación Push · Apilar
        </h3>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3">
          <p>
            <b>Apilar</b> agrega un nuevo elemento en la parte superior de la
            pila. Es una operación muy eficiente: solo modifica referencias en
            el tope, por lo que su costo es{" "}
            <span className="font-semibold">O(1)</span>.
          </p>

          <div className="my-3 flex justify-center">
            <img
              src={img2}
              alt="Apilar elemento en la pila"
              className="w-full h-auto max-w-md rounded-xl border border-cyan-400 shadow"
            />
          </div>

          <div>
            <p className="font-bold">Pasos del proceso (lista enlazada):</p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>Crear un nuevo nodo con el valor a insertar.</li>
              <li>
                Hacer que el puntero del nuevo nodo apunte al nodo que
                actualmente es el <b>tope</b>.
              </li>
              <li>
                Actualizar la referencia del <b>tope</b> para que apunte al
                nuevo nodo.
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            Si la pila está implementada con un arreglo, el push coloca el nuevo
            elemento en la siguiente posición libre del arreglo.
          </p>
        </div>
      </section>

      {/* DESAPILAR */}
      <section className="space-y-4 text-sm leading-6 mb-12">
        <h3 className="text-2xl font-semibold text-red-400 mb-1">
          Operación Pop · Desapilar
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            <b>Desapilar</b> elimina el elemento que se encuentra en el tope de
            la pila y, normalmente, lo devuelve como resultado. Siempre se retira
            el último elemento insertado.
          </p>

          <div className="my-3 flex justify-center">
            <img
              src={img3}
              alt="Desapilar elemento de la pila"
              className="w-full h-auto max-w-md rounded-xl border border-red-500 shadow"
            />
          </div>

          <div>
            <p className="font-bold">Pasos del proceso (lista enlazada):</p>
            <ul className="list-decimal ml-5 mt-2 space-y-1">
              <li>Verificar que la pila no esté vacía.</li>
              <li>
                Guardar una referencia temporal al nodo que está en el{" "}
                <b>tope</b>.
              </li>
              <li>
                Actualizar el <b>tope</b> para que apunte al siguiente nodo.
              </li>
              <li>
                Liberar o descartar el nodo eliminado y devolver su valor.
              </li>
            </ul>
          </div>

          <p className="mt-2 text-sm">
            Si después de desapilar no quedan elementos, la referencia al{" "}
            <b>tope</b> se establece en{" "}
            <span className="text-cyan-300 font-semibold">null</span>, indicando
            que la pila está vacía.
          </p>
        </div>
      </section>

      {/* PEEK + ESTADOS ESPECIALES */}
      <section className="space-y-4 text-sm leading-6 mb-12">
        <h3 className="text-2xl font-semibold text-yellow-300 mb-1">
          Operación Peek · Consultar Tope
        </h3>

        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow space-y-3">
          <p>
            <b>Peek</b> permite <b>mirar</b> el valor del elemento ubicado en el
            tope sin retirarlo de la pila.
          </p>
          <ul className="list-decimal ml-5 mt-2 space-y-1">
            <li>Verificar que la pila no esté vacía.</li>
            <li>Leer el valor almacenado en el nodo tope.</li>
            <li>No se modifican punteros ni se elimina ningún elemento.</li>
          </ul>
          <p className="text-xs text-gray-400">
            Es útil para tomar decisiones sin alterar el contenido de la pila.
          </p>
        </div>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <h4 className="text-lg font-semibold text-red-400">
            Pila vacía y desbordamiento
          </h4>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              <b>Underflow (pila vacía):</b> ocurre cuando se intenta hacer{" "}
              <code>pop</code> o <code>peek</code> y la pila no contiene
              elementos.
            </li>
            <li>
              <b>Overflow (desbordamiento):</b> en pilas implementadas con
              arreglo, sucede cuando se intenta hacer <code>push</code> y el
              arreglo ya está lleno.
            </li>
          </ul>
          <p className="text-xs text-gray-400 mt-1">
            En ambos casos, el programa debe manejar el error para evitar
            resultados inesperados.
          </p>
        </div>
      </section>
    </div>
  );
}
