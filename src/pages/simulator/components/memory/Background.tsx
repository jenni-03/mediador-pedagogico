export function BackgroundEffect() {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-r from-black via-blue-900 to-purple-900 overflow-hidden z-[-1] flex items-center justify-center">
            {/* Fondo con efecto de circuito sutil */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(0,255,255,0.15)_10%,_transparent_80%)] opacity-50"></div>

            {/* Diseño de líneas de circuito */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-4 opacity-10">
                {Array.from({ length: 12 * 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-12 h-12 border border-cyan-500 rounded-sm opacity-30"
                    ></div>
                ))}
            </div>

            {/* Luces en las esquinas para efecto de iluminación */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 opacity-20 blur-3xl"></div>
        </div>
    );
}
