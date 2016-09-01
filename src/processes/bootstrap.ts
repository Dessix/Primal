import { PTower } from "./tower";
import { PBuild } from "./build";
import { PRepair } from "./repair";
import { PUpgrade } from "./upgrade";
import { PHarvest } from "./harvest";
import { Process, ProcessStatus } from "../kernel/process";

interface BootstrapMemory {
    harvestPid?: ProcessId;
    upgradePid?: ProcessId;
    buildPid?: ProcessId;
    repairPid?: ProcessId;
};

export class PBootstrap extends Process {
    public static className: string = "Bootstrap";
    public get className(): string { return PBootstrap.className; }
    private pmem: BootstrapMemory;
    
    public readonly baseHeat: number = 1;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        const kernel = this.kernelOrThrow;
        const pmem = this.pmem;
        if (pmem.harvestPid === undefined) {
            console.log("Bootstrap spawning Harvest...");
            pmem.harvestPid = this.spawnChildProcess(PHarvest);
        }

        const harvester = kernel.getTypedProcessById<PHarvest>(pmem.harvestPid);
        if (harvester === undefined) {
            pmem.harvestPid = undefined;
            return this.run();
        }

        if (pmem.upgradePid === undefined) {
            if (harvester.minimumHarvestDurationRemaining() < 500) {
                return pmem;
            }

            console.log("Bootstrap spawning Upgrade...");
            pmem.upgradePid = this.spawnChildProcess(PUpgrade);
        }

        const upgrader = kernel.getTypedProcessById<PUpgrade>(pmem.upgradePid);
        if (upgrader === undefined) {
            pmem.upgradePid = undefined;
        }


        if (pmem.upgradePid !== undefined && pmem.buildPid === undefined) {
            console.log("Bootstrap spawning Build...");
            pmem.buildPid = this.spawnChildProcess(PBuild);
        }

        if (pmem.upgradePid !== undefined && pmem.repairPid === undefined) {
            console.log("Bootstrap spawning Repair...");
            pmem.repairPid = this.spawnChildProcess(PRepair);
        }

        if (kernel.getProcessesByClass(PTower).length === 0) {
            console.log("Bootstrap spawning Tower...");
            this.spawnChildProcess(PTower);
        }
        
        return pmem;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        this.pmem = (<BootstrapMemory | undefined>pmem) || {
            harvestPid: undefined,
            upgradePid: undefined,
            buildPid: undefined,
            repairPid: undefined,
        };
    }
}
