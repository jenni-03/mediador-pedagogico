class ConversorArrays {
  public static parse(
    declaration: string
  ): [string, string, Record<string, any>, Record<string, string>] {
    const match = declaration.match(/^(\w+)\[\]\s+(\w+)\s*=\s*(\{.+\});$/);

    if (!match) {
      throw new Error(
        `Formato de declaración de array inválido: '${declaration}'`
      );
    }

    const [, tipo, nombre, valores] = match;
    const values: Record<string, any> = { [nombre]: this.parseArray(valores) };
    const types: Record<string, string> = {
      [nombre]: "array",
      [`${nombre}.elemento`]: tipo.toLowerCase(),
    };

    return [nombre, "array", values, types];
  }

  public static parseArray(arrayStr: string): any[] {
    return arrayStr
      .trim()
      .replace(/^\{|\}$/g, "")
      .split(/\s*,\s*/)
      .map((value) => value.replace(/"/g, "").replace(/'/g, ""));
  }
}

export default ConversorArrays;
