import { useEffect, useState } from "react";

export const useTourTargets = () => {
  const [targets, setTargets] = useState<HTMLElement[]>([]);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-tour]"));
    setTargets(elements);
  }, []);

  return targets;
};
