import ConversorDatosSimples from "./ConversorDatosSimples";
import ConversorArrays from "./ConversorArrays";
import ConversorObjetos from "./ConversorObjetos";

class ConversorControlador {
    public static parse(declaration: string): [string, string, Record<string, any>, Record<string, string>] {
        declaration = declaration.trim();

        if (declaration.startsWith("object")) {
            return ConversorObjetos.parse(declaration);
        } else if (declaration.includes("[]")) {
            return ConversorArrays.parse(declaration);
        } else {
            return ConversorDatosSimples.parse(declaration);
        }
    }
}

export default ConversorControlador;
