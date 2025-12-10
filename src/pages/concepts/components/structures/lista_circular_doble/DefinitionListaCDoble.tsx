import img1 from "../../../../../assets/images/definicion_lcd_1.jpg";
import img2 from "../../../../../assets/images/definicion_lcd_2.jpg";
import img3 from "../../../../../assets/images/definicion_lcd_3.jpg";
import img4 from "../../../../../assets/images/definicion_lcd_4.jpg";
import img5 from "../../../../../assets/images/definicion_lcd_5.jpg";
import img6 from "../../../../../assets/images/definicion_lcd_6.jpg";
import img7 from "../../../../../assets/images/definicion_lcd_7.jpg";

export function DefinitionListaCDoble() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Circular Doblemente Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Circular Bidireccional
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* DESCRIPCIÓN GENERAL */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p>
            Una{" "}
            <b className="text-red-400">
              lista circular doblemente enlazada
            </b>{" "}
            combina las características de{" "}
            <span className="text-yellow-300 font-semibold">lista doble</span> y{" "}
            <span className="text-yellow-300 font-semibold">lista circular</span>
            . Cada nodo mantiene dos referencias:
          </p>

          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <b>Información</b>: dato almacenado en el nodo.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <b>sig</b>: apunta al nodo siguiente.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              <b>ant</b>: apunta al nodo anterior.
            </li>
          </ul>

          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura de un nodo circular doble"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>

          <p>
            El <b>último nodo</b> apunta a la <b>cabeza</b> y la cabeza apunta
            hacia atrás al último nodo, formando un{" "}
            <span className="text-cyan-300 font-semibold">
              círculo bidireccional
            </span>{" "}
            donde se puede avanzar y retroceder sin encontrar nunca un{" "}
            <code className="bg-black/60 px-1 rounded">NULL</code>.
          </p>
        </div>

        {/* CADENA DE NODOS */}
        <div className="flex flex-col items-center gap-2 my-6">
          <img
            src={img2}
            alt="cadena de nodos circulares dobles"
            className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
          />
          <span className="text-gray-400 text-xs text-center max-w-lg">
            La lista mantiene un ciclo en ambos sentidos: el último nodo apunta
            a la cabeza y la cabeza al último nodo.
          </span>
        </div>

        {/* NODO CENTINELA / CABECERA */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3">
          <p className="font-semibold text-gray-100">
            Nodo centinela o cabecera
          </p>
          <p>
            Aunque la lista es circular y no tiene inicio ni fin “naturales”,
            suele utilizarse un <b>nodo centinela</b> (o cabecera) como punto de
            referencia externo:
          </p>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Sus punteros <b>sig</b> y <b>ant</b> apuntan al primer y al último
              nodo reales.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Si la lista está vacía, ambos punteros apuntan al propio centinela
              (la lista se considera vacía).
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Facilita operaciones de inserción, eliminación y recorrido, ya que
              siempre se parte del mismo punto.
            </li>
          </ul>
        </div>

        {/* VENTAJAS */}
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow space-y-2">
          <p className="font-semibold text-gray-100">Ventajas principales</p>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Permite recorridos en ambas direcciones sin llegar a un extremo.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Las operaciones de inserción y eliminación son locales: basta
              ajustar <b>ant</b> y <b>sig</b> de los nodos adyacentes.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span>
              Es muy útil en aplicaciones donde se requiere un{" "}
              <b>recorrido circular continuo</b> (por ejemplo, menús
              circulares, buffers, turnos, etc.).
            </li>
          </ul>
        </div>
      </section>

      {/* EJEMPLO: INSERTAR */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Insertar
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3 text-[15px]">
          <p className="text-gray-200">
            Construimos una lista circular doble insertando los números:{" "}
            <b>23, 10, 16, 1 y 29</b>. Cada nuevo nodo se enlaza
            bidireccionalmente y el último siempre apunta a la cabeza.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm text-gray-300">
                1. Inserciones intermedias: se van conectando los nodos en ambos
                sentidos.
              </p>
              <img
                src={img3}
                alt="insertando nodos en lista circular doble"
                className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-300">
                2. Se mantiene el ciclo: cabeza ↔ último nodo.
              </p>
              <img
                src={img4}
                alt="lista circular doble con ciclo completo"
                className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EJEMPLO: ELIMINAR */}
      <section className="mt-10 space-y-5 mb-4">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Eliminar
        </h3>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3 text-[15px]">
          <p>Consideremos la siguiente Lista Circular Doble:</p>
          <img
            src={img5}
            alt="lista circular doble antes de eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />

          <p className="mt-2">
            Se desea eliminar el nodo con valor <b>29</b>:
          </p>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">1.</span>
              Se localiza el nodo con 29.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">2.</span>
              El puntero <b>sig</b> del nodo anterior se conecta con el nodo
              siguiente.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">3.</span>
              El puntero <b>ant</b> del nodo siguiente se conecta con el nodo
              anterior.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">4.</span>
              Si el nodo eliminado era la cabeza, se actualiza la referencia de
              cabeza y el puntero del último nodo.
            </li>
          </ul>

          <img
            src={img6}
            alt="ajuste de punteros al eliminar nodo circular doble"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />

          <p className="mt-2">Lista final después de eliminar:</p>
          <img
            src={img7}
            alt="lista circular doble tras eliminación"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
