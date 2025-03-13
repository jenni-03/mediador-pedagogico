class ConversorDatosSimples {
    public static parse(declaration: string): [string, string, Record<string, any>, Record<string, string>] {
        const match = declaration.match(/^(\w+)\s+(\w+)\s*=\s*(.+);$/);

        if (!match) {
            throw new Error(`Formato de declaración de dato simple inválido: '${declaration}'`);
        }

        const [, tipo, nombre, valor] = match;
        const values: Record<string, any> = { [nombre]: this.convertValue(valor, tipo) };
        const types: Record<string, string> = { [nombre]: tipo.toLowerCase() };

        return [nombre, tipo.toLowerCase(), values, types];
    }

    public static convertValue(value: string, type: string): any {
        value = value.trim();
        switch (type.toLowerCase()) {
            case "int":
                return parseInt(value);
            case "double":
            case "float":
                return parseFloat(value);
            case "boolean":
                return value.toLowerCase() === "true";
            case "char":
                return value.replace(/'/g, ''); 
            case "string":
                return value.replace(/"/g, ''); 
            default:
                throw new Error(`Tipo no reconocido: ${type}`);
        }
    }
}

export default ConversorDatosSimples;
