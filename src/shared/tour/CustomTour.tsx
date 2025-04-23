import React, { useState, useEffect, useMemo } from "react";
import { getTourDescriptions, TourStep } from "../constants/tourDescriptions";
import HighlightBox from "./HighlightBox";
import TourTooltip from "./TourTooltip";
import ArrowPointer from "./ArrowPointer";
import useViewport from "./useViewport";

export type TourType = "memoria" | "secuencia" | "pila";

interface CustomTourProps {
  tipo: TourType;
}

const CustomTour: React.FC<CustomTourProps> = ({ tipo }) => {
  const tourSteps: TourStep[] = useMemo(
    () => getTourDescriptions(tipo),
    [tipo]
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightBoxes, setHighlightBoxes] = useState<React.CSSProperties[]>(
    []
  );
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom">("top");

  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const step = tourSteps[currentStep];

  useEffect(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextStep();
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, currentStep]);
  

  useEffect(() => {
    if (!isActive || !step) return;

    if (step.type === "info") {
      document.body.style.overflow = "auto";
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, 600);

      // 👇 LIMPIAMOS cualquier highlight anterior
      setHighlightBoxes([]);
      return;
    }

    if (step.type === "action" && step.id) {
      const el = document.querySelector<HTMLElement>(
        step.id.startsWith(".") ? step.id : `[data-tour="${step.id}"]`
      );
      el?.click();
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
      return;
    }

    if (step.type === "write" && step.id && step.text) {
      const el = document.querySelector<HTMLInputElement>(
        `[data-tour="${step.id}"]`
      );
      if (el) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        nativeInputValueSetter?.call(el, step.text);
        const inputEvent = new Event("input", { bubbles: true });
        el.dispatchEvent(inputEvent);
      }
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
      return;
    }

    if (step.type === "enter" && step.id) {
      const el = document.querySelector<HTMLInputElement>(
        `[data-tour="${step.id}"]`
      );
      if (el) {
        const enterEvent = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
          code: "Enter",
        });
        el.dispatchEvent(enterEvent);
      }
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
      return;
    }

    if (step.type === "element" && step.id) {
      let ids: string[] = [];

      if (/\[.*\]$/.test(step.id)) {
        // Soporta tanto comandoCreado[1,2,3] como comandoCreado.[1,2,3]
        const match = step.id.match(/^([a-zA-Z0-9_-]+)(?:\.)?\[(.*)\]$/);
        if (match) {
          const base = match[1];
          const nums = match[2].split(",").map((n) => n.trim());
          ids = nums.map((n) => `${base}.${n}`);
        }
      } else if (step.id.includes(",")) {
        ids = step.id.split(",").map((id) => id.trim());
      } else {
        ids = [step.id];
      }
      

      const elements = ids
        .map(
          (id) =>
            document.querySelector(`[data-tour="${id}"]`) as HTMLElement | null
        )
        .filter((el): el is HTMLElement => el !== null);

      if (elements.length === 0) return;

      const updateHighlightPosition = () => {
        const boxes: React.CSSProperties[] = elements.map((el) => {
          const rect = el.getBoundingClientRect();
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const scrollLeft =
            window.scrollX || document.documentElement.scrollLeft;
          const top = rect.top + scrollTop - 8;
          const left = rect.left + scrollLeft - 8;
          const width = rect.width + 16;
          const height = rect.height + 16;
          const shouldShowAbove = top + height + 150 > viewportHeight;

          setArrowPosition(shouldShowAbove ? "bottom" : "top");

          return {
            position: "absolute",
            top,
            left,
            width,
            height,
            border: "2px solid #ef4444",
            borderRadius: "12px",
            zIndex: 9998,
            pointerEvents: "none",
            transition: "all 0.3s ease",
          };
        });

        setHighlightBoxes(boxes);
      };

      // Scroll to the first element
      elements[0].scrollIntoView({ behavior: "smooth", block: "center" });

      // Actualizar una vez que se haya centrado
      setTimeout(updateHighlightPosition, 400);

      // Listener para seguir el scroll y resize
      window.addEventListener("scroll", updateHighlightPosition, true);
      window.addEventListener("resize", updateHighlightPosition);

      const resizeObserver = new ResizeObserver(updateHighlightPosition);
      elements.forEach((el) => resizeObserver.observe(el));

      return () => {
        window.removeEventListener("scroll", updateHighlightPosition, true);
        window.removeEventListener("resize", updateHighlightPosition);
        resizeObserver.disconnect();
      };
    }
  }, [currentStep, isActive, step, viewportHeight, viewportWidth]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <>
      {isActive &&
        step &&
        !["action", "write", "enter"].includes(step.type) && (
          <>
            <div className="fixed inset-0 z-[9997]" />
            {highlightBoxes.map((style, idx) => (
              <React.Fragment key={idx}>
                <HighlightBox style={style} />
                {idx === 0 && (
                  <ArrowPointer
                    position={arrowPosition}
                    highlightStyle={style}
                  />
                )}
              </React.Fragment>
            ))}
            <TourTooltip
              description={step.description || ""}
              highlightStyle={highlightBoxes[0] || {}}
              onPrev={prevStep}
              onNext={nextStep}
              isFirst={currentStep === 0}
              isLast={currentStep === tourSteps.length - 1}
              isInfo={step.type === "info"}
              viewportDimensions={{
                width: viewportWidth,
                height: viewportHeight,
              }}
              onClose={() => setIsActive(false)}
            />
          </>
        )}

      {!isActive && (
        <button
          onClick={() => {
            setIsActive(true);
            setCurrentStep(0);
          }}
          className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0,0,0,0.3)] hover:bg-[#ff0040] hover:text-white hover:shadow-[0_0_12px_#ff0040] transition-all duration-300 cursor-pointer z-[9999]"
          title="Asistente Tour"
        >
          <span className="animate-pulse drop-shadow-[0_0_6px_#000000]">
            🤖
          </span>
        </button>
      )}
    </>
  );
};

export default CustomTour;
