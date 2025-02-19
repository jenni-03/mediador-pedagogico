import { TYPE_FILTER } from "./constants/consts";

export type CardListProps = {
    data: CardData[]
    filter: FilterState
}

export type NavBarProps = {
    filter: FilterState,
    setFilter: React.Dispatch<React.SetStateAction<FilterState>>
}

export type FilterState = {
    query: string;
    type: FilterTypeValue;
}

export type FilterTypeValue = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export interface CardData {
    title: string;
    img: string;
    type: string;
    bgCard: string;
    bgButton: string;
    toConceptos: string;
    toPracticar: string;
}