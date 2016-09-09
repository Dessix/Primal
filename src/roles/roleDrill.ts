import { PathUtils } from "./../util/pathUtils";
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
    sourceIndex: number;
    linkId?: string;
    storageLinkId?: string;

    pathCache?: string;
    sourceId?: string;
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
            [DrillState.MoveToSource]: this.handleMoveToSource,
            [DrillState.Harvest]: this.handleHarvest,
            [DrillState.WaitForSourceRegen]: this.handleWaitForSourceRegen,
            [DrillState.MoveToHomeRoomForScan]: this.handleMoveToHomeRoomForScan,
            [DrillState.ScanHomeRoom]: this.handleScanHomeRoom,
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

    private getSourceId(creep: Creep, cmem: DrillMemory) {
        if (cmem.sourceId === undefined) {
            const sourceInfo = MiningScanner.getScanInfoForRoom(creep.room);
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
        if (energyAvailable >= 800) {
            chosenBody = [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK];
        } else if (energyAvailable >= 700) {
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
        //If we aren't in the homeroom
        if (creep.room.name !== cmem.homeRoomName) {
            console.log(`I'm in ${creep.room.name} and my home room is ${cmem.homeRoomName}`);
            if (MiningScanner.getScanInfoByRoomName(cmem.homeRoomName) !== undefined) {
                return DrillState.MoveToSource;//Already scanned
            } else {
                return DrillState.MoveToHomeRoomForScan;//Get there so we can collect scan info
            }
        } else {
            //If we are in the right room, ensure it has scan data cached
            MiningScanner.getScanInfoForRoom(creep.room);
        }

        return DrillState.MoveToSource;
    }

    public handleMoveToHomeRoomForScan(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        if (creep.room.name === cmem.homeRoomName && !this.moveOffBorder(creep)) { return DrillState.ScanHomeRoom; }

        creep.moveTo(25, 25, cmem.homeRoomName);
        return;
    }

    public handleScanHomeRoom(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const homeRoom = creep.homeRoom;
        if (homeRoom === undefined) { throw new Error("HomeRoom not visible in scan."); }
        MiningScanner.getScanInfoForRoom(homeRoom);
        return DrillState.MoveToSource;
    }
    
    private findLinks(miningPosition: RoomPosition): string | undefined {
        const room = Game.rooms[miningPosition.roomName];
        if (room === undefined) { throw new Error("Room inaccessible"); }
        const miningLink = miningPosition.lookForInBox<Structure>(LOOK_STRUCTURES, 1).find(s => s.structureType === STRUCTURE_LINK);
        return miningLink && miningLink.id || undefined;
    }

    public handleMoveToSource(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const sourceInfo = MiningScanner.getIndexedSourceByRoomName(cmem.homeRoomName, cmem.sourceIndex);
        if (sourceInfo === undefined) {
            throw new Error("No source info available where expected in RoleDrill.handleMoveToSource");
        }

        const miningPosition = sourceInfo.miningPosition;

        if (creep.pos.isEqualTo(miningPosition)) {
            cmem.linkId = this.findLinks(miningPosition);
            return DrillState.Harvest;
        }

        if (creep.moveTo(miningPosition) === ERR_NO_PATH) {
            if (creep.pos.getRangeTo(miningPosition) === 1) {
                const creepsInTheWay = miningPosition.lookFor<Creep>(LOOK_CREEPS);
                if (creepsInTheWay.length !== 0 && creepsInTheWay[0].my) {
                    creepsInTheWay[0].moveTo(creep.pos);
                    creep.moveTo(miningPosition);
                }
            }
        }
        return;
    }

    public handleWaitForSourceRegen(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const source = fromId<Source>(this.getSourceId(creep, cmem));
        if (source === null) { throw new Error("Source id empty"); }
        if (source.energy > 0) {
            return DrillState.Harvest;
        }
        if (cmem.linkId === undefined) {
            cmem.linkId = this.findLinks(creep.pos);
        }
        //Container repair
        const container = RoleDrill.getContainerOnPosition(creep.pos);
        if (container === undefined) { return; }
        if (creep.carry.energy === 0) {
            creep.withdraw(container, RESOURCE_ENERGY);
        }
        if (container !== undefined && container.hits < container.hitsMax) {
            creep.repair(container);
        }
        if (creep.ticksToLive < 5) {
            if (container !== undefined && container.store.energy < container.storeCapacity) {
                creep.transfer(container, RESOURCE_ENERGY);
                creep.drop(RESOURCE_ENERGY);
            } else {
                creep.drop(RESOURCE_ENERGY);
            }
        }
    }

    public handleHarvest(creep: Creep, cmem: DrillMemory): DrillState | undefined {
        const source = fromId<Source>(this.getSourceId(creep, cmem));
        if (source === null) {
            delete cmem.sourceId;
            return DrillState.ScanHomeRoom;
        }
        if (source.energy === 0) {
            return DrillState.WaitForSourceRegen;
        }
        const container = RoleDrill.getContainerOnPosition(creep.pos);
        if (creep.carry.energy > 0) {
            const link = fromId<StructureLink>(cmem.linkId);
            //Emergency repair
            if (container !== undefined && container.hits < container.hitsMax * 0.75) {
                creep.repair(container);
            } else if (link !== null && link.energy < link.energyCapacity) {
                if (container !== undefined && container.store[RESOURCE_ENERGY] > 0) {
                    creep.withdraw(container, RESOURCE_ENERGY);
                }
                creep.transfer(link, RESOURCE_ENERGY);
            }

            if (creep.ticksToLive < 5) {
                if (container !== undefined && container.store.energy < container.storeCapacity) {
                    creep.transfer(container, RESOURCE_ENERGY);
                    creep.drop(RESOURCE_ENERGY);
                } else {
                    creep.drop(RESOURCE_ENERGY);
                }
            }
        }

        creep.harvest(source);
    }
}

