
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
        const miningSiteFlag = sourcePos.lookForInBox(LOOK_FLAGS, 1)
            .find(flag => flag.color === COLOR_CYAN && flag.secondaryColor === COLOR_YELLOW);
        if (miningSiteFlag !== undefined) { return miningSiteFlag.pos; }

        const miningContainer = sourcePos.lookForInBox(LOOK_STRUCTURES, 1)
            .find(function (s) { return s instanceof StructureContainer; });
        if (miningContainer !== undefined) { return miningContainer.pos; }

        throw new Error();
        // const terrain = sourcePos.lookTerrainInBox(1)
        //     .filter(function (res) { return (res.terrain === "plain" || res.terrain === "swamp"); })
        //     .sort(function (a, b) { return (a.terrain === "swamp") ? 1 : -1; });

        // if (terrain.length === 0) {
        //     throw new Error(`Hidden source? Cannot reach through terrain at ${source.room}:${source.pos}.`);
        // }

        // const selectedTile = terrain[0];//Maybe prefer closer to center of room? Currently prefers plain over swamp.
        // return new RoomPosition(terrain[0].x, terrain[0].y, source.room.name);
    }

    private static scan(room: Room): SourceScanInfo {
        const roomInfo: SourceScanInfo = {
            roomName: room.name,
            sources: [],
            lastSourceIndex: -1,
        };
        const sources = room.find(FIND_SOURCES);
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
