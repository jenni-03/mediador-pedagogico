import * as d3 from "d3";
import { SVG_SEQUENCE_VALUES, SVG_STYLE_VALUES } from "../../constants/consts";

/**
 * Función encargada de renderizar la estructura base de la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param secuencia Secuencia a dibujar
 * @param memoria Direcciones de memoria asociadas a cada elemento de la secuencia
 * @param dims Dimensiones de los elementos dentro del lienzo
 */
export function drawBaseSequence(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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
  const groups = svg
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

        // Contenedor del elemento
        gEnter
          .append("rect")
          .attr("class", "sequence-rect")
          .attr("width", 0)
          .attr("height", 0)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          .transition()
          .duration(1000)
          .attr("width", elementWidth)
          .attr("height", elementHeight)
          .ease(d3.easeQuad);

        // Valor del elemento (NULL al crear)
        gEnter
          .append("text")
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
          .transition()
          .duration(2500)
          .style("opacity", 1)
          .ease(d3.easeQuad);

        // Bloque de dirección de memoria
        gEnter
          .append("rect")
          .attr("class", "memory-container")
          .attr("y", elementHeight + 10)
          .attr("width", 0)
          .attr("height", 0)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", SVG_STYLE_VALUES.MEMORY_FILL_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.MEMORY_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.MEMORY_SRTOKE_WIDTH)
          .transition()
          .duration(1000)
          .attr("width", elementWidth)
          .attr("height", 20)
          .ease(d3.easeQuad);

        // Dirección de memoria
        gEnter
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
          .transition()
          .duration(2500)
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
          .duration(2500)
          .style("opacity", 1);

        return gEnter;
      },
      update => {
        // Actualización del rectángulo principal
        update
          .select("rect.sequence-rect")
          .attr("fill", (d) => (d === null ?
            SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR : SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR))
          .attr("stroke", "#D72638")
          .attr("stroke-width", 1.2)
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
          .duration(600)
          .attr("width", 0)
          .attr("height", 0);

        // Transición para encoger el contenedor de memoria
        exit.select("rect.memory-container")
          .transition()
          .duration(600)
          .attr("width", 0)
          .attr("height", 0);

        // Transición para desvanecimiento de todos los textos
        exit.selectAll("text")
          .transition()
          .duration(500)
          .style("opacity", 0);

        // Eliminación del grupo completo
        exit.transition()
          .delay(600)
          .remove();

        return exit;
      }
    );

  return groups;
}

/**
 * Función encargada de animar la inserción de un nuevo elemento a la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param insertionValue Valor a insertar
 * @param insertionIndex Indice del elemento donde se va a insertar el nuevo valor
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateInsertionSequence(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  insertionValue: number,
  insertionIndex: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Grupo del lienzo correspondiente al elemento insertado
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${insertionIndex}`);

  // Posición de destino del nuevo elemento
  const destX = margin.left + insertionIndex * (elementWidth + spacing);
  const destY = (height - elementHeight) / 2;

  // Posición incial del nuevo elemento
  const startX = destX + elementWidth / 2;
  const startY = 12;

  // Restablecimiento del estado visual del grupo donde se va a insertar el elemento
  targetGroup.select("text").text("");
  targetGroup.select("rect.sequence-rect").attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR);

  // Creación o reutilización de un grupo temporal para la inserción
  const { group: insertionGroup, arrow } = createTemporaryArrowIndicator(
    svg,
    {
      groupId: "insertion-group",
      arrowClass: "insertion-arrow",
      arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
      fillColor: "#D72638",
      opacity: 0,
      initialX: destX + elementWidth / 2,
      initialY: destY - 40
    }
  );

  // Transición del elemento flecha para que aparezca
  await arrow.transition().delay(100).duration(1000).style("opacity", 1).end();

  // Elemento de texto que representa el valor a insertar
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

  // Transición para la aparición del valor a insertar
  await newElement.transition().duration(1000).style("opacity", 1).end();

  // Transición para el resaltado del contenedor donde se va a insertar el nuevo elemento
  await targetGroup
    .select("rect.sequence-rect")
    .transition()
    .duration(500)
    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
    .attr("stroke-width", 3)
    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
    .end();

  // Transición para el desplazamiento del nuevo elemento al centro de la posición de destino
  await newElement
    .transition()
    .duration(2000)
    .attr("x", destX + elementWidth / 2)
    .attr("y", destY + 38)
    .ease(d3.easeCubicInOut)
    .end();

  // Desvanecimiento del indicador de inserción
  await arrow.transition().duration(500).style("opacity", 0).end();

  // Restablecimiento del valor del texto del contenedor principal
  targetGroup.select("text").text(insertionValue);

  // Eliminación del grupo temporal de inserción
  insertionGroup.remove();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación del ultimo elemento con valor dentro de la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param deletedValue Valor del elemento eliminado
 * @param deletedIndex Indice del elemento eliminado
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateDeleteLastElementSequence(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  deletedValue: number,
  deletedIndex: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Grupo del lienzo correspondiente al ultimo elemento con valor de la secuencia
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${deletedIndex}`);

  // Posición del elemento a eliminar
  const destX = margin.left + deletedIndex * (elementWidth + spacing);
  const destY = (height - elementHeight) / 2;

  // Restablecimiento del texto original del contenedor del elemento eliminado
  targetGroup.select("text").text(deletedValue);

  // Restablecimiento del color original de fondo para el contenedor del elemento eliminado
  targetGroup
    .select("rect.sequence-rect")
    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR);

  // Creación o reutilización de un grupo temporal para la eliminación
  const { group: deleteGroup, arrow } = createTemporaryArrowIndicator(
    svg,
    {
      groupId: "delete-group",
      arrowClass: "deletion-arrow",
      arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
      fillColor: "#D72638",
      opacity: 0,
      initialX: destX + elementWidth / 2,
      initialY: destY - 40
    }
  );

  // Transición de aparición del elemento flecha
  await arrow.transition().delay(100).duration(1000).style("opacity", 1).end();

  // Desvanecimiento del texto original
  await targetGroup
    .select("text")
    .transition()
    .duration(1500)
    .ease(d3.easeBounce)
    .style("opacity", 0)
    .end();

  // Transición para el cambio de fondo del contenedor del elemento eliminado
  await targetGroup
    .select("rect.sequence-rect")
    .transition()
    .duration(1000)
    .ease(d3.easeBounce)
    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR)
    .end();

  // Restablecimiento del texto resultante de la operación de eliminación
  await targetGroup.select("text")
    .transition()
    .duration(500)
    .text("NULL")
    .style("opacity", 1)
    .end();

  // Desvanecimiento del indicador de eliminación
  await arrow.transition().duration(500).style("opacity", 0).end();

  // Limpieza del grupo temporal de eliminación
  deleteGroup.remove();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un elemento que requiere el desplazamiento de otros elementos
 * @param svg Lienzo en el que se va a dibujar
 * @param prevSequence Estado previo de la secuencia
 * @param deletedIndexElement Indice del elemento eliminado
 * @param firstNullIndex Indice del elemento que termina sin valor
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateDeleteElementWithDisplacement(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  prevSequence: (number | null)[],
  deletedIndexElement: number,
  firstNullIndex: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Grupos afectados cuyo índice esté entre deletedIndexElement y firstNullIndex
  const affectedGroups = svg.selectAll<SVGGElement, number | null>("g.element")
    .filter((_d, i) => i >= deletedIndexElement && i <= firstNullIndex);

  // Grupo correspondiente al elemento que pasa a ser nulo
  const nullGroup = svg.select<SVGGElement>(`g#e-${firstNullIndex}`);

  // Ocultamos el texto de los elementos originales afectados
  affectedGroups.select("text").style("opacity", 0);

  // Restablecimiento del color original al grupo que termina sin valor
  nullGroup
    .select("rect")
    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);

  // Creación o reutilización de una capa overlay para animar el desplazamiento
  const { group: displacementGroup, arrow } = createTemporaryArrowIndicator(
    svg,
    {
      groupId: "displacement-group",
      arrowClass: "displacement-arrow",
      arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
      fillColor: "#D72638",
      opacity: 0,
      initialX: margin.left + deletedIndexElement * (elementWidth + spacing) + elementWidth / 2,
      initialY: (height - elementHeight) / 2 - 40
    }
  );

  // Uso del estado previo de la secuencia para construir el overlay
  // Por cada índice afectado, posicionamos un <text> en el overlay con el valor correspondiente.
  for (let i = deletedIndexElement; i <= firstNullIndex; i++) {
    const xPos = margin.left + i * (elementWidth + spacing) + elementWidth / 2;
    const yPos = (height - elementHeight) / 2 + 38;
    const value = prevSequence[i] ?? "";
    displacementGroup
      .append("text")
      .attr("x", xPos)
      .attr("y", yPos)
      .attr("text-anchor", "middle")
      .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
      .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
      .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
      .text(value);
  }

  // Transición para la aparición del elemento flecha
  await arrow.transition().delay(100).duration(1000).style("opacity", 1).end();

  // Obtención del elemento de texto dentro del overlay correspondiente al elemento a eliminar
  const textElements = displacementGroup.selectAll("text").nodes();
  const deletedTextElement = d3.select(textElements[0]);

  // Transición de desvanecimiento del texto a eliminar
  await deletedTextElement
    .transition()
    .duration(1500)
    .style("opacity", 0)
    .ease(d3.easeBounce)
    .end();

  // Desplazamiento de los elementos de texto dentro del overlay hacia la izquierda
  await displacementGroup
    .selectAll("text")
    .transition()
    .duration(2500)
    .attr("x", function () {
      return +d3.select(this).attr("x") - (elementWidth + spacing);
    })
    .ease(d3.easeBackInOut)
    .end();

  // Restablecimiento del color del contenedor del grupo que termina sin valor
  await nullGroup
    .select("rect")
    .transition()
    .duration(1000)
    .attr("fill", SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR)
    .ease(d3.easeBounce)
    .end();

  // Restablecimiento de la opacidad a los elementos de texto originales
  await affectedGroups.select("text")
    .transition()
    .duration(500)
    .style("opacity", 1)
    .end();

  // Desvanecimiento del indicador de eliminación
  await arrow.transition().duration(500).style("opacity", 0).end();

  // Limpieza del grupo de inserción
  displacementGroup.remove();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Fin de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la actualización de un elemento existente dentro de la secuencia
 * @param svg Lienzo en el que se va a dibujar
 * @param oldValue Valor del elemento antes de ser actualizado
 * @param newValue Valor del elemento luego de ser actualizado
 * @param pos Posición del elemento dentro de la secuencia que se va a actualizar
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateUpdateSequence(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  oldValue: number,
  newValue: number,
  pos: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Grupo correspondiente al elemento actualizado
  const targetGroup = svg
    .select<SVGGElement>(`g#e-${pos}`);

  // Posición de destino del nuevo elemento
  const destX = margin.left + pos * (elementWidth + spacing);
  const destY = (height - elementHeight) / 2;

  // Posición incial del nuevo elemento
  const startX = destX + elementWidth / 2;
  const startY = 12;

  // Restablecimiento del valor original del texto del contenedor donde se va a actualizar el elemento
  targetGroup.select("text").text(oldValue);

  // Creación o reutilización de un grupo temporal para la actualización
  const { group: updatedGroup, arrow } = createTemporaryArrowIndicator(
    svg,
    {
      groupId: "update-group",
      arrowClass: "update-arrow",
      arrowPathData: "M0,0 L-9.5, -10 L-4, -10 L-4, -20 L4, -20 L4, -10 L9.5, -10 Z",
      fillColor: "#D72638",
      opacity: 0,
      initialX: destX + elementWidth / 2,
      initialY: destY - 40
    }
  );

  // Transición del elemento flecha para que aparezca
  await arrow.transition().delay(100).duration(1000).style("opacity", 1).end();

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

  // Transición para la aparición del texto correspondiente al nuevo valor
  await newElement.transition().duration(1000).style("opacity", 1).end();

  // Transición para el resaltado del contenedor a actualizar
  await targetGroup
    .select("rect.sequence-rect")
    .transition()
    .duration(500)
    .attr("stroke-width", 3)
    .end();

  // Desvanecimiento del texto original
  await targetGroup
    .select("text")
    .transition()
    .duration(1000)
    .style("opacity", 0)
    .end();

  // Transición para el desplazamiento del nuevo elemento al centro de la posición de destino
  await newElement
    .transition()
    .duration(2000)
    .attr("x", destX + elementWidth / 2)
    .attr("y", destY + 38)
    .ease(d3.easeCubicInOut)
    .end();

  // Desvanecimiento del indicador de actualización
  await arrow.transition().duration(500).style("opacity", 0).end();

  // Restablecimiento del valor del texto del contenedor principal
  targetGroup.select("text").text(newValue).style("opacity", 1);

  // Limpieza del grupo temporal de actualización
  updatedGroup.remove();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un elemento dentro de la secuencia
 * @param svg Lienzo donde se va a aplicar la animación
 * @param valueToSearch Valor a buscar
 * @param dims Dimensiones de los elementos dentro del lienzo
 * @param resetQueryValues Función que restablece los valores de las queries del usuario
 * @param setIsAnimating Función que establece el estado de animación
 */
export async function animateSearchSequence(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  valueToSearch: number,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    spacing: number;
    height: number;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, spacing, height } = dims;

  // Selección de los elementos
  const elements = svg.selectAll("g.element");

  // Restablecimiento de los bordes y fondos de los contenedores antes de iniciar la animación
  elements
    .select("rect.sequence-rect")
    .attr("fill", (d) => (d === null ?
      SVG_STYLE_VALUES.RECT_FILL_FIRST_COLOR : SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR))
    .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

  // Posición inicial de la flecha (justo arriba del primer elemento)
  const startX = margin.left + elementWidth / 2;
  const startY = (height - elementHeight) / 2 - 40;

  // Creación o reutilización de un grupo temporal para la flecha indicatoria
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

  // Transición de aparición para el indicador
  await arrow
    .transition()
    .duration(1000)
    .style("opacity", 1)
    .end();

  // Variable de control
  let found = false;

  // Obtención de los nodos de los elementos en forma de array
  const elementsNodes = elements.nodes();

  // Recorremos cada elemento de forma secuencial
  for (let i = 0; i < elementsNodes.length; i++) {
    // Si se encuentra el elemento detenemos la ejecución
    if (found) break;

    // Calculo de la posición actual del elemento
    const xPos = margin.left + i * (elementWidth + spacing) + elementWidth / 2;
    const yPos = (height - elementHeight) / 2 - 40;

    // Transición de la flecha indicatoria a la posición del elemento actual
    await arrow
      .transition()
      .duration(1000)
      .attr("transform", `translate(${xPos}, ${yPos})`)
      .ease(d3.easeCubicInOut)
      .end();

    // Resaltado breve del rectángulo del elemento actual
    const currentElement = d3.select(elementsNodes[i]);
    await currentElement
      .select("rect")
      .transition()
      .duration(600)
      .attr("stroke", "#f87171")
      .attr("stroke-width", 2)
      .transition()
      .duration(600)
      .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
      .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
      .end();

    // Data vinculada al elemento actual
    const d = currentElement.datum();

    if (d === valueToSearch) {
      // Resaltado definitivo del elemento encontrado
      await currentElement
        .select("rect")
        .transition()
        .duration(500)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", 3)
        .end();
      found = true;
      break;
    }
  }

  // Desvanecimiento de la flecha indicatoria y limpieza de la capa overlay
  await arrow.transition().duration(1000).style("opacity", 0).end();
  searchGroup.remove();

  // Restablecimiento de las consultas del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de crear un grupo con indicador de flecha temporal
 * @param svg Lienzo en el que se va a dibujar 
 * @param config Objeto de configuración para el indicador de flecha
 * @returns Objeto que contiene los elementos correspondientes al grupo e indicador creado
 */
function createTemporaryArrowIndicator(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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