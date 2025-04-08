import React, { useState, useEffect, useMemo } from "react";
import { getTourDescriptions, TourStep } from "../constants/tourDescriptions";
import TourOverlay from "./TourOverlay";
import HighlightBox from "./HighlightBox";
import TourTooltip from "./TourTooltip";
import ArrowPointer from "./ArrowPointer";

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
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [currentTarget, setCurrentTarget] = useState<HTMLElement | null>(null);
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom">("top");

  const step = tourSteps[currentStep];

  useEffect(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!isActive || !step) return;

    // Paso tipo info
    if (step.type === "info") {
      setCurrentTarget(null);
      setHighlightStyle({
        position: "absolute",
        top: window.innerHeight / 2 - 50,
        left: window.innerWidth / 2 - 150,
        width: 0,
        height: 0,
      });
      return;
    }

    // Paso tipo action
    if (step.type === "action" && step.id) {
      const el = document.querySelector<HTMLElement>(
        step.id.startsWith(".") ? step.id : `[data-tour="${step.id}"]`
      );
      el?.click();
      setTimeout(nextStep, 300);
      return;
    }

    // Paso tipo write
    if (step.type === "write" && step.id && step.text !== undefined) {
      const input = document.querySelector<
        HTMLInputElement | HTMLTextAreaElement
      >(step.id.startsWith("#") ? step.id : `[data-tour="${step.id}"]`);
      if (input) {
        input.value = step.text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setTimeout(nextStep, 500);
      return;
    }

    // Paso tipo enter
    if (step.type === "enter" && step.id) {
      const input = document.querySelector<HTMLElement>(
        step.id.startsWith("#") ? step.id : `[data-tour="${step.id}"]`
      );
      if (input) {
        const event = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          bubbles: true,
        });
        input.dispatchEvent(event);
      }
      setTimeout(nextStep, 500);
      return;
    }

    // Paso tipo element
    if (step.type === "element" && step.id) {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${step.id}"]`
      );
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      const top = rect.top + scrollTop - 8;
      const height = rect.height + 16;

      const shouldShowAbove = top + height + 150 > window.innerHeight;
      setArrowPosition(shouldShowAbove ? "top" : "bottom");

      setCurrentTarget(el);
      setHighlightStyle({
        position: "absolute",
        top,
        left: rect.left + scrollLeft - 8,
        width: rect.width + 16,
        height,
        border: "2px solid #ef4444",
        borderRadius: "12px",
        zIndex: 9998,
        pointerEvents: "none",
        transition: "all 0.3s ease",
      });
    }
  }, [currentStep, isActive, step]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) setCurrentStep((prev) => prev + 1);
    else setIsActive(false);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const showHighlight = step?.type === "element" && currentTarget;

  return (
    <>
      {isActive &&
        step &&
        !["action", "write", "enter"].includes(step.type) && (
          <>
            <TourOverlay />

            {showHighlight && (
              <>
                <HighlightBox style={highlightStyle} />
                <ArrowPointer
                  position={arrowPosition}
                  highlightStyle={highlightStyle}
                />
              </>
            )}

            <TourTooltip
              description={step.description || ""}
              highlightStyle={highlightStyle}
              onPrev={prevStep}
              onNext={nextStep}
              isFirst={currentStep === 0}
              isLast={currentStep === tourSteps.length - 1}
              isInfo={step.type === "info"}
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
          className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-white text-[#1a1a1a] 
            flex items-center justify-center text-xl shadow-[0_0_10px rgba(0, 0, 0, 0.3)]
            hover:bg-[#ff0040] hover:text-white hover:shadow-[0_0_12px #ff0040]
            transition-all duration-300 cursor-pointer z-[9999]"
          title="Asistente Tour"
        >
          <span className="animate-pulse drop-shadow-[0_0_6px #000000]">
            🤖
          </span>
        </button>
      )}
    </>
  );
};

export default CustomTour;
