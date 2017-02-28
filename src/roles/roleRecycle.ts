import { CreepProcess } from "../kernel/creepProcess";

interface PRecycleMemory extends CreepProcessMemory {
}

export class PRecycle extends CreepProcess<[Creep],PRecycleMemory> {
    public static readonly className: string = "Recycle";
    public get className(): string { return PRecycle.className; }

    public launch(args: [Creep]): void {
        this.creepName = args[0].name;
    }

    public run(): void {
        const creep = this.creep;
        if (creep === undefined) { this.status = ProcessStatus.EXIT; return; }
        //Game.creeps[]
        if (creep.spawning) { return; }
        const spawn = creep.spawn;

        if (creep.pos.getRangeTo(spawn) > 1) {
            creep.moveTo(spawn.pos);
            return;
        } else {
            creep.say("o7", true);
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
            console.log("Creep suiciding");
            spawn.recycleCreep(creep);
        }
    }
}

