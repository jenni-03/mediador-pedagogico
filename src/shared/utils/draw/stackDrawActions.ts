import { StackNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STACK_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";

/**
 * Función encargada de renderizar los nodos de la pila
 * @param svg Lienzo en el que se va a dibujar
 * @param pushNodes Nodos a dibujar
 * @param positions Mapa de posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
export function drawStackNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    pushNodes: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    dims: {
        margin: { left: number; right: number };
        elementWidth: number;
        elementHeight: number;
        verticalSpacing: number;
        height: number;
        nodesHeight: number;
    }
) {
    // Dimensiones del lienzo
    const { margin, elementWidth, elementHeight, verticalSpacing, height, nodesHeight } = dims;

    // Verificamos si hay un espacio adicional para animación en la parte superior
    const animationSpace = Math.max(0, height - nodesHeight);
    console.log("nodesHeight:", nodesHeight);
    console.log("animation space:", animationSpace)

    // Calculamos un offset adicional para posicionar la pila más abajo cuando hay espacio para animación
    const offsetY = animationSpace;

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
                    .attr("transform", (d, i) => {
                        // Cálculo de la posición del nodo
                        const x = margin.left;
                        const y = SVG_STACK_VALUES.MARGIN_TOP + offsetY + i * verticalSpacing;
                        positions.set(d.id, { x, y });
                        return `translate(${x}, ${y})`;
                    })

                // Contenedor principal del nodo
                gEnter
                    .append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 12)
                    .attr("ry", 12)
                    .attr("fill", "#ffffff")
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5);

                // Sección superior para el valor del nodo
                const valueSection = gEnter
                    .append("g")
                    .attr("class", "value-section");

                // Contenedor del valor del nodo
                valueSection
                    .append("rect")
                    .attr("class", "value-container")
                    .attr("width", elementWidth - 2)
                    .attr("height", elementHeight / 2 - 1)
                    .attr("x", 1)
                    .attr("y", 1)
                    .attr("rx", 8)
                    .attr("ry", 8)
                    .attr("fill", SVG_STYLE_VALUES.RECT_STROKE_COLOR);

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
                    .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.value);

                // Sección inferior para la dirección de memoria
                const memorySection = gEnter
                    .append("g")
                    .attr("class", "memory-section");

                // Texto de la dirección de memoria
                memorySection
                    .append("text")
                    .attr("class", "memory-text")
                    .attr("x", elementWidth / 2)
                    .attr("y", (elementHeight * 3) / 4 + 4)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("fill", "#444")
                    .style("font-weight", "bold")
                    .style("font-size", "12px")
                    .style("letter-spacing", "0.5px")
                    .text((d) => d.memoryAddress);

                return gEnter;
            },
            (update) => {
                // Guarda la posición actualizada para cada nodo presente
                update
                    .each((d, i) => {
                        const x = margin.left;
                        const y = SVG_STACK_VALUES.MARGIN_TOP + offsetY + i * verticalSpacing;
                        positions.set(d.id, { x, y });
                    });

                // Actualizamos los textos por si cambiaron
                update.select(".value-text").text((d) => d.value);
                update.select(".memory-text").text((d) => d.memoryAddress);

                return update;
            },
            (exit) => exit
        );
}

/**
 * Función encargada de animar la entrada de un nuevo nodo en la pila 
 * @param svg Lienzo en el que se va a dibujar
 * @param nodeStacked ID del nodo apilado
 * @param remainingNodesData Información de los nodos dentro de la pila
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function pushNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeStacked: string,
    remainingNodesData: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${nodeStacked}`);

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const topeIndicatorGroup = svg.select<SVGGElement>("g#tope-indicator");

    // Posición final del nuevo nodo
    const finalPos = positions.get(nodeStacked)!;

    // Cálculo de la posición de animación inicial del nuevo nodo
    const topMargin = 20;
    const initialPos = {
        x: finalPos.x,
        y: topMargin
    };

    // Establecimiento del estado visual inicial para el nuevo nodo
    newNodeGroup
        .style("opacity", 0)
        .attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

    // Animación de aparición del nuevo nodo
    await newNodeGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .ease(d3.easeCubicInOut)
        .end();

    // En caso de haber mas nodos dentro de la pila
    if (remainingNodesData.length >= 1) {
        // Animación de salida del indicador tope
        await topeIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 0)
            .end();

        // Array de promesas para concretar animaciones de desplazamiento de nodos.
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos adicionales (re-vinculación de datos)
        const remainingNodes = svg
            .selectAll<SVGGElement, StackNodeData>("g.node")
            .data(remainingNodesData, (d) => d.id);

        // Por cada nodo dentro de la pila cálculamos la transición a su posición final
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

        // Resolución de las promesas de animación de desplazamiento
        await Promise.all(shiftPromises);

        // Animación de entrada del indicador tope
        await topeIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 1)
            .end();
    }

    // Animación de movimiento del nuevo nodo a su posición final
    await newNodeGroup
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
        .end();

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animación
    setIsAnimating(false);
}

export function highlightTopNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    stackNodes: StackNodeData[],
    onEnd: () => void
) {
    const topNodeId = stackNodes[0].id;
    const topNodeGroup = svg.select<SVGGElement>(`#${topNodeId}`);

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

    // ?????????
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

/**
 * Función encargada de animar la salida de un nodo de la pila 
 * @param svg Lienzo en el que se va a dibujar
 * @param nodeIdPop Id del nodo desapilado 
 * @param remainingNodesData Información de los nodos restantes de la pila
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateNodePopExit(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeIdPop: string,
    remainingNodesData: StackNodeData[],
    positions: Map<string, { x: number; y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Grupo del lienzo correspondiente al elemento a desapilar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${nodeIdPop}`);

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const topeIndicatorGroup = svg.select<SVGGElement>("g#tope-indicator");

    // Movimiento del nodo a desapilar
    const nodeMoveOffsetY = -SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

    // Animación de salida del nodo
    await nodeToRemoveGroup
        .transition()
        .ease(d3.easeBackInOut)
        .duration(1500)
        .attr("transform", () => {
            const currentPos = positions.get(nodeIdPop);
            const x = currentPos?.x ?? 0;
            const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
            return `translate(${x}, ${y})`;
        })
        .style("opacity", 0)
        .end();

    // Eliminación de los elementos del DOM correspondientes al nodo decolado
    nodeToRemoveGroup.remove();

    // Eliminación de la posición del nodo decolado
    positions.delete(nodeIdPop);

    // Si hay nodos por mover
    if (remainingNodesData.length > 0) {
        // Animación de salida del indicador de tope
        await topeIndicatorGroup
            .transition()
            .duration(1000)
            .ease(d3.easeBounce)
            .style("opacity", 0)
            .end();

        // Array de promesas para animaciones de desplazamiento de los nodos restantes
        const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg
            .selectAll<SVGGElement, StackNodeData>("g.node")
            .data(remainingNodesData, (d) => d.id);

        // Por cada nodo restante, se calcula la transición a su posición final
        remainingNodes.each(function (d) {
            const group = d3.select(this);
            const finalPos = positions.get(d.id);
            console.log(finalPos);
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

        // Resolución de las promesas de animación de desplazamiento
        await Promise.all(shiftPromises);

        // Animación de entrada del indicador de tope
        await topeIndicatorGroup
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
