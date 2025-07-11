import { LinkData } from "../../../types";

export const calculateLinkPath = (
    link: LinkData,
    positions: Map<string, { x: number, y: number }>,
    elementWidth: number,
    elementHeight: number
) => {
    // Posición de origen y destino del enlace
    const sourcePos = positions.get(link.sourceId);
    const targetPos = positions.get(link.targetId);
    if (!sourcePos || !targetPos) return "M0,0";

    console.log("DIBUJANDO ENLACE PLANO");

    // Inicializamos las  coordendas
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;

    // Centro del nodo
    const nodeCenterY = elementHeight / 2;

    // Espacio para que la linea no salga / entre justo en el borde
    const offset = 3;

    // Offset vertical para separar los enlaces
    const verticalOffset = link.type === 'prev' ? 5 : -5;

    // Calculamos las coordenadas
    if (link.type === 'next') {
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

export function calculateCircularLPath(
    link: LinkData,
    positions: Map<string, { x: number; y: number }>,
    elementWidth: number,
    elementHeight: number,
): string {
    const src = positions.get(link.sourceId);
    const tgt = positions.get(link.targetId);
    if (!src || !tgt) return "M0,0";

    const isNext = link.type === "circular-next";
    const halfH = elementHeight / 2;

    // Puntos de salida/entrada
    const offset = 5;

    // Coordenadas en y (separadas por offset)
    const startY = src.y + halfH + (isNext ? offset : -offset);
    const endY = tgt.y + halfH + (isNext ? offset : -offset);

    // Coordenadas en x
    const startX = isNext
        ? src.x + elementWidth    // sale por la derecha
        : src.x;                  // sale por la izquierda
    const endX = isNext
        ? tgt.x                   // entra por la izquierda
        : tgt.x + elementWidth;   // entra por la derecha

    // Separación horizontal y vertical
    const lateralOff = 20;
    const marginY = 55;

    // Coordenadas para desplazamientos intermedios
    const xA = startX + (isNext ? lateralOff : -lateralOff);
    const xB = endX + (isNext ? -lateralOff : lateralOff);

    // Elegimos el y “intermedio” según next o prev
    const topY = Math.min(src.y, tgt.y) - marginY;
    const bottomY = Math.max(src.y, tgt.y) + elementHeight + marginY;
    const midY = isNext ? bottomY : topY;

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
