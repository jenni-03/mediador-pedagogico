import React from "react";

type ArrowPointerProps = {
    position: "top" | "bottom"; // puedes quitar si ya no lo usas
    highlightStyle: React.CSSProperties;
};

const ArrowPointer: React.FC<ArrowPointerProps> = ({ highlightStyle }) => {
    const top = typeof highlightStyle.top === "number" ? highlightStyle.top : 0;
    const left =
        typeof highlightStyle.left === "number" ? highlightStyle.left : 0;
    const width =
        typeof highlightStyle.width === "number" ? highlightStyle.width : 0;

    // Posicionar el emoji justo encima del highlight box, nunca debajo
    const emojiLeft = left + width / 2 - 12;
    const emojiTop = top - 40; // suficientemente alto para no ser tapado

    return (
        <div
            className="absolute z-[10000] text-2xl animate-bounce"
            style={{
                top: emojiTop,
                left: emojiLeft,
                filter: "drop-shadow(0 0 6px #ff0040)",
                pointerEvents: "none", // evita que el cursor lo bloquee
            }}
        >
            🤖
        </div>
    );
};

export default ArrowPointer;
