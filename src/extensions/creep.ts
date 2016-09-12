import { safeExtendPrototype } from "../util/reflection";

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

        throw new Error("Not implemented!");
    }
}

safeExtendPrototype(Creep, CreepX, true);
