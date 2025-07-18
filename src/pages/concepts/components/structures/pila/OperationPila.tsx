import img2 from "../../../../../assets/images/definicion_pila_2.jpg";
import img3 from "../../../../../assets/images/definicion_pila_3.jpg";

export function OperationPila() {
  return (
    <div className="py-4 px-10">
      <h1 className="text-2xl font-extrabold mb-1 text-white">OPERACIONES</h1>
      <h1 className="text-sm text-red-400 mb-3">Pila</h1>
      <hr className="mt-2 mb-4 border-red-500 border-t-2" />
      <p className="mb-2">
        La estructura de Datos Pila solo realiza dos operaciones que conforman
        el funcionamiento, estás son:
      </p>
      <ul className="space-y-3 ml-4">
        <li>✨ Apilar.</li>
        <li>✨ Desapilar.</li>
      </ul>
      <div className="text-sm text-gray-300 leading-6">
        <h1 className="text-xl font-bold text-red-500 mb-3 mt-3">Apilar</h1>
        <p className="mb-5">
          Esta acción consiste en la inserción de elementos en la pila, cabe
          mencionar que se pueden encontrar datos repetidos y que no se
          encuentren ordenados en la estructura.
        </p>
        <img src={img2} alt="img 1" />
        <p className="my-3 font-bold">Pasos del proceso:</p>
        <ul className="space-y-3 ml-4">
          <li>
            ✨ Se crea una referencia (puntero) o enlace hacia el nuevo nodo que
            se quiere agregar.
          </li>
          <li>
            ✨ Se ajusta el enlace del nuevo nodo para que apunte al nodo que
            está actualmente en la parte superior de la pila (el tope).
          </li>
          <li>
            ✨ Se actualiza el puntero del tope de la pila para que ahora apunte
            al nuevo nodo.
          </li>
        </ul>
      </div>
      <div className="text-sm text-gray-300 leading-6">
        <h1 className="text-xl font-bold text-red-500 mb-3 mt-3">Desapilar</h1>
        <p className="mb-5">
          Acción que elimina el elemento que se encuentre en el tope de la
          estructura, es decir, el ultimo elemento que fue insertado en la Pila,
          debido que su caracteristica LIFO (último en entrar, último en salir).
        </p>
        <img src={img3} alt="img 1" />
        <p className="my-3 font-bold">Pasos del proceso:</p>
        <ul className="space-y-3 ml-4">
          <li>✨ Se verifica que la pila no esté vacía.</li>
          <li>
            ✨ Se guarda temporalmente la referencia del nodo que está en el
            tope de la pila.
          </li>
          <li>
            ✨ Se actualiza el puntero del tope para que apunte al siguiente
            nodo (el que está debajo del tope actual).
          </li>
          <li>
            ✨ Se libera la memoria (si es necesario) o se descarta el nodo que
            se retiró.
          </li>
        </ul>
      </div>
    </div>
  );
}
