import { Process,registerProc } from "../../kernel/process";

export interface MoriaProcMemory extends ProcessMemory {
  /**Name of the main room for this mining operation*/
  r: string;
}

/**
 * Moria
 * @description Maintains mining logistics and sites for energy, minerals, and power within its zone of control.
 */
@registerProc
export class MoriaProc extends Process<MoriaProcMemory> {
  public init(room: Room): MoriaProc {
    this.memory.r = room.name;
    console.log("Spawned Moria for room %s",room.name);
    return this;
  }

  //TODO: @fromMemoryGet<MoriaProcMemory>(undefined, function(mem) { return Game.rooms[mem.r] })
  public get room(): Room | undefined { return Game.rooms[this.memory.r]; }

  public run() {
    const room = this.room;
    if(!room || !room.controller || !room.controller.my) { this.status = ProcessStatus.EXIT; return; }//Main room either no longer visible or no longer owned

    //TODO: Implement
  }
}
