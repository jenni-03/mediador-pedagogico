import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import TourNavigation from "./TourNavigation";

type ViewportDimensions = {
  width: number;
  height: number;
};

type Props = {
  description: string;
  highlightStyle: React.CSSProperties;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isInfo: boolean;
  onClose: () => void;
  viewportDimensions: ViewportDimensions;
};

const toNum = (val: string | number | undefined): number =>
  typeof val === "number" ? val : parseInt((val as string) || "0", 10);

// Lógica principal del tooltip
const TourTooltip: React.FC<Props> = ({
  description,
  highlightStyle,
  onPrev,
  onNext,
  isFirst,
  isLast,
  isInfo,
  onClose,
  viewportDimensions,
}) => {
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const margin = 8; // margen mínimo

  // Función para limitar (clamp) un valor dentro de un rango
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const calculatePosition = () => {
    if (isInfo) {
      // Paso "info": simplemente centramos en el viewport
      setTooltipPos({
        top: viewportDimensions.height / 2,
        left: viewportDimensions.width / 2,
      });
      return;
    }

    if (!tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Información del elemento resaltado
    const targetRect = {
      top: toNum(highlightStyle.top),
      left: toNum(highlightStyle.left),
      width: toNum(highlightStyle.width),
      height: toNum(highlightStyle.height),
    };

    // Calculamos espacio disponible en cada dirección:
    const spaceAbove = targetRect.top;
    const spaceBelow =
      viewportDimensions.height - (targetRect.top + targetRect.height);
    const spaceLeft = targetRect.left;
    const spaceRight =
      viewportDimensions.width - (targetRect.left + targetRect.width);

    // Validación extra:
    // Si no hay suficiente espacio (margen) ni arriba, ni abajo, ni a los lados,
    // entonces se posiciona DENTRO del div, centrado.
    if (
      spaceAbove < tooltipRect.height + margin &&
      spaceBelow < tooltipRect.height + margin &&
      spaceLeft < tooltipRect.width + margin &&
      spaceRight < tooltipRect.width + margin
    ) {
      const insideTop =
        targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      const insideLeft =
        targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      setTooltipPos({ top: insideTop, left: insideLeft });
      return;
    }

    // Posición horizontal inicial (centrado respecto al componente)
    let proposedLeft =
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;

    let proposedTop: number;

    // 1. ¿Cabe arriba?
    if (spaceAbove >= tooltipRect.height + margin) {
      proposedTop = targetRect.top - tooltipRect.height - margin;
      proposedLeft = clamp(
        proposedLeft,
        margin,
        viewportDimensions.width - tooltipRect.width - margin
      );
      setTooltipPos({ top: proposedTop, left: proposedLeft });
      return;
    }

    // 2. ¿Cabe abajo?
    if (spaceBelow >= tooltipRect.height + margin) {
      proposedTop = targetRect.top + targetRect.height + margin;
      proposedLeft = clamp(
        proposedLeft,
        margin,
        viewportDimensions.width - tooltipRect.width - margin
      );
      setTooltipPos({ top: proposedTop, left: proposedLeft });
      return;
    }

    // 3. ¿Cabe a la izquierda? (para cuando no cabe ni arriba ni abajo)
    if (spaceLeft >= tooltipRect.width + margin) {
      const proposedTop =
        targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      const leftPos = targetRect.left - tooltipRect.width - margin;
      setTooltipPos({
        top: clamp(
          proposedTop,
          margin,
          viewportDimensions.height - tooltipRect.height - margin
        ),
        left: clamp(
          leftPos,
          margin,
          viewportDimensions.width - tooltipRect.width - margin
        ),
      });
      return;
    }

    // 4. ¿Cabe a la derecha?
    if (spaceRight >= tooltipRect.width + margin) {
      const proposedTop =
        targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      const leftPos = targetRect.left + targetRect.width + margin;
      setTooltipPos({
        top: clamp(
          proposedTop,
          margin,
          viewportDimensions.height - tooltipRect.height - margin
        ),
        left: clamp(
          leftPos,
          margin,
          viewportDimensions.width - tooltipRect.width - margin
        ),
      });
      return;
    }

    // 5. Fallback (por seguridad): centrado dentro del componente
    const insideTop =
      targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
    const insideLeft =
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    setTooltipPos({ top: insideTop, left: insideLeft });
  };

  // Activamos la animación de opacidad al montar
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Recalcula cuando cambian highlightStyle, isInfo o viewportDimensions
  useEffect(() => {
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("resize", calculatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightStyle, isInfo, viewportDimensions]);

  // Función para convertir **negrilla** en <strong>
  const parseDescription = (text: string): JSX.Element[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={index}
            className="font-semibold text-[#F4F4F5] underline decoration-[#ff0040]/40 underline-offset-2"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={
        isInfo
          ? {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: visible ? 1 : 0,
              transition: "all 0.5s ease-out",
            }
          : {
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              opacity: visible ? 1 : 0,
              transition: "all 0.5s ease-out",
            }
      }
      className={`z-[11000] bg-[#121212] p-5 rounded-xl border-2 
      max-w-[90%] sm:max-w-sm max-h-[80vh] overflow-auto text-center 
      transition-all duration-500 ease-out
      ${
        isInfo
          ? "border-[#00ff00] shadow-[0_0_20px_#00ff00]"
          : "border-[#ff0040] shadow-[0_0_20px_#ff0040]"
      }`}
    >
      {/* Botón de cierre */}
      <button
        onClick={onClose}
        className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center 
        rounded-full bg-[#1f1f1f] text-[#ff0040] text-xl font-bold 
        hover:bg-[#ff0040] hover:text-black transition-all duration-200 
        shadow-[0_0_6px_#ff0040] focus:outline-none"
        aria-label="Cerrar"
      >
        ×
      </button>

      {/* Título con Emoji */}
      <div className="flex items-center justify-center mb-3 gap-2">
        <span className="text-xl animate-bounce">{isInfo ? "💡" : "🤖"}</span>
        <h2
          className={`text-lg font-bold tracking-widest drop-shadow-[0_0_4px_#ff0040] 
        ${isInfo ? "text-[#00ff00]" : "text-[#ff0040]"}`}
        >
          {isInfo ? "¡Descubre!" : "ASISTENTE"}
        </h2>
      </div>

      {/* Descripción */}
      <p className="text-gray-200 font-medium text-sm mb-4 leading-relaxed drop-shadow-sm">
        {parseDescription(description)}
      </p>

      {/* Navegación */}
      <TourNavigation
        onPrev={onPrev}
        onNext={onNext}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );

  return ReactDOM.createPortal(tooltipContent, document.body);
};

export default TourTooltip;
