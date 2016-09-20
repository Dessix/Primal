import { RoleListing } from "./../ipc/roleListing";
import * as Roles from "../roles";
import { Process, ProcessStatus } from "../kernel/process";
import { MiningScanner } from "../util/miningScanner";

export class PHarvest extends Process<ProcessMemory> {
    public static className: string = "Harvest";

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    private trySpawnCourier(spawn: Spawn, energyAvailable: number, energyCapacityAvailable: number): boolean {
        const chosenBody = Roles.RoleCourier.chooseBody(energyAvailable);
        if (chosenBody !== undefined) {
            const creepMemory: CreepMemory = {
                spawnName: spawn.name,
                role: Roles.RoleCourier.RoleTag,
                homeRoomName: spawn.room.name,
            };
            const success = spawn.createCreep(
                chosenBody,
                Roles.RoleCourier.generateName(Roles.RoleCourier, creepMemory),
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
        const chosenBody = Roles.RoleDrill.chooseBody(energyAvailable);
        if (chosenBody !== undefined) {
            //TODO: Get source info from MiningScanner and have it manage the complexities of making sure variables are set
            const roomSourceInfo = MiningScanner.getScanInfoForRoom(spawn.room);
            const creepMemory: CreepMemory = Roles.RoleDrill.createInitialMemory(spawn, spawn.room, ++(roomSourceInfo.lastSourceIndex));
            const success = spawn.createCreep(
                chosenBody,
                Roles.RoleDrill.generateName(Roles.RoleDrill, creepMemory),
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
        const chosenBody = Roles.RoleBootstrapMiner.chooseBody(energyAvailable);
        if (chosenBody === undefined) {
            return false;
        }
        //TODO: Get source info from MiningScanner and have it manage the complexities of making sure variables are set
        const roomSourceInfo = MiningScanner.getScanInfoForRoom(spawn.room);
        const creepMemory: CreepMemory = {
            spawnName: spawn.name,
            role: Roles.RoleBootstrapMiner.RoleTag,
            homeRoomName: spawn.room.name,
        };
        const success = spawn.createCreep(
            chosenBody,
            Roles.RoleBootstrapMiner.generateName(Roles.RoleBootstrapMiner, creepMemory),
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

    public run(pmem: ProcessMemory): void {
        const roleDrill = Roles.RoleDrill.Instance;
        const roleCourier = Roles.RoleCourier.Instance;
        const roleBard = Roles.RoleBard.Instance;
        const roleBootstrapMiner = Roles.RoleBootstrapMiner.Instance;

        const drills = Array.from(RoleListing.getByRole(Roles.RoleDrill));
        const bards = RoleListing.getByRole(Roles.RoleBard);
        const couriers = RoleListing.getByRole(Roles.RoleCourier);
        const bootstraps = RoleListing.getByRole(Roles.RoleBootstrapMiner);

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

        const numDrills = drills.filter(d => d.ticksToLive > 25).length;
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
    }
}
