import { RoleListing } from "./../ipc/roleListing";
import { RoleCourier } from "./../roles/roleCourier";
import { RoleDrill } from "./../roles/roleDrill";
import { RoleUpgrader } from "./../roles/roleUpgrader";
import { RoleRepairer } from "./../roles/roleRepairer";
import { Process, ProcessStatus } from "../kernel/process";

export class PRepair extends Process {
    public static className: string = "Repair";
    public get className(): string { return PRepair.className; }
    private pmem: number;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        let pmem = this.pmem;

        const roleRepairer = RoleRepairer.Instance;
        for (let repairer of RoleListing.getByRole(RoleRepairer)) {
            roleRepairer.run(repairer);
        }

        const numDrills = RoleListing.getByRole(RoleDrill).length;
        const numCouriers = RoleListing.getByRole(RoleCourier).length;
        const numUpgraders = RoleListing.getByRole(RoleUpgrader).length;
        const numRepairers = RoleListing.getByRole(RoleRepairer).length;
        if (RoleListing.getByRole(RoleDrill).length >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numRepairers < 2 * global.config.repairerMultiplier) {
            for (let spawnName in Game.spawns) {
                const spawn = Game.spawns[spawnName];
                const energyAvailable = spawn.room.energyAvailable;
                if (energyAvailable >= 300 && !spawn.spawning) {
                    const creepMemory: CreepMemory = {
                        spawnName: spawn.name,
                        role: RoleRepairer.RoleTag,
                    };
                    const success = spawn.createCreep(
                        RoleRepairer.chooseBody(energyAvailable),
                        RoleRepairer.generateName(RoleRepairer),
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
