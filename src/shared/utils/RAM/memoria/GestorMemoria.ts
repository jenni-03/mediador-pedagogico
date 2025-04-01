export class GestorMemoria {
    public static generarDireccion(tipo: string, contador: number): string {
        const prefijo = this.obtenerPrefijoTipo(tipo);
        return `${prefijo}${contador.toString(16).padStart(4, "0")}`;
    }

    private static obtenerPrefijoTipo(tipo: string): string {
        const prefijos: { [key: string]: string } = {
            boolean: "0x",
            char: "1x",
            byte: "2x",
            short: "3x",
            int: "4x",
            long: "5x",
            float: "6x",
            double: "7x",
            string: "8x",
            object: "9x",
            array: "Ax",
        };

        if (!(tipo in prefijos)) {
            throw new Error(`Tipo de dato no soportado: '${tipo}'`);
        }

        return prefijos[tipo];
    }
}
