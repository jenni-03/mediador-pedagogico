export function DataStructureInfo({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-[4] flex flex-col border-2 border-gray-300 bg-gray-100 rounded-3xl p-4 overflow-auto">
            <div className="ml-auto">
                <h1 className="font-medium">TAMAÑO: Insertar</h1>
                <h1 className="font-medium">CAPACIDAD: Insertar</h1>
            </div>
            <div className="flex-1 flex items-center">{children}</div>
        </div>
    );
}
