interface CliIdProxy {
  (id: string): RoomObject | undefined;
  [id: string]: RoomObject | undefined;
}

interface Global {
  kernel: IKernel;
  k: IKernel;
  launchNew(className: string): number | undefined;
  reset(): void;
  spawnBard(): void;
  showBuildQueue(room: Room): void;

  c: { [creepName: string]: Creep | undefined };
  s: { [spawnName: string]: Spawn | undefined };
  f: { [flagName: string]: Flag | undefined };
  id: CliIdProxy;
  sinspect: (val: any) => string;
  inspect: (val: any) => void;
}
