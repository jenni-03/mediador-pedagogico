import img1 from "../../../../../assets/images/definicion_arbolB2_1.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB2_2.jpg";

export function DefinitionArbolB2() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide">Árbol B+</h1>
      </div>
      <span className="text-base text-red-500 ml-1 mb-6 block font-medium">
        Árbol Eneario optimizado para búsquedas
      </span>

      {/* Descripción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Descripción</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <p className="mb-4">
            Una variante de los <b>árboles B</b> que permite realizar de forma
            eficiente tanto el acceso directo mediante clave como el
            procesamiento en secuencia ordenada de los registros, es la
            estructura de <b>árbol B+</b> (propuesta por Knuth).
          </p>
          <p className="mb-4">
            Los árboles B+ almacenan los datos únicamente en sus{" "}
            <b>nodos hoja</b>, mientras que los nodos internos y la raíz
            conforman un <b>índice multinivel</b> que direcciona hacia los
            bloques con los registros reales.
          </p>
          <p>
            Todas las <b>claves</b> se encuentran en las hojas, lo cual
            garantiza caminos de igual longitud desde la raíz y mejora el
            rendimiento en búsquedas y recorridos secuenciales.
          </p>
        </div>
      </section>

      {/* Propiedades */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">Propiedades</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <ul className="list-disc list-inside space-y-3">
            <li>
              Contiene dos conjuntos: índice (árbol B) y secuencia (bloques de
              datos enlazados).
            </li>
            <li>
              Solo las hojas almacenan registros; los nodos internos contienen
              claves e índices.
            </li>
            <li>
              Ideal para sistemas de archivos y bases de datos con acceso
              secuencial eficiente.
            </li>
            <li>Todas las hojas están al mismo nivel.</li>
            <li>
              Las claves pueden repetirse para mantener el orden lógico de los
              registros.
            </li>
          </ul>
        </div>
      </section>

      {/* Definición Formal */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Definición Formal
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Cada página (excepto la raíz) contiene entre n y 2n elementos.
            </li>
            <li>
              Cada página (excepto la raíz) tiene entre n + 1 y 2n + 1
              descendientes.
            </li>
            <li>La raíz tiene al menos dos descendientes.</li>
            <li>Todas las hojas están al mismo nivel.</li>
            <li>Las claves se almacenan únicamente en las hojas.</li>
            <li>Las claves en nodos internos actúan como índices.</li>
          </ol>
        </div>
      </section>

      {/* Estructura */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">Estructura</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p className="mb-3">
            <b>Conjunto secuencia:</b> contiene los bloques de registros de
            datos enlazados doblemente.
          </p>
          <p>
            <b>Conjunto índice:</b> es un árbol B que direcciona hacia los
            bloques de datos del conjunto secuencia.
          </p>
        </div>
        <img
          src={img1}
          alt="Estructura del árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Ejemplo */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-red-500 mb-4">Ejemplo</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            En este ejemplo se muestra un árbol B+ de orden 4, donde el conjunto
            índice (en celeste) tiene tres niveles y el conjunto secuencia (en
            magenta) contiene los registros enlazados secuencialmente.
          </p>
        </div>
        <img
          src={img2}
          alt="Ejemplo árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>
    </div>
  );
}
