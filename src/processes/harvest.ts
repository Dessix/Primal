import { RoleCourier } from "./../roles/roleCourier";
import { RoleUpgrader } from "./../roles/roleUpgrader";
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
        let numUpgraders = 0;
        let numCouriers = 0;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep.role === RoleUpgrader.RoleTag) { ++numUpgraders; continue; }
            if (creep.role === RoleCourier.RoleTag) {
                ++numCouriers;
                const courier: BaseRole = new RoleCourier(creep);
                courier.run();
                continue;
            }
            if (creep.role !== RoleBootstrapMiner.RoleTag) { continue; }
            ++numHarvesters;
            const miner: BaseRole = new RoleBootstrapMiner(creep);
            miner.run();
        }
        if (numHarvesters < 2) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                const energyAvailable = spawn.room.energyAvailable;
                if (!spawn.spawning) {
                    const chosenBody = RoleBootstrapMiner.chooseBody(energyAvailable);
                    if (chosenBody !== undefined) {
                        const creepMemory: CreepMemory = {
                            spawnName: spawn.name,
                            role: RoleBootstrapMiner.RoleTag,
                        };
                        const success = spawn.createCreep(
                            chosenBody,
                            RoleBootstrapMiner.generateName(RoleBootstrapMiner),
                            creepMemory
                        );
                        if (typeof success === "number") {
                            console.log(`Spawn failure: ${success}`);
                        } else {
                            //only work with the first to succeed
                            break;
                        }
                    }
                }
            }
        } else if (numHarvesters >= 2 && numUpgraders >= 1 && numCouriers < 1) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                const energyAvailable = spawn.room.energyAvailable;
                if (!spawn.spawning) {
                    const chosenBody = RoleCourier.chooseBody(energyAvailable);
                    if (chosenBody !== undefined) {
                        const creepMemory: CreepMemory = {
                            spawnName: spawn.name,
                            role: RoleCourier.RoleTag,
                        };
                        const success = spawn.createCreep(
                            chosenBody,
                            RoleCourier.generateName(RoleCourier),
                            creepMemory
                        );
                        if (typeof success === "number") {
                            console.log(`Spawn failure: ${success}`);
                        } else {
                            //only work with the first to succeed
                            break;
                        }
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
