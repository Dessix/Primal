import { RoleListing } from "./../ipc/roleListing";
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

        const builder = RoleBuilder.Instance;
        for (let creep of RoleListing.getByRole(RoleBuilder)) {
            builder.run(creep);
        }

        const numDrills = RoleListing.getByRole(RoleDrill).length;
        const numCouriers = RoleListing.getByRole(RoleCourier).length;
        const numUpgraders = RoleListing.getByRole(RoleUpgrader).length;
        const numBuilders = RoleListing.getByRole(RoleBuilder).length;
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numBuilders < 1 * global.config.builderMultiplier) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                if (spawn.spawning) { continue; }
                const chosenBody = RoleBuilder.chooseBody(spawn.room.energyAvailable);
                if (chosenBody === undefined) {
                    continue;
                }
                const creepMemory: CreepMemory = {
                    spawnName: spawn.name,
                    role: RoleBuilder.RoleTag,
                };
                const success = spawn.createCreep(
                    chosenBody,
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
        return;
    }
}
