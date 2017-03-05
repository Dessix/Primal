import { roomFromMemory } from "../util/fromMemory";
import { Process,registerProc } from "../kernel/process";
import { MiningScanner } from "../util/miningScanner";

interface SpawnProcMemory {
  r: typeof Room.name;
}

@registerProc
export class SpawnProc extends Process<SpawnProcMemory> implements ISpawnRequestingProcess {
  public baseHeat: number = 5;

  public init(room: Room): this {
    this.room = room;
    return this;
  }

  @roomFromMemory("r", SpawnProc)
  private room: Room;

  public isAliveEnough(creep: Creep): boolean { return creep.ticksToLive <= 25; }
  
  public createProcessForCreep<TCreepProcess extends ICreepProcess>(creep: Creep,cmem: CreepMemory<TCreepProcess>): TCreepProcess {
    throw new Error("Not implemented");
  }

  public run(): void {
		const spawns = Game.spawns, spawnNames = Object.keys(spawns);
		for(let i = 0, n = spawnNames.length; i < n; ++i) {
			const spawnName = spawnNames[i], spawn = spawns[spawnName];
      if (spawn.spawning) { continue; }
      const room = spawn.room;
      const energyAvailable = room.energyAvailable;
      const energyCapacityAvailable = room.energyCapacityAvailable;
      //TODO: Implement!
      throw new Error("Not implemented");
    }
  }
}
