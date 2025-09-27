import img1 from "../../../../../assets/images/operacion_secuencia_1.png";
import img2 from "../../../../../assets/images/operacion_secuencia_2.jpg";
import img3 from "../../../../../assets/images/operacion_secuencia_3.jpg";
import img4 from "../../../../../assets/images/operacion_secuencia_4.jpg";
import img5 from "../../../../../assets/images/operacion_secuencia_5.jpg";
import img6 from "../../../../../assets/images/operacion_secuencia_6.jpg";

export function OperationSecuencia() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Secuencia
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Estática
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Insertar */}
      <section className="space-y-4 text-sm leading-6">
        <h3 className="text-2xl font-bold text-white">Insertar Elemento</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p>
            Para insertar en una secuencia basta con indicar el dato que se
            desea almacenar. Este se coloca consecutivamente en la siguiente
            posición disponible, siempre que no se exceda la capacidad definida.
          </p>
        </div>

        <h4 className="text-lg font-semibold text-red-400">Ejemplo</h4>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3">
          <p>Tenemos inicialmente la siguiente secuencia:</p>
          <img
            src={img1}
            alt="secuencia inicial"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
          <p>
            Se desea insertar el número <b className="text-white">25</b>:
          </p>
          <img
            src={img2}
            alt="secuencia insertando elemento"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
          <p>El nuevo elemento se agrega al final en el índice disponible:</p>
          <img
            src={img3}
            alt="secuencia después de inserción"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
        </div>
      </section>

      {/* Editar */}
      <section className="mt-10 text-sm leading-6 space-y-3">
        <h3 className="text-2xl font-semibold text-red-400">Editar</h3>
        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow">
          <p>
            Para editar, se indica la posición y el nuevo dato. Se valida que la
            posición exista y contenga un elemento, luego se actualiza el valor
            sin alterar el orden de la secuencia.
          </p>
        </div>
      </section>

      {/* Buscar */}
      <section className="mt-10 text-sm leading-6 space-y-3">
        <h3 className="text-2xl font-semibold text-red-400">Buscar</h3>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow">
          <p>
            Para buscar, se indica el dato y la estructura recorre sus elementos
            secuencialmente hasta encontrar la coincidencia o determinar que no
            existe dentro de la secuencia.
          </p>
        </div>
      </section>

      {/* Eliminar */}
      <section className="mt-10 text-sm leading-6 space-y-3">
        <h3 className="text-2xl font-semibold text-red-400">Eliminar</h3>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Para eliminar, se indica el dato. Al eliminarlo, los elementos
            posteriores se <b>corren a la izquierda</b> para no dejar espacios
            vacíos, manteniendo la continuidad de la secuencia.
          </p>
        </div>

        <h4 className="text-lg font-semibold text-red-400">Ejemplo</h4>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Se desea eliminar el número <b className="text-white">02</b>:
          </p>
          <img
            src={img4}
            alt="secuencia antes de eliminar"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
          <p>Al eliminar, los elementos se reorganizan automáticamente:</p>
          <img
            src={img5}
            alt="corrimiento después de eliminar"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
          <p>La estructura final queda así, sin espacios vacíos:</p>
          <img
            src={img6}
            alt="secuencia final después de eliminar"
            className="w-full max-w-md rounded-lg border border-gray-700 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
