import { Processes } from "./processes/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";

Processes.RegisterAll();

const kernel = new Kernel();

export function loop() {
    kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(Memory.proc));
    kernel.run(Game.cpu.limit * 0.9);
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
}
