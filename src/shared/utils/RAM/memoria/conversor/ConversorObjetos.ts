import ConversorArrays from "./ConversorArrays";
import ConversorDatosSimples from "./ConversorDatosSimples";

class ConversorObjetos {
  public static parse(
    declaration: string
  ): [string, string, Record<string, any>, Record<string, string>] {
    const inicio = declaration.indexOf("(");
    const fin = declaration.lastIndexOf(")");

    if (inicio === -1 || fin === -1) {
      throw new Error("Formato de declaración de objeto inválido.");
    }

    const header = declaration.substring(0, inicio).trim();
    const [tipo, nombre] = header.split(/\s+/); 

    const content = declaration.substring(inicio + 1, fin).trim();
    const values: Record<string, any> = {};
    const types: Record<string, string> = {};


    const attributes = this.splitAttributes(content);

    attributes.forEach((attribute) => {
      //Caracteres especiales
      const match = attribute.match(/^([\wáéíóúñÑ]+)(\[\])?\s+([\wáéíóúñÑ]+)\s*=\s*(.+)$/);

      if (!match) {
        throw new Error(`Error al analizar el atributo: '${attribute}'`);
      }

      const [, attrType, isArray, attrName, attrValue] = match;
      const key = `${nombre}.${attrName}`;

      if (isArray) {
        values[attrName] = ConversorArrays.parseArray(attrValue);
        types[key] = "array";
        types[`${key}.elemento`] = attrType.toLowerCase();
      } else {
        values[attrName] = ConversorDatosSimples.convertValue(attrValue, attrType);
        types[key] = attrType.toLowerCase();
      }
    });

    return [nombre, tipo.toLowerCase(), values, types];
  }

  // Seperacion arrays
  private static splitAttributes(content: string): string[] {
    const attributes: string[] = [];
    let buffer = "";
    let insideArray = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === "{" && !insideArray) {
        insideArray = true;
      } else if (char === "}" && insideArray) {
        insideArray = false;
      }

      if (char === ";" && !insideArray) {
        attributes.push(buffer.trim());
        buffer = "";
      } else {
        buffer += char;
      }
    }

    if (buffer.trim()) {
      attributes.push(buffer.trim());
    }

    return attributes;
  }
}

export default ConversorObjetos;
