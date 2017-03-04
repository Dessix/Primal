import { RoleListing } from "./../ipc/roleListing";
import * as Roles from "../roles";
import { Process,registerProc } from "../kernel/process";
import { MiningScanner } from "../util/miningScanner";

interface SpawnProcMemory {
}

@registerProc
export class SpawnProc extends Process<SpawnProcMemory> implements ISpawnRequestingProcess {

  public static className: string = "Spawner";
  public baseHeat: number = 5;

  public isAliveEnough(creep: Creep): boolean {
    return creep.ticksToLive <= 25;
  }
  
  public createProcessForCreep<TCreepProcess extends ICreepProcess>(creep: Creep,cmem: CreepMemory<TCreepProcess>): TCreepProcess {
    throw new Error("Method not implemented.");
  }

  public run(): void {
    const creeps = RoleListing.getAllCreeps();

    const drills = Array.from(RoleListing.getByRole(Roles.RoleDrill));
    const couriers = RoleListing.getByRole(Roles.RoleDrill);
    const harvies = RoleListing.getByRole(Roles.RoleDrill);

    const numDrills = drills.filter(d => d.ticksToLive > 25).length;
    const numCouriers = couriers.length;
    const numHarvies = harvies.length;
		const spawns = Game.spawns, spawnNames = Object.keys(spawns);
		for(let i = 0, n = spawnNames.length; i < n; ++i) {
			const spawnName = spawnNames[i], spawn = spawns[spawnName];
      if (spawn.spawning) { continue; }
      const room = spawn.room;
      const energyAvailable = spawn.room.energyAvailable;
      const energyCapacityAvailable = spawn.room.energyCapacityAvailable;

      if ((numDrills >= 1 && numCouriers < 1) || (numDrills >= 2 && numCouriers < 2 * global.config.nCrr)) {
        if (numCouriers >= 1 && numDrills >= 1) {
          if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
            break;
          } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
            break;
          } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
            break;
          } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
            break;
          }
          //Prefer larger spawns!
        }
        if (this.trySpawnCourier(spawn, energyAvailable, energyCapacityAvailable)) {
          break;
        }
      } else if (numDrills < 2) {
        if (numCouriers >= 1 && numDrills >= 1) {
          if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
            break;
          } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
            break;
          } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
            break;
          } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
            break;
          }
          //Prefer larger spawns!
        }
        if (this.trySpawnDrill(spawn, energyAvailable, energyCapacityAvailable)) {
          break;
        }
      } else if (numDrills >= 2 && numCouriers >= 2 && numHarvies < 4) {
        if (numCouriers >= 1 && numDrills >= 1) {
          if (energyCapacityAvailable === 300 && energyAvailable < energyCapacityAvailable) {
            break;
          } else if (energyCapacityAvailable > 450 && energyAvailable < 450) {
            break;
          } else if (energyCapacityAvailable > 550 && energyAvailable < 550) {
            break;
          } else if (energyCapacityAvailable > 650 && energyAvailable < 650) {
            break;
          } else if (energyCapacityAvailable > 750 && energyAvailable < 750) {
            break;
          } else if (energyCapacityAvailable > 850 && energyAvailable < 850) {
            break;
          }
          //Prefer larger spawns!
        }
        if (this.trySpawnBootstrap(spawn, energyAvailable, energyCapacityAvailable)) {
          break;
        }
      }
    }
  }
}
