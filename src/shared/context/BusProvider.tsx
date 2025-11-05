import { createContext, ReactNode } from "react";
import { type EventBus } from "../events/eventBus";

// Contexto para manejo de bus de eventos
const BusContext = createContext<EventBus | null>(null);

// Proveedor del contexto, encargado de suministrar el valor del bus a todos los componentes que lo consuman
export const BusProvider = ({
    bus,
    children,
}: {
    bus: EventBus;
    children: ReactNode;
}) => {
    return <BusContext.Provider value={bus}>{children}</BusContext.Provider>;
};

export default BusContext;
