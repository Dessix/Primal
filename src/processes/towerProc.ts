import { Process,registerProc } from "../kernel/process";

type TowerId = IdFor<Tower>;
interface TowerProcMemory extends ProcessMemory {
  roomName: typeof Room.name;
  nextTowerScanTick?: number;
  towers: TowerId[];
}

@registerProc
export class TowerProc extends Process<TowerProcMemory> {
  public static className: string = "Tower";
  public readonly baseHeat: number = 15;

  public readonly ScanRate: number = 50;

  public init(room: Room): this {
    this.memory.roomName = room.name;
    return this;
  }

  private get room(): Room {
    return Game.rooms[this.memory.roomName]!;
  }

  private getTowers(): Array<Tower> {
    const memory = this.memory,towerIds = memory.towers,gTime = Game.time;
    if(memory.nextTowerScanTick === undefined || gTime > memory.nextTowerScanTick) {
      const structures = this.room.find(FIND_MY_STRUCTURES);
      for(let i = 0;i < structures.length;++i) {
        const s = structures[i];
        if(!(s instanceof StructureTower)) { continue; }
        const towerId = <IdFor<Tower>>s.id;
        if(towerIds.indexOf(towerId) >= 0) { continue; }
        towerIds.push(towerId);
        const pos = s.pos;
        console.log(`Tower registered: ${towerId} in room ${pos.roomName} at pos ${pos.x}:${pos.y}`);
      }
      memory.nextTowerScanTick = gTime + this.ScanRate;
    }
    //TODO: Wtf, this is weird. Move it above, search less items. 
    const towers = new Array<Tower>(towerIds.length);
    for(let i = towers.length;i-- > 0;) {//reverse iteration for easy removal
      const towerId = towerIds[i];
      const tower = fromId<StructureTower>(towerId);
      if(tower === undefined) {
        towerIds.splice(i);
        towers.splice(i);
        console.log(`Tower deregistered: ${towerId}`);
        continue;
      }
      towers[i] = tower;
    }
    memory.towers = towerIds;
    return towers;
  }

  public run(): void {
    this.assertParentProcess();
    const towers = this.getTowers();
    const scannedHostiles: { [roomName: string]: Array<Creep> | undefined } = {};

    for(let i = 0,n = towers.length;i < n;++i) {
      const tower = towers[0];
      if(tower.energy === 0) {//Can't do much without energy
        continue;//TODO: Request energy from courier job queue or flower manager
      }
      let hostiles = scannedHostiles[tower.room.name];
      if(hostiles === undefined) {
        hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
        scannedHostiles[tower.room.name] = hostiles;
      }

      if(hostiles.length === 0) { continue; }
      let closest: Creep | undefined;
      if(hostiles.length === 1) {
        closest = hostiles[0];
      } else {
        const towerPos = tower.pos;
        closest = towerPos.getClosest(hostiles);
        if(closest === undefined) { continue; }
      }
      //const expectedDamage = Math.max(150, Math.min(600, (25 - tower.pos.getRangeTo(closest)) * 30));
      if(closest.my) { console.log("Error: Tower is targetting allied creep!"); continue; }
      tower.attack(closest);
    }
  }
}
