import { LinkData, PriorityQueueNodeData, QueueNodeData } from "../../../types";
import * as d3 from "d3";
import { SVG_QUEUE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateLinkPath } from "./calculateLinkPath";

/**
 * Función encargada renderizar los nodos de la cola dentro del lienzo
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
        // Indicamos que la animación está en curso
        setIsAnimating(true);
        
        // Dimensiones del SVG
        const margin = { left: SVG_QUEUE_VALUES.MARGIN_LEFT, right: SVG_QUEUE_VALUES.MARGIN_RIGHT };
        const elementWidth = SVG_QUEUE_VALUES.ELEMENT_WIDTH;
        const elementHeight = SVG_QUEUE_VALUES.ELEMENT_HEIGHT;
        const spacing = SVG_QUEUE_VALUES.SPACING;
        const nodeSpacing = elementWidth + spacing;
        const height = SVG_QUEUE_VALUES.HEIGHT;

        // Localizamos el nodo recién insertado en la cola de prioridad
        const newNodeIndex = queueNodes.findIndex(node => node.id === nodeEnqueued);
        if (newNodeIndex === -1) {
            console.warn("No se encontró el nodo encolado en el array de nodos");
            resetQueryValues();
            setIsAnimating(false);
            return;
        }
        
        // Determinamos el nodo que está antes y después del nuevo nodo
        const prevNodeId = newNodeIndex > 0 ? queueNodes[newNodeIndex - 1].id : null;
        const nextNodeId = newNodeIndex < queueNodes.length - 1 ? queueNodes[newNodeIndex + 1].id : null;
        
        // Grupo del lienzo correspondiente al nuevo elemento
        const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued}`);
        
        // Verificamos que el nodo exista en el DOM
        if (newNodeGroup.empty()) {
            console.error(`No se encontró el nodo con ID: ${nodeEnqueued}`);
            resetQueryValues();
            setIsAnimating(false);
            return;
        }
        
        // Guardamos copia de las posiciones actuales antes de la animación
        const oldPositions = new Map<string, { x: number, y: number }>();
        positions.forEach((pos, id) => {
            oldPositions.set(id, { ...pos });
        });
        
        // Actualizamos las posiciones con los valores finales después de la inserción
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
        
        // PASO 1: Identificar los enlaces afectados por la inserción
        // 1.1. Enlace del nodo previo que debe actualizarse (para ocultarlo)
        let prevNodeLinkId = null;
        if (prevNodeId && nextNodeId) {
            prevNodeLinkId = `link-${prevNodeId}-${nextNodeId}-next`;
            
            // Ocultar solo el enlace que conecta el nodo anterior con el siguiente (que ahora se conectará con el nuevo)
            svg.select(`g#${prevNodeLinkId} path.node-link`)
                .transition()
                .duration(400)
                .style("opacity", 0);
        }
        
        // PASO 2: Mover los nodos existentes a sus nuevas posiciones para hacer espacio
        const nodesToMove = queueNodes.filter(node => {
            // Excluimos el nuevo nodo (lo animaremos por separado)
            if (node.id === nodeEnqueued) return false;
            
            // Incluimos solo los nodos que necesitan moverse (los que están a partir de la posición del nuevo nodo)
            const idx = queueNodes.findIndex(n => n.id === node.id);
            return idx >= newNodeIndex;
        });
        
        // Creamos promesas para esperar la finalización de la animación
        const movePromises: Promise<unknown>[] = [];
        
        // Mapeamos los nodos a mover con sus enlaces para actualizarlos juntos
        const nodesToMoveMap = new Map<string, { nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>, oldPos: { x: number, y: number }, newPos: { x: number, y: number } }>();
        
        // Primero recopilamos información de todos los nodos a mover
        nodesToMove.forEach(node => {
            const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);
            if (!nodeGroup.empty()) {
                const oldPos = oldPositions.get(node.id);
                const newPos = positions.get(node.id);
                
                if (oldPos && newPos) {
                    nodesToMoveMap.set(node.id, { nodeGroup, oldPos, newPos });
                }
            }
        });
        
        // Ahora movemos cada nodo y actualizamos sus enlaces simultáneamente
        nodesToMoveMap.forEach(({ nodeGroup, newPos }, nodeId) => {
            // Animamos el movimiento del nodo
            const promise = nodeGroup
                .transition()
                .duration(1000)
                .ease(d3.easeQuadOut)
                .attr("transform", `translate(${newPos.x}, ${newPos.y})`)
                .end();
            
            movePromises.push(promise);
            
            // También actualizamos los enlaces salientes de este nodo
            svg.selectAll<SVGGElement, unknown>("g.link").each(function() {
                const linkGroup = d3.select(this);
                const linkId = linkGroup.attr("id");
                if (!linkId) return;
                
                // Evitamos actualizar el enlace que se va a eliminar
                if (linkId === prevNodeLinkId) return;
                
                // Extraer source y target del ID del enlace
                const match = linkId.match(/link-([^-]+)-([^-]+)-([^-]+)/);
                if (!match) return;
                
                const [, sourceId, targetId, type] = match;
                
                // Solo actualizamos los enlaces donde este nodo es el origen
                if (sourceId === nodeId && positions.has(targetId)) {
                    const linkData: LinkData = {
                        sourceId,
                        targetId,
                        type: type as "next"
                    };
                    
                    try {
                        const newPath = calculateLinkPath(
                            linkData,
                            positions,
                            elementWidth,
                            elementHeight
                        );
                        
                        // Actualizamos el path del enlace junto con el movimiento del nodo
                        linkGroup.select("path.node-link")
                            .transition()
                            .duration(1000)
                            .attr("d", newPath);
                    } catch (error) {
                        console.warn(`Error al actualizar el path para el enlace ${linkId}:`, error);
                    }
                }
                
                // También actualizamos los enlaces donde este nodo es el destino
                if (targetId === nodeId && positions.has(sourceId)) {
                    const linkData: LinkData = {
                        sourceId,
                        targetId,
                        type: type as "next"
                    };
                    
                    try {
                        const newPath = calculateLinkPath(
                            linkData,
                            positions,
                            elementWidth,
                            elementHeight
                        );
                        
                        // Actualizamos el path del enlace junto con el movimiento del nodo
                        linkGroup.select("path.node-link")
                            .transition()
                            .duration(1000)
                            .attr("d", newPath);
                    } catch (error) {
                        console.warn(`Error al actualizar el path para el enlace ${linkId}:`, error);
                    }
                }
            });
        });
        
        // Esperamos a que todos los nodos terminen de moverse
        if (movePromises.length > 0) {
            await Promise.all(movePromises);
        }
        
        // PASO 3: Animación de la aparición del nuevo nodo
        await newNodeGroup
            .transition()
            .duration(800)
            .style("opacity", 1)
            .ease(d3.easePolyInOut)
            .end();
        
        // PASO 4: Animar el movimiento del nuevo nodo a su posición final
        await newNodeGroup
            .transition()
            .duration(1200)
            .ease(d3.easeBounce)
            .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
            .end();
        
        // PASO 5: Crear/actualizar solo los enlaces relacionados con el nodo insertado
        // IMPORTANTE: Esto se hace DESPUÉS de que el nodo ya está en su posición
        const linkPromises: Promise<unknown>[] = [];
        
        // 5.1. Si hay un nodo previo, creamos el enlace del nodo previo al nuevo nodo
        if (prevNodeId) {
            const newPrevLinkId = `link-${prevNodeId}-${nodeEnqueued}-next`;
            let prevLinkGroup = svg.select<SVGGElement>(`g#${newPrevLinkId}`);
            
            // Si el enlace no existe, lo creamos
            if (prevLinkGroup.empty()) {
                prevLinkGroup = svg.append("g")
                    .attr("class", "link")
                    .attr("id", newPrevLinkId);
                
                prevLinkGroup.append("path")
                    .attr("class", "node-link next")
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .style("opacity", 0);
            }
            
            // Calculamos el path del enlace
            const prevLinkData: LinkData = {
                sourceId: prevNodeId,
                targetId: nodeEnqueued,
                type: "next"
            };
            
            const prevLinkPath = calculateLinkPath(
                prevLinkData,
                positions,
                elementWidth,
                elementHeight
            );
            
            // Aplicamos el nuevo path y animamos su aparición
            const prevLinkPromise = prevLinkGroup.select("path.node-link")
                .attr("d", prevLinkPath)
                .transition()
                .duration(600)
                .style("opacity", 1)
                .end();
            
            linkPromises.push(prevLinkPromise);
        }
        
        // Esperamos a que el enlace del nodo anterior al nuevo nodo termine de mostrarse
        if (linkPromises.length > 0) {
            await Promise.all(linkPromises);
            // Limpiamos el array de promesas para el siguiente conjunto
            linkPromises.length = 0;
        }
        
        // 5.2. Creamos el enlace del nuevo nodo a su siguiente (si existe)
        if (nextNodeId) {
            const newNextLinkId = `link-${nodeEnqueued}-${nextNodeId}-next`;
            let nextLinkGroup = svg.select<SVGGElement>(`g#${newNextLinkId}`);
            
            // Si el enlace no existe, lo creamos
            if (nextLinkGroup.empty()) {
                nextLinkGroup = svg.append("g")
                    .attr("class", "link")
                    .attr("id", newNextLinkId);
                
                nextLinkGroup.append("path")
                    .attr("class", "node-link next")
                    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                    .attr("stroke-width", 1.5)
                    .attr("marker-end", "url(#arrowhead)")
                    .style("opacity", 0);
            }
            
            // Calculamos el path del enlace
            const nextLinkData: LinkData = {
                sourceId: nodeEnqueued,
                targetId: nextNodeId,
                type: "next"
            };
            
            const nextLinkPath = calculateLinkPath(
                nextLinkData,
                positions,
                elementWidth,
                elementHeight
            );
            
            // Aplicamos el nuevo path y animamos su aparición
            const nextLinkPromise = nextLinkGroup.select("path.node-link")
                .attr("d", nextLinkPath)
                .transition()
                .duration(600)
                .style("opacity", 1)
                .end();
            
            linkPromises.push(nextLinkPromise);
        }
        
        // Esperamos a que todos los enlaces del nuevo nodo terminen de mostrarse
        if (linkPromises.length > 0) {
            await Promise.all(linkPromises);
        }
        
        // PASO 6: Actualización de los indicadores de cabeza/fin
        const updateIndicatorsPromises: Promise<unknown>[] = [];
        
        // Actualizar indicador de cabeza
        const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
        if (!headIndicatorGroup.empty()) {
            const headNodeId = queueNodes[0]?.id;
            const headPos = headNodeId ? positions.get(headNodeId) : null;
            
            if (headPos) {
                const headPromise = headIndicatorGroup
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr("transform", `translate(${headPos.x + elementWidth/2}, ${headPos.y})`)
                    .end();
                
                updateIndicatorsPromises.push(headPromise);
            }
        }
        
        // Actualizar indicador de fin
        const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");
        if (!tailIndicatorGroup.empty()) {
            const tailIndex = queueNodes.length - 1;
            const tailNodeId = tailIndex >= 0 ? queueNodes[tailIndex].id : null;
            const tailPos = tailNodeId ? positions.get(tailNodeId) : null;
            
            if (tailPos) {
                const tailPromise = tailIndicatorGroup
                    .transition()
                    .duration(800)
                    .ease(d3.easeQuadInOut)
                    .attr("transform", `translate(${tailPos.x + elementWidth/2}, ${tailPos.y})`)
                    .end();
                
                updateIndicatorsPromises.push(tailPromise);
            }
        }
        
        // Esperamos a que los indicadores terminen de actualizarse
        if (updateIndicatorsPromises.length > 0) {
            await Promise.all(updateIndicatorsPromises);
        }
        
        // PASO 7: Eliminar el enlace obsoleto entre el nodo previo y el siguiente
        // Solo lo eliminamos cuando ya están establecidos los nuevos enlaces
        if (prevNodeId && nextNodeId) {
            const obsoleteLinkId = `link-${prevNodeId}-${nextNodeId}-next`;
            svg.select(`g#${obsoleteLinkId}`).remove();
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
 * Función encargada de animar la inserción de un nuevo nodo en la cola de prioridad
 * @param svg Lienzo en el que se va a dibujar
 * @param nodeEnqueued Id del nodo encolado
 * @param queueNodes Array completo de nodos actuales en la cola
 * @param positions Mapa de posiciones de cada nodo dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de la query del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
//Funciona excepto cuando hay mas de un elemento a la derecha del nuevo agregado
// export async function animateEnqueueNode(   
//     svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
//     nodeEnqueued: string,
//     queueNodes: PriorityQueueNodeData[],
//     positions: Map<string, { x: number, y: number }>,
//     resetQueryValues: () => void,
//     setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
// ) {
//     try {
//         // Margenes para el svg
//         const margin = { left: SVG_QUEUE_VALUES.MARGIN_LEFT, right: SVG_QUEUE_VALUES.MARGIN_RIGHT };
//         const elementWidth = SVG_QUEUE_VALUES.ELEMENT_WIDTH;
//         const elementHeight = SVG_QUEUE_VALUES.ELEMENT_HEIGHT;
//         const spacing = SVG_QUEUE_VALUES.SPACING;
//         const nodeSpacing = elementWidth + spacing;
//         const height = SVG_QUEUE_VALUES.HEIGHT;

//         // Localizamos el nodo recién insertado en la cola de prioridad
//         const newNodeIndex = queueNodes.findIndex(node => node.id === nodeEnqueued);
//         if (newNodeIndex === -1) {
//             resetQueryValues();
//             setIsAnimating(false);
//             return;
//         }
        
//         // Determinamos el nodo que está antes y después del nuevo nodo (en base a la posición, no al enlace)
//         const prevNodeId = newNodeIndex > 0 ? queueNodes[newNodeIndex - 1].id : null;
//         const nextNodeId = newNodeIndex < queueNodes.length - 1 ? queueNodes[newNodeIndex + 1].id : null;
        
//         // Grupo del lienzo correspondiente al nuevo elemento
//         const newNodeGroup = svg.select<SVGGElement>(`g#${nodeEnqueued}`);
        
//         // Verificamos que el nodo exista en el DOM
//         if (newNodeGroup.empty()) {
//             console.error(`No se encontró el nodo con ID: ${nodeEnqueued}`);
//             resetQueryValues();
//             setIsAnimating(false);
//             return;
//         }
        
//         // Enlaces que debemos animar
//         // 1. Si hay un nodo anterior, este debe apuntar al nuevo nodo
//         const prevNodeLinkGroup = prevNodeId ? svg.select<SVGGElement>(`g#link-${prevNodeId}-${nodeEnqueued}-next`) : null;
        
//         // 2. El nuevo nodo debe apuntar al siguiente (si existe)
//         const newNodeLinkGroup = nextNodeId ? svg.select<SVGGElement>(`g#link-${nodeEnqueued}-${nextNodeId}-next`) : null;
        
//         // 3. IMPORTANTE: Tenemos que identificar y eliminar el enlace directo entre el nodo anterior y el siguiente
//         //    (Este es el enlace que debe desaparecer cuando insertamos un nodo en medio)
//         const directLinkToRemove = (prevNodeId && nextNodeId) ? 
//             svg.select<SVGGElement>(`g#link-${prevNodeId}-${nextNodeId}-next`) : null;
        
//         // Grupo del lienzo correspondiente al indicador del elemento cabeza/fin
//         const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");
//         const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");
        
//         // Calcular todas las posiciones finales de los nodos (desplazando los que sean necesarios)
//         const oldPositions = new Map<string, { x: number, y: number }>(positions);
        
//         // Primero actualizamos las posiciones de todos los nodos considerando las nuevas posiciones
//         queueNodes.forEach((node, index) => {
//             const x = margin.left + index * nodeSpacing;
//             const y = (height - elementHeight) / 2;
//             positions.set(node.id, { x, y });
//         });
        
//         // Posición final del nuevo nodo
//         const finalPos = positions.get(nodeEnqueued);
//         if (!finalPos) {
//             console.error(`No se encontró posición para el nodo: ${nodeEnqueued}`);
//             resetQueryValues();
//             setIsAnimating(false);
//             return;
//         }
        
//         // Estado visual inicial del nuevo nodo y sus enlaces (ocultos)
//         newNodeGroup.style("opacity", 0);
//         if (prevNodeLinkGroup && !prevNodeLinkGroup.empty()) {
//             prevNodeLinkGroup.select("path.node-link").style("opacity", 0);
//         }
//         if (newNodeLinkGroup && !newNodeLinkGroup.empty()) {
//             newNodeLinkGroup.select("path.node-link").style("opacity", 0);
//         }
        
//         // Posición de animación inicial del nuevo nodo (entrará desde arriba)
//         const initialYOffset = -60;
//         const initialPos = { x: finalPos.x, y: finalPos.y + initialYOffset };
        
//         // Mapa temporal de posiciones para calcular la forma inicial de los enlaces
//         const tempPositions: Map<string, { x: number; y: number }> = new Map(oldPositions);
//         tempPositions.set(nodeEnqueued, initialPos);
        
//         // Formas iniciales y finales de los enlaces
//         let prevInitialPath = "M0,0";
//         let prevFinalPath = "M0,0";
//         let nextInitialPath = "M0,0";
//         let nextFinalPath = "M0,0";
        
//         // Cálculo del enlace desde el nodo anterior al nuevo nodo
//         if (prevNodeId && prevNodeLinkGroup && !prevNodeLinkGroup.empty()) {
//             try {
//                 prevInitialPath = calculateLinkPath(
//                     { sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' },
//                     tempPositions,
//                     elementWidth,
//                     elementHeight
//                 );
                
//                 prevFinalPath = calculateLinkPath(
//                     { sourceId: prevNodeId, targetId: nodeEnqueued, type: 'next' },
//                     positions,
//                     elementWidth,
//                     elementHeight
//                 );
                
//                 prevNodeLinkGroup.select("path.node-link").attr("d", prevInitialPath);
//             } catch (error) {
//                 console.error("Error al calcular el path del enlace previo:", error);
//                 // Continuar con la animación, incluso si un enlace falla
//             }
//         }
        
//         // Cálculo del enlace desde el nuevo nodo al siguiente nodo
//         if (nextNodeId && newNodeLinkGroup && !newNodeLinkGroup.empty()) {
//             try {
//                 nextInitialPath = calculateLinkPath(
//                     { sourceId: nodeEnqueued, targetId: nextNodeId, type: 'next' },
//                     tempPositions,
//                     elementWidth,
//                     elementHeight
//                 );
                
//                 nextFinalPath = calculateLinkPath(
//                     { sourceId: nodeEnqueued, targetId: nextNodeId, type: 'next' },
//                     positions,
//                     elementWidth,
//                     elementHeight
//                 );
                
//                 newNodeLinkGroup.select("path.node-link").attr("d", nextInitialPath);
//             } catch (error) {
//                 console.error("Error al calcular el path del enlace siguiente:", error);
//                 // Continuar con la animación, incluso si un enlace falla
//             }
//         }
        
//         // Posicionamiento inicial del nodo a encolar
//         newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);
        
//         // PASO 0: Si hay un enlace directo entre el nodo anterior y el siguiente que debemos eliminar,
//         // lo hacemos desaparecer antes de comenzar a mover los nodos
//         if (directLinkToRemove && !directLinkToRemove.empty()) {
//             try {
//                 await directLinkToRemove.select("path.node-link")
//                     .transition()
//                     .duration(300)
//                     .style("opacity", 0)
//                     .end();
//             } catch (error) {
//                 console.error("Error al ocultar el enlace directo:", error);
//             }
//         }
        
//         // 1. PASO 1: Mover los nodos existentes a sus nuevas posiciones para hacer espacio
//         //    Esto ocurre primero para que no haya solapamientos
        
//         // Identificar nodos que necesitan reposicionarse (los que están desde la posición de inserción en adelante)
//         const nodesToReposition = queueNodes.filter((node, idx) => {
//             // Excluimos el nuevo nodo (lo animaremos por separado)
//             if (node.id === nodeEnqueued) return false;
            
//             // Excluimos los nodos que no cambian de posición (los que están antes del nuevo nodo)
//             return idx >= newNodeIndex;
//         });
        
//         // Crear un mapa para los nodos afectados y sus enlaces
//         const affectedNodeGroups = new Map<string, {
//             nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
//             prevLinkGroup?: d3.Selection<SVGGElement, unknown, null, undefined>,
//             nextLinkGroup?: d3.Selection<SVGGElement, unknown, null, undefined>
//         }>();
        
//         // Recopilar todas las selecciones de nodos y enlaces afectados
//         nodesToReposition.forEach(node => {
//             const nodeId = node.id;
//             const nodeGroup = svg.select<SVGGElement>(`g#${nodeId}`);
            
//             if (nodeGroup.empty()) {
//                 console.warn(`No se encontró el nodo con ID: ${nodeId} para reposicionar`);
//                 return;
//             }
            
//             // Enlaces entrantes y salientes (excluyendo el enlace directo que ya eliminamos)
//             const prevIdx = queueNodes.findIndex(n => n.id === nodeId) - 1;
//             const prevId = prevIdx >= 0 ? queueNodes[prevIdx].id : null;
//             const nextIdx = queueNodes.findIndex(n => n.id === nodeId) + 1;
//             const nextId = nextIdx < queueNodes.length ? queueNodes[nextIdx].id : null;
            
//             // Enlaces (excluyendo los que ya manejamos para el nuevo nodo)
//             let prevLinkGroup;
//             if (prevId && prevId !== nodeEnqueued && !(prevId === prevNodeId && nodeId === nextNodeId)) {
//                 prevLinkGroup = svg.select<SVGGElement>(`g#link-${prevId}-${nodeId}-next`);
//                 if (prevLinkGroup.empty()) {
//                     prevLinkGroup = undefined;
//                 }
//             }
            
//             let nextLinkGroup;
//             if (nextId && nodeId !== nodeEnqueued) {
//                 nextLinkGroup = svg.select<SVGGElement>(`g#link-${nodeId}-${nextId}-next`);
//                 if (nextLinkGroup.empty()) {
//                     nextLinkGroup = undefined;
//                 }
//             }
            
//             affectedNodeGroups.set(nodeId, { nodeGroup, prevLinkGroup, nextLinkGroup });
//         });
        
//         // Crear promesas para las animaciones de reposicionamiento
//         const repositioningPromises: Promise<unknown>[] = [];
        
//         // Animar el movimiento de los nodos existentes a sus nuevas posiciones
//         affectedNodeGroups.forEach((selections, nodeId) => {
//             const { nodeGroup, prevLinkGroup, nextLinkGroup } = selections;
//             const newPosition = positions.get(nodeId);
            
//             if (newPosition) {
//                 // Animar movimiento del nodo
//                 const nodePromise = nodeGroup
//                     .transition()
//                     .duration(1000)
//                     .ease(d3.easeQuadOut)
//                     .attr("transform", `translate(${newPosition.x}, ${newPosition.y})`)
//                     .end();
                
//                 repositioningPromises.push(nodePromise);
                
//                 // Animar enlace previo si existe y no es el enlace directo que eliminamos
//                 if (prevLinkGroup) {
//                     try {
//                         const prevIdx = queueNodes.findIndex(n => n.id === nodeId) - 1;
//                         const sourceId = prevIdx >= 0 ? queueNodes[prevIdx].id : null;
                        
//                         if (sourceId && !(sourceId === prevNodeId && nodeId === nextNodeId)) {
//                             const linkPath = calculateLinkPath(
//                                 { sourceId, targetId: nodeId, type: 'next' },
//                                 positions,
//                                 elementWidth,
//                                 elementHeight
//                             );
                            
//                             const linkPromise = prevLinkGroup
//                                 .select("path.node-link")
//                                 .transition()
//                                 .duration(1000)
//                                 .ease(d3.easeQuadOut)
//                                 .attr("d", linkPath)
//                                 .end();
                            
//                             repositioningPromises.push(linkPromise);
//                         }
//                     } catch (error) {
//                         console.error(`Error al animar enlace previo para nodo ${nodeId}:`, error);
//                     }
//                 }
                
//                 // Animar enlace siguiente si existe
//                 if (nextLinkGroup) {
//                     try {
//                         const nextIdx = queueNodes.findIndex(n => n.id === nodeId) + 1;
//                         const targetId = nextIdx < queueNodes.length ? queueNodes[nextIdx].id : null;
                        
//                         if (targetId) {
//                             const linkPath = calculateLinkPath(
//                                 { sourceId: nodeId, targetId, type: 'next' },
//                                 positions,
//                                 elementWidth,
//                                 elementHeight
//                             );
                            
//                             const linkPromise = nextLinkGroup
//                                 .select("path.node-link")
//                                 .transition()
//                                 .duration(1000)
//                                 .ease(d3.easeQuadOut)
//                                 .attr("d", linkPath)
//                                 .end();
                            
//                             repositioningPromises.push(linkPromise);
//                         }
//                     } catch (error) {
//                         console.error(`Error al animar enlace siguiente para nodo ${nodeId}:`, error);
//                     }
//                 }
//             }
//         });
        
//         // Esperar a que todos los nodos existentes terminen de reposicionarse
//         if (repositioningPromises.length > 0) {
//             await Promise.all(repositioningPromises);
//         }
        
//         // 2. PASO 2: Animación de la aparición del nuevo nodo
//         await newNodeGroup
//             .transition()
//             .duration(800)
//             .style("opacity", 1)
//             .ease(d3.easePolyInOut)
//             .end();
        
//         // 3. PASO 3: Animar el movimiento del nuevo nodo a su posición final
//         await newNodeGroup
//             .transition()
//             .duration(1200)
//             .ease(d3.easeBounce)
//             .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
//             .end();
            
//         // 4. PASO 4: Animar la aparición de los enlaces del nuevo nodo de forma secuencial
//         // 4.1 Primero mostramos el enlace desde el nodo anterior al nuevo nodo
//         if (prevNodeLinkGroup && !prevNodeLinkGroup.empty()) {
//             try {
//                 await prevNodeLinkGroup
//                     .select("path.node-link")
//                     .transition()
//                     .duration(600)
//                     .style("opacity", 1)
//                     .ease(d3.easeQuadOut)
//                     .attr("d", prevFinalPath)
//                     .end();
//             } catch (error) {
//                 console.error("Error al animar el enlace previo:", error);
//             }
//         }
        
//         // 4.2 Luego mostramos el enlace desde el nuevo nodo al siguiente
//         if (newNodeLinkGroup && !newNodeLinkGroup.empty()) {
//             try {
//                 await newNodeLinkGroup
//                     .select("path.node-link")
//                     .transition()
//                     .duration(600)
//                     .style("opacity", 1)
//                     .ease(d3.easeQuadOut)
//                     .attr("d", nextFinalPath)
//                     .end();
//             } catch (error) {
//                 console.error("Error al animar el enlace siguiente:", error);
//             }
//         }
        
//         // 5. PASO 5: Actualización de los indicadores de cabeza/fin
//         const updateIndicatorsPromises: Promise<unknown>[] = [];
        
//         // Si el nuevo nodo es el primero, actualizamos el indicador de cabeza
//         if (newNodeIndex === 0 && !headIndicatorGroup.empty()) {
//             try {
//                 const headIndicatorPromise = headIndicatorGroup
//                     .transition()
//                     .duration(800)
//                     .ease(d3.easeQuadInOut)
//                     .attr("transform", () => {
//                         const indicatorX = finalPos.x + elementWidth / 2;
//                         const indicatorY = finalPos.y;
//                         return `translate(${indicatorX}, ${indicatorY})`;
//                     })
//                     .end();
                
//                 updateIndicatorsPromises.push(headIndicatorPromise);
//             } catch (error) {
//                 console.error("Error al animar el indicador de cabeza:", error);
//             }
//         }
        
//         // Siempre actualizamos el indicador de fin para que apunte al último elemento
//         if (!tailIndicatorGroup.empty()) {
//             try {
//                 // Obtener el ID del último nodo en la cola
//                 const lastNodeId = queueNodes[queueNodes.length - 1].id;
//                 // Obtener la posición del último nodo
//                 const lastNodePos = positions.get(lastNodeId);
                
//                 if (lastNodePos) {
//                     const tailIndicatorPromise = tailIndicatorGroup
//                         .transition()
//                         .duration(800)
//                         .ease(d3.easeQuadInOut)
//                         .attr("transform", () => {
//                             const indicatorX = lastNodePos.x + elementWidth / 2;
//                             const indicatorY = lastNodePos.y;
//                             return `translate(${indicatorX}, ${indicatorY})`;
//                         })
//                         .end();
                    
//                     updateIndicatorsPromises.push(tailIndicatorPromise);
//                 }
//             } catch (error) {
//                 console.error("Error al animar el indicador de fin:", error);
//             }
//         }
        
//         if (updateIndicatorsPromises.length > 0) {
//             await Promise.all(updateIndicatorsPromises);
//         }
//     } catch (error) {
//         console.error("Error en la animación de encolar:", error);
//     } finally {
//         // Restablecimiento de los valores de las queries del usuario
//         resetQueryValues();
        
//         // Finalización de la animación
//         setIsAnimating(false);
//     }
// }

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
    const highlightColor = "#00e676";

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
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .transition()
        .delay(800)
        .duration(300)
        .attr("fill", "white")
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