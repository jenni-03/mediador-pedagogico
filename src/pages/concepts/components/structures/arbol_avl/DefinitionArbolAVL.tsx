import img1 from "../../../../../assets/images/definicion_avl_1.jpg";
import img2 from "../../../../../assets/images/definicion_avl_2.jpg";
import img3 from "../../../../../assets/images/definicion_avl_3.jpg";
import img4 from "../../../../../assets/images/definicion_avl_4.jpg";
import img5 from "../../../../../assets/images/definicion_avl_5.jpg";
import img6 from "../../../../../assets/images/definicion_avl_6.jpg";
import img7 from "../../../../../assets/images/definicion_avl_7.jpg";
import img8 from "../../../../../assets/images/definicion_avl_8.jpg";

export function DefinitionArbolAVL() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol AVL
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol binario balanceado
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición de Árbol AVL */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Definición de Árbol AVL
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15px]">
            <li>
              El nombre AVL son las iniciales de los hombres que idearon este
              tipo de árbol: <b>Adelson-Velskii y Landis</b> en 1962.
            </li>
            <li>
              Básicamente un árbol AVL es un{" "}
              <b className="text-red-400">Árbol binario de búsqueda</b> al que
              se le añade una condición de equilibrio. Esta condición es que
              para todo nodo la altura de sus subárboles izquierdo y derecho
              pueden diferir a lo sumo en 1.
            </li>
          </ul>
        </div>
      </section>

      {/* Características */}
      <section>
        <h2 className="text-xl font-bold text-red-500 mb-2">Características</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15px]">
            <li>Un AVL es un ABB.</li>
            <li>
              La diferencia entre las alturas de los subárboles derecho e
              izquierdo no debe excederse en más de 1.
            </li>
            <li>
              Cada nodo tiene asignado un peso de acuerdo a las alturas de sus
              subárboles.
            </li>
            <li>
              Un nodo tiene un peso de 1 si su subárbol derecho es más alto, -1
              si su subárbol izquierdo es más alto y 0 si las alturas son las
              mismas.
            </li>
            <li>
              La inserción y eliminación en AVLs es la misma que en los ABBs.
            </li>
          </ul>
        </div>
      </section>
      {/* Equilibrio */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Equilibrio
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="mb-2 text-gray-100">
            <b>Equilibrio (n) = altura-der (n) – altura-izq (n)</b> describe
            relatividad entre subárbol derecho y subárbol izquierdo.
          </p>
          <ul className="list-disc list-inside text-gray-200 mb-2 text-[15px] ml-2">
            <li>
              <span className="text-red-400 font-semibold">+ (positivo)</span>{" "}
              &rarr; der más alto (profundo)
            </li>
            <li>
              <span className="text-red-400 font-semibold">– (negativo)</span>{" "}
              &rarr; izq más alto (profundo)
            </li>
          </ul>
          <p className="mb-2 text-gray-100">
            Un árbol binario es un AVL{" "}
            <b className="text-red-400">si y sólo si</b> cada uno de sus nodos
            tiene un equilibrio de <b>–1, 0, +1</b>.
          </p>
          <p className="text-gray-100">
            Si alguno de los pesos de los nodos se modifica en un valor no
            válido (<b>2</b> o <b>–2</b>) debe seguirse un esquema de rotación.
          </p>
        </div>
      </section>
      {/* Operaciones sobre un AVL */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Operaciones sobre un AVL
        </h2>
        <ul className="list-none mt-2 space-y-3 text-[15.5px]">
          <li className="flex items-center gap-2">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">Insertar</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">Balancear</span>
          </li>
          <li className="flex items-center gap-2 ml-4">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">
              <b>Caso 1</b> Rotación simple izquierda RSI
            </span>
          </li>
          <li className="flex items-center gap-2 ml-4">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">
              <b>Caso 2</b> Rotación simple derecha RSD
            </span>
          </li>
          <li className="flex items-center gap-2 ml-4">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">
              <b>Caso 3</b> Rotación doble izquierda RDI
            </span>
          </li>
          <li className="flex items-center gap-2 ml-4">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">
              <b>Caso 4</b> Rotación doble derecha RDD
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">Eliminar</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400 text-lg">✱</span>
            <span className="text-gray-100">Calcular Altura</span>
          </li>
        </ul>
      </section>
      {/* Insertar un Dato */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Insertar un Dato
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-3">
            Usamos la misma técnica para insertar un nodo en un ABB ordenado.
          </p>
          <p className="text-gray-100 mb-3">
            Trazamos una ruta desde el nodo raíz hasta un nodo hoja (donde
            hacemos la inserción).
          </p>
          <p className="text-gray-100 mb-3">Insertamos el nodo nuevo.</p>
          <p className="text-gray-100 mb-3">
            Volvemos a trazar la ruta de regreso al nodo raíz, ajustando el
            equilibrio a lo largo de ella.
          </p>
          <p className="text-gray-100">
            Si el equilibrio de un nodo llega a ser +2 o -2, volvemos a ajustar
            los subárboles de los nodos para que su equilibrio se mantenga
            acorde con los lineamientos AVL (que son +- 1).
          </p>
        </div>
      </section>

      {/* Separador */}
      <div className="my-12 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Header de la sección "Balancear el Árbol" */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Balancear el Árbol
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Rotaciones y casos de balanceo AVL
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Balancear el Árbol */}
      <section className="mb-10">
        {/* Caso 1: Rotación simple izquierda RSI */}
        <div className="mb-7">
          <h3 className="font-bold mb-1">
            <span className="text-red-400">Caso 1:</span> Rotación simple
            izquierda <span className="font-mono">RSI</span>
          </h3>
          <p className="text-gray-200 mb-3">
            Si el nodo está desbalanceado hacia la izquierda y su hijo derecho
            tiene el mismo signo (<b>+</b>), realizamos una rotación simple
            izquierda.
          </p>
          <div className="flex justify-center my-5">
            <img
              src={img1}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            />
          </div>

          <p className="text-gray-200 mb-3">Luego de la rotación:</p>

          <div className="flex justify-center my-5">
            <img
              src={img2}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            />
          </div>
        </div>

        {/* Caso 2: Rotación simple derecha RSD */}
        <div className="mb-7">
          <h3 className="font-bold mb-1">
            <span className="text-red-400">Caso 2:</span> Rotación simple
            derecha <span className="font-mono">RSD</span>
          </h3>
          <div className="flex justify-center my-5">
            <img
              src={img3}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            />
          </div>
          <p className="text-gray-200 mb-3">Luego de la rotación:</p>
          <div className="flex justify-center my-5">
            <img
              src={img4}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            />
          </div>

          <p className="text-gray-200 mb-3">
            Hay varios puntos que cabe señalar aquí:
          </p>
          <ul className="list-none mt-2 space-y-3 text-[15.5px]">
            <li className="flex items-center gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Se conserva el orden apropiado del árbol.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Restablece todos los nodo a equilibrios apropiados AVL
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Conserva el recorrido en orden que el árbol anterior.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Sólo necesitamos modificar 3 apuntadores para lograr el nuevo
                equilibrio (con la de la raíz).
              </span>
            </li>
          </ul>
        </div>

        {/* Caso 3: Rotación doble izquierda RDI */}
        <div className="mb-10">
          <h3 className="font-bold mb-1 text-[17px]">
            <span className="text-red-400">Caso 3:</span> Rotación doble
            izquierda <span className="font-mono">RDI</span>
          </h3>
          <p className="text-gray-200 mb-3">
            Si está desbalanceado a la izquierda (<b>FE &lt; –1</b>), y su hijo
            derecho tiene distinto signo (<b>+</b>) hacemos rotación doble
            izquierda-derecha.
          </p>

          <div className="flex justify-center my-5">
            <img
              src={img5}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>

          <p className="text-[15px] text-yellow-400 font-semibold mb-2 mt-6">
            Otro ejemplo de esta rotación:
          </p>
          <div className="flex justify-center my-5">
            <img
              src={img6}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>

        {/* Caso 4: Rotación doble derecha RDD */}
        <div className="mb-10">
          <h3 className="font-bold mb-1 text-[17px]">
            <span className="text-red-400">Caso 4:</span> Rotación doble derecha{" "}
            <span className="font-mono">RDD</span>
          </h3>
          <p className="text-gray-200 mb-3">
            Si está desbalanceado a la derecha y su hijo izquierdo tiene
            distinto signo (<b>–</b>) hacemos rotación doble derecha-izquierda.
          </p>

          <div className="flex justify-center my-5">
            <img
              src={img7}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>

          <p className="text-[15px] text-yellow-400 font-semibold mb-2 mt-6">
            Otro ejemplo:
          </p>
          <div className="flex justify-center my-5">
            <img
              src={img8}
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="my-12 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Header de la sección */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Eliminar un Dato
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Cómo afecta la eliminación al balanceo AVL
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Sección principal */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-8">
          <p className="text-gray-100 mb-2">
            Al eliminar un nodo en un árbol AVL puede afectar el equilibrio de
            sus nodos. Entonces hay que hacer rotaciones simples o dobles.
            <br />
            Eliminas un nodo como lo hacemos en un árbol binario ordenado. Al
            localizar el nodo que queremos eliminar seguimos este procedimiento:
          </p>
          <ul className="list-none mt-2 space-y-2 text-[15.5px]">
            {[
              "Si el nodo es un nodo hoja, simplemente lo eliminamos.",
              "Si el nodo solo tiene un hijo, lo sustituimos con su hijo.",
              "Si el nodo eliminado tiene dos hijos, lo sustituimos por el hijo derecho y colocamos el hijo izquierdo en el subárbol izquierdo del hijo derecho.",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-red-400 mt-1 text-lg">✱</span>
                <span className="text-gray-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-100 mb-4">
          Ahora que hemos eliminado el nodo, tenemos que volver a equilibrar el
          árbol:
        </p>
        <ul className="list-none mt-2 space-y-2 text-[15.5px] mb-10">
          {[
            "Si el equilibrio del padre del nodo eliminado cambia de 0 a +-1 el algoritmo concluye.",
            "Si el padre del nodo eliminado cambió de +-1 a 0, la altura del árbol ha cambiado y se afecta el equilibrio de su abuelo.",
            "Si el equilibrio del padre del nodo eliminado cambia de +-1 a +-2 hay que hacer una rotación.",
            "Después de concluirla, el equilibrio del padre podría cambiar, lo que, a su vez, podría forzarnos a hacer otros cambios (y probables rotaciones) en toda la ruta hacia arriba a medida que ascendemos hacia la raíz. Si encontramos en la ruta un nodo que cambie de 0 a +-1 entonces terminamos.",
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
