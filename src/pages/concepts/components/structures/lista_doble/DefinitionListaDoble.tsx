import img1 from "../../../../../assets/images/definicion_ld_1.jpg";
import img2 from "../../../../../assets/images/definicion_ld_2.jpg";
import img3 from "../../../../../assets/images/definicion_ld_3.jpg";
import img4 from "../../../../../assets/images/definicion_ld_4.jpg";
import img5 from "../../../../../assets/images/definicion_ld_5.jpg";
import img6 from "../../../../../assets/images/definicion_ld_6.jpg";
import img7 from "../../../../../assets/images/definicion_ld_7.jpg";
import img8 from "../../../../../assets/images/definicion_ld_8.jpg";

export function DefinitionListaDoble() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Doblemente Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Dinámica · Recorrido en ambos sentidos
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una <b className="text-red-400">lista doblemente enlazada</b> está
            formada por nodos que guardan un dato y dos enlaces. Gracias a estos
            enlaces, la lista puede recorrerse tanto hacia adelante como hacia
            atrás.
          </p>

          <ul className="pl-4 space-y-1 mt-3">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Un campo <b>Información</b> que almacena el dato.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Un puntero <b>ant</b> que apunta al nodo anterior.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <span>
                Un puntero <b>sig</b> que apunta al nodo siguiente.
              </span>
            </li>
          </ul>

          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="Estructura de un nodo doblemente enlazado"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>

          <p>
            Esto permite recorrer la lista en ambas direcciones, facilitando
            operaciones como insertar o eliminar en cualquier posición sin tener
            que volver siempre al inicio.
          </p>
        </div>

        {/* Vista en memoria */}
        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={img2}
            alt="Cadena de nodos doblemente enlazados"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
          />
          <span className="text-gray-400 text-xs text-center max-w-lg">
            Cada nodo está conectado con su anterior y su siguiente, formando
            una estructura bidireccional.
          </span>
        </div>

        {/* Ventajas */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p>
            Al igual que la lista simple, los nodos no están en posiciones
            contiguas de memoria. Lo que cambia es la forma de enlazarlos.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja clave:</span>{" "}
            mayor flexibilidad al recorrer o modificar la lista desde cualquier
            punto, ya que es posible avanzar y retroceder entre nodos.
          </p>
        </div>
      </section>

      {/* Separador visual */}
      <div className="my-10 w-full flex items-center">
        <div className="h-2 w-full bg-gradient-to-r from-sky-500 via-fuchsia-500 to-red-500 rounded-full opacity-90 shadow-[0_0_18px_3px_rgba(248,113,113,0.6)]" />
      </div>

      {/* Ejemplo: Insertar */}
      <section className="mt-4 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo visual: Insertar nodos
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-4">
          <p className="text-gray-200">
            Se insertan los números <b>13, 25, 4 y 23</b> en una Lista Doble.
            Observa cómo se actualizan los punteros <b>ant</b> y <b>sig</b> en
            cada paso.
          </p>

          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-100">
            <li>
              Se inserta <b>13</b> a continuación de la cabeza.
            </li>
            <li>
              Luego se agrega <b>25</b>, enlazando en ambos sentidos.
            </li>
            <li>
              Se inserta <b>4</b> y finalmente <b>23</b>, completando la lista.
            </li>
          </ol>

          <div className="flex flex-col gap-4">
            <img
              src={img3}
              alt="Inserción en lista doble - paso 1 y 2"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
            <img
              src={img4}
              alt="Inserción en lista doble - paso 3"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
          </div>

          <p className="mt-3 text-sm text-gray-200 font-semibold">
            Resultado final:
          </p>
          <img
            src={img5}
            alt="Lista doblemente enlazada resultante"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>

      {/* Ejemplo: Eliminar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo visual: Eliminar un nodo
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-4">
          <p>Teniendo la siguiente Lista Doble:</p>
          <img
            src={img6}
            alt="Lista doble con nodo a eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />

          <p className="text-sm">
            Se desea eliminar el nodo con valor <b>29</b>. Para ello se
            actualizan los punteros{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">sig</code>{" "}
            y{" "}
            <code className="bg-black/70 text-cyan-200 px-2 rounded">ant</code>{" "}
            de los nodos adyacentes, de forma que el nodo 29 queda{" "}
            <b>desconectado</b> de la lista.
          </p>

          <img
            src={img7}
            alt="Actualización de punteros al eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />

          <p className="text-sm font-semibold">Lista final después de eliminar:</p>
          <img
            src={img8}
            alt="Lista doble después de la eliminación"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
