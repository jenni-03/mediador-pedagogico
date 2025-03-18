import { createContext, ReactNode, useContext, useState } from "react";
import { AnimationContextType } from "../../types";

// Contexto para manejo de bloqueo de animación
const AnimationContext = createContext<AnimationContextType | undefined>(
    undefined
);

// Proveedor del contexto, encargado de suministrar el valor de isAnimating y setIsAnimating a todos los componentes que lo consuman
export const AnimationProvider = ({ children }: { children: ReactNode }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    return (
        <AnimationContext.Provider value={{ isAnimating, setIsAnimating }}>
            {children}
        </AnimationContext.Provider>
    );
};

export default AnimationContext;
