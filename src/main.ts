import "./extensions/";//Apply extension modules
import { Processes } from "./processes/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";

Processes.RegisterAll();

const kernel = global.kernel = new Kernel();
global.reboot = function() {
    console.log("Ω Rebooting");
    Memory.proc = KernelSerializer.createBlankProcessTable();
    Memory.pmem = {};
    kernel.reboot();
    console.log("Ω Initializing Root");
    Memory.proc.table.push([0, 0, "Root"]);
};

export function loop() {
    console.log("Ω Load");
    {
        let proc = Memory.proc;
        if (proc === undefined) {
            proc = KernelSerializer.createBlankProcessTable();
            console.log("Ω spawned new process table");
            proc.table.push([0, 0, "Root"]);
        }
        kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    }
    console.log("Ω Execute");
    kernel.run(Game.cpu.limit * 0.9);
    console.log("Ω Save");
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
}
