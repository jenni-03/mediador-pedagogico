import { LinkData, PriorityQueueNodeData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

// Función para obtener el color según la prioridad (ahora retorna un objeto con fill y stroke)
export function getPriorityColor(priority: number): { fill: string; stroke: string } {
    if (priority >= 1 && priority <= 3) {
        return {
            fill: "#FFB3B3",    // Rojo claro
            stroke: "#CC0000"   // Rojo oscuro
        };
    } else if (priority >= 4 && priority <= 6) {
        return {
            fill: "#FFD4AA",    // Naranja claro
            stroke: "#CC6600"   // Naranja oscuro
        };
    } else if (priority >= 7 && priority <= 10) {
        return {
            fill: "#B3D4FF",    // Azul claro
            stroke: "#0066CC"   // Azul oscuro
        };
    } else {
        return {
            fill: "#CCCCCC",    // Gris claro por defecto
            stroke: "#666666"   // Gris oscuro por defecto
        };
    }
}

// Función auxiliar para crear una animación de "pulso" en el nodo nuevo (MODIFICADA)
export function addPriorityPulseAnimation(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeId: string,
    priority: number
): Promise<void> {
    return new Promise((resolve) => {
        const nodeGroup = svg.select<SVGGElement>(`g#${nodeId}`);
        const nodeContainer = nodeGroup.select(".node-container");
        const priorityBadge = nodeGroup.select(".priority-badge");
        const priorityColors = getPriorityColor(priority);
        
        // Animación de pulso del color del nodo con colores más intensos
        nodeContainer
            .transition()
            .duration(300)
            .attr("fill", d3.color(priorityColors.fill)?.brighter(0.3)?.toString() || priorityColors.fill)
            .attr("stroke", d3.color(priorityColors.stroke)?.brighter(0.3)?.toString() || priorityColors.stroke)
            .transition()
            .duration(300)
            .attr("fill", priorityColors.fill)
            .attr("stroke", priorityColors.stroke)
            .transition()
            .duration(300)
            .attr("fill", d3.color(priorityColors.fill)?.brighter(0.3)?.toString() || priorityColors.fill)
            .attr("stroke", d3.color(priorityColors.stroke)?.brighter(0.3)?.toString() || priorityColors.stroke)
            .transition()
            .duration(300)
            .attr("fill", priorityColors.fill)
            .attr("stroke", priorityColors.stroke);

        // Animación especial para el badge de prioridad
        priorityBadge
            .transition()
            .duration(200)
            .attr("r", 16) // Crecer
            .attr("fill", "rgba(255,255,255,0.9)")
            .transition()
            .duration(200)
            .attr("r", 14) // Volver al tamaño normal
            .attr("fill", "rgba(0,0,0,0.7)")
            .transition()
            .duration(200)
            .attr("r", 16) // Crecer de nuevo
            .attr("fill", "rgba(255,255,255,0.9)")
            .transition()
            .duration(200)
            .attr("r", 14) // Tamaño final
            .attr("fill", "rgba(0,0,0,0.7)")
            .on("end", () => resolve());
    });
}

/**
 * Función encargada renderizar los nodos de la cola dentro del lienzo (MODIFICADA)
 * @param svg Lienzo en el que se va a dibujar
 * @param queueNodes Nodos a renderizar
 * @param positions Mapa de posiciones de cada uno de los nodos dentro del lienzo
 * @param dims Dimensiones del lienzo y sus elementos
 */
export function drawNodes(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    queueNodes: PriorityQueueNodeData[],
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
    svg.selectAll<SVGGElement, PriorityQueueNodeData>("g.node")
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

                // Contenedor del nodo con color dinámico según prioridad
                gEnter.append("rect")
                    .attr("class", "node-container")
                    .attr("width", elementWidth)
                    .attr("height", elementHeight)
                    .attr("rx", 6)
                    .attr("ry", 6)
                    .attr("fill", d => getPriorityColor(d.priority).fill)
                    .attr("stroke", d => getPriorityColor(d.priority).stroke)
                    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                    .style("filter", "drop-shadow(2px 2px 4px rgba(0,0,0,0.2))"); // Sombra sutil

                // Valor del nodo
                gEnter.append("text")
                    .attr("class", "node-value")
                    .attr("x", elementWidth / 2)
                    .attr("y", elementHeight / 2 - 5) // Movido ligeramente hacia arriba
                    .attr("dy", "0.35em")
                    .attr("text-anchor", "middle")
                    .attr("fill", "black") // Texto blanco para mejor contraste
                    .style("font-weight", "bold")
                    .style("font-size", "14px")
                    .text(d => d.value)
                    .style("letter-spacing", "0.5px");

                // MEJORA: Círculo de fondo para la prioridad más grande y llamativo
                gEnter.append("circle")
                    .attr("class", "priority-badge")
                    .attr("cx", elementWidth - 14) // Movido más hacia adentro
                    .attr("cy", 14) // Movido más hacia abajo
                    .attr("r", 14) // Radio aumentado de 8 a 14
                    .attr("fill", "rgba(0,0,0,0.7)") // Fondo más opaco
                    .attr("stroke", "rgba(255,255,255,0.9)") // Borde más visible
                    .attr("stroke-width", 2) // Borde más grueso
                    .style("filter", "drop-shadow(1px 1px 3px rgba(0,0,0,0.4))"); // Sombra para profundidad

                // MEJORA: Texto de prioridad más grande y mejor posicionado
                gEnter.append("text")
                    .attr("class", "node-priority")
                    .attr("x", elementWidth - 14) // Centrado con el círculo
                    .attr("y", 14) // Centrado con el círculo
                    .attr("dy", "0.35em") // Centrado vertical
                    .attr("text-anchor", "middle")
                    .attr("fill", "white")
                    .style("font-size", "12px") // Aumentado de 10px a 12px
                    .style("font-weight", "bold")
                    .style("letter-spacing", "0.5px") // Espaciado para mejor legibilidad
                    .text(d => `P${d.priority}`);

                // MEJORA: Añadir un resplandor sutil al badge de prioridad (MODIFICADO)
                gEnter.append("circle")
                    .attr("class", "priority-glow")
                    .attr("cx", elementWidth - 14)
                    .attr("cy", 14)
                    .attr("r", 16) // Ligeramente más grande que el badge
                    .attr("fill", "none")
                    .attr("stroke", d => d3.color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke)
                    .attr("stroke-width", 1)
                    .attr("opacity", 0.6)
                    .style("filter", "blur(1px)"); // Efecto de resplandor

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

                // Actualizar colores en caso de que la prioridad haya cambiado (MODIFICADO)
                update.select(".node-container")
                    .attr("fill", d => getPriorityColor(d.priority).fill)
                    .attr("stroke", d => getPriorityColor(d.priority).stroke);

                // Actualizar texto de prioridad
                update.select(".node-priority")
                    .text(d => `P${d.priority}`);

                // MEJORA: Actualizar el color del resplandor según la nueva prioridad (MODIFICADO)
                update.select(".priority-glow")
                    .attr("stroke", d => d3.color(getPriorityColor(d.priority).stroke)?.brighter(0.8)?.toString() || getPriorityColor(d.priority).stroke);

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
    queueNodes: PriorityQueueNodeData[],
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
 * Función encargada de animar la inserción de un nuevo nodo en la cola de prioridad
 * @param svg Lienzo en el que se va a dibujar
 * @param nodeEnqueued Id del nodo encolado
 * @param queueNodes Array completo de nodos actuales en la cola
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateEnqueueNode(   
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodeEnqueued: string,
    queueNodes: PriorityQueueNodeData[],
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    try {
        // Activamos el flag de animación
        setIsAnimating(true);
        
        // Margenes para el svg
        const margin = { left: SVG_QUEUE_VALUES.MARGIN_LEFT, right: SVG_QUEUE_VALUES.MARGIN_RIGHT };
        const elementWidth = SVG_QUEUE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_QUEUE_VALUES.ELEMENT_HEIGHT;
        const spacing = SVG_QUEUE_VALUES.SPACING;
        const nodeSpacing = elementWidth + spacing;
        const height = SVG_QUEUE_VALUES.HEIGHT;

        // Localizamos el nodo recién insertado en la cola de prioridad
        const newNodeIndex = queueNodes.findIndex(node => node.id === nodeEnqueued);
        if (newNodeIndex === -1) {
            console.error(`No se encontró el nodo con ID: ${nodeEnqueued} en la cola`);
            resetQueryValues();
            setIsAnimating(false);
            return;
        }
        
        // Determinamos el nodo que está antes y después del nuevo nodo (en base a la posición, no al enlace)
        const prevNodeId = newNodeIndex > 0 ? queueNodes[newNodeIndex - 1].id : null;
        const nextNodeId = newNodeIndex < queueNodes.length - 1 ? queueNodes[newNodeIndex + 1].id : null;
        
        // Grupo del lienzo correspondiente al nuevo elemento
        const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued}`);
        
        // Verificamos que el nodo exista en el DOM
        if (newNodeGroup.empty()) {
            console.error(`No se encontró el nodo con ID: ${nodeEnqueued} en el DOM`);
            resetQueryValues();
            setIsAnimating(false);
            return;
        }
        // Actualizamos las posiciones de todos los nodos
        queueNodes.forEach((node, index) => {
            const x = margin.left + index * nodeSpacing;
            const y = (height - elementHeight) / 2;
            positions.set(node.id, { x, y });
        });
        
        // Posición final del nuevo nodo
        const finalPos = positions.get(nodeEnqueued);
        if (!finalPos) {
            console.error(`No se encontró posición para el nodo: ${nodeEnqueued}`);
            resetQueryValues();
            setIsAnimating(false);
            return;
        }
        
        // Estado visual inicial del nuevo nodo (oculto)
        newNodeGroup.style("opacity", 0);
        
        // Posición de animación inicial del nuevo nodo (entrará desde arriba)
        const initialYOffset = -60;
        const initialPos = { x: finalPos.x, y: finalPos.y + initialYOffset };
        
        // Posicionamiento inicial del nodo a encolar
        newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
        
        // PASO 1: Identificar y preparar todos los enlaces que necesitan ser modificados
        
        // 1. Enlace del nodo anterior al nuevo nodo (si existe)
        let prevNodeLinkGroup = null;
        if (prevNodeId) {
            // Ocultamos el enlace existente que debe ser reemplazado
            const oldNextLink = svg.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`);
            if (!oldNextLink.empty()) {
                oldNextLink.select("path.node-link").style("opacity", 0);
            }
            
            // Preparamos el enlace del nodo anterior al nuevo nodo
            prevNodeLinkGroup = svg.select<SVGGElement>(`g#link-${prevNodeId}-${nodeEnqueued}-next`);
            if (prevNodeLinkGroup.empty()) {
                prevNodeLinkGroup = svg.append("g")
                    .attr("class", "link")
                    .attr("id", `link-${prevNodeId}-${nodeEnqueued}-next`);
                
                prevNodeLinkGroup.append("path")
                    .attr("class", "node-link next")
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .style("opacity", 0); // Inicialmente oculto, se animará después
            } else {
                prevNodeLinkGroup.select("path.node-link")
                    .style("opacity", 0);
            }
        }
        
        // 2. Enlace del nuevo nodo al siguiente nodo (si existe)
        let newNodeLinkGroup = null;
        if (nextNodeId) {
            newNodeLinkGroup = svg.select<SVGGElement>(`g#link-${nodeEnqueued}-${nextNodeId}-next`);
            if (newNodeLinkGroup.empty()) {
                newNodeLinkGroup = svg.append("g")
                    .attr("class", "link")
                    .attr("id", `link-${nodeEnqueued}-${nextNodeId}-next`);
                
                newNodeLinkGroup.append("path")
                    .attr("class", "node-link next")
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .style("opacity", 0); // Inicialmente oculto, se animará después
            } else {
                newNodeLinkGroup.select("path.node-link")
                    .style("opacity", 0);
            }
        }
        
        // 3. Identificar todos los enlaces existentes que necesitan actualizarse
        const linksToUpdate = new Map<string, {
            linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
            sourceId: string,
            targetId: string
        }>();
        
        queueNodes.forEach((node) => {
            if (node.id === nodeEnqueued) return; // Excluimos el nuevo nodo
            
            if (node.next && node.id !== nodeEnqueued) {
                // Solo si no es un enlace que ya estamos manejando específicamente
                if (!(node.id === prevNodeId && node.next === nodeEnqueued) &&
                    !(node.id === nodeEnqueued && nextNodeId === node.next)) {
                    
                    const linkId = `link-${node.id}-${node.next}-next`;
                    const linkGroup = svg.select<SVGGElement>(`g#${linkId}`);
                    
                    if (!linkGroup.empty()) {
                        linksToUpdate.set(linkId, {
                            linkGroup,
                            sourceId: node.id,
                            targetId: node.next
                        });
                    }
                }
            }
        });
        
        // PASO 2: Animar tanto nodos como enlaces simultáneamente
        const animationPromises: Promise<unknown>[] = [];
        
        // 2.1 Animamos el reposicionamiento de todos los nodos existentes (excepto el nuevo)
        queueNodes.filter(node => node.id !== nodeEnqueued).forEach(node => {
            const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);
            const newPos = positions.get(node.id);
            
            if (!nodeGroup.empty() && newPos) {
                const nodePromise = nodeGroup
                    .transition()
                    .duration(1000)
                    .ease(d3.easeQuadOut)
                    .attr("transform", `translate(${newPos.x}, ${newPos.y})`)
                    .end();
                
                animationPromises.push(nodePromise);
            }
        });
        
        // 2.2 Actualizar los enlaces simultáneamente
        linksToUpdate.forEach((linkData) => {
            const { linkGroup, sourceId, targetId } = linkData;
            
            if (!positions.has(sourceId) || !positions.has(targetId)) {
                console.warn(`Posiciones no encontradas para enlace: ${sourceId} -> ${targetId}`);
                return;
            }
            
            try {
                // Calculamos el camino final del enlace
                const path = calculateLinkPath(
                    { sourceId, targetId, type: 'next' },
                    positions,
                    elementWidth,
                    elementHeight
                );
                
                // Animamos la transición del enlace al mismo tiempo que los nodos
                const linkPromise = linkGroup.select("path.node-link")
                    .transition()
                    .duration(1000) // Misma duración que los nodos
                    .ease(d3.easeQuadOut) // Mismo tipo de ease que los nodos
                    .attr("d", path)
                    .end();
                
                animationPromises.push(linkPromise);
            } catch (error) {
                console.error(`Error al actualizar enlace ${sourceId} -> ${targetId}:`, error);
            }
        });
        
        // Esperar a que terminen TODAS las animaciones juntas
        await Promise.all(animationPromises);
        
        // 2.3 Después de reposicionar, mostramos el nuevo nodo con una animación
        await newNodeGroup
            .transition()
            .duration(800)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .end();
        
        // 2.4 Animamos el posicionamiento del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(1200)
            .ease(d3.easeBounce)
            .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
            .end();
        
        // 2.5 MEJORADO - Animación de pulso de prioridad más llamativa
        const enqueuedNode = queueNodes.find(node => node.id === nodeEnqueued);
        if (enqueuedNode) {
            await addPriorityPulseAnimation(svg, nodeEnqueued, enqueuedNode.priority);
        }
        
        // PASO 3: Animar la aparición secuencial de los enlaces del nuevo nodo con animación de crecimiento
        
        // Función auxiliar para animar el crecimiento del enlace
        const animateLinkGrowth = async (
            linkGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
            sourceId: string, 
            targetId: string, 
            duration: number = 800
        ) => {
            const pathElement = linkGroup.select("path.node-link");
            
            // Calcular el path completo
            const fullPath = calculateLinkPath(
                { sourceId, targetId, type: 'next' },
                positions,
                elementWidth,
                elementHeight
            );
            
            // Configurar el path pero mantenerlo invisible
            pathElement
                .attr("d", fullPath)
                .attr("stroke", "#4CAF50") // Color distintivo
                .attr("stroke-width", 2)
                .style("opacity", 1);
            
            // Obtener la longitud total del path
            const totalLength = (pathElement.node() as SVGPathElement).getTotalLength();
            
            // Configurar el stroke-dasharray para que parezca vacío inicialmente
            pathElement
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength);
            
            // Animar el crecimiento
            await pathElement
                .transition()
                .duration(duration)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0) // Animar a 0 hace que el path se dibuje
                .transition()
                .duration(300)
                .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR) // Volver al color normal
                .attr("stroke-width", 1.5)
                .attr("stroke-dasharray", null) // Quitar el dasharray
                .end();
        };
        
        // 3.1 Primero animamos el enlace desde el nodo anterior al nuevo nodo
        if (prevNodeId && prevNodeLinkGroup) {
            try {
                await animateLinkGrowth(prevNodeLinkGroup, prevNodeId, nodeEnqueued);
            } catch (error) {
                console.error("Error al animar el enlace previo:", error);
            }
        }
        
        // 3.2 Después animamos el enlace desde el nuevo nodo al siguiente
        if (nextNodeId && newNodeLinkGroup) {
            try {
                await animateLinkGrowth(newNodeLinkGroup, nodeEnqueued, nextNodeId);
            } catch (error) {
                console.error("Error al animar el enlace siguiente:", error);
            }
        }
        
        // PASO 4: Actualizar indicadores de cabeza/fin
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");
        const updateIndicatorsPromises: Promise<unknown>[] = [];
        
        // Actualizar el indicador de cabeza si es necesario
        if (newNodeIndex === 0 && !headIndicatorGroup.empty()) {
            try {
                const headIndicatorPromise = headIndicatorGroup
                    .transition()
                    .duration(600)
                    .ease(d3.easeQuadInOut)
                    .attr("transform", () => {
                        const indicatorX = finalPos.x + elementWidth / 2;
                        const indicatorY = finalPos.y;
                        return `translate(${indicatorX}, ${indicatorY})`;
                    })
                    .end();
                
                updateIndicatorsPromises.push(headIndicatorPromise);
            } catch (error) {
                console.error("Error al animar el indicador de cabeza:", error);
            }
        }
        
        // Actualizar el indicador de fin
        if (!tailIndicatorGroup.empty()) {
            try {
                const lastNodeId = queueNodes[queueNodes.length - 1].id;
                const lastNodePos = positions.get(lastNodeId);
                
                if (lastNodePos) {
                    const tailIndicatorPromise = tailIndicatorGroup
                        .transition()
                        .duration(600)
                        .ease(d3.easeQuadInOut)
                        .attr("transform", () => {
                            const indicatorX = lastNodePos.x + elementWidth / 2;
                            const indicatorY = lastNodePos.y;
                            return `translate(${indicatorX}, ${indicatorY})`;
                        })
                        .end();
                    
                    updateIndicatorsPromises.push(tailIndicatorPromise);
                }
            } catch (error) {
                console.error("Error al animar el indicador de fin:", error);
            }
        }
        
        // Esperar a que terminen las animaciones de los indicadores
        if (updateIndicatorsPromises.length > 0) {
            await Promise.all(updateIndicatorsPromises);
        }

        // PASO 5: MEJORADO - Animación final de confirmación de inserción más llamativa
        if (enqueuedNode) {
            const priorityBadge = newNodeGroup.select(".priority-badge");
            const priorityGlow = newNodeGroup.select(".priority-glow");
            
            // Animación de confirmación con el badge de prioridad como protagonista
            await priorityBadge
                .transition()
                .duration(150)
                .attr("r", 18) // Crecer más
                .attr("stroke-width", 3)
                .transition()
                .duration(150)
                .attr("r", 14) // Volver al tamaño normal
                .attr("stroke-width", 2)
                .end();

            // Hacer que el resplandor pulse también
            await priorityGlow
                .transition()
                .duration(300)
                .attr("opacity", 1)
                .attr("r", 20)
                .transition()
                .duration(300)
                .attr("opacity", 0.6)
                .attr("r", 16)
                .end();
        }
        
    } catch (error) {
        console.error("Error en la animación de encolar:", error);
    } finally {
        // Restablecimiento de los valores de las queries del usuario
        resetQueryValues();
        
        // Finalización de la animación
        setIsAnimating(false);
    }
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
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${nodeIdDequeued}`);

    // Grupo del lienzo correspondiente al enlace del elemento a decolar
    const linkToRemoveGroup = svg.select<SVGGElement>(`g#link-${nodeIdDequeued}-${prevFirstNode.next}-next`);

    // Grupo del lienzo correspondiente al indicador del elemento cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Movimiento del nodo a decolar 
    const nodeMoveOffsetY = SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

    // Animación de salida del enlace
    await linkToRemoveGroup
        .select("path.node-link")
        .transition()
        .duration(1000)
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

export function animateGetFront(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    headNodeId: string,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Grupo del lienzo correspondiente al elemento cabeza de la cola 
    const topNodeGroup = svg.select<SVGGElement>(`#${headNodeId}`);

    // Color de resaltado para el nodo
    const highlightColor = "#0066CC";

    // Grupo correspondiente al contenedor principal del nodo y al valor de este  
    const rect = topNodeGroup.select("rect");
    const text = topNodeGroup.select("text");

    // Animación de sobresalto del contenedor del nodo
    rect.transition()
        .duration(300)
        .attr("stroke", highlightColor)
        .attr("stroke-width", 3)
        .transition()
        .delay(800)
        .duration(300)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

    // Animación de sobresalto del valor del nodo
    text.transition()
        .duration(300)
        .attr("fill", highlightColor)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", "black")
        .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
        .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

    // Finalización de la animacion
    setIsAnimating(false);
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