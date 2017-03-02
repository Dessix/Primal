
interface ISpawnRequestingProcess extends IProcess {
  //TODO: Maybe allow failure later- divert failing entries to default, in the same way as if the spawn requestor didn't still exist?
  createProcessForCreep(creep: Creep, cmem: CreepMemory): ICreepProcess;
}
