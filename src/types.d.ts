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
    label: string;
    tooltip: string;
}

export type GroupCommandProps = {
    buttons: CommandProps[];
}

export type SimulatorProps = {
    actions: BaseStructureActions;
    query: BaseQueryOperations;
    error: string | null;
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

export type BaseStructureActions = {
    create: (n: number) => void,
    insert: (element: number) => void,
    remove: (element: number) => void,
    search: (element: number) => void,
    clear: () => void,
}