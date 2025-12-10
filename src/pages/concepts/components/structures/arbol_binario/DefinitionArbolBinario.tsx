import img1 from "../../../../../assets/images/definicion_arbol_1.png";
import img2 from "../../../../../assets/images/definicion_arbol_2.png";
import img3 from "../../../../../assets/images/definicion_arbol_3.png";
import img4 from "../../../../../assets/images/definicion_arbol_4.png";

export function DefinitionArbolBinario() {
  return (
    <div className="text-white py-8 px-3 sm:px-10 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Árbol Binario
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Estructura jerárquica · nodos y subárboles
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* SECCIÓN 1 · QUÉ ES UN ÁRBOL */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-3">
          ¿Qué es un Árbol?
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-4 text-[15px] leading-7">
          <p className="text-gray-200">
            Un <b className="text-red-400">árbol</b> es una estructura de datos
            jerárquica formada por nodos conectados mediante enlaces
            (ramas). Visualmente se parece a un “organigrama”: en la parte
            superior está la <b>raíz</b> y debajo de ella se despliegan los{" "}
            <b>subárboles</b>.
          </p>

          <div className="bg-[#151518] border border-red-500/60 rounded-md p-3">
            <p className="text-sm text-gray-100 font-semibold mb-2">
              Definición formal (idea general)
            </p>
            <ul className="list-disc list-inside text-gray-200 space-y-1 text-[14px]">
              <li>
                Existe un nodo especialmente designado llamado{" "}
                <b>raíz</b> del árbol <b>T</b>.
              </li>
              <li>
                Los nodos restantes (excluyendo la raíz) se agrupan en
                conjuntos disjuntos <b>T₁, T₂, …, Tₘ</b> (con m ≥ 0), y cada uno
                de ellos es a su vez un árbol: se llaman{" "}
                <b>subárboles de la raíz</b>.
              </li>
              <li>
                Los nodos que no son raíz de ningún subárbol se denominan{" "}
                <b>hojas</b> (no tienen hijos o sucesores).
              </li>
              <li>
                Si <b>n</b> es un nodo y <b>A₁, A₂, …, Aₖ</b> son árboles con
                raíces <b>n₁, n₂, …, nₖ</b>, se puede construir un nuevo árbol
                haciendo que <b>n</b> sea el <b>padre</b> de <b>n₁…nₖ</b>. Esos
                árboles pasan a ser los <b>subárboles</b> de la raíz.
              </li>
              <li>
                Los nodos <b>n₁…nₖ</b> reciben el nombre de{" "}
                <b>hijos del nodo n</b>.
              </li>
              <li>
                Si el conjunto de nodos <b>T</b> es vacío, hablamos de un{" "}
                <b>árbol vacío</b>.
              </li>
              <li>
                En todo árbol hay exactamente un nodo sin padre: la{" "}
                <b>raíz</b>. Todos los demás tienen <b>un único padre</b>.
              </li>
              <li>
                Los nodos distintos a <span className="text-cyan-300">null</span>{" "}
                se llaman <b>nodos internos (ni)</b>; de lo contrario, se
                denominan <b>nodos externos (ne)</b>.
              </li>
            </ul>
          </div>

          <div className="bg-[#15151a] border-l-4 border-cyan-400 rounded-md p-3 text-[14px] text-gray-200">
            <p className="font-semibold text-cyan-300 mb-1">
              Analogia rápida
            </p>
            <p>
              Puedes imaginar un árbol como una familia o un sistema de
              carpetas: cada nodo “padre” puede tener varios “hijos” y todos
              dependen, directa o indirectamente, de una única raíz.
            </p>
          </div>
        </div>

        <div className="flex justify-center my-6">
          <img
            src={img1}
            alt="Estructura general de un árbol"
            className="w-full h-auto max-w-2xl rounded-xl border-2 border-red-500 shadow bg-white"
          />
        </div>
      </section>

      {/* SECCIÓN 2 · ÁRBOLES BINARIOS */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-red-500 mb-3">
          ¿Qué es un Árbol Binario?
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Texto */}
          <div className="space-y-3 text-[15px] leading-7">
            <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow">
              <p className="mb-2 text-gray-200">
                Un <b className="text-red-400">árbol binario</b> es un caso
                particular de árbol en el que cada nodo puede tener como máximo{" "}
                <b>dos hijos</b>:
              </p>
              <ul className="list-disc list-inside text-gray-200 space-y-1 text-[14px]">
                <li>
                  Un <b>subárbol izquierdo</b>.
                </li>
                <li>
                  Un <b>subárbol derecho</b>.
                </li>
              </ul>
            </div>

            <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow">
              <p className="text-gray-200 mb-2">
                Formalmente, un árbol binario puede ser:
              </p>
              <ul className="list-disc list-inside text-gray-200 space-y-1 text-[14px]">
                <li>
                  El <b>árbol vacío</b>, o
                </li>
                <li>
                  Un nodo <b>raíz</b> con dos árboles binarios disjuntos:
                  subárbol izquierdo y subárbol derecho.
                </li>
              </ul>
              <p className="text-xs text-gray-300 mt-2">
                Este límite de “a lo sumo dos hijos” es lo que lo diferencia de
                un árbol general n-ario.
              </p>
            </div>
          </div>

          {/* Imagen */}
          <div className="flex justify-center">
            <img
              src={img2}
              alt="Ejemplo de árbol binario"
              className="w-full h-auto max-w-md rounded-xl border-2 border-cyan-400 shadow bg-white"
            />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3 · SUBÁRBOL IZQUIERDO Y DERECHO */}
      <section className="mb-10">
        <div className="bg-[#18191a] border-l-4 border-cyan-400 rounded-md p-4 shadow mb-4 text-[15px] leading-7">
          <p className="mb-2 text-gray-200">
            En un <b className="text-red-400">árbol general</b> no se distingue
            entre “primer hijo” o “segundo hijo”; solo existen conjuntos de
            subárboles.
          </p>
          <p className="text-gray-200">
            En un <b className="text-red-400">árbol binario</b>, en cambio,
            importa la posición: hablamos siempre de{" "}
            <span className="font-semibold text-cyan-300">
              subárbol izquierdo
            </span>{" "}
            y{" "}
            <span className="font-semibold text-cyan-300">
              subárbol derecho
            </span>
            . Dos árboles con los mismos valores pueden ser{" "}
            <b>estructuralmente distintos</b> si cambian esas posiciones.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <div className="flex flex-col items-center">
            <img
              src={img3}
              alt="Disposición 1 de los nodos"
              className="w-full max-w-xs h-auto rounded-xl border-2 border-yellow-400 shadow bg-white object-contain"
            />
            <span className="mt-2 text-xs text-gray-300 text-center">
              Misma colección de claves,{" "}
              <b className="text-yellow-300">estructura 1</b>.
            </span>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={img4}
              alt="Disposición 2 de los nodos"
              className="w-full max-w-xs h-auto rounded-xl border-2 border-yellow-400 shadow bg-white object-contain"
            />
            <span className="mt-2 text-xs text-gray-300 text-center">
              Misma colección de claves,{" "}
              <b className="text-yellow-300">estructura 2</b>.
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center max-w-2xl mx-auto">
          En problemas de búsqueda, recorrido u ordenación, la forma del árbol
          (su estructura) es tan importante como los valores que almacena.
        </p>
      </section>

      {/* SECCIÓN 4 · CONCEPTOS BÁSICOS */}
      <section>
        <h2 className="text-xl font-bold text-red-500 mb-2">
          Conceptos básicos de un Árbol
        </h2>
        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow">
          <p className="text-sm text-gray-200 mb-3">
            A continuación, un pequeño glosario para manejar el vocabulario más
            utilizado al trabajar con árboles:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-[14px] text-gray-200">
            <div>
              <p>
                <b>Grado de un nodo:</b> número de subárboles (hijos) que
                cuelgan de él.
              </p>
              <p className="mt-1">
                <b>Nodo terminal (hoja):</b> nodo con grado 0, sin subárboles.
              </p>
              <p className="mt-1">
                <b>Grado del árbol:</b> máximo grado de todos sus nodos.
              </p>
              <p className="mt-1">
                <b>Hijos de un nodo:</b> nodos conectados directamente “por
                debajo” de él.
              </p>
              <p className="mt-1">
                <b>Padre de un nodo:</b> nodo del que depende directamente.
              </p>
            </div>
            <div>
              <p>
                <b>Nodos hermanos:</b> nodos que comparten el mismo padre.
              </p>
              <p className="mt-1">
                <b>Camino:</b> sucesión de nodos donde cada uno es padre del
                siguiente.
              </p>
              <p className="mt-1">
                <b>Antecesores:</b> nodos desde la raíz hasta un nodo dado.
              </p>
              <p className="mt-1">
                <b>Nivel de un nodo:</b> longitud del camino desde la raíz hasta
                él.
              </p>
              <p className="mt-1">
                <b>Altura (profundidad) del árbol:</b> nivel máximo de sus
                nodos.
              </p>
              <p className="mt-1">
                <b>Bosque:</b> conjunto de árboles disjuntos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
