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
    <div className="text-white py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol AVL
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol binario de búsqueda balanceado
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-44 rounded" />

      {/* Definición de Árbol AVL */}
      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-red-500">Definición de Árbol AVL</h2>

        <div className="bg-[#19191d] border border-red-500/60 rounded-xl p-4 sm:p-5 shadow space-y-3">
          <p className="text-[15.5px] text-gray-100">
            Un <b className="text-red-400">árbol AVL</b> es un{" "}
            <b>árbol binario de búsqueda auto–balanceado</b>. Fue propuesto en
            1962 por <b>Adelson-Velskii y Landis</b>, de donde provienen sus
            siglas.
          </p>

          <div className="grid gap-4 md:grid-cols-[1.6fr,1.2fr]">
            <div className="space-y-2 text-[15px] text-gray-200">
              <p>
                Además de cumplir la propiedad de un ABB, cada nodo mantiene una
                condición de <span className="text-cyan-300 font-semibold">equilibrio</span>:
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  La diferencia entre la altura de su subárbol izquierdo y su
                  subárbol derecho es, como máximo, <b>1</b>.
                </li>
                <li>
                  Gracias a esto, la altura del árbol se mantiene cercana a{" "}
                  <b>O(log n)</b>, garantizando búsquedas, inserciones y
                  eliminaciones eficientes.
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#111827] via-[#111827] to-[#0f172a] border border-red-500/60 rounded-lg p-3 text-sm space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                Idea clave
              </p>
              <p className="text-gray-200">
                Cada vez que insertamos o eliminamos nodos, el AVL{" "}
                <span className="font-semibold text-cyan-300">
                  se reequilibra automáticamente
                </span>{" "}
                mediante rotaciones locales, evitando que el árbol se “deforme”
                en una lista.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-red-500">Características</h2>

        <div className="bg-[#19191d] border border-red-500/60 rounded-xl p-4 sm:p-5 shadow">
          <div className="grid md:grid-cols-2 gap-4 text-[15px] text-gray-200">
            <ul className="list-disc list-inside space-y-1">
              <li>Todo AVL es también un Árbol Binario de Búsqueda.</li>
              <li>
                Para cada nodo <b>n</b>, se cumple:
                <br />
                <span className="ml-1 text-cyan-300 font-mono">
                  |altura(izq) − altura(der)| ≤ 1
                </span>
              </li>
              <li>
                Mantiene tiempos de búsqueda, inserción y eliminación en promedio
                <b> O(log n)</b>.
              </li>
            </ul>

            <ul className="list-disc list-inside space-y-1">
              <li>
                Cada nodo almacena un <b>factor de equilibrio</b> (FE) calculado
                a partir de la altura de sus subárboles.
              </li>
              <li>
                Un FE permitido es <span className="font-semibold">−1, 0, +1</span>.
              </li>
              <li>
                Cuando un nodo llega a FE = −2 o +2, se ejecuta alguna{" "}
                <b className="text-cyan-300">rotación AVL</b> para restaurar el
                balance.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Equilibrio */}
      <section className="mb-12 space-y-4">
        <h2 className="text-xl font-bold text-red-500">Equilibrio</h2>

        <div className="bg-[#19191d] border border-red-500/60 rounded-xl p-4 sm:p-5 shadow space-y-4">
          <div className="bg-[#111827] border border-red-500/70 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-300 mb-1">
                Definición formal
              </p>
              <p className="text-[15px] text-gray-100">
                Para un nodo <b>n</b>, definimos su equilibrio como:
              </p>
              <p className="mt-1 font-mono text-sm bg-black/60 inline-block px-3 py-1 rounded border border-red-500/70 text-cyan-200">
                Equilibrio(n) = altura_der(n) − altura_izq(n)
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-[14.5px]">
            <div className="bg-[#101012] rounded-lg border border-red-500/40 p-3">
              <p className="text-red-300 font-semibold mb-1">Equilibrio &gt; 0</p>
              <p className="text-gray-200">
                El subárbol derecho es más alto que el izquierdo. (FE = +1)
              </p>
            </div>
            <div className="bg-[#101012] rounded-lg border border-red-500/40 p-3">
              <p className="text-red-300 font-semibold mb-1">Equilibrio = 0</p>
              <p className="text-gray-200">
                Ambos subárboles tienen la misma altura. El nodo está
                perfectamente balanceado.
              </p>
            </div>
            <div className="bg-[#101012] rounded-lg border border-red-500/40 p-3">
              <p className="text-red-300 font-semibold mb-1">Equilibrio &lt; 0</p>
              <p className="text-gray-200">
                El subárbol izquierdo es más alto que el derecho. (FE = −1)
              </p>
            </div>
          </div>

          <p className="text-[15px] text-gray-100">
            Un árbol binario es <b className="text-red-400">AVL</b> si y sólo si
            <span className="font-semibold"> todos</span> sus nodos tienen
            equilibrio dentro del conjunto <b>{`{−1, 0, +1}`}</b>. Cuando algún
            nodo alcanza <b>−2</b> o <b>+2</b>, el árbol entra en desequilibrio y
            es necesario aplicar una o más <span className="text-cyan-300">rotaciones</span>.
          </p>
        </div>
      </section>

      {/* Operaciones sobre un AVL (visión general) */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Operaciones sobre un AVL
        </h2>

        <div className="bg-[#19191d] border border-red-500/60 rounded-xl p-4 sm:p-5 shadow">
          <p className="text-[15px] text-gray-100 mb-3">
            Un AVL soporta las mismas operaciones que un Árbol Binario de
            Búsqueda, pero después de cada modificación se asegura de restaurar
            el equilibrio mediante rotaciones:
          </p>

          <div className="grid md:grid-cols-2 gap-4 text-[15px]">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">Insertar dato</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">Eliminar dato</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">Buscar elemento</span>
              </li>
            </ul>

            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">
                  Rotaciones simples (izquierda <span className="font-mono">RSI</span>,
                  derecha <span className="font-mono">RSD</span>)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">
                  Rotaciones dobles (izquierda{" "}
                  <span className="font-mono">RDI</span>, derecha{" "}
                  <span className="font-mono">RDD</span>)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400 text-lg">✱</span>
                <span className="text-gray-100">Cálculo de altura y equilibrio</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Insertar un Dato */}
      <section className="mb-12">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Insertar un Dato
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-xl p-4 sm:p-5 shadow space-y-2 text-[15px] text-gray-100">
          <p>
            La inserción sigue la misma lógica que en un ABB ordenado: se
            desciende desde la raíz hasta encontrar una hoja donde colocar el
            nuevo nodo respetando el orden.
          </p>
          <p>
            Luego se recorre el camino de regreso hacia la raíz actualizando
            alturas y factores de equilibrio. Si algún nodo alcanza FE = +2 o −2,
            se aplica la rotación o combinación de rotaciones adecuada para
            restaurar el balance y mantener el árbol AVL.
          </p>
        </div>
      </section>

      {/* Separador visual */}
      <div className="my-12 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Balancear el Árbol */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Balancear el Árbol
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Rotaciones y casos de balanceo AVL
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-44 rounded" />

      <section className="mb-10 space-y-10">
        {/* Caso 1: RSI */}
        <div>
          <h3 className="font-bold mb-1">
            <span className="text-red-400">Caso 1:</span> Rotación simple
            izquierda <span className="font-mono">RSI</span>
          </h3>
          <p className="text-gray-200 text-[15px] mb-3">
            Nodo desbalanceado hacia la izquierda cuyo hijo derecho tiene el
            mismo signo de equilibrio (+). Se aplica una rotación simple
            izquierda.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <img
              src={img1}
              alt="Antes de rotación simple izquierda AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-md w-full p-4"
            />
            <img
              src={img2}
              alt="Después de rotación simple izquierda AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-md w-full p-4"
            />
          </div>
        </div>

        {/* Caso 2: RSD */}
        <div>
          <h3 className="font-bold mb-1">
            <span className="text-red-400">Caso 2:</span> Rotación simple
            derecha <span className="font-mono">RSD</span>
          </h3>
          <p className="text-gray-200 text-[15px] mb-3">
            Nodo desbalanceado hacia la derecha cuyo hijo izquierdo tiene el
            mismo signo (−). Se aplica una rotación simple derecha.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
            <img
              src={img3}
              alt="Antes de rotación simple derecha AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-md w-full p-4"
            />
            <img
              src={img4}
              alt="Después de rotación simple derecha AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-md w-full p-4"
            />
          </div>

          <p className="text-gray-200 text-[15px] mt-4 mb-2">
            Estas rotaciones:
          </p>
          <ul className="list-none space-y-2 text-[15px]">
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Conservan el orden en inorden del árbol.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Restablecen factores de equilibrio válidos (−1, 0, +1).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 text-lg">✱</span>
              <span className="text-gray-100">
                Solo modifican unos pocos punteros, por lo que son operaciones
                locales y eficientes.
              </span>
            </li>
          </ul>
        </div>

        {/* Caso 3: RDI */}
        <div>
          <h3 className="font-bold mb-1 text-[17px]">
            <span className="text-red-400">Caso 3:</span> Rotación doble
            izquierda <span className="font-mono">RDI</span>
          </h3>
          <p className="text-gray-200 text-[15px] mb-3">
            El nodo está desbalanceado a la izquierda (FE &lt; −1) y su hijo
            derecho tiene signo opuesto (+). Se requiere una rotación doble
            izquierda-derecha.
          </p>
          <div className="flex justify-center mt-4">
            <img
              src={img5}
              alt="Rotación doble izquierda en árbol AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>

          <p className="text-[15px] text-yellow-400 font-semibold mt-5 mb-2">
            Otro ejemplo de esta rotación:
          </p>
          <div className="flex justify-center">
            <img
              src={img6}
              alt="Ejemplo adicional de rotación doble izquierda en AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>

        {/* Caso 4: RDD */}
        <div>
          <h3 className="font-bold mb-1 text-[17px]">
            <span className="text-red-400">Caso 4:</span> Rotación doble
            derecha <span className="font-mono">RDD</span>
          </h3>
          <p className="text-gray-200 text-[15px] mb-3">
            El nodo está desbalanceado a la derecha y su hijo izquierdo tiene
            signo opuesto (−). Se aplica una rotación doble derecha-izquierda.
          </p>
          <div className="flex justify-center mt-4">
            <img
              src={img7}
              alt="Rotación doble derecha en árbol AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>

          <p className="text-[15px] text-yellow-400 font-semibold mt-5 mb-2">
            Otro ejemplo:
          </p>
          <div className="flex justify-center">
            <img
              src={img8}
              alt="Ejemplo adicional de rotación doble derecha en AVL"
              className="bg-white rounded-xl border-2 border-red-500 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="my-12 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-purple-800 via-red-600 to-yellow-500 rounded-full shadow-[0_0_16px_4px_rgba(239,68,68,0.6)] opacity-95" />
      </div>

      {/* Eliminar un Dato */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Eliminar un Dato
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Cómo afecta la eliminación al balanceo AVL
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-44 rounded" />

      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-xl p-4 sm:p-5 shadow mb-8 text-[15px] space-y-3">
          <p className="text-gray-100">
            Al eliminar un nodo de un AVL, primero se aplica la eliminación
            estándar de un árbol binario de búsqueda. Después, es necesario
            revisar los factores de equilibrio a lo largo del camino de regreso
            hacia la raíz, ya que la altura de algunos subárboles puede haber
            cambiado.
          </p>
          <p className="text-gray-100">Casos de eliminación:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                <b>Nodo hoja:</b> simplemente se elimina.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                <b>Nodo con un hijo:</b> se reemplaza por su único hijo.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                <b>Nodo con dos hijos:</b> se reemplaza por su sucesor (o
                predecesor) en inorden y luego se actualizan las alturas y
                equilibrios.
              </span>
            </li>
          </ul>
        </div>

        <p className="text-gray-100 text-[15px] mb-4">
          Tras la eliminación, el árbol puede requerir varias rotaciones en los
          ancestros del nodo eliminado:
        </p>
        <ul className="list-none mt-2 space-y-2 text-[15px] mb-10">
          {[
            "Si el equilibrio del padre pasa de 0 a ±1, el algoritmo puede terminar: la altura del subárbol no cambió.",
            "Si el equilibrio del padre pasa de ±1 a 0, la altura del subárbol disminuyó y debemos seguir revisando hacia arriba.",
            "Si el equilibrio del padre pasa de ±1 a ±2, es obligatorio aplicar una rotación (simple o doble).",
            "Después de cada rotación, puede ser necesario seguir ajustando ancestros hasta encontrar un nodo cuyo equilibrio vuelva a estar en el rango −1, 0, +1 sin cambiar de altura.",
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
