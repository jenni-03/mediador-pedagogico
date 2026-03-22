import React from "react";

type Props = {
  style: React.CSSProperties;
};

const HighlightBox: React.FC<Props> = ({ style }) => (
  <>
    <style>{`
      @keyframes tour-highlight-in {
        from { opacity: 0; transform: scale(0.95); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes tour-border-glow {
        0%, 100% { box-shadow: 0 0 12px rgba(56,189,248,.3), inset 0 0 12px rgba(56,189,248,.05); }
        50%      { box-shadow: 0 0 20px rgba(56,189,248,.45), inset 0 0 16px rgba(56,189,248,.08); }
      }
    `}</style>
    <div
      style={{
        ...style,
        animation:
          "tour-highlight-in 0.35s ease-out, tour-border-glow 2.5s ease-in-out 0.35s infinite",
        willChange: "transform, opacity",
      }}
      className="z-[9998] pointer-events-none absolute
        rounded-xl border-2 border-sky-400/70
        bg-sky-400/[0.06]"
    />
  </>
);

export default HighlightBox;
