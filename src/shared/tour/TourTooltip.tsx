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

  const margin = 8;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

  const calculatePosition = () => {
    if (isInfo) {
      setTooltipPos({
        top: viewportDimensions.height / 2,
        left: viewportDimensions.width / 2,
      });
      return;
    }

    if (!tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const targetRect = {
      top: toNum(highlightStyle.top),
      left: toNum(highlightStyle.left),
      width: toNum(highlightStyle.width),
      height: toNum(highlightStyle.height),
    };

    const spaceAbove = targetRect.top;
    const spaceBelow =
      viewportDimensions.height - (targetRect.top + targetRect.height);
    const spaceLeft = targetRect.left;
    const spaceRight =
      viewportDimensions.width - (targetRect.left + targetRect.width);

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

    let proposedLeft =
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;

    let proposedTop: number;

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

    const insideTop =
      targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
    const insideLeft =
      targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    setTooltipPos({ top: insideTop, left: insideLeft });
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    calculatePosition();
    window.addEventListener("resize", calculatePosition);
    return () => {
      window.removeEventListener("resize", calculatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightStyle, isInfo, viewportDimensions]);

  const parseDescription = (text: string): JSX.Element[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong
            key={index}
            className="font-semibold text-white underline decoration-emerald-400/40 underline-offset-2"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const accentColor = isInfo ? "#34d399" : "#38bdf8";

  const baseStyle: React.CSSProperties = {
    background: "#171c28",
    border: `1px solid ${accentColor}30`,
    boxShadow: `0 8px 32px rgba(0,0,0,.5), 0 0 0 1px ${accentColor}15`,
    maxWidth: "min(90vw, 384px)",
  };

  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={
        isInfo
          ? {
              ...baseStyle,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: visible
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0.95)",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            }
          : {
              ...baseStyle,
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1)" : "scale(0.95)",
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
            }
      }
      className="z-[11000] max-h-[80vh] overflow-auto rounded-2xl"
    >
      {/* Barra superior con gradiente */}
      <div
        className="h-1 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, #8b5cf6, ${accentColor})`,
        }}
      />

      <div className="p-4">
        {/* Header: avatar + nombre + close */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base shadow-md"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)`,
            }}
          >
            🧭
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-zinc-100">
              {isInfo ? "💡 ¡Descubre!" : "🤖 Asistente"}
            </div>
            <div className="text-[10px] text-zinc-500">Guía interactiva</div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center
              rounded-full text-zinc-500 text-base
              hover:bg-white/10 hover:text-zinc-200 transition-colors focus:outline-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Burbuja de mensaje */}
        <div
          className="rounded-xl rounded-tl-sm px-3.5 py-3 mb-3"
          style={{
            background: "#1e2536",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[13px] text-zinc-300 leading-relaxed">
            {parseDescription(description)}
          </p>
        </div>

        {/* Navigation */}
        <TourNavigation
          onPrev={onPrev}
          onNext={onNext}
          isFirst={isFirst}
          isLast={isLast}
          accentColor={accentColor}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(tooltipContent, document.body);
};

export default TourTooltip;
