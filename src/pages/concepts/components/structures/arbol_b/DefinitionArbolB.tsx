import img1 from "../../../../../assets/images/definicion_arbolB_1.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB_2.jpg";

export function DefinitionArbolB() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol B
        </h1>
      </div>
      <span className="text-base text-red-400 ml-1 mb-4 block font-medium">
        Árbol eneario de búsqueda balanceado
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* INTRODUCCIÓN */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Introducción</h2>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-stretch">
          {/* Contexto histórico */}
          <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow">
            <p className="mb-4">
              Los <b>B-árboles</b> surgieron en 1972 creados por R. Bayer y
              E. McCreight. El problema original comienza con la necesidad de
              mantener índices en almacenamiento externo para acceso a bases de
              datos. Con dispositivos de acceso lento, se aprovecha su gran
              capacidad para almacenar mucha información organizada, de forma
              que el acceso a una clave sea lo más rápido posible.
            </p>
            <p className="mb-4">
              Los árboles con múltiples hijos permiten que el mantenimiento de
              índices en memoria externa sea más eficiente, por eso este tipo de
              árboles ha sido ampliamente utilizado en sistemas de bases de
              datos. Aunque están pensados para almacenamiento externo, también
              pueden implementarse en memoria principal.
            </p>
            <p className="mb-4">
              Los árboles B constituyen una categoría importante de estructuras
              de datos, útiles para conjuntos, diccionarios y operaciones de
              acceso secuencial. Existen variantes como <b>B+</b> y{" "}
              <b>B*</b>, pero todas comparten la idea de árboles balanceados de
              búsqueda no binaria.
            </p>
            <p>
              El Árbol B fue creado para mantener estructuras de datos que
              cambian con el tiempo, manteniendo la <b>profundidad</b> lo más
              pequeña posible y permitiendo que las operaciones de modificación
              sean eficientes. Es posible mantener en memoria solo la parte
              usada, dejando el resto en disco.
            </p>
          </div>

          {/* Caja resumen rápida */}
          <div className="bg-[#141418] rounded-md border border-red-500/60 p-4 shadow flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-red-400 mb-2">
              Idea clave del Árbol B
            </h3>
            <ul className="text-[14px] text-gray-100 space-y-2">
              <li>
                • Cada nodo (página) guarda <b>varias claves</b> y{" "}
                <b>varios punteros</b>.
              </li>
              <li>• El árbol tiene poca altura incluso con muchos datos.</li>
              <li>
                • Pensado para estructuras grandes almacenadas en{" "}
                <b>disco</b> (bases de datos, sistemas de archivos).
              </li>
              <li>• Todas las hojas están a la misma profundidad.</li>
            </ul>
            <div className="mt-4 text-[12px] text-gray-400 border-t border-red-500/30 pt-3">
              Resumen: muchos valores por página → menos niveles → menos accesos
              a disco.
            </div>
          </div>
        </div>
      </section>

      {/* DEFINICIÓN GENERAL */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Definición</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow mb-6">
          <p className="mb-4">
            Un <b>Árbol B</b> es un árbol de búsqueda balanceado en el que cada
            nodo, llamado <b>página</b>, puede contener múltiples claves y
            punteros. No se limita a dos hijos como un árbol binario, lo cual
            permite mantener una menor altura incluso con grandes cantidades de
            datos.
          </p>
          <p>
            Las <b>claves</b> dividen los rangos de valores, y los{" "}
            <b>punteros</b> se usan para enlazar con otras páginas. Las
            operaciones de búsqueda, inserción y eliminación se mantienen
            eficientes, y todas las hojas se encuentran al mismo nivel del
            árbol, lo que garantiza balance.
          </p>
        </div>

        {/* Mini glosario visual */}
        <div className="bg-[#141418] rounded-xl border border-red-500/70 p-4 mb-6 shadow">
          <h3 className="text-sm font-semibold text-red-400 mb-3">
            Glosario rápido
          </h3>
          <div className="grid gap-3 sm:grid-cols-3 text-[13px] text-gray-100">
            <div className="bg-[#1f1f23] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-center mb-1">Página</p>
              <p>Bloque del árbol que contiene varias claves y punteros.</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-center mb-1">Clave</p>
              <p>Valor usado para decidir por qué subárbol continuar.</p>
            </div>
            <div className="bg-[#1f1f23] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-center mb-1">Puntero</p>
              <p>Dirección a otra página donde continúa el rango de datos.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={img1}
            alt="Esquema básico de página y punteros en un árbol B"
            className="rounded-xl border-2 border-red-500 shadow bg-white max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* ESTRUCTURA DE UNA PÁGINA */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Estructura de una Página
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow mb-6">
          <p className="mb-4">
            Cada página interna del árbol actúa como un nodo que contiene{" "}
            <b>claves separadoras</b> y <b>punteros</b> a subárboles. Si una
            página tiene 3 claves, tendrá exactamente 4 punteros. Estas claves
            permiten decidir por dónde seguir el recorrido al buscar un valor.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="font-semibold text-red-400 mb-1">
                Puntero Página &lt; Dato
              </p>
              <p className="text-sm text-gray-200">
                Enlaza a una página donde todos los valores son{" "}
                <b>menores</b> que esa clave.
              </p>
            </div>
            <div>
              <p className="font-semibold text-red-400 mb-1">Dato</p>
              <p className="text-sm text-gray-200">
                Es la <b>clave</b> almacenada en la página que separa rangos de
                valores.
              </p>
            </div>
            <div>
              <p className="font-semibold text-red-400 mb-1">
                Puntero Página &gt; Dato
              </p>
              <p className="text-sm text-gray-200">
                Apunta a una página con valores <b>mayores</b>. Si no existe
                puntero, se considera <b>NULL</b>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src={img2}
            alt="Estructura de una página de un árbol B con claves y punteros"
            className="rounded-xl border-2 border-red-500 shadow bg-white max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* PROPIEDADES DEL ÁRBOL B */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Propiedades del Árbol B
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow">
          <p className="mb-4">
            Un Árbol B de orden <i>n</i> cumple con las siguientes propiedades:
          </p>
          <ul className="list-disc list-inside marker:text-red-500 space-y-2">
            <li>
              Cada página contiene como máximo <b>2n claves</b>.
            </li>
            <li>
              Cada página (salvo la raíz) contiene al menos <b>n claves</b>.
            </li>
            <li>
              Si una página tiene <b>m claves</b>, tendrá <b>m + 1 punteros</b>{" "}
              a hijos.
            </li>
            <li>
              Todas las páginas hoja se encuentran al <b>mismo nivel</b> del
              árbol.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
