import { useEffect, useMemo, useRef } from "react";
import { BaseQueryOperations, IndicatorPositioningConfig, ListLinkData, QueueNodeData } from "../../../../../types";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../../../../shared/constants/consts";
import { drawQueueNodes, animateDequeueNode, animateEnqueueNode } from "../../../../../shared/utils/draw/queueDrawActions";
import { select } from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";
import { drawArrowIndicator, drawListLinks, animateHighlightNode, animateClearList } from "../../../../../shared/utils/draw/drawActionsUtilities";
import { getColaCode } from "../../../../../shared/constants/pseudocode/colaCode";
import { useBus } from "../../../../../shared/hooks/useBus";

export function useQueueRender(
    queueNodes: QueueNodeData[],
    query: BaseQueryOperations<"cola">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa de posiciones actuales de los nodos dentro del SVG
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

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

        // Renderizado de los nodos pertenecientes a la cola
        drawQueueNodes(
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

        // Dimensiones y transición compartidas por ambos indicadores
        const sharedDims = { elementWidth: SVG_QUEUE_VALUES.ELEMENT_WIDTH, elementHeight: SVG_QUEUE_VALUES.ELEMENT_HEIGHT };
        const indicatorPositioningTransform: IndicatorPositioningConfig = {
            calculateTransform: (pos, d) => `translate(${pos.x + d.elementWidth / 2}, ${pos.y})`
        };

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
            arrowTransform: `translate(0, -5)`
        }

        // Renderizado del indicador de cabeza
        drawArrowIndicator(
            svg,
            "head-indicator",
            "head-indicator-group",
            headPos,
            headStyleConfig,
            indicatorPositioningTransform,
            sharedDims
        );

        // Creación del indicador para el elemento final de la cola
        const tailId = queueNodes.length > 0 ? queueNodes[queueNodes.length - 1].id : null;
        const tailPos = tailId ? nodePositions.get(tailId)! : null;

        // Configuración de estilos y de posicionamiento para el indicador del elemento final
        const tailStyleConfig = {
            text: "FIN",
            textColor: SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR,
            arrowColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR,
            fontSize: "14px",
            fontWeight: "bold",
            arrowPathData: "M0,0 L-9.5,10 L-4,10 L-4,20 L4,20 L4,10 L9.5,10 Z",
            textRelativeY: SVG_QUEUE_VALUES.ELEMENT_HEIGHT + 70,
            arrowTransform: `translate(0, ${SVG_QUEUE_VALUES.ELEMENT_HEIGHT + 35})`
        }

        // Renderizado del indicador de elemento ifnal
        drawArrowIndicator(
            svg,
            "tail-indicator",
            "tail-indicator-group",
            tailPos,
            tailStyleConfig,
            indicatorPositioningTransform,
            sharedDims
        );
    }, [queueNodes, linksData, prevNodes?.length]);

    // Efecto para manejar el encolamiento de un nuevo nodo
    useEffect(() => {
        if (!queueNodes || !svgRef.current || !query.toEnqueuedNode) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del nuevo nodo
        const newNodeId = query.toEnqueuedNode;

        // Obtenemos del último nodo actual
        const currLastNodeId = queueNodes.length > 1 ? queueNodes[queueNodes.length - 2].id : null;

        // Animación de inserción del nuevo nodo
        animateEnqueueNode(
            svg,
            {
                newLastNodeId: newNodeId,
                currLastNodeId,
                positions: nodePositions
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toEnqueuedNode, queueNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la eliminación de un nodo
    useEffect(() => {
        if (!queueNodes || !svgRef.current || !query.toDequeuedNode) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Id del primer nodo actual previo a la eliminación (nodo a eliminar)
        const currFirstNodeId = query.toDequeuedNode;

        // Id del nuevo primer nodo 
        const newFirstNodeId = queueNodes.length > 0 ? queueNodes[0].id : null;

        // Animación de desvinculación del nodo
        animateDequeueNode(
            svg,
            {
                currFirstNodeId,
                newFirstNodeId,
                remainingNodesData: queueNodes,
                remainingLinksData: linksData,
                positions: nodePositions
            },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toDequeuedNode, queueNodes, linksData, resetQueryValues, setIsAnimating]);

    // Efecto para manejar el resaltado del elemento cabeza
    useEffect(() => {
        if (
            !svgRef.current ||
            !queueNodes ||
            !query.toGetFront
        )
            return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Identificador del nodo cabeza de la cola
        const headNodeId = query.toGetFront;

        // Animación de resaltado para nodo cabeza de la cola
        animateHighlightNode(
            svg,
            headNodeId,
            { highlightColor: "#00e676", rectStrokeColor: SVG_STYLE_VALUES.RECT_STROKE_COLOR, rectStrokeWidth: SVG_STYLE_VALUES.RECT_STROKE_WIDTH },
            { textFillColor: "white", textFontSize: SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE, textFontWeight: SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT },
            resetQueryValues,
            setIsAnimating
        );
    }, [query.toGetFront, queueNodes, resetQueryValues, setIsAnimating]);

    // Efecto para manejar la limpieza de lienzo
    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!queueNodes || !svgRef.current || !query.toClear) return;

        // Selección del elemento SVG a partir de su referencia
        const svg = select(svgRef.current);

        // Código y labels de la operación
        const colaCode = getColaCode();
        const labels = colaCode.clean.labels!;

        // Animación de limpieza de la cola
        animateClearList(
            svg,
            nodePositions,
            bus,
            {
                CLEAR_HEAD: labels.CLEAR_HEAD,
                CLEAR_TAIL: labels.CLEAR_TAIL,
                RESET_SIZE: labels.RESET_SIZE
            },
            "clean",
            resetQueryValues, setIsAnimating);
    }, [query.toClear, queueNodes, resetQueryValues, setIsAnimating]);

    return { svgRef }
}