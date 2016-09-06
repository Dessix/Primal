import { BaseRole } from "./baseRole";

interface RecyclerMemory extends CreepMemory {
}

export class RoleRecycle extends BaseRole<RecyclerMemory> {
    public static RoleTag: string = "recy";

    public constructor() {
        super();
    }

    private static _instance: RoleRecycle | undefined;
    public static get Instance(): RoleRecycle {
        const instance = RoleRecycle._instance;
        if (instance === undefined) {
            return (RoleRecycle._instance = new RoleRecycle());
        }
        return instance;
    }

    public onRun(creep: Creep, cmem: RecyclerMemory): void {
        if (creep.spawning) { return; }
        const spawn = creep.spawn;

        if (creep.pos.getRangeTo(spawn) > 1) {
            console.log("Recyclemove!", spawn.pos, creep.moveTo(spawn.pos));
            return;
        }

        const carriedEnergy = creep.carry.energy;
        if (carriedEnergy > 0) {
            const spawnCanTake = spawn.energyCapacity - spawn.energy;
            if (spawnCanTake > 0) {
                creep.transfer(spawn, RESOURCE_ENERGY, spawnCanTake);
                creep.drop(RESOURCE_ENERGY, carriedEnergy - spawnCanTake);
            } else {
                creep.drop(RESOURCE_ENERGY);
            }
        } else {
            creep.say("o7");
            console.log("Creep suiciding");
            spawn.recycleCreep(creep);
        }
    }
}

