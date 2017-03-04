import * as Reflector from "../util/reflection";

class CreepX {
  public getProcess(this: Creep,kernel: IKernel): ICreepProcess | undefined {
    const c = this.memory.c;
    return c && kernel.getProcessById(c);
  };

  public getOwnerProcess(this: Creep,kernel: IKernel): ISpawnRequestingProcess | undefined {
    return kernel.getProcessById(this.memory.s);
  }
}

Reflector.safeExtendPrototype(Creep.prototype,CreepX.prototype);
