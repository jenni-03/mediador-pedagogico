import img1 from "../../../../../assets/images/operacion_secuencia_1.png";
import img2 from "../../../../../assets/images/operacion_secuencia_2.jpg";
import img3 from "../../../../../assets/images/operacion_secuencia_3.jpg";
import img4 from "../../../../../assets/images/operacion_secuencia_4.jpg";
import img5 from "../../../../../assets/images/operacion_secuencia_5.jpg";
import img6 from "../../../../../assets/images/operacion_secuencia_6.jpg";

export function OperationSecuencia() {
  return (
    <div className="py-6 px-8 sm:px-12 bg-[#0f0f0f] text-white leading-relaxed">
      <h1 className="text-3xl font-extrabold text-white mb-1">OPERACIONES</h1>
      <h2 className="text-base text-red-500 mb-3 font-semibold">Secuencia</h2>
      <hr className="mt-2 mb-6 border-t-2 border-red-500" />

      {/* Insertar */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-red-500 mb-3">Insertar</h3>
        <p className="text-gray-300 text-sm mb-4">
          Para esta operación solo basta con indicar el dato que se desea
          almacenar en la estructura y esta lo almacena consecutivamente en la
          posición acorde a la cantidad de datos que posee, teniendo en cuenta
          no desbordar la capacidad de la Secuencia.
        </p>
        <p className="text-sm text-gray-300 mb-3">
          <span className="font-semibold text-white">
            Ejemplo de insertar:{" "}
          </span>
          Tenemos la secuencia:
        </p>
        <img
          src={img1}
          alt="img 1"
          className="rounded-xl mb-4 border border-gray-700"
        />
        <p className="text-sm text-gray-300 mb-3">
          Se desea insertar el número{" "}
          <span className="text-white font-semibold">25</span> a la secuencia.
        </p>
        <img
          src={img2}
          alt="img 2"
          className="rounded-xl mb-4 border border-gray-700"
        />
        <p className="text-sm text-gray-300 mb-3">
          Simplemente se agrega en el índice disponible (posición igual a
          cantidad de elementos).
        </p>
        <img
          src={img3}
          alt="img 3"
          className="rounded-xl border border-gray-700"
        />
      </div>

      {/* Editar */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-red-500 mb-3">Editar</h3>
        <p className="text-gray-300 text-sm">
          Para esta operación solo basta con indicar el nuevo dato y la posición
          a editar. La estructura recorre los elementos hasta encontrar la
          posición deseada y actualiza el valor, validando que la posición
          exista y contenga un dato.
        </p>
      </div>

      {/* Buscar */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-red-500 mb-3">Buscar</h3>
        <p className="text-gray-300 text-sm">
          Se indica el dato que se desea buscar en la estructura. Esta recorre
          sus elementos hasta encontrar la coincidencia, validando que el dato
          exista dentro de la Secuencia.
        </p>
      </div>

      {/* Eliminar */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-red-500 mb-3">Eliminar</h3>
        <p className="text-gray-300 text-sm mb-4">
          Se indica el dato a eliminar, la estructura lo remueve y reorganiza
          los elementos posteriores para no dejar espacios vacíos, manteniendo
          la continuidad.
        </p>
        <p className="text-sm text-gray-300 mb-3">
          <span className="font-semibold text-white">
            Ejemplo de eliminar:{" "}
          </span>
          Se desea eliminar el número{" "}
          <span className="text-white font-semibold">02</span>:
        </p>
        <img
          src={img4}
          alt="img 4"
          className="rounded-xl mb-4 border border-gray-700"
        />
        <p className="text-sm text-gray-300 mb-3">
          Al eliminarse el número, se produce un{" "}
          <span className="text-white font-semibold">corrimiento</span> a la
          izquierda.
        </p>
        <img
          src={img5}
          alt="img 5"
          className="rounded-xl mb-4 border border-gray-700"
        />
        <p className="text-sm text-gray-300 mb-3">
          La estructura finalmente queda así, sin espacios vacíos:
        </p>
        <img
          src={img6}
          alt="img 6"
          className="rounded-xl border border-gray-700"
        />
      </div>
    </div>
  );
}
