import { FsmRole, StateHandlerList } from "./fsmRole";

enum DrillState {
    Initialize,
    MoveToHomeRoom,
    ScanHomeRoom,
    MoveToSource,
    Harvest,
    WaitForSourceRegen,
}

interface DrillMemory extends CreepMemory {
    drill_state?: DrillState;
    homeRoomName: string;
    sourceIndex: number;

    pathCache?: RoomPosition;
}

export class RoleDrill extends FsmRole<DrillMemory, DrillState> {
    public static RoleTag: string = "drll";

    public constructor() {
        super(DrillState.Initialize, (mem, val) => mem.drill_state = val, (mem) => mem.drill_state);
    }

    private static _instance: RoleDrill | undefined;
    public static get Instance(): RoleDrill {
        const instance = RoleDrill._instance;
        if (instance === undefined) {
            return (RoleDrill._instance = new RoleDrill());
        }
        return instance;
    }

    protected provideStates(): StateHandlerList<DrillMemory, DrillState> {
        return {
            [DrillState.Initialize]: this.handleInitialize,
        };
    }

    protected onTransition(creep: Creep, cmem: DrillMemory, prev: DrillState, next: DrillState) {
        if (prev !== next) {
            delete cmem.pathCache;
        }
    }

    private static GetSourceByIndex(room: Room, sourceIndex: number) {
        const sources = room.find<Source>(FIND_SOURCES);
        return sources[sourceIndex % sources.length];
    }

    public static createInitialMemory(spawn: Spawn | string, homeRoom: string | Room, sourceIndex: number): DrillMemory {
        return {
            role: RoleDrill.RoleTag,
            spawnName: (spawn instanceof Spawn ? spawn.name : spawn),
            homeRoomName: (homeRoom instanceof Room ? homeRoom.name : homeRoom),
            sourceIndex: sourceIndex,
        };
    }

    public static chooseBody(energyAvailable: number): CreepBodyPart[] | undefined {
        let chosenBody: string[] | undefined;
        if (energyAvailable >= 700) {
            chosenBody = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK];
        } else if (energyAvailable >= 600) {
            chosenBody = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK];
        } else if (energyAvailable >= 300) {
            chosenBody = [MOVE, CARRY, WORK, WORK];
        } else if (energyAvailable >= 200) {
            chosenBody = [MOVE, CARRY, WORK];
        } else {
            chosenBody = undefined;
        }
        return <CreepBodyPart[] | undefined>chosenBody;
    }

    public handleInitialize(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        //If no position, we are newly spawned; find 
        if (cmem.targetPosition === undefined) {
            let homeRoom = Game.rooms[cmem.homeRoomName];
            if (homeRoom === undefined) {
                //We have to travel to find it, or check source details cache when one exists
            } else {
                //Room is available
            }
        }
        return;
    }

    private performHarvest(creep: Creep, cmem: DrillMemory): void {
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
}

