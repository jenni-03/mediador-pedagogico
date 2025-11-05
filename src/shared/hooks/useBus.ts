import { useContext } from "react";
import BusContext from "../context/BusProvider";

export function useBus() {
    const context = useContext(BusContext);
    if (!context) {
        throw new Error("BusContext no disponible");
    }
    return context;
}