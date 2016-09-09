import { RoleBuilder } from "./roleBuilder";
import { FsmRole, StateHandlerList } from "./fsmRole";

interface RepairerMemory extends CreepMemory {

    repr_state?: RepairerState;

    /**
     * ID of chosen repair target.
     */
    repr_targetId?: string;

    /**
     * If specified, the repairer should stop repairing the target when its hitpoints are above this level.
     */
    repr_thc?: number;

    /**
     * Energy source ID.
     */
    repr_nrgId?: string;

    /**
     * IDs of potential repair targets, sorted by descending priority.
     * In the tuple variant, the first item is the ID, second item is the health to which the repairer should build, if specified.
     */
    repr_prospectiveTargetIdPairs?: Array<string | [string, number]>;

    /**
     * Game tick of last scan. Assume requires immediate update if undefined.
     */
    repr_lScanTime?: number;

    /**
     * The ID for the idle flag.
     */
    idleFlagId?: string;

    /**
     * ID for the Storage of the home room
     */
    storageId: string;

    /**
     * All flags in the home room for containers marked for economic storage.
     */
    designatedStorageFlagIds: Array<string>;
}

enum RepairerState {
    Reorient,
    WalkToHomeRoom,
    FindTarget,
    RepairTarget,
    GetEnergy,
}

export class RoleRepairer extends FsmRole<RepairerMemory, RepairerState> {
    public static RoleTag: string = "repr";
    private static ScanDelay: number = 25;
    //private static MaxStintDuration: number = 50;

    public constructor() {
        super(RepairerState.Reorient, (mem, val) => mem.repr_state = val, mem => mem.repr_state);
    }

    private static _instance: RoleRepairer | undefined;
    public static get Instance(): RoleRepairer {
        const instance = RoleRepairer._instance;
        if (instance === undefined) {
            return (RoleRepairer._instance = new RoleRepairer());
        }
        return instance;
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] | undefined {
        let chosenBody: string[];
        if (energyAvailable >= 750) {
            chosenBody = [
                MOVE, MOVE, MOVE, MOVE,//4 = 200
                CARRY, CARRY, CARRY, CARRY, CARRY, //5 = 250
                WORK, WORK, WORK, //3 = 300
            ];
        } else if (energyAvailable >= 550) {
            chosenBody = [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK];
        } else if (energyAvailable >= 400) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK, WORK];
        } else if (energyAvailable >= 300) {
            chosenBody = [MOVE, MOVE, CARRY, CARRY, WORK];
        } else {
            return undefined;
        }
        return <CreepBodyPart[]>chosenBody;
    }

    protected provideStates(): StateHandlerList<RepairerMemory, RepairerState> {
        return {
            [RepairerState.Reorient]: this.handleReorient,
            [RepairerState.WalkToHomeRoom]: this.handleWalkToHomeRoom,
            [RepairerState.FindTarget]: this.handleFindTarget,
            [RepairerState.RepairTarget]: this.handleRepairTarget,
            [RepairerState.GetEnergy]: this.handleGetEnergy,
        };
    }

    protected handleReorient(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (cmem.homeRoomName === undefined) {
            creep.homeRoom = creep.spawn.room;
        }

        const homeRoom = creep.homeRoom;
        if (homeRoom === undefined) {
            //No vision of homeroom, walk there to gain it;
            return RepairerState.WalkToHomeRoom;
        }

        const idleFlag = homeRoom.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
        if (idleFlag !== undefined) { cmem.idleFlagId = idleFlag.id; }

        const storage = homeRoom.storage;
        if (storage !== undefined) { cmem.storageId = storage.id; }

        {
            const designatedStorageFlags = homeRoom.find<Flag>(FIND_FLAGS).filter(flag => flag.color === COLOR_GREY && flag.secondaryColor === COLOR_YELLOW);
            const flagIds = new Array<string>(designatedStorageFlags.length);
            for (let i = designatedStorageFlags.length; i-- > 0;) {
                flagIds[i] = designatedStorageFlags[i].id;
            }
            cmem.designatedStorageFlagIds = flagIds;
        }

        if (creep.room.name === cmem.homeRoomName) {
            return RepairerState.FindTarget;
        } else {
            return RepairerState.WalkToHomeRoom;
        }
    }

    protected handleWalkToHomeRoom(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (cmem.homeRoomName === undefined) {
            creep.homeRoom = creep.spawn.room;
        }
        if (creep.room.name === cmem.homeRoomName && !this.moveOffBorder(creep)) {
            return RepairerState.Reorient;
        }

        creep.moveTo(25, 25, cmem.homeRoomName);
        return;
    }

    protected handleFindTarget(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === 0) { return RepairerState.GetEnergy; }

        //If we require a rescan, wait at least the minimum rescan delay before doing so.
        const gTime = Game.time;
        if (cmem.repr_lScanTime === undefined || cmem.repr_lScanTime < gTime - RoleRepairer.ScanDelay) {
            //TODO: Update cmem.repr_prospectiveTargetIds with candidates
            cmem.repr_prospectiveTargetIdPairs = this.scanForTargetIds(<Room>creep.homeRoom);
            //console.log(`scanned ${cmem.repr_prospectiveTargetIdPairs}`);
            cmem.repr_lScanTime = gTime;
        }


        const target = fromId<Structure>(cmem.repr_targetId);
        if (target !== null && (target.hits < target.hitsMax && (cmem.repr_thc === undefined || target.hits < cmem.repr_thc))) {
            //console.log("GoRepair");
            return RepairerState.RepairTarget;
        }

        const prospects = cmem.repr_prospectiveTargetIdPairs;
        if (prospects === undefined) {
            return;// RepairerState.Idle;
        }

        const prospect = prospects.shift();
        if (prospects.length === 0) {
            delete cmem.repr_prospectiveTargetIdPairs;
        }
        if (prospect === undefined) {
            delete cmem.repr_targetId;
            delete cmem.repr_thc;
        } else if (typeof prospect === "string") {
            cmem.repr_targetId = prospect;
            delete cmem.repr_thc;
        } else {
            [cmem.repr_targetId, cmem.repr_thc] = prospect;
        }
    }

    protected handleRepairTarget(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === 0) { return RepairerState.GetEnergy; }

        //Prevent large jobs from occluding new objects in drastic need of repair.
        //if (cmem.repr_lScanTime === undefined || cmem.repr_lScanTime < Game.time - RoleRepairer.MaxStintDuration) {
        //    delete cmem.repr_targetId;
        //    return RepairerState.FindTarget;
        //}

        const target = fromId<Structure>(cmem.repr_targetId);
        if (target === null || target.hits === target.hitsMax || (cmem.repr_thc !== undefined && target.hits >= cmem.repr_thc)) {
            delete cmem.repr_targetId;
            //console.log("Donerepairing findmoar");
            return RepairerState.FindTarget;
        }

        if (creep.repair(target) === ERR_NOT_IN_RANGE) { creep.moveTo(target, <FindPathOpts>{ maxRooms: 1 }); }
    }

    protected handleGetEnergy(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === creep.carryCapacity) { return RepairerState.FindTarget; }

        let source = fromId<StructureContainer | StructureStorage>(cmem.repr_nrgId);
        if (source === null) {
            source = this.findEnergySource(creep, cmem) || null;
            if (source === null) {
                delete cmem.repr_nrgId;
                return;//Wait for an energy source
            } else {
                cmem.repr_nrgId = source.id;
            }
        }

        if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) { creep.moveTo(source.pos); }
    }

    private scanForTargetIds(room: Room): Array<string | [string, number]> | undefined {
        const ctrller = room.controller;
        const ctrlLvl = ctrller ? ctrller.level : 0;
        const maxWallRepairThreshold = 55000 * ctrlLvl;
        const structuresNeedingRepair = room.find<Structure>(FIND_STRUCTURES)
            .filter(s => {
                if (s.hits === s.hitsMax) { return false; }
                switch (s.structureType) {
                    case STRUCTURE_WALL:
                    case STRUCTURE_RAMPART:
                        if (s.hits >= maxWallRepairThreshold) {
                            return false;
                        }
                    case STRUCTURE_ROAD:
                        if (s.hits >= s.hitsMax * 0.7) {
                            return false;
                        }
                    default:
                        return true;
                }
            })
            .sort(function (a, b) {
                if (a.hits === 1) {
                    return -1;
                } else if (b.hits === 1) {
                    return 1;
                }
                if (a.structureType === STRUCTURE_WALL && b.structureType === STRUCTURE_WALL) {
                    return a.hits - b.hits;
                } else if (a.structureType === STRUCTURE_WALL) {
                    return 1;
                } else if (b.structureType === STRUCTURE_WALL) {
                    return -1;
                }
                if (a.structureType === STRUCTURE_RAMPART && b.structureType === STRUCTURE_RAMPART) {
                    return a.hits - b.hits;
                } else if (a.structureType === STRUCTURE_RAMPART) {
                    return 1;
                } else if (b.structureType === STRUCTURE_RAMPART) {
                    return 1;
                }
                return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
            })
            .slice(0, 15);

        if (structuresNeedingRepair.length === 0) {
            return;
        }
        const futureTargetIds = new Array<[string, number] | string>(structuresNeedingRepair.length);
        for (let i = structuresNeedingRepair.length; i-- > 0;) {
            const structureNeedingRepair = structuresNeedingRepair[i];
            switch (structureNeedingRepair.structureType) {
                case STRUCTURE_WALL:
                case STRUCTURE_RAMPART:
                    futureTargetIds[i] = [structureNeedingRepair.id, maxWallRepairThreshold];
                    break;
                default:
                    futureTargetIds[i] = structureNeedingRepair.id;
                    break;
            }
        }
        return futureTargetIds;
    }

    private findEnergySource(creep: Creep, cmem: RepairerMemory): StructureStorage | StructureContainer | undefined {
        const homeRoom = creep.homeRoom;
        if (homeRoom === undefined) { throw new Error("HomeRoom not visible"); }

        const storage = fromId<StructureStorage>(cmem.storageId);
        if (storage !== null && storage.store.energy > 0) {
            return storage;
        }

        let container: StructureContainer | undefined;

        const containers = new Array<StructureContainer>();
        {
            //Try flagged storage containers
            const designatedStorageFlags = cmem.designatedStorageFlagIds;
            for (let i = designatedStorageFlags.length; i-- > 0;) {
                const flag = fromId<Flag>(designatedStorageFlags[i]);
                if (flag === null) {
                    designatedStorageFlags.splice(i);
                    continue;
                }
                const testContainer = flag.lookForStructureAtPosition<StructureContainer>(STRUCTURE_CONTAINER);
                if (testContainer === undefined) {
                    designatedStorageFlags.splice(i);
                    continue;
                }
                if (testContainer.store[RESOURCE_ENERGY] > 0) {
                    containers.push(testContainer);
                }
            }
        }

        if (containers.length !== 0) {
            if (containers.length === 1) {
                return containers[0];
            } else {
                const fullest = containers.reduce(
                    (prev: StructureContainer, current: StructureContainer) =>
                        (prev === undefined || prev.store[RESOURCE_ENERGY] < current.store[RESOURCE_ENERGY]) ? current : prev);
                return fullest;
            }
        }
        return;
    }
}

