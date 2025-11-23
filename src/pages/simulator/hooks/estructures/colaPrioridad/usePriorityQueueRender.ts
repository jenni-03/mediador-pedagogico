import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, ListLinkData, PriorityQueueNodeData } from "../../../../../types";
import { SVG_PRIORITY_QUEUE_VALUES, SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { drawPriorityQueueNodes, animateEnqueuePriorityNode, animateDequeuePriorityNode, getPriorityColor } from "../../../../../shared/utils/draw/priorityQueueDrawActions";
import { select } from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { animateHighlightNode, drawArrowIndicator, drawListLinks } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { getColaPrioridadCode } from "../../../../../shared/constants/pseudocode/colaPrioridadCode";
import { useBus } from "../../../../../shared/hooks/useBus";
import { animateClearQueue } from "../../../../../shared/utils/draw/queueDrawActions";

export function usePriorityQueueRender(
    queueNodes: PriorityQueueNodeData[],
    query: BaseQueryOperations<"cola_de_prioridad">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa de posiciones actuales de los nodos dentro del SVG
    const nodePositions = useRef(
        new Map<string, { x: number; y: number }>()
    ).current;

    // Estado previo de la cola
    const prevNodes = usePrevious(queueNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    // Bus para la emisión de eventos de código
    const bus = useBus();

    // Cálculo de enlaces entre nodos
    const linksData = useMemo<ListLinkData[]>(() => {
        const links: ListLinkData[] = [];
        queueNodes.forEach(n => {
            if (n.next) {
                links.push({
                    sourceId: n.id,
                    targetId: n.next,
                    type: "next"
                });
            }
        });
        return links;
    }, [queueNodes]);

    // Renderizado base de la cola
    useEffect(() => {
        if (!queueNodes || !svgRef.current) return;

        // Espaciado entre nodos
        const nodeSpacing = SVG_QUEUE_VALUES.ELEMENT_WIDTH + SVG_QUEUE_VALUES.SPACING;

        // Cálculo del ancho del SVG en base al número de nodos presentes
        const displayLength = Math.max(queueNodes.length, prevNodes?.length ?? 0);
        const width = SVG_QUEUE_VALUES.MARGIN_LEFT + displayLength * nodeSpacing - (queueNodes.length > 0 ? SVG_QUEUE_VALUES.SPACING : 0) + SVG_QUEUE_VALUES.MARGIN_RIGHT;

        // Configuración del contenedor SVG
        const svg = select(svgRef.current)
            .attr("height", SVG_QUEUE_VALUES.HEIGHT)
            .attr("width", width);

        // Capas internas para nodos y enlaces
        let nodesLayer = svg.select<SVGGElement>("#nodes-layer");
        if (nodesLayer.empty()) nodesLayer = svg.append("g").attr("id", "nodes-layer");

        let linksLayer = svg.select<SVGGElement>("#links-layer");
        if (linksLayer.empty()) linksLayer = svg.append("g").attr("id", "links-layer");

        // Renderizado de los nodos pertenecientes a la cola de prioridad
        drawPriorityQueueNodes(
            nodesLayer,
            queueNodes,
            nodePositions,
            {
                margin: { left: SVG_QUEUE_VALUES.MARGIN_LEFT, right: SVG_QUEUE_VALUES.MARGIN_RIGHT },
                elementWidth: SVG_QUEUE_VALUES.ELEMENT_WIDTH,
                elementHeight: SVG_QUEUE_VALUES.ELEMENT_HEIGHT,
                nodeSpacing,
                height: SVG_QUEUE_VALUES.HEIGHT
            }
        );

        // Renderizado de los enlaces entre nodos 
        drawListLinks(
            linksLayer,
            linksData,
            nodePositions,
            SVG_QUEUE_VALUES.ELEMENT_WIDTH,
            SVG_QUEUE_VALUES.ELEMENT_HEIGHT
        );

        // Elevamos la capa de nodos
        nodesLayer.raise();

        // Creación del indicador para el nodo inicial de la cola de prioridad
        const initialNodeId = queueNodes.length > 0 ? queueNodes[0].id : null;
        const initialNodePos = initialNodeId ? nodePositions.get(initialNodeId)! : null;

        // Configuración de estilos y de posicionamiento para el indicador de inicio
        const initialIndicatorStyleConfig = {
            text: "INICIO",
            textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
            arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
            fontSize: "14px",
            fontWeight: "bold",
            arrowPathData: "M0,0 L-9.5,-10 L-4,-10 L-4,-20 L4,-20 L4,-10 L9.5,-10 Z",
            textRelativeY: -30,
            arrowTransform: `translate(0, -5)`,
        };

        // Renderizado del indicador de inicio
        drawArrowIndicator(
            svg,
            "initial-indicator",
            "initial-indicator-group",
            initialNodePos,
            initialIndicatorStyleConfig,
            { calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})` },
            { elementWidth: SVG_QUEUE_VALUES.ELEMENT_WIDTH, elementHeight: SVG_QUEUE_VALUES.ELEMENT_HEIGHT }
        );
    }, [queueNodes, linksData, prevNodes?.length]);

    // Efecto para manejar la inserción de un nuevo nodo dada su prioridad
    useEffect(() => {
        if (!queueNodes || !svgRef.current || !query.toEnqueuedNode) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id y posición del nuevo nodo
        const newNodeId = query.toEnqueuedNode;
        const newNodeIndex = queueNodes.findIndex(node => node.id === newNodeId);

        // Id del nodo anterior y posterior al nuevo nodo (en base a la posición)
        const prevNodeId = newNodeIndex > 0 ? queueNodes[newNodeIndex - 1].id : null;
        const nextNodeId = newNodeIndex < queueNodes.length - 1 ? queueNodes[newNodeIndex + 1].id : null;

        // Animación de inserción del nuevo nodo
        animateEnqueuePriorityNode(
            svg,
            {
                newNodeId,
                prevNodeId,
                nextNodeId,
                insertionPosition: newNodeIndex,
                nodesData: queueNodes,
                linksData,
                positions: nodePositions
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toEnqueuedNode, queueNodes, linksData, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        if (
            !queueNodes ||
            !svgRef.current ||
            !query.toDequeuedNode
        )
            return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del actual nodo inicial de la cola de prioridad previo a la eliminación (nodo a eliminar)
        const currInitialNodeId = query.toDequeuedNode;

        // Id del nuevo nodo inicial 
        const newInitialNodeId = queueNodes.length > 0 ? queueNodes[0].id : null;

        // Animación de desvinculación del nodo
        animateDequeuePriorityNode(
            svg,
            {
                currInitialNodeId,
                newInitialNodeId,
                remainingNodesData: queueNodes,
                remainingLinksData: linksData,
                positions: nodePositions
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDequeuedNode, queueNodes, linksData, resetQueryValues, setIsAnimating]);

    // Efecto para manejar el resaltado del nodo inicial
    useEffect(() => {
        if (
            !svgRef.current ||
            !queueNodes ||
            !query.toGetFront
        )
            return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Identificador del nodo inicial de la cola de prioridad
        const initialNodeId = query.toGetFront;

        // Prioridad del nodo inicial
        const initialNodePriority = queueNodes[0].priority;

        // Animación de resaltado para el nodo inicial de la cola de prioridad
        animateHighlightNode(
            svg,
            initialNodeId,
            { highlightColor: "#0066CC", rectStrokeColor: getPriorityColor(initialNodePriority).stroke, rectStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH },
            { textFillColor: "black", textFontSize: SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_SIZE, textFontWeight: SVG_PRIORITY_QUEUE_VALUES.ELEMENT_TEXT_WEIGHT },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toGetFront, queueNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        if (!queueNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Código y labels de la operación
        const colaPrioridadCode = getColaPrioridadCode();
        const labels = colaPrioridadCode.clean.labels!;

        // Animación de limpieza de la cola
        animateClearQueue(
            svg,
            nodePositions,
            bus,
            {
                CLEAR_HEAD: labels.CLEAR_HEAD,
                RESET_SIZE: labels.RESET_SIZE
            },
            "clean",
            resetQueryValues, setIsAnimating);
    }, [query.toClear, queueNodes, bus, resetQueryValues, setIsAnimating]);

    return { svgRef };
}