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
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Lista Circular Doblemente Enlazada
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura Lineal Circular Bidireccional
      </span>
      <hr className="border-t-2 border-red-500 mb-7 w-40 rounded" />

      {/* Descripción */}
      <section className="space-y-4 text-[15px] text-gray-200 leading-7">
        <h3 className="text-xl font-bold text-red-500 mb-1">Descripción</h3>
        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            Una{" "}
            <b className="text-red-400">lista circular doblemente enlazada </b>
            combina las características de una lista doble y una lista circular.
            Cada nodo mantiene dos referencias: un puntero <b>sig</b> hacia el
            nodo siguiente y un puntero <b>ant</b> hacia el nodo anterior. El
            último nodo apunta a la cabeza y la cabeza apunta hacia atrás al
            último nodo, formando un círculo bidireccional.
          </p>
          <div className="my-4 flex justify-center">
            <img
              src={img1}
              alt="estructura nodo circular doble"
              className="w-full h-auto max-w-xs sm:max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
          </div>
          <ul className="pl-4 space-y-1">
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Campo{" "}
              <b>Información</b> que guarda el dato.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Puntero <b>sig</b>{" "}
              que enlaza con el nodo siguiente.
            </li>
            <li className="flex gap-2 items-start">
              <span className="text-red-400 mt-1">•</span> Puntero <b>ant</b>{" "}
              que enlaza con el nodo anterior.
            </li>
          </ul>
          <p className="mt-3">
            Esta estructura permite recorrer la lista tanto en dirección hacia
            adelante como hacia atrás, partiendo de cualquier nodo.
          </p>
          <p className="mt-3">
            Como en una lista doblemente enlazada, las inserciones y
            eliminaciones pueden ser hechas desde cualquier punto con acceso a
            algún nodo contiguo. Aunque estructuralmente una lista circular
            doblemente enlazada no tiene ni principio ni fin, un puntero de
            acceso externo (centinela) puede establecer el nodo apuntado que
            está en la cabeza o al nodo final, y así mantener el orden como en
            una lista doblemente enlazada. La búsqueda y los algoritmos de
            ordenación se simplifican si se usan los llamados Nodos Centinelas o
            cabecera, donde cada elemento apunta a otro elemento y nunca a nulo.
            El Nodo Centinela o Puntero Cabeza contiene, como otro, un puntero
            siguiente que apunta al que se considera como primer elemento de la
            lista También contiene un puntero previo que hace lo mismo con el
            último elemento. El Nodo Centinela es definido como otro nodo en una
            lista doblemente enlazada. Si los punteros anterior y siguiente
            apuntan al Nodo Centinela la lista se considera vacía. En otro caso,
            si a la lista se le añaden elementos ambos puntero apuntarán a otros
            nodos. Estos Nodos Centinelas simplifican muchos las operaciones
            pero hay que asegurarse de que los punteros anterior y siguiente
            existen en cada momento.
          </p>
        </div>

        <div className="bg-[#18191a] border-l-4 border-red-500 rounded-md p-4 shadow">
          <p>
            La inserción y eliminación son más flexibles que en otras listas, ya
            que se puede actualizar los punteros <b>ant</b> y <b>sig</b> de los
            nodos adyacentes sin necesidad de recorrer toda la estructura.
          </p>
          <p>
            <span className="text-red-400 font-semibold">Ventaja:</span> permite
            recorridos en ambas direcciones, operaciones eficientes sin
            necesidad de localizar el nodo anterior y es útil en aplicaciones
            donde se requiere un acceso circular continuo.
          </p>
        </div>
      </section>

      {/* Ejemplo de Insertar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Insertar
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p className="text-gray-200">
            Se insertan los números: <b>23, 10,16, 1 y 29</b> en una Lista
            Circular Doble. Cada nuevo nodo se enlaza bidireccionalmente, y el
            último siempre apunta a la cabeza.
          </p>
          <div className="flex flex-col items-center gap-2 my-6">
            <img
              src={img2}
              alt="cadena de nodos circulares dobles"
              className="w-full h-auto max-w-md md:max-w-lg rounded-xl border border-red-600 shadow"
            />
            <span className="text-gray-400 text-xs text-center max-w-lg">
              La lista mantiene un ciclo en ambos sentidos: el último nodo
              apunta a la cabeza, y la cabeza al último nodo.
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <img
              src={img3}
              alt="inserción paso 1 circular doble"
              className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
            />
          </div>
          <p className="mt-3">Resultado final:</p>
          <img
            src={img4}
            alt="inserción paso 2 circular doble"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-cyan-400 shadow mx-auto"
          />
        </div>
      </section>

      {/* Ejemplo de Eliminar */}
      <section className="mt-10 space-y-5">
        <h3 className="text-xl font-bold text-red-500 mb-1">
          Ejemplo: Eliminar
        </h3>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3">
          <p>Considerando la siguiente Lista Circular Doble:</p>
          <img
            src={img5}
            alt="lista circular doble resultante"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-green-400 shadow mx-auto"
          />
          <p>
            Se elimina el nodo con valor <b>29</b>. Se ajustan los punteros{" "}
            <b>sig</b> del nodo anterior y <b>ant</b> del nodo siguiente para
            saltar el nodo eliminado. Si el nodo eliminado es la cabeza, se
            actualiza la referencia y el puntero del último nodo.
          </p>
          <img
            src={img6}
            alt="lista circular doble con nodo a eliminar"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
          <p>Lista final después de eliminar:</p>
          <img
            src={img7}
            alt="ajuste punteros circular doble"
            className="w-full h-auto max-w-md md:max-w-lg rounded-lg border border-yellow-400 shadow mx-auto"
          />
        </div>
      </section>
    </div>
  );
}
