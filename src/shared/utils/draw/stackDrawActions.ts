import { StackNodeData } from "../../../domain/utils/types";
import { easeBackInOut, easeBounce, easeCubicInOut, type Selection } from "d3";
import {
  SVG_QUEUE_VALUES,
  SVG_STACK_VALUES,
  SVG_STYLE_VALUES,
} from "../../../domain/constants/consts";
import type { EventBus } from "../../events/eventBus";
import { getPilaCode } from "../../../domain/constants/pseudocode/pilaCode";
import { delay } from "../../../domain/utils/simulatorUtils";
import { Dispatch, SetStateAction } from "react";

const stackCode = getPilaCode();

/**
 * Función encargada de renderizar los nodos de la pila.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param pushNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
export function drawStackNodes(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
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
  const {
    margin,
    elementWidth,
    elementHeight,
    verticalSpacing,
    height,
    nodesHeight,
  } = dims;

  // Verificamos si hay un espacio adicional para animación en la parte superior
  const animationSpace = Math.max(0, height - nodesHeight);

  // Data join para el renderizado de los nodos
  svg
    .selectAll<SVGGElement, StackNodeData>("g.node")
    .data(pushNodes, (d) => d.id)
    .join(
      (enter) => {
        // Creación de los grupos para cada nuevo nodo
        const gEnter = enter
          .append("g")
          .attr("class", "node")
          .attr("id", (d) => d.id)
          .attr("transform", (d, i) => {
            // Cálculo de la posición del nodo
            const x = margin.left;
            const y =
              SVG_STACK_VALUES.MARGIN_TOP +
              animationSpace +
              i * verticalSpacing;
            positions.set(d.id, { x, y });
            return `translate(${x}, ${y})`;
          });

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
        const valueSection = gEnter.append("g").attr("class", "value-section");

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
        update.each((d, i) => {
          const x = margin.left;
          const y =
            SVG_STACK_VALUES.MARGIN_TOP + animationSpace + i * verticalSpacing;
          positions.set(d.id, { x, y });
        });

        return update;
      },
      (exit) => exit
    );
}

/**
 * Función encargada de animar el proceso de entrada de un nuevo nodo en la Pila.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param nodeStacked ID del nodo apilado.
 * @param remainingNodesData Array con información de los nodos previo a la apilación.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animatePushNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodeStacked: string,
  remainingNodesData: StackNodeData[],
  positions: Map<string, { x: number; y: number }>,
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = stackCode.push.labels!;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "push" });

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
      y: topMargin,
    };

    // Estado visual inicial para el nuevo nodo
    newNodeGroup
      .style("opacity", 0)
      .attr("transform", `translate(${initialPos.x}, ${initialPos.y})`);

    // Aparición del nuevo nodo
    bus.emit("step:progress", { stepId: "push", lineIndex: labels.CREATE_NODE });
    await newNodeGroup
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .ease(easeCubicInOut)
      .end();

    bus.emit("step:progress", { stepId: "push", lineIndex: labels.VALIDATE_EMPTY });
    await delay(600);

    // En caso de haber mas nodos dentro de la pila
    if (remainingNodesData.length > 0) {
      bus.emit("step:progress", { stepId: "push", lineIndex: labels.ELSE_EMPTY });
      await delay(600);

      // Salida del indicador de tope
      bus.emit("step:progress", { stepId: "push", lineIndex: labels.LINK_NEW_TO_PREV_TOP });
      await topeIndicatorGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();

      // Selección de nodos existentes (re-vinculación de datos)
      const remainingNodes = svg
        .selectAll<SVGGElement, StackNodeData>("g.node")
        .data(remainingNodesData, (d) => d.id);

      // Desplazamiento de nodos existentes a su posición final
      await remainingNodes
        .transition()
        .duration(1500)
        .ease(easeCubicInOut)
        .attr("transform", (d) => {
          const finalPos = positions.get(d.id)!;
          return `translate(${finalPos.x}, ${finalPos.y})`;
        })
        .end();

      bus.emit("step:progress", { stepId: "push", lineIndex: labels.ASSIGN_NEW_TOP });
    } else {
      bus.emit("step:progress", { stepId: "push", lineIndex: labels.ASSIGN_TOP_EMPTY });
    }

    // Movimiento del nuevo nodo a su posición final
    await newNodeGroup
      .transition()
      .duration(1500)
      .ease(easeCubicInOut)
      .attr("transform", `translate(${finalPos.x}, ${finalPos.y})`)
      .end();

    // Entrada del indicador tope
    await topeIndicatorGroup
      .transition()
      .duration(1000)
      .ease(easeBounce)
      .style("opacity", 1)
      .end();

    bus.emit("step:progress", { stepId: "push", lineIndex: labels.INC_SIZE });
    await delay(600);

    // Fin de la operación
    bus.emit("op:done", { op: "push" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de salida de un nodo de la pila.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param nodeIdPop Id del nodo desapilado.
 * @param remainingNodesData Array con información de los nodos restantes de la pila.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animatePopNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodeIdPop: string,
  remainingNodesData: StackNodeData[],
  positions: Map<string, { x: number; y: number }>,
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = stackCode.pop.labels!;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "pop" });

    // Grupo del lienzo correspondiente al elemento a desapilar
    const nodeToRemoveGroup = svg.select<SVGGElement>(`g#${nodeIdPop}`);

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const topeIndicatorGroup = svg.select<SVGGElement>("g#tope-indicator");

    // Movimiento del nodo a desapilar
    const nodeMoveOffsetY = -SVG_QUEUE_VALUES.ELEMENT_WIDTH * 0.8;

    bus.emit("step:progress", { stepId: "pop", lineIndex: labels.VALIDATE_EMPTY });
    await delay(600);

    bus.emit("step:progress", { stepId: "pop", lineIndex: labels.SAVE_TOP });
    await delay(600);

    // Salida del nodo a eliminar
    bus.emit("step:progress", { stepId: "pop", lineIndex: labels.ADVANCE_TOP });
    await nodeToRemoveGroup
      .transition()
      .ease(easeBackInOut)
      .duration(1500)
      .attr("transform", () => {
        const currentPos = positions.get(nodeIdPop);
        const x = currentPos?.x ?? 0;
        const y = (currentPos?.y ?? 0) + nodeMoveOffsetY;
        return `translate(${x}, ${y})`;
      })
      .style("opacity", 0)
      .remove()
      .end();

    // Salida del indicador de tope
    await topeIndicatorGroup
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .end();

    // Si hay nodos por mover
    if (remainingNodesData.length > 0) {
      // Selección de nodos restantes (re-vinculación de datos)
      const remainingNodes = svg
        .selectAll<SVGGElement, StackNodeData>("g.node")
        .data(remainingNodesData, (d) => d.id);

      // Desplazamiento de nodos restantes a su posición final
      await remainingNodes
        .transition()
        .duration(1500)
        .ease(easeCubicInOut)
        .attr("transform", (d) => {
          const finalPos = positions.get(d.id)!;
          return `translate(${finalPos.x}, ${finalPos.y})`;
        })
        .end();

      // Entrada del indicador de tope
      await topeIndicatorGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
    }

    bus.emit("step:progress", { stepId: "pop", lineIndex: labels.DEC_SIZE });
    await delay(600);

    bus.emit("step:progress", { stepId: "pop", lineIndex: labels.RETURN_VALUE });
    await delay(600);

    // Eliminación de la posición del nodo decolado
    positions.delete(nodeIdPop);

    // Fin de la operación
    bus.emit("op:done", { op: "pop" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de eliminar todos los nodos dentro del lienzo.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la limpieza.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateClearStack(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodePositions: Map<string, { x: number; y: number }>,
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = stackCode.clean.labels!;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "clean" });

    // Grupo del lienzo correspondiente al indicador del elemento tope
    const topeIndicatorGroup = svg.select<SVGGElement>("g#tope-indicator");

    // Salida del indicador de tope
    bus.emit("step:progress", { stepId: "clean", lineIndex: labels.CLEAR_TOP });
    await topeIndicatorGroup
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()
      .end();

    // Animacición de salida de los nodos
    bus.emit("step:progress", { stepId: "clean", lineIndex: labels.RESET_SIZE });
    await svg
      .selectAll("g.node")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()
      .end();

    // Limpieza del mapa de posiciones
    nodePositions.clear();

    // Fin de la operación
    bus.emit("op:done", { op: "clean" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}