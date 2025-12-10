import img1 from "../../../../../assets/images/operacion_secuencia_1.png";
import img2 from "../../../../../assets/images/operacion_secuencia_2.jpg";
import img3 from "../../../../../assets/images/operacion_secuencia_3.jpg";
import img4 from "../../../../../assets/images/operacion_secuencia_4.jpg";
import img5 from "../../../../../assets/images/operacion_secuencia_5.jpg";
import img6 from "../../../../../assets/images/operacion_secuencia_6.jpg";

export function OperationSecuencia() {
  return (
    <div className="py-8 px-3 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Secuencia
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Estática
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro operaciones */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-100">
          <p>
            Sobre una <b>secuencia estática</b> trabajamos con las operaciones
            básicas: <span className="text-cyan-300">insertar</span>,{" "}
            <span className="text-yellow-300">editar</span>,{" "}
            <span className="text-cyan-300">buscar</span> y{" "}
            <span className="text-red-300">eliminar</span>. Todas se realizan
            usando índices y respetando la capacidad fija del arreglo.
          </p>
        </div>
      </section>

      {/* INSERTAR */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Insertar elemento
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow text-[15.5px] text-gray-100 space-y-3">
          <p className="font-semibold text-cyan-300">
            Idea general (inserción al final):
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Comprobar que aún hay espacio en la secuencia.</li>
            <li>
              Tomar el siguiente índice libre (cantidad actual de elementos).
            </li>
            <li>Colocar allí el nuevo dato.</li>
          </ol>
          <p className="text-sm text-gray-300">
            El costo de insertar al final es aproximadamente{" "}
            <b>O(1)</b>, siempre que no se supere la capacidad.
          </p>
        </div>

        {/* Ejemplo visual */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Ejemplo</h3>
          <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-4 text-[15px] text-gray-100">
            <p className="font-medium">
              1. Tenemos inicialmente la siguiente secuencia:
            </p>
            <img
              src={img1}
              alt="Secuencia inicial"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
            <p className="font-medium">
              2. Se desea insertar el número{" "}
              <span className="font-bold text-white">25</span>:
            </p>
            <img
              src={img2}
              alt="Secuencia insertando elemento"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
            <p className="font-medium">
              3. El nuevo elemento se agrega al final, en el índice disponible:
            </p>
            <img
              src={img3}
              alt="Secuencia después de la inserción"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
          </div>
        </div>
      </section>

      {/* EDITAR */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Editar</h2>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow text-[15.5px] text-gray-100 space-y-2">
          <p className="font-semibold text-yellow-300">
            Modificar un valor existente:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Indicar la posición (índice) que se desea modificar.</li>
            <li>Verificar que el índice esté dentro del rango válido.</li>
            <li>Reemplazar el valor almacenado por el nuevo dato.</li>
          </ol>
          <p className="text-sm text-gray-300">
            Como se accede directamente por índice, editar es una operación{" "}
            <b>O(1)</b>.
          </p>
        </div>
      </section>

      {/* BUSCAR */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Buscar</h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow text-[15.5px] text-gray-100 space-y-2">
          <p className="font-semibold text-cyan-300">
            Búsqueda secuencial en la secuencia:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Indicar el dato que se desea localizar.</li>
            <li>
              Recorrer los elementos desde el índice 0 hasta el último ocupado.
            </li>
            <li>
              Detenerse cuando se encuentre la coincidencia o se llegue al
              final.
            </li>
          </ol>
          <p className="text-sm text-gray-300">
            En el peor caso, hay que revisar todos los elementos, por lo que la
            búsqueda tiene costo <b>O(n)</b>.
          </p>
        </div>
      </section>

      {/* ELIMINAR */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Eliminar</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-100 space-y-3">
          <p className="font-semibold text-red-300">
            Eliminar manteniendo la secuencia compacta:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Localizar el dato (o el índice) que se desea eliminar.</li>
            <li>
              Eliminar el elemento de esa posición lógica de la secuencia.
            </li>
            <li>
              Desplazar <b>una posición a la izquierda</b> todos los elementos
              que están a la derecha.
            </li>
            <li>
              Decrementar la cantidad de elementos para indicar que la última
              posición ha quedado libre.
            </li>
          </ol>
          <p className="text-sm text-gray-300">
            El costo está dominado por el corrimiento de elementos, por lo que
            la eliminación tiene costo <b>O(n)</b>.
          </p>
        </div>

        {/* Ejemplo visual de eliminación */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Ejemplo</h3>
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-4 text-[15px] text-gray-100">
            <p>
              1. Se desea eliminar el número{" "}
              <span className="font-bold text-white">02</span>:
            </p>
            <img
              src={img4}
              alt="Secuencia antes de eliminar"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
            <p>
              2. Se elimina el valor y los elementos a la derecha se desplazan
              una posición:
            </p>
            <img
              src={img5}
              alt="Corrimiento después de eliminar"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
            <p>3. La secuencia queda compacta, sin espacios vacíos:</p>
            <img
              src={img6}
              alt="Secuencia final después de eliminar"
              className="w-full max-w-md rounded-xl border border-gray-700 shadow mx-auto bg-white"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
