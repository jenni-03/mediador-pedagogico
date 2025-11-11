import { easeBounce, easeCubicInOut, easeQuad, select, Selection } from "d3";
import { SVG_SEQUENCE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";
import { type EventBus } from "../../events/eventBus";
import { getSecuenciaCode } from "../../constants/pseudocode/secuenciaCode";
import { Dispatch, SetStateAction } from "react";
import { delay } from "../simulatorUtils";

const seqCode = getSecuenciaCode();

/**
 * Función encargada de renderizar la estructura base de la secuencia.
 * @param svg Selección D3 del elemento SVG donde se van a renderizar los elementos.
 * @param secuencia Array de elementos a renderizar.
 * @param memoria Direcciones de memoria asociadas a cada elemento de la secuencia.
 * @param dims Dimensiones de los elementos dentro del lienzo.
 */
export function drawBaseSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  secuencia: (number | null)[],
  memoria: string[],
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  }
) {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Realizamos el data join usando el indice como key
  svg
    .selectAll<SVGGElement, number | null>("g.element")
    .data(secuencia, (_d, i) => i)
    .join(
      enter => {
        // Creación del grupo para cada nuevo elemento
        const gEnter = enter
          .append("g")
          .attr("class", "element")
          .attr("id", (_d, i) => `e-${i}`)
          .attr("transform", (_d, i) => {
            const x = margin.left + i * (elementWidth + spacing);
            const y = (height - elementHeight) / 2;
            return `translate(${x}, ${y})`;
          });

        // Rect principal
        const rect = gEnter
          .append("rect")
          .attr("class", "sequence-rect")
          .attr("width", 0)
          .attr("height", 0)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

        // Transición "lote" de rectángulos
        rect
          .transition()
          .duration(1000)
          .attr("width", elementWidth)
          .attr("height", elementHeight)
          .ease(easeQuad);

        // Valor del elemento (NULL al crear)
        const valueText = gEnter
          .append("text")
          .attr("class", "value")
          .attr("x", elementWidth / 2)
          .attr("y", elementHeight / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text("NULL")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
          .style("letter-spacing", "0.5px")
          .style("opacity", 0)

        valueText
          .transition()
          .duration(2000)
          .style("opacity", 1)
          .ease(easeQuad);

        // Bloque de dirección de memoria
        const memRect = gEnter
          .append("rect")
          .attr("class", "memory-container")
          .attr("y", elementHeight + 10)
          .attr("width", 0)
          .attr("height", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", SVG_STYLE_VALUES.MEMORY_FILL_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.MEMORY_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.MEMORY_STROKE_WIDTH)

        memRect
          .transition()
          .duration(1000)
          .attr("width", elementWidth)
          .attr("height", 20)
          .ease(easeQuad);

        // Dirección de memoria
        const memText = gEnter
          .append("text")
          .attr("class", "memory")
          .attr("x", elementWidth / 2)
          .attr("y", elementHeight + 25)
          .attr("text-anchor", "middle")
          .style("opacity", 0)
          .text((_d, i) => memoria[i])
          .attr("fill", SVG_STYLE_VALUES.MEMORY_TEXT_COLOR)
          .style("font-size", SVG_STYLE_VALUES.MEMORY_TEXT_SIZE)
          .style("font-weight", SVG_STYLE_VALUES.MEMORY_TEXT_WEIGHT)

        memText
          .transition()
          .duration(2000)
          .style("opacity", 1);

        // Índice del elemento
        gEnter
          .append("text")
          .attr("class", "index")
          .attr("x", elementWidth / 2)
          .attr("y", -15)
          .attr("text-anchor", "middle")
          .style("opacity", 0)
          .text((_d, i) => i)
          .attr("fill", SVG_SEQUENCE_VALUES.INDEX_TEXT_COLOR)
          .style("font-size", SVG_SEQUENCE_VALUES.INDEX_TEXT_SIZE)
          .style("font-weight", SVG_SEQUENCE_VALUES.INDEX_TEXT_WEIGHT)
          .transition()
          .duration(2000)
          .style("opacity", 1);

        return gEnter;
      },
      update => {
        // Actualización del rectángulo principal
        update
          .select("rect.sequence-rect")
          .attr("fill", (d) => (d === null ?
            SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR : SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR))
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          .attr("rx", 6)
          .attr("ry", 6);

        // Actualización del texto correspondiente al valor del elemento
        update
          .select("text")
          .text((d) => (d === null ? "NULL" : d.toString()))
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
          .style("letter-spacing", "0.5px");

        // Actualización del texto correspondiente a la dirección de memoria
        update.select("text.memory")
          .text((_d, i) => memoria[i]);

        return update;
      },
      exit => {
        // Transición para encoger el rectángulo principal
        exit.select("rect.sequence-rect")
          .transition()
          .duration(1000)
          .attr("width", 0)
          .attr("height", 0);

        // Transición para encoger el contenedor de memoria
        exit.select("rect.memory-container")
          .transition()
          .duration(1000)
          .attr("width", 0)
          .attr("height", 0);

        // Transición para desvanecimiento de todos los textos
        exit.selectAll("text")
          .transition()
          .duration(800)
          .style("opacity", 0);

        // Eliminación del grupo completo
        exit.transition()
          .delay(1200)
          .remove();

        return exit;
      }
    );
}

/**
 * Función encargada de animar el proceso de inserción de un nuevo elemento al final de la secuencia.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param insertionData Objeto con información de la secuencia necesaria para la animación.
 * @param dims Dimensiones de los elementos de la secuencia dentro del lienzo.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de las queries del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertionSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  insertionData: {
    insertionValue: number,
    insertionIndex: number
  },
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.insertLast.labels!;

  // Elementos implicados en la inserción
  const { insertionValue, insertionIndex } = insertionData;

  // Grupo del lienzo correspondiente al elemento a insertar
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${insertionIndex}`);

  // Posición de destino del nuevo elemento
  const destX = dims.margin.left + insertionIndex * (dims.elementWidth + dims.spacing);
  const destY = (dims.height - dims.elementHeight) / 2;

  // Posición de animación incial del nuevo elemento
  const startX = destX + dims.elementWidth / 2;
  const startY = 12;

  try {
    // Creación de un grupo temporal para el indicador de inserción
    const { group: insertionGroup, arrow } = createTemporaryArrowIndicator(
      svg,
      {
        groupId: "insertion-group",
        arrowClass: "insertion-arrow",
        arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
        fillColor: "#D72638",
        opacity: 0,
        initialX: destX + dims.elementWidth / 2,
        initialY: destY - 40
      }
    );

    // Inicio de la operación
    bus.emit("op:start", { op: "insertLast" });

    bus.emit("step:progress", { stepId: "insertLast", lineIndex: labels.IF_FULL });
    await delay(600);

    bus.emit("step:progress", { stepId: "insertLast", lineIndex: labels.ELSE });
    await delay(600);

    // Aparición del indicador de inserción
    bus.emit("step:progress", { stepId: "insertLast", lineIndex: labels.ASSIGN });
    await arrow.transition().delay(100).duration(700).style("opacity", 1).end();

    // Grupo que representa el elemento a insertar
    const newElement = insertionGroup
      .append("text")
      .attr("x", startX)
      .attr("y", startY)
      .attr("text-anchor", "middle")
      .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
      .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
      .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
      .style("letter-spacing", "0.5px")
      .text(insertionValue)
      .style("opacity", 0);

    // Aparición del elemento a insertar
    await newElement.transition().duration(800).style("opacity", 1).end();

    // Restablecimiento de estilos para el contenedor principal
    await targetGroup
      .select("text.value")
      .transition()
      .duration(500)
      .style("opacity", 0)
      .end();

    await targetGroup
      .select("rect.sequence-rect")
      .transition()
      .duration(500)
      .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
      .end();

    // Desplazamiento del nuevo elemento a la posición de destino
    await newElement
      .transition()
      .duration(1500)
      .attr("x", destX + dims.elementWidth / 2)
      .attr("y", destY + 38)
      .ease(easeCubicInOut)
      .end();

    // Desvanecimiento del indicador de inserción
    await arrow.transition().duration(800).style("opacity", 0).end();

    // Puesta del nuevo elemento dentro del contenedor principal
    targetGroup.select("text").text(insertionValue).style("opacity", 1);

    // Eliminación del grupo temporal de inserción
    insertionGroup.remove();

    // Fin de la operación
    bus.emit("op:done", { op: "insertLast" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar la eliminación de un elemento que requiere el desplazamiento de otros elementos.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se va aplicará la animación.
 * @param deletionData Objeto con información de la secuencia necesaria para la animación.
 * @param dims Dimensiones de los elementos de la secuencia dentro del lienzo.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de las queries del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteElementSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  deletionData: {
    sequence: (number | null)[],
    deleteIndexElement: number,
    firstNullIndex: number
  },
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.delete.labels!;

  // Elementos requeridos en la animación
  const { deleteIndexElement, firstNullIndex, sequence } = deletionData;

  // Grupo correspondiente al elemento de la secuencia que pasa a ser nulo
  const nullGroup = svg.select<SVGGElement>(`g#e-${firstNullIndex}`);

  try {
    // Creación de un grupo temporal para el indicador de eliminación
    const { group: deletionGroup, arrow } = createTemporaryArrowIndicator(
      svg,
      {
        groupId: "displacement-group",
        arrowClass: "displacement-arrow",
        arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
        fillColor: "#D72638",
        opacity: 0,
        initialX: dims.margin.left + deleteIndexElement * (dims.elementWidth + dims.spacing) + dims.elementWidth / 2,
        initialY: (dims.height - dims.elementHeight) / 2 - 40
      }
    );

    // Inicio de la operación
    bus.emit("op:start", { op: "delete" });

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_EMPTY });
    await delay(600);

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_RANGE });
    await delay(600);

    // Si el elemento a eliminar corresponde con el último elemento de la secuencia
    const yElemPos = (dims.height - dims.elementHeight) / 2 + 38;
    const yArrowPos = (dims.height - dims.elementHeight) / 2 - 40;

    deletionGroup.append("text")

    // Reasignación de valores para ocupar la posición del elemento a eliminar
    for (let i = deleteIndexElement; i < firstNullIndex; i++) {
      const currElementText = svg.select<SVGTextElement>(`g#e-${i} text.value`);
      const xCurrentElemPos = dims.margin.left + i * (dims.elementWidth + dims.spacing) + dims.elementWidth / 2;

      // Posicionamiento del indicador de recorrido
      bus.emit("step:progress", { stepId: "delete", lineIndex: labels.FOR });
      await arrow
        .transition()
        .duration(800)
        .style("opacity", 1)
        .attr("transform", `translate(${xCurrentElemPos}, ${yArrowPos})`)
        .ease(easeCubicInOut)
        .end();

      // Salida del valor actual del elemento
      bus.emit("step:progress", { stepId: "delete", lineIndex: labels.REASSING });
      await currElementText
        .transition()
        .duration(800)
        .style("opacity", 0)
        .end();

      // Posicionamiento inicial del nuevo valor del elemento
      const xNextElemPos = dims.margin.left + (i + 1) * (dims.elementWidth + dims.spacing) + dims.elementWidth / 2;
      const newElementValue = sequence[i] ?? "";
      deletionGroup
        .select("text")
        .attr("x", xNextElemPos)
        .attr("y", yElemPos)
        .attr("text-anchor", "middle")
        .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
        .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
        .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
        .text(newElementValue);

      // Desplazamiento del nuevo elemento de texto hacia el elemento actual
      await deletionGroup
        .selectAll("text")
        .transition()
        .duration(1500)
        .attr("x", function () {
          return +select(this).attr("x") - (dims.elementWidth + dims.spacing);
        })
        .ease(easeCubicInOut)
        .end();
      currElementText.text(newElementValue).style("opacity", 1);
    }

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.FOR });
    await delay(500);

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DELETE });
    if (deleteIndexElement === firstNullIndex) {
      // Aparición del indicador de eliminación
      await arrow.transition().duration(700).style("opacity", 1).end();
    }

    // Desvanecimiento del elemento a eliminar
    await nullGroup.select("text.value")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .ease(easeBounce)
      .end();

    // Cambio de fondo para el contenedor del elemento eliminado
    await nullGroup
      .select("rect.sequence-rect")
      .transition()
      .duration(500)
      .attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR)
      .end();

    // Texto resultante de la operación de eliminación
    await nullGroup.select("text")
      .transition()
      .duration(500)
      .text("NULL")
      .style("opacity", 1)
      .end();

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECREASE });

    // Desvanecimiento del indicador de eliminación
    await arrow.transition().duration(500).style("opacity", 0).end();

    // Limpieza de la capa overlay de desplazamiento
    deletionGroup.remove();

    // Fin de la operación
    bus.emit("op:done", { op: "delete" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de obtención de un elemento de la secuencia dada su posición.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param elementIndexToGet Indice del elemento a obtener.
 * @param dims Dimensiones de los elementos dentro del lienzo.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de las queries del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateGetElementSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  elementIndexToGet: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.get.labels!;

  // Grupo correspondiente al elemento objetivo
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${elementIndexToGet}`);

  // Posición del indicador de obtención
  const destX = dims.margin.left + elementIndexToGet * (dims.elementWidth + dims.spacing);
  const destY = (dims.height - dims.elementHeight) / 2;

  try {
    // Creación de un grupo temporal para el indicador de obtención
    const { group: getElementGroup, arrow } = createTemporaryArrowIndicator(
      svg,
      {
        groupId: "get-group",
        arrowClass: "get-arrow",
        arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
        fillColor: "#D72638",
        opacity: 0,
        initialX: destX + dims.elementWidth / 2,
        initialY: destY - 40
      }
    );

    // Inicio de la operación
    bus.emit("op:start", { op: "get" });

    bus.emit("step:progress", { stepId: "get", lineIndex: labels.IF_EMPTY });
    await delay(600);

    bus.emit("step:progress", { stepId: "get", lineIndex: labels.IF_RANGE });
    await delay(600);

    // Aparición del indicador de obtención
    bus.emit("step:progress", { stepId: "get", lineIndex: labels.RETURN_ELEM });
    await arrow.transition().duration(800).style("opacity", 1).end();

    // Resaltado del contenedor del elemento objetivo
    await targetGroup
      .select("rect.sequence-rect")
      .transition()
      .duration(800)
      .attr("stroke-width", 3)
      .transition()
      .delay(800)
      .duration(400)
      .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
      .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
      .end();

    // Desvanecimiento del indicador de obtención
    await arrow.transition().duration(800).style("opacity", 0).end();

    // Limpieza del grupo temporal de obtención
    getElementGroup.remove();

    // Fin de la operación
    bus.emit("op:done", { op: "get" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de actualización de un elemento existente dentro de la secuencia dada su posición.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param updateData Objeto con información de la secuencia necesaria para la animación.
 * @param dims Dimensiones de los elementos dentro del lienzo.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de las queries del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateUpdateSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  updateData: {
    newValue: number,
    pos: number
  },
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.set.labels!;

  // Elementos requeridos para la animación
  const { newValue, pos } = updateData;

  // Grupo correspondiente al elemento a actualizar
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${pos}`);

  // Posición de destino del nuevo elemento
  const destX = dims.margin.left + pos * (dims.elementWidth + dims.spacing);
  const destY = (dims.height - dims.elementHeight) / 2;

  // Posición incial del nuevo elemento
  const startX = destX + dims.elementWidth / 2;
  const startY = 12;

  try {
    // Creación de un grupo temporal para el indicador de actualización
    const { group: updatedGroup, arrow } = createTemporaryArrowIndicator(
      svg,
      {
        groupId: "update-group",
        arrowClass: "update-arrow",
        arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
        fillColor: "#D72638",
        opacity: 0,
        initialX: destX + dims.elementWidth / 2,
        initialY: destY - 40
      }
    );

    // Inicio de la operación
    bus.emit("op:start", { op: "set" });

    bus.emit("step:progress", { stepId: "set", lineIndex: labels.IF_RANGE });
    await delay(600);

    // Aparición del indicador de actualización
    bus.emit("step:progress", { stepId: "get", lineIndex: labels.UPDATE });
    await arrow.transition().delay(100).duration(700).style("opacity", 1).end();

    // Elemento de texto que representa el nuevo valor del elemento,
    // posicionado inicialmente justo arriba del indicador de actualización.
    const newElement = updatedGroup
      .append("text")
      .attr("x", startX)
      .attr("y", startY)
      .attr("text-anchor", "middle")
      .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
      .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
      .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
      .style("letter-spacing", "0.5px")
      .text(newValue.toString())
      .style("opacity", 0);

    // Aparición del grupo correspondiente al nuevo elemento
    await newElement.transition().duration(500).style("opacity", 1).end();

    // Desvanecimiento del texto original
    await targetGroup
      .select("text")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .end();

    // Desplazamiento del nuevo elemento al centro de la posición de destino
    await newElement
      .transition()
      .duration(1500)
      .attr("x", destX + dims.elementWidth / 2)
      .attr("y", destY + 38)
      .ease(easeCubicInOut)
      .end();

    // Desvanecimiento del indicador de actualización
    await arrow.transition().duration(800).style("opacity", 0).end();

    // Restablecimiento del valor del texto del contenedor principal
    targetGroup.select("text").text(newValue).style("opacity", 1);

    // Limpieza del grupo temporal de actualización
    updatedGroup.remove();

    // Fin de la operación
    bus.emit("op:done", { op: "set" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de búsqueda de un elemento dentro de la secuencia.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param valueToSearch Valor a buscar.
 * @param elements Cantidad de elementos existentes dentro de la secuencia.
 * @param dims Dimensiones de los elementos dentro del lienzo.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de las queries del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  valueToSearch: number,
  elements: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.search.labels!;

  // Posicionamiento inicial y creación del indicador de búsqueda
  const startX = dims.margin.left + dims.elementWidth / 2;
  const startY = (dims.height - dims.elementHeight) / 2 - 40;

  try {
    const { group: searchGroup, arrow } = createTemporaryArrowIndicator(
      svg,
      {
        groupId: "search-group",
        arrowClass: "search-arrow",
        arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
        fillColor: "#D72638",
        opacity: 0,
        initialX: startX,
        initialY: startY
      }
    );

    // Inicio de la operación
    bus.emit("op:start", { op: "search" });

    // Aparición del indicador de búsqueda
    await arrow
      .transition()
      .delay(100)
      .duration(700)
      .style("opacity", 1)
      .end();

    // Recorrido de los nodos en busca del elemento
    let found = false;
    for (let i = 0; i < elements; i++) {
      // Selección del grupo correspondiente al elemento actual
      const currentElement = svg.select<SVGGElement>(`g#e-${i}`);

      bus.emit("step:progress", { stepId: "search", lineIndex: labels.FOR });


      // Posicionamiento del indicador de recorrido
      const xPos = dims.margin.left + i * (dims.elementWidth + dims.spacing) + dims.elementWidth / 2;
      const yPos = (dims.height - dims.elementHeight) / 2 - 40;
      await arrow
        .transition()
        .duration(800)
        .attr("transform", `translate(${xPos}, ${yPos})`)
        .ease(easeCubicInOut)
        .end();

      bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF });
      await delay(600);

      // Verificación del elemento
      const d = currentElement.select("text.value").text();
      if (parseInt(d) === valueToSearch) {
        bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_TRUE });

        // Resaltado definitivo del elemento encontrado
        await currentElement
          .select("rect")
          .transition()
          .duration(500)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", 3)
          .transition()
          .duration(500)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          .end();

        found = true;
        break;
      }
    }

    if (!found) {
      bus.emit("step:progress", { stepId: "search", lineIndex: labels.FOR });
      await delay(500);

      bus.emit("step:progress", { stepId: "search", lineIndex: labels.RETURN_FALSE });
    }

    // Desvanecimiento del indicador de búsqueda y limpieza de la capa overlay
    await arrow.transition().duration(500).style("opacity", 0).end();
    searchGroup.remove();

    // Fin de la operación
    bus.emit("op:done", { op: "search" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada del proceso de limpieza de todos los elementos de la secuencia dentro del lienzo.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG a limpiar.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateClearSequence(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = seqCode.clean.labels!;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "clean" });

    bus.emit("step:progress", { stepId: "clean", lineIndex: labels.CLEAN_CANT });
    await delay(600);

    // Animación de salida de los elementos
    bus.emit("step:progress", { stepId: "clean", lineIndex: labels.CLEAN_VECTOR });
    await svg.selectAll("g.element")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .end();

    // Eliminación de los nodos del DOM
    svg.selectAll("g.element").remove();

    // Fin de la operación
    bus.emit("op:done", { op: "clean" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de crear un grupo con indicador de flecha temporal.
 * @param svg Selección D3 del elemento SVG donde se va a dibujar.
 * @param config Objeto de configuración para el indicador de flecha.
 * @returns Objeto que contiene los elementos correspondientes al grupo e indicador creado.
 */
function createTemporaryArrowIndicator(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  config: {
    groupId: string;
    arrowClass: string;
    arrowPathData: string;
    fillColor: string;
    opacity: number;
    initialX: number;
    initialY: number;
  }
) {
  // Creación/selección y limpieza del grupo temporal
  let group = svg.select<SVGGElement>(`g#${config.groupId}`);
  if (group.empty()) {
    group = svg.append("g").attr("id", config.groupId);
  }
  group.selectAll("*").remove();

  // Creación del elemento flecha indicatorio
  const arrow = group
    .append("path")
    .attr("class", config.arrowClass)
    .attr("d", config.arrowPathData)
    .attr("fill", config.fillColor)
    .attr("transform", `translate(${config.initialX}, ${config.initialY})`)
    .style("opacity", config.opacity);

  return { group, arrow };
}