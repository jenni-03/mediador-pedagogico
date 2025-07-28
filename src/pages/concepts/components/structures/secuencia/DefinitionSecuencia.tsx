import img1 from "../../../../../assets/images/definicion_secuencia_1.jpg";
import img2 from "../../../../../assets/images/definicion_secuencia_2.jpg";

export function DefinitionSecuencia() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Secuencia
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una <b className="text-red-400">Secuencia</b> es una estructura de
            datos lineal <b>estática</b> que no puede cambiar su tamaño una vez
            definida. No es adecuada para problemas que requieran crecimiento
            dinámico durante la ejecución.
          </p>
          <p className="mt-3">
            Representa una lista contigua de datos del mismo tipo, accesibles
            mediante <b>índices</b>, equivalente a un{" "}
            <span className="text-cyan-300">vector en Java</span>.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura secuencia"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="mt-8 space-y-4">
        <h3 className="text-xl font-bold text-red-500 mb-1">Características</h3>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Los elementos se almacenan de forma <b>consecutiva</b> en memoria,
            lo que permite un acceso rápido por índice sin recorrer toda la
            estructura.
          </p>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Contiene{" "}
              <b>elementos</b> (valores) y <b>índices</b> (posiciones de
              acceso).
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> El primer elemento
              siempre tiene índice{" "}
              <code className="bg-black/50 px-1 rounded">0</code>.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Si tiene{" "}
              <code className="bg-black/50 px-1 rounded">n</code> elementos, el
              último se referencia con índice{" "}
              <code className="bg-black/50 px-1 rounded">n-1</code>.
            </li>
          </ul>
          <p className="mt-2">
            Puede ser <span className="text-yellow-400">Unidimensional</span>,{" "}
            <span className="text-yellow-400">Bidimensional</span> o{" "}
            <span className="text-yellow-400">Multidimensional</span>.
          </p>
        </div>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            <span className="font-semibold text-white">SEED</span> trabaja
            principalmente con secuencias <b>unidimensionales</b>, base para
            construir estructuras más complejas si se requiere.
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <img
            src={img2}
            alt="características secuencia"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-cyan-400 shadow"
          />
        </div>
      </section>

      {/* Secuencia unidimensional */}
      <section className="mt-10 space-y-4">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Secuencia Unidimensional
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p>Es un conjunto de elementos del mismo tipo dispuestos en línea.</p>
          {[
            "Declaración: Tipo nombre_Secuencia[Tamaño];",
            "Tipo: Define el tipo de los datos contenidos en el vector.",
            "Tamaño: Número máximo de elementos que puede contener. Este valor es fijo y no puede modificarse durante la ejecución.",
          ].map((texto, index) => {
            const partes = texto.split(":");
            return (
              <p key={index} className="text-sm">
                <span className="font-bold text-white">{partes[0]}:</span>{" "}
                {partes.slice(1).join(":")}
              </p>
            );
          })}
        </div>
      </section>
    </div>
  );
}
