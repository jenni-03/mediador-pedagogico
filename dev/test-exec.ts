import { MemoryVM } from "../src/memory/vm";
import { Executor } from "../src/memory/executor";

const vm = new MemoryVM();
const ex = new Executor(vm);

function run(line: string) {
  const [ok, msg] = ex.run(line);
  const tag = ok ? "OK " : "ERR";
  console.log(`$ ${line}\n${tag}: ${msg}\n`);
}

function snap() {
  const state = vm.snapshot();
  console.log("=== STACK ===");
  for (const f of state.stack) {
    console.log(`Frame #${f.id} ${f.name}`);
    for (const s of f.locals) {
      console.log(
        `  ${s.stackAddr} ${s.name} : ${s.type} = ${
          s.isRef ? `ref→${s.value?.address}` : JSON.stringify(s.value)
        }`
      );
    }
  }
  console.log("=== HEAP ===");
  for (const h of state.heap) {
    console.log(`  ${h.address} (${h.type}) ref=${h.refCount} value=`, h.value);
  }
  console.log();
}

// --- pruebas ---
run("int x = 3;");
run("int y = 9;");
run("x = y;");
snap();

run('object p1 = new object(nombre = "Ana");');
run('object p2 = new object(nombre = "Lina");');
snap();

run("p2 = p1;");
snap();

run("enter foo();");
run('object q = new object(id = 7);');
snap();
run("leave;");
snap();