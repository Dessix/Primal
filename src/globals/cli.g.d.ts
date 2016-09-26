interface CliIdProxy {
  (id: string): RoomObject | undefined;
  [id: string]: RoomObject | undefined;
}

interface Global {
  kernel: {
    spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
  };
  k: {
    spawnProcessByClassName(processName: string, parentPid?: number): ProcessId | undefined;
  };
  launchNew(className: string): number | undefined;
  reset(): SerializedProcessTable;
  spawnBard(): void;
  showBuildQueue(room: Room): void;

  c: { [creepName: string]: Creep | undefined };
  s: { [spawnName: string]: Spawn | undefined };
  f: { [flagName: string]: Flag | undefined };
  id: CliIdProxy;
  sinspect: (val: any) => string;
  inspect: (val: any) => void;
}