import img1 from "../../../../../assets/images/operation_splay_1.jpg";
import img2 from "../../../../../assets/images/operation_splay_2.jpg";
import img3 from "../../../../../assets/images/operation_splay_3.jpg";
import img4 from "../../../../../assets/images/operation_splay_4.jpg";
import img5 from "../../../../../assets/images/operation_splay_5.jpg";

export function OperationArbolSplay() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Splay <span className="text-white">Operaciones</span>
        </h1>
      </div>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Inserción de un dato */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Inserción de un dato
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-1">
            Para insertar un nodo <b>x</b> en un árbol splay; primero se inserta
            como si fuera un árbol binario de búsqueda y luego se hace splay en
            el nodo insertado.
          </p>
        </div>
        <div className="mb-3 font-semibold text-white">
          <b>Ejemplo: Insertar 5</b>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo insertar splay"
          />
        </div>
      </section>

      {/* Búsqueda */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Búsqueda
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <ul className="list-none space-y-2 text-[15px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Si la localización es exitosa, la salida será un árbol binario
                de búsqueda con <b>x</b> como raíz.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Si la localización fracasa, la salida será un árbol binario de
                búsqueda que tendrá como raíz el nodo en el que la búsqueda
                fracasó.
              </span>
            </li>
          </ul>
        </div>
        <div className="mb-3 font-semibold text-white">
          <b>Ejemplo: Buscar 7</b>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo buscar splay"
          />
        </div>
      </section>

      {/* Búsqueda sin éxito */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <div className="font-semibold text-white mb-2">
            Ejemplo de una búsqueda sin éxito.
            <br />
            <span className="text-red-400">Buscar 2</span> → como el 2 no se
            encuentra en el árbol entonces se guarda el último nodo en el cual
            la búsqueda fracasó, en este caso es 3, y luego se hace splay a ese
            nodo quedando como raíz.
          </div>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Búsqueda sin éxito splay"
          />
        </div>
      </section>

      {/* Eliminar un dato */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Eliminar un Dato
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <ul className="list-none space-y-2 text-[15px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">Buscar x.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Si la raíz no es x, no hay nada que hacer.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Eliminar el nodo que contiene a x. Quedan dos subárboles I y D.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">Buscar el máximo de I.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Colocar D como hijo derecho del máximo.
              </span>
            </li>
          </ul>
        </div>
        <div className="mb-3 font-semibold text-white">
          <b>Ejemplo: Eliminar 6</b>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo eliminar splay"
          />
        </div>
      </section>

      {/* Eliminar no encontrado */}
      <section className="mb-8">
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <span className="font-semibold text-white">
            <span className="text-red-400">Eliminar 4:</span> como 4 no se
            encuentra en el árbol entonces se aplica splay al nodo 3 ya que fue
            el último nodo donde fracasó la búsqueda y luego no se hace nada.
          </span>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Eliminar no encontrado splay"
          />
        </div>
      </section>
    </div>
  );
}
