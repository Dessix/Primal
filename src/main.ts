import { RecordStats } from "./util/stats";
import "./extensions/";//Apply extension modules
import { Processes } from "./kernel/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";

interface Global {// tslint:disable-line: class-name
    kernel: {
        spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
    };
    launchNew(className: string): number | undefined;
    reset(): void;
    config: CoreConfiguration;
}
declare const global: Global;

Processes.RegisterAll();

if (Memory.config === undefined) {
    Memory.config = {
        noisy: false,
    };
}

const kernel = global.kernel = new Kernel();

//Command-line calls
global.reset = function (): void {
    console.log("Ω Rebooting...");
    Memory.proc = KernelSerializer.createBlankProcessTable();
    Memory.pmem = {};
    kernel.reboot();
    console.log("Ω Initializing Root...");
    Memory.proc.table.push([0, 0, "Root"]);
};

Object.defineProperty(global, "config", {
    get: () => {
        return Memory.config;
    },
});

global.launchNew = function (className: string): number | undefined {
    const procId = kernel.spawnProcessByClassName(className, 0);
    if (procId === undefined) {
        return;
    }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    return procId;
};

export function loop() {
    PathFinder.use(true);
    if (Memory.config.noisy) { console.log("Ω Load"); }
    {
        let proc = Memory.proc;
        if (proc === undefined) {
            proc = KernelSerializer.createBlankProcessTable();
            console.log("Ω spawned new process table");
            proc.table.push([0, 0, "Root"]);
        }
        kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    }
    if (Memory.config.noisy) { console.log("Ω Execute"); }
    kernel.run(Game.cpu.limit * 0.8);
    if (Memory.config.noisy) { console.log("Ω Save"); }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    RecordStats();
}
