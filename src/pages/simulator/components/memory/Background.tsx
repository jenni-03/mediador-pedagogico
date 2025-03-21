export function BackgroundEffect() {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-black via-gray-900 to-blue-950 overflow-hidden z-[-1] flex items-center justify-center">
            {/* Fondo con efecto de energía */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,255,255,0.2)_5%,_transparent_80%)] opacity-40"></div>

            {/* Diseño de líneas de circuito animadas */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 opacity-20">
                {Array.from({ length: 12 * 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-12 h-12 border border-cyan-500 rounded-sm opacity-40 animate-pulse"
                    ></div>
                ))}
            </div>

            {/* Luces en las esquinas con animación */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 opacity-25 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 opacity-25 blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500 opacity-15 blur-[80px] animate-ping"></div>
        </div>
    );
}
