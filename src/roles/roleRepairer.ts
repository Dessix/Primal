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
    private static ScanDelay: number = 15;
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
        const homeRoom = creep.homeRoom;
        if (homeRoom === undefined) {
            //No vision of homeroom, walk there to gain it;
            return RepairerState.WalkToHomeRoom;
        }

        const idleFlag = homeRoom.find<Flag>(FIND_FLAGS).find(x => x.color === COLOR_BROWN && x.secondaryColor === COLOR_BROWN);
        if (idleFlag !== undefined) { cmem.idleFlagId = idleFlag.id; }

        const storage = homeRoom.storage;
        if (storage !== undefined) { cmem.storageId = storage.id; }

        if (creep.room.name === creep.homeRoomName) {
            return RepairerState.FindTarget;
        } else {
            return RepairerState.WalkToHomeRoom;
        }
    }

    protected handleWalkToHomeRoom(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        throw new Error("Not implemented!");
    }

    protected handleFindTarget(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === 0) { return RepairerState.GetEnergy; }

        //If we require a rescan, wait at least the minimum rescan delay before doing so.
        const gTime = Game.time;
        if (cmem.repr_lScanTime === undefined || cmem.repr_lScanTime < gTime - RoleRepairer.ScanDelay) {
            //TODO: Update cmem.repr_prospectiveTargetIds with candidates
            this.scanForTargetIds(<Room>creep.homeRoom);
        }
        cmem.repr_lScanTime = gTime;


        let target = global.byId<Structure>(cmem.repr_targetId);
        if (target !== null && target.hits < cmem.repr_thc) {
            return RepairerState.RepairTarget;
        }


        //TODO: check cmem.repr_prospectiveTargetIds for candidate

        throw new Error("Not implemented!");
    }

    protected handleRepairTarget(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === 0) { return RepairerState.GetEnergy; }

        const target = global.byId<Structure>(cmem.repr_targetId);
        if (target === null || target.hits === target.hitsMax || (cmem.repr_thc !== undefined && target.hits === cmem.repr_thc)) { return RepairerState.FindTarget; }

        if (creep.repair(target) === ERR_NOT_IN_RANGE) { creep.moveTo(target); }
    }

    protected handleGetEnergy(creep: Creep, cmem: RepairerMemory): RepairerState | undefined {
        if (creep.spawning) { return; }
        if (creep.carry.energy === creep.carryCapacity) { return RepairerState.FindTarget; }


        //TODO: Implement
        throw new Error("Not implemented!");
    }

    private scanForTargetIds(room: Room): Array<string | [string, number]> | undefined {
        const ctrller = room.controller;
        const ctrlLvl = ctrller ? ctrller.level : 0;
        const maxWallRepairThreshold = 25000 * ctrlLvl;
        const structuresNeedingRepair = room.find<Structure>(FIND_STRUCTURES)
            .filter(s => s.hits < s.hitsMax && (
                (s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART) ||
                (s.structureType === STRUCTURE_WALL && s.hits < maxWallRepairThreshold) &&
                (s.structureType === STRUCTURE_RAMPART && s.hits < maxWallRepairThreshold)
            ))
            .sort(function (a, b) {
                if (a.structureType === STRUCTURE_WALL) {
                    return 1;
                } else if (b.structureType === STRUCTURE_WALL) {
                    return -1;
                }
                if (a.structureType === STRUCTURE_RAMPART) {
                    return 1;
                } else if (b.structureType === STRUCTURE_RAMPART) {
                    return 1;
                }
                return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
            });

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

    //TODO: Remove irrelevant code
    private getEnergy(creep: Creep, cmem: RepairerMemory): void {
        const spawn = creep.spawn;

        let container: StructureContainer | undefined;

        const containers = new Array<StructureContainer>();
        //Try flagged storage containers
        const flags = spawn.room.find<Flag>(FIND_FLAGS);
        for (let flag of flags) {
            if (
                flag.color !== COLOR_GREY || flag.secondaryColor !== COLOR_YELLOW
            ) {
                continue;
            }
            const testContainer = flag.lookForStructureAtPosition<StructureContainer>(STRUCTURE_CONTAINER);
            if (testContainer !== undefined && testContainer.store["energy"] > 0) {
                containers.push(testContainer);
            }
        }

        if (containers.length !== 0) {
            if (containers.length === 1) {
                container = containers[0];
            } else {
                const fullest = containers.sort(function (a, b) { return b.store["energy"] - a.store["energy"]; })[0];
                container = fullest;
            }
        }

        if (container === undefined) {
            //Try any container
            container = spawn.room.findFirstStructureOfTypeMatching<StructureContainer>(STRUCTURE_CONTAINER, c => c.store.energy > 0, false);
        }

        if (container !== undefined) {
            if (container.transfer(creep, "energy") === ERR_NOT_IN_RANGE) {
                creep.moveTo(container);
            }
        }
    }
}

