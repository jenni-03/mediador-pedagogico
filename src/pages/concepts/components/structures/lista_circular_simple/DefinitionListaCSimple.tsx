import img1 from "../../../../../assets/images/definicion_lcs_1.jpg";
import img2 from "../../../../../assets/images/definicion_lcs_2.jpg";
import img3 from "../../../../../assets/images/definicion_lcs_3.jpg";
import img4 from "../../../../../assets/images/definicion_lcs_4.jpg";
import img5 from "../../../../../assets/images/definicion_lcs_5.jpg";
import img6 from "../../../../../assets/images/definicion_lcs_6.jpg";
import img7 from "../../../../../assets/images/definicion_lcs_7.jpg";

export function DefinitionListaCSimple() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Circular Simplemente Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Circular
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una{" "}
            <b className="text-red-400">lista circular simplemente enlazada </b>
            es una variación de la lista simple en la que el <b>
              último nodo
            </b>{" "}
            no apunta a <span className="text-cyan-300">NULL</span>, sino que
            enlaza nuevamente al primer nodo (<b>cabeza</b>), formando un
            círculo cerrado.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura nodo circular"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un campo{" "}
              <b>Información</b> que almacena el dato.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un puntero sig que
              apunta al siguiente nodo. En el último nodo, este puntero apunta a
              la cabeza, manteniendo la circularidad.
            </li>
          </ul>
          <p className="mt-3">
            Aún cuando una lista circularmente enlazada no tiene inicio o
            terminación, no obstante se necesita que algún nodo esté marcado
            como especial, el cual será llamado el cursor. El nodo cursor
            permite tener un lugar para iniciar si se requiere recorrer una
            lista circularmente inversa. Y si se recuerda esta posición inicial,
            entonces también se puede saber cuando se haya terminado con un
            recorrido en la lista circularmente enlazada, que es cuando se
            regresa al nodo que fue el nodo cursor cuando se inicio.
          </p>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Al igual que una lista simple, los nodos no ocupan posiciones
            contiguas en memoria. El puntero <b>sig</b> enlaza los nodos
            independientemente de su ubicación física.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> permite
            recorrer toda la estructura desde cualquier nodo, no solo desde la
            cabeza, y no requiere condiciones especiales para saber si se ha
            alcanzado el final (aunque sí para evitar bucles infinitos).
          </p>
        </div>
      </section>

      {/* Ejemplo de Insertar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Insertar
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p className="text-gray-200">
            Se insertan los números: <b>1, 12, 3, 9 y 8.</b> en una Lista
            Circular Simple. El último nodo siempre se enlaza nuevamente con la
            cabeza.
          </p>
          <div className="flex flex-col items-center gap-2 my-6">
            <img
              src={img2}
              alt="ciclo de nodos circulares"
              className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
            <span className="text-gray-400 text-xs text-center max-w-lg">
              La lista forma un ciclo: el último nodo apunta nuevamente al
              primero.
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <img
              src={img3}
              alt="inserción paso 1 circular"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
          </div>
          <p className="mt-3">Resultado final:</p>
          <img
            src={img4}
            alt="inserción paso 2 circular"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
          />
        </div>
      </section>

      {/* Ejemplo de Eliminar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Eliminar
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p>Considerando la siguiente Lista Circular Simple:</p>
          <img
            src={img5}
            alt="lista circular resultante"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
          <p>
            Se desea eliminar el <b>11</b> de la Lista Simple, se modifica el
            puntero
            <code className="bg-black/70 text-cyan-200 px-2 rounded">sig</code>
            del nodo anterior, hacia el nodo siguiente del nodo que se eliminó.
          </p>
          <img
            src={img6}
            alt="lista circular con nodo a eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
          <p>Lista final después de eliminar:</p>
          <img
            src={img7}
            alt="puntero ajustado circular"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
