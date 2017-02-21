import * as Roles from "../roles";

export default function initCli(g: Global, m: Memory, kernel: IKernel): void {
  g.reset = function (): void {
    console.log("Ω Rebooting...");
    kernel.mem.proc = null;
    kernel.mem.pmem = {};
    kernel.reboot();
  };

  const inspect = (val: any) => JSON.stringify(val, undefined, 2);

  g.sinspect = inspect;
  g.inspect = (val: any) => inspect(val);

  g.id = <CliIdProxy>new Proxy(fromId, {
    get: function (target, name) {
      name = name.toString();
      if (name.startsWith("_")) { name = name.substring(1); }
      return target(name);
    },
  });

  g.launchNew = function (className: string): number | undefined {
    const procId = kernel.spawnProcessByClassName(className, 0);
    if (procId === undefined) {
      return;
    }
    kernel.saveProcessTable();
    return procId;
  };

  if (!g.c) { Object.defineProperty(g, "c", { get: () => Game.creeps }); }
  if (!g.s) { Object.defineProperty(g, "s", { get: () => Game.spawns }); }
  if (!g.f) { Object.defineProperty(g, "f", { get: () => Game.flags }); }

  g.spawnBard = function () {
    const spawn = Game.spawns["Hive"];
    const room = spawn.room;
    const energyAvailable = room.energyAvailable;
    const energyCapacityAvailable = room.energyCapacityAvailable;
    const chosenBody = Roles.RoleBard.chooseBody(energyAvailable);
    if (chosenBody === undefined) {
      //console.log("No body could be chosen");
      return;
    }
    const creepMemory: CreepMemory = {
      spawnName: spawn.name,
      role: Roles.RoleBard.RoleTag,
      homeRoomName: spawn.room.name,
    };
    const success = spawn.createCreep(
      chosenBody,
      Roles.RoleBard.generateName(Roles.RoleBard, creepMemory),
      creepMemory
    );
    if (typeof success === "number") {
      //console.log(`Spawn failure: ${success}`);
      return;
    }
    console.log(g.sinspect(spawn.spawning));
  };

  g.showBuildQueue = function (room: Room): void {
    const buildQueue = room.find(FIND_CONSTRUCTION_SITES);
    let str: string | null = "<table>\n";
    for (let i = 0, n = buildQueue.length; i < n; ++i) {
      str = str + `<tr><td>${i + 1}:</td><td>${buildQueue[i].structureType}</td></tr>\n`;
    }
    str = str + "</table>\n";
    console.log(str);
    str = null;
  };
};
