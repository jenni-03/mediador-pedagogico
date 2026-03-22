import React from "react";

type Props = { children: React.ReactNode };

export default function BrandCanvas({ children }: Props) {
  return (
    <div className="relative min-h-screen bg-[#191f2b] text-[#E0E0E0]">
      {/* Sutil halo decorativo estático — sin animaciones */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(215,38,56,.06), transparent 60%)",
        }}
      />
      <div className="relative px-4 py-6 sm:px-6 xl:px-10 2xl:px-40">
        {children}
      </div>
    </div>
  );
}
