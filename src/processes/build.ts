import { RoleListing } from "../ipc/roleListing";
import * as Roles from "../roles";
import { Process } from "../kernel/process";

export class PBuild extends Process<ProcessMemory> {
    public static className: string = "Build";
    public get className(): string { return PBuild.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: ProcessMemory): void {
        const builder = Roles.RoleBuilder.Instance;
        for (let creep of RoleListing.getByRole(Roles.RoleBuilder)) {
            builder.run(creep);
        }

        const numDrills = RoleListing.getByRole(Roles.RoleDrill).length;
        const numCouriers = RoleListing.getByRole(Roles.RoleCourier).length;
        const numUpgraders = RoleListing.getByRole(Roles.RoleUpgrader).length;
        const numBuilders = RoleListing.getByRole(Roles.RoleBuilder).length;
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numBuilders < 1 * global.config.nBild) {
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
                    Roles.RoleBuilder.generateName(Roles.RoleBuilder, creepMemory),
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
}
