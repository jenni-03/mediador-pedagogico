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
        <div className="h-7 w-2 rounded bg-red-500" />
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
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Un{" "}
            <span className="font-bold text-red-400">
              árbol eneario (o n-ario)
            </span>{" "}
            es una estructura de datos en la que <b>cada nodo</b> puede tener
            desde <b>0</b> hasta un <b>número indeterminado de hijos</b>. No hay
            un límite fijo como en los árboles binarios (2 hijos) o ternarios
            (3 hijos).
          </p>
          <p className="text-gray-100">
            Este modelo se utiliza para representar <b>jerarquías generales</b>:
            sistemas de archivos, menús, expresiones con muchos operandos, etc.
          </p>
        </div>

        <span className="text-gray-300 text-sm mb-3 block">Por ejemplo:</span>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Ejemplo de árbol eneario"
          />
        </div>
        <p className="text-gray-200 text-sm mb-2">
          En el árbol del ejemplo, el nodo <b>A</b> tiene 4 hijos. Los nodos{" "}
          <b>B, C</b> y <b>E</b> no tienen hijos (son hojas), y el nodo <b>D</b>{" "}
          tiene 3 hijos.
        </p>

        {/* Resumen visual */}
        <div className="mt-4 bg-[#111217] border border-cyan-500/70 rounded-lg p-4 text-[14.5px] leading-relaxed">
          <h3 className="text-cyan-300 font-semibold mb-1">
            Resumen para recordar
          </h3>
          <ul className="list-disc list-inside text-gray-100 space-y-1">
            <li>Cada nodo puede tener 0, 1, 2, 3, … hijos.</li>
            <li>
              No hay límite superior fijo: el “grado” del nodo depende del
              problema.
            </li>
            <li>
              Lo más natural es pensar en cada nodo con una{" "}
              <b>lista de hijos</b>.
            </li>
          </ul>
        </div>
      </section>

      {/* Representación en memoria dinámica */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Árbol Eneario en memoria dinámica
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Como cada nodo puede tener muchos hijos, lo habitual es que cada
            nodo guarde una <b>lista de apuntadores</b> a sus hijos. De esta
            forma podemos crecer o reducir el número de hijos dinámicamente.
          </p>
          <p className="text-gray-100">
            El árbol anterior, visto en memoria dinámica, podría representarse
            así:
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            alt="Árbol eneario con listas de hijos"
          />
        </div>
      </section>

      {/* Implementaciones */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Implementaciones básicas
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <ul className="space-y-2 text-gray-100">
            <li>
              <span className="font-bold text-red-400">
                Implementación matricial:
              </span>{" "}
              el árbol se representa en un <b>vector de enteros</b>, donde cada
              posición guarda el índice de su nodo padre. La raíz tiene padre{" "}
              <b>-1</b>.
            </li>
            <li>
              <span className="font-bold text-red-400">
                Implementación con listas:
              </span>{" "}
              se usa un <b>vector de listas</b>; cada índice representa un nodo
              y almacena la lista de índices de sus hijos.
            </li>
            <li>
              <span className="font-bold text-red-400">
                Implementación con celdas enlazadas:
              </span>{" "}
              cada nodo es una celda con punteros a <b>padre</b>,{" "}
              <b>primer hijo</b> y <b>hermano derecho</b> (técnica{" "}
              <i>first-child / next-sibling</i>).
            </li>
            <li>
              El tipo <b>Nodo</b> suele ser un entero que actúa como índice.
            </li>
            <li>
              Las <b>etiquetas</b> o valores de cada nodo se guardan en otro
              vector paralelo.
            </li>
          </ul>
        </div>
        <div className="text-gray-200 text-sm mb-4">
          La implementación matricial es sencilla y tiene bajo coste de
          memoria. Facilita el acceso a ancestros (eficiencia aproximada{" "}
          <b>O(log n)</b>), pero puede complicar algunas operaciones sobre los
          hijos cuando el grado de los nodos es muy grande.
        </div>
      </section>

      {/* Estructura de cada Nodo (first-child / next-sibling) */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-3">
          Estructura de cada Nodo
        </h2>
        <div className="text-gray-200 text-sm mb-6 leading-relaxed">
          En la representación con celdas enlazadas, cada nodo mantiene:
          <br />• Un puntero <b>hijo</b> al primer hijo (el más a la izquierda).
          <br />• Un puntero <b>hermano</b> al siguiente hermano en la lista.
          <br />
          Así, todos los hijos de un nodo se recorren avanzando por la lista de
          hermanos.
          <br />
          <br />
          Por ejemplo, los hijos de <b>A</b> están en la siguiente lista:
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Lista de hijos de A"
          />
        </div>
        <div className="text-gray-200 text-sm mb-2">
          Los hijos de <b>D</b> se encuentran en la lista:
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img5}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Lista de hijos de D"
          />
        </div>
      </section>

      {/* Ejemplo adicional */}
      <section className="mb-10">
        <div className="text-gray-200 text-sm mb-4">
          Veamos otro ejemplo de árbol eneario con distintos grados:
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img6}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Ejemplo adicional de árbol eneario"
          />
        </div>
      </section>
    </div>
  );
}
