import { useMemo } from 'react';
import { CardData, FilterState } from '../../../types';

export function useFilteredCard(
    data: CardData[],
    filter: FilterState
) {
    return useMemo(() => {
        return data.filter((card) => {
            const matchesQuery =
                filter.query.trim() === '' ||
                card.title.toLowerCase().includes(filter.query.toLowerCase());
            const matchesSort =
                filter.type === 'none' || card.type === filter.type;
            return matchesQuery && matchesSort;
        });
    }, [data, filter]);
}