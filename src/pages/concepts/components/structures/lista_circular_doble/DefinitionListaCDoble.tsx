import img1 from "../../../../../assets/images/definicion_ls_1.jpg";
import img2 from "../../../../../assets/images/definicion_ls_2.jpg";
import img3 from "../../../../../assets/images/definicion_ls_3.jpg";
import img4 from "../../../../../assets/images/definicion_ls_4.jpg";
import img5 from "../../../../../assets/images/definicion_ls_5.jpg";
import img6 from "../../../../../assets/images/definicion_ls_6.jpg";
import img7 from "../../../../../assets/images/definicion_ls_7.jpg";
import img8 from "../../../../../assets/images/definicion_ls_8.jpg";

export function DefinitionListaCDoble() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Simple Enlazada
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
            Una <b className="text-red-400">lista simple enlazada</b> está
            formada por un elemento fundamental llamado <b>Nodo</b>. El nodo
            almacena la información y la dirección del siguiente nodo. El primer
            nodo se llama <b>cabeza</b> y es el punto de inicio.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura del nodo"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un campo{" "}
              <b>Información</b> que almacena el dato.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un puntero <b>sig</b>{" "}
              que apunta al siguiente nodo. Si es el último, apunta a{" "}
              <span className="text-cyan-300">NULL</span>.
            </li>
          </ul>
          <p className="mt-3">
            Los nodos pueden estar en posiciones de memoria no contiguas; el
            puntero es quien los enlaza.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={img2}
            alt="cadena de nodos"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
          />
          <span className="text-gray-400 text-xs text-center max-w-lg">
            Cadena de nodos enlazados: forman una estructura lineal dinámica.
          </span>
        </div>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            A diferencia de un arreglo, no existen índices fijos, así que no se
            puede acceder directamente a cualquier posición; se debe recorrer
            nodo a nodo.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> No
            tiene tamaño fijo, usa espacio dinámico proporcional al número de
            nodos.
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
            Se insertan los números: <b>10, 1, 23, 2, 12</b> en una Lista
            Simple.
          </p>
          <div className="flex flex-col gap-4">
            <img
              src={img3}
              alt="inserción paso 1"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
            <img
              src={img4}
              alt="inserción paso 2"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
          </div>
          <p className="mt-3">Resultado final:</p>
          <img
            src={img5}
            alt="lista resultante"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>

      {/* Ejemplo de Eliminar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Eliminar
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p>Teniendo la siguiente Lista Simple:</p>
          <img
            src={img6}
            alt="lista con nodo a eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
          <p>
            Se desea eliminar el nodo con valor <b>11</b>. Se actualiza el
            puntero{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">sig</code>{" "}
            del nodo anterior para que apunte al nodo siguiente al eliminado.
          </p>
          <img
            src={img7}
            alt="puntero actualizado"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
          <p>Lista final después de eliminar:</p>
          <img
            src={img8}
            alt="lista tras eliminación"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
