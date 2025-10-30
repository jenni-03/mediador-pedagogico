import { TourStep } from "../typesTour";

/**
 * Tour guiado para Árbol Rojo-Negro (RB-Tree).
 * Definición, analogía, invariantes, operaciones (insert/search/delete) y casos de fix-up.
 */
export function getArbolRojiNegroTour(): TourStep[] {
  const steps: TourStep[] = [
    // ───────────────────── Intro: ¿Qué es un RB-Tree? ─────────────────────
    {
      type: "info",
      description:
        `🌳 Un **Árbol Rojo-Negro** es un **Árbol Binario de Búsqueda auto-equilibrado** en el que cada nodo tiene un **color** (rojo o negro). 
          Gracias a sus reglas de balance, mantiene una altura de **O(log n)** y garantiza que las operaciones de **inserción**, **búsqueda** y **eliminación** 
          se ejecuten en **O(log n)** en el peor caso.`
    },
    {
      type: "info",
      description:
        `📏 Un Árbol Rojo-Negro debe cumplir ciertas **propiedades estructurales** que garantizan su balance: 
          1) La **raíz siempre es negra**. 
          2) Un nodo **rojo** no puede tener **hijo rojo** (prohibido rojo-rojo). 
          3) Todas las hojas nulas (**NIL**) son **negras**. 
          4) Cualquier camino desde un nodo a sus **NIL** tiene la **misma cantidad de nodos negros** (*black-height*).`
    },
    {
      type: "info",
      description:
        `🔧 Las operaciones de **inserción** y **eliminación** pueden infringir estas reglas. Cuando eso ocurre, el árbol aplica una serie de **casos correctivos** que combinan **recoloreos** y **rotaciones** para restaurar dichas propiedades:
          **Insert-Fixup** (tras insertar) y **Delete-Fixup** (tras eliminar).`
    },
    {
      type: "info",
      description:
        `↺ Antes de abarcar los casos correctivos, es importante tener presente el **cómo leer una rotación**.
         **Rotar izquierda en ‘p’**: sube el **hijo derecho** de ‘p’; ‘p’ baja a su **izquierda**. El subárbol **izquierdo** del antiguo hijo derecho pasa a ser el **derecho** de ‘p’.
         **Rotar derecha en ‘p’**: sube el **hijo izquierdo** de ‘p’; ‘p’ baja a su **derecha**. El subárbol **derecho** del antiguo hijo izquierdo pasa a ser el **izquierdo** de ‘p’.`
    },
    {
      type: "info",
      description:
        "📌 **Mnemónico**: el nombre de la rotación indica **qué hijo sube** (izquierda ⇒ sube el **derecho**; derecha ⇒ sube el **izquierdo**) no un desplazamiento hacia un valor."
    },

    // Insert-Fixup
    {
      type: "info",
      description:
        "⚙️ **Insert-Fixup**: El nodo recién insertado nace **rojo**. Tras insertarlo siguiendo las reglas de un ABB, se distinguen los siguientes casos correctivos si se presenta un **rojo-rojo**."
    },
    {
      type: "info",
      description:
        "A) **Padre negro** → No hay conflicto. El árbol ya cumple con las propiedades establecidas."
    },
    {
      type: "info",
      description:
        `B) **Padre rojo** y **tío rojo** → La solución consiste en **recolorear** el padre y el tío a **negro**, y el abuelo a **rojo**. 
         Si el abuelo era la raíz, se **recolorea** a **negro**. El conflicto puede **propagarse hacia arriba** y repetirse desde el abuelo hasta que el color del nuevo padre sea **negro** o hasta llegar a la **raíz**.`
    },
    {
      type: "info",
      description:
        `C) **Padre rojo**, **tío negro**, **triángulo (LR -> Left Right / RL -> Right Left)** → El nuevo nodo y su padre forman un **ángulo** con el abuelo. 
         La solución consiste en aplicar una **rotación sobre el padre que sube al nuevo nodo** (si el nodo está en el subárbol derecho, **rotación izquierda**; 
         si el nodo está en el subárbol izquierdo, **rotación derecha**). Con esto, la configuración de triángulo se convierte en **línea** (**LR → LL**, **RL → RR**), y se continua en el **caso D**.`
    },
    {
      type: "info",
      description:
        `D) **Padre rojo**, **tío negro**, **línea (LL -> Left Left / RR -> Right Right)** → El nuevo nodo y su padre forman una **línea** con el abuelo. 
         La solución consiste en aplicar una **rotación sobre el abuelo en la dirección del padre** (LL → **rotación derecha**; RR → **rotación izquierda**) y un **intercambio de colores** entre padre y abuelo. 
         Con esto, el nuevo pivote (antes padre) queda **negro** y el antiguo abuelo queda **rojo**; el árbol recupera su balance.`
    },

    // Delete-Fixup
    {
      type: "info",
      description:
        "⚙️ **Delete-Fixup**: Al eliminar un nodo **negro**, puede aparecer un **doble-negro** (déficit de negrura) en el hijo que lo sustituye, por lo que se distinguen los siguientes casos correctivos para disipar dicho déficit."
    },
    {
      type: "info",
      description:
        `A) **Hermano rojo** → Si el hermano del nodo **doble-negro** es **rojo**, se **recolorea** el hermano a **negro** y el padre a **rojo**. Luego se aplica una **rotación sobre el padre hacia el hermano** (si el hermano está en el subárbol derecho, **rotación izquierda**; 
         si el hermano está en el subárbol izquierdo, **rotación derecha**). Tras esto, el nuevo hermano del doble-negro es **negro** y el caso se reduce a **(B/C/D)**.`
    },
    {
      type: "info",
      description:
        `B) **Hermano negro con ambos hijos negros** → Si el hermano del nodo **doble-negro** es **negro** y sus 2 hijos también son **negros**, se **recolorea** el hermano a **rojo** y el **doble-negro asciende** al padre.
         Esto puede generar un nuevo conflicto en el padre, por lo que el proceso de *fixup* se repite desde allí hasta que el padre sea **rojo** (se **recolorea** a **negro**) o hasta llegar a la raíz.`
    },
    {
      type: "info",
      description:
        `C) **Hermano negro con hijo rojo cercano** → Si el hermano del nodo **doble-negro** es **negro** y su **hijo cercano** (el más próximo al doble-negro) es **rojo**, se **recolorean** el hijo cercano a **negro** y el hermano a **rojo**. 
         Luego se aplica una **rotación sobre el hermano hacia el doble-negro** (si el doble-negro está en el subárbol izquierdo, **rotación derecha**; si el doble-negro está en el subárbol derecho, **rotación izquierda**). Esta rotación transforma la configuración en un **caso D**.`
    },
    {
      type: "info",
      description:
        `D) **Hermano negro con hijo rojo lejano** → Si el hermano del nodo **doble-negro** es **negro** y su **hijo lejano** (el más lejano al doble-negro) es **rojo**, el hermano **adopta** el color del padre, y tanto el padre como el hijo lejano se **recolorean** a **negro**. 
         Luego se aplica **una rotación sobre el padre hacia el hermano** (esto es, al **lado opuesto del doble-negro**: si el doble-negro está en el subárbol izquierdo, **rotación izquierda**; si el doble-negro está en el subárbol derecho, **rotación derecha**). Con esto, el doble-negro desaparece y el árbol recupera su balance.`
    },
    {
      type: "info",
      description:
        "Una vez explicado el comportamiento global del árbol, procederemos a analizar en detalle cada operación dentro del simulador.",
    },
    { id: "inputConsola", text: "arbolRN.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "Primero limpiamos el lienzo para asegurar la correcta ejecución del tutorial. El comando **clean()** nos permite llevar a cabo dicha acción ✔️.",
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────── Inserción ─────────────────────
    {
      type: "info",
      description:
        "📌 **Insert**: La inserción de un nodo en un árbol Rojo-Negro **sigue el procedimiento estándar de un ABB**: el nuevo nodo se coloca como hoja según el orden de las claves, **se marca rojo** y luego **se ejecuta Insert-Fixup** para restaurar las propiedades del árbol. Para añadir elementos utilizaremos el comando **insert()**."
    },
    { id: "inputConsola", text: "insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧪 El primer `insert()` crea el objeto `arbolRN`, que usaremos con los demás comandos. El nuevo nodo nace **rojo**, pero al ser la **raíz** se **recolorea** a **negro** automáticamente."
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **20** como **hijo izquierdo** de **30**; como el padre es **negro**, la inserción no produce conflicto y no requiere fixup."
    },
    { id: "inputConsola", type: "enter" },

    { id: "inputConsola", text: "arbolRN.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **40** como **hijo derecho** de **30**. El padre es **negro**, seguimos OK."
    },
    { id: "inputConsola", type: "enter" },

    // Caso B: padre rojo y tío rojo → recoloreo
    { id: "inputConsola", text: "arbolRN.insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **10** como **hijo izquierdo** de **20**."
    },
    {
      id: "main-canvas",
      type: "element",
      description: "Como el **padre (20)** y el **tío (40)** son **rojos**, aplicamos **Caso B** de **Insert-Fixup**: **recoloreamos** padre y tío a **negro**, y el **abuelo (30)** a **rojo**. Como el abuelo es la **raíz**, se **recolorea a negro** y el fixup concluye."
    },
    { id: "inputConsola", type: "enter" },

    // Caso C/D: LR/RL (triángulo) y LL/RR (línea)
    { id: "inputConsola", text: "arbolRN.insert(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **50** como **hijo derecho** de **40**. El padre es **negro**, no hay conflicto → sin fixup."
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(45);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **45** como **hijo izquierdo** de **50**."
    },
    {
      id: "main-canvas",
      type: "element",
      description: "Como el **padre (50)** es **rojo**, el **tío** es **negro** (NIL) y la forma generada por el nuevo nodo es un **triángulo RL**. Aplicamos los **casos C/D** de **Insert-Fixup**: 1) **Rotación derecha sobre 50** para convertir el triángulo en **línea RR**; 2) **intercambiamos colores** entre **padre** y **abuelo**; 3) **Rotación izquierda sobre 40** para concluir el fixup."
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────── Borrado ─────────────────────
    {
      type: "info",
      description:
        `🗑️ **Delete**: La eliminación de un nodo en un Árbol Rojo-Negro **sigue el procedimiento estándar de un ABB mediante transplantes** (reconexión de subárboles **sin copiar valores**). 
          Para eliminar elementos usaremos el comando **delete()**. A continuación se presentan los casos que pueden ocurrir durante la operación.`
    },
    {
      type: "info",
      description: `1) **Caso 0-1 hijo**: Si **\`z\`** (nodo a eliminar) tiene 0 o 1 hijo no-NIL, se **sustituye \`z\` por su hijo** (que puede ser NIL). 
                    El nodo que **asciende** para **sustituir** a **\`z\`** se denomina **\`x\`**. Si **\`z\`** era **rojo**, las propiedades se mantienen; en caso contrario, 
                    se ejecuta **Delete-Fixup** (casos A-D) **empezando desde \`x\`**.`
    },
    {
      type: "info",
      description: `2) **Caso 2 hijos**: Se toma el **sucesor in-order** del **subárbol derecho de \`z\`** (denotado \`y\`), que tiene a lo sumo 1 hijo no-NIL. Se **sustituye \`z\` por \`y\`** (reajustando punteros); 
                    el hijo de **\`y\`**, si existe, **ocupa la antigua posición** de su padre y pasa a llamarse **\`x\`**. Para **conservar** la **altura negra** local, **\`y\` adopta el color de \`z\`** y se **preserva** el color original de **\`y\`** (*yOriginalColor*). 
                    Si \`yOriginalColor\` es **negro**, **\`x\`** queda con un **déficit de negrura** y se ejecuta **Delete-Fixup** (casos A-D) desde **\`x\`**; si era **rojo**, no se requiere fixup.`
    },

    // Borrado simple (rojo) y negro con 2 hijos (sucesor/trasplantes)
    { id: "inputConsola", text: "arbolRN.delete(50);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔧 Eliminamos el nodo con valor **50 (rojo)**."
    },
    {
      id: "main-canvas",
      type: "element",
      description: "🎯 Como el nodo **(50)** no tiene hijos, se sustituye por **NIL**; al tratarse de un nodo **rojo**, no cambia la *black-height* y no hay fixup."
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.delete(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🔧 Eliminamos el nodo con valor **30 (negro)**."
    },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🩹 Como el nodo **(30)** tiene 2 hijos, buscamos el **sucesor in-order** en el subárbol derecho **(`y`)** y lo **trasplantamos** a la posición de **30**. Para **no alterar la black-height local**, **`y` adopta el color de `z`** y se preserva el **color original de `y`** (*yOriginalColor*). Como **`y`** no cuenta con hijos y **yOriginalColor** es **rojo**, su lugar se cubre con **NIL** y no hace falta fixup."
    },
    { id: "inputConsola", type: "enter" },

    // 3) Borrado con Delete-Fixup A → B
    { id: "inputConsola", text: "arbolRN.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "Limpiamos el lienzo para preparar un nuevo flujo que permita visualizar la aplicación de Delete-Fixup durante la operación.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "insert(20);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "Creamos el objeto árbol insertando **20** como la raíz.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(30);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **30** como **hijo derecho** de **20**.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **10** como **hijo izquierdo** de **20**.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(25);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **25** como **hijo izquierdo** de **30**. Como **30** es **rojo**, se aplican los recoloreos necesarios para restaurar el equilibrio del árbol.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(35);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **35** como **hijo derecho** de **30**.",
    },
    { id: "inputConsola", type: "enter" },
    { id: "inputConsola", text: "arbolRN.insert(40);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "➕ Insertamos **40** como **hijo derecho** de **35**. Como **35** es **rojo**, se aplican los recoloreos necesarios para restaurar el equilibrio del árbol.",
    },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "¿Qué ocurre si eliminamos el nodo con valor **10 (negro)**?"
    },
    {
      id: "main-canvas",
      type: "element",
      description:
        "🔎 Al borrar **10 (negro)**, aparece un **doble-negro** en su posición. El **hermano** es **30 (rojo)** ⇒ **Caso A**: **recolorear** (hermano→negro, padre→rojo) y **rotar sobre el padre hacia el hermano**. " +
        "Tras **A**, el **nuevo** hermano de `x` suele quedar **negro** con hijos **negros**, por lo que **se aplica Caso B**: el **hermano se pinta rojo** y el **doble-negro** **asciende** al padre. " +
        "Este proceso puede repetirse hasta que el padre sea **rojo** (se repinta **negro** y termina) o hasta la **raíz** (que se asegura **negra**)."
    },
    { id: "inputConsola", text: "arbolRN.delete(10);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "Probemos si es cierto..."
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────── Búsqueda ─────────────────────
    {
      type: "info",
      description:
        "🔍 **Search** en RB: igual que en ABB; **no splayea**. Solo resalta si existe."
    },
    { id: "inputConsola", text: "search(8);", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "Busca **8**: izquierda si menor, derecha si mayor. Se resalta si se encuentra."
    },
    { id: "inputConsola", type: "enter" },

    // ───────────────────── Recorridos ─────────────────────
    {
      type: "info",
      description:
        "🧭 **Recorridos**: Un árbol Rojo-Negro conserva la **propiedad de ABB**, así que los recorridos clásicos funcionan igual que en cualquier Árbol Binario de Búsqueda. Cada recorrido visita los nodos en un orden distinto."
    },
    {
      id: "main-canvas",
      type: "element",
      description:
        "📐 **Inorden (izq → raíz → der)**: Recorre el árbol en orden ascendente. En un ABB (incluido el Rojo-Negro), siempre devuelve los elementos ordenados."
    },
    { id: "inputConsola", text: "arbolRN.getInOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      type: "info",
      description:
        "🌲 **Preorden (raíz → izq → der)**: Visita primero la raíz y luego sus subárboles. Útil para clonar el árbol"
    },
    { id: "inputConsola", text: "arbolRN.getPreOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      type: "info",
      description:
        "🔄 **Postorden (izq → der → raíz)**: Procesa primero los hijos y al final la raíz."
    },
    { id: "inputConsola", text: "arbolRN.getPostOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },
    {
      id: "main-canvas",
      type: "element",
      description:
        "📶 **Level-order (BFS)**: Recorre el árbol nivel por nivel, de arriba hacia abajo. Útil para la inspección global de la estructura."
    },
    { id: "inputConsola", text: "arbolRN.getLevelOrder();", type: "write" },
    { id: "inputConsola", type: "enter" },

    // ───────────────────── Limpieza ─────────────────────
    { id: "inputConsola", text: "arbolRN.clean();", type: "write" },
    {
      id: "console",
      type: "element",
      description:
        "🧼 Ya abarcadas todas las operaciones, sientete libre de configurar nuevos flujos y observar los fix-ups en acción. Recuerda que con cada limpieza, es necesario volver a crear el objeto `arbolRN` usando el comando insert()."
    },
    { id: "inputConsola", type: "enter" },
  ];

  return steps;
}