import React from "react";

type Props = {
  style: React.CSSProperties;
};

const HighlightBox: React.FC<Props> = ({ style }) => (
  <div
    style={style}
    className="box-border z-[9998] pointer-events-none 
      rounded-xl border-2 border-[#ff0040] 
      shadow-[0_0_12px_#ff0040,0_0_24px_#ff0040] 
      animate-pulse"
  />
);


export default HighlightBox;
