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
        <div className="h-7 w-2 rounded bg-red-600" />
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
        <h2 className="text-2xl font-bold text-red-500 mb-2">Definición</h2>
        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow mb-4">
          <ul className="list-disc list-inside text-gray-200 space-y-2 text-[15.5px] leading-relaxed">
            <li>
              Los <b>árboles splay</b> (o <b>biseleados</b>, del inglés{" "}
              <b>splay tree</b>) son árboles binarios de búsqueda que, de forma{" "}
              <b>amortizada</b>, ofrecen tiempo <b>O(log n)</b> para las
              operaciones de búsqueda, inserción y eliminación.
            </li>
            <li>
              Como en todo <b>árbol binario de búsqueda</b>, en cada vértice las
              claves del <b>subárbol izquierdo</b> son menores que la clave del
              vértice, y las del <b>subárbol derecho</b> son mayores.
            </li>
            <li>
              Las claves son <b>únicas</b>. El árbol se va reestructurando
              dinámicamente mediante rotaciones cada vez que se accede a un
              nodo.
            </li>
          </ul>
        </div>
      </section>

      {/* Resumen visual */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-cyan-400 mb-2">
          Resumen visual (idea rápida)
        </h2>
        <div className="bg-[#111217] border border-cyan-500/60 rounded-lg p-4 shadow text-[15.5px] flex flex-col gap-3">
          <p className="text-gray-100">
            Un árbol Splay es un <b>ABB normal</b> al que se le aplica una
            operación extra llamada <b>splay</b> cada vez que se accede a un
            nodo (búsqueda, inserción o eliminación).
          </p>
          <ul className="list-disc list-inside text-gray-100 space-y-1">
            <li>
              El nodo recién accedido se <b>mueve hacia la raíz</b> mediante
              rotaciones.
            </li>
            <li>
              Los nodos accedidos con frecuencia tienden a quedar{" "}
              <b>cerca de la raíz</b>, y por tanto son más rápidos de volver a
              encontrar.
            </li>
            <li>
              Los nodos menos utilizados se alejan un poco de la raíz, pero el
              costo total promedio de muchas operaciones sigue siendo{" "}
              <b>O(log n)</b>.
            </li>
          </ul>
          <p className="text-gray-300 text-sm">
            Intuición: el árbol se “autoajusta” alrededor de los elementos
            usados recientemente.
          </p>
        </div>
      </section>

      {/* Operación Splay */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Operación Splay
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-4 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            La idea básica es que, después de acceder a un nodo <b>x</b>, se
            aplica la operación <b>splay(x)</b>, que lo hace subir a la raíz
            mediante una secuencia de rotaciones simples. En cada paso, x
            asciende uno o dos niveles, dependiendo de su posición respecto a su
            padre y a su abuelo.
          </p>
          <p className="text-gray-100 mb-2">
            Un splay mueve el elemento recuperado a la raíz del árbol. Esto
            provoca que:
          </p>
          <ul className="list-none mt-2 space-y-2 text-[15.5px]">
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Los nodos accedidos durante una consulta queden más cerca de la
                raíz, volviendo más baratas las consultas futuras sobre ellos.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-400 mt-1 text-lg">✱</span>
              <span className="text-gray-100">
                Los nodos no accedidos pueden quedar algo más lejos, pero su
                costo solo empeora ligeramente, manteniendo el comportamiento
                amortizado O(log n).
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Ejemplo de Splay (1,S) */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-red-400 mb-3">
          Ejemplo de splay (1,S): acceso repetido al nodo 1
        </h2>
        <div className="flex justify-center my-5">
          <img
            src={img1}
            alt="Secuencia inicial de splay en un árbol degenerado"
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
        <div className="flex justify-center my-5">
          <img
            src={img2}
            alt="Árbol reestructurado tras varias operaciones splay"
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* Ejemplo de Splay (2,S) */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-red-400 mb-3">
          Ejemplo de splay (2,S): acceso a un nodo intermedio
        </h2>
        <div className="flex justify-center my-5">
          <img
            src={img3}
            alt="Ejemplo de splay moviendo un nodo intermedio a la raíz"
            className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
          />
        </div>
      </section>

      {/* Patrones de rotación */}
      <section className="mb-10">
        <h2 className="text-2xl font-extrabold text-red-500 mb-3 drop-shadow">
          Patrones de rotación en splay(x)
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow mb-6 text-[15.5px] leading-relaxed">
          <p className="text-gray-100 mb-2">
            Para describir los casos usaremos la siguiente notación:
          </p>
          <ul className="list-disc list-inside text-gray-100 space-y-1 mb-2">
            <li>
              <b>x</b>: nodo al que estamos aplicando <b>splay(x)</b>.
            </li>
            <li>
              <b>p</b>: padre de x.
            </li>
            <li>
              <b>g</b>: abuelo de x (padre de p), si existe.
            </li>
          </ul>
          <p className="text-gray-100">
            Mientras x no sea la raíz se aplican los siguientes patrones, según
            si x es hijo izquierdo o derecho de p y si p es hijo izquierdo o
            derecho de g.
          </p>
        </div>

        {/* Zig */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zig:</span> x es hijo directo de
            la raíz
          </h3>
          <p className="text-gray-100 text-[15.5px] mb-2">
            Se aplica cuando x es hijo de la raíz y no existe abuelo g. Se hace
            una sola rotación:
          </p>
          <ul className="list-disc list-inside text-gray-100 text-[15.5px] mb-2">
            <li>
              Si x es hijo <b>izquierdo</b> de la raíz, se rota <b>a derecha</b>
              .
            </li>
            <li>
              Si x es hijo <b>derecho</b> de la raíz, se rota <b>a izquierda</b>
              .
            </li>
          </ul>
          <div className="flex justify-center my-5">
            <img
              src={img4}
              alt="Caso Zig en un árbol splay: x hijo izquierdo de la raíz"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-2xl w-full p-4"
            />
          </div>
          <div className="flex justify-center my-5">
            <img
              src={img5}
              alt="Caso Zag (simétrico de Zig) en un árbol splay: x hijo derecho de la raíz"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-2xl w-full p-4"
            />
          </div>
        </div>

        {/* Zig-Zig */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zig-Zig:</span> x y p están en
            el mismo lado de g (izquierda-izquierda)
          </h3>
          <p className="text-gray-100 text-[15.5px] mb-2">
            Se aplica cuando x es hijo <b>izquierdo</b> de p y p es hijo{" "}
            <b>izquierdo</b> de g. Se realizan dos rotaciones en la{" "}
            <b>misma dirección</b> (a derecha):
          </p>
          <ul className="list-disc list-inside text-gray-100 text-[15.5px] mb-2">
            <li>Primero se rota g respecto de p.</li>
            <li>Luego se rota p respecto de x.</li>
          </ul>
          <div className="flex justify-center my-5">
            <img
              src={img6}
              alt="Caso Zig-Zig en un árbol splay"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>

        {/* Zag-Zag */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zag-Zag:</span> x y p están en
            el mismo lado de g (derecha-derecha)
          </h3>
          <p className="text-gray-100 text-[15.5px] mb-2">
            Simétrico del caso anterior: x es hijo <b>derecho</b> de p y p es
            hijo <b>derecho</b> de g. Se realizan dos rotaciones{" "}
            <b>a izquierda</b>:
          </p>
          <ul className="list-disc list-inside text-gray-100 text-[15.5px] mb-2">
            <li>Primero se rota g respecto de p.</li>
            <li>Luego se rota p respecto de x.</li>
          </ul>
          <div className="flex justify-center my-5">
            <img
              src={img7}
              alt="Caso Zag-Zag en un árbol splay"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>

        {/* Zig-Zag */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zig-Zag:</span> x y p están en
            lados opuestos (izquierda-derecha)
          </h3>
          <p className="text-gray-100 text-[15.5px] mb-2">
            x es hijo <b>izquierdo</b> de p y p es hijo <b>derecho</b> de g. Se
            realizan dos rotaciones en <b>direcciones opuestas</b>:
          </p>
          <ul className="list-disc list-inside text-gray-100 text-[15.5px] mb-2">
            <li>Primero se rota p respecto de x.</li>
            <li>Luego se rota g respecto de x.</li>
          </ul>
          <div className="flex justify-center my-5">
            <img
              src={img8}
              alt="Caso Zig-Zag en un árbol splay"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>

        {/* Zag-Zig */}
        <div className="mb-12">
          <h3 className="font-semibold mb-2">
            <span className="text-red-400">Caso Zag-Zig:</span> x y p están en
            lados opuestos (derecha-izquierda)
          </h3>
          <p className="text-gray-100 text-[15.5px] mb-2">
            x es hijo <b>derecho</b> de p y p es hijo <b>izquierdo</b> de g.
            También se realizan dos rotaciones en <b>direcciones opuestas</b>:
          </p>
          <ul className="list-disc list-inside text-gray-100 text-[15.5px] mb-2">
            <li>Primero se rota p respecto de x.</li>
            <li>Luego se rota g respecto de x.</li>
          </ul>
          <div className="flex justify-center my-5">
            <img
              src={img9}
              alt="Caso Zag-Zig en un árbol splay"
              className="bg-white rounded-xl border-2 border-cyan-400 shadow max-w-4xl w-full p-4"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
