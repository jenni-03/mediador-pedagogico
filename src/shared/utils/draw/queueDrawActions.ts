import { IndicatorPositioningConfig, LinkData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

/**
 * Función encargada renderizar los nodos de la cola dentro del lienzo
 * @param svg Lienzo en el que se va a dibujar
 * @param queueNodes Nodos a renderizar
 * @param positions Mapa para almacenar las posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones del lienzo y sus elementos
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
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, nodeSpacing, height } = dims;

    // Data join para la creación de los nodos
    svg.selectAll<SVGGElement, QueueNodeData>("g.node")
        .data(queueNodes, d => d.id)
        .join(
            enter => {
                // Creación del grupo para cada nodo entrante
                const gEnter = enter
                    .append("g")
                    .attr("class", "node")
                    .attr("id", (d) => d.id)
                    .attr("transform", (d, i) => {
                        // Cálculo de la posición del nodo
                        const x = margin.left + i * nodeSpacing;
                        const y = (height - elementHeight) / 2;
                        positions.set(d.id, { x, y });
                        return `translate(${x}, ${y})`;
                    });

                // Contenedor del nodo
                gEnter.append("rect")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                // Valor del nodo
                gEnter.append("text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2)
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
                    .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
                    .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
                    .text(d => d.value)
                    .style("letter-spacing", "0.5px");

                // Bloque de dirección de memoria
                gEnter
                    .append("rect")
                    .attr("class", "memory-container")
                    .attr("y", elementHeight + 10)
                    .attr("width", elementWidth)
                    .attr("height", 20)
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("fill", SVG_STYLE_VALUES.MEMORY_FILL_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.MEMORY_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.MEMORY_SRTOKE_WIDTH);

                // Dirección de memoria
                gEnter
                    .append("text")
                    .attr("class", "memory")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight + 25)
                    .attr("text-anchor", "middle")
                    .text((d) => d.address)
                    .attr("fill", SVG_STYLE_VALUES.MEMORY_TEXT_COLOR)
                    .style("font-size", SVG_STYLE_VALUES.MEMORY_TEXT_SIZE)
                    .style("font-weight", SVG_STYLE_VALUES.MEMORY_TEXT_WEIGHT);

                return gEnter;
            },
            update => {
                // Guarda la posición actualizada para cada nodo presente en el DOM
                update.each((d, i) => {
                    const x = margin.left + i * nodeSpacing;
                    const y = (height - elementHeight) / 2;
                    positions.set(d.id, { x, y });
                });

                return update;
            },
            exit => exit
        );
}

/**
 * Función encargada de renderizar los enlaces pertenecientes a cada nodo de la cola
 * @param svg Lienzo en el que se va a dibujar
 * @param queueNodes Nodos a renderizar
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo 
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
    // Determinamos los enlaces a renderizar en base a la data de los nodos
    const linksData: LinkData[] = [];
    queueNodes.forEach(node => {
        if (node.next && positions.has(node.next)) {
            linksData.push({ sourceId: node.id, targetId: node.next, type: "next" });
        }
    });

    console.log(linksData);

    // Data join para la creación de los enlaces entre nodos
    svg.selectAll<SVGGElement, LinkData>("g.link")
        .data(linksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`)
        .join(
            enter => {
                // Creación del grupo para cada nuevo enlace
                const gLink = enter.append("g")
                    .attr("class", "link")
                    .attr("id", (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`);

                // Path del enlace
                gLink.append("path")
                    .attr("class", d => `node-link ${d.type}`)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .attr("d", d => calculateLinkPath(d, positions, elementWidth, elementHeight));

                return gLink;
            },
            update => update,
            exit => exit
        )
}

/**
 * Función encargada de animar la inserción de un nuevo nodo en la cola
 * @param svg Lienzo en el que se va a dibujar
 * @param nodeEnqueued Id del nuevo nodo
 * @param prevNodeId Id del nodo anterior al nuevo nodo
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateEnqueueNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeEnqueued: string,
    prevNodeId: string | undefined,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`#${nodeEnqueued}`);

    // Grupo del lienzo correspondiente al enlace que apunta al nuevo nodo
    const nextLinkGroup = prevNodeId ? svg.select<SVGGElement>(`#link-${prevNodeId}-${nodeEnqueued}-next`) : null;

    // Grupo del lienzo correspondiente al indicador del elemento cabeza
    const tailIndicatorGroup = svg.select<SVGGElement>("#tail-indicator");

    // Posición de animación final del nuevo nodo
    const finalPos = positions.get(nodeEnqueued);

    if (finalPos) {
        // Estado visual inicial del nuevo nodo y el enlace que apunta a él (ocultos)
        newNodeGroup.style("opacity", 0);
        nextLinkGroup?.select("path.node-link").style("opacity", 0);

        // Posición de animación inicial del nuevo nodo
        const initialYOffset = -60;
        const initialPos = { x: finalPos.x, y: finalPos.y + initialYOffset };

        // Mapa temporal de posiciones para calular la forma inicial del enlace
        const tempPositions: Map<string, {
            x: number;
            y: number;
        }> = new Map(positions);
        tempPositions.set(nodeEnqueued, initialPos);

        // Cálculo de la forma inicial y final del enlace
        let initialPath = "M0,0";
        let finalPath = "M0,0";
        if (prevNodeId && nextLinkGroup) {
            initialPath = calculateLinkPath({ sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' }, tempPositions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
            finalPath = calculateLinkPath({ sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' }, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
        }

        // Posicionamiento inicial del nuevo nodo y su enlace
        if (nextLinkGroup) newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
        nextLinkGroup?.select("path.node-link").attr("d", initialPath);

        // Animación de aparición del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .end();

        // Animación de aparición del enlace
        await nextLinkGroup
            ?.select("path.node-link")
            .transition()
            .duration(1500)
            .style("opacity", 1)
            .ease(d3.easeExpInOut)
            .end();

        // Animación de movimiento del nuevo nodo y su enlace a su posición final
        const nodeMovePromise = newNodeGroup
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
            .end();

        const linkMovePromise = nextLinkGroup
            ? nextLinkGroup.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easeBounce)
                .attr("d", finalPath)
                .end()
            : Promise.resolve();

        // Resolución de las promesas de animación de movimiento
        await Promise.all([nodeMovePromise, linkMovePromise]);

        // Animación de movimiento del indicador de tope
        await tailIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeQuadInOut)
            .attr("transform", () => {
                const finalX = finalPos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                const finalY = finalPos.y;
                return `translate(${finalX}, ${finalY})`;
            })
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de animar la salida de un nodo de la cola
 * @param svg Lienzo en el que se va a dibujar
 * @param prevFirstNode Nodo que se decola
 * @param remainingNodesData Nodos restantes en la cola
 * @param positions Posiciones de los nodos dentro del lienzo
 * @param dims Dimensiones de los elementos
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateDequeueNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    prevFirstNode: QueueNodeData,
    remainingNodesData: QueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Id del nodo a desencolar
    const nodeIdDequeued = prevFirstNode.id;

    // Grupo del lienzo correspondiente al elemento a decolar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`#${nodeIdDequeued}`);

    // Grupo del lienzo correspondiente al enlace del elemento a decolar
    const linkToRemoveGroup = svg.select<SVGGElement>(`#link-${nodeIdDequeued}-${prevFirstNode.next}-next`);

    // Grupo del lienzo correspondiente al indicador del elemento cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("#head-indicator");

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const tailIndicatorGroup = svg.select<SVGGElement>("#tail-indicator");

    // Movimiento del nodo a decolar 
    const nodeMoveOffsetY = SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

    // Animación de salida del enlace
    await linkToRemoveGroup
        .select("path.node-link")
        .transition()
        .duration(1500)
        .ease(d3.easeBounce)
        .style("opacity", 0)
        .end();

    // Animación de salida del nodo
    await nodeToRemoveGroup
        .transition()
        .ease(d3.easeBackInOut)
        .duration(1500)
        .attr("transform", () => {
            const currentPos = positions.get(nodeIdDequeued);
            const x = currentPos?.x ?? 0;
            const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
            return `translate(${x}, ${y})`;
        })
        .style("opacity", 0)
        .end();

    // Eliminación de los elementos del DOM correspondientes al nodo decolado
    nodeToRemoveGroup.remove();
    linkToRemoveGroup.remove();

    // Eliminación de la posición del nodo decolado
    positions.delete(nodeIdDequeued);

    if (remainingNodesData.length > 0) {
        // Animación de salida del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 0)
            .end();

        // Array de promesas para animaciones de desplazamiento de nodos y enlaces restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, QueueNodeData>("g.node")
            .data(remainingNodesData, d => d.id);

        // Por cada nodo restante, se calcula la transición a su posición final
        remainingNodes.each(function (d) {
            const group = d3.select(this);
            const finalPos = positions.get(d.id);
            if (finalPos) {
                shiftPromises.push(
                    group.transition()
                        .duration(1500)
                        .ease(d3.easeBounce)
                        .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
                        .end()
                );
            }
        });

        // Recálculo de los enlaces en base a la información de los nodos restantes
        const remainingLinksData: LinkData[] = [];
        remainingNodesData.forEach(node => {
            if (node.next && positions.has(node.next)) {
                remainingLinksData.push({ sourceId: node.id, targetId: node.next, type: "next" });
            }
        });

        // Selección de enlaces restantes (re-vinculación de datos)
        const remainingLinks = svg.selectAll<SVGGElement, LinkData>("g.link")
            .data(remainingLinksData, d => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Por cada enlace, se crea su transición a su forma final
        remainingLinks.each(function (d) {
            const path = d3.select(this).select<SVGPathElement>("path.node-link");
            const finalPathD = calculateLinkPath(d, positions, SVG_QUEUE_VALUES.ELEMENT_WIDTH, SVG_QUEUE_VALUES.ELEMENT_HEIGHT);
            shiftPromises.push(
                path.transition()
                    .duration(1500)
                    .ease(d3.easeBounce)
                    .attr("d", finalPathD)
                    .end()
            );
        });

        // Animación de posicionamiento del indicador de tope a su elemento correspondiente
        const finalTailIndicatorPos = positions.get(remainingNodesData[remainingNodesData.length - 1].id)!;
        shiftPromises.push(
            tailIndicatorGroup
                .transition()
                .duration(1500)
                .ease(d3.easeBounce)
                .attr("transform", () => {
                    const finalX = finalTailIndicatorPos.x + SVG_QUEUE_VALUES.ELEMENT_WIDTH / 2;
                    const finalY = finalTailIndicatorPos.y;
                    return `translate(${finalX}, ${finalY})`;
                })
                .end()
        );

        // Resolución de las promesas de animación de desplazamiento
        await Promise.all(shiftPromises);

        // Animación de entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

/**
 * Función encargada de renderizar un indicador de flecha dentro del lienzo  
 * @param svg Lienzo en el que se va a dibujar
 * @param indicatorId Identificador del indicador
 * @param indicatorClass Selector de clase del indicador
 * @param nodePosition Posición del nodo al que apunta el indicador
 * @param styleConfig Configuración de estilos para el indicador
 * @param groupPositioningTransform Transformación de posicionamiento del grupo 
 * @param dims Dimensiones del elemento
 */
export function drawArrowIndicator(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    indicatorId: string,
    indicatorClass: string,
    nodePosition: { x: number, y: number } | null,
    styleConfig: {
        text: string;
        textColor: string;
        arrowColor: string;
        fontSize: string;
        fontWeight: string;
        arrowPathData: string;
        textRelativeY: number;
        arrowTransform: string;
    },
    groupPositioningTransform: IndicatorPositioningConfig,
    dims: { elementWidth: number, elementHeight: number }
) {
    // Posicionamiento del indicador
    const indicatorData = nodePosition ? [nodePosition] : [];

    // Data join para la creación del indicador
    svg.selectAll<SVGGElement, { x: number, y: number }>(`g.${indicatorClass}`)
        .data(indicatorData, () => indicatorId)
        .join(
            enter => {
                // Creación del grupo para el indicador (oculto inicialmente)
                const gEnter = enter.append("g")
                    .attr("id", indicatorId)
                    .attr("class", indicatorClass)
                    .style("opacity", 0);

                // Elemento de texto
                gEnter.append("text")
                    .attr("class", `${indicatorClass}-text`)
                    .attr("text-anchor", "middle")
                    .attr("fill", styleConfig.textColor)
                    .attr("font-size", styleConfig.fontSize)
                    .attr("font-weight", styleConfig.fontWeight)
                    .attr("x", 0)
                    .attr("y", styleConfig.textRelativeY)
                    .text(styleConfig.text);

                // Elemento de flecha
                gEnter.append("path")
                    .attr("class", `${indicatorClass}-arrow`)
                    .attr("d", styleConfig.arrowPathData)
                    .attr("fill", styleConfig.arrowColor)
                    .attr("transform", styleConfig.arrowTransform)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5);

                // Establecimiento de la posición inicial del grupo
                gEnter.transition()
                    .duration(1200)
                    .style("opacity", 1)
                    .attr("transform", d => groupPositioningTransform.calculateTransform(d, dims));

                return gEnter;
            },
            update => update,
            exit => exit.transition().duration(1000).style("opacity", 0).remove()
        );
}

/**
 * Función encargada de eliminar todos los nodos y enlaces del lienzo
 * @param svg Lienzo que se va a limpiar
 * @param nodePositions Mapa de posiciones de los nodos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateClearQueue(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodePositions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Animación de salida de los enlaces
    await svg.selectAll("g.link")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Animacición de salida de los nodos
    await svg.selectAll("g.node")
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

    // Eliminación de los nodos y enlaces del DOM
    svg.selectAll("g.node").remove();
    svg.selectAll("g.link").remove();

    // Liempiza del mapa de posiciones
    nodePositions.clear();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}