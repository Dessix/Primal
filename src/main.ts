import { RoleBootstrapMiner } from "./roles/roleBootstrapMiner";
import { RoleRepairer } from "./roles/roleRepairer";
import { RoleUpgrader } from "./roles/roleUpgrader";
import { RoleBuilder } from "./roles/roleBuilder";
import { RoleCourier } from "./roles/roleCourier";
import { RecordStats } from "./util/stats";
import "./extensions/";//Apply extension modules
import { Processes } from "./kernel/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";
//import { inspect } from "../lib/inspect";
import * as Profiler from "../lib/screeps-profiler";
import { DefaultConfig } from "./util/config";
import { FsmRole } from "./roles/fsmRole";

Memory.config = DefaultConfig.apply(Memory.config);
if (Memory.involatile === undefined) { Memory.involatile = {}; }
if (Memory.sources === undefined) { Memory.sources = {}; }

//Enable profiler if configured
if (Memory.config.profile) {
    Profiler.enable();
    Profiler.registerClass(FsmRole, "FsmRole");
    Profiler.registerClass(RoleCourier, "RoleCourier");
    Profiler.registerClass(RoleBuilder, "RoleBuilder");
    Profiler.registerClass(RoleUpgrader, "RoleUpgrader");
    Profiler.registerClass(RoleRepairer, "RoleRepairer");
    Profiler.registerClass(RoleBootstrapMiner, "RoleBootstrapMiner");
    Profiler.registerFN(RecordStats, "RecordStats");
}

Processes.RegisterAll();
function spawnNewProcessTable() {
    const processTable = KernelSerializer.createBlankProcessTable();
    console.log("Ω spawned new process table");
    const procInst: SerializedProcess = {
        className: "Root",
        pid: 0,
        parentPid: 0,
        heat: 1000,
        service: true,
    };
    processTable.push(procInst);
    return processTable;
}

const kernel = global.k = global.kernel = new Kernel();
global.volatile = {};

//Command-line calls
global.reset = function (): void {
    console.log("Ω Rebooting...");
    Memory.proc = spawnNewProcessTable();
    delete Memory.pmem;
};

const inspect = (val: any) => JSON.stringify(val, undefined, 2);

global.sinspect = inspect;
global.inspect = (val: any) => inspect(val);

global.id = new Proxy(Game.getObjectById, { get: function (target, name) { return target(name.toString()); } });

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
        let proc = Memory.proc || spawnNewProcessTable();
        kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    }
    if (Memory.config.noisy) { console.log("Ω Execute"); }
    kernel.run(Game.cpu.limit * 0.75);
    if (Memory.config.noisy) { console.log("Ω Save"); }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    RecordStats();

    //TODO: Temporary, remove after RCL3
    Game.rooms["W14N53"].createConstructionSite(36, 17, STRUCTURE_TOWER);
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
