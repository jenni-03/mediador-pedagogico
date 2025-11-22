import img1 from "../../../../../assets/images/operation_heap_1.jpg";
import img2 from "../../../../../assets/images/operation_heap_2.jpg";
import img3 from "../../../../../assets/images/operation_heap_3.jpg";
import img4 from "../../../../../assets/images/operation_heap_4.jpg";
import img5 from "../../../../../assets/images/operation_heap_5.jpg";
import img6 from "../../../../../assets/images/operation_heap_6.jpg";
import img7 from "../../../../../assets/images/operation_heap_7.jpg";
import img8 from "../../../../../assets/images/operation_heap_8.jpg";

export function OperationArbolHeap() {
  const insertImages = [img1, img2, img3, img4];
  const deleteImages = [img5, img6, img7, img8];

  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Heap
        </h1>
      </div>
      <span className="text-base text-red-500 ml-3 font-medium block mb-2">
        Cómo funciona la inserción y la eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-10 w-40 rounded" />

      {/* Inserción */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Insertar datos en el Heap (máx-heap)
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-3">
            Para <b>insertar</b> un dato en un <b>máx-heap binario</b> se
            aprovecha que el árbol es completo. El procedimiento es:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-100">
            <li>
              Se coloca el nuevo valor en la <b>siguiente posición libre</b> del
              heap (de izquierda a derecha en el último nivel).
            </li>
            <li>
              Se compara con su <b>padre</b>. Si el nuevo valor es{" "}
              <b>mayor</b>, se intercambian (el nodo “flota” hacia arriba).
            </li>
            <li>
              Se repite el intercambio con el nuevo padre mientras el valor
              insertado sea mayor o hasta que llegue a la <b>raíz</b>.
            </li>
          </ol>
          <p className="text-gray-300 text-sm mt-3">
            En un <b>min-heap</b> el proceso es análogo, pero “flota” el{" "}
            <b>menor</b> en lugar del mayor.
          </p>
        </div>

        <div className="text-[15px] text-gray-300 mb-4 font-semibold">
          Ejemplo visual de inserción (con varias inserciones sucesivas):
        </div>
        <div className="flex flex-col items-center gap-8">
          {insertImages.map((img, idx) => (
            <div key={idx} className="flex justify-center w-full">
              <img
                src={img}
                alt={`Paso ${idx + 1} de inserción en un heap`}
                className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Eliminación */}
      <section>
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Eliminar datos del Heap (extraer la raíz)
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-3">
            La operación básica de eliminación en un máx-heap es{" "}
            <b>extraer la raíz</b> (el elemento de mayor prioridad). El
            procedimiento es:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-100">
            <li>
              Se elimina la <b>raíz</b> del heap y se guarda su valor (es el
              máximo).
            </li>
            <li>
              Se toma el <b>último nodo</b> del último nivel y se coloca
              temporalmente en la raíz.
            </li>
            <li>
              Se compara el nuevo valor de la raíz con sus hijos. Si alguno de
              ellos es <b>mayor</b>, se intercambia con el <b>hijo mayor</b>.
              Este proceso se llama <b>“hundir”</b> o <b>heapify-down</b>.
            </li>
            <li>
              Se repite el intercambio hacia abajo hasta que:
              <br />– El nodo sea mayor que sus hijos, o
              <br />– Llegue a una hoja.
            </li>
          </ol>
          <p className="text-gray-300 text-sm mt-3">
            En un <b>min-heap</b> se extrae el mínimo y se “hunde” hacia abajo
            comparando siempre con el hijo de <b>menor</b> valor.
          </p>
        </div>

        <div className="text-[15px] text-gray-300 mb-4 font-semibold">
          Ejemplo visual de eliminación (extraer varias veces la raíz):
        </div>
        <div className="flex flex-col items-center gap-8">
          {deleteImages.map((img, idx) => (
            <div key={idx} className="flex justify-center w-full">
              <img
                src={img}
                alt={`Paso ${idx + 1} de eliminación en un heap`}
                className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
