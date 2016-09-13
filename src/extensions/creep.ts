import { safeExtendPrototype } from "../util/reflection";

interface CreepMoveRecord {
    time: number;
    pathStep: number;
    pathLength: number;
    path: Array<string>;
}

class CreepX extends Creep {
    public get cmem(): CreepMemory {
        return <CreepMemory>this.memory;
    }

    public set cmem(value: CreepMemory) {
        this.memory = value;
    }

    public get role(): string | null | undefined {
        return this.cmem.role;
    }

    public set role(value: string | null | undefined) {
        if (value !== undefined) {
            this.cmem.role = value;
        } else {
            delete this.cmem.role;
        }
    }

    public get spawn(): Spawn {
        return Game.spawns[(<CreepMemory>this.memory).spawnName];
    }

    public set spawn(spawn: Spawn) {
        if (!spawn || !Game.spawns[spawn.name]) {
            throw new Error("Null/undefined spawn assigned to creep!");
        }
        (<CreepMemory>this.memory).spawnName = spawn.name;
    }

    public get homeRoom(): Room {
        return Game.rooms[(<CreepMemory>this.memory).homeRoomName];
    }

    public set homeRoom(homeRoom: Room) {
        if (!homeRoom || !Game.rooms[homeRoom.name]) {
            throw new Error("Null/undefined homeRoom assigned to creep!");
        }
        (<CreepMemory>this.memory).homeRoomName = homeRoom.name;
    }

    public recycle(this: Creep): void {
        this.cmem.role = "recy";
    }

    public travelTo(this: Creep, target: RoomPosition | RoomObject, opts?: MoveToOpts & FindPathOpts): number {
        if (!this.my) { return ERR_NOT_OWNER; }
        if (this.spawning) { return ERR_BUSY; }
        if (this.fatigue > 0) { return ERR_TIRED; }
        if (this.getActiveBodyparts(MOVE) === 0) { return ERR_NO_BODYPART; }

        if (target instanceof RoomObject) { target = target.pos; }

        const pos = this.pos;
        if (pos.x === target.x && pos.y === target.y && pos.roomName === target.roomName) {
            return OK;
        }

        const reusePath = opts !== undefined && opts.reusePath;

        let memory = <CreepMemory | undefined>this.memory;
        if (opts !== undefined && opts.reusePath && memory !== undefined && memory._move !== undefined) {
            const _move = <CreepMoveRecord>memory._move;

            if (Game.time > _move.time + reusePath) {
                delete this.memory._move;
            } else if (_move.dest.room == roomName && _move.dest.x == x && _move.dest.y == y) {

                var path = _.isString(_move.path) ? utils.deserializePath(_move.path) : _move.path;

                var idx = _.findIndex(path, { x: this.pos.x, y: this.pos.y });
                if (idx != -1) {
                    var oldMove = _.cloneDeep(_move);
                    path.splice(0, idx + 1);
                    try {
                        _move.path = opts.serializeMemory ? utils.serializePath(path) : path;
                    } catch (e) {
                        console.log('$ERR', this.pos, x, y, roomName, JSON.stringify(path), '-----', JSON.stringify(oldMove));
                        throw e;
                    }
                }
                if (path.length == 0) {
                    return this.pos.isNearTo(targetPos) ? C.OK : C.ERR_NO_PATH;
                }
                var result = this.moveByPath(path);

                if (result == C.OK) {
                    return C.OK;
                }
            }
        }

        throw new Error("Not implemented!");
    }
}

safeExtendPrototype(Creep, CreepX, true);
