import {
  HierarchyNodeData,
  IndicatorPositioningConfig,
  LinkData,
  ListNodeData,
  TraversalNodeType,
  TreeLinkData,
} from "../../../types";
import {
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../constants/consts";
import { calculateCircularLPath, calculateLinkPath } from "./calculateLinkPath";
import { HierarchyNode, easePolyInOut } from "d3";

const waitEnd = (t: d3.Transition<any, any, any, any>) =>
  new Promise<void>((resolve) => t.on("end", resolve).on("interrupt", resolve));

type TraversalAnimOptions = {
  /** "recolor" = comportamiento anterior; "preserve-fill" = NO tocar fill */
  style?: "recolor" | "preserve-fill";
  /** Color del resaltado (stroke/anillo) en modo preserve-fill */
  strokeColor?: string;
  /** Hacer un pequeño bounce de radio (solo visual) */
  bounce?: boolean;
  /** Mostrar anillo pulsante temporal */
  pulse?: boolean;
};

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
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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
          .duration(1200)
          .style("opacity", 1)
          .attr("transform", (d) =>
            groupPositioningTransform.calculateTransform(d, dims)
          );

        return gEnter;
      },
      (update) => update,
      (exit) => exit.transition().duration(1000).style("opacity", 0).remove()
    );
}

/**
 * Función encargada de renderizar los nodos de un árbol dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  positions: Map<string, { x: number; y: number }>
) {
  // Data join para la creación de los nodos
  g.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id)
    .join(
      (enter) => {
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
      (update) => {
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

        //actualizar el valor visible del nodo
        update
          .select<SVGTextElement>(".node-value")
          .text((d) => d.data.value ?? 0);
        return update;
      },
      (exit) => exit
    );
}

/**
 * Función encargada de renderizar los enlaces entre nodos de un árbol dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los enlaces del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawTreeLinks(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  // Data join para la creación de los enlaces entre nodos
  g.selectAll<SVGGElement, LinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`)
    .join(
      (enter) => {
        // Creación del grupo para cada nuevo enlace
        const gLink = enter
          .append("g")
          .attr("class", "link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`);

        // Path del enlace
        gLink
          .append("path")
          .attr("class", `tree-link`)
          .attr("fill", "none")
          .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
          .attr("stroke-width", 1.5)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
            return `M${s.x},${s.y + r} L${t.x},${t.y - r}`;
          });

        return gLink;
      },
      // 🔁 actualizar la ruta cuando cambian posiciones o rotan (AVL)
      (update) => {
        update.select<SVGPathElement>("path.tree-link").attr("d", (d) => {
          const s = positions.get(d.sourceId)!;
          const t = positions.get(d.targetId)!;
          const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
          return `M${s.x},${s.y + r} L${t.x},${t.y - r}`;
        });
        return update;
      },
      // 🧹 eliminar enlaces obsoletos para evitar “fantasmas”
      (exit) => exit.transition().duration(300).style("opacity", 0).remove()
    );
}

/**
 * Función encargada de renderizar los nodos de una lista dentro del lienzo.
 * @param svg Selección D3 del elemento SVG donde se van a renderizar los nodos de la lista.
 * @param listNodes Array con información de los nodos a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param dims Dimensiones del lienzo y sus elementos.
 */
export function drawListNodes(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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
  svg
    .selectAll<SVGGElement, ListNodeData<number>>("g.node")
    .data(listNodes, (d) => d.id)
    .join(
      (enter) => {
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
      (update) => {
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
      (exit) => exit
    );
}

/**
 * Función encargada de renderizar los enlaces pertenecientes a los nodos de una lista.
 * @param svg Selección D3 del elemento SVG donde se van a renderizar los enlaces de la lista.
 * @param linksData Array con información de los enlaces a renderizar.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param elementWidth Ancho del nodo.
 * @param elementHeight Alto del nodo.
 */
export function drawListLinks(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  linksData: LinkData[],
  positions: Map<string, { x: number; y: number }>,
  elementWidth: number,
  elementHeight: number
) {
  // Data join para la creación de los enlaces entre nodos
  svg
    .selectAll<SVGGElement, LinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}-${d.type}`)
    .join(
      (enter) => {
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
          .attr("d", (d) =>
            d.type === "next" || d.type === "prev"
              ? calculateLinkPath(d, positions, elementWidth, elementHeight)
              : calculateCircularLPath(
                  d,
                  positions,
                  elementWidth,
                  elementHeight
                )
          );

        return gLink;
      },
      (update) => update,
      (exit) => exit
    );
}

/**
 * Función encargada de renderizar la secuencia de valores de nodos para el recorrido del árbol.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se va a renderizar la secuencia de valores de recorrido.
 * @param values Arreglo de objetos que representan la secuencia a mostrar.
 * @param opts Objeto de configuración que contiene el posicionamiento y desplazamiento de los elementos del árbol.
 */
export function drawTraversalSequence(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
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
      (enter) => {
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
      (update) => {
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
      (exit) =>
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
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
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
 * @param svg Selección D3 del elemento SVG a limpiar.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearList(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodePositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Animación de salida de los enlaces
  await svg
    .selectAll("g.link")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .end();

  // Animación de salida de los nodos
  await svg
    .selectAll("g.node")
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

/**
 * Función encargada de eliminar todos los nodos y enlaces dentro del lienzo.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param elementPositions Objeto que contiene los mapas de posiciones (x, y) de los elementos dentro del SVG.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateClearTree(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  elementPositions: {
    nodePositions: Map<string, { x: number; y: number }>;
    seqPositions: Map<string, { x: number; y: number }>;
  },
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>
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

  // Liempiza de los mapas de posiciones
  nodePositions.clear();
  seqPositions.clear();

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param nodePositions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
export async function repositionTreeNodes(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  nodePositions: Map<string, { x: number; y: number }>
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
      const finalPos = nodePositions.get(d.data.id)!;
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
      const s = nodePositions.get(d.sourceId)!;
      const t = nodePositions.get(d.targetId)!;
      const r = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
      return `M${s.x},${s.y + r} L${t.x},${t.y - r}`;
    })
    .end();

  return Promise.all([p1, p2]).then(() => {});
}

/**
 * Función encargada de resaltar cada nodo del árbol a lo largo de un camino dado.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param highlightColor Color a usar para resaltar el contenedor de cada nodo a lo largo del camino.
 */
export async function highlightTreePath(
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<HierarchyNodeData<number>>[],
  highlightColor: string
) {
  for (const node of path) {
    // Selección del grupo del nodo actual
    const nodeGroup = g.select<SVGGElement>(`g#${node.data.id}`);

    // Resaltado del nodo actual
    await nodeGroup
      .select("circle")
      .transition()
      .duration(1000)
      .attr("fill", highlightColor)
      .end();
  }
}

/**
 * Función encargada de animar el recorrido de los nodos de un árbol binario.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param targetNodes Array de IDs de nodos que representan la ruta del recorrido.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateTreeTraversal(
  treeG: d3.Selection<SVGGElement, unknown, null, undefined>,
  seqG: d3.Selection<SVGGElement, unknown, null, undefined>,
  targetNodes: TraversalNodeType[],
  seqPositions: Map<string, { x: number; y: number }>,
  resetQueryValues: () => void,
  setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>,
  opts: TraversalAnimOptions = {}
) {
  const {
    style = "preserve-fill",
    strokeColor = "#8aa0ff",
    bounce = true,
    pulse = true,
  } = opts;

  // ⚠️ Antes reseteaba SIEMPRE el fill => rompía RB.
  if (style === "recolor") {
    treeG
      .selectAll(".node-container")
      .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR);
  }

  // Asegura opacidad de la banda de secuencia
  seqG.style("opacity", 1);

  setIsAnimating(true);

  for (const node of targetNodes) {
    const id = node.id;
    const circle = treeG.select<SVGCircleElement>(`g#${id} circle`);
    const seqText = seqG.select<SVGTextElement>(`text#${id}`);

    if (circle.empty()) continue;

    // MODO A: comportamiento antiguo (recolor)
    if (style === "recolor") {
      await circle
        .transition()
        .duration(750)
        .attr("fill", SVG_BINARY_TREE_VALUES.HIGHLIGHT_COLOR)
        .end();

      if (bounce) {
        await circle
          .transition()
          .duration(150)
          .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.2)
          .transition()
          .duration(150)
          .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
          .end();
      }

      // mover texto de secuencia
      await seqText
        .transition()
        .duration(800)
        .attr("transform", () => {
          const finalPos = seqPositions.get(id)!;
          return `translate(${finalPos.x}, ${finalPos.y})`;
        })
        .end();

      await circle
        .transition()
        .duration(750)
        .attr("fill", SVG_STYLE_VALUES.RECT_FILL_SECOND_COLOR)
        .end();

      continue;
    }

    // MODO B: preserve-fill (NO tocar fill) → glow + stroke + pulso
    circle.interrupt();

    // 1) encender glow / stroke
    await waitEnd(
      circle
        .transition()
        .duration(140)
        .attr("filter", "url(#softGlow)")
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
    );

    // 2) pulso opcional (un círculo temporal dentro del grupo del nodo)
    if (pulse) {
      const r0 = SVG_BINARY_TREE_VALUES.NODE_RADIUS;
      const pulseRing = circle
        .select(function () {
          // agregamos un sibling en el mismo g del nodo
          return (this!.parentNode as SVGGElement) || this!;
        })
        .append("circle")
        .attr("class", "pulse-ring")
        .attr("r", r0 + 2)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .style("opacity", 0.9);

      await waitEnd(
        pulseRing
          .transition()
          .duration(420)
          .attr("r", r0 + 12)
          .style("opacity", 0)
          .remove()
      );
    }

    // 3) pequeño bounce (sin tocar fill)
    if (bounce) {
      await circle
        .transition()
        .duration(150)
        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.12)
        .transition()
        .duration(150)
        .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
        .end();
    }

    // 4) mover texto de secuencia a su posición final
    await seqText
      .transition()
      .duration(800)
      .attr("transform", () => {
        const finalPos = seqPositions.get(id)!;
        return `translate(${finalPos.x}, ${finalPos.y})`;
      })
      .end();

    // 5) apagar glow / stroke
    await waitEnd(
      circle
        .transition()
        .duration(140)
        .attr("filter", null)
        .attr("stroke", SVG_STYLE_VALUES.RECT_STROKE_COLOR)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
    );
  }

  resetQueryValues();
  setIsAnimating(false);
}
