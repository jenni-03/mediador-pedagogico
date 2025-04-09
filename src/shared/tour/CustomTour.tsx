import React, { useState, useEffect, useMemo } from "react";
import { getTourDescriptions, TourStep } from "../constants/tourDescriptions";
import HighlightBox from "./HighlightBox";
import TourTooltip from "./TourTooltip";
import ArrowPointer from "./ArrowPointer";
import useViewport from "./useViewport"; // Asegúrate de ajustar la ruta según corresponda

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

  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const step = tourSteps[currentStep];

  // Bloquea el scroll del body mientras el tour está activo.
  useEffect(() => {
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    if (isActive) {
      document.body.style.overflow = "hidden";
      document.addEventListener("touchmove", preventScroll, { passive: false });
      document.addEventListener("wheel", preventScroll, { passive: false });
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
    }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
    };
  }, [isActive]);

  // Activa el tour al montar el componente.
  useEffect(() => {
    setIsActive(true);
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!isActive || !step) return;

    if (step.type === "info") {
      // Paso de información: centramos la vista y ajustamos el highlight.
      document.body.style.overflow = "auto";
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, 600);

      setCurrentTarget(null);
      setHighlightStyle({
        position: "absolute",
        top: viewportHeight / 2 - 50,
        left: viewportWidth / 2 - 150,
        width: 0,
        height: 0,
      });
      return;
    }

    // Ejecuta acciones de "action", "write" o "enter" y avanza.
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
        el.value = step.text;
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

    // Paso de tipo "element": actualiza el highlight y recalcula la posición.
    if (step.type === "element" && step.id) {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${step.id}"]`
      );
      if (!el) return;

      // Realiza scroll suave para centrar el elemento.
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Función para actualizar la posición (calculada en base a getBoundingClientRect).
      const updatePosition = () => {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft =
          window.scrollX || document.documentElement.scrollLeft;

        const top = rect.top + scrollTop - 8;
        const left = rect.left + scrollLeft - 8;
        const width = rect.width + 16;
        const height = rect.height + 16;

        const shouldShowAbove = top + height + 150 > viewportHeight;
        // Si el tooltip se posicionará encima, mostramos la flecha abajo y viceversa.
        setArrowPosition(shouldShowAbove ? "bottom" : "top");

        setHighlightStyle({
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
        });
      };

      // Usamos un timeout para permitir que el scroll se complete.
      setTimeout(() => {
        updatePosition();
        setCurrentTarget(el);
      }, 600);

      // Agregamos un listener al scroll para recalcular en tiempo real
      const handleScroll = () => {
        updatePosition();
      };

      window.addEventListener("scroll", handleScroll, true);
      // También observamos cambios en el tamaño del elemento y en la ventana
      const resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(el);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", updatePosition);
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

  const showHighlight = step?.type === "element" && currentTarget;

  return (
    <>
      {isActive &&
        step &&
        !["action", "write", "enter"].includes(step.type) && (
          <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9997]" />

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
          className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-white text-[#1a1a1a] flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0, 0, 0, 0.3)] hover:bg-[#ff0040] hover:text-white hover:shadow-[0_0_12px_#ff0040] transition-all duration-300 cursor-pointer z-[9999]"
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
