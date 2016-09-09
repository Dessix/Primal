import { RoleListing } from "../ipc/roleListing";
import * as Roles from "../roles";
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

        const builder = Roles.RoleBuilder.Instance;
        for (let creep of RoleListing.getByRole(Roles.RoleBuilder)) {
            builder.run(creep);
        }

        const numDrills = RoleListing.getByRole(Roles.RoleDrill).length;
        const numCouriers = RoleListing.getByRole(Roles.RoleCourier).length;
        const numUpgraders = RoleListing.getByRole(Roles.RoleUpgrader).length;
        const numBuilders = RoleListing.getByRole(Roles.RoleBuilder).length;
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numBuilders < 1 * global.config.builderMultiplier) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                if (spawn.spawning) { continue; }
                const chosenBody = Roles.RoleBuilder.chooseBody(spawn.room.energyAvailable);
                if (chosenBody === undefined) {
                    continue;
                }
                const creepMemory: CreepMemory = {
                    spawnName: spawn.name,
                    role: Roles.RoleBuilder.RoleTag,
                    homeRoomName: spawn.room.name,
                };
                const success = spawn.createCreep(
                    chosenBody,
                    Roles.RoleBuilder.generateName(Roles.RoleBuilder),
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
