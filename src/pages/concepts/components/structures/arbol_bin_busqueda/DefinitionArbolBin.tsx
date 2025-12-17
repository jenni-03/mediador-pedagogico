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
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Binario de Búsqueda
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles Binarios
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-44 rounded" />

      {/* ¿Qué es un ABB? */}
      <section className="mb-10 space-y-4 text-[15.5px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold text-red-500">Descripción general</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Un <b className="text-red-400">árbol binario de búsqueda (ABB)</b>{" "}
            es un árbol binario especial en el que cada nodo organiza sus
            valores siguiendo una regla muy clara:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Todos los valores del{" "}
              <span className="text-cyan-300 font-semibold">
                subárbol izquierdo
              </span>{" "}
              de un nodo <b>x</b> son <b>menores</b> que el valor almacenado en{" "}
              <b>x</b>.
            </li>
            <li>
              Todos los valores del{" "}
              <span className="text-cyan-300 font-semibold">
                subárbol derecho
              </span>{" "}
              de un nodo <b>x</b> son <b>mayores</b> que el valor de <b>x</b>.
            </li>
          </ul>

          <div className="mt-2 bg-black/40 border border-red-500/60 rounded-md px-3 py-2 text-sm">
            <span className="text-red-300 font-semibold">Regla de oro:</span>{" "}
            para cada nodo <b>x</b>,
            <span className="ml-1 text-cyan-300 font-mono">
              valores(izq) &lt; x &lt; valores(der)
            </span>
          </div>

          <p>
            Gracias a esta propiedad, recorrer el árbol en{" "}
            <b className="text-cyan-300">orden inorden</b> (izquierda → nodo →
            derecha) produce automáticamente los elementos en orden ascendente,
            como si se tratara de una lista ordenada.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center">
            <img
              src={img1}
              alt="Estructura general del árbol"
              className="w-full max-w-md rounded-xl border-2 border-red-500 shadow bg-white p-3 object-contain"
            />
            <span className="text-xs text-gray-400 mt-1 text-center">
              Vista general de las partes de un árbol (raíz, ramas y hojas).
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={img2}
              alt="Ejemplo de ABB con valores numéricos"
              className="w-full max-w-md rounded-xl border-2 border-cyan-400 shadow bg-white p-3 object-contain"
            />
            <span className="text-xs text-gray-400 mt-1 text-center">
              Ejemplo de ABB: los valores se organizan respetando la regla
              izquierda &lt; raíz &lt; derecha.
            </span>
          </div>
        </div>
      </section>

      {/* Propiedad de orden */}
      <section className="mb-10 space-y-4 text-[15.5px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold text-red-500">
          Propiedad de orden del ABB
        </h2>

        <div className="bg-[#18191a] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-2">
          <p>Para cada nodo de un árbol binario de búsqueda debe cumplirse:</p>
          <ul className="space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span>
                Las claves de los nodos del{" "}
                <b className="text-cyan-300">subárbol izquierdo</b> son menores
                que la clave del nodo.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span>
                Las claves de los nodos del{" "}
                <b className="text-cyan-300">subárbol derecho</b> son mayores
                que la clave del nodo.
              </span>
            </li>
          </ul>
          <p className="mt-2 text-sm text-gray-300">
            Esta definición no permite claves duplicadas: cada valor aparece a
            lo sumo una vez en el árbol.
          </p>
        </div>

        <div className="flex flex-col items-center mt-4">
          <img
            src={img3}
            alt="Regla izquierda-derecha en ABB"
            className="w-full max-w-3xl rounded-xl border-2 border-yellow-400 shadow bg-white p-3 object-contain"
          />
          <span className="text-xs text-gray-400 mt-1 text-center max-w-lg">
            La clave <b>a</b> divide el conjunto en dos zonas: valores a la
            izquierda menores que <b>a</b> y valores a la derecha mayores que{" "}
            <b>a</b>.
          </span>
        </div>
      </section>

      {/* Árbol válido vs inválido */}
      <section className="mb-10 space-y-4 text-[15.5px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold text-red-500">
          ¿Cuándo NO es un ABB?
        </h2>

        <p>
          Si algún nodo viola la regla de orden (un valor menor aparece en el
          subárbol derecho, o uno mayor en el izquierdo), el árbol deja de ser
          un árbol binario de búsqueda.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mt-2">
          <div className="bg-[#1a1719] border-l-4 border-red-500 rounded-md p-3 shadow">
            <p className="text-sm text-red-200 font-semibold mb-2">
              Árbol que no cumple la propiedad
            </p>
            <img
              src={img4}
              alt="Ejemplo de árbol que no es ABB"
              className="w-full rounded-xl border-2 border-red-500 shadow bg-white p-3 object-contain"
            />
            <p className="mt-2 text-xs text-gray-400">
              El nodo con clave <b>2</b> está en el subárbol derecho de la raíz,
              pero su valor es menor que la raíz: rompe la propiedad del ABB.
            </p>
          </div>

          <div className="bg-[#16191c] border-l-4 border-green-500 rounded-md p-3 shadow">
            <p className="text-sm text-green-200 font-semibold mb-2">
              Árboles que sí son de búsqueda
            </p>
            <img
              src={img5}
              alt="Ejemplos de ABB válidos"
              className="w-full rounded-xl border-2 border-green-500 shadow bg-white p-3 object-contain"
            />
            <p className="mt-2 text-xs text-gray-400">
              En todos estos ejemplos, cada nodo respeta la regla izquierda
              menor / derecha mayor, por lo que son ABB válidos.
            </p>
          </div>
        </div>

        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow mt-4">
          <p>
            La forma final del árbol depende del{" "}
            <b className="text-yellow-300">orden de inserción</b> de las claves.
            Insertar en orden ascendente o descendente genera árboles muy
            desbalanceados (parecidos a una lista), mientras que un orden
            “mezclado” tiende a producir árboles más balanceados y eficientes.
          </p>
        </div>
      </section>

      {/* Visión formal y ejemplo final */}
      <section className="mb-6 space-y-4 text-[15.5px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold text-red-500">Definición formal</h2>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-2">
          <p>
            Un <b>árbol binario de búsqueda</b> es un árbol binario en el que
            para cada nodo:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              El hijo izquierdo (si existe) contiene una clave{" "}
              <b>estrictamente menor</b> que la clave del nodo padre.
            </li>
            <li>
              El hijo derecho (si existe) contiene una clave{" "}
              <b>estrictamente mayor</b> que la clave del nodo padre.
            </li>
            <li>
              Esta misma regla se cumple recursivamente en todos los subárboles.
            </li>
          </ul>
          <p>
            Para poder ordenar los elementos, el tipo de dato de las claves debe
            poder compararse (por ejemplo, números, cadenas, o tipos compuestos
            con un campo clave).
          </p>
          <p className="text-sm text-cyan-200 mt-1">
            Búsqueda, inserción y eliminación se realizan en{" "}
            <b>O(h)</b>, donde <b>h</b> es la altura del árbol; en un ABB
            balanceado, <b>h ≈ log₂(n)</b>.
          </p>
        </div>

        <div className="flex flex-col items-center mt-4">
          <img
            src={img6}
            alt="Ejemplo de árbol binario de búsqueda con enteros"
            className="w-full h-auto max-w-3xl rounded-xl border-2 border-yellow-400 shadow bg-white p-3 object-contain"
          />
          <span className="text-xs text-gray-400 mt-1 text-center max-w-lg">
            Ejemplo de ABB con enteros: todas las claves a la izquierda de cada
            nodo son menores y todas las de la derecha son mayores.
          </span>
        </div>
      </section>
    </div>
  );
}
