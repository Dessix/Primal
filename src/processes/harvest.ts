import { RoleListing } from "./../ipc/roleListing";
import { RoleDrill } from "./../roles/roleDrill";
import { RoleCourier } from "./../roles/roleCourier";
import { RoleBard } from "./../roles/roleBard";
import { RoleUpgrader } from "./../roles/roleUpgrader";
import { BaseRole } from "./../roles/baseRole";
import { Process, ProcessStatus } from "../kernel/process";
import { MiningScanner } from "../util/miningScanner";

export class PHarvest extends Process {
    public static className: string = "Harvest";
    public get className(): string { return PHarvest.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    private trySpawnCourier(spawn: Spawn, energyAvailable: number, energyCapacityAvailable: number): boolean {
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
                console.log(`Spawning ${global.sinspect(chosenBody)}\n${global.sinspect(creepMemory)}`);
                //only work with the first to succeed
                return true;
            }
        }
        return false;
    }

    private trySpawnDrill(spawn: Spawn, energyAvailable: number, energyCapacityAvailable: number): boolean {
        const chosenBody = RoleDrill.chooseBody(energyAvailable);
        if (chosenBody !== undefined) {
            //TODO: Get source info from MiningScanner and have it manage the complexities of making sure variables are set
            const roomSourceInfo = Memory.sources[spawn.room.name] || (Memory.sources[spawn.room.name] = { sourceInfo: MiningScanner.scan(spawn.room) });
            const creepMemory: CreepMemory = RoleDrill.createInitialMemory(spawn, spawn.room, ++(roomSourceInfo.sourceInfo.lastSourceIndex));
            const success = spawn.createCreep(
                chosenBody,
                RoleDrill.generateName(RoleDrill),
                creepMemory
            );
            if (typeof success === "number") {
                console.log(`Spawn failure: ${success}`);
            } else {
                console.log(`Spawning ${global.sinspect(chosenBody)}\n${global.sinspect(creepMemory)}`);
                //only work with the first to succeed
                return true;
            }
        }
        return false;
    }

    public run(): ProcessMemory | undefined {
        let numDrills = 0;
        let numCouriers = 0;
        const roleMiner = RoleDrill.Instance;
        const roleCourier = RoleCourier.Instance;
        const roleBard = RoleBard.Instance;

        for (let creep of RoleListing.getByRoles(RoleBard, RoleCourier, RoleDrill)) {
            if (creep.role === RoleBard.RoleTag) {
                roleBard.run(creep);
                continue;
            }
            if (creep.role === RoleCourier.RoleTag) {
                ++numCouriers;
                roleCourier.run(creep);
                continue;
            }
            if (creep.role !== RoleDrill.RoleTag) { continue; }
            ++numDrills;
            roleMiner.run(creep);
        }

        for (let spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (spawn.spawning) { continue; }
            const room = spawn.room;
            const energyAvailable = spawn.room.energyAvailable;
            const energyCapacityAvailable = spawn.room.energyCapacityAvailable;

            if ((numDrills >= 1 && numCouriers < 1) || (numDrills >= 2 && numCouriers < 2 * global.config.courierMultiplier)) {
                if (numCouriers >= 1 && numDrills >= 1) {
                    if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
                        break;
                    } else if (energyCapacityAvailable > 450 && energyAvailable < energyCapacityAvailable) {
                        break;
                    }
                    //Prefer larger spawns!
                }
                if (this.trySpawnCourier(spawn, energyAvailable, energyCapacityAvailable)) {
                    break;
                }
            } else if (numDrills < 2) {
                if (numCouriers >= 1 && numDrills >= 1) {
                    if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
                        break;
                    } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
                        break;
                    } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
                        break;
                    }
                    //Prefer larger spawns!
                }
                if (this.trySpawnDrill(spawn, energyAvailable, energyCapacityAvailable)) {
                    break;
                }
            }
        }
        return;
    }
}
