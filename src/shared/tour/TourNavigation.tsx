import React from "react";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  isFirst: boolean;
  isLast: boolean;
  accentColor?: string;
};

const TourNavigation: React.FC<Props> = ({
  onPrev,
  onNext,
  isFirst,
  isLast,
  accentColor = "#38bdf8",
}) => (
  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.06]">
    <button
      onClick={onPrev}
      disabled={isFirst}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        isFirst
          ? "text-zinc-600 cursor-not-allowed"
          : "text-zinc-300 hover:bg-white/10"
      }`}
    >
      ← Anterior
    </button>

    <button
      onClick={onNext}
      className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors"
      style={{ background: accentColor }}
    >
      {isLast ? "Finalizar ✓" : "Siguiente →"}
    </button>
  </div>
);

export default TourNavigation;
