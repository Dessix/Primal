const cpuOverhead = Game.cpu.getUsed();
function ProfileMemoryDeserialization(): number { const start = Game.cpu.getUsed(); Memory; return Game.cpu.getUsed() - start; }
const deserializationTime = ProfileMemoryDeserialization();

import "./extensions/";//Apply extension modules
import { initVolatile, initTickVolatile } from "./globals/volatile";
import { Kernel } from "./kernel/kernel";
import { Processes } from "./kernel/processes";
import { recordStats } from "./util/stats";
import * as Profiler from "../lib/screeps-profiler";
import * as Roles from "./roles";
import initCli from "./globals/cli";
import initConfig from "./util/config";

initVolatile(global, Memory);
initConfig(global, Memory);

//Enable profiler if configured
if(Memory.config.profile) {
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

if((<KernelMemory>Memory).pmem == null) { (<KernelMemory>Memory).pmem = {}; }
const kernel: IKernel = global.kernel = new Kernel(() => (<KernelMemory>Memory));
initCli(global, Memory, kernel);

let isInitTick = true;
const minCpuAlloc = 0.35, minCpuAllocInverseFactor = (1 - minCpuAlloc) * 10e-8;
function mainLoop() {
	const memoryInitializationTime = (isInitTick ? (isInitTick = false, deserializationTime) : ProfileMemoryDeserialization());
	initTickVolatile(global);
	const bucket = Game.cpu.bucket, cpuLimitRatio = (bucket * bucket) * minCpuAllocInverseFactor + minCpuAlloc;
	//TODO: Consider skipping load if on the same shard as last time? Consider costs of loss of one-tick-volatility storage.
	kernel.loadProcessTable();
	kernel.run(Game.cpu.limit * cpuLimitRatio);
	kernel.saveProcessTable();
	recordStats(cpuOverhead, memoryInitializationTime);
	isInitTick = false;
};

export const loop = !Memory.config.profile ? mainLoop : Profiler.wrap(mainLoop);
