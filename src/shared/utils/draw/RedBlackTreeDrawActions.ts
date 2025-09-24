import { type HierarchyNode, type Selection } from "d3";
import { HierarchyNodeData, TreeLinkData } from "../../../types";
import {
  RB_COLORS,
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../constants/consts";
import { RBFrame, RBAction } from "../../../types";
import type { Dispatch, SetStateAction } from "react";
import { curvedPath } from "../treeUtils";
import { repositionTree, showTreeHint } from "./drawActionsUtilities";
import { animateBSTInsertCore, animateEspecialBSTsRotation, animateLeafOrSingleChild, updateTreeLinkPath } from "./BinaryTreeDrawActions";

/**
 * Función encargada de renderizar los nodos de un árbol Rojo-Negro dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los nodos del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawRBTreeNodes(
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  positions: Map<string, { x: number; y: number }>
) {
  // Data join para la creación de los nodos
  g.selectAll<SVGGElement, HierarchyNode<HierarchyNodeData<number>>>("g.node")
    .data(nodes, (d) => d.data.id)
    .join(
      // Creación del grupo para cada nodo entrante
      enter => {
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

        // Contenedor principal del nodo
        gEnter
          .append("circle")
          .attr("class", "node-container")
          .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
          .attr("fill", (d) =>
            (d.data.color ?? "black") === "red"
              ? RB_COLORS.RED
              : RB_COLORS.BLACK
          )
          .attr("stroke", RB_COLORS.STROKE)
          .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
          .attr("filter", "url(#rbNodeShadow)");

        // Aro (ring) decorativo
        gEnter
          .append("circle")
          .attr("class", "node-ring")
          .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2.5)
          .attr("fill", "none")
          .attr("stroke", (d) =>
            (d.data.color ?? "black") === "red"
              ? "url(#rbRingRed)"
              : "url(#rbRingBlack)"
          )
          .attr("stroke-width", 1.75)
          .attr("opacity", 0.9);

        // Valor del nodo
        gEnter
          .append("text")
          .attr("class", "node-value")
          .attr("text-anchor", "middle")
          .attr("fill", RB_COLORS.TEXT_NODE)
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

        return update;
      },
      exit => exit
    );
}

/**
 * Función encargada de renderizar los enlaces entre los nodos de un árbol Rojo-Negro dentro del lienzo.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) donde se van a renderizar los enlaces del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 */
export function drawRBTreeLinks(
  g: Selection<SVGGElement, unknown, null, undefined>,
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  // Data join para la creación de los enlaces entre nodos
  g.selectAll<SVGGElement, TreeLinkData>("g.link")
    .data(linksData, (d) => `link-${d.sourceId}-${d.targetId}`)
    .join(
      enter => {
        // Creación del grupo para cada nuevo enlace
        const gLink = enter
          .append("g")
          .attr("class", "link")
          .attr("id", (d) => `link-${d.sourceId}-${d.targetId}`);

        // Path del enlace
        gLink
          .append("path")
          .attr("class", "tree-link")
          .attr("fill", "none")
          .attr("stroke", RB_COLORS.BLACK_RING)
          .attr("stroke-width", 1.6)
          .attr("opacity", 0.9)
          .attr("d", (d) => {
            const s = positions.get(d.sourceId)!;
            const t = positions.get(d.targetId)!;
            return curvedPath(s, t, SVG_BINARY_TREE_VALUES.NODE_RADIUS);
          });

        return gLink;
      },
      update => update,
      exit => exit
    );
}

/**
 * Función encargada de animar la inserción de un nuevo nodo en el árbol Rojo-Negro.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateRBInsertNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  treeOffset: { x: number; y: number },
  insertionData: {
    newNodeId: string;
    parentId: string | null;
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
    positions: Map<string, { x: number, y: number }>;
    pathToParent: HierarchyNode<HierarchyNodeData<number>>[];
    bstFrame: RBFrame | null,
    actions: RBAction[],
    frames: RBFrame[];
  },
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Elementos del árbol requeridos para la animación 
  const { positions, bstFrame, actions, frames } = insertionData;

  // Grupo contenedor de nodos y enlaces del árbol
  const treeG = svg.select<SVGGElement>("g.tree-container");

  // Grupo contenedor de los valores de la secuencia de recorrido
  const seqG = svg.select<SVGGElement>("g.seq-container");

  // Capas de nodos y enlaces
  const linksLayer = treeG.select<SVGGElement>("g.links-layer");
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

  // Definimos los nodos a usar durante la inserción
  const currentNodes = bstFrame ? bstFrame.nodes : insertionData.nodesData;
  const currentLinks = bstFrame ? bstFrame.links : insertionData.linksData;

  // Renderizado del estado del árbol previo a cualquier rotación o recoloreo (si aplica)
  if (bstFrame) {
    drawRBTreeNodes(nodesLayer, currentNodes, positions);
    drawRBTreeLinks(linksLayer, currentLinks, positions);
  }

  // Elevamos la capa de nodos
  nodesLayer.raise();

  // Animación de inserción del elemento como BST
  await animateBSTInsertCore(
    treeG,
    seqG,
    {
      newNodeId: insertionData.newNodeId,
      parentId: insertionData.parentId,
      nodesData: currentNodes,
      linksData: currentLinks,
      pathToParent: insertionData.pathToParent,
      positions: positions
    },
    {
      reposition: repositionRBTree,
      appearNode: appearRBTreeNode,
      highlightColor: RB_COLORS.HIGHLIGHT,
      highlight: highlightRBTreePath
    }
  );

  // Restablecimiento de los bordes del nodo padre del nuevo nodo (si aplica)
  if (insertionData.parentId) {
    await treeG.select<SVGGElement>(`g#${insertionData.parentId} circle.node-container`)
      .transition()
      .duration(800)
      .attr("stroke", RB_COLORS.STROKE)
      .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
      .end();
    treeG.select<SVGGElement>(`g#${insertionData.parentId} circle.node-ring`).style("opacity", 0.9);
  }

  // Aplicación de recolores y rotaciones
  let frameCount = 1;
  for (const action of actions) {
    if (action.kind === "recolor") {
      // Mostrar indicador visual de acción de recoloreo
      await showTreeHint(
        svg,
        { type: "node", id: action.id },
        { label: `Colorear`, value: action.to === "BLACK" ? `${action.nodeBadge}->Negro` : `${action.nodeBadge}->Rojo` },
        positions,
        treeOffset,
        {
          size: { width: 78, height: 35, radius: 10 },
          typography: { labelFz: "9.8px", valueFz: "10px", labelFw: 700, valueFw: 700 },
          anchor: { side: "below", dx: 10, dy: -8 },
          palette: { bg: "#2b1d2e", stroke: "#e11d48", label: "#fecdd3", value: "#fda4af" }
        }
      );

      // Grupo del nodo a recolorear
      const nodeToRecolor = treeG.select<SVGGElement>(`g#${action.id}`);

      // Animación de recoloreo del nodo
      await recolorRBNode(nodeToRecolor, action.to);
    } else {
      // Rotación actual
      const rotation = action.step;
      const { nodes, links } = frames[frameCount];

      // Mostrar indicador visual de acción de rotación
      await showTreeHint(
        svg,
        { type: "node", id: rotation.zId },
        { label: "rotación", value: action.tag },
        positions,
        treeOffset,
        {
          size: { width: 52, height: 35, radius: 8 },
          typography: { labelFz: "9px", valueFz: "9.5px", labelFw: 800, valueFw: 800 },
          anchor: { side: "right", dx: 0.5, dy: -10 },
          palette: { bg: "#2b1d2e", stroke: "#e11d48", label: "#fecdd3", value: "#fda4af" }
        }
      );

      // Renderizar los nuevos enlaces
      drawRBTreeLinks(linksLayer, links, positions);

      // Actualizar la posición de los nodos según el estado actual
      drawRBTreeNodes(nodesLayer, nodes, positions);

      // Animación de rotación
      await animateEspecialBSTsRotation(
        treeG,
        rotation.parentOfZId ?? null,
        rotation.zId,
        rotation.yId,
        rotation.BId ?? null,
        repositionRBTree,
        {
          nodes,
          links,
          positions
        }
      );

      frameCount++;
    }
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la eliminación de un nodo especifico en el árbol Rojo-Negro.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Desplazamiento del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateRBDeleteNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  treeOffset: { x: number; y: number },
  deletionData: {
    prevRootNode: HierarchyNode<HierarchyNodeData<number>>;
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>;
    nodeToReposition: HierarchyNode<HierarchyNodeData<number>> | null;
    remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
    remainingLinksData: TreeLinkData[];
    positions: Map<string, { x: number; y: number }>,
    preRotationFrame: RBFrame | null;
    actions: RBAction[];
    frames: RBFrame[];
  },
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Elementos del árbol requeridos para la animación 
  const {
    nodeToDelete,
    prevRootNode,
    positions,
    nodeToReposition,
    preRotationFrame,
    actions,
    frames
  } = deletionData;

  // Grupo contenedor de nodos y enlaces del árbol
  const treeG = svg.select<SVGGElement>("g.tree-container");

  // Grupo contenedor de los valores de la secuencia de recorrido
  const seqG = svg.select<SVGGElement>("g.seq-container");

  // Capas de nodos y enlaces
  const linksLayer = treeG.select<SVGGElement>("g.links-layer");
  const nodesLayer = treeG.select<SVGGElement>("g.nodes-layer");

  // Definimos los nodos a usar durante la eliminación (dependiendo si hay rotación o no)
  const currentNodes = preRotationFrame ? preRotationFrame.nodes : deletionData.remainingNodesData;
  const currentLinks = preRotationFrame ? preRotationFrame.links : deletionData.remainingLinksData;

  // Renderizado del estado del árbol previo a cualquier rotación o recoloreo (si aplica)
  if (preRotationFrame) {
    drawRBTreeNodes(nodesLayer, currentNodes, positions);
    drawRBTreeLinks(linksLayer, currentLinks, positions);
  }

  // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
  seqG.style("opacity", 0);

  if (!nodeToReposition) {
    // Nodo padre del nodo a eliminar
    const parentNode = nodeToDelete.parent;

    // Ruta desde el nodo raíz hasta el nodo padre del nodo a eliminar
    const pathToParent = parentNode ? prevRootNode.path(parentNode) : [];

    // Animación de eliminación para nodo hoja o nodo con único hijo
    await animateLeafOrSingleChild(
      treeG,
      nodeToDelete,
      parentNode ? parentNode.data.id : null,
      pathToParent,
      {
        deleteNode: deleteRBTreeNode,
        highlightNodePath: highlightRBTreePath,
        highlightColor: RB_COLORS.HIGHLIGHT,
        buildPath: curvedPath
      }
    );

    // Restablecimiento de los bordes del nodo padre del nodo eliminado (si aplica)
    if (parentNode) {
      await treeG.select<SVGGElement>(`g#${parentNode.data.id} circle.node-container`)
        .transition()
        .duration(800)
        .attr("stroke", RB_COLORS.STROKE)
        .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
        .end();
      treeG.select<SVGGElement>(`g#${parentNode.data.id} circle.node-ring`).style("opacity", 0.9);
    }
  } else {
    // Ruta desde el nodo raiz hasta el nodo a eliminar
    const pathToRemovalNode = prevRootNode.path(nodeToDelete);

    // Ruta desde el nodo a eliminar hasta el nodo a reposicionar
    const pathToRepositionNode = nodeToDelete.path(nodeToReposition);

    // Animación de eliminación para nodo con 2 hijos
    await animateRBTwoChildren(
      treeG,
      {
        nodeToDelete,
        nodeToReposition,
        positions,
        pathToRemovalNode,
        pathToRepositionNode
      }
    );

    // Restablecimiento de los bordes del nodo padre del nodo reposicionado
    await treeG.select<SVGGElement>(`g#${nodeToReposition.data.id} circle.node-container`)
      .transition()
      .duration(800)
      .attr("stroke", RB_COLORS.STROKE)
      .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
      .end();
    treeG.select<SVGGElement>(`g#${nodeToReposition.data.id} circle.node-ring`).style("opacity", 0.9);
  }

  // Limpiamos el registro del nodo eliminado
  positions.delete(nodeToDelete.data.id);

  // Reposicionamiento de los nodos y enlaces del árbol
  await repositionRBTree(treeG, currentNodes, currentLinks, positions);

  // Conservar el color del nodo reposicionado para no alterar la altura negra en este punto (si aplica)
  if (nodeToReposition) {
    await showTreeHint(
      svg,
      { type: "node", id: nodeToReposition.data.id },
      { label: `Colorear`, value: nodeToDelete.data.color === "black" ? `Nodo->Negro` : `Nodo->Rojo` },
      positions,
      treeOffset,
      {
        size: { width: 78, height: 35, radius: 10 },
        typography: { labelFz: "9.8px", valueFz: "10px", labelFw: 700, valueFw: 700 },
        anchor: { side: "below", dx: 10, dy: -8 },
        palette: { bg: "#2b1d2e", stroke: "#e11d48", label: "#fecdd3", value: "#fda4af" }
      }
    );

    // Recoloreo del nodo reposicionado
    const repositionG = treeG.select<SVGGElement>(`g#${nodeToReposition.data.id}`);
    await recolorRBNode(repositionG, nodeToDelete.data.color === "black" ? "BLACK" : "RED");
  }

  // Aplicación de recolores y rotaciones
  let frameCount = 1;
  for (const action of actions) {
    if (action.kind === "recolor") {
      // Mostrar indicador visual de acción de recoloreo
      await showTreeHint(
        svg,
        { type: "node", id: action.id },
        { label: `Colorear`, value: action.to === "BLACK" ? `${action.nodeBadge}->Negro` : `${action.nodeBadge}->Rojo` },
        positions,
        treeOffset,
        {
          size: { width: action.nodeBadge.length > 6 ? 88 : 78, height: 35, radius: 8 },
          typography: { labelFz: "9.8px", valueFz: "10px", labelFw: 700, valueFw: 700 },
          anchor: { side: "below", dx: 10, dy: -8 },
          palette: { bg: "#2b1d2e", stroke: "#e11d48", label: "#fecdd3", value: "#fda4af" }
        }
      );

      // Grupo del nodo a recolorear
      const nodeToRecolor = treeG.select<SVGGElement>(`g#${action.id}`);

      // Animación de recoloreo del nodo
      await recolorRBNode(nodeToRecolor, action.to);
    } else {
      const rotation = action.step;
      const { nodes, links } = frames[frameCount];

      // Mostrar indicador visual de acción de rotación
      await showTreeHint(
        svg,
        { type: "node", id: rotation.zId },
        { label: "rotación", value: action.tag },
        positions,
        treeOffset,
        {
          size: { width: 52, height: 35, radius: 8 },
          typography: { labelFz: "9px", valueFz: "9.5px", labelFw: 800, valueFw: 800 },
          anchor: { side: "right", dx: 0.5, dy: -10 },
          palette: { bg: "#2b1d2e", stroke: "#e11d48", label: "#fecdd3", value: "#fda4af" }
        }
      );

      // Renderizar los nuevos enlaces
      drawRBTreeLinks(linksLayer, links, positions);

      // Actualizar la posición de los nodos según el estado actual
      drawRBTreeNodes(nodesLayer, nodes, positions);

      // Animación de rotación
      await animateEspecialBSTsRotation(
        treeG,
        rotation.parentOfZId ?? null,
        rotation.zId,
        rotation.yId,
        rotation.BId ?? null,
        repositionRBTree,
        {
          nodes,
          links,
          positions
        }
      );

      frameCount++;
    }
  }

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de animar la búsqueda de un nodo dentro de un árbol Rojo-Negro.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param seqG Selección D3 del elemento SVG del grupo (`<g>`) que contiene la secuencia de valores de recorrido.
 * @param targetNode ID del nodo a buscar.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 */
export async function animateRBSearch(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  seqG: Selection<SVGGElement, unknown, null, undefined>,
  targetNode: string,
  path: HierarchyNode<HierarchyNodeData<number>>[],
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Ocultamos la secuencia de valores de recorrido (en caso de estar presente)
  seqG.style("opacity", 0);

  // Selección de Grupo y elementos correspondientes al nodo a buscar
  const foundNodeGroup = treeG.select<SVGCircleElement>(`g#${targetNode}`);
  const foundNodeCircle = foundNodeGroup.select<SVGCircleElement>("circle.node-container");
  const foundNodeRing = foundNodeGroup.select<SVGCircleElement>("circle.node-ring");

  // Animación de recorrido desde el nodo raíz hasta el nodo buscado
  await highlightRBTreePath(treeG, path, RB_COLORS.HIGHLIGHT);

  // Resaltado final del nodo ubicado
  const p1 = foundNodeCircle
    .transition()
    .duration(250)
    .attr("r", 30)
    .transition()
    .duration(250)
    .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
    .end();

  const p2 = foundNodeRing
    .select("circle.node-ring")
    .transition()
    .duration(250)
    .attr("r", 30 + 2.5)
    .transition()
    .duration(250)
    .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2.5)
    .end();

  await Promise.all([p1, p2]);

  // Restablecimiento de los bordes del nodo padre del nodo ubicado
  await foundNodeCircle
    .transition()
    .duration(800)
    .attr("stroke", RB_COLORS.STROKE)
    .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
    .end();
  foundNodeRing.style("opacity", 0.9);

  // Restablecimiento de los valores de las queries del usuario
  resetQueryValues();

  // Finalización de la animación
  setIsAnimating(false);
}

/**
 * Función encargada de reubicar los nodos y ajustar los enlaces de conexión de un árbol Rojo-Negro.
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param nodes Array de nodos de jerarquía que representan la estructura del árbol.
 * @param linksData Array de objetos de datos de enlace que representan las conexiones entre nodos.
 * @param positions Mapa de posiciones (x, y) de cada nodo dentro del SVG.
 * @returns Una promesa que se resuelve cuando se han completado todas las transiciones de nodos y enlaces.
 */
async function repositionRBTree(
  g: Selection<SVGGElement, unknown, null, undefined>,
  nodes: HierarchyNode<HierarchyNodeData<number>>[],
  linksData: TreeLinkData[],
  positions: Map<string, { x: number; y: number }>
) {
  return repositionTree(g, nodes, linksData, positions, curvedPath);
}

/**
 * Función encargada de animar la aparición de un nodo especifico de un árbol Rojo-Negro.
 * @param nodeGroup Selección D3 del elemento de grupo SVG que representa el nodo del árbol. 
 */
async function appearRBTreeNode(
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>
) {
  // Selección de los elementos del nodo y configuración incial
  nodeGroup.style("opacity", 1);
  const ring = nodeGroup.select<SVGCircleElement>("circle.node-ring").attr("r", 0);
  const circle = nodeGroup.select<SVGCircleElement>("circle.node-container").attr("r", 0);
  const text = nodeGroup.select<SVGTextElement>("text.node-value").style("opacity", 0);

  // Animaciones de entrada
  const p1 = circle.transition().duration(750).attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS * 1.15)
    .transition().duration(750).attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS).end();

  const p2 = ring.transition().duration(750).attr("r", (SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2.5) * 1.10)
    .transition().duration(750).attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2.5).end();

  const p3 = text.transition().duration(650).style("opacity", 1).end();
  await Promise.all([p1, p2, p3]);
}

/**
 * Función encargada de animar la sálida de un nodo especifico de un árbol Rojo-Negro.
 * @param nodeGroup Selección D3 del elemento de grupo SVG que representa el nodo del árbol. 
 */
async function deleteRBTreeNode(
  nodeGroup: Selection<SVGGElement, unknown, null, undefined>
) {
  // Selección de elementos del nodo
  const ring = nodeGroup.select<SVGCircleElement>("circle.node-ring");
  const circle = nodeGroup.select<SVGCircleElement>("circle.node-container");
  const text = nodeGroup.select<SVGTextElement>("text.node-value");

  // Animaciones de salida
  const p1 = circle.transition().duration(750).attr("r", 0).end();
  const p2 = ring.transition().duration(750).attr("r", 0).end();
  const p3 = text.transition().duration(650).style("opacity", 0).end();

  await Promise.all([p1, p2, p3]);
  nodeGroup.remove();
}

/**
 * Función encargada de resaltar cada nodo del árbol Rojo-Negro a lo largo de un camino dado
 * @param g Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param path Array de nodos jerárquicos que representan el camino a resaltar.
 * @param highlightColor Color a usar para resaltar el contenedor de cada nodo a lo largo del camino.
 */
async function highlightRBTreePath(
  g: Selection<SVGGElement, unknown, null, undefined>,
  path: HierarchyNode<HierarchyNodeData<number>>[],
  highlightColor: string
) {
  for (const node of path) {
    // Selección del grupo del nodo actual
    const nodeCircle = g.select<SVGGElement>(`g#${node.data.id} circle.node-container`);
    const nodeRing = g.select<SVGGElement>(`g#${node.data.id} circle.node-ring`);

    // Color y tamaño original del borde del contenedor del nodo
    const orig_color = nodeCircle.attr("stroke");
    const orig_width = nodeCircle.attr("stroke-width");
    nodeRing.style("opacity", 0);

    // Resaltado del borde del nodo actual
    await nodeCircle
      .transition()
      .duration(800)
      .attr("stroke", highlightColor)
      .attr("stroke-width", 3.5)
      .end();

    if (node.data.id !== path[path.length - 1].data.id) {
      // Restablecimiento de los bordes originales
      await nodeCircle
        .transition()
        .duration(800)
        .attr("stroke", orig_color)
        .attr("stroke-width", orig_width)
        .end();
      nodeRing.style("opacity", 0.9);
    }
  }
}

/**
 * Función encargada de recolorear un nodo Rojo-Negro.
 * @param nodeToRecolor Selección D3 del elemento SVG del grupo (`<g>`) que representa el nodo del árbol a recolorear.
 * @param to Color al que se desea cambiar el nodo ("RED" o "BLACK").
 */
async function recolorRBNode(
  nodeToRecolor: Selection<SVGGElement, unknown, null, undefined>,
  to: "RED" | "BLACK"
) {
  // Recoloreo del aro (ring) decorativo del nodo
  await nodeToRecolor.select<SVGCircleElement>("circle.node-ring")
    .transition()
    .duration(500)
    .attr("fill", "none")
    .attr("stroke", () =>
      to === "BLACK"
        ? "url(#rbRingBlack)"
        : "url(#rbRingRed)"
    )
    .end();

  // Recoloreo del circulo contenedor del nodo
  await nodeToRecolor.select<SVGCircleElement>("circle.node-container")
    .transition()
    .duration(1000)
    .attr("fill", () =>
      to === "BLACK"
        ? RB_COLORS.BLACK
        : RB_COLORS.RED
    )
    .end();
}

/**
 * Función encargada de animar la eliminación de un nodo Rojo-Negro con 2 hijos.
 * @param treeG Selección D3 del elemento SVG del grupo (`<g>`) que contiene los nodos y enlaces del árbol.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 */
async function animateRBTwoChildren(
  treeG: Selection<SVGGElement, unknown, null, undefined>,
  deletionData: {
    nodeToDelete: HierarchyNode<HierarchyNodeData<number>>,
    nodeToReposition: HierarchyNode<HierarchyNodeData<number>>,
    positions: Map<string, { x: number; y: number }>,
    pathToRemovalNode: HierarchyNode<HierarchyNodeData<number>>[],
    pathToRepositionNode: HierarchyNode<HierarchyNodeData<number>>[]
  }
) {
  // Elementos del árbol requeridos para la animación
  const { nodeToDelete, nodeToReposition, positions, pathToRemovalNode, pathToRepositionNode } = deletionData;

  // Grupo del lienzo correspondiente al nodo a eliminar
  const removedG = treeG.select<SVGGElement>(`g#${nodeToDelete.data.id}`);

  // Grupo del lienzo correspondiente al nodo a reposicionar
  const repositionG = treeG.select<SVGGElement>(`g#${nodeToReposition.data.id}`);

  // Nodo padre del nodo a reposicionar
  const repositionParentNode = nodeToReposition.parent!.data.id;

  // Nodo padre del nodo a eliminar
  const removalParentNode = nodeToDelete.parent ? nodeToDelete.parent.data.id : null;

  // Nodo hijo del nodo a reposicionar
  const repositionChildNode = nodeToReposition.children?.filter((node) => !node.data.isPlaceholder)[0]?.data.id;

  // Grupo del lienzo correspondiente al enlace entre el nodo padre y el nodo a reposicionar
  const parentRepositionNodeLinkGroup = treeG.select<SVGGElement>(`g#link-${repositionParentNode}-${nodeToReposition.data.id}`);

  // Grupo del lienzo correspondiente al enlace entre el nodo a reposicionar y su nodo hijo (solo si el nodo hijo esta presente)
  const childRepositionNodeLinkGroup = repositionChildNode
    ? treeG.select<SVGGElement>(`g#link-${nodeToReposition.data.id}-${repositionChildNode}`)
    : null;

  // Grupo del lienzo correspondiente al nuevo enlace entre el nodo padre y el nodo hijo del nodo a reposicionar (solo si el nodo a reposicionar cuenta con un nodo hijo y no es hijo directo del nodo a eliminar)
  const newParentChildRepositionNodeLinkGroup = repositionChildNode && repositionParentNode !== nodeToDelete.data.id
    ? treeG.select<SVGGElement>(`g#link-${repositionParentNode}-${repositionChildNode}`)
    : null;

  // Estado visual inicial del nuevo enlace entre el nodo padre y el nodo hijo del nodo a reposicionar (si aplica)
  if (newParentChildRepositionNodeLinkGroup) {
    newParentChildRepositionNodeLinkGroup.style("opacity", 0);
  }

  // Ocultamos los nuevos enlaces del nodo a reposicionar producto de la reposición
  for (const child of nodeToDelete?.children ?? []) {
    if (child.data.id === nodeToReposition.data.id) continue;
    const childLinkGroup = treeG.select<SVGGElement>(`g#link-${nodeToReposition.data.id}-${child.data.id}`);
    childLinkGroup.style("opacity", 0);
  }
  const newParentRepositionNodeLinkGroup = removalParentNode
    ? treeG.select<SVGGElement>(`g#link-${removalParentNode}-${nodeToReposition.data.id}`)
    : null;
  if (newParentRepositionNodeLinkGroup) newParentRepositionNodeLinkGroup.style("opacity", 0);

  // Animación de recorrido desde el nodo raíz hasta el nodo que se va a eliminar
  await highlightRBTreePath(treeG, pathToRemovalNode, RB_COLORS.HIGHLIGHT);

  // Animación de recorrido desde el nodo a eliminar hasta el nodo a reposicionar
  await highlightRBTreePath(treeG, pathToRepositionNode, "#8fd3ff");

  // Desconexión del enlace entre el nodo padre y el nodo a reposicionar
  if (parentRepositionNodeLinkGroup) {
    await parentRepositionNodeLinkGroup
      .transition()
      .duration(1000)
      .style("opacity", 0)
      .remove()
      .end();
  }

  // Si el nodo a reposicionar no es hijo directo del nodo a eliminar
  if (repositionParentNode !== nodeToDelete.data.id) {
    // Desconexión del enlace entre el nodo a reposicionar y su hijo (si aplica)
    if (childRepositionNodeLinkGroup) {
      await childRepositionNodeLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove()
        .end();
    }

    // FadeOut del nodo a reposicionar
    const repositionNodeRing = repositionG.select<SVGCircleElement>("circle.node-ring");
    const repositionNodeCircle = repositionG.select<SVGCircleElement>("circle.node-container");
    const repositionNodeText = repositionG.select<SVGTextElement>("text.node-value");

    const repositionRingFadeOut = repositionNodeRing.transition().duration(750).attr("r", 0).end();

    const repositionCircleFadeOut = repositionNodeCircle.transition().duration(750).attr("r", 0).end();

    const repositionValueFadeOut = repositionNodeText.transition().duration(650).style("opacity", 0).end();

    await Promise.all([repositionRingFadeOut, repositionCircleFadeOut, repositionValueFadeOut]);

    // Si el nodo a reposicionar cuenta con un nodo hijo (el enlace entre el padre y el hijo existe)
    if (newParentChildRepositionNodeLinkGroup) {
      // Establecemos la forma inicial del nuevo enlace entre el nodo padre e hijo del nodo a reposicionar
      updateTreeLinkPath(treeG, repositionParentNode!, repositionChildNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, curvedPath);

      // Aparición del enlace entre el nodo padre e hijo del nodo a reposicionar
      await newParentChildRepositionNodeLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
    }

    // Reposicionar el nodo oculto en la posición del nodo eliminado
    repositionG.attr("transform", () => {
      const pos = positions.get(nodeToDelete.data.id)!;
      return `translate(${pos.x}, ${pos.y})`;
    });
  } else {
    // FadeOut del enlace entre el nodo a reposicionar y su hijo (si aplica)
    if (childRepositionNodeLinkGroup) {
      await childRepositionNodeLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .end();
    }

    // FadeOut del nodo a reposicionar
    const repositionNodeRing = repositionG.select<SVGCircleElement>("circle.node-ring");
    const repositionNodeCircle = repositionG.select<SVGCircleElement>("circle.node-container");
    const repositionNodeText = repositionG.select<SVGTextElement>("text.node-value");

    const repositionRingFadeOut = repositionNodeRing.transition().duration(750).attr("r", 0).end();

    const repositionCircleFadeOut = repositionNodeCircle.transition().duration(750).attr("r", 0).end();

    const repositionValueFadeOut = repositionNodeText.transition().duration(650).style("opacity", 0).end();

    await Promise.all([repositionRingFadeOut, repositionCircleFadeOut, repositionValueFadeOut]);

    // Reposicionar el nodo oculto en la posición del nodo a eliminar
    repositionG.attr("transform", () => {
      const pos = positions.get(nodeToDelete.data.id)!;
      return `translate(${pos.x}, ${pos.y})`;
    });

    if (childRepositionNodeLinkGroup) {
      // Establecemos la forma inicial del enlace entre el nodo a reposicionar y su hijo
      updateTreeLinkPath(treeG, nodeToReposition.data.id, repositionChildNode!, SVG_BINARY_TREE_VALUES.NODE_RADIUS, curvedPath);

      // Aparición del enlace entre el nodo a reposicionar y su hijo
      await childRepositionNodeLinkGroup
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .end();
    }
  }

  // Salida del nodo a eliminar.
  await deleteRBTreeNode(removedG);

  // FadeIn del nodo reposicionado
  await appearRBTreeNode(repositionG);

  // Establecemos la forma inicial de los nuevos enlaces del nodo a reposicionar producto de la reposición
  for (const child of nodeToDelete?.children ?? []) {
    if (child.data.id === nodeToReposition.data.id && repositionChildNode) continue;
    const childLinkGroup = treeG.select<SVGGElement>(`g#link-${nodeToReposition.data.id}-${child.data.id}`);
    updateTreeLinkPath(treeG, nodeToReposition.data.id, child.data.id, SVG_BINARY_TREE_VALUES.NODE_RADIUS, curvedPath);
    childLinkGroup.style("opacity", 1);
  }
  if (newParentRepositionNodeLinkGroup) {
    updateTreeLinkPath(treeG, removalParentNode!, nodeToReposition.data.id, SVG_BINARY_TREE_VALUES.NODE_RADIUS, curvedPath);
    newParentRepositionNodeLinkGroup.style("opacity", 1);
  }

  // Eliminar los enlaces obsoletos pertenecientes al nodo a eliminar
  treeG.selectAll<SVGGElement, TreeLinkData>("g.link")
    .filter(d => (d.sourceId === nodeToDelete.data.id && d.targetId !== nodeToReposition.data.id) || d.targetId === nodeToDelete.data.id)
    .style("opacity", 0)
    .remove();
}