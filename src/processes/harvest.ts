import { RoleBootstrapMiner } from "./../roles/roleBootstrapMiner";
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

    private trySpawnBootstrap(spawn: Spawn, energyAvailable: number, energyCapacityAvailable: number): boolean {
        const chosenBody = RoleBootstrapMiner.chooseBody(energyAvailable);
        if (chosenBody === undefined) {
            return false;
        }
        //TODO: Get source info from MiningScanner and have it manage the complexities of making sure variables are set
        const roomSourceInfo = Memory.sources[spawn.room.name] || (Memory.sources[spawn.room.name] = { sourceInfo: MiningScanner.scan(spawn.room) });
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
            console.log(`Spawning ${global.sinspect(chosenBody)}\n${global.sinspect(creepMemory)}`);
            //only work with the first to succeed
            return true;
        }
        return false;
    }

    public run(): ProcessMemory | undefined {
        const roleDrill = RoleDrill.Instance;
        const roleCourier = RoleCourier.Instance;
        const roleBard = RoleBard.Instance;
        const roleBootstrapMiner = RoleBootstrapMiner.Instance;

        const drills = RoleListing.getByRole(RoleDrill);
        const bards = RoleListing.getByRole(RoleBard);
        const couriers = RoleListing.getByRole(RoleCourier);
        const bootstraps = RoleListing.getByRole(RoleBootstrapMiner);

        for (let drill of drills) {
            roleDrill.run(drill);
        }
        for (let courier of couriers) {
            roleCourier.run(courier);
        }
        for (let bard of bards) {
            roleBard.run(bard);
        }
        for (let bootstrap of bootstraps) {
            roleBootstrapMiner.run(bootstrap);
        }

        const numDrills = drills.length;
        const numCouriers = couriers.length;
        const numBootstrapMiners = bootstraps.length;

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
                    } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
                        break;
                    } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
                        break;
                    } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
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
                    } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
                        break;
                    }
                    //Prefer larger spawns!
                }
                if (this.trySpawnDrill(spawn, energyAvailable, energyCapacityAvailable)) {
                    break;
                }
            } else if (numDrills >= 2 && numCouriers >= 2 && numBootstrapMiners < 4) {
                if (numCouriers >= 1 && numDrills >= 1) {
                    if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
                        break;
                    } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
                        break;
                    } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
                        break;
                    } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
                        break;
                    } else if (energyCapacityAvailable > 750 && energyAvailable < 750) {
                        break;
                    } else if (energyCapacityAvailable > 850 && energyAvailable < 850) {
                        break;
                    }
                    //Prefer larger spawns!
                }
                if (this.trySpawnBootstrap(spawn, energyAvailable, energyCapacityAvailable)) {
                    break;
                }
            }
        }
        return;
    }
}
