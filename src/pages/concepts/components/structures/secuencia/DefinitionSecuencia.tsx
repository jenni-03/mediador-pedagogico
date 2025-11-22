import img1 from "../../../../../assets/images/definicion_secuencia_1.jpg";
import img2 from "../../../../../assets/images/definicion_secuencia_2.jpg";

export function DefinitionSecuencia() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Secuencia
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* DESCRIPCIÓN */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-red-500 mb-2">Descripción</h2>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] leading-7 text-gray-200">
          <p>
            Una <b className="text-red-400">Secuencia</b> es una estructura de
            datos lineal <b>estática</b>. Esto significa que su tamaño se fija
            al momento de declararla y <b>no puede crecer ni reducirse</b> durante la
            ejecución del programa. Por esta razón no es adecuada cuando los
            datos deben aumentar o disminuir de forma dinámica.
          </p>

          <p className="mt-3">
            Representa una lista <b>contigua</b> de datos del mismo tipo, donde
            cada posición se accede mediante un <b>índice</b>. En la práctica se
            comporta como un{" "}
            <span className="text-cyan-300 font-semibold">vector en Java</span>.
          </p>

          {/* Imagen principal */}
          <div className="my-5 flex justify-center">
            <img
              src={img1}
              alt="Ejemplo visual de una secuencia"
              className="w-full h-auto max-w-md sm:max-w-lg rounded-xl border border-red-600 shadow bg-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-[14px] mt-1">
            <div className="bg-black/20 rounded-lg px-3 py-2">
              <p className="font-semibold text-red-300 mb-1">Lineal</p>
              <p>Los elementos se organizan uno después de otro, en una sola fila.</p>
            </div>
            <div className="bg-black/20 rounded-lg px-3 py-2">
              <p className="font-semibold text-red-300 mb-1">Estática</p>
              <p>El número máximo de casillas se define una vez y permanece fijo.</p>
            </div>
            <div className="bg-black/20 rounded-lg px-3 py-2">
              <p className="font-semibold text-red-300 mb-1">Mismo tipo</p>
              <p>Todos los datos almacenados pertenecen al mismo tipo (int, char, etc.).</p>
            </div>
          </div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-red-500 mb-2">Características</h2>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3 text-[15.5px] text-gray-200">
          <p>
            Los elementos se almacenan de forma <b>consecutiva</b> en memoria, lo
            que permite un acceso muy rápido por índice, en tiempo aproximado{" "}
            <b>O(1)</b>.
          </p>

          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Contiene <b>elementos</b> (valores) y <b>índices</b> (posiciones en la secuencia).
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                El primer elemento siempre tiene índice{" "}
                <code className="bg-black/50 px-1 rounded">0</code>.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Si tiene{" "}
                <code className="bg-black/50 px-1 rounded">n</code> elementos, el
                último se referencia con índice{" "}
                <code className="bg-black/50 px-1 rounded">n - 1</code>.
              </span>
            </li>
          </ul>

          <p className="mt-2">
            Una secuencia puede ser{" "}
            <span className="text-yellow-300 font-semibold">Unidimensional</span>,{" "}
            <span className="text-yellow-300 font-semibold">Bidimensional</span>{" "}
            o <span className="text-yellow-300 font-semibold">Multidimensional</span>.
          </p>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow mt-4 text-[15px] text-gray-200">
          <p>
            <span className="font-semibold text-white">SEED</span> trabaja
            principalmente con secuencias <b>unidimensionales</b>, que sirven
            como base para construir estructuras más complejas cuando sea
            necesario.
          </p>
        </div>

        <div className="flex justify-center mt-5">
          <img
            src={img2}
            alt="Secuencia con índices y elementos"
            className="w-full h-auto max-w-md sm:max-w-lg rounded-xl border border-cyan-400 shadow bg-white"
          />
        </div>
      </section>

      {/* SECUENCIA UNIDIMENSIONAL */}
      <section className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Secuencia Unidimensional
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3 text-[15px] text-gray-200">
          <p>Es un conjunto de elementos del mismo tipo dispuestos en una sola línea.</p>

          <p>
            <span className="font-bold text-white">Declaración:</span>{" "}
            <code className="bg-black/50 px-2 py-1 rounded">
              Tipo nombre_Secuencia[Tamaño];
            </code>
          </p>

          <p>
            <span className="font-bold text-white">Tipo:</span> define la clase de
            datos almacenados (por ejemplo, <code>int</code>, <code>float</code>,{" "}
            <code>char</code>).
          </p>

          <p>
            <span className="font-bold text-white">Tamaño:</span> indica el número
            máximo de elementos que puede contener. Este valor es{" "}
            <b>fijo</b> y no puede modificarse durante la ejecución del programa.
          </p>
        </div>
      </section>
    </div>
  );
}
