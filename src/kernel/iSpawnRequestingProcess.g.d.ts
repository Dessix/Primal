
interface ISpawnRequestingProcess extends IProcess {
  //TODO: Maybe allow failure later- divert failing entries to default, in the same way as if the spawn requestor didn't still exist?
  createProcessForCreep<TCreepProcess extends ICreepProcess>(creep: Creep, cmem: CreepMemory<TCreepProcess>): TCreepProcess;
}
