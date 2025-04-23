import { useEffect, useRef } from "react";
import { BaseQueryOperations, QueueNodeData } from "../../../../../types";
import { SVG_QUEUE_VALUES } from "../../../../../shared/constants/consts";
import { drawNodes, drawLinks, enqueueNode } from "../../../../../shared/utils/draw/queueDrawActions";
import * as d3 from "d3";
import { useAnimation } from "../../../../../shared/hooks/useAnimation";
import { usePrevious } from "../../../../../shared/hooks/usePrevious";

export function useQueueRender(
    queueNodes: QueueNodeData[],
    query: BaseQueryOperations<"cola">,
    resetQueryValues: () => void
) {
    // Referencia que apunta al elemento SVG del DOM
    const svgRef = useRef<SVGSVGElement>(null);

    // Mapa para guardar posiciones {x, y} de nodos, persistente entre renders
    const nodePositions = useRef(new Map<string, { x: number, y: number }>()).current;

    // Estado previo de la cola
    const prevNodes = usePrevious(queueNodes);

    // Control de bloqueo de animación
    const { setIsAnimating } = useAnimation();

    console.log("Nodos de la cola");
    console.log(queueNodes);
    console.log("Query actual");
    console.log(query);
    console.log("Nodos previos de la cola");
    console.log(prevNodes);
    console.log("Posiciones de los nodos");
    console.log(nodePositions);

    // Renderizado base de la cola
    useEffect(() => {
        // Verificamos que el array de nodos no sea nulo y que la referencia al SVG se haya establecido
        if (!queueNodes || !svgRef.current) return;

        // Margenes para el svg
        const margin = { left: SVG_QUEUE_VALUES.MARGIN_LEFT, right: SVG_QUEUE_VALUES.MARGIN_RIGHT };

        // Dimensiones para cada nodo
        const elementWidth = SVG_QUEUE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_QUEUE_VALUES.ELEMENT_HEIGHT;

        // Espaciado entre nodos
        const spacing = SVG_QUEUE_VALUES.SPACING;
        const nodeSpacing = elementWidth + spacing;

        // Ancho y alto del SVG dependiendo del número de elementos de la secuencia
        const width = margin.left + queueNodes.length * nodeSpacing - (queueNodes.length > 0 ? spacing : 0) + elementWidth + margin.right;
        const height = SVG_QUEUE_VALUES.HEIGHT;

        // Configuración del contenedor SVG
        const svg = d3.select(svgRef.current)
            .attr("height", height)
            .attr("width", width);

        // Renderizado de los nodos pertenecientes a la cola
        drawNodes(
            svg,
            queueNodes,
            nodePositions,
            { margin, elementWidth, elementHeight, nodeSpacing, height },
            setIsAnimating,
        );

        // Renderizado de los enlaces entre nodos
        drawLinks(
            svg,
            queueNodes,
            nodePositions,
            elementWidth,
            elementHeight
        );

        // Creación de indicador para elemento tope de la cola
        const tailId = queueNodes.length > 0 ? queueNodes[queueNodes.length - 1].id : null;
        const tailPos = tailId ? nodePositions.get(tailId) : null;
        const tailData = tailPos ? [tailPos] : [];

        svg.selectAll<SVGGElement, { x: number, y: number }>("g.tail-indicator-group")
            .data(tailData, () => "tail-indicator")
            .join(
                enter => {
                    const gEnter = enter.append("g")
                        .attr("class", "tail-indicator-group")
                        .attr("id", "tail-indicator")
                        .style("opacity", 0);

                    gEnter.append("text")
                        .attr("class", "tail-indicator-text")
                        .attr("text-anchor", "middle")
                        .style("font-size", "14px")
                        .style("font-weight", "bold")
                        .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
                        .attr("x", 0)
                        .attr("y", SVG_QUEUE_VALUES.ELEMENT_HEIGHT + 40)
                        .text("FINAL");

                    gEnter.append("path")
                        .attr("class", "tail-indicator.arrow")
                        .attr("d", "M0,0 L-9.5,10 L-4,10 L-4,20 L4,20 L4,10 L9.5,10 Z")
                        .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
                        .attr("transform", `translate(0, ${SVG_QUEUE_VALUES.ELEMENT_HEIGHT + 5})`)
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.5);

                    return gEnter;
                },
                update => update,
                exit => exit.transition().duration(300).style("opacity", 0).remove()
            )
            .transition()
            .duration(500)
            .style("opacity", 1)
            .attr("transform", d => `translate(${d.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2}, ${d.y})`);
    }, [queueNodes]);

    useEffect(() => {
        // Verificaciones necesarias para realizar la animación
        if (!queueNodes || !svgRef.current || !query.toEnqueuedNode || !prevNodes) return;

        // Id del nodo encolado
        const nodeIdEnqueued = query.toEnqueuedNode;

        // Ubicamos el nodo insertado
        const newNode = queueNodes.find(node => node.id === nodeIdEnqueued);

        // Ubicamos el nodo que anteriormente era el último
        const prevLastNode = prevNodes.length > 0 ? prevNodes[prevNodes.length - 1] : null;

        // En caso de no ubicar al nuevo nodo
        if (!newNode) return;

        console.log("ENCOLANDOOO...", nodeIdEnqueued);

        // Seleccionamos el elemento SVG de acuerdo a su referencia
        const svg = d3.select(svgRef.current);

        // Grupo del lienzo correspondiente al nuevo elemento
        const newNodeGroup = svg.select<SVGGElement>(`#${newNode.id}`);

        // Grupo del lienzo correspondiente al nuevo enlace
        const nextLinkGroup = prevLastNode ? svg.select<SVGGElement>(`#link-${prevLastNode.id}-${newNode.id}-next`) : null;

        // Animación de inserción del nuevo nodo
        enqueueNode(newNodeGroup,
            nextLinkGroup,
            nodeIdEnqueued,
            prevLastNode?.id,
            nodePositions,
            resetQueryValues,
            setIsAnimating
        );
    });

    return { svgRef }
}