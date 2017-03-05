export default function initCli(g: Global, m: Memory, kernel: IKernel): void {
  g.reset = function (): void {
    console.log("\u1F53B Rebooting...");
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

  g.launchNew = function (className: string): ProcessId | undefined {
    const p = kernel.spawnProcessByClassName(className, <ProcessId><any>0);
    if (p === undefined) {
      kernel.log(LogLevel.Error, "\u1F53B Could not find specified process to spawn.");
      return;
    }
    kernel.log(LogLevel.Info, `\u1F53B Spawned process ${p.pid}:${p.className}`);
    kernel.saveProcessTable();//Because we're called after the kernel for some reason (TODO: Verify still true, it's been a while)
    return p.pid;
  };

  if (!g.c) { Reflect.defineProperty(g, "c", { get: () => Game.creeps }); }
  if (!g.s) { Reflect.defineProperty(g, "s", { get: () => Game.spawns }); }
  if (!g.f) { Reflect.defineProperty(g, "f", { get: () => Game.flags }); }

  g.showBuildQueue = function (room: Room): void {
    const buildQueue = room.find(FIND_CONSTRUCTION_SITES);
    let html: string | null = "<table>\n";
    for (let i = 0, n = buildQueue.length; i < n; ++i) {
      html += `\t<tr><td>${i + 1}:</td><td>${buildQueue[i].structureType}</td></tr>\n`;
    }
    html += "</table>\n";
    console.log(html);
    html = null;
  };
};
