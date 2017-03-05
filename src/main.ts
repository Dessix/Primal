//TODO: This probably doesn't actually occur "first", due to es6 imports. Check, and, if needed, find a solution.
const cpuOverhead = Game.cpu.getUsed();
function ProfileMemoryDeserialization(): number { const start = Game.cpu.getUsed(); Memory; return Game.cpu.getUsed() - start; }
const deserializationTime = ProfileMemoryDeserialization();

import "./globals";
import "./extensions";
import { initVolatile, initTickVolatile } from "./globals/volatile";
import { Kernel } from "./kernel/kernel";
import { recordStats } from "./util/stats";
import * as Profiler from "../lib/screeps-profiler";

import initCli from "./globals/cli";
import initConfig from "./util/config";

initVolatile(global, Memory);
initConfig(global, Memory);

//Enable profiler if configured
if(Memory.config.profile) {
	Profiler.enable();
	//TODO: enable usage of a profiler annotation
	Profiler.registerFN(recordStats, "RecordStats");
}

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
