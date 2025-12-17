import img1 from "../../../../../assets/images/definicion_arbolB2_1.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB2_2.jpg";

export function DefinitionArbolB2() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol B+
        </h1>
      </div>
      <span className="text-base text-red-500 ml-1 mb-6 block font-medium">
        Árbol ene-ario optimizado para búsquedas
      </span>

      {/* Descripción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Descripción</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <p className="mb-4">
            Un <b>árbol B+</b> es una variante del <b>árbol B</b> diseñada para
            combinar dos cosas: <b>acceso directo</b> eficiente por clave y{" "}
            <b>recorridos secuenciales</b> rápidos sobre los registros. Es una
            estructura propuesta por <b>Knuth</b> y ampliamente utilizada en
            sistemas de archivos y bases de datos.
          </p>
          <p className="mb-4">
            En un árbol B+ los <b>datos reales</b> (registros) se almacenan
            únicamente en los <b>nodos hoja</b>. Los nodos internos y la raíz
            forman un <b>índice multinivel</b> que guía la búsqueda hasta el
            bloque de hoja correcto.
          </p>
          <p>
            Todas las <b>claves</b> aparecen en las hojas y las hojas están
            enlazadas entre sí. Esto garantiza caminos de igual longitud desde
            la raíz y permite recorrer los registros en orden de forma muy
            eficiente.
          </p>
        </div>
      </section>

      {/* Resumen visual índice / secuencia */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-cyan-400 mb-2">
          Resumen visual (índice vs secuencia)
        </h2>
        <div className="bg-[#111217] border border-cyan-500/60 rounded-lg p-4 shadow flex flex-col md:flex-row gap-4 text-[15.5px]">
          {/* Índice */}
          <div className="flex-1 bg-[#181924] rounded-md p-3 border border-cyan-500/40">
            <h3 className="font-semibold text-cyan-300 mb-2">
              Conjunto índice
            </h3>
            <p className="text-gray-100 mb-2">
              Es un <b>árbol B</b> formado por la raíz y los nodos internos:
            </p>
            <ul className="list-disc list-inside text-gray-100 space-y-1">
              <li>Solo almacena claves de búsqueda e índices.</li>
              <li>No guarda registros completos, solo “apunta” a las hojas.</li>
              <li>Guía la búsqueda en tiempo O(log n).</li>
            </ul>
          </div>

          {/* Secuencia */}
          <div className="flex-1 bg-[#181924] rounded-md p-3 border border-cyan-500/40">
            <h3 className="font-semibold text-cyan-300 mb-2">
              Conjunto secuencia
            </h3>
            <p className="text-gray-100 mb-2">
              Es una <b>lista enlazada</b> de nodos hoja:
            </p>
            <ul className="list-disc list-inside text-gray-100 space-y-1">
              <li>Las hojas almacenan todos los <b>registros reales</b>.</li>
              <li>
                Están enlazadas (normalmente doblemente) para recorrer los
                datos en orden.
              </li>
              <li>
                Ideal para <b>lecturas secuenciales</b> de rangos de claves.
              </li>
            </ul>
            <p className="text-gray-300 mt-2 text-sm">
              Intuición: el índice te lleva hasta la página adecuada y la
              secuencia te permite seguir leyendo hacia la derecha.
            </p>
          </div>
        </div>
      </section>

      {/* Propiedades */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Propiedades</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <ul className="list-disc list-inside space-y-3">
            <li>
              Se distinguen dos conjuntos: <b>índice</b> (árbol B) y{" "}
              <b>secuencia</b> (bloques de datos hoja enlazados).
            </li>
            <li>
              Solo las <b>hojas</b> almacenan <b>registros</b>; los nodos
              internos contienen únicamente claves e índices.
            </li>
            <li>
              Todas las <b>hojas</b> están al mismo nivel, de modo que la altura
              del árbol es <b>O(log n)</b>.
            </li>
            <li>
              Es ideal para <b>sistemas de archivos</b> y <b>bases de datos</b>{" "}
              con acceso secuencial y por rango.
            </li>
            <li>
              Algunas claves pueden aparecer repetidas en diferentes nodos para
              mantener el <b>orden lógico</b> de los registros y facilitar los
              recorridos.
            </li>
          </ul>
        </div>
      </section>

      {/* Definición Formal */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Definición formal
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7">
          <p className="mb-3 text-gray-100">
            Un árbol B+ se define a partir de un entero <b>n ≥ 2</b>, que
            controla el número mínimo y máximo de claves por página
            (generalmente llamada <b>orden</b> del árbol). Con ese parámetro:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Cada página interna (excepto la raíz) contiene entre{" "}
              <b>n y 2n claves</b>.
            </li>
            <li>
              Cada página interna (excepto la raíz) tiene entre{" "}
              <b>n + 1 y 2n + 1 descendientes</b>.
            </li>
            <li>
              La raíz tiene al menos <b>dos descendientes</b> si no es una hoja,
              y a lo sumo <b>2n + 1</b>.
            </li>
            <li>
              Todas las <b>hojas</b> se encuentran en el mismo nivel.
            </li>
            <li>
              Las <b>claves de búsqueda</b> se almacenan íntegramente en las
              hojas, que contienen los registros o punteros a registros.
            </li>
            <li>
              Las <b>claves en los nodos internos</b> actúan como{" "}
              <b>separadores</b> o <b>índices</b>: guían la búsqueda hacia el
              hijo que contiene el rango de claves adecuado.
            </li>
          </ol>
        </div>
      </section>

      {/* Estructura */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Estructura</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p className="mb-3">
            El árbol B+ puede imaginarse como dos niveles lógicos:
          </p>
          <p className="mb-2">
            <b>Conjunto secuencia:</b> contiene los bloques de registros de
            datos enlazados doblemente. Cada bloque representa una página hoja
            con sus claves y registros.
          </p>
          <p>
            <b>Conjunto índice:</b> es un árbol B que direcciona hacia los
            bloques de datos del conjunto secuencia. Sus claves resumen los
            rangos de valores almacenados en las hojas.
          </p>
        </div>
        <img
          src={img1}
          alt="Estructura general del árbol B+ (índice y secuencia)"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Ejemplo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Ejemplo</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            En la figura se muestra un árbol B+ de <b>orden 4</b>. El conjunto{" "}
            índice (en celeste) tiene tres niveles y el conjunto secuencia (en
            magenta) contiene los registros enlazados secuencialmente. Una
            búsqueda desciende por el índice y, una vez en la hoja adecuada, se
            puede seguir recorriendo los registros hacia la derecha.
          </p>
        </div>
        <img
          src={img2}
          alt="Ejemplo de árbol B+ con índice y hojas enlazadas"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>
    </div>
  );
}
