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
    const verticalOffset = link.type === 'prev' ? 3 : -3;

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
        x2 = targetPos.x - offset;
        y2 = targetPos.y + nodeCenterY + verticalOffset;
    }

    return `M${x1},${y1} L${x2},${y2}`;
}