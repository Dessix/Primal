import { RoleListing } from "./../ipc/roleListing";
import * as Roles from "../roles";
import { Process } from "../kernel/process";

export class PHarvest extends Process<ProcessMemory> {
    public static className: string = "Harvest";

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: ProcessMemory): void {
        const roleDrill = Roles.RoleDrill.Instance;
        const roleCourier = Roles.RoleCourier.Instance;
        const roleBard = Roles.RoleBard.Instance;
        const roleBootstrapMiner = Roles.RoleBootstrapMiner.Instance;

        const drills = RoleListing.getByRole(Roles.RoleDrill);
        const bards = RoleListing.getByRole(Roles.RoleBard);
        const couriers = RoleListing.getByRole(Roles.RoleCourier);
        const bootstraps = RoleListing.getByRole(Roles.RoleBootstrapMiner);

        for (let drill of drills) { roleDrill.run(drill); }
        for (let courier of couriers) { roleCourier.run(courier); }
        for (let bard of bards) { roleBard.run(bard); }
        for (let bootstrap of bootstraps) { roleBootstrapMiner.run(bootstrap); }
    }
}
