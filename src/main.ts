import { RoleBard } from "./roles/roleBard";
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
global.reset = function (): SerializedProcessTable {
    console.log("Ω Rebooting...");
    Memory.proc = spawnNewProcessTable();
    delete Memory.pmem;
    return Memory.proc;
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

(<any>global).spawnBard = function () {
    const spawn = Game.spawns["Hive"];
    const room = spawn.room;
    const energyAvailable = room.energyAvailable;
    const energyCapacityAvailable = room.energyCapacityAvailable;
    const chosenBody = RoleBard.chooseBody(energyAvailable);
    if (chosenBody === undefined) {
        //console.log("No body could be chosen");
        return;
    }
    const creepMemory: CreepMemory = {
        spawnName: spawn.name,
        role: RoleBard.RoleTag,
    };
    const success = spawn.createCreep(
        chosenBody,
        RoleBard.generateName(RoleBard),
        creepMemory
    );
    if (typeof success === "number") {
        //console.log(`Spawn failure: ${success}`);
        return;
    }
    console.log(global.sinspect(spawn.spawning));
};

(<any>global).showBuildQueue = function (room: Room) {
    const buildQueue = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);
    for (let i = 0, n = buildQueue.length; i < n; ++i) {
        const item = buildQueue[i];
        console.log(`${i+1}: ${item.structureType}`);
    }
};

function mainLoop() {
    //PathFinder.use(false);//Disable when pathing acts sanely again
    global.tickVolatile = {};
    if (Memory.config.noisy) { console.log("Ω Load"); }
    {
        let proc = Memory.proc || spawnNewProcessTable();
        try {
            kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
        } catch (e) {
            console.log("ERROR loading process table: %s\n%s", e, e.stack);
            kernel.loadProcessTable(KernelSerializer.deserializeProcessTable(global.reset()));
        }
    }
    if (Memory.config.noisy) { console.log("Ω Execute"); }
    kernel.run(Game.cpu.limit * 0.75);
    if (Memory.config.noisy) { console.log("Ω Save"); }
    Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    RecordStats();
    //(<any>global).spawnBard();
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
