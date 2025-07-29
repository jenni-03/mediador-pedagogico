import img1 from "../../../../../assets/images/operacion_bin_1.jpg";
import img2 from "../../../../../assets/images/operacion_bin_2.jpg";
import img3 from "../../../../../assets/images/operacion_bin_3.jpg";
import img4 from "../../../../../assets/images/operacion_bin_4.jpg";

export function OperationArbolBinarioBusqueda() {
  return (
    <div className="py-8 px-3 sm:px-10 max-w-4xl mx-auto text-white">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árboles Binarios de Búsqueda
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro */}
      <section className="mb-10">
        <p className="mb-4">
          A continuación definiremos el Tipo Abstracto de Datos asociado a los
          árboles binarios de búsqueda. Para no alargar la descripción del mismo
          supondremos incluidas las operaciones del TAD ArbolB.
        </p>

        {/* Búsqueda de un Elemento */}
        <div className="mb-8">
          <h3 className="font-bold mb-1 text-[18px]">
            Búsqueda de un Elemento:
          </h3>
          <p className="text-gray-200">
            La operación de búsqueda en un árbol binario de búsqueda es bastante
            sencilla de entender. Supongamos que buscamos un elemento <b>x</b>{" "}
            en el árbol. Lo primero que haremos será comprobar si se encuentra
            en el nodo raíz. Si no es así, si el elemento buscado es menor que
            el contenido en el nodo raíz sabremos que, de estar en el árbol, se
            encuentra en el subárbol izquierdo. Si el elemento buscado es mayor
            que el contenido en el nodo raíz sabremos que, de estar en el árbol,
            se encuentra en el subárbol derecho. Para continuar la búsqueda en
            el subárbol adecuado aplicaremos recursivamente el mismo
            razonamiento. Por lo tanto, el esquema del algoritmo BuscarNodo será
            el siguiente:
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                Si el valor del nodo actual es igual al valor buscado, lo hemos
                encontrado.
              </li>
              <li>
                Si el valor buscado es menor que el del nodo actual, deberemos
                inspeccionar el subárbol izquierdo.
              </li>
              <li>
                Si el valor buscado es mayor que el del nodo actual, deberemos
                inspeccionar el subárbol derecho.
              </li>
            </ol>
          </p>
        </div>

        {/* Inserción de un Elemento */}
        <div className="mb-3">
          <h3 className="font-bold mb-1 text-[18px]">
            Inserción de un Elemento:
          </h3>
          <p className="text-gray-200">
            La operación de inserción de un nuevo nodo en un árbol binario de
            búsqueda consta de tres fases básicas:
            <b> 1.</b> Creación del nuevo nodo
            <b> 2.</b> Búsqueda de su posición correspondiente en el árbol.
            <b> 3.</b> Inserción en la posición encontrada.
            <br />
            Se modifican de modo adecuado los enlaces de la estructura. La
            creación de un nuevo nodo supone simplemente reservar espacio para
            el registro asociado y rellenar sus tres campos. Dado que nos hemos
            impuesto la restricción de que el árbol resultante sea equilibrado,
            consideraremos que la posición adecuada para insertar el nuevo nodo
            es la que al ser tal se mantiene el orden del árbol. Insertar el
            nodo en una hoja supone una operación mucho menos complicada que
            tener que insertarlo como un nodo intery modificar la posición de
            uno o varios subárboles completos.
          </p>
          <p className="mt-3 text-gray-200">
            Veamos con un ejemplo la evolución de un árbol conforme vamos
            insertando nodos siguiendo el criterio anterior respecto a la
            posición adecuada.
          </p>
        </div>
      </section>

      {/* Ejemplo visual de inserciones */}
      <div className="bg-[#19191d] rounded-xl shadow p-4 mb-10">
        <div className="flex flex-col items-center justify-center gap-6">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4"
          />
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4"
          />
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-yellow-400 shadow max-w-3xl w-full p-4"
          />
        </div>
      </div>
      <section className="mb-10">
        {/* Eliminación de un Elemento */}
        <div className="mb-8">
          <h3 className="font-bold mb-1 text-[18px]">
            Eliminación de un Elemento:
          </h3>
          <p className="text-gray-200">
            La eliminación de un nodo de un árbol binario de búsqueda es más
            complicada que la inserción, puesto que puede suponer la
            recolocación de varios de sus nodos. En líneas generales un posible
            esquema para abordar esta operación es el siguiente:
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>
                Buscar el nodo que se desea borrar manteniendo un puntero a su
                padre.
              </li>
              <li>
                Si se encuentra el nodo hay que contemplar tres casos posibles:
                <ul className="list-disc ml-6 mt-1">
                  <li>
                    <b>a.</b> Si el nodo a borrar no tiene hijos, simplemente se
                    libera el espacio que ocupa.
                  </li>
                  <li>
                    <b>b.</b> Si el nodo a borrar tiene un solo hijo, se añade
                    como hijo de su padre, sustituyendo la posición ocupada por
                    el nodo borrado.
                  </li>
                  <li>
                    <b>c.</b> Si el nodo a borrar tiene los dos hijos se siguen
                    los siguientes pasos:
                    <ul className="list-disc ml-8">
                      <li>
                        i. Se busca el máximo de la rama izquierda o el mínimo
                        de la rama derecha.
                      </li>
                      <li>
                        ii. Se sustituye el nodo a borrar por el nodo
                        encontrado.
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ol>
          </p>
          <p className="mt-3 text-gray-200">
            Veamos gráficamente varios ejemplos de eliminación de un nodo:
          </p>
        </div>

        {/* Imagen de ejemplo eliminación */}
        <div className="bg-[#19191d] rounded-xl shadow p-4 mb-10 flex justify-center">
          <img
            src={img4}
            className="bg-white rounded-xl border-2 border-red-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>
    </div>
  );
}
