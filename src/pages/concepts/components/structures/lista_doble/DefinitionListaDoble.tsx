import img1 from "../../../../../assets/images/definicion_ld_1.jpg";
import img2 from "../../../../../assets/images/definicion_ld_2.jpg";
import img3 from "../../../../../assets/images/definicion_ld_3.jpg";
import img4 from "../../../../../assets/images/definicion_ld_4.jpg";
import img5 from "../../../../../assets/images/definicion_ld_5.jpg";
import img6 from "../../../../../assets/images/definicion_ld_6.jpg";
import img7 from "../../../../../assets/images/definicion_ld_7.jpg";
import img8 from "../../../../../assets/images/definicion_ld_8.jpg";

export function DefinitionListaDoble() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Doblemente Enlazada
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
            Una <b className="text-red-400">lista doblemente enlazada</b> está
            formada por nodos que contienen tres partes:
          </p>
          <ul className="pl-4 space-y-1 mt-2">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un campo{" "}
              <b>Información</b> que almacena el dato.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un puntero <b>ant</b>{" "}
              que apunta al nodo anterior.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Un puntero <b>sig</b>{" "}
              que apunta al nodo siguiente.
            </li>
          </ul>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura del nodo doble"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
          <p>
            Esto permite recorrer la lista en ambas direcciones, hacia adelante
            y hacia atrás, facilitando algunas operaciones como eliminar o
            insertar en cualquier posición.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={img2}
            alt="cadena de nodos dobles"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
          />
          <span className="text-gray-400 text-xs text-center max-w-lg">
            Cada nodo está conectado con su anterior y su siguiente, formando
            una estructura bidireccional.
          </span>
        </div>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Al igual que la lista simple, los nodos no están en posiciones
            contiguas. Sin embargo, la posibilidad de retroceder facilita
            algunas operaciones.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> mayor
            flexibilidad al recorrer o modificar la lista desde cualquier punto.
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
            Se insertan los números: <b>13, 25, 4 y 23</b> en una Lista Doble.
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
            alt="lista doble resultante"
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
          <p>Teniendo la siguiente Lista Doble:</p>
          <img
            src={img6}
            alt="lista con nodo a eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
          <p>
            Se desea eliminar el nodo con valor <b>29 </b>. Se actualizan los
            punteros{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">sig</code>{" "}
            y{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">ant</code>{" "}
            de los nodos adyacentes para excluir al nodo eliminado.
          </p>
          <img
            src={img7}
            alt="punteros actualizados"
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
