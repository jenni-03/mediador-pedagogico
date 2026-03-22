import React from "react";

type Props = {
  style: React.CSSProperties;
};

const HighlightBox: React.FC<Props> = ({ style }) => (
  <>
    <style>{`
      @keyframes tour-highlight-in {
        from { opacity: 0; transform: scale(0.92); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes tour-glow-pulse {
        0%, 100% { box-shadow: 0 0 15px #ff0040; }
        50%      { box-shadow: 0 0 25px #ff0040, 0 0 8px #ff004066; }
      }
    `}</style>
    <div
      style={{
        ...style,
        animation:
          "tour-highlight-in 0.4s ease-out, tour-glow-pulse 2.5s ease-in-out 0.4s infinite",
        willChange: "transform, opacity",
      }}
      className="z-[9998] pointer-events-none absolute
        rounded-xl border-2 border-[#ff0040]
        bg-[#ff0040]/10"
    />
  </>
);

export default HighlightBox;
