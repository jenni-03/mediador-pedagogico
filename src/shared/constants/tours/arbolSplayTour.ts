import { TourStep } from "../typesTour";

/**
 * Tour guiado para Árbol Splay (Splay-Tree).
 * Incluye casos splay y ejemplos de inserción, búsqueda, recorridos y borrado.
 */
export function getArbolSplayTour(): TourStep[] {
    const steps: TourStep[] = [
        // ───────────────────── Intro: ¿Qué es un Splay? ─────────────────────
        {
            type: "info",
            description:
                "🌳 Un **Árbol Splay** es un Árbol Binario de Búsqueda autoajustable. Tras cada operación (**search/insert/delete**), el nodo accedido se mueve a la **raíz** mediante una secuencia de rotaciones llamada **Splaying**."
        },
        {
            type: "info",
            description:
                "🧠 Podemos verlo como una fila con *FastPass*: Cada vez que alguien es atendido, pasa al **frente**. Los clientes frecuentes permanecen cerca de la **caja** (la raíz), mientras que los que casi no aparecen se quedan **atrás** (más profundos).",
        },
        {
            type: "info",
            description:
                "⚙️ **Splaying** es el proceso de reestructuración que sube el nodo accedido a la raíz mediante rotaciones (**zig, zig-zig, zig-zag**). Esto mantiene el orden del árbol y acerca nodos relacionados a la raíz. A continuación, vamos a profundizar un poco en cada uno de los casos involucrados en el proceso de splaying."
        },
        {
            type: "info",
            description:
                "↘️ **Zig**: Ocurre cuando el nodo accedido es hijo directo de la raíz. **Se hace una sola rotación** (izquierda si es hijo derecho, derecha si es hijo izquierdo) para subir el nodo a la raíz. Es el caso más simple."
        },
        {
            type: "info",
            description:
                "🔁 **Zig-Zig**: Ocurre cuando el nodo accedido y su padre están en la **misma dirección** respecto al abuelo (LL -> Left Left o RR -> Right Right). **Se hacen dos rotaciones en la misma dirección**, primero sobre el abuelo y luego sobre el padre. Esto eleva al nodo accedido dos niveles."
        },
        {
            type: "info",
            description:
                "🔀 **Zig-Zag**: Ocurre cuando el nodo accedido y su padre están en **direcciones opuestas** respecto al abuelo (LR -> Left Right o RL -> Right Left). **Se hacen dos rotaciones en direcciones contrarias**, primero sobre el padre y luego sobre el abuelo. Esto eleva al nodo accedido 2 niveles y reequilibra la estructura."
        },
        {
            type: "info",
            description:
                "Una vez revisado el funcionamiento del árbol, procedemos a repasar cada una de las operaciones disponibles en el simulador.",
        },
        { id: "inputConsola", text: "arbolS.clean();", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "Primero limpiamos el lienzo para asegurar la correcta ejecución del tutorial. ✔️",
        },
        { id: "inputConsola", type: "enter" },

        // ───────────────────── Inserción ─────────────────────
        {
            type: "info",
            description:
                "📌 **Insert**: La inserción de un nodo x en un árbol Splay se lleva a cabo como en un Árbol Binario de Búsqueda. Luego aplica se splay sobre el nodo insertado para moverlo a la raíz.",
        },
        { id: "inputConsola", text: "insert(30);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "🧪 Empecemos creando el árbol. El primer `insert()` crea el objeto `arbolS`. A partir de ahí, usaremos `arbolS.` al trabajar con cualquier comando.",
        },
        { id: "inputConsola", type: "enter" },
        {
            id: "main-canvas",
            type: "element",
            description: "Como el nodo queda como raíz del árbol, no hay necesidad de aplicar rotación alguna. ✔️ ",
        },
        { id: "inputConsola", text: "arbolS.insert(10);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **10** como hijo izquierdo de **30**. Al splayearlo, se aplica **Zig** (rotación derecha sobre **30**) y **10** sube a la **raíz**.",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.insert(20);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **20** como hijo izquierdo de **30**. Al splayearlo, se aplica **Zig-Zag RL** (primero rotación derecha sobre **30**, luego rotación izquierda sobre **10**) y **20** sube a la **raíz**.",
        },
        { id: "inputConsola", type: "enter" },

        // ───────────────────────── Búsqueda ───────────────────────
        {
            type: "info",
            description:
                "📌 **Search**: La búzqueda de un nodo x en un árbol Splay se lleva a cabo como en un Árbol Binario de Búsqueda. Luego Se aplica splay sobre el nodo ubicado o el último visitado en caso de no encontrarlo.",
        },
        { id: "inputConsola", text: "arbolS.search(30);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "Buscamos el nodo con valor **30**. Como el nodo si se encuentra dentro del árbol y es hijo derecho de **20**, al splayearlo, se aplica **Zig** (rotación izquierda sobre **20**) y **30** sube a la **raíz**.",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.search(15);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "Ahora probemos buscando el nodo con valor **15**. El nodo **15** no existe, y como no existe, la búsqueda finalizará en **10** (último visitado); al splayearlo, se aplica **Zig-Zig LL** (primero rotación derecha sobre **30**, luego rotación derecha sobre **20**) y **10** sube a la **raíz**."
        },
        { id: "inputConsola", type: "enter" },

        // ───────────────────────── Eliminación ─────────────────────────
        {
            type: "info",
            description:
                "🗑️ **Delete**: La eliminación de un nodo x en un árbol Splay abarca los siguientes pasos:\n" +
                "1) Buscar el nodo a eliminar como en un Árbol Binario de Búsqueda.\n" +
                "2) Aplicar **splay(x)** para llevar **x** a la **raíz**.\n" +
                "3) Separar el árbol en dos: **L = subárbol izquierdo** y **R = subárbol derecho** (desconectando la raíz eliminada).\n" +
                "4) Si **L** existe, se aplica **splay(max(L))** para que el nodo con valor máximo de **L** quede como raíz (sin hijo derecho) y luego se conecta **R** como su hijo derecho. Si **L** no existe, la nueva raíz pasa a ser **R**."
        },
        {
            type: "info",
            description: "❌ Si el nodo a eliminar no existe dentro del árbol, solo se hace splay sobre el último nodo visitado (nodo donde terminó la búsqueda) y no se elimina nada."
        },
        { id: "inputConsola", text: "arbolS.clean();", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "Limpiamos el lienzo.",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "insert(50);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "Creamos un nuevo objeto árbol. Recuerda, como es la primera vez, usamos solo la estructura del comando `insert(x)`",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.insert(30);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **30** como hijo izquierdo de **50**. Al splayearlo, se aplica **Zig** (rotación derecha sobre **50**) y **30** sube a la **raíz**.",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.insert(70);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **70** como hijo derecho de **50**. Al splayearlo, se aplica **Zig-Zig RR** (primero rotación izquierda sobre **30**, luego rotación izquierda sobre **50**) y **70** sube a la **raíz**.",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.insert(60);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **60** como hijo derecho de **50**. Al splayearlo, se aplica **Zig-Zag LR** (primero rotación izquierda sobre **50**, luego rotación derecha sobre **70**) y **60** sube a la **raíz**",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.insert(80);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                "➕ Insertamos **80** como hijo derecho de **70**.  Al splayearlo, se aplica **Zig-Zig RR** (primero rotación izquierda sobre **60**, luego rotación izquierda sobre **70**) y **80** sube a la **raíz**",
        },
        { id: "inputConsola", type: "enter" },
        { id: "inputConsola", text: "arbolS.delete(70);", type: "write" },
        {
            id: "console",
            type: "element",
            description:
                `🔧 Procedemos a eliminar el nodo con valor **70**. Como el nodo se encuentra dentro del árbol, primero se **splayea** hasta la **raíz**.  
                Después, se separan sus subárboles en **L** y **R** (desconectando la raíz eliminada). Finalmente, como **L** existe, se aplica **splay(max(L))** 
                para que el nodo con valor máximo de **L** quede como raíz (sin hijo derecho) y se conecta **R** como su hijo derecho.`
        },
        { id: "inputConsola", type: "enter" },

        // ───────────────────────── Recorridos ─────────────────────────────────
        {
            type: "info",
            description:
                "🧭 **Recorridos**: Un árbol Splay conserva la **propiedad de ABB**, así que los recorridos clásicos funcionan igual que en cualquier Árbol Binario de Búsqueda. Cada recorrido visita los nodos en un orden distinto."
        },
        {
            id: "main-canvas",
            type: "element",
            description:
                "📐 **Inorden (izq → raíz → der)**: Recorre el árbol en orden ascendente. En un ABB (incluido el Splay), siempre devuelve los elementos ordenados."
        },
        { id: "inputConsola", text: "arbolS.getInOrder();", type: "write" },
        { id: "inputConsola", type: "enter" },
        {
            type: "info",
            description:
                "🌲 **Preorden (raíz → izq → der)**: Visita primero la raíz y luego sus subárboles. Útil para clonar el árbol o generar expresiones prefix."
        },
        { id: "inputConsola", text: "arbolS.getPreOrder();", type: "write" },
        { id: "inputConsola", type: "enter" },
        {
            type: "info",
            description:
                "🔄 **Postorden (izq → der → raíz)**: Procesa primero los hijos y al final la raíz. Se usa, por ejemplo, para eliminar el árbol de forma segura."
        },
        { id: "inputConsola", text: "arbolS.getPostOrder();", type: "write" },
        { id: "inputConsola", type: "enter" },
        {
            id: "main-canvas",
            type: "element",
            description:
                "📊 **Level-order (BFS)**: Recorre el árbol nivel por nivel, de arriba hacia abajo. Útil para ver la estructura jerárquica completa."
        },
        { id: "inputConsola", text: "arbolS.getLevelOrder();", type: "write" },
        { id: "inputConsola", type: "enter" },

        // ───────────────────────── Limpieza ─────────────────────────────────
        { id: "inputConsola", text: "arbolS.clean();", type: "write" },
        {
            id: "console",
            type: "element",
            description: "🧼 Ya abarcadas todas las operaciones, sientete libre de explorar nuevas secuencias. Recuerda que con cada limpieza, es necesario volver a crear el objeto `arbolS` usando el comando insert().",
        },
        { id: "inputConsola", type: "enter" },
    ];

    return steps;
}