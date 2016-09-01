import { RoleBootstrapMiner } from "./../roles/roleBootstrapMiner";
import { RoleUpgrader } from "./../roles/roleUpgrader";
import { Process, ProcessStatus } from "../kernel/process";

export class PUpgrade extends Process {
    public static className: string = "Upgrade";
    public get className(): string { return PUpgrade.className; }
    private pmem: number;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        let pmem = this.pmem;

        let numUpgraders = 0;
        let numMiners = 0;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory & { upgrading: boolean }>creep.memory;
            if (cmem.role === RoleBootstrapMiner.RoleTag) { ++numMiners; continue; }
            if (cmem.role !== RoleUpgrader.RoleTag) { continue; }
            ++numUpgraders;
            if (creep.spawning) { continue; }
            const upgrader = new RoleUpgrader(creep);
            upgrader.run();
        }
        if (numMiners >= 2 && numUpgraders < 2) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                const energyAvailable = spawn.room.energyAvailable;
                if (energyAvailable >= 300 && !spawn.spawning) {
                    const creepMemory: CreepMemory = {
                        spawnName: spawn.name,
                        role: RoleUpgrader.RoleTag,
                    };
                    const success = spawn.createCreep(
                        RoleUpgrader.chooseBody(energyAvailable),
                        RoleUpgrader.generateName(RoleUpgrader),
                        creepMemory
                    );
                    if (typeof success === "number") {
                        console.log(`Spawn failure: ${success}`);
                    } else {
                        //only work with the first to succeed
                        break;
                    }
                }
            }
        }
        return;
    }
}
