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

        let numDrills = 0;
        let numCouriers = 0;
        let numUpgraders = 0;
        let numRepairers = 0;
        const repairer = RoleRepairer.Instance;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory & { working: boolean }>creep.memory;
            if (cmem.role === RoleDrill.RoleTag) { ++numDrills; continue; }
            if (cmem.role === RoleCourier.RoleTag) { ++numCouriers; continue; }
            if (cmem.role === RoleUpgrader.RoleTag) { ++numUpgraders; continue; }
            if (cmem.role !== RoleRepairer.RoleTag) { continue; }
            ++numRepairers;
            if (creep.spawning) { continue; }
            // if creep is trying to repair something but has no energy left
            repairer.run(creep);
        }
        //console.log(`${numMiners} : ${numUpgraders} : ${numRepairers}`);
        if (numDrills >= 2 && numCouriers >= 1 && numUpgraders >= 1 && numRepairers < 2 * global.config.repairerMultiplier) {
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
