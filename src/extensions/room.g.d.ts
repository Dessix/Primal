
interface RoomMemory {
  p?: ProcessId<IColonizer>;//Parent / Colonizer
  r?: ProcessId<IRoomProc>;//Room process
}

interface LookForInBoxTerrainResult extends LookAtResultWithPos {
  type: LOOK_TERRAIN;
  x: number;
  y: number;
  terrain: TERRAIN;

  constructionSite: undefined;
  creep: undefined;
  energy: undefined;
  exit: undefined;
  flag: undefined;
  source: undefined;
  structure: undefined;
  mineral: undefined;
  resource: undefined;
}

interface Room {
  findFirstStructureOfType<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE> | undefined;
  findStructuresOfType<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE>[];

  findFirstStructureOfTypeMatching<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE> | undefined;
  findFirstStructureOfTypeMatching<TReturn extends STRUCTURE_TARGET<TSTRUCTURE>, TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): TReturn | undefined;

  findStructuresOfTypeMatching<TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): STRUCTURE_TARGET<TSTRUCTURE>[];
  findStructuresOfTypeMatching<TReturn extends STRUCTURE_TARGET<TSTRUCTURE>, TSTRUCTURE extends STRUCTURE>(this: Room, structureType: TSTRUCTURE, condition: (structure: STRUCTURE_TARGET<TSTRUCTURE>) => boolean, onlyMine?: Boolean): TReturn[];
}
