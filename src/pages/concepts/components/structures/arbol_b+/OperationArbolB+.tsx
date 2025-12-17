import img1 from "../../../../../assets/images/definicion_arbolB2_3.jpg";
import img2 from "../../../../../assets/images/definicion_arbolB2_4.jpg";
import img3 from "../../../../../assets/images/definicion_arbolB2_5.jpg";

export function OperationArbolB2() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-500" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol B+
        </h1>
      </div>
      <span className="text-base text-red-500 ml-1 mb-6 block font-medium">
        Operaciones
      </span>

      {/* Operación de búsqueda */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Operación de búsqueda
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-4">
          <p className="mb-4">
            Para buscar un registro en un árbol B+ a partir de su clave{" "}
            <b>K</b>, primero se recorre el <b>árbol del índice</b> (la parte
            tipo árbol B). En cada nodo interno se comparan las claves y se toma
            el hijo cuyo intervalo contiene a <b>K</b>, de forma similar a la
            búsqueda en un árbol B.
          </p>
          <p>
            La diferencia fundamental es que en el árbol B+{" "}
            <b>todos los registros están en los nodos hoja</b>. Por tanto, la
            búsqueda siempre termina en una página hoja. Una vez localizado el
            bloque hoja apropiado, este se carga en memoria y se busca{" "}
            <b>internamente</b> el registro (normalmente mediante búsqueda
            binaria en el bloque).
          </p>
        </div>

        {/* Resumen paso a paso */}
        <div className="bg-[#111217] border border-cyan-500/60 rounded-lg p-4 shadow mb-6 text-[15.5px]">
          <h3 className="text-cyan-300 font-semibold mb-2">
            Búsqueda paso a paso
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-100">
            <li>Comenzar en la raíz del conjunto índice.</li>
            <li>
              En cada nodo interno, comparar <b>K</b> con las claves y elegir el
              puntero al hijo cuyo rango contiene a <b>K</b>.
            </li>
            <li>Repetir el proceso hasta llegar a una página hoja.</li>
            <li>
              En la hoja, buscar <b>K</b> entre las claves del bloque (búsqueda
              binaria o secuencial).
            </li>
            <li>
              Si se encuentra, se devuelve el <b>registro</b> asociado; si no,
              se informa que la clave no está en el árbol.
            </li>
          </ol>
        </div>

        <img
          src={img1}
          alt="Esquema de la operación de búsqueda en un árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Ejemplo de búsqueda */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Ejemplo de búsqueda
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-6">
          <p className="mb-3">
            Se busca un registro con clave <b>86</b> en un árbol B+ de{" "}
            <b>orden 4</b>. Empezamos en la raíz y comparamos con la clave{" "}
            <b>66</b>. Como 86 &gt; 66, seguimos la búsqueda por su hijo
            derecho.
          </p>
          <p className="mb-3">
            En el siguiente nivel comparamos con <b>78</b>. Como 78 &lt; 86,
            descendemos al hijo que contiene el rango de claves{" "}
            <b>{"{80, 84, ...}"}</b>. Allí llegamos a la hoja con las claves{" "}
            <b>{"{80, 84}"}</b> y sus punteros a bloques de datos.
          </p>
          <p>
            Como 80 &lt; 84 &lt; 86, se selecciona el <b>tercer puntero</b> de
            la hoja, que nos lleva al último bloque del conjunto secuencia, donde
            se buscará finalmente el registro con clave 86. En la figura, el
            recorrido seguido se marca en <b>color verde</b>.
          </p>
        </div>
        <img
          src={img2}
          alt="Recorrido de búsqueda de la clave 86 en un árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Operación de inserción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Operación de inserción
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-4">
          <p className="mb-4">
            Para insertar un nuevo registro de clave <b>K</b> en un árbol B+, se
            sigue primero el mismo recorrido que en la búsqueda: se localiza la{" "}
            <b>página hoja</b> donde debería quedar almacenado el nuevo
            registro.
          </p>
          <p>
            Si en esa página aún no se ha alcanzado el número máximo de
            registros, la clave se inserta en orden y se reescribe el bloque. Si
            la página está llena, se produce un <b>desbordamiento</b> y es
            necesario dividirla en dos páginas hoja y actualizar el índice.
          </p>
        </div>

        {/* Casos de inserción */}
        <div className="bg-[#111217] border border-red-500/60 rounded-lg p-4 shadow text-[15.5px] mb-6">
          <h3 className="text-red-300 font-semibold mb-2">
            Casos de inserción
          </h3>
          <p className="text-gray-100 mb-2">
            <b>Si hay espacio en la página hoja:</b>
          </p>
          <ul className="list-disc list-inside ml-3 text-gray-100 space-y-1 mb-3">
            <li>Insertar la nueva clave en su posición ordenada.</li>
            <li>Mantener enlazados los registros de la secuencia.</li>
            <li>Reescribir la página en disco/memoria secundaria.</li>
          </ul>

          <p className="text-gray-100 mb-2">
            <b>Si no hay espacio en la página (desbordamiento):</b>
          </p>
          <ul className="list-disc list-inside ml-3 text-gray-100 space-y-1">
            <li>
              Crear una <b>nueva página hoja</b> y repartir los registros entre
              la página original y la nueva (aproximadamente la mitad en cada
              una).
            </li>
            <li>
              Insertar en el <b>nodo interno padre</b> una clave separadora que
              indique el límite entre ambas páginas.
            </li>
            <li>
              Si el nodo padre también se desborda, repetir el proceso hacia
              arriba (divisiones en cascada hasta la raíz si es necesario).
            </li>
          </ul>
        </div>

        <img
          src={img3}
          alt="Desbordamiento y división de una página hoja en un árbol B+"
          className="rounded-xl border-2 border-red-500 shadow bg-white w-full"
        />
      </section>

      {/* Operación de eliminación */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Operación de eliminación
        </h2>

        {/* Idea general */}
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow text-[15.5px] text-gray-200 leading-7 mb-4">
          <p className="mb-4">
            Para eliminar un dato de un árbol B+, primero se recorre el árbol
            índice hasta llegar a la <b>hoja</b> que contiene el bloque donde
            está almacenado el registro. Se elimina la clave en la página hoja y
            se actualiza el bloque.
          </p>
          <p>
            Si después de eliminar el dato la página sigue teniendo{" "}
            <b>al menos la mitad</b> de los registros permitidos, no se requiere
            más trabajo. Si queda por debajo del mínimo, es necesario{" "}
            <b>redistribuir</b> o <b>fusionar</b> páginas y actualizar el
            índice.
          </p>
        </div>

        {/* Casos con falta de registros */}
        <div className="bg-[#111217] border border-red-500/60 rounded-lg p-4 shadow text-[15.5px] mb-6">
          <h3 className="text-red-300 font-semibold mb-2">
            Si el bloque queda con menos de la mitad
          </h3>
          <ul className="list-disc list-inside ml-1 text-gray-100 space-y-2">
            <li>
              <b>Redistribución:</b> si existe un bloque hoja adyacente con
              espacio de sobra, se <b>reparten</b> los registros entre ambas
              páginas para que las dos cumplan el mínimo.
            </li>
            <li>
              <b>Concatenación (fusión):</b> si no es posible redistribuir, se
              <b> unen</b> dos páginas hojas en una sola y se actualiza el nodo
              interno eliminando la clave separadora asociada.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
