import { TYPE_FILTER } from "./shared/constants/consts";

export type CardListProps = {
    data: CardData[]
    filter: FilterState
}

export type NavBarProps = {
    filter: FilterState,
    setFilter: React.Dispatch<React.SetStateAction<FilterState>>
}

export type AnimatedButtonLinkProps = {
    bgColor: string,
    to: string,
    text: string
    params: string
}

export type AnimatedButtonModalProps = {
    bgColor: string,
    text: string,
    onClick?: () => void;
}

export type SideBarProps = {
    estructura: string,
    isOpen: boolean,
    setIsOpen: (open: boolean) => void
}

export type SideBarItemProps = {
    to: string;
    params: string;
    label: string;
}

export type CommandProps = {
    title: string;
    description: string;
    estructura: string;
    ejemplo: string;
}

export type GroupCommandProps = {
    buttons: CommandProps[];
}

export type CustomModalProps = {
    title: string;
    description: string;
    structure: string;
    example: string;
    children: ReactNode;
    onClose: () => void; // Función que se llama al cerrar el modal
}

export type SimulatorProps = {
    structure: any,
    actions: BaseStructureActions;
    query: BaseQueryOperations;
    error: { message: string, id: number } | null;
    reset: () => void;
    children: React.ReactNode
}

export type FilterState = {
    query: string;
    type: FilterTypeValue;
}

export type FilterTypeValue = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export interface CardData {
    title: string;
    id: number;
    img: string;
    type: string;
    bgCard: string;
    bgButton: string;
    toConceptos: string;
    toPracticar: string;
}

export type SequenceOperations = {
    create: number | null,
    toAdd: number | null,
    toDelete: number | null,
    toSearch: number | null,
    toUpdate?: [number, number] | []
}

export type SequenceActions = {
    create: (n: number) => void,
    insert_last: (element: number) => void,
    delete: (element: number) => void,
    search: (element: number) => void,
    clean: () => void,
    update: (pos: number, element: number) => void
}

export type AnimationContextType = {
    isAnimating: boolean;
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CodeAnalysisProps = {
    code: string;
    operationalCost: string[];
    complexity: string;
}