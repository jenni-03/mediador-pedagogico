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
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Circular Simplemente Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Circular
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* DESCRIPCIÓN */}
      <section className="space-y-5 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción general</h3>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Una{" "}
            <b className="text-red-400">lista circular simplemente enlazada</b>{" "}
            es una variación de la lista simple en la que el{" "}
            <b>último nodo</b> no apunta a{" "}
            <span className="text-cyan-300 font-semibold">NULL</span>, sino que
            enlaza nuevamente al primer nodo (<b>cabeza</b>). De esta forma, la
            estructura completa forma un <b>circuito cerrado</b>.
          </p>

          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="Lista circular simplemente enlazada"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>

          <ul className="pl-4 space-y-2">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Un campo <b>Información</b> que almacena el dato.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Un puntero <b>sig</b> que apunta al siguiente nodo. En el{" "}
              <b>último nodo</b>, este puntero vuelve a la cabeza, manteniendo
              la circularidad.
            </li>
          </ul>
        </div>

        {/* Cursor */}
        <div className="bg-[#18191a] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3">
          <h4 className="text-lg font-semibold text-cyan-300">
            El nodo cursor: punto de referencia
          </h4>
          <p>
            Aunque la lista circular no tiene un inicio ni un final claros, es
            útil escoger un nodo especial llamado <b>cursor</b>:
          </p>
          <ul className="pl-4 space-y-2">
            <li className="flex gap-2 items-start">
              <span className="text-cyan-300 mt-1">•</span>
              Sirve como <b>punto de partida</b> para recorrer la lista.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-300 mt-1">•</span>
              Permite detectar cuándo se ha dado una <b>vuelta completa</b>:
              cuando se regresa al nodo cursor, el recorrido terminó.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-cyan-300 mt-1">•</span>
              También puede utilizarse para recorridos en sentido inverso,
              almacenando la referencia al nodo donde se inició.
            </li>
          </ul>
        </div>

        {/* Ventajas */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            Al igual que en una lista simple, los nodos <b>no ocupan</b>{" "}
            posiciones contiguas en memoria: el puntero <b>sig</b> es el que
            enlaza toda la estructura.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja principal:</span>{" "}
            se puede recorrer la lista <b>desde cualquier nodo</b>, no solo
            desde la cabeza, y no se requieren condiciones especiales para saber
            si se alcanzó el "final": basta con regresar al nodo de inicio.
          </p>
        </div>
      </section>

      {/* EJEMPLO: INSERTAR */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">Ejemplo: Insertar</h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-4">
          <p className="text-gray-200">
            Se insertan los números <b>1, 12, 3, 9 y 8</b> en una lista circular
            simple. El último nodo siempre se enlaza nuevamente con la cabeza.
          </p>

          <div className="flex flex-col items-center gap-2 my-4">
            <img
              src={img2}
              alt="Lista circular durante inserción"
              className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
            <span className="text-gray-400 text-xs text-center max-w-lg">
              La lista va creciendo, pero la flecha amarilla siempre regresa al
              primer nodo.
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <img
              src={img3}
              alt="Inserción paso a paso en lista circular"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
          </div>

          <p className="mt-2 font-semibold text-gray-100">
            Resultado final: la lista queda completamente circular.
          </p>
          <img
            src={img4}
            alt="Lista circular final tras inserciones"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>

      {/* EJEMPLO: ELIMINAR */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">Ejemplo: Eliminar</h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-4">
          <p>Considerando la siguiente Lista Circular Simple:</p>
          <img
            src={img5}
            alt="Lista circular inicial para eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />

          <p>
            Se desea eliminar el nodo con valor <b>11</b>. Para hacerlo, se
            modifica el puntero{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">sig</code>{" "}
            del nodo anterior para que apunte al nodo siguiente del que se
            elimina, manteniendo el ciclo.
          </p>

          <img
            src={img6}
            alt="Actualización de puntero en lista circular"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />

          <p>Lista final después de eliminar:</p>
          <img
            src={img7}
            alt="Lista circular después de eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
