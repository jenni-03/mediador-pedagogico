import { useEffect, useRef } from "react";

export function usePrevious(value: (number | null)[]) {
    const ref = useRef<(number | null)[] | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}