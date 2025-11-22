export function OperationArbolAVL() {
  return (
    <div className="py-6 px-6 sm:px-10 text-white bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-2 rounded bg-red-600" />
        <h1 className="text-3xl font-extrabold tracking-wide drop-shadow">
          Operaciones · Árbol AVL
        </h1>
      </div>
      <span className="text-base text-red-400 ml-3 font-medium block mb-2">
        Árbol Binario Balanceado (AVL)
      </span>
      <hr className="border-t-2 border-red-500 mb-8 w-40 rounded" />

      {/* Intro / Visión general */}
      <section className="mb-8">
        <div className="bg-[#18181c] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            Un <b>Árbol AVL</b> soporta las mismas operaciones que un Árbol
            Binario de Búsqueda (ABB), pero después de cada inserción o
            eliminación se asegura de mantener el <b>equilibrio</b> de todos sus
            nodos mediante rotaciones.
          </p>
          <p className="text-gray-200">
            Gracias a este balanceo, la altura del árbol se mantiene cercana a{" "}
            <b>O(log n)</b>, por lo que:
          </p>
          <div className="grid gap-3 md:grid-cols-3 text-xs sm:text-sm">
            <div className="bg-[#101016] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-red-300">Insertar</p>
              <p className="text-gray-300">Tiempo promedio: O(log n)</p>
            </div>
            <div className="bg-[#101016] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-red-300">Buscar</p>
              <p className="text-gray-300">Tiempo promedio: O(log n)</p>
            </div>
            <div className="bg-[#101016] rounded-lg px-3 py-2 border border-red-500/40">
              <p className="font-semibold text-red-300">Eliminar</p>
              <p className="text-gray-300">Tiempo promedio: O(log n)</p>
            </div>
          </div>
        </div>
      </section>

      {/* INSERTAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Insertar
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-400 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            La inserción en un <b>Árbol AVL</b> tiene dos fases: primero se
            inserta como en un ABB normal y luego se reequilibra el árbol.
          </p>

          <p className="font-semibold text-gray-100 mt-1">
            1. Inserción estilo ABB:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>Partir desde la raíz y comparar el valor con el nodo actual.</li>
            <li>
              Si el valor es menor, descender por el <b>subárbol izquierdo</b>;
              si es mayor, por el <b>subárbol derecho</b>.
            </li>
            <li>
              Repetir el proceso hasta encontrar una posición nula e insertar el
              nuevo nodo como hoja.
            </li>
          </ul>

          <p className="font-semibold text-gray-100 mt-2">
            2. Actualizar alturas y factores de equilibrio:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>
              Subir desde el nodo insertado hasta la raíz, recalculando la{" "}
              <b>altura</b> y el <b>factor de equilibrio (FE)</b> de cada nodo.
            </li>
            <li>
              Si un nodo queda con <b>FE</b> dentro del rango{" "}
              <span className="font-mono">[-1, 0, 1]</span>, no requiere
              rotación.
            </li>
            <li>
              Si algún nodo llega a <b>FE = +2</b> o <b>FE = −2</b>, el árbol
              está desbalanceado y se debe aplicar una rotación.
            </li>
          </ul>

          <div className="mt-3 bg-[#15151a] rounded-lg p-3 border border-red-500/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-300 mb-1">
              Casos de rotación al insertar
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[14px] text-gray-200">
              <li>
                <b>Izquierda–Izquierda (LL / RSI):</b> desbalance a la izquierda
                y el nuevo nodo se insertó en el subárbol izquierdo del hijo
                izquierdo.
              </li>
              <li>
                <b>Derecha–Derecha (RR / RSD):</b> desbalance a la derecha y el
                nuevo nodo se insertó en el subárbol derecho del hijo derecho.
              </li>
              <li>
                <b>Izquierda–Derecha (LR / RDI):</b> desbalance a la izquierda
                pero el nuevo nodo está en el subárbol derecho del hijo
                izquierdo.
              </li>
              <li>
                <b>Derecha–Izquierda (RL / RDD):</b> desbalance a la derecha pero
                el nuevo nodo está en el subárbol izquierdo del hijo derecho.
              </li>
            </ul>
          </div>

          <p className="italic text-red-300 mt-3">
            El objetivo es volver a dejar todos los nodos con FE en el rango{" "}
            <span className="font-mono">[-1, 0, 1]</span> sin perder el orden
            inorden del árbol.
          </p>
        </div>
      </section>

      {/* BUSCAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Buscar
        </h2>

        <div className="bg-[#19191d] border-l-4 border-cyan-400 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            La operación de búsqueda en un <b>Árbol AVL</b> es idéntica a la
            búsqueda en un ABB, pero se beneficia directamente del equilibrio
            automático:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>Comparar el valor buscado con la clave del nodo actual.</li>
            <li>Si son iguales, se ha encontrado el nodo.</li>
            <li>
              Si es menor, continuar la búsqueda por el subárbol izquierdo; si
              es mayor, por el derecho.
            </li>
            <li>
              El proceso termina cuando se encuentra el valor o se llega a un
              puntero nulo.
            </li>
          </ul>
          <p className="italic text-cyan-200">
            Como el árbol se mantiene balanceado, la altura es O(log n) y la
            búsqueda hereda esa eficiencia.
          </p>
        </div>
      </section>

      {/* EDITAR */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Editar
        </h2>

        <div className="bg-[#19191d] border-l-4 border-yellow-400 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            No existe una operación de <b>“editar”</b> directa en la teoría de
            árboles AVL, porque modificar una clave puede romper tanto la
            propiedad de búsqueda como el equilibrio.
          </p>
          <p className="font-semibold text-gray-100">
            Estrategia recomendada para cambiar la clave de un nodo:
          </p>
          <ul className="list-decimal pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>Buscar el nodo con la clave antigua.</li>
            <li>Guardar la información asociada (dato, payload, etc.).</li>
            <li>Eliminar el nodo del árbol AVL.</li>
            <li>
              Insertar un nuevo nodo con la <b>nueva clave</b> y la información
              guardada.
            </li>
          </ul>

          <div className="flex items-start gap-2 mt-2">
            <span className="text-yellow-300 text-xl font-bold mt-1">⚠️</span>
            <p className="text-yellow-200 text-[15px]">
              Cambiar la clave “in situ” sin reordenar puede dejar el árbol sin
              la propiedad de ABB y, por lo tanto, sin las garantías de
              eficiencia de un AVL.
            </p>
          </div>
        </div>
      </section>

      {/* ELIMINAR */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-3 text-red-400 flex items-center gap-2">
          Eliminar
        </h2>

        <div className="bg-[#19191d] border-l-4 border-red-500 rounded-md p-4 shadow space-y-3 text-sm leading-6">
          <p>
            La eliminación en un <b>Árbol AVL</b> combina la eliminación en un
            ABB con un proceso de rebalanceo desde el nodo afectado hasta la
            raíz.
          </p>

          <p className="font-semibold text-gray-100">
            1. Eliminar como en un ABB:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>
              <b>Nodo hoja:</b> se elimina directamente.
            </li>
            <li>
              <b>Nodo con un solo hijo:</b> se enlaza el padre con el hijo y se
              descarta el nodo.
            </li>
            <li>
              <b>Nodo con dos hijos:</b> se busca el sucesor inorden (mínimo del
              subárbol derecho) o el predecesor (máximo del subárbol izquierdo),
              se copia su valor y luego se elimina ese nodo auxiliar (que tendrá
              a lo sumo un hijo).
            </li>
          </ul>

          <p className="font-semibold text-gray-100 mt-2">
            2. Recalcular alturas y factores de equilibrio:
          </p>
          <ul className="list-disc pl-6 text-gray-200 space-y-1 text-[15px]">
            <li>
              Subir desde el punto de eliminación actualizando la altura de cada
              nodo.
            </li>
            <li>
              Recalcular el <b>FE</b>. Si permanece en el rango{" "}
              <span className="font-mono">[-1, 0, 1]</span>, continuar hacia el
              padre.
            </li>
            <li>
              Si algún nodo queda con <b>FE = +2</b> o <b>FE = −2</b>, aplicar la
              rotación correspondiente (LL, RR, LR o RL), igual que en la
              inserción.
            </li>
          </ul>

          <div className="bg-[#15151a] rounded-lg p-3 mt-2 border border-red-500/40 text-[14px] text-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-300 mb-1">
              Nota sobre la propagación del rebalanceo
            </p>
            <p>
              Tras una eliminación, es posible que una primera rotación no sea
              suficiente: el cambio de altura puede afectar al padre, al abuelo,
              etc. Por eso, el algoritmo continúa hacia la raíz hasta que
              encuentra un nodo cuyo equilibrio cambia de ±1 a 0, o bien hasta
              llegar a la raíz con todos los nodos dentro del rango permitido.
            </p>
          </div>

          <p className="italic text-red-300 mt-3">
            El resultado final debe ser nuevamente un árbol binario de búsqueda
            con todos sus nodos cumpliendo el equilibrio AVL.
          </p>
        </div>
      </section>
    </div>
  );
}
