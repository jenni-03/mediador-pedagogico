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

// Función utilitaria para convertir a número
const toNum = (val: string | number | undefined): number =>
  typeof val === "number" ? val : parseInt((val as string) || "0", 10);

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
  const margin = 8; // margen entre tooltip y borde/elemento

  // Función para limitar (clamp) un valor dentro de un rango, pero con un margen mínimo.
  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(value, max));
  };

  // Calcula la posición del tooltip basándose en el espacio disponible vertical
  // y posiciona el tooltip preferiblemente "encima" o "debajo" del elemento resaltado.
  const calculatePosition = () => {
    if (isInfo) {
      setTooltipPos({
        top: viewportDimensions.height / 2,
        left: viewportDimensions.width / 2,
      });
      return;
    }

    // Obtenemos la posición y dimensiones del elemento resaltado (highlight)
    const targetRect = {
      top: toNum(highlightStyle.top),
      left: toNum(highlightStyle.left),
      width: toNum(highlightStyle.width),
      height: toNum(highlightStyle.height),
    };

    if (!tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Calculamos espacio disponible arriba y abajo
    const spaceAbove = targetRect.top;
    const spaceBelow =
      viewportDimensions.height - (targetRect.top + targetRect.height);

    let proposedTop: number;
    // Posición horizontal: centramos respecto al elemento
    let proposedLeft =
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;

    // Si hay suficiente espacio arriba para colocar el tooltip completo más un margen, lo ponemos arriba.
    if (spaceAbove >= tooltipRect.height + margin) {
      proposedTop = targetRect.top - tooltipRect.height - margin;
    }
    // Si no, si cabe abajo, lo colocamos debajo.
    else if (spaceBelow >= tooltipRect.height + margin) {
      proposedTop = targetRect.top + targetRect.height + margin;
    }
    // De lo contrario, elegimos el lado que ofrezca más espacio y
    // forzamos el tooltip dentro del viewport
    else {
      if (spaceAbove >= spaceBelow) {
        proposedTop = margin; // pegamos al borde superior, dejando el margen
      } else {
        proposedTop = viewportDimensions.height - tooltipRect.height - margin;
      }
    }

    // Clampeamos la posición horizontal para evitar que se desborde
    proposedLeft = clamp(
      proposedLeft,
      margin,
      viewportDimensions.width - tooltipRect.width - margin
    );

    setTooltipPos({ top: proposedTop, left: proposedLeft });
  };

  // Activamos la animación al montar el componente
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  // Recalcula la posición del tooltip cuando cambian el highlight, el modo info o las dimensiones del viewport
  useEffect(() => {
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => window.removeEventListener("resize", calculatePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightStyle, isInfo, viewportDimensions]);

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
              transition: "all 0.5s ease-out",
              opacity: visible ? 1 : 0,
            }
          : {
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              transition: "all 0.5s ease-out",
              opacity: visible ? 1 : 0,
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
        {description}
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
