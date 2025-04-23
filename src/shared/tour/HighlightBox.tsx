import React from "react";

type Props = {
  style: React.CSSProperties;
};

const HighlightBox: React.FC<Props> = ({ style }) => (
  <div
    style={style}
    className="z-[9998] pointer-events-none absolute
      rounded-xl border-2 border-[#ff0040]
      bg-[#ff0040]/10
      shadow-[0_0_12px_#ff0040,0_0_30px_#ff0040]
      animate-pulse transition-all duration-300"
  />
);

export default HighlightBox;
