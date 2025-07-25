import { LinkData, ListNodeData } from "../../../types";
import { SVG_LINKED_LIST_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { calculateCircularLPath, calculateLinkPath } from "./calculateLinkPath";
import * as d3 from "d3";

/**
 * Función encargada de animar la inserción de un nuevo nodo al inicio de la lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param listData Objeto con información de los nodos y enlaces de la lista.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newHeadNode: string, prevHeadNode: string | null, lastNode: string },
    listData: {
        existingNodesData: ListNodeData<number>[],
        existingLinksData: LinkData[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showPrevCircularLink: boolean,
        showNextCircularLink: boolean
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newHeadNode, prevHeadNode, lastNode } = nodesInvolved;

  // Grupo del lienzo correspondiente al nuevo nodo
  const newNodeGroup = svg.select<SVGGElement>(`g#${newHeadNode}`);

  // Estado inicial del nuevo nodo
  newNodeGroup.style("opacity", 0);

    if (prevHeadNode) {
        // Información de la lista a renderizar
        const { existingNodesData, existingLinksData, showDoubleLinks, showTailIndicator, showNextCircularLink, showPrevCircularLink } = listData;

    // Grupo del lienzo correspondiente al indicador del nodo cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Posición de animación final para inserción del nuevo nodo
    const finalNewNodePos = positions.get(newHeadNode)!;

    // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
    const newNodeNextLinkGroup = svg.select<SVGGElement>(
      `g#link-${newHeadNode}-${prevHeadNode}-next`
    );

    // Estado visual inicial del enlace siguiente del nuevo nodo
    newNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

    // Grupo del lienzo correspondiente al enlace previo del anterior primer nodo (solo para listas dobles)
    const prevHeadNodePrevLinkGroup = showDoubleLinks
      ? svg.select<SVGGElement>(`g#link-${prevHeadNode}-${newHeadNode}-prev`)
      : null;

        // Estado visual inicial del enlace previo del anterior primer nodo
        if (prevHeadNodePrevLinkGroup) {
            prevHeadNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
        }

        // Selección y establecimiento de estado visual inicial de enlaces circulares (solo para listas circulares)
        const nextCircularLinkGroup = showNextCircularLink ? svg.select<SVGGElement>(`g#link-${lastNode}-${newHeadNode}-circular-next`) : null;
        if (nextCircularLinkGroup) {
            nextCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

        const prevCircularLinkGroup = showPrevCircularLink ? svg.select<SVGGElement>(`g#link-${newHeadNode}-${lastNode}-circular-prev`) : null;
        if (prevCircularLinkGroup) {
            prevCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

    // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces
    const shiftPromises: Promise<void>[] = [];

        // Selección de nodos a desplazar (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, ListNodeData<number>>("g.node")
            .data(existingNodesData, d => d.id);

    // Promesa para desplazamiento de nodos existentes a su posición final
    shiftPromises.push(
      remainingNodes
        .transition()
        .duration(1500)
        .ease(d3.easePolyInOut)
        .attr("transform", (d) => {
          const finalPos = positions.get(d.id)!;
          return `translate(${finalPos.x}, ${finalPos.y})`;
        })
        .end()
    );

    // Selección de enlaces a desplazar (re-vinculación de datos)
    const remainingLinks = svg
      .selectAll<SVGGElement, LinkData>("g.link")
      .data(
        existingLinksData,
        (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
      );

    console.log("Enlaces a animar:", remainingLinks.size());

        // Promesa para desplazamiento de enlaces existentes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("d", d => d.type === "next" || d.type === "prev" ? calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT) : calculateCircularLPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
                .end()
        );

    // Posición de animación inicial del indicador de cabeza
    const initialHeadIndicatorPos = positions.get(prevHeadNode)!;
    shiftPromises.push(
      headIndicatorGroup
        .transition()
        .duration(1500)
        .ease(d3.easePolyInOut)
        .attr("transform", () => {
          const finalX =
            initialHeadIndicatorPos.x +
            SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
          const finalY = initialHeadIndicatorPos.y;
          return `translate(${finalX}, ${finalY})`;
        })
        .end()
    );

    if (showTailIndicator) {
      // Grupo del lienzo correspondiente al indicador del nodo cola
      const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

      // Posición de animación final del indicador de cola
      const finalTailIndicatorPos = positions.get(
        existingNodesData[existingNodesData.length - 1].id
      )!;
      shiftPromises.push(
        tailIndicatorGroup
          .transition()
          .duration(1500)
          .ease(d3.easePolyInOut)
          .attr("transform", () => {
            const finalX =
              finalTailIndicatorPos.x +
              SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = finalTailIndicatorPos.y;
            return `translate(${finalX}, ${finalY})`;
          })
          .end()
      );
    }

    // Animación especial para enlaces circulares durante el desplazamiento
    if (
      showCircularLinks &&
      oldCircularLinkGroup &&
      oldCircularLinkGroup.node()
    ) {
      // Desvanecer el enlace circular anterior
      shiftPromises.push(
        oldCircularLinkGroup
          .select("path.node-link")
          .transition()
          .duration(750)
          .style("opacity", 0)
          .end()
      );
    }

    // Resolución de promesas para animación de desplazamiento
    await Promise.all(shiftPromises);

    // Posición de animación inicial para inserción del nuevo nodo
    const initialYOffset = -60;
    const initialNewNodePos = {
      x: finalNewNodePos.x,
      y: finalNewNodePos.y + initialYOffset,
    };
    newNodeGroup.attr(
      "transform",
      `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`
    );

    // Desplazamiento del nuevo nodo hacia su posición final
    await newNodeGroup
      .transition()
      .duration(1500)
      .style("opacity", 1)
      .ease(d3.easePolyInOut)
      .attr(
        "transform",
        `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`
      )
      .end();

        // Establecimiento del enlace siguiente del nuevo nodo que apunta al nodo cabeza anterior
        await newNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        if (prevCircularLinkGroup) {
            // Establecimiento del nuevo enlace circular previo presente entre el nuevo nodo cabeza y el último nodo (solo para listas circulares)
            await prevCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();

            // Desconexión del enlace circular previo presente entre el nodo cabeza anterior y el último nodo (solo para listas circulares)
            await svg.select<SVGGElement>(`g#link-${prevHeadNode}-${lastNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();
        }

        // Establecimiento del enlace previo del nodo cabeza anterior que apunta al nuevo nodo (solo para listas dobles)
        if (prevHeadNodePrevLinkGroup) {
            await prevHeadNodePrevLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        if (nextCircularLinkGroup) {
            // Desconexión del enlace circular siguiente presente entre el último nodo y el nodo cabeza anterior (solo para listas circulares)
            await svg.select<SVGGElement>(`g#link-${lastNode}-${prevHeadNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace circular siguiente presente entre el último nodo y el nuevo nodo cabeza
            await nextCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

    // Movimiento del indicador de cabeza hacia el nuevo nodo
    await headIndicatorGroup
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .attr("transform", () => {
        const finalX =
          finalNewNodePos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
        const finalY = finalNewNodePos.y;
        return `translate(${finalX}, ${finalY})`;
      })
      .end();

    // Animación final para el nuevo enlace circular
    if (
      showCircularLinks &&
      newCircularLinkGroup &&
      newCircularLinkGroup.node()
    ) {
      await newCircularLinkGroup
        .select("path.node-link")
        .style("fill", "none")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
    }
  } else {
    // Animación de aparición simple del nuevo nodo
    await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo al final de la lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param listData Objeto con información relacionada a los nodos de la lista. 
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newLastNode: string, prevLastNode: string | null, headNode: string },
    listData: {
        existingNodesData: ListNodeData<number>[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showNextCircularLink: boolean,
        showPrevCircularLink: boolean
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la inserción
    const { newLastNode, prevLastNode, headNode } = nodesInvolved;

  // Grupo del lienzo correspondiente al nuevo elemento
  const newNodeGroup = svg.select<SVGGElement>(`g#${newLastNode}`);

  // Estado visual inicial del nuevo nodo
  newNodeGroup.style("opacity", 0);

    if (prevLastNode) {
        // Información de la lista a renderizar
        const { existingNodesData, showDoubleLinks, showTailIndicator, showNextCircularLink, showPrevCircularLink } = listData;

    // Grupo del lienzo correspondiente al enlace del anterior último nodo que apunta al nuevo último nodo
    const prevLastNodeNextLinkGroup = svg.select<SVGGElement>(
      `g#link-${prevLastNode}-${newLastNode}-next`
    );

    // Estado visual inicial del enlace que apunta al nuevo último nodo
    prevLastNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

    // Grupo del lienzo correspondiente al enlace previo del nuevo último nodo (solo para listas dobles)
    const newNodePrevLinkGroup = showDoubleLinks
      ? svg.select<SVGGElement>(`g#link-${newLastNode}-${prevLastNode}-prev`)
      : null;

    // Estado visual inicial del enlace previo del nuevo último nodo
    if (newNodePrevLinkGroup) {
      newNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
    }

    // Para listas circulares: enlace del nuevo nodo hacia el primer nodo
    let newNodeCircularLinkGroup = null;
    let prevLastNodeCircularLinkGroup = null;

    if (showCircularLinks && existingNodesData.length > 0) {
      const firstNodeId = existingNodesData[0].id;

      // Grupo del enlace circular del nuevo nodo hacia el primer nodo
      newNodeCircularLinkGroup = svg.select<SVGGElement>(
        `g#link-${newLastNode}-${firstNodeId}-next-circular`
      );

      // Estado visual inicial del enlace circular
      if (newNodeCircularLinkGroup.node()) {
        newNodeCircularLinkGroup.select("path.node-link").style("opacity", 0);
      }

      // Si había un enlace circular previo (del anterior último nodo al primero), lo ocultamos
      prevLastNodeCircularLinkGroup = svg.select<SVGGElement>(
        `g#link-${prevLastNode}-${firstNodeId}-next-circular`
      );

      // Ocultar el enlace circular anterior con animación
      if (prevLastNodeCircularLinkGroup.node()) {
        await prevLastNodeCircularLinkGroup
          .select("path.node-link")
          .transition()
          .duration(800)
          .style("opacity", 0)
          .end();
      }
    }

        // Selección y establecimiento de estado visual inicial de enlaces circulares (solo para listas circulares)
        const nextCircularLinkGroup = showNextCircularLink ? svg.select<SVGGElement>(`g#link-${newLastNode}-${headNode}-circular-next`) : null;
        if (nextCircularLinkGroup) {
            nextCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

        const prevCircularLinkGroup = showPrevCircularLink ? svg.select<SVGGElement>(`g#link-${headNode}-${newLastNode}-circular-prev`) : null;
        if (prevCircularLinkGroup) {
            prevCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

        // Si no es una lista circular doble enlazada o no posee un nodo cola, se recorre la lista hasta el último nodo
        if (!showPrevCircularLink && !showTailIndicator) {
            for (const node of existingNodesData) {
                // Selección del grupo del nodo actual
                const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

        // Selección del elemento a animar
        const nodeElement = nodeGroup.select("rect");

        // Resaltado del nodo actual
        await nodeElement
          .transition()
          .duration(700)
          .attr("stroke", "#f87171")
          .attr("stroke-width", 3)
          .end();

                // Restablecimiento del estilo original del nodo (excepto para el último nodo)
                if (node.id !== prevLastNode) {
                    await nodeElement
                        .transition()
                        .duration(700)
                        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
                        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
                        .end();
                }
            }
        }

        // Posición de animación final para inserción del nuevo nodo
        const finalNewNodePos = positions.get(newLastNode)!;

    // Posición de animación inicial para inserción del nuevo nodo
    const initialYOffset = -60;
    const initialNewNodePos = {
      x: finalNewNodePos.x,
      y: finalNewNodePos.y + initialYOffset,
    };
    newNodeGroup.attr(
      "transform",
      `translate(${initialNewNodePos.x}, ${initialNewNodePos.y})`
    );

    // Desplazamiento del nuevo nodo hacia su posición final
    await newNodeGroup
      .transition()
      .duration(1500)
      .style("opacity", 1)
      .ease(d3.easePolyInOut)
      .attr(
        "transform",
        `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`
      )
      .end();

        // Desconexión del enlace circular siguiente presente entre el último nodo previo y el nodo cabeza (solo para listas circulares)
        if (showNextCircularLink) {
            await svg.select<SVGGElement>(`g#link-${prevLastNode}-${headNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();
        }

        // Establecimiento del enlace siguiente del último nodo previo que apunta al nuevo último nodo
        await prevLastNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .end();

        if (prevCircularLinkGroup) {
            // Desconexión del enlace circular previo presente entre el nodo cabeza y el último nodo previo (solo para listas circulares)
            await svg.select<SVGGElement>(`g#link-${headNode}-${prevLastNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del nuevo enlace circular previo presente entre el nodo cabeza y el nuevo último nodo (solo para listas circulares)
            await prevCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Establecimiento del nuevo enlace circular siguiente presente entre el nuevo último nodo y nodo cabeza (solo para listas circulares)
        if (nextCircularLinkGroup) {
            await nextCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Establecimiento del enlace previo del nuevo último nodo (solo para listas dobles)
        if (newNodePrevLinkGroup) {
            await newNodePrevLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

    if (showTailIndicator) {
      // Grupo del lienzo correspondiente al indicador del nodo cola
      const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

      // Desplazamiento del indicador de cola a la posición del nuevo último nodo
      const finalTailIndicatorPos = positions.get(newLastNode)!;
      await tailIndicatorGroup
        .transition()
        .duration(1000)
        .ease(d3.easeQuadInOut)
        .attr("transform", () => {
          const finalX =
            finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
          const finalY = finalTailIndicatorPos.y;
          return `translate(${finalX}, ${finalY})`;
        })
        .end();
    }
  } else {
    // Animación de aparición simple del nuevo nodo
    await newNodeGroup.transition().duration(1000).style("opacity", 1).end();
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la inserción de un nuevo nodo en una posición especifica.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la inserción.
 * @param listData Objeto con información de los nodos y enlaces de la lista.
 * @param insertionPosition Posición en la que el nuevo nodo será insertado.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateInsertAtPosition(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { newNode: string, prevNode: string, nextNode: string },
    listData: {
        existingNodesData: ListNodeData<number>[],
        existingLinksData: LinkData[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showCircularLinks: boolean
    },
    insertionPosition: number,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Nodos implicados en la inserción
  const { newNode, prevNode, nextNode } = nodesInvolved;

    // Información de la lista a renderizar
    const { existingNodesData, existingLinksData, showDoubleLinks, showTailIndicator, showCircularLinks } = listData;

    // Grupo del lienzo correspondiente al nuevo elemento
    const newNodeGroup = svg.select<SVGGElement>(`g#${newNode}`);

  // Grupo del lienzo correspondiente al enlace siguiente del nodo previo que apunta al nuevo nodo
  const prevToNewNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${prevNode}-${newNode}-next`
  );

  // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
  const newNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${newNode}-${nextNode}-next`
  );

  // Estado visual inicial del nuevo nodo
  newNodeGroup.style("opacity", 0);

  // Estado visual inicial del enlace que apunta al nuevo nodo
  prevToNewNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

  // Estado visual inicial del enlace que apunta al siguiente del nuevo nodo
  newNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

  // Grupo del lienzo correspondiente al enlace anterior del nodo siguiente que apunta al nuevo nodo (solo para listas dobles)
  const nextToNewNodePrevLinkGroup = showDoubleLinks
    ? svg.select<SVGGElement>(`g#link-${nextNode}-${newNode}-prev`)
    : null;

  // Grupo del lienzo correspondiente al enlace previo del nuevo nodo (solo para listas dobles)
  const newNodePrevLinkGroup = showDoubleLinks
    ? svg.select<SVGGElement>(`g#link-${newNode}-${prevNode}-prev`)
    : null;

  // Estado visual inicial de los enlaces previos referentes al nuevo nodo
  if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
    nextToNewNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
    newNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
  }

  // Nodos a recorrer para insertar el nodo
  const nodesToTraverse = existingNodesData.slice(0, insertionPosition);

  for (const node of nodesToTraverse) {
    // Selección del grupo del nodo actual
    const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

    // Selección del eleento a animar
    const nodeElement = nodeGroup.select("rect");

    // Resaltado del nodo actual
    await nodeElement
      .transition()
      .duration(700)
      .attr("stroke", "#f87171")
      .attr("stroke-width", 3)
      .end();

    // Restablecimiento del estilo original del nodo (excepto para el último nodo)
    if (node.id !== prevNode) {
      await nodeElement
        .transition()
        .duration(700)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();
    }
  }

  // Nodos a desplazar para la inclusión del nuevo nodo
  const nodesToMove = existingNodesData.slice(
    insertionPosition,
    existingNodesData.length
  );

  // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces
  const shiftPromises: Promise<void>[] = [];

  // Desconexión del enlace siguiente presente entre el nodo anterior y siguiente al nuevo nodo
  const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${prevNode}-${nextNode}-next}`
  );

  await prevToNextNodeNextLinkGroup
    .select("path.node-link")
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .end();
  prevToNextNodeNextLinkGroup.remove();

  // Desconexión del enlace previo presente entre el nodo siguiente y anterior al nuevo nodo (solo para listas dobles)
  if (showDoubleLinks) {
    const nextToPrevNodePrevLinkGroup = svg.select<SVGGElement>(
      `g#link-${nextNode}-${prevNode}-prev`
    );

    await nextToPrevNodePrevLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .end();
    nextToPrevNodePrevLinkGroup.remove();
  }

    // Selección de nodos que requieren posicionamiento (re-vinculación de datos)
    const remainingNodes = svg.selectAll<SVGGElement, ListNodeData<number>>("g.node")
        .data(nodesToMove, d => d.id);

  // Promesa para desplazamiento de nodos existentes a su posición final
  shiftPromises.push(
    remainingNodes
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr("transform", (d) => {
        const finalPos = positions.get(d.id)!;
        return `translate(${finalPos.x}, ${finalPos.y})`;
      })
      .end()
  );

  // Selección de enlaces que requieren posicionamiento (re-vinculación de datos)
  const remainingLinks = svg
    .selectAll<SVGGElement, LinkData>("g.link")
    .data(
      existingLinksData,
      (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
    );

    // Promesa para desplazamiento de enlaces existentes a su posición final
    shiftPromises.push(
        remainingLinks.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("d", d => d.type === "next" || d.type === "prev" ? calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT) : calculateCircularLPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
            .end()
    );

  if (showTailIndicator) {
    // Grupo del lienzo correspondiente al indicador del nodo cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Posición de animación final del indicador de cola
    const finalTailIndicatorPos = positions.get(
      existingNodesData[existingNodesData.length - 1].id
    )!;
    shiftPromises.push(
      tailIndicatorGroup
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr("transform", () => {
          const finalX =
            finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
          const finalY = finalTailIndicatorPos.y;
          return `translate(${finalX}, ${finalY})`;
        })
        .end()
    );
  }

    // Resolución de las promesas para animación de desplazamiento
    await Promise.all(shiftPromises);

    // Posición de animación final para inserción del nuevo nodo
    const finalNewNodePos = positions.get(newNode)!;

    // Posición de animación inicial para inserción del nuevo nodo
    const initialYOffset = showCircularLinks ? -100 : -75;
    const initialPos = { x: finalNewNodePos.x, y: finalNewNodePos.y + initialYOffset };

  // Mapa temporal de posiciones para calular la forma inicial de los enlaces
  const tempPositions: Map<
    string,
    {
      x: number;
      y: number;
    }
  > = new Map(positions);
  tempPositions.set(newNode, initialPos);

  // Forma inicial de los enlaces siguientes producto de la inserción
  const initialNextPathToNewNode = calculateLinkPath(
    { sourceId: prevNode, targetId: newNode, type: "next" },
    tempPositions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );
  const initialNextPathOfNewNode = calculateLinkPath(
    { sourceId: newNode, targetId: nextNode, type: "next" },
    tempPositions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );

  prevToNewNodeNextLinkGroup
    .select("path.node-link")
    .attr("d", initialNextPathToNewNode);
  newNodeNextLinkGroup
    .select("path.node-link")
    .attr("d", initialNextPathOfNewNode);

  // Forma inicial de los enlaces previos producto de la inserción (solo para listas dobles)
  if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
    const initialPrevPathToNewNode = calculateLinkPath(
      { sourceId: nextNode, targetId: newNode, type: "prev" },
      tempPositions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );
    const initialPrevPathOfNewNode = calculateLinkPath(
      { sourceId: newNode, targetId: prevNode, type: "prev" },
      tempPositions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );

    nextToNewNodePrevLinkGroup
      .select("path.node-link")
      .attr("d", initialPrevPathToNewNode);
    newNodePrevLinkGroup
      .select("path.node-link")
      .attr("d", initialPrevPathOfNewNode);
  }

  // Posicionamiento inicial del nuevo nodo
  newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

  // Array de promesas para animación de aparición de todos los elementos relacionados al nuevo nodo
  const newNodeAppearancePromises: Promise<void>[] = [];

  // Promesa para aparición del nuevo nodo
  newNodeAppearancePromises.push(
    newNodeGroup.transition().duration(1000).style("opacity", 1).end()
  );

  // Promesa para aparición del enlace siguiente del nuevo nodo
  newNodeAppearancePromises.push(
    newNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .end()
  );

  // Promesa para conexión del nodo previo con el nuevo nodo
  newNodeAppearancePromises.push(
    prevToNewNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .end()
  );

  // Promesas para aparición de enlaces previos (solo para listas dobles)
  if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
    newNodeAppearancePromises.push(
      nextToNewNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end()
    );

    newNodeAppearancePromises.push(
      newNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end()
    );
  }

  // Resolución de las promesas de animación para aparición del nuevo nodo
  await Promise.all(newNodeAppearancePromises);

  // Forma final de los enlaces siguientes producto de la inserción
  const finalNextPathToNewNode = calculateLinkPath(
    { sourceId: prevNode, targetId: newNode, type: "next" },
    positions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );
  const finalNextPathOfNewNode = calculateLinkPath(
    { sourceId: newNode, targetId: nextNode, type: "next" },
    positions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );

  // Array de promesas para animación de movimiento de los elementos del nuevo nodo a su posición final
  const newNodeFinalMovementPromises: Promise<void>[] = [];

  // Promesas para movimiento de los elementos del nuevo nodo a su posición final
  newNodeFinalMovementPromises.push(
    newNodeGroup
      .transition()
      .duration(1500)
      .ease(d3.easeBounce)
      .attr(
        "transform",
        `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`
      )
      .end()
  );

  newNodeFinalMovementPromises.push(
    prevToNewNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1500)
      .ease(d3.easeBounce)
      .attr("d", finalNextPathToNewNode)
      .end()
  );

  newNodeFinalMovementPromises.push(
    newNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1500)
      .ease(d3.easeBounce)
      .attr("d", finalNextPathOfNewNode)
      .end()
  );

  // Movimiento de enlaces previos (solo para listas dobles)
  if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
    const finalPrevPathToNewNode = calculateLinkPath(
      { sourceId: nextNode, targetId: newNode, type: "prev" },
      positions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );
    const finalPrevPathOfNewNode = calculateLinkPath(
      { sourceId: newNode, targetId: prevNode, type: "prev" },
      positions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );

    newNodeFinalMovementPromises.push(
      nextToNewNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1500)
        .ease(d3.easeBounce)
        .attr("d", finalPrevPathToNewNode)
        .end()
    );

    newNodeFinalMovementPromises.push(
      newNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1500)
        .ease(d3.easeBounce)
        .attr("d", finalPrevPathOfNewNode)
        .end()
    );
  }

  // Resolución de las promesas de animación para movimiento de los elementos del nuevo nodo a su posición final
  await Promise.all(newNodeFinalMovementPromises);

    // Restablecimiento de los valores de las queries del usuario
    resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

// export async function animateInsertAtPosition(
//   svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
//   nodesInvolved: { newNode: string; prevNode: string; nextNode: string },
//   listData: {
//     existingNodesData: ListNodeData[];
//     existingLinksData: LinkData[];
//     showDoubleLinks: boolean;
//     showTailIndicator: boolean;
//     showCircularLinks: boolean;
//   },
//   insertionPosition: number,
//   positions: Map<string, { x: number; y: number }>,
//   resetQueryValues: () => void,
//   setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
// ) {
//   // Nodos implicados en la inserción
//   const { newNode, prevNode, nextNode } = nodesInvolved;

//   // Información de la lista
//   const {
//     existingNodesData,
//     existingLinksData,
//     showDoubleLinks,
//     showTailIndicator,
//     showCircularLinks,
//   } = listData;

//   // Grupo del lienzo correspondiente al nuevo elemento
//   const newNodeGroup = svg.select<SVGGElement>(`g#${newNode}`);

//   // Grupo del lienzo correspondiente al nodo anterior al nodo a insertar
//   const prevNodeGroup = svg.select<SVGGElement>(`g#${prevNode}`);

//   // Posición de animación final para inserción del nuevo nodo
//   const finalNewNodePos = positions.get(newNode)!;

//   // Grupo del lienzo correspondiente al enlace siguiente del nodo previo que apunta al nuevo nodo
//   const prevToNewNodeNextLinkGroup = svg.select<SVGGElement>(
//     `g#link-${prevNode}-${newNode}-next`
//   );

//   // Grupo del lienzo correspondiente al enlace siguiente del nuevo nodo
//   const newNodeNextLinkGroup = svg.select<SVGGElement>(
//     `g#link-${newNode}-${nextNode}-next`
//   );

//   // Estado visual inicial del nuevo nodo
//   newNodeGroup.style("opacity", 0);

//   // Estado visual inicial del enlace que apunta al nuevo nodo
//   prevToNewNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

//   // Estado visual inicial del enlace que apunta al siguiente del nuevo nodo
//   newNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

//   // Grupo del lienzo correspondiente al enlace anterior del nodo siguiente que apunta al nuevo nodo (solo para listas dobles)
//   const nextToNewNodePrevLinkGroup = showDoubleLinks
//     ? svg.select<SVGGElement>(`g#link-${nextNode}-${newNode}-prev`)
//     : null;

//   // Grupo del lienzo correspondiente al enlace previo del nuevo nodo (solo para listas dobles)
//   const newNodePrevLinkGroup = showDoubleLinks
//     ? svg.select<SVGGElement>(`g#link-${newNode}-${prevNode}-prev`)
//     : null;

//   // Estado visual inicial de los enlaces previos referentes al nuevo nodo
//   if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
//     nextToNewNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
//     newNodePrevLinkGroup.select("path.node-link").style("opacity", 0);
//   }

//   // Nodos a recorrer para insertar el nodo
//   const nodesToTraverse = existingNodesData.slice(0, insertionPosition);

//   for (const node of nodesToTraverse) {
//     // Selección del grupo del nodo actual
//     const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

//     // Selección del eleento a animar
//     const nodeElement = nodeGroup.select("rect");

//     // Resaltado del nodo actual
//     await nodeElement
//       .transition()
//       .duration(700)
//       .attr("stroke", "#f87171")
//       .attr("stroke-width", 3)
//       .end();

//     // Restablecimiento del estilo original del nodo (excepto para el último nodo)
//     if (node.id !== prevNode) {
//       await nodeElement
//         .transition()
//         .duration(700)
//         .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
//         .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
//         .end();
//     }
//   }

//   // Nodos a desplazar para la inclusión del nuevo nodo
//   const nodesToMove = existingNodesData.slice(
//     insertionPosition,
//     existingNodesData.length
//   );

//   // Array de promesas para concretar animaciones de desplazamiento de nodos y enlaces
//   const shiftPromises: Promise<void>[] = [];

//   // Desconexión del enlace siguiente presente entre el nodo anterior y siguiente al nuevo nodo
//   const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(
//     `g#link-${prevNode}-${nextNode}-${showCircularLinks ? "next-circular" : "next"}`
//   );
//   //     const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(
//   //     `g#link-${prevNode}-${nextNode}-next}`
//   //   );

//   await prevToNextNodeNextLinkGroup
//     .select("path.node-link")
//     .transition()
//     .duration(1000)
//     .style("opacity", 0)
//     .end();
//   prevToNextNodeNextLinkGroup.remove();

//   // Desconexión del enlace previo presente entre el nodo siguiente y anterior al nuevo nodo (solo para listas dobles)
//   if (showDoubleLinks) {
//     const nextToPrevNodePrevLinkGroup = svg.select<SVGGElement>(
//       `g#link-${nextNode}-${prevNode}-prev`
//     );

//     await nextToPrevNodePrevLinkGroup
//       .select("path.node-link")
//       .transition()
//       .duration(1000)
//       .style("opacity", 0)
//       .end();
//     nextToPrevNodePrevLinkGroup.remove();
//   }

//   // Selección de nodos que requieren posicionamiento (re-vinculación de datos)
//   const remainingNodes = svg
//     .selectAll<SVGGElement, ListNodeData>("g.node")
//     .data(nodesToMove, (d) => d.id);

//   // Promesa para desplazamiento de nodos existentes a su posición final
//   shiftPromises.push(
//     remainingNodes
//       .transition()
//       .duration(1500)
//       .ease(d3.easeQuadInOut)
//       .attr("transform", (d) => {
//         const finalPos = positions.get(d.id)!;
//         return `translate(${finalPos.x}, ${finalPos.y})`;
//       })
//       .end()
//   );

//   // Selección de enlaces que requieren posicionamiento (re-vinculación de datos)
//   const remainingLinks = svg
//     .selectAll<SVGGElement, LinkData>("g.link")
//     .data(
//       existingLinksData,
//       (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
//     );

//   // Promesa para desplazamiento de enlaces existentes a su posición final
//   shiftPromises.push(
//     remainingLinks
//       .select("path.node-link")
//       .transition()
//       .duration(1500)
//       .ease(d3.easeQuadInOut)
//       .attr("d", (d) =>
//         calculateLinkPath(
//           d,
//           positions,
//           SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//           SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//         )
//       )
//       .end()
//   );

//   if (showTailIndicator) {
//     // Grupo del lienzo correspondiente al indicador del nodo cola
//     const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

//     // Posición de animación final del indicador de cola
//     const finalTailIndicatorPos = positions.get(
//       existingNodesData[existingNodesData.length - 1].id
//     )!;
//     shiftPromises.push(
//       tailIndicatorGroup
//         .transition()
//         .duration(1500)
//         .ease(d3.easeQuadInOut)
//         .attr("transform", () => {
//           const finalX =
//             finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
//           const finalY = finalTailIndicatorPos.y;
//           return `translate(${finalX}, ${finalY})`;
//         })
//         .end()
//     );
//   }

//   // Resolución de las promesas para animación de desplazamiento
//   await Promise.all(shiftPromises);

//   // Posición de animación inicial para inserción del nuevo nodo
//   const initialYOffset = -75;
//   const initialPos = {
//     x: finalNewNodePos.x,
//     y: finalNewNodePos.y + initialYOffset,
//   };

//   // Mapa temporal de posiciones para calular la forma inicial de los enlaces
//   const tempPositions: Map<
//     string,
//     {
//       x: number;
//       y: number;
//     }
//   > = new Map(positions);
//   tempPositions.set(newNode, initialPos);

//   // Forma inicial de los enlaces siguientes producto de la inserción
//   const initialNextPathToNewNode = calculateLinkPath(
//     { sourceId: prevNode, targetId: newNode, type: showCircularLinks ? "next-circular" : "next" },
//     tempPositions,
//     SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//     SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//   );
//   const initialNextPathOfNewNode = calculateLinkPath(
//     { sourceId: newNode, targetId: nextNode, type: showCircularLinks ? "next-circular" : "next" },
//     tempPositions,
//     SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//     SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//   );

//   prevToNewNodeNextLinkGroup
//     .select("path.node-link")
//     .attr("d", initialNextPathToNewNode);
//   newNodeNextLinkGroup
//     .select("path.node-link")
//     .attr("d", initialNextPathOfNewNode);

//   // Forma inicial de los enlaces previos producto de la inserción (solo para listas dobles)
//   if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
//     const initialPrevPathToNewNode = calculateLinkPath(
//       { sourceId: nextNode, targetId: newNode, type: "prev" },
//       tempPositions,
//       SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//       SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//     );
//     const initialPrevPathOfNewNode = calculateLinkPath(
//       { sourceId: newNode, targetId: prevNode, type: "prev" },
//       tempPositions,
//       SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//       SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//     );

//     nextToNewNodePrevLinkGroup
//       .select("path.node-link")
//       .attr("d", initialPrevPathToNewNode);
//     newNodePrevLinkGroup
//       .select("path.node-link")
//       .attr("d", initialPrevPathOfNewNode);
//   }

//   // Posicionamiento inicial del nuevo nodo
//   newNodeGroup.attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

//   // Array de promesas para animación de aparición de todos los elementos relacionados al nuevo nodo
//   const newNodeAppearancePromises: Promise<void>[] = [];

//   // Promesa para aparición del nuevo nodo
//   newNodeAppearancePromises.push(
//     newNodeGroup.transition().duration(1000).style("opacity", 1).end()
//   );

//   // Promesa para aparición del enlace siguiente del nuevo nodo
//   newNodeAppearancePromises.push(
//     newNodeNextLinkGroup
//       .select("path.node-link")
//       .transition()
//       .duration(1000)
//       .style("opacity", 1)
//       .end()
//   );

//   // Promesa para conexión del nodo previo con el nuevo nodo
//   newNodeAppearancePromises.push(
//     prevToNewNodeNextLinkGroup
//       .select("path.node-link")
//       .transition()
//       .duration(1000)
//       .style("opacity", 1)
//       .end()
//   );

//   // Promesas para aparición de enlaces previos (solo para listas dobles)
//   if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
//     newNodeAppearancePromises.push(
//       nextToNewNodePrevLinkGroup
//         .select("path.node-link")
//         .transition()
//         .duration(1000)
//         .style("opacity", 1)
//         .end()
//     );

//     newNodeAppearancePromises.push(
//       newNodePrevLinkGroup
//         .select("path.node-link")
//         .transition()
//         .duration(1000)
//         .style("opacity", 1)
//         .end()
//     );
//   }

//   // Resolución de las promesas de animación para aparición del nuevo nodo
//   await Promise.all(newNodeAppearancePromises);

//   // Forma final de los enlaces siguientes producto de la inserción
//   const finalNextPathToNewNode = calculateLinkPath(
//     { sourceId: prevNode, targetId: newNode, type: showCircularLinks ? "next-circular" : "next" },
//     positions,
//     SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//     SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//   );
//   const finalNextPathOfNewNode = calculateLinkPath(
//     { sourceId: newNode, targetId: nextNode, type: showCircularLinks ? "next-circular" : "next" },
//     positions,
//     SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//     SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//   );

//   // Array de promesas para animación de movimiento de los elementos del nuevo nodo a su posición final
//   const newNodeFinalMovementPromises: Promise<void>[] = [];

//   // Promesas para movimiento de los elementos del nuevo nodo a su posición final
//   newNodeFinalMovementPromises.push(
//     newNodeGroup
//       .transition()
//       .duration(1500)
//       .ease(d3.easeBounce)
//       .attr(
//         "transform",
//         `translate(${finalNewNodePos.x}, ${finalNewNodePos.y})`
//       )
//       .end()
//   );

//   newNodeFinalMovementPromises.push(
//     prevToNewNodeNextLinkGroup
//       .select("path.node-link")
//       .transition()
//       .duration(1500)
//       .ease(d3.easeBounce)
//       .attr("d", finalNextPathToNewNode)
//       .end()
//   );

//   newNodeFinalMovementPromises.push(
//     newNodeNextLinkGroup
//       .select("path.node-link")
//       .transition()
//       .duration(1500)
//       .ease(d3.easeBounce)
//       .attr("d", finalNextPathOfNewNode)
//       .end()
//   );

//   // Movimiento de enlaces previos (solo para listas dobles)
//   if (nextToNewNodePrevLinkGroup && newNodePrevLinkGroup) {
//     const finalPrevPathToNewNode = calculateLinkPath(
//       { sourceId: nextNode, targetId: newNode, type: "prev" },
//       positions,
//       SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//       SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//     );
//     const finalPrevPathOfNewNode = calculateLinkPath(
//       { sourceId: newNode, targetId: prevNode, type: "prev" },
//       positions,
//       SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
//       SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
//     );

//     newNodeFinalMovementPromises.push(
//       nextToNewNodePrevLinkGroup
//         .select("path.node-link")
//         .transition()
//         .duration(1500)
//         .ease(d3.easeBounce)
//         .attr("d", finalPrevPathToNewNode)
//         .end()
//     );

//     newNodeFinalMovementPromises.push(
//       newNodePrevLinkGroup
//         .select("path.node-link")
//         .transition()
//         .duration(1500)
//         .ease(d3.easeBounce)
//         .attr("d", finalPrevPathOfNewNode)
//         .end()
//     );
//   }

//   // Resolución de las promesas de animación para movimiento de los elementos del nuevo nodo a su posición final
//   await Promise.all(newNodeFinalMovementPromises);

//   // Restablecimiento del estilo del nodo anterior al nuevo nodo
//   await prevNodeGroup
//     .select("rect")
//     .transition()
//     .duration(500)
//     .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
//     .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
//     .end();

//   // Restablecimiento de los valores de las queries del usuario
//   resetQueryValues();

//   // Finalización de la animación
//   setIsAnimating(false);
// }

/**
 * Función encargada de animar la eliminación del nodo al inicio de la lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación. 
 * @param listData Objeto con información de los nodos y enlaces de la lista.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación. 
 */
export async function animateRemoveFirst(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevHeadNode: string, newHeadNode: string | null, lastNode: string | null },
    listData: {
        remainingNodesData: ListNodeData<number>[],
        remainingLinksData: LinkData[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showNextCircularLink: boolean;
        showPrevCircularLink: boolean;
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { newHeadNode, prevHeadNode, lastNode } = nodesInvolved;

  // Grupo del lienzo correspondiente al nodo a eliminar
  const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${prevHeadNode}`);

    // Indicadores para visualización de enlaces circulares
    const { showNextCircularLink, showPrevCircularLink } = listData;

    if (newHeadNode && lastNode) {
        // Información de la lista a renderizar
        const { remainingNodesData, remainingLinksData, showDoubleLinks, showTailIndicator } = listData;

    // Grupo del lienzo correspondiente al indicador del nodo cabeza
    const headIndicatorGroup = svg.select<SVGGElement>("g#head-indicator");

    // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar que apunta al nuevo nodo cabeza
    const nodeToRemoveNextLinkGroup = svg.select<SVGGElement>(
      `g#link-${prevHeadNode}-${newHeadNode}-next`
    );

        // Grupo del lienzo correspondiente al enlace previo del nuevo nodo cabeza que apunta al nodo a eliminar (solo para listas dobles)
        const newHeadNodePrevLinkGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${newHeadNode}-${prevHeadNode}-prev`) : null;

        // Selección y establecimiento de estado visual inicial de enlaces circulares (solo para listas circulares)
        const nextCircularLinkGroup = showNextCircularLink ? svg.select<SVGGElement>(`g#link-${lastNode}-${newHeadNode}-circular-next`) : null;
        if (nextCircularLinkGroup) {
            nextCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

        const prevCircularLinkGroup = showPrevCircularLink ? svg.select<SVGGElement>(`g#link-${newHeadNode}-${lastNode}-circular-prev`) : null;
        if (prevCircularLinkGroup) {
            prevCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

    // Posición actual del nodo a eliminar
    const nodeToRemoveCurrentPos = positions.get(prevHeadNode)!;

        // Mapa temporal de posiciones para calular la forma inicial de los enlaces circulares producto de la eliminación
        let tempPositions: Map<string, {
            x: number;
            y: number;
        }> | null = null;

        if (prevCircularLinkGroup || nextCircularLinkGroup) {
            tempPositions = new Map(positions);

            // Posición inicial en x del nuevo nodo cabeza
            const newHeadNodeInitialXPos = SVG_LINKED_LIST_VALUES.MARGIN_LEFT + 1 * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING);

            // Posición inicial en x del último nodo
            const lastNodeInitialXPos = SVG_LINKED_LIST_VALUES.MARGIN_LEFT + (remainingNodesData.length) * (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING);

            tempPositions.set(newHeadNode, { x: newHeadNodeInitialXPos, y: nodeToRemoveCurrentPos.y });
            tempPositions.set(lastNode, { x: lastNodeInitialXPos, y: nodeToRemoveCurrentPos.y });
        }

        // Desconexión del enlace siguiente entre el nodo a eliminar y el nuevo nodo cabeza
        await nodeToRemoveNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Desconexión del enlace circular previo presente entre el nodo a eliminar y el último nodo
        if (showPrevCircularLink) {
            await svg.select<SVGGElement>(`g#link-${prevHeadNode}-${lastNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();
        }

        if (nextCircularLinkGroup && tempPositions) {
            // Desconexión del enlace circular siguiente presente entre el último nodo y el nodo a eliminar
            await svg.select<SVGGElement>(`g#link-${lastNode}-${prevHeadNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Forma inicial del enlace circular siguiente entre el último nodo y el nuevo nodo cabeza
            const initialNextCircularPath = calculateCircularLPath({ sourceId: lastNode, targetId: newHeadNode, type: 'circular-next' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

            // Establecimiento del nuevo enlace circular siguiente entre el último nodo y el nuevo nodo cabeza
            await nextCircularLinkGroup
                .select("path.node-link")
                .attr("d", initialNextCircularPath)
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Desconexión del enlace previo entre el nuevo nodo cabeza y el nodo a eliminar
        if (newHeadNodePrevLinkGroup) {
            await newHeadNodePrevLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .end();
        }

        if (prevCircularLinkGroup && tempPositions) {
            // Forma inicial del enlace circular previo entre el nuevo nodo cabeza y el último nodo
            const initialPrevCircularPath = calculateCircularLPath({ sourceId: newHeadNode, targetId: lastNode, type: 'circular-prev' }, tempPositions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT);

            // Establecimiento del nuevo enlace circular previo entre el nuevo nodo cabeza y el último nodo
            await prevCircularLinkGroup
                .select("path.node-link")
                .attr("d", initialPrevCircularPath)
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Movimiento de salida del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

    // Salida del nodo a eliminar
    await nodeToRemoveGroup
      .transition()
      .duration(1500)
      .ease(d3.easePolyInOut)
      .attr("transform", () => {
        const x = nodeToRemoveCurrentPos.x;
        const y = nodeToRemoveCurrentPos.y + nodeMoveOffsetY;
        return `translate(${x}, ${y})`;
      })
      .style("opacity", 0)
      .end();

    // Eliminación de los elementos del DOM asociados al nodo eliminado
    nodeToRemoveGroup.remove();
    nodeToRemoveNextLinkGroup.remove();
    if (newHeadNodePrevLinkGroup) newHeadNodePrevLinkGroup.remove();

    // Eliminación de la posición del nodo eliminado
    positions.delete(prevHeadNode);

    // Salida del indicador de cabeza
    await headIndicatorGroup
      .transition()
      .duration(500)
      .style("opacity", 0)
      .end();

    // Array de promesas para desplazamiento de nodos y enlaces restantes
    const shiftPromises: Promise<void>[] = [];

        // Selección de nodos restantes (re-vinculación de datos)
        const remainingNodes = svg.selectAll<SVGGElement, ListNodeData<number>>("g.node")
            .data(remainingNodesData, d => d.id);

    // Promesa para desplazamiento de nodos restantes a su posición final
    shiftPromises.push(
      remainingNodes
        .transition()
        .duration(1500)
        .ease(d3.easePolyInOut)
        .attr("transform", (d) => {
          const finalPos = positions.get(d.id)!;
          return `translate(${finalPos.x}, ${finalPos.y})`;
        })
        .end()
    );

    // Selección de enlaces restantes (re-vinculación de datos)
    const remainingLinks = svg
      .selectAll<SVGGElement, LinkData>("g.link")
      .data(
        remainingLinksData,
        (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
      );

        // Promesa para desplazamiento de enlaces restantes a su posición final
        shiftPromises.push(
            remainingLinks.select("path.node-link")
                .transition()
                .duration(1500)
                .ease(d3.easePolyInOut)
                .attr("d", d => d.type === "next" || d.type === "prev" ? calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT) : calculateCircularLPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
                .end()
        );

    if (showTailIndicator) {
      // Grupo del lienzo correspondiente al indicador del nodo cola
      const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

      // Posición de animación final del indicador de cola
      const finalTailIndicatorPos = positions.get(
        remainingNodesData[remainingNodesData.length - 1].id
      )!;
      shiftPromises.push(
        tailIndicatorGroup
          .transition()
          .duration(1500)
          .ease(d3.easePolyInOut)
          .attr("transform", () => {
            const finalX =
              finalTailIndicatorPos.x +
              SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = finalTailIndicatorPos.y;
            return `translate(${finalX}, ${finalY})`;
          })
          .end()
      );
    }

    // Resolución de las promesas para animación de desplazamiento de nodos y enlaces restantes
    await Promise.all(shiftPromises);

        // Entrada del indicador de cabeza
        await headIndicatorGroup
            .transition()
            .duration(500)
            .style("opacity", 1)
            .end();
    } else {
        // Desconexión del enlace circular siguiente presente entre el último nodo y el nodo a eliminar
        if (showNextCircularLink) {
            svg.select<SVGGElement>(`g#link-${prevHeadNode}-${prevHeadNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove();
        }

        // Desconexión del enlace circular previo presente entre el nodo a eliminar y el último nodo
        if (showPrevCircularLink) {
            svg.select<SVGGElement>(`g#link-${prevHeadNode}-${prevHeadNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove();
        }

        // Animación de salida simple del nodo
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .ease(d3.easePolyInOut)
            .end();

    // Eliminación de los elementos del DOM asociados al nodo eliminado
    nodeToRemoveGroup.remove();

    // Eliminación de la posición del nodo eliminado
    positions.delete(prevHeadNode);
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación del nodo al final de la lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación. 
 * @param listData Objeto con información relacionada a los nodos de la lista.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateRemoveLast(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { prevLastNode: string, newLastNode: string | null, headNode: string | null },
    listData: {
        remainingNodesData: ListNodeData<number>[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showNextCircularLink: boolean;
        showPrevCircularLink: boolean;
    },
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
    // Nodos implicados en la eliminación
    const { newLastNode, prevLastNode, headNode } = nodesInvolved;

  // Grupo del lienzo correspondiente al nodo a eliminar
  const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${prevLastNode}`);

    // Indicadores para visualización de enlaces circulares
    const { showNextCircularLink, showPrevCircularLink } = listData;

    if (newLastNode && headNode) {
        // Información de la lista
        const { remainingNodesData, showDoubleLinks, showTailIndicator } = listData;

    // Grupo del lienzo correspondiente al enlace siguiente entre el nuevo último nodo y el nodo a eliminar
    const newLastNodeNextLinkGroup = svg.select<SVGGElement>(
      `g#link-${newLastNode}-${prevLastNode}-next`
    );

    // Grupo del lienzo correspondiente al enlace previo del nodo a eliminar (solo para listas dobles)
    const nodeToRemovePrevLinkGroup = showDoubleLinks
      ? svg.select<SVGGElement>(`g#link-${prevLastNode}-${newLastNode}-prev`)
      : null;

        // Selección y establecimiento de estado visual inicial de enlaces circulares (solo para listas circulares)
        const nextCircularLinkGroup = showNextCircularLink ? svg.select<SVGGElement>(`g#link-${newLastNode}-${headNode}-circular-next`) : null;
        if (nextCircularLinkGroup) {
            nextCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

        const prevCircularLinkGroup = showPrevCircularLink ? svg.select<SVGGElement>(`g#link-${headNode}-${newLastNode}-circular-prev`) : null;
        if (prevCircularLinkGroup) {
            prevCircularLinkGroup.select("path.node-link").style("opacity", 0);
        }

    // Si no es una lista doblemente enlazada, se recorre la lista hasta el último nodo
    if (!showDoubleLinks) {
      for (const node of remainingNodesData) {
        // Selección del grupo del nodo actual
        const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

        // Selección del elemento a animar
        const nodeElement = nodeGroup.select("rect");

        // Resaltado del nodo actual
        await nodeElement
          .transition()
          .duration(700)
          .attr("stroke", "#f87171")
          .attr("stroke-width", 3)
          .end();

        // Restablecimiento del estilo original del nodo (excepto para el nuevo último nodo)
        if (node.id !== newLastNode) {
          await nodeElement
            .transition()
            .duration(700)
            .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
        }
      }
    }

    if (showTailIndicator) {
      // Grupo del lienzo correspondiente al indicador del nodo cola
      const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

      // Desplazamiento del indicador de cola a la posición del nuevo último nodo
      const finalTailIndicatorPos = positions.get(newLastNode)!;
      await tailIndicatorGroup
        .transition()
        .duration(1000)
        .ease(d3.easeQuadInOut)
        .attr("transform", () => {
          const finalX =
            finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
          const finalY = finalTailIndicatorPos.y;
          return `translate(${finalX}, ${finalY})`;
        })
        .end();
    }

        // Posición actual del nodo a eliminar
        const nodeToRemoveCurrentPos = positions.get(prevLastNode)!;

        // Movimiento de salida del nodo a eliminar 
        const nodeMoveOffsetY = SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH * 0.8;

        // Desconexión del enlace siguiente entre el nuevo último nodo y el nodo a eliminar
        await newLastNodeNextLinkGroup
            .select("path.node-link")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .end();

        // Establecimiento del enlace circular siguiente presente entre el nuevo último nodo y el nodo cabeza
        if (nextCircularLinkGroup) {
            await nextCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        if (prevCircularLinkGroup) {
            // Desconexión del enlace circular previo presente entre el nodo cabeza y el nodo a eliminar
            await svg.select<SVGGElement>(`g#link-${headNode}-${prevLastNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();

            // Establecimiento del enlace circular previo entre el nodo cabeza y el nuevo último nodo
            await prevCircularLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .end();
        }

        // Desconexión del enlace circular siguiente presente entre el nodo a eliminar y el nodo cabeza
        if (showNextCircularLink) {
            await svg.select<SVGGElement>(`g#link-${prevLastNode}-${headNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove()
                .end();
        }

        // Desconexión del enlace previo del nodo a eliminar (solo para listas dobles)
        if (nodeToRemovePrevLinkGroup) {
            await nodeToRemovePrevLinkGroup
                .select("path.node-link")
                .transition()
                .duration(1000)
                .ease(d3.easePolyInOut)
                .style("opacity", 0)
                .end();
        }

    // Salida del nodo a eliminar
    await nodeToRemoveGroup
      .transition()
      .duration(1500)
      .ease(d3.easePolyInOut)
      .attr("transform", () => {
        const x = nodeToRemoveCurrentPos.x;
        const y = nodeToRemoveCurrentPos.y + nodeMoveOffsetY;
        return `translate(${x}, ${y})`;
      })
      .style("opacity", 0)
      .end();

        // Eliminación de los elementos del DOM asociados al nodo eliminado
        nodeToRemoveGroup.remove();
        newLastNodeNextLinkGroup.remove();
        if (nodeToRemovePrevLinkGroup) nodeToRemovePrevLinkGroup.remove();

        // Eliminación de la posición del nodo eliminado
        positions.delete(prevLastNode);
    } else {
        // Desconexión del enlace circular siguiente presente entre el último nodo y el nodo a eliminar
        if (showNextCircularLink) {
            svg.select<SVGGElement>(`g#link-${prevLastNode}-${prevLastNode}-circular-next`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove();
        }

        // Desconexión del enlace circular previo presente entre el nodo a eliminar y el último nodo
        if (showPrevCircularLink) {
            svg.select<SVGGElement>(`g#link-${prevLastNode}-${prevLastNode}-circular-prev`)
                .transition()
                .duration(1000)
                .style("opacity", 0)
                .remove();
        }

        // Animación de salida simple del nodo
        await nodeToRemoveGroup
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .ease(d3.easePolyInOut)
            .end();

    // Eliminación de los elementos del DOM asociados al nodo eliminado
    nodeToRemoveGroup.remove();

    // Eliminación de la posición del nodo eliminado
    positions.delete(prevLastNode);
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo en una posición especifica.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param nodesInvolved Objeto con información de los nodos involucrados en la eliminación. 
 * @param listData Objeto con información de los nodos y enlaces de la lista.
 * @param deletePosition Posición del nodo a eliminar dentro de la lista. 
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateRemoveAtPosition(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodesInvolved: { nodeToRemove: string, prevNode: string, nextNode: string },
    listData: {
        existingNodesData: ListNodeData<number>[],
        existingLinksData: LinkData[],
        showDoubleLinks: boolean,
        showTailIndicator: boolean,
        showCircularLinks: boolean
    },
    deletePosition: number,
    positions: Map<string, { x: number, y: number }>,
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Nodos implicados en la eliminación
  const { nodeToRemove, prevNode, nextNode } = nodesInvolved;

    // Información de la lista a renderizar
    const { existingNodesData, existingLinksData, showDoubleLinks, showTailIndicator, showCircularLinks } = listData;

    // Grupo del lienzo correspondiente al nodo a eliminar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${nodeToRemove}`);

  // Grupo del lienzo correspondiente al enlace siguiente formado entre el nodo anterior y el nodo siguiente al nodo a eliminar
  const prevToNextNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${prevNode}-${nextNode}-next`
  );

  // Estado visual inicial del enlace siguiente entre el nodo previo y el nodo siguiente al nodo a eliminar
  prevToNextNodeNextLinkGroup.select("path.node-link").style("opacity", 0);

  // Grupo del lienzo correspondiente al enlace previo formado entre el nodo siguiente y el nodo anterior al nodo a eliminar (solo para listas dobles)
  const nextToPrevNodePrevLinkGroup = showDoubleLinks
    ? svg.select<SVGGElement>(`g#link-${nextNode}-${prevNode}-prev`)
    : null;

    // Estado visual inicial del enlace previo entre el nodo siguiente y anterior del nodo a eliminar (solo para listas dobles)
    if (nextToPrevNodePrevLinkGroup) nextToPrevNodePrevLinkGroup.select("path.node-link").style("opacity", 0);

  // Nodos a recorrer para eliminar el nodo, depende si la lista es simple o doble
  const nodesToTraverse = existingNodesData.slice(
    0,
    !showDoubleLinks ? deletePosition : deletePosition + 1
  );

  // Definimos el nodo a seleccionar para iniciar la animación de eliminación, depende si la lista es simple o doble
  const nodeToHighlight = showDoubleLinks ? nodeToRemove : prevNode;

  for (const node of nodesToTraverse) {
    // Selección del grupo correspondiente al nodo actual
    const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

    // Selección del elemento a animar
    const nodeElement = nodeGroup.select("rect");

    // Resaltado del nodo actual
    await nodeElement
      .transition()
      .duration(700)
      .attr("stroke", "#f87171")
      .attr("stroke-width", 3)
      .end();

    // Restablecimiento del estilo original del nodo (excepto para el último nodo)
    if (node.id !== nodeToHighlight) {
      await nodeElement
        .transition()
        .duration(700)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();
    }
  }

  // Grupo del lienzo correspondiente al enlace siguiente del nodo previo que apunta al nodo a eliminar
  const prevToRemovalNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${prevNode}-${nodeToRemove}-next`
  );

  // Grupo del lienzo correspondiente al enlace siguiente del nodo a eliminar
  const removalNodeNextLinkGroup = svg.select<SVGGElement>(
    `g#link-${nodeToRemove}-${nextNode}-next`
  );

    // Grupo del lienzo correspondiente al enlace previo del nodo siguiente que apunta al nodo  a eliminar (solo para listas dobles)
    const nextToRemovalNodePrevLinkGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${nextNode}-${nodeToRemove}-prev`) : null;

    // Grupo del lienzo correspondiente al enlace previo del nodo a eliminar (solo para listas dobles)
    const removalNodePrevLinkGroup = showDoubleLinks ? svg.select<SVGGElement>(`g#link-${nodeToRemove}-${prevNode}-prev`) : null;

  // Posición de animación inicial del nodo a eliminar
  const initialRemovalNodePos = positions.get(nodeToRemove)!;

    // Posición de animación final del nodo a eliminar
    const initialYOffset = showCircularLinks ? -100 : -75;;
    const finalPos = { x: initialRemovalNodePos.x, y: initialRemovalNodePos.y + initialYOffset };

  // Posición inicial en x del nodo siguiente al nodo a eliminar
  const nextNodeInitialXPos =
    SVG_LINKED_LIST_VALUES.MARGIN_LEFT +
    (deletePosition + 1) *
      (SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH + SVG_LINKED_LIST_VALUES.SPACING);

  // Mapa temporal de posiciones para calular la forma final de los enlaces asociados al nodo a eliminar
  const tempPositions: Map<
    string,
    {
      x: number;
      y: number;
    }
  > = new Map(positions);
  tempPositions.set(nodeToRemove, finalPos);
  tempPositions.set(nextNode, {
    x: nextNodeInitialXPos,
    y: initialRemovalNodePos.y,
  });

  // Forma final de los enlaces siguientes asociados al nodo a eliminar
  const finalNextPathToRemovalNode = calculateLinkPath(
    { sourceId: prevNode, targetId: nodeToRemove, type: "next" },
    tempPositions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );
  const finalNextPathOfRemovalNode = calculateLinkPath(
    { sourceId: nodeToRemove, targetId: nextNode, type: "next" },
    tempPositions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );

  // Array de promesas para animaciones de desplazamiento del nodo a eliminar y sus enlaces
  const removalNodeShiftPromises: Promise<void>[] = [];

  // Promesas para desplazamiento de elementos básicos asociados al nodo a eliminar
  removalNodeShiftPromises.push(
    nodeToRemoveGroup
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
      .end()
  );

  removalNodeShiftPromises.push(
    prevToRemovalNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .attr("d", finalNextPathToRemovalNode)
      .end()
  );

  removalNodeShiftPromises.push(
    removalNodeNextLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .attr("d", finalNextPathOfRemovalNode)
      .end()
  );

  // Promesas para desplazamiento de enlaces previos asociados al nodo a eliminar (solo para listas dobles)
  if (removalNodePrevLinkGroup && nextToRemovalNodePrevLinkGroup) {
    const finalPrevPathToRemovalNode = calculateLinkPath(
      { sourceId: nextNode, targetId: nodeToRemove, type: "prev" },
      tempPositions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );
    const finalPrevPathOfRemovalNode = calculateLinkPath(
      { sourceId: nodeToRemove, targetId: prevNode, type: "prev" },
      tempPositions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );

    removalNodeShiftPromises.push(
      nextToRemovalNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1000)
        .ease(d3.easeQuadInOut)
        .attr("d", finalPrevPathToRemovalNode)
        .end()
    );

    removalNodeShiftPromises.push(
      removalNodePrevLinkGroup
        .select("path.node-link")
        .transition()
        .duration(1000)
        .ease(d3.easeQuadInOut)
        .attr("d", finalPrevPathOfRemovalNode)
        .end()
    );
  }

  // Resolución de las promesas para animación de movimiento de elementos asociados al nodo a eliminar
  await Promise.all(removalNodeShiftPromises);

  // Desconexión entre el nodo previo y el nodo a eliminar
  await prevToRemovalNodeNextLinkGroup
    .select("path.node-link")
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .end();
  prevToRemovalNodeNextLinkGroup.remove();

  // Forma inicial del enlace siguiente formado entre el nodo anterior y el nodo siguiente al nodo eliminado
  const initialNextPathToNextNode = calculateLinkPath(
    { sourceId: prevNode, targetId: nextNode, type: "next" },
    tempPositions,
    SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
    SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
  );
  await prevToNextNodeNextLinkGroup
    .select("path.node-link")
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .attr("d", initialNextPathToNextNode)
    .end();

  // Desconexión entre el nodo siguiente y el nodo a eliminar (solo para listas dobles)
  if (nextToRemovalNodePrevLinkGroup) {
    await nextToRemovalNodePrevLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .end();
    nextToRemovalNodePrevLinkGroup.remove();
  }

  // Forma inicial del enlace previo formado entre el nodo siguiente y el nodo anterior al nodo eliminado (solo para listas dobles)
  if (nextToPrevNodePrevLinkGroup) {
    const initialPrevPathToPrevNode = calculateLinkPath(
      { sourceId: nextNode, targetId: prevNode, type: "prev" },
      tempPositions,
      SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH,
      SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT
    );
    await nextToPrevNodePrevLinkGroup
      .select("path.node-link")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .attr("d", initialPrevPathToPrevNode)
      .end();
  }

  // Desconexión y salida del nodo a eliminar
  await removalNodeNextLinkGroup
    .select("path.node-link")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .end();

  if (removalNodePrevLinkGroup) {
    await removalNodePrevLinkGroup
      .select("path.node-link")
      .transition()
      .duration(500)
      .style("opacity", 0)
      .end();
  }

  await nodeToRemoveGroup.transition().duration(800).style("opacity", 0).end();

  // Eliminación de los elementos asociados al nodo eliminado en el DOM
  removalNodeNextLinkGroup.remove();
  if (removalNodePrevLinkGroup) removalNodePrevLinkGroup.remove();
  nodeToRemoveGroup.remove();

  // Eliminación de la posición del nodo eliminado
  positions.delete(nodeToRemove);

  // Nodos por acomodar luego de eliminar el nodo
  const nodesToMove = existingNodesData.slice(
    deletePosition,
    existingNodesData.length
  );

  // Array de promesas para acomodar nodos y enlaces restantes
  const shiftPromises: Promise<void>[] = [];

    // Selección de nodos que requieren posicionamiento (re-vinculación de datos)
    const remainingNodes = svg.selectAll<SVGGElement, ListNodeData<number>>("g.node")
        .data(nodesToMove, d => d.id);

  // Promesa para desplazamiento de nodos restantes a su posición final
  shiftPromises.push(
    remainingNodes
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr("transform", (d) => {
        const finalPos = positions.get(d.id)!;
        return `translate(${finalPos.x}, ${finalPos.y})`;
      })
      .end()
  );

  // Selección de enlaces restantes (re-vinculación de datos)
  const remainingLinks = svg
    .selectAll<SVGGElement, LinkData>("g.link")
    .data(
      existingLinksData,
      (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
    );

    // Promesa para desplazamiento de enlaces restantes a su posición final
    shiftPromises.push(
        remainingLinks.select("path.node-link")
            .transition()
            .duration(1500)
            .ease(d3.easeQuadInOut)
            .attr("d", d => d.type === "next" || d.type === "prev" ? calculateLinkPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT) : calculateCircularLPath(d, positions, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT))
            .end()
    );

  if (showTailIndicator) {
    // Grupo del lienzo correspondiente al indicador del nodo cola
    const tailIndicatorGroup = svg.select<SVGGElement>("g#tail-indicator");

    // Posición de animación final del indicador de cola
    const finalTailIndicatorPos = positions.get(
      existingNodesData[existingNodesData.length - 1].id
    )!;
    shiftPromises.push(
      tailIndicatorGroup
        .transition()
        .duration(1500)
        .ease(d3.easeQuadInOut)
        .attr("transform", () => {
          const finalX =
            finalTailIndicatorPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
          const finalY = finalTailIndicatorPos.y;
          return `translate(${finalX}, ${finalY})`;
        })
        .end()
    );
  }

    // Resolución de las promesas para animación de desplazamiento de nodos y enlaces restantes
    await Promise.all(shiftPromises);

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un elemento en la lista.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param elementToSearch Elemento a buscar en la lista. 
 * @param existingNodesData Array de nodos pertenecientes a la lista.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario. 
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateSearchElement(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    elementToSearch: number,
    existingNodesData: ListNodeData<number>[],
    resetQueryValues: () => void,
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Recorremos los nodos en busca de elemento especificado
  for (const node of existingNodesData) {
    // Selección del grupo del nodo actual
    const nodeGroup = svg.select<SVGGElement>(`g#${node.id}`);

    // Selección del elemento a animar
    const nodeElement = nodeGroup.select("rect");

    if (node.value === elementToSearch) {
      // Resaltado más fuerte del nodo
      await nodeElement
        .transition()
        .duration(800)
        .attr("stroke", "#f87171")
        .attr("stroke-width", 4)
        .end();

      // Restablecimiento mas prolongado del estilo original del nodo
      await nodeElement
        .transition()
        .duration(2000)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();

      break;
    }

    // Resaltado suave del nodo actual
    await nodeElement
      .transition()
      .duration(800)
      .attr("stroke", "#f87171")
      .attr("stroke-width", 2)
      .end();

    // Restablecimiento del estilo original del nodo
    await nodeElement
      .transition()
      .duration(700)
      .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
      .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
      .end();
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}