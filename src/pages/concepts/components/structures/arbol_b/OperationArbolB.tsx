import img1 from "../../../../../assets/images/definicion_arbolB_3.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB_4.jpg";
import img3 from "../../../../../assets/images/definicion_arbolB_5.jpg";
import img4 from "../../../../../assets/images/definicion_arbolB_6.jpg";
import img5 from "../../../../../assets/images/definicion_arbolB_7.jpg";
import img6 from "../../../../../assets/images/definicion_arbolB_8.jpg";
import img7 from "../../../../../assets/images/definicion_arbolB_9.jpg";
import img8 from "../../../../../assets/images/definicion_arbolB_10.jpg";
import img9 from "../../../../../assets/images/definicion_arbolB_11.jpg";

export function OperationArbolB() {
  return (
    <div className="text-white py-8 px-4 sm:px-10 max-w-5xl mx-auto">
      {/* TÍTULO PRINCIPAL */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide">Operaciones</h1>
      </div>
      <span className="text-base text-red-400 ml-1 mb-6 block font-medium">
        Árbol B · Operaciones básicas
      </span>

      {/* SECCIÓN: BÚSQUEDA */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-3">Búsqueda</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md">
          <p className="mb-4">
            Localizar una clave en un Árbol B es un proceso eficiente. Se
            comienza en la raíz, comparando la clave con los valores del nodo:
          </p>
          <ul className="list-decimal list-inside space-y-2 marker:text-red-400">
            <li>Seleccionar como nodo actual la raíz del árbol.</li>
            <li>
              Comprobar si la clave está en el nodo:
              <ul className="list-disc list-inside pl-4 mt-1 marker:text-red-500">
                <li>Si está → Fin.</li>
                <li>
                  Si no está:
                  <ul className="list-disc list-inside pl-4 mt-1 marker:text-red-500">
                    <li>Si es hoja → La clave no se encuentra.</li>
                    <li>
                      Si no es hoja → Seguir el puntero correspondiente y
                      repetir desde el paso 2.
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>

      {/* SECCIÓN: INSERCIÓN */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-3">Insertar</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md">
          <ul className="list-decimal list-inside space-y-3 marker:text-red-400">
            <li>
              Se realiza una búsqueda para determinar en qué página debería
              insertarse la nueva clave.
            </li>
            <li>Si hay espacio, se inserta en orden.</li>
            <li>
              Si no hay espacio, se divide el nodo:
              <ul className="list-disc list-inside pl-4 mt-1 marker:text-red-500">
                <li>Seleccionar el valor medio (pivote).</li>
                <li>
                  Crear dos nodos: uno con los valores menores y otro con los
                  mayores.
                </li>
                <li>Promocionar el valor medio al nodo padre.</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* IMÁGENES: PROCESO VISUAL DE INSERCIÓN */}
        <div className="mt-8 space-y-6">
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Se insertan inicialmente: <b>30, 60, 45, 8</b>
            </p>
            <img
              src={img1}
              alt="Inserción base"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Al insertar <b>22</b> se produce desbordamiento:
            </p>
            <img
              src={img2}
              alt="Desborde 22"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Luego de insertar <b>35, 4, 28, 52</b> ocurre nuevo desbordamiento
              con <b>33</b>:
            </p>
            <img
              src={img3}
              alt="Desborde 33"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Se inserta <b>13</b> y se vuelve a dividir:
            </p>
            <img
              src={img4}
              alt="Desborde 13"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              Al insertar <b>43</b> también hay desbordamiento:
            </p>
            <img
              src={img5}
              alt="Desborde 43"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              El nodo vuelve a desbordarse al insertar <b>15</b>:
            </p>
            <img
              src={img6}
              alt="Desborde 15"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
          <div>
            <p className="mb-2 text-gray-300 text-[15.5px]">
              El árbol queda así finalmente:
            </p>
            <img
              src={img7}
              alt="Árbol final"
              className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN: ELIMINAR */}
      <section className="mb-14">
        <h2 className="text-xl font-bold text-red-500 mb-3">Eliminar</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-5 text-[15.5px] text-gray-200 leading-7 shadow-md">
          <p className="mb-4">
            La eliminación en un árbol B puede requerir ajustes estructurales.
            Si la clave está en un nodo hoja, se elimina directamente. Si está
            en nodo interno, se sustituye por su sucesor inmediato y se elimina
            en la hoja.
          </p>
          <p className="mb-4">
            Si al eliminar una clave un nodo queda por debajo del número mínimo
            de claves, hay dos opciones:
          </p>
          <ul className="list-disc list-inside space-y-2 marker:text-red-500">
            <li>
              <b>Redistribución:</b> se toma una clave prestada de un hermano
              adyacente.
            </li>
            <li>
              <b>Unión:</b> si la redistribución no es posible, se unen dos
              nodos y se ajusta el padre.
            </li>
          </ul>
          <p className="mt-4">Pasos generales:</p>
          <ol className="list-decimal list-inside space-y-2 marker:text-red-400 mt-2">
            <li>Localizar la clave.</li>
            <li>Si no está en hoja, sustituirla por su sucesor.</li>
            <li>Eliminar la clave en la hoja.</li>
            <li>Verificar si el nodo cumple con el mínimo.</li>
            <li>
              Si no lo cumple, redistribuir o unir, y repetir si es necesario en
              el padre.
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-6 mt-8">
          <img
            src={img8}
            alt="Eliminación con redistribución"
            className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
          />
          <img
            src={img9}
            alt="Eliminación con unión"
            className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
          />
        </div>
      </section>
    </div>
  );
}
