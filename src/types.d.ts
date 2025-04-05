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

export type SimulatorProps<T extends string> = {
    structureName: T,
    structure: any,
    actions: BaseStructureActions<T>;
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

export type BaseQueryOperations = {
    create: number | null,
    toAdd: number | null,
    toDelete: number | null,
    toSearch: number | null,
    toUpdate?: number | [number, number] | []
}

export type BaseStructureActions<T extends string> = 
    T extends "secuencia" ? {
        create: (n: number) => void;
        insertLast: (element: number) => void;
        delete: (element: number) => void;
        get: (element: number) => void;
        clean: () => void;
        set: (pos: number, element: number) => void;
    } :
    T extends "cola" ? {
        create: (n: number) => void;
        insertlast: (element: number) => void;
        delete: (element: number) => void;
        search: (element: number) => void;
        clean: () => void;
    } :
    Record<string, (...args: any[]) => void>; // Fallback para otros casos

export type AnimationContextType = {
    isAnimating: boolean;
    setIsAnimating: React.Dispatch<React.SetStateAction<boolean>>;
};

export type CodeAnalysisProps = {
    code: string;
    operationalCost: string[];
    complexity: string;
}