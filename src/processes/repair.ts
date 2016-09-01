import { RoleUpgrader } from "./../roles/roleUpgrader";
import { RoleRepairer } from "./../roles/roleRepairer";
import { RoleBootstrapMiner } from "./../roles/roleBootstrapMiner";
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

        let numUpgraders = 0;
        let numMiners = 0;
        let numRepairers = 0;
        for (let creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            const cmem = <CreepMemory & { working: boolean }>creep.memory;
            if (cmem.role === RoleBootstrapMiner.RoleTag) { ++numMiners; continue; }
            if (cmem.role === RoleUpgrader.RoleTag) { ++numUpgraders; continue; }
            if (cmem.role !== RoleRepairer.RoleTag) { continue; }
            ++numRepairers;
            if (creep.spawning) { continue; }
            // if creep is trying to repair something but has no energy left
            const repairer = new RoleRepairer(creep);
            repairer.run();
        }
        //console.log(`${numMiners} : ${numUpgraders} : ${numRepairers}`);
        if (numMiners >= 2 && numUpgraders >= 1 && numRepairers < 2) {
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
