import { Process, ProcessStatus } from "../kernel/process";

export class PUpgrade extends Process {
    public static className: string = "Upgrade";
    public get className(): string { return PUpgrade.className; }
    private pmem: number;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        let pmem = this.pmem;
        console.log("Upgrade");

        for (let creepName of Object.keys(Game.creeps)) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory & {upgrading: boolean}>creep.memory;
            if (cmem.role !== "upgr") {
                continue;
            }
            console.log("Upgrade with " + creep.name);
            if (cmem.upgrading && creep.carry.energy === 0) {
                cmem.upgrading = false;
                creep.say("harvesting");
            }
            if (!cmem.upgrading && creep.carry.energy === creep.carryCapacity) {
                cmem.upgrading = true;
                creep.say("upgrading");
            }

            if (cmem.upgrading) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            } else {
                let sources = creep.room.find<Source>(FIND_SOURCES);
                if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
        }
        return;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
    }
}
