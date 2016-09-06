import { safeExtendPrototype } from "../util/reflection";

class CreepX extends Creep {
    public get cmem(): CreepMemory {
        return <CreepMemory>this.memory;
    }

    public set cmem(value: CreepMemory) {
        this.memory = value;
    }

    public get role(): string | undefined {
        return this.cmem.role;
    }

    public set role(value: string | undefined) {
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
            return;
        }
        (<CreepMemory>this.memory).spawnName = spawn.name;
    }

    public recycle(): void {
        (<CreepMemory>this.memory).role = "recy";
    }

}

safeExtendPrototype(Creep, CreepX);
