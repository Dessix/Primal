import { RoleListing } from "./../ipc/roleListing";
import { IRole, RoleRecycle } from "../roles";
import { Process, ProcessStatus } from "../kernel/process";

export class PLogisticsRoles extends Process<ProcessMemory> {
    public static className: string = "LogisticsRoles";

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(pmem: ProcessMemory): void {
        const roleRecycle: IRole = RoleRecycle.Instance;

        for (let recycleCreep of RoleListing.getByRole(RoleRecycle.RoleTag)) {
            roleRecycle.run(recycleCreep);
        }
    }
}
