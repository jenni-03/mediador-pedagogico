import { structureCommands } from "./structureCommands";

export const parseCommand = (input: string, structureType: string): string[] | { error: string } => {
    const trimmed = input.trim();

    // 1. Validar que termine con punto y coma
    if (!trimmed.endsWith(";")) {
        return {
            error: "El comando debe terminar con un punto y coma (;), siguiendo el formato de métodos en Java.",
        };
    }

    // 2. Quitar el punto y coma del final
    const withoutSemicolon = trimmed.slice(0, -1);

    // 3. Validar sintaxis de método tipo Java: nombre(args)
    const methodPattern = /^(\w+)\((.*)\)$/;
    const match = withoutSemicolon.match(methodPattern);

    if (!match) {
        return {
            error: "Formato inválido. Use la sintaxis tipo método, por ejemplo: update(1,10);",
        };
    }

    const command = match[1];
    const argsString = match[2];

    // 4. Validar camelCase exacto
    const camelCasePattern = /^[a-z]+([A-Z][a-z]*)*$/;
    if (!camelCasePattern.test(command)) {
        return {
            error: "El nombre del método debe estar en camelCase, por ejemplo: create(); o insertLast();",
        };
    }

    const validCommands = structureCommands[structureType] || [];

    // 5. Validar si el método existe exactamente
    if (!validCommands.includes(command)) {
        // Si no está exacto, buscar si existe uno con diferencia solo en mayúsculas/minúsculas
        const lowerCommand = command.toLowerCase();
        const matchingCommand = validCommands.find(
            (cmd) => cmd.toLowerCase() === lowerCommand
        );

        if (matchingCommand) {
            return {
                error: `El método '${command}' no está bien escrito. ¿Quizás quisiste escribir '${matchingCommand}'? Recuerda usar camelCase como en Java.`,
            };
        }

        return {
            error: `El método '${command}' no está definido para la estructura '${structureType}'.`,
        };
    }

    // 6. Validar errores como coma final, doble coma o argumentos vacíos
    if (/(^,|,,|,$)/.test(argsString)) {
        return {
            error: `Los argumentos están mal formateados. Evite usar comas dobles, comas al principio o al final.`,
        };
    }

    // 7. Parsear argumentos
    const rawArgs = argsString
        .split(",")
        .map((arg) => arg.trim())
        .filter((arg) => arg.length > 0);

    // Si no hay argumentos (argsString está vacío), retornar solo el comando
    if (argsString.trim() === "") {
        return [command];
    }

    return [command, ...rawArgs];
};
