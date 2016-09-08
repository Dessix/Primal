import { RoleListing } from "./../ipc/roleListing";
import { RoleRecycle } from "./../roles/roleRecycle";
import { IRole } from "./../roles/baseRole";
import { Process, ProcessStatus } from "../kernel/process";

export class PLogisticsRoles extends Process {
    public static className: string = "LogisticsRoles";
    public get className(): string { return PLogisticsRoles.className; }

    public constructor(pid: ProcessId, parentPid: ProcessId) {
        super(pid, parentPid);
    }

    public run(): ProcessMemory | undefined {
        const roleRecycle: IRole = RoleRecycle.Instance;

        for (let recycleCreep of RoleListing.getByRole(RoleRecycle.RoleTag)) {
            roleRecycle.run(recycleCreep);
        }
        
        return;
    }
}
