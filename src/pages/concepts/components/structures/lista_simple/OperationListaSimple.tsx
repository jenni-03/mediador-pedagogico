import img1 from "../../../../../assets/images/operacion_secuencia_1.png";
import img2 from "../../../../../assets/images/operacion_secuencia_2.jpg";
import img3 from "../../../../../assets/images/operacion_secuencia_3.jpg";
import img4 from "../../../../../assets/images/operacion_secuencia_4.jpg";
import img5 from "../../../../../assets/images/operacion_secuencia_5.jpg";
import img6 from "../../../../../assets/images/operacion_secuencia_6.jpg";

export function OperationListaSimple() {
  return (
    <div className="py-4 px-10">
      <h1 className="text-2xl font-bold mb-1">OPERACIONES</h1>
      <h1 className="text-sm text-gray-500 mb-3">Lista Simple</h1>
      <hr className="mt-2 mb-4 border-red-500 border-t-2" />
      <h1 className="text-2xl font-bold mb-1">
        INSERCIÓN DE UN ELEMENTO EN LA LISTA
      </h1>
      <div>
        <h1 className="text-2xl font-bold my-3">Inserción al Inicio</h1>
        <p className="text-gray-700 text-sm mb-5">
          El nuevo elemento que se desea incorporar a una lista se puede
          insertar de distintas formas, según la posición de inserción. Ésta
          puede ser:
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En la cabeza (elemento primero) de la lista.
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En el final de la lista (elemento último).
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">✨ Ordenado</p>
      </div>
      <div>
        <h1 className="text-2xl font-bold my-3">Inserción al Final</h1>
        <p className="text-gray-700 text-sm mb-5">
          El nuevo elemento que se desea incorporar a una lista se puede
          insertar de distintas formas, según la posición de inserción. Ésta
          puede ser:
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En la cabeza (elemento primero) de la lista.
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En el final de la lista (elemento último).
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">✨ Ordenado</p>
      </div>
      <div>
        <h1 className="text-2xl font-bold my-3">Inserción Ordenado</h1>
        <p className="text-gray-700 text-sm mb-5">
          El nuevo elemento que se desea incorporar a una lista se puede
          insertar de distintas formas, según la posición de inserción. Ésta
          puede ser:
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En la cabeza (elemento primero) de la lista.
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          ✨ En el final de la lista (elemento último).
        </p>
        <p className="text-sm text-gray-800 mt-3 leading-6">✨ Ordenado</p>
      </div>
      <h1 className="text-2xl font-bold my-5">
        Operaciones Editar, Buscar y Eliminar
      </h1>
      <div>
        <h1 className="text-2xl font-bold my-3">Editar</h1>
        <p className="text-gray-700 text-sm mb-5">
          La operación editar un elemento en una lista recorre la lista hasta
          encontrar la posición del nodo al que se desea modificar la
          información del elemento y actualiza la información del nodo por el
          nuevo elemento. El algoritmo, una vez modificada la información del
          nodo, devuelve la referencia a ese nodo (en caso negativo, devuelve
          null). Otro planteamiento es que el método devuelva true si se pudo
          modificar la información del nodo con el elemento, y false si no se
          pudo realizar la operación.
        </p>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-3">Buscar</h1>
        <p className="text-gray-700 text-sm mb-5">
          La operación búsqueda de un elemento en una lista enlazada recorre la
          lista hasta encontrar el nodo con el elemento. El algoritmo, una vez
          encontrado el nodo, devuelve la referencia a ese nodo (en caso
          negativo, devuelve null). Otro planteamiento es que el método devuelva
          true si encuentra el nodo con el elemento, y false si no está en la
          lista.
        </p>
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-3">Eliminar</h1>
        <p className="text-gray-700 text-sm mb-3">
          La operación de eliminar un dato de una lista supone enlazar el nodo
          anterior con el nodo siguiente al que se desea eliminar y liberar la
          memoria que ocupa. El algoritmo sigue estos pasos:
        </p>
        <ul className="space-y-3">
          {[
            "Búsqueda del nodo que contiene el dato. Se ha de obtener la dirección del nodo a eliminar y la dirección del anterior.",
            "El enlace del nodo anterior que apunte al nodo siguiente del que se elimina.",
            "Si el nodo a eliminar es el cabeza de la lista (primero), se modifica primero para que tenga la dirección del siguiente nodo.",
            "Por último, la memoria ocupada por el nodo se libera. Es el propio sistema el que libera el nodo, al dejar de estar referenciado.",
          ].map((texto, index) => (
            <li key={index} className="text-sm text-gray-800 leading-6">
              <span className="font-bold text-red-500">{index+1} </span>
              {texto}
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-800 mt-3 leading-6">
          De ser Lista Doble y/o Lista Circular Doble Quitar un nodo de una
          lista supone realizar el enlace de dos nodos, el nodo anterior con el
          nodo siguiente al que se desea eliminar. La referencia adelante del
          nodo anterior debe apuntar al nodo siguiente, y la referencia atrás
          del nodo siguiente debe apuntar al nodo anterior. El algoritmo es
          similar al del borrado para una lista simple. Ahora, la dirección del
          nodo anterior se encuentra en la referencia atrás del nodo a borrar.
          Los pasos a seguir son:
        </p>
        <ul className="space-y-3 mt-3">
          {[
            "Búsqueda del nodo que contiene el dato.",
            "La referencia adelante del nodo anterior tiene que apuntar a la referencia adelante del nodo a eliminar (si no es el nodo cabecera).",
            "La referencia atrás del nodo siguiente a borrar tiene que apuntar a la referencia atrás del nodo a eliminar (si no es el último nodo).",
            "Si el nodo que se elimina es el primero, cabeza, se modifica cabeza para que tenga la dirección del nodo siguiente.",
            "La memoria ocupada por el nodo es liberada automáticamente."
          ].map((texto, index) => (
            <li key={index} className="text-sm text-gray-800 leading-6">
              <span className="font-bold text-red-500">{index+1} </span>
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
