import img1 from "../../../../../assets/images/definicion_eneario_1.jpg";
import img2 from "../../../../../assets/images/definicion_eneario_2.jpg";
import img4 from "../../../../../assets/images/definicion_eneario_4.jpg";
import img5 from "../../../../../assets/images/definicion_eneario_5.jpg";
import img6 from "../../../../../assets/images/definicion_eneario_6.jpg";

export function DefinitionArbolEneario() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Eneario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles con número indeterminado de hijos
      </span>
      <hr className="border-t-2 border-red-500 mb-10 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-2">
          Definición de Árbol Eneario
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 text-[15.5px]">
            Un <span className="font-bold text-red-400">Árbol Eneario</span> es
            una estructura de datos que se caracteriza porque cada nodo puede
            tener un número indeterminado de hijos.
          </p>
        </div>
        <span className="text-gray-300 text-sm mb-3 block">Por ejemplo:</span>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Ejemplo Árbol Eneario"
          />
        </div>
        <p className="text-gray-200 text-sm mb-2">
          El Nodo <b>A</b> tiene 4 hijos, los Nodos <b>B, C</b> y <b>E</b> no
          tienen hijos, y el Nodo <b>D</b> tiene 3 hijos.
        </p>
      </section>

      {/* Memoria dinámica */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 text-[15.5px] mb-2">
            Esta circunstancia exige que cada Nodo guarde una{" "}
            <b>Lista de apuntadores</b> para almacenar el número de hijos. El
            árbol anterior en la memoria dinámica se puede ver así:
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            alt="Memoria dinámica árbol eneario"
          />
        </div>
      </section>

      {/* Implementaciones */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Implementaciones básicas
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="space-y-2 text-[15.5px] text-gray-100">
            <li>
              <span className="font-bold text-red-400">
                Implementación matricial:
              </span>{" "}
              El árbol se representa en un vector de enteros, donde cada
              componente contiene el índice de su nodo padre.
            </li>
            <li>
              <span className="font-bold text-red-400">
                Implementación con listas:
              </span>{" "}
              Se representa mediante un vector de listas. Cada índice del vector
              se asocia con un nodo y almacena la lista de sus hijos.
            </li>
            <li>
              <span className="font-bold text-red-400">
                Implementación con celdas enlazadas:
              </span>{" "}
              Cada nodo es una celda enlazada con punteros a padre, hijo
              izquierdo y hermano derecho.
            </li>
            <li>
              El tipo <b>Nodo</b> del árbol es entero.
            </li>
            <li>
              La <b>relación padre-hijo</b> se representa en un vector P, donde
              P[i] indica el nodo padre de i. Si el nodo no tiene padre (raíz),
              P[i] = -1.
            </li>
            <li>
              Las <b>etiquetas</b> de los nodos se representan en otro vector.
            </li>
          </ul>
        </div>
        <div className="text-gray-200 text-sm mb-4">
          Esta implementación es sencilla y con bajo coste de memoria. Facilita
          el acceso a ancestros (eficiencia <b>O(log n)</b>), pero puede
          complicar operaciones con los hijos.
        </div>
      </section>

      {/* Clase Nodo */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-3">
          Estructura de cada Nodo
        </h2>
        <div className="text-gray-200 text-sm mb-6">
          El apuntador <b>hijo</b> direcciona al primer hijo (más a la
          izquierda) y el <b>hermano</b> se usa para formar la lista de
          hermanos. Por ejemplo, los hijos de <b>A</b> están en la lista:
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Clase NodoEneario"
          />
        </div>
        <div className="text-gray-200 text-sm mb-2">
          Los hijos de <b>D</b> se encuentran en la lista:
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Hijos de A"
          />
        </div>
      </section>

      {/* Ejemplo adicional */}
      <section className="mb-10">
        <div className="text-gray-200 text-sm mb-4">Veamos otro ejemplo:</div>
        <div className="flex justify-center my-5">
          <img
            src={img6}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Hijos de D"
          />
        </div>
      </section>
    </div>
  );
}
