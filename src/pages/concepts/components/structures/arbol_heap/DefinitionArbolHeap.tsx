import img1 from "../../../../../assets/images/definicion_heap_1.jpg";
import img2 from "../../../../../assets/images/definicion_heap_2.jpg";

export function DefinitionArbolHeap() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Heap
        </h1>
      </div>
      <span className="text-base text-red-500 ml-3 font-medium block mb-2">
        Árbol binario de prioridad (montículo)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-2">
          Definición de Árbol Heap
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Un <b>heap</b> o <b>montículo</b> es una estructura de datos basada
            en un <b>árbol binario completo</b>, utilizada para implementar
            colas de prioridad. No es necesariamente un árbol binario de
            búsqueda: las claves no están ordenadas de izquierda a derecha, sino
            que cumplen una <b>propiedad de prioridad</b>.
          </p>
          <p className="text-gray-100">
            En un heap binario:
            <br />• La forma del árbol es siempre <b>completa</b>.
            <br />• El orden viene dado por la <b>prioridad</b> de cada nodo
            (máx-heap o min-heap).
            <br />• Suele representarse como un <b>arreglo</b>, aprovechando que
            el árbol es completo.
          </p>
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
            alt="Ejemplo de árbol Heap"
          />
        </div>
      </section>

      {/* Resumen visual */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-cyan-400 mb-2">
          Resumen visual (forma + prioridad)
        </h2>
        <div className="bg-[#111217] border border-cyan-500/60 rounded-lg p-4 shadow text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">Podemos pensar un heap como:</p>
          <ul className="list-disc list-inside text-gray-100 space-y-1 mb-2">
            <li>
              Un <b>árbol binario completo</b>: se rellenan los niveles de
              arriba hacia abajo y de izquierda a derecha.
            </li>
            <li>
              Cada nodo cumple que su prioridad es <b>mayor o igual</b>{" "}
              (máx-heap) o <b>menor o igual</b> (min-heap) que la de sus hijos.
            </li>
            <li>
              El elemento de <b>mayor prioridad</b> siempre está en la{" "}
              <b>raíz</b>.
            </li>
          </ul>
          <p className="text-gray-300 text-sm">
            Intuición: el heap no ordena todos los elementos, solo mantiene el
            “mejor” (según la prioridad) en la raíz, facilitando extraerlo en
            tiempo O(log n).
          </p>
        </div>
      </section>

      {/* Características básicas */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">Características</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-3">
            Un montículo binario es un árbol binario completo tal que:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100">
            <li>Puede estar vacío.</li>
            <li>
              En un <b>máx-heap</b>, el valor en la raíz es <b>mayor o igual</b>{" "}
              que el de cualquiera de sus hijos. En un <b>min-heap</b> ocurre lo
              contrario: la raíz es <b>menor o igual</b> que sus hijos.
            </li>
            <li>
              Cada subárbol izquierdo y derecho de un nodo también es un{" "}
              <b>heap</b> (propiedad recursiva).
            </li>
          </ul>
        </div>

        {/* Representación en arreglo */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-3">
            Gracias a que el árbol es completo, el heap se puede representar de
            forma muy natural en un <b>arreglo</b>:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100">
            <li>
              Si numeramos las posiciones del arreglo desde <b>1</b>, el nodo en
              la posición <b>k</b> tiene:
              <br />– Padre en la posición <b>⌊k / 2⌋</b> (si k &gt; 1).
              <br />– Hijos en las posiciones <b>2k</b> y <b>2k + 1</b>, si
              existen.
            </li>
            <li>
              El árbol está balanceado excepto posiblemente el último nivel, que
              se llena de <b>izquierda a derecha</b>.
            </li>
            <li>
              Esta representación permite implementar operaciones como{" "}
              <b>insertar</b> y <b>eliminar máximo/mínimo</b> en tiempo{" "}
              <b>O(log n)</b>.
            </li>
          </ul>
        </div>

        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-3xl w-full p-4"
            alt="Heap representado como arreglo"
          />
        </div>
      </section>

      {/* Propiedades adicionales */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Propiedades del Heap
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="font-semibold text-gray-100 mb-2">
            Propiedades estructurales:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100">
            <li>
              Todos los heaps son <b>árboles binarios completos</b>.
            </li>
            <li>
              La altura del heap es <b>O(log n)</b>, ya que está casi
              perfectamente balanceado.
            </li>
            <li>
              El último nivel puede no estar lleno, pero siempre se llena de{" "}
              <b>izquierda a derecha</b>.
            </li>
          </ul>
        </div>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="font-semibold text-gray-100 mb-2">
            Propiedades de prioridad:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100">
            <li>
              El elemento con <b>mayor prioridad</b> (máx-heap) o{" "}
              <b>menor prioridad</b> (min-heap) se encuentra siempre en la{" "}
              <b>raíz</b>.
            </li>
            <li>
              Los elementos en niveles inferiores no están totalmente ordenados
              entre sí, solo respetan la prioridad respecto a sus ancestros.
            </li>
            <li>
              El heap es especialmente útil para algoritmos como <b>HeapSort</b>{" "}
              o para implementar colas de prioridad en <b>O(log n)</b>.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
