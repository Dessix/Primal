import { Process,registerProc } from "../kernel/process";

@registerProc
export class CleanMemoryProc extends Process<ProcessMemory> {
  public readonly baseHeat: number = 2;

  public run(): void {
    const gameAccessible = <{ [name: string]: any }>Game;
    const memory = <DICT<DICT<any>>><any>Memory;
    for(let key of ["spawns","rooms","flags"]) {
      const memK = memory[key],gameK = gameAccessible[key];
      const memIKeys = Object.keys(memK);
      for(let i = 0,n = memIKeys.length;i < n;++i) {
        if(gameK[i] === undefined) {
          delete memK[i];
        }
        const memIKey = memIKeys[i];
        if(gameK[memIKey] === undefined) {
          delete memK[memIKey];
        }
      }
    }
    {
      const mCreeps = Memory.creeps, gCreeps = Game.creeps;
      const creepNames = Object.keys(mCreeps);
      for(let i = 0,n = creepNames.length;i < n;++i) {
        const creepName = creepNames[i];
        if(gCreeps[creepName] === undefined) {
          delete mCreeps[creepName];
        }
      }
    }
  }
}
