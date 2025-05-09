import { StackNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STACK_VALUES } from "../../constants/consts";
import { RefObject } from "react";

/**
 * Función para dibujar el indicador de TOPE en la pila
 * @param svg Lienzo en el que se va a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo
 * @param topNodeId ID del nodo que está en el tope de la pila
 * @param elementWidth Ancho de los elementos
 * @param elementHeight Alto de los elementos
 */
export function drawTopIndicator(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    positions: Map<string, { x: number; y: number }>,
    topNodeId: string | undefined,
    elementWidth: number,
    elementHeight: number
) {
    // Eliminamos cualquier indicador de tope existente
    svg.selectAll("g.top-indicator").remove();

    // Si no hay nodos en la pila, no dibujamos el indicador
    if (!topNodeId) return;

    // Obtenemos la posición del nodo superior
    const topNodePos = positions.get(topNodeId);
    if (!topNodePos) return;

    // Creamos un grupo para el indicador de tope
    const topIndicator = svg
        .append("g")
        .attr("class", "top-indicator")
        .attr("id", "stack-top-indicator");

    // Definimos las posiciones para la flecha
    const arrowStartX = topNodePos.x + elementWidth + 30; // 30px a la derecha del nodo (más distancia)
    const arrowStartY = topNodePos.y + elementHeight / 2;
    const arrowEndX = topNodePos.x + elementWidth + 10; // Punta de la flecha cerca del nodo
    const arrowEndY = arrowStartY;

    // Dibujamos la línea de la flecha (más ancha)
    topIndicator
        .append("line")
        .attr("x1", arrowStartX)
        .attr("y1", arrowStartY)
        .attr("x2", arrowEndX)
        .attr("y2", arrowEndY)
        .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR) // Color rojo tomate para destacar
        .attr("stroke-width", 4); // Línea más ancha (aumentado de 2 a 4)

    // Añadimos la punta de la flecha (más grande)
    topIndicator
        .append("polygon")
        .attr(
            "points",
            `
            ${arrowEndX},${arrowEndY} 
            ${arrowEndX + 10},${arrowEndY - 10} 
            ${arrowEndX + 10},${arrowEndY + 10}
        `
        )
        .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR);

    // Añadimos el texto "TOPE"
    topIndicator
        .append("text")
        .attr("x", arrowStartX + 10) // 10px a la derecha del inicio de la flecha
        .attr("y", arrowStartY)
        .attr("dy", "0.35em") // Alineación vertical
        .attr("text-anchor", "start")
        .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
        .style("font-weight", "bold")
        .style("font-size", "18px")
        .text("TOPE");
}

/**
 * Función encargada de dibujar los nodos de la pila
 * @param svg Lienzo en el que se va a dibujar
 * @param pushNodes Nodos a dibujar
 * @param positions Posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
export function drawNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    pushNodes: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    dims: {
        margin: { left: number; right: number };
        elementWidth: number;
        elementHeight: number;
        verticalSpacing: number;
        height: number;
    }
) {
    const { margin, elementWidth, elementHeight, verticalSpacing } = dims;

    // Verificamos si hay un espacio adicional para animación en la parte superior
    const svgHeight = parseFloat(svg.attr("height"));
    const nodesHeight =
        SVG_STACK_VALUES.MARGIN_TOP +
        pushNodes.length * verticalSpacing +
        SVG_STACK_VALUES.MARGIN_BOTTOM;
    const animationSpace = Math.max(0, svgHeight - nodesHeight);

    // Calculamos un offset adicional para posicionar la pila más abajo cuando hay espacio para animación
    const offsetY = animationSpace;

    // Primero calculamos las posiciones finales de todos los nodos
    pushNodes.forEach((node, i) => {
        const x = margin.left;
        const y = SVG_STACK_VALUES.MARGIN_TOP + offsetY + i * verticalSpacing;
        positions.set(node.id, { x, y });
    });

    // Realizamos el data join para los nodos
    svg.selectAll<SVGGElement, StackNodeData>("g.node")
        .data(pushNodes, (d) => d.id)
        .join(
            (enter) => {
                // Creación de los grupos para nuevos nodos
                const gEnter = enter
                    .append("g")
                    .attr("class", "node")
                    .attr("id", (d) => d.id)
                    .attr("transform", (d) => {
                        // Posicionamos el nodo directamente en su posición calculada
                        const pos = positions.get(d.id)!;
                        return `translate(${pos.x}, ${pos.y})`;
                    })
                    .style("opacity", 1); // Los nodos iniciales comienzan visibles

                // Contenedor principal del nodo (borde exterior con bordes redondeados y sombra)
                gEnter
                    .append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 12)
                    .attr("ry", 12)
                    .attr("fill", "#ffffff")
                    .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
                    .attr("stroke-width", 1.5);

                // Sección superior para el valor con color azul más atractivo
                const valueSection = gEnter
                    .append("g")
                    .attr("class", "value-section");

                // Rectángulo de la sección superior
                valueSection
                    .append("rect")
                    .attr("class", "value-container")
                    .attr("width", elementWidth - 2) // margen interior para estética
                    .attr("height", elementHeight / 2 - 1)
                    .attr("x", 1)
                    .attr("y", 1)
                    .attr("rx", 8)
                    .attr("ry", 8)
                    .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR); // azul llamativo

                // Texto del valor
                valueSection
                    .append("text")
                    .attr("class", "value-text")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 4 + 2)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "white")
                    .style("font-weight", "bold")
                    .style("font-size", "18px")
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.value);

                // Sección inferior para la dirección de memoria
                const memorySection = gEnter
                    .append("g")
                    .attr("class", "memory-section");

                // Texto de la dirección de memoria directamente sin contenedor gris
                memorySection
                    .append("text")
                    .attr("class", "memory-text")
                    .attr("x", elementWidth / 2)
                    .attr("y", (elementHeight * 3) / 4 + 4)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "#444") // gris oscuro
                    .style("font-weight", "normal")
                    .style("font-size", "12px")
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.memoryAddress);

                return gEnter;
            },
            (update) => {
                // Movemos los nodos existentes instantáneamente sin animación
                update
                    .attr("transform", (d) => {
                        const pos = positions.get(d.id)!;
                        return `translate(${pos.x}, ${pos.y})`;
                    })
                    .style("opacity", 1);

                // Actualizamos los textos por si cambiaron
                update.select(".value-text").text((d) => d.value);
                update.select(".memory-text").text((d) => d.memoryAddress);

                return update;
            }
        );

    // Añadimos el indicador de tope si hay nodos en la pila
    if (pushNodes.length > 0) {
        // El nodo superior es el primero en el array (debido al orden visual en una pila)
        const topNodeId = pushNodes[0].id;
        drawTopIndicator(
            svg,
            positions,
            topNodeId,
            elementWidth,
            elementHeight
        );
    } else {
        // Si no hay nodos, eliminamos cualquier indicador existente
        svg.selectAll("g.top-indicator").remove();
    }
}

/**
 *
 * @param newNodeGroup
 * @param nextLinkGroup
 * @param nodeStacked
 * @param positions
 * @param resetQueryValues
 * @param setIsAnimating
 */
export async function pushNode(
    newNodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodeStacked: string,
    positions: Map<string, { x: number; y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Marcamos el inicio de la animación
    setIsAnimating(true);

    // Importante: Aseguramos que todos los nodos existentes permanezcan visibles
    const svgElement = newNodeGroup.node()?.ownerSVGElement;

    // Posición final del nuevo nodo
    const finalPos = positions.get(nodeStacked)!;

    // Calculamos la posición inicial en la parte superior del SVG con un pequeño margen
    const topMargin = 20; // Un pequeño margen desde el borde superior
    const initialPos = {
        x: finalPos.x,
        y: topMargin, // Posicionamos el elemento cerca del borde superior del SVG
    };

    // Establecemos el estado visual inicial del nuevo nodo antes de animar
    newNodeGroup
        .style("opacity", 0) // Aseguramos que comienza invisible
        .attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

    // Durante la animación, eliminamos temporalmente el indicador de tope
    if (svgElement) {
        d3.select(svgElement).selectAll("g.top-indicator").remove();
    }

    // 1. Animación de aparición del nuevo nodo
    await newNodeGroup
        .transition()
        .duration(800)
        .style("opacity", 1)
        .ease(d3.easeCubicInOut)
        .end();

    // 2. Animación de movimiento del nuevo nodo a su posición final
    const nodeMovePromise = newNodeGroup
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
        .end();

    // Ejecutamos ambas promesas de animación en paralelo
    await Promise.all([nodeMovePromise]);

    // Después de completar la animación, añadimos el indicador de tope al nuevo nodo (que ahora es el superior)
    if (svgElement) {
        const svg = d3.select(svgElement);
        const elementWidth = SVG_STACK_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_STACK_VALUES.ELEMENT_HEIGHT;

        // Dibujamos el nuevo indicador de tope
        drawTopIndicator(
            svg,
            positions,
            nodeStacked,
            elementWidth,
            elementHeight
        );

        // Seleccionamos el nuevo indicador
        const newTopIndicator = svg.select<SVGGElement>("g.top-indicator");

        // Lo hacemos inicialmente invisible
        newTopIndicator.style("opacity", 0);

        // Animamos su aparición
        await newTopIndicator
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

export function highlightTopNode(
    svgRef: RefObject<SVGSVGElement>,
    stackNodes: StackNodeData[],
    onEnd: () => void
) {
    if (!svgRef.current || stackNodes.length === 0) {
        onEnd();
        return;
    }

    const svg = d3.select(svgRef.current);
    const topNodeId = stackNodes[0].id;
    const topNodeGroup = svg.select<SVGGElement>(`#${topNodeId}`);

    if (topNodeGroup.empty()) {
        console.error("No se encontró el nodo del tope:", topNodeId);
        onEnd();
        return;
    }

    // Color para resaltar el nodo tope
    const highlightColor = "#00e676"; // Verde neón
    const defaultStroke = SVG_STACK_VALUES.NODE_STROKE_COLOR;

    // Animamos el nodo
    topNodeGroup
        .raise()
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr("transform", function () {
            const current = d3.select(this).attr("transform");
            const match = /translate\(([^,]+),([^)]+)\)/.exec(current);
            if (!match) return current;
            const [x, y] = [parseFloat(match[1]), parseFloat(match[2])];
            return `translate(${x}, ${y}) scale(1)`;
        });

    const rect = topNodeGroup.select(".node-container");
    const text = topNodeGroup.select(".value-text");

    rect.transition()
        .duration(300)
        .attr("stroke", highlightColor)
        .attr("stroke-width", 3)
        .transition()
        .delay(800)
        .duration(300)
        .attr("stroke", defaultStroke)
        .attr("stroke-width", 1.5);

    text.transition()
        .duration(300)
        .attr("fill", highlightColor)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", "white")
        .style("font-size", "18px")
        .style("font-weight", "bold");

    // Resaltar la flecha del top
    const topIndicator = svg.select<SVGGElement>("g.top-indicator");

    // Resaltar línea de flecha
    topIndicator
        .select("line")
        .transition()
        .duration(300)
        .attr("stroke", "#00e676")
        .attr("stroke-width", 6) // más gruesa
        .transition()
        .delay(800)
        .duration(300)
        .attr("stroke", SVG_QUEUE_VALUES.NODE_STROKE_COLOR)
        .attr("stroke-width", 4);

    // Resaltar punta de flecha
    topIndicator
        .select("polygon")
        .transition()
        .duration(300)
        .attr("fill", "#00e676")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", SVG_QUEUE_VALUES.NODE_STROKE_COLOR);

    // Resaltar texto "TOPE"
    topIndicator
        .select("text")
        .transition()
        .duration(300)
        .attr("fill", "#00e676")
        .style("font-size", "19px")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", SVG_QUEUE_VALUES.NODE_TEXT_COLOR)
        .style("font-size", "18px");

    d3.timeout(() => {
        topNodeGroup
            .transition()
            .duration(300)
            .attr("transform", function () {
                const current = d3.select(this).attr("transform");
                const match = /translate\(([^,]+),([^)]+)\)/.exec(current);
                if (!match) return current;
                const [x, y] = [parseFloat(match[1]), parseFloat(match[2])];
                return `translate(${x}, ${y}) scale(1)`;
            });

        onEnd();
    }, 1500);

}

export async function animateNodePopExit(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    prevFirstNode: StackNodeData,
    remainingNodesData: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    setIsAnimating(true);

    // Id del nodo a desapilar
    const nodeIdPop = prevFirstNode.id;

    console.log("Animando la salida del nodo:", nodeIdPop);

    // Grupo del lienzo correspondiente al elemento a desapilar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`#${nodeIdPop}`);

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const tailIndicatorGroup = svg.select<SVGGElement>("g.top-indicator");

    // Movimiento del nodo a desapilar
    const nodeMoveOffsetY = -SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

    // Animación de salida del nodo
    await nodeToRemoveGroup
        .transition()
        .ease(d3.easeBackIn)
        .duration(1500)
        .attr("transform", () => {
            const currentPos = positions.get(nodeIdPop);
            const x = currentPos?.x ?? 0;
            const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
            return `translate(${x}, ${y})`;
        })
        .style("opacity", 0)
        .end();

    // Animación de salida del indicador de tope
    await tailIndicatorGroup
        .transition()
        .duration(1000)
        .ease(d3.easeBounce)
        .style("opacity", 0)
        .end();

    // Eliminación de los elementos del DOM correspondientes al nodo decolado
    nodeToRemoveGroup.remove();

    // Eliminación de la posición del nodo decolado
    positions.delete(nodeIdPop);

    // Solo continuamos si hay nodos restantes
    if (remainingNodesData.length > 0) {
        // Array de promesas para animaciones de desplazamiento de nodos y enlaces restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg
            .selectAll<SVGGElement, StackNodeData>("g.node")
            .data(remainingNodesData, (d) => d.id);

        // Por cada nodo restante, se calcula la transición a su posición final
        remainingNodes.each(function (d) {
            const group = d3.select(this);
            const finalPos = positions.get(d.id);
            if (finalPos) {
                shiftPromises.push(
                    group
                        .transition()
                        .duration(1500)
                        .ease(d3.easeElasticOut)
                        .attr(
                            "transform",
                            `translate(${finalPos.x}, ${finalPos.y})`
                        )
                        .end()
                );
            }
        });

        // Resolución de las promesas de animación de desplazamiento
        await Promise.all(shiftPromises);

        // Primero eliminamos cualquier indicador anterior (por si acaso)
        svg.selectAll("g.top-indicator").remove();

        // El nuevo nodo superior es el primero en el array de nodos restantes
        const newTopNodeId = remainingNodesData[0].id;

        // Dibujamos el nuevo indicador con opacidad 0 inicialmente
        drawTopIndicator(
            svg,
            positions,
            newTopNodeId,
            SVG_STACK_VALUES.ELEMENT_WIDTH,
            SVG_STACK_VALUES.ELEMENT_HEIGHT
        );

        // Seleccionamos el nuevo indicador
        const newTopIndicator = svg.select<SVGGElement>("g.top-indicator");

        // Lo hacemos inicialmente invisible
        newTopIndicator.style("opacity", 0);

        // Animamos su aparición
        await newTopIndicator
            .transition()
            .duration(1500)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    }

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}
