import img1 from "../../../../../assets/images/definicion_bin_1.jpg";
import img2 from "../../../../../assets/images/definicion_bin_2.jpg";
import img3 from "../../../../../assets/images/definicion_bin_3.jpg";
import img4 from "../../../../../assets/images/definicion_bin_4.jpg";
import img5 from "../../../../../assets/images/definicion_bin_5.jpg";
import img6 from "../../../../../assets/images/definicion_bin_6.jpg";

export function DefinitionArbolBinarioBusqueda() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Binario de Búsqueda
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles Binarios
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Descripción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Descripción
        </h2>
        <p className="mb-5 text-gray-200 text-[15.5px]">
          Un árbol binario de búsqueda (ABB) es un árbol binario con la
          propiedad de que todos los elementos almacenados en el subárbol
          izquierdo de cualquier nodo <b>x</b> son menores que el elemento
          almacenado en <b>x</b>, y todos los elementos almacenados en el
          subárbol derecho de <b>x</b> son mayores que el elemento almacenado en{" "}
          <b>x</b>.<br />- Una interesante propiedad es que si se listan los
          nodos del ABB en inorden nos da la lista de nodos ordenada. Esta
          propiedad define un método de ordenación similar al Quicksort, con el
          nodo raíz jugando un papel similar al del elemento de partición del
          Quicksort aunque con los ABB hay un gasto extra de memoria mayor
          debido a los punteros. La propiedad de ABB hace que sea muy simple
          diseñar un procedimiento para realizar la búsqueda.
        </p>
        <div className="flex justify-center my-4">
          <img
            src={img1}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-red-500 shadow object-contain bg-white p-3"
          />
        </div>
        <div className="flex justify-center my-4">
          <img
            src={img2}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-red-500 shadow object-contain bg-white p-3"
          />
        </div>
      </section>

      {/* Propiedad de ABB */}
      <section className="mb-10">
        <p className="mb-5 text-gray-200 text-[15.5px]">
          Para cada nodo de un árbol binario de búsqueda debe cumplirse la
          propiedad:
        </p>
        <li className="flex items-center gap-2">
          <span className="text-red-400 text-lg">✱</span>
          <span className="text-gray-100">
            Las claves de los nodos del subárbol izquierdo deben ser menores que
            la clave de la raíz.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="text-red-400 text-lg">✱</span>
          <span className="text-gray-100">
            Las claves de los nodos del subárbol derecho deben ser mayores que
            la clave de la raíz
          </span>
        </li>
        <div className="flex justify-center my-4">
          <img
            src={img3}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-yellow-400 shadow object-contain bg-white p-3"
          />
        </div>
      </section>

      {/* Propiedad extra y ejemplo visual */}
      <section className="mb-10">
        <p className="mb-3 text-gray-200 text-[15.5px]">
          Esta definición no acepta elementos con claves duplicadas.
        </p>
        <p className="mb-3 text-gray-200 text-[15.5px]">
          Se indican en el diagrama de la figura anterior, el descendiente del
          subárbol izquierdo con mayor clave y el descendiente del subárbol
          derecho con menor valor de clave; los cuales son el antecesor y
          sucesor de la raíz.
        </p>
        <p className="mb-5 text-gray-200 text-[15.5px]">
          El siguiente árbol no es binario de búsqueda, ya que el nodo con clave
          2, ubicado en el subárbol derecho de la raíz, tiene clave menor que
          ésta.
        </p>
        <div className="flex justify-center my-4">
          <img
            src={img4}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-yellow-400 shadow object-contain bg-white p-3"
          />
        </div>
        <p className="mb-3 text-gray-200 text-[15.5px]">
          Los siguientes son árboles de búsqueda ya que cumplen la propiedad
          anterior.
        </p>
        <div className="flex justify-center my-4">
          <img
            src={img5}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-yellow-400 shadow object-contain bg-white p-3"
          />
        </div>
        <p className="mb-5 text-gray-200 text-[15.5px]">
          La generación de estos árboles depende del orden en que se ingresen
          las claves en los nodos, a partir de un árbol vacío. El de la
          izquierda se generó insertando las claves en orden de llegada: 2, 1,
          4, 3, 5 (o bien: 2, 4, 1, 5, 3). El de más a la derecha, se generó con
          la llegada en el orden: 5, 4, 3, 2, 1.
        </p>
        <p className="mb-5 text-gray-200 text-[15.5px]">
          Los dos árboles de más a la izquierda, en la Figura 6.5, se denominan
          balanceados, ya que las diferencias en altura de los subárboles
          izquierdo y derecho, para todos los nodos, difieren a lo más en uno.
          Los tres a la derecha están desbalanceados. El último tiene la
          estructura de una lista, y es un árbol degenerado.
        </p>
      </section>

      {/* Otras definiciones*/}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Otras definiciones
        </h2>
        <p className="mb-3 text-gray-200 text-[15.5px]">
          Un árbol binario de búsqueda es una estructura de datos de tipo árbol
          binario en el que para todos sus nodos, el hijo izquierdo, si existe,
          contiene un valor menor que el nodo padre y el hijo derecho, si
          existe, contiene un valor mayor que el del nodo padre.
        </p>
        <p className="mb-3 text-gray-200 text-[15.5px]">
          Obviamente, para establecer un orden entre los elementos del árbol, el
          tipo base debe ser escalar o debe tratarse de un tipo compuesto con
          una componente que actúe como clave de ordenación.
        </p>
        <p className="mb-4 text-gray-200 text-[15.5px]">
          La siguiente figura es un ejemplo de árbol binario de búsqueda
          conteniendo enteros:
        </p>
        <div className="flex justify-center my-4">
          <img
            src={img6}
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-yellow-400 shadow object-contain bg-white p-3"
          />
        </div>
      </section>
    </div>
  );
}
