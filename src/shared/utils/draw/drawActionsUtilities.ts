import { IndicatorPositioningConfig } from "../../../types";

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