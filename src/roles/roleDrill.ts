import { MiningScanner } from "./../util/miningScanner";
import { FsmRole, StateHandlerList } from "./fsmRole";

enum DrillState {
    Initialize = 0,
    MoveToHomeRoomForScan = 1,
    ScanHomeRoom = 2,
    MoveToSource = 3,
    Harvest = 4,
    WaitForSourceRegen = 5,
}


interface DrillMemory extends CreepMemory {
    drill_state?: DrillState;
    homeRoomName: string;
    sourceIndex: number;

    pathCache?: string;
    sourceId?: string;
}


export class RoleDrill extends FsmRole<DrillMemory, DrillState> {
    public static RoleTag: string = "drll";

    private static shittySerializePath(path: RoomPosition[]): string {
        const output = new Array<String>(path.length);
        let currentRoomName: string | undefined;
        for (let i = 0, n = path.length; i < n; ++i) {
            const step = path[i];
            if (currentRoomName === step.roomName) {
                output[i] = `${step.x.toString(36)},${step.y.toString(36)}`;
            } else {
                currentRoomName = step.roomName;
                output[i] = `${step.x.toString(36)},${step.y.toString(36)},${currentRoomName}`;
            }
        }
        return output.join(";");
    }

    private static shittyDeserializePath(encoded: string): RoomPosition[] {
        const split = encoded.split(";");
        const output = new Array<RoomPosition>(split.length);
        let lastReadRoomName: string | undefined;
        for (let i = 0, n = split.length; i < n; ++i) {
            const [x, y, roomName] = split[i].split(",");
            if (roomName !== undefined) {
                lastReadRoomName = roomName;
            }
            if (lastReadRoomName === undefined) {
                throw new Error("Format incorrect on path- did not start with a leading room");
            }
            output[i] = new RoomPosition(Number.parseInt(x, 36), Number.parseInt(y, 36), lastReadRoomName);
        }
        return output;
    }

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
            [DrillState.MoveToSource]: this.handleMoveToSource,
            [DrillState.Harvest]: this.handleHarvest,
            [DrillState.WaitForSourceRegen]: this.handleWaitForSourceRegen,
            //TODO: Implement others
        };
    }

    protected onTransition(creep: Creep, cmem: DrillMemory, prev: DrillState, next: DrillState) {
        if (prev !== next) {
            delete cmem.pathCache;
            delete cmem.sourceId;
        }
    }

    private static getContainerOnPosition(pos: RoomPosition) {
        return pos.lookForStructure<StructureContainer>(STRUCTURE_CONTAINER);
    }

    private getOrCacheSourceInfo(room: Room): SourceScanInfo {
        let sourceRoom = Memory.sources[room.name];
        if (sourceRoom === undefined) {
            Memory.sources[room.name] = sourceRoom = { sourceInfo: MiningScanner.scan(room) };
        }
        return sourceRoom.sourceInfo;
    }

    private getSourceInfo(roomOrRoomName: Room | string): SourceScanInfo | undefined {
        let roomName: string;
        if (roomOrRoomName instanceof Room) {
            roomName = roomOrRoomName.name;
        } else {
            roomName = roomOrRoomName;
        }
        let sourceRoom = Memory.sources[roomName];
        if (sourceRoom === undefined) {
            return undefined;
        }
        return sourceRoom.sourceInfo;
    }

    private getSourceId(creep: Creep, cmem: DrillMemory) {
        if (cmem.sourceId === undefined) {
            const sourceInfo = this.getOrCacheSourceInfo(creep.room);
            const indexedSource = sourceInfo.sources[cmem.sourceIndex % sourceInfo.sources.length];
            return indexedSource.id;
        } else {
            return cmem.sourceId;
        }
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
        } else if (energyAvailable >= 500) {
            chosenBody = [MOVE, CARRY, WORK, WORK, WORK, WORK];
        } else if (energyAvailable >= 400) {
            chosenBody = [MOVE, CARRY, WORK, WORK, WORK];
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
        if (cmem.homeRoomName === undefined) {
            cmem.homeRoomName = Game.spawns[cmem.spawnName].room.name;
        }
        if (cmem.sourceIndex === undefined) {
            cmem.sourceIndex = 0;
        }
        // if we aren't in the homeroom
        if (creep.room.name !== cmem.homeRoomName) {
            console.log(`I'm in ${creep.room.name} and my home room is ${cmem.homeRoomName}`);
            if (Memory.sources[cmem.homeRoomName] !== undefined) {
                return DrillState.MoveToSource;//Already scanned
            } else {
                return DrillState.MoveToHomeRoomForScan;//Get there so we can collect scan info
            }
        } else {
            //if we are in the right room, ensure it has scan data
            if (Memory.sources[cmem.homeRoomName] === undefined) {
                this.getOrCacheSourceInfo(creep.room);//Caches it before usage below
            }
        }

        return DrillState.MoveToSource;
    }

    public handleMoveToSource(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        let path: RoomPosition[];
        if (cmem.pathCache === undefined) {
            const sourceInfo = this.getSourceInfo(cmem.homeRoomName);
            if (sourceInfo === undefined) {
                throw new Error("No source info available where expected in RoleDrill.handleMoveToSource");
            }
            const indexedSource = sourceInfo.sources[cmem.sourceIndex % sourceInfo.sources.length];
            const miningPosition = new RoomPosition(indexedSource.miningPosition.x, indexedSource.miningPosition.y, sourceInfo.roomName);
            if (creep.pos.isEqualTo(miningPosition)) {
                path = [creep.pos];
            } else {
                path = PathFinder.search(creep.pos, miningPosition).path;
            }
            cmem.pathCache = RoleDrill.shittySerializePath(path);
        } else {
            path = RoleDrill.shittyDeserializePath(cmem.pathCache);
        }

        if (creep.pos.isEqualTo(path[path.length - 1])) {
            return DrillState.Harvest;
        }
        if (creep.moveByPath(path) !== OK) {
            delete cmem.pathCache;
        }
        return;
    }

    public handleWaitForSourceRegen(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const source = <Source>Game.getObjectById(this.getSourceId(creep, cmem));
        if (source.energy > 0) {
            return DrillState.WaitForSourceRegen;
        }
        //Container repair
        const container = RoleDrill.getContainerOnPosition(creep.pos);
        if (container === undefined) { return; }
        if (creep.carry.energy === 0) {
            creep.withdraw(container, "energy");
        }
        if (container !== undefined && container.hits < container.hitsMax) {
            creep.repair(container);
        }
    }

    public handleHarvest(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const source = <Source>Game.getObjectById(this.getSourceId(creep, cmem));
        if (source.energy === 0) {
            return DrillState.WaitForSourceRegen;
        }
        if (creep.carry.energy > 0) {
            //Emergency repair
            const container = RoleDrill.getContainerOnPosition(creep.pos);
            if (container !== undefined && container.hits < container.hitsMax * 0.75) {
                creep.repair(container);
                return;
            }
        }
        creep.harvest(source);
    }
}

