import img1 from "../../../../../assets/images/definicion_splay_1.jpg";
import img2 from "../../../../../assets/images/definicion_splay_2.jpg";
import img3 from "../../../../../assets/images/definicion_splay_3.jpg";
import img4 from "../../../../../assets/images/definicion_splay_4.jpg";
import img5 from "../../../../../assets/images/definicion_splay_5.jpg";
import img6 from "../../../../../assets/images/definicion_splay_6.jpg";
import img7 from "../../../../../assets/images/definicion_splay_7.jpg";
import img8 from "../../../../../assets/images/definicion_splay_8.jpg";
import img9 from "../../../../../assets/images/definicion_splay_9.jpg";

export function DefinitionArbolSplay() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* Header principal */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600"></div>
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Splay
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol binario autoajustable
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Definición */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-2">Definición</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15px]">
            <li>
              Los árboles biseleados (inglés: <b>splay tree</b>) son árboles
              binarios de búsqueda que ofrecen en tiempo <b>O(log n)</b> las
              operaciones de búsqueda, inserción y eliminación de un nodo.
            </li>
            <li>
              En un árbol biseleado cada vértice contiene una clave y las claves
              en el ramo izquierdo son menores que la clave del vértice mismo,
              mientras a la derecha están las claves mayores.
            </li>
            <li>Las claves son únicas.</li>
          </ul>
        </div>
      </section>

      {/* Operación Splay */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Operación Splay
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4">
          <p className="text-gray-100 mb-2">
            La idea básica es que después de acceder a un nodo éste se lleva a
            la raíz mediante rotaciones. En cada operación splay se hace
            ascender al nodo en uno o dos niveles, dependiendo de su orientación
            relativa respecto de su nodo abuelo.
            <br />
            Un splay mueve el elemento recuperado a la raíz del árbol. Así, un
            splay hace que:
          </p>
          <ul className="list-none mt-2 space-y-2 text-[15.5px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Todos los nodos accedidos durante una consulta luego sean mucho
                menos costosos de acceder.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Todos los demás nodos no accedidos, su consulta se empeora sólo
                un poco.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Ejemplo de Splay (1,S) */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-red-400 mb-3">
          Ejemplo de Splay (1,S):
        </h2>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* Ejemplo de Splay (2,S) */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-red-400 mb-3">
          Ejemplo de Splay (2,S):
        </h2>
        <div className="flex justify-center my-5">
          <img
            src={img3}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* Casos Zig y Zag */}
      <section className="mb-8">
        <p className="text-gray-100 mb-2">
          Para hacer <b>splay</b> en un nodo x, repetimos los siguientes pasos
          hasta que x sea la raíz del árbol:
        </p>
        {/* Zig */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zig:</span> si x es un hijo
            izquierdo de la raíz del árbol, rotar x a derecha y terminar.
          </h3>
          <div className="flex justify-center my-5">
            <img
              src={img4}
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-2xl w-full p-4"
            />
          </div>
        </div>
        {/* Zag */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zag:</span> si x es un hijo
            derecho de la raíz del árbol, rotar x a izquierda y terminar.
          </h3>
          <div className="flex justify-center my-5">
            <img
              src={img5}
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-2xl w-full p-4"
            />
          </div>
        </div>
      </section>

      {/* Zig-Zig */}
      <section className="mb-8">
        <h3 className="font-semibold mb-2">
          <span className="text-red-400">Caso Zig-Zig:</span> si x es un hijo
          izquierdo y su padre es un hijo izquierdo, rotar el padre de x y luego
          en x ambos a derecha.
        </h3>
        <div className="flex justify-center my-5">
          <img
            src={img6}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* Zag-Zag */}
      <section className="mb-8">
        <h3 className="font-semibold mb-2">
          <span className="text-red-400">Caso Zag-Zag:</span> si x es un hijo
          derecho y su padre es un hijo derecho, rotar el padre de x y luego en
          x ambos a izquierda.
        </h3>
        <div className="flex justify-center my-5">
          <img
            src={img7}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Caso Zag-Zag"
          />
        </div>
      </section>

      {/* Zig-Zag */}
      <section className="mb-8">
        <h3 className="font-semibold mb-2">
          <span className="text-red-400">Caso Zig-Zag:</span> si x es un hijo
          izquierdo y su padre es un hijo derecho, rotar en x a derecha y luego
          en x de nuevo, pero a izquierda.
        </h3>
        <div className="flex justify-center my-5">
          <img
            src={img8}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Caso Zig-Zag"
          />
        </div>
      </section>

      {/* Zag-Zig */}
      <section className="mb-12">
        <h3 className="font-semibold mb-2">
          <span className="text-red-400">Caso Zag-Zig:</span> si x es un hijo
          derecho y su padre es un hijo izquierdo, rotar en x a izquierda y
          luego en x de nuevo pero a derecha.
        </h3>
        <div className="flex justify-center my-5">
          <img
            src={img9}
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            alt="Caso Zag-Zig"
          />
        </div>
      </section>
    </div>
  );
}
