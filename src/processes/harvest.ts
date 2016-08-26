import { Process, ProcessStatus } from "../kernel/process";

export class PHarvest extends Process {
    public static className: string = "Harvest";
    public get className(): string { return PHarvest.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(_pmem: ProcessMemory | undefined): ProcessMemory | undefined {
        console.log("Harvest");

        for (let creepName of Object.keys(Game.creeps)) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory>creep.memory;
            if (cmem.role !== "harv") {
                continue;
            }
            console.log("Harvest with " + creep.name);
            if (creep.carry.energy < creep.carryCapacity) {
                const sources = creep.room.find<Source>(FIND_SOURCES);
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            } else {
                if (creep.transfer(Game.spawns["Spawn1"], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns["Spawn1"]);
                }
            }
        }
        return;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
    }
}
