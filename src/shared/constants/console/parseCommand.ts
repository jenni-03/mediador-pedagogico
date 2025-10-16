import { structureCommands } from "./structureCommands";

type ParseOptions = {
  isCreated: boolean; // ← obliga prefijo si true
  expectedPrefix: string; // ← ej: "se", "pila", "colaP", etc.
  disallowPrefixBeforeCreation?: boolean; // ← opcional: si quieres prohibir prefijo antes
  structurePrueba: any;
};

// Comandos que CREAN/INICIALIZAN la estructura (no requieren que exista previamente)
const creatorCommands: Record<string, string[]> = {
  secuencia: ["create"],
  pila: ["push"],
  cola: ["enqueue"],
  "cola de prioridad": ["enqueue"],
  tabla_hash: ["create"],
  lista_enlazada: ["insertFirst", "insertAt", "insertLast"],
  arbol_binario: ["insertLeft", "insertRight"],
  arbol_binario_busqueda: ["insert"],
  arbol_avl: ["insert"],
  arbol_rojinegro: ["insert"],
  arbol_splay: ["insert"],
  arbol_nario: ["createRoot"],
  arbol_123: ["insert"],
  arbol_b: ["insert"],
  arbol_b_plus: ["insert"],
  arbol_heap: ["insert"],
};

const isCreatorCommand = (structureType: string, command: string): boolean => {
  const creators = creatorCommands[structureType] || [];
  return creators.includes(command);
};

const isCreateWithoutPrefixException = (
  structureType: string,
  command: string
) =>
  command === "create" &&
  (structureType === "tabla_hash" || structureType === "secuencia");

export const parseCommand = (
  input: string,
  structureType: string,
  options: ParseOptions
): string[] | { error: string } => {
  const {
    isCreated,
    expectedPrefix,
    disallowPrefixBeforeCreation,
    structurePrueba,
  } = options;

  const trimmed = input.trim();

  // 1. Validar que termine con punto y coma
  if (!trimmed.endsWith(";")) {
    return { error: "El comando debe terminar con ';'." };
  }

  // 2. Quitar el ;
  const withoutSemicolon = trimmed.slice(0, -1);

  let methodCall = withoutSemicolon;

  // 3. Detectar prefijo (ej: se. o pila.)
  const hasPrefix = methodCall.startsWith(`${expectedPrefix}.`);
  const tempMethodCall = hasPrefix
    ? methodCall.slice(expectedPrefix.length + 1)
    : methodCall;

  // 4. Obtener comando
  const tempMatch = tempMethodCall.match(/^(\w+)\(/);
  const rawCommand = tempMatch ? tempMatch[1] : "";

  // --- Excepción de prefijo para create en tabla_hash/secuencia ---
  const skipPrefixRules = isCreateWithoutPrefixException(
    structureType,
    rawCommand
  );

  if (hasPrefix && skipPrefixRules) {
    return {
      error: `El comando 'create' para '${structureType}' no debe llevar prefijo. Use: create();`,
    };
  }

  // A) Si ya está creada, prefijo obligatorio (salvo excepción)
  if (isCreated && !hasPrefix && !skipPrefixRules) {
    return {
      error: `Debe indicar el objeto sobre el cuál se va a realizar la acción, el comando debe empezar con '${expectedPrefix}.'`,
    };
  }

  // B) Si NO está creada y usan prefijo con comando creador, normalmente se prohíbe... salvo excepción
  if (
    !isCreated &&
    hasPrefix &&
    structurePrueba.getTamanio() === 0 &&
    isCreatorCommand(structureType, rawCommand) &&
    !skipPrefixRules
  ) {
    return {
      error: `No puede usar el prefijo '${expectedPrefix}.' porque la estructura aún no existe. Use: ${rawCommand}(); (sin prefijo)`,
    };
  }

  // C) Si NO está creada y NO es comando creador, bloquear (flag) — no afecta a la excepción
  if (
    !isCreated &&
    structurePrueba.getTamanio() === 0 &&
    disallowPrefixBeforeCreation &&
    !isCreatorCommand(structureType, rawCommand)
  ) {
    return {
      error: `Aún no existe un objeto de la estructura. Primero debe crearla usando: ${creatorCommands[structureType]?.join(", ") || "create"
        }.`,
    };
  }

  // 4. Quitar el prefijo
  if (hasPrefix) {
    methodCall = methodCall.slice(expectedPrefix.length + 1);
  }

  // 5. Validar sintaxis de método tipo Java: nombre(args)
  const methodPattern = /^(\w+)\((.*)\)$/;
  const match = methodCall.match(methodPattern);
  if (!match) {
    const hint = isCreated
      ? `${expectedPrefix}.metodo(args);`
      : `metodo(args);`;
    return { error: `Formato inválido. Use la sintaxis: ${hint}` };
  }

  const command = match[1];
  const argsString = match[2];

  // 6. Validar camelCase
  const camelCasePattern = /^[a-z]+([A-Z][a-z]*)*$/;
  if (!camelCasePattern.test(command)) {
    const hint = isCreated ? `${expectedPrefix}.create();` : `create();`;
    return {
      error: `El nombre del método debe estar en camelCase. Ej: ${hint}`,
    };
  }

  const validCommands = structureCommands[structureType] || [];

  // 7. Validar si el método existe exactamente
  if (!validCommands.includes(command)) {
    const lower = command.toLowerCase();
    const matching = validCommands.find((c) => c.toLowerCase() === lower);
    if (matching) {
      const suggestion = isCreated
        ? `${expectedPrefix}.${matching}();`
        : `${matching}();`;
      return {
        error: `El método '${command}' no está bien escrito. ¿Quizás '${suggestion}'?`,
      };
    }
    return {
      error: `El método '${command}' no está definido para '${structureType}'.`,
    };
  }

  // args
  if (argsString.trim() === "") return [command];

  // split robusto + normalización (quitamos comillas exteriores)
  const rawArgs = splitArgsSafe(argsString).map(stripOuterQuotes);
  if (rawArgs.some((a) => a === "")) {
    return { error: "Argumentos mal formateados (comas de más o vacías)." };
  }

  // ────────────────── COERCIÓN ESPECÍFICA PARA ÁRBOL N-ARIO ──────────────────
  if (structureType === "arbol_nario") {
    const toNum = (s: string) => Number(s); // asume validación previa
    switch (command) {
      case "createRoot": {
        const value = toNum(rawArgs[0]);
        return [command, value] as any;
      }
      case "insertChild": {
        // parts: parentId value [index]
        const parentId = toNum(rawArgs[0]);
        const value = toNum(rawArgs[1]);
        const index = rawArgs[2] !== undefined ? toNum(rawArgs[2]) : undefined;
        return (
          index === undefined
            ? [command, parentId, value]
            : [command, parentId, value, index]
        ) as any;
      }
      case "deleteNode": {
        const id = toNum(rawArgs[0]);
        return [command, id] as any;
      }
      case "moveNode": {
        // parts: id newParentId [index]
        const id = toNum(rawArgs[0]);
        const newParentId = toNum(rawArgs[1]);
        const index = rawArgs[2] !== undefined ? toNum(rawArgs[2]) : undefined;
        return (
          index === undefined
            ? [command, id, newParentId]
            : [command, id, newParentId, index]
        ) as any;
      }
      case "updateValue": {
        const id = toNum(rawArgs[0]);
        const newValue = toNum(rawArgs[1]);
        return [command, id, newValue] as any;
      }
      case "search": {
        const value = toNum(rawArgs[0]);
        return [command, value] as any;
      }
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  // Por defecto (todas las otras estructuras): devolver strings
  return [command, ...rawArgs];
};

// === helpers nuevos ===
function splitArgsSafe(args: string): string[] {
  // separa por comas, respetando '...' y "..."
  const out: string[] = [];
  let cur = "";
  let inS = false,
    inD = false,
    depth = 0;

  for (let i = 0; i < args.length; i++) {
    const ch = args[i];

    if (ch === "'" && !inD) {
      inS = !inS;
      cur += ch;
      continue;
    }
    if (ch === '"' && !inS) {
      inD = !inD;
      cur += ch;
      continue;
    }

    if (!inS && !inD) {
      if (ch === "(") depth++;
      if (ch === ")" && depth > 0) depth--;
      if (ch === "," && depth === 0) {
        // const token = cur.trim();
        // if (token !== "") out.push(token);
        // cur = "";
        // continue;
        // aquí ya no filtramos vacíos
        out.push(cur.trim());
        cur = "";
        continue;
      }
    }
    cur += ch;
  }
  // const last = cur.trim();
  // if (last !== "") out.push(last);
  // return out;
  // último token
  out.push(cur.trim());

  return out;
}

function stripOuterQuotes(s: string): string {
  return s.replace(/^'(.*)'$/, "$1").replace(/^"(.*)"$/, "$1");
}
