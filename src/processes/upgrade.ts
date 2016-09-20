import { RoleListing } from "./../ipc/roleListing";
import { RoleDrill, RoleCourier, RoleUpgrader } from "../roles";
import { Process, ProcessStatus } from "../kernel/process";

export class PUpgrade extends Process<ProcessMemory> {
    public static className: string = "Upgrade";

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: ProcessMemory): void {
        const roleUpgrader = RoleUpgrader.Instance;
        for (let upgrader of RoleListing.getByRole(RoleUpgrader)) {
            roleUpgrader.run(upgrader);
        }

        const numDrills = RoleListing.getByRole(RoleDrill).length;
        const numCouriers = RoleListing.getByRole(RoleCourier).length;
        const numUpgraders = RoleListing.getByRole(RoleUpgrader).length;
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders < 2 * global.config.upgraderMultiplier) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                const energyAvailable = spawn.room.energyAvailable;
                if (energyAvailable >= 300 && !spawn.spawning) {
                    const creepMemory: CreepMemory = {
                        spawnName: spawn.name,
                        role: RoleUpgrader.RoleTag,
                        homeRoomName: spawn.room.name,
                    };
                    const success = spawn.createCreep(
                        RoleUpgrader.chooseBody(energyAvailable),
                        RoleUpgrader.generateName(RoleUpgrader, creepMemory),
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
    }
}
