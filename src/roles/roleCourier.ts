import { RoleUpgrader } from "./roleUpgrader";
import { RoleRepairer } from "./roleRepairer";
import { RoleBuilder } from "./roleBuilder";
import { RoleBootstrapMiner } from "./roleBootstrapMiner";
import { FsmRole, StateHandlerList } from "./fsmRole";

enum CourierState {
    Decide = 0,
    Wait,
    Pickup,
    Deliver,
}

interface CourierMemory extends CreepMemory {
    crr_st?: CourierState;
    crr_targ?: string | number;//Object ID
}

export class RoleCourier extends FsmRole<CourierMemory, CourierState> {
    public static RoleTag: string = "crr";

    public constructor() {
        super(CourierState.Pickup, (mem, val) => mem.crr_st = val, mem => mem.crr_st);
    }

    private static _instance: RoleCourier | undefined;
    public static get Instance(): RoleCourier {
        const instance = RoleCourier._instance;
        if (instance === undefined) {
            return (RoleCourier._instance = new RoleCourier());
        }
        return instance;
    }

    protected runState(state: CourierState, creep: Creep, cmem: CourierMemory): CourierState | undefined {
        switch (state) {
            case CourierState.Decide: return this.handleDecide(creep, cmem);
            case CourierState.Deliver: return this.handleDeliver(creep, cmem);
            case CourierState.Pickup: return this.handlePickup(creep, cmem);
            case CourierState.Wait: return this.handleWait(creep, cmem);
            default: throw new Error(`No state handler defined for ${state}`);
        };
    }

    protected onTransition(creep: Creep, cmem: CourierMemory, prev: CourierState, next: CourierState) {
        delete cmem.crr_targ;
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

    private readonly waitTickCount: number = 5;

    private handleWait(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (cmem.crr_targ === undefined) {
            cmem.crr_targ = Game.time + this.waitTickCount;
        }
        if (Game.time < cmem.crr_targ) {
            const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
            if (idleFlag !== undefined) {
                creep.moveTo(idleFlag, { ignoreCreeps: true, reusePath: 20 });
            }
            return;
        }
        return CourierState.Decide;
    }

    private getPickupTarget(creep: Creep, cmem: CourierMemory): StructureContainer | StructureStorage | Resource | undefined {
        if (cmem.crr_targ !== undefined) {
            const rawTarget = fromId<Structure | Resource>(<string>cmem.crr_targ);
            if (rawTarget === null) {
                delete cmem.crr_targ;
            } else {
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
        }

        const spawn = creep.spawn;

        const dropped = spawn.room.find<Resource>(FIND_DROPPED_ENERGY);
        if (dropped.length > 0) {
            return _.max<Resource>(dropped, _dropped => _dropped.amount);
        }

        let containers: StructureContainer[] = [];
        {
            const flags = spawn.room.find<Flag>(FIND_FLAGS);
            for (let flag of flags) {
                if (flag.color !== COLOR_CYAN || flag.secondaryColor !== COLOR_YELLOW) {
                    continue;
                }
                const container = flag.pos.lookForStructure<StructureContainer>(STRUCTURE_CONTAINER);
                if (container !== undefined && container.store["energy"] > 0) {
                    containers.push(container);
                }
            }
        }


        if (containers.length !== 0) {
            if (containers.length === 1) {
                return containers[0];
            } else {
                const fullest = containers.sort(function (a, b) { return b.store["energy"] - a.store["energy"]; })[0];
                return fullest;
            }
        }


        // {
        //     const storage = spawn.room.storage;
        //     if (storage !== undefined && storage.store.energy < storage.storeCapacity) {
        //         cmem.crr_targ = storage.id;
        //         return storage;
        //     }
        // }

        //return;
    }

    private handlePickup(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        const spawn = creep.spawn;
        if (creep.carry.energy === creep.carryCapacity) {
            return CourierState.Deliver;
        }
        const target = this.getPickupTarget(creep, cmem);
        if (target === undefined) {
            return CourierState.Wait;
        }
        if ((<StructureStorage | StructureContainer>target).store) {
            if ((<StructureStorage | StructureContainer>target).transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { ignoreCreeps: true, reusePath: 20 });
            }
        } else {
            const pickedUp = creep.pickup(<Resource>target);
            if (pickedUp === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { ignoreCreeps: true, reusePath: 20 });
            }
        }
    }

    private getDeliveryTarget(creep: Creep, cmem: CourierMemory): Spawn | Structure | undefined {
        if (cmem.crr_targ !== undefined) {
            const struct = fromId<Structure>(<string>cmem.crr_targ);
            if (struct === undefined) {
                //console.log("Find new carry target");
                delete cmem.crr_targ;
            } else {
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
        }

        // This creep's spawn
        const spawn = creep.spawn;
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
            const storage = spawn.room.storage;
            if (storage !== undefined && storage.store.energy < storage.storeCapacity) {
                cmem.crr_targ = storage.id;
                return storage;
            }
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

        //Screw it, go to spawn
        cmem.crr_targ = spawn.id;
        return spawn;

    }

    private handleDeliver(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (creep.carry.energy === 0) {
            return CourierState.Pickup;
        }
        const spawn = creep.spawn;
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
                    creep.moveTo(builderOrRepairer, { ignoreCreeps: true, reusePath: 20 });
                }
                return;
            }

            const idleFlag = Game.spawns[cmem.spawnName].room.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
            if (idleFlag !== undefined) {
                creep.moveTo(idleFlag, { ignoreCreeps: true, reusePath: 20 });
            }
            return;
        }

        if (creep.transfer(target, "energy") === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { ignoreCreeps: true, reusePath: 20 });
        }
    }

    private shouldDeliver(creep: Creep): boolean {
        return creep.carry.energy >= 10 * creep.body.length;
    }

    private handleDecide(creep: Creep, cmem: CourierMemory): CourierState | undefined {
        if (this.shouldDeliver(creep)) {
            return CourierState.Deliver;
        } else {
            return CourierState.Pickup;
        }
    }
}
