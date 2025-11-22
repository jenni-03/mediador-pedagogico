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
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Splay <span className="text-white">· Operaciones</span>
        </h1>
      </div>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Inserción */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Inserción de un dato
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Para insertar un nodo con clave <b>x</b> en un árbol Splay se siguen
            dos fases:
          </p>
          <ol className="list-decimal list-inside text-gray-100 space-y-1 mb-1">
            <li>
              Insertar <b>x</b> como en un <b>árbol binario de búsqueda</b>
              normal.
            </li>
            <li>
              Aplicar <b>splay(x)</b> para mover el nodo insertado a la raíz.
            </li>
          </ol>
          <p className="text-gray-300 text-sm">
            De esta forma, los elementos recién insertados quedan cerca de la
            raíz y son rápidos de volver a utilizar.
          </p>
        </div>

        {/* Ejemplo insertar */}
        <div className="mb-3 font-semibold text-white">
          Ejemplo: <span className="text-red-300">insertar 5</span>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo de inserción de 5 en un árbol splay"
          />
        </div>
      </section>

      {/* Búsqueda */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Búsqueda
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Para buscar una clave <b>x</b> en un árbol Splay:
          </p>
          <ol className="list-decimal list-inside text-gray-100 space-y-1 mb-3">
            <li>
              Se realiza una <b>búsqueda de ABB</b> estándar, descendiendo por
              izquierda o derecha según la comparación con x.
            </li>
            <li>
              Si la búsqueda es exitosa, se aplica <b>splay(x)</b> para que x
              pase a ser la raíz.
            </li>
            <li>
              Si la búsqueda <b>no encuentra</b> la clave, se aplica{" "}
              <b>splay(y)</b>, donde y es el último nodo visitado antes de
              fracasar. Ese nodo queda como nueva raíz.
            </li>
          </ol>
          <ul className="list-none space-y-2 text-[15px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Si la localización es exitosa, el árbol resultante es un ABB con{" "}
                <b>x</b> como raíz.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Si la localización fracasa, el árbol resultante es un ABB cuya
                raíz es el <b>nodo donde la búsqueda fracasó</b> (el más cercano
                a x).
              </span>
            </li>
          </ul>
        </div>

        {/* Ejemplo búsqueda exitosa */}
        <div className="mb-3 font-semibold text-white">
          Ejemplo: <span className="text-red-300">buscar 7</span>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo de búsqueda exitosa de 7 en un árbol splay"
          />
        </div>
      </section>

      {/* Búsqueda sin éxito */}
      <section className="mb-10">
        <h3 className="text-xl font-bold text-red-400 mb-3">
          Búsqueda sin éxito
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="font-semibold text-white mb-1">
            Ejemplo: <span className="text-red-300">buscar 2</span>
          </p>
          <p className="text-gray-100">
            Como la clave <b>2</b> no se encuentra en el árbol, la búsqueda
            desciende hasta el último nodo posible, que en este caso es{" "}
            <b>3</b>. Ese nodo se considera el punto donde la búsqueda fracasó.
            Luego se aplica <b>splay(3)</b>, por lo que 3 pasa a ser la nueva
            raíz del árbol, aunque 2 no exista.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Búsqueda sin éxito de 2 en un árbol splay"
          />
        </div>
      </section>

      {/* Eliminación */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Eliminar un dato
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Para eliminar una clave <b>x</b> de un árbol Splay se aprovecha la
            operación de splay para separar el árbol en dos partes:
          </p>
          <ol className="list-decimal list-inside text-gray-100 space-y-1 mb-3">
            <li>
              Buscar <b>x</b> y aplicar <b>splay(x)</b>. Si después de esta
              operación la raíz no es x, la clave no existe y no se elimina
              nada.
            </li>
            <li>
              Si la raíz es x, se eliminan ese nodo y su clave. Quedan dos
              subárboles: <b>L</b> (izquierdo) y <b>R</b> (derecho).
            </li>
            <li>
              Si <b>L es nulo</b>, la nueva raíz pasa a ser R.
            </li>
            <li>
              Si <b>L no es nulo</b>, se busca el <b>máximo de L</b> (el nodo
              más a la derecha de L) y se aplica <b>splay</b> sobre ese nodo
              dentro de L. El resultado es que dicho máximo queda como raíz de L
              y no tiene hijo derecho.
            </li>
            <li>
              Finalmente, se conecta <b>R</b> como hijo derecho de esa nueva
              raíz, uniendo de nuevo ambos subárboles.
            </li>
          </ol>
        </div>

        {/* Ejemplo eliminar existente */}
        <div className="mb-3 font-semibold text-white">
          Ejemplo: <span className="text-red-300">eliminar 6</span>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo de eliminación de 6 en un árbol splay"
          />
        </div>
      </section>

      {/* Eliminación de elemento no existente */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-red-400 mb-3">
          Eliminación cuando la clave no existe
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="font-semibold text-white mb-1">
            Ejemplo: <span className="text-red-300">eliminar 4</span>
          </p>
          <p className="text-gray-100">
            Como la clave <b>4</b> no se encuentra en el árbol, la búsqueda
            fracasa en el nodo <b>3</b>. Se aplica <b>splay(3)</b> para que 3
            pase a ser la raíz, pero no se elimina ningún nodo, ya que 4 no
            existe en la estructura.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Ejemplo de intento de eliminación de clave no existente en un árbol splay"
          />
        </div>
      </section>
    </div>
  );
}
