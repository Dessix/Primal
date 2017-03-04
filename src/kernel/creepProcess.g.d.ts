interface CreepNativeMoveMemory { }

interface TravelProfile {
  time: number;
  pathStep: number;
  pathLength: number;
  path: Array<string>;
}

type CreepName = typeof Creep.name & (keyof (typeof Game.creeps));

interface ICreepProcess extends IProcess {
  creepName: CreepName;
  readonly creep?: Creep;
}

interface CreepProcessMemory extends ProcessMemory {
    c: CreepName;
    t?: TravelProfile;
}

interface CreepMemory<TCreepProcess extends ICreepProcess = ICreepProcess> {
  s: ProcessId<ISpawnRequestingProcess>;
  c?: ProcessId<TCreepProcess>;

  /**
   * @description Native moveTo data if .moveTo() is used; wasteful
   * @see TODO: Remove when travelTo is 
   */
  _move?: CreepNativeMoveMemory;
}

interface TravelToOpts {
  noSwapping?: boolean;
  noPathFind?: boolean;
}

interface Creep {
  memory: CreepMemory;//Override "potentially-existing" memory, as we ensure in the spawner. Assert this in the spawner outputs.

  //Custom MoveTo
  travelTo(target: RoomPosition | RoomPositionLike | RoomObjectLike, opts?: TravelToOpts): number;
}
