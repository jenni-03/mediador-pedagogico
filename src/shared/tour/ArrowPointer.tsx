import React from "react";

type ArrowPointerProps = {
  position: "top" | "bottom"; // “top” para colocar el arrow sobre el highlight, “bottom” para debajo
  highlightStyle: React.CSSProperties;
};

const ArrowPointer: React.FC<ArrowPointerProps> = ({
  position,
  highlightStyle,
}) => {
  // Extraemos los datos numéricos de la posición y tamaño del highlight
  const top = typeof highlightStyle.top === "number" ? highlightStyle.top : 0;
  const left =
    typeof highlightStyle.left === "number" ? highlightStyle.left : 0;
  const width =
    typeof highlightStyle.width === "number" ? highlightStyle.width : 0;
  const height =
    typeof highlightStyle.height === "number" ? highlightStyle.height : 0;

  let arrowTop: number;
  // Si la posición es "top" significa que el arrow se ubicará sobre el highlight (para tooltip lateral o tooltip abajo)
  if (position === "top") {
    arrowTop = top - 40; // Ajusta este valor para que se vea bien; en este ejemplo 40px de margen
  } else {
    // Si es "bottom", el arrow se dibuja debajo del highlight (para tooltip que se posiciona arriba)
    arrowTop = top + height + 20; // nuevamente, ajusta el 20px según tu diseño
  }

  // Centrar el arrow horizontalmente respecto al highlight
  const arrowLeft = left + width / 2 - 12; // 12 es la mitad del ancho del arrow (en este caso, si usas el emoji, ajústalo según convenga)

  return (
    <div
      className="absolute z-[9999] text-2xl animate-bounce"
      style={{
        top: arrowTop,
        left: arrowLeft,
        filter: "drop-shadow(0 0 6px #ff0040)",
        pointerEvents: "none", // Esto permite que el arrow no interfiera en los eventos sobre otros elementos
      }}
    >
      🤖
    </div>
  );
};

export default ArrowPointer;
