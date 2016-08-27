import { PUpgrade } from "./upgrade";
import { PHarvest } from "./harvest";
import { Process, ProcessStatus } from "../kernel/process";

interface BootstrapMemory {
    harvestPid?: ProcessId;
    upgradePid?: ProcessId;
};

export class PBootstrap extends Process {
    public static className: string = "Bootstrap";
    public get className(): string { return PBootstrap.className; }
    private pmem: BootstrapMemory;

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
        this.frequency = 30;
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
            //Harvester needs respawned
            pmem.harvestPid = undefined;
            return this.run();
        }

        if (pmem.upgradePid !== undefined) {
            const upgrader = kernel.getTypedProcessById<PUpgrade>(pmem.upgradePid);
            if (upgrader !== undefined) {
                return;
            }
            pmem.upgradePid = undefined;
        }

        if (harvester.minimumHarvestDurationRemaining() < 500) {
            return;
        }

        console.log("Bootstrap spawning Upgrade...");
        pmem.upgradePid = this.spawnChildProcess(PUpgrade);

        return pmem;
    }

    public reloadFromMemory(pmem: ProcessMemory | undefined): void {
        this.pmem = (<BootstrapMemory | undefined>pmem) || {
            harvestPid: undefined,
            upgradePid: undefined,
        };
    }
}
