import img1 from "../../../../../assets/images/definicion_ls_1.jpg";
import img2 from "../../../../../assets/images/definicion_ls_2.jpg";
import img3 from "../../../../../assets/images/definicion_ls_3.jpg";
import img4 from "../../../../../assets/images/definicion_ls_4.jpg";
import img5 from "../../../../../assets/images/definicion_ls_5.jpg";
import img6 from "../../../../../assets/images/definicion_ls_6.jpg";
import img7 from "../../../../../assets/images/definicion_ls_7.jpg";
import img8 from "../../../../../assets/images/definicion_ls_8.jpg";

export function DefinitionListaSimple() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      <h1 className="text-3xl font-extrabold mb-1 text-white">
        Lista Simple Enlazada
      </h1>
      <h2 className="text-sm text-red-400 mb-4">Estructura Lineal</h2>
      <hr className="border-t-2 border-red-500 mb-6 w-full" />

      <section className="space-y-4 text-sm text-gray-300 leading-6">
        <h3 className="text-xl font-bold text-red-500">Descripción</h3>
        <p>
          Estructura conformada por un elemento fundamental denominado{" "}
          <strong>Nodo</strong>. El nodo contiene la información y la dirección
          del siguiente elemento. El primer nodo se llama{" "}
          <strong>cabeza</strong> y sirve como punto de partida.
        </p>
        <p>Un nodo consta de dos partes:</p>
        <img src={img1} alt="estructura del nodo" className="rounded-lg my-2" />
        <p>
          ✨ Un campo <strong>Información</strong> que almacena el dato.
        </p>
        <p>
          ✨ Un puntero <strong>sig</strong> que apunta al siguiente nodo. Si es
          el último, apunta a <strong>NULL</strong>.
        </p>
        <p>
          Los nodos no necesitan estar en posiciones contiguas en memoria, el
          puntero se encarga de enlazarlos.
        </p>
        <p>
          La lista forma una cadena de nodos ordenados linealmente. Se inserta
          un nodo apuntando donde apuntaba la cabeza y luego se actualiza la
          cabeza al nuevo nodo.
        </p>
        <img src={img2} alt="cadena de nodos" className="rounded-lg my-2" />
        <p>
          El salto de enlace permite recorrer la lista nodo a nodo. A diferencia
          de un arreglo, no hay índices fijos, por lo tanto no se puede saber
          directamente en qué posición está un nodo.
        </p>
        <p>
          Además, una lista simple enlazada no tiene un tamaño fijo, usa espacio
          dinámico y es proporcional al número de nodos.
        </p>
      </section>

      <section className="mt-10 space-y-4 text-sm text-gray-300 leading-6">
        <h3 className="text-xl font-bold text-red-500">Ejemplo de Insertar</h3>
        <p>Se insertan los números: 10, 1, 23, 2, 12 en una Lista Simple.</p>
        <img src={img3} alt="inserción paso 1" className="rounded-lg" />
        <img src={img4} alt="inserción paso 2" className="rounded-lg" />
        <p>Resultado final:</p>
        <img src={img5} alt="lista resultante" className="rounded-lg" />
      </section>

      <section className="mt-10 space-y-4 text-sm text-gray-300 leading-6">
        <h3 className="text-xl font-bold text-red-500">Ejemplo de Eliminar</h3>
        <p>Teniendo la siguiente Lista Simple:</p>
        <img
          src={img6}
          alt="lista con nodo a eliminar"
          className="rounded-lg"
        />
        <p>
          Se desea eliminar el nodo con valor 11. Se actualiza el puntero{" "}
          <code>sig</code> del nodo anterior para que apunte al nodo siguiente
          al eliminado.
        </p>
        <img src={img7} alt="puntero actualizado" className="rounded-lg" />
        <p>Lista final después de eliminar:</p>
        <img src={img8} alt="lista tras eliminación" className="rounded-lg" />
      </section>
    </div>
  );
}
