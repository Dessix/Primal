import { BaseRole } from "./../roles/baseRole";
import { RoleBootstrapMiner } from "./../roles/roleBootstrapMiner";
import { Process, ProcessStatus } from "../kernel/process";

export class PHarvest extends Process {
    public static className: string = "Harvest";
    public get className(): string { return PHarvest.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        let numHarvesters = 0;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep.role !== RoleBootstrapMiner.RoleTag) { continue; }
            ++numHarvesters;
            const miner: BaseRole = new RoleBootstrapMiner(creep);
            miner.run();
        }
        if (numHarvesters < 2) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                if (spawn.energy >= 300 && !spawn.spawning) {
                    const success = spawn.createCreep([MOVE, MOVE, CARRY, CARRY, WORK], "miner" + Game.time.toString().slice(-4), <CreepMemory>{
                        role: RoleBootstrapMiner.RoleTag,
                    });
                    if (typeof success === "number") {
                        console.log(`Spawn failure: ${success}`);
                    } else {
                        //only work with the first to succeed
                        break;
                    }
                }
            }
        }
        return;
    }

    public minimumHarvestDurationRemaining(): number {
        let ttl = 0;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep.role !== "harv") {
                continue;
            }
            const cttl = creep.ticksToLive;
            if (cttl > ttl) {
                ttl = cttl;
            }
        }
        return ttl;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
    }
}
