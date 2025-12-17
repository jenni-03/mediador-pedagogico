import img1 from "../../../../../assets/images/definicion_arbolB_3.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB_4.jpg";
import img3 from "../../../../../assets/images/definicion_arbolB_5.jpg";
import img4 from "../../../../../assets/images/definicion_arbolB_6.jpg";
import img5 from "../../../../../assets/images/definicion_arbolB_7.jpg";
import img6 from "../../../../../assets/images/definicion_arbolB_8.jpg";
import img7 from "../../../../../assets/images/definicion_arbolB_9.jpg";
import img8 from "../../../../../assets/images/definicion_arbolB_10.jpg";
import img9 from "../../../../../assets/images/definicion_arbolB_11.jpg";

const INSERT_IMAGES = [
  {
    src: img1,
    caption: "Partimos insertando 30, 60, 45 y 8 en el árbol.",
  },
  {
    src: img2,
    caption: "Al insertar 22 se produce el primer desbordamiento (split).",
  },
  {
    src: img3,
    caption:
      "Tras insertar 35, 4, 28 y 52, el nodo vuelve a desbordarse al insertar 33.",
  },
  {
    src: img4,
    caption: "Se inserta 13 y se provoca una nueva división de página.",
  },
  {
    src: img5,
    caption: "La inserción de 43 genera otro desbordamiento.",
  },
  {
    src: img6,
    caption: "Con 15 se produce el último desbordamiento en la secuencia.",
  },
  {
    src: img7,
    caption: "Estructura final del Árbol B tras todas las inserciones.",
  },
];

export function OperationArbolB() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* TÍTULO PRINCIPAL */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol B
        </h1>
      </div>
      <span className="text-base text-red-400 ml-1 mb-3 block font-medium">
        Búsqueda · Inserción · Eliminación
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* RESUMEN RÁPIDO */}
      <section className="mb-10">
        <div className="bg-[#141418] rounded-xl border border-red-500/60 p-4 grid gap-3 sm:grid-cols-3 text-[13px] text-gray-100 shadow">
          <div className="bg-[#1f1f23] rounded-lg p-3">
            <p className="font-semibold text-red-400 mb-1 text-sm">Búsqueda</p>
            <p>
              Se recorre desde la raíz, comparando con las claves de la página y
              siguiendo el puntero adecuado. Costo típico:{" "}
              <b>O(log n)</b>.
            </p>
          </div>
          <div className="bg-[#1f1f23] rounded-lg p-3">
            <p className="font-semibold text-red-400 mb-1 text-sm">Inserción</p>
            <p>
              Se inserta en la hoja correcta. Si una página se llena, se
              divide (<i>split</i>) y la clave media sube al padre.
            </p>
          </div>
          <div className="bg-[#1f1f23] rounded-lg p-3">
            <p className="font-semibold text-red-400 mb-1 text-sm">
              Eliminación
            </p>
            <p>
              Se borra la clave y, si una página queda con pocas claves, se
              arregla con <b>redistribución</b> o <b>unión</b>.
            </p>
          </div>
        </div>
      </section>

      {/* BÚSQUEDA */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-3">Búsqueda</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md">
          <p className="mb-4">
            Localizar una clave en un Árbol B es muy parecido a buscar en un
            índice de un libro: se va “saltando” entre páginas gracias a las
            claves ordenadas.
          </p>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
            <div>
              <p className="font-semibold text-red-400 mb-2">
                Algoritmo paso a paso:
              </p>
              <ol className="list-decimal list-inside space-y-2 marker:text-red-400">
                <li>Seleccionar como nodo actual la raíz del árbol.</li>
                <li>
                  Buscar la clave dentro de la página (búsqueda secuencial o
                  binaria).
                  <ul className="list-disc list-inside pl-5 mt-1 marker:text-red-500 space-y-1 text-[14px]">
                    <li>Si la clave está → fin de la búsqueda (éxito).</li>
                    <li>
                      Si no está y la página es hoja → la clave no se encuentra.
                    </li>
                    <li>
                      Si no está y la página es interna → seguir el puntero
                      correspondiente y repetir el proceso.
                    </li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="bg-[#141418] rounded-lg border border-red-500/60 p-3 text-[13px]">
              <p className="font-semibold text-red-400 mb-1">
                ¿Por qué es eficiente?
              </p>
              <p className="mb-1">
                Cada página almacena muchas claves, por lo que se necesitan{" "}
                <b>pocos niveles</b> para cubrir un conjunto grande de datos.
              </p>
              <p>
                Esto hace que el número de accesos a disco sea pequeño y el
                costo de búsqueda sea <b>O(log n)</b>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INSERCIÓN */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-3">Inserción</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md mb-8">
          <p className="mb-3">
            Para insertar una nueva clave se sigue el camino de búsqueda hasta
            la hoja donde debería quedar.
          </p>
          <ol className="list-decimal list-inside space-y-3 marker:text-red-400">
            <li>
              <b>Buscar la hoja destino.</b> Se recorre el árbol como en la
              búsqueda hasta llegar a la página donde debe ir la nueva clave.
            </li>
            <li>
              <b>Caso 1 · La página tiene espacio.</b> Se inserta la clave en
              orden dentro de la página. No se modifica la estructura del árbol.
            </li>
            <li>
              <b>Caso 2 · La página está llena (desbordamiento).</b>
              <ul className="list-disc list-inside pl-5 mt-1 marker:text-red-500 space-y-1 text-[14px]">
                <li>Se añade la nueva clave y se ordenan todas temporalmente.</li>
                <li>
                  Se escoge la <b>clave media</b> como pivote.
                </li>
                <li>
                  Se crean dos páginas: una con las claves menores y otra con
                  las mayores.
                </li>
                <li>
                  El pivote se <b>promociona</b> (sube) al nodo padre.
                </li>
                <li>
                  Si el padre también se llena, el proceso de división (
                  <i>split</i>) se repite hacia arriba. Si llega hasta la raíz,
                  el árbol aumenta su altura en 1.
                </li>
              </ul>
            </li>
          </ol>

          <p className="mt-3 text-sm text-gray-300">
            La inserción en un Árbol B siempre mantiene el árbol balanceado; el
            costo sigue siendo del orden de <b>O(log n)</b>.
          </p>
        </div>

        {/* PROCESO VISUAL DE INSERCIÓN */}
        <div className="space-y-6">
          {INSERT_IMAGES.map((item, index) => (
            <div key={index}>
              <p className="mb-2 text-gray-300 text-[15.5px]">{item.caption}</p>
              <img
                src={item.src}
                alt={item.caption}
                className="rounded-xl border-2 border-red-500 shadow bg-white w-full p-4"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ELIMINACIÓN */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-red-500 mb-3">Eliminación</h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md">
          <p className="mb-3">
            El borrado en un Árbol B es algo más delicado, porque hay que
            mantener siempre el número mínimo de claves por página y el árbol
            balanceado.
          </p>

          <p className="font-semibold text-red-400 mb-2">
            1. Dónde se borra la clave
          </p>
          <ul className="list-disc list-inside space-y-2 marker:text-red-500 mb-4">
            <li>
              <b>Si la clave está en una hoja:</b> se elimina directamente.
            </li>
            <li>
              <b>Si la clave está en una página interna:</b> se reemplaza por su
              <b> sucesor inmediato</b> (o predecesor) y luego se elimina esa
              clave en la hoja correspondiente.
            </li>
          </ul>

          <p className="font-semibold text-red-400 mb-2">
            2. ¿Qué pasa si el nodo queda con pocas claves?
          </p>
          <p className="mb-2">
            Si una página queda por debajo del mínimo permitido, se debe
            reequilibrar. Hay dos técnicas:
          </p>
          <ul className="list-disc list-inside space-y-2 marker:text-red-500 mb-4">
            <li>
              <b>Redistribución:</b> si un hermano adyacente tiene claves de
              sobra, se “presta” una clave. El padre ajusta sus claves para
              mantener el orden.
            </li>
            <li>
              <b>Unión (merge):</b> si los hermanos también están al mínimo, se
              fusionan dos páginas junto con una clave del padre, y el número de
              páginas en ese nivel disminuye.
            </li>
          </ul>

          <p className="font-semibold text-red-400 mb-2">
            3. Resumen del algoritmo
          </p>
          <ol className="list-decimal list-inside space-y-2 marker:text-red-400">
            <li>Localizar la clave a eliminar.</li>
            <li>
              Si está en una página interna, sustituirla por el sucesor (o
              predecesor) y pasar el problema a la hoja.
            </li>
            <li>Eliminar la clave en la hoja.</li>
            <li>Verificar si la página cumple el mínimo de claves.</li>
            <li>
              Si no lo cumple, aplicar redistribución o unión y, si es
              necesario, repetir el ajuste en el padre.
            </li>
          </ol>

          <p className="mt-4 text-sm text-gray-300">
            Al finalizar, el Árbol B sigue cumpliendo todas sus propiedades:
            páginas casi llenas, todas las hojas al mismo nivel y sin claves
            duplicadas.
          </p>
        </div>

        {/* ILUSTRACIONES DE ELIMINACIÓN */}
        <div className="flex flex-col gap-6 mt-8">
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Ejemplo de eliminación con redistribución de claves:
            </p>
            <img
              src={img8}
              alt="Eliminación en Árbol B con redistribución"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full p-4"
            />
          </div>

          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Ejemplo de eliminación con unión (merge) de páginas:
            </p>
            <img
              src={img9}
              alt="Eliminación en Árbol B con unión de páginas"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full p-4"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
