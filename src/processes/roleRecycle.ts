import { SpawnProc } from "./spawnProc";
import { idFromMemory } from "../util/fromMemory";
import { CreepProcess } from "../kernel/creepProcess";

interface RecycleProcMemory extends CreepProcessMemory {
    s?: IdFor<StructureSpawn>;
}

export class RecycleProc extends CreepProcess<RecycleProcMemory> {
    public init(creep: Creep,destSpawn?: Spawn): this {
        this.creepName = creep.name;
        if(destSpawn !== undefined) { this.destSpawn = destSpawn };
        return this;
    }

    @idFromMemory("s")
    private destSpawn?: Spawn;

    public run(): void {
        const c = this.creep;
        if(c === undefined) { this.status = ProcessStatus.EXIT; return; }
        if(c.spawning) { return; }

        let spawn = this.destSpawn;
        if(spawn === undefined) {
            spawn = <StructureSpawn | undefined>c.pos.findClosestByRange(FIND_MY_SPAWNS);
            if(spawn === undefined) {
                this.kernel.log(LogLevel.Info,`Creep ${this.creepName} suiciding due to lost spawn`);
                c.suicide();
                this.status = ProcessStatus.EXIT;
                return;
            }
            this.destSpawn = spawn;
        }

        if(c.pos.getRangeTo(spawn) > 1) {
            c.moveTo(spawn.pos);
            return;
        } else {
            c.say("o7",true);
        }

        const carriedEnergy = c.carry.energy;
        if(carriedEnergy > 0) {
            const spawnCanTake = spawn.energyCapacity - spawn.energy;
            if(spawnCanTake > 0) {
                c.transfer(spawn,RESOURCE_ENERGY,spawnCanTake);
                c.drop(RESOURCE_ENERGY,carriedEnergy - spawnCanTake);
            } else {
                c.drop(RESOURCE_ENERGY);
            }
        } else {
            this.kernel.log(LogLevel.Info,`Creep ${this.creepName} recycling`);
            spawn.recycleCreep(c);
            this.status = ProcessStatus.EXIT;
            return;
        }
    }
}

