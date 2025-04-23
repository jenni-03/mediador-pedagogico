import { LinkData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

/**
 * Función encargada de dibujar los nodos de la cola
 * @param svg Lienzo en el que se va a dibujar
 * @param queueNodes Nodos a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
export function drawNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    queueNodes: QueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    dims: {
        margin: { left: number; right: number };
        elementWidth: number;
        elementHeight: number;
        nodeSpacing: number;
        height: number;
    },
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, nodeSpacing, height } = dims;

    // Realizamos el data join para los nodos
    svg.selectAll<SVGGElement, QueueNodeData>("g.node")
        .data(queueNodes, d => d.id)
        .join(
            enter => {
                // Creación de los grupos
                const gEnter = enter
                    .append("g")
                    .attr("class", "node")
                    .attr("id", (d) => d.id)
                    .attr("transform", (d, i) => {
                        const x = margin.left + i * nodeSpacing;
                        const y = (height - elementHeight) / 2;
                        positions.set(d.id, { x, y });
                        return `translate(${x}, ${y})`;
                    })
                    .style("opacity", 0);

                // Contenedor del nodo
                gEnter.append("rect")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", SVG_QUEUE_VALUES.NODE_FILL_COLOR)
                    .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
                    .attr("stroke-width", 1.2);

                // Valor del nodo
                gEnter.append("text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
                    .style("font-weight", SVG_QUEUE_VALUES.NODE_TEXT_WEIGHT)
                    .style("font-size", SVG_QUEUE_VALUES.NODE_TEXT_SIZE)
                    .text(d => d.value)
                    .style("letter-spacing", "0.5px");

                return gEnter;
            },
            update => {
                update.transition()
                    .duration(1500)
                    .attr("transform", (d, i) => {
                        const x = margin.left + i * nodeSpacing;
                        const y = (height - elementHeight) / 2;
                        positions.set(d.id, { x, y });
                        return `translate(${x}, ${y})`;
                    });

                return update;
            },
            exit => {
                exit.call(
                    animateNodeDequeueExit,
                    positions,
                    elementHeight,
                    setIsAnimating
                )
            }
        );
}

/**
 * Función encargada de dibujar los enlaces pertenecientes a los nodos de la cola
 * @param svg Lienzo en el que se va a dibujar
 * @param queueNodes Nodos a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo 
 * @param elementWidth Ancho del nodo
 * @param elementHeight Alto del nodo
 */
export function drawLinks(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    queueNodes: QueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    elementWidth: number,
    elementHeight: number
) {
    // Preparamos la data de los enlaces para realizar el data join
    const linksData: LinkData[] = [];
    queueNodes.forEach(node => {
        if (node.next && positions.has(node.next)) {
            linksData.push({ sourceId: node.id, targetId: node.next, type: "next" });
        }
    });

    console.log(linksData);

    // Data join para la creación de enlaces de los nodos
    svg.selectAll<SVGPathElement, LinkData>("g.link")
        .data(linksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`)
        .join(
            enter => {
                const gLink = enter.append("g")
                    .attr("class", "link")
                    .attr("id", (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`);

                gLink.append("path")
                    .attr("class", d => `node-link ${d.type}`)
                    .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .attr("d", d => calculateLinkPath(d, positions, elementWidth, elementHeight))
                    .style("opacity", 0);

                return gLink;
            },
            update => {
                update.select("path.node-link")
                    .transition()
                    .duration(500)
                    .attr("d", d => calculateLinkPath(d, positions, elementWidth, elementHeight));

                return update;
            },
            exit => {
                exit.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove();
            }
        )
}

/**
 * 
 * @param newNodeGroup 
 * @param nextLinkGroup 
 * @param nodeEnqueued 
 * @param positions 
 * @param resetQueryValues 
 * @param setIsAnimating 
 */
export async function enqueueNode(
    newNodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    nextLinkGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null,
    nodeEnqueued: string,
    prevNodeId: string | undefined,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Posición final del nuevo nodo
    const finalPos = positions.get(nodeEnqueued)!;

    // Posición inicial del nuevo nodo
    const initialYOffset = -60;
    const initialPos = { x: finalPos.x, y: finalPos.y + initialYOffset };

    // Mapa temporal de posiciones para calular el path inicial del enlace
    const tempPositions = new Map(positions);
    tempPositions.set(nodeEnqueued, initialPos);

    // Cálculo formas de enlace inicial y final
    let initialPath = "M0,0";
    let finalPath = "M0,0";
    if (prevNodeId && nextLinkGroup) {
        const tempPositions = new Map(positions);
        tempPositions.set(nodeEnqueued, initialPos);
        initialPath = calculateLinkPath({ sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' }, tempPositions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
        finalPath = calculateLinkPath({ sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' }, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
    }

    // Establecemos el estado visual inicial antes de animar
    newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
    nextLinkGroup?.select("path.node-link").attr("d", initialPath);

    // Animación de aparición del nuevo nodo
    await newNodeGroup
        .transition()
        .duration(1500)
        .style("opacity", 1)
        .ease(d3.easeCubicInOut)
        .end();

    // Animación de aparición del enlace
    await nextLinkGroup
        ?.select("path.node-link")
        .transition()
        .duration(1500)
        .style("opacity", 1)
        .ease(d3.easeCubicInOut)
        .end();

    // Animación de movimiento del nuevo nodo y su enlace a su posición final
    const nodeMovePromise = newNodeGroup
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
        .end();

    const linkMovePromise = nextLinkGroup
        ? nextLinkGroup.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeCubicInOut)
            .attr("d", finalPath)
            .end()
        : Promise.resolve();

    // Ejecutamos ambas promesas de animación en paralelo
    await Promise.all([nodeMovePromise, linkMovePromise]);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

async function animateNodeDequeueExit(
    selection: d3.Selection<SVGGElement, QueueNodeData, SVGSVGElement, unknown>,
    positions: Map<string, { x: number, y: number }>,
    elementHeight: number,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Duración de la animación de salida
    const exitDuration = 1500;

    // Offset de movimiento del nodo 
    const moveOffsetY = elementHeight * 0.8;

    // Animación de salida del nodo
    await selection
        .transition()
        .duration(exitDuration)
        .attr("transform", (d) => {
            const currentPos = positions.get(d.id);
            const x = currentPos?.x ?? 0;
            const y = (currentPos?.y ?? 0) + moveOffsetY;
            return `translate(${x}, ${y})`;
        })
        .style("opacity", 0)
        .end();

    // Limpiar el mapa de posiciones
    selection.each(d => {
        positions.delete(d.id);
        console.log("Posición eliminada para:", d.id);
    });

    // Eliminar los nodos del DOM
    selection.remove();

    setIsAnimating(false);
}