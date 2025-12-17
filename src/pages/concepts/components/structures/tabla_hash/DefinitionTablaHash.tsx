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
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-2 rounded-xl bg-gradient-to-b from-red-600 via-red-500 to-red-700 shadow-lg" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow-lg">
          Tabla Hash
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 mb-1 font-semibold tracking-wide">
        Estructura de Acceso Directo · Clave → Valor
      </span>
      <hr className="mb-8 border-t-2 border-red-600 w-32 rounded" />

      {/* DESCRIPCIÓN GENERAL */}
      <section className="mb-8 space-y-4 text-[15px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold text-red-500 mb-1">Descripción</h2>

        <div className="bg-gradient-to-br from-[#17171b] via-[#18191c] to-[#151618] border border-red-500/70 rounded-xl p-4 shadow-lg">
          <div className="grid md:grid-cols-[1.4fr,1fr] gap-5 items-center">
            <div>
              <p>
                Una <b className="text-red-400">tabla hash</b> (o{" "}
                <i>hash map</i>) es una estructura que asocia{" "}
                <b>claves</b> con <b>valores</b>. En lugar de buscar
                comparando uno a uno, utiliza una{" "}
                <b className="text-cyan-400">función hash h(k)</b> que
                transforma la clave en una posición de la tabla, permitiendo
                búsquedas casi en tiempo <b>O(1)</b>.
              </p>
              <p className="mt-3">
                Puedes imaginarla como un <b>diccionario</b>: das una palabra
                (clave) y obtienes su definición (valor) sin recorrer todas las
                páginas, porque ya sabes a qué “sección” ir.
              </p>
            </div>

            <div className="bg-[#121216] border border-red-500/60 rounded-lg p-3 text-[13px] space-y-2">
              <p className="font-semibold text-red-400 mb-1">
                Elementos clave
              </p>
              <ul className="space-y-1">
                <li>
                  <span className="text-cyan-300 font-semibold">Clave:</span>{" "}
                  dato que identifica de forma única a un elemento.
                </li>
                <li>
                  <span className="text-cyan-300 font-semibold">Valor:</span>{" "}
                  información asociada a la clave.
                </li>
                <li>
                  <span className="text-cyan-300 font-semibold">Tabla:</span>{" "}
                  arreglo donde se guardan los elementos.
                </li>
                <li>
                  <span className="text-cyan-300 font-semibold">
                    Función hash:
                  </span>{" "}
                  calcula el índice de la tabla a partir de la clave.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* HISTORIA (RESUMIDA) */}
        <div className="bg-[#17181c] border-l-4 border-red-500 rounded-md p-4 shadow">
          <h3 className="text-sm font-semibold text-red-400 mb-1 uppercase tracking-wide">
            Breve historia
          </h3>
          <p className="text-[14px] text-gray-300">
            Las ideas de <b>hashing</b> aparecieron de forma independiente a
            comienzos de los años 50. En 1953,{" "}
            <span className="text-cyan-300">Hans Peter Luhn</span> documentó en
            IBM el uso de hashing con encadenamiento, mientras que{" "}
            <span className="text-cyan-300">
              Gene Amdahl, Erwin Boehme, Nathan Rochester y A. L. Samuel
            </span>{" "}
            trabajaban en implementaciones similares. En paralelo,{" "}
            <span className="text-cyan-300">Ershov</span> en Rusia planteó
            técnicas de direccionamiento abierto. Desde entonces, las tablas
            hash se han convertido en una pieza fundamental de los lenguajes de
            programación modernos.
          </p>
        </div>
      </section>

      {/* OPERACIONES BÁSICAS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3 text-white border-l-4 border-red-500 pl-3">
          Operaciones básicas
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 text-[14px]">
          {[
            {
              title: "Insertar (put)",
              desc: "Agrega o actualiza el valor asociado a una clave.",
            },
            {
              title: "Buscar (get)",
              desc: "Obtiene el valor correspondiente a una clave dada.",
            },
            {
              title: "Eliminar (remove)",
              desc: "Borra la clave y su valor asociado de la tabla.",
            },
          ].map((op) => (
            <div
              key={op.title}
              className="bg-[#17181c] border border-red-500/70 rounded-xl p-3 shadow flex flex-col gap-2"
            >
              <span className="text-cyan-300 font-semibold">{op.title}</span>
              <p className="text-gray-200">{op.desc}</p>
              <span className="text-[11px] text-gray-400 mt-1">
                Costo promedio: <b>O(1)</b>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FUNCIÓN HASH */}
      <section className="mb-10 space-y-4 text-[15px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold mb-3 text-white border-l-4 border-red-500 pl-3">
          Función de dispersión (función hash)
        </h2>

        <p>
          La <b className="text-cyan-400">función hash</b> toma la clave y la
          convierte en un número entero (hash) que se usa como índice dentro de
          la tabla. Una buena función hash debe:
        </p>
        <ul className="ml-4 mt-1 space-y-1">
          <li>• Ser rápida de calcular.</li>
          <li>• Distribuir las claves de forma uniforme.</li>
          <li>• Minimizar las colisiones (dos claves en el mismo índice).</li>
        </ul>

        <div className="bg-[#14151a] border-l-4 border-cyan-400 rounded-md p-3 text-[14px]">
          <p className="font-semibold text-cyan-300 mb-1">
            Ejemplo en Java (hashCode)
          </p>
          <p>
            En Java, todos los objetos heredan el método{" "}
            <span className="bg-black/80 border border-cyan-500 rounded px-2 py-0.5 font-mono text-xs ml-1">
              public int hashCode()
            </span>{" "}
            que devuelve un entero asociado al objeto. Las colecciones
            hash (HashMap, HashSet, …) usan este valor para ubicar los
            elementos en la tabla.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <img
              src={definicion_hash_1}
              alt="Mala distribución de función hash"
              className="rounded-xl border-2 border-red-500 shadow-lg w-full max-w-md h-auto bg-white"
            />
            <span className="text-gray-400 text-xs text-center max-w-xs">
              <b className="text-red-400">Mala función hash:</b> muchos objetos
              diferentes caen en las mismas posiciones.
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <img
              src={definicion_hash_2}
              alt="Tabla hash pequeña con colisiones"
              className="rounded-xl border-2 border-red-500 shadow-lg w-full max-w-md h-auto bg-white"
            />
            <span className="text-gray-400 text-xs text-center max-w-xs">
              <b className="text-cyan-300">Tabla muy pequeña:</b> incluso con
              buena función hash, las colisiones aumentan.
            </span>
          </div>
        </div>
      </section>

      {/* COLISIONES Y HASHING ENLAZADO */}
      <section className="mb-10 text-[15px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold mb-3 text-white border-l-4 border-red-500 pl-3">
          Colisiones y hashing enlazado
        </h2>

        <p>
          Una <b className="text-red-400">colisión</b> ocurre cuando dos claves
          generan el mismo índice. Las tablas hash no las pueden evitar por
          completo, pero sí gestionarlas eficientemente.
        </p>

        <div className="mt-4 bg-[#17181c] border-l-4 border-cyan-400 rounded-xl p-4 shadow space-y-3">
          <p>
            En el <b className="text-cyan-300">hashing enlazado</b>, cada
            posición de la tabla contiene una{" "}
            <b>lista enlazada de elementos</b> con el mismo hash:
          </p>
          <ul className="ml-4 space-y-1">
            <li>• El slot guarda un puntero a la lista, no el elemento solo.</li>
            <li>• Elementos que colisionan se añaden al final de esa lista.</li>
            <li>
              • Para insertar/buscar/eliminar: se calcula el índice y se opera
              solo en la lista enlazada asociada.
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={definicion_hash_3}
            alt="Hashing enlazado"
            className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-2xl h-auto bg-white"
          />
          <span className="text-cyan-300 text-xs text-center max-w-lg">
            Cada casilla de la tabla apunta a una lista enlazada con todos los
            elementos que comparten ese índice.
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={definicion_hash_4}
            alt="Colisiones en tabla hash"
            className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-3xl h-auto bg-white"
          />
          <span className="text-cyan-300 text-xs text-center max-w-lg">
            Las colisiones no se pierden: se encadenan en la lista asociada al
            slot.
          </span>
        </div>
      </section>

      {/* FACTOR DE CARGA */}
      <section className="mb-10 text-[15px] leading-7 text-gray-200">
        <h2 className="text-xl font-bold mb-2 text-white border-l-4 border-red-500 pl-3">
          Factor de carga
        </h2>
        <p>
          El <b className="text-cyan-400">factor de carga</b> mide qué tan llena
          está la tabla:
        </p>
        <p className="text-cyan-200 font-semibold mt-1 mb-2">
          Factor de carga = número de elementos / tamaño de la tabla
        </p>
        <p>
          Un factor de carga <b>bajo</b> implica menos colisiones y operaciones
          más cercanas a <b>O(1)</b>. Si el factor crece demasiado, suele
          realizarse un <i>rehashing</i>: se crea una tabla más grande y se
          redistribuyen las claves.
        </p>

        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={definicion_hash_5}
            alt="Factor de carga y colisiones"
            className="rounded-xl border-2 border-cyan-400 shadow-lg w-full max-w-3xl h-auto bg-white"
          />
          <span className="text-cyan-300 text-xs text-center max-w-lg">
            A mayor factor de carga, mayor probabilidad de colisiones y menor
            rendimiento.
          </span>
        </div>
      </section>

      {/* HASHING ABIERTO VS CERRADO */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4 text-white border-l-4 border-red-500 pl-3">
          Hashing abierto vs cerrado
        </h2>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* ABIERTO */}
          <div className="flex-1 bg-gradient-to-b from-[#151516]/80 to-[#19191b]/90 border-2 border-red-500 rounded-2xl p-4 shadow-lg hover:scale-[1.02] transition-transform duration-200">
            <h3 className="text-lg font-bold text-red-400 mb-2 text-center">
              Hashing abierto (encadenado)
            </h3>
            <p className="text-gray-200 mb-3 text-[14px] text-center">
              Cada casilla de la tabla almacena una lista enlazada con todos los
              elementos que comparten ese índice.
            </p>
            <img
              src={definicion_hash_6}
              alt="Hashing abierto"
              className="rounded-xl border border-red-400 mx-auto my-2 max-w-full bg-white"
              style={{ maxHeight: 220, objectFit: "contain" }}
            />
            <p className="text-[12px] text-gray-400 text-center mt-2">
              Muy flexible y fácil de redimensionar la tabla.
            </p>
          </div>

          {/* Separador */}
          <div className="hidden md:flex flex-col justify-center items-center h-full">
            <span className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-red-400 bg-black shadow-lg">
              VS
            </span>
          </div>

          {/* CERRADO */}
          <div className="flex-1 bg-gradient-to-b from-[#151516]/80 to-[#19191b]/90 border-2 border-red-500 rounded-2xl p-4 shadow-lg hover:scale-[1.02] transition-transform duration-200">
            <h3 className="text-lg font-bold text-red-400 mb-2 text-center">
              Hashing cerrado (direccionamiento abierto)
            </h3>
            <p className="text-gray-200 mb-3 text-[14px] text-center">
              Los elementos se almacenan directamente en el arreglo. Si hay
              colisión, se busca otra posición libre (exploración lineal,
              cuadrática, doble hash, etc.).
            </p>
            <img
              src={definicion_hash_7}
              alt="Hashing cerrado"
              className="rounded-xl border border-red-400 mx-auto my-2 max-w-full bg-white"
              style={{ maxHeight: 220, objectFit: "contain" }}
            />
            <p className="text-[12px] text-gray-400 text-center mt-2">
              Ahorra memoria extra, pero el manejo de colisiones es más delicado.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
