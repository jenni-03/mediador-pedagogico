import img1 from "../../../../../assets/images/operacion_bin_1.jpg";
import img2 from "../../../../../assets/images/operacion_bin_2.jpg";
import img3 from "../../../../../assets/images/operacion_bin_3.jpg";
import img4 from "../../../../../assets/images/operacion_bin_4.jpg";

export function OperationArbolBinarioBusqueda() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol Binario de Búsqueda
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles Binarios de Búsqueda (ABB)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro */}
      <section className="mb-8 text-sm leading-6 text-gray-200">
        <p>
          Un Árbol Binario de Búsqueda mantiene sus claves ordenadas para
          permitir operaciones muy eficientes de{" "}
          <b>búsqueda, inserción y eliminación</b>. A continuación se resume el
          comportamiento de cada operación tomando como base el TAD de un
          árbol binario.
        </p>

        <div className="mt-4 bg-[#17181c] border-l-4 border-cyan-500 rounded-md p-3 text-[13px]">
          <p className="font-semibold text-cyan-300 mb-1">
            Idea clave del ABB:
          </p>
          <p>
            En cada nodo, las claves del subárbol izquierdo son menores, y las
            del subárbol derecho son mayores. Toda operación debe respetar esta
            propiedad.
          </p>
        </div>
      </section>

      {/* BÚSQUEDA */}
      <section className="mb-10 text-sm leading-6">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Búsqueda</h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow">
          <p>
            Buscar un elemento <b>x</b> en un ABB es seguir el orden que impone
            la propia estructura:
          </p>
          <ol className="list-decimal ml-6 mt-3 space-y-1 text-gray-200 text-[15px]">
            <li>Comparar la clave buscada con la clave del nodo actual.</li>
            <li>
              Si son iguales, <b>x</b> ha sido encontrado.
            </li>
            <li>
              Si <b>x</b> es menor, continuar la búsqueda en el{" "}
              <b>subárbol izquierdo</b>.
            </li>
            <li>
              Si <b>x</b> es mayor, continuar la búsqueda en el{" "}
              <b>subárbol derecho</b>.
            </li>
            <li>
              Si se alcanza un puntero nulo, el elemento <b>no está</b> en el
              árbol.
            </li>
          </ol>
          <div className="mt-3 bg-black/40 border-l-4 border-cyan-500 px-3 py-2 rounded text-[13px] text-cyan-100">
            En un árbol balanceado, la búsqueda tiene complejidad aproximada{" "}
            <b>O(log n)</b>, ya que en cada comparación se descarta la mitad del
            árbol.
          </div>
        </div>
      </section>

      {/* INSERCIÓN */}
      <section className="mb-10 text-sm leading-6">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Inserción</h2>
        <div className="bg-[#19191d] border-l-4 border-emerald-400 rounded-md p-4 shadow mb-4">
          <p>
            Insertar un nuevo nodo en un ABB consiste en encontrar la posición
            donde debe ir para mantener el orden:
          </p>
          <ol className="list-decimal ml-6 mt-3 space-y-1 text-gray-200 text-[15px]">
            <li>Crear el nuevo nodo con la clave a insertar.</li>
            <li>
              Partir desde la <b>raíz</b> y comparar la nueva clave con el nodo
              actual.
            </li>
            <li>
              Si la clave es menor, avanzar al subárbol izquierdo; si es mayor,
              al derecho.
            </li>
            <li>
              Repetir el proceso hasta encontrar un enlace nulo y colocar allí
              el nuevo nodo.
            </li>
            <li>
              No se permiten claves duplicadas: si la clave ya existe, se decide
              no insertar o actualizar la información asociada.
            </li>
          </ol>
          <p className="mt-3 text-emerald-200 text-[13px]">
            Al insertar siempre respetando la regla izquierda &lt; raíz &lt;
            derecha, el árbol conserva su propiedad de búsqueda.
          </p>
        </div>

        {/* Ejemplo visual de inserciones */}
        <div className="bg-[#15161a] rounded-xl shadow p-4 mb-10">
          <p className="text-sm text-gray-200 mb-3 font-semibold">
            Evolución del árbol al insertar sucesivamente varias claves:
          </p>
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="w-full">
              <img
                src={img1}
                alt="Inserciones iniciales en ABB"
                className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4 mx-auto"
              />
            </div>
            <div className="w-full">
              <img
                src={img2}
                alt="Continuación de inserciones en ABB"
                className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4 mx-auto"
              />
            </div>
            <div className="w-full">
              <img
                src={img3}
                alt="Árbol resultante tras varias inserciones"
                className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4 mx-auto"
              />
            </div>
          </div>
          <p className="text-[13px] text-gray-400 mt-3 text-center">
            Cada inserción coloca la nueva clave en la rama izquierda o derecha
            según su valor, manteniendo el orden del árbol.
          </p>
        </div>
      </section>

      {/* ELIMINACIÓN */}
      <section className="mb-10 text-sm leading-6">
        <h2 className="text-2xl font-bold mb-3 text-red-400">Eliminación</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p>
            Eliminar un nodo en un ABB es más delicado que buscar o insertar,
            porque puede requerir reestructurar parte del árbol. El esquema
            general es:
          </p>
          <ol className="list-decimal ml-6 mt-3 space-y-2 text-gray-200 text-[15px]">
            <li>
              Localizar el nodo a eliminar manteniendo una referencia a su{" "}
              <b>padre</b>.
            </li>
            <li>
              Según el tipo de nodo, aplicar uno de los tres casos:
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>
                  <b>a) Nodo hoja:</b> no tiene hijos. Se elimina el enlace
                  desde su padre y se libera el nodo.
                </li>
                <li>
                  <b>b) Nodo con un solo hijo:</b> el padre pasa a apuntar
                  directamente al hijo, “saltándose” el nodo eliminado.
                </li>
                <li>
                  <b>c) Nodo con dos hijos:</b> se busca el{" "}
                  <b>sucesor inorden</b> (mínimo del subárbol derecho) o el{" "}
                  <b>predecesor inorden</b> (máximo del subárbol izquierdo),
                  copiando su valor en el nodo a eliminar y, después, se elimina
                  ese sucesor/predecesor con uno de los casos anteriores.
                </li>
              </ul>
            </li>
          </ol>
          <p className="mt-3 text-[13px] text-red-200">
            El objetivo es siempre preservar la propiedad de búsqueda: izquierda
            &lt; nodo &lt; derecha en todo momento.
          </p>
        </div>

        {/* Ejemplo visual de eliminación */}
        <div className="bg-[#15161a] rounded-xl shadow p-4">
          <p className="text-sm text-gray-200 mb-3 font-semibold">
            Ejemplos gráficos de eliminación para los casos a), b) y c):
          </p>
          <div className="flex justify-center">
            <img
              src={img4}
              alt="Casos de eliminación en árbol binario de búsqueda"
              className="bg-white rounded-xl border-2 border-red-400 shadow max-w-4xl w-full p-4"
            />
          </div>
          <p className="text-[13px] text-gray-400 mt-3 text-center">
            Cada eliminación ajusta los enlaces del árbol para mantener el orden
            sin romper la estructura del ABB.
          </p>
        </div>
      </section>
    </div>
  );
}
