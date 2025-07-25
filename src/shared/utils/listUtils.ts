import { ListNodeData } from "../../types";
import { NodoD } from "./nodes/NodoD";
import { NodoS } from "./nodes/NodoS";

export function linkedListToArray<T>(startNode: NodoS<T> | NodoD<T> | null) {
    const resultArray: ListNodeData<T>[] = [];
    if (!startNode) return resultArray;

    let currentNode: NodoS<T> | NodoD<T> | null = startNode;
    const firstNode = startNode;

    do {
        const nextNode: NodoS<T> | NodoD<T> | null = currentNode.getSiguiente();

        const nodeData: ListNodeData<T> = {
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