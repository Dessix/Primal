import { RoleListing } from "./../ipc/roleListing";
import { RoleCourier, RoleDrill, RoleUpgrader, RoleRepairer } from "../roles";
import { Process, ProcessStatus } from "../kernel/process";

export class PRepair extends Process<ProcessMemory> {
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
                if (spawn.spawning) { continue; }
                const energyAvailable = spawn.room.energyAvailable;
                const chosenBody = RoleRepairer.chooseBody(energyAvailable);
                if (chosenBody === undefined) {
                    continue;
                }
                const creepMemory: CreepMemory = {
                    spawnName: spawn.name,
                    role: RoleRepairer.RoleTag,
                    homeRoomName: spawn.room.name,
                };
                const success = spawn.createCreep(
                    chosenBody,
                    RoleRepairer.generateName(RoleRepairer, creepMemory),
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
        return;
    }
}
