import { NodoS } from "./nodes/NodoS";

export function linkedListToArray(startNode: NodoS | null) {
    const resultArray = [];
    let currentNode = startNode;

    while (currentNode !== null) {
        const nextNode = currentNode.getSiguiente();

        resultArray.push({
            id: currentNode.getId(),
            value: currentNode.getValor(),
            next: nextNode ? nextNode.getId() : null,
            memoryAddress: currentNode.getDireccionMemoria()
        });

        currentNode = nextNode;
    }

    return resultArray;
}