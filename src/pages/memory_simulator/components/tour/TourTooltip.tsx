import React, { useEffect, useState } from "react";
import TourNavigation from "./TourNavigation";

type Props = {
  description: string;
  highlightStyle: React.CSSProperties;
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  isInfo: boolean;
  onClose: () => void; // ✅ nueva prop
};

const toNum = (val: string | number | undefined): number =>
  typeof val === "number" ? val : parseInt(val || "0", 10);

const TourTooltip: React.FC<Props> = ({
  description,
  highlightStyle,
  onPrev,
  onNext,
  isFirst,
  isLast,
  isInfo,
  onClose, // ✅ destructuring
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  const tooltipStyle = isInfo
    ? undefined
    : {
        top: toNum(highlightStyle.top) + toNum(highlightStyle.height) + 16,
        left: toNum(highlightStyle.left),
      };

  return (
    <div
      className={`absolute z-[9999] bg-[#121212] p-5 rounded-xl border-2 
      ${isInfo ? "border-[#00ff00]" : "border-[#ff0040]"} 
      shadow-[0_0_20px ${isInfo ? "#00ff00" : "#ff0040"}] max-w-sm text-center
      transition-all duration-500 ease-out transform
      ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      ${isInfo ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""}`}
      style={tooltipStyle}
    >
      {/* BOTÓN DE CIERRE */}
      <button
        onClick={onClose}
        className="absolute top-2 right-3 w-8 h-8 flex items-center justify-center 
        rounded-full bg-[#1f1f1f] text-[#ff0040] text-xl font-bold 
        hover:bg-[#ff0040] hover:text-black transition-all duration-200 
        shadow-[0_0_6px #ff0040] focus:outline-none"
        aria-label="Cerrar"
      >
        ×
      </button>

      {/* TÍTULO CON EMOJI */}
      <div className="flex items-center justify-center mb-3 gap-2">
        <span className="text-xl animate-bounce">{isInfo ? "💡" : "🤖"}</span>
        <h2 className="text-[#ff0040] font-bold text-lg tracking-widest drop-shadow-[0_0_4px #ff0040]">
          {isInfo ? "¡Descubre!" : "ASISTENTE"}
        </h2>
      </div>

      {/* DESCRIPCIÓN */}
      <p className="text-gray-200 font-medium text-sm mb-4 leading-relaxed drop-shadow-sm">
        {description}
      </p>

      {/* NAVEGACIÓN */}
      <TourNavigation
        onPrev={onPrev}
        onNext={onNext}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
};

export default TourTooltip;
