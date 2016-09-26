const cpuOverhead = Game.cpu.getUsed();
function ProfileMemoryDeserialization(): number { const start = Game.cpu.getUsed(); Memory; return Game.cpu.getUsed() - start; }
const deserializationTime = ProfileMemoryDeserialization();

import "./extensions/";//Apply extension modules
import { initVolatile, initTickVolatile } from "./globals/volatile";
import { Kernel } from "./kernel/kernel";
import { KernelSerializer } from "./kernel/kernelSerializer";
import { Processes } from "./kernel/processes";
import { recordStats } from "./util/stats";
import * as Profiler from "../lib/screeps-profiler";
import * as Roles from "./roles";
import initCli from "./globals/cli";
import initConfig from "./util/config";

initVolatile(global, Memory);
initConfig(global, Memory);

//Enable profiler if configured
if (Memory.config.profile) {
    Profiler.enable();
    Profiler.registerClass(Roles.FsmRole, "FsmRole");
    Profiler.registerClass(Roles.RoleCourier, "RoleCourier");
    Profiler.registerClass(Roles.RoleBuilder, "RoleBuilder");
    Profiler.registerClass(Roles.RoleUpgrader, "RoleUpgrader");
    Profiler.registerClass(Roles.RoleRepairer, "RoleRepairer");
    Profiler.registerClass(Roles.RoleBootstrapMiner, "RoleBootstrapMiner");
    Profiler.registerFN(recordStats, "RecordStats");
}

Processes.RegisterAll();

const kernel = global.kernel = new Kernel(Memory);
initCli(global, Memory, kernel);

function loadProcessTable(k: Kernel): void {
    let proc = k.mem.proc;
    if (proc === undefined || proc.length === 0) {
        proc = KernelSerializer.spawnNewProcessTable();
        console.log("Ω spawned new process table");
    }
    k.mem.proc = proc;
    try {
        k.loadProcessTable(KernelSerializer.deserializeProcessTable(proc));
    } catch (e) {
        console.log("ERROR loading process table: %s\n%s", e, e.stack);
        k.loadProcessTable(KernelSerializer.deserializeProcessTable(global.reset()));
    }
}

function saveProcessTable(k: Kernel): void {
    try {
        k.mem.proc = KernelSerializer.serializeProcessTable(kernel.getProcessTable());
    } catch (e) {
        delete k.mem.proc;
    }
}

let isInitTick = true;
const minCpuAlloc = 0.35, minCpuAllocInverseFactor = (1 - minCpuAlloc) * 10e-8;
function mainLoop() {
    const memoryInitializationTime = (isInitTick ? (isInitTick = false, deserializationTime) : ProfileMemoryDeserialization());
    initTickVolatile(global);
    const bucket = Game.cpu.bucket, cpuLimitRatio = (bucket * bucket) * minCpuAllocInverseFactor + minCpuAlloc;
    loadProcessTable(kernel);
    kernel.run(Game.cpu.limit * cpuLimitRatio);
    saveProcessTable(kernel);
    recordStats(cpuOverhead, memoryInitializationTime);
    isInitTick = false;
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
