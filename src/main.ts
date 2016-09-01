import { RecordStats } from "./util/stats";
import "./extensions/";//Apply extension modules
import { Processes } from "./kernel/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";
import { inspect } from "./util/inspect";
import * as Profiler from "../lib/screeps-profiler";
import { DefaultConfig } from "./util/config";

Memory.config = DefaultConfig.apply(Memory.config);

//Enable profiler if configured
if (Memory.config.profile) { Profiler.enable(); }

Processes.RegisterAll();


const kernel = global.k = global.kernel = new Kernel();
global.volatile = {};

//Command-line calls
global.reset = function (): void {
    console.log("Ω Rebooting...");
    Memory.proc = KernelSerializer.createBlankProcessTable();
    delete Memory.pmem;
    console.log("Ω spawned new process table");
    const procInst: SerializedProcess = {
        className: "Root",
        pid: 0,
        parentPid: 0,
        heat: 1000,
        service: true,
    };
    Memory.proc.push(procInst);
};

global.sinspect = inspect;
global.inspect = (val: any) => inspect(val);

global.id = Game.getObjectById;
global.launchNew = function (className: string): number | undefined {
    const procId = kernel.spawnProcessByClassName(className, 0);
    if (procId === undefined) {
        return;
    }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    return procId;
};

if (!global.config) { Object.defineProperty(global, "config", { get: () => Memory.config }); }
if (!global.c) { Object.defineProperty(global, "c", { get: () => Game.creeps }); }
if (!global.s) { Object.defineProperty(global, "s", { get: () => Game.spawns }); }
if (!global.f) { Object.defineProperty(global, "f", { get: () => Game.flags }); }

function mainLoop() {
    global.tickVolatile = {};
    if (Memory.config.noisy) { console.log("Ω Load"); }
    {
        let proc: SerializedProcessTable | undefined = Memory.proc;
        if (proc === undefined) {
            proc = KernelSerializer.createBlankProcessTable();
            console.log("Ω spawned new process table");
            const procInst: SerializedProcess = {
                className: "Root",
                pid: 0,
                parentPid: 0,
                heat: 1000,
                service: true,
            };
            proc.push(procInst);
        }
        kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    }
    if (Memory.config.noisy) { console.log("Ω Execute"); }
    kernel.run(Game.cpu.limit * 0.9);
    if (Memory.config.noisy) { console.log("Ω Save"); }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    RecordStats();
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
