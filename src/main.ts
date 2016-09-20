const initialCpuOverhead = Game.cpu.getUsed();
function ProfileMemoryDeserialization(): number {
    const start = Game.cpu.getUsed();
    Memory;
    return Game.cpu.getUsed() - start;
}
let initialMemoryInitializationTime = ProfileMemoryDeserialization();

import * as Roles from "./roles";
import { RecordStats } from "./util/stats";
import "./extensions/";//Apply extension modules
import { Processes } from "./kernel/processes";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Kernel } from "./kernel/kernel";
//import { inspect } from "../lib/inspect";
import * as Profiler from "../lib/screeps-profiler";
import { DefaultConfig } from "./util/config";

Memory.config = DefaultConfig.apply(Memory.config);
if (Memory.involatile === undefined) { Memory.involatile = {}; }

//Enable profiler if configured
if (Memory.config.profile) {
    Profiler.enable();
    Profiler.registerClass(Roles.FsmRole, "FsmRole");
    Profiler.registerClass(Roles.RoleCourier, "RoleCourier");
    Profiler.registerClass(Roles.RoleBuilder, "RoleBuilder");
    Profiler.registerClass(Roles.RoleUpgrader, "RoleUpgrader");
    Profiler.registerClass(Roles.RoleRepairer, "RoleRepairer");
    Profiler.registerClass(Roles.RoleBootstrapMiner, "RoleBootstrapMiner");
    Profiler.registerFN(RecordStats, "RecordStats");
}

Processes.RegisterAll();

const kernel = global.k = global.kernel = new Kernel();
global.volatile = {};

//Command-line calls
global.reset = function (): SerializedProcessTable {
    console.log("Ω Rebooting...");
    Memory.proc = KernelSerializer.spawnNewProcessTable();
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
    const chosenBody = Roles.RoleBard.chooseBody(energyAvailable);
    if (chosenBody === undefined) {
        //console.log("No body could be chosen");
        return;
    }
    const creepMemory: CreepMemory = {
        spawnName: spawn.name,
        role: Roles.RoleBard.RoleTag,
        homeRoomName: spawn.room.name,
    };
    const success = spawn.createCreep(
        chosenBody,
        Roles.RoleBard.generateName(Roles.RoleBard, creepMemory),
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
        console.log(`${i + 1}: ${item.structureType}`);
    }
};

function loadProcessTable(k: Kernel): void {
    let proc = Memory.proc;
    if (proc === undefined || proc.length === 0) {
        proc = KernelSerializer.spawnNewProcessTable();
        console.log("Ω spawned new process table");
    }
    Memory.proc = proc;
    try {
        k.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    } catch (e) {
        console.log("ERROR loading process table: %s\n%s", e, e.stack);
        k.loadProcessTable(KernelSerializer.deserializeProcessTable(global.reset()));
    }
}

function saveProcessTable(k: Kernel): void {
    try {
        Memory.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    } catch (e) {
        delete Memory.proc;
    }
}

let isInitTick = true;
const minCpuAlloc = 0.35;
const minCpuAllocInverse = 1 - minCpuAlloc;
function mainLoop() {
    const memoryInitializationTime = (isInitTick ? initialMemoryInitializationTime : ProfileMemoryDeserialization());
    global.tickVolatile = {};
    const bucket = Game.cpu.bucket;
    const cpuLimitRatio = ((bucket * bucket) * minCpuAllocInverse * 10e-8) + minCpuAlloc;
    loadProcessTable(kernel);
    kernel.run(Game.cpu.limit * cpuLimitRatio);
    saveProcessTable(kernel);
    RecordStats(initialCpuOverhead, memoryInitializationTime);
    isInitTick = false;
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
