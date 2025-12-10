import img1 from "../../../../../assets/images/definicion_rojinegro_4.jpg";

export function OperationArbolRojiNegro() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol RojiNegro
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol Binario de Búsqueda RojiNegro
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Rotación */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-400 mb-3">Rotación</h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3 text-[15.5px] leading-relaxed">
          <p className="mb-2">
            Para conservar las propiedades que debe cumplir todo árbol
            roji-negro, en ciertos pasos de la <b>inserción</b> y la{" "}
            <b>eliminación</b> es necesario reestructurar el árbol sin perder el
            orden de un árbol binario de búsqueda.
          </p>
          <p className="mb-2">
            Esto se logra mediante <b>rotaciones</b>, que solo cambian las
            relaciones padre–hijo–tío–abuelo, pero <b>no</b> cambian el orden
            in-order de las claves.
          </p>
          <p>
            En esta unidad trabajaremos con <b>rotaciones simples</b> (una
            rotación a la vez). En la práctica también existen rotaciones
            dobles, que se pueden ver como dos rotaciones simples consecutivas.
          </p>
        </div>

        <h3 className="font-semibold mb-2 text-lg text-cyan-400">
          Rotación derecha y Rotación izquierda
        </h3>
        <p className="text-[15.5px] mb-3 text-gray-200">
          Una rotación <b>derecha</b> hace que el hijo izquierdo pase a ser el
          nuevo padre. Una rotación <b>izquierda</b> hace que el hijo derecho
          pase a ser el nuevo padre. En ambos casos se mantiene el orden del
          árbol binario de búsqueda.
        </p>

        <div className="flex justify-center my-5">
          <img
            src={img1}
            alt="Ejemplo de rotación izquierda y derecha en un árbol roji-negro"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
          />
        </div>
      </section>

      {/* Búsqueda e Inserción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-400 mb-3">
          Búsqueda e Inserción
        </h2>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3 text-[15.5px] leading-relaxed">
          <p className="mb-2">
            <b>Búsqueda:</b> se hace igual que en un árbol binario de búsqueda:
            se compara la clave del nodo buscado con la clave del nodo actual y
            se avanza a la izquierda o derecha según corresponda.
          </p>
          <p className="mb-2">
            <b>Inserción (idea general):</b> primero se inserta el nuevo nodo{" "}
            <b>como en un árbol binario de búsqueda</b>, siempre como{" "}
            <b>hoja roja</b>. Luego se revisan las propiedades del árbol
            roji-negro. Si alguna se incumple, se corrige con{" "}
            <b>cambios de color</b> y/o <b>rotaciones</b>.
          </p>
          <p>
            En los casos siguientes usaremos la notación:
            <br />
            <span className="font-mono">
              N = nuevo nodo, P = padre, U = tío, G = abuelo
            </span>
            .
          </p>
        </div>

        <div className="bg-[#151518] border border-yellow-400/60 rounded-md p-4 mb-4 text-[14.5px] text-gray-100">
          <b>Convención:</b> para simplificar, describimos los casos cuando{" "}
          <b>P es hijo derecho de G</b>. El caso simétrico (P hijo izquierdo de
          G) se resuelve igual, intercambiando izquierda ↔ derecha.
        </div>

        <h3 className="font-bold mb-2 text-yellow-300">Casos de inserción:</h3>
        <ul className="list-none space-y-2 text-[15.5px]">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 1:</b> <b>N</b> es la raíz del árbol. Se pinta de{" "}
              <b>negro</b> para asegurar que la raíz siempre sea negra.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 2:</b> <b>P</b> (el padre de N) es <b>negro</b>. No se
              rompe ninguna propiedad, por lo que no se requiere ninguna
              corrección.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 3:</b> <b>P</b> y <b>U</b> (tío) son <b>rojos</b>. Se
              pintan <b>P</b> y <b>U</b> de <b>negro</b> y se pinta <b>G</b> de{" "}
              <b>rojo</b>. Luego se repite el análisis tomando <b>G</b> como
              nuevo nodo, para asegurar que la raíz quede negra.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 4 (alineado, rama derecha):</b> <b>P</b> es{" "}
              <b>hijo derecho de G</b>, <b>N</b> es <b>hijo derecho de P</b> y{" "}
              <b>U</b> es <b>negro</b> (o no existe). Es una configuración en
              “línea” por la derecha. Se pinta <b>P</b> de <b>negro</b> y{" "}
              <b>G</b> de <b>rojo</b>, y luego se realiza una{" "}
              <b>rotación a la izquierda en G</b>. Con esto se corrige la
              violación de dos rojos consecutivos.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 5 (triángulo, rama derecha):</b> <b>P</b> es{" "}
              <b>hijo derecho de G</b>, <b>U</b> es <b>negro</b> y{" "}
              <b>N es hijo izquierdo de P</b>. La forma es de “triángulo”. Primero
              se hace una <b>rotación a la derecha en P</b> para convertir la
              situación en el caso 4. Luego se aplica el <b>caso 4</b> (cambios
              de color y rotación izquierda en <b>G</b>).
            </p>
          </li>
        </ul>
      </section>

      {/* Eliminación */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-400 mb-3">Eliminación</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3 text-[15.5px] leading-relaxed">
          <p className="mb-2">
            Al eliminar un nodo en un árbol roji-negro también pueden romperse
            las propiedades del árbol. El algoritmo vuelve a balancear usando{" "}
            <b>rotaciones</b> y <b>cambios de color</b>, de forma similar al
            proceso de inserción.
          </p>
          <p>
            En esta introducción solo daremos una <b>visión general</b> de los
            casos. En todos ellos el costo en el peor de los casos sigue siendo{" "}
            <b>O(log n)</b>, usando como máximo un número constante de
            rotaciones.
          </p>
        </div>

        <h3 className="font-bold mb-2 text-yellow-300">
          Casos de eliminación (idea general):
        </h3>
        <ul className="list-none space-y-2 text-[15.5px]">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 1:</b> El nodo a eliminar es <b>hoja</b>. Se elimina
              directamente y, si era negro, se corrige el “negro extra” en el
              camino hacia la raíz.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 2:</b> El <b>hermano</b> del nodo y sus dos hijos son{" "}
              <b>negros</b>. El negro extra se “sube” hacia el padre, cambiando
              colores, y se continúa el proceso más arriba en el árbol.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 3:</b> El nodo a eliminar tiene <b>dos hijos</b>. Se
              reemplaza por su <b>sucesor in-order</b> (el menor del subárbol
              derecho). El sucesor como máximo tiene un hijo, por lo que luego
              la eliminación se reduce a uno de los otros casos.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 4:</b> El hermano o su hijo más cercano al nodo son{" "}
              <b>negros</b> y el hijo más alejado es <b>rojo</b>. Se cambian
              colores y se realiza una o varias <b>rotaciones</b> para mover el
              negro extra hacia abajo y restaurar el balance.
            </p>
          </li>

          <li className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg mt-[2px]">✱</span>
            <p>
              <b>caso 5:</b> El nodo tiene un solo hijo no nulo (hoja roja o
              negro con corrección). Se reemplaza el nodo por su hijo y se
              ajustan los colores para mantener las propiedades del árbol
              roji-negro.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}
