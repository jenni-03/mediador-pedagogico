import img1 from "../../../../../assets/images/definicion_rojinegro_1.jpg";
import img2 from "../../../../../assets/images/definicion_rojinegro_2.jpg";
import img3 from "../../../../../assets/images/definicion_rojinegro_3.jpg";

export function DefinitionArbolRojiNegro() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol RojiNegro
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol binario de búsqueda balanceado
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Definición</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-200 mb-2">
            Un <b>árbol rojo-negro</b> es un árbol binario de búsqueda en el que
            cada nodo almacena un bit adicional de información llamado{" "}
            <b>color</b>, que puede ser rojo o negro. Las reglas sobre ese color
            restringen la forma del árbol y garantizan que ningún camino desde
            la raíz hasta una hoja sea más de un factor constante más largo que
            otro. Por esto se considera un árbol binario de búsqueda{" "}
            <b>balanceado</b>.
          </p>

          <p className="text-gray-200 mb-2">
            Cada nodo interno del árbol almacena la siguiente información:
            <b> clave</b>, <b>color</b>, <b>hijo izquierdo</b>,{" "}
            <b>hijo derecho</b> y <b>padre</b>. Cuando un hijo no existe, usamos
            un puntero a un nodo especial <b>NIL</b> (hoja nula), que se
            considera siempre de color negro. Los nodos que no son NIL se llaman{" "}
            <b>nodos internos</b>.
          </p>

          <p className="text-gray-200">
            Gracias a estas restricciones, la altura del árbol se mantiene
            proporcional a <b>log n</b>. Por tanto, las operaciones de búsqueda,
            inserción y eliminación tienen costo <b>O(log n)</b> en el peor
            caso. Por esta razón, los árboles rojo-negro son una estructura
            clásica para implementar diccionarios y conjuntos en bibliotecas de
            programación.
          </p>
        </div>

        {/* Estructura de nodo */}
        <div className="flex justify-center my-6">
          <img
            src={img1}
            alt="Estructura de un nodo en un árbol rojo-negro"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-xl w-full p-4"
          />
        </div>

        {/* Ejemplo de árbol */}
        <div className="flex justify-center my-6">
          <img
            src={img2}
            alt="Ejemplo de árbol rojo-negro balanceado"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
          />
        </div>
      </section>
{/* Resumen visual */}
<section className="mb-10">
  <h2 className="text-xl font-bold text-cyan-400 mb-2">
    Resumen visual (idea rápida)
  </h2>
  <div className="bg-[#111217] border border-cyan-500/60 rounded-lg p-4 shadow flex flex-col md:flex-row gap-4 text-[15.5px]">
    {/* Leyenda de colores */}
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-black border border-gray-400" />
        <span className="text-gray-100">
          <b>Nodo negro:</b> forma el “esqueleto” del árbol. Cuenta para la{" "}
          <b>altura negra</b>.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
        <span className="text-gray-100">
          <b>Nodo rojo:</b> nodo “extra” entre nodos negros.{" "}
          <b>No pueden aparecer dos rojos seguidos</b>.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 bg-black border border-gray-400" />
        <span className="text-gray-100">
          <b>Hoja NIL:</b> nodo centinela sin clave. Siempre negro. Marca el
          final de cada rama.
        </span>
      </div>
    </div>

    {/* Idea de altura negra */}
    <div className="flex-1 bg-[#181924] rounded-md p-3 border border-cyan-500/40">
      <p className="text-gray-100 mb-2">
        <b>Regla visual:</b> desde cualquier nodo hasta sus hojas NIL:
      </p>
      <ul className="list-disc list-inside text-gray-100 space-y-1">
        <li>
          Todos los caminos tienen el <b>mismo número de nodos negros</b>.
        </li>
        <li>
          El camino más corto tiene solo nodos negros.
        </li>
        <li>
          El camino más largo alterna rojo/negro, pero nunca tiene{" "}
          <b>dos rojos seguidos</b>.
        </li>
      </ul>
      <p className="text-gray-300 mt-2 text-sm">
        Por esto la altura del árbol se mantiene del orden de <b>log n</b> y
        las operaciones son eficientes.
      </p>
    </div>
  </div>
</section>

      {/* Propiedades */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Propiedades del Árbol RojiNegro
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-6 text-[15.5px]">
          <p className="mb-3 text-gray-100">
            Un árbol rojo-negro es un árbol binario de búsqueda que cumple las
            siguientes propiedades de color:
          </p>
          <ul className="space-y-2">
            <li>
              <span className="text-cyan-400 font-bold mr-2">1</span>
              Todo nodo es <b>rojo</b> o <b>negro</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold mr-2">2</span>
              La <b>raíz</b> del árbol siempre es <b>negra</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold mr-2">3</span>
              Todas las <b>hojas NIL</b> (nodos nulos) son <b>negras</b>.
            </li>
            <li>
              <span className="text-cyan-400 font-bold mr-2">4</span>
              Si un nodo es <b>rojo</b>, entonces sus dos hijos son{" "}
              <b>negros</b>. Es decir, no pueden aparecer dos nodos rojos
              consecutivos en un camino.
            </li>
            <li>
              <span className="text-cyan-400 font-bold mr-2">5</span>
              Para cada nodo <b>x</b>, todos los caminos simples desde <b>x</b>{" "}
              hasta una hoja <b>NIL</b> contienen el mismo número de nodos
              negros.
            </li>
          </ul>
        </div>
      </section>

      {/* Terminología */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Terminología</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px]">
          <p className="mb-2 text-gray-100">
            A partir de la propiedad 5, definimos el concepto de{" "}
            <b>altura negra</b>:
          </p>
          <p className="mb-2 text-gray-100">
            <b>Altura negra</b> de un nodo <b>x</b>, an(x): número de nodos
            negros en cualquier camino simple desde <b>x</b> (sin incluir{" "}
            <b>x</b>) hasta una hoja <b>NIL</b>.
            <br />
            <b>Altura negra</b> de un árbol: la altura negra de su raíz.
          </p>
        </div>

        <div className="flex justify-center my-6">
          <img
            src={img3}
            alt="Ejemplo de altura negra en un árbol rojo-negro"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-5xl w-full p-4"
          />
        </div>
      </section>

      {/* Explicación y ventajas */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-3">
            La altura de un árbol binario de búsqueda determina el costo de
            buscar, insertar o eliminar: mientras más alto, peor rendimiento.
            Las propiedades de los árboles rojo-negro obligan a que todos los
            caminos tengan una cantidad similar de nodos negros, de modo que
            ningún camino puede ser mucho más largo que otro.
          </p>

          <p className="text-gray-100 mb-3">
            El camino más corto desde la raíz hasta una hoja contiene solo nodos
            negros. El camino más largo alterna nodos rojos y negros, pero nunca
            tiene dos rojos seguidos. Como además todos los caminos comparten el
            mismo número de nodos negros, se puede demostrar que la altura del
            árbol es <b>O(log n)</b>.
          </p>

          <p className="text-gray-100 mb-3">
            En este material usaremos la convención de <b>hojas nulas</b>: cada
            puntero vacío se modela como un nodo NIL negro. En los dibujos
            reales a menudo estos NIL se omiten; el árbol parece violar las
            propiedades, pero si se agregaran los NIL, volvería a cumplirlas.
            Bajo esta convención, todos los nodos internos tienen exactamente
            dos hijos (aunque puedan ser hojas nulas).
          </p>

          <p className="text-gray-100">
            Otra forma equivalente de ver un árbol rojo-negro es como un árbol
            binario de búsqueda donde el color se aplica a las <b>aristas</b> en
            lugar de a los nodos. En ese modelo, el color del nodo en este
            artículo coincide con el color de la arista que lo une con su padre,
            salvo la raíz, que es negra y no tiene arista de entrada.
          </p>
        </div>
      </section>

      {/* Ventajas y desventajas */}
      <section className="mb-10 text-[15.5px]">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Ventajas</h2>
        <ul className="list-none mt-2 space-y-3">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Todas las operaciones básicas (búsqueda, inserción, eliminación)
              tienen costo <b>O(log n)</b> en el peor caso.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Se mantienen razonablemente balanceados con reglas simples de
              color y rotación.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Son una estructura estándar en implementaciones de diccionarios,
              conjuntos y mapas ordenados.
            </span>
          </li>
        </ul>

        <h2 className="text-xl font-bold text-red-500 mt-10 mb-2">
          Desventajas
        </h2>
        <ul className="list-none mt-2 space-y-3">
          <li className="flex items-center gap-2">
            <span className="text-yellow-300 text-lg">✱</span>
            <span className="text-gray-100">
              El costo espacial es algo mayor que en otros árboles binarios
              porque se usan <b>nodos centinela</b> (hojas nulas) y un bit
              adicional de color por nodo.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
