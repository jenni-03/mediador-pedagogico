import { ListLinkPathFn, ListNodeData } from "../../types";
import { NodoD } from "./nodes/NodoD";
import { NodoS } from "./nodes/NodoS";

/**
 * Función que convierte una lista enlazada en un array de objetos de datos de nodos.
 * @param startNode Nodo desde donde se inicia el recorrido.
 * @returns Array de objetos `ListNodeData<T>` que representan los nodos visitados en orden.
 */
export function linkedListToArray<T>(startNode: NodoS<T> | NodoD<T> | null) {
    const resultArray: ListNodeData<T>[] = [];
    if (!startNode) return resultArray;

    let currentNode: NodoS<T> | NodoD<T> | null = startNode;
    const firstNode = startNode;

    do {
        const nextNode: NodoS<T> | NodoD<T> | null = currentNode.getSiguiente();

        const nodeData: ListNodeData<T> = {
            id: currentNode.getId(),
            value: currentNode.getValor(),
            next: nextNode ? nextNode.getId() : null,
            memoryAddress: currentNode.getDireccionMemoria()
        }

        if (currentNode instanceof NodoD) {
            const prevNode = currentNode.getAnterior();
            nodeData.prev = prevNode ? prevNode.getId() : null;
        }

        resultArray.push(nodeData);
        currentNode = nextNode;
    }
    while (currentNode && currentNode !== firstNode);

    return resultArray;
}

/**
 * Función que genera una cadena de ruta SVG que describe un enlace recto entre 2 elementos de una lista.
 * @param direction Sentido o dirección del enlace.
 * @param sourcePos Coordenadas `{ x, y }` del elemento fuente.
 * @param targetPos Coordenadas `{ x, y }` del elemento de destino.
 * @param elementWidth Ancho de cada elemento en píxeles; se usa para calcular las posiciones x del borde.
 * @param elementHeight Altura de cada elemento en píxeles; se usa para calcular el centro vertical.
 * @returns Cadena de ruta SVG que representa el enlace recto entre los 2 elementos.
 */
function calculateListStraightPath(
    direction: "prev" | "next",
    sourcePos: { x: number, y: number } | null,
    targetPos: { x: number, y: number } | null,
    elementWidth: number,
    elementHeight: number
): string {
    if (!sourcePos || !targetPos) return "M0,0";

    // Inicializamos las  coordendas
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

    // Centro del nodo
    const nodeCenterY = elementHeight / 2;

    // Espacio para que la linea no salga / entre justo en el borde
    const offset = 3;

    // Offset vertical para separar los enlaces
    const verticalOffset = direction === 'prev' ? 5 : -5;

    // Calculamos las coordenadas
    if (direction === 'next') {
        // Sale del borde derecho del nodo actual
        x1 = sourcePos.x + elementWidth + offset;
        y1 = sourcePos.y + nodeCenterY + verticalOffset;
        // Entra al borde izquierdo del nodo siguiente
        x2 = targetPos.x - offset;
        y2 = targetPos.y + nodeCenterY + verticalOffset;
    } else { // prev
        // Sale del borde izquierdo del nodo actual
        x1 = sourcePos.x - offset;
        y1 = sourcePos.y + nodeCenterY + verticalOffset;
        // Entra al borde derecho del nodo anterior
        x2 = targetPos.x + elementWidth + offset;
        y2 = targetPos.y + nodeCenterY + verticalOffset;
    }

    return `M${x1},${y1} L${x2},${y2}`;
}

/**
 * Función que genera una cadena de ruta SVG que describe un enlace escalonado/circular entre 2 elementos de una lista.
 * @param direction Sentido o dirección del enlace.
 * @param sourcePos Coordenadas `{ x, y }` del elemento fuente.
 * @param targetPos Coordenadas `{ x, y }` del elemento destino.
 * @param elementWidth Ancho de cada elemento en píxeles; se usa para calcular las coordenadas x de entrada/salida.
 * @param elementHeight Altura de cada elemento en píxeles; se usa para calcular centros y márgenes verticales.
 * @returns Cadena de ruta SVG que representa el enlace circular entre los 2 elementos.
 */
function calculateListCircularPath(
    direction: "circular-prev" | "circular-next",
    sourcePos: { x: number, y: number } | null,
    targetPos: { x: number, y: number } | null,
    elementWidth: number,
    elementHeight: number,
): string {
    if (!sourcePos || !targetPos) return "M0,0";

    const isNext = direction === "circular-next";
    const halfH = elementHeight / 2;

    // Puntos de salida/entrada
    const offset = 3;
    const verticalOffset = 5

    // Coordenadas en y (separadas por offset)
    const startY = sourcePos.y + halfH + (isNext ? -verticalOffset : verticalOffset);
    const endY = targetPos.y + halfH + (isNext ? -verticalOffset : verticalOffset);

    // Coordenadas en x
    const startX = isNext
        ? sourcePos.x + elementWidth + offset // sale por la derecha
        : sourcePos.x - offset                // sale por la izquierda
    const endX = isNext
        ? targetPos.x - offset               // entra por la izquierda
        : targetPos.x + elementWidth + offset // entra por la derecha

    // Separación horizontal y vertical
    const lateralOff = 20;
    const marginY = 55;

    // Coordenadas para desplazamientos intermedios
    const xA = startX + (isNext ? lateralOff : -lateralOff);
    const xB = endX + (isNext ? -lateralOff : lateralOff);

    // Elegimos el y “intermedio” según next o prev
    const topY = Math.min(sourcePos.y, targetPos.y) - marginY;
    const bottomY = Math.max(sourcePos.y, targetPos.y) + elementHeight + marginY;
    const midY = isNext ? topY : bottomY;

    // Construcción del path:
    //  M: punto de salida
    //  L1: desplazamiento horizontal
    //  L2: subida / bajada al margen superior del nodo origen
    //  L3: cruzar hasta la x de destino
    //  L4: subida / bajada al centro del nodo destino
    //  L5: desplazamiento horizontal final
    return [
        `M${startX},${startY}`,
        `L${xA},${startY}`,
        `L${xA},${midY}`,
        `L${xB},${midY}`,
        `L${xB},${endY}`,
        `L${endX},${endY}`
    ].join(" ");
}

/**
 * Función que genera una ruta para conectar 2 elementos de una lista usando la estrategia de enrutamiento apropiada.
 * @param direction Sentido o dirección del enlace para determinar la estrategia de enrutamiento. `"prev"`/`"next"` => recto, de lo contrario, circular.
 * @param sourcePos Coordenadas `{ x, y }` del elemento fuente.
 * @param targetPos Coordenadas `{ x, y }` del elemento destino.
 * @param elementWidth Ancho de cada elemento en píxeles.
 * @param elementHeight Altura de cada elemento en píxeles.
 * @returns Cadena de ruta SVG que representa el enlace entre los 2 elementos.
 */
export const buildListPath: ListLinkPathFn = (
    direction,
    sourcePos,
    targetPos,
    elementWidth,
    elementHeight
) => {
    if (direction === "prev" || direction === "next") {
        return calculateListStraightPath(direction, sourcePos, targetPos, elementWidth, elementHeight);
    }
    return calculateListCircularPath(direction, sourcePos, targetPos, elementWidth, elementHeight);
};