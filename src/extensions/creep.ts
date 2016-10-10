import { safeExtendPrototype } from "../util/reflection";

class CreepX {
    public get role(this: Creep): string | null | undefined {
        return this.memory.role;
    }

    public set role(this: Creep, value: string | null | undefined) {
        if (value !== undefined) {
            this.memory.role = value;
        } else {
            delete this.memory.role;
        }
    }

    public get spawn(this: Creep): Spawn {
        return Game.spawns[this.memory.spawnName];
    }

    public set spawn(spawn: Spawn) {
        if (!spawn || !Game.spawns[spawn.name]) {
            throw new Error("Null/undefined spawn assigned to creep!");
        }
        (<CreepMemory>this.memory).spawnName = spawn.name;
    }

    public get homeRoomName(this: Creep): string {
        return this.memory.homeRoomName;
    }

    public get homeRoom(this: Creep): Room | undefined {
        return Game.rooms[this.memory.homeRoomName];
    }

    public recycle(this: Creep): void {
        this.memory.role = "recy";
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

        const memory = this.memory;
        if (opts !== undefined && opts.reusePath && memory._move !== undefined) {
            const tr = memory.t;

            
            
            // if (Game.time > _move.time + reusePath) {
            //     delete this.memory._move;
            // } else if (_move.dest.room == roomName && _move.dest.x == x && _move.dest.y == y) {

            //     var path = _.isString(_move.path) ? utils.deserializePath(_move.path) : _move.path;

            //     var idx = _.findIndex(path, { x: this.pos.x, y: this.pos.y });
            //     if (idx != -1) {
            //         var oldMove = _.cloneDeep(_move);
            //         path.splice(0, idx + 1);
            //         try {
            //             _move.path = opts.serializeMemory ? utils.serializePath(path) : path;
            //         } catch (e) {
            //             console.log('$ERR', this.pos, x, y, roomName, JSON.stringify(path), '-----', JSON.stringify(oldMove));
            //             throw e;
            //         }
            //     }
            //     if (path.length == 0) {
            //         return this.pos.isNearTo(targetPos) ? C.OK : C.ERR_NO_PATH;
            //     }
            //     var result = this.moveByPath(path);

            //     if (result == C.OK) {
            //         return C.OK;
            //     }
            // }
        }

        throw new Error("Not implemented!");
    }
}

safeExtendPrototype(Creep, CreepX, true);
