import definicion_hash_1 from "../../../../../assets/images/definicion_hash_1.jpg";
import definicion_hash_2 from "../../../../../assets/images/definicion_hash_2.jpg";
import definicion_hash_3 from "../../../../../assets/images/definicion_hash_3.jpg";
import definicion_hash_4 from "../../../../../assets/images/definicion_hash_4.jpg";
import definicion_hash_5 from "../../../../../assets/images/definicion_hash_5.jpg";
import definicion_hash_6 from "../../../../../assets/images/definicion_hash_6.jpg";
import definicion_hash_7 from "../../../../../assets/images/definicion_hash_7.jpg";

export function DefinitionTablaHash() {
  return (
    <section className="py-8 px-4 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Título principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-2 rounded-xl bg-gradient-to-b from-red-600 via-red-500 to-red-700 shadow-lg"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
          Tabla Hash
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 mb-1 font-semibold tracking-wide">
        Estructuras Lineales
      </span>
      <hr className="mb-8 border-t-2 border-red-600 w-32 rounded" />

      {/* Historia */}
      <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-3">
        Historia
      </h2>
      <p className="text-gray-300 mb-5 leading-7 backdrop-blur rounded">
        La idea de tablas hashing se presentó de forma independiente en
        diferentes lugares. En enero de 1953, Hans Peter Luhn escribió un
        memorando interno en IBM en el cual explicaba que había utilizado
        hashing con encadenamiento.
        <br />
        Gene Myron Amdahl, Erwin M. Boehme, Nathan Rochester y A. L. Samuel
        implementaron un programa usando tablas Hash al mismo tiempo. El
        concepto de direccionamiento abierto con probabilidad lineal es
        acreditado a Amdahl, pero Ershov (en Rusia) tenía la misma idea.
      </p>

      {/* Definición */}
      <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-500 pl-3">
        Definición
      </h2>
      <div className="mb-5 space-y-4 text-gray-200 leading-7">
        <p>
          Una <b className="text-red-400">tabla hash</b> o mapa hash es una
          estructura de datos que asocia llaves o claves con valores. Es una
          colección de elementos, cada uno de los cuales tiene una clave y una
          información asociada. Esta aproximación consiste en proceder, no por
          comparaciones entre valores clave, sino encontrando alguna función{" "}
          <b className="text-cyan-400">h(k)</b> (función de dispersión), que nos
          dé directamente la localización de la clave en la tabla.
        </p>
        <p>
          La función de dispersión se aplica a lo que habitualmente se denomina
          como la clave del elemento (y en ocasiones será él mismo). El objetivo
          será encontrar una función hash que provoque el menor número posible
          de <b className="text-red-400">colisiones</b> (ocurrencias de
          sinónimos), aunque esto es solo un aspecto del problema, el otro será
          el de diseñar métodos de resolución de colisiones cuando éstas se
          produzcan.
        </p>
        <p>
          La operación principal que soporta de manera eficiente es la{" "}
          <b className="text-red-400">búsqueda</b>: permite el acceso a los
          elementos (teléfono y dirección, por ejemplo) almacenados a partir de
          una clave generada usando el nombre, número de cuenta o id.
        </p>
        <p>
          Funciona transformando la clave con una función hash en un hash, un
          número que la tabla hash utiliza para localizar el valor deseado.
        </p>
        <p>
          Desde un “gran” universo solo un número reducido de claves serán
          consideradas, en la cual cada posición o slot de la tabla corresponde
          a una llave en el universo.
        </p>
      </div>

      {/* Operaciones básicas */}
      <div className="mb-7">
        <div className="font-semibold text-white mb-2">
          Operaciones básicas de las Tablas Hash:
        </div>
        <ul className="space-y-2 text-base leading-7 pl-2">
          <li className="flex items-center gap-2">
            <span className="text-red-500 text-xl">✦</span>
            <span className="text-cyan-200 font-semibold">Insertar Llave</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-500 text-xl">✦</span>
            <span className="text-cyan-200 font-semibold">Buscar Llave</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-500 text-xl">✦</span>
            <span className="text-cyan-200 font-semibold">
              Eliminar Llave
              <span className="text-gray-400 font-normal ml-2">
                Costo O(1) promedio para estas operaciones.
              </span>
            </span>
          </li>
        </ul>
      </div>

      {/* Función de Dispersión */}
      <h2 className="text-xl font-bold mb-3 text-white border-l-4 border-red-500 pl-3">
        Función de Dispersión (Hashing)
      </h2>
      <ul className="mb-4 space-y-2 text-base text-gray-100 leading-7 pl-1">
        <li className="flex items-start">
          <span className="text-cyan-400 text-xl mr-2">*</span>
          Convierte una clave en un valor entero (hash) para indexar la tabla.
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 text-xl mr-2">*</span>
          En Java, el método:
          <span className="ml-2 bg-black/80 border border-cyan-400 rounded px-2 py-0.5 text-cyan-300 font-mono">
            public int hashCode()
          </span>
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 text-xl mr-2">*</span>
          El método devuelve un entero a partir de la dirección de memoria del
          objeto.
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 text-xl mr-2">*</span>
          Disponible en todas las clases por herencia.
        </li>
      </ul>
      <p className="text-gray-200 mb-3">
        La función hash (<b>hash(x)</b>) debe ser rápida y distribuir
        uniformemente los objetos.
      </p>

      {/* Imagen 1 */}
      <div className="flex flex-col items-center gap-2 my-6 px-2">
        <img
          src={definicion_hash_1}
          alt="Ejemplo de mala función hash"
          className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-2xl h-auto"
        />
        <span className="text-gray-400 text-xs text-center max-w-lg">
          <b className="text-cyan-300">Ejemplo:</b> Muchos objetos diferentes
          reciben el mismo hash.
        </span>
      </div>

      {/* Tamaño de la Tabla Hash y colisiones */}
      <p className="text-gray-100 mb-4">
        <span className="text-white font-bold">
          Una tabla hash debe ser suficientemente grande
        </span>{" "}
        para reducir colisiones.
        <span className="text-red-400 font-bold">
          {" "}
          Si tiene solo una entrada: ¡N-1 colisiones para N datos!
        </span>
        <span className="text-gray-300">
          {" "}
          Usar tamaño primo, alejado de potencias de dos.
        </span>
      </p>
      <div className="flex flex-col items-center gap-2 my-6 px-2">
        <img
          src={definicion_hash_2}
          alt="Ejemplo tabla hash tamaño insuficiente"
          className="rounded-xl border-2 border-red-500 shadow-lg w-full max-w-2xl h-auto"
        />
        <span className="text-gray-400 text-xs text-center max-w-lg">
          <b className="text-red-400">Ejemplo:</b> Tamaño insuficiente = más
          colisiones.
        </span>
      </div>

      {/* Formas de Resolver las Colisiones */}
      <h2 className="text-xl font-bold mb-4 text-white border-l-4 border-red-500 pl-3">
        Formas de Resolver las Colisiones
      </h2>
      <div className="flex flex-col gap-5 mb-8">
        {/* Exploración */}
        <div className="border-l-4 border-cyan-400 pl-4 bg-gradient-to-br from-[#16181d] via-[#141618] to-[#151518] rounded-xl py-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 text-2xl">🔎</span>
            <b className="text-white text-lg">Exploración (Open Addressing)</b>
          </div>
          <p className="text-gray-300 ml-2 mb-2">
            Busca otra posición libre cuando ocurre colisión.
          </p>
          <ul className="ml-5 space-y-2 text-gray-200 text-base">
            <li>
              <span className="font-bold text-cyan-400">Lineal:</span>
              <span className="ml-2">Va al siguiente slot libre.</span>
            </li>
            <li>
              <span className="font-bold text-cyan-400">Cuadrática:</span>
              <span className="ml-2">
                Salta i² posiciones hasta encontrar slot libre.
              </span>
            </li>
          </ul>
        </div>
        {/* Encadenamiento */}
        <div className="border-l-4 border-purple-400 pl-4 bg-gradient-to-br from-[#1d1622] via-[#1a1720] to-[#19161a] rounded-xl py-3 shadow-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-2xl">🔗</span>
            <b className="text-white text-lg">Encadenamiento (Chaining)</b>
          </div>
          <p className="text-gray-300 ml-2 mb-2">
            Cada slot de la tabla contiene una lista enlazada de elementos
            colisionados.
          </p>
          <ul className="ml-5 text-gray-200 text-base">
            <li>
              Es flexible: añade el elemento a la lista enlazada del slot donde
              ocurrió la colisión.
            </li>
          </ul>
        </div>
      </div>

      {/* (Separador solo visible en pantallas grandes, opcional) */}
      <hr className="hidden md:block border-t-2 border-[#23232900] my-4 rounded" />

      {/* Hashing Enlazado */}
      <h2 className="text-xl font-bold mb-3 text-white border-l-4 border-red-500 pl-3">
        Hashing Enlazado
      </h2>
      <p className="text-gray-200 mb-3">
        <b className="text-cyan-400">Hashing Enlazado:</b> usa un array de
        listas enlazadas; los objetos con el mismo hash van en la lista
        correspondiente.
      </p>
      <ul className="mb-3 space-y-2 text-gray-100 text-base leading-7 pl-1">
        <li className="flex items-start">
          <span className="text-cyan-400 text-2xl mr-2">✶</span>
          Cada slot contiene una lista enlazada, no el objeto directamente.
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 text-2xl mr-2">✶</span>
          Objetos colisionados van en la misma lista.
        </li>
        <li className="flex items-start">
          <span className="text-cyan-400 text-2xl mr-2">✶</span>
          Inserción/búsqueda/eliminación: 1) usar función hash para elegir slot;
          2) operar en la lista enlazada.
        </li>
      </ul>
      <p className="text-gray-300 mt-4 mb-2">
        El hash es unidireccional: fácil de calcular, difícil de revertir sin la
        función.
      </p>

      <div className="flex flex-col items-center gap-2 my-6 px-2">
        <img
          src={definicion_hash_3}
          alt="Visualización de hashing enlazado"
          className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-2xl h-auto"
        />
        <span className="text-cyan-300 text-sm text-center max-w-lg">
          <b>Visualización:</b> Cada slot apunta a una lista enlazada, donde se
          encadenan los colisionados.
        </span>
      </div>

      {/* Colisiones */}
      <h2 className="text-xl font-bold mb-2 text-white border-l-4 border-red-500 pl-3">
        Colisiones
      </h2>
      <p className="text-gray-200 mb-3">
        Cuando dos claves generan el mismo hash, ambos intentan ocupar el mismo
        slot. Una solución eficiente:{" "}
        <b className="text-cyan-400">encadenamiento</b>.
      </p>
      <div className="flex flex-col items-center gap-2 my-6 px-2">
        <img
          src={definicion_hash_4}
          alt="Visualización de colisiones y encadenamiento"
          className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-3xl h-auto"
        />
        <span className="text-cyan-300 text-sm text-center max-w-lg">
          <b>Visualización:</b> Claves colisionadas se almacenan en la lista
          enlazada del slot.
        </span>
      </div>

      {/* Factor de carga */}
      <h2 className="text-xl font-bold mb-2 text-white border-l-4 border-red-500 pl-3">
        Factor de carga
      </h2>
      <p className="text-gray-200 mb-2">
        El <b className="text-cyan-400">factor de carga</b> es la razón entre
        elementos y capacidad de la tabla. Un valor bajo garantiza operaciones
        O(1).
      </p>
      <p className="text-cyan-200 mb-2 font-semibold">
        Factor de carga = Elementos / Capacidad
      </p>
      <p className="text-gray-300 mb-4">
        Si el factor es alto, hay más colisiones. Es mejor que la capacidad de
        la tabla sea mucho mayor al número de elementos.
      </p>
      <div className="flex flex-col items-center gap-2 my-6 px-2">
        <img
          src={definicion_hash_5}
          alt="Visualización de factor de carga y colisiones"
          className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-3xl h-auto"
        />
        <span className="text-cyan-300 text-sm text-center max-w-lg">
          Más colisiones = más costo, menos eficiencia.
        </span>
      </div>

      {/* Hashing abierto y cerrado */}
      <h2 className="text-xl font-bold mb-4 text-white border-l-4 border-red-500 pl-3">
        Hashing Abierto vs Cerrado
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Hashing Abierto */}
        <div className="flex-1 bg-gradient-to-b from-[#151516]/80 to-[#19191b]/90 border-2 border-red-500 rounded-2xl p-4 mb-6 md:mb-0 shadow-lg hover:scale-105 transition-all duration-200">
          <h3 className="text-lg font-bold text-red-400 mb-2 text-center">
            Hashing abierto
          </h3>
          <p className="text-gray-200 mb-3 text-center">
            Cada slot apunta a una lista enlazada. Elementos que comparten hash
            se agregan a la lista.
          </p>
          <img
            src={definicion_hash_6}
            alt="Hashing abierto"
            className="rounded-xl border border-red-400 mx-auto my-2 max-w-full"
            style={{ maxHeight: 220, objectFit: "contain" }}
          />
        </div>
        {/* Separador solo en desktop */}
        <div className="hidden md:flex flex-col justify-center items-center h-full">
          <span className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-red-400 bg-black shadow-lg">
            VS
          </span>
        </div>
        {/* Hashing Cerrado */}
        <div className="flex-1 bg-gradient-to-b from-[#151516]/80 to-[#19191b]/90 border-2 border-red-500 rounded-2xl p-4 shadow-lg hover:scale-105 transition-all duration-200">
          <h3 className="text-lg font-bold text-red-400 mb-2 text-center">
            Hashing cerrado
          </h3>
          <p className="text-gray-200 mb-3 text-center">
            La información se almacena en el array. Si hay colisión, busca el
            siguiente slot libre. No usa listas ni punteros.
          </p>
          <img
            src={definicion_hash_7}
            alt="Hashing cerrado"
            className="rounded-xl border border-red-400 mx-auto my-2 max-w-full"
            style={{ maxHeight: 220, objectFit: "contain" }}
          />
        </div>
      </div>
    </section>
  );
}
