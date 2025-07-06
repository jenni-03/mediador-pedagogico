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
): string => {
    const sourcePos = positions.get(link.sourceId);
    const targetPos = positions.get(link.targetId);
    if (!sourcePos || !targetPos) return "M0,0";

    const offset = 5; // Pequeño margen desde los bordes del elemento
    const nodeCenterY = elementHeight / 2;

    console.log("DIBUJANDO FLECHA CIRCULAR en calculateCircularLinkPath", sourcePos);

    // Punto de salida (borde derecho del último nodo)
    const x1 = sourcePos.x + elementWidth + offset;
    const y1 = sourcePos.y + nodeCenterY;

    // Punto de entrada (borde izquierdo del primer nodo)
    const x2 = targetPos.x - offset;
    const y2 = targetPos.y + nodeCenterY;

    // Calcular la curvatura hacia abajo
    const curveDepth = 80; // Profundidad de la curva
    const midY = Math.max(sourcePos.y, targetPos.y) + elementHeight + curveDepth;
    
    // Puntos de control para una curva suave
    const cp1x = x1 + 60; // Control point 1 - hacia la derecha desde el origen
    const cp1y = midY;     // A la misma altura que la curva inferior
    
    const cp2x = x2 - 60;  // Control point 2 - hacia la izquierda desde el destino
    const cp2y = midY;     // A la misma altura que la curva inferior

    return `M${x1},${y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
};