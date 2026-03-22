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

  const arrowTop = position === "top" ? top - 40 : top + height + 20;
  const arrowLeft = left + width / 2 - 12;

  return (
    <>
      <style>{`
        @keyframes tour-arrow-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="absolute z-[9999] text-2xl animate-bounce"
        style={{
          top: arrowTop,
          left: arrowLeft,
          pointerEvents: "none",
          opacity: 0,
          animation: "tour-arrow-in 0.3s ease-out 0.4s forwards",
        }}
      >
        🤖
      </div>
    </>
  );
};

export default ArrowPointer;
