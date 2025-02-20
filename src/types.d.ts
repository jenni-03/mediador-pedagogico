import { TYPE_FILTER } from "./constants/consts";

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