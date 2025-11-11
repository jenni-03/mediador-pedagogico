import type { Dispatch, SetStateAction } from "react";
import {
  HierarchyNodeData,
  HintContent,
  HintOptions,
  HintTarget,
  IndicatorPositioningConfig,
  ListLinkData,
  LinkPathFn,
  ListNodeData,
  TraversalNodeType,
  TreeLinkData,
  TreeTraversalAnimOptions
} from "../../../types";
import {
  SVG_BINARY_TREE_VALUES,
  SVG_LINKED_LIST_VALUES,
  SVG_STYLE_VALUES,
} from "../../constants/consts";
import { type HierarchyNode, type Selection, easePolyInOut } from "d3";
import { straightPath } from "../treeUtils";
import { buildListPath } from "../listUtils";
import { type EventBus } from "../../events/eventBus";
import { delay } from "../simulatorUtils";

/**
 * Función encargada de renderizar un indicador de flecha dentro del lienzo.
 * @param svg Selección D3 del elemento SVG donde se va a renderizar el indicador.
 * @param indicatorId Identificador del indicador.
 * @param indicatorClass Selector de clase del indicador.
 * @param nodePosition Posición del nodo al que apunta el indicador.
 * @param styleConfig Configuración de estilos para el indicador.
 * @param groupPositioningTransform Transformación de posicionamiento del grupo.
 * @param dims Dimensiones del elemento.
 */
export function drawArrowIndicator(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  indicatorId: string,
  indicatorClass: string,
  nodePosition: { x: number; y: number } | null,
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
  dims: { elementWidth: number; elementHeight: number }
) {
  // Posicionamiento del indicador
  const indicatorData = nodePosition ? [nodePosition] : [];

  // Data join para la creación del indicador
  svg
    .selectAll<SVGGElement, { x: number; y: number }>(`g.${indicatorClass}`)
    .data(indicatorData, () => indicatorId)
    .join(
      (enter) => {
        // Creación del grupo para el indicador (oculto inicialmente)
        const gEnter = enter
          .append("g")
          .attr("id", indicatorId)
          .attr("class", indicatorClass)
          .style("opacity", 0);

        // Elemento de texto
        gEnter
          .append("text")
          .attr("class", `${indicatorClass}-text`)
          .attr("text-anchor", "middle")
          .attr("fill", styleConfig.textColor)
          .attr("font-size", styleConfig.fontSize)
          .attr("font-weight", styleConfig.fontWeight)
          .attr("x", styleConfig.textRelativeX ?? 0)
          .attr("y", styleConfig.textRelativeY)
          .text(styleConfig.text);

        // Elemento de flecha
        gEnter
          .append("path")
          .attr("class", `${indicatorClass}-arrow`)
          .attr("d", styleConfig.arrowPathData)
          .attr("fill", styleConfig.arrowColor)
          .attr("transform", styleConfig.arrowTransform)
          .attr("stroke", "black")
          .attr("stroke-width", 0.5);

        // Establecimiento de la posición inicial del grupo
        gEnter
          .transition()
          .attr("transform", (d) =>
            groupPositioningTransform.calculateTransform(d, dims)
          );

        return gEnter;
      },
      (update) => update,
      (exit) => exit
    );
}

/**
 * Función encargada de renderizar los nodos de un árbol dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawTreeNodes(
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  positions: Map<string, { x: number; y: number }>
) {
  // Data join para la creación de los nodos
  g.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id)
    .join(
      enter => {
        // Creación del grupo para cada nodo entrante
        const gEnter = enter
          .append("g")
          .attr("class", "node")
          .attr("id", (d) => d.data.id)
          .attr("transform", (d) => {
            const x = d.x!;
            const y = d.y!;
            positions.set(d.data.id, { x, y });
            return `translate(${x}, ${y})`;
          });

        // Contenedor del nodo
        gEnter
          .append("circle")
          .attr("class", "node-container")
          .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

        // Valor del nodo
        gEnter
          .append("text")
          .attr("class", "node-value")
          .attr("text-anchor", "middle")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .text((d) => d.data.value ?? 0);

        return gEnter;
      },
      update => {
        // Guarda la posición actualizada para cada nodo presente en el DOM
        update.each((d) => {
          positions.set(d.data.id, { x: d.x!, y: d.y! });
        });

        // Actualizar colores del contenedor en caso de haber cambiado
        update
          .select(".node-container")
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

        return update;
      },
      exit => exit
    );
}

/**
 * Función encargada de renderizar los enlaces entre nodos de un árbol dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los enlaces del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawTreeLinks(
  g: Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number, y: number }>,
) {
  // Data join para la creación de los enlaces entre nodos
  g.selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, d => `link-${d.sourceId}-${d.targetId}`)
    .join(
      enter => {
        // Creación del grupo para cada nuevo enlace
        const gLink = enter.append("g")
          .attr("class", "link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`);

        // Path del enlace
        gLink.append("path")
          .attr("class", `tree-link`)
          .attr("fill", "none")
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", 1.5)
          .attr("d", d => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
            return `M${s.x},${s.y + r} L${t.x},${t.y - r}`;
          });

        return gLink;
      },
      update => update,
      exit => exit
    )
}

/**
 * Función encargada de renderizar los nodos de una lista dentro del lienzo.
 * @param nodesLayer Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos de la lista.
 * @param listNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawListNodes(
  nodesLayer: Selection<SVGGElement, unknown, null, undefined>,
  listNodes: ListNodeData<number>[],
  positions: Map<string, { x: number; y: number }>,
  dims: {
    margin: { left: number; right: number };
    elementWidth: number;
    elementHeight: number;
    nodeSpacing: number;
    height: number;
  }
) {
  // Dimensiones del lienzo
  const { margin, elementWidth, elementHeight, nodeSpacing, height } = dims;

  // Data join para la creación de los nodos
  nodesLayer.selectAll<SVGGElement, ListNodeData<number>>("g.node")
    .data(listNodes, (d) => d.id)
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
        gEnter
          .append("rect")
          .attr("class", "node-container")
          .attr("width", elementWidth)
          .attr("height", elementHeight)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH);

        // Valor del nodo
        gEnter
          .append("text")
          .attr("class", "node-value")
          .attr("x", elementWidth / 2)
          .attr("y", elementHeight / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_STYLE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_STYLE_VALUES.ELEMENT_TEXT_SIZE)
          .text((d) => d.value)
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
        update
          .select(".node-container")
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
 * @param linksLayer Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los enlaces de la lista.
 * @param linksData Array con información de los enlaces a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param elementWidth Ancho del nodo.
 * @param elementHeight Alto del nodo.
 */
export function drawListLinks(
  linksLayer: Selection<SVGGElement, unknown, null, undefined>,
  linksData: ListLinkData[],
  positions: Map<string, { x: number; y: number }>,
  elementWidth: number,
  elementHeight: number
) {
  // Data join para la creación de los enlaces entre nodos
  linksLayer.selectAll<SVGGElement, ListLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`)
    .join(
      enter => {
        // Creación del grupo para cada nuevo enlace
        const gLink = enter
          .append("g")
          .attr("class", "link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`);

        // Path del enlace
        gLink
          .append("path")
          .attr("class", (d) => `node-link ${d.type}`)
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("marker-end", "url(#arrowhead)")
          .attr("d", (d) => {
            const sourcePos = positions.get(d.sourceId);
            const targetPos = positions.get(d.targetId);
            return buildListPath(
              d.type,
              sourcePos ?? null,
              targetPos ?? null,
              elementWidth,
              elementHeight
            );
          });

        return gLink;
      },
      update => update,
      exit => exit
    );
}

/**
 * Función encargada de renderizar la secuencia de valores de nodos para el recorrido del árbol.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se va a renderizar la secuencia de valores de recorrido.
 * @param values Arreglo de objetos que representan la secuencia a mostrar.
 * @param opts Objeto de configuración que contiene el posicionamiento y desplazamiento de los elementos del árbol.
 */
export function drawTraversalSequence(
  g: Selection<SVGGElement, unknown, null, undefined>,
  values: TraversalNodeType[],
  opts: {
    seqPositions: Map<string, { x: number; y: number }>;
    nodePositions: Map<string, { x: number; y: number }>;
    treeOffset: { x: number; y: number };
    seqOffset: { x: number; y: number };
  }
) {
  // Obtenemos los elementos de posición y desplzamiento
  const { seqPositions, nodePositions, treeOffset, seqOffset } = opts;

  // Data join para la creación de la secuencia de valores para los recorridos del árbol
  g.selectAll<SVGGElement, TraversalNodeType>("text.seq")
    .data(values, (d) => d.id)
    .join(
      enter => {
        // Creación del grupo para cada nodo entrante
        const textEnter = enter
          .append("text")
          .attr("class", "seq")
          .attr("id", (d) => d.id)
          .attr("transform", (d, i) => {
            const posNode = nodePositions.get(d.id)!;
            const x0 = treeOffset.x + posNode.x - seqOffset.x;
            const y0 = treeOffset.y + posNode.y - seqOffset.y;
            seqPositions.set(d.id, {
              x: i * SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING,
              y: 0,
            });
            return `translate(${x0}, ${y0})`;
          })
          .attr("fill", SVG_STYLE_VALUES.ELEMENT_TEXT_COLOR)
          .style("font-weight", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_WEIGHT)
          .style("font-size", SVG_BINARY_TREE_VALUES.ELEMENT_TEXT_SIZE)
          .attr("text-anchor", "middle")
          .text((d) => d.value);

        return textEnter;
      },
      update => {
        // Actualizar la posición y el valor del elemento
        update
          .attr("transform", (d, i) => {
            const posNode = nodePositions.get(d.id)!;
            const x0 = treeOffset.x + posNode.x - seqOffset.x;
            const y0 = treeOffset.y + posNode.y - seqOffset.y;
            seqPositions.set(d.id, {
              x: i * SVG_BINARY_TREE_VALUES.SEQUENCE_PADDING,
              y: 0,
            });
            return `translate(${x0}, ${y0})`;
          })
          .text((d) => d.value);

        return update;
      },
      exit =>
        exit
          .each((d) => {
            seqPositions.delete(d.id);
          })
          .remove()
    );
}

/**
 * Función encargada de resaltar un nodo especifico.
 * @param svg Selección D3 del elemento SVG donde se encuentra el nodo a resaltar.
 * @param nodeId Id del nodo a resaltar.
 * @param rectValues Valores de estilo para el contenedor del nodo.
 * @param textValues Valores de estilo para el texto del nodo.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export function animateHighlightNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodeId: string,
  rectValues: {
    highlightColor: string;
    rectStrokeColor: string;
    rectStrokeWidth: number;
  },
  textValues: {
    textFillColor: string;
    textFontSize: string;
    textFontWeight: string;
  },
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
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
  rect
    .transition()
    .duration(300)
    .attr("stroke", highlightColor)
    .attr("stroke-width", 3)
    .transition()
    .delay(800)
    .duration(300)
    .attr("stroke", rectStrokeColor)
    .attr("stroke-width", rectStrokeWidth);

  // Animación de sobresalto del valor del nodo
  text
    .transition()
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
 * @param nodesG Selección D3 del grupo <g> que contiene los nodos de la lista enlazada.
 * @param linksG Selección D3 del grupo <g> que contiene los enlaces entre nodos.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearList(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodePositions: Map<string, { x: number; y: number }>,
  bus: EventBus,
  labels: {
    CLEAR_HEAD: number,
    RESET_SIZE: number
  },
  stepId: string,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "clean" });

    // Animación de salida de los elementos del lienzo
    bus.emit("step:progress", { stepId, lineIndex: labels.CLEAR_HEAD });
    await svg.selectAll("*")
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()
      .end();

    // Liempiza del mapa de posiciones
    nodePositions.clear();

    bus.emit("step:progress", { stepId, lineIndex: labels.RESET_SIZE });
    await delay(400);

    // Fin de la operación
    bus.emit("op:done", { op: "clean" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de eliminar todos los nodos y enlaces dentro del lienzo.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param elementPositions Objeto que contiene los mapas de posiciones (x, y) de los elementos dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearTree(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  seqG: Selection<SVGGElement, unknown, null, undefined>,
  elementPositions: {
    nodePositions: Map<string, { x: number; y: number }>;
    seqPositions: Map<string, { x: number; y: number }>;
  },
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Obtenemos los mapas de posiciones de los elementos
  const { nodePositions, seqPositions } = elementPositions;

  // Animación de salida de los enlaces
  await treeG
    .selectAll("g.link")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  // Animación de salida de los nodos
  await treeG
    .selectAll("g.node")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  // Animación de salida de los valores de recorrido
  await seqG
    .selectAll("text.seq")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  // Eliminación de los grupos contenedores del DOM
  treeG.remove();
  seqG.remove();

  // Limpieza de los mapas de posiciones
  nodePositions.clear();
  seqPositions.clear();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de reposicionar los nodos de una lista, sus enlaces de conexión e indicadores de cabeza/cola opcionales.
 * @param svg Selección D3 del elemento SVG que contiene los nodos y enlaces de la lista.
 * @param nodes Array de objetos de datos de nodos que representan la estructura de la lista.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param buildPath Función para construir el SVG path del enlace entre 2 posiciones.
 * @param repositionOptions Opciones para el reposicionamiento de los indicadores auxiliares.
 * @returns Una promesa que se resuelve una vez todas las transiciones se han completado (nodos, enlaces, indicadores).
 */
export async function repositionList(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  nodes: ListNodeData<number>[],
  linksData: ListLinkData[],
  positions: Map<string, { x: number; y: number }>,
  repositionOptions: {
    headIndicator: Selection<SVGGElement, unknown, null, undefined> | null;
    tailIndicator: Selection<SVGGElement, unknown, null, undefined> | null;
    headNodeId: string | null;
    tailNodeId: string | null;
  }
) {
  const { headIndicator, headNodeId, tailIndicator, tailNodeId } = repositionOptions;
  const promises: Promise<void>[] = [];

  // Selección de nodos a desplazar (re-vinculación de datos)
  const nodesSel = svg
    .selectAll<SVGGElement, ListNodeData<number>>("g.node")
    .data(nodes, (d) => d.id);

  // Promesa para desplazamiento de nodos
  promises.push(
    nodesSel
      .transition()
      .duration(1500)
      .ease(easePolyInOut)
      .attr("transform", (d) => {
        const p = positions.get(d.id)!;
        return `translate(${p.x}, ${p.y})`;
      })
      .end()
  );

  // Selección de enlaces a ajustar (re-vinculación de datos)
  const linksSel = svg
    .selectAll<SVGGElement, ListLinkData>("g.link")
    .data(
      linksData,
      (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`
    );

  // Promesa para ajuste de enlaces
  promises.push(
    linksSel
      .select("path.node-link")
      .transition()
      .duration(1500)
      .ease(easePolyInOut)
      .attr("d", (d) => {
        const sourcePos = positions.get(d.sourceId) ?? null;
        const targetPos = positions.get(d.targetId) ?? null;
        return buildListPath(d.type, sourcePos, targetPos, SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH, SVG_LINKED_LIST_VALUES.ELEMENT_HEIGHT)
      })
      .end()
  );

  // Promesa para desplazamiento de indicador cabeza
  if (headIndicator && headNodeId) {
    const headPos = positions.get(headNodeId);
    if (headPos) {
      promises.push(
        headIndicator
          .transition()
          .duration(1500)
          .ease(easePolyInOut)
          .attr("transform", () => {
            const finalX = headPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = headPos.y;
            return `translate(${finalX}, ${finalY})`;
          })
          .end()
      );
    }
  }

  // Promesa para desplazamiento de indicador cola
  if (tailIndicator && tailNodeId) {
    const tailPos = positions.get(tailNodeId);
    if (tailPos) {
      promises.push(
        tailIndicator
          .transition()
          .duration(1500)
          .ease(easePolyInOut)
          .attr("transform", () => {
            const finalX = tailPos.x + SVG_LINKED_LIST_VALUES.ELEMENT_WIDTH / 2;
            const finalY = tailPos.y;
            return `translate(${finalX}, ${finalY})`;
          })
          .end()
      );
    }
  }

  return Promise.all(promises).then(() => { });
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param buildPath Función para construir el SVG path del enlace entre 2 posiciones.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
export async function repositionTree(
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>,
  buildPath: LinkPathFn = straightPath
) {
  // Selección de nodos a desplazar (re-vinculación de datos)
  const nodesToMove = g
    .selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id);

  //  Promesa para movimiento de nodos
  const p1 = nodesToMove
    .transition()
    .duration(1000)
    .ease(easePolyInOut)
    .attr("transform", (d) => {
      const finalPos = positions.get(d.data.id)!;
      return `translate(${finalPos.x}, ${finalPos.y})`;
    })
    .end();

  // Selección de enlaces a ajustar (re-vinculación de datos)
  const linksToAdjust = g
    .selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`);

  // Promesa para ajuste de enlaces
  const p2 = linksToAdjust
    .select("path.tree-link")
    .transition()
    .duration(1000)
    .ease(easePolyInOut)
    .attr("d", (d) => {
      const s = positions.get(d.sourceId)!;
      const t = positions.get(d.targetId)!;
      const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
      return buildPath(s, t, r);
    })
    .end();

  return Promise.all([p1, p2]).then(() => { });
}

/**
 * Función encargada de animar el recorrido de los nodos de un árbol binario.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param targetNodes Array de IDs de nodos que representan la ruta del recorrido.
 * @param seqPositions Mapa de posiciones (x, y) de cada elemento de la secuencia de recorrido.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @param opts Opciones para la animación del recorrido.
 */
export async function animateTreeTraversal(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  seqG: Selection<SVGGElement, unknown, null, undefined>,
  targetNodes: TraversalNodeType[],
  seqPositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>,
  opts: TreeTraversalAnimOptions = {}
) {
  const {
    recolor = true,
    strokeColor = "#8aa0ff",
  } = opts;

  // Restablecimiento del fondo original de los nodos
  if (recolor) {
    treeG
      .selectAll(".node-container")
      .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);
  }

  // Opacidad  original de la banda de secuencia
  seqG.style("opacity", 1);

  for (const node of targetNodes) {
    // Selección de los elementos del nodo
    const nodeCircle = treeG.select<SVGCircleElement>(`g#${node.id} circle.node-container`);
    const seqText = seqG.select<SVGTextElement>(`text#${node.id}`);

    // Color y tamaño original del borde del círculo contenedor del nodo
    const orig_color = nodeCircle.attr("stroke");
    const orig_stroke_width = nodeCircle.attr("stroke-width");

    // Modificación del borde del círculo
    await nodeCircle
      .transition()
      .duration(250)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 2)
      .end();

    // Creación del anillo de pulso
    const pulseRing = nodeCircle
      .select(function () {
        // Selección del grupo g padre del círculo
        return (this!.parentNode as SVGGElement) || this!;
      })
      .append("circle")
      .attr("class", "pulse-ring")
      .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2)
      .attr("fill", "none")
      .attr("stroke", strokeColor)
      .attr("stroke-width", 2)
      .style("opacity", 0.9);

    // Animación de pulsación
    await pulseRing
      .transition()
      .duration(500)
      .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 12)
      .style("opacity", 0)
      .remove()
      .end();

    // Bounce del círculo
    await nodeCircle
      .transition()
      .duration(150)
      .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.12)
      .transition()
      .duration(150)
      .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
      .end();

    // Movimiento del texto de secuencia a su posición final
    await seqText
      .transition()
      .duration(800)
      .attr("transform", () => {
        const finalPos = seqPositions.get(node.id)!;
        return `translate(${finalPos.x}, ${finalPos.y})`;
      })
      .end();

    // Restablecimiento de bordes
    await nodeCircle
      .transition()
      .duration(250)
      .attr("stroke", orig_color)
      .attr("stroke-width", orig_stroke_width)
      .end();
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de mostrar un indicador visual en la visualización de un árbol anclado a un nodo o borde.
 * @param svg Selección D3 del elemento SVG donde se renderizará el indicador.
 * @param target El nodo o borde de destino al que se va a anclar el indicador.
 * @param content Contenido a mostrar en el indicador.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param opts Objeto para configuración de estilos del indcador.
 */
export async function showTreeHint(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  target: HintTarget,
  content: HintContent,
  positions: Map<string, { x: number; y: number }>,
  treeOffset: { x: number; y: number },
  opts: HintOptions = {}
) {
  // Valores por defecto
  const palette = {
    bg: "#1b2330", stroke: "#ff6b6b", label: "#f4a6a6", value: "#ffd5d5",
    ...(opts.palette ?? {})
  };
  const size = {
    width: 50, height: 34, radius: 10, scaleFrom: 0.92,
    ...(opts.size ?? {})
  };
  const anchor = {
    side: "right" as const, dx: 0, dy: -10,
    ...(opts.anchor ?? {})
  };
  const typography = {
    labelFz: "9px",
    valueFz: "11px",
    labelFw: 600,
    valueFw: 800,
    ...(opts.typography ?? {})
  };

  // Capa overlay
  let overlay = svg.select<SVGGElement>("g.overlay-top");
  if (overlay.empty()) overlay = svg.append("g").attr("class", "overlay-top");
  overlay.raise();

  // Posicionamiento del ancla
  const anchorXY = (() => {
    if (target.type === "node") {
      const p = positions.get(target.id);
      if (!p) return null;
      return { x: treeOffset.x + p.x, y: treeOffset.y + p.y };
    } else {
      const s = positions.get(target.sourceId), t = positions.get(target.targetId);
      if (!s || !t) return;
      return { x: treeOffset.x + (s.x + t.x) / 2, y: treeOffset.y + (s.y + t.y) / 2 };
    }
  })();
  if (!anchorXY) return;

  // Aplicación de offset por lado
  const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
  const sideOffset =
    anchor.side === "left" ? -r - 13 :
      anchor.side === "right" ? +r + 13 :
        0;

  const cx = anchorXY.x + (anchor.side === "left" || anchor.side === "right" ? sideOffset : 0) + (anchor.dx ?? 0);
  const cy = anchorXY.y + (anchor.side === "above" ? -(r + 13) : anchor.side === "below" ? +(r + 13) : 0) + (anchor.dy ?? 0);

  // Grupo contenedor del badge
  const g = overlay.append("g")
    .attr("class", "tree-hint")
    .attr("transform", `translate(${cx}, ${cy}) scale(0.92)`)
    .style("opacity", 0);

  // Fondo
  g.append("rect")
    .attr("x", -size.width / 2).attr("y", -size.height / 2)
    .attr("width", size.width).attr("height", size.height)
    .attr("rx", size.radius).attr("ry", size.radius)
    .attr("fill", palette.bg).attr("stroke", palette.stroke).attr("stroke-width", 1);

  // Textos (centrados dentro del chip de tamaño fijo)
  const textG = g.append("g").attr("class", "txt");
  textG.append("text")
    .attr("text-anchor", "middle").attr("y", -4)
    .style("font-size", `${typography.labelFz}`).style("font-weight", `${typography.labelFw}`)
    .attr("fill", palette.label).text(content.label);

  textG.append("text")
    .attr("text-anchor", "middle").attr("y", 12)
    .style("font-size", `${typography.valueFz}`).style("font-weight", `${typography.valueFw}`)
    .attr("fill", palette.value).text(content.value);

  // Animación: pop-in y fade-out
  await g.transition()
    .duration(500)
    .style("opacity", 1)
    .attr("transform", `translate(${cx}, ${cy}) scale(1)`)
    .end();

  await g.transition()
    .delay(1000)
    .duration(800)
    .style("opacity", 0)
    .remove()
    .end();
}

/**
 * Función encargada de animar la aparición de un nodo especifico de un árbol.
 * @param newNodeGroup Selección D3 del elemento de grupo SVG que representa el nodo del árbol.
 */
export async function defaultAppearTreeNode(
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>
) {
  // Selección de los elementos del nodo y configuración inicial
  nodeGroup
    .style("opacity", 1);
  const circle = nodeGroup.select<SVGCircleElement>("circle.node-container").attr("r", 0);
  const text = nodeGroup.select<SVGTextElement>("text.node-value").style("opacity", 0);

  // Animaciones de entrada
  const p1 = circle.transition().duration(750)
    .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.15)
    .transition().duration(750)
    .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS).end();
  const p2 = text.transition().duration(650).style("opacity", 1).end();

  await Promise.all([p1, p2]);
}

/**
 * Función encargada de animar la salida de un nodo especifico de un árbol.
 * @param newNodeGroup Selección D3 del elemento de grupo SVG que representa el nodo del árbol.
 */
export async function defaultDeleteTreeNode(
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>
) {
  // Selección de los elementos del nodo
  const circle = nodeGroup.select<SVGCircleElement>("circle.node-container");
  const value = nodeGroup.select<SVGCircleElement>("text.node-value");

  // Animaciones de salida
  const p1 = circle.transition().duration(750)
    .attr("r", 0).end();

  const p2 = value.transition().duration(500)
    .style("opacity", 0).end();

  await Promise.all([p1, p2]);

  // Eliminación del grupo del DOM
  await nodeGroup.transition().duration(500)
    .style("opacity", 0).remove().end();
}