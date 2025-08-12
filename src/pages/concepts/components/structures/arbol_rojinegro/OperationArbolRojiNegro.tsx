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
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p className="mb-2">
            Para conservar las propiedades que debe cumplir todo árbol
            roji-negro, en ciertos casos de la inserción y la eliminación será
            necesario reestructurar el árbol, sin perder la ordenación relativa
            de los nodos. Esto se logra realizando una o varias rotaciones, que
            solo modifican relaciones padre-hijo-tío-nieto.
          </p>
          <p>
            Las rotaciones consideradas a continuación son simples, pero también
            existen rotaciones dobles.
          </p>
        </div>
        <h3 className="font-semibold mb-2 text-lg text-cyan-400">
          Rotación derecha y Rotación izquierda
        </h3>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
          />
        </div>
      </section>

      {/* Búsqueda e Inserción */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-400 mb-3">
          Búsqueda e Inserción
        </h2>
        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-3">
          <p className="mb-2">
            <b>Búsqueda:</b> se hace igual que en un árbol binario de búsqueda.
          </p>
          <p>
            <b>Inserción:</b> se realiza como en un árbol binario de búsqueda,
            pero el nuevo nodo se pinta de rojo. Si alguna propiedad del árbol
            se incumple, se hacen rotaciones y/o cambios de color según el caso.
            El costo es O(log n).
          </p>
        </div>
        <h3 className="font-bold mb-2 text-yellow-300">Casos de inserción:</h3>
        <ul className="list-none space-y-2 text-[15.5px]">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 1:</b> El nuevo nodo es la raíz, se pinta de negro.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 2:</b> El nuevo nodo es hijo de un padre negro.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 3:</b> El padre y el tío del nuevo nodo son rojos: se pintan
            de negro y el abuelo de rojo. Se repite con el abuelo si es
            necesario, asegurando que la raíz sea negra.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 4:</b> El nuevo nodo y su padre son rojos y el abuelo es
            negro: se pinta el padre de negro y el abuelo de rojo y se rota a la
            derecha del abuelo.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 5:</b> El tío es negro y el nuevo nodo es hijo derecho de su
            padre: se rota a la izquierda para convertirlo en caso 4 y luego se
            continúa el proceso.
          </li>
        </ul>
      </section>

      {/* Eliminación */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-400 mb-3">Eliminación</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-3">
          <p>
            Al eliminar un nodo, también es necesario realizar rotaciones y
            cambios de color según los siguientes casos. El costo en el peor de
            los casos es O(log n) incluyendo hasta tres rotaciones.
          </p>
        </div>
        <h3 className="font-bold mb-2 text-yellow-300">
          Casos de eliminación:
        </h3>
        <ul className="list-none space-y-2 text-[15.5px]">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 1:</b> El nodo es hoja, se elimina fácilmente.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 2:</b> El nodo hermano y sus dos hijos son negros: el negro
            extra sube por el árbol.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 3:</b> El nodo tiene dos hijos: se reemplaza por el sucesor
            (el menor del subárbol derecho), y este sucesor como máximo tiene un
            hijo y se puede borrar.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 4:</b> El hermano o su hijo más cercano al nodo son negros,
            el otro es rojo: se cambian colores y se rota para sacar el extra
            negro.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <b>caso 5:</b> El nodo tiene un hijo hoja, se reemplaza el nodo por
            el hijo y se borra.
          </li>
        </ul>
      </section>
    </div>
  );
}
