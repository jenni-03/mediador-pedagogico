import { ListNodeData } from "../../types";
import { NodoD } from "./nodes/NodoD";
import { NodoS } from "./nodes/NodoS";

export function linkedListToArray(startNode: NodoS | NodoD | null) {
    const resultArray: ListNodeData[] = [];
    if (!startNode) return resultArray;

    let currentNode: NodoS | NodoD | null = startNode;
    const firstNode = startNode;

    do {
        const nextNode: NodoS | NodoD | null = currentNode.getSiguiente();

        const nodeData: ListNodeData = {
            id: currentNode.getId(),
            value: currentNode.getValor(),
            next: nextNode ? nextNode.getId() : null,
            memoryAddress: currentNode.getDireccionMemoria()
        }

        if (currentNode instanceof NodoD) {
            const prevNode = currentNode.getAnterior();
            nodeData.prev = prevNode ? prevNode.getId() : null;
        }

        resultArray.push(nodeData);
        currentNode = nextNode;
    }
    while (currentNode && currentNode !== firstNode);

    return resultArray;
}