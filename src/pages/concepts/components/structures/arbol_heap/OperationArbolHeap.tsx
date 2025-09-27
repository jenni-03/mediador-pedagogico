import img1 from "../../../../../assets/images/operation_heap_1.jpg";
import img2 from "../../../../../assets/images/operation_heap_2.jpg";
import img3 from "../../../../../assets/images/operation_heap_3.jpg";
import img4 from "../../../../../assets/images/operation_heap_4.jpg";
import img5 from "../../../../../assets/images/operation_heap_5.jpg";
import img6 from "../../../../../assets/images/operation_heap_6.jpg";
import img7 from "../../../../../assets/images/operation_heap_7.jpg";
import img8 from "../../../../../assets/images/operation_heap_8.jpg";

export function OperationArbolHeap() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Heap
        </h1>
      </div>
      <span className="text-base text-red-500 ml-3 font-medium block mb-2">
        Cómo funciona la inserción y eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-10 w-40 rounded" />

      {/* Insertar Datos */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Insertar Datos en el Heap
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 text-[15px] mb-3">
            Para <b>insertar</b> un dato en un Heap, sigue estos pasos:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100 text-[15.5px]">
            <li>
              Se agrega el nuevo nodo en la siguiente posición libre (de
              izquierda a derecha).
            </li>
            <li>
              Se compara con su padre. Si es mayor, se permuta hacia arriba
              ("flotar") hasta que se cumpla la propiedad de Heap o llegue a la
              raíz.
            </li>
          </ul>
        </div>
        <div className="text-[15px] text-gray-300 mb-4 font-semibold">
          Ejemplo visual de inserción:
        </div>
        <div className="flex flex-col items-center gap-8">
          {[img1, img2, img3, img4].map((img, idx) => (
            <div key={idx} className="flex justify-center w-full">
              <img
                src={img}
                alt={`Insertar Heap ${idx + 1}`}
                className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Eliminar Datos */}
      <section>
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Eliminar Datos del Heap
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 text-[15px] mb-3">
            Para <b>eliminar</b> siempre se extrae la{" "}
            <span className="text-red-400 font-bold">RAÍZ</span>. Pasos:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-100 text-[15.5px]">
            <li>Elimina la raíz del heap (el elemento de mayor prioridad).</li>
            <li>Coloca el último nodo en la raíz.</li>
            <li>
              Compara con los hijos. Si alguno es mayor, permuta con el mayor
              ("hundir").
            </li>
            <li>Repite hasta restaurar la propiedad de Heap.</li>
          </ul>
        </div>
        <div className="text-[15px] text-gray-300 mb-4 font-semibold">
          Ejemplo visual de eliminación:
        </div>
        <div className="flex flex-col items-center gap-8">
          {[img5, img6, img7, img8].map((img, idx) => (
            <div key={idx} className="flex justify-center w-full">
              <img
                src={img}
                alt={`Eliminar Heap ${idx + 1}`}
                className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
