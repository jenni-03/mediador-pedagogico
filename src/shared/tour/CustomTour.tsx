import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { getTourByStructure } from "../../domain/constants/tours/getTourByStructure";
import { TourStep } from "../../domain/constants/typesTour";

import HighlightBox from "./HighlightBox";
import TourTooltip from "./TourTooltip";
import ArrowPointer from "./ArrowPointer";
import useViewport from "./useViewport";

import { useAnimation } from "../hooks/useAnimation";

export type TourType = "memoria" | "secuencia" | "pila";

interface CustomTourProps {
  tipo: TourType;
}

const CustomTour: React.FC<CustomTourProps> = ({ tipo }) => {
  const tourSteps: TourStep[] = useMemo(() => getTourByStructure(tipo), [tipo]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [highlightBoxes, setHighlightBoxes] = useState<React.CSSProperties[]>(
    []
  );
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom">("top");

  const { width: viewportWidth, height: viewportHeight } = useViewport();
  const step = tourSteps[currentStep];

  // Animación global
  const { isAnimating } = useAnimation();
  const animRef = useRef(isAnimating);
  useEffect(() => {
    animRef.current = isAnimating;
  }, [isAnimating]);

  // Aviso
  const [warn, setWarn] = useState<string | null>(null);

  // Guards / refs
  const activeRef = useRef(isActive);
  useEffect(() => {
    activeRef.current = isActive;
  }, [isActive]);

  const stepIndexRef = useRef(currentStep);
  useEffect(() => {
    stepIndexRef.current = currentStep;
  }, [currentStep]);

  const rafId = useRef(0);
  const isTransitioningRef = useRef(false);
  const stepLockRef = useRef(false);
  const withStepLock = (fn: () => void) => {
    if (stepLockRef.current) return;
    stepLockRef.current = true;
    try {
      fn();
    } finally {
      window.setTimeout(() => {
        stepLockRef.current = false;
      }, 220);
    }
  };

  const enterInProgressRef = useRef(false);

  // 🔹 Clave estable en localStorage para este tour (tipo + ruta)
  const storageKey = useMemo(() => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname || "/";
    return `simTour:${tipo}:${path}`;
  }, [tipo]);

  // 🔹 Inicialización: decidir si auto-lanzar o no según localStorage
  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;

    const done = window.localStorage.getItem(storageKey);
    if (done === "1") {
      // ya se completó este tour en ESTA página → no auto-arranca
      setIsActive(false);
      setCurrentStep(0);
    } else {
      // primer uso en esta página → arranca desde el paso 0
      setIsActive(true);
      setCurrentStep(0);
    }
  }, [storageKey]);

  // 🔹 función para marcar el tour como completado en esta página
  const markTourDone = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, "1");
  }, [storageKey]);

  // Enter global: en 'enter' disparamos triggerEnterStep; en info/element avanzamos
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      if (step?.type === "enter") {
        e.preventDefault();
        triggerEnterStep();
        return;
      }

      if (step?.type === "info" || step?.type === "element") {
        e.preventDefault();
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, step?.type]); // step.type sólo se usa para decidir comportamiento

  // Espera condición (sin capturar valores stale)
  function waitUntil(
    predicate: () => boolean,
    { interval = 60, timeout = 20000 } = {}
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (!activeRef.current) return resolve(false);
        if (predicate()) return resolve(true);
        if (Date.now() - start >= timeout) return resolve(false);
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  // Auto-limpieza del aviso si cambia el contexto
  useEffect(() => {
    if (!isActive || step?.type !== "enter") {
      if (warn) setWarn(null);
      return;
    }
    if (!animRef.current && warn) setWarn(null);
  }, [isActive, step?.type, warn]);

  useEffect(() => {
    if (!isActive || !step) return;

    if (step.type === "info") {
      document.body.style.overflow = "auto";
      window.scrollTo({ top: 0, behavior: "smooth" });
      const t = setTimeout(() => {
        document.body.style.overflow = "hidden";
      }, 600);
      setHighlightBoxes([]);
      return () => clearTimeout(t);
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
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set;
        setter?.call(el, step.text);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      setTimeout(() => setCurrentStep((prev) => prev + 1), 300);
      return;
    }

    // element (highlight)
    if (step.type === "element" && step.id) {
      let ids: string[] = [];
      if (/\[.*\]$/.test(step.id)) {
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

      // Habilitar transición solo al cambiar de paso (no durante scroll)
      isTransitioningRef.current = true;
      const transitionTimer = setTimeout(() => {
        isTransitioningRef.current = false;
      }, 500);

      const updateHighlightPosition = () => {
        let newArrowPos: "top" | "bottom" = "top";
        const boxes: React.CSSProperties[] = elements.map((el, i) => {
          const rect = el.getBoundingClientRect();
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const scrollLeft =
            window.scrollX || document.documentElement.scrollLeft;
          const top = rect.top + scrollTop - 8;
          const left = rect.left + scrollLeft - 8;
          const width = rect.width + 16;
          const height = rect.height + 16;

          if (i === 0) {
            newArrowPos = (top + height + 150 > viewportHeight) ? "bottom" : "top";
          }

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
            ...(isTransitioningRef.current
              ? { transition: "top 0.4s ease-out, left 0.4s ease-out, width 0.4s ease-out, height 0.4s ease-out" }
              : {}),
          };
        });

        setArrowPosition(newArrowPos);
        setHighlightBoxes(boxes);
      };

      const throttledUpdate = () => {
        cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(updateHighlightPosition);
      };

      elements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      const t = setTimeout(updateHighlightPosition, 400);

      window.addEventListener("scroll", throttledUpdate, true);
      window.addEventListener("resize", throttledUpdate);

      const resizeObserver = new ResizeObserver(throttledUpdate);
      elements.forEach((el) => resizeObserver.observe(el));

      return () => {
        clearTimeout(t);
        clearTimeout(transitionTimer);
        cancelAnimationFrame(rafId.current);
        window.removeEventListener("scroll", throttledUpdate, true);
        window.removeEventListener("resize", throttledUpdate);
        resizeObserver.disconnect();
      };
    }
  }, [currentStep, isActive, step, viewportHeight, viewportWidth]);

  // --- Paso ENTER centralizado ---
  const triggerEnterStep = () => {
    if (enterInProgressRef.current) return;
    if (!step || step.type !== "enter" || !step.id) return;

    enterInProgressRef.current = true;

    const doEnterAndAdvance = async () => {
      setWarn(null);

      // 1) Disparar Enter en la consola
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

      // 2) Esperar a que la animación COMIENCE
      const started = animRef.current
        ? true
        : await waitUntil(() => animRef.current === true, {
            interval: 40,
            timeout: 800,
          });

      // 3) Esperar a que TERMINE (si empezó)
      if (started) {
        const ended = await waitUntil(() => animRef.current === false, {
          interval: 60,
          timeout: 20000,
        });
        if (!ended) {
          setWarn("La animación tarda más de lo normal. Continuando…");
          setTimeout(() => setWarn(null), 1500);
        }
      } else {
        await new Promise((r) => setTimeout(r, 250));
      }

      if (!activeRef.current || stepIndexRef.current !== currentStep) {
        enterInProgressRef.current = false;
        return;
      }
      setCurrentStep((prev) => prev + 1);
      enterInProgressRef.current = false;
    };

    if (animRef.current) {
      setWarn("Relax, aún no finaliza la animación…");
    }

    void doEnterAndAdvance();
  };

  // Auto-disparar 'enter' cuando el paso cambia a 'enter'
  useEffect(() => {
    if (!isActive) return;
    if (step?.type === "enter") {
      const t = setTimeout(() => triggerEnterStep(), 0);
      return () => clearTimeout(t);
    }
  }, [isActive, step?.type]);

  // 🔹 EFECTO DE “FIN DE TOUR” ROBUSTO (cubre steps auto: action/write/enter)
  useEffect(() => {
    if (!isActive) return;
    if (currentStep >= tourSteps.length) {
      markTourDone();
      setIsActive(false);
    }
  }, [currentStep, isActive, tourSteps.length, markTourDone]);

  // Botones: si es 'enter', ejecutan triggerEnterStep; si no, avanzan normal
  const nextStep = () => {
    withStepLock(() => {
      if (!step) return;
      if (step.type === "enter") {
        triggerEnterStep();
        return;
      }
      if (currentStep < tourSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // fin explícito con botón "Finalizar"
        markTourDone();
        setIsActive(false);
      }
    });
  };

  const prevStep = () => {
    withStepLock(() => {
      if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    });
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
              onClose={() => {
                // cerrar manual también lo marca como visto
                markTourDone();
                setIsActive(false);
              }}
            />
          </>
        )}

      {isActive && warn && (
        <div
          className="
            fixed bottom-24 left-1/2 -translate-x-1/2
            z-[10000] px-4 py-2 rounded-xl
            bg-[#1b1b1f] text-white text-sm
            border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.35)]
          "
          role="status"
          aria-live="polite"
        >
          {warn}
        </div>
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
