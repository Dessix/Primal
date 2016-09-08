
function clamp(min: number, max: number, val: number): number {
    if (val < min) {
        return val;
    } else {
        if (val > max) {
            return max;
        } else {
            return val;
        }
    }
}

function clampPoint(min: number, max: number, point: { x: number; y: number; }): { x: number; y: number; } {
    return {
        x: clamp(min, max, point.x),
        y: clamp(min, max, point.y),
    };
}

function addPoints(point: { x: number; y: number; }, other: { x: number; y: number; }): { x: number; y: number; } {
    return {
        x: point.x + other.x,
        y: point.y + other.y,
    };
}

export class MiningScanner {

    public static findMiningPosition(source: Source): RoomPosition {
        //look for mining position flags (those starting with Cyan)
        const sourcePos = source.pos;
        const topLeft = clampPoint(0, 49, addPoints(sourcePos, { x: -1, y: -1 }));
        const bottomRight = clampPoint(0, 49, addPoints(sourcePos, { x: 1, y: 1 }));

        const miningSiteFlag = (<LookAtResultWithPos[]>source.room.lookForAtArea(LOOK_FLAGS, topLeft.y, topLeft.x, bottomRight.y, bottomRight.x, true))
            .find(res => res.flag !== undefined && res.flag.color === COLOR_CYAN && res.flag.secondaryColor === COLOR_YELLOW);
        if (miningSiteFlag !== undefined) {
            return new RoomPosition(miningSiteFlag.x, miningSiteFlag.y, source.room.name);
        }

        const miningContainer = (<LookAtResultWithPos[]>source.room.lookForAtArea(LOOK_STRUCTURES, topLeft.y, topLeft.x, bottomRight.y, bottomRight.x, true))
            .find(res => res.structure !== undefined && res.structure instanceof StructureContainer);
        if (miningContainer !== undefined) {
            return new RoomPosition(miningContainer.x, miningContainer.y, source.room.name);
        }

        const terrain = (<LookAtResultWithPos[]>source.room.lookForAtArea(LOOK_TERRAIN, topLeft.y, topLeft.x, bottomRight.y, bottomRight.x, true))
            .filter(res => res.terrain !== undefined && (res.terrain === "plain" || res.terrain === "swamp"))
            .sort(function (a, b) {
                return (a.terrain === "swamp") ? 1 : -1;
            });

        if (terrain.length === 0) {
            throw new Error(`Hidden source? Cannot reach through terrain at ${source.room}:${source.pos}.`);
        }

        const selectedTile = terrain[0];//Maybe prefer closer to center of room? Currently prefers plain over swamp.
        return new RoomPosition(terrain[0].x, terrain[0].y, source.room.name);
    }

    private static scan(room: Room): SourceScanInfo {
        const roomInfo: SourceScanInfo = {
            roomName: room.name,
            sources: [],
            lastSourceIndex: -1,
        };
        const sources = room.find<Source>(FIND_SOURCES);
        for (let source of sources) {
            const {x: miningX, y: miningY } = MiningScanner.findMiningPosition(source);
            roomInfo.sources.push({
                id: source.id,
                position: { x: source.pos.x, y: source.pos.y },
                miningPosition: { x: miningX, y: miningY },
            });
        }
        return roomInfo;
    }

    public static getScanInfoForRoom(room: Room): SourceScanInfo {
        let roomName: string = room.name;
        const sources = Memory.sources || (Memory.sources = {});
        let sourceRoom = sources[roomName];
        if (sourceRoom === undefined) {
            return sources[roomName] = MiningScanner.scan(room);
        }
        return sourceRoom;
    }

    public static getScanInfoByRoomName(roomName: string): SourceScanInfo | undefined {
        const sources = Memory.sources || (Memory.sources = {});
        let sourceRoom = sources[roomName];
        if (sourceRoom === undefined) {
            const room = Game.rooms[roomName];
            if (room === undefined) {
                return undefined;
            } else {
                return MiningScanner.getScanInfoForRoom(room);
            }
        }
        return sourceRoom;
    }

    public static getIndexedSourceForRoom(room: Room, sourceIndex: number): { sourceInfo: SourceInfo; miningPosition: RoomPosition; } {
        const scanInfo = MiningScanner.getScanInfoForRoom(room);
        const sourceInfo = scanInfo.sources[sourceIndex % scanInfo.sources.length];
        return {
            sourceInfo,
            miningPosition: new RoomPosition(sourceInfo.miningPosition.x, sourceInfo.miningPosition.y, room.name),
        };
    }

    public static getIndexedSourceByRoomName(roomName: string, sourceIndex: number): { sourceInfo: SourceInfo; miningPosition: RoomPosition; } | undefined {
        const scanInfo = MiningScanner.getScanInfoByRoomName(roomName);
        if (scanInfo === undefined) { return undefined; }
        const sourceInfo = scanInfo.sources[sourceIndex % scanInfo.sources.length];
        return {
            sourceInfo,
            miningPosition: new RoomPosition(sourceInfo.miningPosition.x, sourceInfo.miningPosition.y, roomName),
        };
    }
}
