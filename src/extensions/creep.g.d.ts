interface Creep {
  getProcess(this: Creep,kernel: IKernel): ICreepProcess | undefined;
  getOwnerProcess(this: Creep,kernel: IKernel): ISpawnRequestingProcess | undefined;
}
