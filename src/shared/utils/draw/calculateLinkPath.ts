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

export const calculateCircularLinkPath = (
    link: LinkData,
    positions: Map<string, { x: number, y: number }>,
    elementWidth: number,
    elementHeight: number
) => {
    const sourcePos = positions.get(link.sourceId);
    const targetPos = positions.get(link.targetId);
    if (!sourcePos || !targetPos) return "M0,0";

    const offset = 3; // Margen desde el borde
    const nodeCenterY = elementHeight / 2; // Eje vertical del nodo
    const isNext = link.type === 'circular-next';
    const direction = isNext ? 1 : -1; // Curva hacia abajo o hacia arriba

    // Punto de salida:
    // - next: Borde derecho del source
    // - prev: Borde izquierdo del source
    const x1 = isNext
        ? sourcePos.x + elementWidth + offset
        : targetPos.x - offset;
    const y1 = sourcePos.y + nodeCenterY;

    // Punto de entrada:
    // - next: borde izquierdo del target
    // - prev: borde derecho del target
    const x2 = isNext
        ? targetPos.x - offset
        : targetPos.x + elementWidth + offset;
    const y2 = targetPos.y + nodeCenterY;

    // Parámetros dinámicos basados en la distancia horizontal
    const dx = x2 - x1;
    const cpOffsetX = Math.abs(dx) * 0.5;
    const curveDepth = Math.abs(dx) * 0.5 + 55;
    const midY = Math.max(y1, y2) + direction * curveDepth;

    // Puntos de control para el Bézier cúbico
    const cp1x = x1 + (isNext ? cpOffsetX : -cpOffsetX);
    const cp2x = x2 - (isNext ? cpOffsetX : -cpOffsetX);
    const cp1y = midY;
    const cp2y = midY;

    return `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
}