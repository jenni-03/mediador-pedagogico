import op1 from "../../../../../assets/images/operacion_tabla_hash_1.jpg";
import op2 from "../../../../../assets/images/operacion_tabla_hash_2.jpg";
import op3 from "../../../../../assets/images/operacion_tabla_hash_3.jpg";
import op4 from "../../../../../assets/images/operacion_tabla_hash_4.jpg";
import op5 from "../../../../../assets/images/operacion_tabla_hash_5.jpg";
import op6 from "../../../../../assets/images/operacion_tabla_hash_6.jpg";

export function OperationTablaHash() {
  return (
    <div className="py-6 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Título */}
      <div className="flex items-center gap-3 mb-1">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Tabla Hash
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 mb-1 font-medium block">
        Inserción y eliminación con encadenamiento
      </span>
      <hr className="mb-8 border-t-2 border-red-600 w-36 rounded" />

      {/* Inserción */}
      <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-2">
        Inserción
      </h2>
      <p className="text-gray-200 mb-4">
        En hashing abierto, consiste en aplicar la función hash al dato a
        insertar. El resultado indica la posición (slot) del array en la que se
        almacenará el dato. Ese valor se añade al inicio de la lista enlazada
        correspondiente. Si se inserta en una lista no vacía, ocurre una
        colisión.
      </p>

      {/* Ejemplo de insertar */}
      <h3 className="text-lg font-bold mb-1 text-red-400">
        Ejemplo de Insertar
      </h3>
      <p className="text-gray-200 mb-3">
        Tabla hash de 3 slots, inicialmente vacía. Se quiere agregar los
        valores: 5, 2, 1, 7.
      </p>
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op1}
          alt="Tabla hash vacía, agregar valores"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* Insertar el 5 */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op2}
          alt="Insertar el 5 en la tabla hash"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* Insertar el 7, ocurre colisión */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op3}
          alt="Insertar el 7, ocurre colisión"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* Insertar el 1 */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op4}
          alt="Insertar el 7, ocurre colisión"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* Insertar el 7, ocurre colisión */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op5}
          alt="Insertar el 7, ocurre colisión"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* Explicación pasos de inserción */}
      <div className="bg-[#151516] border-l-4 border-red-500 rounded-md p-4 mb-8">
        <span className="font-semibold text-red-400 block mb-2">
          Resumen de inserción:
        </span>
        <ul className="list-disc pl-8 text-gray-100 space-y-1">
          <li>Aplicar la función hash para obtener la posición.</li>
          <li>
            Insertar el dato al inicio de la lista enlazada del slot calculado.
          </li>
          <li>
            Si el slot ya tiene elementos, ocurre una colisión y se añade el
            nuevo nodo al inicio.
          </li>
          <li>
            Complejidad promedio: <span className="text-white">O(1)</span>.
          </li>
        </ul>
      </div>

      {/* Eliminación */}
      <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-2">
        Eliminación
      </h2>
      <p className="text-gray-200 mb-4">
        La eliminación tiene el mismo costo que la búsqueda: se usa la función
        hash para encontrar el slot, luego se busca y elimina el valor en la
        lista enlazada correspondiente.
      </p>
      <h3 className="text-lg font-bold mb-1 text-red-400">
        Ejemplo de eliminar
      </h3>
      <p className="text-gray-200 mb-3">
        Ejemplo: eliminar "Ana". Se busca en la lista de la posición 0 y se
        elimina.
      </p>
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={op6}
          alt="Eliminar elemento de tabla hash"
          className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-xl border-2 border-red-500 shadow-lg"
        />
      </div>
      {/* También podrías añadir pasos si quieres, como arriba */}

      {/* Opcional: búsqueda */}
      <h2 className="text-xl font-bold mb-2 text-white border-l-4 border-red-500 pl-2">
        Búsqueda
      </h2>
      <p className="text-gray-200 mb-4">
        La búsqueda funciona igual: se calcula el hash, se va al slot, y se
        recorre la lista enlazada para encontrar el valor.
      </p>

      {/* Puedes incluir otra imagen si quieres ilustrar la búsqueda */}
      {/* Ejemplo: si tienes una imagen de búsqueda, inclúyela aquí */}
    </div>
  );
}
