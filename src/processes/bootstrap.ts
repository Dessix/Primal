import { PHarvest } from "./harvest";
import { Process, ProcessStatus } from "../kernel/process";

type BootstrapMemory = {
    harvestPid?: ProcessId;
    upgradePid?: ProcessId;
};

export class PBootstrap extends Process {
    public static className: string = "Bootstrap";
    public get className(): string { return PBootstrap.className; }
    private pmem: BootstrapMemory;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        const kernel = this.kernel;
        if (kernel === null) { throw new Error("Kernel not found!"); }

        const pmem = this.pmem;
        if (pmem.harvestPid === undefined) {
            console.log("Bootstrap spawning Harvest...");
            pmem.harvestPid = kernel.spawnProcess(PHarvest, this.pid);
        }
        const harvester = kernel.getProcessById(pmem.harvestPid);
        if (harvester === undefined) {
            //Harvester needs respawned
            pmem.harvestPid = undefined;
            return pmem;
        }
        return pmem;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        this.pmem = (<BootstrapMemory | undefined>pmem) || {
            harvestPid: undefined,
            upgradePid: undefined,
        };
    }
}
