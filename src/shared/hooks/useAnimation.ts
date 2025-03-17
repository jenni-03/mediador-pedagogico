import { useContext } from "react";
import AnimationContext from "../context/AnimationProvider";

export const useAnimation = () => {
    return useContext(AnimationContext);
};