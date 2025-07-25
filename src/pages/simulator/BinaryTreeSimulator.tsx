import { useEffect, useRef } from "react";
import { binaryNodeAddressGenerator } from "../../shared/utils/memoryAllocator";
import { Simulator } from "./components/templates/Simulator";
import { STRUCTURE_NAME } from "../../shared/constants/consts";
import { ArbolBinario } from "../../shared/utils/structures/ArbolBinario";
import { useBinaryTree } from "./hooks/estructures/arboles/useBinaryTree";
import { BinaryTreeRender } from "./components/estructures/arboles/BinaryTreeRender";

export function BinaryTreeSimulator() {
    // Instanciación del árbol binario
    const structure = useRef(new ArbolBinario<number>()).current;

    // Efecto para reiniciar el asignador de memoria al cargar el componente
    useEffect(() => {
        binaryNodeAddressGenerator.reset();
    }, []);

    // Llamada al hook useBinaryTree para gestionar el estado del árbol binario
    const { tree, query, error, operations } = useBinaryTree(structure);

    // Desestructuración de las operaciones soportadas por el árbol binario
    const {
        insertLeftChild,
        insertRightChild,
        deleteNode,
        searchNode,
        getPreOrder,
        getInOrder,
        getPostOrder,
        getLevelOrder,
        clearTree,
        resetQueryValues,
    } = operations;

    return (
        <Simulator
            structureName={STRUCTURE_NAME.BINARY_TREE}
            structure={tree}
            actions={{
                insertLeft: insertLeftChild,
                insertRight: insertRightChild,
                delete: deleteNode,
                search: searchNode,
                getPreOrder,
                getInOrder,
                getPostOrder,
                getLevelOrder,
                clean: clearTree,
            }}
            query={query}
            error={error}
        >
            <BinaryTreeRender
                tree={tree.convertirEstructuraJerarquica()}
                query={query}
                resetQueryValues={resetQueryValues}
            />
        </Simulator>
    );
}
