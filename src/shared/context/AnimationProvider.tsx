import { createContext, ReactNode, useMemo, useState } from "react";
import { AnimationContextType } from "../../domain/utils/types";

// Contexto para manejo de bloqueo de animación
const AnimationContext = createContext<AnimationContextType | undefined>(
    undefined
);

// Proveedor del contexto, encargado de suministrar el valor de isAnimating y setIsAnimating a todos los componentes que lo consuman
export const AnimationProvider = ({ children }: { children: ReactNode }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const value = useMemo(() => ({ isAnimating, setIsAnimating }), [isAnimating]);
    return (
        <AnimationContext.Provider value={value}>
            {children}
        </AnimationContext.Provider>
    );
};

export default AnimationContext;
