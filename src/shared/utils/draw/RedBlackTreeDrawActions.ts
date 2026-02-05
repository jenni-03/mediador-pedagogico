import { type HierarchyNode, type Selection } from "d3";
import { BSTSearchStep, HierarchyNodeData, RBDeleteStep, RBInsertStep, TreeLinkData } from "../../../domain/utils/types";
import {
  RB_COLORS,
  SVG_BINARY_TREE_VALUES,
  SVG_STYLE_VALUES,
} from "../../../domain/constants/consts";
import { RBFrame, RBAction } from "../../../domain/utils/types";
import type { Dispatch, SetStateAction } from "react";
import { curvedPath } from "../../../domain/utils/treeUtils";
import { drawTreeLinks, repositionTree, showTreeHint } from "./drawActionsUtilities";
import { animateEspecialBSTsRotation, animateGetInOrderSuccessor, updateTreeLinkPath } from "./BinaryTreeDrawActions";
import { EventBus } from "../../events/eventBus";
import { getArbolRNCode } from "../../../domain/constants/pseudocode/arbolRNCode";
import { delay } from "../../../domain/utils/simulatorUtils";

const arbolRNCode = getArbolRNCode();

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
 * Función encargada de animar el proceso de inserción de un nodo en un árbol Rojo-Negro.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param insertionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateInsertRBNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  treeOffset: { x: number; y: number },
  insertionData: {
    targetNodeId: string;
    parentNodeId: string | null;
    inserted: boolean;
    insertSteps: RBInsertStep[];
    nodesData: HierarchyNode<HierarchyNodeData<number>>[];
    linksData: TreeLinkData[];
    positions: Map<string, { x: number; y: number }>;
    actions: RBAction[];
    frames: RBFrame[];
    highlightColor: string;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = arbolRNCode.insert.labels;

  // Elementos implicados en la inserción 
  const { targetNodeId, parentNodeId, inserted, insertSteps } = insertionData;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "insert" });

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g#tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
    const seqG = svg.select<SVGGElement>("g#seq-container");
    seqG.style("opacity", 0);

    // Layout base
    let layoutNodes = insertionData.nodesData;
    let layoutLinks = insertionData.linksData;

    // Capas internas para nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g#links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

    // Renderizado inicial de los nodos y enlaces del árbol
    drawRBTreeNodes(nodesLayer, layoutNodes, insertionData.positions);
    drawTreeLinks(linksLayer, layoutLinks, insertionData.positions, curvedPath);

    // Grupos correspondientes a los nuevos elementos producto de la inserción
    let newNodeGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
    let parentNodeNewLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
    if (inserted) {
      newNodeGroup = treeG.select<SVGGElement>(`g#${targetNodeId}`);
      newNodeGroup.style("opacity", 0);

      if (parentNodeId) {
        parentNodeNewLinkGroup = treeG.select<SVGGElement>(
          `g#link-${parentNodeId}-${targetNodeId}`
        );
      } else {
        newNodeGroup.select<SVGCircleElement>("circle.node-ring").attr("stroke", "url(#rbRingRed)");
        newNodeGroup.select<SVGCircleElement>("circle.node-container").attr("fill", RB_COLORS.RED);
      }
    }

    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_PARENT });
    await delay(600);

    bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_CURSOR });
    await delay(600);

    let prevStep: RBInsertStep | null = null;
    for (const step of insertSteps) {
      const lastStep = prevStep;

      switch (step.type) {
        case "visit": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.BST_WHILE });

          if (step.at) {
            // Resaltado del nodo actual
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-ring`);

            nodeRing.style("opacity", 0);
            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", insertionData.highlightColor)
              .attr("stroke-width", 3.5)
              .end();
          } else {
            await delay(600);
          }
          break;
        }
        case "compare": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECLARE_CMP });
          await delay(600);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_DUPLICATE });
          await delay(600);

          if (step.cmp === 0) {
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-ring`);

            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_FALSE });

            // Restablecimiento del estilo visual original del nodo ubicado
            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", RB_COLORS.STROKE)
              .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
              .end();
            nodeRing.style("opacity", 0.9);

            // Resaltado final del nodo ubicado
            const p1 = nodeCircle
              .transition()
              .duration(300)
              .attr("r", 30)
              .transition()
              .duration(300)
              .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
              .end();

            const p2 = nodeRing
              .transition()
              .duration(300)
              .attr("r", 30 + 2.5)
              .transition()
              .duration(300)
              .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS + 2.5)
              .end();

            await Promise.all([p1, p2]);

            // Indicador visual de que el nodo a insertar ya existe en el árbol
            await showTreeHint(
              svg,
              { type: "node", id: step.at },
              { label: "Elemento", value: `ya existente` },
              insertionData.positions,
              treeOffset,
              {
                size: { width: 80, height: 35 },
                typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#1b2330", stroke: "#14b8a6" }
              }
            );
          }
          break;
        }
        case "advance": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_Y_PARENT });
          await delay(600);

          // Restablecimiento del estilo visual original del nodo visitado
          const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`);
          const nodeRing = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-ring`);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ADVANCE_CURSOR });
          await nodeCircle
            .transition()
            .duration(800)
            .attr("stroke", RB_COLORS.STROKE)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
          nodeRing.style("opacity", 0.9);
          break;
        }
        case "createNode": {
          // Aparición del nuevo nodo
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CREATE_LEAF_NODE });
          await repositionRBTree(treeG, layoutNodes, layoutLinks, insertionData.positions);
          if (newNodeGroup) await appearRBTreeNode(newNodeGroup);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_LEAF_PARENT });
          await delay(600);
          break;
        }
        case "attachNode": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.VALIDATE_EMPTY });
          await delay(600);

          if (step.side === "root") {
            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_ROOT_NODE });
            await delay(600);
          } else {
            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_IF_ATTACH_LEFT });
            await delay(600);

            if (step.side === "left") {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ATTACH_NODE_LEFT });
            } else {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_ATTACH_RIGHT });
              await delay(600);

              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ATTACH_NODE_RIGHT });
            }

            // Establecimiento del nuevo enlace entre el nodo padre y el nuevo nodo
            if (parentNodeNewLinkGroup) {
              await parentNodeNewLinkGroup
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
            }
          }

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CALL_FIXUP });
          await delay(600);
          break;
        }
        case "fixupWhileCheck": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.FIXUP_WHILE_CHECK });
          await delay(600);
          break;
        }
        case "parentSide": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECL_P });
          await delay(600);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.DECL_G });
          await delay(600);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_PARENT_IS_LEFT_CHILD });
          await delay(600);

          if (step.side === "right") {
            bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_PARENT_IS_RIGHT_CHILD });
            await delay(600);
          }
          break;
        }
        case "fixupCase": {
          if (lastStep?.type !== "rotate") {
            if (step.side === "left") {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_UNCLE_RIGHT });
              await delay(600);

              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_UNCLE_RED_LEFT });
              await delay(600);

              if (step.case !== 1) {
                bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_UNCLE_RED_LEFT });
                await delay(600);

                bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_TRIANGLE_LEFT });
                await delay(600);
              }
            } else {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.SET_UNCLE_LEFT });
              await delay(600);

              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_UNCLE_RED_RIGHT });
              await delay(600);

              if (step.case !== 1) {
                bus.emit("step:progress", { stepId: "insert", lineIndex: labels.ELSE_UNCLE_RED_RIGHT });
                await delay(600);

                bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_TRIANGLE_RIGHT });
                await delay(600);
              }
            }
          }

          // Indicador visual del caso de fixup a realizar
          const caseType = step.case === 1 ? "Caso 1" : step.case === 2 ? "Caso 2" : "Caso 3";
          const caseAction = step.case === 1 ? "tío rojo" : step.case === 2 ? "triángulo" : "línea";

          await showTreeHint(
            svg,
            { type: "node", id: targetNodeId },
            { label: `${caseType} ${step.side === "left" ? "(IZQ)" : "(DER)"}`, value: caseAction },
            insertionData.positions,
            treeOffset,
            {
              size: { width: 80, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );
          break;
        }
        case "recolor": {
          const action = insertionData.actions[step.actionIndex];
          if (action.kind !== "recolor") break;

          const { caseKind, count, side } = step;

          let lineIndex = labels.RECOLOR_ASSIGN;
          if (caseKind === "case1") {
            if (side === "left") {
              lineIndex =
                count === 1 ? labels.CASE1_LEFT_RECOLOR_P :
                  count === 2 ? labels.CASE1_LEFT_RECOLOR_Y :
                    labels.CASE1_LEFT_RECOLOR_G;
            } else {
              lineIndex =
                count === 1 ? labels.CASE1_RIGHT_RECOLOR_P :
                  count === 2 ? labels.CASE1_RIGHT_RECOLOR_Y :
                    labels.CASE1_RIGHT_RECOLOR_G;
            }
          } else if (caseKind === "case3") {
            if (side === "left") {
              lineIndex =
                count === 1 ? labels.CASE3_LEFT_RECOLOR_P :
                  labels.CASE3_LEFT_RECOLOR_G;
            } else {
              lineIndex =
                count === 1 ? labels.CASE3_RIGHT_RECOLOR_P :
                  labels.CASE3_RIGHT_RECOLOR_G;
            }
          } else {
            lineIndex = labels.RECOLOR_ROOT_BLACK;
          }

          bus.emit("step:progress", { stepId: "insert", lineIndex });
          await delay(600);

          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.VALIDATE_NULL_NODE });
          await delay(600);

          // Indicador visual del recoloreo a realizar
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RECOLOR_ASSIGN });
          await showTreeHint(
            svg,
            { type: "node", id: action.id },
            { label: `Colorear`, value: action.to === "BLACK" ? `${action.nodeBadge}->Negro` : `${action.nodeBadge}->Rojo` },
            insertionData.positions,
            treeOffset,
            {
              size: { width: 80, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );

          // Recoloreo del nodo
          const nodeToRecolor = treeG.select<SVGGElement>(`g#${action.id}`);
          await recolorRBNode(nodeToRecolor, action.to);

          if (caseKind === "case1" && count === 3) {
            const setZIndex = side === "left" ? labels.CASE1_LEFT_SET_Z_G : labels.CASE1_RIGHT_SET_Z_G;
            bus.emit("step:progress", { stepId: "insert", lineIndex: setZIndex });
            await delay(600);
          }
          break;
        }
        case "rotate": {
          const action = insertionData.actions[step.actionIndex];
          if (action.kind !== "rotation") break;

          if (step.caseKind === "case2") {
            if (step.dir === "left") {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE2_LEFT_SET_Z_P });
              await delay(600);

              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE2_LEFT_ROTATE_LEFT_P });
            } else {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE2_RIGHT_SET_Z_P });
              await delay(600);

              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE2_RIGHT_ROTATE_RIGHT_P });
            }
          } else {
            if (step.dir === "right") {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE3_LEFT_ROTATE_RIGHT_G });
            } else {
              bus.emit("step:progress", { stepId: "insert", lineIndex: labels.CASE3_RIGHT_ROTATE_LEFT_G });
            }
          }
          await delay(600);

          // Frame correspondiente a la rotación actual
          const frame = insertionData.frames[step.frameIndex + 1];
          const rotation = action.step;

          // Actualizar el layout al frame de la rotación
          layoutNodes = frame.nodes;
          layoutLinks = frame.links;

          // Indicador visual del tipo de rotación a aplicar
          await showTreeHint(
            svg,
            { type: "node", id: rotation.zId },
            { label: "Rotación", value: action.tag },
            insertionData.positions,
            treeOffset,
            {
              size: { width: 80, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );

          // Renderizado de los nuevos enlaces y actualización de la posición de los nodos según el nuevo layout
          drawTreeLinks(linksLayer, layoutLinks, insertionData.positions);
          drawRBTreeNodes(nodesLayer, layoutNodes, insertionData.positions);

          const parentOfUnbalanced = rotation.parentOfZId ?? null;
          const unbalancedNode = rotation.zId;
          const sonOfUnbalanced = rotation.yId;
          const rotationNode = rotation.BId ?? null;

          const isRightRotation = step.dir === "right";

          const baseLabels = {
            DECL_MAIN: isRightRotation ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
            DECL_AUX: isRightRotation ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
            SET_FIRST_LINK: isRightRotation ? labels.ROT_RIGHT_SET_X_RIGHT : labels.ROT_LEFT_SET_Y_LEFT,
            SET_SECOND_LINK: isRightRotation ? labels.ROT_RIGHT_SET_Y_LEFT : labels.ROT_LEFT_SET_X_RIGHT,
            SET_MAIN_PARENT: isRightRotation ? labels.ROT_RIGHT_SET_X_PARENT : labels.ROT_LEFT_SET_Y_PARENT,
            SET_UNBALANCED_PARENT: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT : labels.ROT_LEFT_SET_X_PARENT,
            IF_AUX_NOT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_T2_NOT_NULL : labels.ROT_LEFT_IF_T2_NOT_NULL,
            SET_AUX_PARENT: rotationNode
              ? (isRightRotation ? labels.ROT_RIGHT_SET_T2_PARENT : labels.ROT_LEFT_SET_T2_PARENT)
              : undefined,
          };

          const parentRelinkLabels =
            step.pivotSideOnParent === "root"
              ? {
                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                SET_ROOT: isRightRotation ? labels.ROT_RIGHT_SET_ROOT : labels.ROT_LEFT_SET_ROOT,
              }
              : step.pivotSideOnParent === "right"
                ? {
                  IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                  ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_RIGHT_ELSE_IF_Y_RIGHT : labels.ROT_LEFT_ELSE_IF_X_LEFT,
                  SET_UNBALANCED_PARENT_SIDE1: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT_RIGHT : labels.ROT_LEFT_SET_X_PARENT_LEFT,
                }
                : {
                  IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                  ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_RIGHT_ELSE_IF_Y_RIGHT : labels.ROT_LEFT_ELSE_IF_X_LEFT,
                  ELSE_UNBALANCED_SIDE2: isRightRotation ? labels.ROT_RIGHT_ELSE_Y_LEFT : labels.ROT_LEFT_ELSE_X_RIGHT,
                  SET_UNBALANCED_PARENT_SIDE2: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT_LEFT : labels.ROT_LEFT_SET_X_PARENT_RIGHT,
                };

          // Animación para rotación simple del subárbol
          await animateEspecialBSTsRotation(
            treeG,
            parentOfUnbalanced,
            unbalancedNode,
            sonOfUnbalanced!,
            rotationNode,
            repositionRBTree,
            {
              nodes: layoutNodes,
              links: layoutLinks,
              positions: insertionData.positions
            },
            {
              bus,
              stepId: "insert",
              labels: {
                ...baseLabels,
                ...parentRelinkLabels
              }
            }
          );

          if (step.caseKind === "case2") {
            const updateParentIndex = isRightRotation
              ? labels.CASE2_RIGHT_UPDATE_P
              : labels.CASE2_LEFT_UPDATE_P;

            bus.emit("step:progress", { stepId: "insert", lineIndex: updateParentIndex });
            await delay(600);
          }
          break;
        }
        case "rootBlackCheck": {
          bus.emit("step:progress", { stepId: "insert", lineIndex: labels.IF_ROOT_NOT_BLACK });
          await delay(600);
          break;
        }
        case "return": {
          break;
        }
      }

      prevStep = step;
    }

    if (insertionData.inserted) {
      bus.emit("step:progress", { stepId: "insert", lineIndex: labels.INC_SIZE });
      await delay(600);

      bus.emit("step:progress", { stepId: "insert", lineIndex: labels.RETURN_TRUE });
      await delay(600);
    }

    // Fin de la operación
    bus.emit("op:done", { op: "insert" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de eliminación de un nodo en un árbol Rojo-Negro.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param deletionData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateDeleteRBNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  treeOffset: { x: number; y: number },
  deletionData: {
    targetNodeId: string | null;
    parentNodeId: string | null;
    successorNodeId: string | null;
    successorParentNodeId: string | null;
    replacementNodeId: string | null;
    pathToSuccessor: string[];
    deleted: boolean;
    deleteSteps: RBDeleteStep[];
    remainingNodesData: HierarchyNode<HierarchyNodeData<number>>[];
    remainingLinksData: TreeLinkData[];
    positions: Map<string, { x: number, y: number }>;
    actions: RBAction[];
    frames: RBFrame[];
    highlightTargetColor: string;
    highlightSuccessorColor: string;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = arbolRNCode.delete.labels;

  // Elementos implicados en la eliminación 
  const {
    deleteSteps,
    deleted,
    actions,
    frames
  } = deletionData;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "delete" });

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g#tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculto)
    const seqG = svg.select<SVGGElement>("g#seq-container");
    seqG.style("opacity", 0);

    // Layout base
    let layoutNodes = deletionData.remainingNodesData;
    let layoutLinks = deletionData.remainingLinksData;

    // Capas internas para nodos y enlaces
    const linksLayer = treeG.select<SVGGElement>("g#links-layer");
    const nodesLayer = treeG.select<SVGGElement>("g#nodes-layer");

    // Renderizado inicial de los nodos y enlaces del árbol
    drawRBTreeNodes(nodesLayer, layoutNodes, deletionData.positions);
    drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_EMPTY });
    await delay(600);

    bus.emit("step:progress", { stepId: "delete", lineIndex: labels.INIT_Z });
    await delay(600);

    let removalNodeId: string | null = null;
    let parentReplacementNodeNewLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
    let replacementNodeNewRightLinkGroup: Selection<SVGGElement, unknown, null, undefined> | null = null;
    let prevStep: RBDeleteStep | null = null;
    for (const step of deleteSteps) {
      const lastStep = prevStep;

      switch (step.type) {
        case "visit": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.BST_WHILE });

          if (step.at) {
            // Resaltado del nodo actual
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-ring`);

            nodeRing.style("opacity", 0);
            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", deletionData.highlightTargetColor)
              .attr("stroke-width", 3.5)
              .end();
          } else {
            await delay(600);
          }
          break;
        }
        case "compare": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECLARE_CMP });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_MATCH_BREAK });
          await delay(600);
          break;
        }
        case "advance": {
          // Restablecimiento del estilo visual original del nodo visitado
          const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`);
          const nodeRing = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-ring`);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ADVANCE_Z });
          await nodeCircle
            .transition()
            .duration(800)
            .attr("stroke", RB_COLORS.STROKE)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
          nodeRing.style("opacity", 0.9);
          break;
        }
        case "checkMatch": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NOT_FOUND });

          if (!step.found) {
            // Indicador visual de que el nodo a eliminar no existe en el árbol
            const firstVisited = deletionData.deleteSteps
              .filter(s => s.type === "visit")
              .at(0);

            await showTreeHint(
              svg,
              { type: "node", id: firstVisited!.at! },
              { label: "Elemento", value: `no ubicado` },
              deletionData.positions,
              treeOffset,
              {
                size: { width: 80, height: 35 },
                typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
                anchor: { side: "below", dx: 10, dy: -8 },
                palette: { bg: "#1b2330", stroke: "#14b8a6" }
              }
            );
          } else {
            await delay(600);
          }
          break;
        }
        case "deleteCase": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.INIT_Y });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SAVE_Y_ORIGINAL_COLOR });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_X });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_XPARENT });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_NO_LEFT_CHILD });
          await delay(600);

          if (step.kind === "noLeft") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_X_RIGHT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_XPARENT_RIGHT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_Z_RIGHT });
            await delay(600);
          } else if (step.kind === "noRight") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_NO_RIGHT_CHILD });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_X_LEFT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_XPARENT_LEFT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_Z_LEFT });
            await delay(600);
          } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_IF_NO_RIGHT_CHILD });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.ELSE_TWO_CHILDREN });
            await delay(600);

            // Recorrido de los nodos desde el nodo objetivo hasta el sucesor (nodo a eliminar)
            await animateGetInOrderSuccessor(
              treeG,
              deletionData.pathToSuccessor,
              deletionData.highlightSuccessorColor,
              "delete",
              bus,
              {
                DECLARE_SUCC_NODE: labels.DECL_SUCC,
                WHILE_TRAVERSAL: labels.WHILE_SUCC_LEFT,
                SET_SUCC_NODE: labels.ADVANCE_SUCC_LEFT,
              }
            );

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_Y_SUCC });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.UPDATE_Y_ORIGINAL_COLOR });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_X_SUCC_RIGHT });
            await delay(600);
          }
          break;
        }
        case "succParentCheck": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_SUCC_PARENT_IS_Z });
          await delay(600);

          bus.emit("step:progress", {
            stepId: "delete", lineIndex: step.directChild ? labels.SET_XPARENT_DIRECT :
              labels.ELSE_SUCC_NOT_DIRECT
          });
          await delay(600);

          bus.emit("step:progress", {
            stepId: "delete", lineIndex: step.directChild ? labels.TRANSPLANT_Z_WITH_Y :
              labels.TRANSPLANT_SUCC_WITH_RIGHT
          });
          await delay(600);
          break;
        }
        case "transplant": {
          if (lastStep?.type === "setParent") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_Z_WITH_Y });
            await delay(600);
          }

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_DECLARE_UP });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_IF_UP_NULL });
          await delay(600);

          if (step.uSide === "root") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_SET_ROOT });
          } else if (step.uSide === "left") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_ELSEIF_U_LEFT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_SET_UP_LEFT });
          } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_ELSEIF_U_LEFT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_ELSE_U_RIGHT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_SET_UP_RIGHT });
          }

          // Grupo correspondiente al nodo a eliminar
          const removalNodeGroup = treeG.select<SVGGElement>(`g#${step.uId}`);

          // Grupos correspondientes a los enlaces asociados al nodo a eliminar
          const parentRemovalNodeCurrLinkGroup = step.uParentId
            ? treeG.select<SVGGElement>(`g#link-${step.uParentId}-${step.uId}`)
            : null;

          const removalNodeLinkGroup = step.vId
            ? treeG.select<SVGGElement>(`g#link-${step.uId}-${step.vId}`)
            : null;

          const parentRemovalNodeNewLinkGroup = step.uParentId && step.vId
            ? treeG.select<SVGGElement>(`g#link-${step.uParentId}-${step.vId}`)
            : null;

          const isLeafOrSingleChild = lastStep?.type === "deleteCase" && (lastStep.kind === "noLeft" || lastStep.kind === "noRight");
          const isTwoChildrenNoDirectFirstTransplant = lastStep?.type === "succParentCheck" && !lastStep.directChild;
          const isTwoChildrenNoDirectSecondTransplant = lastStep?.type === "setParent";

          // Desconexión del actual enlace entre el nodo padre y el nodo a eliminar
          if (parentRemovalNodeCurrLinkGroup) {
            await parentRemovalNodeCurrLinkGroup
              .transition()
              .duration(800)
              .style("opacity", 0)
              .remove()
              .end();
          }

          // Desconexión del actual enlace entre el nodo a eliminar y su reemplazo
          if (removalNodeLinkGroup && !isTwoChildrenNoDirectSecondTransplant) {
            await removalNodeLinkGroup
              .transition()
              .duration(800)
              .style("opacity", 0)
              .remove()
              .end();
          }

          // Salida del nodo a eliminar
          if (isLeafOrSingleChild) {
            removalNodeId = step.uId;
            await deleteRBTreeNode(removalNodeGroup);
          } else if (isTwoChildrenNoDirectFirstTransplant) {
            await removalNodeGroup
              .transition()
              .duration(800)
              .style("opacity", 0)
              .end();
          } else {
            await delay(600);
          }

          if ((step.uParentId && step.vId) && (isLeafOrSingleChild || isTwoChildrenNoDirectFirstTransplant)) {
            // Forma inicial del nuevo enlace entre el nodo padre del nodo a eliminar y su reemplazo
            updateTreeLinkPath(treeG, step.uParentId, step.vId, SVG_BINARY_TREE_VALUES.NODE_RADIUS, curvedPath);

            // Establecimiento del nuevo enlace formado entre el nodo padre del nodo a eliminar y su reemplazo
            await parentRemovalNodeNewLinkGroup!
              .transition()
              .duration(800)
              .style("opacity", 1)
              .end();
          } else {
            parentReplacementNodeNewLinkGroup = parentRemovalNodeNewLinkGroup;
          }

          // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
          if (isLeafOrSingleChild || isTwoChildrenNoDirectFirstTransplant) {
            await repositionRBTree(treeG, layoutNodes, layoutLinks, deletionData.positions);
          }

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.TRANSPLANT_SET_V_PARENT_UP });
          await delay(600);
          break;
        }
        case "linkChild": {
          if (step.side === "left") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.LINK_Y_LEFT_TO_Z_LEFT });

            // Desconexión del actual enlace entre el nodo padre previo y su hijo izquierdo
            if (step.childId) {
              await treeG.select<SVGGElement>(`g#link-${step.prevParentId}-${step.childId}`)
                .transition()
                .duration(800)
                .style("opacity", 0)
                .remove()
                .end();
            }

            // Salida del nodo a eliminar
            const removalNodeGroup = treeG.select<SVGGElement>(`g#${step.prevParentId}`);
            removalNodeId = step.prevParentId;
            await deleteRBTreeNode(removalNodeGroup);

            if (replacementNodeNewRightLinkGroup) {
              // Establecimiento del nodo que toma el lugar del nodo eliminado
              await appearRBTreeNode(treeG.select<SVGGElement>(`g#${step.newParentId}`));

              // Establecimiento del nuevo enlace entre el nodo que toma el lugar del nodo eliminado y el hijo derecho del padre previo
              await replacementNodeNewRightLinkGroup
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
            } else {
              // Reposicionamiento de los nodos y enlaces del árbol luego de la salida del nodo
              await repositionRBTree(treeG, layoutNodes, layoutLinks, deletionData.positions);
            }

            // Establecimiento del nuevo enlace entre el nuevo padre y el nodo que toma el lugar del nodo eliminado
            if (parentReplacementNodeNewLinkGroup) {
              await parentReplacementNodeNewLinkGroup
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
            }

            // Establecimiento del nuevo enlace entre el nodo que toma el lugar del nodo eliminado y el hijo izquierdo del padre previo
            if (step.childId) {
              await treeG.select<SVGGElement>(`g#link-${step.newParentId}-${step.childId}`)
                .transition()
                .duration(800)
                .style("opacity", 1)
                .end();
            }

            // Restablecimiento del estilo visual original del nodo que toma el lugar del nodo eliminado
            await treeG.select<SVGCircleElement>(`g#${step.newParentId} circle.node-container`)
              .transition()
              .duration(800)
              .attr("stroke", RB_COLORS.STROKE)
              .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
              .end();
            treeG.select<SVGCircleElement>(`g#${step.newParentId} circle.node-ring`).style("opacity", 0.9);
          } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.LINK_Y_RIGHT_TO_Z_RIGHT });

            if (step.childId) {
              // Desconexión del actual enlace entre el nodo padre previo y su hijo derecho
              await treeG.select<SVGGElement>(`g#link-${step.prevParentId}-${step.childId}`)
                .transition()
                .duration(800)
                .style("opacity", 0)
                .remove()
                .end();

              replacementNodeNewRightLinkGroup = treeG.select<SVGGElement>(`g#link-${step.newParentId}-${step.childId}`);
            } else {
              await delay(600);
            }
          }
          break;
        }
        case "setParent": {
          const ifIndex = step.side === "left" ? labels.IF_Y_LEFT_NOT_NULL : labels.IF_Y_RIGHT_NOT_NULL;
          const setParentIndex = step.side === "left" ? labels.SET_Y_LEFT_PARENT : labels.SET_Y_RIGHT_PARENT;

          bus.emit("step:progress", { stepId: "delete", lineIndex: ifIndex });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: setParentIndex });
          await delay(600);

          if (step.side === "right") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_XPARENT_NOT_DIRECT });
            await delay(600);
          }
          break;
        }
        case "fixupCall": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_Y_ORIGINAL_BLACK_CALL_FIXUP });
          await delay(600);

          if (step.needed) {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CALL_DELETE_FIXUP });
            await delay(600);
          }
          break;
        }
        case "fixupWhileCheck": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.FIXUP_WHILE });
          await delay(600);
          break;
        }
        case "resolveParent": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RESOLVE_P });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_P_NULL_BREAK });
          await delay(600);
          break;
        }
        case "resolveSibling": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_X_IS_LEFT });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_W });
          await delay(600);
          break;
        }
        case "fixupCase": {
          if (lastStep?.type !== "rotate" || (lastStep.type === "rotate" && lastStep.caseKind === "fixupA")) {
            if (lastStep?.type !== "rotate") {
              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_W_RED });
              await delay(600);
            }

            if (step.case === "B" || step.case === "C" || step.case === "D") {
              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_WLEFT });
              await delay(600);

              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DECL_WRIGHT });
              await delay(600);

              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.IF_CASE2_W_CHILDREN_BLACK });
              await delay(600);

              if (step.case === "C" || step.case === "D") {
                const xSideLabel = step.side === "left" ? labels.IF_X_LEFT_BRANCH : labels.ELSE_MIRROR_BRANCH;
                bus.emit("step:progress", { stepId: "delete", lineIndex: xSideLabel });
                await delay(600);

                const wChildLabel = step.side === "left" ? labels.CASE3_IF_WRIGHT_BLACK : labels.MIRROR_CASE3_IF_WLEFT_BLACK;
                bus.emit("step:progress", { stepId: "delete", lineIndex: wChildLabel });
                await delay(600);
              }
            }
          }

          // Indicador visual del caso de fixup a realizar
          const caseType = step.case === "A" ? "Caso 1" : step.case === "B" ? "Caso 2" : step.case === "C" ? "Caso 3" : "Caso 4";
          const caseAction = step.case === "A" ? "hermano rojo" : step.case === "B" ? "hermano negro" : step.case === "C"
            ? "hijo cercano rojo" : "hijo lejano rojo";

          await showTreeHint(
            svg,
            { type: "node", id: step.nodeId },
            { label: `${caseType} ${step.case === "A" || step.case === "B" ? "" : step.side === "left" ? "(IZQ)" : "(DER)"}`, value: caseAction },
            deletionData.positions,
            treeOffset,
            {
              size: { width: 90, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );
          break;
        }
        case "checkNode": {
          let lineIndex = labels.CASE2_IF_W_NOT_NULL;
          if (step.nodeType === "HijoCer") {
            lineIndex = step.case === "C" && step.side === "left"
              ? labels.CASE3_IF_WLEFT_NOT_NULL
              : labels.MIRROR_CASE3_IF_WRIGHT_NOT_NULL;
          } else if (step.nodeType === "HijoLej") {
            lineIndex = step.case === "D" && step.side === "left"
              ? labels.CASE4_IF_WRIGHT_NOT_NULL
              : labels.MIRROR_CASE4_IF_WLEFT_NOT_NULL;
          } else {
            if (step.case !== "B")
              lineIndex = step.case === "C" && step.side === "left"
                ? labels.CASE3_IF_W_NOT_NULL
                : lineIndex = step.case === "C" && step.side === "right"
                  ? labels.MIRROR_CASE3_IF_W_NOT_NULL
                  : lineIndex = step.case === "D" && step.side === "left"
                    ? labels.CASE4_IF_W_NOT_NULL
                    : labels.MIRROR_CASE4_IF_W_NOT_NULL;
          }

          bus.emit("step:progress", { stepId: "delete", lineIndex });
          await delay(600);
          break;
        }
        case "recolor": {
          const action = actions[step.actionIndex];
          if (action.kind !== "recolor") break;

          const { kind, count, side, case: caseKind } = step;

          let lineIndex = labels.RECOLOR_ASSIGN;
          if (kind === "copyZColor") {
            lineIndex = labels.COPY_Z_COLOR_TO_Y;
          } else if (caseKind === "A") {
            lineIndex =
              count === 1 ? labels.CASE1_RECOLOR_W_BLACK :
                labels.CASE1_RECOLOR_P_RED
          } else if (caseKind === "B") {
            lineIndex = labels.CASE2_RECOLOR_W_RED;
          } else if (caseKind === "C") {
            if (side === "left") {
              lineIndex =
                count === 1 ? labels.CASE3_RECOLOR_WLEFT_BLACK :
                  labels.CASE3_RECOLOR_W_RED;
            } else {
              lineIndex =
                count === 1 ? labels.MIRROR_CASE3_RECOLOR_WRIGHT_BLACK :
                  labels.MIRROR_CASE3_RECOLOR_W_RED;
            }
          } else if (caseKind === "D") {
            if (side === "left") {
              lineIndex =
                count === 1 ? labels.CASE4_RECOLOR_W_COLOR_OF_P :
                  count === 2 ? labels.CASE4_RECOLOR_P_BLACK
                    : labels.CASE4_RECOLOR_WRIGHT_BLACK;
            } else {
              lineIndex =
                count === 1 ? labels.MIRROR_CASE4_RECOLOR_W_COLOR_OF_P :
                  count === 2 ? labels.MIRROR_CASE4_RECOLOR_P_BLACK
                    : labels.MIRROR_CASE4_RECOLOR_WLEFT_BLACK;
            }
          } else {
            lineIndex = labels.FINAL_RECOLOR_X_BLACK;
          }

          bus.emit("step:progress", { stepId: "delete", lineIndex });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.VALIDATE_NULL_NODE });
          await delay(600);

          // Indicador visual del recoloreo a realizar
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RECOLOR_ASSIGN });
          await showTreeHint(
            svg,
            { type: "node", id: action.id },
            { label: `Colorear`, value: action.to === "BLACK" ? `${action.nodeBadge}->Negro` : `${action.nodeBadge}->Rojo` },
            deletionData.positions,
            treeOffset,
            {
              size: { width: 95, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 15, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );

          // Recoloreo del nodo
          const nodeToRecolor = treeG.select<SVGGElement>(`g#${action.id}`);
          await recolorRBNode(nodeToRecolor, action.to);
          break;
        }
        case "moveUp": {
          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE2_MOVE_X_UP });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE2_SET_XPARENT });
          await delay(600);

          bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE2_CONTINUE });
          await delay(600);
          break;
        }
        case "rotate": {
          const action = actions[step.actionIndex];
          if (action.kind !== "rotation") break;

          if (step.caseKind === "fixupA") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE1_IF_X_LEFT });
            await delay(600);

            if (step.dir === "left") {
              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE1_ROTATE_LEFT_P });
            } else {
              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE1_ELSE_X_RIGHT });
              await delay(600);

              bus.emit("step:progress", { stepId: "delete", lineIndex: labels.CASE1_ROTATE_RIGHT_P });
            }
          } else if (step.caseKind === "fixupC") {
            bus.emit("step:progress", { stepId: "delete", lineIndex: step.dir === "right" ? labels.CASE3_ROTATE_RIGHT_W : labels.MIRROR_CASE3_ROTATE_LEFT_W });
          } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: step.dir === "left" ? labels.CASE4_ROTATE_LEFT_P : labels.MIRROR_CASE4_ROTATE_RIGHT_P });
          }
          await delay(600);

          // Frame correspondiente a la rotación actual
          const frame = frames[step.frameIndex + 1];
          const rotation = action.step;

          // Actualizar el layout al frame de la rotación
          layoutNodes = frame.nodes;
          layoutLinks = frame.links;

          // Indicador visual del tipo de rotación a aplicar
          await showTreeHint(
            svg,
            { type: "node", id: rotation.zId },
            { label: "Rotación", value: action.tag },
            deletionData.positions,
            treeOffset,
            {
              size: { width: 80, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );

          // Renderizado de los nuevos enlaces y actualización de la posición de los nodos según el nuevo layout
          drawTreeLinks(linksLayer, layoutLinks, deletionData.positions);
          drawRBTreeNodes(nodesLayer, layoutNodes, deletionData.positions);

          const parentOfUnbalanced = rotation.parentOfZId ?? null;
          const unbalancedNode = rotation.zId;
          const sonOfUnbalanced = rotation.yId;
          const rotationNode = rotation.BId ?? null;

          const isRightRotation = step.dir === "right";

          const baseLabels = {
            DECL_MAIN: isRightRotation ? labels.ROT_RIGHT_DECL_X : labels.ROT_LEFT_DECL_Y,
            DECL_AUX: isRightRotation ? labels.ROT_RIGHT_DECL_T2 : labels.ROT_LEFT_DECL_T2,
            SET_FIRST_LINK: isRightRotation ? labels.ROT_RIGHT_SET_X_RIGHT : labels.ROT_LEFT_SET_Y_LEFT,
            SET_SECOND_LINK: isRightRotation ? labels.ROT_RIGHT_SET_Y_LEFT : labels.ROT_LEFT_SET_X_RIGHT,
            SET_MAIN_PARENT: isRightRotation ? labels.ROT_RIGHT_SET_X_PARENT : labels.ROT_LEFT_SET_Y_PARENT,
            SET_UNBALANCED_PARENT: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT : labels.ROT_LEFT_SET_X_PARENT,
            IF_AUX_NOT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_T2_NOT_NULL : labels.ROT_LEFT_IF_T2_NOT_NULL,
            SET_AUX_PARENT: rotationNode
              ? (isRightRotation ? labels.ROT_RIGHT_SET_T2_PARENT : labels.ROT_LEFT_SET_T2_PARENT)
              : undefined,
          };

          const parentRelinkLabels =
            step.pivotSideOnParent === "root"
              ? {
                IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                SET_ROOT: isRightRotation ? labels.ROT_RIGHT_SET_ROOT : labels.ROT_LEFT_SET_ROOT,
              }
              : step.pivotSideOnParent === "right"
                ? {
                  IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                  ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_RIGHT_ELSE_IF_Y_RIGHT : labels.ROT_LEFT_ELSE_IF_X_LEFT,
                  SET_UNBALANCED_PARENT_SIDE1: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT_RIGHT : labels.ROT_LEFT_SET_X_PARENT_LEFT,
                }
                : {
                  IF_UNBALANCED_PARENT_NULL: isRightRotation ? labels.ROT_RIGHT_IF_Y_PARENT_NULL : labels.ROT_LEFT_IF_X_PARENT_NULL,
                  ELSE_IF_UNBALANCED_SIDE1: isRightRotation ? labels.ROT_RIGHT_ELSE_IF_Y_RIGHT : labels.ROT_LEFT_ELSE_IF_X_LEFT,
                  ELSE_UNBALANCED_SIDE2: isRightRotation ? labels.ROT_RIGHT_ELSE_Y_LEFT : labels.ROT_LEFT_ELSE_X_RIGHT,
                  SET_UNBALANCED_PARENT_SIDE2: isRightRotation ? labels.ROT_RIGHT_SET_Y_PARENT_LEFT : labels.ROT_LEFT_SET_X_PARENT_RIGHT,
                };

          // Animación para rotación simple del subárbol
          await animateEspecialBSTsRotation(
            treeG,
            parentOfUnbalanced,
            unbalancedNode,
            sonOfUnbalanced!,
            rotationNode,
            repositionRBTree,
            {
              nodes: layoutNodes,
              links: layoutLinks,
              positions: deletionData.positions
            },
            {
              bus,
              stepId: "delete",
              labels: {
                ...baseLabels,
                ...parentRelinkLabels
              }
            }
          );

          if (step.caseKind === "fixupA" || step.caseKind === "fixupC") {
            let updateParentIndex = labels.CASE1_UPDATE_XPARENT;
            let updateSiblingIndex = labels.CASE1_UPDATE_W;

            if (step.caseKind === "fixupC") {
              updateParentIndex = step.dir === "left" ? labels.CASE3_UPDATE_XPARENT : labels.MIRROR_CASE3_UPDATE_XPARENT;
              updateSiblingIndex = step.dir === "left" ? labels.CASE3_UPDATE_W : labels.MIRROR_CASE3_UPDATE_W;
            }

            bus.emit("step:progress", { stepId: "delete", lineIndex: updateParentIndex });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: updateSiblingIndex });
            await delay(600);
          } else {
            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_X_ROOT });
            await delay(600);

            bus.emit("step:progress", { stepId: "delete", lineIndex: labels.SET_XPARENT_NULL });
            await delay(600);
          }
        }
      }

      prevStep = step;
    }

    if (deleted) {
      bus.emit("step:progress", { stepId: "delete", lineIndex: labels.DEC_SIZE });
      await delay(600);

      bus.emit("step:progress", { stepId: "delete", lineIndex: labels.RETURN_TRUE });
      await delay(600);

      // Limpiamos el registro del nodo eliminado
      deletionData.positions.delete(removalNodeId!);
    }

    // Fin de la operación
    bus.emit("op:done", { op: "delete" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
}

/**
 * Función encargada de animar el proceso de búsqueda de un nodo en un árbol Rojo-Negro.
 * Se emiten eventos en cada paso para sincronizar la visualización con la lógica de la operación.
 * @param svg Selección D3 del elemento SVG donde se aplicará la animación.
 * @param treeOffset Coordenadas de desplazamiento para el posicionamiento de los elementos del árbol dentro del SVG.
 * @param searchData Objeto con información del árbol necesaria para la animación.
 * @param bus Instancia de `EventBus` usada para la emisión de eventos de progreso durante la animación.
 * @param resetQueryValues Función para restablecer los valores de la query del usuario.
 * @param setIsAnimating Función para establecer el estado de animación.
 * @returns Promise<`void`>. Se resuelve cuando todas las animaciones han finalizado.
 */
export async function animateSearchRBNode(
  svg: Selection<SVGSVGElement, unknown, null, undefined>,
  treeOffset: { x: number; y: number },
  searchData: {
    targetNodeId: string | null;
    found: boolean;
    searchSteps: BSTSearchStep[];
    positions: Map<string, { x: number; y: number }>;
    highlightColor: string;
  },
  bus: EventBus,
  resetQueryValues: () => void,
  setIsAnimating: Dispatch<SetStateAction<boolean>>
) {
  // Etiquetas para el registro de eventos
  const labels = arbolRNCode.search.labels;

  // Elementos implicados en la búsqueda 
  const { targetNodeId, found, searchSteps } = searchData;

  try {
    // Inicio de la operación
    bus.emit("op:start", { op: "search" });

    // Grupo contenedor de nodos y enlaces del árbol
    const treeG = svg.select<SVGGElement>("g#tree-container");

    // Grupo contenedor de la secuencia de valores de recorrido (inicialmente oculta)
    const seqG = svg.select<SVGGElement>("g#seq-container");
    seqG.style("opacity", 0);

    bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_RECURSIVE_SEARCH });
    await delay(600);

    for (const step of searchSteps) {
      switch (step.type) {
        case "checkNull": {
          bus.emit("step:progress", {
            stepId: "search",
            lineIndex: labels.IF_NULL_NODE
          });

          if (step.isNull) {
            await delay(600);
            bus.emit("step:progress", {
              stepId: "search",
              lineIndex: labels.RETURN_FALSE
            });
            await delay(600);
          } else if (step.at) {
            // Resaltado del nodo actual
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.at} circle.node-ring`);

            nodeRing.style("opacity", 0);
            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", searchData.highlightColor)
              .attr("stroke-width", 3.5)
              .end();
          }
          break;
        }
        case "compare": {
          bus.emit("step:progress", { stepId: "search", lineIndex: labels.DECLARE_CMP });
          await delay(600);

          if (step.cmp === -1) {
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_CMP_LT_ZERO });
            await delay(600);
          } else {
            bus.emit("step:progress", { stepId: "search", lineIndex: labels.IF_CMP_LT_ZERO });
            await delay(600);

            bus.emit("step:progress", { stepId: "search", lineIndex: labels.ELSE_IF_CMP_GT_ZERO });
            await delay(600);

            if (step.cmp === 0) {
              bus.emit("step:progress", { stepId: "search", lineIndex: labels.ELSE_FOUND });
              await delay(600);
            }
          }
          break;
        }
        case "goLeft": {
          // Restablecimiento del estilo visual original del nodo visitado
          const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`);
          const nodeRing = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-ring`);

          bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_LEFT_SUBTREE });
          await nodeCircle
            .transition()
            .duration(800)
            .attr("stroke", RB_COLORS.STROKE)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
          nodeRing.style("opacity", 0.9);
          break;
        }
        case "goRight": {
          // Restablecimiento del estilo visual original del nodo visitado
          const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`);
          const nodeRing = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-ring`);

          bus.emit("step:progress", { stepId: "search", lineIndex: labels.CALL_RIGHT_SUBTREE });
          await nodeCircle
            .transition()
            .duration(800)
            .attr("stroke", RB_COLORS.STROKE)
            .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
            .end();
          nodeRing.style("opacity", 0.9);
          break;
        }
        case "match": {
          // Resaltado del nodo identificado
          bus.emit("step:progress", {
            stepId: "search",
            lineIndex: labels.RETURN_TRUE
          });
          await treeG.select<SVGCircleElement>(`g#${step.at} circle.node-container`)
            .transition()
            .duration(300)
            .attr("r", 30)
            .transition()
            .duration(300)
            .attr("r", SVG_BINARY_TREE_VALUES.NODE_RADIUS)
            .end();

          // Indicador visual de que el nodo existe en el árbol
          await showTreeHint(
            svg,
            { type: "node", id: targetNodeId! },
            { label: "Elemento", value: `ubicado` },
            searchData.positions,
            treeOffset,
            {
              size: { width: 80, height: 35 },
              typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
              anchor: { side: "below", dx: 10, dy: -8 },
              palette: { bg: "#1b2330", stroke: "#14b8a6" }
            }
          );
          break;
        }
        case "return": {
          if (step.to !== null && step.via !== "root") {
            const lineToRemark = step.via === "left" ? labels.CALL_LEFT_SUBTREE : labels.CALL_RIGHT_SUBTREE;
            bus.emit("step:progress", {
              stepId: "search",
              lineIndex: lineToRemark
            });
            await delay(600);
          }

          if (step.from) {
            // Restablecimiento del estilo visual original del nodo (backtracking)
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.from} circle.node-ring`);

            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", RB_COLORS.STROKE)
              .attr("stroke-width", SVG_STYLE_VALUES.RECT_STROKE_WIDTH)
              .end();
            nodeRing.style("opacity", 0.9);
          }
          if (step.to) {
            // Resaltado del nodo en la nueva llamada (backtracking)
            const nodeCircle = treeG.select<SVGCircleElement>(`g#${step.to} circle.node-container`);
            const nodeRing = treeG.select<SVGCircleElement>(`g#${step.to} circle.node-ring`);

            nodeRing.style("opacity", 0);
            await nodeCircle
              .transition()
              .duration(800)
              .attr("stroke", searchData.highlightColor)
              .attr("stroke-width", 3.5)
              .end();
          }
          break;
        }
      }
    }

    bus.emit("step:progress", {
      stepId: "search",
      lineIndex: labels.CALL_RECURSIVE_SEARCH
    });

    if (!found) {
      // Indicador visual de que el nodo no existe en el árbol
      const firstVisited = searchSteps
        .filter(s => s.type === "checkNull")
        .at(0);

      await showTreeHint(
        svg,
        { type: "node", id: firstVisited!.at! },
        { label: "Elemento", value: `no ubicado` },
        searchData.positions,
        treeOffset,
        {
          size: { width: 80, height: 35 },
          typography: { labelFz: "10px", valueFz: "10px", labelFw: 800, valueFw: 800 },
          anchor: { side: "below", dx: 10, dy: -8 },
          palette: { bg: "#1b2330", stroke: "#14b8a6" }
        }
      );
    } else {
      await delay(600);
    }

    // Fin de la operación
    bus.emit("op:done", { op: "search" });
  } finally {
    resetQueryValues();
    setIsAnimating(false);
  }
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
 * Función encargada de animar el recoloreo de un nodo Rojo-Negro.
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