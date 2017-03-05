import { fromMemory } from "../../util/fromMemory";
import { Process,registerProc } from "../../kernel/process";

export interface MoriaProcMemory extends ProcessMemory {
  /**Name of the main room for this mining operation*/
  r: typeof Room.name;
  s?: ProcessId<ISpawnerProcess>;
}

/**
 * Moria
 * @description Maintains mining logistics and sites for energy, minerals, and power within its zone of control.
 */
@registerProc
export class MoriaProc extends Process<MoriaProcMemory> {
  public init(room: Room): MoriaProc {
    this.room = room;
    this.kernel.log(LogLevel.Info, `Spawned Moria process for room ${room.name}`);
    return this;
  }

  @fromMemory({key: "r", get: (r?: typeof Room.name) => r ? Game.rooms[r] : undefined, set: (r?: Room) => r ? r.name : undefined })
  public room?: Room;

  private get parent(): IRoomProc {
    return this.kernel.getProcessByIdOrThrow(<ProcessId<IRoomProc>>this.parentPid);
  }

  private _pSpawnCache?: ISpawnerProcess = undefined;
  private get parentSpawner(): ISpawnerProcess {
    if (this._pSpawnCache !== undefined) { return this._pSpawnCache; }
    let spawnProc: ISpawnerProcess | undefined;
    if(this.memory.s && (spawnProc = this.kernel.getProcessById(this.memory.s)) !== undefined) { return spawnProc; }
    const psp = this.parent.spawnerProcess;
    this.memory.s = psp.pid;
    return (this._pSpawnCache = psp);
  }

  public run() {
    const room = this.room;
    if(!room || !room.controller || !room.controller.my) { this.status = ProcessStatus.EXIT; return; }//Main room either no longer visible or no longer owned

    //TODO: Implement
  }
}
