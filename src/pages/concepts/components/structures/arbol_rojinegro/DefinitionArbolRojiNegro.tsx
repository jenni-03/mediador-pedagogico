import img1 from "../../../../../assets/images/definicion_rojinegro_1.jpg";
import img2 from "../../../../../assets/images/definicion_rojinegro_2.jpg";
import img3 from "../../../../../assets/images/definicion_rojinegro_3.jpg";

export function DefinitionArbolRojiNegro() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-5xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol RojiNegro
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol binario de búsqueda balanceado
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-2">Definición</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-200 mb-2">
            Un árbol rojo-negro es un árbol binario de búsqueda en el que cada
            nodo almacena un bit adicional de información llamado <b>color</b>,
            el cual puede ser rojo o negro. Sobre este atributo de color se
            aplican restricciones que resultan en un árbol en el que ningún
            camino de la raíz a una hoja es más de dos veces más largo que
            cualquier otro, lo cual significa que el árbol es balanceado.
          </p>
          <p className="text-gray-200 mb-2">
            Cada nodo de un árbol rojo negro contiene la siguiente información:
            color, clave, hijo izquierdo, hijo derecho y padre. Si un hijo o el
            padre de un nodo no existe, el apuntador correspondiente contiene el
            valor NULO, el cual consideraremos como un nodo cuyo color es negro.
            En lo sucesivo nos referiremos a los nodos distintos a las hojas
            (NULO) como nodos internos del árbol y a las hojas y al padre de la
            raíz como nodos externos.
          </p>
          <p className="text-gray-200 mb-2">
            Los árboles Rojo–Negros son un tipo de árbol que están balanceados
            de tal manera que el tiempo de realizar operaciones sea O(log n) en
            el peor de los casos. La complejidad y el comportamiento de un árbol
            Rojo-Negro es mucho mejor que un AVL o un Árbol binario de búsqueda,
            según la gráfica se puede observar ese comportamiento. Es un árbol
            BB balanceado. Cada nodo almacena un dato más llamado “color”, puede
            ser rojo o negro.
          </p>
        </div>
        <div className="flex justify-center my-6">
          <img
            src={img1}
            alt="Estructura de nodo rojo-negro"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-xl w-full p-4"
          />
        </div>
        <div className="flex justify-center my-6">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-2xl w-full p-4"
          />
        </div>
      </section>

      {/* Propiedades */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-3">
          Propiedades del Árbol RojiNegro
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-6">
          <ul className="space-y-2">
            <li>
              <span className="text-cyan-400 font-bold">1</span> Todo nodo es
              rojo o negro.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">2</span> La raíz es
              negra.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">3</span> Toda hoja
              (NULO) es negra.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">4</span> Un nodo es rojo
              cuando sus dos hijos son negros.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">5</span> En un camino,
              no puede haber más de dos nodos rojos consecutivos, pero sí pueden
              haber n nodos negros consecutivos. Esto significa que un nodo rojo
              no puede tener ningún hijo rojo.
            </li>
            <li>
              <span className="text-cyan-400 font-bold">6</span> Para cada nodo,
              todas las rutas de un nodo a las hojas (NULOs) contienen el mismo
              número de nodos negros. El número de nodos negros en esta ruta se
              conoce como <b>altura-negra</b> del nodo.
            </li>
          </ul>
        </div>
      </section>

      {/* Terminología */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Terminología</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="mb-2 text-gray-100">
            <b>Altura negra</b> de un nodo x, an(x): es el número de nodos
            negros desde x (sin incluir x) hasta cualquier hoja descendente de
            x.
            <br />
            <b>Altura negra</b> de un árbol: la altura negra de su raíz.
          </p>
        </div>
        <div className="flex justify-center my-6">
          <img
            src={img3}
            alt="Altura negra en árbol rojo-negro"
            className="bg-white rounded-xl border-2 border-red-500 shadow max-w-5xl w-full p-4"
          />
        </div>
      </section>

      {/* Explicación y ventajas */}
      <section className="mb-10">
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-3">
            Dado que las operaciones básicas como insertar, borrar y encontrar
            valores tienen un peor tiempo de búsqueda proporcional a la altura
            del árbol, esta cota superior de la altura permite a los árboles
            rojo-negro ser eficientes en el peor caso, de forma contraria a lo
            que sucede en los árboles binarios de búsqueda. Para ver que estas
            propiedades garantizan lo dicho, basta ver que ningún camino puede
            tener 2 nodos rojos seguidos debido a la propiedad 4. El camino más
            corto posible tiene todos sus nodos negros, y el más largo alterna
            entre nodos rojos y negros. Como todos los caminos máximos tienen el
            mismo número de nodos negros, por la propiedad 5, esto muestra que
            no hay ningún camino que pueda tener el doble de longitud que otro
            camino.
          </p>
          <p className="text-gray-100 mb-3">
            En muchas presentaciones de estructuras arbóreas de datos, es
            posible para un nodo tener solo un hijo y las hojas contienen
            información. Es posible presentar los árboles rojo-negro en este
            paradigma, pero cambian algunas de las propiedades y se complican
            los algoritmos. Por esta razón, este artículo utiliza “hojas nulas”,
            que no contienen información y simplemente sirven para indicar dónde
            el árbol acaba, como se mostró antes. Habitualmente estos nodos son
            omitidos en las representaciones, lo cual da como resultado un árbol
            que parece contradecir los principios expuestos antes, pero que
            realmente no los contradice. Como consecuencia de esto, todos los
            nodos internos tienen dos hijos, aunque uno o ambos nodos podrían
            ser una hoja nula.
          </p>
          <p className="text-gray-100">
            Otra explicación que se da del árbol rojo-negro es la de tratarlo
            como un árbol binario de búsqueda cuyas aristas, en lugar de nodos,
            son coloreadas de color rojo o negro, pero esto no produce ninguna
            diferencia. El color de cada nodo en la terminología de este
            artículo corresponde al color de la arista que une el nodo a su
            padre, excepto la raíz, que es siempre negra (por la propiedad 2)
            donde la correspondiente arista no existe.
          </p>
        </div>
      </section>

      {/* Ventajas y desventajas */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-red-500 mb-3">Ventajas</h2>
        <ul className="list-none mt-2 space-y-3 text-[15.5px]">
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Todas las operaciones son O(log n).
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Se mantienen más balanceados que otras estructuras.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg">✱</span>
            <span className="text-gray-100">
              Permite organizar un listado de números de manera sencilla.
            </span>
          </li>
        </ul>
        <h2 className="text-xl font-bold text-red-500 mt-10 mb-2">
          Desventajas:
        </h2>
        <ul className="list-none mt-2 space-y-3 text-[15.5px]">
          <li className="flex items-center gap-2">
            <span className="text-yellow-300 text-lg">✱</span>
            <span className="text-gray-100">
              Su costo espacial es mayor que el de otros árboles por el uso de
              nodos centinelas.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
