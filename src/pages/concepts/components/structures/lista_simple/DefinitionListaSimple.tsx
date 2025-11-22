import img1 from "../../../../../assets/images/definicion_ls_1.jpg";
import img2 from "../../../../../assets/images/definicion_ls_2.jpg";
import img3 from "../../../../../assets/images/definicion_ls_3.jpg";
import img4 from "../../../../../assets/images/definicion_ls_4.jpg";
import img5 from "../../../../../assets/images/definicion_ls_5.jpg";
import img6 from "../../../../../assets/images/definicion_ls_6.jpg";
import img7 from "../../../../../assets/images/definicion_ls_7.jpg";
import img8 from "../../../../../assets/images/definicion_ls_8.jpg";

export function DefinitionListaSimple() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Simple Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Dinámica
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* DESCRIPCIÓN GENERAL */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Una <b className="text-red-400">lista simple enlazada</b> está
            formada por un conjunto de nodos conectados mediante punteros. A
            diferencia de un arreglo, los nodos no tienen por qué estar
            contiguos en memoria: el enlace entre ellos se hace a través de
            direcciones.
          </p>
          <p>
            El primer nodo se llama <b>cabeza</b> y es el punto de inicio para
            recorrer la estructura. Desde él se puede alcanzar al resto de
            nodos, avanzando siempre en una única dirección.
          </p>

          {/* Tarjeta de resumen rápido */}
          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-lg bg-black/40 border border-red-500/60 px-3 py-2 text-xs sm:text-[13px]">
              <p className="font-semibold text-red-400 mb-1">
                Sin tamaño fijo
              </p>
              <p>Crece o decrece al agregar o eliminar nodos.</p>
            </div>
            <div className="rounded-lg bg-black/40 border border-cyan-500/60 px-3 py-2 text-xs sm:text-[13px]">
              <p className="font-semibold text-cyan-300 mb-1">
                Acceso secuencial
              </p>
              <p>Para llegar a un nodo intermedio se recorre desde la cabeza.</p>
            </div>
            <div className="rounded-lg bg-black/40 border border-emerald-500/60 px-3 py-2 text-xs sm:text-[13px]">
              <p className="font-semibold text-emerald-300 mb-1">
                Memoria flexible
              </p>
              <p>Aprovecha memoria dinámica, solo se reserva lo que se usa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ESTRUCTURA DEL NODO */}
      <section className="mt-8 space-y-4 text-[15px] leading-7 text-gray-200">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Estructura de un Nodo
        </h3>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Cada nodo de la lista simple enlazada contiene dos partes
            fundamentales:
          </p>

          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura del nodo"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>

          <ul className="pl-4 space-y-2">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Un campo <b>información</b> que almacena el dato.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Un puntero <b>sig</b> que apunta al siguiente nodo. Si es el
                último nodo de la lista, este puntero vale{" "}
                <span className="text-cyan-300">NULL</span>.
              </span>
            </li>
          </ul>

          <p className="mt-3">
            En pseudocódigo podríamos imaginarlo como:
          </p>
          <pre className="mt-2 bg-black/60 rounded-md px-3 py-2 text-xs sm:text-[13px] font-mono text-gray-100 border border-gray-700">
            {`struct Nodo {
  info : TipoDato
  sig  : puntero a Nodo
}`}
          </pre>
        </div>

        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={img2}
            alt="cadena de nodos"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
          />
          <span className="text-gray-400 text-xs text-center max-w-lg">
            Cadena de nodos enlazados: la lista se recorre siguiendo el puntero{" "}
            <code className="bg-black/60 px-1 rounded text-cyan-200">
              sig
            </code>{" "}
            hasta llegar a <span className="text-cyan-300">NULL</span>.
          </span>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            A diferencia de un arreglo, no existen <b>índices fijos</b>, por lo
            que no se puede acceder directamente a cualquier posición: es
            necesario recorrer la lista nodo a nodo.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> no tiene
            tamaño fijo; utiliza espacio dinámico proporcional al número de
            nodos realmente almacenados.
          </p>
        </div>
      </section>

      {/* EJEMPLO: INSERTAR */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo gráfico · Insertar nodos
        </h3>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-4 text-[15px] text-gray-200">
          <p>
            Supongamos que queremos construir una lista simple insertando los
            valores <b>10, 1, 23, 2, 12</b> uno tras otro al final de la lista.
          </p>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                1. Insertamos <b>10</b> y luego <b>1</b>. Ahora llega el dato{" "}
                <b>23</b>, que se enlaza al final:
              </p>
              <img
                src={img3}
                alt="inserción paso 1"
                className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                2. Después se insertan <b>2</b> y <b>12</b>, siempre
                actualizando el puntero del último nodo para que apunte al nuevo
                nodo insertado:
              </p>
              <img
                src={img4}
                alt="inserción paso 2"
                className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="mt-1">La lista final queda así:</p>
            <img
              src={img5}
              alt="lista resultante"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-emerald-400 shadow mx-auto"
            />
          </div>
        </div>
      </section>

      {/* EJEMPLO: ELIMINAR */}
      <section className="mt-10 space-y-5 mb-8">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo gráfico · Eliminar un nodo
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-4 text-[15px] text-gray-200">
          <p>
            Ahora partimos de una lista donde los nodos contienen{" "}
            <b>29 → 11 → 30 → 23 → 3</b> y queremos eliminar el nodo con valor{" "}
            <b>11</b>.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              1. Identificamos el nodo a eliminar y el nodo anterior (que
              contiene <b>29</b>):
            </p>
            <img
              src={img6}
              alt="lista con nodo a eliminar"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              2. Actualizamos el puntero{" "}
              <code className="bg-black/70 text-cyan-200 px-2 rounded">
                sig
              </code>{" "}
              del nodo <b>29</b> para que apunte directamente al nodo{" "}
              <b>30</b>, saltándonos el nodo <b>11</b>:
            </p>
            <img
              src={img7}
              alt="puntero actualizado"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              3. Finalmente, el nodo eliminado queda desconectado y la lista
              mantiene su continuidad:
            </p>
            <img
              src={img8}
              alt="lista tras eliminación"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-emerald-400 shadow mx-auto"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
