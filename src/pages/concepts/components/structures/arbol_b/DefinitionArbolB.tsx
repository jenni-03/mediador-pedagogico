import img1 from "../../../../../assets/images/definicion_arbolB_1.jpg"; 
import img2 from "../../../../../assets/images/definicion_arbolB_2.jpg";

export function DefinitionArbolB() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide">Árbol B</h1>
      </div>
      <span className="text-base text-red-400 ml-1 mb-6 block font-medium">
        Árbol eneario de búsqueda balanceado
      </span>

      {/* INTRODUCCIÓN */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Introducción</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow">
          <p className="mb-4">
            Los B-árboles surgieron en 1972 creados por R. Bayer y E. McCreight.
            El problema original comienza con la necesidad de mantener índices
            en almacenamiento externo para acceso a bases de datos. Es decir,
            con el grave problema de la lentitud de estos dispositivos se
            pretende aprovechar su gran capacidad para mantener mucha
            información organizada, de forma que el acceso a una clave sea lo
            más rápido posible.
          </p>
          <p className="mb-4">
            Los árboles con múltiples hijos hacen que el mantenimiento de
            índices en memoria externa sea más eficiente, y por eso este tipo de
            árboles ha sido ampliamente utilizado en sistemas de bases de datos.
            Aunque están pensados para almacenamiento externo, también pueden
            implementarse en memoria principal.
          </p>
          <p className="mb-4">
            Los árboles B constituyen una categoría importante de estructuras de
            datos, útiles para conjuntos, diccionarios y operaciones de acceso
            secuencial. Existen variantes como B+, B*, pero todas comparten la
            idea de árboles balanceados de búsqueda no binaria.
          </p>
          <p>
            El árbol B fue creado para mantener estructuras de datos que cambian
            con el tiempo. Se busca que la profundidad del árbol sea la menor
            posible y que la modificación del contenido no sea costosa. También
            se permite mantener en memoria solo la parte usada, dejando el resto
            en disco.
          </p>
        </div>
      </section>

      {/* DEFINICIÓN */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Definición</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 text-[15.5px] text-gray-200 leading-7 shadow">
          <p className="mb-4">
            Un <b>Árbol B</b> es un árbol de búsqueda balanceado en el que cada
            nodo, llamado <b>página</b>, puede contener múltiples claves y
            punteros. No se limita a dos hijos como un árbol binario, lo cual
            permite mantener una menor altura incluso con grandes cantidades de
            datos.
          </p>
          <p>
            Las claves dividen los rangos de valores, y los punteros se usan
            para enlazar con otras páginas. Las operaciones de búsqueda,
            inserción y eliminación se mantienen eficientes, y todas las hojas
            se encuentran al mismo nivel del árbol, lo que garantiza balance.
          </p>
        </div>

        <div className="flex justify-center mt-6">
          <img
            src={img1}
            alt="Diagrama introductorio árbol B"
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
            Cada página interna del árbol actúa como un nodo que contiene claves
            separadoras y punteros a subárboles. Por ejemplo, una página con 3
            claves tendrá 4 punteros. Estas claves permiten decidir por dónde
            seguir el recorrido al buscar un valor.
          </p>
          <ul className="list-disc list-inside marker:text-red-500 space-y-2">
            <li>
              <b>Puntero Página &lt; Dato:</b> enlaza a una página con valores
              menores al dato.
            </li>
            <li>
              <b>Dato:</b> es la clave o valor almacenado.
            </li>
            <li>
              <b>Puntero Página &gt; Dato:</b> apunta a una página con valores
              mayores. Si no hay, se considera NULL.
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <img
            src={img2}
            alt="Estructura de una página con punteros"
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
