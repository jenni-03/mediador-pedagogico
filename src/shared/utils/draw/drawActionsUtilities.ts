import { IndicatorPositioningConfig, LinkData, ListNodeData } from "../../../types";
import { SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

/**
 * Función encargada de renderizar un indicador de flecha dentro del lienzo.  
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param indicatorId Identificador del indicador.
 * @param indicatorClass Selector de clase del indicador.
 * @param nodePosition Posición del nodo al que apunta el indicador.
 * @param styleConfig Configuración de estilos para el indicador.
 * @param groupPositioningTransform Transformación de posicionamiento del grupo. 
 * @param dims Dimensiones del elemento.
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
        textRelativeX?: number;
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
                    .attr("x", styleConfig.textRelativeX ?? 0)
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
 * Función encargada de renderizar los nodos de una lista dentro del lienzo.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param listNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawListNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    listNodes: ListNodeData[],
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
    svg.selectAll<SVGGElement, ListNodeData>("g.node")
        .data(listNodes, d => d.id)
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
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                // Valor del nodo
                gEnter.append("text")
                    .attr("class", "node-value")
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
                    .attr("stroke-width", SVG_STYLE_VALUES.MEMORY_STROKE_WIDTH);

                // Dirección de memoria
                gEnter
                    .append("text")
                    .attr("class", "memory")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight + 25)
                    .attr("text-anchor", "middle")
                    .text((d) => d.memoryAddress)
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

                // Actualizar colores del contenedor en caso de haber cambiado
                update.select(".node-container")
                    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

                return update;
            },
            exit => exit
        );
}

/**
 * Función encargada de renderizar los enlaces pertenecientes a los nodos de una lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param linksData Array con información de los enlaces a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param elementWidth Ancho del nodo.
 * @param elementHeight Alto del nodo.
 */
export function drawListLinks(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    linksData: LinkData[],
    positions: Map<string, { x: number, y: number }>,
    elementWidth: number,
    elementHeight: number
) {
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
 * Función encargada de resaltar un nodo especifico. 
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodeId Id del nodo a resaltar.
 * @param rectValues Valores de estilo para el contenedor del nodo.
 * @param textValues Valores de estilo para el texto del nodo.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export function animateHighlightNode(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeId: string,
    rectValues: { highlightColor: string, rectStrokeColor: string, rectStrokeWidth: number },
    textValues: { textFillColor: string, textFontSize: string, textFontWeight: string },
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Estilos para contenedor y texto del nodo
    const { highlightColor, rectStrokeColor, rectStrokeWidth } = rectValues;
    const { textFillColor, textFontSize, textFontWeight } = textValues;

    // Grupo del lienzo correspondiente al nodo a resaltar 
    const nodeGroup = svg.select<SVGGElement>(`#${nodeId}`);

    // Grupo correspondiente al contenedor principal del nodo y al valor de este  
    const rect = nodeGroup.select("rect");
    const text = nodeGroup.select("text");

    // Animación de sobresalto del contenedor del nodo
    rect.transition()
        .duration(300)
        .attr("stroke", highlightColor)
        .attr("stroke-width", 3)
        .transition()
        .delay(800)
        .duration(300)
        .attr("stroke", rectStrokeColor)
        .attr("stroke-width", rectStrokeWidth);

    // Animación de sobresalto del valor del nodo
    text.transition()
        .duration(300)
        .attr("fill", highlightColor)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", textFillColor)
        .style("font-size", textFontSize)
        .style("font-weight", textFontWeight);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animacion
    setIsAnimating(false);
}

/**
 * Función encargada de eliminar todos los nodos y enlaces dentro del lienzo.
 * @param svg Selección D3 del elemento SVG a limpiar.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearList(
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

    // Animación de salida de los nodos
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