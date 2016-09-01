import { RoleUpgrader } from "./roleUpgrader";
import { RoleRepairer } from "./roleRepairer";
import { RoleBuilder } from "./roleBuilder";
import { RoleBootstrapMiner } from "./roleBootstrapMiner";
import { BaseRole } from "./baseRole";

enum CourierState {
    Decide,
    Wait,
    Pickup,
    Deliver,
}

interface CourierMemory extends CreepMemory {
    crr_st?: CourierState;
    crr_targ?: string | number;//Object ID
}

export class RoleCourier extends BaseRole {
    public static RoleTag: string = "crr";
    public get cmem() { return <CourierMemory>this.creep.memory; }
    public set cmem(value: CourierMemory) { this.creep.memory = value; }

    public constructor(creep: Creep) {
        super(creep);
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] | undefined {
        let chosenBody: string[];
        if (energyAvailable >= 750) {
            chosenBody = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        } else if (energyAvailable >= 600) {
            chosenBody = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        } else if (energyAvailable >= 450) {
            chosenBody = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        } else if (energyAvailable >= 300) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
        } else if (energyAvailable >= 150) {
            chosenBody = [MOVE, CARRY, CARRY];
        } else if (energyAvailable >= 100) {
            chosenBody = [MOVE, CARRY];
        } else {
            return undefined;
        }
        return <CreepBodyPart[]>chosenBody;
    }

    private findPickupTarget(creep: Creep, cmem: CourierMemory): void {
        const spawn = Game.spawns[cmem.spawnName];
        let container: StructureContainer | undefined;
        const flags = spawn.room.find<Flag>(FIND_FLAGS);
        for (let flag of flags) {
            if (
                flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
            ) {
                continue;
            }
            const testContainer = flag.lookForStructureAtPosition<StructureContainer>(STRUCTURE_CONTAINER);
            if (testContainer !== undefined && testContainer.store["energy"] > creep.carryCapacity) {
                container = testContainer;
            }
        }

        if (container !== undefined) {
            if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        } else {
            let sources = creep.room.find<Source>(FIND_SOURCES).filter(s => s.pos.lookFor<Flag>(LOOK_FLAGS).find(f => f.color === COLOR_GREEN && f.secondaryColor === COLOR_YELLOW) === undefined);
            if (creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        }
    }

    private readonly waitTickCount: number = 5;

    private performWait(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (cmem.crr_targ === undefined) {
            cmem.crr_targ = Game.time + this.waitTickCount;
        }
        if (Game.time < cmem.crr_targ) {
            const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
            if (idleFlag !== undefined) {
                creep.moveTo(idleFlag);
            }
            return;
        }
        return CourierState.Decide;
    }

    private getPickupTarget(creep: Creep, cmem: CourierMemory): StructureContainer | StructureStorage | Resource | undefined {
        if (cmem.crr_targ !== undefined) {
            const rawTarget = Game.getObjectById(<string>cmem.crr_targ);
            if (rawTarget !== null) {
                const struct = <StructureContainer | StructureStorage>rawTarget;
                switch (struct.structureType) {
                    case STRUCTURE_STORAGE:
                    case STRUCTURE_CONTAINER: {
                        const storageOrContainer = <StructureContainer | StructureStorage>struct;
                        if (storageOrContainer.store["energy"] < storageOrContainer.storeCapacity) {
                            return storageOrContainer;
                        }
                        break;
                    }
                    default: {
                        const res = <Resource>rawTarget;
                        return res;
                    }
                }
            }
            delete cmem.crr_targ;
        }

        const spawn = Game.spawns[cmem.spawnName];

        const dropped = spawn.room.find<Resource>(FIND_DROPPED_ENERGY);
        if (dropped.length > 0) {
            return _.max<Resource>(dropped, _dropped => _dropped.amount);
        }

        {
            const flags = spawn.room.find<Flag>(FIND_FLAGS);
            for (let flag of flags) {
                if (flag.color === COLOR_CYAN || flag.secondaryColor === COLOR_YELLOW) {
                    continue;
                }
                const container = flag.pos.lookForStructure<StructureContainer>(STRUCTURE_CONTAINER);
                if (container !== undefined && container.store["energy"] > 0) {
                    return container;
                }
            }
        }


        // {
        //     const storage = spawn.room.storage;
        //     if (storage !== undefined && storage.store.energy < storage.storeCapacity) {
        //         cmem.crr_targ = storage.id;
        //         return storage;
        //     }
        // }

        return;
    }

    private performPickup(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        const spawn = Game.spawns[cmem.spawnName];
        const target = this.getPickupTarget(creep, cmem);
        if (creep.carry.energy === creep.carryCapacity) {
            return CourierState.Deliver;
        }
        if (target === undefined) {
            return CourierState.Wait;
        }
        if ((<StructureStorage | StructureContainer>target).store) {
            if ((<StructureStorage | StructureContainer>target).transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { reusePath: 20 });
            }
        } else {
            if (creep.pickup(<Resource>target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { reusePath: 20 });
            } else {
                return CourierState.Decide;
            }
        }
    }

    private getDeliveryTarget(creep: Creep, cmem: CourierMemory): Spawn | Structure | undefined {
        if (cmem.crr_targ !== undefined) {
            const rawTarget = Game.getObjectById(<string>cmem.crr_targ);
            if (rawTarget !== null) {
                const struct = <Spawn | Structure>rawTarget;
                switch (struct.structureType) {
                    case STRUCTURE_EXTENSION:
                    case STRUCTURE_SPAWN: {
                        const spawnOrExt = <Spawn | StructureExtension>struct;
                        if (spawnOrExt.energy < spawnOrExt.energyCapacity) {
                            return spawnOrExt;
                        }
                        break;
                    }
                    case STRUCTURE_STORAGE:
                    case STRUCTURE_CONTAINER: {
                        const storageOrContainer = <StructureContainer | StructureStorage>struct;
                        if (storageOrContainer.store["energy"] < storageOrContainer.storeCapacity) {
                            return storageOrContainer;
                        }
                        break;
                    }
                    case STRUCTURE_TOWER: {
                        const tower = <StructureTower>struct;
                        if (tower.energy < tower.energyCapacity) {
                            return tower;
                        }
                        break;
                    }
                    default:
                        //Find a new target, selected one is full.
                        break;
                }
            }
            //console.log("Find new carry target");
            delete cmem.crr_targ;
        }

        // This creep's spawn
        const spawn = Game.spawns[cmem.spawnName];
        if (spawn !== undefined && spawn.energy < spawn.energyCapacity) {
            cmem.crr_targ = spawn.id;
            return spawn;
        }

        let myStructures: Structure[] | undefined = undefined;
        if (spawn.room.energyAvailable < spawn.room.energyCapacityAvailable) {
            //Worth scanning for non-full extensions
            if (myStructures === undefined) { myStructures = spawn.room.find<Structure>(FIND_MY_STRUCTURES); }

            for (let ext of myStructures) {
                if (
                    ext.structureType !== STRUCTURE_EXTENSION ||
                    (<StructureExtension>ext).energy === (<StructureExtension>ext).energyCapacity
                ) {
                    continue;
                }
                cmem.crr_targ = ext.id;
                return ext;
            }
        }

        if (myStructures === undefined) { myStructures = spawn.room.find<Structure>(FIND_MY_STRUCTURES); }
        for (let tower of myStructures) {
            if (
                tower.structureType !== STRUCTURE_TOWER ||
                (<StructureTower>tower).energy === (<StructureTower>tower).energyCapacity
            ) {
                continue;
            }
            cmem.crr_targ = tower.id;
            return tower;
        }


        {
            const flags = spawn.room.find<Flag>(FIND_FLAGS);
            for (let flag of flags) {
                if (
                    flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
                ) {
                    continue;
                }
                const container = flag.pos.lookForStructure<StructureContainer>(STRUCTURE_CONTAINER);
                if (container !== undefined && _.sum(container.store) < container.storeCapacity) {
                    return container;
                }
            }
        }


        {
            const storage = spawn.room.storage;
            if (storage !== undefined && storage.store.energy < storage.storeCapacity) {
                cmem.crr_targ = storage.id;
                return storage;
            }
        }

        //Screw it, go to spawn
        cmem.crr_targ = spawn.id;
        return spawn;

    }

    private performDeliver(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (creep.carry.energy === 0) {
            return CourierState.Pickup;
        }
        const spawn = Game.spawns[cmem.spawnName];
        const target = this.getDeliveryTarget(creep, cmem);
        if (target === undefined) {
            return CourierState.Wait;
        }

        let isFull: boolean;
        if (target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_TOWER || target.structureType === STRUCTURE_EXTENSION) {
            const tstrct = <Spawn | StructureTower | StructureExtension>target;
            isFull = (tstrct.energy === tstrct.energyCapacity);
        } else {
            const tstrct = <StructureContainer | StructureStorage>target;
            isFull = (tstrct.store["energy"] === tstrct.storeCapacity);
        }

        if (isFull) {
            const nearbyPossibleReceivers = spawn.room.find<Creep>(FIND_MY_CREEPS)
                .filter(c => c.role !== RoleBootstrapMiner.RoleTag && c.carry.energy < c.carryCapacity);
            
            const builderOrRepairer = nearbyPossibleReceivers.find(c => c.role === RoleBuilder.RoleTag || c.role === RoleRepairer.RoleTag);
            if (builderOrRepairer !== undefined) {
                if (creep.transfer(builderOrRepairer, "energy") === ERR_NOT_IN_RANGE) {
                    creep.moveTo(builderOrRepairer);
                }
                return;
            }

            const upgrader = nearbyPossibleReceivers.find(c => c.role === RoleUpgrader.RoleTag);
            if (upgrader !== undefined) {
                if (creep.transfer(upgrader, "energy") === ERR_NOT_IN_RANGE) {
                    creep.moveTo(upgrader);
                }
                return;
            }

            const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
            if (idleFlag !== undefined) {
                creep.moveTo(idleFlag);
            }
            return;
        }

        if (creep.transfer(target, "energy") === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { reusePath: 20 });
        }
    }

    private performDecidePickupDeliver(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (creep.carry.energy >= 10 * creep.body.length) {
            return CourierState.Deliver;
        } else {
            return CourierState.Pickup;
        }
    }

    private runState(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        switch (cmem.crr_st) {
            case CourierState.Decide:
                return this.performDecidePickupDeliver(creep, cmem);
            case CourierState.Wait:
                return this.performWait(creep, cmem);
            case CourierState.Pickup:
                return this.performPickup(creep, cmem);
            case CourierState.Deliver:
                return this.performDeliver(creep, cmem);
            default:
                return CourierState.Pickup;
        }
    }

    public run(): void {
        const creep = this.creep;
        if (creep.spawning) { return; }
        let cmem = this.cmem;
        const capStateTransitions = 10;

        let transitions = 0;
        let newState: CourierState | undefined;
        while ((newState = this.runState(creep, cmem)) !== undefined) {
            if (cmem.crr_st !== newState) {
                delete cmem.crr_targ;//States can use the arg as they see fit, but not to communicate
            }
            if (++transitions === capStateTransitions) {
                console.log("Courier - Maxed out state transitions per execution! Coming out of: " + cmem.crr_st);
                break;
            }
            cmem.crr_st = newState;
        }
    }
}
