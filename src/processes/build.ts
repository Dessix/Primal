import { RoleCourier } from "./../roles/roleCourier";
import { RoleDrill } from "./../roles/roleDrill";
import { RoleUpgrader } from "./../roles/roleUpgrader";
import { RoleBootstrapMiner } from "./../roles/roleBootstrapMiner";
import { RoleBuilder } from "./../roles/roleBuilder";
import { Process, ProcessStatus } from "../kernel/process";

export class PBuild extends Process {
    public static className: string = "Build";
    public get className(): string { return PBuild.className; }
    private pmem: number;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        let pmem = this.pmem;

        let numDrills = 0;
        let numCouriers = 0;
        let numUpgraders = 0;
        let numBuilders = 0;
        const builder = RoleBuilder.Instance;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory>creep.memory;

            if (cmem.role === RoleDrill.RoleTag) { ++numDrills; continue; }
            if (cmem.role === RoleCourier.RoleTag) { ++numCouriers; continue; }
            if (cmem.role === RoleUpgrader.RoleTag) { ++numUpgraders; continue; }
            if (cmem.role !== RoleBuilder.RoleTag) { continue; }
            ++numBuilders;
            builder.run(creep);
        }
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numBuilders < 1 * global.config.builderMultiplier) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                if (spawn.room.energyAvailable >= 300 && !spawn.spawning) {
                    const creepMemory: CreepMemory = {
                        spawnName: spawn.name,
                        role: RoleBuilder.RoleTag,
                    };
                    const success = spawn.createCreep(
                        RoleBuilder.chooseBody(spawn.room.energyAvailable),
                        RoleBuilder.generateName(RoleBuilder),
                        creepMemory
                    );
                    if (typeof success !== "string") {
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
