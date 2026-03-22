import React from "react";

type ArrowPointerProps = {
  position: "top" | "bottom";
  highlightStyle: React.CSSProperties;
};

const ArrowPointer: React.FC<ArrowPointerProps> = ({
  position,
  highlightStyle,
}) => {
  const top = typeof highlightStyle.top === "number" ? highlightStyle.top : 0;
  const left =
    typeof highlightStyle.left === "number" ? highlightStyle.left : 0;
  const width =
    typeof highlightStyle.width === "number" ? highlightStyle.width : 0;
  const height =
    typeof highlightStyle.height === "number" ? highlightStyle.height : 0;

  const arrowTop = position === "top" ? top - 36 : top + height + 12;
  const arrowLeft = left + width / 2 - 14;

  return (
    <>
      <style>{`
        @keyframes tour-pointer-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes tour-pointer-in {
          from { opacity: 0; transform: translateY(8px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className="absolute z-[9999] flex flex-col items-center"
        style={{
          top: arrowTop,
          left: arrowLeft,
          pointerEvents: "none",
          opacity: 0,
          animation:
            "tour-pointer-in 0.3s ease-out 0.3s forwards, tour-pointer-bob 2s ease-in-out 0.6s infinite",
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-lg"
          style={{
            background: "linear-gradient(135deg, #38bdf8, #8b5cf6)",
          }}
        >
          🧭
        </div>
        {/* Flecha apuntando hacia el elemento */}
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: position === "top" ? "none" : "6px solid #38bdf8",
            borderBottom: position === "top" ? "6px solid #38bdf8" : "none",
            marginTop: position === "top" ? 0 : -1,
            marginBottom: position === "top" ? -1 : 0,
            order: position === "top" ? -1 : 1,
          }}
        />
      </div>
    </>
  );
};

export default ArrowPointer;
