import { StorageLink } from "../structureRoles/links";
import { Process,registerProc } from "../kernel/process";

type StructureID<T extends Structure> = IdFor<T>;
type LinkId = StructureID<Link>;

interface LinkProcMemory extends ProcessMemory {
  roomName: typeof Room.name;
  miningLinks: LinkId[];
  storageLink?: LinkId;
  nextScan?: typeof Game.time;
}

@registerProc
export class LinkProc extends Process<LinkProcMemory> {
  public readonly LinkScanTickrate: number = 50;
  public readonly baseHeat: number = 7;

  public init(room: Room) {
    this.memory.roomName = room.name;
  }

  public get room(): Room {
    return Game.rooms[this.memory.roomName]
  }

  private rescanRoom(room: Room,mem: LinkProcMemory) {
    const structures = room.find(FIND_MY_STRUCTURES);
    for(let i = 0;i < structures.length;++i) {
      const s = structures[i];
      if(!(s instanceof StructureLink)) { continue; }
      const linkId = <LinkId & string>s.id;
      //if (mem.miningLinks.indexOf(linkId) >= 0) { continue; }
      //mem.miningLinks.push(linkId);
      const pos = s.pos;
      console.log(`Link registered: ${linkId} in room ${room.name} at pos ${pos.x}:${pos.y}`);
      throw new Error("Not implemented");
    }

    const storageLink = fromId(mem.storageLink);
    //if (rmem.storageLinkId === nul
  }

  private isStorageLink(link: StructureLink): boolean {
    //TODO: Not implemented
    throw new Error("Not implemented");
  }

  public run(): void {
    if(this.kernel.getProcessById(this.parentPid) === undefined) { this.status = ProcessStatus.EXIT; return; }
    const mem = this.memory,room = this.room,gTime = Game.time;

    if(mem.nextScan === undefined || gTime >= mem.nextScan) {
      this.rescanRoom(room,mem);
      mem.nextScan = gTime + this.LinkScanTickrate;
    }


    // for (let i = pmem.towers.length; i-- > 0;) {
    //     const towerId = pmem.towers[i];
    //     const tower = Game.getObjectById<StructureTower>(towerId);
    //     if (tower === null) {
    //         pmem.towers.splice(i);
    //         console.log(`Tower deregistered: ${towerId}`);
    //         continue;
    //     }
    //     if (tower == null) {//TODO: REMOVE AFTER CONFIRM
    //         console.log("Tower returned true for ==null after false for ===null! Docs or defs are inaccurate!");
    //         pmem.towers.splice(i);
    //         continue;
    //     }
    //     if (tower.energy === 0) {
    //         //Can't do much without energy
    //         continue;//TODO: Request energy from courier job queue someday?
    //     }

    //     const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
    //     if (hostiles.length === 0) { continue; }

    //     let closest: Creep | undefined = undefined;
    //     if (hostiles.length === 1) {
    //         closest = hostiles[0];
    //     } else {
    //         const towerPos = tower.pos;
    //         closest = tower.pos.getClosest(hostiles);
    //         if (closest === undefined) { continue; }
    //     }
    //     //const expectedDamage = Math.max(150, Math.min(600, (25 - tower.pos.getRangeTo(closest)) * 30));
    //     if (closest.my) { console.log("Error: Tower is targetting allied creep!"); continue; }
    //     tower.attack(closest);
    // }
  }

  private findLinks(miningPosition: RoomPosition): (string & IdFor<StructureLink>) | undefined {
    const room = Game.rooms[miningPosition.roomName];
    if(room === undefined) { throw new Error("Room inaccessible"); }
    // const storage = room.storage;
    // if (storage === undefined) {
    //     return undefined;
    // }
    const links = room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_LINK);
    const closest = miningPosition.getClosest(links);
    if(closest === undefined) {
      return;
    }
    const distanceToClosest = miningPosition.getRangeTo(closest);
    if(distanceToClosest > 1) {
      return;
    }
    if(links.length > 0) {
      return <IdFor<StructureLink> & typeof StructureLink.prototype.id>links[0].id;
    }
    return;
  }
}
