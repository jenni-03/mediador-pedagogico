import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, LinkData, PriorityQueueNodeData } from "../../../../../types";
import { SVG_PRIORITY_QUEUE_VALUES, SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { drawPriorityQueueNodes, animateDequeueNode, animateEnqueueBetweenNodes, animateEnqueueFirstNode, animateEnqueueLastNode, getPriorityColor } from "../../../../../shared/utils/draw/priorityQueueDrawActions";
import * as d3 from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { animateClearList, animateHighlightNode, drawArrowIndicator, drawListLinks } from "../../../../../shared/utils/draw/drawActionsUtilities";

export function usePriorityQueueRender(
    queueNodes: PriorityQueueNodeData[],
    query: BaseQueryOperations<"cola_de_prioridad">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de los nodos dentro del SVG
    const nodePositions = useRef(
        new Map<string, { x: number; y: number }>()
    ).current;

    // Estado previo de la cola
    const prevNodes = usePrevious(queueNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Memo para calcular los enlaces entre nodos
    const linksData = useMemo<LinkData[]>(() => {
        const links: LinkData[] = [];
        queueNodes.forEach(n => {
            if (n.next) {
                links.push({
                    sourceId: n.id,
                    targetId: n.next,
                    type: "next"
                })
            }
        });
        return links;
    }, [queueNodes]);

    // Renderizado base de la cola
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!queueNodes || !svgRef.current) return;

        // Margenes para el svg
        const margin = {
            left: SVG_QUEUE_VALUES.MARGIN_LEFT,
            right: SVG_QUEUE_VALUES.MARGIN_RIGHT,
        };

        // Dimensiones para cada nodo
        const elementWidth = SVG_QUEUE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_QUEUE_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre nodos
        const spacing = SVG_QUEUE_VALUES.SPACING;
        const nodeSpacing = elementWidth + spacing;

        // Cálculo del ancho del SVG en base al número de nodos presentes
        const displayLength = Math.max(
            queueNodes.length,
            prevNodes?.length ?? 0
        );
        const width =
            margin.left +
            displayLength * nodeSpacing -
            (queueNodes.length > 0 ? spacing : 0) +
            margin.right;

        // Alto del SVG
        const height = SVG_QUEUE_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = d3
            .select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la cola
        drawPriorityQueueNodes(
            svg,
            queueNodes,
            nodePositions,
            { margin, elementWidth, elementHeight, nodeSpacing, height }
        );

        // Renderizado de los enlaces entre nodos
        drawListLinks(svg, linksData, nodePositions, elementWidth, elementHeight);

        // Creación de indicador para elemento cabeza de la cola
        const headId = queueNodes.length > 0 ? queueNodes[0].id : null;
        const headPos = headId ? nodePositions.get(headId)! : null;

        // Configuración de estilos y de posicionamiento para el indicador de cabeza
        const headStyleConfig = {
            text: "INICIO",
            textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
            arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
            fontSize: "14px",
            fontWeight: "bold",
            arrowPathData: "M0,0 L-9.5,-10 L-4,-10 L-4,-20 L4,-20 L4,-10 L9.5,-10 Z",
            textRelativeY: -30,
            arrowTransform: `translate(0, -5)`,
        };

        // Renderizado del indicador de cabeza
        drawArrowIndicator(
            svg,
            "head-indicator",
            "head-indicator-group",
            headPos,
            headStyleConfig,
            { calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})` },
            { elementWidth, elementHeight }
        );
    }, [queueNodes, linksData, prevNodes]);

    // Efecto para manejar la animación de encolar
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!queueNodes || !svgRef.current || !query.toEnqueuedNode || !prevNodes) return;

        // Id del nodo encolado
        const nodeIdEnqueued = query.toEnqueuedNode;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Localizamos el índice del nodo recién insertado en la cola de prioridad
        const newNodeIndex = queueNodes.findIndex(node => node.id === nodeIdEnqueued);

        // Determinamos el nodo que está antes y después del nuevo nodo (en base a la posición)
        const prevNodeId = newNodeIndex > 0 ? queueNodes[newNodeIndex - 1].id : null;
        const nextNodeId = newNodeIndex < queueNodes.length - 1 ? queueNodes[newNodeIndex + 1].id : null;

        if (newNodeIndex === -1) {
            resetQueryValues();
            setIsAnimating(false);
            return;
        }

        // Determinamos la animación a realizar en base a la posición del nuevo nodo
        if (newNodeIndex === 0) {
            animateEnqueueFirstNode(
                svg,
                { nodeEnqueued: nodeIdEnqueued, nextNode: nextNodeId },
                { queueNodes, linksData },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else if (newNodeIndex === queueNodes.length - 1) {
            animateEnqueueLastNode(
                svg,
                { nodeEnqueued: nodeIdEnqueued, prevNode: prevNodeId },
                prevNodes,
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        } else {
            animateEnqueueBetweenNodes(
                svg,
                { nodeEnqueued: { id: nodeIdEnqueued, index: newNodeIndex }, prevNode: prevNodeId, nextNode: nextNodeId },
                { queueNodes, linksData },
                nodePositions,
                resetQueryValues,
                setIsAnimating
            );
        }
    }, [query.toEnqueuedNode, queueNodes, linksData, prevNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la animación de decolar
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (
            !queueNodes ||
            !svgRef.current ||
            !query.toDequeuedNode ||
            !prevNodes ||
            prevNodes.length === 0
        )
            return;

        // Obtenemos el nodo que anteriormente era el primero (nodo a desencolar)
        const dequeuedNodeId = query.toDequeuedNode;

        const nextNodeId = queueNodes.length > 0 ? queueNodes[0].id : null;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Animación de desvinculación del nodo
        animateDequeueNode(
            svg,
            { dequeuedNode: dequeuedNodeId, nextNode: nextNodeId },
            { queueNodes, linksData },
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDequeuedNode, queueNodes, linksData, prevNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la animación de obtención del elemento cabeza
    useEffect(() => {
        if (
            !svgRef.current ||
            !queueNodes ||
            queueNodes.length === 0 ||
            !query.toGetFront
        )
            return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Identificador del nodo cabeza de la cola
        const headNodeId = query.toGetFront;

        // Prioridad del nodo cabeza
        const headPriority = queueNodes[0].priority;

        // Animación de resaltado para nodo cabeza de la cola
        animateHighlightNode(
            svg,
            headNodeId,
            { highlightColor: "#0066CC", rectStrokeColor: getPriorityColor(headPriority).stroke, rectStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH },
            { textFillColor: "black", textFontSize: SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_SIZE, textFontWeight: SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_WEIGHT },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toGetFront, queueNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!queueNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = d3.select(svgRef.current);

        // Animación de limpieza del lienzo
        animateClearList(svg, nodePositions, resetQueryValues, setIsAnimating);
    }, [query.toClear, queueNodes, resetQueryValues, setIsAnimating]);

    return { svgRef };
}
