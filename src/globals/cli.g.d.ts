interface CliIdProxy {
  (id: string | IdFor<RoomObject> | null | undefined): RoomObject | undefined;
  [id: string]: RoomObject | undefined;
}

interface Global {
  kernel: IKernel;
  k: IKernel;
  launchNew(className: string): ProcessId | undefined;
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
