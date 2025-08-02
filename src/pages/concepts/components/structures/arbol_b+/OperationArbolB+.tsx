import img1 from "../../../../../assets/images/definicion_arbolB2_3.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB2_4.jpg";
import img3 from "../../../../../assets/images/definicion_arbolB2_5.jpg";

export function OperationArbolB2() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol B+
        </h1>
      </div>
      <span className="text-base text-red-500 ml-1 mb-6 block font-medium">
        Operaciones
      </span>

      {/* Operación de Búsqueda */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Operación de búsqueda
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            Para buscar un registro en un árbol B+ a partir de su clave, primero
            hay que recorrer todo el árbol del índice, comparando los valores de
            clave de cada nodo y tomando el descendiente adecuado, tal y como se
            realiza en la operación de búsqueda de un registro en un árbol B.
          </p>
          <p className="mt-4">
            La diferencia fundamental consiste en que al estar todos los
            registros en los bloques de datos, es necesario que la búsqueda
            llegue siempre a un nodo hoja. Una vez localizado el bloque, se
            llevará a memoria, donde se realiza la búsqueda del registro.
          </p>
        </div>
        <img
          src={img1}
          alt="Operación de búsqueda en árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Ejemplo de Insertar */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Ejemplo de Insertar
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            Se busca un registro con clave “86” en el árbol B+ de orden 4.
            Empezamos comparando con la clave almacenada en el nodo raíz. Como
            es mayor, seguimos la búsqueda por su hijo derecho; comparamos con
            “78”, como 78 &lt; 86 continuamos con la hoja que contiene las
            claves {"{"}80, 84{"}"}. Comparando, 80 &lt; 84 &lt; 86,
            seleccionamos el tercer apuntador de esta hoja, que nos lleva al
            último bloque del conjunto secuencia.
          </p>
          <p className="mt-3">
            En color verde se indica la secuencia de apuntadores que se ha
            seguido. Una vez obtenida la posición del bloque de datos, se lleva
            a memoria donde se realiza la búsqueda del registro.
          </p>
        </div>
        <img
          src={img2}
          alt="Ejemplo inserción árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Operación de Inserción */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Operación de inserción
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            Para insertar un nuevo registro en un árbol B+, hay que localizar, a
            partir de su clave, el bloque en el que debe almacenarse,
            recorriendo el árbol desde la raíz hasta la página hoja adecuada. Si
            aún no se ha ocupado su máximo número de registros, se inserta de
            forma ordenada.
          </p>
          <p className="mt-4">
            Si el bloque está completo, se produce “desbordamiento”, lo cual se
            resuelve dividiendo la página y repartiendo equitativamente los
            registros en dos nuevas páginas hojas.
          </p>
          <p className="mt-4">
            <b>Si hay espacio en la página:</b>
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>Se almacena el registro en la página de forma ordenada.</li>
            <li>Se reescribe nuevamente la página en disco.</li>
          </ul>
        </div>
      </section>

      {/* Desbordamiento */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p className="mb-2">
            <b>Si no hay espacio en la página:</b>
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              Se crea una nueva página y se reparten los datos entre ambas.
            </li>
            <li>
              Se actualiza el índice insertando una clave separadora entre ambas
              páginas.
            </li>
          </ul>
        </div>
        <img
          src={img3}
          alt="Desbordamiento árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Operación de Eliminación */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Operación de eliminación
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            Para eliminar un dato de un árbol B+, hay que recorrer el árbol
            hasta llegar a la hoja que contiene el bloque donde está almacenado.
            Si después de eliminar el dato el bloque queda con al menos la mitad
            de los registros, solo se reescribe. Si no, puede haber
            redistribución o concatenación de registros con otro bloque
            adyacente.
          </p>
        </div>
      </section>

      {/* Eliminación con redistribución o concatenación */}
      <section className="mb-12">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p>
            <b>Si el bloque queda ocupado con menos de la mitad:</b>
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-2">
            <li>
              Se intenta redistribuir los registros con un bloque adyacente.
            </li>
            <li>
              Si no es posible, se concatenan los bloques y se actualiza el
              índice eliminando la clave separadora.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
